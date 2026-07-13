import { useEffect, useId, useRef } from 'react'
import { createPortal } from 'react-dom'
import type {
  HTMLAttributes,
  KeyboardEvent as ReactKeyboardEvent,
  ReactNode,
} from 'react'
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

// 열린 모달 스택 — 최상단 모달만 ESC를 처리하고, 마지막 모달이 닫힐 때만 스크롤 잠금을 해제
const modalStack: symbol[] = []
let bodyOverflowBackup = ''

const FOCUSABLE_SELECTOR =
  'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'

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
  const panelRef = useRef<HTMLDivElement>(null)

  // 열려 있는 동안: 모달 스택 등록 + 최상단만 ESC 닫기 + 배경 스크롤 잠금(중첩 안전)
  useEffect(() => {
    if (!open) return
    const stackId = Symbol('modal')
    modalStack.push(stackId)
    if (modalStack.length === 1) {
      bodyOverflowBackup = document.body.style.overflow
      document.body.style.overflow = 'hidden'
    }
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && modalStack[modalStack.length - 1] === stackId) {
        onClose?.()
      }
    }
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('keydown', onKeyDown)
      modalStack.splice(modalStack.indexOf(stackId), 1)
      if (modalStack.length === 0) {
        document.body.style.overflow = bodyOverflowBackup
      }
    }
  }, [open, onClose])

  // 열릴 때 모달 안으로 포커스 이동, 닫힐 때 원래 요소로 복원
  useEffect(() => {
    if (!open) return
    const previousActive = document.activeElement as HTMLElement | null
    const focusables =
      panelRef.current?.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)
    focusables?.[0]?.focus()
    return () => previousActive?.focus?.()
  }, [open])

  if (!open) return null

  // Tab/Shift+Tab을 모달 내부에서 순환시키는 포커스 트랩
  const handlePanelKeyDown = (e: ReactKeyboardEvent) => {
    if (e.key !== 'Tab' || !panelRef.current) return
    const focusables = [
      ...panelRef.current.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR),
    ].filter((el) => !el.hasAttribute('disabled'))
    if (focusables.length === 0) return
    const first = focusables[0]
    const last = focusables[focusables.length - 1]
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault()
      last.focus()
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault()
      first.focus()
    }
  }

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-[var(--cool-neutral-1000)]/40"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose?.()
      }}
    >
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={body ? bodyId : undefined}
        onKeyDown={handlePanelKeyDown}
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
