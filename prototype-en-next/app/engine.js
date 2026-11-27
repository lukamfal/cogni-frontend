/* CogniMente — English presentation prototype. All data is local mock data; no backend calls. */
let root

const GAMES = {
  memory: { icon: '🃏', name: 'Memory Match',    short: 'Find the matching pairs',       long: 'Find the pairs of matching pictures before time runs out. Trains attention and visual memory.', tag: 'Memory',    tags: ['Memory', 'Visual'],         color: 'var(--memory-color)', bg: 'var(--memory-bg)', route: 'memory' },
  math:   { icon: '🔢', name: 'Quick Math',      short: 'Simple additions and subtractions', long: 'Additions, subtractions and multiplications against the clock. Keeps logical reasoning sharp.', tag: 'Reasoning', tags: ['Reasoning', 'Numbers'],     color: 'var(--math-color)',   bg: 'var(--math-bg)',   route: 'math' },
  face:   { icon: '👨‍👩‍👧', name: 'Family Faces', short: 'Match faces to names',          long: 'See a photo of a loved one and pick the right name. Exercises emotional memory.',              tag: 'Emotional', tags: ['Memory', 'Emotional'],      color: 'var(--face-color)',   bg: 'var(--face-bg)',   route: 'faces' },
  word:   { icon: '📝', name: 'Fill the Word',   short: 'Find the missing letters',      long: 'Discover the letters missing from the word. Stimulates language and vocabulary.',             tag: 'Language',  tags: ['Language', 'Vocabulary'],   color: 'var(--word-color)',   bg: 'var(--word-bg)',   route: 'words' },
}
const DIFF = { easy: 'Easy', medium: 'Medium', hard: 'Hard' }
const MULT = { easy: 1, medium: 1.5, hard: 2 }

const LEVELS = {
  memory: [
    { key: 'easy',   detail: '4 pairs · 2 minutes',    pairs: 4, time: 120 },
    { key: 'medium', detail: '6 pairs · 90 seconds',   pairs: 6, time: 90 },
    { key: 'hard',   detail: '8 pairs · 60 seconds',   pairs: 8, time: 60 },
  ],
  math: [
    { key: 'easy',   detail: '5 questions · + and − up to 10 · 20s each', n: 5,  time: 20 },
    { key: 'medium', detail: '8 questions · +, −, × · 15s each',          n: 8,  time: 15 },
    { key: 'hard',   detail: '10 questions · all operations · 10s each',  n: 10, time: 10 },
  ],
  face: [
    { key: 'easy',   detail: '2 choices · 4 rounds · 30s each', opts: 2, n: 4, time: 30 },
    { key: 'medium', detail: '4 choices · 6 rounds · 20s each', opts: 4, n: 6, time: 20 },
    { key: 'hard',   detail: '6 choices · 8 rounds · 15s each', opts: 6, n: 8, time: 15 },
  ],
  word: [
    { key: 'easy',   detail: '1 missing letter · with a hint · 30s each',  blanks: 1, hint: true,  n: 6, time: 30 },
    { key: 'medium', detail: '2 missing letters · with a hint · 20s each', blanks: 2, hint: true,  n: 6, time: 20 },
    { key: 'hard',   detail: '3 missing letters · no hint · 15s each',     blanks: 3, hint: false, n: 6, time: 15 },
  ],
}

const MEMORY_ITEMS = ['🌻', '🍎', '🐱', '🎈', '⛵', '🌙', '🎵', '🦋', '🍋', '🏠']
const WORDS = [
  { w: 'GARDEN',   hint: 'Where flowers and vegetables grow' },
  { w: 'KITCHEN',  hint: 'The room where meals are cooked' },
  { w: 'SUNSHINE', hint: 'Warm light from the sky' },
  { w: 'TEACUP',   hint: 'You drink a hot drink from it' },
  { w: 'BICYCLE',  hint: 'Two wheels and pedals' },
  { w: 'PIANO',    hint: 'An instrument with black and white keys' },
  { w: 'BUTTERFLY',hint: 'An insect with colourful wings' },
  { w: 'BIRTHDAY', hint: 'A yearly celebration with cake' },
  { w: 'LIBRARY',  hint: 'A place full of books to borrow' },
  { w: 'ORANGE',   hint: 'A citrus fruit and a colour' },
  { w: 'WINDOW',   hint: 'Glass you look through' },
  { w: 'BLANKET',  hint: 'Keeps you warm in bed' },
]
const RELATIONSHIPS = ['Son', 'Daughter', 'Grandson', 'Granddaughter', 'Husband', 'Wife', 'Brother', 'Sister', 'Nephew', 'Niece', 'Friend', 'Other']
const MOODS = [['😄', 'Great'], ['🙂', 'Good'], ['😐', 'Okay'], ['😔', 'Low'], ['😣', 'Unwell']]
const TEXT_SIZES = [{ label: 'A', px: 17, name: 'Standard' }, { label: 'A+', px: 19, name: 'Large' }, { label: 'A++', px: 21, name: 'Extra large' }]
const MOVES = ['Walk', 'Stretching', 'Gardening', 'Dancing', 'Water aerobics', 'Rest day']

/* ---------- Mock state ---------- */
const now = Date.now()
const DAY = 86400000
const S = {
  user: null,
  route: 'home',
  family: [
    { id: 1, name: 'Anna Collins',   relationship: 'Daughter',      emoji: '👩',    bg: 'var(--face-bg)' },
    { id: 2, name: 'Robert Collins', relationship: 'Husband',       emoji: '👴',    bg: 'var(--memory-bg)' },
    { id: 3, name: 'Lucas Collins',  relationship: 'Grandson',      emoji: '👦',    bg: 'var(--math-bg)' },
    { id: 4, name: 'Sophie Collins', relationship: 'Granddaughter', emoji: '👧',    bg: 'var(--word-bg)' },
    { id: 5, name: 'Mark Collins',   relationship: 'Son',           emoji: '🧔',    bg: 'var(--gray-100)' },
    { id: 6, name: 'Helen Parker',   relationship: 'Sister',        emoji: '👵',    bg: 'var(--face-bg)' },
  ],
  history: [
    { id: 1, game: 'memory', diff: 'easy',   score: 420, correct: 4, total: 4,  dur: 64,  at: now - 0.2 * DAY },
    { id: 2, game: 'math',   diff: 'medium', score: 780, correct: 7, total: 8,  dur: 98,  at: now - 1 * DAY },
    { id: 3, game: 'word',   diff: 'easy',   score: 510, correct: 5, total: 6,  dur: 120, at: now - 1.3 * DAY },
    { id: 4, game: 'face',   diff: 'medium', score: 690, correct: 6, total: 6,  dur: 74,  at: now - 2 * DAY },
    { id: 5, game: 'memory', diff: 'medium', score: 560, correct: 6, total: 6,  dur: 81,  at: now - 3 * DAY },
    { id: 6, game: 'math',   diff: 'easy',   score: 450, correct: 5, total: 5,  dur: 55,  at: now - 4 * DAY },
    { id: 7, game: 'word',   diff: 'medium', score: 480, correct: 4, total: 6,  dur: 102, at: now - 5 * DAY },
    { id: 8, game: 'face',   diff: 'easy',   score: 380, correct: 4, total: 4,  dur: 40,  at: now - 6 * DAY },
  ],
  health: {
    water: 5, sleep: 7, mood: 1, moves: ['Walk'],
    week: [ ['🙂', 6], ['😄', 8], ['🙂', 7], ['😐', 5], ['🙂', 7], ['😄', 8] ],
  },
  progressTab: 'best',
  textSize: 0,
  mini: null,
  famForm: null,
  confirmDel: null,
  play: null,
}
let timerId = null
let nextId = 100

