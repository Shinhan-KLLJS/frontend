/**
 * 캠페인 등록 API — 현재는 프론트 전용 mock.
 * 백엔드 스펙 확정 시 이 파일의 함수 본문만 api 호출로 교체한다.
 * (함수는 ApiResponse 래퍼가 아닌 result 타입을 resolve하고, 실패는 throw — 호출부 무변경 교체 목적)
 */
import { z } from 'zod'
import type { DateRange } from '@/components/ui'
import media1 from '@/assets/campaign/media-1.png'
import media2 from '@/assets/campaign/media-2.png'
import media3 from '@/assets/campaign/media-3.png'
import media4 from '@/assets/campaign/media-4.png'
import media5 from '@/assets/campaign/media-5.png'
import media6 from '@/assets/campaign/media-6.png'

/** 기본 정보 폼 스키마 — Step1 '다음' 활성 조건이자 등록 요청 값의 원천 */
export const campaignInfoSchema = z.object({
  name: z.string().trim().min(1, '캠페인명을 입력해 주세요.'),
  brand: z.string().trim().min(1, '브랜드명을 입력해 주세요.'),
  period: z
    .custom<DateRange>()
    .refine((range) => Boolean(range?.start && range?.end), {
      message: '송출기간을 선택해 주세요.',
    }),
  dailyPlayCount: z
    .string()
    .regex(/^\d+$/, '하루 송출 횟수를 숫자로 입력해 주세요.')
    .refine((value) => Number(value) > 0, {
      message: '1 이상의 숫자를 입력해 주세요.',
    }),
  memo: z.string().max(500, '메모는 최대 500자까지 입력할 수 있습니다.'),
})

export type CampaignInfoValues = z.infer<typeof campaignInfoSchema>

/** 백엔드 ApiResponse의 code/message를 보존하는 에러 — 호출부는 message만 표시 */
export class CampaignApiError extends Error {
  code: string

  constructor(code: string, message: string) {
    super(message)
    this.name = 'CampaignApiError'
    this.code = code
  }
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

export interface CampaignMedia {
  id: string
  name: string
  address: string
  // 지도 지역 이동(시/도·시/군/구 드롭다운) 필터 기준
  sido: string
  sigungu: string
  /** 송출면 해상도 표기 (예: '1312 x 1664px') */
  resolution: string
  /** 실물 규격 표기 (예: '81 X 20m') */
  size: string
  /** 매체 형태 태그 (평면형/세로형 등) */
  types: string[]
  lat: number
  lng: number
  thumbnail: string
}

/** 매체 mock 데이터 — 썸네일은 Figma 캠페인 등록 섹션 에셋 */
const MOCK_MEDIA: CampaignMedia[] = [
  {
    id: 'media-1',
    name: '삼성동 신라스테이 전광판',
    address: '서울 강남구 명동대로 506',
    sido: '서울특별시',
    sigungu: '강남구',
    resolution: '1312 x 1664px',
    size: '12 X 16m',
    types: ['평면형', '세로형'],
    lat: 37.5088,
    lng: 127.0631,
    thumbnail: media1,
  },
  {
    id: 'media-2',
    name: '파르나스 미디어타워 전광판',
    address: '서울 강남구 영동대로 513',
    sido: '서울특별시',
    sigungu: '강남구',
    resolution: '1215 x 1792px',
    size: '81 X 20m',
    types: ['평면형', '세로형'],
    lat: 37.5109,
    lng: 127.0605,
    thumbnail: media2,
  },
  {
    id: 'media-3',
    name: '코엑스 K-POP 스퀘어 전광판',
    address: '서울 강남구 영동대로 511',
    sido: '서울특별시',
    sigungu: '강남구',
    resolution: '7840 x 1952px',
    size: '81 X 20m',
    types: ['곡면형'],
    lat: 37.5126,
    lng: 127.0588,
    thumbnail: media3,
  },
  {
    id: 'media-4',
    name: '역삼 센터필드 미디어월',
    address: '서울 강남구 테헤란로 231',
    sido: '서울특별시',
    sigungu: '강남구',
    resolution: '1920 x 1080px',
    size: '24 X 14m',
    types: ['평면형'],
    lat: 37.5037,
    lng: 127.0413,
    thumbnail: media4,
  },
  {
    id: 'media-5',
    name: '잠실 롯데월드타워 미디어파사드',
    address: '서울 송파구 올림픽로 300',
    sido: '서울특별시',
    sigungu: '송파구',
    resolution: '2160 x 3840px',
    size: '30 X 120m',
    types: ['평면형', '세로형'],
    lat: 37.5126,
    lng: 127.1025,
    thumbnail: media5,
  },
  {
    id: 'media-6',
    name: '서면 중앙대로 전광판',
    address: '부산 부산진구 중앙대로 708',
    sido: '부산광역시',
    sigungu: '부산진구',
    resolution: '1664 x 1248px',
    size: '16 X 12m',
    types: ['평면형'],
    lat: 35.1587,
    lng: 129.0597,
    thumbnail: media6,
  },
]

/** 송출 매체 리스트 조회 — mock: 지연 후 정적 목록 반환 */
export async function fetchCampaignMedia(): Promise<CampaignMedia[]> {
  await delay(500)
  return MOCK_MEDIA
}

/** 광고 영상 업로드 — mock: 파일명에 'fail' 포함 시 실패(에러 화면 재현용) */
export async function uploadCampaignVideo(
  file: File,
): Promise<{ videoId: string }> {
  await delay(2500)
  if (file.name.toLowerCase().includes('fail')) {
    throw new CampaignApiError(
      'CAMPAIGN4001',
      '영상 업로드에 실패했습니다. 다시 시도하세요.',
    )
  }
  return { videoId: `video-${Date.now()}` }
}
