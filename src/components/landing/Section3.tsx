import { forwardRef, useEffect, useRef, useState, type ReactNode } from 'react'
import {
  animate,
  motion,
  useMotionValue,
  useReducedMotion,
  useScroll,
  useTransform,
} from 'motion/react'
import { useMediaQuery } from '@/lib/useMediaQuery'
import normalInfoImage from '@/assets/landing/Normal-info-3.png'
import mediaMapImage from '@/assets/landing/Media-Map.png'
import lastCheckInfoImage from '@/assets/landing/Last-Check-Info.png'

const STEPS = [
  { key: 'normal-info', label: '기본 정보 입력', image: normalInfoImage },
  { key: 'media-map', label: '송출 위치 선택', image: mediaMapImage },
  { key: 'last-check', label: '최종 확인', image: lastCheckInfoImage },
] as const

type TabSize = 'large' | 'medium'

const FlowTabButton = forwardRef<
  HTMLButtonElement,
  {
    selected: boolean
    size: TabSize
    children: ReactNode
    onClick: () => void
  }
>(function FlowTabButton({ selected, size, children, onClick }, ref) {
  const sizeClass =
    size === 'medium'
      ? 'px-x2 py-x3 text-label-1-normal-bold'
      : 'px-x4 py-x3 text-body-1-normal-bold'

  return (
    <button
      ref={ref}
      type="button"
      onClick={onClick}
      className={`interaction-normal whitespace-nowrap rounded-full ${sizeClass} ${
        selected
          ? 'bg-primary-brand-solid text-text-primary-inverse'
          : 'text-text-primary'
      }`}
    >
      {children}
    </button>
  )
})

// x2(8px) 여백을 기준으로 활성 탭이 스크롤 영역 좌/우 어느 쪽으로든 가려지면
// 그 여백만큼만 보이도록 자동 스크롤한다 — 탭이 많아 overflow-x-auto로
// 넘칠 때(Section2 위젯 스위처처럼) 버튼을 눌러도 활성 탭이 화면 밖에
// 남아있지 않게 하기 위함. 탭이 컨테이너 안에 다 들어가는 경우(Section3의
// 3탭)는 스크롤할 게 없어 아무 효과가 없다.
const EDGE_MARGIN = 8

