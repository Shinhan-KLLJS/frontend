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

// 메뉴 key ↔ 라우트
const ROUTE_BY_KEY: Record<string, string> = {
  home: ROUTES.home,
  campaign: ROUTES.campaigns,
  team: ROUTES.team,
  calendar: ROUTES.calendar,
}

// 아직 구현되지 않은 메뉴 — 클릭을 막고 비활성(기본 커서·흐린 텍스트)으로 노출
const COMING_SOON_KEYS = new Set(['calendar', 'mypage', 'settings', 'support'])

// 디자인 시스템 LNB 기본 메뉴(아이콘 포함)를 재사용해 라우트를 매핑
const NAV_ITEMS: NavItem[] = LNB_DEFAULT_MENUS.map((menu) => ({
  ...menu,
  label: menu.key === 'team' ? '팀 관리' : menu.label,
  path: ROUTE_BY_KEY[menu.key] ?? '/',
  disabled: COMING_SOON_KEYS.has(menu.key),
}))

/**
 * 앱 셸 컨테이너 — 인증(useAuth)과 라우터(선택/이동)를 AppShell에 연결.
 * 레이아웃 라우트로 쓰면 <Outlet/>을, children을 넘기면 그 내용을 본문에 렌더한다.
 */
export default function AppLayout({ children }: { children?: ReactNode }) {
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const { status, user, logout } = useAuth()

  // 헤더 프로필 메뉴 — 마이 페이지·설정·고객센터는 아직 미구현이라 비활성(클릭 차단)
  const profileMenu: DropdownMenuItem[] = [
    { key: 'mypage', label: '마이 페이지', disabled: true },
    { key: 'settings', label: '설정', disabled: true },
    { key: 'support', label: '고객센터', disabled: true },
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
    if (item && !item.disabled && item.path !== pathname) navigate(item.path)
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
