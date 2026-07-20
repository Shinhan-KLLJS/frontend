import type { ButtonHTMLAttributes } from 'react'
import kakaoLogo from '@/assets/social/kakao.svg'
import googleLogo from '@/assets/social/google.svg'
import naverLogo from '@/assets/social/naver.svg'

export const LOGIN_PROVIDER = ['kakao', 'google', 'naver'] as const
export type LoginProvider = (typeof LOGIN_PROVIDER)[number]

// 소셜 브랜드 색은 각 사 공식 가이드 고정값
const PROVIDER_STYLE: Record<
  LoginProvider,
  { logo: string; label: string; container: string; title: string }
> = {
  kakao: {
    logo: kakaoLogo,
    label: '카카오로 로그인',
    container: 'bg-[#fee500]',
    title: 'text-body-1-normal-regular text-[var(--cool-neutral-1000)]',
  },
  google: {
    logo: googleLogo,
    label: '구글로 로그인',
    container: 'border border-line-secondary bg-bg-secondary',
    title: 'text-body-1-normal-regular text-[var(--cool-neutral-1000)]',
  },
  naver: {
    logo: naverLogo,
    label: '네이버로 로그인',
    container: 'bg-[#03c75a]',
    title: 'text-body-1-normal-medium text-text-primary-inverse',
  },
}

export interface LoginButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  provider: LoginProvider
  children?: string
  /** false면 외형은 그대로 두고 hover·pointer 커서만 제거(핸들러 미연동 버튼). 기본 true */
  interactive?: boolean
}

/* ── LoginButton  */
export default function LoginButton({
  provider,
  children,
  className,
  interactive = true,
  ...props
}: LoginButtonProps) {
  const { logo, label, container, title } = PROVIDER_STYLE[provider]

  return (
    <button
      type="button"
      className={[
        'font-sans flex h-[48px] w-full items-center gap-x1 rounded-x2 p-x3',
        interactive ? 'interaction-normal cursor-pointer' : '',
        container,
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      {...props}
    >
      <img alt="" src={logo} className="size-[24px] shrink-0" />
      <span className={['min-w-0 flex-1 text-center', title].join(' ')}>
        {children ?? label}
      </span>
    </button>
  )
}
