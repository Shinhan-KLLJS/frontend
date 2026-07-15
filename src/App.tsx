import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import { QueryClientProvider } from '@tanstack/react-query'
import AppLayout from '@/components/layout/AppLayout'
import OnboardingLayout from '@/components/layout/OnboardingLayout'
import CreateTeamPage from '@/pages/CreateTeamPage'
import DashboardHome from '@/pages/DashboardHome'
import ComingSoonPage from '@/pages/ComingSoonPage'
import JoinTeamPage from '@/pages/JoinTeamPage'
import LoginPage from '@/pages/LoginPage'
import WelcomePage from '@/pages/WelcomePage'
import { ToastProvider } from '@/components/ui'
import { AuthProvider, RequireAuth } from '@/lib/auth'
import { queryClient } from '@/lib/queryClient'

const router = createBrowserRouter([
  { path: '/login', element: <LoginPage /> },
  // 카카오 OAuth 복귀 지점 (백엔드가 로그인 성공/실패 후 이 경로로 리다이렉트).
  // LoginPage가 세션 복원 결과로 분기: 성공→팀 유무 따라 /·/welcome, 실패→로그인 폼
  { path: '/login/success', element: <LoginPage /> },
  { path: '/login/failure', element: <LoginPage /> },
  // 로그인 O + 소속 팀 X 사용자의 팀 온보딩 (이미 팀이 있으면 레이아웃에서 홈으로 리다이렉트)
  {
    path: '/welcome',
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
  {
    element: (
      <RequireAuth>
        <AppLayout />
      </RequireAuth>
    ),
    children: [
      { path: '/', element: <DashboardHome /> },
      { path: '/campaigns', element: <ComingSoonPage title="캠페인" /> },
      { path: '/team', element: <ComingSoonPage title="팀 관리" /> },
      { path: '/calendar', element: <ComingSoonPage title="캘린더" /> },
      { path: '/service-intro', element: <ComingSoonPage title="서비스 소개" /> },
      { path: '/mypage', element: <ComingSoonPage title="마이 페이지" /> },
      { path: '/settings', element: <ComingSoonPage title="설정" /> },
      { path: '/support', element: <ComingSoonPage title="고객센터" /> },
    ],
  },
])

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ToastProvider>
        <AuthProvider>
          <RouterProvider router={router} />
        </AuthProvider>
      </ToastProvider>
    </QueryClientProvider>
  )
}

export default App
