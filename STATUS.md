# GatorGains — Development Status

## What works right now

- **Signup form:** React checks email format, `.edu` ending, and password length using JavaScript. These are temporary browser-side rules.
- **Calorie tracker:** Enter or remove meals and change a daily calorie target. React sends meals and the target to the Python API, which returns calories consumed and remaining.
- **API status:** React shows whether the Python API is responding.
- **Tests:** JavaScript signup-validation tests and Python calorie-calculation tests are included.
- **Supabase signup:** The signup form can call Supabase if credentials are configured. Otherwise, it only checks inputs and does not create accounts.

**Not implemented yet:** Saved meals, saved profiles/goals, login/logout, or fully enforced student signup restrictions. Refreshing clears the demo meal list. Browser-side checks do not secure Supabase account creation.

## Run the app

Open two terminals from the repository root.

**Terminal 1 — Python:**

```bash
cd backend
python -m pip install -r requirements-dev.txt
python -m uvicorn app.main:app --reload --port 8000
```

**Terminal 2 — React:**

```bash
cd frontend
npm ci
npm run dev -- --host 0.0.0.0
```

Open forwarded port **5173** in Codespaces. Try a 350-calorie breakfast and a 600-calorie lunch with a 2,000-calorie target: Python should return **950 consumed, 1,050 remaining**.

**Run tests:** From `backend/`, run `python -m pytest -q`. From `frontend/`, run `npm test` and `npm run build`.

## Things to build

### Frontend — React

- [ ] Login/logout and profile screens.
- [ ] Fitness goal selection and meal editing.
- [ ] Display saved data, loading states, and useful error messages.

**Start here:** `frontend/src/App.jsx`, `frontend/src/styles.css`, `frontend/src/lib/validation.js`.

### Backend — Supabase and FastAPI

- [ ] Configure the shared Supabase project for real signup/login and sessions.
- [ ] Store profiles, goals, and meals with per-user access controls.
- [ ] Load and save meals rather than losing them on refresh.
- [ ] Expand Python fitness/calorie calculations when goal rules are decided.

**Start here:** `frontend/src/lib/supabase.js`, `backend/app/main.py`.

### Team decisions

- [ ] Which student email addresses, signup fields, and password rules do we want? How do we enforce them securely?
- [ ] What information is required in a profile?
- [ ] How do fitness goals determine daily calorie targets?
- [ ] Which operations use Supabase directly versus FastAPI?
- [ ] What features are necessary for the first usable version?

### Testing

- [ ] Test real signup, duplicate accounts, login/logout, and sessions once authentication is connected.
- [ ] Test saved meals, editing/deletion, per-user access, and calorie totals.

**Start here:** `frontend/src/lib/validation.test.js`, `backend/tests/test_calories.py`.

## How the pieces connect

- **JavaScript → Supabase (when configured):** Signup uses `frontend/src/lib/supabase.js`. Client-side validation happens in `frontend/src/lib/validation.js`.
- **React → Python:** `POST /api/calories/summary` receives a list of meals and a daily target, then calculates totals; it does not save anything.
- **Health check:** `GET /api/health` reports whether FastAPI is running.

**Example calorie request:**

```json
{
  "meals": [{ "name": "Lunch", "calories": 450 }],
  "daily_target": 2000
}
```

**Example response:**

```json
{
  "total_calories": 450,
  "daily_target": 2000,
  "remaining_calories": 1550
}
```

For Supabase, copy `frontend/.env.example` to `frontend/.env.local` and use only the project's public/publishable credentials in frontend code. Never commit secret keys.
