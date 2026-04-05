# Multi-Tab Snooze Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Enable the popup to snooze all tabs in the current window (or a highlighted selection) at once, with a toggle to fall back to single-tab mode.

**Architecture:** A new `MSG_SNOOZE_TABS` message carries a full tab array from the popup to the service worker, which calls `addSnoozedTabs` and `scheduleWakeupAlarm` once for the entire batch. Tab selection logic (filtering unsnoozable URLs, determining the target set) is extracted into a pure-function module so it can be tested independently from the React component.

**Tech Stack:** React 18, Flow types, Vitest, Chrome MV3 Service Worker, `chrome.storage.local`, `chrome.tabs` API.

---

## File Map

| File | Change |
|------|--------|
| `src/core/messages.js` | Add `MSG_SNOOZE_TABS` constant |
| `src/core/settings.js` | Add `singleTabMode: false` to `DEFAULT_SETTINGS` |
| `src/custom-flow-defenitions/tabSnoozeFlowDefs.js` | Add `singleTabMode: boolean` to `Settings` exact type |
| `src/core/tabSelection.js` | **New** — pure functions: `filterSnoozableTabs`, `getTargetTabs` |
| `src/__tests__/tabSelection.test.js` | **New** — unit tests for tabSelection.js |
| `src/core/snooze.js` | Add `snoozeTabsBatch(tabs, config)` |
| `src/__tests__/snoozeTabsBatch.test.js` | **New** — unit tests for snoozeTabsBatch |
| `src/core/backgroundMain.js` | Add `MSG_SNOOZE_TABS` message handler |
| `src/components/SnoozePanel/SnoozePanel.jsx` | Tab queries on mount, toggle state, header UI, batch snooze call |

---

### Task 1: Add MSG_SNOOZE_TABS message constant

**Files:**
- Modify: `src/core/messages.js`

- [ ] **Step 1: Add the constant**

Open `src/core/messages.js` and add one line:

```js
// @flow

// Message action types for chrome.runtime.sendMessage communication.
// Used by popup/options → service worker, and SW → offscreen document.
export const MSG_SNOOZE_TAB = 'snoozeTab';
export const MSG_SNOOZE_TABS = 'snoozeTabs';
export const MSG_DELETE_SNOOZED_TABS = 'deleteSnoozedTabs';
export const MSG_PLAY_AUDIO = 'playAudio';
```

- [ ] **Step 2: Commit**

```bash
git add src/core/messages.js
git commit -m "feat: add MSG_SNOOZE_TABS message constant"
```

---

### Task 2: Add singleTabMode to Settings type and defaults

**Files:**
- Modify: `src/custom-flow-defenitions/tabSnoozeFlowDefs.js`
- Modify: `src/core/settings.js`

- [ ] **Step 1: Add singleTabMode to the Settings Flow type**

In `src/custom-flow-defenitions/tabSnoozeFlowDefs.js`, add `singleTabMode` to the `Settings` exact object type. The `Settings` type currently ends with:

```js
  // Support reminders
  showSupportReminders: true,
  lastSupportReminderDate: 0,
```

Wait — the type declaration in the flow defs does not include `showSupportReminders`. Looking at the actual `Settings` type:

```js
declare type Settings = {|
  // General
  badge: 'hidden' | 'due_today' | 'total_snoozed',
  playSoundEffects: boolean,
  playNotificationSound: boolean,
  showNotifications: boolean,

  // Time preference
  laterTodayHoursDelta: number,
  somedayMonthsDelta: number,
  weekEndDay: number,
  weekStartDay: number,
  workdayEnd: number,
  workdayStart: number,

  // General data
  version: number,
  totalSnoozeCount: number,
  installDate: number,
  weeklyUsage: {
    weekNumber: number,
    usageCount: number,
  },
|};
```

Replace that entire `declare type Settings` block with:

```js
declare type Settings = {|
  // General
  badge: 'hidden' | 'due_today' | 'total_snoozed',
  playSoundEffects: boolean,
  playNotificationSound: boolean,
  showNotifications: boolean,

  // Time preference
  laterTodayHoursDelta: number,
  somedayMonthsDelta: number,
  weekEndDay: number,
  weekStartDay: number,
  workdayEnd: number,
  workdayStart: number,

  // General data
  version: number,
  totalSnoozeCount: number,
  installDate: number,
  weeklyUsage: {
    weekNumber: number,
    usageCount: number,
  },

  // Multi-tab snooze
  singleTabMode: boolean,
|};
```

