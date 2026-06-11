'use client'
import { useState } from 'react'
import { VIDEOS, CAT_LABELS } from '@/lib/data'

type Filter = 'all' | 'foundation' | 'mechanism' | 'emotional' | 'recovery'

export default function LibraryTab() {
  const [filter, setFilter] = useState<Filter>('all')
  const [modal, setModal] = useState<{ id: string; title: string; meta: string; duration: string } | null>(null)

  const filtered = filter === 'all' ? VIDEOS : VIDEOS.filter(v => v.cat === filter)
  const filters: Filter[] = ['all', 'foundation', 'mechanism', 'emotional', 'recovery']

  return (
    <div style={{ padding: '16px 48px 80px', maxWidth: '960px', margin: '0 auto' }} className="anim-fadeup">
      <div style={{ fontSize: '0.72rem', fontWeight: 600, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--blue)', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '8px' }}>
        <span style={{ width: '20px', height: '2px', background: 'var(--blue)', borderRadius: '1px', display: 'block' }} />Video Library
      </div>
      <h1 style={{ fontFamily: 'var(--font-instrument)', fontSize: 'clamp(1.8rem,4vw,2.6rem)', fontWeight: 400, color: 'var(--stone-900)', marginBottom: '8px' }}>All videos</h1>
      <p style={{ fontSize: '0.95rem', color: 'var(--text-secondary)', lineHeight: 1.7, marginBottom: '36px', maxWidth: '520px' }}>Watch at your own pace. Return to anything as often as you need.</p>

      {/* Filters */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '24px', flexWrap: 'wrap' }}>
        {filters.map(f => (
          <button key={f} onClick={() => setFilter(f)} style={{
            fontFamily: 'inherit', fontSize: '0.75rem', fontWeight: 600, letterSpacing: '0.07em', textTransform: 'uppercase',
            padding: '8px 18px', borderRadius: '100px',
            border: '1px solid rgba(27,79,216,0.15)',
            background: filter === f ? 'var(--blue)' : 'white',
            color: filter === f ? 'white' : 'var(--text-muted)',
            cursor: 'pointer', transition: 'all 0.2s'
          }}>
            {f === 'all' ? 'All' : CAT_LABELS[f]}
          </button>
        ))}
      </div>

      {/* Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '18px' }}>
        {filtered.map(v => (
          <div key={v.id} onClick={() => setModal({ id: v.id, title: v.title, meta: v.meta, duration: v.duration })}
            style={{ background: 'white', border: '1px solid rgba(27,79,216,0.1)', borderRadius: '14px', overflow: 'hidden', cursor: 'pointer', transition: 'all 0.2s' }}>
            <div style={{ aspectRatio: '16/9', background: 'var(--blue-pale)', position: 'relative', overflow: 'hidden' }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={`https://img.youtube.com/vi/${v.id}/hqdefault.jpg`} alt={v.title} loading="lazy" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
              <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(11,26,46,0.2)' }}>
                <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 16px rgba(11,26,46,0.25)' }}>
                  <div style={{ width: 0, height: 0, borderStyle: 'solid', borderWidth: '8px 0 8px 16px', borderColor: 'transparent transparent transparent var(--blue)', marginLeft: '3px' }} />
                </div>
              </div>
            </div>
            <div style={{ padding: '15px 17px 17px' }}>
              <div style={{ fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--blue)', marginBottom: '4px' }}>{CAT_LABELS[v.cat]}</div>
              <div style={{ fontSize: '0.92rem', fontWeight: 700, color: 'var(--stone-900)', lineHeight: 1.35, marginBottom: '6px' }}>{v.title}</div>
              <div style={{ fontSize: '0.76rem', color: 'var(--text-muted)' }}>{v.meta}</div>
              <span style={{ display: 'inline-block', marginTop: '8px', fontSize: '0.68rem', fontWeight: 600, background: 'rgba(27,79,216,0.08)', color: 'var(--blue)', padding: '2px 9px', borderRadius: '100px' }}>{v.duration}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      {modal && (
        <div onClick={() => setModal(null)} style={{ position: 'fixed', inset: 0, zIndex: 200, background: 'rgba(11,26,46,0.78)', backdropFilter: 'blur(10px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }} className="anim-fadein">
          <div onClick={e => e.stopPropagation()} style={{ background: 'white', borderRadius: '20px', overflow: 'hidden', width: '100%', maxWidth: '760px' }} className="anim-scalein">
            <div style={{ padding: '18px 22px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--stone-100)' }}>
              <div>
                <div style={{ fontSize: '0.97rem', fontWeight: 700, color: 'var(--stone-900)' }}>{modal.title}</div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '2px' }}>{modal.meta} · {modal.duration}</div>
              </div>
              <button onClick={() => setModal(null)} style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'var(--stone-100)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12"/></svg>
              </button>
            </div>
            <div style={{ position: 'relative', paddingBottom: '56.25%', height: 0, overflow: 'hidden' }}>
              <iframe src={`https://www.youtube.com/embed/${modal.id}?autoplay=1&rel=0`} allow="autoplay; encrypted-media" allowFullScreen style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', border: 'none' }} />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
