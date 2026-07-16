import type { Meta, StoryObj } from '@storybook/react-vite'
import {
  MovementRatioRow,
  PageWidth,
  c,
  zeroDemographics,
} from './dashboardStoryParts'

const meta: Meta = {
  title: 'Pages/Dashboard/4) 이동 동선 + 시청 비율',
  parameters: { layout: 'fullscreen' },
}
export default meta
type Story = StoryObj

export const W1440: Story = {
  name: '1440px',
  render: () => (
    <PageWidth width={1440}>
      <MovementRatioRow demographics={c.demographics} />
    </PageWidth>
  ),
}

export const W1280: Story = {
  name: '1280px',
  render: () => (
    <PageWidth width={1280}>
      <MovementRatioRow demographics={c.demographics} />
    </PageWidth>
  ),
}

export const Zero: Story = {
  name: '0값',
  render: () => (
    <PageWidth width={1280}>
      <MovementRatioRow demographics={zeroDemographics} />
    </PageWidth>
  ),
}
