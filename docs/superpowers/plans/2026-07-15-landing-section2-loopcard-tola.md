# Section 2 — 루프카드→TOLA Data→위젯 통합 인터랙션 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 기존 Section 2(타이틀+루프카드)를 확장해, 루프카드가 제자리에서 축소되며 TOLA Data로 디졸브되고 이어서 5개 위젯이 상승 등장하는 인터랙션을 하나의 sticky 구간으로 구현한다.

**Architecture:** `DesktopSection2`가 `sectionRef` 하나로 두 개의 독립된 `useScroll` 트래커(Hero와 겹치는 진입용 `entranceProgress`, sticky 고정 후 재생되는 `pinProgress`)를 갖는다. `pinProgress`로 타이틀 페이드아웃 → 루프카드 축소(scale, 위치 고정) → 루프카드/TOLA 디졸브(같은 scale 곡선 공유) → 5개 위젯 상승을 순서대로 구동한다. opacity와 scale은 항상 부모(opacity)/자식(scale) 엘리먼트로 분리한다.

**Tech Stack:** React 19, TypeScript, Tailwind v4, `motion`(기설치).

## Global Constraints

- 스펙 문서: `docs/superpowers/specs/2026-07-15-landing-section2-loopcard-tola-design.md` (사용자 승인 완료)
- **커밋 금지:** 태스크마다 자동 커밋하지 않는다. 전체 구현 후 사용자가 로컬에서 확인·승인해야 커밋한다.
- 테스트 프레임워크 없음. 각 태스크 검증은 `npm run lint` + `npx tsc -b` + 로컬 시각 확인(+devtools로 실제 computed style 확인)으로 대체한다.
- **다음 4가지는 이전 구현에서 실제로 겪은 버그의 원인이라 반드시 지킨다:**
  1. sticky wrapper는 `h-dvh` 사용 (`min-h-dvh` 금지 — 일반 흐름 자식이 뷰포트보다 크면 wrapper가 늘어나 sticky 계산이 깨진다)
  2. 등장 트랜지션(opacity/y)은 sticky 엘리먼트 자신이 아니라 자식에 적용
  3. 한 엘리먼트의 style에 opacity와 scale(또는 다른 transform)을 같이 두지 않는다 — opacity 담당 부모, scale 담당 자식으로 분리
  4. `sectionRef`·`useScroll`은 `DesktopSection2`(데스크탑 전용 하위 컴포넌트) 안에만 둔다
- 타이틀 재등장 없음 — 한 번 사라지면 계속 사라진 상태.
- 위젯 자리표시자는 기본(흰 배경) 스타일만 사용, 파란 배경 등 진단용 스타일 금지.
- Prettier 준수: 세미콜론 없음, single quote, trailing comma.

---

### Task 1: `Section2.tsx`를 통합 인터랙션으로 확장

**Files:**
- Modify: `src/components/landing/Section2.tsx` (현재 커밋 상태: 타이틀+루프카드만 있는 버전)

**Interfaces:**
- Produces: `export default function Section2(): JSX.Element` (기존과 동일한 시그니처, `LandingPage.tsx`는 변경 불필요)

- [ ] **Step 1: 파일 전체를 아래 내용으로 교체**

