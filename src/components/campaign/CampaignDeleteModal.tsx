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
      // 폭·높이 유동(콘텐츠 맞춤), px-x5(base) + py-x8, 가운데 정렬
      className="items-center !px-x8 !py-x5"
      footer={
        // 취소·삭제하기를 동일 크기로 모달 너비를 꽉 채움.
        // grid-cols-2: line 버튼의 테두리와 무관하게 두 컬럼 폭이 정확히 동일.
        <div className="grid w-full grid-cols-2 gap-x2">
          <Button
            variant="line"
            color="secondary"
            className="w-full"
            disabled={pending}
            onClick={onClose}
          >
            취소
          </Button>
          <Button className="w-full" disabled={pending} onClick={onConfirm}>
            삭제하기
          </Button>
        </div>
      }
      onClose={onClose}
    >
      {/* 헤더 — 캠페인명·질문·경고 각 1줄, gap-x1 */}
      <div className="flex flex-col items-center gap-x1 whitespace-nowrap text-center">
        <p className="text-headline-1-bold text-text-primary">
          {campaign.name}
        </p>
        <p className="text-headline-1-bold text-text-primary">
          캠페인을 삭제하시겠어요?
        </p>
        <p className="text-body-2-normal-regular text-text-primary">
          삭제한 캠페인과 관련 데이터는 복구할 수 없어요.
        </p>
      </div>
    </Modal>
  )
}
