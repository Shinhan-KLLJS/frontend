import type { HTMLAttributes } from 'react'
import { Bell, ChevronDown } from 'lucide-react'
import Button from './Button'
import Icon from './Icon'

export interface HeaderProps extends HTMLAttributes<HTMLElement> {
  login?: boolean
  avatarSrc?: string
  onServiceIntroClick?: () => void
  onSignUpClick?: () => void
  onLoginClick?: () => void
  onAlarmClick?: () => void
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
  onProfileClick,
  className,
  ...props
}: HeaderProps) {
  return (
    <header
      className={[
        'flex h-[56px] w-full min-w-[1040px] max-w-[1280px] items-center border-b border-line-tertiary bg-bg-secondary py-[10px] font-sans justify-end border-l px-x10',
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
        <button
          type="button"
          onClick={onServiceIntroClick}
          className="flex h-[36px] cursor-pointer items-center whitespace-nowrap text-body-1-normal-medium text-text-secondary"
        >
          서비스 소개
        </button>

        {login ? (
          <div className="flex items-center gap-x4">
            <button
              type="button"
              aria-label="알림"
              onClick={onAlarmClick}
              className="flex cursor-pointer items-center justify-center rounded-x1 text-text-primary interaction-normal"
            >
              <Icon icon={Bell} size="large" />
            </button>
            <button
              type="button"
              aria-label="프로필 메뉴"
              onClick={onProfileClick}
              className="flex cursor-pointer items-center gap-x1 text-text-primary"
            >
              <span className="size-[36px] shrink-0 overflow-hidden rounded-full border border-line-secondary bg-bg-secondary">
                {avatarSrc && (
                  <img
                    src={avatarSrc}
                    alt=""
                    className="size-full object-cover"
                  />
                )}
              </span>
              <Icon icon={ChevronDown} size="large" />
            </button>
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
