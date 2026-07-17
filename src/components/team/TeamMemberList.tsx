import TeamMemberRow from '@/components/team/TeamMemberRow'
import type { TeamMember, TeamRole } from '@/lib/team'

export interface TeamMemberListProps {
  members: TeamMember[]
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
  myRole,
  loading = false,
  onSelectRole,
  onRemoveMember,
  className,
}: TeamMemberListProps) {
  return (
    <div
      className={[
        // overflow-clip 대신 행 자체에 모서리 라운드 — clip은 마지막 행의 케밥 메뉴(아래로 열림)를 잘라 클릭 불가로 만든다
        'w-full rounded-x3 border border-line-secondary',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      {loading ? (
        <div
          role="status"
          aria-label="팀원 목록 불러오는 중"
          className="flex h-[86px] items-center justify-center gap-x2 rounded-x3 bg-bg-secondary"
        >
          <span className="size-x3 animate-bounce rounded-full bg-primary-brand-solid" />
          <span className="size-x3 animate-bounce rounded-full bg-primary-brand-solid [animation-delay:150ms]" />
          <span className="size-x3 animate-bounce rounded-full bg-primary-brand-solid [animation-delay:300ms]" />
        </div>
      ) : members.length === 0 ? (
        <p className="flex h-[86px] items-center justify-center rounded-x3 bg-bg-secondary text-label-1-normal-regular text-text-caption">
          검색 결과가 없습니다.
        </p>
      ) : (
        members.map((member) => (
          <TeamMemberRow
            key={member.userId}
            member={member}
            isMe={member.isMe}
            myRole={myRole}
            onSelectRole={(role) => onSelectRole(member, role)}
            onRemove={() => onRemoveMember(member)}
          />
        ))
      )}
    </div>
  )
}
