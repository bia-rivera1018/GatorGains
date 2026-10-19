import { describe, expect, it } from 'vitest'
import { validateSignup } from './validation.js'

describe('validateSignup', () => {
  it('accepts a student email and adequate password', () => {
    expect(validateSignup(' Student@UFL.edu ', 'example-password')).toEqual({
      valid: true,
      errors: {},
      email: 'student@ufl.edu',
    })
  })

  it('requires both fields', () => {
    const result = validateSignup('', '')
    expect(result.errors).toHaveProperty('email')
    expect(result.errors).toHaveProperty('password')
  })

  it('rejects non-college emails', () => {
    expect(validateSignup('student@gmail.com', 'example-password').errors.email).toBeTruthy()
  })

  it('rejects malformed emails', () => {
    expect(validateSignup('not-an-email', 'example-password').errors.email).toBeTruthy()
  })

  it('rejects short passwords', () => {
    expect(validateSignup('student@ufl.edu', 'short').errors.password).toBeTruthy()
  })
  
  it('rejects passwords without letters', () => {
    const result = validateSignup('student@ufl.edu', '12345678')
    expect(result.errors.password).toBe('Password must contain at least one letter.')
  })

  it('rejects passwords without numbers', () => {
    const result = validateSignup('student@ufl.edu', 'passwordonly')
    expect(result.errors.password).toBe('Password must contain at least one number.')
  })
})
