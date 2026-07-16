import type { Meta, StoryObj } from '@storybook/react-vite'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import CampaignInfoForm from '@/components/campaign/CampaignInfoForm'
import { campaignInfoSchema } from '@/lib/campaign'
import type { CampaignInfoValues } from '@/lib/campaign'
import { SAMPLE_INFO } from './campaignStoryParts'

const noop = () => {}

const EMPTY: CampaignInfoValues = {
  name: '',
  brand: '',
  period: {},
  dailyPlayCount: '',
  memo: '',
}

// 폼 인스턴스를 스토리에서 만들어 주입 (실제로는 위저드 페이지가 소유)
function InfoForm({
  defaults,
  uploadReady,
}: {
  defaults: CampaignInfoValues
  uploadReady: boolean
}) {
  const form = useForm<CampaignInfoValues>({
    resolver: zodResolver(campaignInfoSchema),
    mode: 'onTouched',
    defaultValues: defaults,
  })
  // 실제 step1처럼 폼이 self-stretch로 높이를 채우도록 넉넉한 min-height 부여
  // (고정 height면 콘텐츠가 넘쳐 카드 하단 패딩이 잘림)
  return (
    <div className="flex max-h-[720px] w-[470px]">
      <CampaignInfoForm form={form} uploadReady={uploadReady} onNext={noop} />
    </div>
  )
}

const meta: Meta = {
  title: 'Pages/Campaign/1) 광고 영상 및 기본 정보 입력/기본 정보 폼',
  parameters: { layout: 'centered' },
}
export default meta
type Story = StoryObj

export const Empty: Story = {
  name: '입력 전',
  render: () => <InfoForm defaults={EMPTY} uploadReady={false} />,
}

export const Filled: Story = {
  name: '작성 완료 (썸네일 준비 시 다음 활성)',
  render: () => <InfoForm defaults={SAMPLE_INFO} uploadReady />,
}
