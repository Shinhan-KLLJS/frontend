import { Navigate, Outlet } from 'react-router-dom'
import { Header } from '@/components/ui'
import { useAuth } from '@/lib/auth'

/**
 * 팀 온보딩(합류/생성) 공통 레이아웃 — 상단 헤더 + 블루 그라데이션 배경 + 중앙 콘텐츠
 * 이미 팀이 있는 유저는 온보딩이 불필요하므로 홈으로 돌려보낸다
 */
export default function OnboardingLayout() {
  const { user } = useAuth()

  if (user?.hasTeam) {
    return <Navigate to="/" replace />
  }

  return (
    <div className="font-sans relative flex min-h-screen flex-col overflow-hidden bg-bg-secondary">
      {/* 배경 장식 — 피그마의 블루 웨이브 그라데이션을 blur 원으로 근사 (장식이므로 스크린리더 제외) */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        <div className="absolute -left-[10%] top-[30%] size-[600px] rounded-full bg-[var(--blue-100)] opacity-60 blur-[140px]" />
        <div className="absolute -right-[10%] bottom-[10%] size-[520px] rounded-full bg-[var(--blue-200)] opacity-40 blur-[140px]" />
        <div className="absolute left-[35%] top-[65%] size-[420px] rounded-full bg-[var(--blue-100)] opacity-50 blur-[120px]" />
      </div>

      <Header
        login
        avatarSrc={user?.profileImageUrl}
        className="relative min-w-0 max-w-none"
      />

      <main className="relative flex flex-1 items-center justify-center p-x5">
        <Outlet />
      </main>
    </div>
  )
}
