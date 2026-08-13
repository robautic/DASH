import type { ButtonHTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'ghost' | 'danger'
}

export function Button({ className, variant = 'primary', ...props }: ButtonProps) {
  return (
    <button
      className={cn(
        'inline-flex items-center justify-center rounded-md px-3.5 py-2 text-sm font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-50',
        variant === 'primary' && 'bg-[var(--color-accent)] text-white hover:brightness-110',
        variant === 'ghost' &&
          'border border-[var(--color-border)] bg-transparent text-[var(--color-text)] hover:bg-[var(--color-surface-raised)]',
        variant === 'danger' && 'bg-[var(--color-danger)] text-white hover:brightness-110',
        className,
      )}
      {...props}
    />
  )
}
