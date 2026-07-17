import axios from 'axios'
import type { AxiosError, InternalAxiosRequestConfig } from 'axios'
import { API_BASE_URL, API_ENDPOINTS } from './config'

/** 백엔드 공통 응답 래퍼 */
export interface ApiResponse<T> {
  isSuccess: boolean
  code: string
  message: string
  result: T
  errorDetail?: string[]
}

// accessToken은 메모리에만 보관 (refresh_token은 백엔드가 httpOnly 쿠키로 관리)
let accessToken: string | null = null

export function setAccessToken(token: string | null) {
  accessToken = token
}

export function getAccessToken() {
  return accessToken
}

// refresh 최종 실패(세션 만료) 시 호출 — AuthProvider가 guest 전환을 등록한다
let onAuthFailure: (() => void) | null = null

export function setOnAuthFailure(cb: (() => void) | null) {
  onAuthFailure = cb
}

export const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
})

api.interceptors.request.use((config) => {
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`
  }
  return config
})

// 진행 중인 refresh 요청 — 동시 401이 여러 refresh를 중복 실행하지 않도록 공유한다
let refreshPromise: Promise<string | null> | null = null

/**
 * refresh_token 쿠키로 accessToken 재발급.
 * 인터셉터(401 재시도)를 타지 않도록 api 인스턴스가 아닌 별도 호출을 쓴다.
 * 동시 호출은 하나의 요청을 공유(single-flight)한다.
 */
export function refreshAccessToken(): Promise<string | null> {
  if (!refreshPromise) {
    refreshPromise = (async () => {
      try {
        const { data } = await axios.post<ApiResponse<{ accessToken: string }>>(
          `${API_BASE_URL}${API_ENDPOINTS.tokenRefresh}`,
          null,
          { withCredentials: true },
        )
        accessToken = data.result?.accessToken ?? null
        return accessToken
      } catch {
        accessToken = null
        return null
      } finally {
        refreshPromise = null
      }
    })()
  }
  return refreshPromise
}

// 인증 만료 복구: 액세스 토큰이 만료되면 refresh 후 원요청을 1회 재시도한다.
// 백엔드는 보호 API에 401이 아니라 로그인 리다이렉트(302 → OAuth authorize)를 응답하는데,
// 브라우저 XHR이 이 302를 자동으로 따라가다 크로스오리진(CORS)으로 실패하면 axios는
// 응답 없는 네트워크 에러로 던진다. 그래서 401뿐 아니라 "응답 없이 실패"도 만료로 간주해 복구한다.
api.interceptors.response.use(undefined, async (error: AxiosError) => {
  const original = error.config as
    | (InternalAxiosRequestConfig & { _retried?: boolean })
    | undefined
  if (!original || original._retried) return Promise.reject(error)

  const status = error.response?.status
  const looksLikeAuthExpiry = status === 401 || !error.response

  if (looksLikeAuthExpiry) {
    original._retried = true
    const token = await refreshAccessToken()
    if (token) {
      original.headers.Authorization = `Bearer ${token}`
      return api(original)
    }
    // 확실한 401 + refresh 실패만 세션 만료로 확정해 guest 전환.
    // (응답 없는 실패는 일시적 네트워크 오류일 수 있어 강제 로그아웃하지 않는다)
    if (status === 401) onAuthFailure?.()
  }
  return Promise.reject(error)
})