/* ---------- Helpers ---------- */
const $ = s => document.querySelector(s)
const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]))
const shuffle = a => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]] } return a }
const rand = (a, b) => a + Math.floor(Math.random() * (b - a + 1))
const fmt = n => n.toLocaleString('en-US')
const firstName = () => (S.user?.name || 'Friend').split(' ')[0]
const summary = () => {
  const days = new Set(S.history.map(h => new Date(h.at).toDateString()))
  let streak = 0
  for (let d = 0; d < 60; d++) { if (days.has(new Date(now - d * DAY).toDateString())) streak++; else if (d > 0) break }
  return { sessions: S.history.length, points: S.history.reduce((a, h) => a + h.score, 0), streak: Math.max(streak, 1) + 4 }
}
const bestScores = () => {
  const map = {}
  for (const h of S.history) { const k = h.game + h.diff; if (!map[k] || map[k].score < h.score) map[k] = h }
  return Object.values(map).sort((a, b) => b.score - a.score)
}
const suggestDiff = game => {
  const last = S.history.filter(h => h.game === game).slice(0, 3)
  if (!last.length) return 'easy'
  const acc = last.reduce((a, h) => a + h.correct / h.total, 0) / last.length
  const top = last[0].diff
  if (acc >= .85) return top === 'easy' ? 'medium' : 'hard'
  if (acc < .5) return top === 'hard' ? 'medium' : 'easy'
  return top
}
function toast(msg) {
  const t = document.createElement('div'); t.className = 'toast pop'; t.textContent = msg
  document.body.appendChild(t); setTimeout(() => t.remove(), 2200)
}
function confetti() {
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return
  const box = document.createElement('div'); box.className = 'confetti'
  const colors = ['var(--memory-color)', 'var(--math-color)', 'var(--face-color)', 'var(--word-color)']
  box.innerHTML = Array.from({ length: 60 }, (_, i) => `<i style="left:${Math.random() * 100}%;background:${colors[i % 4]};animation-delay:${Math.random() * .5}s;transform:rotate(${rand(0, 180)}deg)"></i>`).join('')
  document.body.appendChild(box); setTimeout(() => box.remove(), 2600)
}
function stopTimer() { if (timerId) { clearInterval(timerId); timerId = null } }

/* ---------- Router ---------- */
const APP_ROUTES = ['dashboard', 'games', 'health', 'family', 'progress', 'memory', 'math', 'faces', 'words']
function go(route) {
  stopTimer()
  if (APP_ROUTES.includes(route) && !S.user) S.user = { name: 'Margaret Collins', email: 'margaret@example.com' }
  S.route = route
  if (['memory', 'math', 'faces', 'words'].includes(route)) S.play = { phase: 'pick' }
  S.famForm = null; S.confirmDel = null
  try { history.replaceState(null, '', '#' + route) } catch (e) {}
  render()
  window.scrollTo(0, 0)
}
function onClick(e) {
  const el = e.target.closest('[data-go]')
  if (el) { e.preventDefault(); go(el.dataset.go) }
}

function render() {
  const r = S.route
  let html
  if (r === 'home') html = landing()
  else if (r === 'signin' || r === 'signup') html = auth(r)
  else html = shell(page(r))
  document.documentElement.style.fontSize = TEXT_SIZES[S.textSize].px + 'px'
  root.innerHTML = html
  afterRender()
}
function page(r) {
  switch (r) {
    case 'dashboard': return dashboard()
    case 'games': return gamesList()
    case 'health': return health()
    case 'family': return familyPage()
    case 'progress': return progress()
    case 'memory': return gameView('memory')
    case 'math': return gameView('math')
    case 'faces': return gameView('face')
    case 'words': return gameView('word')
  }
  return dashboard()
}

