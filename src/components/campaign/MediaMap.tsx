import { useEffect, useRef, useState } from 'react'
import { Minus, Plus } from 'lucide-react'
import { Button, Dropdown } from '@/components/ui'
import { ALL_SIGUNGU } from '@/lib/campaign'
import type { CampaignMedia, MediaRegion } from '@/lib/campaign'
import { loadKakaoMaps } from '@/lib/kakaoMap'
import { DEFAULT_MAP_CENTER, findRegionCoords } from '@/lib/regions'

export interface MediaMapProps {
  mediaList: CampaignMedia[]
  /** 시/도·시/군/구 옵션 (API). 시/군/구는 앞에 '전체'를 덧붙여 노출 */
  regions: MediaRegion[]
  sido: string
  sigungu: string
  onSidoChange: (sido: string) => void
  onSigunguChange: (sigungu: string) => void
  selectedMediaId: string | null
  onSelectMedia: (media: CampaignMedia) => void
  className?: string
}

// 확대 레벨 — 시/도는 광역, 시/군/구는 동 단위가 보이는 수준
const SIDO_LEVEL = 8
const SIGUNGU_LEVEL = 5

/**
 * 핀 스타일 — CustomOverlay content는 React 밖 DOM이라 클래스 문자열로 관리.
 * 24px 이미지 + border-4(기본 cool-neutral-700, 선택 line-brand, 미가용 line-disabled).
 * size-[32px] + border-4(border-box) → 이미지 영역 24px. bg는 이미지 깨질 때 fallback.
 */
function pinClass(selected: boolean, available: boolean): string {
  return [
    'block size-[32px] shrink-0 cursor-pointer overflow-hidden rounded-full border-4 bg-[var(--cool-neutral-500)] shadow-normal-small transition-colors',
    selected
      ? 'border-line-brand'
      : available
        ? 'border-[var(--cool-neutral-700)]'
        : 'border-line-disabled',
  ].join(' ')
}

type MapStatus = 'loading' | 'ready' | 'unavailable'

/**
 * 매체 선택 지도 — 카카오맵 + 매체 썸네일 핀(CustomOverlay) + 지역 이동 드롭다운.
 * 필터(지역/검색)는 부모가 소유하고, 여기선 전달받은 mediaList를 핀으로 그린다.
 * 목록이 바뀌면 핀을 갱신하고 결과 범위로 지도를 맞춘다. SDK 키가 없으면 안내 placeholder.
 */
