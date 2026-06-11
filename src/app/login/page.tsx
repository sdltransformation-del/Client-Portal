'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      setError('Incorrect email or password.')
      setLoading(false)
    } else {
      router.push('/portal')
    }
  }

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'var(--navy)', padding: '24px'
    }}>
      <div style={{
        width: '100%', maxWidth: '400px',
        background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
        borderRadius: '20px', padding: '40px 36px'
      }}>
        <div style={{ fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.4)', marginBottom: '28px' }}>
          The Way Back
        </div>
        <div style={{ fontFamily: 'var(--font-instrument, var(--display))', fontSize: '1.8rem', color: 'white', marginBottom: '6px' }}>
          Client portal
        </div>
        <div style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.4)', marginBottom: '28px' }}>
          Sign in to access your program
        </div>

        <form onSubmit={handleLogin}>
          <label style={{ fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.4)', display: 'block', marginBottom: '7px' }}>
            Email
          </label>
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="your@email.com"
            required
            style={{
              width: '100%', fontFamily: 'inherit', fontSize: '0.95rem',
              background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)',
              borderRadius: '10px', padding: '12px 14px', color: 'white', outline: 'none',
              marginBottom: '16px'
            }}
          />

          <label style={{ fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.4)', display: 'block', marginBottom: '7px' }}>
            Password
          </label>
          <input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            placeholder="Enter your password"
            required
            style={{
              width: '100%', fontFamily: 'inherit', fontSize: '0.95rem',
              background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)',
              borderRadius: '10px', padding: '12px 14px', color: 'white', outline: 'none',
              marginBottom: '24px'
            }}
          />

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%', padding: '14px', fontFamily: 'inherit', fontSize: '0.9rem', fontWeight: 700,
              background: loading ? 'rgba(27,79,216,0.6)' : 'var(--blue)', color: 'white', border: 'none',
              borderRadius: '10px', cursor: loading ? 'not-allowed' : 'pointer'
            }}
          >
            {loading ? 'Signing in…' : 'Sign in'}
          </button>

          {error && (
            <div style={{ fontSize: '0.82rem', color: '#fca5a5', marginTop: '10px', textAlign: 'center' }}>
              {error}
            </div>
          )}
        </form>
      </div>
    </div>
  )
}
