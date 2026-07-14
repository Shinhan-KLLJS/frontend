import { useEffect, useRef, useState } from 'react'
import { Dropdown } from '@/components/ui'
import type { CampaignMedia } from '@/lib/campaign'
import { loadKakaoMaps } from '@/lib/kakaoMap'
import { REGIONS } from '@/lib/regions'

export interface MediaMapProps {
  mediaList: CampaignMedia[]
  selectedMediaId: string | null
  onSelectMedia: (id: string) => void
  className?: string
}

// 확대 레벨 — 시/도는 광역, 시/군/구는 동 단위가 보이는 수준
const SIDO_LEVEL = 8
const SIGUNGU_LEVEL = 5

/** 핀 스타일 — CustomOverlay content는 React 밖 DOM이라 클래스 문자열로 관리 */
function pinClass(selected: boolean): string {
  return [
    'flex cursor-pointer items-center rounded-full p-x1 shadow-normal-small transition-colors',
    selected ? 'bg-line-brand' : 'bg-[var(--cool-neutral-700)]',
  ].join(' ')
}

type MapStatus = 'loading' | 'ready' | 'unavailable'

/**
 * 매체 선택 지도 — 카카오맵 + 매체 썸네일 핀(CustomOverlay) + 지역 이동 드롭다운.
 * SDK 키가 없거나 로드에 실패하면 지도 대신 안내 placeholder를 보여준다 (개발 환경 fallback)
 */
export default function MediaMap({
  mediaList,
  selectedMediaId,
  onSelectMedia,
  className,
}: MediaMapProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<kakao.maps.Map | null>(null)
  const overlaysRef = useRef(
    new Map<string, { overlay: kakao.maps.CustomOverlay; el: HTMLElement }>(),
  )
  const [status, setStatus] = useState<MapStatus>('loading')

  // 핀 클릭 리스너가 항상 최신 콜백을 부르도록 ref 경유 (오버레이 DOM은 재생성하지 않으므로)
  const onSelectMediaRef = useRef(onSelectMedia)
  onSelectMediaRef.current = onSelectMedia

  const [sido, setSido] = useState(REGIONS[0].name)
  const region = REGIONS.find((r) => r.name === sido) ?? REGIONS[0]
  const [sigungu, setSigungu] = useState(region.districts[0].name)

  // 지도 생성 (mount 1회) — 초기 위치는 첫 지역의 첫 시/군/구
  useEffect(() => {
    let cancelled = false
    loadKakaoMaps().then((sdk) => {
      if (cancelled) return
      if (!sdk || !containerRef.current) {
        setStatus('unavailable')
        return
      }
      const initial = REGIONS[0].districts[0]
      mapRef.current = new sdk.maps.Map(containerRef.current, {
        center: new sdk.maps.LatLng(initial.lat, initial.lng),
        level: SIGUNGU_LEVEL,
      })
      setStatus('ready')
    })
    return () => {
      cancelled = true
    }
  }, [])

  // 매체 → 핀 오버레이 생성 (이미 만든 핀은 재사용 — 선택 변경 시 클래스만 토글)
  useEffect(() => {
    const map = mapRef.current
    const sdk = window.kakao
    if (status !== 'ready' || !map || !sdk?.maps) return

    const overlays = overlaysRef.current
    mediaList.forEach((media) => {
      if (overlays.has(media.id)) return

      const el = document.createElement('button')
      el.type = 'button'
      el.className = pinClass(false)
      el.setAttribute('aria-label', `${media.name} 선택`)
      const img = document.createElement('img')
      img.src = media.thumbnail
      img.alt = ''
      img.className = 'size-[24px] rounded-full object-cover'
      el.appendChild(img)
      el.addEventListener('click', () => onSelectMediaRef.current(media.id))

      const overlay = new sdk.maps.CustomOverlay({
        position: new sdk.maps.LatLng(media.lat, media.lng),
        content: el,
        yAnchor: 0.5,
      })
      overlay.setMap(map)
      overlays.set(media.id, { overlay, el })
    })
  }, [status, mediaList])

  // unmount 시 오버레이 정리
  useEffect(() => {
    const overlays = overlaysRef.current
    return () => {
      overlays.forEach(({ overlay }) => overlay.setMap(null))
      overlays.clear()
    }
  }, [])

  // 선택 동기화 — 핀 링 색 토글 + 선택 매체로 지도 이동
  useEffect(() => {
    if (status !== 'ready') return
    overlaysRef.current.forEach(({ overlay, el }, id) => {
      const selected = id === selectedMediaId
      el.className = pinClass(selected)
      overlay.setZIndex(selected ? 10 : 1)
    })
    const selected = mediaList.find((media) => media.id === selectedMediaId)
    const sdk = window.kakao
    if (selected && mapRef.current && sdk?.maps) {
      mapRef.current.panTo(new sdk.maps.LatLng(selected.lat, selected.lng))
    }
  }, [status, selectedMediaId, mediaList])

  const moveTo = (lat: number, lng: number, level: number) => {
    const map = mapRef.current
    const sdk = window.kakao
    if (!map || !sdk?.maps) return
    map.setLevel(level)
    map.setCenter(new sdk.maps.LatLng(lat, lng))
  }

  const handleSidoChange = (name: string) => {
    const next = REGIONS.find((r) => r.name === name)
    if (!next) return
    setSido(name)
    setSigungu(next.districts[0].name)
    moveTo(next.lat, next.lng, SIDO_LEVEL)
  }

  const handleSigunguChange = (name: string) => {
    const district = region.districts.find((d) => d.name === name)
    if (!district) return
    setSigungu(name)
    moveTo(district.lat, district.lng, SIGUNGU_LEVEL)
  }

  return (
    <div className={['relative', className].filter(Boolean).join(' ')}>
      <div ref={containerRef} className="absolute inset-0" />

      {status !== 'ready' && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-x2 bg-bg-primary">
          {status === 'unavailable' && (
            <>
              <p className="text-body-1-normal-bold text-text-secondary">
                지도를 불러올 수 없습니다
              </p>
              <p className="px-x5 text-center text-label-1-normal-regular text-text-caption">
                VITE_KAKAO_MAP_APP_KEY 설정과 카카오 개발자 콘솔의 사이트
                도메인 등록을 확인해 주세요.
              </p>
            </>
          )}
        </div>
      )}

      {/* 지역 이동 드롭다운 — 지도 좌상단 (리스트 패널 오른쪽) */}
      <div className="absolute left-x3 top-x3 z-10 flex gap-x2">
        <div className="w-[120px]">
          <Dropdown
            size="medium"
            aria-label="시/도 선택"
            options={REGIONS.map((r) => ({ value: r.name, label: r.name }))}
            value={sido}
            onChange={handleSidoChange}
            disabled={status !== 'ready'}
          />
        </div>
        <div className="w-[120px]">
          <Dropdown
            size="medium"
            aria-label="시/군/구 선택"
            options={region.districts.map((d) => ({
              value: d.name,
              label: d.name,
            }))}
            value={sigungu}
            onChange={handleSigunguChange}
            disabled={status !== 'ready'}
          />
        </div>
      </div>
    </div>
  )
}
