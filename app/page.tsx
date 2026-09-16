'use client'

import Link from 'next/link'
import { Brain, Grid3x3, Calculator, Users, BookOpen, Type, Target, Flame } from 'lucide-react'

export default function LandingPage() {
  return (
    <main className="landing">
      <div className="landing-bg" />

      <div className="landing-container">
        {/* Header */}
        <header className="landing-header animate-fade-up">
          <div className="landing-logo">
            <div className="landing-logo-icon"><Brain size={22} strokeWidth={2} /></div>
            <span className="landing-logo-text">CogniMente</span>
          </div>
          <Link href="/entrar" className="landing-btn-outline">Entrar</Link>
        </header>

        {/* Hero */}
        <section className="hero animate-fade-up" style={{ animationDelay: '0.1s' }}>
          <div className="hero-badge">Estimulação cognitiva diária</div>
          <h1 className="hero-title">
            Exercite a mente<br />
            <em>com clareza</em>
          </h1>
          <p className="hero-desc">
            Jogos simples criados especialmente para idosos.
            Memória, raciocínio e reconhecimento de familiares — tudo no seu ritmo.
          </p>
          <div className="hero-actions">
            <Link href="/cadastro" className="btn-primary hero-cta">
              Começar agora — é grátis
            </Link>
            <Link href="/entrar" className="btn-outline hero-cta-sec">
              Já tenho conta
            </Link>
          </div>
        </section>

        {/* Cards dos jogos */}
        <section className="games-preview animate-fade-up" style={{ animationDelay: '0.2s' }}>
          <h2 className="section-title">4 jogos para estimular a mente</h2>
          <div className="games-grid">
            {GAMES.map((game, i) => (
              <div
                key={game.name}
                className="game-preview-card animate-fade-up"
                style={{ animationDelay: `${0.25 + i * 0.07}s`, '--game-color': game.color, '--game-bg': game.bg } as React.CSSProperties}
              >
                <div className="game-preview-icon"><game.icon size={22} strokeWidth={1.75} /></div>
                <div className="game-preview-name">{game.name}</div>
                <div className="game-preview-desc">{game.desc}</div>
              </div>
            ))}
          </div>
        </section>

        {/* Features */}
        <section className="features animate-fade-up" style={{ animationDelay: '0.35s' }}>
          {FEATURES.map(f => (
            <div key={f.title} className="feature-item">
              <div className="feature-icon"><f.icon size={20} strokeWidth={1.75} /></div>
              <div>
                <div className="feature-title">{f.title}</div>
                <div className="feature-desc">{f.desc}</div>
              </div>
            </div>
          ))}
        </section>

        <footer className="landing-footer">
          Desenvolvido para o bem-estar cognitivo dos nossos idosos
        </footer>
      </div>

      <style jsx global>{`
        .landing {
          min-height: 100vh;
          position: relative;
          overflow: hidden;
        }
        .landing-bg {
          position: fixed;
          inset: 0;
          background:
            radial-gradient(ellipse 80% 60% at 20% 10%, rgba(47,87,68,0.08) 0%, transparent 60%),
            radial-gradient(ellipse 60% 50% at 80% 80%, rgba(169,129,47,0.05) 0%, transparent 55%);
          pointer-events: none;
          z-index: 0;
        }
        .landing-container {
          position: relative;
          z-index: 1;
          max-width: 860px;
          margin: 0 auto;
          padding: 0 1.5rem 3rem;
        }
        .landing-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 1.5rem 0;
        }
        .landing-logo {
          display: flex;
          align-items: center;
          gap: 10px;
        }
        .landing-logo-icon {
          width: 40px;
          height: 40px;
          background: var(--sage);
          color: #fff;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .landing-logo-text {
          font-family: 'Source Serif 4', serif;
          font-size: 1.3rem;
          font-weight: 600;
          color: var(--text-primary);
        }
        .landing-btn-outline {
          padding: 10px 22px;
          border: 1.5px solid var(--sage);
          border-radius: 8px;
          color: var(--sage);
          font-weight: 600;
          font-size: 0.9rem;
          text-decoration: none;
          transition: all 0.15s;
        }
        .landing-btn-outline:hover { background: var(--sage-50); }

        /* Hero */
        .hero {
          text-align: center;
          padding: 3.5rem 0 2.5rem;
        }
        .hero-badge {
          display: inline-block;
          background: var(--sage-50);
          border: 1px solid var(--sage-100);
          color: var(--sage-dark);
          padding: 7px 16px;
          border-radius: 8px;
          font-size: 0.78rem;
          font-weight: 700;
          letter-spacing: 0.06em;
          text-transform: uppercase;
          margin-bottom: 1.75rem;
        }
        .hero-title {
          font-size: clamp(2.2rem, 6vw, 3.5rem);
          font-weight: 600;
          color: var(--text-primary);
          margin-bottom: 1.2rem;
          line-height: 1.1;
        }
        .hero-title em {
          font-style: italic;
          color: var(--gold-dark);
        }
        .hero-desc {
          font-size: 1.1rem;
          color: var(--text-secondary);
          max-width: 560px;
          margin: 0 auto 2rem;
          line-height: 1.7;
        }
        .hero-actions {
          display: flex;
          gap: 14px;
          justify-content: center;
          flex-wrap: wrap;
        }
        .hero-cta, .hero-cta-sec {
          width: auto;
          padding: 14px 32px;
          border-radius: 8px;
          text-decoration: none;
          font-size: 1rem;
          font-weight: 700;
          display: inline-block;
          transition: all 0.18s;
          min-height: 52px;
          line-height: 1.4;
        }
        .hero-cta {
          background: var(--sage);
          color: #fff;
          box-shadow: 0 4px 20px rgba(47,87,68,0.25);
        }
        .hero-cta:hover { background: var(--sage-dark); transform: translateY(-2px); }
        .hero-cta-sec {
          border: 1.5px solid var(--sage);
          color: var(--sage);
          background: transparent;
        }
        .hero-cta-sec:hover { background: var(--sage-50); }

        /* Jogos */
        .section-title {
          font-family: 'Source Serif 4', serif;
          font-size: 1.5rem;
          text-align: center;
          margin-bottom: 1.5rem;
          color: var(--text-primary);
        }
        .games-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 14px;
        }
        .game-preview-card {
          background: #fff;
          border: 1px solid var(--cream-border);
          border-radius: 14px;
          padding: 1.4rem;
          transition: all 0.2s;
          cursor: default;
        }
        .game-preview-card:hover {
          transform: translateY(-2px);
          box-shadow: var(--shadow-lg);
          border-color: var(--game-color);
        }
        .game-preview-icon {
          width: 44px;
          height: 44px;
          border-radius: 10px;
          background: var(--game-bg);
          color: var(--game-color);
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 0.9rem;
        }
        .game-preview-name {
          font-weight: 700;
          font-size: 1rem;
          color: var(--text-primary);
          margin-bottom: 4px;
        }
        .game-preview-desc {
          font-size: 0.82rem;
          color: var(--text-secondary);
          line-height: 1.5;
        }

        /* Features */
        .features {
          display: flex;
          flex-direction: column;
          gap: 12px;
          margin: 2.5rem 0;
        }
        .feature-item {
          display: flex;
          align-items: center;
          gap: 16px;
          background: #fff;
          border: 1px solid var(--cream-border);
          border-radius: 12px;
          padding: 1.1rem 1.4rem;
        }
        .feature-icon {
          width: 40px;
          height: 40px;
          border-radius: 10px;
          background: var(--sage-50);
          color: var(--sage);
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }
        .feature-title { font-weight: 700; font-size: 0.95rem; color: var(--text-primary); margin-bottom: 2px; }
        .feature-desc { font-size: 0.84rem; color: var(--text-secondary); line-height: 1.5; }

        .landing-footer {
          text-align: center;
          color: var(--text-muted);
          font-size: 0.82rem;
          padding-top: 1rem;
        }

        @media (max-width: 600px) {
          .games-grid { grid-template-columns: 1fr; }
        }
      `}</style>
    </main>
  )
}

