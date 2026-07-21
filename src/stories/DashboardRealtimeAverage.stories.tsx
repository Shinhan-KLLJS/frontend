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

// 당일 실시간 — 1분 단위 33포인트(30분+). 라벨은 정규 간격으로 솎이고 포인트에 정렬.
const minuteViewers = Array.from({ length: 33 }, (_, i) => {
  const m = 52 + i
  const hh = 15 + Math.floor(m / 60)
  const mm = m % 60
  return {
    time: `${String(hh).padStart(2, '0')}:${String(mm).padStart(2, '0')}`,
    viewers: 24 + Math.round(10 * Math.sin(i / 2)) + (i % 3),
  }
})

export const MinuteToday: Story = {
  name: '당일(1분·33포인트)',
  render: () => (
    <PageWidth width={1280}>
      <RealtimeAverageRow
        viewers={minuteViewers}
        averageSeconds={c.averageSeconds}
        buckets={c.watchBuckets}
      />
    </PageWidth>
  ),
}

// 사이드 LNB가 열려 폭이 좁아진 경우 — 라벨이 겹치지 않고 자동으로 솎이는지 확인
export const MinuteTodayNarrow: Story = {
  name: '당일(1분·좁은 폭)',
  render: () => (
    <PageWidth width={860}>
      <RealtimeAverageRow
        viewers={minuteViewers}
        averageSeconds={c.averageSeconds}
        buckets={c.watchBuckets}
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
