import { Chip } from '@/components/ui'

export const GENDER_FILTERS = ['all', 'male', 'female'] as const
export type GenderFilter = (typeof GENDER_FILTERS)[number]

const FILTER_LABEL: Record<GenderFilter, string> = {
  all: '전체',
  male: '남성',
  female: '여성',
}

export interface GenderFilterChipsProps {
  value: GenderFilter
  onChange: (value: GenderFilter) => void
  label: string
}

/** 성별 기준을 선택하는 공통 필터 칩 묶음입니다. */
export default function GenderFilterChips({
  value,
  onChange,
  label,
}: GenderFilterChipsProps) {
  return (
    <div className="flex items-center gap-x1" role="group" aria-label={label}>
      {GENDER_FILTERS.map((filter) => (
        <Chip
          key={filter}
          size="small"
          selected={value === filter}
          onClick={() => onChange(filter)}
        >
          {FILTER_LABEL[filter]}
        </Chip>
      ))}
    </div>
  )
}
