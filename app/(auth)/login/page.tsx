import { Suspense } from 'react'
import LoginView from '@/views/auth/login'
import { AuthFormSkeleton } from '@/components/ui'

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="container flex min-h-[60vh] items-center justify-center page-section">
          <AuthFormSkeleton />
        </div>
      }
    >
      <LoginView />
    </Suspense>
  )
}
