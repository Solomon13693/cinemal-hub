export function generateBookingNumber(): string {
  const stamp = Date.now().toString().slice(-8)
  const rand = Math.random().toString(36).slice(2, 6).toUpperCase()
  return `CH-${stamp}${rand}`
}
