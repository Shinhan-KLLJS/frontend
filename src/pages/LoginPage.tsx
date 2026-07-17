import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Navigate } from 'react-router-dom'
import heroImage from '@/assets/login-pannel.png'
import looviLogo from '@/assets/logos/loovi.svg'
import heroVideo from '@/assets/videos/Login_BG_2.mov'
import {
  Button,
  Checkbox,
  InputField,
  LoadingSpinner,
  LoginButton,
  useToast,
} from '@/components/ui'
import { useAuth } from '@/lib/auth'

const SAVED_EMAIL_KEY = 'loovi.savedEmail'

const loginSchema = z.object({
  email: z
    .string()
    .min(1, '이메일을 입력하세요.')
    .email('이메일 형식이 올바르지 않습니다.'),
  password: z.string().min(1, '비밀번호를 입력하세요.'),
})

type LoginForm = z.infer<typeof loginSchema>

/**
 * 로그인 페이지 — Left 브랜드 패널 + Right 통합 로그인 폼
 * 이메일 로그인은 프론트 전용(검증·활성화까지), 실제 인증은 카카오 OAuth만 백엔드 연동
 */
export default function LoginPage() {
  const { status, user, loginWithKakao } = useAuth()
  const { toast } = useToast()

  const [saveEmail, setSaveEmail] = useState(() =>
    Boolean(localStorage.getItem(SAVED_EMAIL_KEY)),
  )

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    mode: 'onTouched',
    defaultValues: {
      email: localStorage.getItem(SAVED_EMAIL_KEY) ?? '',
      password: '',
    },
  })

  // 이메일·비밀번호 둘 다 입력해야 로그인 버튼 활성화
  const canSubmit =
    watch('email').trim() !== '' && watch('password').trim() !== ''

  const onSubmit = (values: LoginForm) => {
    if (saveEmail) {
      localStorage.setItem(SAVED_EMAIL_KEY, values.email)
    } else {
      localStorage.removeItem(SAVED_EMAIL_KEY)
    }
  }

  const comingSoon = () => toast('준비 중인 기능입니다.', { status: 'error' })

  // 로그인 완료: 소속 팀이 있으면 대시보드, 없으면 팀 생성/합류 분기점으로
  if (status === 'authenticated') {
    return <Navigate to={user?.hasTeam ? '/' : '/welcome'} replace />
  }

  // 세션 복원 중(OAuth 복귀 직후 포함)에는 폼 대신 스피너 — 로그인 폼 깜빡임 방지
  if (status === 'loading') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-bg-secondary">
        <LoadingSpinner progress={0} showLabel={false} />
      </div>
    )
  }

  return (
    <div className="font-sans flex min-h-screen justify-center bg-bg-secondary">
      <div className="flex min-h-screen w-full max-w-[1440px] items-center justify-center">
        {/* Left  */}
        <div className="hidden w-[640px] shrink-0 p-x10 lg:block">
          <div className="relative h-[880px] w-[560px] shrink-0 overflow-hidden rounded-2xl">
            {/* 배경 이미지로 처리 — 부모가 lg 미만에서 display:none이라 모바일/태블릿에선 아예 다운로드되지 않음 */}
            <video
              aria-hidden="true"
              autoPlay
              muted
              loop
              playsInline
              preload="auto"
              poster={heroImage}
              className="absolute inset-0 size-full scale-120 object-cover rotate-180"
              // className="absolute inset-0 size-full scale-110 object-cover object-left-top"
            >
              <source src={heroVideo} type="video/mp4" />
            </video>
            <div className="absolute left-x10 top-x10 flex w-[480px] flex-col gap-x2">
              <h1 className="text-[48px] leading-[1.3] font-medium tracking-[-0.0282em] text-text-primary">
                Make the
                <br />
                Invisible Visible
              </h1>
              <p className="text-heading-2-regular text-text-primary">
                Transform real-world attention into measurable <br />
                insights with Vision AI. Track foot traffic, ad viewers, <br />
                and engagement around every DOOH display.
              </p>
            </div>
          </div>
        </div>

        {/* Right */}
        <div className="flex flex-1 flex-col items-center px-x10 py-[80px]">
          <div className="flex w-full max-w-[480px] flex-col gap-x10">
            <div className="flex items-center justify-center gap-x2">
              <img src={looviLogo} alt="" className="size-[40px]" />
              <span className="text-[32px] leading-[1.5] font-bold text-text-primary">
                Loovi
              </span>
            </div>

            <div className="flex flex-col gap-x5">
              <div className="flex flex-col gap-x2 text-center">
                <h2 className="text-heading-1-bold text-text-primary">
                  통합 로그인
                </h2>
                <p className="text-body-1-normal-regular text-text-secondary">
                  로그인하고 옥외광고 캠페인의 성과를 확인하세요.
                </p>
              </div>

              <div className="flex flex-col gap-x10">
                {/* 이메일 로그인 폼 */}
                <form
                  className="flex flex-col gap-x10"
                  onSubmit={handleSubmit(onSubmit)}
                  noValidate
                >
                  <div className="flex flex-col gap-x5">
                    <InputField
                      label="E-mail"
                      type="email"
                      autoComplete="email"
                      placeholder="이메일을 입력하세요"
                      errorMessage={errors.email?.message}
                      {...register('email')}
                    />
                    <InputField
                      label="Password"
                      type="password"
                      autoComplete="current-password"
                      placeholder="비밀번호를 입력하세요"
                      errorMessage={errors.password?.message}
                      {...register('password')}
                    />
                    <div className="flex items-center justify-between">
                      <Checkbox checked={saveEmail} onChange={setSaveEmail}>
                        이메일 저장
                      </Checkbox>
                      <div className="flex items-center gap-x1">
                        <button
                          type="button"
                          onClick={comingSoon}
                          className="cursor-pointer text-label-1-normal-medium text-[var(--cool-neutral-800)]"
                        >
                          비밀번호 찾기
                        </button>
                        <span
                          aria-hidden="true"
                          className="h-[12px] w-px bg-[var(--cool-neutral-800)]"
                        />
                        <button
                          type="button"
                          onClick={comingSoon}
                          className="cursor-pointer text-label-1-normal-medium text-[var(--cool-neutral-800)]"
                        >
                          회원가입
                        </button>
                      </div>
                    </div>
                  </div>
                  <Button type="submit" size="large" disabled={!canSubmit}>
                    로그인
                  </Button>
                </form>

                {/* 간편 로그인 */}
                <div className="flex flex-col gap-x5">
                  <div className="flex items-center gap-x5">
                    <span className="h-px flex-1 bg-line-secondary" />
                    <span className="text-headline-2-regular text-text-secondary">
                      간편 로그인
                    </span>
                    <span className="h-px flex-1 bg-line-secondary" />
                  </div>
                  <LoginButton provider="kakao" onClick={loginWithKakao} />
                  <LoginButton provider="google" onClick={comingSoon} />
                  <LoginButton provider="naver" onClick={comingSoon} />
                </div>
              </div>
            </div>
          </div>
          <div aria-hidden="true" className="h-[62px] shrink-0" />
        </div>
      </div>
    </div>
  )
}
