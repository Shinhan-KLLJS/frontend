import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useToast } from '@/components/ui'
import {
  fetchTeamMembers,
  issueInviteCode,
  leaveTeam,
  removeMember,
  sendTeamInvites,
  updateMemberRole,
  updateTeamName,
} from '@/lib/team'
import type {
  InviteEntry,
  Team,
  TeamMember,
  TeamRole,
  UpdatedMemberRole,
} from '@/lib/team'

interface UseTeamManagementParams {
  teamId: number | null
}

/** 팀 관리 화면의 조회·변경 상태를 한 곳에서 관리한다. */
export function useTeamManagement({ teamId }: UseTeamManagementParams) {
  const { toast } = useToast()
  const navigate = useNavigate()
  const [team, setTeam] = useState<Team | null>(null)
  const [members, setMembers] = useState<TeamMember[]>([])
  const [loading, setLoading] = useState(true)
  const [query, setQuery] = useState('')
  const [inviteOpen, setInviteOpen] = useState(false)
  const [inviteCode, setInviteCode] = useState('')
  const [inviteSending, setInviteSending] = useState(false)
  const [transferTarget, setTransferTarget] = useState<TeamMember | null>(null)
  const [leaveOpen, setLeaveOpen] = useState(false)

  useEffect(() => {
    if (teamId == null) return
    let active = true
    fetchTeamMembers(teamId)
      .then((data) => {
        if (!active) return
        setTeam({ id: data.teamId, name: data.teamName })
        setMembers(data.members)
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

  // 권한 변경/이전 응답(updatedMembers[])을 상태에 반영 — 이전 시 강등된 기존 Owner도 함께 갱신된다.
  const applyRoleUpdates = (updates: UpdatedMemberRole[]) => {
    const roleByUser = new Map(updates.map((u) => [u.userId, u.role]))
    setMembers((prev) =>
      prev.map((member) => {
        const nextRole = roleByUser.get(member.userId)
        return nextRole ? { ...member, role: nextRole } : member
      }),
    )
  }

  const changeMemberRole = async (
    member: TeamMember,
    role: Exclude<TeamRole, 'OWNER'>,
  ) => {
    if (teamId == null) return
    try {
      const updated = await updateMemberRole(teamId, member.userId, role)
      applyRoleUpdates(updated)
    } catch {
      toast('권한 변경에 실패했습니다. 다시 시도하세요.', { status: 'error' })
    }
  }

  // Owner 부여는 일반 역할 변경과 달리 기존 Owner 강등을 동반한다 → 확인 모달을 거친다.
  const handleSelectRole = (member: TeamMember, role: TeamRole) => {
    if (member.role === role) return
    if (role === 'OWNER') {
      setTransferTarget(member)
      return
    }
    void changeMemberRole(member, role)
  }

  const handleOpenInvite = async () => {
    setInviteOpen(true)
    if (teamId == null) return
    try {
      const { code } = await issueInviteCode(teamId)
      setInviteCode(code)
    } catch {
      toast('초대 코드를 불러오지 못했습니다. 다시 시도하세요.', {
        status: 'error',
      })
    }
  }

  const handleSendInvites = async (entries: InviteEntry[]) => {
    if (teamId == null) return
    setInviteSending(true)
    try {
      // sendTeamInvites는 백엔드 미지원(이메일 발송 API 없음)이라 이메일만 넘긴다 — 역할은 서버 미반영.
      await sendTeamInvites(
        teamId,
        entries.map((entry) => entry.email),
      )
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

  const handleTransferOwnership = async () => {
    const target = transferTarget
    setTransferTarget(null)
    if (teamId == null || !target) return
    try {
      const updated = await updateMemberRole(teamId, target.userId, 'OWNER')
      applyRoleUpdates(updated)
    } catch {
      toast('소유자 권한 이전에 실패했습니다. 다시 시도하세요.', {
        status: 'error',
      })
    }
  }

  const handleRemoveMember = async (member: TeamMember) => {
    if (teamId == null) return
    try {
      await removeMember(teamId, member.userId)
      setMembers((prev) => prev.filter((item) => item.userId !== member.userId))
    } catch {
      toast('팀원 삭제에 실패했습니다. 다시 시도하세요.', { status: 'error' })
    }
  }

  // 팀명 변경은 백엔드 미지원 → 로컬 낙관적 반영만 한다(디자인 유지).
  const handleSaveTeamName = async (name: string) => {
    if (teamId == null || !team) return
    const previous = team
    setTeam({ ...team, name })
    try {
      await updateTeamName(teamId, name)
    } catch {
      setTeam(previous)
      toast('팀명 변경에 실패했습니다. 다시 시도하세요.', { status: 'error' })
    }
  }

  const handleLeaveTeam = async () => {
    setLeaveOpen(false)
    if (teamId == null) return
    try {
      await leaveTeam(teamId)
      navigate('/welcome', { replace: true })
    } catch {
      toast('팀 나가기에 실패했습니다. 다시 시도하세요.', { status: 'error' })
    }
  }

  const keyword = query.trim().toLowerCase()
  const filteredMembers = keyword
    ? members.filter(
        (member) =>
          member.name.toLowerCase().includes(keyword) ||
          member.email.toLowerCase().includes(keyword),
      )
    : members
  const myRole: TeamRole =
    members.find((member) => member.isMe)?.role ?? 'MEMBER'

  return {
    team,
    members,
    loading,
    query,
    inviteOpen,
    inviteCode,
    inviteSending,
    transferTarget,
    leaveOpen,
    filteredMembers,
    myRole,
    setQuery,
    setInviteOpen,
    setTransferTarget,
    setLeaveOpen,
    handleOpenInvite,
    handleSendInvites,
    handleSelectRole,
    handleRemoveMember,
    handleSaveTeamName,
    handleTransferOwnership,
    handleLeaveTeam,
  }
}
