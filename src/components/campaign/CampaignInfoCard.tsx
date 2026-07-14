import { Image } from 'lucide-react'
import { Icon } from '@/components/ui'

interface CampaignInfoCardProps {
  title: string
  fields: { label: string; value: string }[]
  tags?: string[]
}

/** 피그마의 정보 확인 모달에서 공통으로 쓰는 카드형 정보 묶음입니다. */
export default function CampaignInfoCard({
  title,
  fields,
  tags = [],
}: CampaignInfoCardProps) {
  return (
    <article className="flex min-w-0 flex-1 flex-col gap-x4 rounded-[16px] bg-bg-primary p-x4">
      <div className="flex h-[168px] items-center justify-center rounded-x3 bg-bg-tertiary text-text-caption">
        <Icon icon={Image} size="large" />
      </div>
      <span className="w-fit rounded-x2 bg-[var(--blue-100)] px-x2 py-xs text-body-1-normal-bold text-[var(--blue-400)]">
        {title}
      </span>
      <dl className="flex flex-col gap-x3">
        {fields.map((field) => (
          <div key={field.label} className="flex items-center justify-between gap-x3">
            <dt className="shrink-0 text-body-1-normal-regular text-text-secondary">
              {field.label}
            </dt>
            <dd className="truncate text-right text-body-1-normal-medium text-text-primary">
              {field.value}
            </dd>
          </div>
        ))}
        {tags.length > 0 && (
          <div className="flex items-center justify-between gap-x3">
            <dt className="shrink-0 text-body-1-normal-regular text-text-secondary">
              추가 정보
            </dt>
            <dd className="flex flex-wrap justify-end gap-x1">
              {tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-[6px] bg-bg-tertiary px-[6px] py-xs text-label-1-normal-bold text-text-secondary"
                >
                  {tag}
                </span>
              ))}
            </dd>
          </div>
        )}
      </dl>
    </article>
  )
}
