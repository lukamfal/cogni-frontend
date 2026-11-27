'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useAuth } from '@/hooks/useAuth'
import LogoIcon from '@/components/LogoIcon'
import type { Role } from '@/lib/api'

/** Shared sign-in / sign-up card. */
export default function AuthForm({ kind }: { kind: 'signin' | 'signup' }) {
  const up = kind === 'signup'
  const { login, register } = useAuth()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [role, setRole] = useState<Role>('elder')

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (up && !name.trim()) { setError('Digite seu nome.'); return }
    if (!email.includes('@')) { setError('Digite um e-mail válido, como voce@email.com.'); return }
    if (password.length < 6) { setError('A senha precisa ter ao menos 6 caracteres.'); return }
    setError('')
    setLoading(true)
    try {
      if (up) await register(name.trim(), email.trim(), password, role)
      else await login(email.trim(), password)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : up ? 'Erro ao cadastrar' : 'Erro ao entrar')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="auth-page wrap">
      <form className="auth-card card fade-up" onSubmit={submit} noValidate>
        <Link href="/" className="auth-back">← Voltar ao início</Link>
        <div className="logo auth-logo">
          <LogoIcon />
          <span className="logo-text" style={{ fontSize: '1.4rem' }}>CogniMente</span>
        </div>
        <h1 className="auth-title">{up ? 'Criar conta grátis' : 'Bem-vindo de volta!'}</h1>
        <p className="auth-sub">{up ? 'Como você vai usar o CogniMente?' : 'Entre para continuar.'}</p>

        {up && (
          <div className="role-pick" role="radiogroup" aria-label="Como você vai usar o CogniMente">
            <button type="button" role="radio" aria-checked={role === 'elder'} className={`role-opt ${role === 'elder' ? 'sel' : ''}`} onClick={() => setRole('elder')}>
              <span className="role-icon">🎮</span>
              <span className="role-name">Quero jogar</span>
              <span className="role-desc">Exercitar a mente com os jogos</span>
            </button>
            <button type="button" role="radio" aria-checked={role === 'caregiver'} className={`role-opt ${role === 'caregiver' ? 'sel' : ''}`} onClick={() => setRole('caregiver')}>
              <span className="role-icon">👀</span>
              <span className="role-name">Quero acompanhar</span>
              <span className="role-desc">Ver o progresso de um familiar</span>
            </button>
          </div>
        )}
        {up && role === 'caregiver' && (
          <p className="role-note">Depois do cadastro, você pede para acompanhar pelo e-mail da pessoa. Ela precisa permitir.</p>
        )}

        {up && (
          <div className="field">
            <label className="label" htmlFor="a-name">Seu nome</label>
            <input id="a-name" className="input-field" placeholder="Ex: Maria da Silva" value={name} onChange={e => setName(e.target.value)} required autoComplete="name" />
          </div>
        )}
        <div className="field">
          <label className="label" htmlFor="a-email">E-mail</label>
          <input id="a-email" type="email" className="input-field" placeholder="seu@email.com" value={email} onChange={e => setEmail(e.target.value)} required autoComplete="email" />
        </div>
        <div className="field">
          <label className="label" htmlFor="a-pass">Senha</label>
          <input
            id="a-pass" type="password" className="input-field"
            placeholder={up ? 'Mínimo 6 caracteres' : '••••••••'}
            value={password} onChange={e => setPassword(e.target.value)} required
            autoComplete={up ? 'new-password' : 'current-password'}
          />
        </div>

        {error && <div className="auth-error shake" role="alert">{error}</div>}

        <button type="submit" className="btn-primary" disabled={loading}>
          {loading ? (up ? 'Criando conta...' : 'Entrando...') : (up ? 'Criar conta grátis' : 'Entrar')}
        </button>

        {up && (
          <p className="auth-switch" style={{ fontSize: '.8rem' }}>
            Ao criar a conta, você confirma que leu o <Link href="/aviso" className="link" target="_blank">aviso importante</Link>:
            o CogniMente é um jogo e não substitui atendimento médico.
          </p>
        )}

        <p className="auth-switch">
          {up ? 'Já tem conta?' : 'Não tem conta?'}{' '}
          <Link href={up ? '/entrar' : '/cadastro'} className="link">{up ? 'Entrar' : 'Cadastre-se grátis'}</Link>
        </p>
      </form>
    </main>
  )
}
