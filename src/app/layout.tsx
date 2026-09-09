import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Dash e Pipe',
  description: 'WhatsApp organizado em conversas, pipeline e dashboard.',
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  )
}
