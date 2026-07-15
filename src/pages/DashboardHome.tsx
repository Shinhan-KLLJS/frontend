import { useMemo, useState } from 'react'
import { Button, LoadingSpinner } from '@/components/ui'
import type { DateRange } from '@/components/ui'
import { DEFAULT_KPI_ICONS } from '@/components/dashboard/KpiSection'
import type { KpiMetric } from '@/components/dashboard/KpiSection'
import type { TolaMetric } from '@/components/dashboard/TolaSection'
import type { ViewerPoint } from '@/components/dashboard/RealtimeViewerChart'
import type { WatchTimeBucket } from '@/components/dashboard/AverageWatchTimeCard'
import type { DemographicRatio } from '@/components/dashboard/DemographicRatioCard'
import type {
  ExposureCell,
  ExposureLevel,
} from '@/components/dashboard/AgeExposureHeatmap'
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
  useRealtimeHourly,
} from '@/lib/dashboard'
import type {
  CampaignAverageWatchTime,
  CampaignDelivery,
  CampaignDemographic,
  CampaignExposure,
  CampaignFunnel,
  CampaignRealtimeHourly,
} from '@/lib/dashboard'
import { formatCutoffLabel } from '@/lib/dashboardTime'
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

// TOLA 지표 설명(툴팁). API엔 설명 필드가 없어 프론트에서 고정.
const TOLA_DESCRIPTIONS = {
  traffic: '매체 주변을 통과한 전체 인원입니다.',
  attention: '광고 화면을 바라본 것으로 감지된 인원입니다.',
  conversion: '전체 유동인구 중 주목인구의 비율입니다.',
  exposure: '유효 시청 조건을 충족한 추정 인원입니다.',
} as const

/** 깔때기 응답 → TOLA 카드 4종. 순서: 유동 → 주목 → 전환률 → 노출. */
function toTolaMetrics(f: CampaignFunnel): TolaMetric[] {
  const m = f.metrics
  return [
    {
      key: 'traffic',
      label: '전체 유동인구',
      value: `${m.totalTrafficCount.value.toLocaleString()}명`,
      comparison: m.totalTrafficCount.yesterdayComparison.increaseRate,
      description: TOLA_DESCRIPTIONS.traffic,
    },
    {
      key: 'attention',
      label: '주목인구',
      value: `${m.attentionPopulationCount.value.toLocaleString()}명`,
      comparison: m.attentionPopulationCount.yesterdayComparison.increaseRate,
      description: TOLA_DESCRIPTIONS.attention,
    },
    {
      key: 'conversion',
      label: '주목 전환률',
      value: `${formatPercent(m.attentionConversionRate.value)}%`,
      comparison: m.attentionConversionRate.yesterdayComparison.increaseRate,
      description: TOLA_DESCRIPTIONS.conversion,
    },
    {
      key: 'exposure',
      label: '노출인구',
      value: `${m.exposedPopulationCount.value.toLocaleString()}명`,
      comparison: m.exposedPopulationCount.yesterdayComparison.increaseRate,
      description: TOLA_DESCRIPTIONS.exposure,
    },
  ]
}

/** ISO date-time → KST "HH:mm" (툴팁 "기준" 표기). */
function formatKstTime(iso: string): string {
  try {
    return new Intl.DateTimeFormat('en-GB', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
      timeZone: 'Asia/Seoul',
    }).format(new Date(iso))
  } catch {
    return ''
  }
}


// 평균 시청시간 구간 색(fixture와 동일 시퀀셜 팔레트)
const WATCH_COLORS = [
  'var(--color-chart-sequential-1)',
  'var(--color-chart-sequential-2)',
  'var(--color-chart-sequential-3)',
  'var(--color-chart-sequential-4)',
]

/**
 * 실시간 시청수 → 차트 시계열.
 * viewers = attentionPopulationCount(주목=실제 시청). 노출수로 바꾸려면 여기만 수정.
 */