/* ---------- Landing ---------- */
function landing() {
  const g = Object.values(GAMES)
  const features = [
    ['🎯', 'Adaptive difficulty', 'The app learns from your results and adjusts the level automatically.'],
    ['👨‍👩‍👧', 'Games with your family', 'Add photos and names of loved ones for a game that is truly yours.'],
    ['💚', 'Whole-person health', 'Track water, sleep, movement and mood. Mind and body together.'],
    ['📊', 'Family report', 'Your family receives a weekly summary of your progress.'],
  ]
  return `
  <main>
    <nav class="l-nav wrap"><div class="l-nav-in">
      <div class="logo"><div class="logo-icon">🧠</div><span class="logo-text">CogniMente</span><span class="proto-chip">Prototype</span></div>
      <div class="l-links">
        <button class="l-link" data-go="signin">Sign in</button>
        <button class="l-cta" data-go="signup">Start for free</button>
      </div>
    </div></nav>

    <section class="wrap"><div class="l-hero">
      <div class="l-hero-copy">
        <div class="badge fade-up">🌿 Brain training for older adults</div>
        <h1 class="l-title fade-up" style="animation-delay:.08s">Exercise your mind.<br><em>Live better.</em></h1>
        <p class="l-desc fade-up" style="animation-delay:.14s">Simple games designed especially for older adults. Memory, reasoning and recognition, at your own pace, every day.</p>
        <div class="l-actions fade-up" style="animation-delay:.2s">
          <button class="btn-black" data-go="signup">Start now, it's free</button>
          <button class="btn-ghost" data-go="signin">I already have an account</button>
        </div>
        <div class="l-stats fade-up" style="animation-delay:.28s">
          ${[['4', 'brain games'], ['3', 'difficulty levels'], ['100%', 'free']].map(([v, l]) => `<div><div class="l-stat-val">${v}</div><div class="l-stat-label">${l}</div></div>`).join('')}
        </div>
      </div>
      ${miniGame()}
    </div></section>

    <section class="wrap"><div class="l-section">
      <div class="tag">The games</div>
      <h2 class="l-h2">4 games to stimulate<br>every area of the mind</h2>
      <div class="grid-2">
        ${g.map((x, i) => `<div class="l-game card fade-up" style="animation-delay:${i * .07}s">
          <div class="l-game-icon">${x.icon}</div><div class="l-game-name">${x.name}</div><div class="l-game-desc">${x.long}</div></div>`).join('')}
      </div>
    </div></section>

    <section class="l-features-band wrap"><div class="l-section">
      <div class="tag">How it works</div>
      <h2 class="l-h2">Ten minutes a day,<br>three simple steps</h2>
      <div class="steps">
        ${[['Create your profile', 'Sign up in under a minute. Add a few family photos so the games feel personal.'],
           ['Play a short session', 'One or two games a day. The difficulty adjusts to how you are doing.'],
           ['Your family stays close', 'Every Sunday, loved ones get a summary of your progress, mood and habits.']]
          .map(([t, d], i) => `<div class="step card"><div class="step-n">${i + 1}</div><div class="step-title">${t}</div><div class="step-desc">${d}</div></div>`).join('')}
      </div>
    </div></section>

    <section class="wrap"><div class="l-section">
      <div class="tag">Why CogniMente</div>
      <h2 class="l-h2">Made with care,<br>down to every detail</h2>
      <div class="grid-4">
        ${features.map(([i, t, d]) => `<div class="l-feature card"><div class="l-feature-icon">${i}</div><div class="l-feature-title">${t}</div><div class="l-feature-desc">${d}</div></div>`).join('')}
      </div>
    </div></section>

    <section class="l-features-band wrap"><div class="l-section report-split">
      <div class="report-copy">
        <div class="tag" style="align-self:flex-start;margin:0">For families and caregivers</div>
        <h2 class="l-h2" style="margin:0">Peace of mind,<br>delivered every Sunday</h2>
        <p>Children and caregivers often live far away. CogniMente sends them a short, friendly report so they know how their loved one is doing, without asking every day.</p>
        <ul class="report-list">
          <li>Days played and total practice time</li>
          <li>Accuracy trends in each game</li>
          <li>Mood, sleep and water from the daily check-in</li>
          <li>A gentle heads-up if something changes</li>
        </ul>
      </div>
      ${reportMail()}
    </div></section>

    <section class="wrap"><div class="l-cta-box">
      <h2 class="l-cta-title">Start today.</h2>
      <p class="l-cta-desc">Free, simple and made for you.</p>
      <button class="btn-white" data-go="signup">Create my account</button>
    </div></section>

    <footer class="l-footer wrap">Made with ❤️ to care for the minds of our elders · CogniMente 2026<br>Prototype for presentation · all data shown is example data</footer>
  </main>`
}
function miniGame() {
  if (!S.mini) S.mini = { cards: shuffle(['🌻', '🌻', '🍎', '🍎', '🐱', '🐱']).map((v, i) => ({ i, v, flipped: false, matched: false })), sel: [], found: 0, locked: false }
  const m = S.mini, done = m.found === 3
  return `<div class="try card fade-up" style="animation-delay:.2s">
    <span class="try-float">Try it now</span>
    <div class="try-head"><div><div class="try-title">🃏 Memory Match</div><div class="try-sub">Find the 3 pairs</div></div><div class="try-sub">${m.found}/3</div></div>
    <div class="try-grid mb-grid" style="grid-template-columns:repeat(3,minmax(0,1fr))">${m.cards.map(c => `<button class="mb-card ${c.flipped || c.matched ? 'flipped' : ''} ${c.matched ? 'matched' : ''}" data-mini="${c.i}" aria-label="${c.flipped || c.matched ? c.v : 'Face-down card'}">
      <div class="mb-inner"><div class="mb-face mb-front">?</div><div class="mb-face mb-back">${c.v}</div></div></button>`).join('')}</div>
    <div class="try-done">${done ? '🎉 Well done! That is one CogniMente exercise.' : ''}</div>
    ${done ? '<button class="try-reset" id="mini-reset">Play again</button>' : ''}
  </div>`
}
function flipMini(i) {
  const m = S.mini, c = m.cards[i]
  if (m.locked || c.flipped || c.matched) return
  c.flipped = true; m.sel.push(i)
  if (m.sel.length === 2) {
    const [a, b] = m.sel.map(k => m.cards[k])
    if (a.v === b.v) { a.matched = b.matched = true; m.sel = []; m.found++ }
    else { m.locked = true; setTimeout(() => { a.flipped = b.flipped = false; m.sel = []; m.locked = false; if (S.route === 'home') render() }, 800) }
  }
  render()
}
function reportMail() {
  return `<div class="mail card">
    <div class="mail-head"><strong>Margaret's week with CogniMente</strong><span>To: Anna Collins · Sunday, 8:00 AM</span></div>
    <div class="mail-body">
      <div class="mail-hi">Hi Anna, your mom had a great week 🌿</div>
      <div class="mail-kpis">
        <div class="mail-kpi"><b>6/7</b><span>days played</span></div>
        <div class="mail-kpi"><b>84%</b><span>accuracy</span></div>
        <div class="mail-kpi"><b>🙂</b><span>usual mood</span></div>
      </div>
      <div class="mail-bars" aria-hidden="true">${[40, 70, 55, 0, 80, 65, 95].map((h, i) => `<i class="${i === 6 ? 'now' : ''}" style="height:${Math.max(h, 6)}%"></i>`).join('')}</div>
      <div class="mail-note">💡 Math accuracy went up 12% this week. She moved up to <strong>Medium</strong> in Quick Math.</div>
    </div>
  </div>`
}

/* ---------- Auth ---------- */
function auth(kind) {
  const up = kind === 'signup'
  return `
  <main class="auth-page wrap">
    <form class="auth-card card fade-up" id="auth-form" novalidate>
      <button type="button" class="auth-back" data-go="home">← Back to home</button>
      <div class="logo auth-logo"><div class="logo-icon">🧠</div><span class="logo-text" style="font-size:1.4rem">CogniMente</span></div>
      <h1 class="auth-title">${up ? 'Create a free account' : 'Welcome back!'}</h1>
      <p class="auth-sub">${up ? 'Start your exercises today.' : 'Sign in to continue your exercises.'}</p>
      ${up ? `<div class="field"><label class="label" for="a-name">Your name</label><input id="a-name" class="input-field" placeholder="e.g. Margaret Collins" value="Margaret Collins"></div>` : ''}
      <div class="field"><label class="label" for="a-email">Email</label><input id="a-email" type="email" class="input-field" placeholder="you@email.com" value="margaret@example.com" autocomplete="off"></div>
      <div class="field"><label class="label" for="a-pass">Password</label><input id="a-pass" type="password" class="input-field" placeholder="${up ? 'At least 6 characters' : '••••••••'}" autocomplete="off"></div>
      <div id="a-error" hidden></div>
      <button type="submit" class="btn-primary" id="a-submit">${up ? 'Create free account' : 'Sign in'}</button>
      <p class="auth-switch">${up ? 'Already have an account?' : "Don't have an account?"} <button type="button" class="link" data-go="${up ? 'signin' : 'signup'}">${up ? 'Sign in' : 'Sign up for free'}</button></p>
      <p class="auth-switch" style="font-size:.78rem">Demo: any password with 6+ characters works. Nothing is sent anywhere.</p>
    </form>
  </main>`
}
function bindAuth() {
  const f = $('#auth-form'); if (!f) return
  f.addEventListener('submit', e => {
    e.preventDefault()
    const up = S.route === 'signup'
    const pass = $('#a-pass').value, email = $('#a-email').value.trim()
    const err = $('#a-error')
    let msg = ''
    if (!email.includes('@')) msg = 'Enter a valid email address, like you@email.com.'
    else if (pass.length < 6) msg = 'Your password needs at least 6 characters.'
    if (msg) { err.hidden = false; err.className = 'auth-error shake'; err.textContent = msg; return }
    const btn = $('#a-submit'); btn.disabled = true; btn.textContent = up ? 'Creating account...' : 'Signing in...'
    setTimeout(() => {
      S.user = { name: up ? ($('#a-name').value.trim() || 'Margaret Collins') : 'Margaret Collins', email }
      go('dashboard')
    }, 600)
  })
}

