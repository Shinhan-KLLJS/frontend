# 캠페인 등록 캐러셀 섹션 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 랜딩페이지에 캠페인 등록 3단계(기본 정보 입력/송출 위치 선택/최종 확인)를 탭 클릭·드래그로 넘겨볼 수 있는 이미지 캐러셀 섹션을 추가한다.

**Architecture:** sticky 스크롤 핀이 필요 없는 일반 스크롤 컴포넌트. `useScroll` 기반 진입 페이드업 + Motion `drag="x"` 기반 캐러셀(탭 클릭과 드래그가 같은 `activeIndex` state를 공유해 자동 동기화).

**Tech Stack:** React 19 + TypeScript, Tailwind v4(tokens.css), `motion`(Framer Motion 후속) — `useScroll`/`useTransform`/`useMotionValue`/`animate`/`motion.div drag`.

## Global Constraints

- 이 프로젝트에는 테스트 프레임워크가 없다 — 검증은 `npx tsc -b && npm run lint` + 로컬 dev 서버 시각 확인으로 대체한다.
- 색상·타이포는 반드시 `src/styles/tokens.css` 토큰만 사용: `text-display-3-medium`(36px), `text-heading-1-regular`(22px), `text-body-1-normal-bold`(16px/600), `bg-primary-brand-solid`, `bg-bg-primary`, `text-text-primary`, `text-text-primary-inverse`, `shadow-normal-large`.
- Prettier 컨벤션: 세미콜론 없음, single quote, trailing comma, printWidth 80, tabWidth 2.
- 커밋은 사용자의 로컬 확인·명시적 승인 후에만 한다 — 이 플랜의 마지막 커밋 스텝은 승인이 이미 있다는 전제하에 실행한다. 승인 전이면 커밋 스텝은 생략하고 사용자에게 확인을 요청한다.

---

### Task 1: Section3 컴포넌트 작성

**Files:**
- Create: `src/components/landing/Section3.tsx`

**Interfaces:**
- Produces: `export default function Section3(): JSX.Element` — `LandingPage.tsx`가 `<Section3 />`로 사용.
- Consumes: `Normal-info.png`/`Media-Map.png`/`Last-Check-Info.png` (이미 `src/assets/landing/`에 존재).

- [ ] **Step 1: 컴포넌트 파일 작성**

```tsx
import { useEffect, useRef, useState, type ReactNode } from 'react'
import {
  animate,
  motion,
  useMotionValue,
  useReducedMotion,
  useScroll,
  useTransform,
} from 'motion/react'
import normalInfoImage from '@/assets/landing/Normal-info.png'
import mediaMapImage from '@/assets/landing/Media-Map.png'
import lastCheckInfoImage from '@/assets/landing/Last-Check-Info.png'

const STEPS = [
  { key: 'normal-info', label: '기본 정보 입력', image: normalInfoImage },
  { key: 'media-map', label: '송출 위치 선택', image: mediaMapImage },
  { key: 'last-check', label: '최종 확인', image: lastCheckInfoImage },
] as const

function FlowTabButton({
  selected,
  children,
  onClick,
}: {
  selected: boolean
  children: ReactNode
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`interaction-normal whitespace-nowrap rounded-full px-x4 py-x3 text-body-1-normal-bold ${
        selected
          ? 'bg-primary-brand-solid text-text-primary-inverse'
          : 'text-text-primary'
      }`}
    >
      {children}
    </button>
  )
}

/** 캐러셀 트랙 wrapper의 실제 렌더링 너비 — 드래그 스냅 임계값·이동 거리 계산에 쓴다. */
function useElementWidth() {
  const ref = useRef<HTMLDivElement>(null)
  const [width, setWidth] = useState(0)

  useEffect(() => {
    const update = () => setWidth(ref.current?.offsetWidth ?? 0)
    update()
    window.addEventListener('resize', update)
    return () => window.removeEventListener('resize', update)
  }, [])

  return [ref, width] as const
}

const SPRING = { type: 'spring', stiffness: 300, damping: 32 } as const

function FlowCarousel() {
  const [activeIndex, setActiveIndex] = useState(0)
  const [trackRef, trackWidth] = useElementWidth()
  const x = useMotionValue(0)

  useEffect(() => {
    animate(x, -activeIndex * trackWidth, SPRING)
  }, [activeIndex, trackWidth, x])

  return (
    <div className="flex w-full max-w-[1000px] flex-col items-center gap-x10">
      <div className="flex items-center gap-x4 rounded-full bg-bg-primary p-x3">
        {STEPS.map((step, index) => (
          <FlowTabButton
            key={step.key}
            selected={activeIndex === index}
            onClick={() => setActiveIndex(index)}
          >
            {step.label}
          </FlowTabButton>
        ))}
      </div>

      <div
        ref={trackRef}
        className="w-full overflow-hidden rounded-[16px] shadow-normal-large"
      >
        <motion.div
          className="flex aspect-[1000/667] cursor-grab active:cursor-grabbing"
          style={{ x }}
          drag="x"
          dragConstraints={{ left: -(STEPS.length - 1) * trackWidth, right: 0 }}
          dragElastic={0.15}
          dragMomentum={false}
          onDragEnd={(_, info) => {
            const threshold = trackWidth * 0.25
            if (info.offset.x < -threshold && activeIndex < STEPS.length - 1) {
              setActiveIndex(activeIndex + 1)
            } else if (info.offset.x > threshold && activeIndex > 0) {
              setActiveIndex(activeIndex - 1)
            } else {
              animate(x, -activeIndex * trackWidth, SPRING)
            }
          }}
        >
          {STEPS.map((step) => (
            <img
              key={step.key}
              src={step.image}
              alt={step.label}
              draggable={false}
              className="h-full w-full shrink-0 object-cover"
            />
          ))}
        </motion.div>
      </div>
    </div>
  )
}

export default function Section3() {
  const sectionRef = useRef<HTMLElement>(null)
  const reduceMotion = useReducedMotion()

  const { scrollYProgress: entranceProgress } = useScroll({
    target: sectionRef,
    offset: ['start end', 'start start'],
  })
  const entranceOpacity = useTransform(entranceProgress, [0.5, 1], [0, 1])
  const entranceY = useTransform(entranceProgress, [0.5, 1], [40, 0])

  return (
    <section
      ref={sectionRef}
      className="flex flex-col items-center gap-x10 px-x5 py-[100px]"
    >
      <motion.div
        className="flex w-full flex-col items-center gap-x10"
        style={reduceMotion ? undefined : { opacity: entranceOpacity, y: entranceY }}
      >
        <div className="flex flex-col items-center gap-x3 text-center">
          <h2 className="text-display-3-medium text-text-primary">
            캠페인 등록
          </h2>
          <p className="text-heading-1-regular text-text-primary">
            광고 영상을 업로드하고 송출할 지역과 매체를 선택해 캠페인을 등록할 수
            있어요
          </p>
        </div>

        <FlowCarousel />
      </motion.div>
    </section>
  )
}
```

