'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'

interface EvidenceItem {
  id: string
  side: 'for' | 'against'
  text: string
  counter_argument: string | null
  sort_order: number
}

interface Props {
  client: { id: string; name: string }
}

export default function EvidenceTab({ client }: Props) {
  const supabase = createClient()
  const [items, setItems] = useState<EvidenceItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.from('evidence_items').select('*').eq('client_id', client.id).order('sort_order')
      .then(({ data }) => {
        if (data) setItems(data as EvidenceItem[])
        setLoading(false)
      })
  }, [])

  const forItems = items.filter(i => i.side === 'for')
  const againstItems = items.filter(i => i.side === 'against')
  const firstName = client.name.split(' ')[0]

  const ORANGE = '#f97316'
  const DARK = '#18181b'

  if (loading) return (
    <div style={{ padding: '48px', color: '#a1a1aa', fontSize: '0.9rem' }}>Loading...</div>
  )

  return (
    <div style={{ padding: '32px 40px 80px', maxWidth: '900px', margin: '0 auto' }} className="anim-fadeup">
      <div style={{ marginBottom: '32px' }}>
        <div style={{ fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: ORANGE, marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ display: 'block', width: '20px', height: '2px', background: ORANGE, borderRadius: '1px' }} />
          Your case
        </div>
        <h1 style={{ fontFamily: 'var(--font-instrument)', fontSize: 'clamp(1.8rem,4vw,2.4rem)', fontWeight: 400, color: DARK, marginBottom: '8px' }}>
          {firstName}&apos;s Evidence Sheet
        </h1>
        <p style={{ fontSize: '0.88rem', color: '#71717a', lineHeight: 1.65, maxWidth: '540px' }}>
          This is the case we built together on your first call. Come back to this whenever doubt creeps in.
        </p>
      </div>

      {items.length === 0 ? (
        <div style={{ background: 'white', border: '1px solid #e4e4e7', borderRadius: '16px', padding: '56px', textAlign: 'center' }}>
          <div style={{ fontSize: '0.9rem', color: '#a1a1aa', lineHeight: 1.6 }}>
            Your evidence sheet will appear here after your first call with Serge.
          </div>
        </div>
      ) : (
        <div style={{ background: 'white', border: '1px solid #e4e4e7', borderRadius: '16px', overflow: 'hidden' }}>
          {/* Header */}
          <div style={{ background: DARK, padding: '20px 28px' }}>
            <div style={{ fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.16em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.3)', marginBottom: '5px' }}>Evidence Sheet</div>
            <div style={{ fontFamily: 'var(--font-instrument)', fontSize: '1.3rem', fontWeight: 400, color: 'white' }}>{firstName}&apos;s Case</div>
          </div>

          {/* Columns */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1px 1fr' }}>
            {/* For */}
            <div style={{ padding: '24px 26px' }}>
              <div style={{ fontSize: '0.68rem', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: ORANGE, borderBottom: `2px solid ${ORANGE}`, paddingBottom: '10px', marginBottom: '18px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>
                Why this is brain-generated pain
              </div>
              {forItems.length === 0 ? (
                <div style={{ fontSize: '0.85rem', color: '#d1d5db', fontStyle: 'italic' }}>Nothing added yet.</div>
              ) : forItems.map(item => (
                <div key={item.id} style={{ display: 'flex', gap: '10px', marginBottom: '14px' }}>
                  <div style={{ width: '5px', height: '5px', borderRadius: '50%', background: ORANGE, flexShrink: 0, marginTop: '7px' }} />
                  <div style={{ fontSize: '0.88rem', color: DARK, lineHeight: 1.65 }}>{item.text}</div>
                </div>
              ))}
            </div>

            {/* Divider */}
            <div style={{ background: '#f4f4f5' }} />

            {/* Against */}
            <div style={{ padding: '24px 26px' }}>
              <div style={{ fontSize: '0.68rem', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#a1a1aa', borderBottom: '2px solid #e4e4e7', paddingBottom: '10px', marginBottom: '18px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                Why I used to think it was structural
              </div>
              {againstItems.length === 0 ? (
                <div style={{ fontSize: '0.85rem', color: '#d1d5db', fontStyle: 'italic' }}>Nothing added yet.</div>
              ) : againstItems.map(item => (
                <div key={item.id} style={{ marginBottom: '18px' }}>
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <div style={{ width: '5px', height: '5px', borderRadius: '50%', background: '#d1d5db', flexShrink: 0, marginTop: '7px' }} />
                    <div style={{ fontSize: '0.88rem', color: '#71717a', lineHeight: 1.65, textDecoration: item.counter_argument ? 'line-through' : 'none', opacity: item.counter_argument ? 0.55 : 1 }}>
                      {item.text}
                    </div>
                  </div>
                  {item.counter_argument && (
                    <div style={{ marginLeft: '15px', marginTop: '8px', background: 'rgba(249,115,22,0.06)', border: '1px solid rgba(249,115,22,0.18)', borderRadius: '9px', padding: '11px 14px' }}>
                      <div style={{ fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: ORANGE, marginBottom: '5px' }}>The Truth</div>
                      <div style={{ fontSize: '0.85rem', color: '#3f3f46', lineHeight: 1.65 }}>{item.counter_argument}</div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
