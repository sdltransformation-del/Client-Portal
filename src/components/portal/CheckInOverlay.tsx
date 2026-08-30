'use client'

export default function CheckInOverlay({ onDismiss }: { onDismiss: () => void }) {
  function dismiss() {
    onDismiss()
  }

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 250, background: 'rgba(11,26,46,0.82)', backdropFilter: 'blur(12px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }} className="anim-fadein">
      <div style={{ width: '100%', maxWidth: '540px', background: 'white', borderRadius: '20px', overflow: 'hidden', display: 'flex', flexDirection: 'column', maxHeight: 'calc(100vh - 32px)' }} className="anim-scalein">

        {/* Header */}
        <div style={{ background: 'var(--navy)', padding: '22px 24px 18px', flexShrink: 0 }}>
          <div style={{ fontSize: '0.68rem', fontWeight: 700, letterSpacing: '0.16em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.4)', marginBottom: '6px' }}>Reminder</div>
          <div style={{ fontFamily: 'var(--font-instrument)', fontSize: '1.35rem', fontWeight: 400, color: 'white', lineHeight: 1.2 }}>Time to check in with Serge</div>
          <div style={{ fontSize: '0.82rem', color: 'rgba(255,255,255,0.45)', marginTop: '6px', lineHeight: 1.5 }}>Send him a quick message covering a few of these.</div>
        </div>

        {/* Content — scrollable */}
        <div style={{ padding: '18px 24px', display: 'flex', flexDirection: 'column', gap: '14px', overflowY: 'auto', flex: 1 }}>
          {[
            {
              label: 'Your symptoms',
              body: 'How are they right now compared to a few days ago? Any shifts in intensity, location, or timing?'
            },
            {
              label: 'Your doubts',
              body: 'What doubt has come up most recently? Still pulled toward a structural explanation?'
            },
            {
              label: 'The content',
              body: 'Something from the last video or article that landed — or something you couldn\'t get on board with?'
            },
            {
              label: 'A win',
              body: 'Even a small one. A moment where you moved differently or noticed your pain shift.'
            },
            {
              label: 'A question',
              body: 'Anything you want Serge to clarify or go deeper on.'
            },
          ].map(item => (
            <div key={item.label} style={{ display: 'flex', gap: '12px' }}>
              <div style={{ width: '3px', borderRadius: '2px', background: 'var(--blue)', flexShrink: 0, marginTop: '2px' }} />
              <div>
                <div style={{ fontSize: '0.86rem', fontWeight: 700, color: 'var(--stone-900)', marginBottom: '2px' }}>{item.label}</div>
                <div style={{ fontSize: '0.82rem', color: 'var(--stone-600)', lineHeight: 1.55 }}>{item.body}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Footer — always visible */}
        <div style={{ padding: '12px 24px 20px', flexShrink: 0, borderTop: '1px solid #f4f4f5' }}>
          <button onClick={dismiss} style={{ width: '100%', padding: '14px', fontFamily: 'inherit', fontSize: '0.9rem', fontWeight: 700, background: 'var(--blue)', color: 'white', border: 'none', borderRadius: '12px', cursor: 'pointer' }}>
            Got it, I'll send an update
          </button>
        </div>
      </div>
    </div>
  )
}
