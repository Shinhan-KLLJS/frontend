/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** 백엔드 API 베이스 URL (배포/로컬 전환) */
  readonly VITE_API_BASE_URL: string
  /** 카카오맵 JavaScript 키 — 없으면 지도 placeholder로 동작 */
  readonly VITE_KAKAO_MAP_APP_KEY?: string
  /** 로컬 개발용 목 인증 — 'true'면 백엔드 없이 로그인 상태로 진입 (DEV 전용) */
  readonly VITE_MOCK_AUTH?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
