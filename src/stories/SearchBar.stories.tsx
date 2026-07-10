import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import SearchBar from '@/components/ui/SearchBar'
import type { SearchBarProps } from '@/components/ui/SearchBar'

// 서치바 (Search Bar Status=Default/Press/Status3 + Drop Down 결과 패널)
const meta: Meta<typeof SearchBar> = {
  title: 'Components/SearchBar',
  component: SearchBar,
  parameters: { layout: 'padded' },
  decorators: [
    (Story) => (
      <div className="font-sans w-[400px] pb-x10">
        <Story />
      </div>
    ),
  ],
  argTypes: {
    value: { control: false },
    onChange: { control: false },
    results: { control: false },
    onSelect: { control: false },
    listMaxHeight: { control: false },
  },
}
export default meta

type Story = StoryObj<typeof SearchBar>

// Figma 예시 광고 영상 제목
const VIDEO_TITLES = [
  '나이키 썸머 히스토리',
  '삼성전자 2026 하반기 채용 공고 홍보 영상',
  '테슬라, X-Space 주식 상장 기념 홍보 영상 2026년 하반기',
  '나이키 썸머 히스토리 시즌 2',
  '삼성전자 갤럭시 신제품 런칭 티저',
  '테슬라, X-Space 주식 상장 기념 홍보 영상 2026년 상반기',
]

function ControlledSearchBar(props: Partial<SearchBarProps>) {
  const [value, setValue] = useState('')
  const results = VIDEO_TITLES.filter((title) =>
    title.toLowerCase().includes(value.trim().toLowerCase()),
  )

  return (
    <SearchBar
      value={value}
      onChange={setValue}
      results={value.trim() ? results : []}
      onSelect={(result) => setValue(result.label)}
      {...props}
    />
  )
}

/** 제어형 기본 — 입력하면 광고 영상 제목이 필터링되어 드롭다운으로 표시 */
export const Default: Story = {
  args: { placeholder: '검색어를 입력하세요' },
  render: (args) => <ControlledSearchBar {...args} />,
}

/** Status : Default(placeholder) · Press(포커스 — 캐럿 표시) · Status3(입력됨) */
export const States: Story = {
  render: () => (
    <div className="flex flex-col gap-x6">
      <div className="flex flex-col gap-x2">
        <p className="text-label-1-normal-bold text-text-secondary">Default</p>
        <SearchBar
          value=""
          onChange={() => {}}
          placeholder="나이키 썸머 히스토리"
        />
      </div>
      <div className="flex flex-col gap-x2">
        <p className="text-label-1-normal-bold text-text-secondary">
          Press (포커스 — 클릭하면 캐럿이 표시됩니다)
        </p>
        <SearchBar value="나이키 썸머 히스토리" onChange={() => {}} autoFocus />
      </div>
      <div className="flex flex-col gap-x2">
        <p className="text-label-1-normal-bold text-text-secondary">
          Status3 (입력됨)
        </p>
        <SearchBar value="나이키 썸머 히스토리" onChange={() => {}} />
      </div>
    </div>
  ),
}

/** 결과 패널 열림 (Drop Down 기본) — 첫 항목 하이라이트, ↑↓/Enter/Escape 탐색 */
export const ResultsOpen: Story = {
  render: () => (
    <ControlledSearchBarWithInitial
      initial="2026"
      placeholder="검색어를 입력하세요"
    />
  ),
}

/** 결과 패널 스크롤 (Drop Down 베리언트2 대응) — 3행 초과 시 ScrollArea(small) */
export const ResultsScroll: Story = {
  render: () => (
    <SearchBar
      value=""
      onChange={() => {}}
      results={VIDEO_TITLES}
      defaultOpen
      placeholder="검색어를 입력하세요"
    />
  ),
}

function ControlledSearchBarWithInitial({
  initial,
  ...props
}: Partial<SearchBarProps> & { initial: string }) {
  const [value, setValue] = useState(initial)
  const results = VIDEO_TITLES.filter((title) =>
    title.toLowerCase().includes(value.trim().toLowerCase()),
  )

  return (
    <SearchBar
      value={value}
      onChange={setValue}
      results={value.trim() ? results : []}
      onSelect={(result) => setValue(result.label)}
      defaultOpen
      {...props}
    />
  )
}
