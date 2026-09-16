'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useAuth } from '@/hooks/useAuth'
import { Brain } from 'lucide-react'

export default function EntrarPage() {
  const { login } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await login(email, password)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Erro ao entrar')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="auth-page">
      <div className="auth-bg" />
      <div className="auth-card animate-fade-up card">
        <div className="auth-logo">
          <div className="auth-logo-icon"><Brain size={24} strokeWidth={2} /></div>
          <div className="auth-logo-text">CogniMente</div>
        </div>

        <h1 className="auth-title">Bem-vindo de volta!</h1>
        <p className="auth-sub">Entre para continuar seus exercícios.</p>

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="auth-field">
            <label className="auth-label">E-mail</label>
            <input
              type="email"
              className="input-field"
              placeholder="seu@email.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              autoComplete="email"
            />
          </div>

          <div className="auth-field">
            <label className="auth-label">Senha</label>
            <input
              type="password"
              className="input-field"
              placeholder="••••••••"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              autoComplete="current-password"
            />
          </div>

          {error && <div className="auth-error animate-shake">{error}</div>}

          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? 'Entrando...' : 'Entrar'}
          </button>
        </form>

        <p className="auth-switch">
          Não tem conta?{' '}
          <Link href="/cadastro" className="auth-link">Cadastre-se grátis</Link>
        </p>
      </div>

      <AuthStyles />
    </main>
  )
}

function AuthStyles() {
  return (
    <style jsx global>{`
      .auth-page {
        min-height: 100vh;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 1.5rem;
        position: relative;
      }
      .auth-bg {
        position: fixed;
        inset: 0;
        background:
          radial-gradient(ellipse 80% 60% at 15% 10%, rgba(47,87,68,0.09) 0%, transparent 60%),
          radial-gradient(ellipse 60% 50% at 85% 85%, rgba(169,129,47,0.06) 0%, transparent 55%);
        pointer-events: none;
      }
      .auth-card {
        position: relative;
        z-index: 1;
        width: 100%;
        max-width: 440px;
        padding: 2.5rem 2rem;
      }
      .auth-logo {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 10px;
        margin-bottom: 1.8rem;
      }
      .auth-logo-icon {
        width: 44px;
        height: 44px;
        background: var(--sage);
        color: #fff;
        border-radius: 12px;
        display: flex;
        align-items: center;
        justify-content: center;
      }
      .auth-logo-text {
        font-family: 'Source Serif 4', serif;
        font-size: 1.4rem;
        font-weight: 600;
        color: var(--text-primary);
      }
      .auth-title {
        font-family: 'Source Serif 4', serif;
        font-size: 1.6rem;
        text-align: center;
        margin-bottom: 6px;
        color: var(--text-primary);
      }
      .auth-sub {
        text-align: center;
        color: var(--text-muted);
        font-size: 0.9rem;
        margin-bottom: 2rem;
      }
      .auth-form {
        display: flex;
        flex-direction: column;
        gap: 1rem;
      }
      .auth-field {
        display: flex;
        flex-direction: column;
        gap: 6px;
      }
      .auth-label {
        font-size: 0.9rem;
        font-weight: 700;
        color: var(--text-secondary);
      }
      .auth-error {
        background: #fef2f2;
        border: 1.5px solid #fca5a5;
        color: #b91c1c;
        padding: 10px 14px;
        border-radius: 10px;
        font-size: 0.88rem;
        font-weight: 600;
      }
      .auth-switch {
        text-align: center;
        color: var(--text-muted);
        font-size: 0.88rem;
        margin-top: 1.2rem;
      }
      .auth-link {
        color: var(--sage);
        font-weight: 700;
        text-decoration: none;
      }
      .auth-link:hover { text-decoration: underline; }
    `}</style>
  )
}
