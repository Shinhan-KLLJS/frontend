import type { Meta, StoryObj } from '@storybook/react-vite'
import TeamMemberRow from '@/components/team/TeamMemberRow'
import type { TeamMember, TeamRole } from '@/lib/team'

// 대상은 Member 1명 고정 — 내 역할(myRole)에 따라 케밥 메뉴의 부여 가능 항목이 어떻게 달라지는지 본다.
const TARGET: TeamMember = {
  userId: 12,
  name: '강다빈',
  email: 'dabin.kang@gmail.com',
  role: 'MEMBER',
  isMe: false,
  joinedAt: '2026-06-03T09:00:00Z',
}

const noop = () => {}

const VIEWPOINTS: { myRole: TeamRole; label: string; hint: string }[] = [
  { myRole: 'OWNER', label: 'Owner 시점', hint: '모든 권한 부여·삭제 가능' },
  { myRole: 'ADMIN', label: 'Admin 시점', hint: "'Owner 권한 부여'만 불가" },
  { myRole: 'MEMBER', label: 'Member 시점', hint: '메뉴 전부 비활성' },
]

const meta: Meta = {
  title: 'Pages/Team/2) 권한별 메뉴',
  parameters: { layout: 'fullscreen' },
}
export default meta
type Story = StoryObj

// 세 시점을 한 화면에 나란히 두고, 각 행의 케밥(⋯)을 열어 메뉴 항목 차이를 비교한다.
export const ByViewpoint: Story = {
  name: '내 역할별 (Owner · Admin · Member)',
  render: () => (
    <div className="flex flex-col gap-x5 bg-bg-secondary p-x5">
      {VIEWPOINTS.map(({ myRole, label, hint }) => (
        <div key={myRole} className="flex w-[600px] flex-col gap-x2">
          <div className="flex flex-col gap-x1">
            <span className="text-body-1-normal-bold text-text-primary">
              {label}
            </span>
            <span className="text-label-2-regular text-text-caption">
              {hint}
            </span>
          </div>
          <div className="w-full rounded-x3 border border-line-secondary">
            <TeamMemberRow
              member={TARGET}
              isMe={false}
              myRole={myRole}
              onSelectRole={noop}
              onRemove={noop}
            />
          </div>
        </div>
      ))}
    </div>
  ),
}
