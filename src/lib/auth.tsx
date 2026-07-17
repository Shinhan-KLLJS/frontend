import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react'
import type { ReactNode } from 'react'
import { Navigate } from 'react-router-dom'
import { LoadingSpinner } from '@/components/ui'
import { ROUTES } from '@/lib/routes'
import {
  api,
  refreshAccessToken,
  setAccessToken,
  setOnAuthFailure,
} from './api'
import type { ApiResponse } from './api'
import { API_ENDPOINTS } from './config'

export interface AuthUser {
  id: number
  displayName: string
  email: string
  profileImageUrl?: string
  status: 'ACTIVE' | 'SUSPENDED' | 'WITHDRAWN'
  hasTeam: boolean
  teamId?: number
}

export type AuthStatus = 'loading' | 'authenticated' | 'guest'

// 로컬 개발용 목 사용자 — VITE_MOCK_AUTH=true 일 때만 사용 (백엔드 없이 대시보드 확인용)
const MOCK_USER: AuthUser = {
  id: 0,
  displayName: '테스트 사용자',
  email: 'dev@loovi.my',
  profileImageUrl:
    'https://img1.daumcdn.net/thumb/R1280x0.fjpg/?fname=http://t1.daumcdn.net/brunch/service/user/f8Qi/image/nB2ho0vRYaBFs2bJiVcwEINfbcU.jpg',
  status: 'ACTIVE',
  hasTeam: true,
  teamId: 1,
}

interface AuthContextValue {
  status: AuthStatus
  user: AuthUser | null
  loginWithKakao: () => void // 카카오 인가 페이지로 이동 — code 교환·쿠키 발급은 백엔드가 전담
  logout: () => Promise<void>
  // 팀 합류/생성 직후 user를 낙관적으로 갱신 (mock 단계에선 /me 재조회 시 hasTeam이 되돌아가므로 로컬 패치)
  updateUser: (patch: Partial<AuthUser>) => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

// eslint-disable-next-line react-refresh/only-export-components -- 훅은 Provider와 한 파일에 유지
export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) {
    throw new Error('useAuth는 AuthProvider 내부에서만 사용할 수 있습니다.')
  }
  return ctx
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<AuthStatus>('loading')
  const [user, setUser] = useState<AuthUser | null>(null)

  // 요청 중 refresh 최종 실패(세션 만료) 시 guest로 전환 — 보호 화면 노출 방지
  useEffect(() => {
    setOnAuthFailure(() => {
      setAccessToken(null)
      setUser(null)
      setStatus('guest')
    })
    return () => setOnAuthFailure(null)
  }, [])

  // 앱 진입 시 refresh_token 쿠키로 세션 복원 시도
  useEffect(() => {
    // 로컬 개발용 목 인증 — 백엔드 없이 로그인 상태로 진입 (DEV 가드로 프로덕션엔 미포함)
    if (import.meta.env.DEV && import.meta.env.VITE_MOCK_AUTH === 'true') {
      setUser(MOCK_USER)
      setStatus('authenticated')
      return
    }

    let cancelled = false
    ;(async () => {
      const token = await refreshAccessToken()
      if (cancelled) return
      if (!token) {
        setStatus('guest')
        return
      }
      try {
        const { data } = await api.get<ApiResponse<AuthUser>>(API_ENDPOINTS.me)
        if (cancelled) return
        setUser(data.result)
        setStatus('authenticated')
      } catch {
        if (cancelled) return
        setAccessToken(null)
        setStatus('guest')
      }
    })()
    return () => {
      cancelled = true
    }
  }, [])

  const loginWithKakao = useCallback(() => {
    window.location.href = API_ENDPOINTS.kakaoAuthorize
  }, [])

  const logout = useCallback(async () => {
    // 목 인증(로컬)에서는 백엔드가 없으므로 API 호출 없이 상태만 정리
    const isMock =
      import.meta.env.DEV && import.meta.env.VITE_MOCK_AUTH === 'true'
    if (!isMock) {
      try {
        await api.post(API_ENDPOINTS.logout)
      } catch {
        // 로그아웃 API 실패해도 로컬 세션은 정리한다
      }
    }
    setAccessToken(null)
    setUser(null)
    setStatus('guest')
  }, [])

  const updateUser = useCallback((patch: Partial<AuthUser>) => {
    setUser((prev) => (prev ? { ...prev, ...patch } : prev))
  }, [])

  const value = useMemo(
    () => ({ status, user, loginWithKakao, logout, updateUser }),
    [status, user, loginWithKakao, logout, updateUser],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

/** 인증 가드 — 세션 복원 중엔 스피너, 미로그인은 /login으로 */
export function RequireAuth({ children }: { children: ReactNode }) {
  const { status } = useAuth()

  if (status === 'loading') {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <LoadingSpinner progress={0} showLabel={false} />
      </div>
    )
  }
  if (status === 'guest') {
    return <Navigate to={ROUTES.login} replace />
  }
  return children
}
