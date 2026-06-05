import type { ButtonHTMLAttributes } from 'react'

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  /** Visual variant; uses Tailwind classes — keep `apps/web` tailwind `content` including this package. */
  variant?: 'primary' | 'secondary' | 'ghost' | 'discovery'
}

const variantClass: Record<NonNullable<ButtonProps['variant']>, string> = {
  primary:
    'rounded-md bg-kifolio-cta text-white hover:bg-kifolio-primary-hover shadow-sm disabled:opacity-50',
  secondary:
    'rounded-md border border-shared-gray-300 bg-shared-white text-shared-black hover:bg-shared-gray-50',
  ghost:
    'rounded-md bg-transparent text-kifolio-text hover:bg-kifolio-primary-light',
  discovery:
    'rounded-pill bg-discovery-primary px-8 py-4 text-lg font-semibold text-white shadow-lg transition-colors hover:bg-discovery-primary-light hover:shadow-xl focus-visible:ring-discovery-primary-light disabled:cursor-not-allowed disabled:opacity-50',
}

export function Button({
  variant = 'primary',
  className = '',
  type = 'button',
  ...props
}: ButtonProps) {
  const base =
    'inline-flex items-center justify-center px-4 py-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-kifolio-cta focus-visible:ring-offset-2 disabled:pointer-events-none'
  return (
    <button
      type={type}
      className={`${base} ${variantClass[variant]} ${className}`.trim()}
      {...props}
    />
  )
}
