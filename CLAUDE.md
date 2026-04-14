# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

MultiTab Snooze is a Chrome Extension (Manifest V3) that lets users snooze browser tabs for later. It's built with React + Vite + crxjs, using Flow for type annotations. The extension was forked from csandapp/tab-snooze-extension-continued and renamed. Neither the upstream repo nor its ancestor had licenses, so publishing is on hold and the extension is kept local for now.

## Commands

```bash
# Development (watch mode, builds to ./build/)
npm run dev

# Production build
npm run build

# Run all tests
npm test

# Run a single test file
npx vitest run src/__tests__/snoozeTabsBatch.test.js

# Lint
npm run lint

# Flow type check
npm run flow:check
```

After `npm run dev` or `npm run build`, load `./build/` as an unpacked extension in Chrome.

## Architecture

### Extension Entry Points

The extension uses a single-page React app (`index.html`) for all UI surfaces — popup, options, dialogs — differentiated by hash routing via `react-router-dom`:

- **Popup** (`index.html#popup`) — `SnoozePanel` component, shown when clicking toolbar icon
- **Options** (`index.html#options/*`) — `OptionsPage`, sleeping tabs list, settings
- **Dialogs** — first-snooze, tutorial, whats-new, support — opened as centered windows via `chrome.windows.create`
- **Background Service Worker** — `src/core/backgroundMain.js`, registered in manifest as `src/core/backgroundMain.js`
- **Offscreen Document** — `offscreen.html` / `src/core/offscreen.js`, created on-demand for audio playback (Chrome MV3 requires this for audio in service workers)

### Core Business Logic (`src/core/`)

| File | Responsibility |
|------|---------------|
| `snooze.js` | `snoozeTab`, `snoozeTabsBatch`, `repeatLastSnooze`, `resnoozePeriodicTab` |
| `wakeup.js` | Alarm scheduling, `handleScheduledWakeup`, wakeup lifecycle |
| `storage.js` | `getSnoozedTabs`/`addSnoozedTabs`/`removeSnoozedTabs` with a promise-chain mutex for serialized writes |
| `backgroundMain.js` | Service worker bootstrap — registers all Chrome event listeners, `ensureOffscreenDocument` |
| `settings.js` | User preferences (stored in `chrome.storage.local`) |
| `license.js` | Weekly usage tracking (free tier limit enforcement) |
| `badge.js` | Extension badge counter |
| `utils.js` | `createTab`, `createCenteredWindow`, `calcNextOccurrenceForPeriod`, etc. |
| `messages.js` | Message type constants for popup↔SW communication |
| `commands.js` | Keyboard command constants |

### Key Data Flow

**Snoozing tabs (popup → service worker):**
The popup calls `chrome.runtime.sendMessage({ action: MSG_SNOOZE_TABS, tabs, config })` — it does NOT call `snoozeTabsBatch` directly. The service worker is the sole writer to `snoozedTabs` storage. This pattern exists because `getActiveTab()` doesn't work in SW context; the popup must gather tab info and send it.

**Wakeup flow:**
`chrome.alarms` fires → `handleScheduledWakeup()` → `wakeupDeleteAndReschedule()`:
1. Open tabs first (prevents data loss on crash)
2. Delete successfully-opened tabs from storage
3. Reschedule periodic tabs
4. Schedule next alarm

There's also a 10-minute keepalive alarm and `chrome.idle.onStateChanged` as safety nets for missed alarms after sleep.

### Flow Types

Files with `// @flow` use Flow type annotations. The Vite build uses `esbuild-plugin-flow` + a custom `stripFlow` Babel plugin (`vite.config.js`) to strip them — crxjs needs Flow stripped before its internal Rollup pass. Flow type stubs live in `flow-typed/`.

### Build Output

Builds to `./build/`. `minify: false` is intentional (Chrome Web Store review requirement). The `@crxjs/vite-plugin` handles most of the MV3 wiring; the manual `rollupOptions.input` for `offscreen` places that script in `assets/offscreen.js`.

### Testing

Tests use Vitest + jsdom. Chrome APIs are globally mocked in `src/__tests__/setupTests.js`. Tests mock `src/core/*` modules with `vi.mock()` — the test suite exercises pure logic without a real browser. Test files live in `src/__tests__/`.
