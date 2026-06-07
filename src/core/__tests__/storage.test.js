import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getSnoozedTabs, addSnoozedTabs, removeSnoozedTabs } from '../storage';

describe('storage', () => {
  beforeEach(() => {
    chrome.storage.local.get.mockReset();
    chrome.storage.local.set.mockReset();
  });

  describe('getSnoozedTabs', () => {
    it('returns empty array when no tabs are stored', async () => {
      chrome.storage.local.get.mockResolvedValue({});

      const tabs = await getSnoozedTabs();
      expect(tabs).toEqual([]);
    });

    it('returns stored snoozed tabs', async () => {
      const mockTabs = [
        { url: 'https://example.com', when: 1000, sleepStart: 500 },
        { url: 'https://other.com', when: 2000, sleepStart: 600 },
      ];
      chrome.storage.local.get.mockResolvedValue({ snoozedTabs: mockTabs });

      const tabs = await getSnoozedTabs();
      expect(tabs).toEqual(mockTabs);
    });
  });

  describe('addSnoozedTabs', () => {
    it('adds new tabs to storage', async () => {
      const existingTabs = [{ url: 'https://existing.com', when: 1000, sleepStart: 500 }];
      chrome.storage.local.get.mockResolvedValue({ snoozedTabs: existingTabs });
      chrome.storage.local.set.mockResolvedValue(undefined);

      const newTab = { url: 'https://new.com', when: 2000, sleepStart: 600 };
      await addSnoozedTabs([newTab]);

      expect(chrome.storage.local.set).toHaveBeenCalledWith({
        snoozedTabs: [...existingTabs, newTab],
      });
    });

    it('does not add duplicate tabs', async () => {
      const existingTab = { url: 'https://example.com', when: 1000, sleepStart: 500 };
      chrome.storage.local.get.mockResolvedValue({ snoozedTabs: [existingTab] });
      chrome.storage.local.set.mockResolvedValue(undefined);

      // Same url + when = duplicate
      const duplicate = { url: 'https://example.com', when: 1000, sleepStart: 999 };
      await addSnoozedTabs([duplicate]);

      expect(chrome.storage.local.set).not.toHaveBeenCalled();
    });
  });

  describe('removeSnoozedTabs', () => {
    it('removes matching tabs from storage', async () => {
      const tab1 = { url: 'https://keep.com', when: 1000, sleepStart: 500 };
      const tab2 = { url: 'https://remove.com', when: 2000, sleepStart: 600 };
      chrome.storage.local.get.mockResolvedValue({ snoozedTabs: [tab1, tab2] });
      chrome.storage.local.set.mockResolvedValue(undefined);

      await removeSnoozedTabs([tab2]);

      expect(chrome.storage.local.set).toHaveBeenCalledWith({
        snoozedTabs: [tab1],
      });
    });

    it('does nothing when no tabs match', async () => {
      const tab1 = { url: 'https://keep.com', when: 1000, sleepStart: 500 };
      chrome.storage.local.get.mockResolvedValue({ snoozedTabs: [tab1] });
      chrome.storage.local.set.mockResolvedValue(undefined);

      const nonExistent = { url: 'https://nope.com', when: 9999, sleepStart: 100 };
      await removeSnoozedTabs([nonExistent]);

      expect(chrome.storage.local.set).not.toHaveBeenCalled();
    });
  });
});