/* ---------- Shell ---------- */
function shell(content) {
  const items = [['dashboard', 'Home', '🏠'], ['games', 'Games', '🎮'], ['health', 'Health', '💚'], ['family', 'Family', '👨‍👩‍👧'], ['progress', 'Progress', '📊']]
  const gameRoutes = ['memory', 'math', 'faces', 'words']
  const active = k => S.route === k || (k === 'games' && gameRoutes.includes(S.route))
  return `
  <header class="navbar wrap"><div class="navbar-in">
    <button class="logo" data-go="dashboard" style="min-height:0"><div class="logo-icon">🧠</div><span class="logo-text">CogniMente</span></button>
    <nav class="nb-links">${items.map(([k, l]) => `<button class="nb-link ${active(k) ? 'active' : ''}" data-go="${k}">${l}</button>`).join('')}</nav>
    <div class="nb-user"><div class="avatar">${esc(firstName().charAt(0).toUpperCase())}</div>
      <div><div class="nb-name">${esc(firstName())}</div><button class="nb-logout" data-go="home">Sign out</button></div></div>
  </div></header>
  <main class="app-main wrap">${content}<p class="proto-note">CogniMente prototype · example data, nothing is saved</p></main>
  <nav class="nb-mobile">${items.map(([k, l, i]) => `<button class="nb-m-item ${active(k) ? 'active' : ''}" data-go="${k}"><span class="nb-m-icon">${i}</span><span class="nb-m-label">${l}</span></button>`).join('')}</nav>`
}

/* ---------- Dashboard ---------- */
function dashboard() {
  const s = summary(), best = bestScores()
  const h = new Date().getHours()
  const greeting = h < 12 ? 'Good morning' : h < 18 ? 'Good afternoon' : 'Good evening'
  return `<div class="stack">
    <section class="dash-hero fade-up">
      <div><p class="dash-greeting">${greeting} 👋</p><h1 class="dash-title">${esc(firstName())},<br>ready to exercise your mind?</h1></div>
      <div class="streak pop"><span style="font-size:1.4rem">🔥</span><div><div class="streak-num">${s.streak}</div><div class="streak-label">day streak</div></div></div>
    </section>
    ${todayPlan()}
    <div class="stats-3 fade-up" style="animation-delay:.08s">
      <div class="stat card"><div class="stat-icon">🎮</div><div class="stat-val">${s.sessions}</div><div class="stat-label">Sessions</div></div>
      <div class="stat card accent"><div class="stat-icon">⭐</div><div class="stat-val">${fmt(s.points)}</div><div class="stat-label">Total points</div></div>
      <div class="stat card"><div class="stat-icon">🔥</div><div class="stat-val">${s.streak}</div><div class="stat-label">Days in a row</div></div>
    </div>
    <section class="fade-up" style="animation-delay:.14s;display:flex;flex-direction:column;gap:1rem">
      <div class="section-label">Available games</div>
      <div class="grid-2">
        ${Object.entries(GAMES).map(([id, g]) => {
          const b = best.find(x => x.game === id)
          return `<button class="game-tile card" data-go="${g.route}">
            <div class="gt-top"><span class="gt-icon">${g.icon}</span><span class="gt-tag">${g.tag}</span></div>
            <div class="gt-name">${g.name}</div><div class="gt-desc">${g.short}</div>
            ${b ? `<div class="gt-best">Best: ${b.score} pts</div>` : ''}<span class="arrow">→</span></button>`
        }).join('')}
      </div>
    </section>
    <div class="fade-up" style="animation-delay:.22s;display:flex;flex-direction:column;gap:10px">
      <button class="row-card" data-go="health"><span class="rc-icon">💚</span><div><div class="rc-title">Log today's health</div><div class="rc-desc">Water, sleep, mood and movement</div></div><span class="arrow-in">→</span></button>
      <button class="row-card" data-go="family"><span class="rc-icon">👨‍👩‍👧</span><div><div class="rc-title">My family</div><div class="rc-desc">Add photos and names</div></div><span class="arrow-in">→</span></button>
    </div>
    <div class="textsize card fade-up" style="animation-delay:.26s">
      <div><div class="ts-label">Text size</div><div class="ts-sub">${TEXT_SIZES[S.textSize].name}. Easier reading on any screen.</div></div>
      <div class="ts-opts" role="group" aria-label="Text size">${TEXT_SIZES.map((t, i) => `<button class="ts-opt ${i === S.textSize ? 'active' : ''}" data-ts="${i}" aria-pressed="${i === S.textSize}">${t.label}</button>`).join('')}</div>
    </div>
  </div>`
}
function todayPlan() {
  const goal = 3
  const today = S.history.filter(h => new Date(h.at).toDateString() === new Date().toDateString())
  const done = Math.min(goal, today.length)
  const playedIds = today.map(h => h.game)
  const nextGame = ['math', 'word', 'face', 'memory'].find(id => !playedIds.includes(id)) || 'memory'
  const g = GAMES[nextGame], diff = suggestDiff(nextGame)
  const C = 2 * Math.PI * 32, off = C * (1 - done / goal)
  return `<div class="today card fade-up" style="animation-delay:.05s">
    <div class="ring"><svg viewBox="0 0 76 76" aria-hidden="true"><circle cx="38" cy="38" r="32" fill="none" stroke="var(--surface)" stroke-width="8"/><circle cx="38" cy="38" r="32" fill="none" stroke="var(--accent)" stroke-width="8" stroke-linecap="round" stroke-dasharray="${C}" stroke-dashoffset="${off}"/></svg><div class="ring-txt">${done}/${goal}</div></div>
    <div><div class="today-label">Today's plan</div>
      <div class="today-title">${done >= goal ? 'Daily goal complete! 🎉' : `Next up: ${g.icon} ${g.name}`}</div>
      <div class="today-desc">${done >= goal ? 'Great job. Come back tomorrow to keep your streak.' : `${DIFF[diff]} level, picked from your recent results. About 3 minutes.`}</div></div>
    ${done >= goal ? '' : `<button class="today-btn" data-go="${g.route}">Start</button>`}
  </div>`
}

/* ---------- Games list ---------- */
function gamesList() {
  return `<div class="stack">
    <div class="fade-up"><h1 class="page-title">🎮 Games</h1><p class="page-sub">Choose a game to begin. Each one exercises a different area of your mind.</p></div>
    <div style="display:flex;flex-direction:column;gap:12px">
      ${Object.values(GAMES).map((g, i) => `<button class="jogo-card card fade-up" style="animation-delay:${i * .07}s;--gc:${g.color}" data-go="${g.route}">
        <div class="jogo-icon" style="background:${g.bg}">${g.icon}</div>
        <div class="jogo-body"><div class="jogo-name">${g.name}</div><div class="jogo-desc">${g.long}</div>
          <div class="chips">${g.tags.map(t => `<span class="chip" style="background:${g.bg};color:${g.color}">${t}</span>`).join('')}</div></div>
        <span style="color:var(--gray-300);font-size:1.2rem">→</span></button>`).join('')}
    </div>
  </div>`
}

