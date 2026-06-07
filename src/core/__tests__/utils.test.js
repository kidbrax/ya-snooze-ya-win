import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  compareTabs,
  areTabsEqual,
  addMinutes,
  countConsecutiveSnoozes,
  getRecentlySnoozedTab,
  getFirstTabToWakeup,
  calcNextOccurrenceForPeriod,
} from '../utils';

describe('compareTabs', () => {
  it('sorts tabs by wakeup time ascending', () => {
    const tab1 = { when: 1000, sleepStart: 500 };
    const tab2 = { when: 2000, sleepStart: 600 };

    expect(compareTabs(tab1, tab2)).toBeLessThan(0);
    expect(compareTabs(tab2, tab1)).toBeGreaterThan(0);
  });

  it('uses sleepStart as tiebreaker when wakeup times are equal', () => {
    const tab1 = { when: 1000, sleepStart: 500 };
    const tab2 = { when: 1000, sleepStart: 800 };

    expect(compareTabs(tab1, tab2)).toBeLessThan(0);
    expect(compareTabs(tab2, tab1)).toBeGreaterThan(0);
  });

  it('returns 0 for identical tabs', () => {
    const tab = { when: 1000, sleepStart: 500 };
    expect(compareTabs(tab, tab)).toBe(0);
  });
});

describe('areTabsEqual', () => {
  it('returns true for tabs with same url and wakeup time', () => {
    const tab1 = { url: 'https://example.com', when: 1000 };
    const tab2 = { url: 'https://example.com', when: 1000 };

    expect(areTabsEqual(tab1, tab2)).toBe(true);
  });

  it('returns false for different urls', () => {
    const tab1 = { url: 'https://example.com', when: 1000 };
    const tab2 = { url: 'https://other.com', when: 1000 };

    expect(areTabsEqual(tab1, tab2)).toBe(false);
  });

  it('returns false for different wakeup times', () => {
    const tab1 = { url: 'https://example.com', when: 1000 };
    const tab2 = { url: 'https://example.com', when: 2000 };

    expect(areTabsEqual(tab1, tab2)).toBe(false);
  });
});

describe('addMinutes', () => {
  it('adds minutes to a date', () => {
    const date = new Date('2026-01-01T10:00:00Z');
    const result = addMinutes(date, 30);

    expect(result.getTime()).toBe(date.getTime() + 30 * 60000);
  });

  it('handles zero minutes', () => {
    const date = new Date('2026-01-01T10:00:00Z');
    const result = addMinutes(date, 0);

    expect(result.getTime()).toBe(date.getTime());
  });

  it('handles negative minutes', () => {
    const date = new Date('2026-01-01T10:00:00Z');
    const result = addMinutes(date, -15);

    expect(result.getTime()).toBe(date.getTime() - 15 * 60000);
  });
});

describe('countConsecutiveSnoozes', () => {
  it('returns 0 for empty array', () => {
    expect(countConsecutiveSnoozes([], 10000)).toBe(0);
  });

  it('counts consecutive snoozes within timeout', () => {
    const now = Date.now();
    const tabs = [
      { sleepStart: now - 1000 },
      { sleepStart: now - 3000 },
      { sleepStart: now - 5000 },
    ];

    expect(countConsecutiveSnoozes(tabs, 10000)).toBe(3);
  });

  it('stops counting when gap exceeds timeout', () => {
    const now = Date.now();
    const tabs = [
      { sleepStart: now - 1000 },
      { sleepStart: now - 3000 },
      { sleepStart: now - 50000 }, // big gap
    ];

    expect(countConsecutiveSnoozes(tabs, 10000)).toBe(2);
  });
});

describe('getRecentlySnoozedTab', () => {
  it('returns the most recently snoozed tab', () => {
    const tabs = [
      { url: 'old', sleepStart: 100 },
      { url: 'newest', sleepStart: 300 },
      { url: 'middle', sleepStart: 200 },
    ];

    expect(getRecentlySnoozedTab(tabs).url).toBe('newest');
  });
});

describe('getFirstTabToWakeup', () => {
  it('returns the tab with earliest wakeup time', () => {
    const tabs = [
      { url: 'later', when: 3000 },
      { url: 'earliest', when: 1000 },
      { url: 'middle', when: 2000 },
    ];

    expect(getFirstTabToWakeup(tabs).url).toBe('earliest');
  });
});

describe('calcNextOccurrenceForPeriod', () => {
  it('calculates next daily occurrence', () => {
    const period = { type: 'daily', hour: 9 };
    const result = calcNextOccurrenceForPeriod(period);

    expect(result).toBeInstanceOf(Date);
    expect(result.getTime()).toBeGreaterThan(Date.now());
    expect(result.getHours()).toBe(9);
    expect(result.getMinutes()).toBe(0);
  });

  it('calculates next weekly occurrence', () => {
    const period = { type: 'weekly', hour: 10, days: [1, 3, 5] }; // Mon, Wed, Fri
    const result = calcNextOccurrenceForPeriod(period);

    expect(result).toBeInstanceOf(Date);
    expect(result.getTime()).toBeGreaterThan(Date.now());
    expect(result.getHours()).toBe(10);
    expect([1, 3, 5]).toContain(result.getDay());
  });

  it('calculates next monthly occurrence', () => {
    const period = { type: 'monthly', hour: 8, day: 14 }; // 15th of month (0-indexed)
    const result = calcNextOccurrenceForPeriod(period);

    expect(result).toBeInstanceOf(Date);
    expect(result.getTime()).toBeGreaterThan(Date.now());
    expect(result.getHours()).toBe(8);
    expect(result.getDate()).toBe(15);
  });

  it('handles half-hour times', () => {
    const period = { type: 'daily', hour: 9.5 }; // 9:30 AM
    const result = calcNextOccurrenceForPeriod(period);

    expect(result.getHours()).toBe(9);
    expect(result.getMinutes()).toBe(30);
  });
});
