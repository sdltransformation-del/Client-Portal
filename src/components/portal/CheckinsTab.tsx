'use client'
import { useState, useEffect, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'

interface Message {
  id: string
  content: string
  from_admin: boolean
  created_at: string
}

interface Props {
  client: { id: string; name: string }
}

function formatDate(iso: string) {
  const d = new Date(iso)
  return d.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' }) + ' · ' +
    d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })
}

export default function CheckinsTab({ client }: Props) {
  const supabase = createClient()
  const [messages, setMessages] = useState<Message[]>([])
  const [text, setText] = useState('')
  const [sending, setSending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    supabase.from('checkin_messages').select('*').eq('client_id', client.id).order('created_at', { ascending: true })
      .then(({ data }) => { if (data) setMessages(data as Message[]); setLoading(false) })
  }, [])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  async function send() {
    if (!text.trim() || sending) return
    setSending(true)
    setError(null)
    const { data, error: err } = await supabase.from('checkin_messages').insert({ client_id: client.id, content: text.trim(), from_admin: false }).select()
    if (err) {
      console.error('checkin insert error:', err)
      setError(err.message)
    } else if (data?.[0]) {
      setMessages(prev => [...prev, data[0] as Message])
      setText('')
    }
    setSending(false)
  }

  const ORANGE = '#f97316'
  const DARK = '#18181b'

  return (
    <div style={{ padding: '32px 40px 80px', maxWidth: '760px', margin: '0 auto' }} className="anim-fadeup">
      {/* Header */}
      <div style={{ marginBottom: '28px' }}>
        <div style={{ fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: ORANGE, marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ display: 'block', width: '20px', height: '2px', background: ORANGE, borderRadius: '1px' }} />
          Every 3 days
        </div>
        <h1 style={{ fontFamily: 'var(--font-instrument)', fontSize: 'clamp(1.8rem,4vw,2.4rem)', fontWeight: 400, color: DARK, marginBottom: '14px' }}>Check-ins</h1>
        <div style={{ background: 'white', border: '1px solid #e4e4e7', borderRadius: '14px', padding: '18px 20px' }}>
          <div style={{ fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: ORANGE, marginBottom: '10px' }}>What to include</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {[
              'New bits of evidence you\'ve noticed — moments where the pattern showed itself clearly.',
              'Any doubts or worries about the process or your diagnosis.',
              'Your symptoms right now — any shifts, changes, or movement.',
              'A win, even a small one.',
              'Any question you want Serge to address.',
            ].map((item, i) => (
              <div key={i} style={{ display: 'flex', gap: '10px' }}>
                <div style={{ width: '3px', borderRadius: '2px', background: ORANGE, flexShrink: 0, marginTop: '2px' }} />
                <div style={{ fontSize: '0.86rem', color: '#52525b', lineHeight: 1.6 }}>{item}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Thread */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '24px', minHeight: '120px' }}>
        {loading ? (
          <div style={{ fontSize: '0.85rem', color: '#a1a1aa', padding: '24px 0' }}>Loading...</div>
        ) : messages.length === 0 ? (
          <div style={{ background: 'white', border: '1px solid #e4e4e7', borderRadius: '14px', padding: '40px', textAlign: 'center' }}>
            <div style={{ fontSize: '0.9rem', color: '#a1a1aa', lineHeight: 1.6 }}>
              No check-ins yet. Write your first one below.
            </div>
          </div>
        ) : messages.map(msg => (
          <div key={msg.id} style={{ display: 'flex', flexDirection: 'column', alignItems: msg.from_admin ? 'flex-start' : 'flex-end' }}>
            <div style={{ fontSize: '0.68rem', fontWeight: 600, color: '#a1a1aa', marginBottom: '5px', paddingLeft: msg.from_admin ? '4px' : '0', paddingRight: msg.from_admin ? '0' : '4px' }}>
              {msg.from_admin ? 'Serge' : 'You'} · {formatDate(msg.created_at)}
            </div>
            <div style={{
              maxWidth: '88%',
              background: msg.from_admin ? 'white' : DARK,
              color: msg.from_admin ? DARK : 'white',
              border: msg.from_admin ? '1px solid #e4e4e7' : 'none',
              borderRadius: msg.from_admin ? '4px 14px 14px 14px' : '14px 4px 14px 14px',
              padding: '14px 18px',
              fontSize: '0.88rem',
              lineHeight: 1.7,
              whiteSpace: 'pre-wrap',
            }}>
              {msg.content}
            </div>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      {/* Compose */}
      <div style={{ background: 'white', border: '1.5px solid #e4e4e7', borderRadius: '14px', overflow: 'hidden', position: 'sticky', bottom: '24px', boxShadow: '0 4px 24px rgba(0,0,0,0.08)' }}>
        <textarea
          value={text}
          onChange={e => setText(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) send() }}
          placeholder="Write your check-in here..."
          rows={4}
          style={{ width: '100%', fontFamily: 'inherit', fontSize: '0.9rem', color: DARK, border: 'none', padding: '16px 18px', resize: 'none', outline: 'none', lineHeight: 1.65, background: 'transparent' }}
        />
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', borderTop: '1px solid #f4f4f5' }}>
          <span style={{ fontSize: '0.72rem', color: error ? '#dc2626' : '#a1a1aa' }}>{error || '⌘ + Enter to send'}</span>
          <button
            onClick={send}
            disabled={!text.trim() || sending}
            style={{ fontFamily: 'inherit', fontSize: '0.84rem', fontWeight: 700, padding: '9px 20px', background: text.trim() ? DARK : '#f4f4f5', color: text.trim() ? 'white' : '#a1a1aa', border: 'none', borderRadius: '9px', cursor: text.trim() ? 'pointer' : 'not-allowed', transition: 'all 0.2s' }}
          >
            {sending ? 'Sending...' : 'Send check-in'}
          </button>
        </div>
      </div>
    </div>
  )
}
