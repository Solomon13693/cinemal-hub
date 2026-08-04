export type CategoryType = {
  id: string
  name: string
  slug: string
  image_url: string | null
  created_at: string
}

export type CategoryPayloadType = {
  name: string
  slug: string
  image_url?: string | null
}
