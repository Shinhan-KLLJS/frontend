/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** 백엔드 API 베이스 URL (배포/로컬 전환) */
  readonly VITE_API_BASE_URL: string
  /** 로컬 개발용 목 인증 사용 여부 ('true'면 백엔드 없이 로그인 상태로 진입) */
  readonly VITE_MOCK_AUTH?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
