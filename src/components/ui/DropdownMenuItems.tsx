import ScrollArea from './ScrollArea'
import type { DropdownMenuItem } from './DropdownMenu'

interface DropdownMenuItemsProps {
  activeIndex: number
  items: DropdownMenuItem[]
  itemId: (index: number) => string
  maxHeight: number
  menuId: string
  menuAriaLabel?: string
  onActivate: (item: DropdownMenuItem) => void
  onHover: (index: number) => void
}

/** 드롭다운의 메뉴 항목 렌더링을 분리해 키보드 제어 컴포넌트의 크기를 제한합니다. */
export default function DropdownMenuItems({
  activeIndex,
  items,
  itemId,
  maxHeight,
  menuId,
  menuAriaLabel,
  onActivate,
  onHover,
}: DropdownMenuItemsProps) {
  return (
    <ScrollArea
      size="small"
      maxHeight={maxHeight}
      role="menu"
      id={menuId}
      aria-label={menuAriaLabel}
    >
      {items.map((item, index) => {
        const itemClass = [
          'flex h-[36px] w-full items-center rounded-x2 p-x2 text-label-1-normal-regular select-none',
          item.disabled
            ? 'text-text-disabled'
            : item.tone === 'negative'
              ? 'cursor-pointer text-text-negative interaction-normal'
              : 'cursor-pointer text-text-primary interaction-normal',
          !item.disabled && index === activeIndex ? 'bg-bg-primary' : '',
        ]
          .filter(Boolean)
          .join(' ')

        return (
          <button
            key={item.key}
            id={itemId(index)}
            type="button"
            role="menuitem"
            tabIndex={-1}
            disabled={item.disabled}
            className={itemClass}
            onClick={() => onActivate(item)}
            onMouseEnter={() => !item.disabled && onHover(index)}
          >
            <span className="min-w-0 flex-1 truncate text-left">
              {item.label}
            </span>
          </button>
        )
      })}
    </ScrollArea>
  )
}