/* ---------- Game views ---------- */
function gameView(id) {
  const p = S.play, g = GAMES[id]
  if (p.phase === 'pick') return picker(id)
  if (p.phase === 'result') return result(id)
  if (id === 'memory') return memoryBoard()
  if (id === 'math') return mathBoard()
  if (id === 'face') return faceBoard()
  if (id === 'word') return wordBoard()
}
function picker(id) {
  const g = GAMES[id], sug = suggestDiff(id)
  const desc = { memory: 'Find every pair of matching pictures before time runs out.', math: 'Answer each sum before the timer ends.', face: 'Look at the photo and choose the right family member.', word: 'Find the missing letters to complete the word.' }[id]
  return `<div class="stack fade-up" style="gap:1.4rem;max-width:620px;margin:0 auto">
    <button class="back" data-go="games">← Back</button>
    <div class="dp-header" style="background:${g.bg};border-color:${g.color}">
      <div class="dp-icon">${g.icon}</div><h1 class="dp-title">${g.name}</h1><p class="dp-desc">${desc}</p></div>
    <h2 style="font-size:1.5rem">Choose the difficulty</h2>
    <div class="dp-levels">
      ${LEVELS[id].map((l, i) => `<button class="dp-level fade-up" style="animation-delay:${i * .07}s;--lc:${g.color}" data-start="${l.key}">
        <div class="dp-left"><span class="dp-badge" style="background:${g.bg};color:${g.color}">${DIFF[l.key]}</span><span class="dp-detail">${l.detail}</span>
        ${l.key === sug ? '<span class="dp-suggest">Suggested for you</span>' : ''}</div>
        <span style="color:${g.color};font-size:1.1rem">→</span></button>`).join('')}
    </div>
    ${id === 'face' ? `<p class="hint-text">Uses the ${S.family.length} people on your Family page.</p>` : ''}
  </div>`
}
function timerHtml(sec) {
  const m = String(Math.floor(sec / 60)).padStart(2, '0'), s = String(sec % 60).padStart(2, '0')
  const urgent = sec <= 5 || (S.play.level.time > 30 && sec <= 15)
  return `<div class="timer ${urgent ? 'urgent' : ''}" id="timer" aria-live="off">${urgent ? '⚠️' : '⏱️'} ${m}:${s}</div>`
}
function startCountdown(sec, onExpire) {
  stopTimer()
  S.play.left = sec
  timerId = setInterval(() => {
    S.play.left--
    const t = $('#timer'); if (t) t.outerHTML = timerHtml(Math.max(0, S.play.left))
    if (S.play.left <= 0) { stopTimer(); onExpire() }
  }, 1000)
}
function startGame(id, diffKey) {
  const level = LEVELS[id].find(l => l.key === diffKey)
  if (id === 'face' && S.family.length < 2) { toast('Add at least 2 family members on the Family page first.'); return }
  const p = S.play = { phase: 'playing', diff: diffKey, level, correct: 0, idx: 0, started: Date.now(), locked: false }
  if (id === 'memory') {
    const items = shuffle(MEMORY_ITEMS).slice(0, level.pairs)
    p.cards = shuffle([...items, ...items]).map((v, i) => ({ i, v, flipped: false, matched: false }))
    p.sel = []; p.total = level.pairs
    render(); startCountdown(level.time, () => finishGame('memory'))
    return
  }
  p.total = level.n
  if (id === 'math') p.qs = Array.from({ length: level.n }, () => makeMath(diffKey))
  if (id === 'face') p.qs = makeFaces(level)
  if (id === 'word') p.qs = shuffle(WORDS).slice(0, level.n).map(w => makeWord(w, level.blanks))
  render(); startQuestionTimer(id)
}
function startQuestionTimer(id) { startCountdown(S.play.level.time, () => answer(id, null)) }

function makeMath(diff) {
  let a, b, op, ans
  const ops = diff === 'easy' ? ['+', '−'] : diff === 'medium' ? ['+', '−', '×'] : ['+', '−', '×', '÷']
  op = ops[rand(0, ops.length - 1)]
  const max = diff === 'easy' ? 10 : diff === 'medium' ? 20 : 50
  if (op === '+') { a = rand(1, max); b = rand(1, max); ans = a + b }
  if (op === '−') { a = rand(2, max); b = rand(1, a); ans = a - b }
  if (op === '×') { a = rand(2, diff === 'medium' ? 9 : 12); b = rand(2, 9); ans = a * b }
  if (op === '÷') { b = rand(2, 9); ans = rand(2, 10); a = b * ans }
  const opts = new Set([ans])
  while (opts.size < 4) { const d = ans + rand(-6, 6); if (d >= 0 && d !== ans) opts.add(d) }
  return { expr: `${a} ${op} ${b}`, ans, opts: shuffle([...opts]) }
}
function makeFaces(level) {
  const people = S.family
  const qs = []
  for (let i = 0; i < level.n; i++) {
    const target = people[i % people.length]
    const others = shuffle(people.filter(p => p.id !== target.id)).slice(0, Math.min(level.opts, people.length) - 1)
    qs.push({ person: target, ans: target.name.split(' ')[0], opts: shuffle([target, ...others]).map(p => p.name.split(' ')[0]) })
  }
  return shuffle(qs)
}
function makeWord(entry, blanks) {
  const w = entry.w
  const idxs = shuffle([...Array(w.length).keys()].filter(i => i > 0)).slice(0, blanks).sort((a, b) => a - b)
  const ans = idxs.map(i => w[i]).join('')
  const alpha = 'ABCDEFGHIJKLMNOPRSTUVWY'
  const opts = new Set([ans])
  while (opts.size < 4) { let s = ''; for (let k = 0; k < blanks; k++) s += alpha[rand(0, alpha.length - 1)]; opts.add(s) }
  return { word: w, hint: entry.hint, idxs, ans, opts: shuffle([...opts]) }
}

function topbar(id, label, sub) {
  const g = GAMES[id], p = S.play
  const pct = id === 'memory' ? (p.correct / p.total) * 100 : (p.idx / p.total) * 100
  return `<div class="topbar"><div><div class="tb-title">${g.icon} ${label}</div><div class="tb-sub">${sub}</div></div>${timerHtml(p.left ?? p.level.time)}</div>
    <div class="progress"><div class="progress-fill" style="width:${pct}%;background:${g.color}"></div></div>`
}
function feedbackHtml() {
  const f = S.play.fb
  if (!f) return `<div class="feedback"></div>`
  return `<div class="feedback ${f.ok ? 'good' : 'bad'}">${f.ok ? 'Correct! Well done 👏' : f.timeout ? `Time's up. The answer was ${esc(f.ans)}.` : `Not quite. The answer was ${esc(f.ans)}.`}</div>`
}
function optClass(o) {
  const f = S.play.fb; if (!f) return ''
  if (String(o) === String(f.ans)) return 'good'
  if (String(o) === String(f.pick)) return 'bad'
  return ''
}

