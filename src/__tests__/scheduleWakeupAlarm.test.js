import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('../core/storage', () => ({
  getSnoozedTabs: vi.fn(),
  addSnoozedTabs: vi.fn(),
  removeSnoozedTabs: vi.fn(),
  getRecentlyWokenTabs: vi.fn(),
  saveRecentlyWokenTabs: vi.fn(),
}));

vi.mock('../core/utils', () => ({
  getFirstTabToWakeup: vi.fn(),
  createTabs: vi.fn(),
  notifyUserAboutNewTabs: vi.fn(),
  areTabsEqual: vi.fn(),
  compareTabs: vi.fn(),
}));

vi.mock('../core/settings', () => ({
  getSettings: vi.fn(),
}));

vi.mock('../core/audio', () => ({
  SOUND_WAKEUP: 'wakeup',
}));

vi.mock('../core/messages', () => ({
  MSG_PLAY_AUDIO: 'play_audio',
}));

vi.mock('../core/snooze', () => ({
  resnoozePeriodicTab: vi.fn(),
}));

vi.mock('../core/backgroundMain', () => ({
  ensureOffscreenDocument: vi.fn(),
}));

import { scheduleWakeupAlarm, cancelWakeupAlarm } from '../core/wakeup';
import { getSnoozedTabs } from '../core/storage';
import { getFirstTabToWakeup } from '../core/utils';

const ALARM_NAME = 'WAKEUP_TABS_ALARM';

describe('scheduleWakeupAlarm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    chrome.alarms.clear.mockResolvedValue(undefined);
    chrome.alarms.create.mockReturnValue(undefined);
  });

  it('cancels the existing alarm before creating a new one', async () => {
    getSnoozedTabs.mockResolvedValue([]);
    await scheduleWakeupAlarm('auto');
    expect(chrome.alarms.clear).toHaveBeenCalledWith(ALARM_NAME);
  });

  it('does not create an alarm when there are no snoozed tabs', async () => {
    getSnoozedTabs.mockResolvedValue([]);
    await scheduleWakeupAlarm('auto');
    expect(chrome.alarms.create).not.toHaveBeenCalled();
  });

  it('creates alarm at the earliest tab wakeup time in auto mode', async () => {
    const tab = { url: 'https://a.com', when: 9_999_999_999 };
    getSnoozedTabs.mockResolvedValue([tab]);
    getFirstTabToWakeup.mockReturnValue(tab);

    await scheduleWakeupAlarm('auto');

    expect(chrome.alarms.create).toHaveBeenCalledWith(ALARM_NAME, { when: tab.when });
  });

  it('uses getFirstTabToWakeup to pick the earliest tab', async () => {
    const tabEarly = { url: 'https://a.com', when: 1000 };
    const tabLate = { url: 'https://b.com', when: 9000 };
    getSnoozedTabs.mockResolvedValue([tabLate, tabEarly]);
    getFirstTabToWakeup.mockReturnValue(tabEarly);

    await scheduleWakeupAlarm('auto');

    expect(getFirstTabToWakeup).toHaveBeenCalledWith([tabLate, tabEarly]);
    expect(chrome.alarms.create).toHaveBeenCalledWith(ALARM_NAME, { when: tabEarly.when });
  });

  it('creates alarm approximately 1 minute from now in 1min mode', async () => {
    const tab = { url: 'https://a.com', when: 9_999_999_999 };
    getSnoozedTabs.mockResolvedValue([tab]);

    const before = Date.now();
    await scheduleWakeupAlarm('1min');
    const after = Date.now();

    const [, { when }] = chrome.alarms.create.mock.calls[0];
    expect(when).toBeGreaterThanOrEqual(before + 60_000);
    expect(when).toBeLessThanOrEqual(after + 60_000);
  });

  it('does not call getFirstTabToWakeup in 1min mode', async () => {
    const tab = { url: 'https://a.com', when: 9_999_999_999 };
    getSnoozedTabs.mockResolvedValue([tab]);

    await scheduleWakeupAlarm('1min');

    expect(getFirstTabToWakeup).not.toHaveBeenCalled();
  });
});

describe('cancelWakeupAlarm', () => {
  beforeEach(() => vi.clearAllMocks());

  it('clears the wakeup alarm by name', async () => {
    chrome.alarms.clear.mockResolvedValue(undefined);
    await cancelWakeupAlarm();
    expect(chrome.alarms.clear).toHaveBeenCalledWith(ALARM_NAME);
    expect(chrome.alarms.clear).toHaveBeenCalledTimes(1);
  });
});
