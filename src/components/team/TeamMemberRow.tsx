import { Ellipsis } from 'lucide-react'
import { DropdownMenu, Icon } from '@/components/ui'
import type { DropdownMenuItem } from '@/components/ui'
import { TEAM_ROLE, TEAM_ROLE_LABEL } from '@/lib/team'
import type { TeamMember, TeamRole } from '@/lib/team'

export interface TeamMemberRowProps {
  member: TeamMember
  /** 내 행 여부 — Me 배지 표시 + 행 조작 메뉴 숨김 */
  isMe: boolean
  /** 로그인 유저의 팀 내 역할 — 메뉴 항목 활성화 기준 */
  myRole: TeamRole
  onSelectRole: (role: TeamRole) => void
  onRemove: () => void
}

// 내 역할별 부여 가능 권한 — Figma DV-64 드롭다운 매트릭스
// (Owner: 전부 · Admin: 'Owner 권한 부여'만 불가 · Member: 전부 불가)
const ASSIGNABLE: Record<TeamRole, readonly TeamRole[]> = {
  OWNER: TEAM_ROLE,
  ADMIN: ['ADMIN', 'MEMBER'],
  MEMBER: [],
}

/** 팀원 1행 — 아바타 · 이름 · 역할 태그(·Me 배지) · 이메일 · 관리 메뉴 (Figma List, 높이 86) */
export default function TeamMemberRow({
  member,
  isMe,
  myRole,
  onSelectRole,
  onRemove,
}: TeamMemberRowProps) {
  // 대상이 Owner인 행은 내가 Owner가 아니면 조작 불가 — 매트릭스에 없는,
  // 하위 권한자가 소유자를 강등/삭제하는 것을 막는 상식 가드
  const canManageTarget = member.role !== 'OWNER' || myRole === 'OWNER'

  const menuItems: DropdownMenuItem[] = [
    ...TEAM_ROLE.map((role) => ({
      key: role,
      label: `${TEAM_ROLE_LABEL[role]} 권한 부여`,
      disabled: !canManageTarget || !ASSIGNABLE[myRole].includes(role),
      onSelect: () => onSelectRole(role),
    })),
    {
      key: 'remove',
      label: '팀원 삭제',
      disabled: !canManageTarget || myRole === 'MEMBER',
      onSelect: onRemove,
    },
  ]

  return (
    <div className="flex h-[86px] items-center gap-x3 border-b border-line-secondary bg-bg-secondary p-x5 first:rounded-t-x3 last:rounded-b-x3 last:border-b-0">
      {/* 아바타 — 이미지가 없으면 이름 첫 글자 이니셜로 대체 */}
      <div className="flex size-[40px] shrink-0 items-center justify-center overflow-hidden rounded-full border border-line-secondary bg-bg-primary">
        {member.profileImageUrl ? (
          <img
            src={member.profileImageUrl}
            alt=""
            className="size-full object-cover"
          />
        ) : (
          <span className="text-label-1-normal-medium text-text-secondary">
            {member.name.charAt(0)}
          </span>
        )}
      </div>

      <div className="flex min-w-0 flex-1 flex-col justify-center gap-x1">
        <div className="flex items-center gap-x2">
          <p className="min-w-0 truncate text-body-1-normal-medium text-text-primary">
            {member.name}
          </p>
          <span className="flex shrink-0 items-center gap-x1">
            {/* 역할 태그 — Figma Badge (cool-neutral/20 = Bg/Primary 토큰) */}
            <span className="rounded-x1 bg-bg-primary px-[6px] py-xs text-caption-1-medium text-text-secondary">
              {TEAM_ROLE_LABEL[member.role]}
            </span>
            {isMe && (
              <span className="rounded-x1 bg-primary-brand-weak px-[6px] py-xs text-caption-1-medium text-text-brand">
                Me
              </span>
            )}
          </span>
        </div>
        <p className="truncate text-label-2-regular text-text-caption">
          {member.email}
        </p>
      </div>

      {/* 내 행은 메뉴 대신 빈 스페이서로 정렬 유지 (Figma lucide/empty20) */}
      {isMe ? (
        <span aria-hidden="true" className="size-[24px] shrink-0" />
      ) : (
        <DropdownMenu
          triggerAriaLabel={`${member.name} 관리 메뉴`}
          triggerClassName="rounded-x1"
          items={menuItems}
          renderTrigger={() => (
            <span className="flex size-[24px] items-center justify-center text-text-primary">
              <Icon icon={Ellipsis} size="large" />
            </span>
          )}
        />
      )}
    </div>
  )
}
