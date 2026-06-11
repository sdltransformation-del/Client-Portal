'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'

interface Comment {
  id: string
  post_id: string
  author_name: string
  is_coach: boolean
  text: string
  created_at: string
}

interface Post {
  id: string
  client_id: string
  author_name: string
  text: string
  created_at: string
  post_comments: Comment[]
}

interface Props {
  client: { id: string; name: string }
}

function timeAgo(iso: string) {
  const diff = (Date.now() - new Date(iso).getTime()) / 1000
  if (diff < 60) return 'just now'
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`
  return `${Math.floor(diff / 86400)}d ago`
}

function avatarInitials(name: string) {
  return name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)
}

export default function CommunityTab({ client }: Props) {
  const [posts, setPosts] = useState<Post[]>([])
  const [text, setText] = useState('')
  const [replies, setReplies] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  const initials = avatarInitials(client.name)

  useEffect(() => { loadPosts() }, [])

  async function loadPosts() {
    const { data } = await supabase
      .from('posts')
      .select('*, post_comments(*)')
      .order('created_at', { ascending: false })
    setPosts(data || [])
    setLoading(false)
  }

  async function submitPost() {
    if (!text.trim()) return
    const { data } = await supabase.from('posts').insert({
      client_id: client.id,
      author_name: client.name,
      text: text.trim()
    }).select('*, post_comments(*)')
    if (data?.[0]) setPosts(prev => [data[0], ...prev])
    setText('')
  }

  async function submitReply(postId: string) {
    const replyText = (replies[postId] || '').trim()
    if (!replyText) return
    const { data } = await supabase.from('post_comments').insert({
      post_id: postId,
      author_name: client.name,
      is_coach: false,
      text: replyText
    }).select()
    if (data?.[0]) {
      setPosts(prev => prev.map(p => p.id === postId ? { ...p, post_comments: [...(p.post_comments || []), data[0]] } : p))
    }
    setReplies(prev => ({ ...prev, [postId]: '' }))
  }

  return (
    <div style={{ padding: '16px 48px 80px', maxWidth: '960px', margin: '0 auto' }} className="anim-fadeup">
      <div style={{ fontSize: '0.72rem', fontWeight: 600, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--blue)', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '8px' }}>
        <span style={{ width: '20px', height: '2px', background: 'var(--blue)', borderRadius: '1px', display: 'block' }} />Community
      </div>
      <h1 style={{ fontFamily: 'var(--font-instrument)', fontSize: 'clamp(1.8rem,4vw,2.6rem)', fontWeight: 400, color: 'var(--stone-900)', marginBottom: '8px' }}>You are not alone in this</h1>
      <p style={{ fontSize: '0.95rem', color: 'var(--text-secondary)', lineHeight: 1.7, marginBottom: '36px', maxWidth: '520px' }}>Ask questions, share progress, celebrate wins.</p>

      {/* Composer */}
      <div style={{ background: 'white', border: '1.5px solid rgba(27,79,216,0.12)', borderRadius: '16px', padding: '18px 20px', marginBottom: '24px' }}>
        <div style={{ display: 'flex', gap: '12px', marginBottom: '14px' }}>
          <div style={{ width: '36px', height: '36px', borderRadius: '50%', flexShrink: 0, background: 'var(--blue)', color: 'white', fontSize: '0.72rem', fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{initials}</div>
          <textarea
            value={text}
            onChange={e => setText(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); submitPost() } }}
            placeholder="Share something with the group…"
            rows={3}
            style={{ flex: 1, fontFamily: 'inherit', fontSize: '0.9rem', color: 'var(--stone-900)', background: 'var(--stone-50)', border: '1px solid rgba(27,79,216,0.1)', borderRadius: '10px', padding: '12px 14px', resize: 'none', outline: 'none', lineHeight: 1.6 }}
          />
        </div>
        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <button onClick={submitPost} style={{ fontFamily: 'inherit', fontSize: '0.82rem', fontWeight: 700, padding: '10px 24px', borderRadius: '10px', border: 'none', background: 'var(--blue)', color: 'white', cursor: 'pointer' }}>Post</button>
        </div>
      </div>

      {/* Feed */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
        {loading ? (
          <div style={{ fontSize: '0.88rem', color: 'var(--text-muted)', padding: '24px 0' }}>Loading…</div>
        ) : posts.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '48px 24px', color: 'var(--text-muted)', fontSize: '0.9rem' }}>No posts yet. Be the first.</div>
        ) : posts.map(post => (
          <div key={post.id} style={{ background: 'white', border: '1px solid rgba(27,79,216,0.1)', borderRadius: '16px', overflow: 'hidden' }}>
            <div style={{ padding: '18px 20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                <div style={{ width: '34px', height: '34px', borderRadius: '50%', flexShrink: 0, background: 'var(--blue)', color: 'white', fontSize: '0.7rem', fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {avatarInitials(post.author_name)}
                </div>
                <div>
                  <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--stone-900)' }}>{post.author_name}</div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '2px' }}>{timeAgo(post.created_at)}</div>
                </div>
              </div>
              <div style={{ fontSize: '0.92rem', color: 'var(--stone-900)', lineHeight: 1.7 }}>{post.text}</div>
            </div>

            <div style={{ borderTop: '1px solid rgba(27,79,216,0.07)' }}>
              {[...(post.post_comments || [])].sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()).map(c => (
                <div key={c.id} style={{ padding: '12px 20px', borderBottom: '1px solid rgba(27,79,216,0.05)', display: 'flex', gap: '10px' }}>
                  <div style={{ width: '28px', height: '28px', borderRadius: '50%', flexShrink: 0, background: c.is_coach ? 'var(--navy)' : 'var(--blue)', color: 'white', fontSize: '0.62rem', fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {c.is_coach ? 'S' : avatarInitials(c.author_name)}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--stone-900)', marginBottom: '2px' }}>
                      {c.is_coach ? 'Serge' : c.author_name}
                      {c.is_coach && <span style={{ display: 'inline-block', fontSize: '0.55rem', fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', background: 'var(--navy)', color: 'white', padding: '1px 6px', borderRadius: '100px', marginLeft: '5px', verticalAlign: 'middle' }}>Coach</span>}
                      <span style={{ fontWeight: 400, color: 'var(--text-muted)', fontSize: '0.7rem', marginLeft: '6px' }}>{timeAgo(c.created_at)}</span>
                    </div>
                    <div style={{ fontSize: '0.84rem', color: 'var(--stone-700)', lineHeight: 1.6 }}>{c.text}</div>
                  </div>
                </div>
              ))}
              <div style={{ padding: '10px 20px 14px', display: 'flex', gap: '9px', alignItems: 'flex-start' }}>
                <div style={{ width: '28px', height: '28px', borderRadius: '50%', flexShrink: 0, background: 'var(--blue)', color: 'white', fontSize: '0.62rem', fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: '2px' }}>{initials}</div>
                <textarea
                  value={replies[post.id] || ''}
                  onChange={e => setReplies(prev => ({ ...prev, [post.id]: e.target.value }))}
                  onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); submitReply(post.id) } }}
                  placeholder="Add a comment…"
                  rows={1}
                  style={{ flex: 1, fontFamily: 'inherit', fontSize: '0.84rem', color: 'var(--stone-900)', background: 'var(--stone-50)', border: '1px solid var(--stone-200)', borderRadius: '8px', padding: '8px 12px', resize: 'none', outline: 'none', lineHeight: 1.5 }}
                />
                <button onClick={() => submitReply(post.id)} style={{ fontFamily: 'inherit', fontSize: '0.75rem', fontWeight: 700, padding: '8px 16px', borderRadius: '8px', border: 'none', background: 'var(--blue)', color: 'white', cursor: 'pointer', flexShrink: 0, marginTop: '2px' }}>Reply</button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
