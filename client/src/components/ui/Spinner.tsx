import { cn } from '@/lib/utils'

export function Spinner({ className }: { className?: string }) {
  return (
    <span
      role="status"
      aria-label="Carregando"
      className={cn(
        'inline-block h-4 w-4 animate-spin rounded-full border-2 border-[var(--color-border)] border-t-[var(--color-accent)]',
        className,
      )}
    />
  )
}
