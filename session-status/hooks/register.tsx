import { atom, read, update } from 'claude-code'
import type { EngineInterface, Register } from 'claude-code'

import type { Cache, Stats } from '../types'
import { BAR_CELLS, CACHE_TTL_S, TEXT, cacheLevel, cacheTokens, formatTokens, contextCells, contextLevel, filledCells, langOf, limitLabel, minutesLeft, resetLabel, usd } from './logic'
import type { Lang, Level } from './logic'

const stats = atom({ plugin: 'session-status', key: 'stats' } as const, {
  turn: 0,
  context: 0,
  autoCompact: null,
  cost: null,
  cacheTokens: null,
  limits: [],
} as Stats)

const cache = atom({ plugin: 'session-status', key: 'cache' } as const, {
  expiresAt: null,
  secondsLeft: null,
} as Cache)

const isHidden = atom({ plugin: 'session-status', key: 'isHidden' } as const, false)
const isBusy = atom({ plugin: 'session-status', key: 'isBusy' } as const, false)

const COLORS: Record<Level, string> = { ok: '#4caf6e', warn: '#e2a94e', alert: '#e0846b', expired: '#e0645b' }
const MUTED = '#8a8f8c'

// The `language` option, else Claude Code's `language` setting, else the locale; English otherwise.
const detectLang = async ($: EngineInterface, option: unknown): Promise<Lang> => {
  if (option === 'de' || option === 'en') return option
  try {
    const settings = (await $.settings.read()) as Record<string, unknown>
    if (typeof settings.language === 'string' && settings.language.trim()) return langOf(settings.language)
  } catch {
    // No settings: fall through to the locale.
  }
  const env = (await $.env.get('LC_ALL')) || (await $.env.get('LC_MESSAGES')) || (await $.env.get('LANG')) || (await $.env.get('LANGUAGE'))
  if (env) return langOf(env)
  // The desktop app passes no locale variables: ask the runtime.
  return langOf(typeof Intl !== 'undefined' ? Intl.DateTimeFormat().resolvedOptions().locale : undefined)
}

const refreshUsage = async ($: EngineInterface) => {
  const { context, cost, rateLimits } = await $.session.usage({ breakdown: 'summary' })
  const threshold = context.breakdown?.autoCompactThreshold
  const autoCompact = threshold && context.window ? Math.round((threshold / context.window) * 100) : null
  const limits = rateLimits.map(r => ({ kind: r.kind, percent: r.percentUsed, resetsAt: r.resetsAt ?? null }))
  await update($, stats, s => ({ ...s, context: context.percent ?? s.context, autoCompact, cost: cost?.usd ?? null, limits }))
}

