import { describe, it, expect } from 'vitest'
import { cn, formatPercent, formatFraction } from '@/lib/utils'

describe('cn', () => {
  it('merges class names', () => {
    expect(cn('px-4', 'py-2')).toBe('px-4 py-2')
  })

  it('deduplicates conflicting tailwind classes', () => {
    expect(cn('px-4', 'px-6')).toBe('px-6')
  })

  it('handles conditional classes', () => {
    expect(cn('base', false && 'hidden', 'extra')).toBe('base extra')
  })

  it('returns empty string for no input', () => {
    expect(cn()).toBe('')
  })
})

describe('formatPercent', () => {
  it('formats whole numbers', () => {
    expect(formatPercent(50)).toBe('50%')
  })

  it('rounds decimals', () => {
    expect(formatPercent(33.33)).toBe('33%')
    expect(formatPercent(66.67)).toBe('67%')
  })

  it('handles zero', () => {
    expect(formatPercent(0)).toBe('0%')
  })

  it('handles 100', () => {
    expect(formatPercent(100)).toBe('100%')
  })
})

describe('formatFraction', () => {
  it('formats as completed/total', () => {
    expect(formatFraction(3, 10)).toBe('3/10')
  })

  it('handles zero', () => {
    expect(formatFraction(0, 5)).toBe('0/5')
  })

  it('handles equal values', () => {
    expect(formatFraction(5, 5)).toBe('5/5')
  })
})
