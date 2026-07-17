import {
  forwardRef,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from 'react'
import {
  motion,
  useMotionValueEvent,
  useReducedMotion,
  useScroll,
  useTransform,
} from 'motion/react'
import { useMediaQuery } from '@/lib/useMediaQuery'
import { FlowTabs } from './Section3'
import tolaDataImage from '@/assets/landing/TOLA-Data-3.png'
import liveViewerGraphImage from '@/assets/landing/Live-Viewer-Graph.png'
import bestFlowImage from '@/assets/landing/Best-Flow.png'
import averageViewTimeImage from '@/assets/landing/Average-View-Time-2.png'
import GenderYearsView from './GenderYearsView'
import TimeYearsHeatMap from './TimeYearsHeatMap'
import timeYearsHeatMapImage from '@/assets/landing/Time-Years-Heat-Map.png'
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
    x: 1029,
    y: 61,
    width: 564,
    height: 368,
  },
  { key: 'best-flow', label: 'Best Flow', x: -258, y: 490, width: 376, height: 348 },
  {
    key: 'time-years-heat-map',
    label: 'Time Years Heat Map',
    x: 858,
    y: 702,
    width: 576,
    height: 360,
  },
  {
    key: 'gender-years-view',
    label: 'Gender Years View',
    x: -180,
    y: 101,
    width: 564,
    height: 368,
  },
  {
    key: 'average-view-time',
    label: 'Average View Time',
    x: -82,
    y: 744,
    width: 450,
    height: 336,
  },
] as const

function TolaDataImage({ className = '' }: { className?: string }) {
  return (
    <img
      src={tolaDataImage}
      alt="TOLA Data"
      className={`rounded-[16px] object-cover shadow-normal-large ${className}`}
    />
  )
}

// 원본 이미지(1580×919, 비율 1.72)가 박스(564×368, 비율 1.53)보다 옆으로 더
// 길어서, object-cover를 쓰면 좌우가 잘려 타이틀·수치 라벨이 잘려나갔다
// (AverageViewTimeImage와 동일하게 object-contain + 배경 패딩으로 전체가
// 잘리지 않고 보이도록 한다).
function LiveViewerGraphImage({ className = '' }: { className?: string }) {
  return (
    <div
      className={`overflow-hidden rounded-[16px] bg-bg-secondary p-x1 shadow-normal-large ${className}`}
    >
      <img
        src={liveViewerGraphImage}
        alt="Live Viewer Graph"
        className="size-full rounded-[12px] object-contain object-center"
      />
    </div>
  )
}

function BestFlowImage({ className = '' }: { className?: string }) {
  return (
    <img
      src={bestFlowImage}
      alt="Best Flow"
      className={`rounded-[16px] object-cover shadow-normal-large ${className}`}
    />
  )
}

function AverageViewTimeImage({ className = '' }: { className?: string }) {
  return (
    <div
      className={`overflow-hidden rounded-[16px] bg-bg-secondary p-x1 shadow-normal-large ${className}`}
    >
      <img
        src={averageViewTimeImage}
        alt="Average View Time"
        className="size-full rounded-[12px] object-contain object-center"
      />
    </div>
  )
}

// 카드 사이 간격. gap을 트랙 전체에 걸어버리면 두 묶음 사이 이음매 간격까지
// 포함된 절반 지점이 실제 두 번째 묶음의 시작 지점보다 반 칸 어긋나서, 루프가
// 매번 반복될 때 살짝 튀는 것처럼 보였다 — 간격을 각 묶음 내부(및 끝에 이음매
// 간격 하나)에 포함시켜 두 묶음의 폭을 완전히 동일하게 만들고, 트랙 자체는
// gap 없이 두 묶음을 붙여서 정확히 -50% 지점이 두 번째 묶음의 시작이 되게 한다.
const LOOP_CARD_GAP_CLASS = 'gap-[12px] md:gap-[16px] lg:gap-[20px]'
const LOOP_CARD_SEAM_CLASS = 'pr-[12px] md:pr-[16px] lg:pr-[20px]'

function LoopCardSet({ keyPrefix }: { keyPrefix: string }) {
  return (
    <div className={`flex h-full items-center ${LOOP_CARD_GAP_CLASS} ${LOOP_CARD_SEAM_CLASS}`}>
      {LOOP_CARD_IMAGES.map((src, index) => (
        <img
          key={`${keyPrefix}-${index}`}
          src={src}
          alt=""
          className="h-[200px] w-[200px] shrink-0 rounded-[16px] object-cover md:h-[280px] md:w-[280px] lg:h-full lg:w-auto lg:aspect-square"
        />
      ))}
    </div>
  )
}

