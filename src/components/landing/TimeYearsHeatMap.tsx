import { useState } from 'react'
import { Chip } from '@/components/ui'

const HOURS = Array.from(
  { length: 19 },
  (_, i) => `${String(i + 6).padStart(2, '0')}시`,
)

const AGE_GROUPS = [
  '0-9세',
  '10-19세',
  '20-29세',
  '30-39세',
  '40-49세',
  '50-59세',
  '60세 이상',
] as const

type Filter = 'all' | 'male' | 'female'

const FILTERS: { key: Filter; label: string }[] = [
  { key: 'all', label: '전체' },
  { key: 'male', label: '남성' },
  { key: 'female', label: '여성' },
]

// 시드 기반 결정론적 의사난수(랜덤이 아니라 매 렌더 동일한 값) — 0~1 범위.
function hashNoise(a: number, b: number, salt: number): number {
  const x = Math.sin(a * 12.9898 + b * 78.233 + salt * 37.719) * 43758.5453
  return x - Math.floor(x)
}

// 연령대·시간대별 노출도(0~4단계) 목데이터. 오전 11시대·저녁 19시대에 이중
// 피크가 있고 연령이 높을수록 피크 시간대·폭이 조금씩 달라지도록, 성별마다도
// 위상을 어긋나게 줘서 칩을 바꿨을 때 패턴이 달라지도록 했다. 매끈한 파형만
// 쓰면 행마다 같은 모양이 살짝 밀린 것처럼 보여 부자연스러우므로, 셀마다
// 결정론적 노이즈를 더해 실측 데이터처럼 울퉁불퉁하게 만든다.
function generateRow(ageIndex: number, phaseShift: number, salt: number): number[] {
  return Array.from({ length: HOURS.length }, (_, hourIndex) => {
    const hour = hourIndex + 6
    const peak1 = 11 + ageIndex * 0.7 + phaseShift
    const peak2 = 19 - ageIndex * 0.4 + phaseShift
    const wave =
      Math.exp(-((hour - peak1) ** 2) / (12 + ageIndex * 2)) +
      Math.exp(-((hour - peak2) ** 2) / (9 + ageIndex))
    const noise = (hashNoise(ageIndex, hourIndex, salt) - 0.5) * 2.2
    return Math.min(4, Math.max(0, Math.round(wave * 3 + noise)))
  })
}

const ALL_ROWS = AGE_GROUPS.map((_, i) => generateRow(i, 0, 0))

// 전체 탭에서 노출도가 0(surface, "데이터 없음")인 칸은 남성/여성 탭에서도
// 항상 0이어야 한다 — 전체에 없던 데이터가 성별로 나누면 생기는 건 모순이므로,
// 전체 기준으로 0인 칸을 마스킹한다.
function maskByAll(rows: number[][]): number[][] {
  return rows.map((row, ageIndex) =>
    row.map((value, hourIndex) =>
      ALL_ROWS[ageIndex][hourIndex] === 0 ? 0 : value,
    ),
  )
}

const DATA: Record<Filter, number[][]> = {
  all: ALL_ROWS,
  male: maskByAll(AGE_GROUPS.map((_, i) => generateRow(i, -0.6, 1))),
  female: maskByAll(AGE_GROUPS.map((_, i) => generateRow(i, 0.6, 2))),
}

const LEVEL_COLOR = [
  'bg-chart-surface',
  'bg-chart-sequential-1',
  'bg-chart-sequential-2',
  'bg-chart-sequential-3',
  'bg-chart-sequential-4',
]

export default function TimeYearsHeatMap({
  className = '',
}: {
  className?: string
}) {
  const [filter, setFilter] = useState<Filter>('all')
  const rows = DATA[filter]

  return (
    <div
      className={`flex flex-col gap-x3 rounded-x3 bg-bg-secondary p-x4 shadow-normal-xlarge ${className}`}
    >
      <div className="flex flex-col gap-x3">
        <div className="flex items-center justify-between">
          <p className="text-heading-2-bold text-text-primary">
            시간・연령별 노출도
          </p>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-x1">
            {FILTERS.map(({ key, label }) => (
              <Chip
                key={key}
                selected={filter === key}
                size="medium"
                onClick={() => setFilter(key)}
              >
                {label}
              </Chip>
            ))}
          </div>
          <div className="flex items-center gap-x1">
            <span className="text-label-1-normal-medium text-text-caption">
              Less
            </span>
            {LEVEL_COLOR.slice(1).map((color) => (
              <span
                key={color}
                className={`size-[12px] rounded-[2px] ${color}`}
              />
            ))}
            <span className="text-label-1-normal-medium text-text-caption">
              More
            </span>
          </div>
        </div>
      </div>
      <div className="flex flex-col gap-x3">
        <div className="flex items-center gap-x2">
          <span className="w-[66px] shrink-0" />
          <div className="flex min-w-0 flex-1 items-center justify-between">
            {HOURS.map((hour) => (
              <span
                key={hour}
                className="min-w-0 flex-1 text-center text-caption-2-regular text-text-caption"
              >
                {hour}
              </span>
            ))}
          </div>
        </div>
        <div
          className="flex flex-col gap-x2"
          role="group"
          aria-label="연령대·시간대별 노출도 히트맵"
        >
          {AGE_GROUPS.map((label, rowIndex) => (
            <div key={label} className="flex items-center gap-x2">
              <span className="w-[66px] shrink-0 whitespace-nowrap text-right text-label-1-normal-regular text-text-secondary">
                {label}
              </span>
              <div className="flex min-w-0 flex-1 items-center justify-between gap-[2px]">
                {rows[rowIndex].map((level, hourIndex) => (
                  <span
                    key={hourIndex}
                    role="img"
                    aria-label={`${label}, ${HOURS[hourIndex]}, 노출도 ${level}/4`}
                    className={`aspect-square min-w-0 flex-1 rounded-[2px] transition-colors duration-500 ${LEVEL_COLOR[level]}`}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
