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
