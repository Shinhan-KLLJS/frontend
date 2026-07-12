import type { HTMLAttributes } from 'react'

export interface LoadingSpinnerProps extends HTMLAttributes<HTMLDivElement> {
  progress?: number
  showLabel?: boolean
}

const SIZE = 48
const STROKE = 2.4
const RADIUS = (SIZE - STROKE) / 2
const CIRCUMFERENCE = 2 * Math.PI * RADIUS

/* ── 로딩스피너 ── */
export default function LoadingSpinner({
  progress = 0,
  showLabel = true,
  className,
  ...props
}: LoadingSpinnerProps) {
  const clamped = Number.isFinite(progress)
    ? Math.min(100, Math.max(0, progress))
    : 0
  return (
    <div
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round(clamped)}
      className={[
        'font-sans relative flex size-[48px] items-center justify-center',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      {...props}
    >
      <svg
        viewBox={`0 0 ${SIZE} ${SIZE}`}
        fill="none"
        aria-hidden="true"
        className="absolute inset-0 -rotate-90"
      >
        <circle
          cx={SIZE / 2}
          cy={SIZE / 2}
          r={RADIUS}
          stroke="var(--color-line-secondary)"
          strokeWidth={STROKE}
        />
        <circle
          cx={SIZE / 2}
          cy={SIZE / 2}
          r={RADIUS}
          stroke="var(--color-line-brand)"
          strokeWidth={STROKE}
          strokeDasharray={CIRCUMFERENCE}
          strokeDashoffset={CIRCUMFERENCE * (1 - clamped / 100)}
          className="transition-[stroke-dashoffset] duration-300 ease-out"
        />
      </svg>
      {showLabel && (
        <span className="text-caption-1-medium text-text-primary">
          {Math.round(clamped)}%
        </span>
      )}
    </div>
  )
}