function memoryBoard() {
  const p = S.play
  return `<div class="play fade-up">
    ${topbar('memory', 'Memory Match', `Pairs found: ${p.correct}/${p.total}`)}
    <div class="mb-grid">${p.cards.map(c => `<button class="mb-card ${c.flipped || c.matched ? 'flipped' : ''} ${c.matched ? 'matched' : ''}" data-card="${c.i}" aria-label="${c.flipped || c.matched ? c.v : 'Face-down card'}">
      <div class="mb-inner"><div class="mb-face mb-front">?</div><div class="mb-face mb-back">${c.v}</div></div></button>`).join('')}</div>
    <p class="hint-text">Tap the cards to turn them over and find the matching pairs</p>
  </div>`
}
function flipCard(i) {
  const p = S.play, c = p.cards[i]
  if (p.locked || c.flipped || c.matched) return
  c.flipped = true; p.sel.push(i)
  if (p.sel.length === 2) {
    const [a, b] = p.sel.map(k => p.cards[k])
    if (a.v === b.v) {
      a.matched = b.matched = true; p.sel = []; p.correct++
      if (p.correct === p.total) { render(); stopTimer(); setTimeout(() => finishGame('memory'), 600); return }
    } else {
      p.locked = true
      setTimeout(() => { a.flipped = b.flipped = false; p.sel = []; p.locked = false; if (S.play === p) render() }, 900)
    }
  }
  render()
}

function mathBoard() {
  const p = S.play, q = p.qs[p.idx]
  return `<div class="play fade-up">
    ${topbar('math', 'Quick Math', `Question ${p.idx + 1} of ${p.total}`)}
    <div class="math-card card pop"><div class="math-expr">${q.expr}</div><div class="math-eq">= ?</div></div>
    <div class="opt-grid">${q.opts.map(o => `<button class="opt ${optClass(o)}" data-ans="${o}" ${p.fb ? 'disabled' : ''}>${o}</button>`).join('')}</div>
    ${feedbackHtml()}
  </div>`
}
function faceBoard() {
  const p = S.play, q = p.qs[p.idx], per = q.person
  return `<div class="play fade-up">
    ${topbar('face', 'Who is this?', `Round ${p.idx + 1} of ${p.total}`)}
    <div class="card pop" style="padding:1.2rem"><div class="face-photo" style="background:${per.bg}">${per.photo ? `<img src="${per.photo}" alt="Family member">` : per.emoji}</div></div>
    <div class="opt-grid">${q.opts.map(o => `<button class="opt name ${optClass(o)}" data-ans="${esc(o)}" ${p.fb ? 'disabled' : ''}>${esc(o)}</button>`).join('')}</div>
    ${feedbackHtml()}
  </div>`
}
function wordBoard() {
  const p = S.play, q = p.qs[p.idx], f = p.fb
  let k = 0
  const chars = q.word.split('').map((ch, i) => {
    if (!q.idxs.includes(i)) return `<div class="word-char">${ch}</div>`
    const shown = f ? (f.pick ? f.pick[k] : q.ans[k]) : '?'
    const cls = f ? (f.ok ? 'filled-good' : 'filled-bad') : ''
    k++
    return `<div class="word-char blank ${cls}">${shown}</div>`
  }).join('')
  return `<div class="play fade-up">
    ${topbar('word', 'Fill the Word', `Question ${p.idx + 1} of ${p.total}`)}
    ${p.level.hint ? `<div class="word-hint"><strong>💡 Hint:</strong> ${q.hint}</div>` : ''}
    <div class="word-card card pop"><div class="word-chars">${chars}</div></div>
    <div class="opt-grid">${q.opts.map(o => `<button class="opt ${optClass(o)}" data-ans="${o}" ${p.fb ? 'disabled' : ''}>${o.split('').join(' ')}</button>`).join('')}</div>
    ${feedbackHtml()}
  </div>`
}
function answer(id, pick) {
  const p = S.play; if (!p || p.fb || p.phase !== 'playing') return
  stopTimer()
  const q = p.qs[p.idx]
  const ok = pick !== null && String(pick) === String(q.ans)
  if (ok) p.correct++
  p.fb = { ok, pick, ans: q.ans, timeout: pick === null }
  render()
  setTimeout(() => {
    if (S.play !== p) return
    p.fb = null; p.idx++
    if (p.idx >= p.total) finishGame(id)
    else { p.left = p.level.time; render(); startQuestionTimer(id) }
  }, ok ? 800 : 1500)
}
function finishGame(id) {
  stopTimer()
  const p = S.play
  const dur = Math.round((Date.now() - p.started) / 1000)
  const acc = p.correct / p.total
  const timeBonus = id === 'memory' ? Math.max(0, p.left || 0) * 2 : Math.max(0, p.total * p.level.time - dur)
  const score = Math.round((p.correct * 80 + timeBonus) * MULT[p.diff])
  S.history.unshift({ id: nextId++, game: id, diff: p.diff, score, correct: p.correct, total: p.total, dur, at: Date.now() })
  S.play = { phase: 'result', score, correct: p.correct, total: p.total, acc, diff: p.diff }
  render()
  if (acc >= .8) confetti()
}
function result(id) {
  const r = S.play, g = GAMES[id], acc = Math.round(r.acc * 100)
  const emoji = acc >= 80 ? '🎉' : acc >= 50 ? '👏' : '💪'
  const msg = acc >= 80 ? 'Excellent! You did really well!' : acc >= 50 ? 'Good job! Keep practising.' : "Keep going, you'll get better every time!"
  const next = suggestDiff(id)
  return `<div class="result card pop">
    <div class="result-emoji">${emoji}</div>
    <h1 class="result-title">Game over!</h1>
    <p class="result-game">${g.icon} ${g.name} · ${DIFF[r.diff]}</p>
    <p class="result-msg">${msg}</p>
    <div class="result-stats">
      <div><div class="rs-val">${r.score}</div><div class="rs-label">points</div></div><div class="rs-div"></div>
      <div><div class="rs-val">${r.correct}/${r.total}</div><div class="rs-label">correct</div></div><div class="rs-div"></div>
      <div><div class="rs-val">${acc}%</div><div class="rs-label">accuracy</div></div>
    </div>
    ${next !== r.diff ? `<p class="hint-text">🎯 Next time we suggest <strong>${DIFF[next]}</strong>.</p>` : ''}
    <div class="result-actions">
      <button class="btn-primary" id="again">Play again</button>
      <button class="btn-outline" data-go="dashboard">Back to home</button>
    </div>
  </div>`
}

