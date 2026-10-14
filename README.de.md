# claude-mods: Claude-Code-Mods

**Mods für [Claude Code](https://code.claude.com): eine Statusleiste über dem Prompt mit Prompt-Cache-Countdown, Kontext-Füllung, Nutzungslimits und Sitzungskosten.**

[English](README.md) | Deutsch

Wenn dir das nützt, hilft ein ⭐ auf dem Repo, dass andere es finden.

| Mod | Was er macht |
|---|---|
| [session-status](session-status) | Leiste über dem Prompt: Prompt-Cache-Countdown, Kontext-Füllung, Nutzungslimits (5 Stunden und Woche), Sitzungskosten, Compact-Button |

![session-status: Claude-Code-Leiste über dem Prompt mit Prompt-Cache-Countdown, Kontext-Füllung, 5-Stunden- und Wochenlimit, Sitzungskosten und Compact-Button](assets/session-status.png)

## Installation

Voraussetzung: ein Claude-Code-Build mit Mod-Unterstützung (Function Hooks). Entwickelt gegen 2.1.295.

**Oder sag es einfach Claude** in einem beliebigen Claude-Code-Chat, auch in der Desktop-App:

> Installiere das Plugin session-status aus https://github.com/sphings79/claude-mods für alle meine Sessions (User-Scope).

Claude fügt den Marketplace hinzu und installiert das Plugin für dich. Den Code kannst du vorher lesen, es sind ein paar hundert Zeilen.

**In einer Claude-Code-Terminal-Sitzung:**

```
/plugin install session-status --marketplace sphings79/claude-mods
```

Mit `y` den Marketplace hinzufügen und einen Scope wählen. Der **User**-Scope lädt ihn in jeder Sitzung.

**Oder in der Shell:**

```sh
claude plugin marketplace add sphings79/claude-mods
claude plugin install session-status@claude-mods
```

Kein SSH-Key für GitHub eingerichtet? Dann den Marketplace über HTTPS hinzufügen:

```sh
claude plugin marketplace add https://github.com/sphings79/claude-mods.git
claude plugin install session-status@claude-mods
```

**Danach laden:** Claude Code neu starten oder `/reload-plugins` ausführen. Die Leiste erscheint nach der ersten Antwort einer Sitzung.

**Desktop-App:** `/plugin install` gibt es im Code-Tab nicht. Im Terminal im User-Scope installieren, dann lädt der Mod auch in Desktop-Sitzungen.

**Aktualisieren / entfernen:**

```sh
claude plugin update session-status@claude-mods
claude plugin uninstall session-status@claude-mods
```

## session-status

```
Cache    60m ■■■■■■■■■■■■■■■■■■■■ (184k Token)                  [Compact]
Kontext  19% ■■■■□□□□□□□□□□□□□□□□ (Auto-Compact 97%)
Limits   5h 23% (14:30)  Woche 41% (Mo 09:00)               ($1.23)
```

- **Cache**: Minuten, die der 1-Stunden-Prompt-Cache seit der letzten Antwort noch hat. Der Balken zeigt die Restzeit: grün, bei 20 min Amber, bei 10 min Rot, `abgelaufen` wenn er weg ist. Hinter dem Balken: wie viele Token im Cache liegen (gelesen plus geschrieben von der letzten Antwort).
- **Kontext**: Zahl und Balken nach Füllung, grün, ab 60 % Amber, ab 80 % Rot.
- **Auto-Compact**: Schwelle, bei der Claude Code von selbst komprimiert, in Prozent des Fensters.
- **Limits**: Auslastung des 5-Stunden- und des Wochenfensters mit Reset-Zeit, auch das Spend-Limit eines Gateways. Die Farben folgen den Kontext-Schwellen. Erscheint, sobald die letzte Antwort sie gemeldet hat.
- **Kosten** (unten rechts, in Klammern): bisherige Sitzungskosten wie bei `/cost`. Mit Abo ist das eine API-Äquivalent-Schätzung, keine Rechnung.
- **Compact** (oben rechts): führt `/compact` aus. Nicht, solange eine Antwort läuft.
- **`/session-status`** blendet die Leiste ein oder aus.

### Sprache

Option `language`: `auto` (Standard; folgt der `language`-Einstellung von Claude Code, dann dem System-Locale), `de` oder `en`. Einstellbar in `/config` oder in `~/.claude/settings.json`:

```json
{ "pluginConfigs": { "session-status": { "options": { "language": "de" } } } }
```

> **Hinweis:** Die Claude-Desktop-App übergibt Mods weder eine Spracheinstellung noch `LANG`, daher fällt `auto` dort oft auf Englisch zurück, auch auf einem deutschen System. Dann `language` ausdrücklich setzen (oben). `/session-status lang` zeigt, was die Erkennung gesehen hat.

## Unterstützen

Kostenlos und MIT-lizenziert. Wenn es dir Tokens oder Zeit spart, kannst du mir [einen Kaffee spendieren](https://buymeacoffee.com/sphings). Mehr auf [sphings-dev.de](https://sphings-dev.de).

## Lizenz

MIT
