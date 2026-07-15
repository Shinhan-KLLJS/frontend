import type { Meta, StoryObj } from '@storybook/react-vite'
import HomePage from '@/pages/HomePage'
import {
  DASHBOARD_CAMPAIGNS,
  type DashboardCampaignFixture,
} from '@/lib/dashboardFixtures'

const baseCampaign = DASHBOARD_CAMPAIGNS[0]!
const zeroCampaign: DashboardCampaignFixture = {
  ...baseCampaign,
  id: 'campaign-zero',
  name: '집계 시작 전 신규 캠페인 · 모든 지표 0 상태',
  kpi: baseCampaign.kpi.map((metric) => ({
    ...metric,
    value: metric.key === 'downtime' ? '0건' : '0',
  })),
  tola: baseCampaign.tola.map((metric) => ({
    ...metric,
    value: metric.key === 'conversion' ? '0%' : '0명',
    comparison: undefined,
  })),
  viewers: baseCampaign.viewers.map((point) => ({ ...point, viewers: 0 })),
  averageSeconds: 0,
  watchBuckets: baseCampaign.watchBuckets.map((bucket) => ({
    ...bucket,
    value: 0,
  })),
  demographics: baseCampaign.demographics.map((item) => ({
    ...item,
    total: 0,
    male: 0,
    female: 0,
  })),
  exposureCells: baseCampaign.exposureCells.map((cell) => ({
    ...cell,
    all: 0,
    male: 0,
    female: 0,
  })),
}

const meta = {
  title: 'Pages/Dashboard/Home',
  component: HomePage,
  parameters: { layout: 'fullscreen' },
  decorators: [
    (Story) => (
      <div className="min-w-[1040px] bg-bg-primary">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof HomePage>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const LongCampaignName: Story = {
  args: { initialCampaignId: DASHBOARD_CAMPAIGNS[1]!.id },
}

export const ZeroValues: Story = {
  args: { campaigns: [zeroCampaign], initialCampaignId: zeroCampaign.id },
}
