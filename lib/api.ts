const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api'

function getToken(): string | null {
  if (typeof window === 'undefined') return null
  return localStorage.getItem('cogni_token')
}

async function request<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getToken()
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> || {}),
  }
  if (token) headers['Authorization'] = `Bearer ${token}`

  const res = await fetch(`${API_URL}${path}`, { ...options, headers })

  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: 'Erro desconhecido' }))
    throw new Error(typeof err.detail === 'string' ? err.detail : 'Erro na requisição')
  }
  if (res.status === 204) return undefined as T
  return res.json()
}

// ── Auth ──────────────────────────────────────────────
export const api = {
  auth: {
    register: (data: { name: string; email: string; password: string; role: Role }) =>
      request<{ access_token: string; user: User }>('/auth/register', {
        method: 'POST', body: JSON.stringify(data),
      }),

    login: (email: string, password: string) =>
      request<{ access_token: string; user: User }>('/auth/login', {
        method: 'POST', body: JSON.stringify({ email, password }),
      }),

    me: () => request<User>('/profiles/me'),
  },

  // ── Scores ─────────────────────────────────────────
  scores: {
    summary: () => request<Summary>('/scores/summary'),
    history: (game_type?: string) =>
      request<GameSession[]>(`/scores/history${game_type ? `?game_type=${game_type}` : ''}`),
    best: () => request<BestScore[]>('/scores/best'),
  },

  // ── Games ──────────────────────────────────────────
  games: {
    suggestDifficulty: (game_type: string) =>
      request<{ suggested_difficulty: string }>(`/games/suggest-difficulty/${game_type}`),

    memory: {
      start: (difficulty: string) =>
        request<MemoryConfig>('/games/memory/start', {
          method: 'POST', body: JSON.stringify({ game_type: 'memory', difficulty }),
        }),
      finish: (session_id: number, data: FinishPayload) =>
        request<GameSession>(`/games/memory/finish/${session_id}`, {
          method: 'POST', body: JSON.stringify(data),
        }),
    },

    math: {
      start: (difficulty: string) =>
        request<MathQuestion>('/games/math/start', {
          method: 'POST', body: JSON.stringify({ game_type: 'math', difficulty }),
        }),
      question: (session_id: number, question_number: number) =>
        request<MathQuestion>(`/games/math/question/${session_id}/${question_number}`),
      finish: (session_id: number, data: FinishPayload) =>
        request<GameSession>(`/games/math/finish/${session_id}`, {
          method: 'POST', body: JSON.stringify(data),
        }),
    },

    face: {
      start: (difficulty: string) =>
        request<FaceGameStart>('/games/face/start', {
          method: 'POST', body: JSON.stringify({ game_type: 'face', difficulty }),
        }),
      finish: (session_id: number, data: FinishPayload) =>
        request<GameSession>(`/games/face/finish/${session_id}`, {
          method: 'POST', body: JSON.stringify(data),
        }),
    },

    word: {
      start: (difficulty: string) =>
        request<WordGameStart>('/games/word/start', {
          method: 'POST', body: JSON.stringify({ game_type: 'word', difficulty }),
        }),
      finish: (session_id: number, data: FinishPayload) =>
        request<GameSession>(`/games/word/finish/${session_id}`, {
          method: 'POST', body: JSON.stringify(data),
        }),
    },
  },

  // ── Family ─────────────────────────────────────────
  family: {
    list: () => request<FamilyMember[]>('/family/'),
    add: async (formData: FormData): Promise<FamilyMember> => {
      const token = getToken()
      const res = await fetch(`${API_URL}/family/`, {
        method: 'POST',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: formData,
      })
      const body = await res.json().catch(() => ({}))
      if (!res.ok) {
        // FastAPI sends a string, or a list of field errors for 422s.
        const detail = typeof body.detail === 'string' ? body.detail : 'Não foi possível salvar o familiar.'
        throw new Error(detail)
      }
      return body
    },
    delete: (id: number) =>
      request(`/family/${id}`, { method: 'DELETE' }),
  },

  // ── Health ─────────────────────────────────────────
  health: {
    today: () => request<HealthLog | null>('/health/today'),
    history: (days = 7) => request<HealthLog[]>(`/health/history?days=${days}`),
    /** Creates or replaces the whole day. Use patch to change some fields of an existing day. */
    save: (data: HealthLogInput) =>
      request<HealthLog>('/health/log', { method: 'POST', body: JSON.stringify(data) }),
    patch: (date: string, data: Partial<Omit<HealthLogInput, 'log_date'>>) =>
      request<HealthLog>(`/health/log/${date}`, { method: 'PATCH', body: JSON.stringify(data) }),
  },

  // ── Care (family following a player) ───────────────
  care: {
    // Caregiver side
    request: (elder_email: string) =>
      request<{ detail: string }>('/care/requests', { method: 'POST', body: JSON.stringify({ elder_email }) }),
    following: () => request<FollowingLink[]>('/care/following'),
    overview: (elderId: number) => request<ElderOverview>(`/care/elders/${elderId}/overview`),
    // Player side
    incoming: () => request<IncomingRequest[]>('/care/requests'),
    accept: (id: number) => request<Follower>(`/care/requests/${id}/accept`, { method: 'POST' }),
    decline: (id: number) => request(`/care/requests/${id}/decline`, { method: 'POST' }),
    followers: () => request<Follower[]>('/care/followers'),
    // Either side
    remove: (id: number) => request(`/care/links/${id}`, { method: 'DELETE' }),
  },
}

