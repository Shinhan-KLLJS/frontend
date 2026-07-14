import type { ReactNode } from 'react'
import VideoUploadCard from '@/components/campaign/VideoUploadCard'
import type { UploadStatus } from '@/components/campaign/VideoUploadCard'
import { Button } from '@/components/ui'
import { formatDate } from '@/components/ui/date'
import type { CampaignInfoValues, CampaignMedia } from '@/lib/campaign'

export interface CampaignSummaryProps {
  info: CampaignInfoValues
  media: CampaignMedia | null
  uploadStatus: UploadStatus
  /** 업로드 영상 미리보기 objectURL (success일 때만 존재) */
  previewUrl: string | null
  // 업로드 실패 시 이 화면에서 바로 재업로드할 수 있어야 해서 업로드 핸들러를 그대로 받는다
  onFileSelect: (file: File) => void
  onUploadCancel: () => void
  onEditInfo: () => void
  onEditMedia: () => void
  onSubmit: () => void
  submitting: boolean
}

/** 라벨 배지 — ui Badge는 KPI 등락(화살표+%) 전용이라 정적 라벨은 로컬 span으로 처리 */
function CardBadge({ children }: { children: ReactNode }) {
  return (
    <span className="w-fit rounded-x2 bg-[var(--blue-100)] px-x2 py-xs text-body-1-normal-bold text-[var(--blue-400)]">
      {children}
    </span>
  )
}

function InfoRow({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-x2">
      <span className="w-[110px] shrink-0 text-body-1-normal-regular text-text-secondary">
        {label}
      </span>
      <span className="min-w-0 flex-1 truncate text-right text-body-1-normal-medium text-text-primary">
        {value}
      </span>
    </div>
  )
}

/**
 * 최종 확인 — 캠페인 정보/매체 정보 요약 카드 + 캠페인 등록.
 * 업로드가 success가 아니면 좌측이 업로드 카드(에러/진행 상태)로 대체되고 등록 버튼이 비활성화된다
 */
export default function CampaignSummary({
  info,
  media,
  uploadStatus,
  previewUrl,
  onFileSelect,
  onUploadCancel,
  onEditInfo,
  onEditMedia,
  onSubmit,
  submitting,
}: CampaignSummaryProps) {
  const canSubmit = uploadStatus === 'success' && Boolean(media) && !submitting

  const period = info.period.start
    ? `${formatDate(info.period.start)} - ${formatDate(info.period.end)}`
    : '-'

  return (
    <div className="flex w-full flex-col gap-x5 rounded-x6 border border-line-secondary bg-bg-secondary p-x5">
      <div className="flex items-stretch gap-x5">
        {/* 캠페인 정보 — 업로드 미완료(실패/진행/초기)면 업로드 카드로 대체 */}
        {uploadStatus === 'success' ? (
          <div className="flex min-h-[532px] min-w-0 flex-1 flex-col gap-x5 rounded-x4 bg-bg-primary p-x5">
            <div className="flex min-h-0 flex-1 flex-col justify-center gap-x4">
              <div className="max-h-[204px] min-h-0 w-full flex-1 overflow-hidden rounded-x3 bg-bg-tertiary">
                {previewUrl && (
                  <video
                    src={previewUrl}
                    muted
                    playsInline
                    preload="metadata"
                    className="size-full object-cover"
                  />
                )}
              </div>
              <CardBadge>캠페인 정보</CardBadge>
              <div className="flex flex-col gap-x3">
                <InfoRow label="캠페인명" value={info.name} />
                <InfoRow label="브랜드명" value={info.brand} />
                <InfoRow label="집행기간" value={period} />
                <InfoRow label="하루 송출 횟수" value={info.dailyPlayCount} />
                <InfoRow label="메모" value={info.memo || '-'} />
              </div>
            </div>
            <Button
              variant="line"
              color="secondary"
              size="medium"
              className="w-full"
              onClick={onEditInfo}
            >
              정보 수정
            </Button>
          </div>
        ) : (
          <VideoUploadCard
            status={uploadStatus}
            previewUrl={previewUrl}
            onFileSelect={onFileSelect}
            onCancel={onUploadCancel}
            className="min-h-[532px] min-w-0 flex-1"
          />
        )}

        {/* 매체 정보 */}
        <div className="flex min-h-[532px] min-w-0 flex-1 flex-col gap-x5 rounded-x4 bg-bg-primary p-x5">
          <div className="flex min-h-0 flex-1 flex-col justify-center gap-x4">
            <div className="max-h-[204px] min-h-0 w-full flex-1 overflow-hidden rounded-x3 bg-bg-tertiary">
              {media && (
                <img
                  src={media.thumbnail}
                  alt=""
                  className="size-full object-cover"
                />
              )}
            </div>
            <CardBadge>매체 정보</CardBadge>
            <div className="flex flex-col gap-x3">
              <InfoRow label="매체명" value={media?.name ?? '-'} />
              <InfoRow label="주소" value={media?.address ?? '-'} />
              <InfoRow label="규격" value={media?.size ?? '-'} />
              <InfoRow label="해상도" value={media?.resolution ?? '-'} />
              <div className="flex items-center justify-between gap-x2">
                <span className="w-[110px] shrink-0 text-body-1-normal-regular text-text-secondary">
                  형태
                </span>
                <span className="flex min-w-0 flex-1 items-center justify-end gap-[6px]">
                  {(media?.types ?? []).map((type) => (
                    <span
                      key={type}
                      className="rounded-[6px] bg-bg-tertiary px-[6px] py-xs text-label-1-normal-bold text-text-secondary"
                    >
                      {type}
                    </span>
                  ))}
                </span>
              </div>
            </div>
          </div>
          <Button
            variant="line"
            color="secondary"
            size="medium"
            className="w-full"
            onClick={onEditMedia}
          >
            정보 수정
          </Button>
        </div>
      </div>

      <Button
        size="large"
        className="w-full"
        disabled={!canSubmit}
        onClick={onSubmit}
      >
        {submitting ? '등록 중...' : '캠페인 등록'}
      </Button>
    </div>
  )
}
