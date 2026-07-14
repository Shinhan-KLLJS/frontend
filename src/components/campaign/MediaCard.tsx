import type { CampaignMedia } from '@/lib/campaign'

export interface MediaCardProps {
  media: CampaignMedia
  selected: boolean
  onSelect: () => void
}

/** 매체 카드 — 썸네일/매체명/주소/해상도/형태 태그, 선택 시 회색 하이라이트 */
export default function MediaCard({
  media,
  selected,
  onSelect,
}: MediaCardProps) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      onClick={onSelect}
      className={[
        'flex w-full cursor-pointer items-center gap-x2 rounded-x2 p-x2 text-left transition-colors',
        selected ? 'bg-bg-primary' : 'bg-bg-secondary interaction-light',
      ].join(' ')}
    >
      <img
        src={media.thumbnail}
        alt=""
        className="h-[92px] w-[70px] shrink-0 rounded-x1 object-cover"
      />
      <span className="flex min-w-0 flex-1 flex-col gap-x1">
        <span className="flex flex-col">
          <span className="truncate text-body-1-normal-bold text-text-primary">
            {media.name}
          </span>
          <span className="text-label-1-normal-regular text-text-caption">
            {media.address}
          </span>
        </span>
        <span className="flex flex-col gap-x2">
          <span className="flex items-center gap-x1">
            <span className="text-caption-1-medium text-text-primary">
              해상도
            </span>
            <span className="text-caption-1-regular text-text-secondary">
              {media.resolution}
            </span>
          </span>
          <span className="flex items-center gap-[6px]">
            {media.types.map((type) => (
              <span
                key={type}
                className={[
                  'rounded-x1 px-[6px] py-xs text-caption-1-medium text-text-secondary',
                  // 선택 하이라이트(bg-primary)와 겹치지 않게 태그 배경을 반전
                  selected ? 'bg-bg-secondary' : 'bg-bg-primary',
                ].join(' ')}
              >
                {type}
              </span>
            ))}
          </span>
        </span>
      </span>
    </button>
  )
}
