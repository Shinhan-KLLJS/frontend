import {
  ChartNoAxesColumnIncreasing,
  ClockCheck,
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
import type { CampaignStatus } from './campaigns'

export interface DashboardCampaignFixture {
  id: string
  name: string
  status: CampaignStatus
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
  count: string,
  progress: string,
  playMinutes: string,
): KpiMetric[] => [
  {
    key: 'play-count',
    label: '현재 송출 회수',
    value: count,
    guide: '/500',
    icon: Play,
  },
  {
    key: 'progress',
    label: '오늘 진행률',
    value: progress,
    guide: '%',
    icon: ChartNoAxesColumnIncreasing,
  },
  {
    key: 'play-time',
    label: '총 플레이 타임',
    value: playMinutes,
    guide: '분',
    icon: ClockCheck,
  },
  {
    key: 'downtime',
    label: '다운 타임',
    value: '0건',
    guide: '·0초',
    icon: PlayOff,
  },
]

const createBuckets = (values: number[]): WatchTimeBucket[] =>
  ['1-2초', '2-3초', '3-4초', '4초 이상'].map((label, index) => ({
    label,
    value: values[index],
    color: WATCH_COLORS[index],
  }))

const createViewers = (values: number[]): ViewerPoint[] =>
  values.map((viewers, index) => {
    const minutes = 7 * 60 + index * 15
    return {
      time: `${String(Math.floor(minutes / 60)).padStart(2, '0')}:${String(minutes % 60).padStart(2, '0')}`,
      viewers,
    }
  })

export const DASHBOARD_CAMPAIGNS: DashboardCampaignFixture[] = [
  {
    id: 'campaign-summer-brand',
    name: '나이키 썸머 프로모션 명동 전광판 옥외광고',
    status: 'running',
    kpi: createKpi('285', '99.9', '52'),
    tola: [
      {
        key: 'traffic',
        label: '전체 유동인구',
        value: '58,123명',
        comparison: 15,
        description: '매체 주변을 통과한 전체 인원입니다.',
      },
      {
        key: 'exposure',
        label: '노출인구',
        value: '8,123명',
        comparison: -0.5,
        description: '유효 시청 조건을 충족한 추정 인원입니다.',
      },
      {
        key: 'attention',
        label: '주목인구',
        value: '123명',
        comparison: 0.1,
        description: '광고 화면을 바라본 것으로 감지된 인원입니다.',
      },
      {
        key: 'conversion',
        label: '주목 전환률',
        value: '3.5%',
        comparison: 0,
        description: '전체 유동인구 중 주목인구의 비율입니다.',
      },
    ],
    viewers: createViewers([
      160, 158, 155, 150, 145, 180, 210, 480, 225, 350, 235, 220, 280,
    ]),
    averageSeconds: 1.6,
    watchBuckets: createBuckets([20, 20, 45, 15]),
    demographics: [
      { ageGroup: '0-9세', total: 1.2, male: 0.5, female: 0.7 },
      { ageGroup: '10-19세', total: 2.1, male: 0.9, female: 1.2 },
      { ageGroup: '20-29세', total: 30.2, male: 13.0, female: 17.2 },
      { ageGroup: '30-39세', total: 22.4, male: 9.5, female: 12.9 },
      { ageGroup: '40-49세', total: 8.6, male: 3.6, female: 5.0 },
      { ageGroup: '50-59세', total: 12.4, male: 5.2, female: 7.2 },
      { ageGroup: '60세 이상', total: 5.5, male: 2.3, female: 3.2 },
    ],
    exposureCells: createExposureCells(0),
  },
  {
    id: 'campaign-long-name',
    name: '신제품 론칭 프로모션 캠페인 · 수도권 주요 거점 통합 운영 장기 캠페인',
    status: 'before',
    kpi: createKpi('210', '76.5', '44'),
    tola: [
      {
        key: 'traffic',
        label: '전체 유동인구',
        value: '9,842명',
        comparison: -1.1,
        description: '매체 주변을 통과한 전체 인원입니다.',
      },
      {
        key: 'exposure',
        label: '노출인구',
        value: '3,721명',
        comparison: 1.4,
        description: '유효 시청 조건을 충족한 추정 인원입니다.',
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
    ],
    viewers: createViewers([
      64, 73, 98, 84, 121, 138, 144, 169, 157, 181, 196, 214, 205,
    ]),
    averageSeconds: 2.8,
    watchBuckets: createBuckets([25, 38, 22, 15]),
    demographics: [
      { ageGroup: '0-9세', total: 2.4, male: 1.1, female: 1.3 },
      { ageGroup: '10-19세', total: 5.2, male: 2.2, female: 3 },
      { ageGroup: '20-29세', total: 28.3, male: 13.1, female: 15.2 },
      { ageGroup: '30-39세', total: 25.6, male: 11.8, female: 13.8 },
      { ageGroup: '40-49세', total: 16.5, male: 8.7, female: 7.8 },
      { ageGroup: '50-59세', total: 11.4, male: 6.1, female: 5.3 },
      { ageGroup: '60세 이상', total: 10.6, male: 5.7, female: 4.9 },
    ],
    exposureCells: createExposureCells(4),
  },
]
