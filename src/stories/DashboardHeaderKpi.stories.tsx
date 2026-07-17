import type { Meta, StoryObj } from '@storybook/react-vite'
import { KpiRow, PageWidth, c, zeroKpi } from './dashboardStoryParts'

const meta: Meta = {
  title: 'Pages/Dashboard/1) 헤더 + 송출횟수',
  parameters: { layout: 'fullscreen' },
}
export default meta
type Story = StoryObj

export const W1440: Story = {
  name: '1440px',
  render: () => (
    <PageWidth width={1440}>
      <KpiRow kpi={c.kpi} />
    </PageWidth>
  ),
}

export const W1280: Story = {
  name: '1280px',
  render: () => (
    <PageWidth width={1280}>
      <KpiRow kpi={c.kpi} />
    </PageWidth>
  ),
}

export const Zero: Story = {
  name: '0값',
  render: () => (
    <PageWidth width={1280}>
      <KpiRow kpi={zeroKpi} />
    </PageWidth>
  ),
}
