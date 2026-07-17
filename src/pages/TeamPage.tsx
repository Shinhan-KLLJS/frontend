import { Navigate } from 'react-router-dom'
import { Plus } from 'lucide-react'
import TeamInviteModal from '@/components/team/TeamInviteModal'
import TeamMemberList from '@/components/team/TeamMemberList'
import TeamNameTitle from '@/components/team/TeamNameTitle'
import { Button, Modal, SearchBar } from '@/components/ui'
import { useTeamManagement } from '@/hooks/useTeamManagement'
import { useAuth } from '@/lib/auth'

/**
 * 팀 관리 화면 — 팀원 목록·초대·권한 관리·팀 나가기 기능을 조합한다.
 * 데이터 조회와 상태 변경은 useTeamManagement로 분리해 화면 구성에만 집중한다.
 */
export default function TeamPage() {
  const { user } = useAuth()
  const teamId = user?.teamId ?? null
  const teamManagement = useTeamManagement({ teamId })

  const {
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
  } = teamManagement

  // 소속 팀이 없으면 팀 생성·합류 분기점으로 이동해 딥링크 접근을 방어한다.
  if (user && !user.hasTeam) return <Navigate to="/welcome" replace />

  return (
    <section className="flex min-h-full flex-col p-x5 pb-[80px]">
      {/* Leading — 팀명과 액션 버튼(Figma 패딩 좌우 40·상하 20) */}
      <header className="flex min-h-[88px] items-center justify-between gap-x5 px-x10 py-x5">
        {team ? (
          <TeamNameTitle name={team.name} onSave={handleSaveTeamName} />
        ) : (
          <span aria-hidden="true" />
        )}
        <div className="flex shrink-0 items-center gap-[6px]">
          <Button
            variant="line"
            color="secondary"
            onClick={() => setLeaveOpen(true)}
          >
            팀 나가기
          </Button>
          <Button
            leadingIcon={Plus}
            disabled={!team}
            onClick={handleOpenInvite}
          >
            팀원 초대
          </Button>
        </div>
      </header>

      {/* Trailing — 검색과 팀원 리스트(Figma 패딩 좌우 40·상하 20) */}
      <div className="flex flex-1 flex-col gap-x5 px-x10 py-x5">
        <SearchBar
          value={query}
          onChange={setQuery}
          placeholder="팀원 이름을 검색하세요"
          className="w-[307px]"
          aria-label="팀원 검색"
        />

        <TeamMemberList
          members={filteredMembers}
          myRole={myRole}
          loading={loading}
          onSelectRole={handleSelectRole}
          onRemoveMember={handleRemoveMember}
        />
      </div>

      <Modal
        open={transferTarget !== null}
        title="Owner 권한을 이전하시겠습니까?"
        body="Owner 권한은 한 명만 가질 수 있습니다. 권한을 이전하면 기존 소유자는 Admin으로 변경됩니다."
        onClose={() => setTransferTarget(null)}
        onConfirm={handleTransferOwnership}
      />
      <Modal
        open={leaveOpen}
        title="팀을 나가시겠습니까?"
        body="팀에서 나가면 이 팀의 캠페인 데이터에 더 이상 접근할 수 없습니다."
        cancelText="취소"
        confirmText="팀 나가기"
        onClose={() => setLeaveOpen(false)}
        onConfirm={handleLeaveTeam}
      />
      <TeamInviteModal
        open={inviteOpen}
        teamCode={inviteCode}
        memberEmails={members.map((member) => member.email)}
        sending={inviteSending}
        onClose={() => setInviteOpen(false)}
        onSend={handleSendInvites}
      />
    </section>
  )
}
