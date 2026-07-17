import { useEffect, useState } from 'react'
import { ImageOff } from 'lucide-react'
import type { CampaignMedia } from '@/lib/campaign'

export interface MediaCardProps {
  media: CampaignMedia
  selected: boolean
  onSelect: () => void
}

/** 매체 카드 — 썸네일/매체명/주소/해상도/형태 태그. 호버·선택 스타일은 카드 자체에만 */
export default function MediaCard({
  media,
  selected,
  onSelect,
}: MediaCardProps) {
  const [imgError, setImgError] = useState(false)
  // 썸네일 URL이 바뀌면(같은 카드 인스턴스 재사용) 이전 에러 상태를 리셋
  useEffect(() => setImgError(false), [media.thumbnail])

  return (
    <button
      type="button"
      aria-pressed={selected}
      onClick={onSelect}
      className={[
        'flex w-full cursor-pointer items-center gap-x2 rounded-x2 p-x2 text-left transition-colors',
        selected ? 'bg-primary-brand-weak' : 'bg-bg-secondary',
      ].join(' ')}
    >
      {imgError || !media.thumbnail ? (
        <div className="flex h-[92px] w-[70px] shrink-0 items-center justify-center rounded-x1 bg-bg-tertiary">
          <ImageOff size={20} className="text-text-caption" />
        </div>
      ) : (
        <img
          src={media.thumbnail}
          alt=""
          onError={() => setImgError(true)}
          className="h-[92px] w-[70px] shrink-0 rounded-x1 object-cover"
        />
      )}
      <span className="flex min-w-0 flex-1 flex-col gap-x1">
        <span className="flex flex-col">
          <span
            className={[
              'truncate text-body-1-normal-bold',
              selected ? 'text-text-brand' : 'text-text-primary',
            ].join(' ')}
          >
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
                className={
                  'rounded-x1 px-[6px] py-xs text-caption-1-medium text-text-secondary bg-bg-primary'
                }
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
