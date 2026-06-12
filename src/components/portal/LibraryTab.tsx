'use client'
import { useState } from 'react'
import { VIDEOS } from '@/lib/data'

export default function LibraryTab() {
  const [modal, setModal] = useState<{ id: string; title: string; meta: string; duration: string; desc: string } | null>(null)

  function openModal(v: typeof VIDEOS[0]) {
    setModal({ id: v.id, title: v.title, meta: v.meta, duration: v.duration, desc: v.desc })
    window.scrollTo({ top: 0 })
    document.body.style.overflow = 'hidden'
  }

  function closeModal() {
    setModal(null)
    document.body.style.overflow = ''
  }

  return (
    <div style={{ padding: '16px 48px 80px', maxWidth: '960px', margin: '0 auto' }} className="anim-fadeup">
      <div style={{ fontSize: '0.72rem', fontWeight: 600, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--blue)', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '8px' }}>
        <span style={{ width: '20px', height: '2px', background: 'var(--blue)', borderRadius: '1px', display: 'block' }} />Video Library
      </div>
      <p style={{ fontSize: '0.97rem', color: 'var(--text-secondary)', lineHeight: 1.75, marginBottom: '36px', maxWidth: '600px' }}>
        Understanding is the mechanism of recovery. These videos are the clearest explanations available of why chronic pain exists, how it is maintained, and how it ends. They&apos;ve been hand-picked to give you that understanding, which as we&apos;ve discussed, is one of the biggest parts to your recovery.
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
        {VIDEOS.map(v => (
          <div
            key={v.id}
            onClick={() => openModal(v)}
            style={{ background: 'white', border: '1px solid rgba(27,79,216,0.1)', borderRadius: '14px', overflow: 'hidden', cursor: 'pointer', transition: 'box-shadow 0.2s', display: 'flex', flexDirection: 'column' }}
          >
            <div style={{ aspectRatio: '16/9', background: 'var(--blue-pale)', position: 'relative', overflow: 'hidden', flexShrink: 0 }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={`https://img.youtube.com/vi/${v.id}/hqdefault.jpg`} alt={v.title} loading="lazy" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
              <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(11,26,46,0.2)' }}>
                <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 16px rgba(11,26,46,0.25)' }}>
                  <div style={{ width: 0, height: 0, borderStyle: 'solid', borderWidth: '8px 0 8px 16px', borderColor: 'transparent transparent transparent var(--blue)', marginLeft: '3px' }} />
                </div>
              </div>
            </div>
            <div style={{ padding: '16px 18px 20px', display: 'flex', flexDirection: 'column', flex: 1 }}>
              <div style={{ fontSize: '0.93rem', fontWeight: 700, color: 'var(--stone-900)', lineHeight: 1.35, marginBottom: '5px' }}>{v.title}</div>
              <div style={{ fontSize: '0.76rem', color: 'var(--text-muted)', marginBottom: '10px' }}>{v.meta}</div>
              <div style={{ fontSize: '0.83rem', color: 'var(--text-secondary)', lineHeight: 1.65, flex: 1 }}>{v.desc}</div>
              <div style={{ marginTop: '12px' }}>
                <span style={{ fontSize: '0.68rem', fontWeight: 600, background: 'rgba(27,79,216,0.08)', color: 'var(--blue)', padding: '3px 10px', borderRadius: '100px' }}>{v.duration}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {modal && (
        <div onClick={closeModal} style={{ position: 'fixed', inset: 0, zIndex: 200, background: 'rgba(11,26,46,0.78)', backdropFilter: 'blur(10px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }} className="anim-fadein">
          <div onClick={e => e.stopPropagation()} style={{ background: 'white', borderRadius: '20px', overflow: 'hidden', width: '100%', maxWidth: '760px' }} className="anim-scalein">
            <div style={{ padding: '18px 22px', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '16px', borderBottom: '1px solid var(--stone-100)' }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '0.97rem', fontWeight: 700, color: 'var(--stone-900)', marginBottom: '3px' }}>{modal.title}</div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '8px' }}>{modal.meta} · {modal.duration}</div>
                <div style={{ fontSize: '0.83rem', color: 'var(--text-secondary)', lineHeight: 1.65 }}>{modal.desc}</div>
              </div>
              <button onClick={closeModal} style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'var(--stone-100)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
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
