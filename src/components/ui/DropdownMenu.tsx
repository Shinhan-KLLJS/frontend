import { useEffect, useId, useRef, useState } from 'react'
import type { KeyboardEvent, ReactNode } from 'react'
import DropdownMenuItems from './DropdownMenuItems'

export interface DropdownMenuItem {
  key: string
  label: string
  onSelect?: () => void
  disabled?: boolean
  tone?: 'default' | 'negative'
}

export interface DropdownMenuProps {
  items: DropdownMenuItem[]
  renderTrigger: (open: boolean) => ReactNode
  triggerClassName?: string
  triggerAriaLabel?: string
  align?: 'start' | 'end'
  maxVisible?: number
  menuAriaLabel?: string
  className?: string
}

const ITEM_HEIGHT = 36

/** 액션을 실행하는 드롭다운 메뉴입니다. */
export default function DropdownMenu({
  items,
  renderTrigger,
  triggerClassName,
  triggerAriaLabel,
  align = 'end',
  maxVisible = 8,
  menuAriaLabel,
  className,
}: DropdownMenuProps) {
  const autoId = useId()
  const menuId = `${autoId}-menu`
  const itemId = (index: number) => `${autoId}-item-${index}`

  const rootRef = useRef<HTMLDivElement>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)

  const [open, setOpen] = useState(false)
  const [activeIndex, setActiveIndex] = useState(-1)

  const enabledIndexes = items
    .map((item, index) => (item.disabled ? -1 : index))
    .filter((index) => index >= 0)

  const openMenu = (initialIndex = -1) => {
    setActiveIndex(initialIndex)
    setOpen(true)
  }
  const closeMenu = () => setOpen(false)

  const activate = (item: DropdownMenuItem) => {
    if (item.disabled) return
    closeMenu()
    triggerRef.current?.focus()
    item.onSelect?.()
  }

  const moveActive = (dir: 1 | -1) => {
    if (enabledIndexes.length === 0) return
    const pos = enabledIndexes.indexOf(activeIndex)
    const nextPos =
      pos === -1
        ? dir === 1
          ? 0
          : enabledIndexes.length - 1
        : Math.min(Math.max(pos + dir, 0), enabledIndexes.length - 1)
    setActiveIndex(enabledIndexes[nextPos])
  }

  // 외부 클릭 시 닫기
  useEffect(() => {
    if (!open) return
    const onPointerDown = (event: PointerEvent) => {
      if (rootRef.current && !rootRef.current.contains(event.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('pointerdown', onPointerDown)
    return () => document.removeEventListener('pointerdown', onPointerDown)
  }, [open])

  // 키보드 탐색 시 활성 항목이 보이도록 스크롤
  useEffect(() => {
    if (!open || activeIndex < 0) return
    document
      .getElementById(itemId(activeIndex))
      ?.scrollIntoView({ block: 'nearest' })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, activeIndex])

  const handleTriggerKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
    if (!open) {
      if (event.key === 'ArrowUp') {
        event.preventDefault()
        openMenu(enabledIndexes[enabledIndexes.length - 1] ?? -1)
      } else if (['ArrowDown', 'Enter', ' '].includes(event.key)) {
        event.preventDefault()
        openMenu(enabledIndexes[0] ?? -1)
      }
      return
    }
    switch (event.key) {
      case 'Escape':
        event.preventDefault()
        closeMenu()
        break
      case 'Tab':
        closeMenu()
        break
      case 'ArrowDown':
        event.preventDefault()
        moveActive(1)
        break
      case 'ArrowUp':
        event.preventDefault()
        moveActive(-1)
        break
      case 'Home':
        event.preventDefault()
        if (enabledIndexes.length > 0) setActiveIndex(enabledIndexes[0])
        break
      case 'End':
        event.preventDefault()
        if (enabledIndexes.length > 0)
          setActiveIndex(enabledIndexes[enabledIndexes.length - 1])
        break
      case 'Enter':
      case ' ':
        event.preventDefault()
        if (activeIndex >= 0) activate(items[activeIndex])
        break
      default:
        break
    }
  }

  return (
    <div
      ref={rootRef}
      className={['relative inline-flex font-sans', className]
        .filter(Boolean)
        .join(' ')}
    >
      <button
        ref={triggerRef}
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={open ? menuId : undefined}
        aria-activedescendant={
          open && activeIndex >= 0 ? itemId(activeIndex) : undefined
        }
        aria-label={triggerAriaLabel}
        className={['cursor-pointer outline-none', triggerClassName]
          .filter(Boolean)
          .join(' ')}
        onClick={() => (open ? closeMenu() : openMenu())}
        onKeyDown={handleTriggerKeyDown}
      >
        {renderTrigger(open)}
      </button>

      {open && (
        <div
          className={[
            'absolute top-full z-50 mt-x1 w-max min-w-[120px] max-w-[460px]',
            'rounded-x3 border border-line-tertiary bg-bg-secondary px-x2 py-x3 shadow-normal-small',
            align === 'end' ? 'right-0' : 'left-0',
          ].join(' ')}
        >
          <DropdownMenuItems
            activeIndex={activeIndex}
            items={items}
            itemId={itemId}
            maxHeight={maxVisible * ITEM_HEIGHT}
            menuId={menuId}
            menuAriaLabel={menuAriaLabel}
            onActivate={activate}
            onHover={setActiveIndex}
          />
        </div>
      )}
    </div>
  )
}
