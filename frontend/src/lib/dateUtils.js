// Diary dates are calendar days (YYYY-MM-DD), not UTC instants.
// Never derive a student's chosen day using Date#toISOString().

function pad(value) {
  return String(value).padStart(2, '0')
}

export function localDateKey(date = new Date()) {
  if (!(date instanceof Date) || Number.isNaN(date.getTime())) {
    throw new Error('A valid Date is required.')
  }
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`
}

export function parseDateKey(value) {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    throw new Error('A date in YYYY-MM-DD format is required.')
  }
  const [year, month, day] = value.split('-').map(Number)
  // Use UTC only for validating calendar arithmetic, not for determining
  // the student's "today" or converting timestamps to a diary date.
  const parsed = new Date(0)
  parsed.setUTCHours(12, 0, 0, 0)
  parsed.setUTCFullYear(year, month - 1, day)
  if (
    parsed.getUTCFullYear() !== year ||
    parsed.getUTCMonth() !== month - 1 ||
    parsed.getUTCDate() !== day
  ) {
    throw new Error('Invalid calendar date.')
  }
  return { year, month, day }
}

export function shiftDateKey(key, offsetDays) {
  const { year, month, day } = parseDateKey(key)
  if (!Number.isSafeInteger(offsetDays)) throw new Error('Day offset must be an integer.')
  const date = new Date(0)
  date.setUTCHours(12, 0, 0, 0)
  date.setUTCFullYear(year, month - 1, day + offsetDays)
  return `${date.getUTCFullYear()}-${pad(date.getUTCMonth() + 1)}-${pad(date.getUTCDate())}`
}

export function formatDateKey(key) {
  const { year, month, day } = parseDateKey(key)
  const date = new Date(0)
  date.setFullYear(year, month - 1, day)
  date.setHours(12, 0, 0, 0)
  return date.toLocaleDateString(undefined, {
    weekday: 'short', year: 'numeric', month: 'short', day: 'numeric',
  })
}