// ── Types ─────────────────────────────────────────────
export type Role = 'elder' | 'caregiver'

export type Mood = 'great' | 'good' | 'neutral' | 'bad' | 'awful'

export interface HealthLogInput {
  log_date: string
  water_cups: number
  sleep_hours: number
  mood: Mood | null
  notes: string | null
  medication_taken?: boolean
  medication_notes?: string | null
}

export interface HealthLog extends HealthLogInput {
  id: number
  exercise_minutes: number
}

export interface HealthSummary {
  avg_water_cups: number
  avg_sleep_hours: number
  most_common_mood: Mood | null
  logs_this_week: number
}

export interface FollowingLink {
  id: number
  status: 'pending' | 'accepted'
  elder_email: string
  elder_id: number | null
  elder_name: string | null
  created_at: string | null
  accepted_at: string | null
}

export interface IncomingRequest { id: number; caregiver_name: string; caregiver_email: string; created_at: string | null }
export interface Follower { id: number; caregiver_name: string; caregiver_email: string; accepted_at: string | null }

export interface ElderOverview {
  elder_id: number
  elder_name: string
  summary: Summary
  recent_sessions: GameSession[]
  health_summary: HealthSummary
  health_week: HealthLog[]
}

export interface User {
  id: number
  name: string
  email: string
  role: Role
  avatar_url: string | null
  is_active: boolean
  created_at: string
}

export interface Summary {
  total_sessions: number
  total_points: number
  streak_days: number
}

export interface GameSession {
  id: number
  game_type: string
  difficulty: string
  score: number
  accuracy: number
  duration_seconds: number
  correct_answers: number
  total_questions: number
  started_at: string
  finished_at: string | null
}

export interface BestScore {
  game_type: string
  difficulty: string
  score: number
  accuracy: number
}

export interface MemoryConfig {
  session_id: number
  pairs: number
  time_limit_seconds: number
  show_preview_seconds: number
  items: string[]
}

export interface MathQuestion {
  session_id: number
  question_number: number
  total_questions: number
  expression: string
  options: number[]
  time_limit_seconds: number
}

export interface FaceQuestion {
  question_number: number
  total_questions: number
  photo_url: string
  options: string[]
  time_limit_seconds: number
}

export interface FaceGameStart {
  session_id: number
  questions: FaceQuestion[]
}

export interface WordQuestion {
  question_number: number
  total_questions: number
  masked_word: string
  hint: string
  options: string[]
  time_limit_seconds: number
  /** Hidden letters, left to right. Only sent by backends that include the answers. */
  correct_letters?: string[]
  full_word?: string
}

export interface WordGameStart {
  session_id: number
  questions: WordQuestion[]
}

export interface FamilyMember {
  id: number
  name: string
  relation: string
  photo_url: string | null
  created_at: string
}

export interface FinishPayload {
  score: number
  correct_answers: number
  total_questions: number
  duration_seconds: number
  metadata?: Record<string, unknown>
}
