import { useLocation, useNavigate } from 'react-router-dom'
import { LNB } from '@/components/ui'

// LNB 메뉴 key → 라우트 (팀원/캘린더는 화면 준비 전이라 미등록 — onSelect에서 무시)
const MENU_PATH: Record<string, string> = {
  home: '/',
  campaign: '/campaigns',
}

/** 현재 경로 → LNB 선택 메뉴 key (하위 경로 포함: /campaigns/new도 캠페인 하이라이트) */
function selectedKeyFromPath(pathname: string): string {
  if (pathname.startsWith('/campaigns')) return 'campaign'
  return 'home'
}

/** 앱 좌측 사이드바 — ui LNB에 라우터 연동(선택 하이라이트 + 메뉴 이동)만 얹는다 */
export default function Sidebar() {
  const { pathname } = useLocation()
  const navigate = useNavigate()

  return (
    <LNB
      className="shrink-0"
      selectedKey={selectedKeyFromPath(pathname)}
      onSelect={(key) => {
        const path = MENU_PATH[key]
        if (path) navigate(path)
      }}
    />
  )
}
