import type { Meta, StoryObj } from '@storybook/react-vite'
import ScrollArea, { SCROLLBAR_SIZE } from '@/components/ui/ScrollArea'

/**
 * 커스텀 스크롤바 스크롤 컨테이너
 */
const meta: Meta<typeof ScrollArea> = {
  title: 'Components/ScrollArea',
  component: ScrollArea,
  parameters: { layout: 'padded' },
  argTypes: {
    size: {
      control: 'select',
      options: Object.keys(SCROLLBAR_SIZE),
    },
    axis: {
      control: 'select',
      options: ['vertical', 'horizontal', 'both'],
    },
  },
}
export default meta

type Story = StoryObj<typeof ScrollArea>

const LONG_LIST = Array.from(
  { length: 30 },
  (_, i) => `검색 결과 항목 ${i + 1}`,
)

function DemoList() {
  return (
    <ul>
      {LONG_LIST.map((label) => (
        <li
          key={label}
          className="text-label-1-normal-regular text-text-primary rounded-md px-x3 py-x2"
        >
          {label}
        </li>
      ))}
    </ul>
  )
}

export const Default: Story = {
  args: { size: 'medium', axis: 'vertical', maxHeight: 240 },
  render: (args) => (
    <div className="font-sans w-64 rounded-lg border border-line-tertiary bg-bg-secondary py-x2">
      <ScrollArea {...args}>
        <DemoList />
      </ScrollArea>
    </div>
  ),
}

/** 사이즈 프리셋: medium 13px(썸 7px) · small 9px(썸 3px)*/
export const Sizes: Story = {
  render: () => (
    <div className="font-sans flex items-start gap-8">
      {(Object.keys(SCROLLBAR_SIZE) as Array<keyof typeof SCROLLBAR_SIZE>).map(
        (size) => (
          <div key={size} className="flex flex-col gap-2">
            <div className="w-64 rounded-lg border border-line-tertiary bg-bg-secondary py-x2">
              <ScrollArea size={size} maxHeight={240}>
                <DemoList />
              </ScrollArea>
            </div>
            <span className="text-caption-1-regular text-text-caption">
              {size} · 전체 {SCROLLBAR_SIZE[size]}px · 썸{' '}
              {SCROLLBAR_SIZE[size] - 6}px
            </span>
          </div>
        ),
      )}
    </div>
  ),
}

/** 가로 스크롤 (axis="horizontal") */
export const Horizontal: Story = {
  render: () => (
    <div className="font-sans w-80 rounded-lg border border-line-tertiary bg-bg-secondary p-x2">
      <ScrollArea axis="horizontal" size="medium">
        <div className="flex w-max gap-2 pb-x2">
          {LONG_LIST.slice(0, 12).map((label) => (
            <div
              key={label}
              className="text-label-2-regular text-text-secondary whitespace-nowrap rounded-md border border-line-tertiary bg-bg-primary px-x3 py-x2"
            >
              {label}
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  ),
}

/** 드롭다운 결과 리스트 사용 예 */
export const DropdownUsage: Story = {
  render: () => (
    <div className="font-sans w-72 rounded-lg border border-line-tertiary bg-bg-secondary py-x2 shadow-normal-medium">
      <ScrollArea size="small" maxHeight={192}>
        <ul>
          {LONG_LIST.slice(0, 15).map((label, i) => (
            <li
              key={label}
              className={`text-label-1-normal-regular cursor-pointer px-x4 py-x2 ${
                i === 1
                  ? 'bg-bg-primary text-text-primary'
                  : 'text-text-secondary'
              }`}
            >
              {label}
            </li>
          ))}
        </ul>
      </ScrollArea>
    </div>
  ),
}
