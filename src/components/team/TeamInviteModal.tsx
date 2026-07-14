import { useEffect, useId, useRef } from 'react'
import { createPortal } from 'react-dom'
import type { KeyboardEvent as ReactKeyboardEvent } from 'react'
import { X } from 'lucide-react'
import { Button, Icon, useToast } from '@/components/ui'
import TeamInviteCode from '@/components/team/TeamInviteCode'
import TeamInviteQueue from '@/components/team/TeamInviteQueue'
import { useTeamInviteEntries } from '@/hooks/useTeamInviteEntries'
import type { InviteEntry } from '@/lib/team'

export interface TeamInviteModalProps {
  open: boolean
  /** 클립보드 복사 대상 팀 초대 코드 */
  teamCode: string
  /** 이미 팀에 속한 이메일 — 초대 큐 추가 시 1차 차단(서버 검증은 별도) */
  memberEmails: string[]
  /** 전송 중 여부 — 전송 버튼 비활성 + 모달 닫기 가드 */
  sending: boolean
  onClose: () => void
  onSend: (entries: InviteEntry[]) => void
}

const FOCUSABLE_SELECTOR =
  'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'

/**
 * 팀원 초대 모달 — 포커스·스크롤 잠금과 전송 동작을 담당한다.
 * 코드 표시와 초대 큐를 하위 컴포넌트로 분리해 각 UI의 역할을 명확히 한다.
 */
export default function TeamInviteModal({
  open,
  teamCode,
  memberEmails,
  sending,
  onClose,
  onSend,
}: TeamInviteModalProps) {
  const titleId = useId()
  const bodyId = useId()
  const panelRef = useRef<HTMLDivElement>(null)
  const { toast } = useToast()
  const inviteEntries = useTeamInviteEntries({ open, memberEmails })
  const { entries } = inviteEntries

  // 전송 중 ESC/배경 클릭/X 버튼으로 닫히지 않도록 최신 값을 ref에 보관한다.
  const sendingRef = useRef(sending)
  sendingRef.current = sending
  const onCloseRef = useRef(onClose)
  onCloseRef.current = onClose

  useEffect(() => {
    if (!open) return
    const overflowBackup = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && !sendingRef.current) onCloseRef.current()
    }
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('keydown', onKeyDown)
      document.body.style.overflow = overflowBackup
    }
  }, [open])

  useEffect(() => {
    if (!open) return
    const previousActive = document.activeElement as HTMLElement | null
    const focusables =
      panelRef.current?.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)
    focusables?.[0]?.focus()
    return () => previousActive?.focus?.()
  }, [open])

  if (!open) return null

  // Tab/Shift+Tab 키가 모달 밖으로 빠져나가지 않도록 포커스를 순환한다.
  const handlePanelKeyDown = (event: ReactKeyboardEvent) => {
    if (event.key !== 'Tab' || !panelRef.current) return
    const focusables = [
      ...panelRef.current.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR),
    ].filter((element) => !element.hasAttribute('disabled'))
    if (focusables.length === 0) return
    const first = focusables[0]
    const last = focusables[focusables.length - 1]
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault()
      last.focus()
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault()
      first.focus()
    }
  }

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(teamCode)
      toast('팀 코드가 복사되었습니다.', { status: 'success' })
    } catch {
      toast('팀 코드 복사에 실패했습니다.', { status: 'error' })
    }
  }

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-[var(--cool-neutral-1000)]/40"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !sending) onClose()
      }}
    >
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={bodyId}
        onKeyDown={handlePanelKeyDown}
        className="relative flex w-[634px] flex-col gap-x5 rounded-2xl bg-bg-secondary p-x5 font-sans shadow-normal-large"
      >
        <button
          type="button"
          aria-label="초대 모달 닫기"
          disabled={sending}
          onClick={onClose}
          className="absolute top-x5 right-x5 cursor-pointer rounded-x1 text-text-primary interaction-normal disabled:cursor-not-allowed"
        >
          <Icon icon={X} size="large" />
        </button>
        <div className="flex flex-col gap-x2 text-center">
          <h2 id={titleId} className="text-title-3-bold text-text-primary">
            팀원 초대하기
          </h2>
          <p id={bodyId} className="text-body-1-normal-regular text-text-primary">
            팀원을 초대해 옥외광고 분석 결과를 함께 관리하세요.
          </p>
        </div>
        <TeamInviteCode teamCode={teamCode} onCopy={handleCopyCode} />
        <TeamInviteQueue {...inviteEntries} />
        <Button
          className="w-full"
          disabled={entries.length === 0 || sending}
          onClick={() => onSend(entries)}
        >
          팀 코드 전송
        </Button>
      </div>
    </div>,
    document.body,
  )
}
