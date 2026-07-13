import type { HTMLAttributes, ReactNode } from 'react'
import { ArrowDownRight, ArrowUpRight } from 'lucide-react'
import { Icon } from '@/components/ui'

// Small 20 · Medium 24 · Large 28 (높이 px)
export const BADGE_SIZE = ['small', 'medium', 'large'] as const
export type BadgeSize = (typeof BADGE_SIZE)[number]

export const BADGE_DIRECTION = ['up', 'down'] as const
export type BadgeDirection = (typeof BADGE_DIRECTION)[number]

const SIZE_STYLE: Record<BadgeSize, { text: string; icon: number }> = {
  small: { text: 'text-caption-1-bold', icon: 16 },
  medium: { text: 'text-label-1-normal-bold', icon: 16 },
  large: { text: 'text-body-1-normal-bold', icon: 20 },
}

// 방향별 화살표 + 색 - Up=Positive, Down=Negative
const DIRECTION_STYLE: Record<
  BadgeDirection,
  { icon: typeof ArrowUpRight; container: string }
> = {
  up: { icon: ArrowUpRight, container: 'bg-bg-positive text-line-positive' },
  down: {
    icon: ArrowDownRight,
    container: 'bg-bg-negative text-line-negative',
  },
}

export interface BadgeProps extends Omit<
  HTMLAttributes<HTMLSpanElement>,
  'children'
> {
  direction?: BadgeDirection
  size?: BadgeSize
  children: ReactNode
}

// KPI 등락 배지 - Size(Small/Medium/Large) × Property(Up/Down)
export default function Badge({
  direction = 'up',
  size = 'medium',
  children,
  className,
  ...props
}: BadgeProps) {
  const { icon, container } = DIRECTION_STYLE[direction]

  return (
    <span
      className={[
        'font-sans inline-flex items-center rounded-full px-[6px] py-xs whitespace-nowrap',
        SIZE_STYLE[size].text,
        container,
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      {...props}
    >
      <Icon
        icon={icon}
        size={SIZE_STYLE[size].icon}
        label={direction === 'up' ? '상승' : '하락'}
      />
      {children}%
    </span>
  )
}
