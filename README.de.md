# claude-mods

Claude-Code-Mods von [sphings79](https://github.com/sphings79). English: [README.md](README.md)

| Mod | Was er macht |
|---|---|
| [session-status](session-status) | Leiste über dem Prompt: Prompt-Cache-Countdown, Kontext-Füllung, Kosten, Nutzungslimits, Compact-Button |

## Installation

```
/plugin install session-status --marketplace sphings79/claude-mods
```

Oder in der Shell:

```sh
claude plugin marketplace add sphings79/claude-mods
claude plugin install session-status@claude-mods
```

Voraussetzung: ein Claude-Code-Build mit Mod-Unterstützung (Function Hooks). Danach neu starten oder `/reload-plugins`.

## session-status

```
Cache    60m ■■■■■■■■■■■■■■■■■■■■                         [Compact]
Kontext  19% ■■■■□□□□□□□□□□□□□□□□ (Auto-Compact 97%)
Limits   5h 23% (14:30)  Woche 41% (Mo 09:00)               ($1.23)
```

- **Cache**: Minuten, die der 1-Stunden-Prompt-Cache seit der letzten Antwort noch hat. Der Balken zeigt die Restzeit: grün, bei 20 min Amber, bei 10 min Rot, `abgelaufen` wenn er weg ist.
- **Kontext**: Balken nach Füllung, grün, ab 60 % Amber, ab 80 % Rot.
- **Kosten** (unten rechts, in Klammern): bisherige Sitzungskosten wie bei `/cost`. Mit Abo ist das eine API-Äquivalent-Schätzung, keine Rechnung.
- **Limits**: Auslastung des 5-Stunden- und des Wochenfensters mit Reset-Zeit, auch das Spend-Limit eines Gateways. Die Farben folgen den Kontext-Schwellen. Erscheint, sobald die letzte Antwort sie gemeldet hat.
- **Auto-Compact**: Schwelle, bei der Claude Code von selbst komprimiert, in Prozent des Fensters.
- **Compact** (oben rechts): führt `/compact` aus. Nicht, solange eine Antwort läuft.
- **`/session-status`** blendet die Leiste ein oder aus.

Option `language`: `auto` (Standard; folgt der `language`-Einstellung von Claude Code, dann dem System-Locale), `de` oder `en`.

## Lizenz

MIT
