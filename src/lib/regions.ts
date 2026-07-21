/**
 * 지도 지역 이동용 시/도·시/군/구 중심좌표 보정표.
 * 드롭다운 옵션은 API(GET /media-units/regions)로 채우고, 이동할 좌표만 이름으로 여기서 찾는다
 * (API가 좌표를 주지 않으므로). 표에 없는 지역은 좌표를 못 찾아 지도 이동을 건너뛴다.
 */

export interface RegionDistrict {
  name: string
  lat: number
  lng: number
}

export interface Region {
  name: string
  lat: number
  lng: number
  districts: RegionDistrict[]
}

// 지도 초기 중심 (지역 선택 전) — 서울 시청 부근
export const DEFAULT_MAP_CENTER = { lat: 37.5665, lng: 126.978 }

// 서비스 지역 중심좌표 — 서비스 지역 확장 시 여기에 추가
export const REGIONS: Region[] = [
  {
    name: '서울특별시',
    lat: 37.5665,
    lng: 126.978,
    districts: [
      { name: '중구', lat: 37.5638, lng: 126.9976 },
      { name: '강남구', lat: 37.5173, lng: 127.0473 },
      { name: '서초구', lat: 37.4837, lng: 127.0324 },
      { name: '송파구', lat: 37.5145, lng: 127.1059 },
      { name: '마포구', lat: 37.5663, lng: 126.9016 },
      { name: '영등포구', lat: 37.5264, lng: 126.8962 },
    ],
  },
  {
    name: '부산광역시',
    lat: 35.1796,
    lng: 129.0756,
    districts: [
      { name: '부산진구', lat: 35.1631, lng: 129.053 },
      { name: '해운대구', lat: 35.1631, lng: 129.1635 },
    ],
  },
  {
    name: '대구광역시',
    lat: 35.8714,
    lng: 128.6014,
    districts: [{ name: '중구', lat: 35.8694, lng: 128.6061 }],
  },
  {
    name: '인천광역시',
    lat: 37.4563,
    lng: 126.7052,
    districts: [{ name: '연수구', lat: 37.41, lng: 126.6788 }],
  },
  {
    name: '대전광역시',
    lat: 36.3504,
    lng: 127.3845,
    districts: [{ name: '서구', lat: 36.3555, lng: 127.3838 }],
  },
]

/**
 * 시/도(+시/군/구) 이름으로 지도 이동 좌표를 찾는다.
 * 시/군/구까지 일치하면 그 중심, 시/도만 있으면 시/도 중심, 표에 없으면 null (이동 생략).
 */
export function findRegionCoords(
  sido: string,
  sigungu?: string,
): { lat: number; lng: number } | null {
  const region = REGIONS.find((r) => r.name === sido)
  if (!region) return null
  if (sigungu) {
    const district = region.districts.find((d) => d.name === sigungu)
    if (district) return { lat: district.lat, lng: district.lng }
  }
  return { lat: region.lat, lng: region.lng }
}
