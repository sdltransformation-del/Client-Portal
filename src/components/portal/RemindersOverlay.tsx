'use client'
import { useState } from 'react'
import { REMINDERS } from '@/lib/data'

const EMOTIONS_REMINDER = 'My emotions matter. Unprocessed stress, repressed anger, and accumulated pressure are directly connected to my symptoms.'

export default function RemindersOverlay({ onEnter, unlearnPainOnly }: { onEnter: () => void; unlearnPainOnly?: boolean }) {
  const reminders = unlearnPainOnly ? REMINDERS.filter(r => r !== EMOTIONS_REMINDER) : REMINDERS
  const [checked, setChecked] = useState<boolean[]>(new Array(reminders.length).fill(false))

  function toggle(i: number) {
    setChecked(prev => { const n = [...prev]; n[i] = !n[i]; return n })
  }

  const count = checked.filter(Boolean).length
  const ready = count === reminders.length
  const pct = Math.round((count / reminders.length) * 100)

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 300, background: 'var(--navy)',
      display: 'flex', alignItems: 'flex-start', justifyContent: 'center',
      padding: '32px 24px', overflowY: 'auto'
    }} className="anim-fadein">
      <div style={{ width: '100%', maxWidth: '560px', margin: 'auto 0' }} className="anim-scalein">
        <div style={{ marginBottom: '20px' }}>
          <div style={{ fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.4)', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ display: 'block', width: '18px', height: '2px', background: 'rgba(255,255,255,0.4)', borderRadius: '1px' }} />
            Before you begin
          </div>
          <div style={{ fontFamily: 'var(--font-instrument)', fontSize: 'clamp(1.3rem,3vw,1.7rem)', fontWeight: 400, color: 'white', lineHeight: 1.2 }}>
            Read this.<br />Every single day.
          </div>
          <div style={{ fontSize: '0.88rem', color: 'rgba(255,255,255,0.45)', marginTop: '8px', lineHeight: 1.6 }}>
            Check each one. When you&apos;ve read and accepted them all, you can enter.
          </div>
        </div>

        {/* Progress */}
        <div style={{ marginBottom: '14px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', fontWeight: 600, color: 'rgba(255,255,255,0.35)', marginBottom: '8px' }}>
            <span>{count} of {reminders.length} confirmed</span>
            <span>{pct}%</span>
          </div>
          <div style={{ height: '4px', background: 'rgba(255,255,255,0.1)', borderRadius: '2px' }}>
            <div style={{ height: '4px', background: 'var(--blue)', borderRadius: '2px', width: `${pct}%`, transition: 'width 0.4s cubic-bezier(0.16,1,0.3,1)' }} />
          </div>
        </div>

        {/* Items */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '20px' }}>
          {reminders.map((text, i) => (
            <div
              key={i}
              onClick={() => toggle(i)}
              style={{
                display: 'flex', alignItems: 'flex-start', gap: '12px',
                background: checked[i] ? 'rgba(27,79,216,0.2)' : 'rgba(255,255,255,0.05)',
                border: `1px solid ${checked[i] ? 'rgba(27,79,216,0.4)' : 'rgba(255,255,255,0.08)'}`,
                borderRadius: '12px', padding: '12px 16px', cursor: 'pointer', transition: 'all 0.2s',
                userSelect: 'none'
              }}
            >
              <div style={{
                width: '24px', height: '24px', flexShrink: 0, borderRadius: '7px',
                border: `1.5px solid ${checked[i] ? 'var(--blue)' : 'rgba(255,255,255,0.25)'}`,
                background: checked[i] ? 'var(--blue)' : 'transparent',
                display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s', marginTop: '1px'
              }}>
                {checked[i] && (
                  <svg width="13" height="13" viewBox="0 0 14 14" fill="none">
                    <path d="M2.5 7l3.5 3.5 5.5-7" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                )}
              </div>
              <div style={{ fontSize: '0.88rem', fontWeight: 500, color: checked[i] ? 'rgba(255,255,255,0.5)' : 'white', lineHeight: 1.45, transition: 'color 0.2s' }}>
                {text}
              </div>
            </div>
          ))}
        </div>

        <button
          onClick={ready ? onEnter : undefined}
          style={{
            width: '100%', padding: '16px', fontFamily: 'inherit', fontSize: '0.9rem', fontWeight: 700,
            letterSpacing: '0.04em', border: 'none', borderRadius: '12px',
            background: 'var(--blue)', color: 'white', cursor: ready ? 'pointer' : 'not-allowed',
            opacity: ready ? 1 : 0.4, transition: 'all 0.2s'
          }}
        >
          {ready ? 'I have read and accepted all of these, enter' : `${count} of ${reminders.length} confirmed, check all to continue`}
        </button>
      </div>
    </div>
  )
}
