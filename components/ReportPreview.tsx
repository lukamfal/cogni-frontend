interface Props {
  title: string
  meta: string
  greeting: string
  daysPlayed: string
  accuracy: string
  mood: string
  /** Seven values, oldest day first. Any scale; bars are drawn relative to the largest. */
  bars: number[]
  note: React.ReactNode
}

export default function ReportPreview({ title, meta, greeting, daysPlayed, accuracy, mood, bars, note }: Props) {
  const max = Math.max(1, ...bars)
  return (
    <div className="mail card">
      <div className="mail-head"><strong>{title}</strong><span>{meta}</span></div>
      <div className="mail-body">
        <div className="mail-hi">{greeting}</div>
        <div className="mail-kpis">
          <div className="mail-kpi"><b>{daysPlayed}</b><span>dias jogados</span></div>
          <div className="mail-kpi"><b>{accuracy}</b><span>precisão</span></div>
          <div className="mail-kpi"><b>{mood}</b><span>humor comum</span></div>
        </div>
        <div className="mail-bars" aria-hidden="true">
          {bars.map((v, i) => (
            <i key={i} className={i === bars.length - 1 ? 'now' : ''} style={{ height: `${Math.max((v / max) * 100, 6)}%` }} />
          ))}
        </div>
        <div className="mail-note">{note}</div>
      </div>
    </div>
  )
}
