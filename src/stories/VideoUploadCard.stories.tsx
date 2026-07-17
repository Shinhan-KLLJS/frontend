import type { Meta, StoryObj } from '@storybook/react-vite'
import VideoUploadCard from '@/components/campaign/VideoUploadCard'
import { SAMPLE_THUMBNAIL } from './campaignStoryParts'

const noop = () => {}

const meta: Meta<typeof VideoUploadCard> = {
  title: 'Pages/Campaign/1) 광고 영상 및 기본 정보 입력/영상 업로드 카드',
  component: VideoUploadCard,
  parameters: { layout: 'centered' },
  args: {
    onFileSelect: noop,
    onCancel: noop,
    className: 'min-h-[608px] w-[470px]',
  },
}
export default meta
type Story = StoryObj<typeof VideoUploadCard>

export const Idle: Story = {
  name: '대기',
  args: { status: 'idle', thumbnailUrl: null },
}

export const Uploading: Story = {
  name: '업로드 중',
  args: { status: 'uploading', thumbnailUrl: null },
}

export const Success: Story = {
  name: '완료',
  args: { status: 'success', thumbnailUrl: SAMPLE_THUMBNAIL },
}

export const Error: Story = {
  name: '실패',
  args: { status: 'error', thumbnailUrl: null },
}
