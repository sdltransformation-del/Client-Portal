'use client'
import { useState, useEffect } from 'react'
import { createClient as createSupabaseClient } from '@/lib/supabase/client'
import { SECTIONS, VIDEOS, RESOURCES } from '@/lib/data'

const ADMIN_PASSWORD = 'sdsdsd'

interface Client {
  id: string; name: string; email: string; start_date: string | null; day_number: number | null; notes: string | null; created_at: string; exercise_mode: string | null; unlearn_pain_only: boolean | null
}
interface EvidenceEntry { id?: string; text: string; saved: boolean }
interface Assignment {
  id: string; client_id: string; day_number: number; type: string; content_id: string | null; title: string; notes: string | null
}
interface ActivityEntry {
  id: string; client_id: string; type: string; day_number: number | null; content_id: string | null; content_title: string | null; created_at: string
}
interface JournalEntry {
  id: string; client_id: string; text: string; created_at: string
}

type AdminTab = 'details' | 'evidence' | 'assignments' | 'activity'

function timeAgo(iso: string) {
  const diff = (Date.now() - new Date(iso).getTime()) / 1000
  if (diff < 60) return 'just now'
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`
  return `${Math.floor(diff / 86400)}d ago`
}

export default function AdminApp() {
  const [authed, setAuthed] = useState(false)
  const [pwdInput, setPwdInput] = useState('')
  const [pwdError, setPwdError] = useState(false)
  const [clients, setClients] = useState<Client[]>([])
  const [currentClient, setCurrentClient] = useState<Client | null>(null)
  const [adminTab, setAdminTab] = useState<AdminTab>('details')

  // Details
  const [editName, setEditName] = useState(''); const [editEmail, setEditEmail] = useState('')
  const [editDate, setEditDate] = useState(''); const [editDay, setEditDay] = useState(1); const [editNotes, setEditNotes] = useState(''); const [editExerciseMode, setEditExerciseMode] = useState('both'); const [editUnlearnPainOnly, setEditUnlearnPainOnly] = useState(false)
  const [dirty, setDirty] = useState(false)

  // Evidence
  const [pendingEvidence, setPendingEvidence] = useState<Record<string, EvidenceEntry[]>>({})
  const [activeSection, setActiveSection] = useState('checklist')
  const [evInput, setEvInput] = useState('')

  // Assignments
  const [assignments, setAssignments] = useState<Assignment[]>([])
  const [newAssignDay, setNewAssignDay] = useState(1)
  const [newAssignType, setNewAssignType] = useState<'video' | 'article' | 'exercise'>('video')
  const [newAssignContentId, setNewAssignContentId] = useState('')
  const [newAssignTitle, setNewAssignTitle] = useState('')
  const [newAssignNotes, setNewAssignNotes] = useState('')
  const [assignFilter, setAssignFilter] = useState<number | 'all'>('all')

  // Activity & journal
  const [activityLog, setActivityLog] = useState<ActivityEntry[]>([])
  const [journalEntries, setJournalEntries] = useState<JournalEntry[]>([])
  const [activityLoading, setActivityLoading] = useState(false)

  // Modal
  const [showModal, setShowModal] = useState(false)
  const [newName, setNewName] = useState(''); const [newEmail, setNewEmail] = useState(''); const [newDate, setNewDate] = useState('')
  const [toast, setToast] = useState<{ msg: string; type: string } | null>(null)

  const supabase = createSupabaseClient()

  function showToast(msg: string, type = '') { setToast({ msg, type }); setTimeout(() => setToast(null), 3000) }

  function login() {
    if (pwdInput === ADMIN_PASSWORD) { setAuthed(true); loadClients() }
    else setPwdError(true)
  }

  async function loadClients() {
    const { data } = await supabase.from('clients').select('*').order('created_at', { ascending: false })
    setClients(data || [])
  }

  async function selectClient(id: string) {
    const [{ data: clientData }, { data: evData }, { data: assignData }, { data: actData }, { data: journalData }] = await Promise.all([
      supabase.from('clients').select('*').eq('id', id).limit(1),
      supabase.from('evidence').select('*').eq('client_id', id).order('created_at', { ascending: true }),
      supabase.from('assignments').select('*').eq('client_id', id).order('day_number', { ascending: true }),
      supabase.from('activity_log').select('*').eq('client_id', id).order('created_at', { ascending: false }),
      supabase.from('journal_entries').select('*').eq('client_id', id).order('created_at', { ascending: false })
    ])
    const c = clientData?.[0]; if (!c) return
    setCurrentClient(c)
    setEditName(c.name); setEditEmail(c.email); setEditDate(c.start_date || ''); setEditDay(c.day_number || 1); setEditNotes(c.notes || ''); setEditExerciseMode(c.exercise_mode || 'both'); setEditUnlearnPainOnly(c.unlearn_pain_only ?? false)
    const pe: Record<string, EvidenceEntry[]> = {}
    SECTIONS.forEach(s => { pe[s.id] = [] })
    for (const e of evData || []) { if (pe[e.section]) pe[e.section].push({ id: e.id, text: e.content, saved: true }) }
    setPendingEvidence(pe)
    setAssignments(assignData || [])
    setActivityLog(actData || [])
    setJournalEntries(journalData || [])
    setDirty(false); setEvInput(''); setAdminTab('details'); loadClients()
  }

  async function saveClient() {
    if (!currentClient) return
    try {
      await supabase.from('clients').update({ name: editName, email: editEmail, start_date: editDate || null, day_number: editDay, notes: editNotes, exercise_mode: editExerciseMode, unlearn_pain_only: editUnlearnPainOnly }).eq('id', currentClient.id)
      await supabase.from('evidence').delete().eq('client_id', currentClient.id)
      const allEntries: { client_id: string; section: string; content: string; added_by: string }[] = []
      SECTIONS.forEach(s => { (pendingEvidence[s.id] || []).forEach(e => { allEntries.push({ client_id: currentClient.id, section: s.id, content: e.text, added_by: 'admin' }) }) })
      if (allEntries.length > 0) await supabase.from('evidence').insert(allEntries)
      setCurrentClient(prev => prev ? { ...prev, name: editName, email: editEmail, start_date: editDate, day_number: editDay, notes: editNotes, exercise_mode: editExerciseMode, unlearn_pain_only: editUnlearnPainOnly } : null)
      setDirty(false); loadClients(); showToast('Saved successfully', 'success')
    } catch { showToast('Error saving', 'error') }
  }

  async function handleCreateClient() {
    if (!newName.trim() || !newEmail.trim()) { showToast('Name and email are required', 'error'); return }
    const { data } = await supabase.from('clients').insert({ name: newName, email: newEmail, start_date: newDate || null, day_number: 1 }).select()
    setShowModal(false); setNewName(''); setNewEmail(''); setNewDate('')
    await loadClients()
    if (data?.[0]) selectClient(data[0].id)
    showToast('Client created', 'success')
  }

  async function deleteClient(id: string) {
    if (!confirm('Delete this client and all their data? This cannot be undone.')) return
    await supabase.from('clients').delete().eq('id', id)
    setCurrentClient(null); setDirty(false); loadClients(); showToast('Client deleted', 'success')
  }

  // Evidence helpers
  function addEvEntry() {
    const text = evInput.trim(); if (!text) return
    setPendingEvidence(prev => ({ ...prev, [activeSection]: [...(prev[activeSection] || []), { id: undefined, text, saved: false }] }))
    setEvInput(''); setDirty(true)
  }
  function removeEvEntry(sectionId: string, idx: number) {
    setPendingEvidence(prev => { const u = [...(prev[sectionId] || [])]; u.splice(idx, 1); return { ...prev, [sectionId]: u } })
    setDirty(true)
  }

  // Assignment helpers
  function getContentOptions() {
    if (newAssignType === 'video') return VIDEOS.map(v => ({ id: v.id, label: v.title }))
    if (newAssignType === 'article') return RESOURCES.filter(r => r.type !== 'book').map(r => ({ id: r.id, label: r.title }))
    return [
      { id: 'journaling', label: 'Journaling' },
      { id: 'somatic_tracking', label: 'Somatic Tracking' },
      { id: 'reading', label: 'Reading' },
    ]
  }

  function handleContentSelect(id: string) {
    setNewAssignContentId(id)
    // Auto-fill title
    if (newAssignType === 'video') {
      const v = VIDEOS.find(v => v.id === id); if (v) setNewAssignTitle(v.title)
    } else if (newAssignType === 'article') {
      const r = RESOURCES.find(r => r.id === id); if (r) setNewAssignTitle(r.title)
    } else {
      const labels: Record<string, string> = { journaling: 'Journaling', somatic_tracking: 'Somatic Tracking', reading: 'Reading' }
      setNewAssignTitle(labels[id] || id)
    }
  }

  async function addAssignment() {
    if (!currentClient || !newAssignTitle.trim()) return
    const { data } = await supabase.from('assignments').insert({
      client_id: currentClient.id,
      day_number: newAssignDay,
      type: newAssignType,
      content_id: newAssignContentId || null,
      title: newAssignTitle.trim(),
      notes: newAssignNotes.trim() || null
    }).select()
    if (data?.[0]) setAssignments(prev => [...prev, data[0]])
    setNewAssignContentId(''); setNewAssignTitle(''); setNewAssignNotes('')
    showToast('Assignment added', 'success')
  }

  async function deleteAssignment(id: string) {
    await supabase.from('assignments').delete().eq('id', id)
    setAssignments(prev => prev.filter(a => a.id !== id))
  }

  function initials(name: string) { return name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2) }
  function startDate(c: Client) {
    if (!c.start_date) return 'Not set'
    return new Date(c.start_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })
  }

  const filteredAssignments = assignFilter === 'all' ? assignments : assignments.filter(a => a.day_number === assignFilter)
  const uniqueDays = [...new Set(assignments.map(a => a.day_number))].sort((a, b) => a - b)
  const activeSecObj = SECTIONS.find(s => s.id === activeSection)!

  if (!authed) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--navy)', padding: '24px' }}>
        <div style={{ width: '100%', maxWidth: '400px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '20px', padding: '40px 36px' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.4)', marginBottom: '28px' }}>The Way Back</div>
          <div style={{ fontFamily: 'var(--font-instrument)', fontSize: '1.8rem', color: 'white', marginBottom: '6px' }}>Admin panel</div>
          <div style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.4)', marginBottom: '28px' }}>Enter your password to continue</div>
          <label style={{ fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.4)', display: 'block', marginBottom: '7px' }}>Password</label>
          <input type="password" value={pwdInput} onChange={e => setPwdInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && login()} placeholder="Enter admin password" style={{ width: '100%', fontFamily: 'inherit', fontSize: '0.95rem', background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '10px', padding: '12px 14px', color: 'white', outline: 'none', marginBottom: '16px' }} />
          <button onClick={login} style={{ width: '100%', padding: '14px', fontFamily: 'inherit', fontSize: '0.9rem', fontWeight: 700, background: 'var(--blue)', color: 'white', border: 'none', borderRadius: '10px', cursor: 'pointer' }}>Enter</button>
          {pwdError && <div style={{ fontSize: '0.82rem', color: '#fca5a5', marginTop: '10px', textAlign: 'center' }}>Incorrect password</div>}
        </div>
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--stone-50)' }}>
      {/* Topbar */}
      <nav style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100, background: 'var(--navy)', padding: '16px 32px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
        <div style={{ fontSize: '0.78rem', fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'white' }}>The Way Back</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span style={{ fontSize: '0.68rem', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', background: 'var(--blue)', color: 'white', padding: '3px 10px', borderRadius: '100px' }}>Admin</span>
          <button onClick={() => { setAuthed(false); setPwdInput('') }} style={{ fontFamily: 'inherit', fontSize: '0.78rem', fontWeight: 600, color: 'rgba(255,255,255,0.4)', background: 'none', border: 'none', cursor: 'pointer' }}>Sign out</button>
        </div>
      </nav>

      <div style={{ minHeight: '100vh', paddingTop: '64px' }}>
        {/* Sidebar */}
        <aside style={{ background: 'white', borderRight: '1px solid var(--stone-200)', padding: '24px 0', position: 'fixed', left: 0, top: '64px', bottom: 0, width: '280px', overflowY: 'auto' }}>
          <div style={{ padding: '0 16px', marginBottom: '24px' }}>
            <button onClick={() => setShowModal(true)} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '8px', fontFamily: 'inherit', fontSize: '0.85rem', fontWeight: 700, background: 'var(--blue)', color: 'white', border: 'none', borderRadius: '10px', padding: '11px 14px', cursor: 'pointer', marginBottom: '16px' }}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M12 5v14M5 12h14"/></svg>
              New client
            </button>
            <div style={{ fontSize: '0.65rem', fontWeight: 800, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '8px', padding: '0 8px' }}>Clients</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
              {clients.length === 0
                ? <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', padding: '8px', textAlign: 'center' }}>No clients yet</div>
                : clients.map(c => (
                  <div key={c.id} onClick={() => selectClient(c.id)} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 12px', borderRadius: '9px', cursor: 'pointer', transition: 'all 0.15s', border: `1px solid ${currentClient?.id === c.id ? 'rgba(27,79,216,0.2)' : 'transparent'}`, background: currentClient?.id === c.id ? 'var(--blue-pale)' : 'transparent' }}>
                    <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'var(--blue)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.68rem', fontWeight: 800, color: 'white', flexShrink: 0 }}>{initials(c.name)}</div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: '0.85rem', fontWeight: 700, color: currentClient?.id === c.id ? 'var(--blue)' : 'var(--stone-900)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{c.name}</div>
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 500 }}>Day {c.day_number || 1}</div>
                    </div>
                  </div>
                ))
              }
            </div>
          </div>
        </aside>

        {/* Main */}
        <main style={{ marginLeft: '280px', padding: '36px 40px' }}>
          {!currentClient ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', textAlign: 'center', color: 'var(--text-muted)' }}>
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" style={{ opacity: 0.2, marginBottom: '16px' }}>
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/>
              </svg>
              <h2 style={{ fontFamily: 'var(--font-instrument)', fontSize: '1.4rem', fontWeight: 400, color: 'var(--stone-700)', marginBottom: '8px' }}>Select or create a client</h2>
              <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', maxWidth: '320px', lineHeight: 1.6 }}>Choose a client from the sidebar to view and edit their profile, evidence, and assignments.</p>
            </div>
          ) : (
            <>
              {/* Profile header */}
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '20px', marginBottom: '28px', flexWrap: 'wrap' }}>
                <div>
                  <div style={{ fontFamily: 'var(--font-instrument)', fontSize: 'clamp(1.6rem,3vw,2.2rem)', fontWeight: 400, color: 'var(--stone-900)', marginBottom: '4px' }}>{currentClient.name}</div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Started {startDate(currentClient)} &nbsp;·&nbsp; Day {currentClient.day_number || 1} &nbsp;·&nbsp; {currentClient.email}</div>
                </div>
                <button onClick={() => deleteClient(currentClient.id)} style={{ fontFamily: 'inherit', fontSize: '0.82rem', fontWeight: 700, padding: '10px 18px', borderRadius: '9px', border: 'none', cursor: 'pointer', background: '#fee2e2', color: 'var(--red)', display: 'inline-flex', alignItems: 'center', gap: '7px' }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/></svg>
                  Delete client
                </button>
              </div>

              {/* Inner tabs */}
              <div style={{ display: 'flex', gap: '4px', marginBottom: '24px', background: 'white', border: '1px solid var(--stone-200)', borderRadius: '12px', padding: '4px' }}>
                {(['details', 'evidence', 'assignments', 'activity'] as AdminTab[]).map(t => (
                  <button key={t} onClick={() => setAdminTab(t)} style={{ flex: 1, fontFamily: 'inherit', fontSize: '0.82rem', fontWeight: 700, padding: '9px 16px', borderRadius: '9px', border: 'none', background: adminTab === t ? 'var(--blue)' : 'none', color: adminTab === t ? 'white' : 'var(--text-muted)', cursor: 'pointer', transition: 'all 0.2s', textTransform: 'capitalize' }}>
                    {t === 'activity' ? 'Activity' : t}{t === 'assignments' ? ` (${assignments.length})` : ''}
                  </button>
                ))}
              </div>

              {/* ── DETAILS TAB ── */}
              {adminTab === 'details' && (
                <div style={{ background: 'white', border: '1px solid rgba(27,79,216,0.08)', borderRadius: '16px', padding: '24px', marginBottom: '24px' }}>
                  <div style={{ fontSize: '0.72rem', fontWeight: 800, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '18px' }}>Client details</div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                    {[
                      { label: 'Full name', val: editName, set: setEditName, type: 'text' },
                      { label: 'Email', val: editEmail, set: setEditEmail, type: 'email' },
                      { label: 'Start date', val: editDate, set: setEditDate, type: 'date' },
                      { label: 'Current day', val: String(editDay), set: (v: string) => setEditDay(parseInt(v) || 1), type: 'number' },
                    ].map(f => (
                      <div key={f.label}>
                        <label style={{ fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>{f.label}</label>
                        <input type={f.type} value={f.val} onChange={e => { f.set(e.target.value); setDirty(true) }} style={{ fontFamily: 'inherit', fontSize: '0.9rem', color: 'var(--stone-900)', background: 'var(--stone-50)', border: '1px solid var(--stone-200)', borderRadius: '8px', padding: '10px 12px', outline: 'none', width: '100%' }} />
                      </div>
                    ))}
                    <div style={{ gridColumn: '1 / -1' }}>
                      <label style={{ fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--text-muted)', display: 'block', marginBottom: '8px' }}>Program type</label>
                      <div
                        onClick={() => { setEditUnlearnPainOnly(v => !v); setDirty(true) }}
                        style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 16px', borderRadius: '10px', border: `1.5px solid ${editUnlearnPainOnly ? 'var(--blue)' : 'var(--stone-200)'}`, background: editUnlearnPainOnly ? 'var(--blue-pale)' : 'var(--stone-50)', cursor: 'pointer', transition: 'all 0.15s' }}
                      >
                        <div>
                          <div style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--stone-900)' }}>Unlearn Pain only</div>
                          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '2px' }}>Hides the "My emotions matter" reminder from the daily check-in screen</div>
                        </div>
                        <div style={{ width: '40px', height: '24px', borderRadius: '12px', background: editUnlearnPainOnly ? 'var(--blue)' : 'var(--stone-300)', position: 'relative', flexShrink: 0, transition: 'background 0.2s', marginLeft: '16px' }}>
                          <div style={{ position: 'absolute', top: '3px', left: editUnlearnPainOnly ? '19px' : '3px', width: '18px', height: '18px', borderRadius: '50%', background: 'white', transition: 'left 0.2s' }} />
                        </div>
                      </div>
                    </div>
                    <div style={{ gridColumn: '1 / -1' }}>
                      <label style={{ fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--text-muted)', display: 'block', marginBottom: '8px' }}>Daily exercises</label>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        {[
                          { val: 'both', label: 'Journaling + Somatic + Visualization', desc: 'Cycles every 3 days — journal, somatic tracking, then visualization' },
                          { val: 'somatic_only', label: 'Somatic + Visualization', desc: 'Alternates every 2 days — somatic tracking, then visualization' },
                          { val: 'none', label: 'None', desc: 'No daily exercise shown' },
                        ].map(opt => (
                          <label key={opt.val} onClick={() => { setEditExerciseMode(opt.val); setDirty(true) }} style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', padding: '12px 14px', borderRadius: '10px', border: `1.5px solid ${editExerciseMode === opt.val ? 'var(--blue)' : 'var(--stone-200)'}`, background: editExerciseMode === opt.val ? 'var(--blue-pale)' : 'var(--stone-50)', cursor: 'pointer', transition: 'all 0.15s' }}>
                            <div style={{ width: '18px', height: '18px', borderRadius: '50%', border: `2px solid ${editExerciseMode === opt.val ? 'var(--blue)' : 'var(--stone-300)'}`, background: editExerciseMode === opt.val ? 'var(--blue)' : 'white', flexShrink: 0, marginTop: '1px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                              {editExerciseMode === opt.val && <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'white' }} />}
                            </div>
                            <div>
                              <div style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--stone-900)' }}>{opt.label}</div>
                              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '2px' }}>{opt.desc}</div>
                            </div>
                          </label>
                        ))}
                      </div>
                    </div>
                    <div style={{ gridColumn: '1 / -1' }}>
                      <label style={{ fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>Notes (internal only)</label>
                      <textarea value={editNotes} onChange={e => { setEditNotes(e.target.value); setDirty(true) }} style={{ fontFamily: 'inherit', fontSize: '0.9rem', color: 'var(--stone-900)', background: 'var(--stone-50)', border: '1px solid var(--stone-200)', borderRadius: '8px', padding: '10px 12px', outline: 'none', resize: 'vertical', minHeight: '80px', lineHeight: 1.6, width: '100%' }} />
                    </div>
                  </div>
                </div>
              )}

              {/* ── EVIDENCE TAB ── */}
              {adminTab === 'evidence' && (
                <div style={{ background: 'white', border: '1px solid rgba(27,79,216,0.08)', borderRadius: '16px', padding: '24px' }}>
                  <div style={{ fontSize: '0.72rem', fontWeight: 800, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '18px' }}>Personal Evidence Sheet</div>
                  <div style={{ display: 'grid', gridTemplateColumns: '200px 1fr', gap: '16px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                      {SECTIONS.map((s, i) => {
                        const count = (pendingEvidence[s.id] || []).length
                        const active = s.id === activeSection
                        return (
                          <button key={s.id} onClick={() => { setActiveSection(s.id); setEvInput('') }} style={{ display: 'flex', alignItems: 'center', gap: '9px', padding: '10px 12px', borderRadius: '8px', fontFamily: 'inherit', fontSize: '0.82rem', fontWeight: 600, color: active ? 'var(--blue)' : 'var(--text-muted)', background: active ? 'var(--blue-pale)' : 'none', border: 'none', cursor: 'pointer', textAlign: 'left', width: '100%', transition: 'all 0.15s' }}>
                            <span style={{ width: '20px', height: '20px', borderRadius: '50%', flexShrink: 0, background: active ? 'var(--blue)' : 'var(--stone-100)', color: active ? 'white' : 'var(--text-muted)', fontSize: '0.65rem', fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{i + 1}</span>
                            <span style={{ flex: 1, lineHeight: 1.3 }}>{s.title}</span>
                            {count > 0 && <span style={{ fontSize: '0.65rem', fontWeight: 700, background: 'rgba(27,79,216,0.1)', color: 'var(--blue)', padding: '1px 7px', borderRadius: '100px' }}>{count}</span>}
                          </button>
                        )
                      })}
                    </div>
                    <div style={{ background: 'white', border: '1px solid rgba(27,79,216,0.08)', borderRadius: '14px', padding: '22px', minHeight: '320px' }}>
                      <div style={{ fontFamily: 'var(--font-instrument)', fontSize: '1.2rem', fontWeight: 400, color: 'var(--stone-900)', marginBottom: '18px' }}>{activeSecObj.title}</div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '14px' }}>
                        {(pendingEvidence[activeSection] || []).length === 0
                          ? <div style={{ fontSize: '0.82rem', color: 'var(--stone-300)', fontStyle: 'italic', padding: '4px 0 10px' }}>No entries yet.</div>
                          : (pendingEvidence[activeSection] || []).map((e, idx) => (
                            <div key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', background: 'var(--stone-50)', border: '1px solid var(--stone-200)', borderRadius: '9px', padding: '10px 12px' }}>
                              <div style={{ width: '7px', height: '7px', borderRadius: '50%', background: 'var(--blue)', flexShrink: 0, marginTop: '6px', opacity: 0.5 }} />
                              <div style={{ flex: 1, fontSize: '0.88rem', color: 'var(--stone-900)', lineHeight: 1.55 }}>{e.text}</div>
                              <button onClick={() => removeEvEntry(activeSection, idx)} style={{ background: 'none', border: 'none', cursor: 'pointer', width: '24px', height: '24px', borderRadius: '5px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--stone-300)', flexShrink: 0 }}>
                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M18 6L6 18M6 6l12 12"/></svg>
                              </button>
                            </div>
                          ))
                        }
                      </div>
                      <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
                        <textarea value={evInput} onChange={e => setEvInput(e.target.value)} onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); addEvEntry() } }} placeholder="Add an evidence entry…" rows={2} style={{ flex: 1, fontFamily: 'inherit', fontSize: '0.88rem', color: 'var(--stone-900)', background: 'var(--stone-50)', border: '1px solid var(--stone-200)', borderRadius: '8px', padding: '10px 12px', resize: 'none', outline: 'none', minHeight: '42px', lineHeight: 1.5 }} />
                        <button onClick={addEvEntry} style={{ fontFamily: 'inherit', fontSize: '0.8rem', fontWeight: 700, padding: '10px 16px', background: 'var(--blue)', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', flexShrink: 0, display: 'flex', alignItems: 'center', gap: '5px' }}>
                          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M12 5v14M5 12h14"/></svg>Add
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* ── ASSIGNMENTS TAB ── */}
              {adminTab === 'assignments' && (
                <div>
                  {/* Add assignment form */}
                  <div style={{ background: 'white', border: '1px solid rgba(27,79,216,0.08)', borderRadius: '16px', padding: '24px', marginBottom: '20px' }}>
                    <div style={{ fontSize: '0.72rem', fontWeight: 800, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '18px' }}>Add assignment</div>
                    <div style={{ display: 'grid', gridTemplateColumns: '120px 160px 1fr', gap: '12px', marginBottom: '12px' }}>
                      <div>
                        <label style={{ fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>Day</label>
                        <input type="number" min="1" value={newAssignDay} onChange={e => setNewAssignDay(parseInt(e.target.value) || 1)} style={{ fontFamily: 'inherit', fontSize: '0.9rem', color: 'var(--stone-900)', background: 'var(--stone-50)', border: '1px solid var(--stone-200)', borderRadius: '8px', padding: '10px 12px', outline: 'none', width: '100%' }} />
                      </div>
                      <div>
                        <label style={{ fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>Type</label>
                        <select value={newAssignType} onChange={e => { setNewAssignType(e.target.value as 'video'|'article'|'exercise'); setNewAssignContentId(''); setNewAssignTitle('') }} style={{ fontFamily: 'inherit', fontSize: '0.9rem', color: 'var(--stone-900)', background: 'var(--stone-50)', border: '1px solid var(--stone-200)', borderRadius: '8px', padding: '10px 12px', outline: 'none', width: '100%' }}>
                          <option value="video">Video</option>
                          <option value="article">Article</option>
                          <option value="exercise">Exercise</option>
                        </select>
                      </div>
                      <div>
                        <label style={{ fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>Content</label>
                        <select value={newAssignContentId} onChange={e => handleContentSelect(e.target.value)} style={{ fontFamily: 'inherit', fontSize: '0.9rem', color: 'var(--stone-900)', background: 'var(--stone-50)', border: '1px solid var(--stone-200)', borderRadius: '8px', padding: '10px 12px', outline: 'none', width: '100%' }}>
                          <option value="">— Select —</option>
                          {getContentOptions().map(o => <option key={o.id} value={o.id}>{o.label}</option>)}
                        </select>
                      </div>
                    </div>
                    <div style={{ marginBottom: '12px' }}>
                      <label style={{ fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>Title (auto-filled, editable)</label>
                      <input value={newAssignTitle} onChange={e => setNewAssignTitle(e.target.value)} placeholder="Assignment title…" style={{ fontFamily: 'inherit', fontSize: '0.9rem', color: 'var(--stone-900)', background: 'var(--stone-50)', border: '1px solid var(--stone-200)', borderRadius: '8px', padding: '10px 12px', outline: 'none', width: '100%' }} />
                    </div>
                    <div style={{ marginBottom: '16px' }}>
                      <label style={{ fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>Instructions for client (optional)</label>
                      <textarea value={newAssignNotes} onChange={e => setNewAssignNotes(e.target.value)} placeholder="e.g. Focus on the part about somatic tracking, apply it to your shoulder pain…" rows={2} style={{ fontFamily: 'inherit', fontSize: '0.9rem', color: 'var(--stone-900)', background: 'var(--stone-50)', border: '1px solid var(--stone-200)', borderRadius: '8px', padding: '10px 12px', outline: 'none', resize: 'none', lineHeight: 1.5, width: '100%' }} />
                    </div>
                    <button onClick={addAssignment} style={{ fontFamily: 'inherit', fontSize: '0.85rem', fontWeight: 700, padding: '11px 24px', background: 'var(--blue)', color: 'white', border: 'none', borderRadius: '9px', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '7px' }}>
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M12 5v14M5 12h14"/></svg>
                      Add to Day {newAssignDay}
                    </button>
                  </div>

                  {/* Existing assignments */}
                  <div style={{ background: 'white', border: '1px solid rgba(27,79,216,0.08)', borderRadius: '16px', padding: '24px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
                      <div style={{ fontSize: '0.72rem', fontWeight: 800, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--text-muted)' }}>
                        All assignments ({assignments.length})
                      </div>
                      {uniqueDays.length > 0 && (
                        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                          <button onClick={() => setAssignFilter('all')} style={{ fontFamily: 'inherit', fontSize: '0.72rem', fontWeight: 700, padding: '4px 12px', borderRadius: '100px', border: '1px solid', background: assignFilter === 'all' ? 'var(--blue)' : 'white', color: assignFilter === 'all' ? 'white' : 'var(--text-muted)', borderColor: assignFilter === 'all' ? 'var(--blue)' : 'var(--stone-200)', cursor: 'pointer' }}>All</button>
                          {uniqueDays.map(d => (
                            <button key={d} onClick={() => setAssignFilter(d)} style={{ fontFamily: 'inherit', fontSize: '0.72rem', fontWeight: 700, padding: '4px 12px', borderRadius: '100px', border: '1px solid', background: assignFilter === d ? 'var(--blue)' : 'white', color: assignFilter === d ? 'white' : 'var(--text-muted)', borderColor: assignFilter === d ? 'var(--blue)' : 'var(--stone-200)', cursor: 'pointer' }}>Day {d}</button>
                          ))}
                        </div>
                      )}
                    </div>

                    {filteredAssignments.length === 0 ? (
                      <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', textAlign: 'center', padding: '32px 0' }}>No assignments yet. Add one above.</div>
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        {filteredAssignments.map(a => (
                          <div key={a.id} style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', background: 'var(--stone-50)', border: '1px solid var(--stone-200)', borderRadius: '10px', padding: '12px 14px' }}>
                            <span style={{ fontSize: '0.65rem', fontWeight: 700, padding: '3px 9px', borderRadius: '100px', background: 'rgba(27,79,216,0.1)', color: 'var(--blue)', flexShrink: 0, marginTop: '2px' }}>Day {a.day_number}</span>
                            <span style={{ fontSize: '0.65rem', fontWeight: 700, padding: '3px 9px', borderRadius: '100px', background: 'var(--stone-200)', color: 'var(--stone-700)', flexShrink: 0, marginTop: '2px', textTransform: 'capitalize' }}>{a.type}</span>
                            <div style={{ flex: 1 }}>
                              <div style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--stone-900)' }}>{a.title}</div>
                              {a.notes && <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '3px', lineHeight: 1.5 }}>{a.notes}</div>}
                            </div>
                            <button onClick={() => deleteAssignment(a.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', width: '28px', height: '28px', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--stone-300)', flexShrink: 0, transition: 'all 0.15s' }}>
                              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M18 6L6 18M6 6l12 12"/></svg>
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* ── ACTIVITY TAB ── */}
              {adminTab === 'activity' && (
                <div>
                  {/* Activity log */}
                  <div style={{ background: 'white', border: '1px solid rgba(27,79,216,0.08)', borderRadius: '16px', padding: '24px', marginBottom: '24px' }}>
                    <div style={{ fontSize: '0.72rem', fontWeight: 800, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '18px' }}>Activity log</div>
                    {activityLog.length === 0 ? (
                      <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', padding: '16px 0' }}>No activity recorded yet.</div>
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
                        {activityLog.map((a, i) => (
                          <div key={a.id} style={{ display: 'flex', alignItems: 'flex-start', gap: '14px', padding: '12px 0', borderBottom: i < activityLog.length - 1 ? '1px solid var(--stone-100)' : 'none' }}>
                            <div style={{ width: '32px', height: '32px', flexShrink: 0, borderRadius: '8px', background: a.type === 'login' ? '#EEF2FC' : a.type === 'video' ? '#E1F5EE' : '#FAEEDA', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                              {a.type === 'login' && <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#1B4FD8" strokeWidth="2" strokeLinecap="round"><path d="M15 3h4a2 2 0 012 2v14a2 2 0 01-2 2h-4"/><polyline points="10 17 15 12 10 7"/><line x1="15" y1="12" x2="3" y2="12"/></svg>}
                              {a.type === 'video' && <svg width="14" height="14" viewBox="0 0 24 24" fill="#0F6E56"><path d="M8 5v14l11-7z"/></svg>}
                              {a.type === 'article' && <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#854F0B" strokeWidth="2" strokeLinecap="round"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>}
                            </div>
                            <div style={{ flex: 1 }}>
                              <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--stone-900)' }}>
                                {a.type === 'login' ? 'Logged in' : a.type === 'video' ? `Watched video` : 'Read article'}
                                {a.day_number && <span style={{ fontWeight: 400, color: 'var(--text-muted)', marginLeft: '6px' }}>· Day {a.day_number}</span>}
                              </div>
                              {a.content_title && <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '2px' }}>{a.content_title}</div>}
                            </div>
                            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', flexShrink: 0, marginTop: '2px' }}>{timeAgo(a.created_at)}</div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Journal entries */}
                  <div style={{ background: 'white', border: '1px solid rgba(27,79,216,0.08)', borderRadius: '16px', padding: '24px' }}>
                    <div style={{ fontSize: '0.72rem', fontWeight: 800, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '18px' }}>Recovery journal ({journalEntries.length})</div>
                    {journalEntries.length === 0 ? (
                      <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', padding: '16px 0' }}>No journal entries yet.</div>
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        {journalEntries.map(j => (
                          <div key={j.id} style={{ borderLeft: '3px solid rgba(27,79,216,0.15)', paddingLeft: '16px' }}>
                            <div style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '6px' }}>{new Date(j.created_at).toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</div>
                            <div style={{ fontSize: '0.88rem', color: 'var(--stone-900)', lineHeight: 1.7, whiteSpace: 'pre-wrap' }}>{j.text}</div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </>
          )}
        </main>
      </div>

      {/* Save bar — only for details/evidence tabs */}
      {dirty && (adminTab === 'details' || adminTab === 'evidence') && (
        <div style={{ position: 'fixed', bottom: 0, left: '280px', right: 0, zIndex: 99, background: 'white', borderTop: '1px solid var(--stone-200)', padding: '14px 40px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>You have unsaved changes</div>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button onClick={() => currentClient && selectClient(currentClient.id)} style={{ fontFamily: 'inherit', fontSize: '0.82rem', fontWeight: 700, padding: '10px 18px', borderRadius: '9px', background: 'white', color: 'var(--stone-700)', border: '1px solid var(--stone-200)', cursor: 'pointer' }}>Discard</button>
            <button onClick={saveClient} style={{ fontFamily: 'inherit', fontSize: '0.82rem', fontWeight: 700, padding: '10px 18px', borderRadius: '9px', background: 'var(--blue)', color: 'white', border: 'none', cursor: 'pointer' }}>Save changes</button>
          </div>
        </div>
      )}

      {/* New client modal */}
      {showModal && (
        <div onClick={() => setShowModal(false)} style={{ position: 'fixed', inset: 0, zIndex: 200, background: 'rgba(11,26,46,0.7)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
          <div onClick={e => e.stopPropagation()} style={{ background: 'white', borderRadius: '18px', width: '100%', maxWidth: '500px', overflow: 'hidden' }}>
            <div style={{ padding: '22px 24px 18px', borderBottom: '1px solid var(--stone-100)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ fontFamily: 'var(--font-instrument)', fontSize: '1.3rem', fontWeight: 400, color: 'var(--stone-900)' }}>New client</div>
              <button onClick={() => setShowModal(false)} style={{ background: 'var(--stone-100)', border: 'none', cursor: 'pointer', width: '30px', height: '30px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M18 6L6 18M6 6l12 12"/></svg>
              </button>
            </div>
            <div style={{ padding: '22px 24px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {[
                { label: 'Full name', val: newName, set: setNewName, type: 'text', ph: 'Sarah Connor' },
                { label: 'Email', val: newEmail, set: setNewEmail, type: 'email', ph: 'sarah@example.com' },
                { label: 'Program start date', val: newDate, set: setNewDate, type: 'date', ph: '' },
              ].map(f => (
                <div key={f.label}>
                  <label style={{ fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>{f.label}</label>
                  <input type={f.type} value={f.val} onChange={e => f.set(e.target.value)} placeholder={f.ph} style={{ fontFamily: 'inherit', fontSize: '0.9rem', color: 'var(--stone-900)', background: 'var(--stone-50)', border: '1px solid var(--stone-200)', borderRadius: '8px', padding: '10px 12px', outline: 'none', width: '100%' }} />
                </div>
              ))}
            </div>
            <div style={{ padding: '16px 24px', borderTop: '1px solid var(--stone-100)', display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button onClick={() => setShowModal(false)} style={{ fontFamily: 'inherit', fontSize: '0.82rem', fontWeight: 700, padding: '10px 18px', borderRadius: '9px', background: 'white', color: 'var(--stone-700)', border: '1px solid var(--stone-200)', cursor: 'pointer' }}>Cancel</button>
              <button onClick={handleCreateClient} style={{ fontFamily: 'inherit', fontSize: '0.82rem', fontWeight: 700, padding: '10px 18px', borderRadius: '9px', background: 'var(--blue)', color: 'white', border: 'none', cursor: 'pointer' }}>Create client</button>
            </div>
          </div>
        </div>
      )}

      {toast && (
        <div style={{ position: 'fixed', bottom: '24px', right: '24px', zIndex: 500, background: toast.type === 'success' ? '#065f46' : toast.type === 'error' ? '#991b1b' : 'var(--stone-900)', color: 'white', fontSize: '0.85rem', fontWeight: 600, padding: '12px 20px', borderRadius: '10px' }}>
          {toast.msg}
        </div>
      )}
    </div>
  )
}
