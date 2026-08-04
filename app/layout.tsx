import type { Metadata } from 'next'
import './globals.css'
import { Providers } from './providers'
import { BRAND } from '@/constants'

export const metadata: Metadata = {
  title: {
    template: `%s | ${BRAND.name}`,
    default: `${BRAND.name} — ${BRAND.tagline}`,
  },
  description: BRAND.description,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-screen bg-charcoal text-off-white antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
