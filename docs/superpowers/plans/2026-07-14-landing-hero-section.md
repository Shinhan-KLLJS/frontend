# 랜딩페이지 Hero 섹션 스크롤 인터랙션 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** `/` 를 인증 상태로 분기해 비로그인 사용자에게 스크롤 연동 Hero 섹션(배경 축소 + 헤드라인/CTA/대시보드 등장)을 보여주는 공개 랜딩페이지를 추가한다.

**Architecture:** `motion`의 `useScroll`/`useTransform`으로 스크롤 진행률 기반 애니메이션을 구현하는 `ScrollHero` 컴포넌트를 만들고, `lg`(1280px) 미만이거나 `prefers-reduced-motion`인 경우에는 애니메이션 없는 정적 최종 레이아웃을 렌더링한다. `LandingPage`가 이 섹션을 조립하고, `App.tsx`의 `/` 라우트는 `useAuth().status`에 따라 `LandingPage`(guest) 또는 기존 `AppLayout`+`HomePage`(authenticated)를 렌더링하도록 분기한다.

**Tech Stack:** React 19, TypeScript, Tailwind v4(`@theme` 토큰), `motion`(신규 설치), react-router-dom v7.

## Global Constraints

- 스펙 문서: `docs/superpowers/specs/2026-07-14-landing-hero-section-design.md` (사용자 승인 완료)
- **커밋 금지:** 이 프로젝트는 사용자(비개발자 디자이너)가 로컬에서 결과물을 직접 확인하고 승인해야 커밋이 진행된다. 태스크마다 자동으로 `git commit`을 실행하지 않는다 — 모든 태스크 완료 후 사용자 확인을 기다린다 (마지막 "사용자 확인 및 커밋" 섹션 참고).
- 이 프로젝트에는 자동화 테스트 프레임워크(vitest/jest 등)가 없다. 각 태스크의 검증은 `npm run lint` + `npx tsc -b`(타입체크) + 개발 서버를 통한 수동 시각 확인으로 대체한다.
- 스타일은 반드시 `src/styles/tokens.css`의 토큰 클래스(`text-*`, `spacing-x*`, `radius-x*`, `bg-*` 등)를 우선 사용한다. 토큰에 없는 값(예: 48px 타이틀, 60px 좌우 패딩, 32px 라운드)만 arbitrary value(`text-[48px]` 등)로 처리한다.
- 버튼은 신규 컴포넌트를 만들지 않고 기존 `src/components/ui/Button.tsx`를 재사용한다.
- Prettier 설정 준수: 세미콜론 없음, single quote, trailing comma.
- Figma 파일 키: `Av6wndsR8wpp1w7BIduyyz` / 배경 노드: `1900:24007` / 대시보드 노드: `1900:24012`.

---

### Task 1: 에셋 확인 (사용자 제공, 완료됨)

**Files:**
- 기존: `src/assets/landing/hero-bg.png` (2560×1406, 배경)
- 기존: `src/assets/landing/hero-content.png` (2880×3691, 대시보드 원본 — 세로로 긴 원본 스크린샷이며 화면에는 상단 일부만 크롭해서 보여준다)

**Interfaces:**
- Produces: 두 이미지 파일 경로 (Task 4에서 `import`로 사용)

> 실행 시점에 사용자가 두 이미지를 이미 `src/assets/landing/`에 직접 넣어둔 것을 확인했다 (Figma MCP 다운로드 불필요). 단, `hero-content.png`는 Figma의 "[DV-44] 메인화면 홈 대시보드 2" 노드와 동일하게 **원본 그대로(크롭 안 된 상태)** 이며, 실제 노출 시에는 상단 약 43.4%만 보이도록 크롭해야 한다(Figma 노드 실측: 크롭 컨테이너 876×487 안에서 이미지가 `height 230.6%, width 100.03%, top 0`로 배치됨 → 노출 높이 비율 = 100/230.6 ≈ 43.4%). Task 4의 `HeroDashboardImage` 서브컴포넌트가 이 크롭을 담당한다.

- [ ] **Step 1: 파일 존재·형식 확인**

  Run: `file src/assets/landing/hero-bg.png src/assets/landing/hero-content.png`
  Expected: 둘 다 `PNG image data` 출력

---

