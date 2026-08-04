export type CustomerType = {
  id: string
  name: string
  phone: string | null
  role: 'customer' | 'admin'
  created_at: string
  email?: string | null
}