- [ ] **Step 2: Add singleTabMode to DEFAULT_SETTINGS**

In `src/core/settings.js`, add `singleTabMode: false` to `DEFAULT_SETTINGS`. The object currently ends with:

```js
  // Support reminders
  showSupportReminders: true,
  lastSupportReminderDate: 0,
};
```

Add the new key so it reads:

```js
  // Support reminders
  showSupportReminders: true,
  lastSupportReminderDate: 0,

  // Multi-tab snooze
  singleTabMode: false,
};
```

- [ ] **Step 3: Commit**

```bash
git add src/custom-flow-defenitions/tabSnoozeFlowDefs.js src/core/settings.js
git commit -m "feat: add singleTabMode to Settings type and defaults"
```

---

### Task 3: Extract and test tab selection logic

**Files:**
- Create: `src/core/tabSelection.js`
- Create: `src/__tests__/tabSelection.test.js`

- [ ] **Step 1: Write the failing tests**

Create `src/__tests__/tabSelection.test.js`:

```js
import { describe, it, expect } from 'vitest';
import { filterSnoozableTabs, getTargetTabs } from '../core/tabSelection';

describe('filterSnoozableTabs', () => {
  it('keeps regular http/https tabs', () => {
    const tabs = [{ id: 1, url: 'https://example.com', title: 'Example', favIconUrl: '' }];
    expect(filterSnoozableTabs(tabs)).toEqual(tabs);
  });

  it('removes chrome:// tabs', () => {
    const tabs = [
      { id: 1, url: 'chrome://newtab', title: 'New Tab', favIconUrl: '' },
      { id: 2, url: 'https://example.com', title: 'Example', favIconUrl: '' },
    ];
    expect(filterSnoozableTabs(tabs)).toEqual([
      { id: 2, url: 'https://example.com', title: 'Example', favIconUrl: '' },
    ]);
  });

  it('removes chrome-extension:// tabs', () => {
    const tabs = [{ id: 1, url: 'chrome-extension://abc/index.html', title: 'Ext', favIconUrl: '' }];
    expect(filterSnoozableTabs(tabs)).toEqual([]);
  });

  it('removes about: tabs', () => {
    const tabs = [{ id: 1, url: 'about:blank', title: 'Blank', favIconUrl: '' }];
    expect(filterSnoozableTabs(tabs)).toEqual([]);
  });

  it('removes edge:// tabs', () => {
    const tabs = [{ id: 1, url: 'edge://newtab', title: 'New Tab', favIconUrl: '' }];
    expect(filterSnoozableTabs(tabs)).toEqual([]);
  });

  it('removes tabs with no url', () => {
    const tabs = [{ id: 1, url: undefined, title: 'No URL', favIconUrl: '' }];
    expect(filterSnoozableTabs(tabs)).toEqual([]);
  });
});

describe('getTargetTabs', () => {
  const allTabs = [
    { id: 1, url: 'https://a.com', title: 'A', favIconUrl: '' },
    { id: 2, url: 'https://b.com', title: 'B', favIconUrl: '' },
    { id: 3, url: 'https://c.com', title: 'C', favIconUrl: '' },
  ];
  const activeTab = allTabs[0];
  const highlightedTwo = [allTabs[0], allTabs[1]];
  const highlightedOne = [allTabs[0]];

  it('returns only activeTab when singleTabMode is true', () => {
    expect(getTargetTabs(allTabs, highlightedTwo, true, activeTab)).toEqual([activeTab]);
  });

  it('returns highlighted tabs when multiple are highlighted and not in single mode', () => {
    expect(getTargetTabs(allTabs, highlightedTwo, false, activeTab)).toEqual(highlightedTwo);
  });

  it('returns all tabs when only one tab is highlighted (normal single-active mode)', () => {
    expect(getTargetTabs(allTabs, highlightedOne, false, activeTab)).toEqual(allTabs);
  });

  it('singleTabMode overrides multi-highlight', () => {
    expect(getTargetTabs(allTabs, highlightedTwo, true, activeTab)).toEqual([activeTab]);
  });
});
```

