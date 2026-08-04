export type UserRoleType = 'customer' | 'admin'

export type ProfileType = {
  id: string
  name: string
  phone: string | null
  role: UserRoleType
  created_at: string
}

export type RegisterPayloadType = {
  name: string
  email: string
  phone: string
  password: string
}

export type LoginPayloadType = {
  email: string
  password: string
}
