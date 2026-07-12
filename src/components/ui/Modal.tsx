import { useEffect, useId } from 'react'
import { createPortal } from 'react-dom'
import type { HTMLAttributes, ReactNode } from 'react'
import Button from './Button'

export interface ModalProps extends Omit<
  HTMLAttributes<HTMLDivElement>,
  'title'
> {
  open: boolean
  title: ReactNode
  body?: ReactNode
  cancelText?: string
  confirmText?: string
  onClose?: () => void
  onConfirm?: () => void
}

/* ── Modal ── */
export default function Modal({
  open,
  title,
  body,
  cancelText = '아니요',
  confirmText = '네',
  onClose,
  onConfirm,
  className,
  ...props
}: ModalProps) {
  const titleId = useId()
  const bodyId = useId()

  // 열려 있는 동안 ESC로 닫기 + 배경 스크롤 잠금
  useEffect(() => {
    if (!open) return
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose?.()
    }
    document.addEventListener('keydown', onKeyDown)
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKeyDown)
      document.body.style.overflow = prevOverflow
    }
  }, [open, onClose])

  if (!open) return null

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-[var(--cool-neutral-1000)]/40"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose?.()
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={body ? bodyId : undefined}
        className={[
          'font-sans flex w-[334px] flex-col items-center gap-x5 rounded-2xl bg-bg-secondary px-x5 py-x8 shadow-normal-medium',
          className,
        ]
          .filter(Boolean)
          .join(' ')}
        {...props}
      >
        <div className="flex w-full flex-col gap-x1 text-center">
          <h2 id={titleId} className="text-headline-1-bold text-text-primary">
            {title}
          </h2>
          {body && (
            <p
              id={bodyId}
              className="text-body-2-normal-regular text-text-primary"
            >
              {body}
            </p>
          )}
        </div>
        <div className="flex w-full gap-x2">
          <Button
            variant="line"
            color="secondary"
            size="large"
            className="flex-1"
            onClick={onClose}
          >
            {cancelText}
          </Button>
          <Button size="large" className="flex-1" onClick={onConfirm}>
            {confirmText}
          </Button>
        </div>
      </div>
    </div>,
    document.body,
  )
}
