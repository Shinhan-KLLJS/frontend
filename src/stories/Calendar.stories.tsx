import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import Calendar, {
  CalendarDay,
  CalendarMonthNav,
  CALENDAR_DAY_STATE,
  type CalendarDayState,
  type DateRange,
} from '@/components/ui/Calendar'

const meta: Meta<typeof Calendar> = {
  title: 'Components/Calendar',
  component: Calendar,
  parameters: { layout: 'padded' },
  argTypes: {
    month: { control: false },
    value: { control: false },
    onSelectDay: { control: false },
    minDate: { control: false },
    maxDate: { control: false },
  },
}
export default meta

type Story = StoryObj<typeof Calendar>

const JULY = new Date(2026, 6, 1)
const AUGUST = new Date(2026, 7, 1)

/* ── 월 네비게이션 ── */
function MonthNavExample() {
  const [month, setMonth] = useState(AUGUST)
  return (
    <div className="w-[280px]">
      <CalendarMonthNav month={month} onMonthChange={setMonth} />
    </div>
  )
}

export const MonthNav: Story = {
  render: () => <MonthNavExample />,
}

/* ── 일 셀 상태 ── */
const STATE_LABEL: Record<CalendarDayState, string> = {
  default: 'Default',
  hover: 'Hover (Strong 7.5%)',
  press: 'Press (Strong 18%)',
  focus: 'Focus (Strong 12%)',
  disable: 'Disable',
  day: 'Day (요일)',
}

/** 매트릭스 : 일 셀 6종 상태 */
export const DayStates: Story = {
  render: () => (
    <div className="font-sans flex flex-col gap-2">
      {CALENDAR_DAY_STATE.map((state) => (
        <div key={state} className="flex items-center gap-4">
          <span className="w-[140px] text-caption-1-regular text-text-caption">
            {STATE_LABEL[state]}
          </span>
          <CalendarDay state={state}>
            {state === 'day' ? '월' : '31'}
          </CalendarDay>
        </div>
      ))}
    </div>
  ),
}

/* ── 월 그리드 ── */
export const Grid: Story = {
  render: () => (
    <div className="font-sans flex items-start gap-10">
      <div className="flex flex-col gap-2">
        <h3 className="text-label-1-normal-bold text-text-secondary">
          5주 - 2026년 7월
        </h3>
        <Calendar month={JULY} />
      </div>

      <div className="flex flex-col gap-2">
        <h3 className="text-label-1-normal-bold text-text-secondary">
          6주 - 2026년 8월
        </h3>
        <Calendar month={AUGUST} />
      </div>

      <div className="flex flex-col gap-2">
        <h3 className="text-label-1-normal-bold text-text-secondary">
          기간 선택됨 (08.07 - 08.07)
        </h3>
        <Calendar
          month={AUGUST}
          value={{ start: new Date(2026, 7, 7), end: new Date(2026, 7, 7) }}
        />
      </div>

      <div className="flex flex-col gap-2">
        <h3 className="text-label-1-normal-bold text-text-secondary">
          기간 선택됨 (08.07 - 08.09)
        </h3>
        <Calendar
          month={AUGUST}
          value={{ start: new Date(2026, 7, 7), end: new Date(2026, 7, 9) }}
        />
      </div>
    </div>
  ),
}

/* ── 통합: 네비 + 그리드 + 선택 ── */
function RangeExample() {
  const [month, setMonth] = useState(AUGUST)
  const [range, setRange] = useState<DateRange>({
    start: new Date(2026, 6, 7),
    end: new Date(2026, 6, 9),
  })

  const selectDay = (day: Date) => {
    if (!range.start || range.end) {
      setRange({ start: day })
    } else if (day.getTime() < range.start.getTime()) {
      setRange({ start: day })
    } else {
      setRange({ start: range.start, end: day })
    }
  }

  return (
    <div className="font-sans flex flex-col gap-2">
      <div className="w-[280px]">
        <CalendarMonthNav month={month} onMonthChange={setMonth} />
        <Calendar month={month} value={range} onSelectDay={selectDay} />
      </div>
    </div>
  )
}

export const Default: Story = {
  render: () => <RangeExample />,
}
