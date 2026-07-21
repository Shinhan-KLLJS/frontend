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
  if (total === 0) return null

  const safeCurrentStep = Number.isFinite(currentStep) ? currentStep : 1
  const clamped = Math.min(Math.max(1, Math.round(safeCurrentStep)), total)
  const ratio = clamped / total
  return (
    <div
      role="progressbar"
      aria-valuemin={1}
      aria-valuemax={total}
      aria-valuenow={clamped}
      aria-valuetext={steps[clamped - 1]}
      className={['font-sans flex flex-col gap-[6px] shrink-0', className]
        .filter(Boolean)
        .join(' ')}
      {...props}
    >
      <span className="text-caption-1-bold text-text-caption">
        {steps[clamped - 1]}
      </span>
      <div className="h-[6px] w-[225px] rounded-full bg-chart-surface">
        <div
          className="h-full rounded-full bg-[var(--blue-400)] transition-[width] duration-300 ease-out"
          style={{ width: `${ratio * 100}%` }}
        />
      </div>
    </div>
  )
}
