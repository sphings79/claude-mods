# claude-mods

Claude Code mods by [sphings79](https://github.com/sphings79). Deutsch: [README.de.md](README.de.md)

| Mod | What it does |
|---|---|
| [session-status](session-status) | Band above the prompt: prompt-cache countdown, context fill, cost, usage limits, Compact button |

## Install

```
/plugin install session-status --marketplace sphings79/claude-mods
```

Or from a shell:

```sh
claude plugin marketplace add sphings79/claude-mods
claude plugin install session-status@claude-mods
```

Requires a Claude Code build with mod (function hook) support. Restart or run `/reload-plugins` afterwards.

## session-status

```
Cache    60m ■■■■■■■■■■■■■■■■■■■■                         [Compact]
Context  19% ■■■■□□□□□□□□□□□□□□□□ (Auto-compact 97%)
Limits   5h 23% (14:30)  Week 41% (Mon 09:00)               ($1.23)
```

- **Cache**: minutes left on the 1-hour prompt cache since the last answer. The bar shows the time left: green, amber at 20 min, red at 10 min, `expired` when it is gone.
- **Context**: bar by context fill, green, amber from 60 %, red from 80 %.
- **Cost** (bottom right, in parentheses): what the session has cost so far, as `/cost` totals it. On a subscription that is an API-equivalent estimate, not a bill.
- **Limits**: usage of the 5-hour and weekly windows with their reset time; a gateway's spend limit too. Colours follow the context thresholds. Shown once the last response reported them.
- **Auto-compact**: the threshold at which Claude Code compacts on its own, in percent of the window.
- **Compact** (top right): runs `/compact`. Not while an answer is being written.
- **`/session-status`** shows or hides the band.

Option `language`: `auto` (default; follows Claude Code's `language` setting, then the system locale), `de` or `en`.

## License

MIT
