import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import DatePicker from '@/components/ui/DatePicker'
import DateTrigger from '@/components/ui/DateTrigger'
import type { DateRange } from '@/components/ui/Calendar'

const formatDate = (date: Date) =>
  `${date.getFullYear()}.${String(date.getMonth() + 1).padStart(2, '0')}.${String(
    date.getDate(),
  ).padStart(2, '0')}`

const meta: Meta<typeof DatePicker> = {
  title: 'Components/DatePicker',
  component: DatePicker,
  parameters: { layout: 'padded' },
  argTypes: {
    title: { control: 'text' },
    value: { control: false },
    defaultMonth: { control: false },
    minDate: { control: false },
    maxDate: { control: false },
    onChange: { control: false },
    onApply: { control: false },
    onClose: { control: false },
  },
}
export default meta

type Story = StoryObj<typeof DatePicker>

const JULY = new Date(2026, 6, 1)

/** status(Default/1 Day/2 Days) × type(Default/No_Input) 6종 매트릭스 */
export const Modes: Story = {
  render: () => {
    const statuses = [
      ['Default — 미선택', {}],
      [
        '1 Day — 하루 (시작=종료)',
        { start: new Date(2026, 6, 5), end: new Date(2026, 6, 5) },
      ],
      [
        '2 Days — 기간',
        { start: new Date(2026, 6, 7), end: new Date(2026, 6, 9) },
      ],
    ] as const satisfies readonly (readonly [string, DateRange])[]

    return (
      <div className="font-sans flex flex-col gap-10">
        {statuses.map(([label, value]) => (
          <div key={label} className="flex flex-col gap-2">
            <h2 className="text-label-1-normal-bold text-text-secondary">
              {label}
            </h2>
            <div className="flex flex-wrap items-start gap-6">
              <DatePicker value={value} defaultMonth={JULY} />
              <DatePicker value={value} defaultMonth={JULY} type="no_input" />
            </div>
          </div>
        ))}
      </div>
    )
  },
}

/* ── 트리거 + 피커 조합 ── */
function TriggerWithPickerExample() {
  const [open, setOpen] = useState(false)
  const [applied, setApplied] = useState<DateRange>()

  return (
    <div className="font-sans relative flex flex-col items-start gap-2 bg-bg-primary p-x4 pb-[480px]">
      <DateTrigger
        open={open}
        value={applied}
        onClick={() => setOpen((prev) => !prev)}
      />
      {open && (
        <DatePicker
          className="absolute top-[76px] z-10"
          defaultMonth={JULY}
          value={applied}
          onApply={(value) => {
            setApplied(value)
            setOpen(false)
          }}
          onClose={() => setOpen(false)}
        />
      )}
    </div>
  )
}

/** 트리거 클릭 → 피커 열림 → 선택 완료 시 트리거에 기간 반영 */
export const TriggerWithPicker: Story = {
  render: () => <TriggerWithPickerExample />,
}

/* ── 인터랙티브 ── */
function InteractiveExample() {
  const [applied, setApplied] = useState<DateRange>()
  const [message, setMessage] = useState('')

  return (
    <div className="font-sans flex flex-col gap-4">
      <p className="text-caption-1-regular text-text-caption">
        날짜 클릭 → 시작일/종료일 선택 · YYYY.MM.DD 직접 입력 가능 · 선택 완료로
        적용
      </p>
      <DatePicker
        defaultMonth={JULY}
        onApply={(value) => {
          setApplied(value)
          setMessage('')
        }}
        onClose={() => setMessage('취소/닫기 클릭됨')}
      />
      <p className="text-caption-1-regular text-text-caption">
        적용된 기간:{' '}
        {applied?.start
          ? `${formatDate(applied.start)}${
              applied.end ? ` - ${formatDate(applied.end)}` : ''
            }`
          : '(없음)'}
        {message && ` · ${message}`}
      </p>
    </div>
  )
}

/** 날짜 클릭으로 기간 선택 → 선택 완료/취소 */
export const Default: Story = {
  render: () => <InteractiveExample />,
}
