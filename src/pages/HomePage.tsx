import { useState } from 'react'
import AgeExposureHeatmap from '@/components/dashboard/AgeExposureHeatmap'
import AverageWatchTimeCard from '@/components/dashboard/AverageWatchTimeCard'
import DashboardToolbar from '@/components/dashboard/DashboardToolbar'
import DemographicRatioCard from '@/components/dashboard/DemographicRatioCard'
import type { GenderFilter } from '@/components/dashboard/GenderFilterChips'
import KpiSection from '@/components/dashboard/KpiSection'
import type { KpiMetric } from '@/components/dashboard/KpiSection'
import MovementFlowCard from '@/components/dashboard/MovementFlowCard'
import RealtimeViewerChart from '@/components/dashboard/RealtimeViewerChart'
import TolaSection from '@/components/dashboard/TolaSection'
import type { DateRange } from '@/components/ui'
import {
  DASHBOARD_AGE_GROUPS,
  DASHBOARD_HOURS,
} from '@/lib/dashboardHeatmapFixture'
import {
  DASHBOARD_CAMPAIGNS,
  type DashboardCampaignFixture,
} from '@/lib/dashboardFixtures'

export interface HomePageProps {
  /** 섹션 데이터 소스(fixture). 실 API 연결 전까지 KPI/TOLA/차트는 여기서 그려진다. */
  campaigns?: DashboardCampaignFixture[]
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
  /** 실 송출정보 KPI(미제공 시 fixture campaign.kpi 사용 — Storybook·로딩 중) */
  kpiMetrics?: KpiMetric[]
  /** 다운타임이 무중단 송출 추정치인지(안내 문구 노출). 기본 true */
  estimatedDowntime?: boolean
}

/**
 * 대시보드 홈 — 프레젠테이셔널.
 * 캠페인 선택·조회 기간은 controlled(props)면 컨테이너가, 아니면 내부 상태가 관리한다.
 * 데이터는 fixture 기준(실 API 연결은 DashboardHome 컨테이너 + 각 섹션 태스크에서).
 */
export default function HomePage({
  campaigns = DASHBOARD_CAMPAIGNS,
  initialCampaignId,
  selectedId: controlledId,
  onCampaignChange,
  dateRange: controlledRange,
  onDateRangeChange,
  minDate,
  maxDate,
  kpiMetrics,
  estimatedDowntime = true,
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
  const campaign =
    campaigns.find(({ id }) => id === selectedId) ?? firstCampaign

  if (!campaign) return null

  return (
    <section className="min-h-full bg-bg-primary px-x5 py-x5">
      <div className="flex min-w-0 flex-col gap-x5 px-x5">
        <KpiSection
          metrics={kpiMetrics ?? campaign.kpi}
          estimatedDowntime={estimatedDowntime}
          toolbar={
            <DashboardToolbar
              campaigns={campaigns}
              selectedId={campaign.id}
              onCampaignChange={setSelectedId}
              dateRange={dateRange}
              onDateRangeChange={setDateRange}
              minDate={minDate}
              maxDate={maxDate}
            />
          }
        />
        <TolaSection metrics={campaign.tola} />
        <div className="grid min-w-0 grid-cols-[3fr_2fr] gap-x5">
          <RealtimeViewerChart data={campaign.viewers} />
          <AverageWatchTimeCard
            averageSeconds={campaign.averageSeconds}
            buckets={campaign.watchBuckets}
          />
        </div>
        {/* 동선 카드는 고정하고 성별·연령 카드만 남는 가로 폭을 채웁니다. */}
        <div className="flex h-[348px] min-w-0 gap-x5">
          <MovementFlowCard />
          <DemographicRatioCard
            data={campaign.demographics}
            filter={demographicFilter}
            onFilterChange={setDemographicFilter}
          />
        </div>
        <AgeExposureHeatmap
          hours={DASHBOARD_HOURS}
          ageGroups={DASHBOARD_AGE_GROUPS}
          cells={campaign.exposureCells}
          filter={heatmapFilter}
          onFilterChange={setHeatmapFilter}
        />
      </div>
    </section>
  )
}
