/** API 서버 주소 — 배포 환경에서 바꾸려면 VITE_API_BASE_URL 환경변수 사용 */
export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ?? 'https://api.loovi.my'

/** 카카오맵 JS SDK 앱 키 — 없으면 지도 대신 안내 placeholder 표시 (키 값은 .env에만, 저장소 미포함) */
export const KAKAO_MAP_APP_KEY = import.meta.env.VITE_KAKAO_MAP_APP_KEY ?? ''

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
  // 팀 관리 (DV-165)
  teamMembers: (teamId: number) => `/api/v1/teams/${teamId}/members`, // GET 팀원 목록(+팀명)
  teamMemberRole: (teamId: number, userId: number) =>
    `/api/v1/teams/${teamId}/members/${userId}/role`, // PATCH 권한 변경·Owner 이전
  teamMember: (teamId: number, userId: number) =>
    `/api/v1/teams/${teamId}/members/${userId}`, // DELETE 팀원 삭제
  teamLeave: (teamId: number) => `/api/v1/teams/${teamId}/members/me`, // DELETE 팀 나가기
  // 캠페인 등록
  mediaUnits: '/api/v1/media-units', // GET 송출 매체 목록·검색 (keyword·sido·sigungu·executionStartDate·executionEndDate 쿼리)
  mediaUnitRegions: '/api/v1/media-units/regions', // GET 매체 서비스 지역 목록
  campaignCreativeUploadUrl: '/api/v1/campaign-creatives/upload-url', // POST 광고 영상 presigned 업로드 URL 발급
  teamCampaigns: (teamId: number) => `/api/v1/teams/${teamId}/campaigns`, // POST 캠페인 등록 · GET 캠페인 목록(status·keyword·sort 쿼리)
  teamCampaignDetail: (teamId: number, campaignId: number) =>
    `/api/v1/teams/${teamId}/campaigns/${campaignId}`, // GET 캠페인 상세 · DELETE 캠페인 삭제
  // 대시보드
  dashboardCampaigns: '/api/v1/dashboard/campaigns', // GET 캠페인 목록
  dashboardCampaignDetail: (campaignId: number) =>
    `/api/v1/dashboard/campaigns/${campaignId}`, // GET 캠페인 상세 (selected_start_date·selected_end_date 쿼리 필수)
  dashboardCampaignDelivery: (campaignId: number) =>
    `/api/v1/dashboard/campaigns/${campaignId}/delivery`, // GET 송출정보 (KPI, selected_start_date·selected_end_date 쿼리)
  dashboardCampaignFunnel: (campaignId: number) =>
    `/api/v1/dashboard/campaigns/${campaignId}/funnel`, // GET 깔때기(TOLA) 지표 (selected_start_date·selected_end_date 쿼리)
  dashboardCampaignRealtime: (campaignId: number) =>
    `/api/v1/dashboard/campaigns/${campaignId}/realtime-graph`, // GET 실시간 시청수(오늘·5초·커서 폴링)
  dashboardCampaignRealtimeHourly: (campaignId: number) =>
    `/api/v1/dashboard/campaigns/${campaignId}/realtime-graph/hourly`, // GET 실시간 시청수(시간별 집계)
  dashboardCampaignAverageWatchTime: (campaignId: number) =>
    `/api/v1/dashboard/campaigns/${campaignId}/average-watch-time`, // GET 평균 시청시간
  dashboardCampaignDemographic: (campaignId: number) =>
    `/api/v1/dashboard/campaigns/${campaignId}/demographic-view-ratio`, // GET 성별·연령 시청 비율
  dashboardCampaignExposure: (campaignId: number) =>
    `/api/v1/dashboard/campaigns/${campaignId}/hourly-age-exposure`, // GET 시간·연령별 노출도
} as const
