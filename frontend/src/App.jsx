import { useEffect, useRef, useState } from 'react'
import { supabase, signUp, logIn, logOut } from './lib/supabase.js'
import { validateSignup } from './lib/validation.js'
<<<<<<< HEAD
import ProgressTab from './components/progressTab.jsx'
=======
import { localDateKey, shiftDateKey, formatDateKey } from './lib/dateUtils.js'
import { getMealsForDate, saveMeal, deleteMeal } from './lib/mealLogs.js'
import ProgressTab from './components/progressTab.jsx'
import './styles/journal.css'
>>>>>>> origin/main


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



  // Supabase is the source of truth for meals; the calorie target remains
  // session-only until we implement fitness_goals persistence.
  const [selectedDate, setSelectedDate] = useState(localDateKey)
  const [mealName, setMealName] = useState('')
  const [mealCalories, setMealCalories] = useState('')
  const [targetInput, setTargetInput] = useState('2000')
  const [dailyTarget, setDailyTarget] = useState(2000)
  const [meals, setMeals] = useState([])
  const [loadedMealsFor, setLoadedMealsFor] = useState(null)
  const [mealLoading, setMealLoading] = useState(false)
  const [summary, setSummary] = useState(null)
  const [summaryPending, setSummaryPending] = useState(false)
  const [summaryError, setSummaryError] = useState('')
  const [mealError, setMealError] = useState('')
  const [mealPending, setMealPending] = useState(false)
  const currentContextRef = useRef('')
  const currentContext = `${user?.id ?? ''}|${selectedDate}`
  currentContextRef.current = currentContext

  const [activeTab, setActiveTab] = useState('progress') //tracks which section of GatorGains is being displayed to the user

  const [activeTab, setActiveTab] = useState('progress') //tracks which section of GatorGains is being displayed to the user

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

  // Load only the selected date for the current account. Cancelling stale
  // results prevents a quick date/account switch showing someone else's data.
  useEffect(() => {
    if (!user?.id) {
      setMeals([])
      setLoadedMealsFor(null)
      setSummary(null)
      setMealError('')
      setMealLoading(false)
      return
    }
    let active = true
    const requestedContext = `${user.id}|${selectedDate}`
    setMealLoading(true)
    setLoadedMealsFor(null)
    setMeals([])
    setSummary(null)
    setMealError('')

    getMealsForDate(user.id, selectedDate)
      .then((savedMeals) => {
        if (!active) return
        setMeals(savedMeals)
        setLoadedMealsFor(requestedContext)
      })
      .catch((error) => {
        if (active) setMealError(`Unable to load meals: ${error.message}`)
      })
      .finally(() => {
        if (active) setMealLoading(false)
      })
    return () => { active = false }
  }, [user?.id, selectedDate])

  // Recalculate when saved meals or the applied target changes. No meals are
  // ever erased if FastAPI is offline; the summary just displays an error.
  useEffect(() => {
    if (!user?.id || loadedMealsFor !== `${user.id}|${selectedDate}`) {
      setSummary(null)
      setSummaryError('')
      setSummaryPending(false)
      return
    }
    let active = true
    const controller = new AbortController()
    setSummaryPending(true)
    setSummaryError('')
    fetchSummary(meals, dailyTarget, controller.signal)
      .then((result) => {
        if (active) setSummary(result)
      })
      .catch((error) => {
        if (active && error.name !== 'AbortError') {
          setSummary(null)
          setSummaryError(`Unable to calculate totals: ${error.message}`)
        }
      })
      .finally(() => {
        if (active) setSummaryPending(false)
      })
    return () => {
      active = false
      controller.abort()
    }
  }, [user?.id, selectedDate, loadedMealsFor, meals, dailyTarget])

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

    if (!email.trim() || !password.trim()) {
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

  async function fetchSummary(nextMeals, target, signal) {
    const response = await fetch('/api/calories/summary', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ meals: nextMeals, daily_target: target }),
      signal,
    })
    if (!response.ok) throw new Error(`Python API returned HTTP ${response.status}`)
    return response.json()
  }

  function updateTarget() {
    const value = Number(targetInput)
    if (!Number.isSafeInteger(value) || value <= 0) {
      setMealError('Enter a positive whole-number daily calorie target.')
      return
    }
    setMealError('')
    setDailyTarget(value)
  }

  async function addMeal(event) {
    event.preventDefault()
    if (mealPending || mealLoading || loadedMealsFor !== currentContext) return
    const calories = Number(mealCalories)
    if (!mealName.trim() || mealCalories.trim() === '' || !Number.isSafeInteger(calories) || calories < 0) {
      setMealError('Enter a meal name and a nonnegative whole-number calorie amount.')
      return
    }
    const requestContext = currentContext
    const mealDate = selectedDate
    const userId = user.id
    setMealPending(true)
    setMealError('')
    try {
      const saved = await saveMeal(userId, mealDate, { name: mealName, calories })
      if (currentContextRef.current === requestContext) {
        setMeals((current) => [...current, saved])
        setMealName('')
        setMealCalories('')
      }
    } catch (error) {
      if (currentContextRef.current === requestContext) setMealError(`Meal not saved: ${error.message}`)
    } finally {
      setMealPending(false)
    }
  }

  async function removeMeal(mealId) {
    if (mealPending || mealLoading || loadedMealsFor !== currentContext) return
    const requestContext = currentContext
    const userId = user.id
    setMealPending(true)
    setMealError('')
    try {
      await deleteMeal(userId, mealId)
      if (currentContextRef.current === requestContext) {
        setMeals((current) => current.filter((meal) => meal.id !== mealId))
      }
    } catch (error) {
      if (currentContextRef.current === requestContext) setMealError(`Meal not deleted: ${error.message}`)
    } finally {
      setMealPending(false)
    }
  }

  return (
    <main className="container">
      <p className="eyebrow">College fitness &amp; nutrition</p>
      <h1>GatorGains</h1>
      <p className="lede">Track your fitness, nutrition, and daily progress all in one place.</p>
    {!authLoading && !user && (
      <section className="panel" aria-labelledby="auth-title">
        <h2 id="auth-title">
          {user ? 'My Account' : authMode === 'signup'? 'Student Signup' : 'Student Login'}
        </h2>
        {authLoading ? (
          <p>Checking authentication..</p>
        ) : user ? (
          <div>
            <p>Welcome to GatorGains!</p>
            <p>Logged in as: {user.email}</p>

            <button type="button" onClick={handleLogout}>Logout</button>
          </div>
        ) : (
          <>
            <div className="auth-toggle">
              <button type="button"
              className={authMode === 'signup' ? '' : 'secondary-button'}
              onClick={() => {
                setAuthMode('signup')
                setErrors({})
                setLoginMessage('')
                setSignupMessage('')
              }}
              >
                Signup
              </button>

              <button type="button"
              className={authMode === 'login' ? '' : 'secondary-button'}
              onClick={() => {
                setAuthMode('login')
                setErrors({})
                setLoginMessage('')
                setSignupMessage('')
              }}
              >
                Login
              </button>
            </div>
            <form 
            onSubmit={authMode === 'signup' ? handleSignup : handleLogin}
            noValidate
            > 
            <label htmlFor="email">College Email</label>
            <input id="email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="student@ufl.edu"
            aria-invalid={authMode === 'signup' && Boolean(errors.email)}
          />
          {authMode === 'signup' && errors.email && (
            <p className="error" role="alert">{errors.email}</p>
          )}
          <label htmlFor="password">Password</label>
          <input id="password"
          type="password"
          autoComplete={authMode === 'signup' ? 'new-password' : 'current-password'}
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          placeholder="Enter password"
          aria-invalid={authMode === 'signup' && Boolean(errors.password)}
          />
          {authMode === 'signup' && errors.password && (
            <p className="error" role="alert">{errors.password}</p>
          )}
          <button type="submit"
          disabled={signupPending || loginPending}
          > 
          {authMode ==='signup' ? signupPending ? 'Creating Account...' : 'Create Account'
          : loginPending ? 'Logging In...' : 'Log In'}
          </button>
          {authMode === 'signup' && signupMessage && (
            <p className="message" role="status">{signupMessage}</p>
          )}
          {authMode === 'login' && loginMessage && (
            <p className="message" role="status">{loginMessage}</p>
          )}
          </form>
        </>
      )}
    </section>
  )}
{/* Only show dashboard when logged in */}
{!authLoading && user && (
  <>
  {/* Wlecome message and Logout button */}
  <div className="dashboard-header">
    <p>Welcome to GatorGains, {user.email}!</p>

    <button type="button" onClick={handleLogout}>Logout</button>
  </div>
      {/* Main navigation for GatorGains */}
      <nav className="main-nav" aria-label="Main Dashboardnavigation">
        <button
          type="button"
          className={activeTab === 'progress' ? 'nav-button active' : 'nav-button'}
          onClick={() => setActiveTab('progress')}
          >
          Progress
          </button>
          <button
          type="button"
          className={activeTab === 'nutrition' ? 'nav-button active' : 'nav-button'}
          onClick={() => setActiveTab('nutrition')}
          >
          Nutrition
          </button>
          </nav>



<<<<<<< HEAD
      {activeTab === 'progress' && (<ProgressTab summary={summary} />)}
=======
      {activeTab === 'progress' && (
        <ProgressTab
          summary={loadedMealsFor === currentContext ? summary : null}
          selectedDate={formatDateKey(selectedDate)}
          loading={mealLoading || summaryPending || (loadedMealsFor !== currentContext && !mealError)}
          error={mealError || summaryError}
        />
      )}
>>>>>>> origin/main

      {activeTab === 'nutrition' && (
      <section className="panel" aria-labelledby="meals-title">
        <h2 id="meals-title">Daily meal journal</h2>
        <nav className="journal-date-nav" aria-label="Meal journal date">
          <button type="button" className="secondary-button" disabled={mealPending}
            onClick={() => setSelectedDate((date) => shiftDateKey(date, -1))}>Previous Day</button>
          <strong aria-live="polite">{formatDateKey(selectedDate)}</strong>
          <button type="button" className="secondary-button" disabled={mealPending}
            onClick={() => setSelectedDate((date) => shiftDateKey(date, 1))}>Next Day</button>
          <button type="button" className="secondary-button" disabled={mealPending}
            onClick={() => setSelectedDate(localDateKey())}>Today</button>
        </nav>
        <p className="hint">Meals are saved to your account for the selected date. Daily calorie targets are not saved yet.</p>
        <form onSubmit={addMeal} noValidate>
          <label htmlFor="meal-name">Meal name</label>
          <input id="meal-name" value={mealName} onChange={(event) => setMealName(event.target.value)} placeholder="Lunch" />
          <label htmlFor="meal-calories">Calories</label>
          <input id="meal-calories" type="number" min="0" step="1" value={mealCalories}
            onChange={(event) => setMealCalories(event.target.value)} placeholder="450" />
          <button type="submit" disabled={mealPending || mealLoading || loadedMealsFor !== currentContext}>
            {mealPending ? 'Saving…' : 'Add meal'}
          </button>
        </form>

        <div className="target-row">
          <label htmlFor="daily-target">Daily target (this session)</label>
          <input id="daily-target" type="number" min="1" step="1" value={targetInput}
            onChange={(event) => setTargetInput(event.target.value)} />
          <button type="button" className="secondary-button" onClick={updateTarget}>Update total</button>
        </div>

        {mealLoading && <p role="status">Loading saved meals…</p>}
        {!mealLoading && loadedMealsFor === currentContext && meals.length === 0 && (
          <p className="hint">No meals recorded for this date.</p>
        )}
        {!mealLoading && loadedMealsFor === currentContext && meals.length > 0 && (
          <ul className="meal-list">
            {meals.map((meal) => (
              <li key={meal.id}>
                <span>{meal.name} — {meal.calories} cal</span>
                <button type="button" className="text-button" disabled={mealPending}
                  onClick={() => removeMeal(meal.id)}>Remove</button>
              </li>
            ))}
          </ul>
        )}
        {summaryPending && <p role="status">Calculating daily total…</p>}
        {summary && !summaryPending && loadedMealsFor === currentContext && (
          <p className="totals" role="status">
            <strong>{summary.total_calories}</strong> eaten / {summary.daily_target} target ·{' '}
            <strong>{summary.remaining_calories}</strong> remaining
          </p>
        )}
        {summaryError && <p className="error" role="alert">{summaryError}</p>}
        {mealError && <p className="error" role="alert">{mealError}</p>}
      </section>
        )}
       </>
      )}
      <p className="dev-status">Python API: <strong>{apiStatus}</strong> · Supabase: <strong>{supabase ? 'Configured' : 'Not configured'}</strong></p>
      <p className="note">Signup uses temporary browser-only rules (.edu email, 8-character password). These are not secure signup restrictions; the team still needs to enforce its agreed policy through authentication.</p>
     
    </main>
    
  )}
