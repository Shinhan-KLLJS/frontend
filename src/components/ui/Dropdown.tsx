import { useEffect, useId, useRef, useState } from 'react'
import type { KeyboardEvent } from 'react'
import { ChevronDown } from 'lucide-react'
import Icon from './Icon'
import ScrollArea from './ScrollArea'

export const DROPDOWN_SIZE = ['large', 'medium'] as const
export type DropdownSize = (typeof DROPDOWN_SIZE)[number]

export interface DropdownOption {
  value: string
  label: string
  disabled?: boolean
}

export interface DropdownProps {
  options: DropdownOption[]
  value?: string
  defaultValue?: string
  onChange?: (value: string) => void
  size?: DropdownSize
  placeholder?: string
  disabled?: boolean
  defaultOpen?: boolean
  maxListHeight?: number
  className?: string
  id?: string
  'aria-label'?: string
}

// Size=Large(44px·Heading2/Regular) · Medium(36px·Label1/Regular)
const TRIGGER_SIZE_CLASS: Record<DropdownSize, string> = {
  large: 'h-[44px] gap-x2 px-x4 text-heading-2-regular',
  medium: 'h-[36px] gap-x1 px-x4 text-label-1-normal-regular',
}

const OPTION_SIZE_CLASS: Record<DropdownSize, string> = {
  large: 'text-heading-2-regular',
  medium: 'text-label-1-normal-regular',
}

const CHEVRON_PX: Record<DropdownSize, number> = {
  large: 20,
  medium: 16,
}

/**
 * 드롭다운 (셀렉트) : 트리거 버튼 + 옵션 리스트 팝오버
 * - 제어(value/onChange)·비제어(defaultValue) 모두 지원
 * - 외부 클릭/Escape로 닫힘, 화살표 키 탐색(aria-activedescendant)
 */
export default function Dropdown({
  options,
  value: valueProp,
  defaultValue,
  onChange,
  size = 'large',
  placeholder = '선택',
  disabled = false,
  defaultOpen = false,
  maxListHeight = 240,
  className,
  id,
  'aria-label': ariaLabel,
}: DropdownProps) {
  const autoId = useId()
  const triggerId = id ?? `${autoId}-trigger`
  const listboxId = `${autoId}-listbox`
  const optionId = (index: number) => `${autoId}-option-${index}`

  const rootRef = useRef<HTMLDivElement>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)

  const [open, setOpen] = useState(defaultOpen)
  const [activeIndex, setActiveIndex] = useState(-1)

  // 제어/비제어 값
  const isControlled = valueProp !== undefined
  const [internalValue, setInternalValue] = useState(defaultValue)
  const value = isControlled ? valueProp : internalValue

  const selectedIndex = options.findIndex((option) => option.value === value)
  const selectedOption = selectedIndex >= 0 ? options[selectedIndex] : undefined

  const enabledIndexes = options
    .map((option, index) => (option.disabled ? -1 : index))
    .filter((index) => index >= 0)

  const openList = () => {
    if (disabled) return
    const initial =
      selectedIndex >= 0 && !options[selectedIndex].disabled
        ? selectedIndex
        : (enabledIndexes[0] ?? -1)
    setActiveIndex(initial)
    setOpen(true)
  }

  const closeList = () => setOpen(false)

  const selectOption = (option: DropdownOption) => {
    if (option.disabled) return
    if (!isControlled) setInternalValue(option.value)
    onChange?.(option.value)
    closeList()
    triggerRef.current?.focus()
  }

  // 현재 activeIndex 기준으로 방향(dir)의 다음 활성 옵션으로 이동
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
    const handlePointerDown = (event: PointerEvent) => {
      if (rootRef.current && !rootRef.current.contains(event.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('pointerdown', handlePointerDown)
    return () => document.removeEventListener('pointerdown', handlePointerDown)
  }, [open])

  // 키보드 탐색 시 활성 옵션이 보이도록 스크롤
  useEffect(() => {
    if (!open || activeIndex < 0) return
    document
      .getElementById(optionId(activeIndex))
      ?.scrollIntoView({ block: 'nearest' })
    // optionId는 렌더마다 동일한 autoId 기반이라 의존성에서 제외
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, activeIndex])

  const handleTriggerKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
    if (disabled) return

    if (!open) {
      if (['ArrowDown', 'ArrowUp', 'Enter', ' '].includes(event.key)) {
        event.preventDefault()
        openList()
      }
      return
    }

    switch (event.key) {
      case 'Escape':
        event.preventDefault()
        closeList()
        break
      case 'Tab':
        closeList()
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
        if (activeIndex >= 0) selectOption(options[activeIndex])
        break
      default:
        break
    }
  }

  // 트리거
  const triggerClass = [
    'flex w-full items-center rounded-x2 p-x2 border bg-bg-secondary text-left outline-none transition-colors',
    'cursor-pointer disabled:cursor-not-allowed',
    TRIGGER_SIZE_CLASS[size],
    disabled
      ? 'border-line-disabled bg-bg-disabled text-text-disabled'
      : 'border-line-secondary interaction-normal',
    !disabled && !selectedOption ? 'text-text-placeholder' : '',
    !disabled && selectedOption ? 'text-text-secondary' : '',
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <div
      ref={rootRef}
      className={['relative w-full font-sans', className]
        .filter(Boolean)
        .join(' ')}
    >
      <button
        ref={triggerRef}
        type="button"
        id={triggerId}
        disabled={disabled}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={open ? listboxId : undefined}
        aria-activedescendant={
          open && activeIndex >= 0 ? optionId(activeIndex) : undefined
        }
        aria-label={ariaLabel}
        className={triggerClass}
        onClick={() => (open ? closeList() : openList())}
        onKeyDown={handleTriggerKeyDown}
      >
        <span className="min-w-0 flex-1 truncate">
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <Icon
          icon={ChevronDown}
          size={CHEVRON_PX[size]}
          className={`shrink-0 transition-transform ${open ? 'rotate-180' : ''}`}
        />
      </button>

      {open && (
        // 패널: Drop Down
        <div className="absolute left-0 right-0 top-full z-50 mt-x1 min-w-[160px] rounded-x3 border border-line-tertiary bg-bg-secondary px-x2 py-x3 shadow-normal-small">
          <ScrollArea
            size="small"
            maxHeight={maxListHeight}
            role="listbox"
            id={listboxId}
            aria-label={ariaLabel}
            tabIndex={-1}
          >
            {options.map((option, index) => {
              const isSelected = option.value === value
              const isActive = index === activeIndex
              const optionClass = [
                'flex w-full items-center rounded-x2 p-x2 select-none',
                OPTION_SIZE_CLASS[size],
                option.disabled
                  ? 'cursor-not-allowed text-text-disabled'
                  : 'cursor-pointer interaction-normal text-text-secondary',
                !option.disabled && isActive ? 'bg-bg-primary' : '',
              ]
                .filter(Boolean)
                .join(' ')

              return (
                <div
                  key={option.value}
                  id={optionId(index)}
                  role="option"
                  aria-selected={isSelected}
                  aria-disabled={option.disabled || undefined}
                  className={optionClass}
                  onClick={() => selectOption(option)}
                >
                  <span className="min-w-0 flex-1 truncate">
                    {option.label}
                  </span>
                </div>
              )
            })}
          </ScrollArea>
        </div>
      )}
    </div>
  )
}
