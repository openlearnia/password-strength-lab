import { describe, expect, it } from 'vitest'
import {
  analyzePassword,
  generatePassword,
  type PasswordGeneratorOptions,
} from './analyzePassword'
import { ratingToMeterColor } from './meterColor'

describe('ratingToMeterColor', () => {
  it('maps ratings to solid semantic colors', () => {
    expect(ratingToMeterColor('Very weak')).toBe('#f28b82')
    expect(ratingToMeterColor('Weak')).toBe('#f28b82')
    expect(ratingToMeterColor('Moderate')).toBe('#f5a623')
    expect(ratingToMeterColor('Strong')).toBe('#3dd68c')
    expect(ratingToMeterColor('Excellent')).toBe('#3dd68c')
  })
})

describe('analyzePassword', () => {
  it('rates a long varied password as excellent', () => {
    expect(analyzePassword('Steam-Quartz-47!Halo').rating).toBe('Excellent')
  })
})

describe('generatePassword', () => {
  it('honors the configured length and character sets', () => {
    const options: PasswordGeneratorOptions = {
      length: 24,
      useLowercase: false,
      useUppercase: true,
      useNumbers: true,
      useSymbols: false,
    }

    const password = generatePassword(options)

    expect(password).toHaveLength(24)
    expect(password).toMatch(/^[A-Z0-9]+$/)
    expect(password).toMatch(/[A-Z]/)
    expect(password).toMatch(/\d/)
  })
})
