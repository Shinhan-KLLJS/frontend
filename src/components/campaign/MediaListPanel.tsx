import { type UIEvent } from 'react'
import MediaCard from '@/components/campaign/MediaCard'
import { Button, ScrollArea, SearchBar } from '@/components/ui'
import type { CampaignMedia } from '@/lib/campaign'

// 스크롤이 하단 이 거리(px) 안에 들어오면 다음 페이지를 요청한다
const LOAD_THRESHOLD_PX = 160

export interface MediaListPanelProps {
  /** 지금까지 받은 매체(무한 스크롤로 누적) */
  mediaList: CampaignMedia[]
  /** 첫 페이지 로딩 중 — 전체 스피너 */
  loading?: boolean
  /** 다음 페이지가 남았는지 — 스크롤 하단에서 onLoadMore 트리거 */
  hasMore?: boolean
  /** 다음 페이지 요청 중 — 중복 요청 방지 + 하단 인디케이터 */
  loadingMore?: boolean
  onLoadMore?: () => void
  /** 지역 검색어 — 서버사이드 필터 (부모가 소유) */
  keyword: string
  onKeywordChange: (value: string) => void
  selectedMediaId: string | null
  onSelectMedia: (media: CampaignMedia) => void
  onPrev: () => void
  onNext: () => void
  className?: string
}

/** 매체 선택 좌측 패널 — 지역 검색 + 매체 카드 리스트(무한 스크롤) + 이전/다음. 필터·페이징은 부모가 소유 */
export default function MediaListPanel({
  mediaList,
  loading = false,
  hasMore = false,
  loadingMore = false,
  onLoadMore,
  keyword,
  onKeywordChange,
  selectedMediaId,
  onSelectMedia,
  onPrev,
  onNext,
  className,
}: MediaListPanelProps) {
  // 스크롤이 하단 근처에 오면 다음 페이지 요청 (요청 중이면 중복 방지)
  const handleScroll = (e: UIEvent<HTMLDivElement>) => {
    if (!hasMore || loadingMore) return
    const el = e.currentTarget
    if (el.scrollHeight - el.scrollTop - el.clientHeight <= LOAD_THRESHOLD_PX) {
      onLoadMore?.()
    }
  }

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
          <ScrollArea
            size="small"
            className="min-h-0 flex-1"
            onScroll={handleScroll}
          >
            <div className="flex flex-col gap-x2">
              {mediaList.map((media) => (
                <MediaCard
                  key={media.id}
                  media={media}
                  selected={media.id === selectedMediaId}
                  onSelect={() => onSelectMedia(media)}
                />
              ))}
              {mediaList.length === 0 && (
                <p className="p-x2 text-label-1-normal-regular text-text-caption">
                  검색 결과가 없습니다.
                </p>
              )}
              {loadingMore && (
                <div
                  role="status"
                  aria-label="매체 더 불러오는 중"
                  className="flex items-center justify-center gap-x2 py-x3"
                >
                  <span className="size-x2 animate-bounce rounded-full bg-primary-brand-solid" />
                  <span className="size-x2 animate-bounce rounded-full bg-primary-brand-solid [animation-delay:150ms]" />
                  <span className="size-x2 animate-bounce rounded-full bg-primary-brand-solid [animation-delay:300ms]" />
                </div>
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
