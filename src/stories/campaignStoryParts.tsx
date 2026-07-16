/* eslint-disable react-refresh/only-export-components -- 스토리 전용 파츠(픽스처+렌더 공용) */
import type { ReactNode } from 'react'
import type { CampaignInfoValues, CampaignMedia } from '@/lib/campaign'

/** 스토리용 샘플 썸네일 — 외부 네트워크 없이 뜨도록 SVG dataURL */
export const SAMPLE_THUMBNAIL =
  'data:image/svg+xml;utf8,' +
  encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" width="320" height="180">' +
      '<rect width="320" height="180" fill="#3366ff"/>' +
      '<text x="160" y="102" font-size="28" fill="#fff" text-anchor="middle" font-family="sans-serif">MEDIA</text>' +
      '</svg>',
  )

/** 일부러 깨지는 URL — 이미지 fallback 확인용 */
export const BROKEN_THUMBNAIL = 'https://example.com/does-not-exist.png'

export function sampleMedia(
  overrides: Partial<CampaignMedia> = {},
): CampaignMedia {
  return {
    id: '1',
    name: '파르나스 미디어타워 전광판',
    address: '서울 강남구 영동대로 513',
    sido: '서울특별시',
    sigungu: '강남구',
    resolution: '1215 x 1792px',
    size: '81 X 20m',
    types: ['평면형', '세로형'],
    lat: 37.5109,
    lng: 127.0605,
    thumbnail: SAMPLE_THUMBNAIL,
    available: true,
    unavailableReason: null,
    ...overrides,
  }
}

export const SAMPLE_MEDIA_LIST: CampaignMedia[] = [
  sampleMedia({ id: '1', name: '파르나스 미디어타워 전광판' }),
  sampleMedia({
    id: '2',
    name: '코엑스 K-POP 스퀘어 전광판',
    types: ['곡면형'],
  }),
  sampleMedia({
    id: '3',
    name: '잠실 롯데월드타워 미디어파사드 초대형 전광판 (긴 이름 말줄임 테스트)',
    sigungu: '송파구',
    available: false,
    unavailableReason: 'PERIOD_CONFLICT',
  }),
  sampleMedia({
    id: '4',
    name: '역삼 센터필드 미디어월',
    thumbnail: BROKEN_THUMBNAIL,
  }),
]

export const SAMPLE_INFO: CampaignInfoValues = {
  name: '0711 나이키 썸머 프로모션 홍보 영상',
  brand: '나이키 코리아',
  period: { start: new Date(2026, 6, 11), end: new Date(2026, 6, 12) },
  dailyPlayCount: '100',
  memo: '브랜드 인지도 확대를 주요 목표로 설정',
}

/** 캠페인 본문 폭에서 렌더 (반응형 확인용) — 본문 배경(cautionary) 위에 지정 폭으로 */
export function CampaignFrame({
  width,
  children,
}: {
  width: number
  children: ReactNode
}) {
  return (
    <div className="bg-bg-cautionary p-x5">
      <div style={{ width }} className="mx-auto">
        {children}
      </div>
    </div>
  )
}