```tsx
import { useRef } from 'react'
import {
  motion,
  useReducedMotion,
  useScroll,
  useTransform,
  type MotionStyle,
} from 'motion/react'
import { useMediaQuery } from '@/lib/useMediaQuery'
import section2Image1 from '@/assets/landing/section2-image1.png'
import section2Image2 from '@/assets/landing/section2-image2.png'
import section2Image3 from '@/assets/landing/section2-image3.png'
import section2Image4 from '@/assets/landing/section2-image4.png'
import section2Image5 from '@/assets/landing/section2-image5.png'
import section2Image6 from '@/assets/landing/section2-image6.png'

const LOOP_CARD_IMAGES = [
  section2Image1,
  section2Image2,
  section2Image3,
  section2Image4,
  section2Image5,
  section2Image6,
]

const LOOP_CARD_DURATION_SECONDS = 30

// Figma "Frame 8"(node 1912:24963) 실측 좌표. TOLA Data는 루프카드가 축소·디졸브되는
// 목표 지점이자 5개 위젯이 둘러싸는 중심이라, 축소 애니메이션과 위젯 배치가 이 좌표를
// 함께 참조해야 한다.
const CONTAINER_WIDTH = 1280
const CONTAINER_HEIGHT = 1080
const TOLA_DATA = { label: 'TOLA Data', x: 40, y: 387, width: 1200, height: 305 }
// 루프카드는 TOLA Data와 같은 자리(중심 고정)에서 scale만으로 커졌다 작아진다 — 위치는
// 절대 움직이지 않고 제자리에서 중앙 기준으로 축소되도록.
const LOOP_CARD_START_SCALE = 1.6
const WIDGETS = [
  {
    key: 'live-viewer-graph',
    label: 'Live Viewer Graph',
    x: -80,
    y: -19,
    width: 395,
    height: 230,
  },
  { key: 'best-flow', label: 'Best Flow', x: -38, y: 490, width: 376, height: 348 },
  {
    key: 'time-years-heat-map',
    label: 'Time Years Heat Map',
    x: -112,
    y: 859,
    width: 576,
    height: 283,
  },
  {
    key: 'gender-years-view',
    label: 'Gender Years View',
    x: 999,
    y: -99,
    width: 564,
    height: 348,
  },
  {
    key: 'average-view-time',
    label: 'Average View Time',
    x: 938,
    y: 782,
    width: 376,
    height: 328,
  },
] as const

function PlaceholderCard({
  label,
  className = '',
}: {
  label: string
  className?: string
}) {
  return (
    <div
      className={`flex items-center justify-center rounded-[16px] border border-line-tertiary bg-bg-secondary ${className}`}
    >
      <span className="text-label-1-normal-bold text-text-secondary">{label}</span>
    </div>
  )
}

export function LoopCard({ loop }: { loop: boolean }) {
  const cards = loop ? [...LOOP_CARD_IMAGES, ...LOOP_CARD_IMAGES] : LOOP_CARD_IMAGES

  return (
    <motion.div
      className="flex h-full items-center gap-[12px] md:gap-[16px] lg:gap-[20px]"
      animate={loop ? { x: ['0%', '-50%'] } : undefined}
      transition={
        loop
          ? {
              duration: LOOP_CARD_DURATION_SECONDS,
              ease: 'linear',
              repeat: Infinity,
            }
          : undefined
      }
    >
      {cards.map((src, index) => (
        <img
          key={index}
          src={src}
          alt=""
          className="h-[200px] w-[200px] shrink-0 rounded-[16px] object-cover md:h-[280px] md:w-[280px] lg:h-full lg:w-auto lg:aspect-square"
        />
      ))}
    </motion.div>
  )
}

function SectionTitle({
  className = '',
  style,
}: {
  className?: string
  style?: MotionStyle
}) {
  return (
    <motion.h2
      className={`text-[32px] font-medium leading-[1.3] tracking-[-0.03em] text-center text-text-primary md:text-display-2-medium ${className}`}
      style={style}
    >
      유동인구로만 예측하던
      <br />
      기존의 옥외광고 측정 효과
    </motion.h2>
  )
}

/**
 * 데스크탑 전용 통합 인터랙션. Hero 크로스페이드로 등장 → 루프카드 유지 → 루프카드가
 * 루프를 유지한 채 TOLA Data 자리로 축소+디졸브 → 5개 위젯이 TOLA Data를 둘러싸며 상승 등장.
 *
 * 루프카드가 "같은 요소가 줄어드는 것"처럼 보이려면 축소·디졸브·위젯 등장까지 전부 하나의
 * sticky 고정 구간 안에 있어야 한다. ScrollHero와 같은 이유로 sectionRef·useScroll을 이
 * 컴포넌트 안에 둔다(리사이즈 시 언마운트/재마운트돼도 매번 새로 구독되도록).
 */
function DesktopSection2() {
  const sectionRef = useRef<HTMLElement>(null)

  // Hero가 화면 밖으로 스크롤되어 나가는 구간과 겹쳐 크로스페이드로 등장 (ScrollHero exit와 동일 패턴)
  const { scrollYProgress: entranceProgress } = useScroll({
    target: sectionRef,
    offset: ['start end', 'start start'],
  })
  const entranceOpacity = useTransform(entranceProgress, [0.5, 1], [0, 1])
  const entranceY = useTransform(entranceProgress, [0.5, 1], [40, 0])

  // sticky로 고정된 뒤 재생되는 본편 인터랙션
  const { scrollYProgress: pinProgress } = useScroll({
    target: sectionRef,
    offset: ['start start', 'end end'],
  })

  // 유지(0~0.35) → 타이틀 페이드아웃(0.35~0.45) → 루프카드가 제자리(TOLA Data 위치)에서
  // 중앙 기준으로 축소(0.35~0.6, TOLA Data도 정확히 같은 곡선을 공유해 시작점이 어긋나지
  // 않는다) → 루프카드→TOLA 디졸브(0.45~0.6, 축소가 끝나가는 구간과 겹침, 이후 루프카드는
  // 스크롤 끝까지 오퍼시티 0 고정) → 5개 위젯 상승 등장(0.65~0.92) → 유지(0.92~1)
  const titleOpacity = useTransform(pinProgress, [0.35, 0.45], [1, 0])

  // 루프카드와 TOLA Data가 완전히 같은 scale 곡선을 공유 — 같은 지점에서 같이 줄어든다.
  const shrinkScale = useTransform(
    pinProgress,
    [0.35, 0.6],
    [LOOP_CARD_START_SCALE, 1],
  )
  const loopCardOpacity = useTransform(pinProgress, [0.45, 0.6], [1, 0])
  const tolaOpacity = useTransform(pinProgress, [0.45, 0.6], [0, 1])

  const widgetOpacity = useTransform(pinProgress, [0.65, 0.92], [0, 1])
  const widgetY = useTransform(pinProgress, [0.65, 0.92], [60, 0])

  return (
    <section ref={sectionRef} className="relative h-[420dvh]">
      <div className="sticky top-0 flex h-dvh items-center justify-center overflow-hidden">
        <motion.div
          className="relative"
          style={{
            width: CONTAINER_WIDTH,
            height: CONTAINER_HEIGHT,
            opacity: entranceOpacity,
            y: entranceY,
          }}
        >
          <SectionTitle
            className="absolute inset-x-0 top-[150px]"
            style={{ opacity: titleOpacity }}
          />

          {/* opacity 담당(부모) / scale 담당(자식) 분리 — 루프카드 */}
          <motion.div
            className="absolute"
            style={{
              left: TOLA_DATA.x,
              top: TOLA_DATA.y,
              width: TOLA_DATA.width,
              height: TOLA_DATA.height,
              opacity: loopCardOpacity,
            }}
          >
            <motion.div
              className="size-full origin-center overflow-hidden rounded-[16px]"
              style={{ scale: shrinkScale }}
            >
              <LoopCard loop />
            </motion.div>
          </motion.div>

          {/* opacity 담당(부모) / scale 담당(자식) 분리 — TOLA Data */}
          <motion.div
            className="absolute"
            style={{
              left: TOLA_DATA.x,
              top: TOLA_DATA.y,
              width: TOLA_DATA.width,
              height: TOLA_DATA.height,
              opacity: tolaOpacity,
            }}
          >
            <motion.div
              className="size-full origin-center"
              style={{ scale: shrinkScale }}
            >
              <PlaceholderCard label={TOLA_DATA.label} className="size-full" />
            </motion.div>
          </motion.div>

          {WIDGETS.map((widget) => (
            <motion.div
              key={widget.key}
              className="absolute"
              style={{
                left: widget.x,
                top: widget.y,
                width: widget.width,
                height: widget.height,
                opacity: widgetOpacity,
                y: widgetY,
              }}
            >
              <PlaceholderCard label={widget.label} className="size-full" />
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}

function FadeInCard({
  label,
  reduceMotion,
}: {
  label: string
  reduceMotion: boolean
}) {
  return (
    <motion.div
      className="w-full max-w-[500px]"
      initial={reduceMotion ? false : { opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
    >
      <PlaceholderCard label={label} className="aspect-[4/3] w-full" />
    </motion.div>
  )
}

/** lg(1280px) 미만이거나 prefers-reduced-motion일 때: 세로 1열로 쌓고 각자 뷰포트 진입 시 페이드인 */
function StaticSection2() {
  const reduceMotion = useReducedMotion()

  return (
    <section className="overflow-hidden py-[120px]">
      <SectionTitle />
      <div className="mt-x10">
        <LoopCard loop={!reduceMotion} />
      </div>
      <div className="mt-x6 flex flex-col items-center gap-x6 px-x5">
        <FadeInCard label={TOLA_DATA.label} reduceMotion={!!reduceMotion} />
        {WIDGETS.map((widget) => (
          <FadeInCard
            key={widget.key}
            label={widget.label}
            reduceMotion={!!reduceMotion}
          />
        ))}
      </div>
    </section>
  )
}

export default function Section2() {
  const isDesktop = useMediaQuery('(min-width: 1280px)') // tokens.css --breakpoint-lg
  const reduceMotion = useReducedMotion()

  if (!isDesktop || reduceMotion) {
    return <StaticSection2 />
  }

  return <DesktopSection2 />
}
```

