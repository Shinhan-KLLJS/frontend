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

// 401 응답이면 refresh 1회 시도 후 원요청 재시도
api.interceptors.response.use(undefined, async (error: AxiosError) => {
  const original = error.config as
    | (InternalAxiosRequestConfig & { _retried?: boolean })
    | undefined
  if (error.response?.status === 401 && original && !original._retried) {
    original._retried = true
    const token = await refreshAccessToken()
    if (token) {
      original.headers.Authorization = `Bearer ${token}`
      return api(original)
    }
    // refresh 실패 = 세션 만료 → 보호 화면이 계속 노출되지 않도록 guest 전환 알림
    onAuthFailure?.()
  }
  return Promise.reject(error)
})
