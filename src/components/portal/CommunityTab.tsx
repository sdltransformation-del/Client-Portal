'use client'
import { useState } from 'react'
import { SEED_POSTS } from '@/lib/data'

type PostType = 'question' | 'update' | 'win'
type CommTab = 'questions' | 'updates'

interface Comment {
  id: string; author: string; initials: string; authorColor: string; isCoach: boolean; text: string; createdAt: string
}
interface Post {
  id: string; type: PostType; author: string; initials: string; authorColor: string; text: string; createdAt: string; comments: Comment[]
}

interface Props {
  client: { name: string }
}

function timeAgo(iso: string) {
  const diff = (Date.now() - new Date(iso).getTime()) / 1000
  if (diff < 60) return 'just now'
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`
  return `${Math.floor(diff / 86400)}d ago`
}

const TYPE_BADGE: Record<PostType, { label: string; bg: string; color: string }> = {
  question: { label: '❓ Question', bg: 'rgba(234,179,8,0.12)', color: '#92400e' },
  update:   { label: '📈 Update',   bg: 'rgba(27,79,216,0.08)',  color: 'var(--blue)' },
  win:      { label: '🏆 Win',      bg: 'rgba(5,150,105,0.1)',   color: '#065f46' },
}

export default function CommunityTab({ client }: Props) {
  const [posts, setPosts] = useState<Post[]>(SEED_POSTS as Post[])
  const [activeTab, setActiveTab] = useState<CommTab>('questions')
  const [postType, setPostType] = useState<PostType>('question')
  const [text, setText] = useState('')
  const [replies, setReplies] = useState<Record<string, string>>({})

  const initials = client.name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)

  function submitPost() {
    if (!text.trim()) return
    const newPost: Post = {
      id: `post-${Date.now()}`, type: postType,
      author: client.name, initials, authorColor: 'var(--blue)',
      text: text.trim(), createdAt: new Date().toISOString(), comments: []
    }
    setPosts(prev => [newPost, ...prev])
    setText('')
  }

  function submitReply(postId: string) {
    const replyText = (replies[postId] || '').trim()
    if (!replyText) return
    const comment: Comment = {
      id: `c-${Date.now()}`, author: client.name, initials, authorColor: 'var(--blue)',
      isCoach: false, text: replyText, createdAt: new Date().toISOString()
    }
    setPosts(prev => prev.map(p => p.id === postId ? { ...p, comments: [...p.comments, comment] } : p))
    setReplies(prev => ({ ...prev, [postId]: '' }))
  }

  const qPosts = posts.filter(p => p.type === 'question')
  const uPosts = posts.filter(p => p.type !== 'question')
  const visiblePosts = activeTab === 'questions' ? qPosts : uPosts

  return (
    <div style={{ padding: '16px 48px 80px', maxWidth: '960px', margin: '0 auto' }} className="anim-fadeup">
      <div style={{ fontSize: '0.72rem', fontWeight: 600, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--blue)', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '8px' }}>
        <span style={{ width: '20px', height: '2px', background: 'var(--blue)', borderRadius: '1px', display: 'block' }} />Community
      </div>
      <h1 style={{ fontFamily: 'var(--font-instrument)', fontSize: 'clamp(1.8rem,4vw,2.6rem)', fontWeight: 400, color: 'var(--stone-900)', marginBottom: '8px' }}>You are not alone in this</h1>
      <p style={{ fontSize: '0.95rem', color: 'var(--text-secondary)', lineHeight: 1.7, marginBottom: '36px', maxWidth: '520px' }}>Ask questions, share progress, celebrate wins. Serge reads and answers every post.</p>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '6px', marginBottom: '24px', background: 'white', border: '1px solid rgba(27,79,216,0.1)', borderRadius: '14px', padding: '6px' }}>
        {([['questions', '❓ Questions', qPosts.length], ['updates', '📈 Updates & Wins', uPosts.length]] as const).map(([id, label, count]) => (
          <button key={id} onClick={() => setActiveTab(id)} style={{
            flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '7px',
            fontFamily: 'inherit', fontSize: '0.82rem', fontWeight: 700, padding: '10px 16px', borderRadius: '10px', border: 'none',
            background: activeTab === id ? 'var(--blue)' : 'none', color: activeTab === id ? 'white' : 'var(--text-muted)',
            cursor: 'pointer', transition: 'all 0.2s'
          }}>
            {label}
            <span style={{ fontSize: '0.68rem', fontWeight: 800, background: activeTab === id ? 'rgba(255,255,255,0.25)' : 'rgba(27,79,216,0.1)', color: activeTab === id ? 'white' : 'var(--blue)', padding: '1px 7px', borderRadius: '100px' }}>{count}</span>
          </button>
        ))}
      </div>

      {/* Composer */}
      <div style={{ background: 'white', border: '1.5px solid rgba(27,79,216,0.12)', borderRadius: '16px', padding: '18px 20px', marginBottom: '24px' }}>
        <div style={{ display: 'flex', gap: '12px', marginBottom: '14px' }}>
          <div style={{ width: '36px', height: '36px', borderRadius: '50%', flexShrink: 0, background: 'var(--blue)', color: 'white', fontSize: '0.72rem', fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{initials}</div>
          <textarea value={text} onChange={e => setText(e.target.value)} placeholder="Share something with the group…" rows={3} style={{ flex: 1, fontFamily: 'inherit', fontSize: '0.9rem', color: 'var(--stone-900)', background: 'var(--stone-50)', border: '1px solid rgba(27,79,216,0.1)', borderRadius: '10px', padding: '12px 14px', resize: 'none', outline: 'none', lineHeight: 1.6, transition: 'all 0.2s' }} />
        </div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
            {(['question', 'update', 'win'] as PostType[]).map(t => (
              <button key={t} onClick={() => setPostType(t)} style={{ fontFamily: 'inherit', fontSize: '0.75rem', fontWeight: 600, padding: '6px 13px', borderRadius: '100px', border: `1.5px solid ${postType === t ? 'var(--blue)' : 'var(--stone-200)'}`, background: postType === t ? 'rgba(27,79,216,0.08)' : 'white', color: postType === t ? 'var(--blue)' : 'var(--text-muted)', cursor: 'pointer', transition: 'all 0.18s' }}>
                {t === 'question' ? '❓ Question' : t === 'update' ? '📈 Progress update' : '🏆 Win'}
              </button>
            ))}
          </div>
          <button onClick={submitPost} style={{ fontFamily: 'inherit', fontSize: '0.82rem', fontWeight: 700, padding: '10px 24px', borderRadius: '10px', border: 'none', background: 'var(--blue)', color: 'white', cursor: 'pointer', transition: 'all 0.2s' }}>Post</button>
        </div>
      </div>

      {/* Feed */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
        {visiblePosts.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '48px 24px', color: 'var(--text-muted)', fontSize: '0.9rem' }}>No posts yet. Be the first.</div>
        ) : visiblePosts.map(post => {
          const badge = TYPE_BADGE[post.type]
          return (
            <div key={post.id} style={{ background: 'white', border: '1px solid rgba(27,79,216,0.1)', borderRadius: '16px', overflow: 'hidden' }}>
              <div style={{ padding: '18px 20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                  <div style={{ width: '34px', height: '34px', borderRadius: '50%', flexShrink: 0, background: post.authorColor, color: 'white', fontSize: '0.7rem', fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{post.initials}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--stone-900)' }}>{post.author}</div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '2px' }}>{timeAgo(post.createdAt)}</div>
                  </div>
                  <span style={{ fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.06em', padding: '3px 10px', borderRadius: '100px', textTransform: 'uppercase', background: badge.bg, color: badge.color }}>{badge.label}</span>
                </div>
                <div style={{ fontSize: '0.92rem', color: 'var(--stone-900)', lineHeight: 1.7 }}>{post.text}</div>
              </div>

              {/* Comments */}
              <div style={{ borderTop: '1px solid rgba(27,79,216,0.07)' }}>
                {post.comments.map(c => (
                  <div key={c.id} style={{ padding: '12px 20px', borderBottom: '1px solid rgba(27,79,216,0.05)', display: 'flex', gap: '10px' }}>
                    <div style={{ width: '28px', height: '28px', borderRadius: '50%', flexShrink: 0, background: c.authorColor, color: 'white', fontSize: '0.62rem', fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{c.initials}</div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--stone-900)', marginBottom: '2px' }}>
                        {c.author}
                        {c.isCoach && <span style={{ display: 'inline-block', fontSize: '0.55rem', fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', background: 'var(--navy)', color: 'white', padding: '1px 6px', borderRadius: '100px', marginLeft: '5px', verticalAlign: 'middle' }}>Coach</span>}
                        <span style={{ fontWeight: 400, color: 'var(--text-muted)', fontSize: '0.7rem', marginLeft: '6px' }}>{timeAgo(c.createdAt)}</span>
                      </div>
                      <div style={{ fontSize: '0.84rem', color: 'var(--stone-700)', lineHeight: 1.6 }}>{c.text}</div>
                    </div>
                  </div>
                ))}
                {/* Reply row */}
                <div style={{ padding: '10px 20px 14px', display: 'flex', gap: '9px', alignItems: 'flex-start', borderTop: '1px solid rgba(27,79,216,0.07)' }}>
                  <div style={{ width: '28px', height: '28px', borderRadius: '50%', flexShrink: 0, background: 'var(--blue)', color: 'white', fontSize: '0.62rem', fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: '2px' }}>{initials}</div>
                  <textarea
                    value={replies[post.id] || ''}
                    onChange={e => setReplies(prev => ({ ...prev, [post.id]: e.target.value }))}
                    onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); submitReply(post.id) } }}
                    placeholder="Add a comment…" rows={1}
                    style={{ flex: 1, fontFamily: 'inherit', fontSize: '0.84rem', color: 'var(--stone-900)', background: 'var(--stone-50)', border: '1px solid var(--stone-200)', borderRadius: '8px', padding: '8px 12px', resize: 'none', outline: 'none', lineHeight: 1.5 }}
                  />
                  <button onClick={() => submitReply(post.id)} style={{ fontFamily: 'inherit', fontSize: '0.75rem', fontWeight: 700, padding: '8px 16px', borderRadius: '8px', border: 'none', background: 'var(--blue)', color: 'white', cursor: 'pointer', flexShrink: 0, marginTop: '2px' }}>Reply</button>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
