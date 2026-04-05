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

  it('derives wakeupTime from period when no explicit wakeupTime given', async () => {
    const { calcNextOccurrenceForPeriod } = await import('../core/utils');
    calcNextOccurrenceForPeriod.mockReturnValue({ getTime: () => FUTURE_TIME });

    await snoozeTabsBatch(TWO_TABS, { type: 'every_week', period: { type: 'weekly', hour: 9, days: [1] } });

    expect(calcNextOccurrenceForPeriod).toHaveBeenCalledTimes(1);
    const stored = addSnoozedTabs.mock.calls[0][0];
    expect(stored[0].when).toBe(FUTURE_TIME);
  });
});
