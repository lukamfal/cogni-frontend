'use client'

import { useState, useEffect, useRef } from 'react'
import Image from 'next/image'
import { api, FamilyMember } from '@/lib/api'
import { toast } from '@/lib/games'

const RELATIONSHIPS = ['Filho(a)', 'Neto(a)', 'Esposo(a)', 'Irmão/Irmã', 'Sobrinho(a)', 'Amigo(a)', 'Outro']

export default function FamiliaPage() {
  const [members, setMembers] = useState<FamilyMember[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [name, setName] = useState('')
  const [relationship, setRelationship] = useState(RELATIONSHIPS[0])
  const [photoFile, setPhotoFile] = useState<File | null>(null)
  const [photoPreview, setPhotoPreview] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [confirmDel, setConfirmDel] = useState<number | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    api.family.list().then(setMembers).catch(() => {}).finally(() => setLoading(false))
  }, [])

  const onPhoto = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]
    if (!f) return
    setPhotoFile(f)
    setPhotoPreview(URL.createObjectURL(f))
  }

  const save = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) { setError('Digite o nome do familiar.'); return }
    if (!photoFile) { setError('Adicione uma foto do familiar.'); return }
    setSaving(true); setError('')
    try {
      const fd = new FormData()
      fd.append('name', name.trim())
      fd.append('relation', relationship)
      fd.append('photo', photoFile)
      const member = await api.family.add(fd)
      setMembers(prev => [member, ...prev])
      setShowForm(false)
      toast(`${name.trim().split(' ')[0]} foi adicionado(a) à sua família.`)
      setName(''); setRelationship(RELATIONSHIPS[0])
      setPhotoFile(null); setPhotoPreview(null)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Erro ao salvar.')
    } finally {
      setSaving(false)
    }
  }

  const remove = async (id: number) => {
    try {
      await api.family.delete(id)
      setMembers(prev => prev.filter(m => m.id !== id))
    } catch {
      toast('Não foi possível remover. Tente de novo.')
    } finally {
      setConfirmDel(null)
    }
  }

  return (
    <div className="stack">
      <div className="fam-head fade-up">
        <div>
          <h1 className="page-title">👨‍👩‍👧 Minha Família</h1>
          <p className="page-sub">Cadastre familiares com foto para usar no jogo Reconhecer Família.</p>
        </div>
        <button className="btn-add" onClick={() => { setShowForm(v => !v); setError('') }}>
          {showForm ? '✕ Cancelar' : '+ Adicionar'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={save} className="fam-form card fade-up" noValidate>
          <h2 style={{ fontSize: '1.5rem' }}>Novo familiar</h2>
          <button type="button" className="photo-up" onClick={() => fileRef.current?.click()}>
            {photoPreview
              ? <Image src={photoPreview} alt="Prévia da foto" fill style={{ objectFit: 'cover' }} unoptimized />
              : <span>📷<br />Toque para adicionar foto</span>}
          </button>
          <input ref={fileRef} type="file" accept="image/*" onChange={onPhoto} hidden />

          <div className="field">
            <label className="label" htmlFor="f-name">Nome completo</label>
            <input id="f-name" className="input-field" placeholder="Ex: Ana Lima" value={name} onChange={e => setName(e.target.value)} required />
          </div>
          <div className="field">
            <label className="label" htmlFor="f-rel">Parentesco</label>
            <select id="f-rel" className="input-field" value={relationship} onChange={e => setRelationship(e.target.value)}>
              {RELATIONSHIPS.map(r => <option key={r}>{r}</option>)}
            </select>
          </div>

          {error && <div className="auth-error shake" role="alert">{error}</div>}

          <button type="submit" className="btn-primary" disabled={saving}>
            {saving ? 'Salvando...' : 'Salvar familiar'}
          </button>
        </form>
      )}

      {loading ? (
        <div className="muted-center">Carregando...</div>
      ) : members.length === 0 ? (
        <div className="empty card fade-up">
          <div className="empty-icon">👨‍👩‍👧</div>
          <div className="empty-title">Nenhum familiar cadastrado</div>
          <div className="page-sub">Toque em “+ Adicionar” para cadastrar o primeiro familiar com foto.</div>
        </div>
      ) : (
        <div className="fam-grid">
          {members.map((m, i) => (
            <div key={m.id} className="fam-card card fade-up" style={{ animationDelay: `${i * 0.05}s` }}>
              <div className="fam-photo" style={{ background: 'var(--gray-100)' }}>
                {m.photo_url
                  ? <Image src={m.photo_url} alt={m.name} fill sizes="(max-width: 768px) 50vw, 280px" style={{ objectFit: 'cover' }} unoptimized />
                  : '👤'}
              </div>
              <div>
                <div className="fam-name">{m.name}</div>
                <div className="fam-rel">{m.relation}</div>
              </div>
              {confirmDel === m.id ? (
                <div className="confirm-row">
                  <button className="cr-yes" onClick={() => remove(m.id)}>Remover</button>
                  <button className="cr-no" onClick={() => setConfirmDel(null)}>Manter</button>
                </div>
              ) : (
                <button className="fam-del" onClick={() => setConfirmDel(m.id)} aria-label={`Remover ${m.name}`}>Remover</button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
