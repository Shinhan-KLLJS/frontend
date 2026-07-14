import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import AppLayout from '@/components/layout/AppLayout'
import HomePage from '@/pages/HomePage'
import LandingPage from '@/pages/LandingPage'
import LoginPage from '@/pages/LoginPage'
import WelcomePage from '@/pages/WelcomePage'
import { ToastProvider, LoadingSpinner } from '@/components/ui'
import { AuthProvider, RequireAuth, useAuth } from '@/lib/auth'

/** '/' 전용 분기: 세션 확인 중엔 스피너, 비로그인은 랜딩, 로그인은 기존 대시보드 */
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
      <HomePage />
    </AppLayout>
  )
}

const router = createBrowserRouter([
  { path: '/login', element: <LoginPage /> },
  // 카카오 OAuth 복귀 지점 (백엔드가 로그인 성공/실패 후 이 경로로 리다이렉트).
  // LoginPage가 세션 복원 결과로 분기: 성공→팀 유무 따라 /·/welcome, 실패→로그인 폼
  { path: '/login/success', element: <LoginPage /> },
  { path: '/login/failure', element: <LoginPage /> },
  // 로그인 O + 소속 팀 X 사용자의 팀 생성/합류 분기점
  {
    path: '/welcome',
    element: (
      <RequireAuth>
        <WelcomePage />
      </RequireAuth>
    ),
  },
  { path: '/', element: <RootRoute /> },
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
