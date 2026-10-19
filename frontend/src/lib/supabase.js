import { createClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL
const key = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY

// A null client keeps the baseline application runnable without credentials.
// Supabase operations must handle this or wait for a configured project.
export const supabase = url && key ? createClient(url, key) : null

//Signup or register a new user
export async function signUp(email, password){
    if (!supabase) throw new Error("Supabase is not configured");

    return supabase.auth.signUp({
        email,
        password,
    });
}


//Log in an existing user
export async function logIn(email, password){
    if (!supabase) throw new Error("Supabase is not configured");

    return supabase.auth.signInWithPassword({
        email,
        password,

    });
}

//Log out of the application
export async function logOut(){
    if (!supabase) throw new Error("Supabase is not configured");

    return supabase.auth.signOut();
}