'use client'
import { useState } from 'react'

interface Props {
  client: {
    name: string
    day_number: number | null
    start_date: string | null
  }
}

const DAYS_TITLES: Record<number, string> = {
  1: 'Welcome — understanding what this is', 14: 'Recognising the pattern',
  30: 'Building conviction', 60: 'Living without fear', 90: 'The last chapter'
}

function getDayTitle(day: number) {
  return DAYS_TITLES[day] || 'Your work today'
}

interface Assignment {
  id: string
  type: 'read' | 'video' | 'journal'
  title: string
  desc: string
  pills: string[]
  ytId?: string
}

const DEFAULT_ASSIGNMENTS: Assignment[] = [
  {
    id: 'a1', type: 'read',
    title: 'Chapter 4 — The Conditioned Response',
    desc: 'Read pages 62–78 of Healing Back Pain. Notice how the conditioning patterns show up in your own experience.',
    pills: ['~20 min', 'Sarno']
  },
  {
    id: 'a2', type: 'video', ytId: 'pv8PtT_4rjk',
    title: 'Watch: Why your brain creates pain',
    desc: 'Dr Howard Schubiner explains the neural conditioning mechanism — one of the clearest explanations you\'ll find.',
    pills: ['~60 min', 'Schubiner']
  },
  {
    id: 'a3', type: 'journal',
    title: 'Write: What am I actually feeling?',
    desc: 'Spend 10 minutes writing without censoring. Focus on any emotion you\'ve been pushing away this week. Don\'t try to fix it — just name it.',
    pills: ['10 min']
  }
]

