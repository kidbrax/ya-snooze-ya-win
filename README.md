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
npm run build
```

Load unpacked on chrome browser

## Release

To create a new release, first make sure the CHANGELOG.md is updated and then run the `gh pr creaete` command below. The PR Action will cut the Github release and publish it automatically. FIrst, it will bump the version in package.json and in the manifest.json.

To create the pull request:

```shell
gh pr create \
  --base main \
  --body $pr_message \
  --label patch # or major? minor?
  --title 'updating name throughout and other cleanup'
```


## Links

- [Chrome Web Store](https://chromewebstore.google.com/detail/ya-snooze-ya-win/gkllapkgbpaichomaefmmpdebcocpeeg)
- [Chrome Web Store](https://chromewebstore.google.com/detail/ya-snooze-ya-win/gkllapkgbpaichomaefmmpdebcocpeeg)
- [Leave a Review](https://chromewebstore.google.com/detail/ya-snooze-ya-win/gkllapkgbpaichomaefmmpdebcocpeeg/reviews)
- [GitHub Repository](https://github.com/csandapp/tab-snooze-extension-continued)
- [Support the Current Developer](https://ko-fi.com/csandapp)
- [Support the Original Developer](https://www.paypal.com/cgi-bin/webscr?cmd=_donations&business=82HLJCDURLVME&currency_code=USD&source=url)
- [Contact](mailto:csandapp@gmail.com)

## TODO

- use Node 24
- add auto-deploy on merge to main/master
- re-implement bugsnag?
- test release action
- auto-version, update package.json, manifest, etc
- ensure all tests are passing again and add to github actions
