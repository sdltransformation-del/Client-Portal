'use client'
import { useState } from 'react'
import { RESOURCES, RES_CATEGORIES } from '@/lib/data'

const TYPE_LABELS: Record<string, string> = { study: 'Study', article: 'Article', book: 'Book' }

const StudyIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="#1B4FD8" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" width="20" height="20">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/>
    <line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/>
  </svg>
)
const ArticleIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="#1B4FD8" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" width="20" height="20">
    <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
  </svg>
)
const BookIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="#1B4FD8" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" width="20" height="20">
    <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
  </svg>
)

function TypeIcon({ type }: { type: string }) {
  if (type === 'study') return <StudyIcon />
  if (type === 'book') return <BookIcon />
  return <ArticleIcon />
}

export default function ResourcesTab() {
  const [readIds, setReadIds] = useState<Set<string>>(new Set())
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set())

  function toggleRead(id: string) {
    setReadIds(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n })
  }
  function toggleSaved(id: string) {
    setSavedIds(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n })
  }

  const grouped = Object.fromEntries(RES_CATEGORIES.map(c => [c.id, RESOURCES.filter(r => r.cat === c.id)]))

  return (
    <div style={{ padding: '16px 48px 80px', maxWidth: '960px', margin: '0 auto' }} className="anim-fadeup">
      <div style={{ fontSize: '0.72rem', fontWeight: 600, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--blue)', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '8px' }}>
        <span style={{ width: '20px', height: '2px', background: 'var(--blue)', borderRadius: '1px', display: 'block' }} />Resources
      </div>
      <h1 style={{ fontFamily: 'var(--font-instrument)', fontSize: 'clamp(1.8rem,4vw,2.6rem)', fontWeight: 400, color: 'var(--stone-900)', marginBottom: '8px' }}>Research & reading</h1>
      <p style={{ fontSize: '0.95rem', color: 'var(--text-secondary)', lineHeight: 1.7, marginBottom: '36px', maxWidth: '520px' }}>Every study, book, and article behind this program. Save anything useful and mark things as read as you go.</p>

      {RES_CATEGORIES.map((cat, ci) => {
        const items = grouped[cat.id] || []
        if (!items.length) return null
        return (
          <div key={cat.id}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', margin: ci === 0 ? '0 0 14px' : '28px 0 14px' }}>
              <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: 'var(--blue)', color: 'white', fontSize: '0.68rem', fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>{ci + 1}</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--stone-900)' }}>{cat.heading}</div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '2px' }}>{cat.sub}</div>
              </div>
              <div style={{ flex: '0 0 1px', height: '1px', background: 'rgba(27,79,216,0.08)', flexGrow: 1 }} />
            </div>

            {items.map(r => (
              <div key={r.id} style={{
                background: 'white', border: '1.5px solid rgba(27,79,216,0.1)', borderRadius: '16px', padding: '20px 22px',
                marginBottom: '12px', display: 'flex', alignItems: 'flex-start', gap: '16px',
                opacity: readIds.has(r.id) ? 0.6 : 1, transition: 'all 0.2s'
              }}>
                <div style={{ width: '44px', height: '44px', flexShrink: 0, borderRadius: '11px', background: 'rgba(27,79,216,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <TypeIcon type={r.type} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: '0.67rem', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--blue)', marginBottom: '3px' }}>{TYPE_LABELS[r.type]}</div>
                  <div style={{ fontSize: '0.97rem', fontWeight: 700, color: 'var(--stone-900)', lineHeight: 1.35, marginBottom: '5px' }}>{r.title}</div>
                  <div style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '7px' }}>{r.source}</div>
                  <div style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', lineHeight: 1.65, marginBottom: '10px' }}>{r.desc}</div>
                  {r.finding && (
                    <div style={{ fontSize: '0.84rem', fontWeight: 600, color: 'var(--stone-900)', lineHeight: 1.55, background: 'rgba(27,79,216,0.05)', borderLeft: '3px solid var(--blue)', padding: '8px 12px', borderRadius: '0 8px 8px 0', marginBottom: '12px' }}>
                      {r.finding}
                    </div>
                  )}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                    {r.tags.map((t, ti) => (
                      <span key={t} style={{ fontSize: '0.67rem', fontWeight: 600, padding: '3px 10px', borderRadius: '100px', background: ti === 0 ? 'rgba(27,79,216,0.08)' : 'var(--stone-100)', color: ti === 0 ? 'var(--blue)' : 'var(--stone-700)' }}>{t}</span>
                    ))}
                    {r.url && (
                      <a href={r.url} target="_blank" rel="noopener noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', fontSize: '0.78rem', fontWeight: 600, color: 'var(--blue)', textDecoration: 'none', marginTop: '4px' }}>
                        Read
                        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
                      </a>
                    )}
                  </div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '7px', flexShrink: 0, alignItems: 'flex-end' }}>
                  <button onClick={() => toggleSaved(r.id)} style={{ fontFamily: 'inherit', fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.04em', padding: '5px 12px', borderRadius: '100px', border: '1.5px solid', cursor: 'pointer', background: savedIds.has(r.id) ? 'var(--blue)' : 'white', color: savedIds.has(r.id) ? 'white' : 'var(--text-muted)', borderColor: savedIds.has(r.id) ? 'var(--blue)' : 'var(--stone-200)', whiteSpace: 'nowrap' }}>
                    {savedIds.has(r.id) ? '★ Saved' : '☆ Save'}
                  </button>
                  <button onClick={() => toggleRead(r.id)} style={{ fontFamily: 'inherit', fontSize: '0.7rem', fontWeight: 700, padding: '5px 12px', borderRadius: '100px', border: `1.5px solid ${readIds.has(r.id) ? '#15803d' : 'var(--stone-200)'}`, cursor: 'pointer', background: readIds.has(r.id) ? '#dcfce7' : 'white', color: readIds.has(r.id) ? '#15803d' : 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                    {readIds.has(r.id) ? '✓ Read' : 'Mark read'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )
      })}
    </div>
  )
}
