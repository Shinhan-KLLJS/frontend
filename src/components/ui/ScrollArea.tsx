import type { CSSProperties, ComponentPropsWithoutRef } from 'react'

// Scroll Bar (medium 7 · small 3)
export const SCROLLBAR_SIZE = {
  small: 9,
  medium: 13,
} as const
export type ScrollAreaSize = keyof typeof SCROLLBAR_SIZE
export type ScrollAreaAxis = 'vertical' | 'horizontal' | 'both'

export interface ScrollAreaProps extends ComponentPropsWithoutRef<'div'> {
  size?: ScrollAreaSize
  axis?: ScrollAreaAxis
  maxHeight?: CSSProperties['maxHeight']
  maxWidth?: CSSProperties['maxWidth']
}

const AXIS_CLASS: Record<ScrollAreaAxis, string> = {
  vertical: 'overflow-y-auto overflow-x-hidden',
  horizontal: 'overflow-x-auto overflow-y-hidden',
  both: 'overflow-auto',
}

// 스크롤바 스타일은 src/styles/scrollbar.css의 @utility 참고
const SIZE_CLASS: Record<ScrollAreaSize, string> = {
  medium: 'scrollbar-medium',
  small: 'scrollbar-small',
}

// 커스텀 스크롤바 스크롤 컨테이너
export default function ScrollArea({
  size = 'medium',
  axis = 'vertical',
  maxHeight,
  maxWidth,
  className,
  style,
  children,
  ...props
}: ScrollAreaProps) {
  const classes = [AXIS_CLASS[axis], SIZE_CLASS[size], className]
    .filter(Boolean)
    .join(' ')

  return (
    <div
      className={classes}
      style={{ maxHeight, maxWidth, ...style }}
      {...props}
    >
      {children}
    </div>
  )
}
