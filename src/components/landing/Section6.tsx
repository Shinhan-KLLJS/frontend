import { useRef } from 'react'
import {
  motion,
  useMotionValueEvent,
  useReducedMotion,
  useScroll,
  useTransform,
} from 'motion/react'
import { useMediaQuery } from '@/lib/useMediaQuery'
import securityBg from '@/assets/landing/Security_Bg.jpg'

const CONTAINER_WIDTH = 1200
const CONTAINER_HEIGHT = 900

const TITLE = (
  <>
    모든 시선은 데이터로,
    <br className="hidden md:block" /> 개인정보는 보안으로
  </>
)
const BODY = (
  <>
    Vision AI로 사람을 자동으로 인식하고
    <br />
    개인정보는 안전하게 보호해요.
  </>
)

/**
 * Security_Bg.jpg(4480×6720, 세로)에서 초점이 맞은 얼굴 4명의 위치를 직접
 * 확인해 좌표를 찍었다 — Figma 플레이스홀더 이미지가 아니라 실제 에셋 기준.
 *
 * 섹션은 object-cover로 이미지를 가로 기준(CONTAINER_WIDTH) 꽉 채우고 세로는
 * 중앙 50%(원본 y 25~75%)만 보여준다. 원본 이미지에서 잰 좌표를 컨테이너
 * 좌표로 옮기려면: x는 크롭이 없어 그대로, y는 (원본y% - 25) × 2 로 변환.
 * 박스는 Figma 레퍼런스(220×220 정사각형)와 크기를 맞췄다.
 */
const BOX_SIZE = 220
const PERSON_BOXES = [
  { key: 'female-39', label: 'Female 39', color: '#03c75a', left: 514, top: 350, size: BOX_SIZE },
  { key: 'male-35-a', label: 'Male 35', color: '#fee500', left: 286, top: 325, size: BOX_SIZE },
  { key: 'male-32', label: 'Male 32', color: '#fee500', left: 602, top: 589, size: BOX_SIZE },
] as const

// 데스크탑(웹)에서만 4개 박스 전부 y-10 이동 — 태블릿·모바일 PERSON_BOXES는 그대로.
const DESKTOP_PERSON_BOXES = PERSON_BOXES.map((box) => {
  const extraX = box.key === 'male-35-a' || box.key === 'female-39' ? -5 : 0
  return {
    ...box,
    left: box.left + 20 + extraX,
    top: box.top - 10 - 20,
    size: 200,
  }
})

// Phase 2: 배경 채도 + 타이틀 + 박스 테두리/라벨이 같이 나타나는 구간.
const DESATURATE_START = 0.3
const DESATURATE_END = 0.65
// Phase 3: 박스 테두리가 이미 보이는 상태에서, 그 안쪽에 블러가 순서대로 덮인다.
const BLUR_REVEAL_START = 0.65
const BLUR_REVEAL_STEP = 0.06
const BLUR_REVEAL_SPAN = 0.12
const BLUR_MAX_PX = 14

function PersonTrackingBox({
  box,
  outlineRef,
  blurRef,
}: {
  box: { key: string; label: string; color: string; left: number; top: number; size: number }
  outlineRef: (el: HTMLDivElement | null) => void
  blurRef: (el: HTMLDivElement | null) => void
}) {
  return (
    <div
      ref={outlineRef}
      className="absolute opacity-0"
      style={{
        left: `${(box.left / CONTAINER_WIDTH) * 100}%`,
        top: `${(box.top / CONTAINER_HEIGHT) * 100}%`,
        width: `${(box.size / CONTAINER_WIDTH) * 100}%`,
        height: `${(box.size / CONTAINER_HEIGHT) * 100}%`,
      }}
    >
      {/* 뒤에 깔리는 은은한 스캔 글로우 — 실제 Figma 이미지 에셋 대신 CSS로 재현 */}
      <div
        className="absolute -inset-6 rounded-full opacity-30 blur-2xl"
        style={{ backgroundColor: box.color }}
      />
      {/* 얼굴 블러 — 테두리와 별개 레이어라 blur 세기만 나중에 따로 올릴 수 있다 */}
      <div ref={blurRef} className="absolute inset-0 rounded-[8px] rounded-tl-none" />
      <div
        className="absolute inset-0 rounded-[8px] rounded-tl-none"
        style={{ border: `3px solid ${box.color}` }}
      />
      <div
        className="absolute bottom-full left-0 whitespace-nowrap rounded-[4px] rounded-b-none px-x2 py-x1 text-headline-1-bold text-text-primary"
        style={{ backgroundColor: box.color }}
      >
        {box.label}
      </div>
    </div>
  )
}

