import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

// Helper padrão do shadcn/ui — usado pelos componentes de components/ui/ nas próximas fases.
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
