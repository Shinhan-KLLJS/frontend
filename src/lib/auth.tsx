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
import { api, refreshAccessToken, setAccessToken } from './api'
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

interface AuthContextValue {
  status: AuthStatus
  user: AuthUser | null
  loginWithKakao: () => void // 카카오 인가 페이지로 이동 — code 교환·쿠키 발급은 백엔드가 전담
  logout: () => Promise<void>
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

  // 앱 진입 시 refresh_token 쿠키로 세션 복원 시도
  useEffect(() => {
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
    try {
      await api.post(API_ENDPOINTS.logout)
    } catch {
      // 로그아웃 API 실패해도 로컬 세션은 정리한다
    }
    setAccessToken(null)
    setUser(null)
    setStatus('guest')
  }, [])

  const value = useMemo(
    () => ({ status, user, loginWithKakao, logout }),
    [status, user, loginWithKakao, logout],
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
    return <Navigate to="/login" replace />
  }
  return children
}
