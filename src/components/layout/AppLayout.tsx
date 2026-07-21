import { useMemo } from 'react'
import type { ReactNode } from 'react'
import { Navigate, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { LNB_DEFAULT_MENUS } from '@/components/ui'
import type { DropdownMenuItem, LNBMenu } from '@/components/ui'
import { useAuth } from '@/lib/auth'
import { ROUTES } from '@/lib/routes'
import AppShell from './AppShell'

interface NavItem extends LNBMenu {
  path: string
}

// 메뉴 key ↔ 라우트 (홈만 실제 화면, 나머지는 준비 중 placeholder)
const ROUTE_BY_KEY: Record<string, string> = {
  home: ROUTES.home,
  campaign: ROUTES.campaigns,
  team: ROUTES.team,
  calendar: ROUTES.calendar,
}

// 디자인 시스템 LNB 기본 메뉴(아이콘 포함)를 재사용해 라우트를 매핑
const NAV_ITEMS: NavItem[] = LNB_DEFAULT_MENUS.map((menu) => ({
  ...menu,
  label: menu.key === 'team' ? '팀 관리' : menu.label,
  path: ROUTE_BY_KEY[menu.key] ?? '/',
}))

/**
 * 앱 셸 컨테이너 — 인증(useAuth)과 라우터(선택/이동)를 AppShell에 연결.
 * 레이아웃 라우트로 쓰면 <Outlet/>을, children을 넘기면 그 내용을 본문에 렌더한다.
 */
export default function AppLayout({ children }: { children?: ReactNode }) {
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const { status, user, logout } = useAuth()

  // 헤더 프로필 메뉴
  const profileMenu: DropdownMenuItem[] = [
    {
      key: 'mypage',
      label: '마이 페이지',
      onSelect: () => navigate(ROUTES.mypage),
    },
    { key: 'settings', label: '설정', onSelect: () => navigate(ROUTES.settings) },
    { key: 'support', label: '고객센터', onSelect: () => navigate(ROUTES.support) },
    { key: 'logout', label: '로그아웃', onSelect: () => void logout() },
  ]

  const selectedKey = useMemo(() => {
    const match = NAV_ITEMS.filter((item) =>
      item.path === '/' ? pathname === '/' : pathname.startsWith(item.path),
    ).sort((a, b) => b.path.length - a.path.length)[0]
    return match?.key ?? 'home'
  }, [pathname])

  const handleSelect = (key: string) => {
    const item = NAV_ITEMS.find((i) => i.key === key)
    if (item && item.path !== pathname) navigate(item.path)
  }

  // 앱 셸 전 경로에 팀 소속을 강제 — 로그인했지만 소속 팀이 없으면 온보딩으로 보낸다.
  // (RequireAuth·RootRoute가 미로그인을 이미 걸러, 여기 도달 시 status는 authenticated)
  if (user && !user.hasTeam) {
    return <Navigate to={ROUTES.welcome} replace />
  }

  return (
    <AppShell
      menus={NAV_ITEMS}
      selectedKey={selectedKey}
      onSelect={handleSelect}
      login={status === 'authenticated'}
      avatarSrc={user?.profileImageUrl}
      onServiceIntroClick={() => navigate(ROUTES.serviceIntro)}
      onSignUpClick={() => navigate(ROUTES.login)}
      onLoginClick={() => navigate(ROUTES.login)}
      profileMenu={profileMenu}
      // 대시보드(홈)만 컨텐츠 영역 primary, 나머지 공통 LNB/헤더 페이지는 secondary
      mainClassName={
        pathname === ROUTES.home ? 'bg-bg-primary' : 'bg-bg-secondary'
      }
    >
      {children ?? <Outlet />}
    </AppShell>
  )
}
