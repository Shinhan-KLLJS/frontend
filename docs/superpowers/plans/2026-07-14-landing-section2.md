# 랜딩페이지 Section 2 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Hero 섹션 아래에, 스크롤 진입 시 페이드인하고 6장 이미지가 우→좌로 무한 반복되는 카드 마퀴 섹션(Section 2)을 추가한다.

**Architecture:** `motion`의 `whileInView`로 섹션 전체를 1회성 진입 애니메이션 처리하고, 카드 목록을 2배로 이어붙인 뒤 `animate={{ x: ['0%','-50%'] }}` + `repeat: Infinity`로 끊김 없는 가로 마퀴를 구현한다.

**Tech Stack:** React 19, TypeScript, Tailwind v4, `motion`(기설치).

## Global Constraints

- 스펙 문서: `docs/superpowers/specs/2026-07-14-landing-section2-design.md` (사용자 승인 완료)
- **커밋 금지:** 태스크마다 자동 커밋하지 않는다. 전체 구현 후 사용자가 로컬에서 확인·승인해야 커밋한다.
- 테스트 프레임워크 없음. 각 태스크 검증은 `npm run lint` + `npx tsc -b` + 로컬 시각 확인으로 대체한다.
- 토큰 우선 사용. 토큰에 없는 값(카드 radius 16px, 섹션 상하 패딩 80px)만 arbitrary value 처리.
- 이미지 6장은 이미 `src/assets/landing/section2-image1.png`~`section2-image6.png`로 준비되어 있고 1548×1548 정사각형이라 별도 크롭 불필요.
- Prettier 준수: 세미콜론 없음, single quote, trailing comma.
- **스펙 대비 단순화:** "화면 밖일 때 마퀴 일시정지"는 Motion의 명령형 애니메이션 컨트롤이 필요해 복잡도가 늘어나므로 이번 구현에서는 생략하고 항상 재생한다(가벼운 translateX 애니메이션이라 성능 영향 미미). `prefers-reduced-motion`에서는 정지 상태로 표시해 접근성은 충족한다.

---

### Task 1: `Section2` 컴포넌트

**Files:**
- Create: `src/components/landing/Section2.tsx`
- Modify: `src/components/landing/index.ts`

**Interfaces:**
- Consumes: `src/assets/landing/section2-image1~6.png` (기존)
- Produces: `export default function Section2(): JSX.Element` — Task 2의 `LandingPage`에서 사용

- [ ] **Step 1: 컴포넌트 구현**

```tsx
import { motion, useReducedMotion } from 'motion/react'
import section2Image1 from '@/assets/landing/section2-image1.png'
import section2Image2 from '@/assets/landing/section2-image2.png'
import section2Image3 from '@/assets/landing/section2-image3.png'
import section2Image4 from '@/assets/landing/section2-image4.png'
import section2Image5 from '@/assets/landing/section2-image5.png'
import section2Image6 from '@/assets/landing/section2-image6.png'

const MARQUEE_IMAGES = [
  section2Image1,
  section2Image2,
  section2Image3,
  section2Image4,
  section2Image5,
  section2Image6,
]

const MARQUEE_DURATION_SECONDS = 30

export default function Section2() {
  const reduceMotion = useReducedMotion()
  const cards = reduceMotion ? MARQUEE_IMAGES : [...MARQUEE_IMAGES, ...MARQUEE_IMAGES]

  return (
    <motion.section
      className="overflow-hidden py-[80px]"
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
    >
      <h2 className="text-display-2-medium text-center text-text-primary">
        유동인구로만 예측하던
        <br />
        기존의 옥외광고 측정 효과
      </h2>

      <div className="mt-x10 overflow-hidden">
        <motion.div
          className="flex w-max gap-[12px] md:gap-[16px] lg:gap-[20px]"
          animate={reduceMotion ? undefined : { x: ['0%', '-50%'] }}
          transition={
            reduceMotion
              ? undefined
              : { duration: MARQUEE_DURATION_SECONDS, ease: 'linear', repeat: Infinity }
          }
        >
          {cards.map((src, index) => (
            <img
              key={index}
              src={src}
              alt=""
              className="h-[200px] w-[200px] shrink-0 rounded-[16px] object-cover md:h-[280px] md:w-[280px] lg:h-[387px] lg:w-[387px]"
            />
          ))}
        </motion.div>
      </div>
    </motion.section>
  )
}
```

- [ ] **Step 2: barrel export 추가**

```ts
export { default as Section2 } from './Section2'
```

- [ ] **Step 3: 타입체크 + 린트**

Run: `npx tsc -b && npm run lint`
Expected: 에러 없음

---

### Task 2: `LandingPage`에 조립

**Files:**
- Modify: `src/pages/LandingPage.tsx`

- [ ] **Step 1: `Section2` 추가**

```tsx
import { ScrollHero, Section2 } from '@/components/landing'

export default function LandingPage() {
  return (
    <div className="bg-bg-primary">
      <ScrollHero />
      <Section2 />
      {/* 이후 섹션은 여기 순차 추가 */}
    </div>
  )
}
```

- [ ] **Step 2: 타입체크 + 린트**

Run: `npx tsc -b && npm run lint`
Expected: 에러 없음

---

## 사용자 확인 및 커밋

- [ ] `npm run dev`로 개발 서버 실행 (기존 서버가 떠 있으면 재사용)
- [ ] 데스크탑에서 Hero를 지나 Section 2로 스크롤 진입 시 페이드인 확인
- [ ] 카드 6장이 우→좌로 끊김 없이 무한 반복되는지 확인
- [ ] 태블릿(768~1279px)·모바일(<768px) 폭에서 카드 크기(280/200px)·간격(16/12px)이 자연스러운지 확인
- [ ] devtools `prefers-reduced-motion: reduce` 시뮬레이션 시 마퀴가 정지 상태로 보이는지 확인
- [ ] 사용자(디자이너) 승인 후에만 `git add`/`git commit` 진행
