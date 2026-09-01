'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'

interface Props {
  client: { id: string; name: string }
}

const EXAMPLES = [
  'I am pain-free, and I move through my life without fear.',
  'I am confident in my body — it is structurally sound and fully capable of healing.',
  'I am not afraid of symptoms because I understand their cause.',
  'I am someone who processes emotions freely rather than storing them in my body.',
  'I am returning to everything I stopped doing out of fear.',
  'I am strong. My nervous system is learning safety and I am helping it get there.',
  'I am at peace with uncertainty and I trust this process fully.',
  'I am the kind of person who faces discomfort with curiosity, not panic.',
]

const ORANGE = '#f97316'
const DARK = '#18181b'

export default function IdealSelfTab({ client }: Props) {
  const supabase = createClient()
  const [statements, setStatements] = useState<string[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    supabase.from('ideal_self_statements').select('id,content,sort_order').eq('client_id', client.id).order('sort_order', { ascending: true })
      .then(({ data }) => {
        if (data) setStatements(data.map((r: { content: string }) => r.content))
        setLoading(false)
      })
  }, [])

  async function addStatement() {
    const text = input.trim()
    if (!text) return
    const sortOrder = statements.length
    const full = text.startsWith('I am') || text.startsWith('i am') ? text : `I am ${text}`
    const { data } = await supabase.from('ideal_self_statements').insert({ client_id: client.id, content: full, sort_order: sortOrder }).select()
    if (data?.[0]) setStatements(prev => [...prev, full])
    setInput('')
  }

  async function removeStatement(idx: number) {
    const text = statements[idx]
    setStatements(prev => prev.filter((_, i) => i !== idx))
    await supabase.from('ideal_self_statements').delete().eq('client_id', client.id).eq('content', text)
  }

  const firstName = client.name.split(' ')[0]

  return (
    <div style={{ padding: '32px 40px 80px', maxWidth: '760px', margin: '0 auto' }} className="anim-fadeup">

      {/* Header */}
      <div style={{ marginBottom: '32px' }}>
        <div style={{ fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: ORANGE, marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ display: 'block', width: '20px', height: '2px', background: ORANGE, borderRadius: '1px' }} />
          Identity work
        </div>
        <h1 style={{ fontFamily: 'var(--font-instrument)', fontSize: 'clamp(1.8rem,4vw,2.4rem)', fontWeight: 400, color: DARK, marginBottom: '10px' }}>
          My Ideal Self
        </h1>
        <p style={{ fontSize: '0.88rem', color: '#71717a', lineHeight: 1.7, maxWidth: '520px' }}>
          Your brain responds to identity. The more clearly you can picture and declare who you are becoming, the faster your nervous system follows. Write your "I am" statements and read them every day.
        </p>
      </div>

      {/* Examples */}
      <div style={{ background: DARK, borderRadius: '16px', padding: '22px 24px', marginBottom: '28px' }}>
        <div style={{ fontSize: '0.62rem', fontWeight: 700, letterSpacing: '0.16em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.35)', marginBottom: '14px' }}>
          Examples to inspire you
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {EXAMPLES.map((ex, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
              <div style={{ width: '5px', height: '5px', borderRadius: '50%', background: ORANGE, flexShrink: 0, marginTop: '8px' }} />
              <div style={{ fontSize: '0.88rem', color: 'rgba(255,255,255,0.65)', lineHeight: 1.6, fontStyle: 'italic' }}>{ex}</div>
            </div>
          ))}
        </div>
      </div>

      {/* User's statements */}
      <div style={{ marginBottom: '20px' }}>
        <div style={{ fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: DARK, marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={ORANGE} strokeWidth="2.5" strokeLinecap="round"><path d="M20 6L9 17l-5-5"/></svg>
          {firstName}&apos;s statements
        </div>

        {loading ? (
          <div style={{ fontSize: '0.85rem', color: '#a1a1aa', padding: '16px 0' }}>Loading...</div>
        ) : statements.length === 0 ? (
          <div style={{ background: 'white', border: '1px dashed #d4d4d8', borderRadius: '14px', padding: '32px', textAlign: 'center' }}>
            <div style={{ fontSize: '0.88rem', color: '#a1a1aa', lineHeight: 1.6 }}>
              No statements yet. Add your first one below.
            </div>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {statements.map((s, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '14px', background: 'white', border: `1.5px solid rgba(249,115,22,0.2)`, borderRadius: '14px', padding: '16px 18px' }}>
                <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: ORANGE, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: '1px' }}>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round"><path d="M20 6L9 17l-5-5"/></svg>
                </div>
                <div style={{ flex: 1, fontSize: '0.95rem', fontWeight: 600, color: DARK, lineHeight: 1.55 }}>{s}</div>
                <button
                  onClick={() => removeStatement(i)}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#d4d4d8', padding: '2px', display: 'flex', flexShrink: 0 }}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M18 6L6 18M6 6l12 12"/></svg>
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add new */}
      <div style={{ background: 'white', border: '1.5px solid #e4e4e7', borderRadius: '14px', overflow: 'hidden' }}>
        <div style={{ padding: '6px 14px', background: '#f97316', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ fontSize: '0.7rem', fontWeight: 700, color: 'white', letterSpacing: '0.08em' }}>I am</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <input
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') addStatement() }}
            placeholder="pain-free and living without fear..."
            style={{ flex: 1, fontFamily: 'inherit', fontSize: '0.92rem', color: DARK, border: 'none', padding: '14px 16px', outline: 'none', background: 'transparent' }}
          />
          <button
            onClick={addStatement}
            disabled={!input.trim()}
            style={{ fontFamily: 'inherit', fontSize: '0.82rem', fontWeight: 700, padding: '10px 18px', background: input.trim() ? DARK : '#f4f4f5', color: input.trim() ? 'white' : '#a1a1aa', border: 'none', borderLeft: '1px solid #f4f4f5', cursor: input.trim() ? 'pointer' : 'not-allowed', transition: 'all 0.2s', margin: '6px', borderRadius: '8px' }}
          >
            Add
          </button>
        </div>
      </div>
      <div style={{ fontSize: '0.72rem', color: '#a1a1aa', marginTop: '8px', paddingLeft: '2px' }}>
        Type just the ending — "I am" is added for you. Press Enter to add.
      </div>
    </div>
  )
}
