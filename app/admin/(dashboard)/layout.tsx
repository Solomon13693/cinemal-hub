import AdminShell from '@/views/admin/components/AdminShell'

export default function AdminDashboardLayout({ children }: { children: React.ReactNode }) {
  return <AdminShell>{children}</AdminShell>
}
