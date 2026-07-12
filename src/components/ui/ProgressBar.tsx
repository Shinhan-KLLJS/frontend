import type { HTMLAttributes } from 'react'

export interface ProgressBarProps extends HTMLAttributes<HTMLDivElement> {
  steps: string[]
  currentStep?: number
}

/* ── ProgressBar ── */
export default function ProgressBar({
  steps,
  currentStep = 1,
  className,
  ...props
}: ProgressBarProps) {
  const total = steps.length
  const clamped = Math.min(
    Math.max(1, Math.round(currentStep)),
    Math.max(total, 1),
  )
  const ratio = total > 0 ? clamped / total : 0
  return (
    <div
      role="progressbar"
      aria-valuemin={1}
      aria-valuemax={total}
      aria-valuenow={clamped}
      aria-valuetext={steps[clamped - 1]}
      className={['font-sans flex flex-col gap-[6px]', className]
        .filter(Boolean)
        .join(' ')}
      {...props}
    >
      <span className="text-caption-1-bold text-text-caption">
        {steps[clamped - 1]}
      </span>
      <div className="h-[6px] w-full rounded-full bg-chart-surface">
        <div
          className="h-full rounded-full bg-[var(--blue-400)] transition-[width] duration-300 ease-out"
          style={{ width: `${ratio * 100}%` }}
        />
      </div>
    </div>
  )
}
