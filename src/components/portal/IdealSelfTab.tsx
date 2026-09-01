'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'

interface Props {
  client: { id: string; name: string }
}

const EXAMPLES = [
  'I am pain-free, and I move through my life without fear because I now know my brain is the source of my symptoms, and I know my mindset will decide whether I continue to have them or not.',
  'I am a confident person. I believe in myself, and I use my thoughts and actions every day to prove that to myself.',
  'I am a positive person. I choose to create positivity in my life by thinking positive thoughts and by chasing a better version of myself every day.',
]

const ORANGE = '#f97316'
const DARK = '#18181b'

export default function IdealSelfTab({ client }: Props) {
  const supabase = createClient()
  const [statements, setStatements] = useState<{ id: string; content: string }[]>([])
  const [actions, setActions] = useState<{ id: string; content: string }[]>([])
  const [stmtInput, setStmtInput] = useState('')
  const [actionInput, setActionInput] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      supabase.from('ideal_self_statements').select('id,content,sort_order').eq('client_id', client.id).order('sort_order', { ascending: true }),
      supabase.from('ideal_self_actions').select('id,content,sort_order').eq('client_id', client.id).order('sort_order', { ascending: true }),
    ]).then(([{ data: stmts }, { data: acts }]) => {
      if (stmts) setStatements(stmts as { id: string; content: string }[])
      if (acts) setActions(acts as { id: string; content: string }[])
      setLoading(false)
    })
  }, [])

  async function addStatement() {
    const text = stmtInput.trim()
    if (!text) return
    const full = text.startsWith('I am') || text.startsWith('i am') ? text : `I am ${text}`
    const { data, error } = await supabase.from('ideal_self_statements').insert({ client_id: client.id, content: full, sort_order: statements.length }).select()
    if (data?.[0]) setStatements(prev => [...prev, data[0] as { id: string; content: string }])
    if (!error) setStmtInput('')
  }

  async function removeStatement(id: string) {
    setStatements(prev => prev.filter(s => s.id !== id))
    await supabase.from('ideal_self_statements').delete().eq('id', id)
  }

  async function addAction() {
    const text = actionInput.trim()
    if (!text) return
    const { data, error } = await supabase.from('ideal_self_actions').insert({ client_id: client.id, content: text, sort_order: actions.length }).select()
    if (data?.[0]) setActions(prev => [...prev, data[0] as { id: string; content: string }])
    if (!error) setActionInput('')
  }

  async function removeAction(id: string) {
    setActions(prev => prev.filter(a => a.id !== id))
    await supabase.from('ideal_self_actions').delete().eq('id', id)
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
        <h1 style={{ fontFamily: 'var(--font-instrument)', fontSize: 'clamp(1.8rem,4vw,2.4rem)', fontWeight: 400, color: DARK, marginBottom: '14px' }}>
          My Ideal Self
        </h1>
        <p style={{ fontSize: '0.9rem', color: '#52525b', lineHeight: 1.8, maxWidth: '560px' }}>
          Your identity shapes your nervous system. When you pursue a stronger, more capable version of yourself every day, two things happen. A stronger self perceives less danger, so negative emotions and discomfort stop feeling threatening and lose their power to fuel the pain signal. And you give your mind something real to move toward — instead of circling around symptoms, your attention anchors to who you are becoming.
        </p>
      </div>

      {/* Examples */}
      <div style={{ background: DARK, borderRadius: '16px', padding: '22px 24px', marginBottom: '32px' }}>
        <div style={{ fontSize: '0.62rem', fontWeight: 700, letterSpacing: '0.16em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.35)', marginBottom: '16px' }}>
          Examples to get you started
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {EXAMPLES.map((ex, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
              <div style={{ width: '5px', height: '5px', borderRadius: '50%', background: ORANGE, flexShrink: 0, marginTop: '9px' }} />
              <div style={{ fontSize: '0.88rem', color: 'rgba(255,255,255,0.65)', lineHeight: 1.65, fontStyle: 'italic' }}>{ex}</div>
            </div>
          ))}
        </div>
      </div>

      {/* I AM STATEMENTS */}
      <div style={{ marginBottom: '36px' }}>
        <div style={{ background: DARK, borderRadius: '14px 14px 0 0', padding: '16px 22px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div style={{ fontSize: '0.6rem', fontWeight: 700, letterSpacing: '0.16em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.35)', marginBottom: '2px' }}>Identity statements</div>
            <div style={{ fontSize: '0.95rem', fontWeight: 700, color: 'white' }}>{firstName}&apos;s I Am Statements</div>
          </div>
        </div>

        <div style={{ background: 'white', border: '1.5px solid #18181b', borderTop: 'none', borderRadius: '0 0 14px 14px', overflow: 'hidden' }}>
          {loading ? (
            <div style={{ padding: '24px', fontSize: '0.85rem', color: '#a1a1aa' }}>Loading...</div>
          ) : statements.length === 0 ? (
            <div style={{ padding: '32px', textAlign: 'center', fontSize: '0.88rem', color: '#a1a1aa' }}>
              No statements yet. Add your first one below.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              {statements.map((s, i) => (
                <div key={s.id} style={{ display: 'flex', alignItems: 'flex-start', gap: '14px', padding: '16px 20px', borderTop: i > 0 ? '1px solid #f4f4f5' : 'none' }}>
                  <div style={{ width: '26px', height: '26px', borderRadius: '50%', background: ORANGE, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: '1px' }}>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round"><path d="M20 6L9 17l-5-5"/></svg>
                  </div>
                  <div style={{ flex: 1, fontSize: '0.93rem', fontWeight: 600, color: DARK, lineHeight: 1.6 }}>{s.content}</div>
                  <button onClick={() => removeStatement(s.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#d4d4d8', padding: '2px', display: 'flex', flexShrink: 0 }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M18 6L6 18M6 6l12 12"/></svg>
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Add statement input */}
          <div style={{ borderTop: '1px solid #f4f4f5', display: 'flex', alignItems: 'center', background: '#fafafa' }}>
            <div style={{ padding: '0 12px', fontSize: '0.78rem', fontWeight: 800, color: ORANGE, flexShrink: 0 }}>I am</div>
            <input
              value={stmtInput}
              onChange={e => setStmtInput(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') addStatement() }}
              placeholder="pain-free and living without fear..."
              style={{ flex: 1, fontFamily: 'inherit', fontSize: '0.9rem', color: DARK, border: 'none', padding: '14px 8px', outline: 'none', background: 'transparent' }}
            />
            <button
              onClick={addStatement}
              disabled={!stmtInput.trim()}
              style={{ fontFamily: 'inherit', fontSize: '0.8rem', fontWeight: 700, padding: '10px 16px', background: stmtInput.trim() ? ORANGE : '#f4f4f5', color: stmtInput.trim() ? 'white' : '#a1a1aa', border: 'none', cursor: stmtInput.trim() ? 'pointer' : 'not-allowed', transition: 'all 0.2s', margin: '6px', borderRadius: '8px', flexShrink: 0 }}
            >
              Add
            </button>
          </div>
        </div>
      </div>

      {/* DAILY ACTIONS */}
      <div>
        <div style={{ background: DARK, borderRadius: '14px 14px 0 0', padding: '16px 22px' }}>
          <div style={{ fontSize: '0.6rem', fontWeight: 700, letterSpacing: '0.16em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.35)', marginBottom: '2px' }}>Commitments</div>
          <div style={{ fontSize: '0.95rem', fontWeight: 700, color: 'white' }}>My Daily Actions</div>
          <div style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.4)', marginTop: '4px' }}>What will you do each day to become this person?</div>
        </div>

        <div style={{ background: 'white', border: '1.5px solid #18181b', borderTop: 'none', borderRadius: '0 0 14px 14px', overflow: 'hidden' }}>
          {loading ? (
            <div style={{ padding: '24px', fontSize: '0.85rem', color: '#a1a1aa' }}>Loading...</div>
          ) : actions.length === 0 ? (
            <div style={{ padding: '32px', textAlign: 'center', fontSize: '0.88rem', color: '#a1a1aa' }}>
              No actions yet. Add something you will commit to daily.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              {actions.map((a, i) => (
                <div key={a.id} style={{ display: 'flex', alignItems: 'flex-start', gap: '14px', padding: '16px 20px', borderTop: i > 0 ? '1px solid #f4f4f5' : 'none' }}>
                  <div style={{ width: '26px', height: '26px', borderRadius: '8px', background: '#f4f4f5', border: '1.5px solid #e4e4e7', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: '1px' }}>
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke={ORANGE} strokeWidth="2.5" strokeLinecap="round"><path d="M20 6L9 17l-5-5"/></svg>
                  </div>
                  <div style={{ flex: 1, fontSize: '0.93rem', color: DARK, lineHeight: 1.6 }}>{a.content}</div>
                  <button onClick={() => removeAction(a.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#d4d4d8', padding: '2px', display: 'flex', flexShrink: 0 }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M18 6L6 18M6 6l12 12"/></svg>
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Add action input */}
          <div style={{ borderTop: '1px solid #f4f4f5', display: 'flex', alignItems: 'center', background: '#fafafa' }}>
            <input
              value={actionInput}
              onChange={e => setActionInput(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') addAction() }}
              placeholder="I will read my I am statements every morning..."
              style={{ flex: 1, fontFamily: 'inherit', fontSize: '0.9rem', color: DARK, border: 'none', padding: '14px 16px', outline: 'none', background: 'transparent' }}
            />
            <button
              onClick={addAction}
              disabled={!actionInput.trim()}
              style={{ fontFamily: 'inherit', fontSize: '0.8rem', fontWeight: 700, padding: '10px 16px', background: actionInput.trim() ? ORANGE : '#f4f4f5', color: actionInput.trim() ? 'white' : '#a1a1aa', border: 'none', cursor: actionInput.trim() ? 'pointer' : 'not-allowed', transition: 'all 0.2s', margin: '6px', borderRadius: '8px', flexShrink: 0 }}
            >
              Add
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
