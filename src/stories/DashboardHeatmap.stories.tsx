import type { Meta, StoryObj } from '@storybook/react-vite'
import { HeatmapRow, PageWidth, c, zeroCells } from './dashboardStoryParts'

const meta: Meta = {
  title: 'Pages/Dashboard/5) 시간·연령별 노출도',
  parameters: { layout: 'fullscreen' },
}
export default meta
type Story = StoryObj

export const W1440: Story = {
  name: '1440px',
  render: () => (
    <PageWidth width={1440}>
      <HeatmapRow cells={c.exposureCells} />
    </PageWidth>
  ),
}

export const W1280: Story = {
  name: '1280px',
  render: () => (
    <PageWidth width={1280}>
      <HeatmapRow cells={c.exposureCells} />
    </PageWidth>
  ),
}

export const Zero: Story = {
  name: '0값',
  render: () => (
    <PageWidth width={1280}>
      <HeatmapRow cells={zeroCells} />
    </PageWidth>
  ),
}
