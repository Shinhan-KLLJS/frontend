import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useToast } from '@/components/ui'
import {
  fetchTeam,
  fetchTeamMembers,
  leaveTeam,
  removeMember,
  sendTeamInvites,
  transferOwnership,
  updateMemberRole,
  updateTeamName,
} from '@/lib/team'
import type { InviteEntry, Team, TeamMember, TeamRole } from '@/lib/team'

interface UseTeamManagementParams {
  teamId: number | null
  userId: number | undefined
}

/** 팀 관리 화면의 조회·변경 상태를 한 곳에서 관리한다. */
export function useTeamManagement({
  teamId,
  userId,
}: UseTeamManagementParams) {
  const { toast } = useToast()
  const navigate = useNavigate()
  const [team, setTeam] = useState<Team | null>(null)
  const [members, setMembers] = useState<TeamMember[]>([])
  const [loading, setLoading] = useState(true)
  const [query, setQuery] = useState('')
  const [inviteOpen, setInviteOpen] = useState(false)
  const [inviteSending, setInviteSending] = useState(false)
  const [transferTarget, setTransferTarget] = useState<TeamMember | null>(null)
  const [leaveOpen, setLeaveOpen] = useState(false)

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

  const changeMemberRole = async (
    member: TeamMember,
    role: Exclude<TeamRole, 'OWNER'>,
  ) => {
    if (teamId == null) return
    try {
      await updateMemberRole(teamId, member.id, role)
      setMembers((prev) =>
        prev.map((item) => (item.id === member.id ? { ...item, role } : item)),
      )
    } catch {
      toast('권한 변경에 실패했습니다. 다시 시도하세요.', { status: 'error' })
    }
  }

  // Owner 부여는 일반 역할 변경과 달리 기존 Owner 강등을 동반한다.
  const handleSelectRole = (member: TeamMember, role: TeamRole) => {
    if (member.role === role) return
    if (role === 'OWNER') {
      setTransferTarget(member)
      return
    }
    void changeMemberRole(member, role)
  }

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

  const handleTransferOwnership = async () => {
    const target = transferTarget
    setTransferTarget(null)
    if (teamId == null || !target) return
    try {
      await transferOwnership(teamId, target.id)
      setMembers((prev) =>
        prev.map((member) => {
          if (member.id === target.id) return { ...member, role: 'OWNER' }
          return member.role === 'OWNER' ? { ...member, role: 'ADMIN' } : member
        }),
      )
    } catch {
      toast('Owner 권한 이전에 실패했습니다. 다시 시도하세요.', {
        status: 'error',
      })
    }
  }

  const handleRemoveMember = async (member: TeamMember) => {
    if (teamId == null) return
    try {
      await removeMember(teamId, member.id)
      setMembers((prev) => prev.filter((item) => item.id !== member.id))
    } catch {
      toast('팀원 삭제에 실패했습니다. 다시 시도하세요.', { status: 'error' })
    }
  }

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
  const me = members.find((member) => member.userId === userId)
  const myRole: TeamRole = me?.role ?? 'MEMBER'

  return {
    team,
    members,
    loading,
    query,
    inviteOpen,
    inviteSending,
    transferTarget,
    leaveOpen,
    filteredMembers,
    myRole,
    setQuery,
    setInviteOpen,
    setTransferTarget,
    setLeaveOpen,
    handleSendInvites,
    handleSelectRole,
    handleRemoveMember,
    handleSaveTeamName,
    handleTransferOwnership,
    handleLeaveTeam,
  }
}