export default function TodayTab({ client }: Props) {
  const [done, setDone] = useState<Record<string, boolean>>({})
  const [videoModal, setVideoModal] = useState<{ ytId: string; title: string } | null>(null)
  const day = client.day_number || 1

  const now = new Date()
  const dayNames = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday']
  const monthNames = ['January','February','March','April','May','June','July','August','September','October','November','December']
  const dateStr = `${dayNames[now.getDay()]}, ${now.getDate()} ${monthNames[now.getMonth()]}`

  const doneCount = Object.values(done).filter(Boolean).length
  const progPct = Math.round((day / 90) * 100)

  function toggle(id: string, ytId?: string) {
    if (ytId) setVideoModal({ ytId, title: DEFAULT_ASSIGNMENTS.find(a => a.id === id)?.title ?? '' })
    setDone(prev => ({ ...prev, [id]: !prev[id] }))
  }

  return (
    <div style={{ padding: '16px 48px 80px', maxWidth: '960px', margin: '0 auto' }} className="anim-fadeup">
      <div style={{ fontSize: '0.72rem', fontWeight: 600, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--blue)', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '8px' }}>
        <span style={{ display: 'block', width: '20px', height: '2px', background: 'var(--blue)', borderRadius: '1px' }} />
        {dateStr}
      </div>
      <h1 style={{ fontFamily: 'var(--font-instrument)', fontSize: 'clamp(1.8rem,4vw,2.6rem)', fontWeight: 400, lineHeight: 1.15, color: 'var(--stone-900)', marginBottom: '8px' }}>
        Day {day} — {getDayTitle(day)}
      </h1>
      <p style={{ fontSize: '0.95rem', color: 'var(--text-secondary)', lineHeight: 1.7, marginBottom: '36px', maxWidth: '520px' }}>
        Three tasks today. Take your time — there&apos;s no rush.
      </p>

      {/* Progress strip */}
      <div style={{ background: 'white', border: '1px solid rgba(27,79,216,0.1)', borderRadius: '16px', padding: '22px 28px', marginBottom: '36px', display: 'flex', alignItems: 'center', gap: '28px', flexWrap: 'wrap' }}>
        <div style={{ textAlign: 'center', minWidth: '52px' }}>
          <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--blue)', lineHeight: 1 }}>{day}</div>
          <div style={{ fontSize: '0.68rem', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--text-muted)', marginTop: '3px' }}>Day streak</div>
        </div>
        <div style={{ width: '1px', height: '40px', background: 'var(--stone-200)', flexShrink: 0 }} />
        <div style={{ textAlign: 'center', minWidth: '52px' }}>
          <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--blue)', lineHeight: 1 }}>{doneCount}</div>
          <div style={{ fontSize: '0.68rem', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--text-muted)', marginTop: '3px' }}>Done today</div>
        </div>
        <div style={{ width: '1px', height: '40px', background: 'var(--stone-200)', flexShrink: 0 }} />
        <div style={{ flex: 1, minWidth: '120px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', fontWeight: 600, color: 'var(--stone-700)', marginBottom: '8px' }}>
            <span>Program progress</span><span>{progPct}%</span>
          </div>
          <div style={{ height: '6px', background: 'rgba(27,79,216,0.1)', borderRadius: '3px' }}>
            <div style={{ height: '6px', background: 'var(--blue)', borderRadius: '3px', width: `${progPct}%`, transition: 'width 0.8s cubic-bezier(0.16,1,0.3,1)' }} />
          </div>
        </div>
      </div>

      {/* Assignments */}
      <div style={{ fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '14px' }}>
        Today&apos;s assignments
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {DEFAULT_ASSIGNMENTS.map(a => (
          <div
            key={a.id}
            onClick={() => toggle(a.id, a.ytId)}
            style={{
              background: 'white', border: '1px solid rgba(27,79,216,0.1)', borderRadius: '14px',
              padding: '20px 22px', display: 'flex', alignItems: 'flex-start', gap: '16px',
              cursor: 'pointer', transition: 'all 0.2s', opacity: done[a.id] ? 0.55 : 1
            }}
          >
            <div style={{
              width: '24px', height: '24px', flexShrink: 0, borderRadius: '7px',
              border: `1.5px solid ${done[a.id] ? 'var(--blue)' : 'var(--stone-300)'}`,
              background: done[a.id] ? 'var(--blue)' : 'transparent',
              display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: '1px', transition: 'all 0.2s'
            }}>
              {done[a.id] && <svg width="13" height="13" viewBox="0 0 14 14" fill="none"><path d="M2.5 7l3.5 3.5 5.5-7" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '0.68rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--blue)', marginBottom: '3px' }}>
                {a.type === 'read' ? 'Reading' : a.type === 'video' ? 'Video' : 'Journal'}
              </div>
              <div style={{ fontSize: '0.97rem', fontWeight: 700, color: 'var(--stone-900)', lineHeight: 1.35, marginBottom: '5px' }}>{a.title}</div>
              <div style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>{a.desc}</div>
              <div style={{ display: 'flex', gap: '7px', marginTop: '10px', flexWrap: 'wrap' }}>
                <span style={{ fontSize: '0.68rem', fontWeight: 600, padding: '3px 11px', borderRadius: '100px', background: done[a.id] ? '#dcfce7' : 'rgba(27,79,216,0.08)', color: done[a.id] ? '#15803d' : 'var(--blue)' }}>
                  {done[a.id] ? 'Done' : 'To do'}
                </span>
                {a.pills.map(p => (
                  <span key={p} style={{ fontSize: '0.68rem', fontWeight: 600, padding: '3px 11px', borderRadius: '100px', background: 'rgba(27,79,216,0.08)', color: 'var(--blue)' }}>{p}</span>
                ))}
              </div>
            </div>
            {a.type === 'video' && <div style={{ fontSize: '1.2rem', color: 'var(--stone-300)', marginTop: '1px' }}>›</div>}
          </div>
        ))}
      </div>

      {/* Video Modal */}
      {videoModal && (
        <div
          onClick={() => setVideoModal(null)}
          style={{ position: 'fixed', inset: 0, zIndex: 200, background: 'rgba(11,26,46,0.78)', backdropFilter: 'blur(10px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}
          className="anim-fadein"
        >
          <div onClick={e => e.stopPropagation()} style={{ background: 'white', borderRadius: '20px', overflow: 'hidden', width: '100%', maxWidth: '760px' }} className="anim-scalein">
            <div style={{ padding: '18px 22px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--stone-100)' }}>
              <div style={{ fontSize: '0.97rem', fontWeight: 700, color: 'var(--stone-900)' }}>{videoModal.title}</div>
              <button onClick={() => setVideoModal(null)} style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'var(--stone-100)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12"/></svg>
              </button>
            </div>
            <div style={{ position: 'relative', paddingBottom: '56.25%', height: 0, overflow: 'hidden' }}>
              <iframe
                src={`https://www.youtube.com/embed/${videoModal.ytId}?autoplay=1&rel=0`}
                allow="autoplay; encrypted-media" allowFullScreen
                style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', border: 'none' }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