- [ ] **Step 2: 타입체크 + 린트**

Run: `npx tsc -b && npm run lint`
Expected: 에러 없음

---

### Task 2: LandingPage에 연결

**Files:**
- Modify: `src/components/landing/index.ts`
- Modify: `src/pages/LandingPage.tsx:1-11`

**Interfaces:**
- Consumes: `Section3` from Task 1 (`./Section3`).

- [ ] **Step 1: barrel export 추가**

`src/components/landing/index.ts`에 추가:

```ts
export { default as Section3 } from './Section3'
```

- [ ] **Step 2: LandingPage.tsx에 배치**

현재 `LandingPage.tsx`는 `<Section2 />` 바로 다음에 그라디언트 하단 색(`#3a83f5`) 구분 블록(`<div className="h-[200px] w-full rounded-b-[40px] bg-[#3a83f5]" />`)이 있다. Figma 원본에서도 이 구분 블록(Frame 9)이 Section 2의 그라디언트(Frame 8)와 캠페인 등록 섹션(Frame 19) **사이**에 위치하므로, `<Section3 />`는 그 구분 블록 **다음**에 추가한다:

```tsx
import { ScrollHero, Section2, Section3 } from '@/components/landing'

export default function LandingPage() {
  return (
    <div className="bg-bg-primary">
      <ScrollHero />
      <Section2 />
      {/* 이후 섹션은 여기 순차 추가 */}
      <div className="h-[200px] w-full rounded-b-[40px] bg-[#3a83f5]" />
      <Section3 />
    </div>
  )
}
```

- [ ] **Step 3: 타입체크 + 린트**

Run: `npx tsc -b && npm run lint`
Expected: 에러 없음

- [ ] **Step 4: dev 서버 재시작**

기존 background dev 서버 종료 후 `npm run dev`를 다시 background로 실행한다.

- [ ] **Step 5: 사용자 로컬 확인 요청**

탭 클릭 슬라이드, 드래그 스냅(임계값 미만은 원위치), 스크롤 진입 시 Section 2가 화면 밖으로 나가면서 이 섹션이 아래→위로 페이드인하는지, 모바일 너비에서 터치 드래그가 되는지 확인을 요청한다. **커밋은 사용자의 명시적 승인 후에만 진행한다.**

---

## 검증 요약 (스펙 대비)

- 탭 클릭 → 슬라이드 이동 → Task 1 `FlowCarousel`의 `onClick={() => setActiveIndex(index)}`
- 드래그 → 슬라이드 이동 + 탭 자동 동기화 → Task 1 `onDragEnd` (임계값 25%) + 공유 `activeIndex` state
- 진입 페이드업(이전 섹션이 스크롤로 사라지면 아래→위로 등장) → Task 1 `useScroll` offset `['start end','start start']`
- 이미지에 `shadow-normal-large` → Task 1 캐러셀 wrapper div
- Section 2 그라디언트 구분 블록과 새 섹션 사이 배치 → Task 2 Step 2
