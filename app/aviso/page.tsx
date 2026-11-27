import type { Metadata } from 'next'
import Link from 'next/link'
import LogoIcon from '@/components/LogoIcon'
import LegalNotice from '@/components/LegalNotice'

export const metadata: Metadata = { title: 'Aviso importante — CogniMente' }

export default function AvisoPage() {
  return (
    <main className="wrap" style={{ maxWidth: 720, margin: '0 auto', padding: '2rem 16px 4rem' }}>
      <Link href="/" className="logo" style={{ marginBottom: '1.6rem', display: 'inline-flex' }}>
        <LogoIcon /><span className="logo-text">CogniMente</span>
      </Link>
      <h1 className="page-title" style={{ marginBottom: '1.2rem' }}>Aviso importante</h1>
      <div className="card set-group"><LegalNotice /></div>
    </main>
  )
}
