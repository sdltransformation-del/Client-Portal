'use client'
import { useState } from 'react'
import { EVIDENCE_CHECKLIST_ITEMS, PERSONALITY_ITEMS } from '@/lib/data'
import { createClient } from '@/lib/supabase/client'

interface Props {
  clientId: string
  adminEvidence: Record<string, string[]>
}

export default function EvidenceTab({ clientId, adminEvidence }: Props) {
  const [items, setItems] = useState<Record<string, string[]>>(adminEvidence)
  const [historyInput, setHistoryInput] = useState('')
  const [storyInput, setStoryInput] = useState('')
  const [saving, setSaving] = useState(false)
  const supabase = createClient()

  const checklist = items['checklist'] || []
  const history = items['history'] || []
  const personality = items['personality'] || []
  const story = items['story'] || []

  async function persist(section: string, newItems: string[]) {
    setSaving(true)
    await supabase.from('evidence').delete().eq('client_id', clientId).eq('section', section).eq('added_by', 'client')
    if (newItems.length > 0) await supabase.from('evidence').insert(newItems.map(content => ({ client_id: clientId, section, content, added_by: 'client' })))
    setSaving(false)
  }

  async function toggleChecklist(text: string) {
    const next = checklist.includes(text) ? checklist.filter(t => t !== text) : [...checklist, text]
    setItems(p => ({ ...p, checklist: next }))
    await persist('checklist', next)
  }

  async function togglePersonality(text: string) {
    const next = personality.includes(text) ? personality.filter(t => t !== text) : [...personality, text]
    setItems(p => ({ ...p, personality: next }))
    await persist('personality', next)
  }

  async function addHistory() {
    const text = historyInput.trim(); if (!text) return
    const next = [...history, text]
    setItems(p => ({ ...p, history: next }))
    setHistoryInput('')
    await persist('history', next)
  }

  async function deleteHistory(idx: number) {
    const next = history.filter((_, i) => i !== idx)
    setItems(p => ({ ...p, history: next }))
    await persist('history', next)
  }

  async function addStory() {
    const text = storyInput.trim(); if (!text) return
    const next = [...story, text]
    setItems(p => ({ ...p, story: next }))
    setStoryInput('')
    await persist('story', next)
  }

  async function deleteStory(idx: number) {
    const next = story.filter((_, i) => i !== idx)
    setItems(p => ({ ...p, story: next }))
    await persist('story', next)
  }

  const checklistNotes = checklist.filter(t => !EVIDENCE_CHECKLIST_ITEMS.includes(t))

  async function addChecklistNote() {
    const text = (document.getElementById('checklist-note') as HTMLTextAreaElement)?.value.trim()
    if (!text) return
    const next = [...checklist, text]
    setItems(p => ({ ...p, checklist: next }))
    ;(document.getElementById('checklist-note') as HTMLTextAreaElement).value = ''
    await persist('checklist', next)
  }

  async function deleteChecklistNote(text: string) {
    const next = checklist.filter(t => t !== text)
    setItems(p => ({ ...p, checklist: next }))
    await persist('checklist', next)
  }

  return (
    <div style={{ padding: '16px 48px 80px', maxWidth: '1100px', margin: '0 auto' }} className="anim-fadeup">
      <div style={{ fontSize: '0.72rem', fontWeight: 600, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--blue)', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '8px' }}>
        <span style={{ width: '20px', height: '2px', background: 'var(--blue)', borderRadius: '1px', display: 'block' }} />Personal Evidence Sheet
      </div>
      <h1 style={{ fontFamily: 'var(--font-instrument)', fontSize: 'clamp(1.8rem,4vw,2.6rem)', fontWeight: 400, color: 'var(--stone-900)', marginBottom: '8px' }}>Your case for PDP</h1>
      <p style={{ fontSize: '0.95rem', color: 'var(--text-secondary)', lineHeight: 1.7, marginBottom: '36px', maxWidth: '520px' }}>This is a living document. Add to it whenever you notice something new. On hard days, come back and read it.</p>

      {/* Evidence checklist — full width */}
      <div style={{ background: 'white', border: '1px solid rgba(27,79,216,0.1)', borderRadius: '16px', padding: '28px', marginBottom: '20px' }}>
        <div style={{ fontFamily: 'var(--font-instrument)', fontSize: '1.3rem', fontWeight: 400, color: 'var(--stone-900)', marginBottom: '4px' }}>Evidence checklist</div>
        <div style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', lineHeight: 1.65, marginBottom: '22px' }}>Check every statement that applies to your symptoms. Each one is evidence that your pain is neuroplastic, not structural.</div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px', marginBottom: '22px' }}>
          {EVIDENCE_CHECKLIST_ITEMS.map((text, i) => {
            const checked = checklist.includes(text)
            return (
              <div
                key={i}
                onClick={() => toggleChecklist(text)}
                style={{
                  display: 'flex', alignItems: 'flex-start', gap: '10px', padding: '10px 12px',
                  borderRadius: '10px', border: `1.5px solid ${checked ? 'rgba(27,79,216,0.25)' : 'rgba(27,79,216,0.08)'}`,
                  background: checked ? 'rgba(27,79,216,0.04)' : 'var(--stone-50)',
                  cursor: 'pointer', transition: 'all 0.18s', userSelect: 'none'
                }}
              >
                <div style={{
                  width: '18px', height: '18px', borderRadius: '5px', flexShrink: 0, marginTop: '2px',
                  border: `2px solid ${checked ? 'var(--blue)' : 'rgba(27,79,216,0.2)'}`,
                  background: checked ? 'var(--blue)' : 'white',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.18s'
                }}>
                  {checked && <svg width="10" height="10" viewBox="0 0 14 14" fill="none"><path d="M2.5 7l3.5 3.5 5.5-7" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>}
                </div>
                <div style={{ fontSize: '0.82rem', color: checked ? 'var(--stone-900)' : 'var(--stone-600)', lineHeight: 1.5, fontWeight: checked ? 500 : 400, transition: 'color 0.18s' }}>
                  {text}
                </div>
              </div>
            )
          })}
        </div>

        <div style={{ borderTop: '1px solid rgba(27,79,216,0.08)', paddingTop: '18px' }}>
          <div style={{ fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '10px' }}>Add your own examples</div>
          {checklistNotes.length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '10px' }}>
              {checklistNotes.map((text, idx) => (
                <div key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', background: 'var(--stone-50)', border: '1px solid rgba(27,79,216,0.08)', borderRadius: '8px', padding: '9px 12px' }}>
                  <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--blue)', flexShrink: 0, marginTop: '6px', opacity: 0.4 }} />
                  <div style={{ fontSize: '0.85rem', color: 'var(--stone-900)', lineHeight: 1.5, flex: 1 }}>{text}</div>
                  <button onClick={() => deleteChecklistNote(text)} style={{ background: 'none', border: 'none', cursor: 'pointer', width: '22px', height: '22px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--stone-300)', flexShrink: 0 }}>
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M18 6L6 18M6 6l12 12"/></svg>
                  </button>
                </div>
              ))}
            </div>
          )}
          <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
            <textarea
              id="checklist-note"
              placeholder="Describe a specific example from your own life…"
              rows={2}
              style={{ flex: 1, fontFamily: 'inherit', background: 'white', border: '1px solid rgba(27,79,216,0.15)', borderRadius: '10px', padding: '10px 12px', fontSize: '0.88rem', color: 'var(--stone-900)', outline: 'none', resize: 'none', lineHeight: 1.5 }}
              onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); addChecklistNote() } }}
            />
            <button onClick={addChecklistNote} style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '10px 18px', background: 'var(--blue)', color: 'white', fontFamily: 'inherit', fontSize: '0.82rem', fontWeight: 700, border: 'none', borderRadius: '10px', cursor: 'pointer', whiteSpace: 'nowrap', flexShrink: 0 }}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M12 5v14M5 12h14"/></svg>
              Add
            </button>
          </div>
        </div>
      </div>

      {/* Personality — full width */}
      <div style={{ background: 'white', border: '1px solid rgba(27,79,216,0.1)', borderRadius: '16px', padding: '28px', marginBottom: '20px' }}>
        <div style={{ fontFamily: 'var(--font-instrument)', fontSize: '1.3rem', fontWeight: 400, color: 'var(--stone-900)', marginBottom: '4px' }}>My personality</div>
        <div style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', lineHeight: 1.65, marginBottom: '20px' }}>Research shows a strong link between these traits and neuroplastic pain. Check every one that resonates.</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px' }}>
          {PERSONALITY_ITEMS.map((text, i) => {
            const checked = personality.includes(text)
            return (
              <div
                key={i}
                onClick={() => togglePersonality(text)}
                style={{
                  display: 'flex', alignItems: 'flex-start', gap: '10px', padding: '10px 12px',
                  borderRadius: '10px', border: `1.5px solid ${checked ? 'rgba(27,79,216,0.25)' : 'rgba(27,79,216,0.08)'}`,
                  background: checked ? 'rgba(27,79,216,0.04)' : 'var(--stone-50)',
                  cursor: 'pointer', transition: 'all 0.18s', userSelect: 'none'
                }}
              >
                <div style={{
                  width: '18px', height: '18px', borderRadius: '5px', flexShrink: 0, marginTop: '2px',
                  border: `2px solid ${checked ? 'var(--blue)' : 'rgba(27,79,216,0.2)'}`,
                  background: checked ? 'var(--blue)' : 'white',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.18s'
                }}>
                  {checked && <svg width="10" height="10" viewBox="0 0 14 14" fill="none"><path d="M2.5 7l3.5 3.5 5.5-7" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>}
                </div>
                <div style={{ fontSize: '0.82rem', color: checked ? 'var(--stone-900)' : 'var(--stone-600)', lineHeight: 1.5, fontWeight: checked ? 500 : 400, transition: 'color 0.18s' }}>{text}</div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Symptoms & history + My life & my pain — 2 columns */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>

        {/* Symptoms & history */}
        <div style={{ background: 'white', border: '1px solid rgba(27,79,216,0.1)', borderRadius: '16px', padding: '24px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div>
            <div style={{ fontFamily: 'var(--font-instrument)', fontSize: '1.3rem', fontWeight: 400, color: 'var(--stone-900)', marginBottom: '4px' }}>Symptoms & history</div>
            <div style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', lineHeight: 1.65 }}>Every symptom, scan, and diagnosis — past and present. Include things that seem unrelated.</div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', flex: 1 }}>
            {history.length === 0
              ? <div style={{ fontSize: '0.8rem', color: 'var(--stone-300)', fontStyle: 'italic' }}>Nothing added yet.</div>
              : history.map((text, idx) => (
                <div key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', background: 'var(--stone-50)', border: '1px solid rgba(27,79,216,0.08)', borderRadius: '8px', padding: '8px 10px' }}>
                  <div style={{ width: '5px', height: '5px', borderRadius: '50%', background: 'var(--blue)', flexShrink: 0, marginTop: '6px', opacity: 0.4 }} />
                  <div style={{ fontSize: '0.84rem', color: 'var(--stone-900)', lineHeight: 1.5, flex: 1 }}>{text}</div>
                  <button onClick={() => deleteHistory(idx)} style={{ background: 'none', border: 'none', cursor: 'pointer', width: '20px', height: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--stone-300)', flexShrink: 0 }}>
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M18 6L6 18M6 6l12 12"/></svg>
                  </button>
                </div>
              ))
            }
          </div>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
            <textarea value={historyInput} onChange={e => setHistoryInput(e.target.value)} onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); addHistory() } }} placeholder="Add a symptom or finding…" rows={2} style={{ flex: 1, fontFamily: 'inherit', background: 'white', border: '1px solid rgba(27,79,216,0.15)', borderRadius: '8px', padding: '9px 11px', fontSize: '0.84rem', color: 'var(--stone-900)', outline: 'none', resize: 'none', lineHeight: 1.5 }} />
            <button onClick={addHistory} style={{ padding: '9px 14px', background: 'var(--blue)', color: 'white', fontFamily: 'inherit', fontSize: '0.78rem', fontWeight: 700, border: 'none', borderRadius: '8px', cursor: 'pointer', flexShrink: 0 }}>Add</button>
          </div>
        </div>

        {/* My life & my pain */}
        <div style={{ background: 'white', border: '1px solid rgba(27,79,216,0.1)', borderRadius: '16px', padding: '24px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div>
            <div style={{ fontFamily: 'var(--font-instrument)', fontSize: '1.3rem', fontWeight: 400, color: 'var(--stone-900)', marginBottom: '4px' }}>My life & my pain</div>
            <div style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', lineHeight: 1.65 }}>When did it start? What was happening emotionally and in your life at that exact time? The story of your pain and the story of your life will rhyme.</div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', flex: 1 }}>
            {story.length === 0
              ? <div style={{ fontSize: '0.8rem', color: 'var(--stone-300)', fontStyle: 'italic' }}>Nothing added yet.</div>
              : story.map((text, idx) => (
                <div key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', background: 'var(--stone-50)', border: '1px solid rgba(27,79,216,0.08)', borderRadius: '8px', padding: '8px 10px' }}>
                  <div style={{ width: '5px', height: '5px', borderRadius: '50%', background: 'var(--blue)', flexShrink: 0, marginTop: '6px', opacity: 0.4 }} />
                  <div style={{ fontSize: '0.84rem', color: 'var(--stone-900)', lineHeight: 1.5, flex: 1 }}>{text}</div>
                  <button onClick={() => deleteStory(idx)} style={{ background: 'none', border: 'none', cursor: 'pointer', width: '20px', height: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--stone-300)', flexShrink: 0 }}>
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M18 6L6 18M6 6l12 12"/></svg>
                  </button>
                </div>
              ))
            }
          </div>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
            <textarea value={storyInput} onChange={e => setStoryInput(e.target.value)} onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); addStory() } }} placeholder="Write freely…" rows={3} style={{ flex: 1, fontFamily: 'inherit', background: 'white', border: '1px solid rgba(27,79,216,0.15)', borderRadius: '8px', padding: '9px 11px', fontSize: '0.84rem', color: 'var(--stone-900)', outline: 'none', resize: 'none', lineHeight: 1.5 }} />
            <button onClick={addStory} style={{ padding: '9px 14px', background: 'var(--blue)', color: 'white', fontFamily: 'inherit', fontSize: '0.78rem', fontWeight: 700, border: 'none', borderRadius: '8px', cursor: 'pointer', flexShrink: 0 }}>Add</button>
          </div>
        </div>
      </div>

      {saving && <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '12px', textAlign: 'right' }}>Saving…</div>}
    </div>
  )
}
