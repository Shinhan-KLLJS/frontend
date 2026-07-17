import type { Meta, StoryObj } from '@storybook/react-vite'
import MediaListPanel from '@/components/campaign/MediaListPanel'
import { SAMPLE_MEDIA_LIST } from './campaignStoryParts'

const noop = () => {}

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
  // 실제 배치(높이 640, 폭 372, rounded-x3 카드)와 동일한 컨테이너에서 확인.
  // 목록에 긴 이름·이미지 깨짐 케이스가 포함돼 카드 변형도 함께 보인다
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
