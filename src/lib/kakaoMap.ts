import { KAKAO_MAP_APP_KEY } from '@/lib/config'

// SDK 스크립트는 전역 1회만 로드 — 동시 호출은 같은 promise를 공유 (refresh single-flight 패턴)
let loadPromise: Promise<typeof kakao | null> | null = null

// 도메인 미등록 등으로 onload 이후 load 콜백이 오지 않는 경우까지 대비한 타임아웃
const LOAD_TIMEOUT_MS = 10_000

/**
 * 카카오맵 JS SDK 동적 로더 — 키 없음/로드 실패/타임아웃 시 null을 resolve.
 * 호출부는 null 한 가지만 분기(placeholder 표시)하면 되고, 실패 시 promise를 비워 재진입 때 다시 시도한다
 */
export function loadKakaoMaps(): Promise<typeof kakao | null> {
  if (loadPromise) return loadPromise

  loadPromise = new Promise((resolve) => {
    if (!KAKAO_MAP_APP_KEY) {
      resolve(null)
      return
    }
    if (window.kakao?.maps) {
      resolve(window.kakao)
      return
    }

    const script = document.createElement('script')
    let timeoutId = 0

    const fail = () => {
      window.clearTimeout(timeoutId)
      script.remove()
      loadPromise = null
      resolve(null)
    }

    timeoutId = window.setTimeout(fail, LOAD_TIMEOUT_MS)

    script.src = `https://dapi.kakao.com/v2/maps/sdk.js?appkey=${KAKAO_MAP_APP_KEY}&autoload=false`
    script.async = true
    script.onload = () => {
      if (!window.kakao?.maps) {
        fail()
        return
      }
      window.kakao.maps.load(() => {
        window.clearTimeout(timeoutId)
        resolve(window.kakao ?? null)
      })
    }
    script.onerror = fail
    document.head.appendChild(script)
  })

  return loadPromise
}
