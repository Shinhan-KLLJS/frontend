/* 라우터 설정 모듈 — 분기 컴포넌트(RootRoute)와 router 설정을 함께 두므로
   컴포넌트 전용 fast-refresh 규칙은 이 파일에서 비활성화한다. */
/* eslint-disable react-refresh/only-export-components */
import { createBrowserRouter } from 'react-router-dom'
import AppLayout from '@/components/layout/AppLayout'
import OnboardingLayout from '@/components/layout/OnboardingLayout'
import CampaignListPage from '@/pages/CampaignListPage'
import CampaignRegisterPage from '@/pages/CampaignRegisterPage'
import ComingSoonPage from '@/pages/ComingSoonPage'
import CreateTeamPage from '@/pages/CreateTeamPage'
import DashboardHome from '@/pages/DashboardHome'
import JoinTeamPage from '@/pages/JoinTeamPage'
import LandingPage from '@/pages/LandingPage'
import LoginPage from '@/pages/LoginPage'
import TeamPage from '@/pages/TeamPage'
import WelcomePage from '@/pages/WelcomePage'
import { LoadingSpinner } from '@/components/ui'
import { RequireAuth, useAuth } from '@/lib/auth'
import { ROUTES } from '@/lib/routes'

/** '/' 전용 분기: 세션 확인 중엔 스피너, 비로그인은 랜딩, 로그인은 대시보드(앱 셸) */
function RootRoute() {
  const { status } = useAuth()

  if (status === 'loading') {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <LoadingSpinner progress={0} showLabel={false} />
      </div>
    )
  }
  if (status === 'guest') {
    return <LandingPage />
  }
  return (
    <AppLayout>
      <DashboardHome />
    </AppLayout>
  )
}

export const router = createBrowserRouter([
  { path: ROUTES.login, element: <LoginPage /> },
  // 카카오 OAuth 복귀 지점 (백엔드가 로그인 성공/실패 후 이 경로로 리다이렉트).
  // LoginPage가 세션 복원 결과로 분기: 성공→팀 유무 따라 /·/welcome, 실패→로그인 폼
  { path: ROUTES.loginSuccess, element: <LoginPage /> },
  { path: ROUTES.loginFailure, element: <LoginPage /> },
  // 로그인 O + 소속 팀 X 사용자의 팀 온보딩 (이미 팀이 있으면 레이아웃에서 홈으로 리다이렉트)
  {
    path: ROUTES.welcome,
    element: (
      <RequireAuth>
        <OnboardingLayout />
      </RequireAuth>
    ),
    children: [
      { index: true, element: <WelcomePage /> }, // 팀 생성/합류 분기점 (Choose Plan)
      { path: 'join', element: <JoinTeamPage /> },
      { path: 'create', element: <CreateTeamPage /> },
    ],
  },
  // '/'는 공개 진입점 — 게스트 랜딩 / 인증 시 대시보드를 RootRoute가 분기한다.
  { path: ROUTES.home, element: <RootRoute /> },
  // 서비스 소개 = 랜딩(마케팅) 페이지. 로그인 여부와 무관하게 접근 가능하며 앱 셸 없이 전체 화면으로 렌더.
  // 로그인 헤더의 '서비스 소개'가 이 경로로 이동한다(랜딩 히어로 CTA는 로그인 시 '홈으로 가기'로 바뀜).
  { path: ROUTES.serviceIntro, element: <LandingPage /> },
  {
    element: (
      <RequireAuth>
        <AppLayout />
      </RequireAuth>
    ),
    children: [
      { path: ROUTES.campaigns, element: <CampaignListPage /> },
      // 캠페인 등록 3단계 위저드 (기본 정보 → 매체 선택 → 최종 확인)
      { path: ROUTES.campaignsNew, element: <CampaignRegisterPage /> },
      { path: ROUTES.team, element: <TeamPage /> },
      { path: ROUTES.calendar, element: <ComingSoonPage title="캘린더" /> },
      { path: ROUTES.mypage, element: <ComingSoonPage title="마이 페이지" /> },
      { path: ROUTES.settings, element: <ComingSoonPage title="설정" /> },
      { path: ROUTES.support, element: <ComingSoonPage title="고객센터" /> },
    ],
  },
])
