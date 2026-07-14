import { useRef } from 'react'
import { motion, useReducedMotion, useScroll, useTransform } from 'motion/react'
import { useMediaQuery } from '@/lib/useMediaQuery'
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

function CardMarquee({ loop }: { loop: boolean }) {
  const cards = loop ? [...MARQUEE_IMAGES, ...MARQUEE_IMAGES] : MARQUEE_IMAGES

  return (
    <div className="mt-x10 overflow-hidden">
      <motion.div
        className="flex w-max gap-[12px] md:gap-[16px] lg:gap-[20px]"
        animate={loop ? { x: ['0%', '-50%'] } : undefined}
        transition={
          loop
            ? {
                duration: MARQUEE_DURATION_SECONDS,
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
            className="h-[200px] w-[200px] shrink-0 rounded-[16px] object-cover md:h-[280px] md:w-[280px] lg:h-[387px] lg:w-[387px]"
          />
        ))}
      </motion.div>
    </div>
  )
}

function SectionTitle() {
  return (
    <h2 className="text-[32px] font-medium leading-[1.3] tracking-[-0.03em] text-center text-text-primary md:text-display-2-medium">
      유동인구로만 예측하던
      <br />
      기존의 옥외광고 측정 효과
    </h2>
  )
}

/**
 * 데스크탑 전용: Hero가 sticky에서 풀려 화면 밖으로 스크롤되어 나가는 구간과 정확히 같은
 * 구간(자신의 top이 뷰포트 bottom→top으로 이동하는 구간)에 맞춰 페이드인한다.
 * Hero 바로 다음에 마진 없이 붙어있어 두 구간이 겹쳐 크로스페이드처럼 보인다.
 * ScrollHero와 같은 이유로 sectionRef·useScroll을 별도 컴포넌트에 둔다(리사이즈 시
 * 언마운트/재마운트돼도 매번 새로 구독되도록).
 */
function DesktopSection2() {
  const sectionRef = useRef<HTMLElement>(null)
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start end', 'start start'],
  })
  const opacity = useTransform(scrollYProgress, [0.5, 1], [0, 1])
  const y = useTransform(scrollYProgress, [0.5, 1], [40, 0])

  return (
    <motion.section
      ref={sectionRef}
      className="overflow-hidden py-[120px]"
      style={{ opacity, y }}
    >
      <SectionTitle />
      <CardMarquee loop />
    </motion.section>
  )
}

/** lg(1280px) 미만: Hero에 스크롤 인터랙션이 없으므로 뷰포트 진입 시 1회성 페이드인만 적용 */
function StaticSection2() {
  const reduceMotion = useReducedMotion()

  return (
    <motion.section
      className="overflow-hidden py-[120px]"
      initial={reduceMotion ? false : { opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
    >
      <SectionTitle />
      <CardMarquee loop={!reduceMotion} />
    </motion.section>
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