/**
 * 데스크탑(lg 이상) 전용. Hero·Section2와 동일한 sticky-pin 구조로 하나의
 * scrollYProgress를 3단계로 나눠 쓴다:
 *  1) 0~0.3       배경 이미지 오퍼시티 0→1 (컬러 배경만 먼저 페이드인)
 *  2) 0.3~0.65    배경 saturate 100%→0%와 함께 타이틀·트래킹 박스 테두리/라벨 등장
 *  3) 0.65~1      박스 안쪽에 블러가 하나씩 순서대로 덮인다(테두리는 이미 떠 있는 상태)
 */
function DesktopSection6() {
  const sectionRef = useRef<HTMLElement>(null)
  const bgRef = useRef<HTMLImageElement>(null)
  const titleRef = useRef<HTMLDivElement>(null)
  const outlineRefs = useRef<(HTMLDivElement | null)[]>([])
  const blurRefs = useRef<(HTMLDivElement | null)[]>([])

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start start', 'end end'],
  })

  const bgOpacity = useTransform(scrollYProgress, [0, 0.3], [0, 1])
  const bgSaturate = useTransform(
    scrollYProgress,
    [DESATURATE_START, DESATURATE_END],
    [100, 0],
  )
  const outlineOpacity = useTransform(
    scrollYProgress,
    [DESATURATE_START, DESATURATE_END],
    [0, 1],
  )

  useMotionValueEvent(bgOpacity, 'change', (v) => {
    if (bgRef.current) bgRef.current.style.opacity = String(v)
  })
  useMotionValueEvent(bgSaturate, 'change', (v) => {
    if (bgRef.current) bgRef.current.style.filter = `saturate(${v}%)`
  })
  useMotionValueEvent(outlineOpacity, 'change', (v) => {
    if (titleRef.current) titleRef.current.style.opacity = String(v)
    for (const el of outlineRefs.current) {
      if (!el) continue
      el.style.opacity = String(v)
      el.style.transform = `scale(${0.85 + 0.15 * v})`
    }
  })
  useMotionValueEvent(scrollYProgress, 'change', (progress) => {
    PERSON_BOXES.forEach((_, i) => {
      const start = BLUR_REVEAL_START + i * BLUR_REVEAL_STEP
      const end = start + BLUR_REVEAL_SPAN
      const blurProgress = Math.min(Math.max((progress - start) / (end - start), 0), 1)
      const el = blurRefs.current[i]
      if (!el) return
      el.style.backdropFilter = `blur(${blurProgress * BLUR_MAX_PX}px)`
    })
  })

  return (
    <section ref={sectionRef} className="relative h-[220dvh]">
      <div className="sticky top-0 flex h-dvh items-start overflow-hidden">
        <div
          className="relative w-full overflow-hidden"
          style={{ height: CONTAINER_HEIGHT }}
        >
          <img
            ref={bgRef}
            src={securityBg}
            alt="Vision AI 얼굴 인식·블러 처리"
            className="absolute inset-0 size-full translate-y-[30px] object-cover opacity-0"
          />

          <div ref={titleRef} className="absolute left-[60px] top-[70px] z-10 opacity-0">
            <h2 className="text-display-3-medium text-text-primary-inverse shadow-normal-small">
              {TITLE}
            </h2>
            <p className="mt-x2 text-heading-1-regular text-text-primary-inverse shadow-normal-small">
              {BODY}
            </p>
          </div>

          {DESKTOP_PERSON_BOXES.map((box, i) => (
            <PersonTrackingBox
              key={box.key}
              box={box}
              outlineRef={(el) => {
                outlineRefs.current[i] = el
              }}
              blurRef={(el) => {
                blurRefs.current[i] = el
              }}
            />
          ))}
        </div>
      </div>
    </section>
  )
}

