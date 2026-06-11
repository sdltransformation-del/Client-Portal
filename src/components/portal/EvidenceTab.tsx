'use client'
import { useState, useEffect, useRef } from 'react'
import { SECTIONS } from '@/lib/data'
import { createClient } from '@/lib/supabase/client'

interface Props {
  clientId: string
  adminEvidence: Record<string, string[]>
}

export default function EvidenceTab({ clientId, adminEvidence }: Props) {
  const [activeSection, setActiveSection] = useState('s1')
  const [items, setItems] = useState<Record<string, string[]>>(adminEvidence)
  const [inputVal, setInputVal] = useState('')
  const [saving, setSaving] = useState(false)
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const supabase = createClient()

  const section = SECTIONS.find(s => s.id === activeSection)!
  const sectionItems = items[activeSection] || []

  async function addItem() {
    const text = inputVal.trim()
    if (!text) return
    const newItems = { ...items, [activeSection]: [...(items[activeSection] || []), text] }
    setItems(newItems)
    setInputVal('')
    setSaving(true)
    // Save to Supabase: delete all for this client+section and re-insert
    await supabase.from('evidence').delete().eq('client_id', clientId).eq('section', activeSection).eq('added_by', 'client')
    const toInsert = newItems[activeSection].map(content => ({ client_id: clientId, section: activeSection, content, added_by: 'client' }))
    if (toInsert.length > 0) await supabase.from('evidence').insert(toInsert)
    setSaving(false)
  }

  async function deleteItem(idx: number) {
    const updated = [...sectionItems]
    updated.splice(idx, 1)
    const newItems = { ...items, [activeSection]: updated }
    setItems(newItems)
    setSaving(true)
    await supabase.from('evidence').delete().eq('client_id', clientId).eq('section', activeSection).eq('added_by', 'client')
    if (updated.length > 0) await supabase.from('evidence').insert(updated.map(content => ({ client_id: clientId, section: activeSection, content, added_by: 'client' })))
    setSaving(false)
  }

  return (
    <div style={{ padding: '16px 48px 80px', maxWidth: '960px', margin: '0 auto' }} className="anim-fadeup">
      <div style={{ fontSize: '0.72rem', fontWeight: 600, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--blue)', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '8px' }}>
        <span style={{ width: '20px', height: '2px', background: 'var(--blue)', borderRadius: '1px', display: 'block' }} />Personal Evidence Sheet
      </div>
      <h1 style={{ fontFamily: 'var(--font-instrument)', fontSize: 'clamp(1.8rem,4vw,2.6rem)', fontWeight: 400, color: 'var(--stone-900)', marginBottom: '8px' }}>Your case for PDP</h1>
      <p style={{ fontSize: '0.95rem', color: 'var(--text-secondary)', lineHeight: 1.7, marginBottom: '36px', maxWidth: '520px' }}>This is a living document. Add to it whenever you notice something new. On hard days, come back and read it.</p>

      <div style={{ display: 'grid', gridTemplateColumns: '220px 1fr', gap: '20px', alignItems: 'start' }}>
        {/* Sidebar tabs */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', position: 'sticky', top: '140px' }}>
          {SECTIONS.map((s, i) => {
            const count = (items[s.id] || []).length
            const active = s.id === activeSection
            return (
              <button key={s.id} onClick={() => setActiveSection(s.id)} style={{
                display: 'flex', alignItems: 'center', gap: '10px', padding: '11px 14px', borderRadius: '10px',
                fontFamily: 'inherit', fontSize: '0.82rem', fontWeight: 600, color: active ? 'var(--stone-900)' : 'var(--text-muted)',
                background: active ? 'white' : 'none', border: 'none', cursor: 'pointer', textAlign: 'left', width: '100%',
                boxShadow: active ? '0 1px 8px rgba(27,79,216,0.1)' : 'none', transition: 'all 0.18s'
              }}>
                <span style={{ width: '22px', height: '22px', borderRadius: '50%', flexShrink: 0, background: active ? 'var(--blue)' : 'rgba(27,79,216,0.1)', color: active ? 'white' : 'var(--blue)', fontSize: '0.68rem', fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.18s' }}>
                  {i + 1}
                </span>
                <span style={{ flex: 1, lineHeight: 1.3 }}>{s.title}</span>
                {count > 0 && <span style={{ fontSize: '0.68rem', fontWeight: 700, background: 'rgba(27,79,216,0.08)', color: 'var(--blue)', padding: '1px 7px', borderRadius: '100px', minWidth: '20px', textAlign: 'center' }}>{count}</span>}
              </button>
            )
          })}
        </div>

        {/* Panel */}
        <div style={{ background: 'white', border: '1px solid rgba(27,79,216,0.1)', borderRadius: '16px', padding: '28px', minHeight: '400px' }} className="anim-fadeup">
          <div style={{ fontFamily: 'var(--font-instrument)', fontSize: '1.3rem', fontWeight: 400, color: 'var(--stone-900)', marginBottom: '6px' }}>{section.title}</div>
          <div style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', lineHeight: 1.65, marginBottom: '20px', maxWidth: '520px' }}>{section.desc}</div>

          {/* Items */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '12px' }}>
            {sectionItems.length === 0
              ? <div style={{ fontSize: '0.82rem', color: 'var(--stone-300)', fontStyle: 'italic', padding: '4px 0 8px 20px' }}>Nothing added yet.</div>
              : sectionItems.map((text, idx) => (
                <div key={idx} style={{ background: 'white', border: '1px solid rgba(27,79,216,0.1)', borderRadius: '12px', padding: '14px 16px', display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                  <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--blue)', flexShrink: 0, marginTop: '6px', opacity: 0.5 }} />
                  <div style={{ fontSize: '0.9rem', color: 'var(--stone-900)', lineHeight: 1.5, flex: 1 }}>{text}</div>
                  <button onClick={() => deleteItem(idx)} style={{ background: 'none', border: 'none', cursor: 'pointer', width: '26px', height: '26px', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--stone-300)', flexShrink: 0, transition: 'all 0.15s' }}>
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/></svg>
                  </button>
                </div>
              ))
            }
          </div>

          {/* Add row */}
          <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
            <textarea
              ref={inputRef}
              value={inputVal}
              onChange={e => setInputVal(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); addItem() } }}
              placeholder={`Add evidence for ${section.title.toLowerCase()}…`}
              rows={2}
              style={{ flex: 1, fontFamily: 'inherit', background: 'white', border: '1px solid rgba(27,79,216,0.15)', borderRadius: '10px', padding: '12px 14px', fontSize: '0.9rem', color: 'var(--stone-900)', outline: 'none', resize: 'none', lineHeight: 1.5, minHeight: '44px' }}
            />
            <button onClick={addItem} disabled={saving} style={{ display: 'inline-flex', alignItems: 'center', gap: '7px', padding: '12px 20px', background: 'var(--blue)', color: 'white', fontFamily: 'inherit', fontSize: '0.82rem', fontWeight: 700, border: 'none', borderRadius: '10px', cursor: 'pointer', whiteSpace: 'nowrap', flexShrink: 0 }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M12 5v14M5 12h14"/></svg>
              Add
            </button>
          </div>
          {saving && <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '8px' }}>Saving…</div>}
        </div>
      </div>
    </div>
  )
}
