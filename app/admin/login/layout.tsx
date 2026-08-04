import Link from 'next/link'
import { ROUTES } from '@/constants'
import { Logo } from '@/components/brand'

export default function AdminLoginLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-charcoal px-4 py-10">
      <Link href={ROUTES.adminLogin} className="mb-8 transition-opacity hover:opacity-90">
        <Logo size="lg" />
      </Link>
      <main className="w-full">{children}</main>
    </div>
  )
}
