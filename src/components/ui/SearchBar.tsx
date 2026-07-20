import { useEffect, useId, useMemo, useRef, useState } from 'react'
import type {
  CSSProperties,
  ComponentPropsWithoutRef,
  FocusEvent,
  KeyboardEvent,
} from 'react'
import { Search } from 'lucide-react'
import { Icon, ScrollArea } from '@/components/ui'

export interface SearchResultItem {
  id: string
  label: string
}

export type SearchBarResult = string | SearchResultItem

export interface SearchBarProps extends Omit<
  ComponentPropsWithoutRef<'input'>,
  'value' | 'onChange' | 'onSelect' | 'results' | 'size'
> {
  value: string
  onChange: (value: string) => void
  results?: SearchBarResult[]
  onSelect?: (result: SearchResultItem) => void
  defaultOpen?: boolean
  listMaxHeight?: CSSProperties['maxHeight']
  /** solid=채운 배경(bg-primary) · line=테두리형(border). 기본 solid */
  variant?: 'solid' | 'line'
  className?: string
}

/**
 * 서치바 : 검색 인풋(돋보기 + placeholder) + 검색 결과 드롭다운 패널
 * - 키보드 ↑↓ 하이라이트 이동 · Enter 선택 · Escape 닫기. 외부 클릭 시 닫힘.
 */
export default function SearchBar({
  value,
  onChange,
  results,
  onSelect,
  placeholder,
  defaultOpen = false,
  listMaxHeight = 148,
  variant = 'solid',
  className,
  id,
  onFocus,
  onBlur,
  onKeyDown,
  ...inputProps
}: SearchBarProps) {
  const autoId = useId()
  const inputId = id ?? autoId
  const listboxId = `${inputId}-listbox`

  const rootRef = useRef<HTMLDivElement>(null)
  const listRef = useRef<HTMLUListElement>(null)

  const [open, setOpen] = useState(defaultOpen)
  const [focused, setFocused] = useState(false)
  const [highlightedIndex, setHighlightedIndex] = useState(0)

  // 문자열 결과를 {id, label}로 정규화
  const items = useMemo<SearchResultItem[]>(
    () =>
      (results ?? []).map((result, index) =>
        typeof result === 'string'
          ? { id: `${index}-${result}`, label: result }
          : result,
      ),
    [results],
  )

  const showPanel = open && items.length > 0
  const isActive = focused || value.length > 0
  const optionId = (index: number) => `${listboxId}-option-${index}`

  // 열림/입력/결과 변경 시 첫 항목 하이라이트
  useEffect(() => {
    setHighlightedIndex(0)
  }, [open, value, items.length])

  useEffect(() => {
    if (!showPanel) return
    const handleOutsideMouseDown = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleOutsideMouseDown)
    return () =>
      document.removeEventListener('mousedown', handleOutsideMouseDown)
  }, [showPanel])

  // 하이라이트 항목이 스크롤 영역 밖이면 보이게
  useEffect(() => {
    if (!showPanel) return
    listRef.current?.children
      .item(highlightedIndex)
      ?.scrollIntoView({ block: 'nearest' })
  }, [showPanel, highlightedIndex])

  const selectItem = (item: SearchResultItem) => {
    onSelect?.(item)
    setOpen(false)
  }

  const handleFocus = (event: FocusEvent<HTMLInputElement>) => {
    setFocused(true)
    setOpen(true)
    onFocus?.(event)
  }

  const handleBlur = (event: FocusEvent<HTMLInputElement>) => {
    setFocused(false)
    onBlur?.(event)
  }

  // 키보드로 포커스가 컴포넌트 밖으로 나가면 닫기
  const handleRootBlur = (event: FocusEvent<HTMLDivElement>) => {
    if (!event.currentTarget.contains(event.relatedTarget)) {
      setOpen(false)
    }
  }

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'ArrowDown') {
      event.preventDefault()
      if (!showPanel) setOpen(true)
      else setHighlightedIndex((prev) => (prev + 1) % items.length)
    } else if (event.key === 'ArrowUp') {
      event.preventDefault()
      if (showPanel) {
        setHighlightedIndex((prev) => (prev - 1 + items.length) % items.length)
      }
    } else if (event.key === 'Enter') {
      if (showPanel && items[highlightedIndex]) {
        event.preventDefault()
        selectItem(items[highlightedIndex])
      }
    } else if (event.key === 'Escape') {
      if (showPanel) {
        event.preventDefault()
        setOpen(false)
      }
    }
    onKeyDown?.(event)
  }

  return (
    <div
      ref={rootRef}
      onBlur={handleRootBlur}
      className={['relative w-full', className].filter(Boolean).join(' ')}
    >
      {/* 검색 인풋 */}
      <div
        className={[
          'flex h-[36px] w-full items-center gap-[6px] rounded-x2 px-x3 py-x2',
          variant === 'line'
            ? 'border border-line-secondary bg-bg-secondary focus-within:border-line-brand'
            : 'bg-bg-primary',
        ].join(' ')}
      >
        <Icon
          icon={Search}
          size="medium"
          color={isActive ? 'primary' : 'secondary'}
        />
        <input
          id={inputId}
          type="text"
          role="combobox"
          aria-expanded={showPanel}
          aria-controls={showPanel ? listboxId : undefined}
          aria-autocomplete="list"
          aria-activedescendant={
            showPanel && items[highlightedIndex]
              ? optionId(highlightedIndex)
              : undefined
          }
          autoComplete="off"
          value={value}
          placeholder={placeholder}
          onChange={(event) => {
            onChange(event.target.value)
            setOpen(true)
          }}
          onFocus={handleFocus}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          className="min-w-0 flex-1 bg-transparent text-body-1-normal-regular text-text-primary caret-[var(--cool-neutral-800)] outline-none placeholder:text-text-tertiary"
          {...inputProps}
        />
      </div>

      {/* 결과 드롭다운 패널 */}
      {showPanel && (
        <div className="absolute inset-x-0 top-full z-10 mt-x2 rounded-x3 bg-bg-secondary p-x4 shadow-normal-small">
          <ScrollArea size="small" maxHeight={listMaxHeight}>
            <ul
              ref={listRef}
              id={listboxId}
              role="listbox"
              className="flex flex-col gap-x2"
            >
              {items.map((item, index) => {
                const isHighlighted = index === highlightedIndex
                return (
                  <li
                    key={item.id}
                    id={optionId(index)}
                    role="option"
                    aria-selected={isHighlighted}
                    className="relative cursor-pointer rounded-x2 p-x2"
                    onMouseEnter={() => setHighlightedIndex(index)}
                    onMouseDown={(event) => event.preventDefault()}
                    onClick={() => selectItem(item)}
                  >
                    <p className="truncate text-heading-2-regular text-text-secondary">
                      {item.label}
                    </p>
                    {isHighlighted && (
                      <span
                        aria-hidden="true"
                        className="pointer-events-none absolute inset-0 rounded-x2 bg-[var(--cool-neutral-1000)] opacity-[var(--interaction-normal-hover)]"
                      />
                    )}
                  </li>
                )
              })}
            </ul>
          </ScrollArea>
        </div>
      )}
    </div>
  )
}
