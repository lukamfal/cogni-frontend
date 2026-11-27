'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { TEXT_SIZES, usePreferences } from '@/hooks/usePreferences'
import { resetTutorial } from '@/components/Tutorial'
import LegalNotice from '@/components/LegalNotice'
import { api, Follower } from '@/lib/api'
import { toast } from '@/lib/games'

export default function AjustesPage() {
  const router = useRouter()
  const { user, logout } = useAuth()
  const { size, setSize, theme, setTheme } = usePreferences()
  const isPlayer = user?.role !== 'caregiver'

  return (
    <div className="stack">
      <div className="fade-up">
        <h1 className="page-title">⚙️ Ajustes</h1>
        <p className="page-sub">Deixe o CogniMente confortável para você. As escolhas de leitura e aparência ficam salvas neste aparelho.</p>
      </div>

      <section className="set-group card fade-up">
        <div className="set-head">Leitura</div>
        <div className="set-row">
          <div>
            <div className="set-label">Tamanho do texto</div>
            <div className="set-sub">{TEXT_SIZES[size].name}</div>
          </div>
          <div className="ts-opts" role="group" aria-label="Tamanho do texto">
            {TEXT_SIZES.map((t, i) => (
              <button key={t.label} className={`ts-opt ${i === size ? 'active' : ''}`} aria-pressed={i === size} onClick={() => setSize(i)}>{t.label}</button>
            ))}
          </div>
        </div>
        <p className="set-preview">Assim fica o texto: exercite a mente, viva melhor.</p>
      </section>

      <section className="set-group card fade-up" style={{ animationDelay: '.05s' }}>
        <div className="set-head">Aparência</div>
        <div className="set-row">
          <div>
            <div className="set-label">Modo noturno</div>
            <div className="set-sub">{theme === 'dark' ? 'Ligado: fundo escuro, bom para a noite' : 'Desligado: fundo bege claro'}</div>
          </div>
          <button className={`switch ${theme === 'dark' ? 'on' : ''}`} role="switch" aria-checked={theme === 'dark'} aria-label="Modo noturno"
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}><span /></button>
        </div>
      </section>

      {isPlayer && <Followers />}

      {isPlayer && (
        <section className="set-group card fade-up" style={{ animationDelay: '.1s' }}>
          <div className="set-head">Ajuda</div>
          <button className="row-card" onClick={() => { if (user) resetTutorial(user.id); router.push('/dashboard') }}>
            <span className="rc-icon">🧭</span>
            <div><div className="rc-title">Ver o tutorial de novo</div><div className="rc-desc">O passo a passo de como usar o app</div></div>
            <span className="arrow-in">→</span>
          </button>
          <button className="row-card" onClick={() => router.push('/jogos')}>
            <span className="rc-icon">🎮</span>
            <div><div className="rc-title">Como jogar cada jogo</div><div className="rc-desc">Escolha um jogo e veja o “Como jogar”</div></div>
            <span className="arrow-in">→</span>
          </button>
        </section>
      )}

      <section className="set-group card fade-up" style={{ animationDelay: '.15s' }} aria-labelledby="aviso-title">
        <div className="set-head" id="aviso-title">Aviso importante</div>
        <LegalNotice />
      </section>

      <section className="set-group card fade-up" style={{ animationDelay: '.2s' }}>
        <div className="set-head">Conta</div>
        {user && (
          <div className="set-row">
            <div>
              <div className="set-label">{user.name}</div>
              <div className="set-sub">{user.email} · {user.role === 'caregiver' ? 'Acompanha familiares' : 'Joga'}</div>
            </div>
          </div>
        )}
        <button className="btn-outline" onClick={logout}>Sair da conta</button>
      </section>
    </div>
  )
}

/** Who can see this player's progress, with a way to take the permission back. */
function Followers() {
  const [list, setList] = useState<Follower[] | null>(null)
  const [confirm, setConfirm] = useState<number | null>(null)

  useEffect(() => { api.care.followers().then(setList).catch(() => setList([])) }, [])

  const remove = async (f: Follower) => {
    try {
      await api.care.remove(f.id)
      setList(l => (l ?? []).filter(x => x.id !== f.id))
      toast(`${f.caregiver_name.split(' ')[0]} não acompanha mais você.`)
    } catch {
      toast('Não foi possível remover. Tente de novo.')
    } finally {
      setConfirm(null)
    }
  }

  return (
    <section className="set-group card fade-up" style={{ animationDelay: '.08s' }}>
      <div className="set-head">Quem acompanha você</div>
      {list === null ? <div className="set-sub">Carregando...</div>
        : list.length === 0 ? (
          <div className="set-sub">Ninguém acompanha você agora. Quando um familiar pedir, um aviso aparece na sua tela inicial.</div>
        ) : list.map(f => (
          <div key={f.id} className="set-row">
            <div>
              <div className="set-label">{f.caregiver_name}</div>
              <div className="set-sub">{f.caregiver_email} · vê seus jogos e sua saúde</div>
            </div>
            {confirm === f.id ? (
              <div className="confirm-row">
                <button className="cr-yes" onClick={() => remove(f)}>Tirar permissão</button>
                <button className="cr-no" onClick={() => setConfirm(null)}>Manter</button>
              </div>
            ) : (
              <button className="btn-small" onClick={() => setConfirm(f.id)}>Remover</button>
            )}
          </div>
        ))}
    </section>
  )
}
