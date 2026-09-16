'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { Brain, Home, HeartPulse, Users, BarChart3 } from 'lucide-react'

const navItems = [
  { href: '/dashboard', label: 'Início', icon: Home },
  { href: '/saude',     label: 'Saúde',  icon: HeartPulse },
  { href: '/familia',   label: 'Família', icon: Users },
  { href: '/progresso', label: 'Progresso', icon: BarChart3 },
]

export default function Navbar() {
  const { user, logout } = useAuth()
  const pathname = usePathname()

  if (!user) return null

  return (
    <>
      <header className="navbar-desktop">
        <Link href="/dashboard" className="navbar-logo">
          <div className="navbar-logo-icon"><Brain size={20} strokeWidth={2} /></div>
          <div>
            <div className="navbar-logo-name">CogniMente</div>
            <div className="navbar-logo-sub">Exercícios para a mente</div>
          </div>
        </Link>
        <nav className="navbar-links">
          {navItems.map(item => (
            <Link
              key={item.href}
              href={item.href}
              className={`navbar-link ${pathname.startsWith(item.href) ? 'active' : ''}`}
            >
              <item.icon size={17} strokeWidth={2} />
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="navbar-user">
          <div className="navbar-avatar">
            {user.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <div className="navbar-username">{user.name.split(' ')[0]}</div>
            <button onClick={logout} className="navbar-logout">Sair</button>
          </div>
        </div>
      </header>

      <nav className="navbar-mobile">
        {navItems.map(item => (
          <Link
            key={item.href}
            href={item.href}
            className={`navbar-mobile-item ${pathname.startsWith(item.href) ? 'active' : ''}`}
          >
            <span className="navbar-mobile-icon"><item.icon size={20} strokeWidth={2} /></span>
            <span className="navbar-mobile-label">{item.label}</span>
          </Link>
        ))}
      </nav>

      <style jsx global>{`
        .navbar-desktop {
          position: sticky; top: 0; z-index: 50;
          background: rgba(247, 245, 240, 0.92);
          backdrop-filter: blur(12px);
          border-bottom: 1px solid var(--cream-border);
          display: flex; align-items: center; justify-content: space-between;
          padding: 0 2rem; height: 70px;
        }
        .navbar-logo { display: flex; align-items: center; gap: 12px; text-decoration: none; }
        .navbar-logo-icon { width: 40px; height: 40px; background: var(--sage); color: #fff; border-radius: 10px; display: flex; align-items: center; justify-content: center; }
        .navbar-logo-name { font-family: 'Source Serif 4', serif; font-size: 1.2rem; font-weight: 600; color: var(--text-primary); }
        .navbar-logo-sub { font-size: 0.7rem; color: var(--text-muted); }
        .navbar-links { display: flex; gap: 4px; }
        .navbar-link { display: flex; align-items: center; gap: 7px; padding: 8px 16px; border-radius: 8px; font-size: 0.9rem; font-weight: 600; color: var(--text-secondary); text-decoration: none; transition: all 0.15s; }
        .navbar-link:hover, .navbar-link.active { background: var(--sage-50); color: var(--sage); }
        .navbar-user { display: flex; align-items: center; gap: 10px; }
        .navbar-avatar { width: 40px; height: 40px; border-radius: 50%; background: var(--sage); color: #fff; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 1rem; }
        .navbar-username { font-size: 0.9rem; font-weight: 700; color: var(--text-primary); }
        .navbar-logout { font-size: 0.75rem; color: var(--text-muted); background: none; border: none; padding: 0; min-height: unset; cursor: pointer; font-weight: 500; }
        .navbar-logout:hover { color: var(--sage); }
        .navbar-mobile { display: none; position: fixed; bottom: 0; left: 0; right: 0; z-index: 50; background: rgba(247, 245, 240, 0.96); backdrop-filter: blur(12px); border-top: 1px solid var(--cream-border); padding: 8px 0 max(8px, env(safe-area-inset-bottom)); justify-content: space-around; }
        .navbar-mobile-item { display: flex; flex-direction: column; align-items: center; gap: 3px; text-decoration: none; padding: 6px 16px; border-radius: 8px; transition: all 0.15s; color: var(--text-muted); }
        .navbar-mobile-icon { display: flex; }
        .navbar-mobile-label { font-size: 0.68rem; font-weight: 600; color: var(--text-muted); }
        .navbar-mobile-item.active .navbar-mobile-label { color: var(--sage); }
        .navbar-mobile-item.active .navbar-mobile-icon { color: var(--sage); transform: scale(1.1); }
        @media (max-width: 768px) {
          .navbar-desktop { display: none; }
          .navbar-mobile { display: flex; }
        }
      `}</style>
    </>
  )
}