import { useEffect, useState } from 'react'
import { Navigate } from 'react-router-dom'
import { Plus } from 'lucide-react'
import TeamMemberList from '@/components/team/TeamMemberList'
import { Button, SearchBar, useToast } from '@/components/ui'
import { useAuth } from '@/lib/auth'
import { fetchTeam, fetchTeamMembers } from '@/lib/team'
import type { Team, TeamMember } from '@/lib/team'

/**
 * 팀 관리 — 팀원 리스트 · 초대 · 권한 관리 · 팀 나가기 (Figma DV-64 팀 리스트).
 * 멤버 목록·모달 상태는 전부 이 페이지가 소유하고 하위 컴포넌트는 프레젠테이션만 담당한다
 */
export default function TeamPage() {
  const { user } = useAuth()
  const { toast } = useToast()

  const teamId = user?.teamId ?? null

  const [team, setTeam] = useState<Team | null>(null)
  const [members, setMembers] = useState<TeamMember[]>([])
  const [loading, setLoading] = useState(true)
  const [query, setQuery] = useState('')

  useEffect(() => {
    if (teamId == null) return
    let active = true
    Promise.all([fetchTeam(teamId), fetchTeamMembers(teamId)])
      .then(([teamData, memberData]) => {
        if (!active) return
        setTeam(teamData)
        setMembers(memberData)
      })
      .catch(() => {
        if (active) toast('팀 정보를 불러오지 못했습니다.', { status: 'error' })
      })
      .finally(() => {
        if (active) setLoading(false)
      })
    return () => {
      active = false
    }
  }, [teamId, toast])

  // 검색 — 행에 이메일이 함께 노출되는 리스트라 이름+이메일 부분 일치로 필터
  const keyword = query.trim().toLowerCase()
  const filtered = keyword
    ? members.filter(
        (member) =>
          member.name.toLowerCase().includes(keyword) ||
          member.email.toLowerCase().includes(keyword),
      )
    : members

  // 소속 팀이 없으면 팀 생성/합류 분기점으로 (딥링크 방어)
  if (user && !user.hasTeam) return <Navigate to="/welcome" replace />

  return (
    // p-x5: Figma Content 패딩 (AppShell은 패딩이 없어 페이지가 소유). pb-[80px]: 최하단 여백 (Figma 가이드)
    <section className="flex min-h-full flex-col p-x5 pb-[80px]">
      {/* Leading — 팀명 + 액션 버튼 (Figma 패딩 좌우 40 · 상하 20) */}
      <header className="flex items-center justify-between gap-x5 px-x10 py-x5">
        <h1 className="min-w-0 truncate text-title-2-medium text-text-primary">
          {team?.name ?? ''}
        </h1>
        <div className="flex shrink-0 items-center gap-[6px]">
          <Button variant="line" color="secondary">
            팀 나가기
          </Button>
          <Button leadingIcon={Plus}>팀원 초대</Button>
        </div>
      </header>

      {/* Tariling — 검색 + 팀원 리스트 (Figma 패딩 좌우 40 · 상하 20) */}
      <div className="flex flex-1 flex-col gap-x5 px-x10 py-x5">
        <SearchBar
          value={query}
          onChange={setQuery}
          placeholder="팀원 이름을 검색하세요"
          className="w-[307px]"
          aria-label="팀원 검색"
        />

        <TeamMemberList
          members={filtered}
          meUserId={user?.id ?? null}
          loading={loading}
        />
      </div>
    </section>
  )
}
