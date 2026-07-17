/** API 서버 주소 — 배포 환경에서 바꾸려면 VITE_API_BASE_URL 환경변수 사용 */
export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ?? 'https://api.loovi.my'

/** 백엔드 엔드포인트 모음 — 경로 변경 시 여기만 수정 */
export const API_ENDPOINTS = {
  kakaoAuthorize: `${API_BASE_URL}/oauth2/authorization/kakao`, // 카카오 인가 시작 (전체 페이지 이동용 절대 URL)
  tokenRefresh: '/api/v1/auth/token/refresh',
  logout: '/api/v1/auth/logout',
  me: '/api/v1/users/me',
  // 팀 관리 (DV-165)
  teamMembers: (teamId: number) => `/api/v1/teams/${teamId}/members`, // GET 팀원 목록(+팀명)
  teamMemberRole: (teamId: number, userId: number) =>
    `/api/v1/teams/${teamId}/members/${userId}/role`, // PATCH 권한 변경·Owner 이전
  teamMember: (teamId: number, userId: number) =>
    `/api/v1/teams/${teamId}/members/${userId}`, // DELETE 팀원 삭제
  teamLeave: (teamId: number) => `/api/v1/teams/${teamId}/members/me`, // DELETE 팀 나가기
  teamInviteCode: (teamId: number) => `/api/v1/teams/${teamId}/invite-code`, // POST 초대 코드 발급
} as const
