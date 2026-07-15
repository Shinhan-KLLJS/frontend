import { useState } from 'react'
import AgeExposureHeatmap from '@/components/dashboard/AgeExposureHeatmap'
import AverageWatchTimeCard from '@/components/dashboard/AverageWatchTimeCard'
import DashboardToolbar from '@/components/dashboard/DashboardToolbar'
import DemographicRatioCard from '@/components/dashboard/DemographicRatioCard'
import type { GenderFilter } from '@/components/dashboard/GenderFilterChips'
import KpiSection from '@/components/dashboard/KpiSection'
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
  campaigns?: DashboardCampaignFixture[]
  initialCampaignId?: string
}

/** API와 분리된 fixture를 조합해 대시보드 홈의 순수 UI를 구성합니다. */
export default function HomePage({
  campaigns = DASHBOARD_CAMPAIGNS,
  initialCampaignId,
}: HomePageProps) {
  const firstCampaign = campaigns[0]
  const [selectedId, setSelectedId] = useState(
    initialCampaignId ?? firstCampaign?.id ?? '',
  )
  const [dateRange, setDateRange] = useState<DateRange>({
    start: new Date(2026, 6, 7),
    end: new Date(2026, 6, 7),
  })
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
          metrics={campaign.kpi}
          estimatedDowntime
          toolbar={
            <DashboardToolbar
              campaigns={campaigns}
              selectedId={campaign.id}
              onCampaignChange={setSelectedId}
              dateRange={dateRange}
              onDateRangeChange={setDateRange}
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
