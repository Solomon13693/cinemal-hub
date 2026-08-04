import type { Metadata } from 'next'
import { BRAND } from '@/constants'

export const metadata: Metadata = {
  title: {
    default: 'Admin',
    template: `%s | ${BRAND.shortName} Admin`,
  },
  robots: { index: false, follow: false },
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return children
}
