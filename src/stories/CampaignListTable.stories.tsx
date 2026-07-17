import type { Meta, StoryObj } from '@storybook/react-vite'
import CampaignListTable from '@/components/campaign/CampaignListTable'
import type { Campaign, CampaignStatus } from '@/lib/campaigns'

const STATUSES: CampaignStatus[] = ['running', 'before', 'completed', 'running']
const NAMES = [
  '나이키 썸머 프로모션 홍보 영상 2026 07',
  '루이비통 2026 SS 컬렉션 패션쇼',
  'HD현대오일뱅크 2026 하반기 브랜드',
  'LG에너지솔루션 배터리 산업 전시',
  '삼성전자 주식 자량 대회 누가누가',
]

const makeCampaigns = (n: number): Campaign[] =>
  Array.from({ length: n }, (_, i) => ({
    id: String(i + 1),
    name: `${NAMES[i % NAMES.length]} (${i + 1})`,
    status: STATUSES[i % STATUSES.length],
    startDate: '2026.07.11',
    endDate: '2026.08.15',
    mediaAddress: '서울특별시 강남구 테헤란로 1123',
    todayPlayCount: 12 + i,
    totalPlayCount: 200,
  }))

const noop = () => {}

// 빈 목록은 세로로 꽉 채우고, 많으면 늘어나며 스크롤되는 동작을 보이도록 고정 높이 컨테이너에 담는다.
function Frame({
  campaigns,
  width,
  height = 560,
}: {
  campaigns: Campaign[]
  width: number
  height?: number
}) {
  return (
    <div
      className="mx-auto flex flex-col overflow-y-auto bg-bg-secondary p-x5"
      style={{ width, height }}
    >
      <CampaignListTable
        campaigns={campaigns}
        onCampaignInfo={noop}
        onCampaignMemo={noop}
        onCampaignDelete={noop}
      />
    </div>
  )
}

const meta: Meta = {
  title: 'Pages/Campaign/4) 광고 리스트/캠페인 목록 테이블',
  parameters: { layout: 'fullscreen' },
}
export default meta
type Story = StoryObj

export const Empty: Story = {
  name: '빈 목록',
  render: () => <Frame campaigns={[]} width={1040} />,
}

export const Many: Story = {
  name: '많은 목록',
  render: () => <Frame campaigns={makeCampaigns(30)} width={1040} />,
}

export const Few: Story = {
  name: '적은 목록',
  render: () => <Frame campaigns={makeCampaigns(3)} width={1040} />,
}

export const W1280: Story = {
  name: '1280px',
  render: () => <Frame campaigns={makeCampaigns(8)} width={1280} />,
}

export const W1440: Story = {
  name: '1440px',
  render: () => <Frame campaigns={makeCampaigns(8)} width={1440} />,
}
