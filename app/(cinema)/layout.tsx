import { Header, Footer } from '@/components'

export default function CinemaLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="store-shell">
      <Header />
      <main className="store-main">{children}</main>
      <Footer />
    </div>
  )
}
