import { useRef, useState } from 'react'
import type { DragEvent } from 'react'
import { CircleCheck, CircleX, Upload } from 'lucide-react'
import { Button, Icon } from '@/components/ui'

export const UPLOAD_STATUS = ['idle', 'uploading', 'success', 'error'] as const
export type UploadStatus = (typeof UPLOAD_STATUS)[number]

export interface VideoUploadCardProps {
  status: UploadStatus
  /** 영상에서 추출한 썸네일(dataURL) — 업로드 진행/완료와 무관하게 준비되면 카드 배경 미리보기로 사용 */
  thumbnailUrl: string | null
  // 업로드 호출·상태 전이·파일 형식 검증은 부모(위저드 페이지)가 소유 — 여기선 파일 선택/드롭 이벤트만 전달
  onFileSelect: (file: File) => void
  onCancel: () => void
  className?: string
}

// 상태별 카드 테두리 — success/error는 2px 컬러 보더 (Figma Contents Upload 변형)
const STATUS_CARD_CLASS: Record<UploadStatus, string> = {
  idle: 'border border-line-tertiary',
  uploading: 'border border-line-tertiary',
  success: 'border-2 border-line-positive',
  error: 'border-2 border-line-negative',
}

/**
 * 광고 영상 업로드 카드 — 드래그&드롭 + 파일 선택, 상태(idle/uploading/success/error)별 UI.
 * uploading은 취소 버튼, success는 영상 미리보기 배경 + 파일 변경, error는 재업로드를 제공한다
 */
export default function VideoUploadCard({
  status,
  thumbnailUrl,
  onFileSelect,
  onCancel,
  className,
}: VideoUploadCardProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [isDragging, setIsDragging] = useState(false)

  // 썸네일이 준비되면 업로드 진행/완료와 무관하게 배경 미리보기를 노출 (에러 상태는 재업로드 안내를 위해 제외)
  const hasPreview =
    Boolean(thumbnailUrl) && status !== 'idle' && status !== 'error'

  const openFileDialog = () => inputRef.current?.click()

  const handleDragOver = (e: DragEvent) => {
    e.preventDefault()
    if (status !== 'uploading') setIsDragging(true)
  }

  const handleDrop = (e: DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    if (status === 'uploading') return
    const file = e.dataTransfer.files[0]
    if (file) onFileSelect(file)
  }

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={() => setIsDragging(false)}
      onDrop={handleDrop}
      className={[
        'relative flex flex-col items-center justify-center overflow-hidden rounded-x4 p-x10 transition-colors',
        STATUS_CARD_CLASS[status],
        isDragging && status !== 'success'
          ? 'bg-primary-brand-weak'
          : 'bg-bg-secondary',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      <input
        ref={inputRef}
        type="file"
        accept="video/*"
        // 버튼으로만 여는 숨은 입력 — 탭 순서에서 제외 (sr-only는 포커스가 잡힘)
        tabIndex={-1}
        className="sr-only"
        aria-label="광고 영상 파일 선택"
        onChange={(e) => {
          const file = e.target.files?.[0]
          if (file) onFileSelect(file)
          // 같은 파일 재선택도 onChange가 발생하도록 초기화
          e.target.value = ''
        }}
      />

      {/* 추출한 썸네일 + 딤 처리를 카드 배경으로 (업로드 중에도 노출).
          프레임이 잘리지 않도록 레터박스(contain + 검정 배경)로 전체를 보여준다 */}
      {hasPreview && thumbnailUrl && (
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-[var(--cool-neutral-1000)]"
        >
          <img src={thumbnailUrl} alt="" className="size-full object-contain" />
          <div className="absolute inset-0 bg-[var(--Dimer_Black)]" />
        </div>
      )}

      <div className="relative flex w-full flex-col items-center gap-x5">
        {status === 'idle' && (
          <>
            <div className="flex h-[108px] flex-col items-center justify-center gap-x1">
              <Icon icon={Upload} size="large" />
              <div className="flex flex-col items-center gap-x1 text-center">
                <p className="text-body-1-normal-bold text-text-primary">
                  파일 업로드
                </p>
                <p className="text-label-1-normal-regular text-text-caption">
                  광고를 송출할 파일을 업로드해주세요.
                </p>
              </div>
            </div>
            <Button
              variant="line"
              color="secondary"
              size="medium"
              className="w-full"
              onClick={openFileDialog}
            >
              파일 업로드
            </Button>
          </>
        )}

        {status === 'uploading' && (
          <>
            <div className="flex h-[108px] flex-col items-center justify-center gap-x1">
              <div
                className="flex items-center gap-x3 py-x2"
                aria-hidden="true"
              >
                <span className="size-x3 animate-bounce rounded-full bg-primary-brand-solid" />
                <span className="size-x3 animate-bounce rounded-full bg-primary-brand-solid [animation-delay:150ms]" />
                <span className="size-x3 animate-bounce rounded-full bg-primary-brand-solid [animation-delay:300ms]" />
              </div>
              <div className="flex flex-col items-center gap-x1 text-center">
                <p
                  role="status"
                  className={`text-body-1-normal-bold ${hasPreview ? 'text-text-primary-inverse' : 'text-text-primary'}`}
                >
                  파일을 업로드 중입니다
                </p>
                <p
                  className={`text-label-1-normal-regular ${hasPreview ? 'text-text-primary-inverse' : 'text-text-caption'}`}
                >
                  업로드가 완료되면 알려드리겠습니다. 다음 단계로 이동하세요.
                </p>
              </div>
            </div>
            <Button
              variant="line"
              color="secondary"
              size="medium"
              // 업로드 중 어두운 미리보기 배경 위에서는 '취소' 글씨를 흰색으로
              className={`w-full ${hasPreview ? '!text-text-primary-inverse' : ''}`}
              onClick={onCancel}
            >
              취소
            </Button>
          </>
        )}

        {status === 'success' && (
          <>
            <div className="flex flex-col items-center gap-x1 text-center">
              <Icon
                icon={CircleCheck}
                size={48}
                color="var(--color-text-primary-inverse)"
                fill="var(--color-line-positive)"
              />
              <p
                role="status"
                className="text-body-1-normal-bold text-text-primary-inverse"
              >
                파일 업로드 완료
              </p>
              <p className="text-label-1-normal-regular text-text-primary-inverse">
                다른 파일로 변경하려면 파일을 다시 선택하세요.
              </p>
            </div>
            <Button
              color="secondary"
              size="medium"
              className="w-full"
              onClick={openFileDialog}
            >
              파일 변경
            </Button>
          </>
        )}

        {status === 'error' && (
          <>
            <div className="flex flex-col items-center gap-x1 text-center">
              <Icon
                icon={CircleX}
                size={48}
                color="var(--color-text-primary-inverse)"
                fill="var(--color-line-negative)"
              />
              <p
                role="alert"
                className="text-body-1-normal-bold text-text-primary"
              >
                파일 업로드 실패
              </p>
              <p className="text-label-1-normal-regular text-text-primary">
                파일 업로드에 실패했습니다. 다시 업로드해 주세요.
              </p>
            </div>
            <Button
              variant="line"
              size="medium"
              className="w-full"
              onClick={openFileDialog}
            >
              파일 업로드
            </Button>
          </>
        )}
      </div>
    </div>
  )
}