/**
 * md~lg 미만(태블릿) 전용. 데스크탑과 동일한 3단계 스크롤 리빌(배경
 * 페이드인 → 채도 감소+박스 등장 → 블러)을 그대로 쓴다.
 *
 * 캔버스는 고정 픽셀(CONTAINER_WIDTH×HEIGHT) 크기를 그대로 쓰고 유동
 * 크기로 맞추지 않는다 — 화면이 좁아지면 비율을 유지해 축소하는 대신
 * 우측이 `overflow-hidden`으로 잘려나가는 형태다(비율이 계속 바뀌면서
 * 이미지 크롭·박스 위치가 흔들리는 것보다 낫다고 판단). 박스 좌표는
 * CONTAINER_WIDTH/HEIGHT 대비 %라 그대로 재사용된다.
 */
// male-32 트래킹 박스만 태블릿에서 x10 y-20 이동(데스크탑·모바일 PERSON_BOXES는
// 그대로 유지) — 공용 상수를 직접 바꾸지 않고 태블릿 전용으로 복제해 오프셋만 적용.
const TABLET_PERSON_BOXES = PERSON_BOXES.map((box) => {
  const extra = box.key === 'male-32' ? { left: 20, top: -45 } : { left: 0, top: 0 }
  return {
    ...box,
    size: 180,
    left: box.left + 10 + extra.left,
    top: box.top - 30 + extra.top,
  }
})

// 모바일에서만 박스 크기 축소 + 위치 조정.
// 상단 2개: male-35-a(노랑, 왼쪽) x+60(누적) / female-39(초록) x+40(누적).
// 하단 1개(male-32) x+65 y-80(누적).
const MOBILE_PERSON_BOXES = PERSON_BOXES.map((box) => {
  const offset =
    box.key === 'male-32'
      ? { left: 65, top: -80 }
      : box.key === 'male-35-a'
        ? { left: 60, top: 0 }
        : { left: 40, top: 0 }
  return {
    ...box,
    size: 120,
    left: box.left + offset.left,
    top: box.top + offset.top,
  }
})

function TabletSection6() {
  const sectionRef = useRef<HTMLElement>(null)
  const bgRef = useRef<HTMLImageElement>(null)
  const titleRef = useRef<HTMLDivElement>(null)
  const outlineRefs = useRef<(HTMLDivElement | null)[]>([])
  const blurRefs = useRef<(HTMLDivElement | null)[]>([])

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start start', 'end end'],
  })

  const bgOpacity = useTransform(scrollYProgress, [0, 0.3], [0, 1])
  const bgSaturate = useTransform(
    scrollYProgress,
    [DESATURATE_START, DESATURATE_END],
    [100, 0],
  )
  const outlineOpacity = useTransform(
    scrollYProgress,
    [DESATURATE_START, DESATURATE_END],
    [0, 1],
  )

  useMotionValueEvent(bgOpacity, 'change', (v) => {
    if (bgRef.current) bgRef.current.style.opacity = String(v)
  })
  useMotionValueEvent(bgSaturate, 'change', (v) => {
    if (bgRef.current) bgRef.current.style.filter = `saturate(${v}%)`
  })
  useMotionValueEvent(outlineOpacity, 'change', (v) => {
    if (titleRef.current) titleRef.current.style.opacity = String(v)
    for (const el of outlineRefs.current) {
      if (!el) continue
      el.style.opacity = String(v)
      el.style.transform = `scale(${0.85 + 0.15 * v})`
    }
  })
  useMotionValueEvent(scrollYProgress, 'change', (progress) => {
    PERSON_BOXES.forEach((_, i) => {
      const start = BLUR_REVEAL_START + i * BLUR_REVEAL_STEP
      const end = start + BLUR_REVEAL_SPAN
      const blurProgress = Math.min(Math.max((progress - start) / (end - start), 0), 1)
      const el = blurRefs.current[i]
      if (!el) return
      el.style.backdropFilter = `blur(${blurProgress * BLUR_MAX_PX}px)`
    })
  })

  return (
    <section ref={sectionRef} className="relative h-[220dvh]">
      <div className="sticky top-0 flex h-dvh items-start overflow-hidden">
        <div
          className="relative overflow-hidden"
          style={{ width: CONTAINER_WIDTH, height: CONTAINER_HEIGHT }}
        >
          <img
            ref={bgRef}
            src={securityBg}
            alt="Vision AI 얼굴 인식·블러 처리"
            className="absolute inset-0 size-full object-cover opacity-0"
          />

          <div ref={titleRef} className="absolute left-x6 top-x6 z-10 opacity-0">
            <h2 className="text-title-1-medium text-text-primary-inverse shadow-normal-small">
              {TITLE}
            </h2>
            <p className="mt-x2 text-heading-2-regular text-text-primary-inverse shadow-normal-small">
              {BODY}
            </p>
          </div>

          {TABLET_PERSON_BOXES.map((box, i) => (
            <PersonTrackingBox
              key={box.key}
              box={box}
              outlineRef={(el) => {
                outlineRefs.current[i] = el
              }}
              blurRef={(el) => {
                blurRefs.current[i] = el
              }}
            />
          ))}
        </div>
      </div>
    </section>
  )
}

