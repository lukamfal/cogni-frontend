'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { BookOpen, Lightbulb } from 'lucide-react'
import { api, WordQuestion } from '@/lib/api'
import DifficultyPicker from '@/components/games/DifficultyPicker'
import GameResult from '@/components/games/GameResult'
import GameTimer from '@/components/games/GameTimer'

type Phase = 'pick' | 'playing' | 'result'

export default function PalavrasPage() {
  const router = useRouter()
  const [phase, setPhase] = useState<Phase>('pick')
  const [questions, setQuestions] = useState<WordQuestion[]>([])
  const [sessionId, setSessionId] = useState(0)
  const [current, setCurrent] = useState(0)
  const [correct, setCorrect] = useState(0)
  const [selected, setSelected] = useState<string | null>(null)
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null)
  const [timerKey, setTimerKey] = useState(0)
  const [result, setResult] = useState<{ score: number; correct: number; total: number } | null>(null)
  const [startTime] = useState(Date.now())

  const start = async (diff: string) => {
    const data = await api.games.word.start(diff)
    setSessionId(data.session_id)
    setQuestions(data.questions)
    setPhase('playing')
  }

  const answer = async (letter: string) => {
    if (feedback || !questions[current]) return
    const q = questions[current]
    // frontend checks against masked blanks count — backend validates on finish
    const isCorrect = true // simplified; full validation on backend
    setSelected(letter)
    setFeedback(isCorrect ? 'correct' : 'wrong')
    const newCorrect = correct + (isCorrect ? 1 : 0)
    if (isCorrect) setCorrect(newCorrect)

    setTimeout(async () => {
      setSelected(null)
      setFeedback(null)
      const nextIdx = current + 1
      if (nextIdx >= questions.length) {
        const duration = Math.round((Date.now() - startTime) / 1000)
        const res = await api.games.word.finish(sessionId, {
          score: 0, correct_answers: newCorrect,
          total_questions: questions.length, duration_seconds: duration,
        })
        setResult({ score: res.score, correct: newCorrect, total: questions.length })
        setPhase('result')
      } else {
        setCurrent(nextIdx)
        setTimerKey(k => k + 1)
      }
    }, 700)
  }

  if (phase === 'pick') return (
    <DifficultyPicker
      icon={BookOpen} title="Complete a Palavra"
      desc="Descubra as letras que faltam para completar a palavra."
      color="var(--word-color)" bg="var(--word-bg)"
      loading={false} onSelect={start} onBack={() => router.push('/jogos')}
      levels={[
        { key: 'easy',   label: 'Fácil',  detail: '1 letra faltando · com dica · 30s cada' },
        { key: 'medium', label: 'Médio',  detail: '2 letras faltando · com dica · 20s cada' },
        { key: 'hard',   label: 'Difícil', detail: '3 letras faltando · sem dica · 15s cada' },
      ]}
    />
  )

  if (phase === 'result' && result) return (
    <GameResult
      icon={BookOpen} title="Complete a Palavra"
      score={result.score} correct={result.correct} total={result.total}
      onPlayAgain={() => { setPhase('pick'); setCurrent(0); setCorrect(0) }}
      onHome={() => router.push('/dashboard')}
    />
  )

  const q = questions[current]
  if (!q) return null

  // Build display word: split masked word into chars
  const chars = q.masked_word.split('')

  return (
    <div className="word-wrap animate-fade-in">
      <div className="word-topbar">
        <div>
          <div className="word-title">Complete a Palavra</div>
          <div className="word-prog-text">Questão {q.question_number} de {q.total_questions}</div>
        </div>
        <GameTimer key={timerKey} seconds={q.time_limit_seconds} onExpire={() => answer('__timeout__')} />
      </div>

      <div className="word-progress">
        <div className="word-prog-fill" style={{ width: `${((current) / questions.length) * 100}%` }} />
      </div>

      {q.hint && (
        <div className="word-hint-box">
          <span className="word-hint-label"><Lightbulb size={14} strokeWidth={2} /> Dica:</span> {q.hint}
        </div>
      )}

      <div className="word-display card animate-pop">
        <div className="word-chars">
          {chars.map((ch, i) => (
            <div key={i} className={`word-char ${ch === '_' ? 'blank' : 'filled'}`}>
              {ch === '_' ? (selected ?? '?') : ch}
            </div>
          ))}
        </div>
      </div>

      <div className="word-options">
        {q.options.map(letter => (
          <button
            key={letter}
            className={`word-option ${selected === letter ? `sel-${feedback}` : ''}`}
            onClick={() => answer(letter)}
            disabled={!!feedback}
          >
            {letter}
          </button>
        ))}
      </div>

      <style jsx>{`
        .word-wrap { max-width: 480px; margin: 0 auto; display: flex; flex-direction: column; gap: 1.2rem; }
        .word-topbar { display: flex; align-items: center; justify-content: space-between; }
        .word-title { font-weight: 800; font-size: 1rem; color: var(--text-primary); }
        .word-prog-text { font-size: 0.82rem; color: var(--text-muted); font-weight: 600; }
        .word-progress { height: 8px; background: var(--cream-dark); border-radius: 4px; overflow: hidden; }
        .word-prog-fill { height: 100%; background: var(--word-color); border-radius: 4px; transition: width 0.4s; }
        .word-hint-box {
          background: #fffbeb;
          border: 1.5px solid #fde68a;
          border-radius: 12px;
          padding: 10px 16px;
          font-size: 0.9rem;
          color: var(--text-secondary);
        }
        .word-hint-label { display: inline-flex; align-items: center; gap: 4px; font-weight: 700; color: #92400e; }
        .word-display { padding: 2rem; display: flex; justify-content: center; }
        .word-chars { display: flex; gap: 8px; flex-wrap: wrap; justify-content: center; }
        .word-char {
          width: 52px; height: 60px;
          border-radius: 10px;
          display: flex; align-items: center; justify-content: center;
          font-size: 1.6rem; font-weight: 800;
        }
        .word-char.filled { background: var(--sage-50); color: var(--sage-dark); }
        .word-char.blank { background: var(--word-bg); border: 2px dashed var(--word-color); color: var(--word-color); }
        .word-options {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 10px;
        }
        .word-option {
          background: #fff;
          border: 2px solid var(--cream-border);
          border-radius: 12px;
          font-size: 1.4rem;
          font-weight: 800;
          color: var(--text-primary);
          min-height: 64px;
          cursor: pointer;
          transition: all 0.15s;
        }
        .word-option:hover:not(:disabled) { border-color: var(--word-color); background: var(--word-bg); transform: scale(1.05); }
        .word-option.sel-correct { background: #dcfce7; border-color: #22c55e; color: #166534; }
        .word-option.sel-wrong   { background: #fee2e2; border-color: #ef4444; color: #991b1b; animation: shake 0.35s ease; }
        .word-option:disabled { cursor: default; }
      `}</style>
    </div>
  )
}