- [ ] **Step 2: 타입체크 + 린트**

Run: `npx tsc -b && npm run lint`
Expected: 에러 없음

---

## 사용자 확인 및 커밋

- [ ] `npm run dev`로 개발 서버 실행 (기존 서버가 떠 있으면 재시작)
- [ ] 데스크탑에서 Hero 크로스페이드 → 타이틀+루프카드 유지 → 루프카드 제자리 축소 → TOLA Data 디졸브 → 5개 위젯 상승까지 순서대로 확인
- [ ] devtools로 루프카드 wrapper(`overflow-hidden rounded-[16px]` 클래스를 가진 엘리먼트)를 직접 선택해, 디졸브 완료 이후 `opacity`가 실제로 `0`으로 고정되고 이후 절대 안 바뀌는지 확인 (5개 위젯 등장 구간 포함)
- [ ] 태블릿·모바일에서 타이틀+루프카드 아래로 TOLA Data·5개 위젯이 순서대로 페이드업되는지 확인
- [ ] `prefers-reduced-motion: reduce` 시뮬레이션 시 정적 상태로 보이는지 확인
- [ ] 사용자(디자이너) 승인 후에만 `git add`/`git commit` 진행 (Jira 서브태스크 키 필요)

## 후속 작업 (범위 밖)

- 6개 위젯(TOLA Data 포함) 각각의 실제 차트/그래프 구현
