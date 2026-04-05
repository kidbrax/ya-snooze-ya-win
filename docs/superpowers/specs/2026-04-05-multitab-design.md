# Multi-Tab Snooze Design

**Date:** 2026-04-05  
**Branch:** multitab  
**Status:** Approved

## Overview

Extend the Tab Snooze extension to snooze multiple tabs at once. The first-class use case is snoozing all tabs in the current window in one action. Snoozing a set of highlighted (Ctrl/Cmd+clicked) tabs is also supported. A toggle in the popup header allows falling back to single-tab mode.

---

## Tab Selection Logic

On popup open, the popup queries two things in parallel:

1. `chrome.tabs.query({ highlighted: true, currentWindow: true })` — highlighted tabs
2. `chrome.tabs.query({ currentWindow: true })` — all tabs in window

**Mode determination** (evaluated on load and on toggle change):

- If `singleTabMode` setting is `true` → target = `[activeTab]`
- Else if `highlightedTabs.length > 1` → target = highlighted tabs (auto-detected Chrome multi-select)
- Else → target = all tabs in window (default)

**Filtering:** Remove tabs with URLs starting with `chrome://`, `chrome-extension://`, `about:`, or `edge://` from the target list before snoozing. These tabs are silently skipped.

The current tab (the one the popup is open on) is included in the target set and will be snoozed and closed.

---

## UI Changes

### Header

The popup header gains:

1. **Tab count / mode toggle** — displays "X tabs" (count of tabs to be snoozed) in default multi-tab mode, or "This tab" in single-tab mode. Clicking toggles between the two modes. Toggle state is persisted via `singleTabMode` in settings.

2. **Hint text** — a subtle line below the toggle: "Ctrl+click tabs to snooze a selection"

### Snooze grid

No changes. The selected snooze time applies to whichever tab set is currently targeted.

---

## Message Protocol

New constant in `src/core/messages.js`:

```js
export const MSG_SNOOZE_TABS = 'SNOOZE_TABS'; // batch, plural
```

Popup → service worker payload:

```js
{
  action: MSG_SNOOZE_TABS,
  tabs: [{ url, title, favIconUrl }, ...],  // pre-filtered, ready to snooze
  config: { type, wakeupTime?, period?, closeTab: false }
}
```

The service worker returns `{ success: true }` on completion. Tab closing stays in the popup: after SW confirms, the popup calls `chrome.tabs.remove([...tabIds])` then `window.close()`.

---

## Service Worker Changes

**`src/core/snooze.js`** — new `snoozeTabsBatch(tabs, config)`:

- Resolves `wakeupTime` from period if needed (same logic as `snoozeTab`)
- Builds the full `SnoozedTab[]` array from the input tabs
- Calls `addSnoozedTabs(allSnoozedTabs)` **once** (atomic, avoids N redundant writes)
- Calls `scheduleWakeupAlarm('auto')` **once**
- Updates `totalSnoozeCount` by `tabs.length`
- Shows first-snooze dialog if this batch crosses the count=1 threshold

**`src/core/backgroundMain.js`** — adds handler for `MSG_SNOOZE_TABS`:

```js
if (message.action === MSG_SNOOZE_TABS) {
  const { tabs, config } = message;
  snoozeTabsBatch(tabs, config)
    .then(() => sendResponse({ success: true }))
    .catch(error => sendResponse({ success: false, error: error.message }));
  return true;
}
```

---

## Popup Changes

**`src/components/SnoozePanel/SnoozePanel.jsx`**:

- On mount: query all tabs + highlighted tabs in parallel, compute target set, store in state
- `singleTabMode` read from settings on load; toggle writes it back via `saveSettings`
- `delayedSnoozeActiveTab` replaced by `delayedSnoozeTabs(tabs, config)`:
  - Popup keeps full `ChromeTab[]` objects in state (needed for `tab.id` when closing)
  - Sends `MSG_SNOOZE_TABS` with tabs stripped to `{ url, title, favIconUrl }` — IDs are not sent to or needed by the SW
  - On SW confirmation, calls `chrome.tabs.remove(tabs.map(t => t.id))` then `window.close()`
  - On failure, keeps all tabs open and closes popup
- Header renders toggle label + hint text

**`src/core/settings.js`**:

- Add `singleTabMode: false` to `DEFAULT_SETTINGS`

---

## Files Changed

| File | Change |
|------|--------|
| `src/core/messages.js` | Add `MSG_SNOOZE_TABS` constant |
| `src/core/snooze.js` | Add `snoozeTabsBatch()` |
| `src/core/backgroundMain.js` | Add `MSG_SNOOZE_TABS` handler |
| `src/components/SnoozePanel/SnoozePanel.jsx` | Tab selection logic, toggle UI, batch snooze flow |
| `src/core/settings.js` | Add `singleTabMode: false` to defaults |

No other files need to change.
