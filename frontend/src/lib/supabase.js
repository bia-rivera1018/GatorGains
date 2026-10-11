import { createClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL
const key = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY

// A null client keeps the baseline application runnable without credentials.
// Supabase operations must handle this or wait for a configured project.
export const supabase = url && key ? createClient(url, key) : null
