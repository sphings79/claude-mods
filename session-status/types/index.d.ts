export type Limit = {
  kind: string
  percent: number
  resetsAt: string | null
}

export type Stats = {
  turn: number
  context: number
  autoCompact: number | null
  cost: number | null
  cacheTokens: number | null
  limits: Limit[]
}

export type Cache = {
  expiresAt: number | null
  secondsLeft: number | null
}

declare module 'claude-code' {
  interface PluginState {
    'session-status': { stats: Stats; cache: Cache; isHidden: boolean; isBusy: boolean }
  }
}
