import { useEffect, useState } from 'react'
import { supabase } from './lib/supabase.js'

export default function App() {
  const [apiStatus, setApiStatus] = useState('Checking…')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [errors, setErrors] = useState({})
  const [message, setMessage] = useState('')
  const [pending, setPending] = useState(false)

  useEffect(() => {
    const controller = new AbortController()
    // Vite proxies /api to the Python backend during local development.
    fetch('/api/health', { signal: controller.signal })
      .then((response) => {
        if (!response.ok) throw new Error(`API returned HTTP ${response.status}`)
        return response.json()
      })
      .then((data) => setApiStatus(data.status === 'ok' ? 'Connected' : 'Unexpected response'))
      .catch((error) => {
        if (error.name !== 'AbortError') setApiStatus('Offline — start the backend')
      })
    return () => controller.abort()
  }, [])

  async function handleSubmit(event) {
    event.preventDefault()
    if (pending) return
    setPending(true)
    setErrors({})
    setMessage('')

    try {
      const response = await fetch('/api/registration/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })
      if (!response.ok) throw new Error(`Validation request failed (HTTP ${response.status})`)

      const result = await response.json()
      if (!result.valid) {
        setErrors(result.errors || {})
        return
      }

      if (!supabase) {
        setMessage('Validation passed! Supabase is not configured yet, so no account was created.')
        return
      }

      const { error } = await supabase.auth.signUp({
        email: email.trim().toLowerCase(),
        password,
      })
      if (error) throw error

      setMessage('Signup request accepted. Check your email if confirmation is enabled.')
      setPassword('')
    } catch (error) {
      setMessage(`Could not complete signup: ${error.message}`)
    } finally {
      setPending(false)
    }
  }

  return (
    <main className="container">
      <p className="eyebrow">College fitness &amp; nutrition</p>
      <h1>GatorGains</h1>
      <p className="lede">Create your account — our first working Sprint 1 feature.</p>

      <section className="signup-panel" aria-labelledby="signup-title">
        <h2 id="signup-title">Student signup</h2>
        <form onSubmit={handleSubmit} noValidate>
          <label htmlFor="email">College email</label>
          <input
            id="email" type="email" autoComplete="email" value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="student@ufl.edu" aria-invalid={Boolean(errors.email)}
            aria-describedby={errors.email ? 'email-error' : undefined}
          />
          {errors.email && <p className="error" id="email-error" role="alert">{errors.email}</p>}

          <label htmlFor="password">Password</label>
          <input
            id="password" type="password" autoComplete="new-password" value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="At least 8 characters" aria-invalid={Boolean(errors.password)}
            aria-describedby={errors.password ? 'password-error' : undefined}
          />
          {errors.password && <p className="error" id="password-error" role="alert">{errors.password}</p>}

          <button type="submit" disabled={pending}>
            {pending ? 'Checking…' : 'Create account'}
          </button>
          {message && <p className="message" role="status">{message}</p>}
        </form>
      </section>

      <p className="dev-status">Python API: <strong>{apiStatus}</strong> · Supabase: <strong>{supabase ? 'Configured' : 'Not configured'}</strong></p>
      <p className="note">Temporary demo rules: .edu email and minimum 8-character password. Final signup policy is still a team decision.</p>
    </main>
  )
}
