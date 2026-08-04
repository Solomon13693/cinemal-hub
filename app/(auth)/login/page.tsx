import { Suspense } from 'react'
import LoginView from '@/views/auth/login'

export default function LoginPage() {
  return (
    <Suspense fallback={<p className="text-center text-sm text-text-grey">Loading…</p>}>
      <LoginView />
    </Suspense>
  )
}
