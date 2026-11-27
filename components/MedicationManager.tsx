'use client'

import { useEffect, useState } from 'react'
import { Medication, loadMeds, saveMeds } from '@/lib/medications'
import { toast } from '@/lib/games'

/** "Meus remédios" on the Saúde page: name and times for each reminder. */
export default function MedicationManager() {
  const [meds, setMeds] = useState<Medication[]>([])
  const [open, setOpen] = useState(false)
  const [name, setName] = useState('')
  const [times, setTimes] = useState(['08:00'])
  const [confirm, setConfirm] = useState<string | null>(null)

  // localStorage only exists in the browser, so it is read after mount.
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { setMeds(loadMeds()) }, [])

  const update = (list: Medication[]) => { setMeds(list); saveMeds(list) }

  const save = (e: React.FormEvent) => {
    e.preventDefault()
    const clean = [...new Set(times.filter(Boolean))].sort()
    if (!name.trim() || clean.length === 0) { toast('Digite o nome do remédio e pelo menos um horário.'); return }
    update([...meds, { id: String(Date.now()), name: name.trim().slice(0, 80), times: clean }])
    toast(`Lembrete de ${name.trim()} salvo.`)
    setName(''); setTimes(['08:00']); setOpen(false)
  }

  return (
    <section className="set-group card fade-up" aria-labelledby="meds-title">
      <div className="set-row">
        <div>
          <h2 id="meds-title" className="meds-title">💊 Meus remédios</h2>
          <div className="set-sub">O app avisa no horário de cada um.</div>
        </div>
        <button className="btn-add" onClick={() => setOpen(v => !v)}>{open ? '✕ Cancelar' : '+ Adicionar'}</button>
      </div>

      {open && (
        <form className="meds-form" onSubmit={save} noValidate>
          <div className="field">
            <label className="label" htmlFor="med-name">Nome do remédio</label>
            <input id="med-name" className="input-field" placeholder="Ex: Losartana 50mg" value={name} onChange={e => setName(e.target.value)} />
          </div>
          <div className="field">
            <span className="label">Horários</span>
            {times.map((t, i) => (
              <div key={i} className="care-form-row">
                <input type="time" className="input-field" value={t} aria-label={`Horário ${i + 1}`}
                  onChange={e => setTimes(list => list.map((v, k) => (k === i ? e.target.value : v)))} />
                {times.length > 1 && (
                  <button type="button" className="btn-small" aria-label={`Remover horário ${i + 1}`}
                    onClick={() => setTimes(list => list.filter((_, k) => k !== i))}>✕</button>
                )}
              </div>
            ))}
            <button type="button" className="btn-small" style={{ alignSelf: 'flex-start' }} onClick={() => setTimes(list => [...list, '20:00'])}>+ Outro horário</button>
          </div>
          <button type="submit" className="btn-primary">Salvar remédio</button>
        </form>
      )}

      {meds.length === 0 ? (
        <div className="set-sub">Nenhum remédio cadastrado ainda.</div>
      ) : (
        <div className="list">
          {meds.map(m => (
            <div key={m.id} className="set-row med-row">
              <div>
                <div className="set-label">{m.name}</div>
                <div className="set-sub">🕒 {m.times.join(' · ')}</div>
              </div>
              {confirm === m.id ? (
                <div className="confirm-row">
                  <button className="cr-yes" onClick={() => { update(meds.filter(x => x.id !== m.id)); setConfirm(null) }}>Remover</button>
                  <button className="cr-no" onClick={() => setConfirm(null)}>Manter</button>
                </div>
              ) : (
                <button className="btn-small" onClick={() => setConfirm(m.id)}>Remover</button>
              )}
            </div>
          ))}
        </div>
      )}
      <p className="note">Os lembretes funcionam neste aparelho, com o CogniMente aberto.</p>
    </section>
  )
}
