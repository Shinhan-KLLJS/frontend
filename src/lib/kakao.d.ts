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

  /** 여러 좌표를 감싸는 영역 — 매체 필터 결과에 맞춰 지도 범위를 조정할 때 사용 */
  class LatLngBounds {
    constructor()
    extend(latlng: LatLng): void
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
}

interface Window {
  kakao?: typeof kakao
}
