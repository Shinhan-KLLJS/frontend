import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useToast } from '@/components/ui'
import { useAuth } from '@/lib/auth'
import { ROUTES } from '@/lib/routes'
import {
  fetchTeamMembers,
  issueInviteCode,
  leaveTeam,
  removeMember,
  sendTeamInvites,
  TeamApiError,
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
  const { updateUser } = useAuth()
  const navigate = useNavigate()
  const [team, setTeam] = useState<Team | null>(null)
  const [members, setMembers] = useState<TeamMember[]>([])
  const [loading, setLoading] = useState(true)
  const [query, setQuery] = useState('')
  const [inviteOpen, setInviteOpen] = useState(false)
  const [inviteCode, setInviteCode] = useState('')
  const [inviteSending, setInviteSending] = useState(false)
  const [transferTarget, setTransferTarget] = useState<TeamMember | null>(null)
  const [removeTarget, setRemoveTarget] = useState<TeamMember | null>(null)
  const [leaveOpen, setLeaveOpen] = useState(false)

  useEffect(() => {
    // teamId가 바뀌면 이전 팀명·멤버를 즉시 비운다 — 조회 지연/실패 시 이전 팀 정보가 남지 않게.
    setTeam(null)
    setMembers([])
    if (teamId == null) {
      setLoading(false)
      return
    }
    setLoading(true)
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
    if (teamId == null) return
    // 코드 발급이 성공한 뒤에 모달을 연다 — 빈 코드/이전 코드가 노출되거나 복사·전송되는 것을 막는다.
    try {
      const { code } = await issueInviteCode(teamId)
      setInviteCode(code)
      setInviteOpen(true)
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

  // 팀원 삭제는 되돌릴 수 없으므로 확인 모달(removeTarget)을 거친 뒤에만 실행한다.
  const handleConfirmRemove = async () => {
    const target = removeTarget
    setRemoveTarget(null)
    if (teamId == null || !target) return
    try {
      await removeMember(teamId, target.userId)
      setMembers((prev) => prev.filter((item) => item.userId !== target.userId))
    } catch {
      toast('팀원 삭제에 실패했습니다. 다시 시도하세요.', { status: 'error' })
    }
  }

  // 팀명 변경(PATCH) — 응답 대기 중엔 낙관적으로 반영하고, 실패 시 롤백 + 서버 메시지(권한·길이 등) 노출.
  const handleSaveTeamName = async (name: string) => {
    if (teamId == null || !team) return
    const previous = team
    setTeam({ ...team, name })
    try {
      await updateTeamName(teamId, name)
    } catch (err) {
      setTeam(previous)
      toast(
        err instanceof TeamApiError
          ? err.message
          : '팀명 변경에 실패했습니다. 다시 시도하세요.',
        { status: 'error' },
      )
    }
  }

  const handleLeaveTeam = async () => {
    setLeaveOpen(false)
    if (teamId == null) return
    try {
      await leaveTeam(teamId)
      // auth 상태를 갱신하지 않으면 hasTeam이 true로 남아 /welcome이 다시 홈으로 되돌린다.
      updateUser({ hasTeam: false, teamId: undefined })
      navigate(ROUTES.welcome, { replace: true })
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
    removeTarget,
    leaveOpen,
    filteredMembers,
    myRole,
    setQuery,
    setInviteOpen,
    setTransferTarget,
    setRemoveTarget,
    setLeaveOpen,
    handleOpenInvite,
    handleSendInvites,
    handleSelectRole,
    handleConfirmRemove,
    handleSaveTeamName,
    handleTransferOwnership,
    handleLeaveTeam,
  }
}
