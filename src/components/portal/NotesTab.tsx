'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'

interface Note {
  id: string
  text: string
  created_at: string
}

interface Props {
  client: { id: string }
}

function formatDate(iso: string) {
  const d = new Date(iso)
  const days = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday']
  const months = ['January','February','March','April','May','June','July','August','September','October','November','December']
  return `${days[d.getDay()]}, ${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`
}

export default function NotesTab({ client }: Props) {
  const [notes, setNotes] = useState<Note[]>([])
  const [text, setText] = useState('')
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  const now = new Date()
  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
  const dateLabel = `${now.getDate()} ${months[now.getMonth()]} ${now.getFullYear()}`

  useEffect(() => { loadNotes() }, [])

  async function loadNotes() {
    const { data } = await supabase
      .from('journal_entries')
      .select('*')
      .eq('client_id', client.id)
      .order('created_at', { ascending: false })
    setNotes(data || [])
    setLoading(false)
  }

  async function saveNote() {
    if (!text.trim()) return
    const { data } = await supabase
      .from('journal_entries')
      .insert({ client_id: client.id, text: text.trim() })
      .select()
    if (data?.[0]) setNotes(prev => [data[0], ...prev])
    setText('')
  }

  async function deleteNote(id: string) {
    await supabase.from('journal_entries').delete().eq('id', id)
    setNotes(prev => prev.filter(n => n.id !== id))
  }

  return (
    <div style={{ padding: '16px 48px 80px', maxWidth: '960px', margin: '0 auto' }} className="anim-fadeup">
      <div style={{ fontSize: '0.72rem', fontWeight: 600, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--blue)', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '8px' }}>
        <span style={{ width: '20px', height: '2px', background: 'var(--blue)', borderRadius: '1px', display: 'block' }} />Recovery Journal
      </div>
      <h1 style={{ fontFamily: 'var(--font-instrument)', fontSize: 'clamp(1.8rem,4vw,2.6rem)', fontWeight: 400, color: 'var(--stone-900)', marginBottom: '8px' }}>What happened today?</h1>
      <p style={{ fontSize: '0.95rem', color: 'var(--text-secondary)', lineHeight: 1.7, marginBottom: '36px', maxWidth: '520px' }}>Something that strengthened your conviction. A doubt you overcame. A feeling you let yourself feel. A movement without fear. A realization. A doubt you still need to work on. Everything counts.</p>

      {/* Composer */}
      <div style={{ background: 'white', border: '1.5px solid rgba(27,79,216,0.12)', borderRadius: '18px', padding: '22px 24px', marginBottom: '32px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
          <span style={{ fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--blue)', background: 'rgba(27,79,216,0.08)', padding: '4px 12px', borderRadius: '100px' }}>{dateLabel}</span>
          <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{text.length} characters</span>
        </div>
        <textarea
          value={text}
          onChange={e => setText(e.target.value)}
          placeholder="Write anything. It doesn't have to be big. Maybe the pain spiked and you didn't panic. Maybe you went for a walk anyway. Maybe you caught yourself catastrophising and chose something different. Write it down."
          style={{ width: '100%', minHeight: '160px', fontFamily: 'inherit', fontSize: '0.95rem', color: 'var(--stone-900)', lineHeight: 1.75, background: 'var(--stone-50)', border: '1px solid rgba(27,79,216,0.1)', borderRadius: '12px', padding: '16px 18px', resize: 'none', outline: 'none', transition: 'all 0.2s' }}
        />
        <div style={{ marginTop: '14px', display: 'flex', justifyContent: 'flex-end' }}>
          <button onClick={saveNote} style={{ display: 'inline-flex', alignItems: 'center', gap: '7px', fontFamily: 'inherit', fontSize: '0.85rem', fontWeight: 700, padding: '12px 22px', borderRadius: '10px', border: 'none', background: 'var(--blue)', color: 'white', cursor: 'pointer', transition: 'all 0.2s' }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M12 5v14M5 12h14"/></svg>
            Save note
          </button>
        </div>
      </div>

      {/* Feed header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
        <div style={{ fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--text-muted)' }}>Previous notes</div>
        <div style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--text-muted)' }}>{notes.length} {notes.length === 1 ? 'note' : 'notes'}</div>
      </div>

      {loading ? (
        <div style={{ fontSize: '0.88rem', color: 'var(--text-muted)', padding: '24px 0' }}>Loading…</div>
      ) : notes.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '48px 24px', color: 'var(--text-muted)', fontSize: '0.9rem', lineHeight: 1.7 }}>
          <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" style={{ opacity: 0.25, display: 'block', margin: '0 auto 12px' }}>
            <path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4L16.5 3.5z"/>
          </svg>
          Nothing written yet. Your first note might be the most important one.
        </div>
      ) : notes.map(n => (
        <div key={n.id} style={{ background: 'white', border: '1px solid rgba(27,79,216,0.1)', borderRadius: '14px', padding: '20px 22px', marginBottom: '12px', transition: 'all 0.2s' }} className="anim-fadeup">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px', gap: '12px' }}>
            <div style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--stone-700)' }}>{formatDate(n.created_at)}</div>
            <button onClick={() => deleteNote(n.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', width: '28px', height: '28px', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--stone-300)', flexShrink: 0, transition: 'all 0.15s' }}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/></svg>
            </button>
          </div>
          <div style={{ fontSize: '0.92rem', color: 'var(--stone-900)', lineHeight: 1.75, whiteSpace: 'pre-wrap' }}>{n.text}</div>
        </div>
      ))}
    </div>
  )
}
