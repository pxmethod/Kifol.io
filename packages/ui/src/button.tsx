import type { ButtonHTMLAttributes } from 'react'

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  /** Visual variant; uses Tailwind classes — keep `apps/web` tailwind `content` including this package. */
  variant?: 'primary' | 'secondary' | 'ghost' | 'discovery'
}

const variantClass: Record<NonNullable<ButtonProps['variant']>, string> = {
  primary:
    'bg-discovery-orange text-white hover:bg-discovery-orange-light shadow-sm disabled:opacity-50',
  secondary:
    'border border-shared-gray-300 bg-shared-white text-shared-black hover:bg-shared-gray-50',
  ghost:
    'bg-transparent text-kifolio-text hover:bg-kifolio-primary-light',
  discovery:
    'bg-discovery-orange px-8 py-4 text-lg font-semibold text-white shadow-lg transition-colors hover:bg-discovery-orange-light hover:shadow-xl focus-visible:ring-discovery-orange-light disabled:cursor-not-allowed disabled:opacity-50',
}

export function Button({
  variant = 'primary',
  className = '',
  type = 'button',
  ...props
}: ButtonProps) {
  const base =
    'inline-flex items-center justify-center rounded-pill px-4 py-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-discovery-orange-light focus-visible:ring-offset-2 disabled:pointer-events-none'
  return (
    <button
      type={type}
      className={`${base} ${variantClass[variant]} ${className}`.trim()}
      {...props}
    />
  )
}
