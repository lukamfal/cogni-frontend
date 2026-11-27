'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { GAME_LIST } from '@/lib/games'
import { TEXT_SIZES, usePreferences } from '@/hooks/usePreferences'
import LogoIcon from '@/components/LogoIcon'

// The how-to step that best sums up each game in one line.
const KEY_STEP = { memory: 1, math: 1, face: 2, word: 2 } as const

const doneKey =(userId: number) => `cogni_tutorial_done_${userId}`

/** Forget that the tutorial was seen, so it opens again on the home screen. */
export function resetTutorial(userId: number) {
  try { localStorage.removeItem(doneKey(userId)) } catch {}
}

interface Props { userId: number; firstName: string; startHref: string }

/** Step-by-step welcome shown the first time someone reaches the home screen. */
export default function Tutorial({ userId, firstName, startHref }: Props) {
  const router = useRouter()
  const { size, setSize, theme, setTheme } = usePreferences()
  const [open, setOpen] = useState(false)
  const [step, setStep] = useState(0)
  const card = useRef<HTMLDivElement>(null)

  // localStorage only exists in the browser, so it is read after mount.
  useEffect(() => {
    let seen = true
    try { seen = localStorage.getItem(doneKey(userId)) === '1' } catch {}
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (!seen) setOpen(true)
  }, [userId])

  useEffect(() => { if (open) card.current?.focus() }, [open, step])

  const finish = (href?: string) => {
    try { localStorage.setItem(doneKey(userId), '1') } catch {}
    setOpen(false)
    if (href) router.push(href)
  }

  if (!open) return null

  const steps = [
    {
      title: `Olá, ${firstName}! 👋`,
      body: (
        <>
          <div className="tut-hero"><LogoIcon /></div>
          <p>O CogniMente tem jogos curtos para exercitar a mente, uns <strong>10 minutos por dia</strong>.</p>
          <p>Vou mostrar rapidinho como tudo funciona. Leva menos de um minuto.</p>
        </>
      ),
    },
    {
      title: 'Comece pelo plano de hoje',
      body: (
        <>
          <div className="tut-demo today card">
            <div className="ring-txt" style={{ position: 'static', fontSize: '1.1rem' }}>0/3</div>
            <div><div className="today-label">Plano de hoje</div><div className="today-title">Próximo jogo</div></div>
            <span className="today-btn" aria-hidden="true">Começar</span>
          </div>
          <p>Na tela inicial, o app já escolhe <strong>o jogo e o nível</strong> para você.</p>
          <p>É só tocar em <strong>Começar</strong>. A meta é jogar 3 vezes por dia.</p>
        </>
      ),
    },
    {
      title: 'Os 4 jogos',
      body: (
        <div className="tut-games">
          {GAME_LIST.map(g => (
            <div key={g.id} className="tut-game" style={{ background: g.bg }}>
              <span className="tut-game-icon">{g.icon}</span>
              <div>
                <div className="tut-game-name">{g.name}</div>
                <div className="tut-game-how">{g.howTo[KEY_STEP[g.id]]}</div>
              </div>
            </div>
          ))}
          <p className="note">Antes de cada jogo, aparece um “Como jogar” com o passo a passo.</p>
        </div>
      ),
    },
    {
      title: 'Família e saúde',
      body: (
        <>
          <div className="tut-row"><span>👨‍👩‍👧</span><p>Em <strong>Família</strong>, cadastre fotos de quem você ama. Elas viram o jogo Reconhecer Família.</p></div>
          <div className="tut-row"><span>💚</span><p>Em <strong>Saúde</strong>, anote todo dia a água, o sono, o humor e o movimento.</p></div>
          <div className="tut-row"><span>📊</span><p>Em <strong>Progresso</strong>, veja sua evolução na semana.</p></div>
        </>
      ),
    },
    {
      title: 'Deixe do seu jeito',
      body: (
        <>
          <p>Escolha o tamanho do texto e o modo de cor. Dá para mudar depois em <strong>⚙️ Ajustes</strong>.</p>
          <div className="set-row">
            <span className="set-label">Tamanho do texto</span>
            <div className="ts-opts" role="group" aria-label="Tamanho do texto">
              {TEXT_SIZES.map((t, i) => (
                <button key={t.label} className={`ts-opt ${i === size ? 'active' : ''}`} aria-pressed={i === size} onClick={() => setSize(i)}>{t.label}</button>
              ))}
            </div>
          </div>
          <div className="set-row">
            <span className="set-label">Modo noturno</span>
            <button className={`switch ${theme === 'dark' ? 'on' : ''}`} role="switch" aria-checked={theme === 'dark'}
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}><span /></button>
          </div>
        </>
      ),
    },
  ]
  const last = step === steps.length - 1

  return (
    <div className="tut-backdrop" onKeyDown={e => { if (e.key === 'Escape') finish() }}>
      <div className="tut-card card pop" role="dialog" aria-modal="true" aria-labelledby="tut-title" tabIndex={-1} ref={card} key={step}>
        <div className="tut-top">
          <span className="tut-count">Passo {step + 1} de {steps.length}</span>
          <button className="tut-skip" onClick={() => finish()}>Pular</button>
        </div>
        <h2 id="tut-title" className="tut-title">{steps[step].title}</h2>
        <div className="tut-body">{steps[step].body}</div>
        <div className="tut-dots" aria-hidden="true">
          {steps.map((_, i) => <i key={i} className={i === step ? 'on' : ''} />)}
        </div>
        <div className="tut-actions">
          {step > 0 && <button className="btn-outline" onClick={() => setStep(s => s - 1)}>Voltar</button>}
          {last
            ? <button className="btn-primary" onClick={() => finish(startHref)}>Jogar meu primeiro jogo</button>
            : <button className="btn-primary" onClick={() => setStep(s => s + 1)}>Próximo</button>}
        </div>
        {last && <button className="tut-skip" style={{ alignSelf: 'center' }} onClick={() => finish()}>Agora não, ver a tela inicial</button>}
      </div>
    </div>
  )
}
