import type { Metadata } from 'next'
import './globals.css'
import './product.css'
import './premium.css'

export const metadata: Metadata = {
  title: { default: 'Dash e Pipe', template: '%s · Dash e Pipe' },
  description: 'Transforme seu WhatsApp em uma operação organizada, com Pipeline e Dashboard.',
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="pt-BR"><body>{children}</body></html>
}
