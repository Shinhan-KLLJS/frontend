import TeamMemberRow from '@/components/team/TeamMemberRow'
import type { TeamMember, TeamRole } from '@/lib/team'

export interface TeamMemberListProps {
  members: TeamMember[]
  /** 로그인 유저 id — 내 행(Me 배지) 판별 */
  meUserId: number | null
  /** 로그인 유저의 팀 내 역할 — 행 관리 메뉴 활성화 기준 */
  myRole: TeamRole
  loading?: boolean
  onSelectRole: (member: TeamMember, role: TeamRole) => void
  onRemoveMember: (member: TeamMember) => void
  className?: string
}

/** 팀원 리스트 카드 — 행 매핑 + 로딩/빈 검색 결과 상태 (Figma Table) */
export default function TeamMemberList({
  members,
  meUserId,
  myRole,
  loading = false,
  onSelectRole,
  onRemoveMember,
  className,
}: TeamMemberListProps) {
  return (
    <div
      className={[
        'w-full overflow-clip rounded-x3 border border-line-secondary',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      {loading ? (
        <div
          role="status"
          aria-label="팀원 목록 불러오는 중"
          className="flex h-[86px] items-center justify-center gap-x2 bg-bg-secondary"
        >
          <span className="size-x3 animate-bounce rounded-full bg-primary-brand-solid" />
          <span className="size-x3 animate-bounce rounded-full bg-primary-brand-solid [animation-delay:150ms]" />
          <span className="size-x3 animate-bounce rounded-full bg-primary-brand-solid [animation-delay:300ms]" />
        </div>
      ) : members.length === 0 ? (
        <p className="flex h-[86px] items-center justify-center bg-bg-secondary text-label-1-normal-regular text-text-caption">
          검색 결과가 없습니다.
        </p>
      ) : (
        members.map((member) => (
          <TeamMemberRow
            key={member.id}
            member={member}
            isMe={member.userId === meUserId}
            myRole={myRole}
            onSelectRole={(role) => onSelectRole(member, role)}
            onRemove={() => onRemoveMember(member)}
          />
        ))
      )}
    </div>
  )
}
