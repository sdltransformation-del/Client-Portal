'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'

interface Action {
  id: string
  content: string
}

interface Statement {
  id: string
  content: string
  actions: Action[]
}

interface Props {
  client: { id: string; name: string }
}

const EXAMPLES = [
  {
    statement: 'I am pain-free, and I move through my life without fear because I now know my brain is the source of my symptoms, and I know my mindset will decide whether I continue to have them or not.',
    actions: [
      'I will read my evidence sheet every morning to remind myself why my symptoms are safe.',
      'I will stick to my gradual exposure process and return to the things I stopped doing, one step at a time.',
    ],
  },
  {
    statement: 'I am a confident person. I believe in myself, and I use my thoughts and actions every day to prove that to myself.',
    actions: [
      'I will pursue my goals with discipline every single day.',
      'I will speak and think about myself the way the best version of me already does.',
    ],
  },
  {
    statement: 'I am a positive person. I choose to create positivity in my life by thinking positive thoughts and by chasing a better version of myself every day.',
    actions: [
      'I will start each day by putting positive thoughts in my mind about who I am becoming and feeling grateful for the life I am living.',
      'I will spend time each day on something that makes me feel good about who I am becoming.',
    ],
  },
]

const ORANGE = '#f97316'
const DARK = '#18181b'