export const register: Register = (on, options) => {
  let lang: Lang = 'en'

  on('session.start', async ($, e, next) => {
    const result = await next(e)
    lang = await detectLang($, options.language)

    await $.command.register({ name: 'session-status', description: 'Show or hide the session status band' })

    // Re-derive the countdown; write only when the shown minute or a bar cell changes.
    $.clock.every(5000, async () => {
      const { expiresAt, secondsLeft } = await read($, cache)
      if (expiresAt === null) return
      const left = Math.max(0, Math.floor((expiresAt - (await $.clock.now())) / 1000))
      const changed =
        secondsLeft === null ||
        minutesLeft(left) !== minutesLeft(secondsLeft) ||
        filledCells(left) !== filledCells(secondsLeft)
      if (changed) await update($, cache, c => ({ ...c, secondsLeft: left }))
    })

    return result
  })

  on('command.run', { command: 'session-status' }, async ($, e) => {
    // `/session-status lang` shows what the language detection saw.
    if (e.args.trim() === 'lang') {
      const settings = await $.settings.read().then(v => (v as Record<string, unknown>).language, () => undefined)
      const seen = {
        option: options.language,
        settings: settings ?? null,
        LC_ALL: (await $.env.get('LC_ALL')) ?? null,
        LC_MESSAGES: (await $.env.get('LC_MESSAGES')) ?? null,
        LANG: (await $.env.get('LANG')) ?? null,
        LANGUAGE: (await $.env.get('LANGUAGE')) ?? null,
        intl: typeof Intl !== 'undefined' ? Intl.DateTimeFormat().resolvedOptions().locale : null,
        used: lang,
      }
      return { text: JSON.stringify(seen) }
    }

    const hidden = !(await read($, isHidden))
    await update($, isHidden, () => hidden)
    return { text: hidden ? TEXT[lang].hidden : TEXT[lang].shown }
  })

  on('turn.start', async ($, e, next) => {
    await update($, isBusy, () => true)
    return next(e)
  })

  // What the cache holds, from the main agent's last response.
  on('turn.step', async function* ($, e, next) {
    if (e.agentId !== undefined) return yield* next(e)

    for await (const chunk of next(e)) {
      if (chunk.kind === 'stop' && chunk.usage !== null) {
        const tokens = cacheTokens(chunk.usage)
        if (tokens !== null) await update($, stats, s => ({ ...s, cacheTokens: tokens }))
      }
      yield chunk
    }
  })

  on('turn.complete', async ($, e, next) => {
    const result = await next(e)

    if (e.agentId === undefined) {
      const now = await $.clock.now()
      await update($, cache, () => ({ expiresAt: now + CACHE_TTL_S * 1000, secondsLeft: CACHE_TTL_S }))
      await update($, stats, s => ({ ...s, turn: s.turn + 1 }))
      await update($, isBusy, () => false)
      await refreshUsage($)
    }

    return result
  })

  on('session.compact', async ($, e, next) => {
    const result = await next(e)
    await refreshUsage($)
    return result
  })

  on('ui.render', { component: 'AbovePrompt' }, async ($, e, next) => {
    const s = await read($, stats)
    if (e.props.hasSurvey || s.turn === 0 || (await read($, isHidden))) return next(e)

    const { Box, Button, Text } = $.ui.resolve(e)
    const t = TEXT[lang]
    const { secondsLeft } = await read($, cache)
    const level = cacheLevel(secondsLeft) ?? 'expired'
    const color = COLORS[level]
    const columns = e.props.bodyColumns
    const now = await $.clock.now()
    const ctxColor = COLORS[contextLevel(s.context)]
    const ctxLit = contextCells(s.context)
    const lit = secondsLeft === null ? 0 : filledCells(secondsLeft)

    const cacheLabel = `${minutesLeft(secondsLeft ?? 0)}m`

    // Fixed-width cells keep icon, label, value and bar of both rows in line.
    const Cell = ({ width, children }: { width: number; children?: unknown }) => (
      <Box width={width} flexShrink={0}>{children}</Box>
    )

    return (
      <Box flexDirection="column" paddingX={1}>
        <Box flexDirection="row" alignItems="center" columnGap={1} flexWrap="nowrap" overflow="hidden">
          <Cell width={8}><Text dimColor wrap="truncate-end">{t.cache}</Text></Cell>
          <Cell width={5}><Text bold color={color} wrap="truncate-end">{cacheLabel}</Text></Cell>
          {columns >= 50 ? (
            <Text wrap="truncate-end">
              <Text color={color}>{'■'.repeat(lit)}</Text>
              <Text color={MUTED} dimColor>{'■'.repeat(BAR_CELLS - lit)}</Text>
            </Text>
          ) : null}
          {level === 'expired' ? <Text bold color={color} wrap="truncate-end">{t.expired}</Text> : null}
          {level !== 'expired' && s.cacheTokens !== null ? (
            <Text dimColor wrap="truncate-end">{`(${formatTokens(s.cacheTokens)} ${t.tokens})`}</Text>
          ) : null}
          <Box flexGrow={1} flexShrink={1} />
          <Button
            key="compact"
            label={t.compact}
            onPress={async () => {
              if (await read($, isBusy)) return $.ui.toast(t.busy)
              await $.session.compact().catch(() => $.ui.toast(t.busy))
            }}
          />
        </Box>
        <Box flexDirection="row" alignItems="center" columnGap={1} flexWrap="nowrap" overflow="hidden">
          <Cell width={8}><Text dimColor wrap="truncate-end">{t.context}</Text></Cell>
          <Cell width={5}><Text bold color={ctxColor} wrap="truncate-end">{`${s.context}%`}</Text></Cell>
          {columns >= 50 ? (
            <Text wrap="truncate-end">
              <Text color={ctxColor}>{'■'.repeat(ctxLit)}</Text>
              <Text color={MUTED} dimColor>{'■'.repeat(BAR_CELLS - ctxLit)}</Text>
            </Text>
          ) : null}
          {s.autoCompact !== null ? <Text dimColor wrap="truncate-end">{`(${t.auto} ${s.autoCompact}%)`}</Text> : null}
        </Box>
        {s.limits.length > 0 || s.cost !== null ? (
          <Box flexDirection="row" alignItems="center" columnGap={1} flexWrap="nowrap" overflow="hidden">
            {s.limits.length > 0 ? <Cell width={8}><Text dimColor wrap="truncate-end">{t.limits}</Text></Cell> : null}
            {s.limits.map(l => (
              <Text key={l.kind} wrap="truncate-end">
                <Text dimColor>{limitLabel(l.kind, lang)} </Text>
                <Text bold color={COLORS[contextLevel(l.percent)]}>{`${Math.round(l.percent)}%`}</Text>
                <Text dimColor>{resetLabel(l.resetsAt, lang, now) ? ` (${resetLabel(l.resetsAt, lang, now)})` : ''}</Text>
              </Text>
            ))}
            <Box flexGrow={1} flexShrink={1} />
            {s.cost !== null ? <Text dimColor wrap="truncate-end">{`(${usd(s.cost)})`}</Text> : null}
          </Box>
        ) : null}
      </Box>
    )
  })
}
