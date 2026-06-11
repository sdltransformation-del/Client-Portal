import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import PortalApp from '@/components/portal/PortalApp'

export default async function PortalPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Fetch client record matched by auth email
  const { data: clientRows } = await supabase
    .from('clients')
    .select('*')
    .eq('email', user.email!)
    .limit(1)

  const client = clientRows?.[0] ?? null

  if (!client) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--navy)', color: 'white', flexDirection: 'column', gap: '12px', textAlign: 'center', padding: '24px' }}>
        <div style={{ fontFamily: 'var(--font-instrument)', fontSize: '1.6rem' }}>Not yet enrolled</div>
        <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.9rem', maxWidth: '360px' }}>
          Your account exists but has not been linked to a program yet. Contact Serge to get set up.
        </p>
      </div>
    )
  }

  // Fetch evidence seeded by admin
  const { data: evidenceRows } = await supabase
    .from('evidence')
    .select('*')
    .eq('client_id', client.id)
    .order('created_at', { ascending: true })

  const adminEvidence: Record<string, string[]> = {}
  for (const e of evidenceRows ?? []) {
    if (!adminEvidence[e.section]) adminEvidence[e.section] = []
    adminEvidence[e.section].push(e.content)
  }

  return <PortalApp client={client} adminEvidence={adminEvidence} userEmail={user.email!} />
}
