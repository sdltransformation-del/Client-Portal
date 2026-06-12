'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import RemindersOverlay from './RemindersOverlay'
import TodayTab from './TodayTab'
import LibraryTab from './LibraryTab'
import ResourcesTab from './ResourcesTab'
import EvidenceTab from './EvidenceTab'
import CommunityTab from './CommunityTab'
import NotesTab from './NotesTab'

type Tab = 'today' | 'library' | 'resources' | 'evidence' | 'community' | 'notes'

interface Props {
  client: {
    id: string
    name: string
    email: string
    start_date: string | null
    day_number: number | null
    notes: string | null
  }
  adminEvidence: Record<string, string[]>
  userEmail: string
}

export default function PortalApp({ client, adminEvidence, userEmail }: Props) {
  const [reminderDone, setReminderDone] = useState(false)
  const [tab, setTab] = useState<Tab>('today')
  const router = useRouter()
  const supabase = createClient()

  const initials = client.name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)
  const firstName = client.name.split(' ')[0]
  const day = client.day_number || 1

  async function signOut() {
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  const tabs: { id: Tab; label: string }[] = [
    { id: 'today', label: 'Today' },
    { id: 'library', label: 'Video Library' },
    { id: 'resources', label: 'Resources' },
    { id: 'evidence', label: 'My Evidence' },
    { id: 'community', label: 'Community' },
    { id: 'notes', label: 'Recovery Journal' },
  ]

  return (
    <div style={{ background: 'var(--blue-pale)', minHeight: '100vh' }}>
      {!reminderDone && <RemindersOverlay onEnter={() => setReminderDone(true)} />}

      {/* Topbar */}
      <nav style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
        padding: '18px 48px', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        background: 'rgba(238,242,252,0.93)', backdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(27,79,216,0.1)'
      }}>
        <div style={{ fontSize: '0.9rem', fontWeight: 700, letterSpacing: '0.22em', textTransform: 'uppercase', color: 'var(--stone-900)' }}>
          The Way Back
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
<div style={{ display: 'flex', alignItems: 'center', gap: '9px', fontSize: '0.82rem', fontWeight: 600, color: 'var(--stone-700)' }}>
            <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'var(--blue)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.72rem', fontWeight: 800, color: 'white' }}>
              {initials}
            </div>
            <span>{firstName}</span>
          </div>
          <button onClick={signOut} style={{ fontFamily: 'inherit', fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-muted)', background: 'none', border: 'none', cursor: 'pointer' }}>
            Sign out
          </button>
        </div>
      </nav>

      {/* Nav tabs */}
      <div style={{
        position: 'fixed', top: '64px', left: 0, right: 0, zIndex: 99,
        padding: '0 48px', background: 'rgba(238,242,252,0.93)', backdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(27,79,216,0.08)', display: 'flex', gap: 0
      }}>
        {tabs.map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            style={{
              padding: '14px 22px', fontFamily: 'inherit', fontSize: '0.78rem', fontWeight: 600,
              letterSpacing: '0.08em', textTransform: 'uppercase', background: 'none', border: 'none',
              borderBottom: `2px solid ${tab === t.id ? 'var(--blue)' : 'transparent'}`,
              color: tab === t.id ? 'var(--blue)' : 'var(--text-muted)', cursor: 'pointer', transition: 'all 0.2s'
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Page content */}
      <div style={{ paddingTop: '128px' }}>
        {tab === 'today'     && <TodayTab client={client} />}
        {tab === 'library'   && <LibraryTab />}
        {tab === 'resources' && <ResourcesTab />}
        {tab === 'evidence'  && <EvidenceTab clientId={client.id} adminEvidence={adminEvidence} />}
        {tab === 'community' && <CommunityTab client={client} />}
        {tab === 'notes'     && <NotesTab />}
      </div>

      {/* Footer */}
      <footer style={{ background: 'var(--navy)', padding: '32px 48px', marginTop: '0' }}>
        <div style={{ maxWidth: '960px', margin: '0 auto' }}>
          <div style={{ height: '1px', background: 'rgba(255,255,255,0.07)', marginBottom: '22px' }} />
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
  )
}
