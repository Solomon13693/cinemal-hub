import { Suspense } from 'react'
import AdminLoginView from '@/views/auth/admin-login'

export default function AdminLoginPage() {
  return (
    <Suspense fallback={<p className="text-center text-sm text-text-grey">Loading…</p>}>
      <AdminLoginView />
    </Suspense>
  )
}
