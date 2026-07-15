/* eslint-disable react-refresh/only-export-components -- 스토리 전용 파츠(데이터+렌더 공용) */
import { useState, type ReactNode } from 'react'
import DashboardToolbar from '@/components/dashboard/DashboardToolbar'
import KpiSection from '@/components/dashboard/KpiSection'
import RealtimeViewerChart from '@/components/dashboard/RealtimeViewerChart'
import AverageWatchTimeCard from '@/components/dashboard/AverageWatchTimeCard'
import MovementFlowCard from '@/components/dashboard/MovementFlowCard'
import DemographicRatioCard from '@/components/dashboard/DemographicRatioCard'
import AgeExposureHeatmap from '@/components/dashboard/AgeExposureHeatmap'
import type { GenderFilter } from '@/components/dashboard/GenderFilterChips'
import type { DateRange } from '@/components/ui'
import { DASHBOARD_CAMPAIGNS } from '@/lib/dashboardFixtures'
import {
  DASHBOARD_AGE_GROUPS,
  DASHBOARD_HOURS,
} from '@/lib/dashboardHeatmapFixture'

// 대시보드 섹션 스토리 공용 파츠(각 섹션 스토리 파일이 1440/1280/0값에서 재사용).
export const c = DASHBOARD_CAMPAIGNS[0]!

// 집계 전(모든 지표 0) 데이터
export const zeroKpi = c.kpi.map((m) => ({
  ...m,
  value: m.key === 'downtime' ? '0건' : '0',
}))
export const zeroTola = c.tola.map((m) => ({
  ...m,
  value: m.key === 'conversion' ? '0%' : '0명',
  comparison: undefined,
}))
export const zeroViewers = c.viewers.map((p) => ({ ...p, viewers: 0 }))
export const zeroBuckets = c.watchBuckets.map((b) => ({ ...b, value: 0 }))
export const zeroDemographics = c.demographics.map((d) => ({
  ...d,
  total: 0,
  male: 0,
  female: 0,
}))
export const zeroCells = c.exposureCells.map((cell) => ({
  ...cell,
  all: 0 as const,
  male: 0 as const,
  female: 0 as const,
}))

/** 섹션을 지정 페이지 너비에서 HomePage와 동일한 좌우 패딩으로 렌더. */
export function PageWidth({
  width,
  children,
}: {
  width: number
  children: ReactNode
}) {
  return (
    <div className="bg-bg-secondary p-x5">
      <div style={{ width }} className="bg-bg-primary px-x5 py-x5">
        <div className="px-x5">{children}</div>
      </div>
    </div>
  )
}

export function KpiRow({ kpi }: { kpi: typeof c.kpi }) {
  const [selectedId, setSelectedId] = useState(c.id)
  const [dateRange, setDateRange] = useState<DateRange>({
    start: new Date(2026, 6, 7),
    end: new Date(2026, 6, 7),
  })
  return (
    <KpiSection
      metrics={kpi}
      estimatedDowntime
      toolbar={
        <DashboardToolbar
          campaigns={DASHBOARD_CAMPAIGNS}
          selectedId={selectedId}
          onCampaignChange={setSelectedId}
          dateRange={dateRange}
          onDateRangeChange={setDateRange}
        />
      }
    />
  )
}

export function RealtimeAverageRow({
  viewers,
  averageSeconds,
  buckets,
}: {
  viewers: typeof c.viewers
  averageSeconds: number
  buckets: typeof c.watchBuckets
}) {
  return (
    <div className="grid min-w-0 grid-cols-[minmax(0,1fr)_376px] gap-x5">
      <RealtimeViewerChart data={viewers} />
      <AverageWatchTimeCard averageSeconds={averageSeconds} buckets={buckets} />
    </div>
  )
}

export function MovementRatioRow({
  demographics,
}: {
  demographics: typeof c.demographics
}) {
  const [filter, setFilter] = useState<GenderFilter>('all')
  return (
    <div className="flex h-[348px] min-w-0 gap-x5">
      <MovementFlowCard />
      <DemographicRatioCard
        data={demographics}
        filter={filter}
        onFilterChange={setFilter}
      />
    </div>
  )
}

export function HeatmapRow({ cells }: { cells: typeof c.exposureCells }) {
  const [filter, setFilter] = useState<GenderFilter>('all')
  return (
    <AgeExposureHeatmap
      hours={DASHBOARD_HOURS}
      ageGroups={DASHBOARD_AGE_GROUPS}
      cells={cells}
      filter={filter}
      onFilterChange={setFilter}
    />
  )
}