### Task 2: `motion` 패키지 설치

**Files:**
- Modify: `package.json`
- Modify: `package-lock.json`

**Interfaces:**
- Produces: `motion/react`에서 `motion`, `useScroll`, `useTransform`, `useReducedMotion` import 가능 (Task 4에서 사용)

- [ ] **Step 1: 패키지 설치**

Run: `npm install motion`
Expected: `package.json`의 `dependencies`에 `"motion": "^..."` 추가됨, exit code 0

- [ ] **Step 2: 설치 확인**

Run: `npm ls motion`
Expected: `motion@<version>` 출력, `UNMET DEPENDENCY` 없음

---

### Task 3: 반응형 분기용 `useMediaQuery` 훅

**Files:**
- Create: `src/lib/useMediaQuery.ts`

**Interfaces:**
- Produces: `useMediaQuery(query: string): boolean` — 훅 (Task 4의 `ScrollHero`에서 `useMediaQuery('(min-width: 1280px)')`로 사용)

- [ ] **Step 1: 훅 구현**

```ts
import { useEffect, useState } from 'react'

// SSR 없는 CSR 전용 앱이므로 초기값은 window.matchMedia로 즉시 계산한다
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(() => window.matchMedia(query).matches)

  useEffect(() => {
    const mql = window.matchMedia(query)
    const onChange = () => setMatches(mql.matches)
    onChange()
    mql.addEventListener('change', onChange)
    return () => mql.removeEventListener('change', onChange)
  }, [query])

  return matches
}
```

- [ ] **Step 2: 타입체크 + 린트**

Run: `npx tsc -b && npm run lint`
Expected: 에러 없음

---

### Task 4: `ScrollHero` 컴포넌트

**Files:**
- Create: `src/components/landing/ScrollHero.tsx`
- Create: `src/components/landing/index.ts`

**Interfaces:**
- Consumes: `useMediaQuery('(min-width: 1280px)')` (Task 3), `Button` from `@/components/ui` (기존), `src/assets/landing/hero-bg.png`·`hero-dashboard.png` (Task 1)
- Produces: `export default function ScrollHero(): JSX.Element` — Task 5의 `LandingPage`에서 `<ScrollHero />`로 사용

- [ ] **Step 1: 컴포넌트 구현**

