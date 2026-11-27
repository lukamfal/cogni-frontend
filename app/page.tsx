import Link from 'next/link'
import LogoIcon from '@/components/LogoIcon'
import MiniMemory from '@/components/MiniMemory'
import ReportPreview from '@/components/ReportPreview'
import { GAME_LIST } from '@/lib/games'

const FEATURES = [
  { icon: '🎯', title: 'Dificuldade adaptativa', desc: 'O app aprende com seu desempenho e ajusta o nível automaticamente.' },
  { icon: '👨‍👩‍👧', title: 'Jogos com sua família', desc: 'Cadastre fotos e nomes de familiares para um jogo único e especial.' },
  { icon: '💚', title: 'Saúde integral', desc: 'Registre água, sono, movimento e humor. Mente e corpo juntos.' },
  { icon: '📊', title: 'Resumo para a família', desc: 'Seus familiares acompanham um resumo semanal da sua evolução.' },
]

const STEPS = [
  { title: 'Crie seu perfil', desc: 'Cadastro em menos de um minuto. Adicione fotos da família para os jogos ficarem pessoais.' },
  { title: 'Jogue uma sessão curta', desc: 'Um ou dois jogos por dia. A dificuldade se ajusta ao seu ritmo.' },
  { title: 'A família fica por perto', desc: 'Toda semana, quem você ama vê um resumo do seu progresso, humor e hábitos.' },
]

export default function LandingPage() {
  return (
    <main>
      <nav className="l-nav wrap">
        <div className="l-nav-in">
          <div className="logo"><LogoIcon /><span className="logo-text">CogniMente</span></div>
          <div className="l-links">
            <Link href="/entrar" className="l-link">Entrar</Link>
            <Link href="/cadastro" className="l-cta">Começar grátis</Link>
          </div>
        </div>
      </nav>

      <section className="wrap">
        <div className="l-hero">
          <div className="l-hero-copy">
            <div className="badge fade-up">🌿 Treinamento cognitivo para idosos</div>
            <h1 className="l-title fade-up" style={{ animationDelay: '.08s' }}>Exercite a mente.<br /><em>Viva melhor.</em></h1>
            <p className="l-desc fade-up" style={{ animationDelay: '.14s' }}>
              Jogos simples criados especialmente para idosos. Memória, raciocínio e reconhecimento, no seu ritmo, todo dia.
            </p>
            <div className="l-actions fade-up" style={{ animationDelay: '.2s' }}>
              <Link href="/cadastro" className="btn-black">Começar agora, é grátis</Link>
              <Link href="/entrar" className="btn-ghost">Já tenho conta</Link>
            </div>
            <div className="l-stats fade-up" style={{ animationDelay: '.28s' }}>
              {[['4', 'jogos cognitivos'], ['3', 'níveis de dificuldade'], ['100%', 'gratuito']].map(([v, l]) => (
                <div key={l}><div className="l-stat-val">{v}</div><div className="l-stat-label">{l}</div></div>
              ))}
            </div>
          </div>
          <MiniMemory />
        </div>
      </section>

      <section className="wrap">
        <div className="l-section">
          <div className="tag">Os jogos</div>
          <h2 className="l-h2">4 jogos para estimular<br />cada área da mente</h2>
          <div className="grid-2">
            {GAME_LIST.map((g, i) => (
              <div key={g.id} className="l-game card fade-up" style={{ animationDelay: `${i * 0.07}s` }}>
                <div className="l-game-icon">{g.icon}</div>
                <div className="l-game-name">{g.name}</div>
                <div className="l-game-desc">{g.long}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="l-features-band wrap">
        <div className="l-section">
          <div className="tag">Como funciona</div>
          <h2 className="l-h2">Dez minutos por dia,<br />três passos simples</h2>
          <div className="steps">
            {STEPS.map((s, i) => (
              <div key={s.title} className="step card">
                <div className="step-n">{i + 1}</div>
                <div className="step-title">{s.title}</div>
                <div className="step-desc">{s.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="wrap">
        <div className="l-section">
          <div className="tag">Por que CogniMente</div>
          <h2 className="l-h2">Feito com cuidado<br />para cada detalhe</h2>
          <div className="grid-4">
            {FEATURES.map(f => (
              <div key={f.title} className="l-feature card">
                <div className="l-feature-icon">{f.icon}</div>
                <div className="l-feature-title">{f.title}</div>
                <div className="l-feature-desc">{f.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="l-features-band wrap">
        <div className="l-section report-split">
          <div className="report-copy">
            <div className="tag" style={{ alignSelf: 'flex-start', margin: 0 }}>Para famílias e cuidadores</div>
            <h2 className="l-h2" style={{ margin: 0 }}>Tranquilidade,<br />toda semana</h2>
            <p>Filhos e cuidadores muitas vezes moram longe. O CogniMente mostra um resumo curto e simples, para saber como a pessoa querida está sem precisar perguntar todo dia.</p>
            <ul className="report-list">
              <li>Dias jogados na semana</li>
              <li>Precisão em cada jogo</li>
              <li>Humor, sono e água do registro diário</li>
              <li>Um aviso quando algo muda</li>
            </ul>
          </div>
          <ReportPreview
            title="A semana da Maria no CogniMente"
            meta="Exemplo de resumo semanal"
            greeting="Oi, Ana! Sua mãe teve uma ótima semana 🌿"
            daysPlayed="6/7"
            accuracy="84%"
            mood="🙂"
            bars={[40, 70, 55, 0, 80, 65, 95]}
            note={<>💡 A precisão em Matemática subiu 12% esta semana. Ela passou para o nível <strong>Médio</strong>.</>}
          />
        </div>
      </section>

      <section className="wrap">
        <div className="l-cta-box">
          <h2 className="l-cta-title">Comece hoje mesmo.</h2>
          <p className="l-cta-desc">Grátis, simples e feito para você.</p>
          <Link href="/cadastro" className="btn-white">Criar minha conta</Link>
        </div>
      </section>

      <footer className="l-footer wrap">
        Feito com ❤️ para cuidar da mente dos nossos idosos · CogniMente 2026<br />
        O CogniMente é um jogo e não substitui atendimento médico. <Link href="/aviso" className="link">Leia o aviso importante</Link>
      </footer>
    </main>
  )
}