export function LoopCard({ loop }: { loop: boolean }) {
  return (
    <motion.div
      className="flex h-full w-max items-center"
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
      <LoopCardSet keyPrefix="a" />
      {loop && <LoopCardSet keyPrefix="b" />}
    </motion.div>
  )
}

const SectionTitle = forwardRef<
  HTMLHeadingElement,
  { className?: string; style?: CSSProperties; children?: ReactNode }
>(function SectionTitle({ className = '', style, children }, ref) {
  return (
    <h2
      ref={ref}
      className={`text-center text-title-2-medium text-text-primary md:text-title-1-medium lg:text-display-3-medium ${className}`}
      style={style}
    >
      {children ?? (
        <>
          유동인구로만 예측하던
          <br />
          기존의 옥외광고 측정 효과
        </>
      )}
    </h2>
  )
})

/**
 * 1280×1080 캔버스가 뷰포트보다 작아지도록(축소만, 확대는 안 함) 맞추는 배율.
 * 콘텐츠 실제 범위(y: -99~1142)가 1080보다 커서, 뷰포트가 짧은 노트북 화면에서는
 * 이 배율 없이는 위/아래 위젯이 overflow-hidden에 잘려 안 보인다.
 */
function useFitScale(contentWidth: number, contentHeight: number) {
  const [scale, setScale] = useState(1)

  useEffect(() => {
    const updateScale = () => {
      setScale(
        Math.min(1, window.innerWidth / contentWidth, window.innerHeight / contentHeight),
      )
    }
    updateScale()
    window.addEventListener('resize', updateScale)
    return () => window.removeEventListener('resize', updateScale)
  }, [contentWidth, contentHeight])

  return scale
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
  const fitScale = useFitScale(CONTAINER_WIDTH, CONTAINER_HEIGHT)

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
  // 중앙 기준으로 축소되며 동시에 TOLA Data로 디졸브(0.35~0.6, scale·오퍼시티 전부 같은
  // 구간 공유 — 축소되는 내내 같이 사라지고 나타남, 이후 루프카드는 스크롤 끝까지 오퍼시티
  // 0 고정) → 5개 위젯 상승 등장(0.65~0.92) → 유지(0.92~1)
  const titleOpacity = useTransform(pinProgress, [0.35, 0.45], [1, 0])

  // 루프카드와 TOLA Data가 완전히 같은 scale·오퍼시티 구간(0.35~0.6)을 공유 — 축소되는
  // 내내 같이 디졸브되고, 축소가 끝나는 시점(0.6)에 정확히 루프카드 0%/TOLA 100%가 된다.
  const shrinkScale = useTransform(
    pinProgress,
    [0.35, 0.6],
    [LOOP_CARD_START_SCALE, 1],
  )
  const loopCardOpacity = useTransform(pinProgress, [0.35, 0.6], [1, 0])
  const tolaOpacity = useTransform(pinProgress, [0.35, 0.6], [0, 1])

  // 루프카드가 다 사라진 뒤에도 내부 무한 루프 애니메이션이 계속 돌면(다른 트리에서만
  // 발생) 불필요한 리소스 낭비이자, 조상 opacity 갱신과 간섭할 가능성이 있어 완전히
  // 사라지면 루프 자체를 멈춘다.
  const [isLoopCardVisible, setIsLoopCardVisible] = useState(true)
  useMotionValueEvent(loopCardOpacity, 'change', (v) => setIsLoopCardVisible(v > 0.01))

  const widgetOpacity = useTransform(pinProgress, [0.65, 0.92], [0, 1])
  const widgetY = useTransform(pinProgress, [0.65, 0.92], [60, 0])

  // motion.div의 style={{opacity: ...}} 반응형 바인딩이 이 컴포넌트 안에서 스크롤 끝부분에
  // 간헐적으로 갱신되지 않는 문제가 있어(원인 불명, style prop 우회), 아래 4곳(타이틀·
  // 루프카드·TOLA·5개 위젯) 전부 ref로 직접 DOM에 opacity/transform을 써넣는 방식으로
  // 확실하게 고정한다.
  const titleRef = useRef<HTMLHeadingElement>(null)
  useMotionValueEvent(titleOpacity, 'change', (v) => {
    if (titleRef.current) titleRef.current.style.opacity = String(v)
  })

  const loopCardWrapperRef = useRef<HTMLDivElement>(null)
  useMotionValueEvent(loopCardOpacity, 'change', (v) => {
    if (loopCardWrapperRef.current) {
      loopCardWrapperRef.current.style.opacity = String(v)
    }
  })

  const tolaWrapperRef = useRef<HTMLDivElement>(null)
  useMotionValueEvent(tolaOpacity, 'change', (v) => {
    if (tolaWrapperRef.current) tolaWrapperRef.current.style.opacity = String(v)
  })

  // TOLA Data 뒤에 깔리는 배경 그라디언트 — TOLA와 같은 tolaOpacity를 그대로
  // 재생 구간으로 써서 TOLA가 디졸브되어 나타나는 것과 정확히 같은 타이밍에,
  // 아래에서 위로 스크롤되어 올라오는 것처럼 clip-path로 쓸어 올리며 등장한다.
  const tolaGradientRef = useRef<HTMLDivElement>(null)
  useMotionValueEvent(tolaOpacity, 'change', (v) => {
    if (tolaGradientRef.current) {
      tolaGradientRef.current.style.clipPath = `inset(${(1 - v) * 100}% 0% 0% 0%)`
    }
  })

  // TOLA 위에 뜨는 새 타이틀 — 원래 타이틀이 있던 자리를 그대로 물려받되,
  // 등장 타이밍은 TOLA가 아니라 5개 위젯과 같은 widgetOpacity로 맞춘다.
  const tolaTitleRef = useRef<HTMLDivElement>(null)
  useMotionValueEvent(widgetOpacity, 'change', (v) => {
    if (tolaTitleRef.current) tolaTitleRef.current.style.opacity = String(v)
  })

  const widgetRefs = useRef<Record<string, HTMLDivElement | null>>({})
  useMotionValueEvent(widgetOpacity, 'change', (v) => {
    for (const el of Object.values(widgetRefs.current)) {
      if (el) el.style.opacity = String(v)
    }
  })
  useMotionValueEvent(widgetY, 'change', (v) => {
    for (const el of Object.values(widgetRefs.current)) {
      if (el) el.style.transform = `translateY(${v}px)`
    }
  })

  // Gender Years View 위젯의 막대 채워짐 애니메이션 트리거. 위젯이 절반쯤
  // 보이기 시작하면 한 번만 true로 고정한다(스크롤을 살짝 오갈 때 막대가
  // 다시 접혔다 펴지는 깜빡임을 막기 위해).
  const [isGenderWidgetRevealed, setIsGenderWidgetRevealed] = useState(false)
  useMotionValueEvent(widgetOpacity, 'change', (v) => {
    if (v > 0.3) setIsGenderWidgetRevealed(true)
  })

  return (
    <section ref={sectionRef} className="relative h-[420dvh]">
      <div className="sticky top-0 flex h-dvh items-center justify-center overflow-hidden">
        <div
          ref={tolaGradientRef}
          className="absolute inset-0 bg-gradient-to-b from-white to-[var(--blue-400)]"
          style={{
            clipPath: `inset(${(1 - tolaOpacity.get()) * 100}% 0% 0% 0%)`,
          }}
        />

        <motion.div
          className="relative"
          style={{
            width: CONTAINER_WIDTH,
            height: CONTAINER_HEIGHT,
            opacity: entranceOpacity,
            y: entranceY,
            scale: fitScale,
          }}
        >
          <SectionTitle
            ref={titleRef}
            className="absolute inset-x-0 top-[150px]"
            style={{ opacity: titleOpacity.get() }}
          />

          <div
            ref={tolaTitleRef}
            className="absolute inset-x-0 top-[243px] flex flex-col items-center gap-x2"
            style={{ opacity: widgetOpacity.get() }}
          >
            <SectionTitle className="whitespace-nowrap">
              이제 Loovi에서 확인해 보세요
            </SectionTitle>
            <p className="text-heading-1-regular text-text-primary">
              유동인구부터 시청 수까지 다양한 옥외광고 성과 데이터를 측정할 수
              있어요.
            </p>
          </div>

          {/* opacity 담당(부모) / scale 담당(자식) 분리 — 루프카드, opacity는 ref로 직접 갱신 */}
          <div
            ref={loopCardWrapperRef}
            className="absolute"
            style={{
              left: TOLA_DATA.x,
              top: TOLA_DATA.y,
              width: TOLA_DATA.width,
              height: TOLA_DATA.height,
              opacity: loopCardOpacity.get(),
            }}
          >
            <motion.div
              className="size-full origin-center overflow-hidden rounded-[16px]"
              style={{ scale: shrinkScale }}
            >
              <LoopCard loop={isLoopCardVisible} />
            </motion.div>
          </div>

          {/* opacity 담당(부모) / scale 담당(자식) 분리 — TOLA Data, opacity는 ref로 직접 갱신 */}
          <div
            ref={tolaWrapperRef}
            className="absolute"
            style={{
              left: TOLA_DATA.x,
              top: TOLA_DATA.y,
              width: TOLA_DATA.width,
              height: TOLA_DATA.height,
              opacity: tolaOpacity.get(),
              zIndex: 10,
            }}
          >
            <motion.div
              className="size-full origin-center"
              style={{ scale: shrinkScale }}
            >
              <TolaDataImage className="size-full" />
            </motion.div>
          </div>

          {WIDGETS.map((widget) => (
            <div
              key={widget.key}
              ref={(el) => {
                widgetRefs.current[widget.key] = el
              }}
              className="absolute"
              style={{
                left: widget.x,
                top: widget.y,
                width: widget.width,
                height: widget.height,
                opacity: widgetOpacity.get(),
                transform: `translateY(${widgetY.get()}px)`,
                zIndex:
                  widget.key === 'best-flow' || widget.key === 'gender-years-view'
                    ? 0
                    : 10,
              }}
            >
              {widget.key === 'gender-years-view' ? (
                <div className="size-full origin-top-left scale-[0.8]">
                  <GenderYearsView
                    className="size-full"
                    active={isGenderWidgetRevealed}
                  />
                </div>
              ) : widget.key === 'live-viewer-graph' ? (
                <div className="size-full origin-top-left scale-[0.75]">
                  <LiveViewerGraphImage className="size-full" />
                </div>
              ) : widget.key === 'best-flow' ? (
                <BestFlowImage className="size-full" />
              ) : widget.key === 'time-years-heat-map' ? (
                <TimeYearsHeatMap className="size-full" />
              ) : (
                <AverageViewTimeImage className="size-full" />
              )}
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}

function FadeInCard({
  reduceMotion,
  className = '',
  children,
}: {
  reduceMotion: boolean
  className?: string
  children: ReactNode
}) {
  return (
    <motion.div
      className={`w-full max-w-[500px] ${className}`}
      initial={reduceMotion ? false : { opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
    >
      {children}
    </motion.div>
  )
}

// 모바일·태블릿 전용 위젯 탭 스위처. 위젯 5개 중 2개(GenderYearsView·
// TimeYearsHeatMap)는 고정 비율 이미지가 아니라 콘텐츠 높이가 자체적으로
// 정해지는 카드 컴포넌트라, Section3의 드래그 캐러셀(고정 비율 슬라이드
// 전제)을 그대로 재사용할 수 없다 — 탭으로 하나씩 전환해 보여주는 방식으로
// 단순화했다.
//
// live-viewer-graph·average-view-time는 원본 이미지 비율이 제각각(1.15~1.72)
// 이라 높이를 자체 비율에 맡기면 서로 크기 차이가 심하게 났다 — 둘 다
// aspect-[3/2]로 통일해 GenderYearsView·TimeYearsHeatMap 카드의 자연 높이와
// 비슷한 크기가 되도록 맞췄다.
//
// best-flow는 원본이 거의 정사각형(1504×1392)이라 3:2 박스를 쓰면 크롭되고,
// object-contain으로 바꾸면 레터박스가 생긴다 — 박스 비율 자체를 원본
// 이미지 비율(aspect-[1504/1392])에 맞춰서 크롭도 레터박스도 없앴다. 그만큼
// 다른 위젯보다 박스가 세로로 좀 더 길다.
// 모바일 폭에서는 TimeYearsHeatMap 컴포넌트 내부 라벨·칸이 너무 좁아져
// 깨져 보인다 — 모바일만 정적 이미지로 대체하고, 태블릿 이상은 그대로
// 실제 컴포넌트(필터 등 인터랙션 유지)를 쓴다.
function TimeYearsHeatMapWidget({ className = '' }: { className?: string }) {
  const isTabletUp = useMediaQuery('(min-width: 768px)') // Tailwind 기본 --breakpoint-md

  if (isTabletUp) {
    return <TimeYearsHeatMap className={className} />
  }

  return (
    <img
      src={timeYearsHeatMapImage}
      alt="Time Years Heat Map"
      className={`rounded-x2 object-contain shadow-normal-large ${className}`}
    />
  )
}

const WIDGET_STEPS = [
  { key: 'tola-data', label: 'Funnel Data', render: () => <TolaDataImage className="w-full" /> },
  { key: 'gender-years-view', label: '성별·연령 분석', render: () => <GenderYearsView className="w-full" /> },
  {
    key: 'best-flow',
    label: '인기 동선',
    render: () => (
      <div className="aspect-[1504/1392] w-full scale-[0.75] overflow-hidden rounded-[20px] bg-bg-secondary shadow-normal-large">
        <img
          src={bestFlowImage}
          alt="Best Flow"
          className="size-full rounded-[20px] object-contain object-center"
        />
      </div>
    ),
  },
  { key: 'time-years-heat-map', label: '시간대별 분석', render: () => <TimeYearsHeatMapWidget className="w-full" /> },
  { key: 'live-viewer-graph', label: '실시간 시청 수', render: () => <LiveViewerGraphImage className="w-full aspect-[3/2]" /> },
  { key: 'average-view-time', label: '평균 시청 시간', render: () => <AverageViewTimeImage className="w-full aspect-[1504/1312] scale-[0.75]" /> },
] as const

// 위젯 6개를 전부 마운트한 채 grid의 같은 셀(col-start-1 row-start-1)에
// 겹쳐두고 활성 항목만 오퍼시티로 보여준다 — grid는 같은 셀을 공유하는
// 자식들 중 가장 큰 높이에 트랙 높이를 맞추므로, 별도 측정 로직 없이도
// 컨테이너(및 그 배경 그라디언트)가 가장 높은 위젯 기준으로 고정된다.
// 탭을 바꿔도 짧은 위젯이 보일 때 아래 그라디언트가 줄어들지 않는다.
function WidgetSwitcher({ reduceMotion }: { reduceMotion: boolean }) {
  const [activeIndex, setActiveIndex] = useState(0)

  return (
    <div className="flex w-full flex-col items-center gap-x6">
      <FlowTabs
        steps={WIDGET_STEPS}
        activeIndex={activeIndex}
        onSelect={setActiveIndex}
        size="medium"
        className="scrollbar-none max-w-full overflow-x-auto"
      />

      <div className="grid w-full px-x5">
        {WIDGET_STEPS.map((step, index) => (
          <div
            key={step.key}
            aria-hidden={index !== activeIndex}
            inert={index !== activeIndex}
            className={`col-start-1 row-start-1 flex items-center justify-center ${reduceMotion ? '' : 'transition-opacity duration-300'} ${
              index === activeIndex
                ? 'opacity-100'
                : 'pointer-events-none opacity-0'
            }`}
          >
            {step.render()}
          </div>
        ))}
      </div>
    </div>
  )
}

/** lg(1280px) 미만이거나 prefers-reduced-motion일 때: 세로 1열로 쌓고 각자 뷰포트 진입 시 페이드인 */
function StaticSection2() {
  const reduceMotion = useReducedMotion()

  return (
    <section className="overflow-hidden pt-[120px]">
      <motion.div
        initial={reduceMotion ? false : { opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.3 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
      >
        <SectionTitle />
        <div className="mt-x10 overflow-hidden">
          <LoopCard loop={!reduceMotion} />
        </div>
      </motion.div>
      <div className="mt-x6 flex flex-col items-center gap-x6 rounded-t-[24px] bg-gradient-to-b from-white to-[var(--blue-400)] px-x5 py-x8">
        <FadeInCard
          reduceMotion={!!reduceMotion}
          className="mt-[100px] md:max-w-[700px]"
        >
          <div className="flex flex-col items-center gap-x3 text-center">
            <SectionTitle className="whitespace-nowrap">
              이제 Loovi에서 확인해 보세요
            </SectionTitle>
            <p className="text-headline-1-regular text-text-primary md:whitespace-nowrap md:text-heading-2-regular">
              유동인구부터 시청 수까지{' '}
              <br className="md:hidden" />
              다양한 옥외광고 성과 데이터를 측정할 수 있어요.
            </p>
          </div>
        </FadeInCard>

        <FadeInCard
          reduceMotion={!!reduceMotion}
          className="md:max-w-[700px]"
        >
          <WidgetSwitcher reduceMotion={!!reduceMotion} />
        </FadeInCard>
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
