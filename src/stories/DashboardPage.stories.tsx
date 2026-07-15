import type { Meta, StoryObj } from '@storybook/react-vite'
import { useState, type ReactNode } from 'react'
import DashboardToolbar from '@/components/dashboard/DashboardToolbar'
import KpiSection from '@/components/dashboard/KpiSection'
import TolaSection from '@/components/dashboard/TolaSection'
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

const c = DASHBOARD_CAMPAIGNS[0]!
const WIDTHS = [1280, 1440] as const

/**
 * 섹션을 1280·1440 페이지 너비에서 각각(HomePage와 동일한 좌우 패딩) 세로로 쌓아 보여준다.
 * render를 너비마다 새로 호출해 각 인스턴스가 독립 상태를 갖게 한다.
 */
function AtPageWidths({ render }: { render: () => ReactNode }) {
  return (
    <div className="flex flex-col gap-x10 bg-bg-secondary p-x5">
      {WIDTHS.map((w) => (
        <div key={w} className="flex flex-col gap-x2">
          <span className="text-label-1-normal-medium text-text-caption">
            페이지 {w}px
          </span>
          <div style={{ width: w }} className="bg-bg-primary px-x5 py-x5">
            <div className="px-x5">{render()}</div>
          </div>
        </div>
      ))}
    </div>
  )
}

const meta: Meta = {
  title: 'Pages/Dashboard/Sections',
  parameters: { layout: 'fullscreen' },
}
export default meta
type Story = StoryObj

// 1) 헤더 + 송출횟수 — 툴바(캠페인·기간) + 송출 KPI
function HeaderKpiSection() {
  const [selectedId, setSelectedId] = useState(c.id)
  const [dateRange, setDateRange] = useState<DateRange>({
    start: new Date(2026, 6, 7),
    end: new Date(2026, 6, 7),
  })
  return (
    <KpiSection
      metrics={c.kpi}
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
export const HeaderAndKpi: Story = {
  name: '1) 헤더 + 송출횟수',
  render: () => <AtPageWidths render={() => <HeaderKpiSection />} />,
}

// 2) KPI — 유동·주목·전환·노출(TOLA)
export const Tola: Story = {
  name: '2) KPI(유동·주목·전환·노출)',
  render: () => <AtPageWidths render={() => <TolaSection metrics={c.tola} />} />,
}

// 3) 실시간 시청수(가변) + 평균 시청시간(376 고정)
export const RealtimeAndAverage: Story = {
  name: '3) 실시간 시청수 + 평균 시청시간',
  render: () => (
    <AtPageWidths
      render={() => (
        <div className="grid min-w-0 grid-cols-[minmax(0,1fr)_376px] gap-x5">
          <RealtimeViewerChart data={c.viewers} />
          <AverageWatchTimeCard
            averageSeconds={c.averageSeconds}
            buckets={c.watchBuckets}
          />
        </div>
      )}
    />
  ),
}

// 4) 이동 동선(376 고정) + 성별·연령 시청 비율(가변)
function MovementAndRatioSection() {
  const [filter, setFilter] = useState<GenderFilter>('all')
  return (
    <div className="flex h-[348px] min-w-0 gap-x5">
      <MovementFlowCard />
      <DemographicRatioCard
        data={c.demographics}
        filter={filter}
        onFilterChange={setFilter}
      />
    </div>
  )
}
export const MovementAndRatio: Story = {
  name: '4) 이동 동선 + 시청 비율',
  render: () => <AtPageWidths render={() => <MovementAndRatioSection />} />,
}

// 5) 시간·연령별 노출도 히트맵
function HeatmapSection() {
  const [filter, setFilter] = useState<GenderFilter>('all')
  return (
    <AgeExposureHeatmap
      hours={DASHBOARD_HOURS}
      ageGroups={DASHBOARD_AGE_GROUPS}
      cells={c.exposureCells}
      filter={filter}
      onFilterChange={setFilter}
    />
  )
}
export const Heatmap: Story = {
  name: '5) 시간·연령별 노출도',
  render: () => <AtPageWidths render={() => <HeatmapSection />} />,
}
