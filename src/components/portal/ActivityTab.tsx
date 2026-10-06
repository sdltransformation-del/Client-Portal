'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'

interface Exercise {
  id: string; name: string; sets: string | null; reps: string | null; duration: string | null; notes: string | null; sort_order: number
}
interface Workout {
  id: string; name: string; sort_order: number; exercises: Exercise[]
}
interface SessionLog {
  id: string; workout_id: string; completed_at: string; notes: string | null
}

interface Props {
  client: { id: string; name: string }
}

const ORANGE = '#f97316'
const DARK = '#18181b'

export default function ActivityTab({ client }: Props) {
  const supabase = createClient()
  const [workouts, setWorkouts] = useState<Workout[]>([])
  const [sessions, setSessions] = useState<SessionLog[]>([])
  const [loading, setLoading] = useState(true)
  const [loggingId, setLoggingId] = useState<string | null>(null)
  const [sessionNote, setSessionNote] = useState<Record<string, string>>({})
  const [planName, setPlanName] = useState('')

  useEffect(() => {
    load()
  }, [])

  async function load() {
    setLoading(true)
    const { data: planData } = await supabase
      .from('activity_plans')
      .select('id,name')
      .eq('client_id', client.id)
      .order('created_at', { ascending: false })
      .limit(1)

    if (!planData?.[0]) { setLoading(false); return }
    const plan = planData[0]
    setPlanName(plan.name)

    const { data: wData } = await supabase
      .from('activity_workouts')
      .select('*')
      .eq('plan_id', plan.id)
      .order('sort_order', { ascending: true })

    if (wData && wData.length > 0) {
      const { data: eData } = await supabase
        .from('activity_exercises')
        .select('*')
        .in('workout_id', wData.map(w => w.id))
        .order('sort_order', { ascending: true })

      setWorkouts(wData.map(w => ({
        ...w,
        exercises: (eData || []).filter(e => e.workout_id === w.id),
      })))
    }

    const { data: sData } = await supabase
      .from('activity_sessions')
      .select('*')
      .eq('client_id', client.id)
      .order('completed_at', { ascending: false })
      .limit(30)

    setSessions(sData || [])
    setLoading(false)
  }

  async function logSession(workoutId: string) {
    setLoggingId(workoutId)
    const note = (sessionNote[workoutId] || '').trim() || null
    await supabase.from('activity_sessions').insert({
      client_id: client.id,
      workout_id: workoutId,
      completed_at: new Date().toISOString().slice(0, 10),
      notes: note,
    })
    setSessionNote(prev => ({ ...prev, [workoutId]: '' }))
    await load()
    setLoggingId(null)
  }

  function nextWorkout(): Workout | null {
    if (workouts.length === 0) return null
    if (sessions.length === 0) return workouts[0]
    const lastSession = sessions[0]
    const lastIdx = workouts.findIndex(w => w.id === lastSession.workout_id)
    return workouts[(lastIdx + 1) % workouts.length]
  }

  const next = nextWorkout()
  const todayStr = new Date().toISOString().slice(0, 10)
  const loggedTodayWorkoutIds = new Set(sessions.filter(s => s.completed_at === todayStr).map(s => s.workout_id))

  const workoutColorMap: Record<string, string> = {}
  workouts.forEach((w, i) => {
    workoutColorMap[w.id] = i % 2 === 0 ? ORANGE : DARK
  })

  return (
    <div style={{ padding: '32px 40px 80px', maxWidth: '760px', margin: '0 auto' }} className="anim-fadeup">

      {/* Header */}
      <div style={{ marginBottom: '32px' }}>
        <div style={{ fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: ORANGE, marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ display: 'block', width: '20px', height: '2px', background: ORANGE, borderRadius: '1px' }} />
          Physical activity
        </div>
        <h1 style={{ fontFamily: 'var(--font-instrument)', fontSize: 'clamp(1.8rem,4vw,2.4rem)', fontWeight: 400, color: DARK, marginBottom: '14px' }}>
          {planName || 'Your Activity Plan'}
        </h1>
        <p style={{ fontSize: '0.9rem', color: '#52525b', lineHeight: 1.8, maxWidth: '560px' }}>
          Consistent movement helps retrain your nervous system. Log each session after you complete it — small wins compound.
        </p>
      </div>

      {loading ? (
        <div style={{ fontSize: '0.85rem', color: '#a1a1aa', padding: '16px 0' }}>Loading...</div>
      ) : workouts.length === 0 ? (
        <div style={{ background: 'white', border: '1px dashed #d4d4d8', borderRadius: '14px', padding: '40px', textAlign: 'center', fontSize: '0.9rem', color: '#a1a1aa' }}>
          Your coach hasn't set up an activity plan yet. Check back soon.
        </div>
      ) : (
        <>
          {/* Next up banner */}
          {next && !loggedTodayWorkoutIds.has(next.id) && (
            <div style={{ background: ORANGE, borderRadius: '14px', padding: '16px 20px', marginBottom: '28px', display: 'flex', alignItems: 'center', gap: '14px' }}>
              <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round"><polygon points="5 3 19 12 5 21 5 3"/></svg>
              </div>
              <div>
                <div style={{ fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.7)', marginBottom: '2px' }}>Up next</div>
                <div style={{ fontSize: '0.95rem', fontWeight: 700, color: 'white' }}>{next.name}</div>
              </div>
            </div>
          )}

          {/* Workouts */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', marginBottom: '36px' }}>
            {workouts.map((w) => {
              const isNext = next?.id === w.id
              const doneToday = loggedTodayWorkoutIds.has(w.id)
              return (
                <div key={w.id} style={{ borderRadius: '16px', overflow: 'hidden', border: `1.5px solid ${isNext ? ORANGE : '#e4e4e7'}`, boxShadow: isNext ? '0 0 0 3px rgba(249,115,22,0.12)' : 'none' }}>
                  {/* Workout header */}
                  <div style={{ background: isNext ? DARK : '#fafafa', padding: '16px 20px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ fontSize: '1rem', fontWeight: 700, color: isNext ? 'white' : DARK, flex: 1 }}>{w.name}</div>
                    {doneToday && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: '#d1fae5', borderRadius: '20px', padding: '4px 12px' }}>
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#059669" strokeWidth="3" strokeLinecap="round"><path d="M20 6L9 17l-5-5"/></svg>
                        <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#059669' }}>Done today</span>
                      </div>
                    )}
                  </div>

                  {/* Exercises */}
                  <div style={{ background: 'white', padding: '4px 0' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                      <thead>
                        <tr style={{ borderBottom: '1px solid #f4f4f5' }}>
                          {['Exercise', 'Sets', 'Reps', 'Duration'].map(h => (
                            <th key={h} style={{ padding: '8px 20px', textAlign: 'left', fontSize: '0.62rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#a1a1aa' }}>{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {w.exercises.map((ex, i) => (
                          <tr key={ex.id} style={{ borderBottom: i < w.exercises.length - 1 ? '1px solid #f4f4f5' : 'none' }}>
                            <td style={{ padding: '10px 20px' }}>
                              <div style={{ fontSize: '0.88rem', fontWeight: 600, color: DARK }}>{ex.name}</div>
                              {ex.notes && <div style={{ fontSize: '0.75rem', color: '#71717a', marginTop: '2px' }}>{ex.notes}</div>}
                            </td>
                            <td style={{ padding: '10px 20px', fontSize: '0.88rem', color: '#52525b' }}>{ex.sets || '—'}</td>
                            <td style={{ padding: '10px 20px', fontSize: '0.88rem', color: '#52525b' }}>{ex.reps || '—'}</td>
                            <td style={{ padding: '10px 20px', fontSize: '0.88rem', color: '#52525b' }}>{ex.duration || '—'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Log section */}
                  {!doneToday && (
                    <div style={{ background: '#fafafa', borderTop: '1px solid #f4f4f5', padding: '12px 20px', display: 'flex', gap: '10px', alignItems: 'center' }}>
                      <input
                        value={sessionNote[w.id] || ''}
                        onChange={e => setSessionNote(prev => ({ ...prev, [w.id]: e.target.value }))}
                        placeholder="Add a note (optional)..."
                        style={{ flex: 1, fontFamily: 'inherit', fontSize: '0.84rem', border: '1px solid #e4e4e7', borderRadius: '8px', padding: '8px 12px', outline: 'none', background: 'white', color: DARK }}
                      />
                      <button
                        onClick={() => logSession(w.id)}
                        disabled={loggingId === w.id}
                        style={{ fontFamily: 'inherit', fontSize: '0.8rem', fontWeight: 700, padding: '9px 16px', background: ORANGE, color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', flexShrink: 0, opacity: loggingId === w.id ? 0.6 : 1 }}
                      >
                        {loggingId === w.id ? 'Logging...' : 'Log session'}
                      </button>
                    </div>
                  )}
                </div>
              )
            })}
          </div>

          {/* Session history */}
          {sessions.length > 0 && (
            <div>
              <div style={{ fontSize: '0.62rem', fontWeight: 700, letterSpacing: '0.16em', textTransform: 'uppercase', color: '#a1a1aa', marginBottom: '14px' }}>Session history</div>
              <div style={{ background: 'white', borderRadius: '14px', border: '1px solid #e4e4e7', overflow: 'hidden' }}>
                {sessions.map((s, i) => {
                  const w = workouts.find(w => w.id === s.workout_id)
                  const date = new Date(s.completed_at + 'T12:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
                  return (
                    <div key={s.id} style={{ display: 'flex', alignItems: 'center', gap: '14px', padding: '12px 20px', borderBottom: i < sessions.length - 1 ? '1px solid #f4f4f5' : 'none' }}>
                      <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: '#d1fae5', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#059669" strokeWidth="2.5" strokeLinecap="round"><path d="M20 6L9 17l-5-5"/></svg>
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: '0.88rem', fontWeight: 600, color: DARK }}>{w?.name || 'Session'}</div>
                        {s.notes && <div style={{ fontSize: '0.78rem', color: '#71717a', marginTop: '1px' }}>{s.notes}</div>}
                      </div>
                      <div style={{ fontSize: '0.78rem', color: '#a1a1aa', flexShrink: 0 }}>{date}</div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}
