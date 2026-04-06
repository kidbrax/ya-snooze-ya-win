import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('../core/debugStorage', () => ({}));

import {
  getSnoozedTabs,
  addSnoozedTabs,
  removeSnoozedTabs,
  getRecentlyWokenTabs,
  saveRecentlyWokenTabs,
} from '../core/storage';

const TAB_A = { url: 'https://a.com', when: 1000 };
const TAB_B = { url: 'https://b.com', when: 2000 };

describe('getSnoozedTabs', () => {
  beforeEach(() => vi.clearAllMocks());

  it('returns empty array when storage has no snoozedTabs key', async () => {
    chrome.storage.local.get.mockResolvedValue({});
    expect(await getSnoozedTabs()).toEqual([]);
  });

  it('returns stored array when snoozedTabs key exists', async () => {
    chrome.storage.local.get.mockResolvedValue({ snoozedTabs: [TAB_A] });
    expect(await getSnoozedTabs()).toEqual([TAB_A]);
  });
});

describe('addSnoozedTabs', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    chrome.storage.local.set.mockResolvedValue(undefined);
  });

  it('appends new tabs to an empty list', async () => {
    chrome.storage.local.get.mockResolvedValue({ snoozedTabs: [] });

    await addSnoozedTabs([TAB_A]);

    expect(chrome.storage.local.set).toHaveBeenCalledWith({ snoozedTabs: [TAB_A] });
  });

  it('appends new tabs to an existing list', async () => {
    chrome.storage.local.get.mockResolvedValue({ snoozedTabs: [TAB_A] });

    await addSnoozedTabs([TAB_B]);

    expect(chrome.storage.local.set).toHaveBeenCalledWith({ snoozedTabs: [TAB_A, TAB_B] });
  });

  it('deduplicates: does not write when tab already exists in storage', async () => {
    chrome.storage.local.get.mockResolvedValue({ snoozedTabs: [TAB_A] });

    await addSnoozedTabs([TAB_A]);

    expect(chrome.storage.local.set).not.toHaveBeenCalled();
  });

  it('only writes non-duplicate tabs when batch is mixed', async () => {
    chrome.storage.local.get.mockResolvedValue({ snoozedTabs: [TAB_A] });

    await addSnoozedTabs([TAB_A, TAB_B]);

    expect(chrome.storage.local.set).toHaveBeenCalledWith({ snoozedTabs: [TAB_A, TAB_B] });
  });
});

describe('removeSnoozedTabs', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    chrome.storage.local.set.mockResolvedValue(undefined);
  });

  it('removes matching tab from storage', async () => {
    chrome.storage.local.get.mockResolvedValue({ snoozedTabs: [TAB_A, TAB_B] });

    await removeSnoozedTabs([TAB_A]);

    expect(chrome.storage.local.set).toHaveBeenCalledWith({ snoozedTabs: [TAB_B] });
  });

  it('removes all tabs when all match', async () => {
    chrome.storage.local.get.mockResolvedValue({ snoozedTabs: [TAB_A, TAB_B] });

    await removeSnoozedTabs([TAB_A, TAB_B]);

    expect(chrome.storage.local.set).toHaveBeenCalledWith({ snoozedTabs: [] });
  });

  it('does not call set when no tabs match', async () => {
    chrome.storage.local.get.mockResolvedValue({ snoozedTabs: [TAB_A] });

    await removeSnoozedTabs([TAB_B]);

    expect(chrome.storage.local.set).not.toHaveBeenCalled();
  });

  it('does not call set when storage is empty', async () => {
    chrome.storage.local.get.mockResolvedValue({ snoozedTabs: [] });

    await removeSnoozedTabs([TAB_A]);

    expect(chrome.storage.local.set).not.toHaveBeenCalled();
  });
});

describe('getRecentlyWokenTabs', () => {
  beforeEach(() => vi.clearAllMocks());

  it('returns empty array when key is absent', async () => {
    chrome.storage.local.get.mockResolvedValue({});
    expect(await getRecentlyWokenTabs()).toEqual([]);
  });

  it('returns stored keys', async () => {
    chrome.storage.local.get.mockResolvedValue({ recentlyWokenTabs: ['https://a.com|1000'] });
    expect(await getRecentlyWokenTabs()).toEqual(['https://a.com|1000']);
  });
});

describe('saveRecentlyWokenTabs', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    chrome.storage.local.set.mockResolvedValue(undefined);
  });

  it('writes keys under the correct storage key', async () => {
    await saveRecentlyWokenTabs(['https://a.com|1000', 'https://b.com|2000']);

    expect(chrome.storage.local.set).toHaveBeenCalledWith({
      recentlyWokenTabs: ['https://a.com|1000', 'https://b.com|2000'],
    });
  });

  it('writes empty array to clear the list', async () => {
    await saveRecentlyWokenTabs([]);

    expect(chrome.storage.local.set).toHaveBeenCalledWith({ recentlyWokenTabs: [] });
  });
});
