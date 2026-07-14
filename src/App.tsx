import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import AppLayout from '@/components/layout/AppLayout'
import OnboardingLayout from '@/components/layout/OnboardingLayout'
import CreateTeamPage from '@/pages/CreateTeamPage'
import HomePage from '@/pages/HomePage'
import JoinTeamPage from '@/pages/JoinTeamPage'
import LoginPage from '@/pages/LoginPage'
import WelcomePage from '@/pages/WelcomePage'
import { ToastProvider } from '@/components/ui'
import { AuthProvider, RequireAuth } from '@/lib/auth'

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
    children: [{ path: '/', element: <HomePage /> }],
  },
])

function App() {
  return (
    <ToastProvider>
      <AuthProvider>
        <RouterProvider router={router} />
      </AuthProvider>
    </ToastProvider>
  )
}

export default App