- [ ] **Step 2: Run tests to confirm they fail**

```bash
npx vitest run src/__tests__/tabSelection.test.js
```

Expected: FAIL — "Cannot find module '../core/tabSelection'"

- [ ] **Step 3: Create tabSelection.js**

Create `src/core/tabSelection.js`:

```js
// @flow

const UNSNOOZABLE_PREFIXES = [
  'chrome://',
  'chrome-extension://',
  'about:',
  'edge://',
];

/**
 * Returns only the tabs that can be snoozed (have a regular URL).
 * chrome://, chrome-extension://, about:, and edge:// tabs cannot be closed
 * programmatically by extensions, so they are silently excluded.
 */
export function filterSnoozableTabs(tabs: Array<ChromeTab>): Array<ChromeTab> {
  return tabs.filter(
    tab => tab.url && !UNSNOOZABLE_PREFIXES.some(prefix => tab.url.startsWith(prefix))
  );
}

/**
 * Determines which tabs should be snoozed based on the current mode.
 *
 * Priority:
 *   1. singleTabMode=true  → only the active tab
 *   2. highlightedTabs.length > 1  → the user's Ctrl+click selection
 *   3. otherwise  → all tabs in the window (first-class default)
 */
export function getTargetTabs(
  allTabs: Array<ChromeTab>,
  highlightedTabs: Array<ChromeTab>,
  singleTabMode: boolean,
  activeTab: ChromeTab
): Array<ChromeTab> {
  if (singleTabMode) {
    return [activeTab];
  }
  if (highlightedTabs.length > 1) {
    return highlightedTabs;
  }
  return allTabs;
}
```

- [ ] **Step 4: Run tests to confirm they pass**

```bash
npx vitest run src/__tests__/tabSelection.test.js
```

Expected: All tests PASS.

- [ ] **Step 5: Commit**

```bash
git add src/core/tabSelection.js src/__tests__/tabSelection.test.js
git commit -m "feat: add tab selection logic with tests"
```

---

### Task 4: Add snoozeTabsBatch() to snooze.js

**Files:**
- Modify: `src/core/snooze.js`
- Create: `src/__tests__/snoozeTabsBatch.test.js`

- [ ] **Step 1: Write the failing tests**

Create `src/__tests__/snoozeTabsBatch.test.js`:

