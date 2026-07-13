import type { Meta, StoryObj } from '@storybook/react-vite'
import { Calendar as CalendarIcon, Mail, Search, X } from 'lucide-react'
import InputField from '@/components/ui/InputField'
import { Icon } from '@/components/ui'

// 인풋 필드 (Status=Default/Typing/Typed/Disabled/Error)
const meta: Meta<typeof InputField> = {
  title: 'Components/InputField',
  component: InputField,
  parameters: { layout: 'padded' },
  decorators: [
    (Story) => (
      <div className="font-sans w-[400px]">
        <Story />
      </div>
    ),
  ],
  argTypes: {
    leadingIcon: { control: false },
    trailingIcon: { control: false },
    variant: { control: 'select', options: ['default', 'date'] },
  },
}
export default meta

type Story = StoryObj<typeof InputField>

export const Default: Story = {
  args: {
    label: 'Title',
    placeholder: 'Input',
    helperText: 'Caption',
  },
}

/** variant=date - 달력용 인풋 */
export const DateVariant: Story = {
  render: () => (
    <div className="flex w-[200px] flex-col gap-x6">
      <InputField
        variant="date"
        label="시작일"
        required
        placeholder="YYYY.MM.DD"
        leadingIcon={<Icon icon={CalendarIcon} size="medium" />}
      />
      <InputField
        variant="date"
        label="시작일"
        required
        defaultValue="2026.07.05"
        leadingIcon={<Icon icon={CalendarIcon} size="medium" />}
      />
    </div>
  ),
}

/** Status : Default · Typing(포커스) · Typed · Disabled · Error */
export const States: Story = {
  render: () => (
    <div className="flex flex-col gap-x6">
      <InputField label="Default" placeholder="Input" helperText="Caption" />
      <InputField
        label="Typing (포커스)"
        placeholder="Input"
        helperText="필드를 클릭하면 보더가 Line/Brand로 변경됩니다"
      />
      <InputField label="Typed" defaultValue="Input" helperText="Caption" />
      <InputField
        label="Disabled"
        placeholder="Input"
        helperText="Caption"
        disabled
      />
      <InputField label="Error" defaultValue="Input" errorMessage="Caption" />
    </div>
  ),
}

/** 라벨(Title) · 헬퍼 텍스트(Caption) 유무 조합 */
export const LabelAndHelper: Story = {
  render: () => (
    <div className="flex flex-col gap-x6">
      <InputField
        label="라벨 + 헬퍼"
        placeholder="Input"
        helperText="Caption"
      />
      <InputField label="라벨만" placeholder="Input" />
      <InputField placeholder="헬퍼만" helperText="Caption" />
      <InputField placeholder="라벨·헬퍼 없음" />
    </div>
  ),
}

/** 필수 표시(*) */
export const Required: Story = {
  args: {
    label: 'Title',
    required: true,
    placeholder: 'Input',
    helperText: 'Caption',
  },
}

/** 선행/후행 아이콘 슬롯 */
export const WithIcons: Story = {
  render: () => (
    <div className="flex flex-col gap-x6">
      <InputField
        label="검색"
        placeholder="검색어를 입력하세요"
        leadingIcon={<Icon icon={Search} size="large" />}
      />
      <InputField
        label="이메일"
        placeholder="email@example.com"
        type="email"
        leadingIcon={<Icon icon={Mail} size="large" />}
        trailingIcon={<Icon icon={X} size="large" />}
      />
      <InputField
        label="비활성"
        placeholder="Input"
        disabled
        leadingIcon={<Icon icon={Search} size="large" />}
        trailingIcon={<Icon icon={X} size="large" />}
      />
    </div>
  ),
}

/** 에러 상태 */
export const ErrorStates: Story = {
  render: () => (
    <div className="flex flex-col gap-x6">
      <InputField
        label="이메일"
        defaultValue="invalid-email"
        errorMessage="올바른 이메일 형식이 아닙니다"
      />
      <InputField
        label="메시지 없는 에러"
        defaultValue="Input"
        error
        helperText="error prop만으로 스타일 적용"
      />
    </div>
  ),
}

export const DisabledStates: Story = {
  render: () => (
    <div className="flex flex-col gap-x6">
      <InputField
        label="비어 있음"
        placeholder="Input"
        helperText="Caption"
        disabled
      />
      <InputField
        label="값 있음"
        defaultValue="Input"
        helperText="Caption"
        disabled
      />
    </div>
  ),
}
