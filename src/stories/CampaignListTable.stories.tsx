import type { Meta, StoryObj } from '@storybook/react-vite'
import CampaignListTable from '@/components/campaign/CampaignListTable'
import type { Campaign, CampaignStatus } from '@/lib/campaigns'

const STATUSES: CampaignStatus[] = ['running', 'running', 'before', 'completed']

const makeCampaigns = (n: number): Campaign[] =>
  Array.from({ length: n }, (_, i) => ({
    id: String(i + 1),
    name: `${i + 1}번 캠페인 나이키 썸머 프로모션 홍보 영상 2026`,
    status: STATUSES[i % STATUSES.length],
    startDate: '2026.07.11',
    endDate: '2026.08.15',
    mediaAddress: '서울특별시 강남구 테헤란로 1123',
    todayPlayCount: 12,
    totalPlayCount: 200,
  }))

// 페이지의 flex 컬럼(고정 높이) 안에 배치해 flex-1 채움을 재현
function Frame({ campaigns }: { campaigns: Campaign[] }) {
  return (
    <div
      className="flex flex-col gap-x5 bg-bg-secondary p-x5"
      style={{ height: 640, width: 1040 }}
    >
      <div className="h-[40px] shrink-0" />
      <CampaignListTable
        campaigns={campaigns}
        onCampaignInfo={() => {}}
        onCampaignMemo={() => {}}
        onCampaignDelete={() => {}}
      />
    </div>
  )
}

const meta: Meta = {
  title: 'Pages/Campaign/List Table',
  parameters: { layout: 'fullscreen' },
}
export default meta
type Story = StoryObj

export const Few: Story = {
  name: '적은 목록(높이 채움)',
  render: () => <Frame campaigns={makeCampaigns(3)} />,
}

export const Many: Story = {
  name: '많은 목록',
  render: () => <Frame campaigns={makeCampaigns(20)} />,
}

export const Empty: Story = {
  name: '빈 목록',
  render: () => <Frame campaigns={[]} />,
}
