'use client'

import Link from 'next/link'
import { Grid3x3, Calculator, Users, BookOpen, Gamepad2 } from 'lucide-react'

const GAMES = [
  {
    icon: Grid3x3, name: 'Jogo da Memória', desc: 'Encontre os pares de figuras iguais antes do tempo acabar. Treina atenção e memória visual.',
    color: 'var(--memory-color)', bg: 'var(--memory-bg)', href: '/jogos/memoria',
    tags: ['Memória', 'Visual'],
  },
  {
    icon: Calculator, name: 'Matemática Simples', desc: 'Somas, subtrações e multiplicações com tempo limitado. Mantém o raciocínio lógico ativo.',
    color: 'var(--math-color)', bg: 'var(--math-bg)', href: '/jogos/matematica',
    tags: ['Raciocínio', 'Números'],
  },
  {
    icon: Users, name: 'Reconhecer Família', desc: 'Veja a foto de um familiar e escolha o nome correto. Exercita a memória afetiva.',
    color: 'var(--face-color)', bg: 'var(--face-bg)', href: '/jogos/familia',
    tags: ['Memória', 'Afetivo'],
  },
  {
    icon: BookOpen, name: 'Complete a Palavra', desc: 'Descubra as letras que faltam na palavra. Estimula linguagem e vocabulário.',
    color: 'var(--word-color)', bg: 'var(--word-bg)', href: '/jogos/palavras',
    tags: ['Linguagem', 'Vocabulário'],
  },
]

export default function JogosPage() {
  return (
    <div className="jogos-page">
      <div className="jogos-header animate-fade-up">
        <h1 className="jogos-title"><Gamepad2 size={26} strokeWidth={1.75} /> Jogos</h1>
        <p className="jogos-sub">Escolha um jogo para começar. Cada um exercita uma área diferente da sua mente.</p>
      </div>

      <div className="jogos-list">
        {GAMES.map((g, i) => (
          <Link
            key={g.name}
            href={g.href}
            className="jogo-card card animate-fade-up"
            style={{ animationDelay: `${i * 0.08}s`, '--gc': g.color, '--gb': g.bg } as React.CSSProperties}
          >
            <div className="jogo-icon-wrap" style={{ background: g.bg, color: g.color }}>
              <g.icon size={26} strokeWidth={1.75} />
            </div>
            <div className="jogo-body">
              <div className="jogo-name">{g.name}</div>
              <div className="jogo-desc">{g.desc}</div>
              <div className="jogo-tags">
                {g.tags.map(t => (
                  <span key={t} className="jogo-tag" style={{ background: g.bg, color: g.color }}>{t}</span>
                ))}
              </div>
            </div>
            <div className="jogo-arrow">→</div>
          </Link>
        ))}
      </div>

      <style jsx global>{`
        .jogos-page { display: flex; flex-direction: column; gap: 1.5rem; }
        .jogos-header { margin-bottom: 0.5rem; }
        .jogos-title { display: flex; align-items: center; gap: 12px; font-family: 'Source Serif 4', serif; font-size: 1.8rem; color: var(--text-primary); margin-bottom: 6px; }
        .jogos-sub { color: var(--text-secondary); font-size: 0.92rem; line-height: 1.6; }
        .jogos-list { display: flex; flex-direction: column; gap: 14px; }
        .jogo-card {
          display: flex; align-items: center; gap: 16px;
          padding: 1.2rem 1.4rem;
          text-decoration: none; color: inherit;
          transition: all 0.2s;
        }
        .jogo-card:hover { transform: translateX(4px); border-color: var(--gc); box-shadow: var(--shadow-lg); }
        .jogo-icon-wrap { width: 60px; height: 60px; border-radius: 12px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
        .jogo-body { flex: 1; min-width: 0; }
        .jogo-name { font-weight: 700; font-size: 1rem; color: var(--text-primary); margin-bottom: 4px; }
        .jogo-desc { font-size: 0.82rem; color: var(--text-secondary); line-height: 1.5; margin-bottom: 8px; }
        .jogo-tags { display: flex; gap: 6px; flex-wrap: wrap; }
        .jogo-tag { font-size: 0.72rem; font-weight: 700; padding: 3px 10px; border-radius: 6px; }
        .jogo-arrow { color: var(--text-muted); font-size: 1.2rem; flex-shrink: 0; transition: all 0.15s; }
        .jogo-card:hover .jogo-arrow { color: var(--gc); transform: translateX(3px); }
      `}</style>
    </div>
  )
}
