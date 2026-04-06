# MultiTab Snooze

A Chrome extension that lets you temporarily "snooze" browser tabs — hiding them and automatically reopening them at a scheduled time. Supports snoozing multiple highlighted tabs at once.

## Features

- **Snooze tabs** to hide them now and have them reopen automatically later
- **Multi-tab snoozing** — snooze all highlighted tabs in one action
- **One-time and recurring schedules** — snooze until tomorrow morning, next week, or on a custom recurring schedule
- **Snoozed tabs dashboard** to view and manage all your snoozed tabs
- **Todo management** built into the extension
- **Keyboard shortcuts** for quick snoozing
- **Audio notifications** when snoozed tabs wake up

## Architecture

Manifest V3 extension built around a Service Worker background script.

| Layer | Description |
|---|---|
| `src/core/backgroundMain.js` | Service Worker — lifecycle, alarms, keyboard commands |
| `src/core/snooze.js` / `wakeup.js` | Core snooze/wake logic |
| `src/core/storage.js` | `chrome.storage.local` abstraction |
| `src/components/SnoozePanel/` | Main popup UI |
| `src/components/OptionsPage/` | Settings + snoozed tab management |
| `public/offscreen.html` | Isolated document for audio playback (Service Workers have no DOM) |

**Chrome APIs used:** tabs, alarms, storage, offscreen, commands, notifications, activeTab, idle

## Tech Stack

| Category | Technology |
|---|---|
| Build Tool | Vite + @crxjs/vite-plugin |
| UI Framework | React 18 |
| Routing | React Router DOM |
| Component Library | Material UI (MUI) + Emotion |
| Styling | Styled Components |
| Date/Time | moment.js + React Day Picker |
| Type Checking | Flow |
| Testing | Vitest + Testing Library |
| Linting | ESLint |

## Development

```bash
npm install
npm run dev       # build + watch mode — rebuilds on every file save
```

Then in Chrome:
1. Go to `chrome://extensions` and enable **Developer mode**
2. Click **Load unpacked** and select the `build/` folder
3. After each rebuild, click ↻ on the extension card to reload it

**Run tests:**
```bash
npm test
```

Tests run automatically as a pre-commit hook.

## Publishing & Licensing

### Personal use

No extra steps needed. Load the `build/` folder as an unpacked extension in Chrome and it works indefinitely. Copyright law doesn't restrict personal use.

### Going public

**Hardening checklist:**

| Area | What's needed |
|---|---|
| Icons | Replace all images in `public/images/` with original artwork |
| Links | Update or remove original developer links in `README.md` and `src/paths.js` |
| Permissions | Tighten `web_accessible_resources` in `manifest.json` — currently exposes `**/*` |
| Error tracking | Wire up your own Bugsnag/Sentry account (infrastructure removed, easy to re-add) |
| Privacy policy | Required by Chrome Web Store if you collect any data |
| Store listing | Screenshots, description, $5 one-time developer registration fee |

### License situation

This codebase has no open-source license. The chain of custody:

| Author | Role | License |
|---|---|---|
| Eyal Wiener (`eyalwiener@gmail.com`) | Original author, built Tab Snooze as a commercial extension | None — no public source ever released |
| csandapp (`csandapp@gmail.com`) | Continued the extension on GitHub | None |
| Various contributors | MV3 migration, wakeup fixes, multi-tab support | None |

Without an explicit license, all rights are reserved by the original authors. Publishing on the Chrome Web Store as-is carries legal risk.

**Options if you want to go public:**

| Goal | Path |
|---|---|
| Safe path | Contact `csandapp@gmail.com` and `eyalwiener@gmail.com` and ask for a license grant |
| Pragmatic path | Rewrite enough core code that the work is substantially original |
| Clean slate | Build a new extension using this as a behavioral reference, not a code base |

## Links

- [Upstream Repository](https://github.com/csandapp/tab-snooze-extension-continued)