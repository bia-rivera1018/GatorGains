import { describe, expect, it } from 'vitest'
import { sumCalories } from './nutrition.js'

describe('sumCalories', () => {
  it('returns zero for an empty log', () => {
    expect(sumCalories([])).toBe(0)
  })

  it('adds recorded meal calories', () => {
    expect(sumCalories([{ calories: 250 }, { calories: 180 }])).toBe(430)
  })
})
