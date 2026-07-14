/**
 * 카카오맵 JS SDK 최소 타입 선언 — 실제 사용하는 API만 선언한다.
 * (라이브러리 미추가 방침: npm 타입 패키지 대신 ambient 선언으로 대체)
 */
declare namespace kakao.maps {
  /** autoload=false로 로드한 SDK 초기화 완료 콜백 */
  function load(callback: () => void): void

  class LatLng {
    constructor(lat: number, lng: number)
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
    panTo(latlng: LatLng): void
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
}

interface Window {
  kakao?: typeof kakao
}
