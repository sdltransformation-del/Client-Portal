'use client'
import { useState } from 'react'
import { RESOURCES, RES_CATEGORIES } from '@/lib/data'

const TYPE_LABELS: Record<string, string> = { study: 'Study', article: 'Article' }

export default function ResourcesTab() {
  const [activeSection, setActiveSection] = useState<string | null>(null)
  const [readIds, setReadIds] = useState<Set<string>>(new Set())
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set())

  function toggleRead(id: string) {
    setReadIds(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n })
  }
  function toggleSaved(id: string) {
    setSavedIds(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n })
  }

  const categories = RES_CATEGORIES.filter(c => c.id !== 'books')
  const grouped = Object.fromEntries(categories.map(c => [c.id, RESOURCES.filter(r => r.cat === c.id && r.type !== 'book')]))
  const active = categories.find(c => c.id === activeSection)
  const activeItems = activeSection ? grouped[activeSection] || [] : []

  if (activeSection && active) {
    return (
      <div style={{ padding: '16px 48px 80px', maxWidth: '960px', margin: '0 auto' }} className="anim-fadeup">
        <button
          onClick={() => setActiveSection(null)}
          style={{ display: 'inline-flex', alignItems: 'center', gap: '7px', fontFamily: 'inherit', fontSize: '0.78rem', fontWeight: 600, color: 'var(--blue)', background: 'none', border: 'none', cursor: 'pointer', marginBottom: '28px', padding: 0 }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M19 12H5M12 5l-7 7 7 7"/></svg>
          Back to all sections
        </button>

        <div style={{ marginBottom: '32px' }}>
          <div style={{ fontSize: '0.72rem', fontWeight: 600, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--blue)', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ width: '20px', height: '2px', background: 'var(--blue)', borderRadius: '1px', display: 'block' }} />
            {String(categories.indexOf(active) + 1).padStart(2, '0')} of {categories.length}
          </div>
          <h1 style={{ fontFamily: 'var(--font-instrument)', fontSize: 'clamp(1.6rem,3.5vw,2.2rem)', fontWeight: 400, color: 'var(--stone-900)', marginBottom: '8px', lineHeight: 1.2 }}>{active.heading}</h1>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: 1.7, maxWidth: '560px' }}>{active.sub}</p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {activeItems.map(r => (
            <div key={r.id} style={{ background: 'white', border: '1px solid rgba(27,79,216,0.1)', borderRadius: '16px', padding: '22px 24px', opacity: readIds.has(r.id) ? 0.6 : 1, transition: 'opacity 0.2s' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '16px', marginBottom: '12px' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                    <span style={{ fontSize: '0.67rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--blue)', background: 'rgba(27,79,216,0.08)', padding: '2px 9px', borderRadius: '100px' }}>{TYPE_LABELS[r.type] || r.type}</span>
                  </div>
                  <div style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--stone-900)', lineHeight: 1.35, marginBottom: '4px' }}>{r.title}</div>
                  <div style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-muted)' }}>{r.source}</div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '7px', flexShrink: 0 }}>
                  <button onClick={() => toggleSaved(r.id)} style={{ fontFamily: 'inherit', fontSize: '0.7rem', fontWeight: 700, padding: '5px 12px', borderRadius: '100px', border: '1.5px solid', cursor: 'pointer', background: savedIds.has(r.id) ? 'var(--blue)' : 'white', color: savedIds.has(r.id) ? 'white' : 'var(--text-muted)', borderColor: savedIds.has(r.id) ? 'var(--blue)' : 'var(--stone-200)', whiteSpace: 'nowrap' }}>
                    {savedIds.has(r.id) ? '★ Saved' : '☆ Save'}
                  </button>
                  <button onClick={() => toggleRead(r.id)} style={{ fontFamily: 'inherit', fontSize: '0.7rem', fontWeight: 700, padding: '5px 12px', borderRadius: '100px', border: `1.5px solid ${readIds.has(r.id) ? '#15803d' : 'var(--stone-200)'}`, cursor: 'pointer', background: readIds.has(r.id) ? '#dcfce7' : 'white', color: readIds.has(r.id) ? '#15803d' : 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                    {readIds.has(r.id) ? '✓ Read' : 'Mark read'}
                  </button>
                </div>
              </div>

              <div style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: 1.7, marginBottom: r.finding ? '14px' : '0' }}>{r.desc}</div>

              {r.finding && (
                <div style={{ fontSize: '0.88rem', fontWeight: 600, color: 'var(--stone-900)', lineHeight: 1.6, background: 'rgba(27,79,216,0.05)', borderLeft: '3px solid var(--blue)', padding: '10px 14px', borderRadius: '0 8px 8px 0', marginBottom: r.url ? '14px' : '0' }}>
                  {r.finding}
                </div>
              )}

              {r.url && (
                <a href={r.url} target="_blank" rel="noopener noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', fontSize: '0.8rem', fontWeight: 600, color: 'var(--blue)', textDecoration: 'none', marginTop: '12px' }}>
                  Read full article
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
                </a>
              )}
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div style={{ padding: '16px 48px 80px', maxWidth: '960px', margin: '0 auto' }} className="anim-fadeup">
      <div style={{ fontSize: '0.72rem', fontWeight: 600, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--blue)', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '8px' }}>
        <span style={{ width: '20px', height: '2px', background: 'var(--blue)', borderRadius: '1px', display: 'block' }} />Research & reading
      </div>
      <p style={{ fontSize: '0.97rem', color: 'var(--text-secondary)', lineHeight: 1.75, marginBottom: '40px', maxWidth: '600px' }}>
        The medical system wants you to believe that this type of recovery work is unscientific. The truth is the opposite. The evidence base behind this approach is deep, peer-reviewed, and damning to the conventional model. Every resource here was chosen to show you exactly how well-established this science actually is.
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '14px' }}>
        {categories.map((cat, i) => {
          const count = grouped[cat.id]?.length || 0
          const isLast = i === categories.length - 1
          return (
            <div
              key={cat.id}
              onClick={() => setActiveSection(cat.id)}
              style={{
                gridColumn: isLast && categories.length % 2 !== 0 ? '1 / -1' : undefined,
                maxWidth: isLast && categories.length % 2 !== 0 ? '50%' : undefined,
                background: 'white',
                border: '1px solid rgba(27,79,216,0.1)',
                borderRadius: '16px',
                padding: '24px',
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
            >
              <div style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--blue)', lineHeight: 1, marginBottom: '10px', opacity: 0.35 }}>
                {String(i + 1).padStart(2, '0')}
              </div>
              <div style={{ fontSize: '0.97rem', fontWeight: 700, color: 'var(--stone-900)', lineHeight: 1.35, marginBottom: '8px' }}>{cat.heading}</div>
              <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', lineHeight: 1.6, marginBottom: '16px' }}>{cat.sub}</div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--text-muted)' }}>{count} {count === 1 ? 'resource' : 'resources'}</span>
                <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--blue)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  View all
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                </span>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
