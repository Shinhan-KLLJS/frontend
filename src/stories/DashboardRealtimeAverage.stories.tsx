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

// 시간별 누적(기간 선택) 모드 — 포인트가 많아 가로 스크롤 발생
const hourlyViewers = Array.from({ length: 48 }, (_, i) => ({
  time: `${String(i % 24).padStart(2, '0')}:00`,
  viewers: 180 + Math.round(90 * Math.sin(i / 3)) + i * 4,
}))

export const HourlyScroll: Story = {
  name: '시간별(가로 스크롤)',
  render: () => (
    <PageWidth width={1280}>
      <RealtimeAverageRow
        viewers={hourlyViewers}
        averageSeconds={c.averageSeconds}
        buckets={c.watchBuckets}
        scrollable
      />
    </PageWidth>
  ),
}
