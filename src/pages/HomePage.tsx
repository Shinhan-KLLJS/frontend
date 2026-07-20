import { useState } from 'react'
import AgeExposureHeatmap from '@/components/dashboard/AgeExposureHeatmap'
import type { ExposureCell } from '@/components/dashboard/AgeExposureHeatmap'
import AverageWatchTimeCard from '@/components/dashboard/AverageWatchTimeCard'
import DashboardToolbar, {
  type CampaignOption,
} from '@/components/dashboard/DashboardToolbar'
import DemographicRatioCard from '@/components/dashboard/DemographicRatioCard'
import type { DemographicRatio } from '@/components/dashboard/DemographicRatioCard'
import type { GenderFilter } from '@/components/dashboard/GenderFilterChips'
import KpiSection from '@/components/dashboard/KpiSection'
import type { KpiMetric } from '@/components/dashboard/KpiSection'
import MovementFlowCard from '@/components/dashboard/MovementFlowCard'
import RealtimeViewerChart from '@/components/dashboard/RealtimeViewerChart'
import type { ViewerPoint } from '@/components/dashboard/RealtimeViewerChart'
import type { WatchTimeBucket } from '@/components/dashboard/AverageWatchTimeCard'
import TolaSection from '@/components/dashboard/TolaSection'
import type { TolaMetric } from '@/components/dashboard/TolaSection'
import type { DateRange } from '@/components/ui'

export interface HomePageProps {
  /** 캠페인 선택 드롭다운 옵션(실 API의 campaignId·campaignName). */
  campaigns?: CampaignOption[]
  initialCampaignId?: string
  /** 컨테이너가 캠페인 선택을 제어할 때(미제공 시 내부 상태로 동작 — Storybook용) */
  selectedId?: string
  onCampaignChange?: (id: string) => void
  /** 컨테이너가 조회 기간을 제어할 때(미제공 시 내부 상태) */
  dateRange?: DateRange
  onDateRangeChange?: (range: DateRange) => void
  /** DatePicker 선택 가능 범위(캠페인 집행기간) */
  minDate?: Date
  maxDate?: Date
  /** 송출정보 KPI(미제공=로딩 중이면 빈 상태) */
  kpiMetrics?: KpiMetric[]
  /** 다운타임이 무중단 송출 추정치인지(안내 문구 노출). 기본 true */
  estimatedDowntime?: boolean
  /** 깔때기(TOLA) 지표(미제공=로딩 중이면 빈 상태) */
  tolaMetrics?: TolaMetric[]
  /** TOLA 툴팁의 데이터 집계 기준 시각 "HH:mm" */
  tolaCutoffLabel?: string
  /** TOLA '어제 대비' 증감 표시 여부 — 기간 조회 시 false(빈 칸 유지). 기본 true */
  showTolaComparison?: boolean
  /** 시청수 시계열 — 오늘=실시간(5-1), 기간 선택=시간별 누적(5-2). 미제공=로딩 중이면 빈 상태 */
  realtimeData?: ViewerPoint[]
  /** 시간별 누적(기간 선택) 모드 — 데이터가 길면 가로 스크롤 */
  realtimeScrollable?: boolean
  /** 실 평균 시청시간(초)·구간 비중(미제공 시 fixture) */
  averageSeconds?: number
  watchBuckets?: WatchTimeBucket[]
  /** 실 성별·연령 시청 비율(미제공 시 fixture) */
  demographics?: DemographicRatio[]
  /** 실 시간·연령별 노출도 셀(축·행은 히트맵이 06~24시×7연령대로 고정) */
  exposureCells?: ExposureCell[]
  /** 각 섹션 (i) 툴팁의 집계 기준 시각 라벨(예: "14:37 기준"/"14시 기준") */
  realtimeCutoffLabel?: string
  averageCutoffLabel?: string
  demographicCutoffLabel?: string
  exposureCutoffLabel?: string
}

/**
 * 대시보드 홈 — 프레젠테이셔널.
 * 캠페인 선택·조회 기간은 controlled(props)면 컨테이너가, 아니면 내부 상태가 관리한다.
 * 각 섹션 데이터는 컨테이너(DashboardHome)가 실 API로 주입하며, 미로드 시 빈 상태로 표시한다.
 */
export default function HomePage({
  campaigns = [],
  initialCampaignId,
  selectedId: controlledId,
  onCampaignChange,
  dateRange: controlledRange,
  onDateRangeChange,
  minDate,
  maxDate,
  kpiMetrics,
  estimatedDowntime = true,
  tolaMetrics,
  tolaCutoffLabel,
  showTolaComparison,
  realtimeData,
  realtimeScrollable,
  averageSeconds,
  watchBuckets,
  demographics,
  exposureCells,
  realtimeCutoffLabel,
  averageCutoffLabel,
  demographicCutoffLabel,
  exposureCutoffLabel,
}: HomePageProps) {
  const firstCampaign = campaigns[0]
  const [innerId, setInnerId] = useState(
    initialCampaignId ?? firstCampaign?.id ?? '',
  )
  const [innerRange, setInnerRange] = useState<DateRange>({
    start: new Date(2026, 6, 7),
    end: new Date(2026, 6, 7),
  })
  const selectedId = controlledId ?? innerId
  const setSelectedId = onCampaignChange ?? setInnerId
  const dateRange = controlledRange ?? innerRange
  const setDateRange = onDateRangeChange ?? setInnerRange

  const [demographicFilter, setDemographicFilter] =
    useState<GenderFilter>('all')
  const [heatmapFilter, setHeatmapFilter] = useState<GenderFilter>('all')
  return (
    <section className="min-h-full bg-bg-primary px-x5 py-x5">
      <div className="flex min-w-0 flex-col gap-x5">
        <KpiSection
          metrics={kpiMetrics ?? []}
          estimatedDowntime={estimatedDowntime}
          toolbar={
            <DashboardToolbar
              campaigns={campaigns}
              selectedId={selectedId}
              onCampaignChange={setSelectedId}
              dateRange={dateRange}
              onDateRangeChange={setDateRange}
              minDate={minDate}
              maxDate={maxDate}
            />
          }
        />
        <TolaSection
          metrics={tolaMetrics ?? []}
          cutoffLabel={tolaCutoffLabel}
          showComparison={showTolaComparison}
        />
        {/* 실시간 시청수(좌)는 가변, 평균 시청시간(우)은 376px 고정 */}
        <div className="grid min-w-0 grid-cols-[minmax(0,1fr)_376px] gap-x5">
          <RealtimeViewerChart
            data={realtimeData ?? []}
            cutoffLabel={realtimeCutoffLabel}
            scrollable={realtimeScrollable}
          />
          <AverageWatchTimeCard
            averageSeconds={averageSeconds ?? 0}
            buckets={watchBuckets ?? []}
            cutoffLabel={averageCutoffLabel}
          />
        </div>
        {/* 동선 카드는 고정하고 성별·연령 카드만 남는 가로 폭을 채웁니다. */}
        <div className="flex h-[348px] min-w-0 gap-x5">
          <MovementFlowCard />
          <DemographicRatioCard
            data={demographics ?? []}
            filter={demographicFilter}
            onFilterChange={setDemographicFilter}
            cutoffLabel={demographicCutoffLabel}
          />
        </div>
        <AgeExposureHeatmap
          cells={exposureCells ?? []}
          filter={heatmapFilter}
          onFilterChange={setHeatmapFilter}
          cutoffLabel={exposureCutoffLabel}
        />
      </div>
    </section>
  )
}
