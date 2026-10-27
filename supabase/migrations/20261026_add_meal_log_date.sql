-- Sprint 1: persistent, date-based meal journal (GatorGains #20).
--
-- This extends the existing meal_logs table. Do not edit or re-run the
-- initial schema migration: the live Supabase project already has that table.
--
-- log_date means the calendar day to which a meal belongs, not the instant
-- at which the student submitted the entry. The client must explicitly send
-- YYYY-MM-DD in the student's local timezone. There is intentionally no
-- server-side UTC CURRENT_DATE default (it could assign the wrong local day).

BEGIN;

ALTER TABLE public.meal_logs
    ADD COLUMN IF NOT EXISTS log_date date;

-- Historical rows have no chosen diary date, so their original local day
-- cannot be recovered. Assign the date of the existing logged_at timestamp
-- in UTC as a documented best-effort backfill; never discard old meals.
UPDATE public.meal_logs
SET log_date = (COALESCE(logged_at, created_at, now()) AT TIME ZONE 'UTC')::date
WHERE log_date IS NULL;

-- Future clients must supply the intended diary date explicitly.
ALTER TABLE public.meal_logs
    ALTER COLUMN log_date SET NOT NULL;

-- Most requests will filter by the current authenticated user and one date,
-- then order entries by when they were created.
CREATE INDEX IF NOT EXISTS meal_logs_user_date_logged_at_idx
    ON public.meal_logs (user_id, log_date, logged_at, id);

-- Keep the existing SELECT/INSERT/UPDATE/DELETE RLS policies unchanged.
COMMIT;
