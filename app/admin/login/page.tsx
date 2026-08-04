import { Suspense } from 'react'
import AdminLoginView from '@/views/auth/admin-login'
import { AuthFormSkeleton } from '@/components/ui'

export default function AdminLoginPage() {
  return (
    <Suspense
      fallback={
        <div className="container flex min-h-[60vh] items-center justify-center page-section">
          <AuthFormSkeleton />
        </div>
      }
    >
      <AdminLoginView />
    </Suspense>
  )
}
