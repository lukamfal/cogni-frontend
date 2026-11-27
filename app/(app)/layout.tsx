import Navbar from '@/components/layout/Navbar'
import PlayerGuards from '@/components/PlayerGuards'

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Navbar />
      <main className="app-main wrap">{children}</main>
      <PlayerGuards />
    </>
  )
}
