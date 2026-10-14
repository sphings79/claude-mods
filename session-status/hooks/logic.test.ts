import { test, expect } from 'claude-code/testing'

import { cacheLevel, cacheTokens, formatTokens, contextCells, contextLevel, filledCells, langOf, limitLabel, minutesLeft, resetLabel, usd } from './logic'

test('cache levels and bar', () => {
  expect(cacheLevel(null)).toBeNull()
  expect(cacheLevel(3600)).toBe('ok')
  expect(cacheLevel(1200)).toBe('warn')
  expect(cacheLevel(600)).toBe('alert')
  expect(cacheLevel(0)).toBe('expired')
  expect(filledCells(3600)).toBe(20)
  expect(filledCells(0)).toBe(0)
  expect(minutesLeft(3541)).toBe(60)
})

test('language detection', () => {
  expect(langOf('de-DE')).toBe('de')
  expect(langOf('German')).toBe('en')
  expect(langOf(undefined)).toBe('en')
})

test('context bar', () => {
  expect(contextCells(0)).toBe(0)
  expect(contextCells(1)).toBe(1)
  expect(contextCells(19)).toBe(4)
  expect(contextCells(100)).toBe(20)
  expect(contextLevel(59)).toBe('ok')
  expect(contextLevel(60)).toBe('warn')
  expect(contextLevel(80)).toBe('alert')
})

test('limits and cost', () => {
  expect(usd(1.234)).toBe('$1.23')
  expect(limitLabel('five_hour', 'de')).toBe('5h')
  expect(limitLabel('seven_day', 'de')).toBe('Woche')
  expect(limitLabel('seven_day', 'en')).toBe('Week')
  expect(limitLabel('spend_limit', 'en')).toBe('Limit')
  expect(resetLabel(null, 'de', 0)).toBe('')
  expect(resetLabel('nonsense', 'de', 0)).toBe('')
  const noon = new Date(2026, 9, 14, 12, 0).getTime()
  expect(resetLabel(new Date(2026, 9, 14, 14, 30).toISOString(), 'de', noon)).toBe('14:30')
  expect(resetLabel(new Date(2026, 9, 19, 9, 5).toISOString(), 'de', noon)).toBe('Mo 09:05')
})

test('cache tokens', () => {
  expect(cacheTokens({ cache_read_input_tokens: 180000, cache_creation_input_tokens: 4000 })).toBe(184000)
  expect(cacheTokens({ cache_read_input_tokens: 0, cache_creation_input_tokens: null })).toBeNull()
  expect(formatTokens(950)).toBe('950')
  expect(formatTokens(184000)).toBe('184k')
  expect(formatTokens(1_250_000)).toBe('1.3M')
})
