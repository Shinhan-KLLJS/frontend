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
import type {
  CampaignAverageWatchTime,
  CampaignDelivery,
  CampaignDemographic,
  CampaignExposure,
  CampaignFunnel,
  CampaignRealtimeHourly,
  RealtimeGraphPoint,
} from '@/lib/dashboard'
import { formatKstTime } from '@/lib/dashboardTime'

/**
 * 대시보드 API 응답 → 각 섹션 컴포넌트 props 어댑터.
 * (조회·상태는 DashboardHome 컨테이너 담당)
 */

const formatPercent = (v: number): string => {
  const r = Math.round(v * 10) / 10
  return Number.isInteger(r) ? String(r) : r.toFixed(1)
}

/** 송출정보 → KPI 카드 4종. */
export function toKpiMetrics(d: CampaignDelivery): KpiMetric[] {
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
      // 다운타임은 실측이 아닌 무중단 송출 추정 — 항상 0
      key: 'downtime',
      label: '다운 타임',
      value: '0건',
      guide: '·0초',
      icon: DEFAULT_KPI_ICONS.downtime,
    },
  ]
}

// TOLA 지표 설명(툴팁) — API에 설명 필드가 없어 프론트 고정.
const TOLA_DESCRIPTIONS = {
  traffic: '매체 주변을 통과한 전체 인원입니다.',
  attention: '광고 화면을 바라본 것으로 감지된 인원입니다.',
  conversion: '전체 유동인구 중 주목인구의 비율입니다.',
  exposure: '유효 시청 조건을 충족한 추정 인원입니다.',
} as const

/** 깔때기 응답 → TOLA 카드 4종(유동 → 주목 → 전환률 → 노출). */
export function toTolaMetrics(f: CampaignFunnel): TolaMetric[] {
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

// 평균 시청시간 구간 색(시퀀셜 팔레트).
const WATCH_COLORS = [
  'var(--color-chart-sequential-1)',
  'var(--color-chart-sequential-2)',
  'var(--color-chart-sequential-3)',
  'var(--color-chart-sequential-4)',
]

/** 실시간 시청수(시간별 누적) → 차트 시계열. viewers=attention(주목=실 시청). */
export function toRealtimeData(r: CampaignRealtimeHourly): ViewerPoint[] {
  return r.points.map((p) => ({
    time: formatKstTime(p.eventTime),
    viewers: p.attentionPopulationCount,
  }))
}

/**
 * 5초 실시간 포인트 → 1분 슬롯 시계열(분당 마지막=최신 값).
 * 현재 분은 5초마다 제자리 갱신, 분이 넘어가면 왼쪽으로 밀린다.
 */
export function bucketRealtimeToMinutes(
  points: RealtimeGraphPoint[],
  windowMinutes = 30,
): ViewerPoint[] {
  if (!points.length) return []
  const byMinute = new Map<number, number>()
  const sorted = [...points].sort((a, b) =>
    a.eventTime.localeCompare(b.eventTime),
  )
  for (const p of sorted) {
    const minuteEpoch =
      Math.floor(new Date(p.eventTime).getTime() / 60000) * 60000
    byMinute.set(minuteEpoch, p.attentionPopulationCount) // 정렬돼 있어 마지막이 최신
  }
  return [...byMinute.entries()]
    .sort((a, b) => a[0] - b[0])
    .slice(-windowMinutes)
    .map(([epoch, viewers]) => ({
      time: formatKstTime(new Date(epoch).toISOString()),
      viewers,
    }))
}

/** 평균 시청시간 → 카드 props. ratio는 0~100(%). */
export function toWatchTime(a: CampaignAverageWatchTime): {
  averageSeconds: number
  buckets: WatchTimeBucket[]
} {
  return {
    averageSeconds: a.averageWatchTimeSec ?? 0,
    buckets: a.watchTimeBuckets.map((b, i) => ({
      label: b.label,
      value: Math.round(b.ratio * 10) / 10,
      color: WATCH_COLORS[i % WATCH_COLORS.length],
    })),
  }
}

/** 성별·연령 시청 비율 → 카드 데이터. ratio는 0~100(%). */
export function toDemographics(d: CampaignDemographic): DemographicRatio[] {
  return d.ageGroups.map((g) => ({
    ageGroup: g.label,
    total: Math.round(g.totalRatio * 10) / 10,
    male: Math.round(g.maleRatio * 10) / 10,
    female: Math.round(g.femaleRatio * 10) / 10,
  }))
}

const clampLevel = (n: number): ExposureLevel =>
  Math.min(4, Math.max(0, Math.round(n))) as ExposureLevel

/** 시간·연령별 노출도 → 히트맵 props(연령 코드→라벨, 강도 0~4 클램프). */
export function toExposure(e: CampaignExposure): {
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
