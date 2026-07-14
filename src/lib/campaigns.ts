/** 캠페인 목록 화면에서 API 연결 전까지 사용하는 UI 전용 데이터 계약입니다. */
export const CAMPAIGN_STATUS = ['before', 'running', 'completed'] as const

export type CampaignStatus = (typeof CAMPAIGN_STATUS)[number]

export interface Campaign {
  id: string
  name: string
  brandName: string
  status: CampaignStatus
  startDate: string
  endDate: string
  mediaAddress: string
  todayPlayCount: number
  totalPlayCount: number
  memo: string
  mediaName: string
  mediaSize: string
  mediaResolution: string
  mediaTags: string[]
}

/** 피그마 표의 행 밀도와 상태 분포를 재현한 임시 목록입니다. */
export const CAMPAIGN_FIXTURES: Campaign[] = [
  {
    id: 'nike-summer',
    name: '0711 나이키 썸머 프로모션 홍보 영상',
    brandName: '나이키 코리아',
    status: 'running',
    startDate: '2026.07.11',
    endDate: '2026.08.15',
    mediaAddress: '서울 강남구 영동대로 513',
    todayPlayCount: 12,
    totalPlayCount: 200,
    memo: '브랜드 인지도 확대를 주요 목표로 설정',
    mediaName: '파르나스 미디어타워 전광판',
    mediaSize: '81 X 20m',
    mediaResolution: '1215 X 1792 px',
    mediaTags: ['평면형', '세로형'],
  },
  {
    id: 'lv-ss',
    name: '루이비통 26 SS 패션 컬렉션',
    brandName: '루이비통 코리아',
    status: 'running',
    startDate: '2026.07.10',
    endDate: '2026.07.31',
    mediaAddress: '서울 강남구 테헤란로 517',
    todayPlayCount: 1,
    totalPlayCount: 200,
    memo: '신규 시즌 컬렉션 공개 캠페인',
    mediaName: '삼성역 미디어폴',
    mediaSize: '6 X 12m',
    mediaResolution: '1080 X 1920 px',
    mediaTags: ['세로형'],
  },
  {
    id: 'hyundai-oilbank',
    name: '현대오일뱅크 에너지 캠페인',
    brandName: '현대오일뱅크',
    status: 'before',
    startDate: '2026.07.20',
    endDate: '2026.08.20',
    mediaAddress: '서울 중구 세종대로 110',
    todayPlayCount: 0,
    totalPlayCount: 180,
    memo: '친환경 에너지 브랜드 메시지',
    mediaName: '서울시청 옥외 전광판',
    mediaSize: '18 X 9m',
    mediaResolution: '1920 X 1080 px',
    mediaTags: ['가로형'],
  },
  {
    id: 'lg-battery',
    name: 'LG에너지솔루션 배터리 전시회',
    brandName: 'LG에너지솔루션',
    status: 'completed',
    startDate: '2026.06.01',
    endDate: '2026.06.30',
    mediaAddress: '서울 강남구 봉은사로 524',
    todayPlayCount: 0,
    totalPlayCount: 300,
    memo: '전시회 방문 유도 홍보 영상',
    mediaName: '코엑스 K-POP 스퀘어',
    mediaSize: '80 X 20m',
    mediaResolution: '3840 X 960 px',
    mediaTags: ['가로형', '곡면형'],
  },
  {
    id: 'samsung-galaxy',
    name: '삼성 갤럭시 신제품 런칭',
    brandName: '삼성전자',
    status: 'completed',
    startDate: '2026.05.15',
    endDate: '2026.06.15',
    mediaAddress: '서울 서초구 강남대로 465',
    todayPlayCount: 0,
    totalPlayCount: 240,
    memo: '신제품 주요 기능 소개',
    mediaName: '강남역 사거리 미디어',
    mediaSize: '24 X 12m',
    mediaResolution: '1920 X 1080 px',
    mediaTags: ['가로형'],
  },
  {
    id: 'shinsegae',
    name: '신세계 백화점 여름 정기 세일',
    brandName: '신세계',
    status: 'before',
    startDate: '2026.07.25',
    endDate: '2026.08.10',
    mediaAddress: '서울 중구 소공로 63',
    todayPlayCount: 0,
    totalPlayCount: 160,
    memo: '여름 정기 세일 고객 유입',
    mediaName: '명동 미디어 파사드',
    mediaSize: '15 X 8m',
    mediaResolution: '1920 X 1080 px',
    mediaTags: ['평면형'],
  },
  {
    id: 'kakao',
    name: '카카오모빌리티 브랜드 캠페인',
    brandName: '카카오모빌리티',
    status: 'running',
    startDate: '2026.07.01',
    endDate: '2026.07.31',
    mediaAddress: '서울 영등포구 국제금융로 10',
    todayPlayCount: 18,
    totalPlayCount: 220,
    memo: '이동 서비스 브랜드 신뢰도 제고',
    mediaName: '여의도 IFC 미디어월',
    mediaSize: '30 X 10m',
    mediaResolution: '2560 X 960 px',
    mediaTags: ['가로형'],
  },
  {
    id: 'amore',
    name: '아모레퍼시픽 홀리데이 컬렉션',
    brandName: '아모레퍼시픽',
    status: 'completed',
    startDate: '2026.05.01',
    endDate: '2026.05.31',
    mediaAddress: '서울 용산구 한강대로 100',
    todayPlayCount: 0,
    totalPlayCount: 190,
    memo: '홀리데이 컬렉션 제품 홍보',
    mediaName: '서울역 미디어월',
    mediaSize: '16 X 9m',
    mediaResolution: '1920 X 1080 px',
    mediaTags: ['가로형'],
  },
]
