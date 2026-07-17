import type { Meta, StoryObj } from '@storybook/react-vite'
import TolaSection from '@/components/dashboard/TolaSection'
import { PageWidth, c, zeroTola } from './dashboardStoryParts'

const meta: Meta = {
  title: 'Pages/Dashboard/2) KPI(유동·주목·전환·노출)',
  parameters: { layout: 'fullscreen' },
}
export default meta
type Story = StoryObj

export const W1440: Story = {
  name: '1440px',
  render: () => (
    <PageWidth width={1440}>
      <TolaSection metrics={c.tola} />
    </PageWidth>
  ),
}

export const W1280: Story = {
  name: '1280px',
  render: () => (
    <PageWidth width={1280}>
      <TolaSection metrics={c.tola} />
    </PageWidth>
  ),
}

export const Zero: Story = {
  name: '0값',
  render: () => (
    <PageWidth width={1280}>
      <TolaSection metrics={zeroTola} />
    </PageWidth>
  ),
}