```tsx
import { useRef } from 'react'
import {
  motion,
  useReducedMotion,
  useScroll,
  useTransform,
} from 'motion/react'
import Button from '@/components/ui/Button'
import { useMediaQuery } from '@/lib/useMediaQuery'
import heroBg from '@/assets/landing/hero-bg.png'
import heroContent from '@/assets/landing/hero-content.png'

const TITLE = 'Make the Invisible Visible'
const BODY_LINE_1 =
  'Transform real-world attention into measurable insights with Vision AI.'
const BODY_LINE_2 =
  'Track foot traffic, ad viewers, and engagement around every DOOH display.'

function HeroCopy({ className = '' }: { className?: string }) {
  return (
    <div className={`text-center ${className}`}>
      <h1 className="text-[32px] font-medium leading-[1.3] tracking-[-0.03em] text-text-primary md:text-[48px]">
        {TITLE}
      </h1>
      <p className="mt-x2 text-heading-2-regular text-text-primary">
        {BODY_LINE_1}
        <br />
        {BODY_LINE_2}
      </p>
      <div className="mt-x8 flex flex-wrap items-center justify-center gap-x2">
        <Button variant="line" color="secondary">
          서비스 둘러보기
        </Button>
        <Button variant="default" color="primary">
          무료로 시작하기
        </Button>
      </div>
    </div>
  )
}

/**
 * 대시보드 원본(hero-content.png)은 세로로 긴 스크린샷 전체이며, Figma 디자인은
 * 상단 약 43.4%만 잘라서 보여준다 (Figma 실측: 크롭 컨테이너 876×487 안에서
 * 이미지가 height 230.6% / width 100.03% / top 0 로 배치됨).
 */
function HeroDashboardImage({ className = '' }: { className?: string }) {
  return (
    <div
      className={`relative overflow-hidden rounded-t-[16px] ${className}`}
      style={{ aspectRatio: '876 / 487' }}
    >
      <img
        src={heroContent}
        alt="Loovi 대시보드"
        className="absolute left-0 top-0 max-w-none"
        style={{ width: '100.03%', height: '230.6%' }}
      />
    </div>
  )
}

/** lg(1280px) 미만이거나 prefers-reduced-motion일 때 보여줄 최종 상태 고정 레이아웃 */
function StaticHero() {
  return (
    <section className="px-x5 pb-x10 pt-x10">
      <HeroCopy />
      <div className="relative mt-x8 overflow-hidden rounded-[24px]">
        <img src={heroBg} alt="" className="block w-full object-cover" />
        <HeroDashboardImage className="absolute inset-x-[7%] bottom-0 w-[86%]" />
      </div>
    </section>
  )
}

export default function ScrollHero() {
  const sectionRef = useRef<HTMLElement>(null)
  const isDesktop = useMediaQuery('(min-width: 1280px)') // tokens.css --breakpoint-lg
  const reduceMotion = useReducedMotion()
  const showScrollInteraction = isDesktop && !reduceMotion

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start start', 'end end'],
  })

  const visualScale = useTransform(scrollYProgress, [0, 0.48], [1, 0.78])
  const visualY = useTransform(scrollYProgress, [0, 0.48], ['0vh', '21vh'])
  const visualRadius = useTransform(
    scrollYProgress,
    [0, 0.48],
    ['0px', '32px'],
  )
  const copyOpacity = useTransform(scrollYProgress, [0.12, 0.32], [0, 1])
  const copyY = useTransform(scrollYProgress, [0.12, 0.32], [24, 0])
  const dashboardOpacity = useTransform(scrollYProgress, [0.42, 0.7], [0, 1])
  const dashboardY = useTransform(scrollYProgress, [0.42, 0.78], [140, 0])

  if (!showScrollInteraction) {
    return <StaticHero />
  }

  return (
    <section ref={sectionRef} className="relative h-[260dvh]">
      <div className="sticky top-0 min-h-dvh overflow-hidden">
        <motion.div
          className="absolute left-1/2 top-x10 z-10 w-[min(680px,calc(100%-40px))] -translate-x-1/2"
          style={{ opacity: copyOpacity, y: copyY }}
        >
          <HeroCopy />
        </motion.div>

        <motion.div
          className="absolute inset-0 origin-center overflow-hidden"
          style={{
            scale: visualScale,
            y: visualY,
            borderRadius: visualRadius,
          }}
        >
          <img
            src={heroBg}
            alt=""
            className="size-full object-cover"
          />
          <motion.div
            className="absolute inset-x-[7%] bottom-0 w-[86%]"
            style={{ opacity: dashboardOpacity, y: dashboardY }}
          >
            <HeroDashboardImage />
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}
```

- [ ] **Step 2: barrel export 작성**

```ts
export { default as ScrollHero } from './ScrollHero'
```

- [ ] **Step 3: 타입체크 + 린트**

Run: `npx tsc -b && npm run lint`
Expected: 에러 없음

---

### Task 5: `LandingPage`

**Files:**
- Create: `src/pages/LandingPage.tsx`

**Interfaces:**
- Consumes: `ScrollHero` from `@/components/landing` (Task 4)
- Produces: `export default function LandingPage(): JSX.Element` — Task 6의 `App.tsx`에서 사용

- [ ] **Step 1: 페이지 구현**

```tsx
import { ScrollHero } from '@/components/landing'

export default function LandingPage() {
  return (
    <div className="bg-bg-primary">
      <ScrollHero />
      {/* 이후 섹션은 여기 순차 추가 */}
    </div>
  )
}
```

- [ ] **Step 2: 타입체크 + 린트**

Run: `npx tsc -b && npm run lint`
Expected: 에러 없음

---

### Task 6: `/` 라우트 분기

**Files:**
- Modify: `src/components/layout/AppLayout.tsx` (Outlet → children prop)
- Modify: `src/App.tsx`

**Interfaces:**
- Consumes: `useAuth` from `@/lib/auth` (기존), `LandingPage` (Task 5), `LoadingSpinner` from `@/components/ui` (기존)