export default function IdealSelfTab({ client }: Props) {
  const supabase = createClient()
  const [statements, setStatements] = useState<Statement[]>([])
  const [stmtInput, setStmtInput] = useState('')
  const [actionInputs, setActionInputs] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function load() {
      const { data: stmts, error: stmtErr } = await supabase
        .from('ideal_self_statements')
        .select('id,content,sort_order')
        .eq('client_id', client.id)
        .order('sort_order', { ascending: true })

      if (stmtErr) { setError(stmtErr.message); setLoading(false); return }

      const { data: acts, error: actErr } = await supabase
        .from('ideal_self_actions')
        .select('id,statement_id,content,sort_order')
        .eq('client_id', client.id)
        .order('sort_order', { ascending: true })

      if (actErr) { setError(actErr.message); setLoading(false); return }

      const built: Statement[] = (stmts || []).map(s => ({
        id: s.id,
        content: s.content,
        actions: (acts || []).filter((a: { statement_id: string }) => a.statement_id === s.id),
      }))
      setStatements(built)
      setLoading(false)
    }
    load()
  }, [])

  async function addStatement() {
    const text = stmtInput.trim()
    if (!text) return
    const full = text.startsWith('I am') || text.startsWith('i am') ? text : `I am ${text}`
    const { data, error: err } = await supabase
      .from('ideal_self_statements')
      .insert({ client_id: client.id, content: full, sort_order: statements.length })
      .select()
    if (err) { setError(err.message); return }
    if (data?.[0]) {
      setStatements(prev => [...prev, { id: data[0].id, content: full, actions: [] }])
      setStmtInput('')
    }
  }

  async function removeStatement(id: string) {
    setStatements(prev => prev.filter(s => s.id !== id))
    await supabase.from('ideal_self_statements').delete().eq('id', id)
  }

  async function addAction(statementId: string) {
    const text = (actionInputs[statementId] || '').trim()
    if (!text) return
    const stmt = statements.find(s => s.id === statementId)
    const { data, error: err } = await supabase
      .from('ideal_self_actions')
      .insert({ client_id: client.id, statement_id: statementId, content: text, sort_order: stmt?.actions.length ?? 0 })
      .select()
    if (err) { setError(err.message); return }
    if (data?.[0]) {
      setStatements(prev => prev.map(s => s.id === statementId ? { ...s, actions: [...s.actions, { id: data[0].id, content: text }] } : s))
      setActionInputs(prev => ({ ...prev, [statementId]: '' }))
    }
  }

  async function removeAction(statementId: string, actionId: string) {
    setStatements(prev => prev.map(s => s.id === statementId ? { ...s, actions: s.actions.filter(a => a.id !== actionId) } : s))
    await supabase.from('ideal_self_actions').delete().eq('id', actionId)
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
      <div style={{ marginBottom: '32px' }}>
        <div style={{ fontSize: '0.62rem', fontWeight: 700, letterSpacing: '0.16em', textTransform: 'uppercase', color: '#a1a1aa', marginBottom: '14px' }}>
          Examples to get you started
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {EXAMPLES.map((ex, i) => (
            <div key={i} style={{ background: DARK, borderRadius: '14px', overflow: 'hidden' }}>
              {/* Statement */}
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', padding: '18px 20px' }}>
                <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: ORANGE, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: '1px' }}>
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round"><path d="M20 6L9 17l-5-5"/></svg>
                </div>
                <div style={{ fontSize: '0.9rem', fontWeight: 600, color: 'white', lineHeight: 1.6, fontStyle: 'italic' }}>{ex.statement}</div>
              </div>
              {/* Actions */}
              <div style={{ borderTop: '1px solid rgba(255,255,255,0.07)', padding: '12px 20px 16px 56px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div style={{ fontSize: '0.58rem', fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.25)', marginBottom: '4px' }}>Example daily actions</div>
                {ex.actions.map((a, j) => (
                  <div key={j} style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                    <div style={{ width: '5px', height: '5px', borderRadius: '50%', background: ORANGE, flexShrink: 0, marginTop: '7px', opacity: 0.7 }} />
                    <div style={{ fontSize: '0.83rem', color: 'rgba(255,255,255,0.5)', lineHeight: 1.6 }}>{a}</div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Error */}
      {error && (
        <div style={{ background: '#fee2e2', border: '1px solid #fca5a5', borderRadius: '10px', padding: '12px 16px', marginBottom: '20px', fontSize: '0.84rem', color: '#dc2626' }}>
          {error}
        </div>
      )}

      {/* Statements */}
      {loading ? (
        <div style={{ fontSize: '0.85rem', color: '#a1a1aa', padding: '16px 0' }}>Loading...</div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '20px' }}>
          {statements.length === 0 && (
            <div style={{ background: 'white', border: '1px dashed #d4d4d8', borderRadius: '14px', padding: '32px', textAlign: 'center', fontSize: '0.88rem', color: '#a1a1aa' }}>
              No statements yet. Add your first one below.
            </div>
          )}
          {statements.map(stmt => (
            <div key={stmt.id} style={{ borderRadius: '14px', overflow: 'hidden', border: '1.5px solid #18181b' }}>
              {/* Dark header — statement */}
              <div style={{ background: DARK, padding: '18px 20px', display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: ORANGE, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: '2px' }}>
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round"><path d="M20 6L9 17l-5-5"/></svg>
                </div>
                <div style={{ flex: 1, fontSize: '0.93rem', fontWeight: 600, color: 'white', lineHeight: 1.65, fontStyle: 'italic' }}>{stmt.content}</div>
                <button onClick={() => removeStatement(stmt.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.25)', padding: '2px', display: 'flex', flexShrink: 0 }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M18 6L6 18M6 6l12 12"/></svg>
                </button>
              </div>

              {/* Actions */}
              <div style={{ background: 'white' }}>
                {stmt.actions.length > 0 && (
                  <div style={{ padding: '12px 20px 4px 56px' }}>
                    <div style={{ fontSize: '0.58rem', fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: '#a1a1aa', marginBottom: '8px' }}>Daily actions</div>
                    {stmt.actions.map(action => (
                      <div key={action.id} style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', marginBottom: '8px' }}>
                        <div style={{ width: '5px', height: '5px', borderRadius: '50%', background: ORANGE, flexShrink: 0, marginTop: '7px' }} />
                        <div style={{ flex: 1, fontSize: '0.86rem', color: '#52525b', lineHeight: 1.55 }}>{action.content}</div>
                        <button onClick={() => removeAction(stmt.id, action.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#d4d4d8', padding: '2px', display: 'flex', flexShrink: 0 }}>
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M18 6L6 18M6 6l12 12"/></svg>
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {/* Add action input */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 12px', borderTop: stmt.actions.length > 0 ? '1px solid #f4f4f5' : 'none' }}>
                  <input
                    value={actionInputs[stmt.id] || ''}
                    onChange={e => setActionInputs(prev => ({ ...prev, [stmt.id]: e.target.value }))}
                    onKeyDown={e => { if (e.key === 'Enter') addAction(stmt.id) }}
                    placeholder="Add a daily action for this statement..."
                    style={{ flex: 1, fontFamily: 'inherit', fontSize: '0.84rem', color: DARK, border: '1px solid #e4e4e7', borderRadius: '8px', padding: '8px 12px', outline: 'none', background: '#fafafa' }}
                  />
                  <button
                    onClick={() => addAction(stmt.id)}
                    disabled={!(actionInputs[stmt.id] || '').trim()}
                    style={{ fontFamily: 'inherit', fontSize: '0.78rem', fontWeight: 700, padding: '8px 14px', background: (actionInputs[stmt.id] || '').trim() ? ORANGE : '#f4f4f5', color: (actionInputs[stmt.id] || '').trim() ? 'white' : '#a1a1aa', border: 'none', borderRadius: '8px', cursor: (actionInputs[stmt.id] || '').trim() ? 'pointer' : 'not-allowed', transition: 'all 0.2s', flexShrink: 0 }}
                  >
                    Add
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add new statement */}
      <div style={{ background: 'white', border: '1.5px solid #e4e4e7', borderRadius: '14px', overflow: 'hidden' }}>
        <div style={{ padding: '8px 14px 0', fontSize: '0.62rem', fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: ORANGE }}>
          New I am statement
        </div>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <div style={{ padding: '0 8px 0 14px', fontSize: '0.82rem', fontWeight: 800, color: ORANGE, flexShrink: 0 }}>I am</div>
          <input
            value={stmtInput}
            onChange={e => setStmtInput(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') addStatement() }}
            placeholder="confident and getting stronger every day..."
            style={{ flex: 1, fontFamily: 'inherit', fontSize: '0.9rem', color: DARK, border: 'none', padding: '12px 8px', outline: 'none', background: 'transparent' }}
          />
          <button
            onClick={addStatement}
            disabled={!stmtInput.trim()}
            style={{ fontFamily: 'inherit', fontSize: '0.8rem', fontWeight: 700, padding: '10px 18px', background: stmtInput.trim() ? DARK : '#f4f4f5', color: stmtInput.trim() ? 'white' : '#a1a1aa', border: 'none', cursor: stmtInput.trim() ? 'pointer' : 'not-allowed', transition: 'all 0.2s', margin: '6px', borderRadius: '8px', flexShrink: 0 }}
          >
            Add
          </button>
        </div>
      </div>
      <div style={{ fontSize: '0.72rem', color: '#a1a1aa', marginTop: '8px', paddingLeft: '2px' }}>
        "I am" is added automatically. Press Enter to add.
      </div>
    </div>
  )
}
