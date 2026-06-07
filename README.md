# Ya Snooze, Ya Win

A Chrome extension that lets you temporarily "snooze" browser tabs — hiding them and automatically reopening them at a scheduled time. Never lose track of tabs you want to revisit later.

## Install

[**Get Ya Snooze, Ya Win on the Chrome Web Store**](https://chromewebstore.google.com/detail/ya-snooze-ya-win/gkllapkgbpaichomaefmmpdebcocpeeg)

## Features

- **Snooze tabs** to hide them now and have them reopen automatically later
- **One-time and recurring schedules** — snooze until tomorrow morning, next week, or on a custom recurring schedule
- **Snoozed tabs dashboard** to view and manage all your snoozed tabs
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
```

**Production build** (uses `public/manifest.json`):
```bash
npm run build
```

**Development build** (uses `public/manifest.dev.json` — separate extension ID so it runs alongside the production extension):
```bash
npm run build:dev
```

Load the `build/` folder as an unpacked extension in Chrome via `chrome://extensions` → "Load unpacked".

## Release

To create a new release, first make sure the CHANGELOG.md is updated and then run `scripts/release.sh`. This will create a PR and the PR Action will bump the version in package.json and in the manifest.json. Then it will cut the Github release and publish it automatically.

To create the pull request:

## Links

- [Chrome Web Store](https://chromewebstore.google.com/detail/ya-snooze-ya-win/gkllapkgbpaichomaefmmpdebcocpeeg)
- [Leave a Review](https://chromewebstore.google.com/detail/ya-snooze-ya-win/gkllapkgbpaichomaefmmpdebcocpeeg/reviews)
- [GitHub Repository](https://github.com/csandapp/tab-snooze-extension-continued)
- [Support me](https://ko-fi.com/kidbrax)
- [Support the next Developer](https://ko-fi.com/csandapp)
- [Support the Original Developer](https://www.paypal.com/cgi-bin/webscr?cmd=_donations&business=82HLJCDURLVME&currency_code=USD&source=url)
- [Contact](mailto:support@braxtonbeyer.com)

## TODO

- add React component tests (SnoozePanel, OptionsPage, dialogs)
- add more core logic tests (snooze.js, wakeup.js, calcSnoozeOptions.js)
- use Node 24
- re-implement bugsnag?
- change alert style (optional)
- replace images
  - public/images/extension_icon_128.png
  - src/components/OptionsPage/images/navbar_logo.svg
  - src/components/dialogs/images/congrats.png
  - src/components/dialogs/images/logo.svg