const GAMES = [
  { icon: Grid3x3,   name: 'Jogo da Memória',     desc: 'Encontre os pares e exercite a memória visual.',          color: '#3763a3', bg: '#eaf0f8' },
  { icon: Calculator, name: 'Matemática Simples', desc: 'Somas e subtrações para manter o raciocínio ativo.',      color: '#a3652f', bg: '#f7ede2' },
  { icon: Users,     name: 'Reconhecer Família',  desc: 'Associe rostos a nomes — fortalece memória afetiva.',     color: '#9c4d6c', bg: '#f5eaef' },
  { icon: BookOpen,  name: 'Complete a Palavra',  desc: 'Descubra letras faltando e estimule a linguagem.',        color: '#2f5744', bg: '#f0f4f1' },
]

const FEATURES = [
  { icon: Type,   title: 'Letras grandes e fáceis de ler',    desc: 'Interface projetada especialmente para idosos, com alto contraste e botões generosos.' },
  { icon: Target, title: 'Dificuldade que se adapta a você',  desc: 'O app aprende com seu desempenho e sugere o nível ideal automaticamente.' },
  { icon: Flame,  title: 'Sequência diária motivante',        desc: 'Acompanhe sua sequência de dias jogando e mantenha a mente sempre ativa.' },
  { icon: Users,  title: 'Cadastre seus familiares',          desc: 'Adicione fotos e nomes para o jogo de reconhecimento ficar ainda mais especial.' },
]
