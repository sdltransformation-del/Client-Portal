'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import RemindersOverlay from './RemindersOverlay'
import CheckInOverlay from './CheckInOverlay'
import TodayTab from './TodayTab'
import PathTab from './PathTab'
import EvidenceTab from './EvidenceTab'
import CheckinsTab from './CheckinsTab'

type Tab = 'today' | 'path' | 'evidence' | 'checkins'

interface Props {
  client: {
    id: string
    name: string
    email: string
    start_date: string | null
    day_number: number | null
    notes: string | null
    exercise_mode: string | null
    unlearn_pain_only: boolean | null
  }
}

export default function PortalApp({ client }: Props) {
  const [reminderDone, setReminderDone] = useState(false)
  const [showCheckIn, setShowCheckIn] = useState(() => {
    if (typeof window === 'undefined') return false
    const startDate = client.start_date
    if (!startDate) return false
    const [y, m, d] = startDate.slice(0, 10).split('-').map(Number)
    const start = new Date(y, m - 1, d)
    const today = new Date(); today.setHours(0, 0, 0, 0)
    const currentDay = Math.max(1, Math.floor((today.getTime() - start.getTime()) / 86400000) + 1)
    if (currentDay <= 1 || currentDay % 2 !== 0) return false
    const lastShown = Number(localStorage.getItem(`checkin_last_shown_${client.id}`) || 0)
    if (lastShown === currentDay) return false
    localStorage.setItem(`checkin_last_shown_${client.id}`, String(currentDay))
    return true
  })
  const [tab, setTab] = useState<Tab>('today')
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [showCheckinBanner, setShowCheckinBanner] = useState(() => {
    if (typeof window === 'undefined') return false
    const startDate = client.start_date
    if (!startDate) return false
    const [y, m, d] = startDate.slice(0, 10).split('-').map(Number)
    const start = new Date(y, m - 1, d)
    const today = new Date(); today.setHours(0, 0, 0, 0)
    const currentDay = Math.max(1, Math.floor((today.getTime() - start.getTime()) / 86400000) + 1)
    if (currentDay < 3 || currentDay % 3 !== 0) return false
    const lastShown = Number(localStorage.getItem(`checkin_banner_${client.id}`) || 0)
    if (lastShown === currentDay) return false
    localStorage.setItem(`checkin_banner_${client.id}`, String(currentDay))
    return true
  })
  const router = useRouter()
  const supabase = createClient()

  const initials = client.name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)
  const firstName = client.name.split(' ')[0]

  useEffect(() => {
    supabase.from('activity_log').insert({ client_id: client.id, type: 'login' })
  }, [])

  async function signOut() {
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  const navItems: { id: Tab; label: string; icon: React.ReactNode }[] = [
    {
      id: 'today', label: 'Today',
      icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg>
    },
    {
      id: 'path', label: 'The Path',
      icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
    },
    {
      id: 'evidence', label: 'My Case',
      icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>
    },
    {
      id: 'checkins', label: 'Check-ins',
      icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
    },
  ]

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#f4f4f5' }}>
      {!reminderDone && <RemindersOverlay onEnter={() => setReminderDone(true)} unlearnPainOnly={client.unlearn_pain_only ?? false} />}
      {reminderDone && showCheckIn && <CheckInOverlay onDismiss={() => setShowCheckIn(false)} />}

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div onClick={() => setSidebarOpen(false)} style={{ position: 'fixed', inset: 0, zIndex: 150, background: 'rgba(0,0,0,0.5)' }} />
      )}

      {/* Sidebar */}
      <aside style={{
        width: '220px', background: '#18181b', flexShrink: 0,
        display: 'flex', flexDirection: 'column', padding: '24px 0',
        position: 'fixed', top: 0, left: sidebarOpen ? 0 : '-220px', bottom: 0, zIndex: 200,
        transition: 'left 0.25s cubic-bezier(0.16,1,0.3,1)'
      }} className="desktop-sidebar">
        {/* Logo */}
        <div style={{ padding: '0 20px 20px', borderBottom: '1px solid rgba(255,255,255,0.07)', marginBottom: '16px' }}>
          <div style={{ fontSize: '0.7rem', fontWeight: 800, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'white' }}>The Way Back</div>
          <div style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.3)', marginTop: '3px', letterSpacing: '0.04em' }}>Pain recovery program</div>
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '2px', padding: '0 8px' }}>
          {navItems.map(item => (
            <button
              key={item.id}
              onClick={() => { setTab(item.id); setSidebarOpen(false) }}
              style={{
                display: 'flex', alignItems: 'center', gap: '11px',
                padding: '10px 12px', fontFamily: 'inherit', fontSize: '0.82rem', fontWeight: 600,
                background: tab === item.id ? 'rgba(249,115,22,0.15)' : 'transparent',
                color: tab === item.id ? '#f97316' : 'rgba(255,255,255,0.45)',
                border: 'none', borderRadius: '8px',
                borderRight: tab === item.id ? '2px solid #f97316' : '2px solid transparent',
                cursor: 'pointer', transition: 'all 0.15s', textAlign: 'left', width: '100%'
              }}
            >
              {item.icon}
              {item.label}
            </button>
          ))}
        </nav>

        {/* User */}
        <div style={{ padding: '16px 20px 0', borderTop: '1px solid rgba(255,255,255,0.07)', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ width: '30px', height: '30px', borderRadius: '50%', background: '#f97316', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.65rem', fontWeight: 800, color: 'white', flexShrink: 0 }}>
            {initials}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: '0.78rem', fontWeight: 600, color: 'rgba(255,255,255,0.8)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{firstName}</div>
            <button onClick={signOut} style={{ fontFamily: 'inherit', fontSize: '0.65rem', color: 'rgba(255,255,255,0.3)', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>Sign out</button>
          </div>
        </div>
      </aside>

      {/* Main */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', marginLeft: '220px' }}>
        {/* Mobile topbar */}
        <div style={{ display: 'none', position: 'sticky', top: 0, zIndex: 100, background: '#18181b', padding: '12px 20px', alignItems: 'center', justifyContent: 'space-between' }} className="mobile-topbar">
          <button onClick={() => setSidebarOpen(true)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'white', padding: 0 }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
          </button>
          <div style={{ fontSize: '0.7rem', fontWeight: 800, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'white' }}>The Way Back</div>
          <div style={{ width: '20px' }} />
        </div>

        <main style={{ flex: 1 }}>
          {tab === 'today' && showCheckinBanner && (
            <div style={{ maxWidth: '960px', margin: '24px auto 0', padding: '0 40px' }}>
              <div style={{ background: '#18181b', border: '1.5px solid rgba(249,115,22,0.35)', borderRadius: '14px', padding: '16px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px', flexWrap: 'wrap' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                  <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'rgba(249,115,22,0.15)', border: '1.5px solid rgba(249,115,22,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#f97316" strokeWidth="2" strokeLinecap="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
                  </div>
                  <div>
                    <div style={{ fontSize: '0.82rem', fontWeight: 700, color: 'white' }}>Time for your 3-day check-in</div>
                    <div style={{ fontSize: '0.76rem', color: 'rgba(255,255,255,0.45)', marginTop: '2px' }}>Share what you've noticed — new evidence, doubts, symptoms, a win.</div>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <button onClick={() => setTab('checkins')} style={{ fontFamily: 'inherit', fontSize: '0.8rem', fontWeight: 700, padding: '8px 16px', background: '#f97316', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>
                    Write check-in
                  </button>
                  <button onClick={() => setShowCheckinBanner(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.3)', padding: '4px', display: 'flex' }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M18 6L6 18M6 6l12 12"/></svg>
                  </button>
                </div>
              </div>
            </div>
          )}
          {tab === 'today'    && <TodayTab client={client} />}
          {tab === 'path'     && <PathTab client={client} />}
          {tab === 'evidence' && <EvidenceTab client={client} />}
          {tab === 'checkins' && <CheckinsTab client={client} />}
        </main>

        <footer style={{ background: '#18181b', padding: '24px 48px' }}>
          <div style={{ maxWidth: '960px', margin: '0 auto' }}>
            <div style={{ height: '1px', background: 'rgba(255,255,255,0.07)', marginBottom: '18px' }} />
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '24px', flexWrap: 'wrap' }}>
              <p style={{ fontSize: '0.68rem', color: 'rgba(255,255,255,0.28)' }}>&copy; 2026 Serge du Lau. All rights reserved.</p>
              <div style={{ display: 'flex', gap: '20px' }}>
                {['Privacy', 'Terms', 'Disclaimer'].map(l => (
                  <a key={l} href="#" style={{ fontSize: '0.68rem', color: 'rgba(255,255,255,0.28)', textDecoration: 'none' }}>{l}</a>
                ))}
              </div>
            </div>
          </div>
        </footer>
      </div>

      <style>{`
        @media (min-width: 768px) { .desktop-sidebar { left: 0 !important; } }
        @media (max-width: 767px) {
          .mobile-topbar { display: flex !important; }
          div[style*="marginLeft: 220px"] { margin-left: 0 !important; }
        }
      `}</style>
    </div>
  )
}
