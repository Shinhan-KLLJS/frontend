import { Button, LoadingSpinner, Modal } from '@/components/ui'
import { useCampaignDetail } from '@/lib/campaigns'

interface CampaignMemoModalProps {
  teamId: number | undefined
  /** 선택한 캠페인 id — null이면 모달 미표시 */
  campaignId: number | null
  onClose: () => void
}

/** 선택한 캠페인의 메모를 상세 API로 조회해 보여줍니다. */
export default function CampaignMemoModal({
  teamId,
  campaignId,
  onClose,
}: CampaignMemoModalProps) {
  const { data: detail, isPending, isError } = useCampaignDetail(
    teamId,
    campaignId,
  )

  if (campaignId == null) return null

  return (
    <Modal
      open
      scoped
      aria-label="캠페인 메모"
      className="w-[460px] rounded-[24px]"
      footer={
        <Button className="w-full" onClick={onClose}>
          확인
        </Button>
      }
      onClose={onClose}
    >
      {isPending ? (
        <div className="flex h-[200px] items-center justify-center">
          <LoadingSpinner progress={0} showLabel={false} />
        </div>
      ) : isError || !detail ? (
        <div className="flex h-[200px] items-center justify-center text-body-2-normal-regular text-text-tertiary">
          메모를 불러오지 못했습니다.
        </div>
      ) : (
        <div className="flex flex-col gap-x3">
          <h2 className="text-headline-2-bold text-text-primary">메모</h2>
          <p className="whitespace-pre-wrap text-body-1-normal-regular text-text-secondary">
            {detail.memo?.trim() ? detail.memo : '작성된 메모가 없습니다.'}
          </p>
        </div>
      )}
    </Modal>
  )
}
