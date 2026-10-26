import { supabase } from './supabase.js'
import { parseDateKey } from './dateUtils.js'

const FIELDS = 'id, meal_name, calories, log_date, logged_at'

function db() {
  if (!supabase) throw new Error('Supabase is not configured.')
  return supabase
}

function requireUser(userId) {
  if (typeof userId !== 'string' || !userId.trim()) {
    throw new Error('Sign in before accessing the meal journal.')
  }
}

function toMeal(row) {
  return {
    id: row.id,
    name: row.meal_name,
    calories: row.calories,
    logDate: row.log_date,
    loggedAt: row.logged_at,
  }
}

export async function getMealsForDate(userId, dateKey) {
  requireUser(userId)
  parseDateKey(dateKey)
  const { data, error } = await db()
    .from('meal_logs')
    .select(FIELDS)
    .eq('user_id', userId)
    .eq('log_date', dateKey)
    .order('logged_at', { ascending: true })
    .order('id', { ascending: true })
  if (error) throw error
  return (data ?? []).map(toMeal)
}

export async function saveMeal(userId, dateKey, { name, calories }) {
  requireUser(userId)
  parseDateKey(dateKey)
  if (typeof name !== 'string' || !name.trim()) {
    throw new Error('Enter a meal name.')
  }
  if (!Number.isSafeInteger(calories) || calories < 0) {
    throw new Error('Calories must be a nonnegative whole number.')
  }
  const { data, error } = await db()
    .from('meal_logs')
    .insert({
      user_id: userId,
      log_date: dateKey,
      meal_name: name.trim(),
      calories,
    })
    .select(FIELDS)
    .single()
  if (error) throw error
  if (!data) throw new Error('Meal was not saved.')
  return toMeal(data)
}

export async function deleteMeal(userId, mealId) {
  requireUser(userId)
  if (typeof mealId !== 'string' || !mealId.trim()) {
    throw new Error('A saved meal ID is required.')
  }
  const { data, error } = await db()
    .from('meal_logs')
    .delete()
    .eq('user_id', userId)
    .eq('id', mealId)
    .select('id')
  if (error) throw error
  if (!data?.length) throw new Error('Meal not found or not authorized for deletion.')
}
