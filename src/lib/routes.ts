/**
 * 앱 라우트 경로 상수 (Single Source of Truth)
 *
 * 라우터 정의(router.tsx)·navigate()·<Navigate>·LNB 매핑이 모두 이 상수를 참조한다.
 * 경로를 바꿀 때 이 파일만 고치면 되고, 하드코딩된 문자열이 흩어져 드리프트 나는 것을 막는다.
 */
export const ROUTES = {
  /** 루트 진입점 — 게스트는 랜딩, 로그인 사용자는 대시보드 홈으로 분기 */
  home: '/',
  /** 통합 로그인 페이지 (이메일 폼 + 카카오 간편 로그인) */
  login: '/login',
  /** 카카오 OAuth 성공 복귀 지점 — 세션 복원 후 팀 유무에 따라 분기 */
  loginSuccess: '/login/success',
  /** 카카오 OAuth 실패 복귀 지점 — 로그인 폼으로 되돌림 */
  loginFailure: '/login/failure',
  /** 팀 온보딩 분기점(Choose Plan) — 로그인 O + 소속 팀 X 사용자 */
  welcome: '/welcome',
  /** 팀 생성 폼 (사업자등록증 업로드 포함) */
  welcomeCreate: '/welcome/create',
  /** 팀 합류 폼 (초대 코드 입력) */
  welcomeJoin: '/welcome/join',
  /** 캠페인 목록(관리) 페이지 */
  campaigns: '/campaigns',
  /** 캠페인 등록 3단계 위저드 (기본 정보 → 매체 선택 → 최종 확인) */
  campaignsNew: '/campaigns/new',
  /** 팀 관리 페이지 (팀원 목록·초대·권한) */
  team: '/team',
  /** 서비스 소개 — 랜딩(마케팅) 페이지를 렌더. 로그인 사용자도 접근 가능(앱 셸 없이 전체 화면) */
  serviceIntro: '/service-intro',
  /** 캘린더 (준비 중 placeholder) */
  calendar: '/calendar',
  /** 마이 페이지 (준비 중 placeholder) */
  mypage: '/mypage',
  /** 설정 (준비 중 placeholder) */
  settings: '/settings',
  /** 고객센터 (준비 중 placeholder) */
  support: '/support',
} as const
