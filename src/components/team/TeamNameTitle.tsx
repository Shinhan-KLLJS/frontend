import { useRef, useState } from 'react'
import type { FocusEvent, KeyboardEvent } from 'react'
import { SquarePen } from 'lucide-react'
import { Icon } from '@/components/ui'

export interface TeamNameTitleProps {
  name: string
  /** 편집 확정 시에만 호출 — 빈 값/무변경은 컴포넌트가 걸러 원복한다 */
  onSave: (name: string) => void
  /** 편집(펜) 노출 여부 — OWNER/ADMIN만 true. MEMBER는 서버가 403이라 펜을 숨긴다. 기본 true */
  canEdit?: boolean
}

/**
 * 팀명 타이틀 + 인라인 편집 (Figma Title + square-pen).
 * 디자인에 편집 상태 스펙이 없어 최소 구현: 펜 클릭 → 같은 자리 input 전환,
 * Enter/blur 저장 · Esc 취소
 */
export default function TeamNameTitle({
  name,
  onSave,
  canEdit = true,
}: TeamNameTitleProps) {
  const [editing, setEditing] = useState(false)
  // 저장 경로를 blur 하나로 고정해 Enter→blur 이중 저장을 막고, Esc는 플래그로 저장만 건너뜀
  const cancelledRef = useRef(false)

  const handleBlur = (e: FocusEvent<HTMLInputElement>) => {
    const next = e.currentTarget.value.trim()
    setEditing(false)
    if (cancelledRef.current) {
      cancelledRef.current = false
      return
    }
    if (!next || next === name) return // 빈 값/무변경은 저장하지 않고 원복
    onSave(next)
  }

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.currentTarget.blur()
    } else if (e.key === 'Escape') {
      cancelledRef.current = true
      e.currentTarget.blur()
    }
  }

  if (editing && canEdit) {
    return (
      <input
        defaultValue={name}
        autoFocus
        aria-label="팀명 편집"
        onFocus={(e) => e.currentTarget.select()}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        className="w-full min-w-0 border-b border-line-brand bg-transparent text-title-2-medium text-text-primary outline-none"
      />
    )
  }

  return (
    <div className="flex min-w-0 items-center gap-[6px]">
      <h1 className="min-w-0 truncate text-title-2-medium text-text-primary">
        {name}
      </h1>
      {canEdit && (
        <button
          type="button"
          aria-label="팀명 편집"
          onClick={() => setEditing(true)}
          className="shrink-0 cursor-pointer rounded-x1 p-x1 text-text-primary interaction-normal"
        >
          <Icon icon={SquarePen} size="small" />
        </button>
      )}
    </div>
  )
}
