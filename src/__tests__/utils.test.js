import { describe, it, expect } from 'vitest';
import {
  areTabsEqual,
  compareTabs,
  getFirstTabToWakeup,
  addMinutes,
  calcNextOccurrenceForPeriod,
} from '../core/utils';

describe('areTabsEqual', () => {
  it('returns true when url and when match', () => {
    expect(areTabsEqual({ url: 'https://a.com', when: 1000 }, { url: 'https://a.com', when: 1000 })).toBe(true);
  });

  it('returns false when url differs', () => {
    expect(areTabsEqual({ url: 'https://a.com', when: 1000 }, { url: 'https://b.com', when: 1000 })).toBe(false);
  });

  it('returns false when when differs', () => {
    expect(areTabsEqual({ url: 'https://a.com', when: 1000 }, { url: 'https://a.com', when: 2000 })).toBe(false);
  });
});

describe('compareTabs', () => {
  it('sorts earlier wakeup time first', () => {
    const tabs = [
      { url: 'https://b.com', when: 2000, sleepStart: 0 },
      { url: 'https://a.com', when: 1000, sleepStart: 0 },
    ];
    tabs.sort(compareTabs);
    expect(tabs[0].url).toBe('https://a.com');
    expect(tabs[1].url).toBe('https://b.com');
  });

  it('breaks ties by sleepStart when when is equal', () => {
    const tabs = [
      { url: 'https://b.com', when: 1000, sleepStart: 200 },
      { url: 'https://a.com', when: 1000, sleepStart: 100 },
    ];
    tabs.sort(compareTabs);
    expect(tabs[0].url).toBe('https://a.com');
    expect(tabs[1].url).toBe('https://b.com');
  });
});

describe('getFirstTabToWakeup', () => {
  it('returns the tab with the earliest when value', () => {
    const tabs = [
      { url: 'https://b.com', when: 3000, sleepStart: 0 },
      { url: 'https://a.com', when: 1000, sleepStart: 0 },
      { url: 'https://c.com', when: 2000, sleepStart: 0 },
    ];
    expect(getFirstTabToWakeup(tabs).url).toBe('https://a.com');
  });

  it('returns the sole tab in a single-element array', () => {
    const tab = { url: 'https://a.com', when: 5000, sleepStart: 0 };
    expect(getFirstTabToWakeup([tab])).toBe(tab);
  });
});

describe('addMinutes', () => {
  it('adds minutes to a date', () => {
    const base = new Date(0);
    const result = addMinutes(base, 10);
    expect(result.getTime()).toBe(10 * 60 * 1000);
  });

  it('handles fractional minutes', () => {
    const base = new Date(0);
    const result = addMinutes(base, 0.5);
    expect(result.getTime()).toBe(30 * 1000);
  });

  it('subtracts when given a negative value', () => {
    const base = new Date(60 * 60 * 1000); // 1 hour
    const result = addMinutes(base, -30);
    expect(result.getTime()).toBe(30 * 60 * 1000);
  });
});

describe('calcNextOccurrenceForPeriod', () => {
  const NOW = Date.now();

  it('daily: returns a future Date', () => {
    const result = calcNextOccurrenceForPeriod({ type: 'daily', hour: 23 });
    expect(result).toBeInstanceOf(Date);
    expect(result.getTime()).toBeGreaterThan(NOW);
  });

  it('daily: returned date has the specified hour', () => {
    const result = calcNextOccurrenceForPeriod({ type: 'daily', hour: 23 });
    expect(result.getHours()).toBe(23);
  });

  it('daily: returned date has zero seconds and milliseconds', () => {
    const result = calcNextOccurrenceForPeriod({ type: 'daily', hour: 23 });
    expect(result.getSeconds()).toBe(0);
    expect(result.getMilliseconds()).toBe(0);
  });

  it('weekly: returns a future Date', () => {
    // Include all days of the week to guarantee a future occurrence exists
    const result = calcNextOccurrenceForPeriod({
      type: 'weekly',
      hour: 23,
      days: [0, 1, 2, 3, 4, 5, 6],
    });
    expect(result).toBeInstanceOf(Date);
    expect(result.getTime()).toBeGreaterThan(NOW);
  });

  it('weekly: returned day of week is one of the specified days', () => {
    const days = [1, 3, 5]; // Mon, Wed, Fri
    const result = calcNextOccurrenceForPeriod({ type: 'weekly', hour: 23, days });
    expect(days).toContain(result.getDay());
  });

  it('monthly: returns a future Date', () => {
    const result = calcNextOccurrenceForPeriod({ type: 'monthly', hour: 23, day: 14 });
    expect(result).toBeInstanceOf(Date);
    expect(result.getTime()).toBeGreaterThan(NOW);
  });

  it('yearly: returns a future Date', () => {
    // month 11 = December, day index 30 → date() call uses day+1=31
    const result = calcNextOccurrenceForPeriod({ type: 'yearly', hour: 23, date: [11, 30] });
    expect(result).toBeInstanceOf(Date);
    expect(result.getTime()).toBeGreaterThan(NOW);
  });

  it('half-hour: fractional hour produces correct minutes', () => {
    const result = calcNextOccurrenceForPeriod({ type: 'daily', hour: 9.5 }); // 09:30
    expect(result.getHours()).toBe(9);
    expect(result.getMinutes()).toBe(30);
  });
});
