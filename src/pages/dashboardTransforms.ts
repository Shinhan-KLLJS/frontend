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

// API 숫자 필드는 타입상 number지만, 집행 전·집계 데이터 없음 상태에서
// 실제로 null이 내려온다. 방어 없이 포맷하면 렌더 중 예외로 대시보드 전체가
// 죽으므로, null/undefined는 '-'(데이터 없음)로 대체한다.
const NO_DATA = '-'

const formatCount = (v: number | null | undefined): string =>
  v == null ? NO_DATA : v.toLocaleString()

const formatPercent = (v: number | null | undefined): string => {
  if (v == null) return NO_DATA
  const r = Math.round(v * 10) / 10
  return Number.isInteger(r) ? String(r) : r.toFixed(1)
}

/** 송출정보 → KPI 카드 4종. */
export function toKpiMetrics(d: CampaignDelivery): KpiMetric[] {
  return [
    {
      key: 'play-count',
      label: '현재 송출 회수',
      value: formatCount(d.currentPlayCount),
      guide: `/${formatCount(d.dailyTargetPlayCount)}`,
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
      value: formatCount(d.totalPlayTimeMin),
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
  // 인원 지표: value가 null이면 '-'(단위 없이), 값이 있으면 'N명'.
  const formatPopulation = (v: number | null | undefined): string =>
    v == null ? NO_DATA : `${v.toLocaleString()}명`
  return [
    {
      key: 'traffic',
      label: '전체 유동인구',
      value: formatPopulation(m.totalTrafficCount?.value),
      comparison: m.totalTrafficCount?.yesterdayComparison?.increaseRate,
      description: TOLA_DESCRIPTIONS.traffic,
    },
    {
      key: 'exposure',
      label: '노출인구',
      value: formatPopulation(m.exposedPopulationCount?.value),
      comparison: m.exposedPopulationCount?.yesterdayComparison?.increaseRate,
      description: TOLA_DESCRIPTIONS.exposure,
    },
    {
      key: 'attention',
      label: '주목인구',
      value: formatPopulation(m.attentionPopulationCount?.value),
      comparison: m.attentionPopulationCount?.yesterdayComparison?.increaseRate,
      description: TOLA_DESCRIPTIONS.attention,
    },
    {
      key: 'conversion',
      label: '주목 전환률',
      value:
        m.attentionConversionRate?.value == null
          ? NO_DATA
          : `${formatPercent(m.attentionConversionRate.value)}%`,
      comparison: m.attentionConversionRate?.yesterdayComparison?.increaseRate,
      description: TOLA_DESCRIPTIONS.conversion,
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
  return (r.points ?? []).map((p) => ({
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
  if (!points?.length) return []
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
    buckets: (a.watchTimeBuckets ?? []).map((b, i) => ({
      label: b.label,
      value: Math.round(b.ratio * 10) / 10,
      color: WATCH_COLORS[i % WATCH_COLORS.length],
    })),
  }
}

/** 성별·연령 시청 비율 → 카드 데이터. ratio는 0~100(%). */
export function toDemographics(d: CampaignDemographic): DemographicRatio[] {
  return (d.ageGroups ?? []).map((g) => ({
    ageGroup: g.label,
    total: Math.round(g.totalRatio * 10) / 10,
    male: Math.round(g.maleRatio * 10) / 10,
    female: Math.round(g.femaleRatio * 10) / 10,
  }))
}

const clampLevel = (n: number): ExposureLevel =>
  Math.min(4, Math.max(0, Math.round(n))) as ExposureLevel

// 연령 코드 → 히트맵 고정 행 라벨(HEATMAP_AGE_GROUPS와 일치해야 셀이 렌더된다).
// 서버가 age group 목록을 부분적으로만 내려줘도 항상 정규 라벨로 매핑한다.
const AGE_GROUP_LABEL: Record<string, string> = {
  UNDER_10: '0-9세',
  '10S': '10-19세',
  '20S': '20-29세',
  '30S': '30-39세',
  '40S': '40-49세',
  '50S': '50-59세',
  '60_PLUS': '60세 이상',
}

/**
 * 시간·연령별 노출도 → 히트맵 셀(연령 코드→고정 라벨, 시각 2자리 정규화, 강도 0~4 클램프).
 * 축·행 레이아웃은 히트맵이 06~24시×7연령대로 고정하므로 여기선 셀만 만든다.
 */
export function toExposure(e: CampaignExposure): ExposureCell[] {
  return (e.cells ?? []).map((c) => ({
    ageGroup: AGE_GROUP_LABEL[c.ageGroup] ?? c.ageGroup,
    hour: String(Number(c.hour)).padStart(2, '0'),
    all: clampLevel(c.intensityLevel),
    male: clampLevel(c.maleIntensityLevel),
    female: clampLevel(c.femaleIntensityLevel),
  }))
}
