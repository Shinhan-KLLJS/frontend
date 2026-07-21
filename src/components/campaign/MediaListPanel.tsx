import { useEffect, useRef } from 'react'
import MediaCard from '@/components/campaign/MediaCard'
import { Button, ScrollArea, SearchBar } from '@/components/ui'
import type { CampaignMedia } from '@/lib/campaign'

export interface MediaListPanelProps {
  /** 지도에 보이는 영역의 매체(부모가 viewport로 필터해 전달) */
  mediaList: CampaignMedia[]
  /** 지역(구) 로딩 중 — 전체 스피너 */
  loading?: boolean
  /** 지역 검색어 — 서버사이드 필터 (부모가 소유) */
  keyword: string
  onKeywordChange: (value: string) => void
  selectedMediaId: string | null
  onSelectMedia: (media: CampaignMedia) => void
  onPrev: () => void
  onNext: () => void
  className?: string
}

/** 매체 선택 좌측 패널 — 지역 검색 + 매체 카드 리스트 + 이전/다음. 필터는 부모가 소유 */
export default function MediaListPanel({
  mediaList,
  loading = false,
  keyword,
  onKeywordChange,
  selectedMediaId,
  onSelectMedia,
  onPrev,
  onNext,
  className,
}: MediaListPanelProps) {
  // 지도 핀으로 선택된 매체가 목록 스크롤 밖에 있으면 안 보여 '선택 안 됨'처럼 보임 —
  // 선택이 바뀌면 해당 카드를 보이는 위치로 스크롤(이미 보이면 block:'nearest'로 no-op)
  const selectedRef = useRef<HTMLButtonElement>(null)
  useEffect(() => {
    if (!selectedMediaId) return
    selectedRef.current?.scrollIntoView({ block: 'nearest', behavior: 'smooth' })
  }, [selectedMediaId])

  return (
    <div
      className={['flex flex-col bg-bg-secondary', className]
        .filter(Boolean)
        .join(' ')}
    >
      <div className="flex min-h-0 flex-1 flex-col gap-x4 rounded-x3 p-x5 pb-0">
        <SearchBar
          value={keyword}
          onChange={onKeywordChange}
          placeholder="원하는 지역을 검색하세요"
          variant="solid"
          aria-label="매체 검색"
        />

        {loading ? (
          <div
            role="status"
            aria-label="매체 목록 불러오는 중"
            className="flex flex-1 items-center justify-center gap-x2"
          >
            <span className="size-x3 animate-bounce rounded-full bg-primary-brand-solid" />
            <span className="size-x3 animate-bounce rounded-full bg-primary-brand-solid [animation-delay:150ms]" />
            <span className="size-x3 animate-bounce rounded-full bg-primary-brand-solid [animation-delay:300ms]" />
          </div>
        ) : (
          <ScrollArea size="small" className="min-h-0 flex-1">
            <div className="flex flex-col gap-x2">
              {mediaList.map((media) => (
                <MediaCard
                  key={media.id}
                  ref={media.id === selectedMediaId ? selectedRef : undefined}
                  media={media}
                  selected={media.id === selectedMediaId}
                  onSelect={() => onSelectMedia(media)}
                />
              ))}
              {mediaList.length === 0 && (
                <p className="p-x2 text-label-1-normal-regular text-text-caption">
                  현재 지도 영역에 매체가 없습니다.
                </p>
              )}
            </div>
          </ScrollArea>
        )}
      </div>

      <div className="flex items-center gap-[6px] p-x5">
        <Button
          variant="line"
          color="secondary"
          size="large"
          className="flex-1"
          onClick={onPrev}
        >
          이전
        </Button>
        <Button
          size="large"
          className="flex-1"
          disabled={!selectedMediaId}
          onClick={onNext}
        >
          다음
        </Button>
      </div>
    </div>
  )
}
