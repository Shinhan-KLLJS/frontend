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
const CONTAINER_HEIGHT = 1000

const TITLE = (
  <>
    모든 시선은 데이터로,
    <br />
    개인정보는 보안으로
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
  { key: 'male-35-b', label: 'Male 35', color: '#fee500', left: -86, top: 254, size: 180 },
] as const

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
  box: (typeof PERSON_BOXES)[number]
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
            <h2 className="text-display-3-medium text-text-primary-inverse">
              {TITLE}
            </h2>
            <p className="mt-x2 text-heading-1-regular text-text-primary-inverse">
              {BODY}
            </p>
          </div>

          {PERSON_BOXES.map((box, i) => (
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

/** lg 미만(태블릿·모바일): 스크롤 진입 시 최종 상태(흑백+박스+블러)로 한 번에 fade-up. */
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
    <section ref={sectionRef} className="px-x5 py-[100px]">
      <motion.div
        className="relative mx-auto overflow-hidden"
        style={{
          width: '100%',
          maxWidth: 600,
          aspectRatio: `${CONTAINER_WIDTH} / ${CONTAINER_HEIGHT}`,
          ...(reduceMotion ? {} : { opacity: entranceOpacity, y: entranceY }),
        }}
      >
        <img
          src={securityBg}
          alt="Vision AI 얼굴 인식·블러 처리"
          className="absolute inset-0 size-full object-cover"
          style={{ filter: 'saturate(0%)' }}
        />

        <div className="absolute left-x5 top-x5 z-10">
          <h2 className="text-title-2-medium text-text-primary-inverse md:text-title-1-medium">
            {TITLE}
          </h2>
          <p className="mt-x2 text-headline-1-regular text-text-primary-inverse md:text-heading-2-regular">
            {BODY}
          </p>
        </div>

        {PERSON_BOXES.map((box) => (
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
              className="absolute inset-0 rounded-[8px] rounded-tl-none"
              style={{ backdropFilter: `blur(${BLUR_MAX_PX}px)` }}
            />
            <div
              className="absolute inset-0 rounded-[8px] rounded-tl-none"
              style={{ border: `3px solid ${box.color}` }}
            />
            <div
              className="absolute bottom-full left-0 whitespace-nowrap rounded-[4px] rounded-b-none px-x2 py-x1 text-caption-2-regular text-text-primary"
              style={{ backgroundColor: box.color }}
            >
              {box.label}
            </div>
          </div>
        ))}
      </motion.div>
    </section>
  )
}

export default function Section6() {
  const isDesktop = useMediaQuery('(min-width: 1280px)') // tokens.css --breakpoint-lg

  if (!isDesktop) {
    return <StaticSection6 />
  }

  return <DesktopSection6 />
}
