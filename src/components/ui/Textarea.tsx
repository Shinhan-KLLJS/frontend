import { useId, useState } from 'react'
import type { ChangeEvent, ComponentPropsWithRef } from 'react'

export interface TextareaProps extends ComponentPropsWithRef<'textarea'> {
  label?: string
  required?: boolean
  /** 라벨 옆 '(선택)' 표기 — required의 * 표기와 배타적으로 사용 */
  optional?: boolean
  helperText?: string
  error?: boolean
  errorMessage?: string
  /** 지정 시 우측 하단이 아닌 박스 하단에 'n/max' 글자 수 카운터 표시 */
  maxLength?: number
  className?: string
}

/**
 * 텍스트에어리어 — 라벨/에러/글자 수 카운터, react-hook-form 호환 (InputField 미러링)
 */
export default function Textarea({
  label,
  required,
  optional,
  helperText,
  error,
  errorMessage,
  maxLength,
  className,
  id,
  disabled,
  value,
  defaultValue,
  onChange,
  'aria-describedby': ariaDescribedby,
  ...textareaProps
}: TextareaProps) {
  const autoId = useId()
  const textareaId = id ?? autoId
  const captionId = `${textareaId}-caption`

  // register(비제어) 사용 시에도 카운터가 동작하도록 내부 길이 추적 — 제어(value)면 그 값 우선
  const [innerLength, setInnerLength] = useState(
    () => String(defaultValue ?? '').length,
  )
  const count = value !== undefined ? String(value).length : innerLength

  const handleChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    setInnerLength(e.target.value.length)
    onChange?.(e)
  }

  const isError = Boolean(error || errorMessage)
  const caption = isError && errorMessage ? errorMessage : helperText
  const hasCaption = Boolean(caption)
  const describedBy =
    [hasCaption ? captionId : null, ariaDescribedby]
      .filter(Boolean)
      .join(' ') || undefined

  const boxClass = [
    'flex w-full flex-1 flex-col gap-x3 rounded-x3 border p-x3 transition-colors',
    disabled
      ? 'border-line-secondary bg-bg-disabled text-text-disabled-secondary'
      : isError
        ? 'border-line-negative bg-bg-secondary'
        : 'border-line-secondary bg-bg-secondary focus-within:border-line-brand',
  ].join(' ')

  return (
    <div
      className={['flex w-full flex-col gap-x2', className]
        .filter(Boolean)
        .join(' ')}
    >
      {label && (
        <label
          htmlFor={textareaId}
          className="flex items-center gap-xs text-label-1-normal-bold text-text-secondary"
        >
          {label}
          {required && (
            <span aria-hidden="true" className="text-text-negative">
              *
            </span>
          )}
          {!required && optional && (
            <span className="text-caption-1-bold text-text-secondary">
              (선택)
            </span>
          )}
        </label>
      )}

      <div className={boxClass}>
        <textarea
          id={textareaId}
          disabled={disabled}
          required={required}
          maxLength={maxLength}
          aria-invalid={isError || undefined}
          aria-describedby={describedBy}
          value={value}
          defaultValue={defaultValue}
          onChange={handleChange}
          className="min-h-[60px] rounded-x3 w-full flex-1 resize-none bg-transparent px-x1 text-body-1-normal-regular text-text-primary outline-none placeholder:text-text-placeholder disabled:cursor-not-allowed disabled:text-text-disabled-secondary disabled:placeholder:text-text-disabled-secondary"
          {...textareaProps}
        />
        {maxLength !== undefined && (
          <p className="px-x1 text-label-2-medium text-text-placeholder">
            {count}/{maxLength}
          </p>
        )}
      </div>

      {hasCaption && (
        <p
          id={captionId}
          className={`text-caption-1-regular ${isError ? 'text-text-negative' : 'text-text-caption'}`}
        >
          {caption}
        </p>
      )}
    </div>
  )
}
