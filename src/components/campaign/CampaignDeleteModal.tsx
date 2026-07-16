import { Button, Modal } from '@/components/ui'
import type { Campaign } from '@/lib/campaigns'

interface CampaignDeleteModalProps {
  campaign: Campaign | null
  /** 삭제 요청 진행 중 — 버튼 비활성화 */
  pending?: boolean
  onClose: () => void
  onConfirm: () => void
}

/** 삭제 영향을 안내하고 사용자의 명시적인 확인 후에만 삭제를 진행합니다. */
export default function CampaignDeleteModal({
  campaign,
  pending = false,
  onClose,
  onConfirm,
}: CampaignDeleteModalProps) {
  if (!campaign) return null

  return (
    <Modal
      open
      aria-label="캠페인 삭제 확인"
      className="!w-[388px] !items-center !px-x5 !py-x8"
      footer={
        <div className="flex w-full justify-center gap-x2">
          <Button
            variant="line"
            color="secondary"
            className="w-[143px]"
            disabled={pending}
            onClick={onClose}
          >
            아니요
          </Button>
          <Button className="w-[143px]" disabled={pending} onClick={onConfirm}>
            네
          </Button>
        </div>
      }
      onClose={onClose}
    >
      <div className="flex w-full flex-col items-center gap-x1 text-center">
        <p className="text-headline-1-bold text-text-primary">
          {`{${campaign.name}} 캠페인을 삭제하시겠습니까?`}
        </p>
        <p className="text-body-2-normal-regular text-text-primary">
          삭제시 송출이 중단되고 데이터를 측정할 수 없습니다.
        </p>
      </div>
    </Modal>
  )
}
