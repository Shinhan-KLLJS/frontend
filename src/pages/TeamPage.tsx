import { Navigate, useNavigate } from 'react-router-dom'
import { Plus } from 'lucide-react'
import TeamInviteModal from '@/components/team/TeamInviteModal'
import TeamMemberList from '@/components/team/TeamMemberList'
import TeamNameTitle from '@/components/team/TeamNameTitle'
import { Button, Modal, SearchBar } from '@/components/ui'
import { useTeamManagement } from '@/hooks/useTeamManagement'
import { useAuth } from '@/lib/auth'
import { ROUTES } from '@/lib/routes'

/**
 * 팀 관리 화면 — 팀원 목록·초대·권한 관리·팀 나가기 기능을 조합한다.
 * 데이터 조회와 상태 변경은 useTeamManagement로 분리해 화면 구성에만 집중한다.
 */
export default function TeamPage() {
  const navigate = useNavigate()
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
  if (user && !user.hasTeam) return <Navigate to={ROUTES.welcome} replace />

  // 팀 데이터가 비어 있으면(조회 실패·팀 없음) 대시보드 빈 상태처럼 생성/합류 안내 화면을 보여준다.
  if (!loading && !team) {
    return (
      <div className="flex min-h-full flex-1 flex-col items-center justify-center gap-x5 p-x5">
        <div className="flex flex-col items-center gap-x2 text-center">
          <h2 className="text-title-3-medium text-text-primary">
            아직 팀이 없어요
          </h2>
          <p className="text-heading-2-regular text-text-secondary">
            팀을 생성하거나 합류해보세요.
          </p>
        </div>
        <div className="flex items-center gap-x3">
          <Button size="large" onClick={() => navigate(ROUTES.welcomeCreate)}>
            팀 생성하기
          </Button>
          <Button size="large" onClick={() => navigate(ROUTES.welcomeJoin)}>
            팀 합류하기
          </Button>
        </div>
      </div>
    )
  }

  return (
    <section className="flex min-h-full flex-col">
      {/* 헤더 — p-x5, space-between */}
      <header className="flex items-center justify-between gap-x5 p-x5">
        {team ? (
          <TeamNameTitle name={team.name} onSave={handleSaveTeamName} />
        ) : (
          <span aria-hidden="true" />
        )}
        <div className="flex shrink-0 items-center gap-x5">
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

      {/* 본문 — 헤더 하단 p-x5가 상단 여백을 대신하므로 px-x5 pb-x5, gap-x5 */}
      <div className="flex flex-1 flex-col gap-x5 px-x5 pb-x5">
        {/* SearchBar 루트가 w-full이라 래퍼로 307px 고정 */}
        <div className="w-[307px]">
          <SearchBar
            value={query}
            onChange={setQuery}
            placeholder="팀원 이름을 검색하세요"
            variant="line"
            aria-label="팀원 검색"
          />
        </div>

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
        title="소유자 권한을 부여하시겠어요?"
        body="부여하면 팀 관리 권한이 모두 이전돼요."
        onClose={() => setTransferTarget(null)}
        onConfirm={handleTransferOwnership}
      />
      <Modal
        open={leaveOpen}
        title="팀을 나가시겠어요?"
        body="팀을 나가면 팀 데이터에 더 이상 접근할 수 없어요."
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
