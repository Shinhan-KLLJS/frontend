import { useMemo } from 'react'
import { Outlet, useLocation, useNavigate } from 'react-router-dom'
import { LNB_DEFAULT_MENUS } from '@/components/ui'
import type { DropdownMenuItem, LNBMenu } from '@/components/ui'
import { useAuth } from '@/lib/auth'
import AppShell from './AppShell'

interface NavItem extends LNBMenu {
  path: string
}

// 메뉴 key ↔ 라우트 (홈만 실제 화면, 나머지는 준비 중 placeholder)
const ROUTE_BY_KEY: Record<string, string> = {
  home: '/',
  campaign: '/campaigns',
  team: '/team',
  calendar: '/calendar',
}

// 디자인 시스템 LNB 기본 메뉴(아이콘 포함)를 재사용해 라우트를 매핑
const NAV_ITEMS: NavItem[] = LNB_DEFAULT_MENUS.map((menu) => ({
  ...menu,
  label: menu.key === 'team' ? '팀 관리' : menu.label,
  path: ROUTE_BY_KEY[menu.key] ?? '/',
}))

/**
 * 앱 셸 컨테이너 — 인증(useAuth)과 라우터(선택/이동)를 AppShell에 연결.
 */
export default function AppLayout() {
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const { status, user, logout } = useAuth()

  // 헤더 프로필 메뉴
  const profileMenu: DropdownMenuItem[] = [
    {
      key: 'mypage',
      label: '마이 페이지',
      onSelect: () => navigate('/mypage'),
    },
    { key: 'settings', label: '설정', onSelect: () => navigate('/settings') },
    { key: 'support', label: '고객센터', onSelect: () => navigate('/support') },
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

  return (
    <AppShell
      menus={NAV_ITEMS}
      selectedKey={selectedKey}
      onSelect={handleSelect}
      login={status === 'authenticated'}
      avatarSrc={user?.profileImageUrl}
      onServiceIntroClick={() => navigate('/service-intro')}
      onSignUpClick={() => navigate('/login')}
      onLoginClick={() => navigate('/login')}
      profileMenu={profileMenu}
    >
      <Outlet />
    </AppShell>
  )
}
