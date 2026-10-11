// Temporary UX rules. Real signup policies must also be enforced securely
// by the authentication service, not just by browser-side JavaScript.
export function validateSignup(email, password) {
  const normalizedEmail = email.trim().toLowerCase()
  const errors = {}

  if (!normalizedEmail) {
    errors.email = 'Email is required.'
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
    errors.email = 'Enter a valid email address.'
  } else if (!normalizedEmail.endsWith('.edu')) {
    errors.email = 'Use a college .edu email address (temporary rule).'
  }

  if (!password) {
    errors.password = 'Password is required.'
  } else if (password.length < 8) {
    errors.password = 'Password must be at least 8 characters.'
  }

  return { valid: Object.keys(errors).length === 0, errors, email: normalizedEmail }
}
