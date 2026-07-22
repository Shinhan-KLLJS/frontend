import {
  Button,
  InputField,
  LoadingSpinner,
  Modal,
  Textarea,
} from '@/components/ui'
import { useCampaignDetail } from '@/lib/campaigns'

interface CampaignMemoModalProps {
  teamId: number | undefined
  /** 선택한 캠페인 id — null이면 모달 미표시 */
  campaignId: number | null
  onClose: () => void
}

/** 선택한 캠페인의 캠페인명·메모를 상세 API로 조회해 읽기 전용으로 보여줍니다. */
export default function CampaignMemoModal({
  teamId,
  campaignId,
  onClose,
}: CampaignMemoModalProps) {
  const { data: detail, isPending, isError } = useCampaignDetail(
    teamId,
    campaignId,
  )

  if (campaignId == null || teamId == null) return null

  return (
    <Modal
      open
      aria-label="캠페인 메모"
      // 470×352 고정, p-x6, 세로 정렬(gap-x5는 Modal children 기본)
      className="h-[352px] w-[470px] !p-x6"
      footer={
        <Button className="w-full" onClick={onClose}>
          확인
        </Button>
      }
      onClose={onClose}
    >
      {isPending ? (
        <div className="flex flex-1 items-center justify-center">
          <LoadingSpinner progress={0} showLabel={false} />
        </div>
      ) : isError || !detail ? (
        <div className="flex flex-1 items-center justify-center text-body-2-normal-regular text-text-tertiary">
          메모를 불러오지 못했습니다.
        </div>
      ) : (
        <div className="flex flex-1 flex-col gap-x5">
          <h2 className="text-title-3-bold text-text-primary">메모</h2>
          <div className="flex flex-1 flex-col gap-x2">
            {/* 표시 전용 — 클릭·포커스 불가(pointer-events-none + tabIndex -1), 데이터만 보여줌 */}
            <InputField
              label="캠페인명"
              value={detail.name}
              readOnly
              tabIndex={-1}
              className="pointer-events-none"
            />
            <Textarea
              value={detail.memo}
              readOnly
              aria-label="메모"
              tabIndex={-1}
              className="flex-1 pointer-events-none"
            />
          </div>
        </div>
      )}
    </Modal>
  )
}
