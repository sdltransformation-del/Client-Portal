'use client'
import { useState, useEffect, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { VIDEOS, RESOURCES } from '@/lib/data'
import { CURRICULUM } from '@/lib/curriculum'

interface Props {
  client: { id: string; start_date: string | null }
}

function formatMin(min: number): string {
  const h = Math.floor(min / 60)
  const m = min % 60
  if (h > 0) return `${h}h${m > 0 ? ` ${m}m` : ''}`
  return `${m}m`
}

function getCurrentDay(startDate: string | null): number {
  if (!startDate) return 1
  const [y, m, d] = startDate.slice(0, 10).split('-').map(Number)
  const start = new Date(y, m - 1, d)
  const today = new Date(); today.setHours(0, 0, 0, 0)
  return Math.max(1, Math.floor((today.getTime() - start.getTime()) / 86400000) + 1)
}

export default function PathTab({ client }: Props) {
  const supabase = createClient()
  const currentDay = getCurrentDay(client.start_date)
  const [completions, setCompletions] = useState<Record<number, { content_done: boolean }>>({})
  const [notes, setNotes] = useState<Record<number, string>>({})
  const [selected, setSelected] = useState<number | null>(null)
  const [saving, setSaving] = useState(false)
  const [videoModal, setVideoModal] = useState<{ ytId: string; title: string; startSec: number } | null>(null)
  const panelRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    supabase.from('daily_completions').select('day_number,content_done').eq('client_id', client.id)
      .then(({ data }) => {
        if (data) {
          const map: Record<number, { content_done: boolean }> = {}
          for (const row of data) map[row.day_number] = { content_done: row.content_done }
          setCompletions(map)
        }
      })
    supabase.from('assignment_notes').select('day_number,note').eq('client_id', client.id)
      .then(({ data }) => {
        if (data) {
          const map: Record<number, string> = {}
          for (const row of data) map[row.day_number] = row.note
          setNotes(map)
        }
      })
  }, [])

  function isUnlocked(_day: number): boolean {
    return true
  }

  function nodeStatus(day: number): 'done' | 'current' | 'locked' {
    if (completions[day]?.content_done) return 'done'
    if (isUnlocked(day)) return 'current'
    return 'locked'
  }

  async function saveNote(day: number, note: string) {
    setSaving(true)
    await supabase.from('assignment_notes').upsert(
      { client_id: client.id, day_number: day, note, updated_at: new Date().toISOString() },
      { onConflict: 'client_id,day_number' }
    )
    setSaving(false)
  }

  const totalDays = CURRICULUM.length
  const COLS = 7
  const rows: number[][] = []
  for (let i = 0; i < totalDays; i += COLS) {
    const chunk = Array.from({ length: Math.min(COLS, totalDays - i) }, (_, j) => i + j + 1)
    rows.push(chunk)
  }

  useEffect(() => {
    if (selected && panelRef.current) {
      panelRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
    }
  }, [selected])

  const selectedEntry = selected ? CURRICULUM.find(c => c.day === selected) : null
  const selectedVideo = selectedEntry?.type === 'video' ? VIDEOS.find(v => v.id === selectedEntry.refId) : null
  const selectedArticle = selectedEntry?.type === 'article' ? RESOURCES.find(r => r.id === selectedEntry.refId) : null

  const ORANGE = '#f97316'
  const DARK = '#18181b'

  function NodeIcon({ status }: { status: 'done' | 'current' | 'locked' }) {
    if (status === 'done') return (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round"><path d="M20 6L9 17l-5-5"/></svg>
    )
    if (status === 'locked') return (
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#a1a1aa" strokeWidth="2.5" strokeLinecap="round"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
    )
    return null
  }

  function getShortTitle(day: number): string {
    const e = CURRICULUM.find(c => c.day === day)
    if (!e) return ''
    if (e.type === 'video') {
      const v = VIDEOS.find(v => v.id === e.refId)
      if (!v) return ''
      const words = v.title.split(' ')
      return words.slice(0, 2).join(' ')
    }
    if (e.type === 'article') {
      const a = RESOURCES.find(r => r.id === e.refId)
      if (!a) return ''
      return a.title.split(' ').slice(0, 2).join(' ')
    }
    return ''
  }

  return (
    <div style={{ padding: '32px 40px 80px', maxWidth: '900px', margin: '0 auto' }} className="anim-fadeup">
      {/* Header */}
      <div style={{ marginBottom: '36px' }}>
        <div style={{ fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: ORANGE, marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ display: 'block', width: '20px', height: '2px', background: ORANGE, borderRadius: '1px' }} />
          Your recovery path
        </div>
        <h1 style={{ fontFamily: 'var(--font-instrument)', fontSize: 'clamp(1.8rem,4vw,2.4rem)', fontWeight: 400, color: DARK, marginBottom: '14px' }}>The Path</h1>
        <p style={{ fontSize: '0.9rem', color: '#52525b', lineHeight: 1.75, maxWidth: '620px' }}>
          You already have the foundation. You understand the neuroscience, you understand your case, and you know how it applies to you. But hearing it once is not enough. The brain needs repetition. Confidence in this process is not built in a single conversation — it's built by consistently returning to this material, hearing it from different voices and in different ways. Learning and consistently hearing this message over and over helps crush any doubt that comes up during the process. Let's go!
        </p>
      </div>

      {/* Snake map */}
      <div style={{ background: 'white', border: '1px solid #e4e4e7', borderRadius: '16px', padding: '28px 20px', marginBottom: '28px', overflowX: 'auto' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0', minWidth: `${COLS * 90}px` }}>
          {rows.map((row, rowIdx) => {
            const isReversed = rowIdx % 2 === 1
            const displayRow = isReversed ? [...row].reverse() : row
            return (
              <div key={rowIdx}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0' }}>
                  {displayRow.map((day, dayIdx) => {
                    const status = nodeStatus(day)
                    const isSelected = selected === day
                    const isLast = dayIdx === displayRow.length - 1
                    const connectorDone = isReversed
                      ? nodeStatus(day - 1) === 'done' || nodeStatus(day) === 'done'
                      : nodeStatus(day) === 'done'

                    return (
                      <div key={day} style={{ display: 'flex', alignItems: 'center', flexShrink: 0 }}>
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '5px', width: '84px' }}>
                          <div
                            onClick={() => {
                              if (status === 'locked') return
                              setSelected(selected === day ? null : day)
                            }}
                            title={status === 'locked' ? 'Complete the previous day to unlock' : undefined}
                            style={{
                              width: '48px', height: '48px', borderRadius: '50%',
                              display: 'flex', alignItems: 'center', justifyContent: 'center',
                              cursor: status === 'locked' ? 'not-allowed' : 'pointer',
                              fontSize: '13px', fontWeight: 800, transition: 'all 0.2s',
                              background: status === 'done' ? ORANGE : status === 'current' ? DARK : '#f4f4f5',
                              color: status === 'locked' ? '#a1a1aa' : 'white',
                              boxShadow: status === 'done' ? '0 0 0 3px rgba(249,115,22,0.18)' :
                                         status === 'current' ? `0 0 0 3px rgba(249,115,22,0.35), 0 0 0 6px rgba(249,115,22,0.08)` : 'none',
                              border: status === 'locked' ? '2px solid #e4e4e7' : 'none',
                              outline: isSelected ? `3px solid ${ORANGE}` : 'none',
                              outlineOffset: '3px',
                              opacity: status === 'locked' ? 0.65 : 1,
                            }}
                          >
                            {status === 'current' || status === 'locked' ? <NodeIcon status={status} /> : null}
                            {status === 'done' && <NodeIcon status="done" />}
                            {status === 'current' && (
                              <span style={{ fontSize: '11px', fontWeight: 800 }}>{day}</span>
                            )}
                          </div>
                          <div style={{ textAlign: 'center' }}>
                            <div style={{ fontSize: '9px', fontWeight: 700, color: status === 'done' ? ORANGE : status === 'current' ? DARK : '#a1a1aa', letterSpacing: '0.05em' }}>
                              Day {day}
                            </div>
                            <div style={{ fontSize: '8px', color: '#a1a1aa', lineHeight: 1.3, marginTop: '1px', maxWidth: '72px' }}>
                              {status === 'locked' ? '—' : getShortTitle(day)}
                            </div>
                          </div>
                        </div>
                        {!isLast && (
                          <div style={{ width: '20px', height: '3px', flexShrink: 0, marginBottom: '20px', background: connectorDone ? ORANGE : '#e4e4e7', borderRadius: '2px' }} />
                        )}
                      </div>
                    )
                  })}
                </div>

                {/* Row connector */}
                {rowIdx < rows.length - 1 && (
                  <div style={{
                    display: 'flex',
                    justifyContent: isReversed ? 'flex-start' : 'flex-end',
                    paddingLeft: isReversed ? '42px' : '0',
                    paddingRight: isReversed ? '0' : '42px',
                    margin: '0 0 4px',
                  }}>
                    <div style={{ width: '3px', height: '22px', background: '#e4e4e7', borderRadius: '2px' }} />
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* Selected day panel */}
      {selected && selectedEntry && (
        <div ref={panelRef} style={{ background: 'white', borderRadius: '16px', border: `1.5px solid ${ORANGE}`, overflow: 'hidden' }} className="anim-fadein">
          <div style={{ background: DARK, padding: '20px 26px', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
            <div>
              <div style={{ fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.35)', marginBottom: '5px' }}>
                Day {selected} · {selectedEntry.type === 'video' ? 'Video' : 'Article'}
                {selectedEntry.part ? ` · Part ${selectedEntry.part.current} of ${selectedEntry.part.total}` : ''}
              </div>
              <div style={{ fontSize: '1.05rem', fontWeight: 700, color: 'white', lineHeight: 1.3 }}>
                {selectedVideo?.title || selectedArticle?.title}
              </div>
              {selectedVideo?.meta && <div style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.38)', marginTop: '4px' }}>{selectedVideo.meta}</div>}
            </div>
            <button onClick={() => setSelected(null)} style={{ background: 'rgba(255,255,255,0.08)', border: 'none', borderRadius: '50%', width: '28px', height: '28px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginLeft: '16px' }}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round"><path d="M18 6L6 18M6 6l12 12"/></svg>
            </button>
          </div>

          <div style={{ padding: '22px 26px' }}>
            <p style={{ fontSize: '0.88rem', color: '#52525b', lineHeight: 1.7, marginBottom: '18px' }}>
              {selectedVideo?.desc || selectedArticle?.desc}
            </p>

            {selectedEntry.part && (
              <div style={{ fontSize: '0.8rem', color: ORANGE, fontWeight: 600, marginBottom: '14px' }}>
                Watch from {formatMin(selectedEntry.part.startMin)} — stop around {formatMin(selectedEntry.part.endMin)}
              </div>
            )}

            {selectedVideo && (
              <button
                onClick={() => setVideoModal({ ytId: selectedEntry.refId, title: selectedVideo.title, startSec: (selectedEntry.part?.startMin ?? 0) * 60 })}
                style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: ORANGE, color: 'white', padding: '10px 20px', borderRadius: '10px', fontSize: '0.84rem', fontWeight: 700, border: 'none', cursor: 'pointer', marginBottom: '22px', fontFamily: 'inherit' }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="white"><path d="M8 5v14l11-7z"/></svg>
                Watch
                {selectedEntry.part && <span style={{ fontWeight: 400, opacity: 0.8 }}>from {formatMin(selectedEntry.part.startMin)}</span>}
              </button>
            )}

            {selectedArticle?.url && (
              <a href={selectedArticle.url} target="_blank" rel="noopener noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: ORANGE, color: 'white', padding: '10px 20px', borderRadius: '10px', fontSize: '0.84rem', fontWeight: 700, textDecoration: 'none', marginBottom: '22px' }}>
                Read Article
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round"><path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
              </a>
            )}

            {/* Notes */}
            <div style={{ borderTop: '1px solid #f4f4f5', paddingTop: '20px' }}>
              <div style={{ fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#a1a1aa', marginBottom: '10px' }}>
                Your notes
              </div>
              <textarea
                key={selected}
                placeholder="What stuck out to you from this assignment?"
                defaultValue={notes[selected] || ''}
                onBlur={e => {
                  const val = e.target.value
                  setNotes(prev => ({ ...prev, [selected]: val }))
                  saveNote(selected, val)
                }}
                style={{ width: '100%', minHeight: '90px', fontFamily: 'inherit', fontSize: '0.88rem', color: DARK, border: '1.5px solid #e4e4e7', borderRadius: '10px', padding: '12px 14px', resize: 'vertical', outline: 'none', lineHeight: 1.6, background: '#fafafa' }}
              />
              {saving && <div style={{ fontSize: '0.72rem', color: '#a1a1aa', marginTop: '5px' }}>Saving...</div>}
            </div>
          </div>
        </div>
      )}

      {/* Video modal */}
      {videoModal && (
        <div onClick={() => setVideoModal(null)} style={{ position: 'fixed', inset: 0, zIndex: 200, background: 'rgba(11,26,46,0.78)', backdropFilter: 'blur(10px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }} className="anim-fadein">
          <div onClick={e => e.stopPropagation()} style={{ background: 'white', borderRadius: '20px', overflow: 'hidden', width: '100%', maxWidth: '760px' }} className="anim-scalein">
            <div style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #f4f4f5' }}>
              <div style={{ fontSize: '0.95rem', fontWeight: 700, color: DARK }}>{videoModal.title}</div>
              <button onClick={() => setVideoModal(null)} style={{ width: '30px', height: '30px', borderRadius: '50%', background: '#f4f4f5', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12"/></svg>
              </button>
            </div>
            <div style={{ position: 'relative', paddingBottom: '56.25%', height: 0 }}>
              <iframe src={`https://www.youtube.com/embed/${videoModal.ytId}?autoplay=1&rel=0&start=${videoModal.startSec}`} allow="autoplay; encrypted-media" allowFullScreen style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', border: 'none' }} />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
