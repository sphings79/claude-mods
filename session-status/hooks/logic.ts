export type Lang = 'de' | 'en'

export const CACHE_TTL_S = 60 * 60
export const CACHE_WARN_S = 20 * 60
export const CACHE_ALERT_S = 10 * 60
export const BAR_CELLS = 20
// Below this width the full row (bar, `expired`, tokens, button) no longer fits.
export const NARROW_COLUMNS = 75

export const langOf = (value: string | undefined): Lang => (/^de/i.test((value ?? '').trim()) ? 'de' : 'en')

export type Level = 'ok' | 'warn' | 'alert' | 'expired'

export const cacheLevel = (secondsLeft: number | null): Level | null =>
  secondsLeft === null
    ? null
    : secondsLeft <= 0
      ? 'expired'
      : secondsLeft <= CACHE_ALERT_S
        ? 'alert'
        : secondsLeft <= CACHE_WARN_S
          ? 'warn'
          : 'ok'

// Cells lit in the bar for the time the cache has left.
export const filledCells = (secondsLeft: number): number =>
  Math.min(BAR_CELLS, Math.max(0, Math.ceil((secondsLeft / CACHE_TTL_S) * BAR_CELLS)))

// Cells lit in the context bar; at least one as soon as anything is used.
export const contextCells = (percent: number): number =>
  percent <= 0 ? 0 : Math.min(BAR_CELLS, Math.max(1, Math.round((percent / 100) * BAR_CELLS)))

// Calm, getting full, nearly full.
export const contextLevel = (percent: number): Level => (percent >= 80 ? 'alert' : percent >= 60 ? 'warn' : 'ok')

// Tokens the cache holds: what the last response read from it plus what it wrote.
export const cacheTokens = (usage: { cache_read_input_tokens?: number | null; cache_creation_input_tokens?: number | null }): number | null => {
  const total = (usage.cache_read_input_tokens ?? 0) + (usage.cache_creation_input_tokens ?? 0)
  return total > 0 ? total : null
}

export const formatTokens = (n: number): string =>
  n < 1000 ? String(n) : n < 1_000_000 ? `${Math.round(n / 1000)}k` : `${(n / 1_000_000).toFixed(1)}M`

export const usd = (n: number): string => `$${n.toFixed(2)}`

const pad = (n: number) => String(n).padStart(2, '0')

// Label of a rate-limit window: `five_hour`, `seven_day`, a gateway's `spend_limit`.
export const limitLabel = (kind: string, lang: Lang): string =>
  kind === 'five_hour' ? '5h' : kind === 'seven_day' ? TEXT[lang].week : kind === 'spend_limit' ? TEXT[lang].spend : kind

// When a window resets: the time today, else weekday and time; '' without a usable timestamp.
export const resetLabel = (iso: string | null, lang: Lang, now: number): string => {
  const date = iso === null ? null : new Date(iso)
  if (date === null || Number.isNaN(date.getTime())) return ''
  const time = `${pad(date.getHours())}:${pad(date.getMinutes())}`
  return date.toDateString() === new Date(now).toDateString() ? time : `${TEXT[lang].days[date.getDay()]} ${time}`
}

export const minutesLeft = (secondsLeft: number): number => Math.ceil(secondsLeft / 60)

export const TEXT = {
  de: { cache: 'Cache', expired: 'abgelaufen', expiredShort: 'abgel.', context: 'Kontext', auto: 'Auto-Compact', compact: 'Compact', agents: 'Agents', tokens: 'Token', limits: 'Limits', week: 'Woche', spend: 'Limit', days: ['So', 'Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa'], busy: 'Compact geht erst nach der Antwort.', shown: 'Status-Leiste eingeblendet.', hidden: 'Status-Leiste ausgeblendet.' },
  en: { cache: 'Cache', expired: 'expired', expiredShort: 'exp.', context: 'Context', auto: 'Auto-compact', compact: 'Compact', agents: 'Agents', tokens: 'tokens', limits: 'Limits', week: 'Week', spend: 'Limit', days: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'], busy: 'Compact works once the answer is done.', shown: 'Status band shown.', hidden: 'Status band hidden.' },
} as const