export default function MediaMap({
  mediaList,
  regions,
  sido,
  sigungu,
  onSidoChange,
  onSigunguChange,
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

  // 핀 클릭 리스너가 항상 최신 값을 부르도록 ref 경유 (오버레이 DOM은 재생성하지 않으므로)
  const onSelectMediaRef = useRef(onSelectMedia)
  onSelectMediaRef.current = onSelectMedia
  const mediaListRef = useRef(mediaList)
  mediaListRef.current = mediaList

  const currentRegion = regions.find((r) => r.sido === sido)
  const sigunguOptions = [ALL_SIGUNGU, ...(currentRegion?.sigungu ?? [])]

  // 지도 생성 (mount 1회) — 초기 위치는 기본 중심
  useEffect(() => {
    let cancelled = false
    loadKakaoMaps().then((sdk) => {
      if (cancelled) return
      if (!sdk || !containerRef.current) {
        setStatus('unavailable')
        return
      }
      mapRef.current = new sdk.maps.Map(containerRef.current, {
        center: new sdk.maps.LatLng(
          DEFAULT_MAP_CENTER.lat,
          DEFAULT_MAP_CENTER.lng,
        ),
        level: SIGUNGU_LEVEL,
      })
      setStatus('ready')
    })
    return () => {
      cancelled = true
    }
  }, [])

  // 매체 → 핀 오버레이 동기화 (목록에 없어진 핀 제거 + 새 핀 추가)
  useEffect(() => {
    const map = mapRef.current
    const sdk = window.kakao
    if (status !== 'ready' || !map || !sdk?.maps) return

    const overlays = overlaysRef.current
    const nextIds = new Set(mediaList.map((m) => m.id))
    overlays.forEach((entry, id) => {
      if (!nextIds.has(id)) {
        entry.overlay.setMap(null)
        overlays.delete(id)
      }
    })
    mediaList.forEach((media) => {
      if (overlays.has(media.id)) return
      const el = document.createElement('button')
      el.type = 'button'
      el.className = pinClass(media.id === selectedMediaId, media.available)
      el.setAttribute('aria-label', `${media.name} 선택`)
      // 깨지거나 없는 photoUrl이면 이미지를 숨겨 중립 배경(fallback)만 남긴다
      const img = document.createElement('img')
      img.src = media.thumbnail
      img.alt = ''
      img.className = 'size-full object-cover'
      img.onerror = () => {
        img.style.display = 'none'
      }
      el.appendChild(img)
      el.addEventListener('click', () => onSelectMediaRef.current(media))

      const overlay = new sdk.maps.CustomOverlay({
        position: new sdk.maps.LatLng(media.lat, media.lng),
        content: el,
        yAnchor: 0.5,
      })
      overlay.setMap(map)
      overlays.set(media.id, { overlay, el })
    })
  }, [status, mediaList, selectedMediaId])

  // 목록(필터 결과)이 바뀌면 결과 매체가 모두 보이도록 지도 범위를 맞춘다
  useEffect(() => {
    const map = mapRef.current
    const sdk = window.kakao
    if (status !== 'ready' || !map || !sdk?.maps || mediaList.length === 0) return
    const bounds = new sdk.maps.LatLngBounds()
    mediaList.forEach((m) => bounds.extend(new sdk.maps.LatLng(m.lat, m.lng)))
    map.setBounds(bounds)
  }, [status, mediaList])

  // unmount 시 오버레이 정리
  useEffect(() => {
    const overlays = overlaysRef.current
    return () => {
      overlays.forEach(({ overlay }) => overlay.setMap(null))
      overlays.clear()
    }
  }, [])

  // 선택 핀 강조 (핀 재생성 대비 mediaList도 의존)
  useEffect(() => {
    if (status !== 'ready') return
    overlaysRef.current.forEach(({ overlay, el }, id) => {
      const selected = id === selectedMediaId
      const available =
        mediaListRef.current.find((m) => m.id === id)?.available ?? true
      el.className = pinClass(selected, available)
      overlay.setZIndex(selected ? 10 : 1)
    })
  }, [status, selectedMediaId, mediaList])

  // 선택 변경 시(리스트 카드 클릭 포함) 해당 매체로 지도 이동
  useEffect(() => {
    if (status !== 'ready' || !selectedMediaId) return
    const selected = mediaListRef.current.find((m) => m.id === selectedMediaId)
    const sdk = window.kakao
    if (selected && mapRef.current && sdk?.maps) {
      mapRef.current.panTo(new sdk.maps.LatLng(selected.lat, selected.lng))
    }
  }, [status, selectedMediaId])

  const moveTo = (lat: number, lng: number, level: number) => {
    const map = mapRef.current
    const sdk = window.kakao
    if (!map || !sdk?.maps) return
    map.setLevel(level)
    map.setCenter(new sdk.maps.LatLng(lat, lng))
  }

  // 확대(-1)·축소(+1) — 카카오는 레벨이 작을수록 확대
  const handleZoom = (delta: number) => {
    const map = mapRef.current
    if (!map) return
    map.setLevel(map.getLevel() + delta)
  }

  const handleSidoChange = (name: string) => {
    onSidoChange(name)
    const coords = findRegionCoords(name)
    if (coords) moveTo(coords.lat, coords.lng, SIDO_LEVEL)
  }

  const handleSigunguChange = (name: string) => {
    onSigunguChange(name)
    const coords =
      name === ALL_SIGUNGU
        ? findRegionCoords(sido)
        : findRegionCoords(sido, name)
    if (coords) moveTo(coords.lat, coords.lng, SIGUNGU_LEVEL)
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

      {/* 지역 이동 드롭다운 — 리스트 패널(372px) 오른쪽 상단 */}
      <div className="absolute left-[384px] top-x3 z-10 flex gap-x2">
        <div className="w-[120px]">
          <Dropdown
            size="medium"
            aria-label="시/도 선택"
            options={regions.map((r) => ({ value: r.sido, label: r.sido }))}
            value={sido}
            onChange={handleSidoChange}
            disabled={status !== 'ready'}
          />
        </div>
        <div className="w-[120px]">
          <Dropdown
            size="medium"
            aria-label="시/군/구 선택"
            options={sigunguOptions.map((s) => ({ value: s, label: s }))}
            value={sigungu}
            onChange={handleSigunguChange}
            disabled={status !== 'ready'}
          />
        </div>
      </div>

      {/* 확대/축소 버튼 — 지도 우하단 (아이콘 온리 Button, Figma: 흰 배경·line-primary·그림자) */}
      {status === 'ready' && (
        <div className="absolute bottom-[19px] right-[19px] z-10 flex w-[32px] flex-col gap-x1">
          <Button
            iconOnly
            variant="ghost"
            color="secondary"
            size="small"
            leadingIcon={Plus}
            aria-label="지도 확대"
            onClick={() => handleZoom(-1)}
            className="border border-line-primary bg-[var(--cool-neutral-0)] shadow-normal-small"
          />
          <Button
            iconOnly
            variant="ghost"
            color="secondary"
            size="small"
            leadingIcon={Minus}
            aria-label="지도 축소"
            onClick={() => handleZoom(1)}
            className="border border-line-primary bg-[var(--cool-neutral-0)] shadow-normal-small"
          />
        </div>
      )}
    </div>
  )
}
