import { useState } from 'react'
import { motion } from 'motion/react'
import { Chip } from '@/components/ui'
import { useMediaQuery } from '@/lib/useMediaQuery'

const AGE_GROUPS = [
  '0-9세',
  '10-19세',
  '20-29세',
  '30-39세',
  '40-49세',
  '50-59세',
  '60세 이상',
] as const

// 연령대별 "전체 시청 비율"(둘을 더한 값)의 합이 100 — 각 연령대를 남/여로
// 나눈 분할값. 남성 탭·여성 탭은 이 분할값을 그대로 보여준다(그 성별 안에서
// 다시 100%로 재계산하지 않음 — 남성 합계 48, 여성 합계 52로 전체 100을 구성).
const MALE_DATA = [4, 6, 8, 9, 7, 8, 6]
const FEMALE_DATA = [4, 7, 11, 8, 8, 7, 7]

type Filter = 'all' | 'male' | 'female'

const FILTERS: { key: Filter; label: string }[] = [
  { key: 'all', label: '전체' },
  { key: 'male', label: '남성' },
  { key: 'female', label: '여성' },
]

function AgeGroupRow({
  label,
  filter,
  maleValue,
  femaleValue,
  maxValue,
  revealed,
  delay,
}: {
  label: string
  filter: Filter
  maleValue: number
  femaleValue: number
  maxValue: number
  revealed: boolean
  delay: number
}) {
  const maleWidthPercent = revealed ? (maleValue / maxValue) * 100 : 0
  const femaleWidthPercent = revealed ? (femaleValue / maxValue) * 100 : 0
  const transition = { duration: 0.7, ease: 'easeOut' as const, delay }

  return (
    <div className="flex w-full items-center gap-x3">
      <span className="w-[60px] shrink-0 text-right text-label-1-normal-regular text-text-secondary">
        {label}
      </span>
      <div className="relative h-[16px] flex-1 rounded-x1 bg-chart-surface">
        {filter === 'all' ? (
          <>
            <motion.div
              className="absolute inset-y-0 left-0 rounded-l-x1 bg-chart-categorical-1"
              initial={{ width: 0 }}
              animate={{ width: `${maleWidthPercent}%` }}
              transition={transition}
            />
            <motion.div
              className="absolute inset-y-0 rounded-r-x1 bg-chart-sequential-1"
              initial={{ width: 0, left: 0 }}
              animate={{
                width: `${femaleWidthPercent}%`,
                left: `${maleWidthPercent}%`,
              }}
              transition={transition}
            />
          </>
        ) : (
          <motion.div
            className={`absolute inset-y-0 left-0 rounded-x1 ${filter === 'male' ? 'bg-chart-categorical-1' : 'bg-chart-sequential-1'}`}
            initial={{ width: 0 }}
            animate={{
              width: `${filter === 'male' ? maleWidthPercent : femaleWidthPercent}%`,
            }}
            transition={transition}
          />
        )}
      </div>
      <span className="w-[50px] shrink-0 whitespace-nowrap text-right text-body-1-normal-medium text-text-primary">
        {filter === 'all' && `${maleValue + femaleValue}%`}
        {filter === 'male' && `${maleValue}%`}
        {filter === 'female' && `${femaleValue}%`}
      </span>
    </div>
  )
}

export default function GenderYearsView({
  className = '',
  active,
}: {
  className?: string
  /**
   * 막대 채워짐 애니메이션을 시작할지 여부를 외부에서 직접 제어할 때 사용한다
   * (예: 데스크탑 스크롤 pin 구간의 opacity 임계값과 동기화). 전달하지 않으면
   * 이 컴포넌트가 스스로 뷰포트 진입을 감지해 트리거한다(모바일/태블릿 정적
   * 레이아웃처럼 일반 스크롤로 나타나는 경우).
   */
  active?: boolean
}) {
  const [filter, setFilter] = useState<Filter>('all')
  const [inViewRevealed, setInViewRevealed] = useState(false)
  const revealed = active ?? inViewRevealed
  // 모바일에서는 칩이 한 단계 작은 사이즈(medium→small)를 쓴다.
  const isTabletUp = useMediaQuery('(min-width: 768px)') // Tailwind 기본 --breakpoint-md
  const chipSize = isTabletUp ? 'medium' : 'small'

  // 데이터 값이 100 기준으로는 다 작아서(최댓값 20% 안팎) 막대가 짧아 보이므로,
  // 실제 최댓값(100)보다 작은 30을 스케일 기준으로 써서 막대가 더 길어 보이게 한다.
  // (막대가 트랙을 넘지 않도록 값이 30을 넘지 않는 한에서만 유효 — 현재 최댓값 19)
  const maxValue = 30

  return (
    <motion.div
      className={`flex flex-col gap-x3 rounded-[16px] bg-bg-secondary p-x5 shadow-normal-xlarge ${className}`}
      viewport={{ once: true, amount: 0.4 }}
      onViewportEnter={
        active === undefined ? () => setInViewRevealed(true) : undefined
      }
    >
      <div className="flex flex-col gap-x3">
        <div className="flex items-center justify-between">
          <p className="text-heading-2-bold text-text-primary">
            성별・연령 시청 비율
          </p>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-x1">
            {FILTERS.map(({ key, label }) => (
              <Chip
                key={key}
                selected={filter === key}
                size={chipSize}
                onClick={() => setFilter(key)}
              >
                {label}
              </Chip>
            ))}
          </div>
          {filter === 'all' && (
            <div className="flex items-center gap-x2">
              <div className="flex items-center gap-1">
                <span className="size-[12px] rounded-[2px] bg-chart-categorical-1" />
                <span className="text-label-1-normal-medium text-text-caption">
                  남성
                </span>
              </div>
              <div className="flex items-center gap-1">
                <span className="size-[12px] rounded-[2px] bg-chart-sequential-1" />
                <span className="text-label-1-normal-medium text-text-caption">
                  여성
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
      <div className="flex flex-col gap-x3">
        {AGE_GROUPS.map((label, index) => (
          <AgeGroupRow
            key={label}
            label={label}
            filter={filter}
            maleValue={MALE_DATA[index]}
            femaleValue={FEMALE_DATA[index]}
            maxValue={maxValue}
            revealed={revealed}
            delay={index * 0.06}
          />
        ))}
      </div>
    </motion.div>
  )
}
