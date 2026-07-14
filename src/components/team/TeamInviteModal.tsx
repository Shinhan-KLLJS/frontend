import { useEffect, useId, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import type { FormEvent, KeyboardEvent as ReactKeyboardEvent } from 'react'
import { ChevronDown, ChevronUp, Copy, Link, X } from 'lucide-react'
import {
  Button,
  DropdownMenu,
  Icon,
  InputField,
  ScrollArea,
  useToast,
} from '@/components/ui'
import { TEAM_ROLE_LABEL, inviteEmailSchema } from '@/lib/team'
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

/** 초대로 부여 가능한 역할 — Owner는 권한 이전 전용이라 제외 */
const INVITE_ROLES = ['ADMIN', 'MEMBER'] as const

const FOCUSABLE_SELECTOR =
  'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'

/**
 * 팀원 초대 모달 — 팀 코드 복사 + 이메일 초대 큐(권한 지정) + 팀 코드 전송 (Figma Team_Invite).
 * ui/Modal은 334px 확인 다이얼로그 전용(children 미지원)이라 폼형 모달을 전용 구현.
 * 포커스 트랩·ESC·스크롤 잠금은 Modal.tsx 패턴을 따르되, modalStack이 Modal.tsx 모듈
 * 비공개이고 이 화면에서 두 모달이 동시에 열리는 경로가 없어 독립 동작으로 충분하다
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

  const [input, setInput] = useState('')
  const [inputError, setInputError] = useState<string | null>(null)
  const [entries, setEntries] = useState<InviteEntry[]>([])

  // 전송 중에는 ESC/백드롭/X로 닫히지 않도록 가드 — 최신 값을 ESC 리스너에서 참조
  const sendingRef = useRef(sending)
  sendingRef.current = sending
  const onCloseRef = useRef(onClose)
  onCloseRef.current = onClose

  // 재오픈 시 이전 큐가 남지 않도록 열릴 때 내부 상태 초기화
  useEffect(() => {
    if (!open) return
    setInput('')
    setInputError(null)
    setEntries([])
  }, [open])

  // 열려 있는 동안: ESC 닫기 + 배경 스크롤 잠금 (Modal.tsx 패턴)
  useEffect(() => {
    if (!open) return
    const overflowBackup = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !sendingRef.current) onCloseRef.current()
    }
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('keydown', onKeyDown)
      document.body.style.overflow = overflowBackup
    }
  }, [open])

  // 열릴 때 모달 안으로 포커스 이동, 닫힐 때 원래 요소로 복원 (Modal.tsx 패턴)
  useEffect(() => {
    if (!open) return
    const previousActive = document.activeElement as HTMLElement | null
    const focusables =
      panelRef.current?.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)
    focusables?.[0]?.focus()
    return () => previousActive?.focus?.()
  }, [open])

  if (!open) return null

  // Tab/Shift+Tab을 모달 내부에서 순환시키는 포커스 트랩 (Modal.tsx 패턴)
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

  const canAdd = inviteEmailSchema.safeParse(input).success

  // '추가' — 형식은 버튼 활성화로 걸렀고, 중복(큐/기존 팀원)은 목록 컨텍스트가 필요해 여기서 검사
  const handleAdd = (e: FormEvent) => {
    e.preventDefault()
    const parsed = inviteEmailSchema.safeParse(input)
    if (!parsed.success) return
    const email = parsed.data
    const normalized = email.toLowerCase()
    if (entries.some((entry) => entry.email.toLowerCase() === normalized)) {
      setInputError('이미 추가된 이메일입니다.')
      return
    }
    if (memberEmails.some((member) => member.toLowerCase() === normalized)) {
      setInputError('이미 팀에 속한 멤버입니다.')
      return
    }
    setEntries((prev) => [...prev, { email, role: 'MEMBER' }])
    setInput('')
    setInputError(null)
  }

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(teamCode)
      toast('팀 코드가 복사되었습니다.', { status: 'success' })
    } catch {
      toast('팀 코드 복사에 실패했습니다.', { status: 'error' })
    }
  }

  const setEntryRole = (email: string, role: InviteEntry['role']) => {
    setEntries((prev) =>
      prev.map((entry) => (entry.email === email ? { ...entry, role } : entry)),
    )
  }

  const removeEntry = (email: string) => {
    setEntries((prev) => prev.filter((entry) => entry.email !== email))
  }

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-[var(--cool-neutral-1000)]/40"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget && !sending) onClose()
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

        {/* 헤더 — 제목 + 안내 문구 */}
        <div className="flex flex-col gap-x2 text-center">
          <h2 id={titleId} className="text-title-3-bold text-text-primary">
            팀원 초대하기
          </h2>
          <p id={bodyId} className="text-body-1-normal-regular text-text-primary">
            팀원을 초대해 옥외광고 분석 결과를 함께 관리하세요.
          </p>
        </div>

        {/* 팀 코드 — 읽기 전용 표시 + 클립보드 복사 */}
        <div className="flex flex-col gap-x2">
          <span className="text-label-1-normal-bold text-text-secondary">
            팀 코드
          </span>
          <div className="flex items-center gap-x1 rounded-x3 border border-line-secondary bg-bg-secondary px-x4 py-x3">
            <Icon icon={Link} size="large" color="primary" />
            <span className="min-w-0 flex-1 truncate px-x1 text-body-1-normal-regular text-text-primary">
              {teamCode}
            </span>
            <button
              type="button"
              aria-label="팀 코드 복사"
              onClick={handleCopyCode}
              className="cursor-pointer rounded-x1 text-text-primary interaction-normal"
            >
              <Icon icon={Copy} size="large" />
            </button>
          </div>
        </div>

        {/* 초대 큐 — 이메일 추가 + 권한 지정 목록 (Figma Invite 박스, 높이 340 고정) */}
        <div className="flex h-[340px] flex-col gap-x4 rounded-[20px] border border-line-tertiary bg-bg-primary px-x5 pt-x5 pb-x1">
          <form className="flex items-start gap-x2" onSubmit={handleAdd}>
            <InputField
              placeholder="초대할 팀원의 이메일을 입력하세요"
              value={input}
              onChange={(e) => {
                setInput(e.target.value)
                setInputError(null)
              }}
              errorMessage={inputError ?? undefined}
              aria-label="초대할 팀원 이메일"
            />
            <Button type="submit" disabled={!canAdd} className="shrink-0">
              추가
            </Button>
          </form>

          <div className="flex min-h-0 flex-1 flex-col gap-x2">
            <p className="flex items-center gap-x1 text-label-1-normal-medium text-text-primary">
              초대 인원
              <span className="text-label-1-normal-bold text-text-brand">
                {entries.length}명
              </span>
            </p>
            <ScrollArea size="small" className="min-h-0 flex-1">
              <ul className="flex flex-col gap-x2">
                {entries.map((entry) => (
                  <li
                    key={entry.email}
                    className="flex items-center gap-x1 rounded-x3 border border-line-secondary bg-bg-secondary px-x4 py-x3"
                  >
                    <span className="min-w-0 flex-1 truncate px-x1 text-body-1-normal-regular text-text-primary">
                      {entry.email}
                    </span>
                    <DropdownMenu
                      triggerAriaLabel={`${entry.email} 권한 변경`}
                      items={INVITE_ROLES.map((role) => ({
                        key: role,
                        label: TEAM_ROLE_LABEL[role],
                        onSelect: () => setEntryRole(entry.email, role),
                      }))}
                      renderTrigger={(menuOpen) => (
                        <span className="flex items-center gap-x1 px-x2 py-[6px] text-label-1-normal-regular text-text-secondary">
                          {TEAM_ROLE_LABEL[entry.role]}
                          <Icon
                            icon={menuOpen ? ChevronUp : ChevronDown}
                            size="small"
                          />
                        </span>
                      )}
                    />
                    <button
                      type="button"
                      aria-label={`${entry.email} 초대 제거`}
                      onClick={() => removeEntry(entry.email)}
                      className="cursor-pointer rounded-x1 text-text-primary interaction-normal"
                    >
                      <Icon icon={X} size="large" />
                    </button>
                  </li>
                ))}
              </ul>
            </ScrollArea>
          </div>
        </div>

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
