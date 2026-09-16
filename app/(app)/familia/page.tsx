'use client'

import { useState, useEffect, useRef } from 'react'
import Image from 'next/image'
import { Users, Camera, User, Trash2 } from 'lucide-react'
import { api, FamilyMember } from '@/lib/api'

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
    if (!photoFile) { setError('Adicione uma foto do familiar.'); return }
    setSaving(true); setError('')
    try {
      const fd = new FormData()
      fd.append('name', name)
      fd.append('relation', relationship)
      fd.append('photo', photoFile)
      const member = await api.family.add(fd)
      setMembers(prev => [member, ...prev])
      setShowForm(false)
      setName(''); setRelationship(RELATIONSHIPS[0])
      setPhotoFile(null); setPhotoPreview(null)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Erro ao salvar.')
    } finally {
      setSaving(false)
    }
  }

  const remove = async (id: number) => {
    if (!confirm('Remover este familiar?')) return
    await api.family.delete(id)
    setMembers(prev => prev.filter(m => m.id !== id))
  }

  return (
    <div className="fam-page">
      <div className="fam-header animate-fade-up">
        <div>
          <h1 className="fam-title"><Users size={24} strokeWidth={1.75} /> Minha Família</h1>
          <p className="fam-sub">Cadastre familiares com foto para usar no jogo de reconhecimento.</p>
        </div>
        <button className="btn-add" onClick={() => setShowForm(v => !v)}>
          {showForm ? '✕ Cancelar' : '+ Adicionar'}
        </button>
      </div>

      {/* Form */}
      {showForm && (
        <form onSubmit={save} className="fam-form card animate-fade-up">
          <h2 className="fam-form-title">Novo familiar</h2>

          {/* Photo upload */}
          <div className="photo-upload" onClick={() => fileRef.current?.click()}>
            {photoPreview ? (
              <div className="photo-preview-wrap">
                <Image src={photoPreview} alt="Preview" fill style={{ objectFit: 'cover', borderRadius: '14px' }} />
              </div>
            ) : (
              <div className="photo-placeholder">
                <span className="photo-icon"><Camera size={28} strokeWidth={1.75} /></span>
                <span className="photo-label">Toque para adicionar foto</span>
              </div>
            )}
          </div>
          <input ref={fileRef} type="file" accept="image/*" onChange={onPhoto} style={{ display: 'none' }} />

          <div className="fam-field">
            <label className="fam-label">Nome completo</label>
            <input className="input-field" placeholder="Ex: Ana Lima" value={name} onChange={e => setName(e.target.value)} required />
          </div>

          <div className="fam-field">
            <label className="fam-label">Parentesco</label>
            <select className="input-field" value={relationship} onChange={e => setRelationship(e.target.value)}>
              {RELATIONSHIPS.map(r => <option key={r}>{r}</option>)}
            </select>
          </div>

          {error && <div className="fam-error">{error}</div>}

          <button type="submit" className="btn-primary" disabled={saving}>
            {saving ? 'Salvando...' : 'Salvar familiar'}
          </button>
        </form>
      )}

      {/* List */}
      {loading ? (
        <div className="fam-loading">Carregando...</div>
      ) : members.length === 0 ? (
        <div className="fam-empty card animate-fade-up">
          <div className="fam-empty-icon"><Users size={36} strokeWidth={1.5} /></div>
          <div className="fam-empty-title">Nenhum familiar cadastrado</div>
          <div className="fam-empty-sub">Clique em "+ Adicionar" para cadastrar o primeiro familiar com foto.</div>
        </div>
      ) : (
        <div className="fam-grid">
          {members.map((m, i) => (
            <div key={m.id} className="fam-card card animate-fade-up" style={{ animationDelay: `${i * 0.06}s` }}>
              <div className="fam-photo-wrap">
                {m.photo_url ? (
                  <Image src={m.photo_url} alt={m.name} fill style={{ objectFit: 'cover', borderRadius: '12px' }} />
                ) : (
                  <div className="fam-no-photo"><User size={32} strokeWidth={1.75} /></div>
                )}
              </div>
              <div className="fam-info">
                <div className="fam-name">{m.name}</div>
                <div className="fam-rel">{m.relation}</div>
              </div>
              <button className="fam-del" onClick={() => remove(m.id)} title="Remover"><Trash2 size={14} strokeWidth={2} /></button>
            </div>
          ))}
        </div>
      )}

      <style jsx>{`
        .fam-page { display: flex; flex-direction: column; gap: 1.4rem; }
        .fam-header { display: flex; align-items: flex-start; justify-content: space-between; gap: 1rem; }
        .fam-title { display: flex; align-items: center; gap: 10px; font-family: 'Source Serif 4', serif; font-size: 1.8rem; color: var(--text-primary); margin-bottom: 4px; }
        .fam-sub { color: var(--text-secondary); font-size: 0.88rem; line-height: 1.5; }
        .btn-add {
          background: var(--sage); color: #fff; border: none; border-radius: 8px;
          padding: 10px 20px; font-size: 0.9rem; font-weight: 700; white-space: nowrap; min-height: 44px; flex-shrink: 0;
        }
        .btn-add:hover { background: var(--sage-dark); }

        .fam-form { padding: 1.5rem; display: flex; flex-direction: column; gap: 1rem; }
        .fam-form-title { font-family: 'Source Serif 4', serif; font-size: 1.2rem; color: var(--text-primary); }
        .photo-upload {
          border: 2px dashed var(--cream-border); border-radius: 12px; overflow: hidden;
          cursor: pointer; transition: border-color 0.18s; height: 180px;
          display: flex; align-items: center; justify-content: center; position: relative;
        }
        .photo-upload:hover { border-color: var(--sage); }
        .photo-preview-wrap { position: absolute; inset: 0; }
        .photo-placeholder { display: flex; flex-direction: column; align-items: center; gap: 8px; color: var(--text-muted); }
        .photo-icon { display: flex; }
        .photo-label { font-size: 0.88rem; color: var(--text-muted); font-weight: 600; }
        .fam-field { display: flex; flex-direction: column; gap: 6px; }
        .fam-label { font-size: 0.9rem; font-weight: 700; color: var(--text-secondary); }
        .fam-error { background: #fef2f2; border: 1.5px solid #fca5a5; color: #b91c1c; padding: 10px 14px; border-radius: 8px; font-size: 0.88rem; font-weight: 600; }

        .fam-loading { text-align: center; color: var(--text-muted); padding: 2rem; }
        .fam-empty { padding: 3rem 2rem; text-align: center; }
        .fam-empty-icon { color: var(--text-muted); display: flex; justify-content: center; margin-bottom: 0.8rem; }
        .fam-empty-title { font-weight: 700; font-size: 1.05rem; color: var(--text-primary); margin-bottom: 6px; }
        .fam-empty-sub { font-size: 0.88rem; color: var(--text-muted); line-height: 1.5; }

        .fam-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(160px, 1fr)); gap: 14px; }
        .fam-card { padding: 1rem; display: flex; flex-direction: column; align-items: center; gap: 10px; position: relative; text-align: center; }
        .fam-photo-wrap { position: relative; width: 100px; height: 100px; border-radius: 10px; overflow: hidden; background: var(--cream-dark); flex-shrink: 0; }
        .fam-no-photo { width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; color: var(--text-muted); }
        .fam-info { flex: 1; }
        .fam-name { font-weight: 700; font-size: 0.92rem; color: var(--text-primary); }
        .fam-rel { font-size: 0.78rem; color: var(--text-muted); font-weight: 600; margin-top: 2px; }
        .fam-del {
          position: absolute; top: 8px; right: 8px;
          background: #fee2e2; color: #b91c1c; border: none; border-radius: 6px;
          display: flex; align-items: center; justify-content: center;
          width: 26px; height: 26px; padding: 0; min-height: unset; cursor: pointer; opacity: 0.7;
        }
        .fam-del:hover { opacity: 1; }

        @media (max-width: 480px) {
          .fam-header { flex-direction: column; }
          .btn-add { width: 100%; }
        }
      `}</style>
    </div>
  )
}
