import type { HTMLAttributes } from 'react'
import { Bell, ChevronDown } from 'lucide-react'
import Button from './Button'
import DropdownMenu from './DropdownMenu'
import type { DropdownMenuItem } from './DropdownMenu'
import Icon from './Icon'
import TextButton from './TextButton'

export interface HeaderProps extends HTMLAttributes<HTMLElement> {
  login?: boolean
  avatarSrc?: string
  onServiceIntroClick?: () => void
  onSignUpClick?: () => void
  onLoginClick?: () => void
  onAlarmClick?: () => void
  /** 프로필 메뉴 항목 — 제공 시 아바타 옆 셰브론 클릭으로 드롭다운 메뉴가 열린다 */
  profileMenu?: DropdownMenuItem[]
  /** profileMenu 미제공 시의 프로필 클릭 핸들러 (하위 호환) */
  onProfileClick?: () => void
}

/**
 * 헤더
 * - 비로그인: 서비스 소개 + 회원가입/로그인 버튼
 * - 로그인: 서비스 소개 + 알림 + 아바타·프로필 메뉴
 */
export default function Header({
  login = false,
  avatarSrc,
  onServiceIntroClick,
  onSignUpClick,
  onLoginClick,
  onAlarmClick,
  profileMenu,
  onProfileClick,
  className,
  ...props
}: HeaderProps) {
  // 아바타 + 셰브론 (프로필 메뉴 트리거 / 단순 버튼 공용)
  const profileContent = (open: boolean) => (
    <>
      <span className="size-[36px] shrink-0 overflow-hidden rounded-full border border-line-secondary bg-bg-secondary">
        {avatarSrc && (
          <img src={avatarSrc} alt="" className="size-full object-cover" />
        )}
      </span>
      <Icon
        icon={ChevronDown}
        size="large"
        className={`transition-transform ${open ? 'rotate-180' : ''}`}
      />
    </>
  )
  return (
    <header
      className={[
        'flex h-[56px] w-full items-center border-b border-line-tertiary bg-bg-secondary py-[10px] font-sans justify-end px-x10',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      {...props}
    >
      <div
        className={[
          'flex min-w-0 items-center justify-end',
          login ? 'gap-x6' : 'gap-x4',
        ].join(' ')}
      >
        <TextButton onClick={onServiceIntroClick}>서비스 소개</TextButton>

        {login ? (
          <div className="flex items-center gap-x4">
            <Button
              variant="ghost"
              color="secondary"
              iconOnly
              size="medium"
              leadingIcon={Bell}
              aria-label="알림"
              onClick={onAlarmClick}
            />
            {profileMenu && profileMenu.length > 0 ? (
              <DropdownMenu
                items={profileMenu}
                align="end"
                triggerAriaLabel="프로필 메뉴"
                menuAriaLabel="프로필 메뉴"
                // 트리거를 헤더 전체 높이로 채워 패널이 헤더 하단(+4px) 아래에서 열리도록
                triggerClassName="flex h-[56px] items-center gap-x1 text-text-primary"
                renderTrigger={profileContent}
              />
            ) : (
              <button
                type="button"
                aria-label="프로필 메뉴"
                onClick={onProfileClick}
                className="flex cursor-pointer items-center gap-x1 text-text-primary"
              >
                {profileContent(false)}
              </button>
            )}
          </div>
        ) : (
          <div className="flex items-center gap-x1">
            <Button
              variant="line"
              color="secondary"
              size="small"
              className="px-x3!"
              onClick={onSignUpClick}
            >
              회원가입
            </Button>
            <Button size="small" className="px-x4!" onClick={onLoginClick}>
              로그인
            </Button>
          </div>
        )}
      </div>
    </header>
  )
}
