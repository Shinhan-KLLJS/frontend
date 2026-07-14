import { TEAM_ROLE_LABEL } from '@/lib/team'
import type { TeamMember } from '@/lib/team'

export interface TeamMemberRowProps {
  member: TeamMember
  /** 내 행 여부 — Me 배지 표시 + 행 조작 메뉴 숨김 */
  isMe: boolean
}

/** 팀원 1행 — 아바타 · 이름 · 역할 태그(·Me 배지) · 이메일 (Figma List, 높이 86) */
export default function TeamMemberRow({ member, isMe }: TeamMemberRowProps) {
  return (
    <div className="flex h-[86px] items-center gap-x3 border-b border-line-secondary bg-bg-secondary p-x5 last:border-b-0">
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

      {/* 우측 24px 자리 — 내 행은 빈 스페이서(Figma lucide/empty20), 타 행 케밥 메뉴는 권한 관리 서브태스크에서 */}
      <span aria-hidden="true" className="size-[24px] shrink-0" />
    </div>
  )
}
