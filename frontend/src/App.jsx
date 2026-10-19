import { useEffect, useState } from 'react'
import { supabase, signUp, logIn, logOut } from './lib/supabase.js'
import { validateSignup } from './lib/validation.js'

export default function App() {
  const [apiStatus, setApiStatus] = useState('Checking…')

  // Signup is validated in the browser; Supabase handles actual account creation.
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [errors, setErrors] = useState({})
  const [signupMessage, setSignupMessage] = useState('')
  const [signupPending, setSignupPending] = useState(false)

  //these track if the student is signing up or logging back in, who is already signed in and if an authentication request is beign processed
  const [authMode, setAuthMode] = useState('signup') // 'signup' or 'login'
  const [user, setUser] = useState(null)
  const [authLoading, setAuthLoading] = useState(true)
  const [loginMessage, setLoginMessage] = useState('')
  const [loginPending, setLoginPending] = useState(false)



  // Demo meal entries live in React memory only; FastAPI calculates their total.
  const [mealName, setMealName] = useState('')
  const [mealCalories, setMealCalories] = useState('')
  const [targetInput, setTargetInput] = useState('2000')
  const [meals, setMeals] = useState([])
  const [summary, setSummary] = useState(null)
  const [mealError, setMealError] = useState('')
  const [mealPending, setMealPending] = useState(false)

  useEffect(() => {
    const controller = new AbortController()
    fetch('/api/health', { signal: controller.signal })
      .then((response) => {
        if (!response.ok) throw new Error(`HTTP ${response.status}`)
        return response.json()
      })
      .then((data) => setApiStatus(data.status === 'ok' ? 'Connected' : 'Unexpected response'))
      .catch((error) => {
        if (error.name !== 'AbortError') setApiStatus('Offline — start the backend')
      })
    return () => controller.abort()
  }, [])

  useEffect(() => {
    if (!supabase) {
      setAuthLoading(false)
      return
    }

    let active = true

    supabase.auth.getSession().then(({ data, error }) => {
      if (!active) return
    
    if (error){
      setLoginMessage(error.message)
    } else {
      setUser(data.session?.user ?? null)
    }

    setAuthLoading(false)
    })

    const { data: { subscription } } =
      supabase.auth.onAuthStateChange((_event, session) => {
        if (active) {
          setUser(session?. user ?? null)
          setAuthLoading(false)
        }
      })

    return () => {
      active = false
      subscription.unsubscribe()
    }
  }, [])

//this validated student registration and makes an account with Supabase
  async function handleSignup(event) {
    event.preventDefault()
    if (signupPending) return
    setSignupMessage('')
    const result = validateSignup(email, password)
    setErrors(result.errors)
    if (!result.valid) return

    if (!supabase) {
      setSignupMessage('Form checks passed. Supabase is not configured, so no account was created.')
      return
    }

    setSignupPending(true)
    try {
      const { error } = await signUp(result.email, password)
      if (error) throw error
      setSignupMessage('Signup request accepted. Check your email if confirmation is enabled.')
      setPassword('')
    } catch (error) {
      setSignupMessage(`Signup failed: ${error.message}`)
    } finally {
      setSignupPending(false)
    }
  }



  //LOGIN 
  async function handleLogin(event) {
    event.preventDefault()
    if (loginPending) return

    setLoginMessage('')

    if (!email.trim() || !password) {
      setLoginMessage('Please enter your email and password.')
      return
    }

    setLoginPending(true)

    try{
      const {error } = await logIn(email.trim(), password)
      if (error) throw error

      setLoginMessage('Login successful!')
      setPassword('')
    }catch (error) {
      setLoginMessage(`Login failed: ${error.message}`)
    }finally {
      setLoginPending(false)
      }
    }


    //this signs out the current user and clears the login form of the app
    async function handleLogout() {
      setLoginMessage('')

      try {
        const { error } = await logOut()
        if (error) throw error

        setUser(null)
        setEmail('')
        setPassword('')
        setAuthMode('login')
      } catch (error) {
        setLoginMessage(`Logout failed: ${error.message}`)
      }
    }

  async function fetchSummary(nextMeals, dailyTarget) {
    const response = await fetch('/api/calories/summary', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ meals: nextMeals, daily_target: dailyTarget }),
    })
    if (!response.ok) throw new Error(`Python API returned HTTP ${response.status}`)
    return response.json()
  }

  function readTarget() {
    const target = Number(targetInput)
    if (!Number.isSafeInteger(target) || target <= 0) {
      throw new Error('Enter a positive whole-number daily calorie target.')
    }
    return target
  }

  async function updateMeals(nextMeals) {
    setMealPending(true)
    setMealError('')
    try {
      const result = await fetchSummary(nextMeals, readTarget())
      setMeals(nextMeals)
      setSummary(result)
      return true
    } catch (error) {
      setMealError(error.message)
      return false
    } finally {
      setMealPending(false)
    }
  }

  async function addMeal(event) {
    event.preventDefault()
    if (mealPending) return
    const calories = Number(mealCalories)
    if (!mealName.trim() || mealCalories.trim() === '' || !Number.isSafeInteger(calories) || calories < 0) {
      setMealError('Enter a meal name and a nonnegative whole-number calorie amount.')
      return
    }
    const saved = await updateMeals([...meals, { name: mealName.trim(), calories }])
    if (saved) {
      setMealName('')
      setMealCalories('')
    }
  }

  return (
    <main className="container">
      <p className="eyebrow">College fitness &amp; nutrition</p>
      <h1>GatorGains</h1>
      <p className="lede">Two small working pieces: signup checks in JavaScript, and calorie totals from Python.</p>

      <section className="panel" aria-labelledby="signup-title">
        <h2 id="signup-title">Student signup</h2>
        <form onSubmit={handleSignup} noValidate>
          <label htmlFor="email">College email</label>
          <input id="email" type="email" autoComplete="email" value={email}
            onChange={(event) => setEmail(event.target.value)} placeholder="student@ufl.edu"
            aria-invalid={Boolean(errors.email)} aria-describedby={errors.email ? 'email-error' : undefined} />
          {errors.email && <p className="error" id="email-error" role="alert">{errors.email}</p>}

          <label htmlFor="password">Password</label>
          <input id="password" type="password" autoComplete="new-password" value={password}
            onChange={(event) => setPassword(event.target.value)} placeholder="At least 8 characters"
            aria-invalid={Boolean(errors.password)} aria-describedby={errors.password ? 'password-error' : undefined} />
          {errors.password && <p className="error" id="password-error" role="alert">{errors.password}</p>}

          <button type="submit" disabled={signupPending}>{signupPending ? 'Creating account…' : 'Create account'}</button>
          {signupMessage && <p className="message" role="status">{signupMessage}</p>}
        </form>
      </section>

      <section className="panel" aria-labelledby="meals-title">
        <h2 id="meals-title">Daily calorie tracker (demo)</h2>
        <p className="hint">Add meals and Python will calculate your total. Entries are not saved when you refresh.</p>
        <form onSubmit={addMeal} noValidate>
          <label htmlFor="meal-name">Meal name</label>
          <input id="meal-name" value={mealName} onChange={(event) => setMealName(event.target.value)} placeholder="Lunch" />
          <label htmlFor="meal-calories">Calories</label>
          <input id="meal-calories" type="number" min="0" step="1" value={mealCalories}
            onChange={(event) => setMealCalories(event.target.value)} placeholder="450" />
          <button type="submit" disabled={mealPending}>{mealPending ? 'Calculating…' : 'Add meal'}</button>
        </form>

        <div className="target-row">
          <label htmlFor="daily-target">Daily target</label>
          <input id="daily-target" type="number" min="1" step="1" value={targetInput}
            onChange={(event) => setTargetInput(event.target.value)} />
          <button type="button" className="secondary-button" disabled={mealPending}
            onClick={() => updateMeals(meals)}>Update total</button>
        </div>

        {meals.length > 0 && (
          <ul className="meal-list">
            {meals.map((meal, index) => (
              <li key={index}>
                <span>{meal.name} — {meal.calories} cal</span>
                <button type="button" className="text-button" disabled={mealPending}
                  onClick={() => updateMeals(meals.filter((_, itemIndex) => itemIndex !== index))}>Remove</button>
              </li>
            ))}
          </ul>
        )}
        {summary && (
          <p className="totals" role="status">
            <strong>{summary.total_calories}</strong> eaten / {summary.daily_target} target ·{' '}
            <strong>{summary.remaining_calories}</strong> remaining
          </p>
        )}
        {mealError && <p className="error" role="alert">{mealError}</p>}
      </section>

      <p className="dev-status">Python API: <strong>{apiStatus}</strong> · Supabase: <strong>{supabase ? 'Configured' : 'Not configured'}</strong></p>
      <p className="note">Signup uses temporary browser-only rules (.edu email, 8-character password). These are not secure signup restrictions; the team still needs to enforce its agreed policy through authentication.</p>
    </main>
  )
}
