import { useState } from 'react'
import type { LucideIcon } from 'lucide-react'
import {
  Ad,
  Calendar,
  House,
  PanelLeft,
  PanelLeftClose,
  PanelLeftOpen,
  Users,
} from 'lucide-react'
import looviLogo from '@/assets/logos/loovi.svg'
import Icon from './Icon'
import MenuItem from './MenuItem'

export interface LNBMenu {
  key: string
  label: string
  icon: LucideIcon
  disabled?: boolean
}

// Figma LNB 변형 기준 기본 메뉴 4종 (Home/Campaign/Team/Calendar)
const LNB_DEFAULT_MENUS: LNBMenu[] = [
  { key: 'home', label: '홈', icon: House },
  { key: 'campaign', label: '캠페인', icon: Ad },
  { key: 'team', label: '팀원', icon: Users },
  { key: 'calendar', label: '캘린더', icon: Calendar },
]

export interface LNBProps {
  short?: boolean
  defaultShort?: boolean
  onShortChange?: (short: boolean) => void
  menus?: LNBMenu[]
  selectedKey?: string
  onSelect?: (key: string) => void
  className?: string
  'aria-label'?: string
}

/**
 * LNB (왼쪽 사이드바) — side_header(로고 + 접기/펼치기 토글) + MenuItem 리스트
 *
 * - 펼침(240px): 로고 + PanelLeft 토글(hover 시 PanelLeftClose로 스왑, 클릭 시 접힘)
 * - 접힘(60px): 로고 버튼(hover 시 PanelLeftOpen으로 스왑, 클릭 시 펼침)
 */
export default function LNB({
  short: shortProp,
  defaultShort = false,
  onShortChange,
  menus = LNB_DEFAULT_MENUS,
  selectedKey,
  onSelect,
  className,
  'aria-label': ariaLabel = '사이드바',
}: LNBProps) {
  const [uncontrolledShort, setUncontrolledShort] = useState(defaultShort)
  const short = shortProp ?? uncontrolledShort

  const setShort = (next: boolean) => {
    if (shortProp === undefined) setUncontrolledShort(next)
    onShortChange?.(next)
  }

  return (
    <nav
      aria-label={ariaLabel}
      className={[
        'flex h-full flex-col bg-bg-secondary font-sans shadow-normal-lnb',
        short ? 'w-[60px]' : 'w-[240px]',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      {/* side_header — Default(240×54) / Short(60×54) */}
      <div
        className={[
          'flex h-[54px] shrink-0 items-center border-b border-line-tertiary',
          short ? 'justify-center' : 'justify-between px-x5',
        ].join(' ')}
      >
        {short ? (
          // 접힘: 로고 표시, hover 시 PanelLeftOpen으로 스왑 → 클릭하면 펼침
          <button
            type="button"
            aria-label="사이드바 펼치기"
            onClick={() => setShort(false)}
            className="group inline-flex cursor-pointer items-center justify-center rounded-x1 p-x1 text-text-primary"
          >
            <img
              src={looviLogo}
              alt=""
              className="size-x5 group-hover:hidden"
            />
            <span className="hidden group-hover:inline-flex">
              <Icon icon={PanelLeftOpen} size={20} color="text-text-primary" />
            </span>
          </button>
        ) : (
          <>
            <span className="inline-flex items-center gap-x2">
              <img src={looviLogo} alt="" className="size-x5" />
              <span className="text-body-1-normal-bold text-text-primary">
                Loovi
              </span>
            </span>
            {/* 펼침: PanelLeft 표시, hover 시 PanelLeftClose로 스왑 → 클릭하면 접힘 */}
            <button
              type="button"
              aria-label="사이드바 접기"
              onClick={() => setShort(true)}
              className="group inline-flex cursor-pointer items-center justify-center rounded-x1 p-x1 text-text-primary"
            >
              <span className="inline-flex group-hover:hidden">
                <Icon icon={PanelLeft} size={20} color="text-text-primary" />
              </span>
              <span className="hidden group-hover:inline-flex">
                <Icon
                  icon={PanelLeftClose}
                  size={20}
                  color="text-text-primary"
                />
              </span>
            </button>
          </>
        )}
      </div>

      {/* 메뉴 리스트 */}
      <div
        className={[
          'flex min-h-0 flex-1 flex-col gap-x1 overflow-y-auto px-x2 py-x4 text-text-caption',
          short ? 'items-center' : '',
        ]
          .filter(Boolean)
          .join(' ')}
      >
        {menus.map(({ key, label, icon, disabled }) => (
          <MenuItem
            key={key}
            icon={icon}
            short={short}
            selected={key === selectedKey}
            disabled={disabled}
            aria-label={short ? label : undefined}
            onClick={() => onSelect?.(key)}
          >
            {label}
          </MenuItem>
        ))}
      </div>
    </nav>
  )
}
