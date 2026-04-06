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
