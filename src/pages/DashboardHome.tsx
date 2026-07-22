import { useMemo, useState } from 'react'
import type { ReactElement } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus } from 'lucide-react'
import type { CampaignOption } from '@/components/dashboard/DashboardToolbar'
import { Button, LoadingSpinner } from '@/components/ui'
import { toCampaignStatus } from '@/lib/campaigns'
import { ROUTES } from '@/lib/routes'
import type { DateRange } from '@/components/ui'
import { isSameDay } from '@/components/ui/date'
import HomePage from '@/pages/HomePage'
import {
  fromApiDate,
  pickDefaultCampaign,
  useAverageWatchTime,
  useCampaignDelivery,
  useCampaignFunnel,
  useCampaigns,
  useDemographic,
  useExposure,
  useRealtimeGraph,
  useRealtimeHourly,
} from '@/lib/dashboard'
import { formatCutoffLabel } from '@/lib/dashboardTime'
import {
  bucketRealtimeToMinutes,
  toDemographics,
  toExposure,
  toKpiMetrics,
  toRealtimeData,
  toTolaMetrics,
  toWatchTime,
} from '@/pages/dashboardTransforms'

// 백엔드 없이 대시보드를 확인하는 로컬 목 모드(VITE_MOCK_AUTH=true·DEV 전용).
// 이땐 실 API 대신 픽스처로 렌더한다(세션이 없어 캠페인 조회가 실패하므로).
const IS_MOCK =
  import.meta.env.DEV && import.meta.env.VITE_MOCK_AUTH === 'true'

/** 조회 기간이 오늘이면 실시간(5초), 아니면 시간별 누적을 쓴다. */
function isToday(d?: Date): boolean {
  if (!d) return false
  const now = new Date()
  return (
    d.getFullYear() === now.getFullYear() &&
    d.getMonth() === now.getMonth() &&
    d.getDate() === now.getDate()
  )
}

/** 오늘 하루(시작=종료)를 기본 조회 기간으로. */
function todayRange(): DateRange {
  const now = new Date()
  const day = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  return { start: day, end: day }
}

// 로컬 전용 대시보드 목(있으면 로드). 배포엔 src/_mock 파일이 없어 glob이 비고 RealDashboard로 폴백된다.
const dashboardMock = import.meta.glob<{ default: () => ReactElement }>(
  '../_mock/DashboardMock.tsx',
  { eager: true },
)
const MockDashboard = Object.values(dashboardMock)[0]?.default

/**
 * 대시보드 홈 진입점 — 로컬 목(DEV·VITE_MOCK_AUTH)이 있으면 목, 아니면 실 API 컨테이너로 분기.
 * (훅을 조건부로 호출하지 않도록 분기와 로직을 분리)
 */
export default function DashboardHome() {
  if (IS_MOCK && MockDashboard) return <MockDashboard />
  return <RealDashboard />
}

/**
 * 대시보드 홈 컨테이너 — 캠페인 목록·조회 기간으로 각 섹션 API를 조회해
 * 프레젠테이셔널 HomePage에 주입한다. (응답→props 매핑은 dashboardTransforms)
 */
/** 캠페인이 하나도 없을 때의 빈 상태 — 컨텐츠 영역 정가운데 안내 + 등록 버튼 */
function DashboardEmpty() {
  const navigate = useNavigate()
  return (
    <div className="flex min-h-full flex-1 flex-col items-center justify-center gap-x5 p-x5">
      {/* 제목↔소제목 gap-x2 */}
      <div className="flex flex-col items-center gap-x2 text-center">
        <h2 className="text-title-3-medium text-text-primary">
          아직 측정할 수 있는 캠페인이 없어요
        </h2>
        <p className="text-heading-2-regular text-text-secondary">
          캠페인을 등록하면 옥외광고 성과를 한눈에 확인할 수 있어요
        </p>
      </div>
      <Button
        size="large"
        leadingIcon={Plus}
        onClick={() => navigate(ROUTES.campaignsNew)}
      >
        캠페인 등록하기
      </Button>
    </div>
  )
}

