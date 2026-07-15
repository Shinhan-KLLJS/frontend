import { useMemo, useState } from 'react'
import { Button, LoadingSpinner } from '@/components/ui'
import type { DateRange } from '@/components/ui'
import { DEFAULT_KPI_ICONS } from '@/components/dashboard/KpiSection'
import type { KpiMetric } from '@/components/dashboard/KpiSection'
import HomePage from '@/pages/HomePage'
import {
  fromApiDate,
  pickDefaultCampaign,
  useCampaignDelivery,
  useCampaigns,
} from '@/lib/dashboard'
import type { CampaignDelivery } from '@/lib/dashboard'
import {
  DASHBOARD_CAMPAIGNS,
  type DashboardCampaignFixture,
} from '@/lib/dashboardFixtures'

/** 백분율 표기 — 정수면 그대로, 아니면 소수 1자리. */
function formatPercent(value: number): string {
  const rounded = Math.round(value * 10) / 10
  return Number.isInteger(rounded) ? String(rounded) : rounded.toFixed(1)
}

/** 송출정보 → KPI 카드 4종. 라벨·아이콘은 고정, 값은 실 데이터. */
function toKpiMetrics(d: CampaignDelivery): KpiMetric[] {
  return [
    {
      key: 'play-count',
      label: '현재 송출 회수',
      value: d.currentPlayCount.toLocaleString(),
      guide: `/${d.dailyTargetPlayCount.toLocaleString()}`,
      icon: DEFAULT_KPI_ICONS.currentPlayCount,
    },
    {
      key: 'progress',
      label: '오늘 진행률',
      value: formatPercent(d.progressRate),
      guide: '%',
      icon: DEFAULT_KPI_ICONS.progressRate,
    },
    {
      key: 'play-time',
      label: '총 플레이 타임',
      value: d.totalPlayTimeMin.toLocaleString(),
      guide: '분',
      icon: DEFAULT_KPI_ICONS.totalPlayTime,
    },
    {
      // 다운타임은 실측이 아닌 무중단 송출 추정 — 항상 0으로 표기(isEstimated로 안내)
      key: 'downtime',
      label: '다운 타임',
      value: '0건',
      guide: '·0초',
      icon: DEFAULT_KPI_ICONS.downtime,
    },
  ]
}

/** 오늘 하루(시작=종료)를 기본 조회 기간으로. */
function todayRange(): DateRange {
  const now = new Date()
  const day = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  return { start: day, end: day }
}

/**
 * 대시보드 홈 컨테이너 (DV-143 캠페인 조회 + 달력 기간 조회)
 *
 * 실 API로 캠페인 목록/상세를 조회해 툴바(드롭다운·날짜)를 구동하고, 프레젠테이셔널
 * HomePage에 주입한다. KPI/TOLA/차트 등 섹션 데이터는 아직 fixture — 각 섹션 API
 * 태스크(DV-144~149)에서 순차 교체한다. (로컬은 CORS로 실 호출 불가 → 배포에서 검증)
 */
export default function DashboardHome() {
  const { data: campaigns, isPending, isError, refetch } = useCampaigns()
  const [override, setOverride] = useState<string | null>(null)
  const [dateRange, setDateRange] = useState<DateRange>(() => todayRange())

  const defaultCampaign = campaigns ? pickDefaultCampaign(campaigns) : undefined
  const selectedId =
    override ?? (defaultCampaign ? String(defaultCampaign.campaignId) : '')
  const selected = campaigns?.find((c) => String(c.campaignId) === selectedId)

  // 실 캠페인 id·이름을 fixture 섹션 데이터에 얹어 HomePage에 전달 (섹션은 추후 실 API로 교체)
  const options = useMemo<DashboardCampaignFixture[]>(() => {
    const base = DASHBOARD_CAMPAIGNS[0]
    if (!base || !campaigns) return []
    return campaigns.map((c) => ({
      ...base,
      id: String(c.campaignId),
      name: c.campaignName,
    }))
  }, [campaigns])

  // 캠페인 + 조회 기간 → 송출정보 조회 (KPI 섹션 소스). refreshIntervalSec 주기로 자동 갱신.
  const { data: delivery } = useCampaignDelivery(selected?.campaignId, dateRange)
  const kpiMetrics = delivery ? toKpiMetrics(delivery) : undefined

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
    />
  )
}
