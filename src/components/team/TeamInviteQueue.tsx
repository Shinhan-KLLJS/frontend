import type { FormEvent } from 'react'
import { ChevronDown, ChevronUp, X } from 'lucide-react'
import {
  Button,
  DropdownMenu,
  Icon,
  InputField,
  ScrollArea,
} from '@/components/ui'
import { TEAM_ROLE_LABEL } from '@/lib/team'
import type { InviteEntry } from '@/lib/team'

const INVITE_ROLES = ['ADMIN', 'MEMBER'] as const

interface TeamInviteQueueProps {
  input: string
  inputError: string | null
  entries: InviteEntry[]
  canAdd: boolean
  onInputChange: (value: string) => void
  onAdd: (event: FormEvent) => void
  onRoleChange: (email: string, role: InviteEntry['role']) => void
  onRemove: (email: string) => void
}

/** 이메일 초대 큐 — 입력 검증 결과와 역할 선택 목록을 렌더링한다. */
export default function TeamInviteQueue({
  input,
  inputError,
  entries,
  canAdd,
  onInputChange,
  onAdd,
  onRoleChange,
  onRemove,
}: TeamInviteQueueProps) {
  return (
    <div className="flex h-[340px] flex-col gap-x4 rounded-[20px] border border-line-tertiary bg-bg-primary px-x5 pt-x5 pb-x1">
      <form className="flex items-start gap-x2" onSubmit={onAdd}>
        <InputField
          placeholder="초대할 팀원의 이메일을 입력하세요"
          value={input}
          onChange={(event) => onInputChange(event.target.value)}
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
                    onSelect: () => onRoleChange(entry.email, role),
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
                  onClick={() => onRemove(entry.email)}
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
  )
}
