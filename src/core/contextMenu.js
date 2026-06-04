/**
 * Right-click context menu on tabs for quick snoozing.
 * Registers a "Snooze tab" parent menu with snooze option submenus.
 * Skips options that require UI (periodically, specific_date).
 */
import { snoozeTab } from './snooze';
import { getSettings } from './settings';
import calcSnoozeOptions from '../components/SnoozePanel/calcSnoozeOptions';

const MENU_ID_PARENT = 'snooze-tab-parent';
const SKIPPED_TYPES = ['periodically', 'specific_date'];

/**
 * Build or rebuild all context menu items based on current settings.
 * Called on install/update and when settings change.
 */
export async function rebuildContextMenus() {
  await chrome.contextMenus.removeAll();

  const settings = await getSettings();
  const snoozeOptions = calcSnoozeOptions(settings);

  // Filter out options that need a UI picker
  const menuOptions = snoozeOptions.filter(
    opt => opt.when != null && !SKIPPED_TYPES.includes(opt.id)
  );

  if (menuOptions.length === 0) return;

  // Parent item — appears when right-clicking on page content
  chrome.contextMenus.create({
    id: MENU_ID_PARENT,
    title: 'Snooze Tab',
    contexts: ['page'],
  });

  // One child per snooze option
  for (const opt of menuOptions) {
    chrome.contextMenus.create({
      id: `snooze-${opt.id}`,
      parentId: MENU_ID_PARENT,
      title: `${opt.title} (${opt.tooltip})`,
      contexts: ['page'],
    });
  }
}

/**
 * Register the context menu click handler.
 * Must be called synchronously during SW startup.
 */
export function registerContextMenuListeners() {
  chrome.contextMenus.onClicked.addListener(async (info, tab) => {
    if (!info.menuItemId || !String(info.menuItemId).startsWith('snooze-')) return;
    if (!tab) return;

    const optionId = String(info.menuItemId).replace('snooze-', '');

    const settings = await getSettings();
    const snoozeOptions = calcSnoozeOptions(settings);
    const option = snoozeOptions.find(o => o.id === optionId);

    if (!option?.when) {
      console.warn(`[ContextMenu] No wakeup time found for option: ${optionId}`);
      return;
    }

    console.log(`[ContextMenu] Snoozing tab "${tab.title}" until ${option.when.toString()}`);

    await snoozeTab(
      { url: tab.url, title: tab.title, favIconUrl: tab.favIconUrl, id: tab.id },
      {
        type: optionId,
        wakeupTime: option.when.getTime(),
        closeTab: true,
      }
    );
  });
}
