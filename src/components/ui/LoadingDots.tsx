import type { HTMLAttributes } from 'react'

export type LoadingDotsProps = HTMLAttributes<HTMLDivElement>

/** 로딩 점 3개 바운스 인디케이터 — 짧은 대기(업로드/인증 중 등)에 사용 */
export default function LoadingDots({ className, ...props }: LoadingDotsProps) {
  return (
    <div
      aria-hidden="true"
      className={['flex items-center gap-x2', className]
        .filter(Boolean)
        .join(' ')}
      {...props}
    >
      <span className="size-x3 animate-bounce rounded-full bg-primary-brand-solid" />
      <span className="size-x3 animate-bounce rounded-full bg-primary-brand-solid [animation-delay:150ms]" />
      <span className="size-x3 animate-bounce rounded-full bg-primary-brand-solid [animation-delay:300ms]" />
    </div>
  )
}
