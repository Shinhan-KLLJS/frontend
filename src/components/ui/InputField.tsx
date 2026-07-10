import { useId } from 'react'
import type { ComponentPropsWithRef, ReactNode } from 'react'

export interface InputFieldProps extends ComponentPropsWithRef<'input'> {
  label?: string
  required?: boolean
  helperText?: string
  error?: boolean
  errorMessage?: string
  leadingIcon?: ReactNode
  trailingIcon?: ReactNode
  className?: string
}

/**
 * 인풋 필드 : Status(Default/Typing/Typed/Disabled/Error), react-hook-form 호환
 */
export default function InputField({
  label,
  required,
  helperText,
  error,
  errorMessage,
  leadingIcon,
  trailingIcon,
  className,
  id,
  disabled,
  'aria-describedby': ariaDescribedby,
  ...inputProps
}: InputFieldProps) {
  const autoId = useId()
  const inputId = id ?? autoId
  const captionId = `${inputId}-caption`

  const isError = Boolean(error || errorMessage)
  const caption = isError && errorMessage ? errorMessage : helperText
  const hasCaption = Boolean(caption)
  const describedBy =
    [hasCaption ? captionId : null, ariaDescribedby]
      .filter(Boolean)
      .join(' ') || undefined

  // 필드 박스: 상태별 보더/배경
  const boxClass = [
    'flex w-full items-center gap-x3 rounded-x2 border px-x4 py-x3 transition-colors',
    disabled
      ? 'border-line-secondary bg-bg-disabled text-text-disabled-secondary'
      : isError
        ? 'border-line-negative bg-bg-secondary text-text-tertiary'
        : 'border-line-secondary bg-bg-secondary text-text-tertiary focus-within:border-line-brand',
  ].join(' ')

  return (
    <div
      className={['flex w-full flex-col gap-x2', className]
        .filter(Boolean)
        .join(' ')}
    >
      {label && (
        <label
          htmlFor={inputId}
          className="flex items-center gap-xs text-label-1-normal-bold text-text-secondary"
        >
          {label}
          {required && (
            <span aria-hidden="true" className="text-text-negative">
              *
            </span>
          )}
        </label>
      )}

      <div className={boxClass}>
        {leadingIcon && (
          <span className="flex shrink-0 items-center">{leadingIcon}</span>
        )}
        <input
          id={inputId}
          disabled={disabled}
          required={required}
          aria-invalid={isError || undefined}
          aria-describedby={describedBy}
          className="min-w-0 flex-1 bg-transparent text-body-1-normal-regular text-text-primary outline-none placeholder:text-text-placeholder disabled:cursor-not-allowed disabled:text-text-disabled-secondary disabled:placeholder:text-text-disabled-secondary"
          {...inputProps}
        />
        {trailingIcon && (
          <span className="flex shrink-0 items-center">{trailingIcon}</span>
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
