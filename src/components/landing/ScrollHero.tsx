import { useRef } from 'react'
import {
  motion,
  useMotionValueEvent,
  useReducedMotion,
  useScroll,
  useTransform,
} from 'motion/react'
import { ChevronDown } from 'lucide-react'
import Button from '@/components/ui/Button'
import Icon from '@/components/ui/Icon'
import { useMediaQuery } from '@/lib/useMediaQuery'
import heroBg from '@/assets/landing/hero-bg.png'
import heroContent from '@/assets/landing/hero-content-2.png'

const TITLE = 'Make the Invisible Visible'
const BODY_LINE_1 =
  'Transform real-world attention into measurable insights with Vision AI.'
const BODY_LINE_2 =
  'Track foot traffic, ad viewers, and engagement around every DOOH display.'

function HeroCopy({ className = '' }: { className?: string }) {
  return (
    <div className={`text-center ${className}`}>
      <h1 className="text-[32px] font-medium leading-[1.3] tracking-[-0.03em] text-text-primary md:text-[40px] lg:text-[48px]">
        {TITLE}
      </h1>
      <p className="mt-x2 text-headline-1-regular text-text-primary md:text-heading-2-regular lg:text-heading-1-regular">
        {BODY_LINE_1}
        <br />
        {BODY_LINE_2}
      </p>
      <div className="mt-x8 flex flex-wrap items-center justify-center gap-x2">
        <Button variant="line" color="secondary" className="!bg-bg-secondary">
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
 * 대시보드 원본(hero-content.png)은 세로로 긴 스크린샷 전체(2880×3691)다. 박스
 * 비율을 고정하지 않고 `object-cover`+상단 기준으로 채운다 — 박스 비율이 뷰포트에
 * 따라 달라져도(모바일은 aspect-[876/487] 고정, 데스크탑은 폭·높이 각자 86%) 갭
 * 없이 항상 꽉 차고, 세로로 더/덜 보여주는 것만 달라진다.
 */
function HeroDashboardImage() {
  return (
    <div className="size-full overflow-hidden rounded-t-[16px]">
      <img
        src={heroContent}
        alt="Loovi 대시보드"
        className="size-full object-cover object-top"
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
        <div className="absolute inset-x-[7%] bottom-0 aspect-[876/487] w-[86%]">
          <HeroDashboardImage />
        </div>
      </div>
    </section>
  )
}

/**
 * 데스크탑 스크롤 인터랙션 전용 컴포넌트.
 *
 * sectionRef·useScroll을 이 컴포넌트 안에 둬야 한다 — ScrollHero 최상위에 두면
 * lg 미만으로 줄였다 다시 늘릴 때 <section>은 언마운트/재마운트되지만
 * useScroll은 동일한 ref 객체를 계속 구독해서 새 DOM 노드에 재연결되지 않고
 * 죽은 상태로 남는다(스크롤에 반응하지 않는 버그). 별도 컴포넌트로 분리해
 * 조건이 바뀔 때마다 완전히 새로 마운트되게 한다.
 */
function DesktopScrollHero() {
  const sectionRef = useRef<HTMLElement>(null)
  const scrollHintRef = useRef<HTMLDivElement>(null)

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start start', 'end end'],
  })

  // 섹션 높이 230dvh 기준: 등장(0~0.35, 배경·콘텐츠 모두 35%에 완전히 자리잡음) → 정지 유지(0.35~1)
  const visualScale = useTransform(scrollYProgress, [0, 0.35], [1, 0.78])
  const visualY = useTransform(scrollYProgress, [0, 0.35], ['0vh', '21vh'])
  const visualRadius = useTransform(
    scrollYProgress,
    [0, 0.35],
    ['0px', '32px'],
  )
  const copyOpacity = useTransform(scrollYProgress, [0.12, 0.29], [0, 1])
  const copyY = useTransform(scrollYProgress, [0.12, 0.29], [24, 0])
  const dashboardOpacity = useTransform(
    scrollYProgress,
    [0.23, 0.33],
    [0, 1],
  )
  const dashboardY = useTransform(scrollYProgress, [0.23, 0.35], [140, 0])

  // sticky가 풀리며 실제로 화면 밖으로 스크롤되어 나가는 구간(섹션 끝~그 아래 한 화면 높이)에
  // 맞춰 전체를 사라지게 한다. 이 구간이 다음 섹션(Section2)이 화면에 들어오는 시점과 겹쳐서
  // Hero가 사라지는 동시에 Section2가 나타나는 크로스페이드가 만들어진다.
  //
  // 배경(부드러운 그라데이션)과 콘텐츠(대비가 강한 대시보드 스크린샷)를 완전히 같은 값으로
  // 사라지게 해도, 대비가 강한 콘텐츠가 먼저 사라지는 것처럼 보이는 착시가 있다(사람 눈의
  // 인지 특성). 이를 상쇄하기 위해 배경을 콘텐츠보다 3% 먼저 사라지기 시작하게 한다.
  const { scrollYProgress: exitProgress } = useScroll({
    target: sectionRef,
    offset: ['end end', 'end start'],
  })
  const { scrollYProgress: bgExitProgress } = useScroll({
    target: sectionRef,
    offset: ['end 97%', 'end start'],
  })
  const bgExitOpacity = useTransform(bgExitProgress, [0, 0.6], [1, 0])
  const contentExitOpacity = useTransform(exitProgress, [0, 0.6], [1, 0])
  const copyFinalOpacity = useTransform(
    [copyOpacity, contentExitOpacity],
    (values) => (values as number[]).reduce((a, b) => a * b, 1),
  )
  const dashboardFinalOpacity = useTransform(
    [dashboardOpacity, contentExitOpacity],
    (values) => (values as number[]).reduce((a, b) => a * b, 1),
  )

  // 배경이 축소되는 구간(visualScale과 동일한 0~0.35)과 함께 사라진다.
  // style={{opacity: motionValue}} 반응형 바인딩이 이 코드베이스에서 간헐적으로
  // 멈췄다가 되살아나는 문제가 있어(원인 불명, Section2/4에서도 겪음) ref에
  // 직접 opacity를 써서 우회한다.
  const scrollHintOpacity = useTransform(scrollYProgress, [0, 0.35], [1, 0])
  useMotionValueEvent(scrollHintOpacity, 'change', (v) => {
    if (scrollHintRef.current) scrollHintRef.current.style.opacity = String(v)
  })

  return (
    <section ref={sectionRef} className="relative h-[230dvh]">
      <div className="sticky top-0 min-h-dvh overflow-hidden">
        <motion.div
          className="absolute left-1/2 top-x10 z-10 w-[min(680px,calc(100%-40px))] -translate-x-1/2"
          style={{ opacity: copyFinalOpacity, y: copyY }}
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
          <motion.img
            src={heroBg}
            alt=""
            className="size-full object-cover"
            style={{ opacity: bgExitOpacity }}
          />
          <motion.div
            className="absolute bottom-0 left-1/2 h-[94%] w-[86%]"
            style={{
              x: '-50%',
              opacity: dashboardFinalOpacity,
              y: dashboardY,
            }}
          >
            <HeroDashboardImage />
          </motion.div>
        </motion.div>

        <motion.div
          ref={scrollHintRef}
          className="absolute inset-x-0 bottom-x8 z-10 flex flex-col items-center gap-x1"
          style={{ opacity: scrollHintOpacity.get() }}
        >
          <span className="text-label-1-normal-regular text-text-primary">
            스크롤을 내려보세요
          </span>
          <motion.div
            animate={{ y: [0, 6, 0] }}
            transition={{ duration: 1.4, repeat: Infinity, ease: 'easeInOut' }}
          >
            <Icon icon={ChevronDown} color="primary" />
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}

export default function ScrollHero() {
  const isDesktop = useMediaQuery('(min-width: 1280px)') // tokens.css --breakpoint-lg
  const reduceMotion = useReducedMotion()
  const showScrollInteraction = isDesktop && !reduceMotion

  if (!showScrollInteraction) {
    return <StaticHero />
  }

  return <DesktopScrollHero />
}
