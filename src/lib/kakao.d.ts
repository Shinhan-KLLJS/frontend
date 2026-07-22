/**
 * 카카오맵 JS SDK 최소 타입 선언 — 실제 사용하는 API만 선언한다.
 * (라이브러리 미추가 방침: npm 타입 패키지 대신 ambient 선언으로 대체)
 */
declare namespace kakao.maps {
  /** autoload=false로 로드한 SDK 초기화 완료 콜백 */
  function load(callback: () => void): void

  class LatLng {
    constructor(lat: number, lng: number)
    getLat(): number
    getLng(): number
  }

  /** 여러 좌표를 감싸는 영역 — 매체 필터 결과에 맞춰 지도 범위를 조정할 때 사용 */
  class LatLngBounds {
    constructor()
    extend(latlng: LatLng): void
    /** 남서(min lat/lng) 모서리 — viewport 필터 범위 */
    getSouthWest(): LatLng
    /** 북동(max lat/lng) 모서리 — viewport 필터 범위 */
    getNorthEast(): LatLng
  }

  interface MapOptions {
    center: LatLng
    /** 확대 레벨 — 숫자가 클수록 넓은 영역 */
    level?: number
  }

  class Map {
    constructor(container: HTMLElement, options: MapOptions)
    setCenter(latlng: LatLng): void
    setLevel(level: number): void
    /** 현재 확대 레벨 (확대/축소 버튼에서 ±1 조정용) */
    getLevel(): number
    /** 현재 지도 중심 좌표 — 지도 이동 시 역지오코딩 기준점(구 자동 전환) */
    getCenter(): LatLng
    /** 현재 화면에 보이는 영역 — viewport 필터(목록을 보이는 매체로 좁힘)에 사용 */
    getBounds(): LatLngBounds
    panTo(latlng: LatLng): void
    /**
     * 주어진 영역이 모두 보이도록 중심·레벨을 자동 조정.
     * padding(px)을 주면 해당 방향 여백을 확보한다(순서: top, right, bottom, left).
     */
    setBounds(
      bounds: LatLngBounds,
      paddingTop?: number,
      paddingRight?: number,
      paddingBottom?: number,
      paddingLeft?: number,
    ): void
  }

  interface CustomOverlayOptions {
    position: LatLng
    content: HTMLElement
    yAnchor?: number
    zIndex?: number
  }

  class CustomOverlay {
    constructor(options: CustomOverlayOptions)
    setMap(map: Map | null): void
    setZIndex(zIndex: number): void
  }

  /** 지도 이벤트 바인딩 — 사용자 이동(dragend) 감지에 사용 */
  namespace event {
    function addListener(
      target: object,
      type: string,
      handler: (...args: unknown[]) => void,
    ): void
    function removeListener(
      target: object,
      type: string,
      handler: (...args: unknown[]) => void,
    ): void
  }

  /** services 라이브러리 (libraries=services) — 좌표→행정구역 역지오코딩 */
  namespace services {
    enum Status {
      OK = 'OK',
      ZERO_RESULT = 'ZERO_RESULT',
      ERROR = 'ERROR',
    }

    /** coord2RegionCode 결과 한 건 — 'H'(행정동)·'B'(법정동) */
    interface RegionCode {
      region_type: 'H' | 'B'
      region_1depth_name: string
      region_2depth_name: string
      region_3depth_name: string
    }

    class Geocoder {
      /** 좌표(경도 x, 위도 y)를 시/도·시/군/구 행정구역으로 변환 */
      coord2RegionCode(
        x: number,
        y: number,
        callback: (result: RegionCode[], status: Status) => void,
      ): void
    }
  }
}

interface Window {
  kakao?: typeof kakao
}
