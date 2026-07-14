import { useEffect, useState } from 'react'
import { Navigate } from 'react-router-dom'
import { Plus } from 'lucide-react'
import TeamInviteModal from '@/components/team/TeamInviteModal'
import TeamMemberList from '@/components/team/TeamMemberList'
import { Button, Modal, SearchBar, useToast } from '@/components/ui'
import { useAuth } from '@/lib/auth'
import {
  fetchTeam,
  fetchTeamMembers,
  removeMember,
  sendTeamInvites,
  transferOwnership,
  updateMemberRole,
} from '@/lib/team'
import type { InviteEntry, Team, TeamMember, TeamRole } from '@/lib/team'

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
  const [inviteOpen, setInviteOpen] = useState(false)
  const [inviteSending, setInviteSending] = useState(false)
  // null이 아니면 Owner 권한 이전 확인 모달이 열린 상태 (open 불리언 겸용)
  const [transferTarget, setTransferTarget] = useState<TeamMember | null>(null)

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

  // 초대 전송 — 성공 시에만 모달을 닫아 실패 시 큐를 유지한 채 재시도 가능하게 한다
  const handleSendInvites = async (entries: InviteEntry[]) => {
    if (teamId == null) return
    setInviteSending(true)
    try {
      await sendTeamInvites(teamId, entries)
      toast('팀 코드를 전송했습니다.', { status: 'success' })
      setInviteOpen(false)
    } catch {
      toast('팀 코드 전송에 실패했습니다. 다시 시도하세요.', {
        status: 'error',
      })
    } finally {
      setInviteSending(false)
    }
  }

  // 역할 변경 — Owner 부여는 확인 모달을 거치는 권한 이전 플로우로 분기
  const handleSelectRole = (member: TeamMember, role: TeamRole) => {
    if (member.role === role) return // 같은 역할 재선택은 무동작
    if (role === 'OWNER') {
      setTransferTarget(member)
      return
    }
    void changeMemberRole(member, role)
  }

  const changeMemberRole = async (
    member: TeamMember,
    role: Exclude<TeamRole, 'OWNER'>,
  ) => {
    if (teamId == null) return
    try {
      await updateMemberRole(teamId, member.id, role)
      setMembers((prev) =>
        prev.map((m) => (m.id === member.id ? { ...m, role } : m)),
      )
    } catch {
      toast('권한 변경에 실패했습니다. 다시 시도하세요.', { status: 'error' })
    }
  }

  // Owner 권한 이전 — 대상은 OWNER, 기존 소유자는 ADMIN이 되는 서버 원자 처리를 프론트 상태에 동일 반영
  const handleTransferOwnership = async () => {
    const target = transferTarget
    setTransferTarget(null) // ui/Modal은 확인 즉시 닫힘(로딩 미지원) — 결과는 목록 갱신/토스트로 안내
    if (teamId == null || !target) return
    try {
      await transferOwnership(teamId, target.id)
      setMembers((prev) =>
        prev.map((m) =>
          m.id === target.id
            ? { ...m, role: 'OWNER' }
            : m.role === 'OWNER'
              ? { ...m, role: 'ADMIN' }
              : m,
        ),
      )
    } catch {
      toast('Owner 권한 이전에 실패했습니다. 다시 시도하세요.', {
        status: 'error',
      })
    }
  }

  // 팀원 삭제 — 디자인에 확인 모달 스펙이 없어 즉시 실행하고 실패만 토스트로 알린다
  const handleRemoveMember = async (member: TeamMember) => {
    if (teamId == null) return
    try {
      await removeMember(teamId, member.id)
      setMembers((prev) => prev.filter((m) => m.id !== member.id))
    } catch {
      toast('팀원 삭제에 실패했습니다. 다시 시도하세요.', { status: 'error' })
    }
  }

  // 검색 — 행에 이메일이 함께 노출되는 리스트라 이름+이메일 부분 일치로 필터
  const keyword = query.trim().toLowerCase()
  const filtered = keyword
    ? members.filter(
        (member) =>
          member.name.toLowerCase().includes(keyword) ||
          member.email.toLowerCase().includes(keyword),
      )
    : members

  // 내 역할 — 목록에서 파생해 Owner 이전 직후에도 메뉴 활성화가 자동 갱신된다.
  // 목록에 내가 없으면 안전하게 MEMBER(전부 비활성) 취급
  const me = members.find((member) => member.userId === user?.id) ?? null
  const myRole: TeamRole = me?.role ?? 'MEMBER'

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
          {/* 팀 코드가 필요하므로 팀 정보 로드 전에는 비활성 */}
          <Button
            leadingIcon={Plus}
            disabled={!team}
            onClick={() => setInviteOpen(true)}
          >
            팀원 초대
          </Button>
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
          myRole={myRole}
          loading={loading}
          onSelectRole={handleSelectRole}
          onRemoveMember={handleRemoveMember}
        />
      </div>

      {/* Owner 권한 이전 확인 — 문구·버튼(아니요/네)은 Figma DV-64 스펙 그대로 */}
      <Modal
        open={transferTarget !== null}
        title="Owner 권한을 이전하시겠습니까?"
        body="Owner 권한은 한 명만 가질 수 있습니다. 권한을 이전하면 기존 소유자는 Admin으로 변경됩니다."
        onClose={() => setTransferTarget(null)}
        onConfirm={handleTransferOwnership}
      />

      <TeamInviteModal
        open={inviteOpen}
        teamCode={team?.code ?? ''}
        memberEmails={members.map((member) => member.email)}
        sending={inviteSending}
        onClose={() => setInviteOpen(false)}
        onSend={handleSendInvites}
      />
    </section>
  )
}
