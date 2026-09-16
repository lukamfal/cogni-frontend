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
    throw new Error(err.detail || 'Erro na requisição')
  }
  return res.json()
}

export const api = {
  auth: {
    register: (data: { name: string; email: string; password: string; role?: string }) =>
      request<{ access_token: string; user: User }>('/auth/register', {
        method: 'POST', body: JSON.stringify(data),
      }),
    login: (email: string, password: string) =>
      request<{ access_token: string; user: User }>('/auth/login', {
        method: 'POST', body: JSON.stringify({ email, password }),
      }),
    me: () => request<User>('/profiles/me'),
  },

  scores: {
    summary: () => request<Summary>('/scores/summary'),
    history: (game_type?: string) =>
      request<GameSession[]>(`/scores/history${game_type ? `?game_type=${game_type}` : ''}`),
    best: () => request<BestScore[]>('/scores/best'),
  },

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

  health: {
    today: () => request<HealthLog | null>('/health/today'),
    upsert: (data: Partial<HealthLog> & { log_date: string }) =>
      request<HealthLog>('/health/log', { method: 'POST', body: JSON.stringify(data) }),
    patch: (date: string, data: Partial<HealthLog>) =>
      request<HealthLog>(`/health/log/${date}`, { method: 'PATCH', body: JSON.stringify(data) }),
    history: (days = 30) => request<HealthLog[]>(`/health/history?days=${days}`),
    summary: () => request<HealthSummary>('/health/summary'),
  },

  family: {
    list: () => request<FamilyMember[]>('/family/'),
    add: (formData: FormData) => {
      const token = getToken()
      return fetch(`${API_URL}/family/`, {
        method: 'POST',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: formData,
      }).then(r => r.json()) as Promise<FamilyMember>
    },
    delete: (id: number) =>
      request(`/family/${id}`, { method: 'DELETE' }),
  },
}

export interface User {
  id: number
  name: string
  email: string
  role: 'elder' | 'caregiver'
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

export interface HealthLog {
  id?: number
  user_id?: number
  log_date: string
  water_cups: number
  water_goal: number
  steps: number
  steps_goal: number
  exercise_minutes: number
  sleep_hours: number
  mood: 'great' | 'good' | 'neutral' | 'bad' | 'awful' | null
  medication_taken: boolean
  medication_notes: string | null
  notes: string | null
  created_at?: string
  updated_at?: string | null
}

export interface HealthSummary {
  avg_water_cups: number
  avg_sleep_hours: number
  avg_steps: number
  avg_exercise_minutes: number
  medication_adherence: number
  most_common_mood: string | null
  logs_this_week: number
}

export interface FinishPayload {
  score: number
  correct_answers: number
  total_questions: number
  duration_seconds: number
  metadata?: Record<string, unknown>
}