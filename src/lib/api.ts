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

/**
 * refresh_token 쿠키로 accessToken 재발급.
 * 인터셉터(401 재시도)를 타지 않도록 api 인스턴스가 아닌 별도 호출을 쓴다.
 */
export async function refreshAccessToken(): Promise<string | null> {
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
  }
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
  }
  return Promise.reject(error)
})
