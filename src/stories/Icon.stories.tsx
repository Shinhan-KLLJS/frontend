import type { Meta, StoryObj } from '@storybook/react-vite'
import {
  Building2,
  House,
  Ad,
  Calendar,
  PanelLeft,
  PanelLeftClose,
  PanelLeftOpen,
  Settings,
  MessageCircleQuestionMark,
  Plus,
  Play,
  PlayOff,
  ArrowDownRight,
  ArrowUpRight,
  Ellipsis,
  Search,
  SquarePen,
  Users,
  Mail,
  ChartNoAxesColumnIncreasing,
  ClockCheck,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  ChevronDown,
  CircleCheck,
  CircleX,
  Check,
  X,
  LogOut,
  Upload,
  Bell,
  Square,
  SquareCheck,
} from 'lucide-react'
import { Icon, ICON_SIZE, ICON_COLOR, type IconColor } from '@/components/ui'
import looviLogo from '@/assets/logos/loovi.svg'
import kakaoLogo from '@/assets/social/kakao.svg'
import googleLogo from '@/assets/social/google.svg'
import naverLogo from '@/assets/social/naver.svg'

// lucide 아이콘 래퍼
const meta: Meta<typeof Icon> = {
  title: 'Components/Icon',
  component: Icon,
  parameters: { layout: 'padded' },
  argTypes: {
    size: {
      control: 'select',
      options: Object.keys(ICON_SIZE),
    },
    color: {
      control: 'select',
      options: Object.keys(ICON_COLOR),
    },
  },
}
export default meta

type Story = StoryObj<typeof Icon>

export const Default: Story = {
  args: { icon: House, size: 'medium' },
}

const SERVICE_ICONS = [
  { icon: Building2, name: 'Building2' },
  { icon: House, name: 'House' },
  { icon: Ad, name: 'Ad' },
  { icon: Calendar, name: 'Calendar' },
  { icon: PanelLeft, name: 'PanelLeft' },
  { icon: PanelLeftClose, name: 'PanelLeftClose' },
  { icon: PanelLeftOpen, name: 'PanelLeftOpen' },
  { icon: Settings, name: 'Settings' },
  { icon: MessageCircleQuestionMark, name: 'MessageCircleQuestionMark' },
  { icon: Plus, name: 'Plus' },
  { icon: Play, name: 'Play' },
  { icon: PlayOff, name: 'PlayOff' },
  { icon: X, name: 'X' },
  { icon: ArrowDownRight, name: 'ArrowDownRight' },
  { icon: ArrowUpRight, name: 'ArrowUpRight' },
  { icon: Users, name: 'Users' },
  { icon: Mail, name: 'Mail' },
  { icon: LogOut, name: 'LogOut' },
  { icon: ChartNoAxesColumnIncreasing, name: 'ChartNoAxesColumnIncreasing' },
  { icon: ClockCheck, name: 'ClockCheck' },
  { icon: ChevronLeft, name: 'ChevronLeft' },
  { icon: ChevronRight, name: 'ChevronRight' },
  { icon: ChevronUp, name: 'ChevronUp' },
  { icon: ChevronDown, name: 'ChevronDown' },
  { icon: SquarePen, name: 'SquarePen' },
  { icon: CircleX, name: 'CircleX' },
  { icon: Upload, name: 'Upload' },
  { icon: CircleCheck, name: 'CircleCheck' },
  { icon: Check, name: 'Check' },
  { icon: Ellipsis, name: 'Ellipsis' },
  { icon: Search, name: 'Search' },
  { icon: Bell, name: 'Bell' },
  { icon: Square, name: 'Square' },
  { icon: SquareCheck, name: 'SquareCheck' },
]

export const Gallery: Story = {
  render: () => (
    <div className="font-sans grid grid-cols-5 gap-4">
      {SERVICE_ICONS.map(({ icon, name }) => (
        <div
          key={name}
          className="flex flex-col items-center gap-2 rounded-lg border border-line-tertiary bg-bg-secondary p-4"
        >
          <Icon icon={icon} size="large" />
          <span className="text-caption-1-regular text-text-caption">
            {name}
          </span>
        </div>
      ))}
    </div>
  ),
}

/** 사이즈 프리셋: small 16 · medium 20 · large 24 */
export const Sizes: Story = {
  render: () => (
    <div className="font-sans flex items-end gap-8">
      {(Object.keys(ICON_SIZE) as Array<keyof typeof ICON_SIZE>).map((size) => (
        <div
          key={size}
          className="flex flex-col items-center gap-2 rounded-lg border border-line-tertiary bg-bg-secondary p-4"
        >
          <Icon icon={House} size={size} />
          <span className="text-caption-1-regular text-text-caption">
            {size} · {ICON_SIZE[size]}px
          </span>
        </div>
      ))}
    </div>
  ),
}

/** 컬러 로고 에셋 (src/assets) */
export const Logos: Story = {
  render: () => (
    <div className="font-sans flex items-center gap-6">
      <div className="flex flex-col items-center gap-2">
        <div className="flex size-12 items-center justify-center rounded-lg border border-line-tertiary bg-bg-secondary">
          <img src={looviLogo} alt="" className="size-6" />
        </div>
        <span className="text-caption-1-regular text-text-caption">Loovi</span>
      </div>
      <div className="flex flex-col items-center gap-2">
        <div className="flex size-12 items-center justify-center rounded-lg bg-[#FEE500]">
          <img src={kakaoLogo} alt="" className="size-6" />
        </div>
        <span className="text-caption-1-regular text-text-caption">Kakao</span>
      </div>
      <div className="flex flex-col items-center gap-2">
        <div className="flex size-12 items-center justify-center rounded-lg border border-line-tertiary bg-bg-secondary">
          <img src={googleLogo} alt="" className="size-6" />
        </div>
        <span className="text-caption-1-regular text-text-caption">Google</span>
      </div>
      <div className="flex flex-col items-center gap-2">
        <div className="flex size-12 items-center justify-center rounded-lg bg-[#03C75A]">
          <img src={naverLogo} alt="" className="size-6" />
        </div>
        <span className="text-caption-1-regular text-text-caption">Naver</span>
      </div>
    </div>
  ),
}

/** color prop으로 시맨틱 토큰 색 직접 지정. 지정하지 않으면 부모 색(currentColor) 상속 */
export const Colors: Story = {
  render: () => (
    <div className="font-sans grid grid-cols-8 gap-4">
      {(Object.keys(ICON_COLOR) as IconColor[]).map((color) => (
        <div
          key={color}
          className={`flex flex-col items-center gap-2 rounded-lg border border-line-tertiary p-3 ${
            color.includes('inverse')
              ? 'bg-[var(--cool-neutral-900)]'
              : 'bg-bg-secondary'
          }`}
        >
          <Icon icon={Bell} size="large" color={color} />
          <span
            className={`text-caption-2-regular ${
              color.includes('inverse')
                ? 'text-text-secondary-inverse'
                : 'text-text-caption'
            }`}
          >
            {color}
          </span>
        </div>
      ))}
    </div>
  ),
}
