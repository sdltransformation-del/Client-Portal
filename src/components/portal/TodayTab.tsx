'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { VIDEOS, RESOURCES } from '@/lib/data'

interface Assignment {
  id: string
  day_number: number
  type: 'video' | 'article' | 'exercise'
  content_id: string | null
  title: string
  notes: string | null
}

interface Props {
  client: {
    id: string
    name: string
    day_number: number | null
  }
}

export default function TodayTab({ client }: Props) {
  const [assignments, setAssignments] = useState<Assignment[]>([])
  const [done, setDone] = useState<Record<string, boolean>>({})
  const [videoModal, setVideoModal] = useState<{ ytId: string; title: string; meta: string } | null>(null)
  const [loading, setLoading] = useState(true)
  const supabase = createClient()
  const day = client.day_number || 1

  const now = new Date()
  const dayNames = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday']
  const monthNames = ['January','February','March','April','May','June','July','August','September','October','November','December']
  const dateStr = `${dayNames[now.getDay()]}, ${now.getDate()} ${monthNames[now.getMonth()]}`

  useEffect(() => {
    async function load() {
      const { data } = await supabase
        .from('assignments')
        .select('*')
        .eq('client_id', client.id)
        .eq('day_number', day)
        .order('created_at', { ascending: true })
      setAssignments(data || [])
      setLoading(false)
    }
    load()
  }, [client.id, day])

  function toggle(id: string, ytId?: string | null) {
    if (ytId) {
      const video = VIDEOS.find(v => v.id === ytId)
      setVideoModal({ ytId, title: assignments.find(a => a.id === id)?.title ?? '', meta: video?.meta ?? '' })
    }
    setDone(prev => ({ ...prev, [id]: !prev[id] }))
  }

  const doneCount = Object.values(done).filter(Boolean).length

  function getTypeLabel(type: string) {
    if (type === 'video') return 'Video'
    if (type === 'article') return 'Article'
    if (type === 'exercise') return 'Exercise'
    return type
  }

  function getVideoMeta(contentId: string | null) {
    if (!contentId) return null
    return VIDEOS.find(v => v.id === contentId) ?? null
  }

  function getResourceMeta(contentId: string | null) {
    if (!contentId) return null
    return RESOURCES.find(r => r.id === contentId) ?? null
  }

  return (
    <div style={{ padding: '16px 48px 80px', maxWidth: '960px', margin: '0 auto' }} className="anim-fadeup">
      <div style={{ fontSize: '0.72rem', fontWeight: 600, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--blue)', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '8px' }}>
        <span style={{ display: 'block', width: '20px', height: '2px', background: 'var(--blue)', borderRadius: '1px' }} />
        {dateStr}
      </div>
      <h1 style={{ fontFamily: 'var(--font-instrument)', fontSize: 'clamp(1.8rem,4vw,2.6rem)', fontWeight: 400, lineHeight: 1.15, color: 'var(--stone-900)', marginBottom: '36px' }}>
        Day {day}
      </h1>

      {/* Done count */}
      {assignments.length > 0 && (
        <div style={{ background: 'white', border: '1px solid rgba(27,79,216,0.1)', borderRadius: '16px', padding: '18px 28px', marginBottom: '32px', display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
          <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--blue)', lineHeight: 1 }}>{doneCount}</div>
          <div style={{ fontSize: '0.72rem', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--text-muted)' }}>of {assignments.length} done today</div>
        </div>
      )}

      {/* Assignments */}
      <div style={{ fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '14px' }}>
        Today&apos;s assignments
      </div>

      {loading ? (
        <div style={{ fontSize: '0.88rem', color: 'var(--text-muted)', padding: '24px 0' }}>Loading…</div>
      ) : assignments.length === 0 ? (
        <div style={{ background: 'white', border: '1px solid rgba(27,79,216,0.08)', borderRadius: '14px', padding: '40px 24px', textAlign: 'center', color: 'var(--text-muted)' }}>
          <div style={{ fontSize: '0.95rem', fontWeight: 600, marginBottom: '6px', color: 'var(--stone-700)' }}>Nothing assigned for today yet</div>
          <div style={{ fontSize: '0.84rem', lineHeight: 1.6 }}>Serge will assign your tasks shortly. Check back soon.</div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {assignments.map(a => {
            const videoMeta = a.type === 'video' ? getVideoMeta(a.content_id) : null
            const resMeta = a.type === 'article' ? getResourceMeta(a.content_id) : null
            const isDone = done[a.id]

            return (
              <div
                key={a.id}
                onClick={() => toggle(a.id, a.type === 'video' ? a.content_id : null)}
                style={{
                  background: 'white', border: '1px solid rgba(27,79,216,0.1)', borderRadius: '14px',
                  padding: '20px 22px', display: 'flex', alignItems: 'flex-start', gap: '16px',
                  cursor: 'pointer', transition: 'all 0.2s', opacity: isDone ? 0.55 : 1
                }}
              >
                <div style={{
                  width: '24px', height: '24px', flexShrink: 0, borderRadius: '7px',
                  border: `1.5px solid ${isDone ? 'var(--blue)' : 'var(--stone-300)'}`,
                  background: isDone ? 'var(--blue)' : 'transparent',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: '1px', transition: 'all 0.2s'
                }}>
                  {isDone && <svg width="13" height="13" viewBox="0 0 14 14" fill="none"><path d="M2.5 7l3.5 3.5 5.5-7" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '0.68rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--blue)', marginBottom: '3px' }}>
                    {getTypeLabel(a.type)}
                  </div>
                  <div style={{ fontSize: '0.97rem', fontWeight: 700, color: 'var(--stone-900)', lineHeight: 1.35, marginBottom: '5px' }}>{a.title}</div>
                  {(videoMeta?.meta || resMeta?.source) && (
                    <div style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', marginBottom: '5px' }}>
                      {videoMeta?.meta || resMeta?.source}
                    </div>
                  )}
                  {a.notes && (
                    <div style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>{a.notes}</div>
                  )}
                  <div style={{ display: 'flex', gap: '7px', marginTop: '10px', flexWrap: 'wrap' }}>
                    <span style={{ fontSize: '0.68rem', fontWeight: 600, padding: '3px 11px', borderRadius: '100px', background: isDone ? '#dcfce7' : 'rgba(27,79,216,0.08)', color: isDone ? '#15803d' : 'var(--blue)' }}>
                      {isDone ? 'Done' : 'To do'}
                    </span>
                    {videoMeta?.duration && (
                      <span style={{ fontSize: '0.68rem', fontWeight: 600, padding: '3px 11px', borderRadius: '100px', background: 'rgba(27,79,216,0.08)', color: 'var(--blue)' }}>{videoMeta.duration}</span>
                    )}
                  </div>
                </div>
                {a.type === 'video' && <div style={{ fontSize: '1.2rem', color: 'var(--stone-300)', marginTop: '1px' }}>›</div>}
                {a.type === 'article' && resMeta?.url && (
                  <a href={resMeta.url} target="_blank" rel="noopener noreferrer" onClick={e => e.stopPropagation()} style={{ fontSize: '1.2rem', color: 'var(--stone-300)', marginTop: '1px', textDecoration: 'none' }}>›</a>
                )}
              </div>
            )
          })}
        </div>
      )}

      {/* Video Modal */}
      {videoModal && (
        <div onClick={() => setVideoModal(null)} style={{ position: 'fixed', inset: 0, zIndex: 200, background: 'rgba(11,26,46,0.78)', backdropFilter: 'blur(10px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }} className="anim-fadein">
          <div onClick={e => e.stopPropagation()} style={{ background: 'white', borderRadius: '20px', overflow: 'hidden', width: '100%', maxWidth: '760px' }} className="anim-scalein">
            <div style={{ padding: '18px 22px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--stone-100)' }}>
              <div>
                <div style={{ fontSize: '0.97rem', fontWeight: 700, color: 'var(--stone-900)' }}>{videoModal.title}</div>
                {videoModal.meta && <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '2px' }}>{videoModal.meta}</div>}
              </div>
              <button onClick={() => setVideoModal(null)} style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'var(--stone-100)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12"/></svg>
              </button>
            </div>
            <div style={{ position: 'relative', paddingBottom: '56.25%', height: 0, overflow: 'hidden' }}>
              <iframe src={`https://www.youtube.com/embed/${videoModal.ytId}?autoplay=1&rel=0`} allow="autoplay; encrypted-media" allowFullScreen style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', border: 'none' }} />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
