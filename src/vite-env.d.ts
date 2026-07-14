/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** 백엔드 API 베이스 URL (배포/로컬 전환) */
  readonly VITE_API_BASE_URL: string
  /** 카카오맵 JavaScript 키 — 없으면 지도 placeholder로 동작 */
  readonly VITE_KAKAO_MAP_APP_KEY?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
