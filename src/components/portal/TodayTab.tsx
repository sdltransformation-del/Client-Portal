'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { VIDEOS, RESOURCES } from '@/lib/data'
import { CURRICULUM } from '@/lib/curriculum'

interface Props {
  client: {
    id: string
    name: string
    start_date: string | null
    day_number?: number | null
    exercise_mode?: string | null
  }
}

function getCurrentDay(startDate: string | null): number {
  if (!startDate) return 1
  const start = new Date(startDate)
  start.setHours(0, 0, 0, 0)
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const diff = Math.floor((today.getTime() - start.getTime()) / 86400000)
  return Math.max(1, diff + 1)
}

function dateForDay(startDate: string, dayNumber: number): Date {
  const d = new Date(startDate)
  d.setHours(0, 0, 0, 0)
  d.setDate(d.getDate() + dayNumber - 1)
  return d
}

function isWeekend(date: Date): boolean {
  const dow = date.getDay()
  return dow === 0 || dow === 6
}

function formatDate(date: Date): string {
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
  const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
  return `${days[date.getDay()]}, ${date.getDate()} ${months[date.getMonth()]}`
}

function formatMin(min: number): string {
  const h = Math.floor(min / 60)
  const m = min % 60
  if (h > 0) return `${h}h ${m > 0 ? m + 'm' : ''}`.trim()
  return `${m}m`
}

