import { useMemo, useState } from 'react'
import { Button, LoadingSpinner } from '@/components/ui'
import type { DateRange } from '@/components/ui'
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
import { formatCutoffLabel, formatKstTime } from '@/lib/dashboardTime'
import {
  DASHBOARD_CAMPAIGNS,
  type DashboardCampaignFixture,
} from '@/lib/dashboardFixtures'
import {
  bucketRealtimeToMinutes,
  toDemographics,
  toExposure,
  toKpiMetrics,
  toRealtimeData,
  toTolaMetrics,
  toWatchTime,
} from '@/pages/dashboardTransforms'

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

/**
 * 대시보드 홈 컨테이너 — 캠페인 목록·조회 기간으로 각 섹션 API를 조회해
 * 프레젠테이셔널 HomePage에 주입한다. (응답→props 매핑은 dashboardTransforms)
 */
export default function DashboardHome() {
  const { data: campaigns, isPending, isError, refetch } = useCampaigns()
  const [override, setOverride] = useState<string | null>(null)
  const [dateRange, setDateRange] = useState<DateRange>(() => todayRange())

  const defaultCampaign = campaigns ? pickDefaultCampaign(campaigns) : undefined
  const selectedId =
    override ?? (defaultCampaign ? String(defaultCampaign.campaignId) : '')
  const selected = campaigns?.find((c) => String(c.campaignId) === selectedId)

  // 실 캠페인 id·이름을 fixture 골격에 얹어 드롭다운 옵션 구성
  const options = useMemo<DashboardCampaignFixture[]>(() => {
    const base = DASHBOARD_CAMPAIGNS[0]
    if (!base || !campaigns) return []
    return campaigns.map((c) => ({
      ...base,
      id: String(c.campaignId),
      name: c.campaignName,
    }))
  }, [campaigns])

  const { data: delivery } = useCampaignDelivery(selected?.campaignId, dateRange)
  const kpiMetrics = delivery ? toKpiMetrics(delivery) : undefined

  const { data: funnel } = useCampaignFunnel(selected?.campaignId, dateRange)
  const tolaMetrics = funnel ? toTolaMetrics(funnel) : undefined
  const tolaCutoffLabel = funnel
    ? formatKstTime(funnel.aggregationCutoffTime)
    : undefined

  // 실시간 시청수: 오늘=5초 라이브(1분 슬롯), 과거 날짜=시간별 누적
  const live = isToday(dateRange.end)
  const { points: realtimePoints } = useRealtimeGraph(selected?.campaignId, live)
  const { data: hourly } = useRealtimeHourly(
    live ? undefined : selected?.campaignId,
    dateRange,
  )
  const realtimeData = live
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
  const exposure = exposureData ? toExposure(exposureData) : undefined

  // 섹션별 (i) 툴팁 기준시각. KPI는 cutoff 필드가 없어 serverTime 사용.
  const kpiCutoffLabel = delivery
    ? formatCutoffLabel(delivery.serverTime)
    : undefined
  const realtimeCutoffLabel = live
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
    return (
      <div className="flex min-h-[240px] items-center justify-center p-x5">
        <p className="text-body-1-normal-regular text-text-secondary">
          표시할 캠페인이 없습니다.
        </p>
      </div>
    )
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
      realtimeData={realtimeData}
      averageSeconds={watchTime?.averageSeconds}
      watchBuckets={watchTime?.buckets}
      demographics={demographics}
      exposure={exposure}
      kpiCutoffLabel={kpiCutoffLabel}
      realtimeCutoffLabel={realtimeCutoffLabel}
      averageCutoffLabel={averageCutoffLabel}
      demographicCutoffLabel={demographicCutoffLabel}
      exposureCutoffLabel={exposureCutoffLabel}
    />
  )
}
