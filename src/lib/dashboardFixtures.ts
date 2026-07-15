import {
  ChartNoAxesColumnIncreasing,
  Clock3,
  Play,
  PlayOff,
} from 'lucide-react'
import type { DemographicRatio } from '@/components/dashboard/DemographicRatioCard'
import type { KpiMetric } from '@/components/dashboard/KpiSection'
import type { TolaMetric } from '@/components/dashboard/TolaSection'
import type { ViewerPoint } from '@/components/dashboard/RealtimeViewerChart'
import type { WatchTimeBucket } from '@/components/dashboard/AverageWatchTimeCard'
import type { ExposureCell } from '@/components/dashboard/AgeExposureHeatmap'
import { createExposureCells } from './dashboardHeatmapFixture'

export interface DashboardCampaignFixture {
  id: string
  name: string
  kpi: KpiMetric[]
  tola: TolaMetric[]
  viewers: ViewerPoint[]
  averageSeconds: number
  watchBuckets: WatchTimeBucket[]
  demographics: DemographicRatio[]
  exposureCells: ExposureCell[]
}

const WATCH_COLORS = [
  'var(--color-chart-sequential-1)',
  'var(--color-chart-sequential-2)',
  'var(--color-chart-sequential-3)',
  'var(--color-chart-sequential-4)',
]

const createKpi = (
  count: number,
  progress: number,
  playTime: string,
): KpiMetric[] => [
  {
    key: 'play-count',
    label: '현재 송출 횟수',
    value: `${count}회`,
    icon: Play,
  },
  {
    key: 'progress',
    label: '오늘 진행률',
    value: `${progress}%`,
    icon: ChartNoAxesColumnIncreasing,
  },
  { key: 'play-time', label: '총 플레이 타임', value: playTime, icon: Clock3 },
  { key: 'downtime', label: '다운타임', value: '0건 · 0초', icon: PlayOff },
]

const createBuckets = (values: number[]): WatchTimeBucket[] =>
  ['1~2초', '2~3초', '3~4초', '4초 이상'].map((label, index) => ({
    label,
    value: values[index],
    color: WATCH_COLORS[index],
  }))

const createViewers = (values: number[]): ViewerPoint[] =>
  values.map((viewers, index) => ({
    time: `${String(index + 9).padStart(2, '0')}:00`,
    viewers,
  }))

export const DASHBOARD_CAMPAIGNS: DashboardCampaignFixture[] = [
  {
    id: 'campaign-summer-brand',
    name: '2026 여름 브랜드 캠페인 · 강남 미디어월',
    kpi: createKpi(18, 75, '24분'),
    tola: [
      {
        key: 'traffic',
        label: '전체 유동인구',
        value: '12,459명',
        comparison: 3.2,
        description: '매체 주변을 통과한 전체 인원입니다.',
      },
      {
        key: 'attention',
        label: '주목인구',
        value: '7,284명',
        comparison: 5.1,
        description: '광고 화면을 바라본 것으로 감지된 인원입니다.',
      },
      {
        key: 'conversion',
        label: '주목 전환률',
        value: '58.5%',
        comparison: 1.8,
        description: '전체 유동인구 중 주목인구의 비율입니다.',
      },
      {
        key: 'exposure',
        label: '노출인구',
        value: '4,892명',
        comparison: -2.4,
        description: '유효 시청 조건을 충족한 추정 인원입니다.',
      },
    ],
    viewers: createViewers([
      92, 118, 109, 153, 176, 158, 214, 249, 228, 276, 305, 287, 324,
    ]),
    averageSeconds: 3.2,
    watchBuckets: createBuckets([18, 34, 29, 19]),
    demographics: [
      { ageGroup: '10대', male: 3.1, female: 4.2 },
      { ageGroup: '20대', male: 11.8, female: 13.4 },
      { ageGroup: '30대', male: 12.6, female: 11.2 },
      { ageGroup: '40대', male: 10.4, female: 9.1 },
      { ageGroup: '50대', male: 7.8, female: 6.5 },
      { ageGroup: '60대', male: 4.5, female: 3.2 },
      { ageGroup: '70대+', male: 1.2, female: 1.0 },
    ],
    exposureCells: createExposureCells(1),
  },
  {
    id: 'campaign-long-name',
    name: '신제품 론칭 프로모션 캠페인 · 수도권 주요 거점 통합 운영 장기 캠페인',
    kpi: createKpi(12, 50, '16분'),
    tola: [
      {
        key: 'traffic',
        label: '전체 유동인구',
        value: '9,842명',
        comparison: -1.1,
        description: '매체 주변을 통과한 전체 인원입니다.',
      },
      {
        key: 'attention',
        label: '주목인구',
        value: '5,936명',
        comparison: 2.7,
        description: '광고 화면을 바라본 것으로 감지된 인원입니다.',
      },
      {
        key: 'conversion',
        label: '주목 전환률',
        value: '60.3%',
        comparison: 3.1,
        description: '전체 유동인구 중 주목인구의 비율입니다.',
      },
      {
        key: 'exposure',
        label: '노출인구',
        value: '3,721명',
        comparison: 1.4,
        description: '유효 시청 조건을 충족한 추정 인원입니다.',
      },
    ],
    viewers: createViewers([
      64, 73, 98, 84, 121, 138, 144, 169, 157, 181, 196, 214, 205,
    ]),
    averageSeconds: 2.8,
    watchBuckets: createBuckets([25, 38, 22, 15]),
    demographics: [
      { ageGroup: '10대', male: 5.4, female: 6.2 },
      { ageGroup: '20대', male: 14.8, female: 15.5 },
      { ageGroup: '30대', male: 10.2, female: 12.4 },
      { ageGroup: '40대', male: 8.7, female: 7.8 },
      { ageGroup: '50대', male: 6.1, female: 5.3 },
      { ageGroup: '60대', male: 3.8, female: 2.9 },
      { ageGroup: '70대+', male: 0.5, female: 0.4 },
    ],
    exposureCells: createExposureCells(4),
  },
]
