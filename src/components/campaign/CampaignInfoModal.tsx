import { Button, LoadingSpinner, Modal } from '@/components/ui'
import { useCampaignDetail } from '@/lib/campaigns'
import CampaignInfoCard from './CampaignInfoCard'

interface CampaignInfoModalProps {
  teamId: number | undefined
  /** 선택한 캠페인 id — null이면 모달 미표시 */
  campaignId: number | null
  onClose: () => void
}

/** 선택한 캠페인과 연결 매체의 정보를 상세 API로 조회해 카드 형태로 보여줍니다. */
export default function CampaignInfoModal({
  teamId,
  campaignId,
  onClose,
}: CampaignInfoModalProps) {
  const { data: detail, isPending, isError } = useCampaignDetail(
    teamId,
    campaignId,
  )

  if (campaignId == null || teamId == null) return null

  const campaignFields = detail
    ? [
        { label: '캠페인명', value: detail.name },
        { label: '브랜드명', value: detail.brandName },
        { label: '집행기간', value: `${detail.startDate} - ${detail.endDate}` },
        { label: '하루 송출 횟수', value: String(detail.dailyTargetPlayCount) },
        { label: '메모', value: detail.memo },
      ]
    : []
  const mediaFields = detail
    ? [
        { label: '매체명', value: detail.mediaName },
        { label: '주소', value: detail.mediaAddress },
        { label: '규격', value: detail.mediaSize },
        { label: '해상도', value: detail.mediaResolution },
      ]
    : []

  return (
    <Modal
      open
      aria-label="캠페인 정보"
      className="h-[536px] w-[796px] rounded-[24px] border border-line-secondary shadow-normal-small"
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
          캠페인 정보를 불러오지 못했습니다.
        </div>
      ) : (
        <div className="flex flex-1 gap-x5">
          <CampaignInfoCard
            title="캠페인 정보"
            fields={campaignFields}
            imageUrl={
              detail.creativeType === 'IMAGE' ? detail.creativeUrl : undefined
            }
            videoUrl={
              detail.creativeType === 'VIDEO' ? detail.creativeUrl : undefined
            }
          />
          <CampaignInfoCard
            title="매체 정보"
            fields={mediaFields}
            tags={detail.mediaTags}
            imageUrl={detail.mediaPhotoUrl}
          />
        </div>
      )}
    </Modal>
  )
}
