import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import MediaListPanel from '@/components/campaign/MediaListPanel'
import type { MediaListPanelProps } from '@/components/campaign/MediaListPanel'
import type { CampaignMedia } from '@/lib/campaign'
import { SAMPLE_MEDIA_LIST } from './campaignStoryParts'

const noop = () => {}

// 무한 스크롤(10 → +6) 확인용 22개 목록
const base = SAMPLE_MEDIA_LIST[0]!
const MANY_MEDIA: CampaignMedia[] = Array.from({ length: 22 }, (_, i) => ({
  ...base,
  id: String(i + 1),
  name: `${base.name} #${i + 1}`,
  available: i % 4 !== 0,
}))

// 서버 페이지네이션 시뮬레이션 — onLoadMore마다 6개씩 누적(첫 10개 → 16 → 22)
function PaginatedPanel(args: MediaListPanelProps) {
  const [count, setCount] = useState(10)
  return (
    <MediaListPanel
      {...args}
      mediaList={MANY_MEDIA.slice(0, count)}
      hasMore={count < MANY_MEDIA.length}
      onLoadMore={() => setCount((c) => Math.min(MANY_MEDIA.length, c + 6))}
    />
  )
}

const meta: Meta<typeof MediaListPanel> = {
  title: 'Pages/Campaign/2) 광고 송출 매체 선택/매체 리스트 패널',
  component: MediaListPanel,
  parameters: { layout: 'centered' },
  args: {
    mediaList: SAMPLE_MEDIA_LIST,
    keyword: '',
    onKeywordChange: noop,
    onSelectMedia: noop,
    onPrev: noop,
    onNext: noop,
    selectedMediaId: null,
  },
  // 실제 배치(높이 640, 폭 372, rounded-x3 카드)와 동일한 컨테이너에서 확인
  decorators: [
    (Story) => (
      <div className="h-[640px] w-[372px] overflow-hidden rounded-x3 border border-line-secondary">
        {Story()}
      </div>
    ),
  ],
}
export default meta
type Story = StoryObj<typeof MediaListPanel>

export const Unselected: Story = {
  name: '미선택',
  args: { selectedMediaId: null },
}

export const Selected: Story = {
  name: '선택 (다음 활성)',
  args: { selectedMediaId: '1' },
}

export const InfiniteScroll: Story = {
  name: '무한 스크롤 (10 → +6)',
  args: { className: 'h-full' },
  render: (args) => <PaginatedPanel {...args} />,
}