export function FlowTabs({
  steps,
  activeIndex,
  onSelect,
  size = 'large',
  className = '',
}: {
  steps: readonly { key: string; label: string }[]
  activeIndex: number
  onSelect: (index: number) => void
  size?: TabSize
  className?: string
}) {
  const padding = size === 'medium' ? 'p-x2' : 'p-x3'
  const containerRef = useRef<HTMLDivElement>(null)
  const buttonRefs = useRef<(HTMLButtonElement | null)[]>([])

  useEffect(() => {
    const container = containerRef.current
    const button = buttonRefs.current[activeIndex]
    if (!container || !button) return

    const buttonLeft = button.offsetLeft
    const buttonRight = buttonLeft + button.offsetWidth
    const viewLeft = container.scrollLeft
    const viewRight = viewLeft + container.clientWidth

    if (buttonLeft - EDGE_MARGIN < viewLeft) {
      container.scrollTo({ left: buttonLeft - EDGE_MARGIN, behavior: 'smooth' })
    } else if (buttonRight + EDGE_MARGIN > viewRight) {
      container.scrollTo({
        left: buttonRight + EDGE_MARGIN - container.clientWidth,
        behavior: 'smooth',
      })
    }
  }, [activeIndex])

  return (
    <div
      ref={containerRef}
      className={`relative flex items-center gap-x4 rounded-full bg-bg-secondary ${padding} ${className}`}
    >
      {steps.map((step, index) => (
        <FlowTabButton
          key={step.key}
          ref={(el) => {
            buttonRefs.current[index] = el
          }}
          selected={activeIndex === index}
          size={size}
          onClick={() => onSelect(index)}
        >
          {step.label}
        </FlowTabButton>
      ))}
    </div>
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
// 슬라이드 사이 간격(px). motion.div의 gap-x10 클래스와 같은 값으로 맞춰야 한다.
const SLIDE_GAP = 40

function FlowImageTrack({
  activeIndex,
  onChangeIndex,
  className = '',
}: {
  activeIndex: number
  onChangeIndex: (index: number) => void
  className?: string
}) {
  const [trackRef, trackWidth] = useElementWidth()
  const x = useMotionValue(0)
  const slideStep = trackWidth + SLIDE_GAP

  useEffect(() => {
    animate(x, -activeIndex * slideStep, SPRING)
  }, [activeIndex, slideStep, x])

  return (
    <div
      ref={trackRef}
      className={`overflow-hidden rounded-[16px] shadow-normal-large ${className}`}
    >
      <motion.div
        className="flex h-full gap-x10"
        style={{ x }}
        drag="x"
        dragConstraints={{ left: -(STEPS.length - 1) * slideStep, right: 0 }}
        dragElastic={0.15}
        dragMomentum={false}
        onDragEnd={(_, info) => {
          const threshold = trackWidth * 0.25
          if (info.offset.x < -threshold && activeIndex < STEPS.length - 1) {
            onChangeIndex(activeIndex + 1)
          } else if (info.offset.x > threshold && activeIndex > 0) {
            onChangeIndex(activeIndex - 1)
          } else {
            animate(x, -activeIndex * slideStep, SPRING)
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
  )
}

/** 데스크탑(lg 이상): 좌측 타이틀+탭, 우측 793×514 고정 이미지의 좌우 2단 레이아웃. */
function DesktopSection3() {
  const sectionRef = useRef<HTMLElement>(null)
  const reduceMotion = useReducedMotion()
  const [activeIndex, setActiveIndex] = useState(0)

  // Hero(DesktopScrollHero)와 동일한 sticky-pin 구조: 진입 후에는 스크롤해도
  // 화면에 고정되어 있다가, Section4(캠페인 리스트)가 -mt-[150dvh]로 겹쳐
  // 올라와 이 섹션을 덮는다.
  //
  // sticky 요소가 실제로 고정되어 있는 스크롤 거리는 (wrapper 높이 - 100dvh)
  // 다 — 'start start'~'end end' progress 0→1이 바로 이 구간에 대응한다.
  // 이 wrapper는 h-[260dvh]이므로 pin 구간은 160dvh(entrance 이후 홀드
  // 구간을 늘려 리스트가 올라오기 시작하는 타이밍을 뒤로 미뤘다).
  //
  // 스냅 지점(0.855)은 ScrollDebugOverlay로 실측한 값 — 이 시점에 Section4
  // progress가 0.223으로, 리스트 이미지가 다 덮은 상태다.
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start start', 'end end'],
  })
  const entranceOpacity = useTransform(
    scrollYProgress,
    [0, 0.2, 0.84, 0.855],
    [0, 1, 1, 0],
  )
  const entranceY = useTransform(scrollYProgress, [0, 0.2], [40, 0])

  return (
    <section ref={sectionRef} className="relative h-[260dvh]">
      <div className="sticky top-0 flex h-dvh items-center overflow-hidden px-x10">
        <motion.div
          className="mx-auto flex w-full max-w-[1440px] items-start gap-x10"
          style={
            reduceMotion ? undefined : { opacity: entranceOpacity, y: entranceY }
          }
        >
          <div className="flex flex-1 flex-col items-start gap-x10">
            <div className="flex flex-col items-start gap-x3">
              <h2 className="text-display-3-medium text-text-primary">
                캠페인 등록
              </h2>
              <p className="text-heading-1-regular text-text-primary">
                광고 영상을 업로드하고 송출할 지역과
                <br />
                매체를 선택해 캠페인을 등록할 수 있어요.
              </p>
            </div>

            <FlowTabs
              steps={STEPS}
              activeIndex={activeIndex}
              onSelect={setActiveIndex}
              size="medium"
            />
          </div>

          <FlowImageTrack
            activeIndex={activeIndex}
            onChangeIndex={setActiveIndex}
            className="w-[952px] aspect-[793/514] shrink-0"
          />
        </motion.div>
      </div>
    </section>
  )
}

/**
 * md~lg 미만(태블릿) 전용. 데스크탑과 같은 sticky-pin 커버 인터랙션을
 * 쓰되, 793px 고정폭 2단 레이아웃 대신 세로 스택(StaticSection3과 같은
 * 구성)으로 태블릿 폭에 맞춘다.
 *
 * 아래 수치(wrapper 높이, 스냅 지점)는 데스크탑 값을 그대로 옮긴 게 아니라
 * 처음 잡아본 추정치다 — 데스크탑도 여러 번 실측하며 맞춘 값들이라, 실제
 * 태블릿 화면으로 겹침 타이밍을 보면서 조정이 필요할 가능성이 높다.
 */
function TabletSection3() {
  const sectionRef = useRef<HTMLElement>(null)
  const [activeIndex, setActiveIndex] = useState(0)
  const reduceMotion = useReducedMotion()

  // pin 구간 = wrapper 높이(200dvh) - 100dvh = 100dvh. TabletSection4의
  // -mt 값을 이 100dvh에 맞춰야 겹침 타이밍이 깨지지 않는다.
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start start', 'end end'],
  })
  const entranceOpacity = useTransform(
    scrollYProgress,
    [0, 0.2, 0.75, 0.98],
    [0, 1, 1, 0],
  )
  const entranceY = useTransform(scrollYProgress, [0, 0.2], [40, 0])

  return (
    <section ref={sectionRef} className="relative h-[200dvh]">
      <div className="sticky top-0 flex h-dvh flex-col items-center justify-center overflow-hidden px-x5">
        <motion.div
          className="flex w-full max-w-[800px] flex-col items-center gap-x8"
          style={
            reduceMotion ? undefined : { opacity: entranceOpacity, y: entranceY }
          }
        >
          <div className="flex flex-col items-center gap-x3 text-center">
            <h2 className="text-title-1-medium text-text-primary">
              캠페인 등록
            </h2>
            <p className="text-heading-2-regular text-text-primary">
              광고 영상을 업로드하고 송출할 지역과 매체를 선택해 캠페인을 등록할 수
              있어요.
            </p>
          </div>

          <FlowTabs
            steps={STEPS}
            activeIndex={activeIndex}
            onSelect={setActiveIndex}
            size="medium"
            className="max-w-full overflow-x-auto scrollbar-none"
          />
          <FlowImageTrack
            activeIndex={activeIndex}
            onChangeIndex={setActiveIndex}
            className="w-full aspect-[793/514]"
          />
        </motion.div>
      </div>
    </section>
  )
}

/** md 미만(모바일): 세로 중앙 정렬 스택, 스크롤 인터랙션 없이 fade-up만. */
function StaticSection3() {
  const sectionRef = useRef<HTMLElement>(null)
  const reduceMotion = useReducedMotion()
  const [activeIndex, setActiveIndex] = useState(0)

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
          <h2 className="text-title-2-medium text-text-primary md:text-title-1-medium">
            캠페인 등록
          </h2>
          <p className="text-headline-1-regular text-text-primary md:text-heading-2-regular">
            광고 영상을 업로드하고 송출할 지역과
            <br />
            매체를 선택해 캠페인을 등록할 수 있어요.
          </p>
        </div>

        <div className="flex w-full max-w-[1000px] flex-col items-center gap-x10">
          <FlowTabs
            steps={STEPS}
            activeIndex={activeIndex}
            onSelect={setActiveIndex}
            size="large"
            className="max-w-full overflow-x-auto scrollbar-none"
          />
          <FlowImageTrack
            activeIndex={activeIndex}
            onChangeIndex={setActiveIndex}
            className="w-full aspect-[1000/667]"
          />
        </div>
      </motion.div>
    </section>
  )
}

export default function Section3() {
  // 데스크탑 레이아웃(793px→952px 고정 이미지 + gap-x10)이 1440px 폭
  // 기준으로 설계돼 있어서, 예전처럼 1280부터 데스크탑으로 전환하면
  // 1280~1439px 구간에서 텍스트 칼럼이 심하게 찌그러진다 — Section4와
  // 함께 1440으로 올려서 그 구간은 이미 반응형인 TabletSection3가 담당하게 한다.
  const isDesktop = useMediaQuery('(min-width: 1440px)')
  const isTabletUp = useMediaQuery('(min-width: 768px)') // Tailwind 기본 --breakpoint-md

  if (isDesktop) {
    return <DesktopSection3 />
  }

  if (isTabletUp) {
    return <TabletSection3 />
  }

  return <StaticSection3 />
}