function RealDashboard() {
  const { data: campaigns, isPending, isError, refetch } = useCampaigns()
  const [override, setOverride] = useState<string | null>(null)
  const [dateRange, setDateRange] = useState<DateRange>(() => todayRange())

  const defaultCampaign = campaigns ? pickDefaultCampaign(campaigns) : undefined
  const selectedId =
    override ?? (defaultCampaign ? String(defaultCampaign.campaignId) : '')
  const selected = campaigns?.find((c) => String(c.campaignId) === selectedId)

  // 드롭다운 옵션 — 실 캠페인 id·이름 (fixture 없음)
  const options = useMemo<CampaignOption[]>(
    () =>
      campaigns?.map((c) => ({
        id: String(c.campaignId),
        name: c.campaignName,
        // 대시보드 API status는 백엔드 enum(IN_EXECUTION 등) → 화면 상태(집행 전/중/완료)로 변환
        status: toCampaignStatus(c.status),
      })) ?? [],
    [campaigns],
  )

  const { data: delivery } = useCampaignDelivery(selected?.campaignId, dateRange)
  // 조회 기간이 2일 이상(시작·종료가 다른 날)이면 KPI 분모를 기간 목표로
  const isMultiDay = Boolean(
    dateRange.start &&
      dateRange.end &&
      !isSameDay(dateRange.start, dateRange.end),
  )
  const kpiMetrics = delivery ? toKpiMetrics(delivery, isMultiDay) : undefined

  const { data: funnel } = useCampaignFunnel(selected?.campaignId, dateRange)
  const tolaMetrics = funnel ? toTolaMetrics(funnel) : undefined
  const tolaCutoffLabel = funnel
    ? formatCutoffLabel(funnel.aggregationCutoffTime)
    : undefined

  // 기간 미선택(오늘 단일 일자)=실시간(5-1, 5초 라이브·1분 슬롯), 기간 선택=시간별 누적(5-2)
  const isTodayView = isToday(dateRange.start) && isToday(dateRange.end)

  // '어제 대비' 증감은 오늘 조회일 때만 의미 → 기간을 선택하면 숨기고 빈 칸 유지
  const showTolaComparison = isTodayView

  const { points: realtimePoints } = useRealtimeGraph(
    selected?.campaignId,
    isTodayView,
  )
  const { data: hourly } = useRealtimeHourly(
    isTodayView ? undefined : selected?.campaignId,
    dateRange,
  )
  const realtimeData = isTodayView
    ? realtimePoints.length
      ? bucketRealtimeToMinutes(realtimePoints)
      : undefined
    : hourly
      ? toRealtimeData(hourly)
      : undefined

  const { data: average } = useAverageWatchTime(selected?.campaignId, dateRange)
  const watchTime = average ? toWatchTime(average) : undefined

  const { data: demographic } = useDemographic(selected?.campaignId, dateRange)
  const demographics = demographic ? toDemographics(demographic) : undefined

  const { data: exposureData } = useExposure(selected?.campaignId, dateRange)
  const exposureCells = exposureData ? toExposure(exposureData) : undefined

  // 섹션별 (i) 툴팁 기준시각(당일). 다중일(기간)일 때의 '기간 누적' 문구 전환은
  // dateRange를 아는 HomePage에서 일괄 처리한다(실 API·로컬 목 공통).
  const realtimeCutoffLabel = isTodayView
    ? realtimePoints.length
      ? formatCutoffLabel(realtimePoints[realtimePoints.length - 1].eventTime)
      : undefined
    : hourly
      ? formatCutoffLabel(hourly.aggregationCutoffTime)
      : undefined
  const averageCutoffLabel = average
    ? formatCutoffLabel(average.aggregationCutoffTime)
    : undefined
  const demographicCutoffLabel = demographic
    ? formatCutoffLabel(demographic.aggregationCutoffTime)
    : undefined
  const exposureCutoffLabel = exposureData
    ? formatCutoffLabel(exposureData.aggregationCutoffTime)
    : undefined

  if (isPending) {
    return (
      <div className="flex min-h-[240px] items-center justify-center p-x5">
        <LoadingSpinner progress={0} showLabel={false} />
      </div>
    )
  }

  if (isError) {
    return (
      <div className="flex min-h-[240px] flex-col items-center justify-center gap-x4 p-x5">
        <p className="text-body-1-normal-regular text-text-secondary">
          캠페인을 불러오지 못했습니다.
        </p>
        <Button
          variant="line"
          color="secondary"
          size="medium"
          onClick={() => refetch()}
        >
          다시 시도
        </Button>
      </div>
    )
  }

  if (!campaigns || campaigns.length === 0) {
    return <DashboardEmpty />
  }

  return (
    <HomePage
      campaigns={options}
      selectedId={selectedId}
      onCampaignChange={setOverride}
      dateRange={dateRange}
      onDateRangeChange={setDateRange}
      minDate={selected ? fromApiDate(selected.executionStartDate) : undefined}
      maxDate={selected ? fromApiDate(selected.executionEndDate) : undefined}
      kpiMetrics={kpiMetrics}
      estimatedDowntime={delivery?.isEstimated ?? true}
      tolaMetrics={tolaMetrics}
      tolaCutoffLabel={tolaCutoffLabel}
      showTolaComparison={showTolaComparison}
      realtimeData={realtimeData}
      realtimeScrollable={!isTodayView}
      averageSeconds={watchTime?.averageSeconds}
      watchBuckets={watchTime?.buckets}
      demographics={demographics}
      exposureCells={exposureCells}
      realtimeCutoffLabel={realtimeCutoffLabel}
      averageCutoffLabel={averageCutoffLabel}
      demographicCutoffLabel={demographicCutoffLabel}
      exposureCutoffLabel={exposureCutoffLabel}
    />
  )
}
