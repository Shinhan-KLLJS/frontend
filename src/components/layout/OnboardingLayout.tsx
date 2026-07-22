import { Navigate, Outlet, useNavigate } from 'react-router-dom'
import { Header } from '@/components/ui'
import type { DropdownMenuItem } from '@/components/ui'
import teamBg from '@/assets/onboarding/Team_BG.png'
import { useAuth } from '@/lib/auth'
import { ROUTES } from '@/lib/routes'

/**
 * 팀 온보딩(합류/생성) 공통 레이아웃 — 상단 헤더 + 배경 이미지(Team_BG) + 중앙 콘텐츠
 * 이미 팀이 있는 유저는 온보딩이 불필요하므로 홈으로 돌려보낸다
 */
export default function OnboardingLayout() {
  const navigate = useNavigate()
  const { user, logout } = useAuth()

  if (user?.hasTeam) {
    return <Navigate to={ROUTES.home} replace />
  }

  // 헤더 프로필 메뉴 — 앱 셸(AppLayout)과 동일. 미구현 항목은 비활성(클릭 차단)
  const profileMenu: DropdownMenuItem[] = [
    { key: 'mypage', label: '마이 페이지', disabled: true },
    { key: 'settings', label: '설정', disabled: true },
    { key: 'support', label: '고객센터', disabled: true },
    { key: 'logout', label: '로그아웃', onSelect: () => void logout() },
  ]

  return (
    <div className="font-sans relative flex min-h-screen flex-col bg-bg-secondary">
      {/* 배경 이미지(Team_BG) — 콘텐츠 뒤에 깔리는 장식이므로 스크린리더 제외 */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${teamBg})` }}
      />

      {/* 온보딩 헤더는 화면 전체 폭 — ui Header의 min/max-width 고정값을 해제 */}
      <Header
        login
        avatarSrc={user?.profileImageUrl}
        onServiceIntroClick={() => navigate(ROUTES.serviceIntro)}
        profileMenu={profileMenu}
        className="relative min-w-0! max-w-none!"
      />

      <main
        id="onboarding-main"
        className="relative flex flex-1 items-center justify-center p-x5"
      >
        <Outlet />
      </main>
    </div>
  )
}
