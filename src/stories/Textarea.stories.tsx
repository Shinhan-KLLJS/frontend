import type { Meta, StoryObj } from '@storybook/react-vite'
import Textarea from '@/components/ui/Textarea'

// 텍스트에어리어 (라벨/에러/글자 수 카운터, InputField 미러링)
const meta: Meta<typeof Textarea> = {
  title: 'Components/Textarea',
  component: Textarea,
  parameters: { layout: 'padded' },
  decorators: [
    (Story) => (
      <div className="font-sans w-[400px]">
        <Story />
      </div>
    ),
  ],
}
export default meta

type Story = StoryObj<typeof Textarea>

export const Default: Story = {
  args: {
    label: '메모',
    optional: true,
    placeholder: '최대 500글자 입력 가능',
    maxLength: 500,
  },
}

/** Status : Default · Typed(카운터 반영) · Disabled · Error */
export const States: Story = {
  render: () => (
    <div className="flex flex-col gap-x6">
      <Textarea
        label="Default"
        optional
        placeholder="최대 500글자 입력 가능"
        maxLength={500}
      />
      <Textarea
        label="Typed"
        defaultValue="브랜드 인지도 확대를 주요 목표로 설정"
        maxLength={500}
      />
      <Textarea label="Disabled" placeholder="Input" maxLength={500} disabled />
      <Textarea
        label="Error"
        defaultValue="Input"
        maxLength={500}
        errorMessage="Caption"
      />
    </div>
  ),
}

/** 카운터 없이(라벨 + 필수 표기) */
export const WithoutCounter: Story = {
  render: () => (
    <div className="flex flex-col gap-x6">
      <Textarea label="필수 입력" required placeholder="Input" />
      <Textarea placeholder="라벨 없음" helperText="Caption" />
    </div>
  ),
}