function toRealtimeData(r: CampaignRealtimeHourly): ViewerPoint[] {
  return r.points.map((p) => ({
    time: formatKstTime(p.eventTime),
    viewers: p.attentionPopulationCount,
  }))
}

/** 평균 시청시간 → 카드 props(초 + 구간 비중%). */
function toWatchTime(a: CampaignAverageWatchTime): {
  averageSeconds: number
  buckets: WatchTimeBucket[]
} {
  return {
    averageSeconds: a.averageWatchTimeSec ?? 0,
    buckets: a.watchTimeBuckets.map((b, i) => ({
      label: b.label,
      value: Math.round(b.ratio * 1000) / 10, // 0~1 → %(소수 1자리)
      color: WATCH_COLORS[i % WATCH_COLORS.length],
    })),
  }
}

/** 성별·연령 시청 비율 → 카드 데이터. ratio는 0~1 가정 → %로 환산. */
function toDemographics(d: CampaignDemographic): DemographicRatio[] {
  return d.ageGroups.map((g) => ({
    ageGroup: g.label,
    total: Math.round(g.totalRatio * 1000) / 10,
    male: Math.round(g.maleRatio * 1000) / 10,
    female: Math.round(g.femaleRatio * 1000) / 10,
  }))
}

const clampLevel = (n: number): ExposureLevel =>
  Math.min(4, Math.max(0, Math.round(n))) as ExposureLevel

/** 시간·연령별 노출도 → 히트맵 props(연령대 코드→라벨 변환, 강도 0~4 클램프). */
function toExposure(e: CampaignExposure): {
  hours: string[]
  ageGroups: string[]
  cells: ExposureCell[]
} {
  const labelByCode = new Map(e.ageGroups.map((g) => [g.ageGroup, g.label]))
  return {
    hours: e.hours,
    ageGroups: e.ageGroups.map((g) => g.label),
    cells: e.cells.map((c) => ({
      ageGroup: labelByCode.get(c.ageGroup) ?? c.ageGroup,
      hour: c.hour,
      all: clampLevel(c.intensityLevel),
      male: clampLevel(c.maleIntensityLevel),
      female: clampLevel(c.femaleIntensityLevel),
    })),
  }
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

  // 깔때기(TOLA) 조회
  const { data: funnel } = useCampaignFunnel(selected?.campaignId, dateRange)
  const tolaMetrics = funnel ? toTolaMetrics(funnel) : undefined
  const tolaCutoffLabel = funnel
    ? formatKstTime(funnel.aggregationCutoffTime)
    : undefined

  // 실시간 시청수 / 평균 시청시간 조회
  const { data: realtime } = useRealtimeHourly(selected?.campaignId, dateRange)
  const realtimeData = realtime ? toRealtimeData(realtime) : undefined
  const { data: average } = useAverageWatchTime(selected?.campaignId, dateRange)
  const watchTime = average ? toWatchTime(average) : undefined

  // 성별·연령 시청 비율
  const { data: demographic } = useDemographic(selected?.campaignId, dateRange)
  const demographics = demographic ? toDemographics(demographic) : undefined

  // 시간·연령별 노출도
  const { data: exposureData } = useExposure(selected?.campaignId, dateRange)
  const exposure = exposureData ? toExposure(exposureData) : undefined

  // 섹션별 (i) 툴팁 집계 기준 시각(모두 "HH:mm 기준"). 데이터 없으면 컴포넌트가 현재 시각으로 대체.
  // KPI(delivery)는 cutoff 필드가 없어 serverTime 사용. 성별연령·노출도는 정시 집계라 "HH:00 기준"으로 표기됨.
  const kpiCutoffLabel = delivery
    ? formatCutoffLabel(delivery.serverTime)
    : undefined
  const realtimeCutoffLabel = realtime
    ? formatCutoffLabel(realtime.aggregationCutoffTime)
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