```js
import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('../core/storage', () => ({
  addSnoozedTabs: vi.fn().mockResolvedValue(undefined),
  getSnoozedTabs: vi.fn().mockResolvedValue([]),
}));

vi.mock('../core/wakeup', () => ({
  scheduleWakeupAlarm: vi.fn().mockResolvedValue(undefined),
}));

vi.mock('../core/settings', () => ({
  getSettings: vi.fn().mockResolvedValue({ totalSnoozeCount: 5 }),
  saveSettings: vi.fn().mockResolvedValue(undefined),
}));

vi.mock('../core/license', () => ({
  incrementWeeklyUsage: vi.fn().mockResolvedValue(undefined),
}));

vi.mock('../core/utils', () => ({
  createCenteredWindow: vi.fn(),
  calcNextOccurrenceForPeriod: vi.fn(),
}));

import { snoozeTabsBatch } from '../core/snooze';
import { addSnoozedTabs } from '../core/storage';
import { scheduleWakeupAlarm } from '../core/wakeup';
import { getSettings, saveSettings } from '../core/settings';
import { incrementWeeklyUsage } from '../core/license';
import { createCenteredWindow } from '../core/utils';

const TWO_TABS = [
  { url: 'https://a.com', title: 'A', favicon: '' },
  { url: 'https://b.com', title: 'B', favicon: '' },
];
const FUTURE_TIME = Date.now() + 60_000;

describe('snoozeTabsBatch', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    getSettings.mockResolvedValue({ totalSnoozeCount: 5 });
    saveSettings.mockResolvedValue(undefined);
    addSnoozedTabs.mockResolvedValue(undefined);
    scheduleWakeupAlarm.mockResolvedValue(undefined);
    incrementWeeklyUsage.mockResolvedValue(undefined);
  });

  it('calls addSnoozedTabs once with all tabs mapped to SnoozedTab shape', async () => {
    await snoozeTabsBatch(TWO_TABS, { type: 'later_today', wakeupTime: FUTURE_TIME });

    expect(addSnoozedTabs).toHaveBeenCalledTimes(1);
    const stored = addSnoozedTabs.mock.calls[0][0];
    expect(stored).toHaveLength(2);
    expect(stored[0]).toMatchObject({ url: 'https://a.com', title: 'A', type: 'later_today', when: FUTURE_TIME });
    expect(stored[1]).toMatchObject({ url: 'https://b.com', title: 'B', type: 'later_today', when: FUTURE_TIME });
  });

  it('calls scheduleWakeupAlarm exactly once regardless of tab count', async () => {
    const threeTabs = [...TWO_TABS, { url: 'https://c.com', title: 'C', favicon: '' }];
    await snoozeTabsBatch(threeTabs, { type: 'later_today', wakeupTime: FUTURE_TIME });
    expect(scheduleWakeupAlarm).toHaveBeenCalledTimes(1);
  });

  it('increments totalSnoozeCount by the number of tabs', async () => {
    getSettings.mockResolvedValue({ totalSnoozeCount: 3 });
    await snoozeTabsBatch(TWO_TABS, { type: 'later_today', wakeupTime: FUTURE_TIME });
    expect(saveSettings).toHaveBeenCalledWith(expect.objectContaining({ totalSnoozeCount: 5 }));
  });

  it('calls incrementWeeklyUsage once (one user action, not N)', async () => {
    await snoozeTabsBatch(TWO_TABS, { type: 'later_today', wakeupTime: FUTURE_TIME });
    expect(incrementWeeklyUsage).toHaveBeenCalledTimes(1);
  });

  it('shows first-snooze dialog when this batch is the first snooze ever', async () => {
    getSettings.mockResolvedValue({ totalSnoozeCount: 0 });
    await snoozeTabsBatch(TWO_TABS, { type: 'later_today', wakeupTime: FUTURE_TIME });
    expect(createCenteredWindow).toHaveBeenCalledTimes(1);
  });

  it('does not show first-snooze dialog when prior snoozes exist', async () => {
    getSettings.mockResolvedValue({ totalSnoozeCount: 3 });
    await snoozeTabsBatch(TWO_TABS, { type: 'later_today', wakeupTime: FUTURE_TIME });
    expect(createCenteredWindow).not.toHaveBeenCalled();
  });

  it('throws when neither wakeupTime nor period is given', async () => {
    await expect(
      snoozeTabsBatch(TWO_TABS, { type: 'later_today' })
    ).rejects.toThrow('No wakeup date and no period given');
  });
});
```

- [ ] **Step 2: Run tests to confirm they fail**

```bash
npx vitest run src/__tests__/snoozeTabsBatch.test.js
```

Expected: FAIL — "snoozeTabsBatch is not a function" (or similar export error).

- [ ] **Step 3: Add snoozeTabsBatch to snooze.js**

