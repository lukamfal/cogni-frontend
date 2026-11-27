import Navbar from '@/components/layout/Navbar'

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Navbar />
      <main className="app-main wrap">{children}</main>
    </>
  )
}
