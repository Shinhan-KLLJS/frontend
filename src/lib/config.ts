/** API 서버 주소 — 배포 환경에서 바꾸려면 VITE_API_BASE_URL 환경변수 사용 */
export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ?? 'https://api.loovi.my'

/** 백엔드 엔드포인트 모음 — 경로 변경 시 여기만 수정 */
export const API_ENDPOINTS = {
  kakaoAuthorize: `${API_BASE_URL}/oauth2/authorization/kakao`, // 카카오 인가 시작 (전체 페이지 이동용 절대 URL)
  tokenRefresh: '/api/v1/auth/token/refresh',
  logout: '/api/v1/auth/logout',
  me: '/api/v1/users/me',
  // 팀 온보딩
  teams: '/api/v1/teams', // POST 팀 생성
  businessRegistration: '/api/v1/teams/business-registration', // POST 사업자등록증 업로드(OCR)
  teamJoin: '/api/v1/teams/join', // POST 팀 합류
  teamInviteCode: (teamId: number) => `/api/v1/teams/${teamId}/invite-code`, // POST 초대 코드 발급
  // 대시보드
  dashboardCampaigns: '/api/v1/dashboard/campaigns', // GET 캠페인 목록
  dashboardCampaignDetail: (campaignId: number) =>
    `/api/v1/dashboard/campaigns/${campaignId}`, // GET 캠페인 상세 (selected_start_date·selected_end_date 쿼리 필수)
  dashboardCampaignDelivery: (campaignId: number) =>
    `/api/v1/dashboard/campaigns/${campaignId}/delivery`, // GET 송출정보 (KPI, selected_start_date·selected_end_date 쿼리)
  dashboardCampaignFunnel: (campaignId: number) =>
    `/api/v1/dashboard/campaigns/${campaignId}/funnel`, // GET 깔때기(TOLA) 지표 (selected_start_date·selected_end_date 쿼리)
} as const