/* ---------- Health ---------- */
function health() {
  const h = S.health
  const days = []
  for (let d = 6; d >= 0; d--) days.push(new Date(now - d * DAY))
  const week = [...h.week, [MOODS[h.mood][0], h.water]]
  return `<div class="stack">
    <div class="fade-up"><h1 class="page-title">💚 Today's health</h1><p class="page-sub">A quick check-in for body and mind. Your family sees this in the weekly report.</p></div>
    <div class="health-grid">
      <div class="h-card card fade-up"><div class="h-head"><span class="h-title">💧 Water</span><span class="h-val">${h.water} of 8 glasses</span></div>
        <div class="glasses">${Array.from({ length: 8 }, (_, i) => `<button class="glass ${i < h.water ? 'full' : ''}" data-water="${i + 1}" aria-label="${i + 1} glasses"></button>`).join('')}</div></div>
      <div class="h-card card fade-up" style="animation-delay:.05s"><div class="h-head"><span class="h-title">😴 Sleep</span><span class="h-val">${h.sleep >= 7 ? 'Well rested' : 'A bit short'}</span></div>
        <div class="stepper"><button class="step-btn" data-sleep="-1" aria-label="Less sleep">−</button><span class="step-val">${h.sleep}h</span><button class="step-btn" data-sleep="1" aria-label="More sleep">+</button></div></div>
      <div class="h-card card fade-up" style="animation-delay:.1s"><div class="h-head"><span class="h-title">How are you feeling?</span><span class="h-val">${MOODS[h.mood][1]}</span></div>
        <div class="moods">${MOODS.map(([e, l], i) => `<button class="mood ${i === h.mood ? 'sel' : ''}" data-mood="${i}" aria-label="${l}">${e}</button>`).join('')}</div></div>
      <div class="h-card card fade-up" style="animation-delay:.15s"><div class="h-head"><span class="h-title">🚶 Movement</span><span class="h-val">${h.moves.length ? h.moves.length + ' logged' : 'None yet'}</span></div>
        <div class="move-opts">${MOVES.map(m => `<button class="move ${h.moves.includes(m) ? 'sel' : ''}" data-move="${m}">${m}</button>`).join('')}</div></div>
    </div>
    <section class="fade-up" style="animation-delay:.2s;display:flex;flex-direction:column;gap:1rem">
      <div class="section-label">This week</div>
      <div class="week">${days.map((d, i) => `<div class="day ${i === 6 ? 'today' : ''}"><div class="day-name">${d.toLocaleDateString('en-US', { weekday: 'short' })}</div><div class="day-mood">${week[i][0]}</div><div class="day-water">💧${week[i][1]}</div></div>`).join('')}</div>
    </section>
    <button class="btn-primary" id="save-health" style="max-width:320px">Save today's check-in</button>
  </div>`
}

/* ---------- Family ---------- */
function familyPage() {
  const f = S.famForm
  return `<div class="stack">
    <div class="fam-head fade-up"><div><h1 class="page-title">👨‍👩‍👧 My Family</h1><p class="page-sub">Add family members with a photo to use in the Family Faces game.</p></div>
      <button class="btn-add" id="toggle-form">${f ? '✕ Cancel' : '+ Add'}</button></div>
    ${f ? `<form class="fam-form card fade-up" id="fam-form" novalidate>
      <h2 style="font-size:1.5rem">New family member</h2>
      <button type="button" class="photo-up" id="photo-btn">${f.photo ? `<img src="${f.photo}" alt="Preview">` : '<span>📷<br>Tap to add a photo</span>'}</button>
      <input type="file" id="photo-input" accept="image/*" hidden>
      <div class="field"><label class="label" for="f-name">Full name</label><input id="f-name" class="input-field" placeholder="e.g. Anna Collins" value="${esc(f.name)}"></div>
      <div class="field"><label class="label" for="f-rel">Relationship</label><select id="f-rel" class="input-field">${RELATIONSHIPS.map(r => `<option ${r === f.rel ? 'selected' : ''}>${r}</option>`).join('')}</select></div>
      ${f.error ? `<div class="auth-error shake">${f.error}</div>` : ''}
      <button type="submit" class="btn-primary">Save family member</button>
    </form>` : ''}
    ${S.family.length === 0 ? `<div class="card" style="padding:3rem 1.5rem;text-align:center"><div style="font-size:3rem">👨‍👩‍👧</div><div style="font-weight:800">No family members yet</div><div class="page-sub" style="margin:0 auto">Tap “+ Add” to add your first family member with a photo.</div></div>` :
    `<div class="fam-grid">${S.family.map((m, i) => `<div class="fam-card card fade-up" style="animation-delay:${i * .05}s">
      <div class="fam-photo" style="background:${m.bg}">${m.photo ? `<img src="${m.photo}" alt="${esc(m.name)}">` : m.emoji}</div>
      <div><div class="fam-name">${esc(m.name)}</div><div class="fam-rel">${esc(m.relationship)}</div></div>
      ${S.confirmDel === m.id ? `<div class="confirm-row"><button class="cr-yes" data-del-yes="${m.id}">Remove</button><button class="cr-no" data-del-no>Keep</button></div>` : `<button class="fam-del" data-del="${m.id}" aria-label="Remove ${esc(m.name)}">Remove</button>`}
    </div>`).join('')}</div>`}
  </div>`
}

