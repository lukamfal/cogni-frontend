'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { homeFor, useAuth } from '@/hooks/useAuth'
import LogoIcon from '@/components/LogoIcon'

const PLAYER_NAV = [
  { href: '/dashboard', label: 'Início', icon: '🏠' },
  { href: '/jogos', label: 'Jogos', icon: '🎮' },
  { href: '/saude', label: 'Saúde', icon: '💚' },
  { href: '/familia', label: 'Família', icon: '👨‍👩‍👧' },
  { href: '/progresso', label: 'Progresso', icon: '📊' },
  { href: '/ajustes', label: 'Ajustes', icon: '⚙️' },
]

// Quem acompanha não joga: vê só as pessoas acompanhadas e os ajustes.
const CAREGIVER_NAV = [
  { href: '/acompanhar', label: 'Acompanhar', icon: '👀' },
  { href: '/ajustes', label: 'Ajustes', icon: '⚙️' },
]

export default function Navbar() {
  const { user, logout } = useAuth()
  const pathname = usePathname()
  if (!user) return null
  const firstName = user.name.split(' ')[0]
  const navItems = user.role === 'caregiver' ? CAREGIVER_NAV : PLAYER_NAV
  const active = (href: string) => pathname === href || pathname.startsWith(href + '/')

  return (
    <>
      <header className="navbar wrap">
        <div className="navbar-in">
          <Link href={homeFor(user)} className="logo">
            <LogoIcon />
            <span className="logo-text">CogniMente</span>
          </Link>
          <nav className="nb-links" aria-label="Principal">
            {navItems.map(item => (
              <Link key={item.href} href={item.href} className={`nb-link ${active(item.href) ? 'active' : ''}`} aria-current={active(item.href) ? 'page' : undefined}>
                {item.label}
              </Link>
            ))}
          </nav>
          <div className="nb-user">
            <div className="avatar">{firstName.charAt(0).toUpperCase()}</div>
            <div>
              <div className="nb-name">{firstName}</div>
              <button onClick={logout} className="nb-logout">Sair</button>
            </div>
          </div>
        </div>
      </header>

      <nav className="nb-mobile" aria-label="Principal">
        {navItems.map(item => (
          <Link key={item.href} href={item.href} className={`nb-m-item ${active(item.href) ? 'active' : ''}`} aria-current={active(item.href) ? 'page' : undefined}>
            <span className="nb-m-icon">{item.icon}</span>
            <span className="nb-m-label">{item.label}</span>
          </Link>
        ))}
      </nav>
    </>
  )
}
