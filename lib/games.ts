export type GameId = 'memory' | 'math' | 'face' | 'word'

export interface GameMeta {
  id: GameId
  icon: string
  name: string
  short: string
  long: string
  tag: string
  tags: string[]
  color: string
  bg: string
  href: string
  /** Short steps shown in the tutorial and before each game. */
  howTo: string[]
}

export const GAMES: Record<GameId, GameMeta> = {
  memory: {
    id: 'memory', icon: '🃏', name: 'Jogo da Memória', tag: 'Memória', tags: ['Memória', 'Visual'],
    short: 'Encontre os pares de figuras iguais',
    long: 'Encontre os pares de figuras iguais antes do tempo acabar. Treina atenção e memória visual.',
    color: 'var(--memory-color)', bg: 'var(--memory-bg)', href: '/jogos/memoria',
    howTo: [
      'As cartas começam viradas para baixo.',
      'Toque em duas cartas para ver as figuras.',
      'Se forem iguais, ficam abertas. Se não, viram de novo.',
      'Encontre todos os pares antes do tempo acabar.',
    ],
  },
  math: {
    id: 'math', icon: '🔢', name: 'Matemática Simples', tag: 'Raciocínio', tags: ['Raciocínio', 'Números'],
    short: 'Somas e subtrações simples',
    long: 'Somas, subtrações e multiplicações com tempo limitado. Mantém o raciocínio lógico ativo.',
    color: 'var(--math-color)', bg: 'var(--math-bg)', href: '/jogos/matematica',
    howTo: [
      'Aparece uma conta na tela, como 7 + 5.',
      'Toque no resultado certo entre as 4 opções.',
      'Se errar, o app mostra a resposta certa.',
      'Cada conta tem um tempo. Sem pressa, dá para pensar.',
    ],
  },
  face: {
    id: 'face', icon: '👨‍👩‍👧', name: 'Reconhecer Família', tag: 'Afetivo', tags: ['Memória', 'Afetivo'],
    short: 'Associe rostos a nomes',
    long: 'Veja a foto de um familiar e escolha o nome correto. Exercita a memória afetiva.',
    color: 'var(--face-color)', bg: 'var(--face-bg)', href: '/jogos/familia',
    howTo: [
      'Primeiro, cadastre fotos na página Família.',
      'O jogo mostra a foto de um familiar.',
      'Toque no nome da pessoa certa.',
      'É um jeito carinhoso de treinar a memória.',
    ],
  },
  word: {
    id: 'word', icon: '📝', name: 'Complete a Palavra', tag: 'Linguagem', tags: ['Linguagem', 'Vocabulário'],
    short: 'Descubra as letras faltando',
    long: 'Descubra as letras que faltam na palavra. Estimula linguagem e vocabulário.',
    color: 'var(--word-color)', bg: 'var(--word-bg)', href: '/jogos/palavras',
    howTo: [
      'Aparece uma palavra com letras faltando, como C_SA.',
      'Leia a dica para ajudar.',
      'Toque nas letras que faltam, na ordem.',
      'Errou a letra? Use “Apagar letra” antes de completar.',
    ],
  },
}

export const GAME_LIST = Object.values(GAMES)

export const DIFF_LABELS: Record<string, string> = { easy: 'Fácil', medium: 'Médio', hard: 'Difícil' }

export const gameMeta = (id: string): GameMeta =>
  GAMES[id as GameId] ?? { ...GAMES.memory, id: id as GameId, icon: '🎮', name: id }

/** Feedback shown after each answer. */
export interface Feedback { ok: boolean; pick: string | null; ans: string }

export const feedbackText = (f: Feedback) =>
  f.ok ? 'Correto! Muito bem 👏'
    : f.pick === null ? `O tempo acabou. A resposta era ${f.ans}.`
      : `Não foi dessa vez. A resposta era ${f.ans}.`

/** Class for an answer button once feedback is showing: the right one goes green, a wrong pick red. */
export const optClass = (f: Feedback | null, value: string) =>
  !f ? '' : value === f.ans ? 'good' : value === f.pick ? 'bad' : ''

/** Solve a backend math expression such as "12 + 7", "9 - 4", "3 × 4" or "12 ÷ 3". */
export function solveExpression(expr: string): number | null {
  const m = expr.match(/(-?\d+)\s*([+\-−×x*÷/:])\s*(-?\d+)/)
  if (!m) return null
  const a = Number(m[1]), b = Number(m[3])
  switch (m[2]) {
    case '+': return a + b
    case '-': case '−': return a - b
    case '×': case 'x': case '*': return a * b
    default: return b === 0 ? null : Math.trunc(a / b)
  }
}

export const isSameDay = (a: Date, b: Date) => a.toDateString() === b.toDateString()

/** Show a short message at the top of the screen. */
export function toast(msg: string) {
  const t = document.createElement('div')
  t.className = 'toast pop'
  t.setAttribute('role', 'status')
  t.textContent = msg
  document.body.appendChild(t)
  setTimeout(() => t.remove(), 2400)
}

/** Celebrate a great result. Skipped when the user prefers reduced motion. */
export function confetti() {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
  const box = document.createElement('div')
  box.className = 'confetti'
  const colors = ['var(--memory-color)', 'var(--math-color)', 'var(--face-color)', 'var(--word-color)']
  for (let i = 0; i < 60; i++) {
    const p = document.createElement('i')
    p.style.left = `${Math.random() * 100}%`
    p.style.background = colors[i % 4]
    p.style.animationDelay = `${Math.random() * 0.5}s`
    box.appendChild(p)
  }
  document.body.appendChild(box)
  setTimeout(() => box.remove(), 2600)
}