/* ---------- Progress ---------- */
function progress() {
  const s = summary(), tab = S.progressTab
  const best = bestScores()
  const items = tab === 'best' ? best : S.history
  return `<div class="stack">
    <div class="fade-up"><h1 class="page-title">📊 My Progress</h1><p class="page-sub">Follow your progress in every game.</p></div>
    <div class="stats-3 fade-up" style="animation-delay:.06s">
      <div class="stat card"><div class="stat-icon">🔥</div><div class="stat-val">${s.streak}</div><div class="stat-label">days in a row</div></div>
      <div class="stat card accent"><div class="stat-icon">⭐</div><div class="stat-val">${fmt(s.points)}</div><div class="stat-label">total points</div></div>
      <div class="stat card"><div class="stat-icon">🎮</div><div class="stat-val">${s.sessions}</div><div class="stat-label">sessions</div></div>
    </div>
    ${weeklyChart()}
    <div class="report-card card fade-up" style="animation-delay:.12s">
      <span style="font-size:1.6rem">💌</span>
      <div class="rc-body"><div class="rc-title">Weekly family report</div><div class="rc-desc">Next report goes to Anna and Mark on Sunday at 8:00 AM.</div></div>
      <button class="btn-small" id="preview-report">Preview report</button>
    </div>
    <div id="report-preview" hidden>${reportMail()}</div>
    <div class="tabs fade-up"><button class="tab ${tab === 'best' ? 'active' : ''}" data-tab="best">🏆 Best scores</button><button class="tab ${tab === 'history' ? 'active' : ''}" data-tab="history">📋 History</button></div>
    <div class="list">${items.map((h, i) => {
      const g = GAMES[h.game]
      const date = new Date(h.at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
      const dur = h.dur > 60 ? `${Math.floor(h.dur / 60)}m ${h.dur % 60}s` : `${h.dur}s`
      return `<div class="li card fade-up" style="animation-delay:${i * .03}s">
        <div class="li-icon" style="background:${g.bg}">${g.icon}</div>
        <div class="li-body"><div class="li-name">${g.name} · <span style="font-weight:600;color:var(--text-muted)">${DIFF[h.diff]}</span></div>
          <div class="li-meta">${tab === 'best' ? `${Math.round(h.correct / h.total * 100)}% accuracy` : `${date} · ${dur} · ${h.correct}/${h.total} correct`}</div></div>
        <div class="li-right"><div class="li-score" style="color:${g.color}">${h.score} pts</div></div></div>`
    }).join('')}</div>
  </div>`
}
function weeklyChart() {
  const days = []
  for (let d = 6; d >= 0; d--) {
    const date = new Date(now - d * DAY)
    const pts = S.history.filter(h => new Date(h.at).toDateString() === date.toDateString()).reduce((a, h) => a + h.score, 0)
    days.push({ label: date.toLocaleDateString('en-US', { weekday: 'short' }), pts })
  }
  const max = Math.max(1000, Math.ceil(Math.max(...days.map(d => d.pts)) / 500) * 500)
  const W = 560, H = 190, L = 40, B = 26, T = 14, bw = (W - L) / 7
  const y = v => T + (H - T - B) * (1 - v / max)
  const ticks = [0, max / 2, max]
  return `<div class="chart-card card fade-up" style="animation-delay:.1s">
    <div class="chart-head"><span class="chart-title">Points this week</span><span class="chart-note">${fmt(days.reduce((a, d) => a + d.pts, 0))} pts in 7 days</span></div>
    <div class="chart"><svg viewBox="0 0 ${W} ${H}" role="img" aria-label="Bar chart of points per day this week">
      ${ticks.map(t => `<line x1="${L}" x2="${W}" y1="${y(t)}" y2="${y(t)}" stroke="var(--gray-200)" stroke-width="1"/><text x="${L - 8}" y="${y(t) + 4}" text-anchor="end" font-size="11" fill="var(--text-muted)" font-family="Inter, sans-serif">${fmt(t)}</text>`).join('')}
      ${days.map((d, i) => {
        const x = L + i * bw + bw * .22, w = bw * .56, top = y(d.pts)
        return `<rect x="${x}" y="${top}" width="${w}" height="${Math.max(0, H - B - top)}" rx="6" fill="${i === 6 ? 'var(--accent)' : 'var(--gray-300)'}"/>
          ${d.pts ? `<text x="${x + w / 2}" y="${top - 5}" text-anchor="middle" font-size="11" font-weight="700" fill="var(--text-secondary)" font-family="Inter, sans-serif">${d.pts}</text>` : ''}
          <text x="${x + w / 2}" y="${H - 6}" text-anchor="middle" font-size="11" font-weight="600" fill="${i === 6 ? 'var(--ink)' : 'var(--text-muted)'}" font-family="Inter, sans-serif">${i === 6 ? 'Today' : d.label}</text>`
      }).join('')}
    </svg></div></div>`
}

/* ---------- Events after render ---------- */
function afterRender() {
  bindAuth()
  const r = S.route
  document.querySelectorAll('[data-start]').forEach(b => b.onclick = () => startGame({ memory: 'memory', math: 'math', faces: 'face', words: 'word' }[r], b.dataset.start))
  document.querySelectorAll('[data-card]').forEach(b => b.onclick = () => flipCard(+b.dataset.card))
  document.querySelectorAll('[data-ans]').forEach(b => b.onclick = () => answer({ math: 'math', faces: 'face', words: 'word' }[r], b.dataset.ans))
  const again = $('#again'); if (again) again.onclick = () => { S.play = { phase: 'pick' }; render() }

  document.querySelectorAll('[data-water]').forEach(b => b.onclick = () => { const v = +b.dataset.water; S.health.water = S.health.water === v ? v - 1 : v; render() })
  document.querySelectorAll('[data-sleep]').forEach(b => b.onclick = () => { S.health.sleep = Math.min(12, Math.max(0, S.health.sleep + +b.dataset.sleep)); render() })
  document.querySelectorAll('[data-mood]').forEach(b => b.onclick = () => { S.health.mood = +b.dataset.mood; render() })
  document.querySelectorAll('[data-move]').forEach(b => b.onclick = () => { const m = b.dataset.move, a = S.health.moves; S.health.moves = a.includes(m) ? a.filter(x => x !== m) : [...a, m]; render() })
  const sh = $('#save-health'); if (sh) sh.onclick = () => toast("Saved. Today's check-in is in your weekly report.")

  document.querySelectorAll('[data-mini]').forEach(b => b.onclick = () => flipMini(+b.dataset.mini))
  const mr = $('#mini-reset'); if (mr) mr.onclick = () => { S.mini = null; render() }
  document.querySelectorAll('[data-ts]').forEach(b => b.onclick = () => { S.textSize = +b.dataset.ts; render() })
  const pr = $('#preview-report'); if (pr) pr.onclick = () => { const r = $('#report-preview'); r.hidden = !r.hidden; pr.textContent = r.hidden ? 'Preview report' : 'Hide preview' }
  document.querySelectorAll('[data-tab]').forEach(b => b.onclick = () => { S.progressTab = b.dataset.tab; render() })

  const tf = $('#toggle-form'); if (tf) tf.onclick = () => { S.famForm = S.famForm ? null : { name: '', rel: RELATIONSHIPS[0], photo: null, error: '' }; render() }
  const pb = $('#photo-btn'), pi = $('#photo-input')
  if (pb && pi) {
    pb.onclick = () => pi.click()
    pi.onchange = () => {
      const file = pi.files[0]; if (!file) return
      const fr = new FileReader()
      fr.onload = () => { syncFamForm(); S.famForm.photo = fr.result; render() }
      fr.readAsDataURL(file)
    }
  }
  const ff = $('#fam-form')
  if (ff) ff.onsubmit = e => {
    e.preventDefault(); syncFamForm()
    const f = S.famForm
    if (!f.name.trim()) f.error = "Enter the family member's name."
    else if (!f.photo) f.error = 'Add a photo of the family member.'
    else {
      S.family.unshift({ id: nextId++, name: f.name.trim(), relationship: f.rel, photo: f.photo, bg: 'var(--gray-100)' })
      S.famForm = null; render(); toast(`${f.name.trim().split(' ')[0]} was added to your family.`); return
    }
    render()
  }
  document.querySelectorAll('[data-del]').forEach(b => b.onclick = () => { S.confirmDel = +b.dataset.del; render() })
  document.querySelectorAll('[data-del-yes]').forEach(b => b.onclick = () => { S.family = S.family.filter(m => m.id !== +b.dataset.delYes); S.confirmDel = null; render() })
  document.querySelectorAll('[data-del-no]').forEach(b => b.onclick = () => { S.confirmDel = null; render() })
}
function syncFamForm() {
  const n = $('#f-name'), r = $('#f-rel')
  if (n) S.famForm.name = n.value
  if (r) S.famForm.rel = r.value
  S.famForm.error = ''
}



export function mount(el) {
  if (root) return
  root = el
  root.addEventListener('click', onClick)
  const VALID = ['home', 'signin', 'signup', ...APP_ROUTES]
  const initial = (location.hash || '').slice(1)
  go(VALID.includes(initial) ? initial : 'home')
}