Open `src/core/snooze.js`. Add the import for `createCenteredWindow` (it's not currently imported there) and add the new export. The import block at the top currently reads:

```js
import { addSnoozedTabs, getSnoozedTabs } from './storage';
import {
  getActiveTab,
  calcNextOccurrenceForPeriod,
  getRecentlySnoozedTab,
  createCenteredWindow,
} from './utils';
```

`createCenteredWindow` is already imported. Now add `snoozeTabsBatch` at the end of the file, before the closing line:

```js
/**
 * Snooze a batch of tabs atomically: one storage write, one alarm schedule.
 * tabs is an array of { url, title, favicon } — the same shape the popup
 * strips from ChromeTab before sending to the service worker.
 */
export async function snoozeTabsBatch(
  tabs: Array<{ url: string, title: string, favicon: string }>,
  config: SnoozeConfig
) {
  let { wakeupTime, period, type } = config;

  if (period) {
    const nextOccurrenceDate = calcNextOccurrenceForPeriod(period);
    wakeupTime = nextOccurrenceDate.getTime();
  }

  if (!wakeupTime) {
    throw new Error('No wakeup date and no period given');
  }

  console.log(
    `Snoozing ${tabs.length} tab(s) until ${new Date(wakeupTime).toString()}`
  );

  const sleepStart = Date.now();
  const snoozedTabs: Array<SnoozedTab> = tabs.map(tab => ({
    url: tab.url,
    title: tab.title,
    favicon: tab.favicon,
    type,
    sleepStart,
    period,
    when: wakeupTime,
  }));

  // One atomic write + one alarm reschedule for the whole batch
  await addSnoozedTabs(snoozedTabs);
  await scheduleWakeupAlarm('auto');

  let { totalSnoozeCount } = await getSettings();
  const wasFirstSnooze = totalSnoozeCount === 0;
  totalSnoozeCount += tabs.length;
  await saveSettings({ totalSnoozeCount });

  // Count as one user action, not N
  await incrementWeeklyUsage();

  if (wasFirstSnooze) {
    createCenteredWindow(FIRST_SNOOZE_PATH, 830, 485);
  }
}
```

- [ ] **Step 4: Run tests to confirm they pass**

```bash
npx vitest run src/__tests__/snoozeTabsBatch.test.js
```

Expected: All tests PASS.

- [ ] **Step 5: Commit**

```bash
git add src/core/snooze.js src/__tests__/snoozeTabsBatch.test.js
git commit -m "feat: add snoozeTabsBatch with tests"
```

---

### Task 5: Wire MSG_SNOOZE_TABS handler in the service worker

**Files:**
- Modify: `src/core/backgroundMain.js`

- [ ] **Step 1: Add the import and handler**

In `src/core/backgroundMain.js`, update the import at the top of the file:

```js
import { repeatLastSnooze, snoozeTab, snoozeTabsBatch } from './snooze';
import { MSG_SNOOZE_TAB, MSG_SNOOZE_TABS, MSG_DELETE_SNOOZED_TABS } from './messages';
```

Then in the `chrome.runtime.onMessage.addListener` callback, add the new handler block immediately after the existing `MSG_SNOOZE_TAB` block:

```js
    if (message.action === MSG_SNOOZE_TABS) {
      const { tabs, config } = message;
      console.log(`📨 [SW] Received snoozeTabsBatch message for ${tabs?.length} tab(s)`);
      snoozeTabsBatch(tabs, config)
        .then(() => sendResponse({ success: true }))
        .catch(error => {
          console.error('snoozeTabsBatch message handler failed:', error);
          sendResponse({ success: false, error: error.message });
        });
      return true; // keep channel open for async sendResponse
    }
```

- [ ] **Step 2: Run existing tests to confirm nothing broke**

```bash
npx vitest run
```

Expected: All tests PASS.

- [ ] **Step 3: Commit**

```bash
git add src/core/backgroundMain.js
git commit -m "feat: add MSG_SNOOZE_TABS handler in service worker"
```

---

### Task 6: Update SnoozePanel with multi-tab UI and batch snooze

**Files:**
- Modify: `src/components/SnoozePanel/SnoozePanel.jsx`

This is the largest task. Read through `src/components/SnoozePanel/SnoozePanel.jsx` in full before making changes.

- [ ] **Step 1: Update imports**

At the top of `SnoozePanel.jsx`, replace the existing imports block with:

```js
// @flow
import type { SnoozeOption } from './calcSnoozeOptions';
import type { Props as SnoozeButtonProps } from './SnoozeButton';

import React, { useState, useEffect, useCallback, useMemo, Suspense, lazy } from 'react';
import styled from 'styled-components';
import calcSnoozeOptions, {
  SNOOZE_TYPE_REPEATED,
  SNOOZE_TYPE_SPECIFIC_DATE,
} from './calcSnoozeOptions';
import SnoozeButtonsGrid from './SnoozeButtonsGrid';
import { MSG_SNOOZE_TABS } from '../../core/messages';
import TooltipHelper from './TooltipHelper';
import UpgradeDialog from './UpgradeDialog';
import { DEFAULT_SETTINGS, getSettings, saveSettings } from '../../core/settings';
import { isOverFreeWeeklyQuota } from '../../core/license';
import SnoozeFooter from './SnoozeFooter';
import { loadAudio, SOUND_SNOOZE } from '../../core/audio';
import keycode from 'keycode';
import {
  countConsecutiveSnoozes,
  IS_BETA,
  createTab,
  getActiveTab,
} from '../../core/utils';
import { filterSnoozableTabs, getTargetTabs } from '../../core/tabSelection';
```

- [ ] **Step 2: Update the Props type and add new state**

The existing `Props` type stays unchanged. Inside the `SnoozePanel` function body, after the existing `useState` declarations, add four new pieces of state:

```js
  const [allTabs, setAllTabs] = useState([]);
  const [highlightedTabs, setHighlightedTabs] = useState([]);
  const [activeTab, setActiveTab] = useState(null);
  const [singleTabMode, setSingleTabMode] = useState(DEFAULT_SETTINGS.singleTabMode);
```

- [ ] **Step 3: Add tab queries to the useEffect**

The existing `useEffect` calls `loadData()` and `getSnoozeAudio()`. Extend `loadData` to also query tabs and read `singleTabMode` from settings. Replace the entire `useEffect` body:

```js
  useEffect(() => {
    let cancelled = false;
    let timeoutId;

    const loadData = async () => {
      try {
        const [settings, allTabsResult, highlightedTabsResult, activeTabResult] = await Promise.all([
          getSettings(),
          chrome.tabs.query({ currentWindow: true }),
          chrome.tabs.query({ highlighted: true, currentWindow: true }),
          getActiveTab(),
        ]);

        if (!cancelled) {
          setSnoozeOptions(calcSnoozeOptions(settings));
          setIsProUser(true);
          setAllTabs(allTabsResult);
          setHighlightedTabs(highlightedTabsResult);
          setActiveTab(activeTabResult);
          setSingleTabMode(settings.singleTabMode);
        }

        timeoutId = setTimeout(async () => {
          const isOverFreePlanLimit = await isOverFreeWeeklyQuota();
          if (!cancelled) {
            setIsOverFreePlanLimit(isOverFreePlanLimit);
          }
        }, 300);
      } catch (error) {
        console.error('Failed to load data:', error);
      }
    };

    loadData();
    getSnoozeAudio();

    return () => {
      cancelled = true;
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, []);
```

- [ ] **Step 4: Add targetTabs derived value**

After the `useEffect`, add a `useMemo` to derive the filtered target tab list:

```js
  const targetTabs = useMemo(() => {
    if (!activeTab) return [];
    const raw = getTargetTabs(allTabs, highlightedTabs, singleTabMode, activeTab);
    return filterSnoozableTabs(raw);
  }, [allTabs, highlightedTabs, singleTabMode, activeTab]);
```

- [ ] **Step 5: Add toggleSingleTabMode callback**

After the `targetTabs` memo, add:

```js
  const toggleSingleTabMode = useCallback(async () => {
    const next = !singleTabMode;
    setSingleTabMode(next);
    await saveSettings({ singleTabMode: next });
  }, [singleTabMode]);
```

- [ ] **Step 6: Update onSnoozeButtonClicked to use targetTabs**

The existing `onSnoozeButtonClicked` calls `delayedSnoozeActiveTab(...)`. Replace those calls with `delayedSnoozeTabs(targetTabs, ...)`. The updated callback:

```js
  const onSnoozeButtonClicked = useCallback((event: Event, snoozeOption: SnoozeOption) => {
    if (selectedSnoozeOptionId != null) {
      return;
    }

    setSelectedSnoozeOptionId(snoozeOption.id);
    preventTooltip();

    if (snoozeOption.when != null) {
      const wakeupTime = snoozeOption.when.getTime();
      delayedSnoozeTabs(targetTabs, {
        type: snoozeOption.id,
        wakeupTime,
        closeTab: !(event: any).altKey,
      });
    } else {
      setTimeout(() => setSelectorDialogOpen(true), 400);
    }
  }, [selectedSnoozeOptionId, preventTooltip, setSelectorDialogOpen, targetTabs]);
```

- [ ] **Step 7: Update onSnoozeSpecificDateSelected and onSnoozePeriodSelected**

Replace both callbacks:

```js
  const onSnoozeSpecificDateSelected = useCallback((date: Date) => {
    delayedSnoozeTabs(targetTabs, {
      type: selectedSnoozeOptionId || '',
      wakeupTime: date.getTime(),
      closeTab: true,
    });
  }, [selectedSnoozeOptionId, targetTabs]);

  const onSnoozePeriodSelected = useCallback((period: SnoozePeriod) => {
    if (!isProUser) {
      return;
    }
    delayedSnoozeTabs(targetTabs, {
      type: selectedSnoozeOptionId || '',
      period,
      closeTab: true,
    });
  }, [selectedSnoozeOptionId, isProUser, targetTabs]);
```

- [ ] **Step 8: Add the header to the JSX return**

In the `return` block, add a `<PanelHeader>` immediately before `<SnoozeButtonsGrid>`:

```jsx
      <PanelHeader>
        <TabModeToggle onClick={toggleSingleTabMode}>
          {singleTabMode ? 'This tab' : `${targetTabs.length} tab${targetTabs.length !== 1 ? 's' : ''}`}
        </TabModeToggle>
        {!singleTabMode && (
          <HintText>Ctrl+click tabs to snooze a selection</HintText>
        )}
      </PanelHeader>
      <SnoozeButtonsGrid buttons={snoozeButtons} />
```

- [ ] **Step 9: Replace delayedSnoozeActiveTab with delayedSnoozeTabs**

At the bottom of the file, delete the existing `delayedSnoozeActiveTab` function and replace it with:

```js
async function delayedSnoozeTabs(tabs: Array<ChromeTab>, config: SnoozeConfig) {
  // Strip to the fields the SW needs; keep tab.id client-side for removal
  const snoozePromise = chrome.runtime.sendMessage({
    action: MSG_SNOOZE_TABS,
    tabs: tabs.map(t => ({
      url: t.url,
      title: t.title,
      favicon: t.favIconUrl,
    })),
    config: {
      ...config,
      closeTab: false, // popup handles closing
    },
  }).catch(error => {
    console.error('Failed to send snooze batch message to SW:', error);
    return { success: false };
  });

  playSnoozeSound();

  setTimeout(async () => {
    const response = await snoozePromise;
    if (!response?.success) {
      console.error('Snooze batch not confirmed by SW — keeping tabs open');
      window.close();
      return;
    }

    if (config.closeTab) {
      const tabIds = tabs.map(t => t.id).filter(Boolean);
      if (tabIds.length > 0) {
        chrome.tabs.remove(tabIds);
      }
    }
    window.close();
  }, 1100);
}
```

- [ ] **Step 10: Add styled components for the new header**

At the bottom of the file, after the existing `Root` styled component, add:

```js
const PanelHeader = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 8px 16px 4px;
  gap: 2px;
`;

const TabModeToggle = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  font-size: 13px;
  font-weight: 600;
  color: ${(props: any) => props.theme.snoozePanel.countBadgeColor};
  padding: 2px 8px;
  border-radius: 4px;

  &:hover {
    background-color: ${(props: any) => props.theme.snoozePanel.hoverColor};
  }
`;

const HintText = styled.div`
  font-size: 11px;
  color: ${(props: any) => props.theme.snoozePanel.footerTextColor};
  opacity: 0.6;
`;
```

- [ ] **Step 11: Run all tests**

```bash
npx vitest run
```

Expected: All tests PASS.

- [ ] **Step 12: Build the extension and manually verify**

```bash
npm run build
```

Load the unpacked extension from the `dist/` folder in `chrome://extensions`. Open several regular tabs plus one `chrome://newtab`. Open the popup — confirm:
- Header shows "N tabs" (count of snoozable tabs in window, excluding `chrome://newtab`)
- Clicking the toggle switches to "This tab"
- Clicking a snooze button in "N tabs" mode closes all regular tabs and leaves `chrome://newtab` open
- Clicking a snooze button in "This tab" mode closes only the active tab
- Ctrl+clicking two tabs in the tab bar then opening the popup shows "2 tabs"
- Toggle preference persists across popup opens

- [ ] **Step 13: Commit**

```bash
git add src/components/SnoozePanel/SnoozePanel.jsx
git commit -m "feat: multi-tab snooze UI — header toggle, batch send, tab filtering"
```
