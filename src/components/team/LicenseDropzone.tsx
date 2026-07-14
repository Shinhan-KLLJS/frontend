import { useRef, useState } from 'react'
import type { DragEvent } from 'react'
import { CircleCheck, CircleX, FilePlus2 } from 'lucide-react'
import { Button, Icon } from '@/components/ui'

export const UPLOAD_STATUS = ['idle', 'uploading', 'success', 'error'] as const
export type UploadStatus = (typeof UPLOAD_STATUS)[number]

export interface LicenseDropzoneProps {
  status: UploadStatus
  onFileSelect: (file: File) => void
}

/**
 * 사업자등록증 업로드 드롭존 — 드래그&드롭 + 파일 선택, 상태(idle/uploading/success/error)별 안내 표시
 */
export default function LicenseDropzone({
  status,
  onFileSelect,
}: LicenseDropzoneProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [isDragging, setIsDragging] = useState(false)

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
        'flex size-full flex-col items-center justify-center gap-x4 rounded-x5 border-2 border-line-brand p-x5 transition-colors',
        isDragging ? 'bg-primary-brand-weak' : 'bg-bg-secondary',
      ].join(' ')}
    >
      <input
        ref={inputRef}
        type="file"
        accept="image/*,application/pdf"
        className="sr-only"
        aria-label="사업자등록증 파일 선택"
        onChange={(e) => {
          const file = e.target.files?.[0]
          if (file) onFileSelect(file)
          // 같은 파일 재선택도 onChange가 발생하도록 초기화
          e.target.value = ''
        }}
      />

      {status === 'idle' && (
        <>
          <Icon icon={FilePlus2} size={48} color="brand" strokeWidth={1.2} />
          <p className="text-center text-label-1-normal-regular text-text-secondary">
            사업자등록증을 끌어다 놓거나 파일을 선택하세요.
            <br />
            또는
          </p>
          <Button
            variant="line"
            color="secondary"
            size="medium"
            className="w-full"
            onClick={openFileDialog}
          >
            파일 선택하기
          </Button>
        </>
      )}

      {status === 'uploading' && (
        <>
          <div className="flex items-center gap-x2" aria-hidden="true">
            <span className="size-x3 animate-bounce rounded-full bg-primary-brand-solid" />
            <span className="size-x3 animate-bounce rounded-full bg-primary-brand-solid [animation-delay:150ms]" />
            <span className="size-x3 animate-bounce rounded-full bg-primary-brand-solid [animation-delay:300ms]" />
          </div>
          <div className="flex flex-col items-center gap-x1 text-center">
            <p role="status" className="text-headline-2-bold text-text-primary">
              사업자등록증 인증 중
            </p>
          </div>
        </>
      )}

      {status === 'success' && (
        <>
          <Icon
            icon={CircleCheck}
            size={48}
            color="var(--color-text-primary-inverse)"
            fill="var(--color-line-positive)"
          />
          <div className="flex flex-col items-center gap-x1 text-center">
            <p role="status" className="text-headline-2-bold text-text-primary">
              사업자등록증 인증 완료
            </p>
            <p className="text-label-1-normal-regular text-text-secondary">
              사업자등록증 정보가 확인되었습니다.
            </p>
          </div>
          <Button
            variant="line"
            color="secondary"
            size="medium"
            className="w-full"
            onClick={openFileDialog}
          >
            다른 파일 업로드하기
          </Button>
        </>
      )}

      {status === 'error' && (
        <>
          <Icon
            icon={CircleX}
            size={48}
            color="var(--color-text-primary-inverse)"
            fill="var(--color-line-negative)"
          />
          <div className="flex flex-col items-center gap-x1 text-center">
            <p role="alert" className="text-headline-2-bold text-text-primary">
              사업자등록증 업로드 실패
            </p>
            <p className="text-label-1-normal-regular text-text-secondary">
              사업자등록증을 업로드하지 못했습니다.
              <br />
              잠시 후 다시 시도해 주세요.
            </p>
          </div>
          <Button
            variant="line"
            color="secondary"
            size="medium"
            className="w-full"
            onClick={openFileDialog}
          >
            다시 업로드하기
          </Button>
        </>
      )}
    </div>
  )
}
