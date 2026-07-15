import type { Meta, StoryObj } from '@storybook/react-vite'
import {
  PageWidth,
  RealtimeAverageRow,
  c,
  zeroBuckets,
  zeroViewers,
} from './dashboardStoryParts'

const meta: Meta = {
  title: 'Pages/Dashboard/3) 실시간 시청수 + 평균 시청시간',
  parameters: { layout: 'fullscreen' },
}
export default meta
type Story = StoryObj

export const W1440: Story = {
  name: '1440px',
  render: () => (
    <PageWidth width={1440}>
      <RealtimeAverageRow
        viewers={c.viewers}
        averageSeconds={c.averageSeconds}
        buckets={c.watchBuckets}
      />
    </PageWidth>
  ),
}

export const W1280: Story = {
  name: '1280px',
  render: () => (
    <PageWidth width={1280}>
      <RealtimeAverageRow
        viewers={c.viewers}
        averageSeconds={c.averageSeconds}
        buckets={c.watchBuckets}
      />
    </PageWidth>
  ),
}

export const Zero: Story = {
  name: '0값',
  render: () => (
    <PageWidth width={1280}>
      <RealtimeAverageRow
        viewers={zeroViewers}
        averageSeconds={0}
        buckets={zeroBuckets}
      />
    </PageWidth>
  ),
}
