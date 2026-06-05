import { forwardRef, type InputHTMLAttributes } from 'react'

export type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  /** Applies error border / ring (matches `apps/web` `.input--error`). */
  error?: boolean
}

const baseClass =
  'w-full min-h-[2.75rem] border border-gray-300 bg-white px-4 py-3 text-base leading-normal text-discovery-black transition-all duration-200 placeholder:text-gray-400 focus:border-discovery-primary focus:outline-none focus:ring-2 focus:ring-discovery-primary-light disabled:cursor-not-allowed disabled:bg-gray-50 disabled:text-gray-500 read-only:cursor-default read-only:bg-gray-50 rounded-lg'

const errorClass =
  'border-danger ring-2 ring-danger-light focus:border-danger focus:ring-danger-light'

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { error, className = '', ...props },
  ref
) {
  return (
    <input
      ref={ref}
      className={`${baseClass} ${error ? errorClass : ''} ${className}`.trim()}
      {...props}
    />
  )
})

Input.displayName = 'Input'
