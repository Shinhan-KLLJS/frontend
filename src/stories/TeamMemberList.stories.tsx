import type { Meta, StoryObj } from '@storybook/react-vite'
import TeamMemberList from '@/components/team/TeamMemberList'
import type { TeamMember, TeamRole } from '@/lib/team'

// userId 0 = 로그인한 나(isMe). Owner는 이정헌, 나는 Admin.
const BASE_MEMBERS: TeamMember[] = [
  {
    userId: 0,
    name: '손원진',
    email: 'sonwonjin@naver.com',
    role: 'ADMIN',
    isMe: true,
    joinedAt: '2026-06-01T09:00:00Z',
  },
  {
    userId: 11,
    name: '이정헌',
    email: 'jeongheon.lee@naver.com',
    role: 'OWNER',
    isMe: false,
    joinedAt: '2026-05-20T09:00:00Z',
  },
  {
    userId: 12,
    name: '강다빈',
    email: 'dabin.kang@gmail.com',
    role: 'ADMIN',
    isMe: false,
    joinedAt: '2026-06-03T09:00:00Z',
  },
  {
    userId: 13,
    name: '이정윤',
    email: 'jeongyoon@nate.com',
    role: 'MEMBER',
    isMe: false,
    joinedAt: '2026-06-05T09:00:00Z',
  },
  {
    userId: 14,
    name: '장세은',
    // 긴 이메일 — 행 말줄임(truncate) 확인용
    email: 'very-long-email-address-for-truncation@really-long-domain.example.com',
    role: 'MEMBER',
    isMe: false,
    joinedAt: '2026-06-08T09:00:00Z',
  },
]

const NAMES = ['이재욱', '김무열', '박서준', '최유나', '정민호', '한지우']

const makeMembers = (n: number): TeamMember[] =>
  Array.from({ length: n }, (_, i) => {
    if (i < BASE_MEMBERS.length) return BASE_MEMBERS[i]
    return {
      userId: 100 + i,
      name: NAMES[i % NAMES.length],
      email: `member${i + 1}@example.com`,
      role: 'MEMBER' as TeamRole,
      isMe: false,
      joinedAt: '2026-06-10T09:00:00Z',
    }
  })

const noop = () => {}

// 빈 목록은 세로로 꽉 채우고, 많으면 늘어나며 스크롤되는 동작을 보이도록 고정 높이 컨테이너에 담는다.
function Frame({
  members,
  width,
  height = 560,
}: {
  members: TeamMember[]
  width: number
  height?: number
}) {
  return (
    <div
      className="mx-auto flex flex-col overflow-y-auto bg-bg-secondary p-x5"
      style={{ width, height }}
    >
      <TeamMemberList
        members={members}
        myRole="ADMIN"
        onSelectRole={noop}
        onRemoveMember={noop}
      />
    </div>
  )
}

const meta: Meta = {
  title: 'Pages/Team/1) 팀원 리스트',
  parameters: { layout: 'fullscreen' },
}
export default meta
type Story = StoryObj

export const Few: Story = {
  name: '적은 목록',
  render: () => <Frame members={makeMembers(3)} width={1040} />,
}

export const Many: Story = {
  name: '많은 목록',
  render: () => <Frame members={makeMembers(20)} width={1040} />,
}

export const W1280: Story = {
  name: '1280px',
  render: () => <Frame members={makeMembers(6)} width={1280} />,
}

export const W1440: Story = {
  name: '1440px',
  render: () => <Frame members={makeMembers(6)} width={1440} />,
}
