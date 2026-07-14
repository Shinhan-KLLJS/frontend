import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import AppLayout from '@/components/layout/AppLayout'
import CampaignRegisterPage from '@/pages/CampaignRegisterPage'
import CampaignsPage from '@/pages/CampaignsPage'
import HomePage from '@/pages/HomePage'
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
  // 로그인 O + 소속 팀 X 사용자의 팀 생성/합류 분기점
  {
    path: '/welcome',
    element: (
      <RequireAuth>
        <WelcomePage />
      </RequireAuth>
    ),
  },
  {
    element: (
      <RequireAuth>
        <AppLayout />
      </RequireAuth>
    ),
    children: [
      { path: '/', element: <HomePage /> },
      // 캠페인 리스트 (준비 중 placeholder) — LNB '캠페인' 메뉴 목적지
      { path: '/campaigns', element: <CampaignsPage /> },
      // 캠페인 등록 3단계 위저드 (기본 정보 → 매체 선택 → 최종 확인)
      { path: '/campaigns/new', element: <CampaignRegisterPage /> },
    ],
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
