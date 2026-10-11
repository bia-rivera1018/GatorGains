# GatorGains

A college fitness and nutrition web app. This repository is a **working starting point**, not a finished product.

## What works right now

- The React signup form sends an email and password to the Python API.
- FastAPI checks required fields, email format, `.edu` ending, and password length, then returns readable errors to React.
- React displays whether the API is online.
- The frontend can call Supabase signup **if the team configures a Supabase project**. Without credentials, it only validates inputs; **it does not create an account**.
- Backend validation tests and frontend calorie-calculation tests run locally and in GitHub Actions.

The `.edu` requirement and 8-character password minimum are **temporary examples**, not approved product policy. Validation is not authentication, and these API checks do not enforce Supabase signup restrictions.

## Run it

You need Node.js and Python installed. Open **two terminals** at the repository root.

**Terminal 1 — API**

```bash
cd backend
python -m pip install -r requirements-dev.txt
python -m uvicorn app.main:app --reload --port 8000
```

**Terminal 2 — website**

```bash
cd frontend
npm ci
npm run dev -- --host 0.0.0.0
```

Open the frontend URL shown by Vite (port **5173** in Codespaces). The Vite proxy forwards `/api` requests to port **8000**; both processes must be running.

Try `student@gmail.com` (rejected), `student@ufl.edu` with a short password (rejected), and `student@ufl.edu` with a longer password (passes validation, but **no account is created** unless Supabase is configured).

**Run checks:**

```bash
# From backend/
python -m pytest -q

# From frontend/
npm test
npm run build
```

## Where each teammate plugs in

| Person | Next deliverable | Start here |
| --- | --- | --- |
| **Anat — requirements** | Agree on allowed student emails, required signup/profile fields, and password rules; tell the team the expected behavior. | The rules in `backend/app/main.py` and this README |
| **Bianca — frontend** | Add login/logout screens; later, profile, goal, and meal forms. Display loading/error states for real requests. | `frontend/src/App.jsx`, `frontend/src/styles.css` |
| **Jacobo — backend/data** | Set up the shared Supabase dev project and authentication, then profile/goal/meal storage with per-user access policies. Decide with Bianca which requests use Supabase directly vs the Python API. | `frontend/src/lib/supabase.js`, `backend/app/main.py` |
| **Thiago — validation/testing** | Update signup validation after Anat decides the rules; test successful/invalid/duplicate registrations, then login/session/logout. Add calorie/meal tests as features arrive. | `backend/tests/test_registration.py`, `frontend/src/lib/nutrition.test.js` |

**Integration contract already working:** `POST /api/registration/validate` accepts `{ "email": "...", "password": "..." }` and returns `{ "valid": true|false, "errors": { ... } }`. `GET /api/health` returns a health status. Keep frontend and backend in sync if the contract changes.

## What is NOT finished

- Real signup/login/logout and persistent sessions (requires Supabase project).
- Profile creation/editing and stored student information.
- Fitness goals, calorie targets, and meal CRUD/daily totals.
- Database tables, migrations, authorization policies (RLS), admin roles, and deployment.

**First shared milestone:** a user can **sign up → log in → save a profile → choose a goal → log a meal → see the saved data after refreshing**. Prioritize that over new infrastructure or a dashboard.

### Supabase when Jacobo is ready

Copy `frontend/.env.example` to `frontend/.env.local` and fill in the **project URL** and **publishable/anon key**. The client in `frontend/src/lib/supabase.js` is already prepared for these. Never put a Supabase secret/service-role key in browser code or Git, and enable/test Row Level Security before storing real users' private data. Supabase signup behavior (including email confirmation and duplicate account reporting) depends on project settings and must be tested.

## Minimal team workflow

Keep `main` runnable. Make changes on a short branch, push it, and open a pull request. Describe what changed and how to test it. One teammate reviews, then merge after the tests pass. Use GitHub issues only when the team actually needs them to coordinate.

## Team

- Anat Bimblich — Product Manager
- Thiago Ramirez — Scrum Master
- Jacobo Belilty — Backend
- Bianca Rivera — Frontend
