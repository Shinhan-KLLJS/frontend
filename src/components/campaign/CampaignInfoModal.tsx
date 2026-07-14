import { Button, Modal } from '@/components/ui'
import type { Campaign } from '@/lib/campaigns'
import CampaignInfoCard from './CampaignInfoCard'

interface CampaignInfoModalProps {
  campaign: Campaign | null
  onClose: () => void
}

/** 선택한 캠페인과 연결 매체의 정보를 피그마 가이드 카드 형태로 보여줍니다. */
export default function CampaignInfoModal({
  campaign,
  onClose,
}: CampaignInfoModalProps) {
  if (!campaign) return null

  const campaignFields = [
    { label: '캠페인명', value: campaign.name },
    { label: '브랜드명', value: campaign.brandName },
    { label: '집행기간', value: `${campaign.startDate} - ${campaign.endDate}` },
    { label: '하루 송출 횟수', value: String(campaign.totalPlayCount) },
    { label: '메모', value: campaign.memo },
  ]
  const mediaFields = [
    { label: '매체명', value: campaign.mediaName },
    { label: '주소', value: campaign.mediaAddress },
    { label: '규격', value: campaign.mediaSize },
    { label: '해상도', value: campaign.mediaResolution },
  ]

  return (
    <Modal
      open
      aria-label="캠페인 정보"
      className="w-[796px] rounded-[24px]"
      footer={<Button className="w-full" onClick={onClose}>확인</Button>}
      onClose={onClose}
    >
      <div className="flex gap-x5">
        <CampaignInfoCard title="캠페인 정보" fields={campaignFields} />
        <CampaignInfoCard
          title="매체 정보"
          fields={mediaFields}
          tags={campaign.mediaTags}
        />
      </div>
    </Modal>
  )
}
