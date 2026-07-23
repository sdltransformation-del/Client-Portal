'use client'

export default function CheckInOverlay({ clientId, onDismiss }: { clientId: string; onDismiss: () => void }) {
  function dismiss() {
    localStorage.setItem(`checkin_dismissed_${clientId}`, String(Date.now()))
    onDismiss()
  }

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 250, background: 'rgba(11,26,46,0.82)', backdropFilter: 'blur(12px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }} className="anim-fadein">
      <div style={{ width: '100%', maxWidth: '540px', background: 'white', borderRadius: '20px', overflow: 'hidden' }} className="anim-scalein">

        {/* Header */}
        <div style={{ background: 'var(--navy)', padding: '28px 32px 24px' }}>
          <div style={{ fontSize: '0.68rem', fontWeight: 700, letterSpacing: '0.16em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.4)', marginBottom: '8px' }}>Reminder</div>
          <div style={{ fontFamily: 'var(--font-instrument)', fontSize: '1.55rem', fontWeight: 400, color: 'white', lineHeight: 1.2 }}>Time to check in with Serge</div>
          <div style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.45)', marginTop: '8px', lineHeight: 1.6 }}>Send him a quick message covering a few of these.</div>
        </div>

        {/* Content */}
        <div style={{ padding: '24px 32px', display: 'flex', flexDirection: 'column', gap: '18px' }}>
          {[
            {
              label: 'Your symptoms',
              body: 'How are they right now compared to a few days ago? Have they moved to a different area, changed in intensity, or started showing up at different times? Even small shifts are worth mentioning.'
            },
            {
              label: 'Your doubts',
              body: 'What doubt has come up most recently? Is there something still pulling you toward a structural explanation?'
            },
            {
              label: 'The content',
              body: 'Was there something from the last video or article that landed for you? Or something you couldn\'t get on board with or didn\'t fully believe?'
            },
            {
              label: 'A win',
              body: 'Even a small one. A moment where you moved differently, caught yourself catastrophizing and let it go, or noticed your pain shift when your mental state changed.'
            },
            {
              label: 'A question',
              body: 'Anything you want Serge to clarify or go deeper on.'
            },
          ].map(item => (
            <div key={item.label} style={{ display: 'flex', gap: '14px' }}>
              <div style={{ width: '3px', borderRadius: '2px', background: 'var(--blue)', flexShrink: 0, marginTop: '2px' }} />
              <div>
                <div style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--stone-900)', marginBottom: '3px' }}>{item.label}</div>
                <div style={{ fontSize: '0.85rem', color: 'var(--stone-600)', lineHeight: 1.65 }}>{item.body}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div style={{ padding: '0 32px 28px' }}>
          <button onClick={dismiss} style={{ width: '100%', padding: '15px', fontFamily: 'inherit', fontSize: '0.9rem', fontWeight: 700, background: 'var(--blue)', color: 'white', border: 'none', borderRadius: '12px', cursor: 'pointer' }}>
            Got it, I'll send an update
          </button>
        </div>
      </div>
    </div>
  )
}
