import { describe, expect, it } from 'vitest'
import { formatDateKey, localDateKey, parseDateKey, shiftDateKey } from './dateUtils.js'

describe('diary calendar dates', () => {
  it('uses the local calendar day rather than UTC conversion', () => {
    const localMidnight = new Date(2026, 9, 26, 0, 15)
    expect(localDateKey(localMidnight)).toBe('2026-10-26')
  })

  it('navigates across month and year boundaries', () => {
    expect(shiftDateKey('2026-10-01', -1)).toBe('2026-09-30')
    expect(shiftDateKey('2026-12-31', 1)).toBe('2027-01-01')
  })

  it('handles leap day and daylight saving transition dates', () => {
    expect(shiftDateKey('2028-02-28', 1)).toBe('2028-02-29')
    expect(shiftDateKey('2026-03-08', -1)).toBe('2026-03-07')
    expect(shiftDateKey('2026-11-01', 1)).toBe('2026-11-02')
  })

  it('rejects malformed or nonexistent calendar days', () => {
    expect(() => parseDateKey('2026-02-30')).toThrow()
    expect(() => parseDateKey('10/26/2026')).toThrow()
    expect(() => shiftDateKey('2026-10-26', 1.5)).toThrow()
  })

  it('renders a date label without treating it as a UTC timestamp', () => {
    expect(formatDateKey('2026-10-26')).toContain('2026')
  })
})
