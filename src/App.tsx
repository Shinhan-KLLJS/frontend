import { Navigate, createBrowserRouter, RouterProvider } from 'react-router-dom'
import { QueryClientProvider } from '@tanstack/react-query'
import AppLayout from '@/components/layout/AppLayout'
import CampaignListPage from '@/pages/CampaignListPage'
import HomePage from '@/pages/HomePage'
import ComingSoonPage from '@/pages/ComingSoonPage'
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
      // 기존 단수형 주소로 접근해도 캠페인 목록으로 자연스럽게 이동합니다.
      { path: '/campaign', element: <Navigate to="/campaigns" replace /> },
      { path: '/campaigns', element: <CampaignListPage /> },
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