/** md 미만(모바일): 스크롤 진입 시 최종 상태(흑백+박스+블러)로 한 번에 fade-up. */
function StaticSection6() {
  const sectionRef = useRef<HTMLElement>(null)
  const reduceMotion = useReducedMotion()

  const { scrollYProgress: entranceProgress } = useScroll({
    target: sectionRef,
    offset: ['start end', 'start start'],
  })
  const entranceOpacity = useTransform(entranceProgress, [0.5, 1], [0, 1])
  const entranceY = useTransform(entranceProgress, [0.5, 1], [40, 0])

  return (
    <section ref={sectionRef} className="px-x5 py-[100px] md:px-0">
      <motion.div
        className="relative mx-auto w-full max-w-[600px] overflow-hidden md:max-w-none"
        style={{
          // 모바일 전용 종횡비 — 공용 CONTAINER_WIDTH/HEIGHT(1200:900)를 그대로
          // 쓰면 좁은 폭에서 세로가 너무 짧아져 타이틀 자리가 부족해진다.
          aspectRatio: '1200 / 1100',
          ...(reduceMotion ? {} : { opacity: entranceOpacity, y: entranceY }),
        }}
      >
        <img
          src={securityBg}
          alt="Vision AI 얼굴 인식·블러 처리"
          className="absolute inset-0 size-full object-cover"
          style={{ filter: 'saturate(0%)' }}
        />

        <div className="absolute left-x6 top-x6 z-10 text-left">
          <h2 className="text-body-1-normal-medium text-text-primary-inverse shadow-normal-small md:text-title-1-medium">
            {TITLE}
          </h2>
          <p className="mt-x2 text-label-1-normal-regular text-text-primary-inverse shadow-normal-small md:text-heading-2-regular">
            {BODY}
          </p>
        </div>

        {MOBILE_PERSON_BOXES.map((box) => (
          <div
            key={box.key}
            className="absolute"
            style={{
              left: `${(box.left / CONTAINER_WIDTH) * 100}%`,
              top: `${(box.top / CONTAINER_HEIGHT) * 100}%`,
              width: `${(box.size / CONTAINER_WIDTH) * 100}%`,
              height: `${(box.size / CONTAINER_HEIGHT) * 100}%`,
            }}
          >
            <div
              className="absolute inset-0 rounded-[4px]"
              style={{ backdropFilter: `blur(${BLUR_MAX_PX}px)` }}
            />
            <div
              className="absolute inset-0 rounded-[4px]"
              style={{ border: `3px solid ${box.color}` }}
            />
          </div>
        ))}
      </motion.div>
    </section>
  )
}

export default function Section6() {
  const isDesktop = useMediaQuery('(min-width: 1280px)') // tokens.css --breakpoint-lg
  const isTabletUp = useMediaQuery('(min-width: 768px)') // Tailwind 기본 --breakpoint-md

  if (isDesktop) {
    return <DesktopSection6 />
  }

  if (isTabletUp) {
    return <TabletSection6 />
  }

  return <StaticSection6 />
}
