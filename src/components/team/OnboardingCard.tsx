import type { ComponentPropsWithoutRef, ElementType, ReactNode } from 'react'

export interface OnboardingCardProps extends ComponentPropsWithoutRef<'form'> {
  as?: ElementType // 폼이 필요한 카드는 'form', 기본은 'section'
  children: ReactNode
}

/**
 * 온보딩 카드 공통 셸
 */
export default function OnboardingCard({
  as: Tag = 'section',
  className,
  children,
  ...rest
}: OnboardingCardProps) {
  return (
    <Tag
      className={[
        'flex flex-col rounded-x6 bg-bg-secondary shadow-normal-large',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      {...rest}
    >
      {children}
    </Tag>
  )
}
