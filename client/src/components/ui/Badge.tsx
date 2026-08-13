import type { HTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  tone?: 'neutral' | 'positive' | 'warning' | 'danger' | 'accent'
}

const TONE_CLASSES: Record<NonNullable<BadgeProps['tone']>, string> = {
  neutral: 'bg-[var(--color-surface-raised)] text-[var(--color-text-muted)]',
  positive: 'bg-[color-mix(in_srgb,var(--color-positive)_18%,transparent)] text-[var(--color-positive)]',
  warning: 'bg-[color-mix(in_srgb,var(--color-warning)_18%,transparent)] text-[var(--color-warning)]',
  danger: 'bg-[color-mix(in_srgb,var(--color-danger)_18%,transparent)] text-[var(--color-danger)]',
  accent: 'bg-[var(--color-accent-muted)] text-[var(--color-accent)]',
}

export function Badge({ className, tone = 'neutral', ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium font-mono-nums',
        TONE_CLASSES[tone],
        className,
      )}
      {...props}
    />
  )
}
