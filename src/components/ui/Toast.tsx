import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import type { HTMLAttributes, ReactNode } from 'react'
import type { LucideIcon } from 'lucide-react'
import { CircleCheck, CircleX } from 'lucide-react'
import Icon from './Icon'

export type ToastStatus = 'success' | 'error'

// 상태별 filled 아이콘
const STATUS_PRESET: Record<ToastStatus, { icon: LucideIcon; fill: string }> = {
  success: { icon: CircleCheck, fill: 'var(--color-line-positive)' },
  error: { icon: CircleX, fill: 'var(--color-line-negative)' },
}

export interface ToastProps extends HTMLAttributes<HTMLDivElement> {
  message: ReactNode
  status?: ToastStatus
  leadingIcon?: boolean
}

/* ── Toast — 고정폭 420, 기본 높이 52(텍스트 늘어나면 유동), CoolNeutral800 배경 ── */
export default function Toast({
  message,
  status = 'success',
  leadingIcon = true,
  className,
  ...props
}: ToastProps) {
  const preset = STATUS_PRESET[status]
  return (
    <div
      className={[
        'font-sans box-border flex min-h-[52px] w-[420px] max-w-[calc(100vw-32px)] shrink-0 items-center gap-x2 rounded-x3 bg-[var(--cool-neutral-800)] px-x4 py-x3',
        'text-body-2-normal-bold text-text-primary-inverse',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      {...props}
    >
      {leadingIcon && (
        <Icon
          icon={preset.icon}
          size={24}
          fill={preset.fill}
          color="var(--cool-neutral-800)"
          className="shrink-0"
        />
      )}
      <span className="break-words px-[2px] opacity-[0.88]">{message}</span>
    </div>
  )
}

/* ── ToastProvider + useToast (큐 관리) ── */
const TOAST_DURATION = 3000 // 표시 유지 (ms)
const TOAST_EXIT_MS = 200 // 퇴장 transition (ms)

export interface ToastOptions {
  status?: ToastStatus
  leadingIcon?: boolean
  duration?: number
}

interface ToastItem extends ToastOptions {
  id: number
  message: ReactNode
}

interface ToastContextValue {
  toast: (message: ReactNode, options?: ToastOptions) => void
}

const ToastContext = createContext<ToastContextValue | null>(null)

// eslint-disable-next-line react-refresh/only-export-components -- 훅은 Provider와 한 파일에 유지
export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext)
  if (!ctx) {
    throw new Error('useToast는 ToastProvider 내부에서만 사용할 수 있습니다.')
  }
  return ctx
}

/* ── 개별 토스트 수명 관리 — 등장(transition) → 유지 → 퇴장(transition) → 제거 ── */
function ToastSlot({
  item,
  onRemove,
}: {
  item: ToastItem
  onRemove: (id: number) => void
}) {
  const [visible, setVisible] = useState(false)
  const duration = item.duration ?? TOAST_DURATION

  useEffect(() => {
    // 첫 페인트 이후에 표시 상태로 전환해야 등장 transition이 동작 (double rAF)
    let raf2 = 0
    const raf1 = requestAnimationFrame(() => {
      raf2 = requestAnimationFrame(() => setVisible(true))
    })
    const hideTimer = window.setTimeout(() => setVisible(false), duration)
    const removeTimer = window.setTimeout(
      () => onRemove(item.id),
      duration + TOAST_EXIT_MS,
    )
    return () => {
      cancelAnimationFrame(raf1)
      cancelAnimationFrame(raf2)
      clearTimeout(hideTimer)
      clearTimeout(removeTimer)
    }
  }, [item.id, duration, onRemove])

  return (
    <div
      className={[
        'transition-all duration-200 ease-out',
        visible ? 'translate-y-0 opacity-100' : '-translate-y-x2 opacity-0',
      ].join(' ')}
    >
      <Toast
        message={item.message}
        status={item.status}
        leadingIcon={item.leadingIcon}
      />
    </div>
  )
}

// 토스트 큐 Provider — 화면 중앙 상단 고정, 여러 개면 세로 스택
export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([])
  const idRef = useRef(0)

  const toast = useCallback((message: ReactNode, options?: ToastOptions) => {
    idRef.current += 1
    setToasts((prev) => [...prev, { id: idRef.current, message, ...options }])
  }, [])

  const remove = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  const value = useMemo(() => ({ toast }), [toast])

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div
        role="status"
        aria-live="polite"
        className="pointer-events-none fixed inset-x-0 top-x6 z-50 flex flex-col items-center gap-x2"
      >
        {toasts.map((item) => (
          <ToastSlot key={item.id} item={item} onRemove={remove} />
        ))}
      </div>
    </ToastContext.Provider>
  )
}
