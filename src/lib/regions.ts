/** 지도 지역 이동용 시/도·시/군/구 옵션 + 중심좌표 (매체 선택 화면 드롭다운) */

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

// mock 매체가 있는 지역 중심의 최소 구성 — 서비스 지역 확장 시 여기에 추가
export const REGIONS: Region[] = [
  {
    name: '서울특별시',
    lat: 37.5665,
    lng: 126.978,
    districts: [
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