- [ ] **Step 1: `AppLayout`을 `Outlet` 대신 `children` prop을 받도록 수정**

  현재 `AppLayout`은 라우터의 중첩 라우트(`children: [{ path: '/', element: <HomePage /> }]`)에 의존하는 `<Outlet />`을 쓴다. `/` 분기 로직을 라우터 설정 밖에서 직접 조립해야 하므로, 일반적인 `children` prop 방식으로 바꾼다. 현재 `AppLayout`을 쓰는 라우트는 `/` 하나뿐이라 이 변경으로 깨지는 다른 화면은 없다.

  `src/components/layout/AppLayout.tsx` 전체를 아래로 교체:

```tsx
import type { ReactNode } from 'react'
import Header from './Header'
import Sidebar from './Sidebar'

export default function AppLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex h-screen">
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <Header />
        <main className="flex-1 overflow-y-auto">
          <div className="mx-auto min-h-full max-w-content-lg p-x5 xl:max-w-content-xl">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: `App.tsx`에 `RootRoute` 추가하고 라우터에서 `/` 교체**

  `src/App.tsx`를 아래로 교체 (기존 `/login`, `/login/success`, `/login/failure`, `/welcome` 라우트는 그대로 유지):

```tsx
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import AppLayout from '@/components/layout/AppLayout'
import HomePage from '@/pages/HomePage'
import LandingPage from '@/pages/LandingPage'
import LoginPage from '@/pages/LoginPage'
import WelcomePage from '@/pages/WelcomePage'
import { ToastProvider, LoadingSpinner } from '@/components/ui'
import { AuthProvider, RequireAuth, useAuth } from '@/lib/auth'

/** '/' 전용 분기: 세션 확인 중엔 스피너, 비로그인은 랜딩, 로그인은 기존 대시보드 */
function RootRoute() {
  const { status } = useAuth()

  if (status === 'loading') {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <LoadingSpinner progress={0} showLabel={false} />
      </div>
    )
  }
  if (status === 'guest') {
    return <LandingPage />
  }
  return (
    <AppLayout>
      <HomePage />
    </AppLayout>
  )
}

const router = createBrowserRouter([
  { path: '/login', element: <LoginPage /> },
  // 카카오 OAuth 복귀 지점 (백엔드가 로그인 성공/실패 후 이 경로로 리다이렉트).
  // LoginPage가 세션 복원 결과로 분기: 성공→팀 유무 따라 /·/welcome, 실패→로그인 폼
  { path: '/login/success', element: <LoginPage /> },
  { path: '/login/failure', element: <LoginPage /> },
  // 로그인 O + 소속 팀 X 사용자의 팀 생성/합류 분기점
  {
    path: '/welcome',
    element: (
      <RequireAuth>
        <WelcomePage />
      </RequireAuth>
    ),
  },
  { path: '/', element: <RootRoute /> },
])

function App() {
  return (
    <ToastProvider>
      <AuthProvider>
        <RouterProvider router={router} />
      </AuthProvider>
    </ToastProvider>
  )
}

export default App
```

  `RootRoute`는 `AuthProvider` 내부에서 렌더링되므로 `useAuth()` 호출이 유효하다. `RequireAuth`를 쓰지 않는 이유: `RequireAuth`는 guest를 `/login`으로 리다이렉트하는데, `/`에서는 guest에게 리다이렉트 대신 `LandingPage`를 보여줘야 하기 때문이다.

- [ ] **Step 3: 타입체크 + 린트**

Run: `npx tsc -b && npm run lint`
Expected: 에러 없음

---

## 사용자 확인 및 커밋

모든 태스크 완료 후:

- [ ] `npm run dev`로 개발 서버 실행
- [ ] 데스크탑 너비(≥1280px)에서 `/`(비로그인 상태) 접속 후 실제로 스크롤하며 배경 축소 → 헤드라인/CTA 등장 → 대시보드 등장 순서 확인
- [ ] 브라우저 devtools로 태블릿(768~1279px)·모바일(<768px) 뷰포트에서 최종 상태가 스크롤 없이 바로 보이는지 확인
- [ ] devtools에서 `prefers-reduced-motion: reduce` 시뮬레이션 후 데스크탑에서도 정적 상태로 보이는지 확인
- [ ] 로그인 상태에서 `/` 접속 시 기존 대시보드(HomePage)가 그대로 보이는지 확인 (회귀 확인)
- [ ] 사용자(디자이너) 승인 후에만 `git add`/`git commit` 진행
