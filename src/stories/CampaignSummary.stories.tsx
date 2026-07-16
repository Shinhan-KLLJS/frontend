import type { Meta, StoryObj } from '@storybook/react-vite'
import CampaignSummary from '@/components/campaign/CampaignSummary'
import {
  CampaignFrame,
  SAMPLE_INFO,
  SAMPLE_THUMBNAIL,
  sampleMedia,
} from './campaignStoryParts'

const noop = () => {}

const baseArgs = {
  info: SAMPLE_INFO,
  media: sampleMedia(),
  uploadStatus: 'success' as const,
  thumbnailUrl: SAMPLE_THUMBNAIL,
  onFileSelect: noop,
  onUploadCancel: noop,
  onEditInfo: noop,
  onEditMedia: noop,
  onSubmit: noop,
  submitting: false,
}

const meta: Meta = {
  title: 'Pages/Campaign/3) 입력 정보 확인/최종 확인 요약',
  parameters: { layout: 'fullscreen' },
}
export default meta
type Story = StoryObj

// 뷰포트별 본문 폭 (LNB 240 + 패딩 제외 근사) — 반응형으로 카드 폭이 달라짐
export const W1280: Story = {
  name: '1280px',
  render: () => (
    <CampaignFrame width={1000}>
      <CampaignSummary {...baseArgs} />
    </CampaignFrame>
  ),
}

export const W1440: Story = {
  name: '1440px',
  render: () => (
    <CampaignFrame width={1160}>
      <CampaignSummary {...baseArgs} />
    </CampaignFrame>
  ),
}
