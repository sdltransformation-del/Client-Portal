'use client'
import { useState, useEffect } from 'react'
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
  const [y, m, d] = startDate.slice(0, 10).split('-').map(Number)
  const start = new Date(y, m - 1, d) // local midnight, avoids UTC parse issue
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const diff = Math.floor((today.getTime() - start.getTime()) / 86400000)
  return Math.max(1, diff + 1)
}

function dateForDay(startDate: string, dayNumber: number): Date {
  const [y, m, day] = startDate.slice(0, 10).split('-').map(Number)
  const d = new Date(y, m - 1, day)
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
  const [completions, setCompletions] = useState<Record<number, { content_done: boolean; assignment_done: boolean }>>({})

  useEffect(() => {
    supabase.from('daily_completions').select('day_number,content_done,assignment_done').eq('client_id', client.id)
      .then(({ data }) => {
        if (data) {
          const map: Record<number, { content_done: boolean; assignment_done: boolean }> = {}
          for (const row of data) map[row.day_number] = { content_done: row.content_done, assignment_done: row.assignment_done }
          setCompletions(map)
        }
      })
  }, [])

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

  async function toggleCompletion(field: 'content_done' | 'assignment_done') {
    const current = completions[viewDay] || { content_done: false, assignment_done: false }
    const updated = { ...current, [field]: !current[field] }
    setCompletions(prev => ({ ...prev, [viewDay]: updated }))
    await supabase.from('daily_completions').upsert(
      { client_id: client.id, day_number: viewDay, ...updated },
      { onConflict: 'client_id,day_number' }
    )
  }

  function CheckButton({ field, labelUndone, labelDone }: { field: 'content_done' | 'assignment_done'; labelUndone: string; labelDone: string }) {
    const done = completions[viewDay]?.[field] ?? false
    return (
      <button onClick={() => toggleCompletion(field)} style={{ display: 'flex', alignItems: 'center', gap: '10px', width: '100%', fontFamily: 'inherit', background: done ? '#f0fdf4' : 'white', border: `1.5px solid ${done ? '#16a34a' : 'rgba(249,115,22,0.2)'}`, borderRadius: '12px', padding: '14px 18px', cursor: 'pointer', transition: 'all 0.2s', marginTop: '10px' }}>
        <div style={{ width: '22px', height: '22px', borderRadius: '50%', flexShrink: 0, background: done ? '#16a34a' : 'transparent', border: `2px solid ${done ? '#16a34a' : 'var(--stone-300)'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s' }}>
          {done && <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3.5" strokeLinecap="round"><path d="M20 6L9 17l-5-5"/></svg>}
        </div>
        <span style={{ fontSize: '0.88rem', fontWeight: 600, color: done ? '#16a34a' : 'var(--stone-700)', transition: 'color 0.2s' }}>{done ? labelDone : labelUndone}</span>
      </button>
    )
  }

  return (
    <div style={{ padding: '32px 48px 80px', maxWidth: '960px', margin: '0 auto' }} className="anim-fadeup">

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
            style={{ width: '36px', height: '36px', borderRadius: '50%', border: '1.5px solid rgba(249,115,22,0.25)', background: 'white', cursor: viewDay <= 1 ? 'not-allowed' : 'pointer', opacity: viewDay <= 1 ? 0.35 : 1, display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.15s' }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--blue)" strokeWidth="2" strokeLinecap="round"><path d="M15 18l-6-6 6-6"/></svg>
          </button>
          <button
            onClick={() => setViewDay(v => Math.min(currentDay, v + 1))}
            disabled={viewDay >= currentDay}
            style={{ width: '36px', height: '36px', borderRadius: '50%', border: '1.5px solid rgba(249,115,22,0.25)', background: 'white', cursor: viewDay >= currentDay ? 'not-allowed' : 'pointer', opacity: viewDay >= currentDay ? 0.35 : 1, display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.15s' }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--blue)" strokeWidth="2" strokeLinecap="round"><path d="M9 18l6-6-6-6"/></svg>
          </button>
        </div>
      </div>


      {/* Weekend rest */}
      {weekend ? (
        <div style={{ background: 'white', border: '1px solid rgba(249,115,22,0.1)', borderRadius: '16px', padding: '48px 32px', textAlign: 'center' }}>
          <div style={{ fontSize: '1.5rem', marginBottom: '12px' }}>—</div>
          <div style={{ fontFamily: 'var(--font-instrument)', fontSize: '1.5rem', fontWeight: 400, color: 'var(--stone-900)', marginBottom: '8px' }}>Rest day</div>
          <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)', lineHeight: 1.6, maxWidth: '360px', margin: '0 auto' }}>Weekends are off. Come back Monday.</div>
        </div>

      ) : programDone && isToday ? (
        <div style={{ background: 'white', border: '1px solid rgba(249,115,22,0.1)', borderRadius: '16px', padding: '48px 32px', textAlign: 'center' }}>
          <div style={{ fontFamily: 'var(--font-instrument)', fontSize: '1.6rem', fontWeight: 400, color: 'var(--stone-900)', marginBottom: '8px' }}>Program complete</div>
          <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)', lineHeight: 1.6, maxWidth: '360px', margin: '0 auto' }}>You have completed all 56 days. Well done.</div>
        </div>

      ) : !entry ? (
        <div style={{ background: 'white', border: '1px solid rgba(249,115,22,0.1)', borderRadius: '16px', padding: '48px 32px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
          Nothing scheduled for this day.
        </div>

      ) : entry.type === 'video' && video ? (
        <div
          onClick={openVideo}
          style={{ background: 'white', border: '1px solid rgba(249,115,22,0.12)', borderRadius: '16px', padding: '24px 26px', cursor: 'pointer', transition: 'box-shadow 0.2s' }}
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
              <span style={{ fontSize: '0.75rem', padding: '4px 12px', borderRadius: '100px', background: 'rgba(249,115,22,0.1)', color: 'var(--blue)', fontWeight: 600 }}>{video.duration}</span>
            )}
          </div>
        </div>

      ) : entry.type === 'article' && article ? (
        <div style={{ background: 'white', border: '1px solid rgba(249,115,22,0.12)', borderRadius: '16px', padding: '24px 26px' }}>
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

      {/* Content done checkbox */}
      {!weekend && entry && (
        <CheckButton
          field="content_done"
          labelUndone={entry.type === 'video' ? 'Mark video as watched' : 'Mark article as read'}
          labelDone={entry.type === 'video' ? 'Video watched ✓' : 'Article read ✓'}
        />
      )}

      {/* Daily exercises */}
      {!weekend && (() => {
        const cycle3 = ((viewDay - 1) % 3) + 1
        const showJournal = cycle3 === 1

        const exercises = [
          ...(showJournal ? [{
            num: 1,
            tag: 'Journaling',
            time: '20 min',
            title: 'JournalSpeak',
            when: 'Anytime — pen and paper',
            body: <>
              Start by making three lists if you have not already: <strong>past stressors</strong> (fear, anger, guilt, shame, or hurt from childhood to now), <strong>current stressors</strong> (every person, situation, or worry weighing on you right now), and <strong>personality traits</strong> that add to your stress (perfectionism, people pleasing, a harsh inner critic, difficulty expressing emotions).
              <br /><br />
              Then pick one item and write about it for 20 minutes. Write the raw, unfiltered truth. Do not censor. Do not edit. Write what is shameful, scary, or ugly — nobody else will read this. You are getting hidden, unfelt feelings out of your body and onto the page, where they cannot keep generating a pain signal.
            </>
          }] : []),
          {
            num: showJournal ? 2 : 1,
            tag: 'Somatic tracking',
            time: '5–10 min',
            title: 'Body scan & sensation check-in',
            when: 'Morning or midday — anywhere quiet',
            body: <>
              Close your eyes, slow your breath, and bring your attention to the dominant physical sensation in your body right now. Breathe into it. Give it space. You are not trying to get rid of it — just watch it with curiosity. Is it a tightness, a warmth, a pulsing, a tingling? Notice without judgment.
              <br /><br />
              This sensation is completely safe. As you observe it without fear, you are sending your brain the message that there is no danger — and building the neural pathways that end the pain cycle.
            </>
          },
          {
            num: showJournal ? 3 : 2,
            tag: 'Visualization',
            time: '5–10 min',
            title: 'Visualizing your pain-free self',
            when: 'In bed — just before sleep',
            body: <>
              Let your body settle, close your eyes, and take three slow deep breaths. Bring to mind an image of yourself completely free of pain — this version of you, now, living a normal day. See yourself moving freely. Feel the ease of a body doing exactly what it was built to do, without hesitation, without fear.
              <br /><br />
              Hold that image gently as you drift off. When you hold it with enough clarity and emotional truth, you are sending your nervous system a real signal: this pain-free state is familiar, it is possible, it is you.
            </>
          },
        ]

        return (
          <div style={{ marginTop: '32px' }}>
            {/* Section header */}
            <div style={{ background: '#18181b', borderRadius: '16px 16px 0 0', padding: '18px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <div style={{ fontSize: '0.62rem', fontWeight: 700, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.35)', marginBottom: '3px' }}>Every single day</div>
                <div style={{ fontSize: '1rem', fontWeight: 700, color: 'white' }}>Daily Exercises</div>
              </div>
              <div style={{ fontSize: '0.72rem', fontWeight: 600, color: 'rgba(255,255,255,0.4)', background: 'rgba(255,255,255,0.08)', padding: '5px 12px', borderRadius: '100px' }}>
                {exercises.length} exercise{exercises.length > 1 ? 's' : ''} today
              </div>
            </div>

            {/* Exercise cards */}
            <div style={{ background: 'white', border: '1.5px solid #18181b', borderTop: 'none', borderRadius: '0 0 16px 16px', overflow: 'hidden' }}>
              {exercises.map((ex, i) => (
                <div key={ex.tag} style={{ padding: '22px 24px', borderTop: i > 0 ? '1px solid #f4f4f5' : 'none' }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px' }}>
                    {/* Number circle */}
                    <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: '#f97316', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontWeight: 800, fontSize: '0.9rem', color: 'white', marginTop: '2px' }}>
                      {ex.num}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', marginBottom: '4px' }}>
                        <span style={{ fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#f97316' }}>{ex.tag}</span>
                        <span style={{ fontSize: '0.65rem', fontWeight: 600, padding: '2px 9px', borderRadius: '100px', background: '#f4f4f5', color: '#71717a' }}>{ex.time}</span>
                      </div>
                      <div style={{ fontSize: '1rem', fontWeight: 700, color: '#18181b', lineHeight: 1.3, marginBottom: '4px' }}>{ex.title}</div>
                      <div style={{ fontSize: '0.72rem', fontWeight: 600, color: '#f97316', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '5px' }}>
                        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                        {ex.when}
                      </div>
                      <div style={{ fontSize: '0.87rem', color: '#52525b', lineHeight: 1.75 }}>{ex.body}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <CheckButton
              field="assignment_done"
              labelUndone="Mark exercises as done"
              labelDone="Exercises done ✓"
            />
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