export default function TodayTab({ client }: Props) {
  const supabase = createClient()
  const currentDay = getCurrentDay(client.start_date)
  const [viewDay, setViewDay] = useState(currentDay)
  const [videoModal, setVideoModal] = useState<{ ytId: string; title: string; meta: string; startSec: number } | null>(null)

  const entry = CURRICULUM.find(c => c.day === viewDay)
  const video = entry?.type === 'video' ? VIDEOS.find(v => v.id === entry.refId) : null
  const article = entry?.type === 'article' ? RESOURCES.find(r => r.id === entry.refId) : null

  const viewDate = client.start_date ? dateForDay(client.start_date, viewDay) : null
  const weekend = viewDate ? isWeekend(viewDate) : false
  const dateStr = viewDate ? formatDate(viewDate) : ''
  const isToday = viewDay === currentDay
  const programDone = currentDay > CURRICULUM.length

  function openVideo() {
    if (!video || !entry) return
    const startSec = (entry.part?.startMin ?? 0) * 60
    setVideoModal({ ytId: entry.refId, title: video.title, meta: video.meta, startSec })
    supabase.from('activity_log').insert({ client_id: client.id, type: 'video', day_number: viewDay, content_id: entry.refId, content_title: video.title })
  }

  function logArticle() {
    if (!article || !entry) return
    supabase.from('activity_log').insert({ client_id: client.id, type: 'article', day_number: viewDay, content_id: entry.refId, content_title: article.title })
  }

  return (
    <div style={{ padding: '16px 48px 80px', maxWidth: '960px', margin: '0 auto' }} className="anim-fadeup">

      {/* Header */}
      <div style={{ fontSize: '0.72rem', fontWeight: 600, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--blue)', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '8px' }}>
        <span style={{ display: 'block', width: '20px', height: '2px', background: 'var(--blue)', borderRadius: '1px' }} />
        {dateStr}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '36px' }}>
        <h1 style={{ fontFamily: 'var(--font-instrument)', fontSize: 'clamp(1.8rem,4vw,2.6rem)', fontWeight: 400, lineHeight: 1.15, color: 'var(--stone-900)', margin: 0 }}>
          {isToday ? `Day ${viewDay}` : `Day ${viewDay}`}
          {isToday && <span style={{ fontSize: '0.75rem', fontWeight: 600, letterSpacing: '0.06em', background: 'var(--blue)', color: 'white', padding: '3px 10px', borderRadius: '100px', marginLeft: '14px', verticalAlign: 'middle' }}>Today</span>}
        </h1>

        {/* Nav */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button
            onClick={() => setViewDay(v => Math.max(1, v - 1))}
            disabled={viewDay <= 1}
            style={{ width: '36px', height: '36px', borderRadius: '50%', border: '1.5px solid rgba(27,79,216,0.2)', background: 'white', cursor: viewDay <= 1 ? 'not-allowed' : 'pointer', opacity: viewDay <= 1 ? 0.35 : 1, display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.15s' }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--blue)" strokeWidth="2" strokeLinecap="round"><path d="M15 18l-6-6 6-6"/></svg>
          </button>
          <button
            onClick={() => setViewDay(v => Math.min(currentDay, v + 1))}
            disabled={viewDay >= currentDay}
            style={{ width: '36px', height: '36px', borderRadius: '50%', border: '1.5px solid rgba(27,79,216,0.2)', background: 'white', cursor: viewDay >= currentDay ? 'not-allowed' : 'pointer', opacity: viewDay >= currentDay ? 0.35 : 1, display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.15s' }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--blue)" strokeWidth="2" strokeLinecap="round"><path d="M9 18l6-6-6-6"/></svg>
          </button>
        </div>
      </div>

      {/* Weekend rest */}
      {weekend ? (
        <div style={{ background: 'white', border: '1px solid rgba(27,79,216,0.08)', borderRadius: '16px', padding: '48px 32px', textAlign: 'center' }}>
          <div style={{ fontSize: '1.5rem', marginBottom: '12px' }}>—</div>
          <div style={{ fontFamily: 'var(--font-instrument)', fontSize: '1.5rem', fontWeight: 400, color: 'var(--stone-900)', marginBottom: '8px' }}>Rest day</div>
          <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)', lineHeight: 1.6, maxWidth: '360px', margin: '0 auto' }}>Weekends are off. Come back Monday.</div>
        </div>

      ) : programDone && isToday ? (
        <div style={{ background: 'white', border: '1px solid rgba(27,79,216,0.08)', borderRadius: '16px', padding: '48px 32px', textAlign: 'center' }}>
          <div style={{ fontFamily: 'var(--font-instrument)', fontSize: '1.6rem', fontWeight: 400, color: 'var(--stone-900)', marginBottom: '8px' }}>Program complete</div>
          <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)', lineHeight: 1.6, maxWidth: '360px', margin: '0 auto' }}>You have completed all 38 days. Well done.</div>
        </div>

      ) : !entry ? (
        <div style={{ background: 'white', border: '1px solid rgba(27,79,216,0.08)', borderRadius: '16px', padding: '48px 32px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
          Nothing scheduled for this day.
        </div>

      ) : entry.type === 'video' && video ? (
        <div
          onClick={openVideo}
          style={{ background: 'white', border: '1px solid rgba(27,79,216,0.1)', borderRadius: '16px', padding: '24px 26px', cursor: 'pointer', transition: 'box-shadow 0.2s' }}
        >
          <div style={{ fontSize: '0.68rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--blue)', marginBottom: '6px' }}>
            Video{entry.part ? ` · Part ${entry.part.current} of ${entry.part.total}` : ''}
          </div>
          <div style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--stone-900)', lineHeight: 1.35, marginBottom: '6px' }}>{video.title}</div>
          <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '14px' }}>{video.meta}</div>
          <div style={{ fontSize: '0.88rem', color: 'var(--stone-700)', lineHeight: 1.7, marginBottom: '18px' }}>{video.desc}</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'var(--blue)', color: 'white', padding: '10px 20px', borderRadius: '10px', fontSize: '0.84rem', fontWeight: 700 }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="white"><path d="M8 5v14l11-7z"/></svg>
              Watch
              {entry.part && <span style={{ fontWeight: 400, opacity: 0.8 }}>from {formatMin(entry.part.startMin)}</span>}
            </div>
            {entry.part && (
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                Stop around {formatMin(entry.part.endMin)}
              </span>
            )}
            {!entry.part && video.duration && (
              <span style={{ fontSize: '0.75rem', padding: '4px 12px', borderRadius: '100px', background: 'rgba(27,79,216,0.08)', color: 'var(--blue)', fontWeight: 600 }}>{video.duration}</span>
            )}
          </div>
        </div>

      ) : entry.type === 'article' && article ? (
        <div style={{ background: 'white', border: '1px solid rgba(27,79,216,0.1)', borderRadius: '16px', padding: '24px 26px' }}>
          <div style={{ fontSize: '0.68rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--blue)', marginBottom: '6px' }}>
            {article.type === 'study' ? 'Study' : 'Article'}
          </div>
          <div style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--stone-900)', lineHeight: 1.35, marginBottom: '6px' }}>{article.title}</div>
          <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '14px' }}>{article.source}</div>
          <div style={{ fontSize: '0.88rem', color: 'var(--stone-700)', lineHeight: 1.7, marginBottom: '18px' }}>{article.desc}</div>
          {article.finding && (
            <div style={{ background: 'var(--blue-pale)', border: '1px solid rgba(27,79,216,0.12)', borderRadius: '10px', padding: '14px 18px', fontSize: '0.84rem', color: 'var(--stone-800)', lineHeight: 1.65, marginBottom: '18px' }}>
              <span style={{ fontWeight: 700, color: 'var(--blue)' }}>Key finding: </span>{article.finding}
            </div>
          )}
          {article.url && (
            <a href={article.url} target="_blank" rel="noopener noreferrer" onClick={logArticle} style={{ display: 'inline-flex', alignItems: 'center', gap: '7px', background: 'var(--blue)', color: 'white', padding: '10px 20px', borderRadius: '10px', fontSize: '0.84rem', fontWeight: 700, textDecoration: 'none' }}>
              Read
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round"><path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
            </a>
          )}
        </div>
      ) : null}

      {/* Daily exercise */}
      {!weekend && (() => {
        const mode = client.exercise_mode || 'both'
        if (mode === 'none') return null
        const showJournal = mode === 'both' && currentDay % 2 === 1
        const showSomatic = mode === 'somatic_only' || (mode === 'both' && currentDay % 2 === 0)

        return (
          <div style={{ marginTop: '20px' }}>
            <div style={{ fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '12px' }}>
              Today's exercise{mode === 'both' ? ` · ${showJournal ? 'Journaling day' : 'Somatic tracking day'}` : ''}
            </div>

            {showJournal && (
              <div style={{ background: 'white', border: '1px solid rgba(27,79,216,0.1)', borderRadius: '16px', padding: '24px 26px' }}>
                <div style={{ fontSize: '0.68rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--blue)', marginBottom: '6px' }}>Journaling</div>
                <div style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--stone-900)', lineHeight: 1.35, marginBottom: '10px' }}>Write in your Recovery Journal</div>
                <div style={{ fontSize: '0.88rem', color: 'var(--stone-700)', lineHeight: 1.7, marginBottom: '18px' }}>
                  Take 5 to 10 minutes to write. It doesn't have to be structured. Write about something that strengthened your conviction today, a doubt you worked through, a feeling you let yourself feel, or a movement you made without fear. Anything that happened, small or large.
                </div>
                <a href="#" onClick={e => { e.preventDefault(); const el = document.querySelector('[data-tab="notes"]') as HTMLElement; el?.click() }} style={{ display: 'inline-flex', alignItems: 'center', gap: '7px', background: 'var(--blue)', color: 'white', padding: '10px 20px', borderRadius: '10px', fontSize: '0.84rem', fontWeight: 700, textDecoration: 'none' }}>
                  Open Recovery Journal
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                </a>
              </div>
            )}

            {showSomatic && (
              <div style={{ background: 'white', border: '1px solid rgba(27,79,216,0.1)', borderRadius: '16px', padding: '24px 26px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                  <div style={{ fontSize: '0.68rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--blue)' }}>Somatic tracking</div>
                  <span style={{ fontSize: '0.68rem', fontWeight: 600, padding: '3px 10px', borderRadius: '100px', background: 'rgba(27,79,216,0.08)', color: 'var(--blue)' }}>5–10 min</span>
                </div>
                <div style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--stone-900)', lineHeight: 1.35, marginBottom: '10px' }}>Body scan and sensation check-in</div>
                <div style={{ fontSize: '0.88rem', color: 'var(--stone-700)', lineHeight: 1.7 }}>
                  Close your eyes and slow your breath down. Breathe in a few times to center yourself, letting your focus settle on the breath coming in and out. Once you feel grounded, bring your attention to the dominant physical sensation in your body right now. It might be in your back, your chest, your arms, or somewhere else entirely. Just let your attention go there. If you feel something in more than one place, choose one and stay with it.
                  <br /><br />
                  Now focus on the sensation itself. Breathe into it. Give it a little air, a little space. When a sensation is unpleasant, the instinct is to distract yourself or look away. Do the opposite. Just watch it. Notice it. You are not trying to get rid of it, not trying to change it, not trying to do anything at all. You are simply getting to know it. As you breathe and attend to it, just gather information. Is it pleasant or unpleasant? Widespread or localized? Is it a tightness, a warmth, a pulsing, a tingling? One answer is not better than another. You are just noticing. You are just paying attention.
                  <br /><br />
                  This sensation is completely safe. It is not dangerous. Your brain is generating it, and right now you are learning to observe it without fear, without judgment, without any goal beyond watching. As you pay attention this way, you are sending your brain a message that this sensation is safe. You are building the neural pathways to feel it without panic. Just be curious. Notice what happens as you attend to it. Does it intensify? Does it shift? Does it stay exactly the same? Whatever it does is fine. You are outcome independent. You are just watching the show. Think of it like lying back in a field watching clouds pass, just noticing the shapes they make, not needing them to be anything different.
                </div>
              </div>
            )}
          </div>
        )
      })()}

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
              <iframe
                src={`https://www.youtube.com/embed/${videoModal.ytId}?autoplay=1&rel=0&start=${videoModal.startSec}`}
                allow="autoplay; encrypted-media"
                allowFullScreen
                style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', border: 'none' }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
