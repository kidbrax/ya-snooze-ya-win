// @flow

import { BADGE_HIDDEN } from './badge';

export const STORAGE_KEY_SETTINGS = 'settings';

export const DEFAULT_CUSTOM_SNOOZE_OPTIONS: Array<CustomSnoozeOption> = [
  { id: 'one_hour',   label: '1 Hour from Now',  type: 'offset', offsetMinutes: 60 },
  { id: 'two_hours',  label: '2 Hours from Now',  type: 'offset', offsetMinutes: 120 },
  { id: 'later',      label: 'Later Today',        type: 'offset', offsetMinutes: 180 },
  { id: 'evening',    label: 'This Evening',       type: 'evening' },
  { id: 'tomorrow',   label: 'Tomorrow',           type: 'tomorrow' },
  { id: 'weekend',    label: 'This Weekend',       type: 'weekend' },
  { id: 'next_week',  label: 'Next Week',          type: 'next_week' },
  { id: 'in_a_month', label: 'In a Month',         type: 'in_a_month' },
  { id: 'someday',    label: 'Someday',            type: 'someday' },
  { id: 'periodically', label: 'Repeatedly',      type: 'periodically' },
  { id: 'specific_date', label: 'Pick a Date',    type: 'specific_date' },
];

export const DEFAULT_SETTINGS: Settings = {
  // General
  badge: BADGE_HIDDEN,
  playSoundEffects: true,
  playNotificationSound: true,
  showNotifications: true,

  // Snooze times
  weekStartDay: 1,
  weekEndDay: 6,
  workdayStart: 8,
  workdayEnd: 19,
  laterTodayHoursDelta: 3,
  somedayMonthsDelta: 3,

  // general data
  version: 3,
  totalSnoozeCount: 0,
  installDate: 0,
  weeklyUsage: {
    weekNumber: 0,
    usageCount: 0,
  },

  // Snooze panel options
  enabledSnoozeOptions: DEFAULT_CUSTOM_SNOOZE_OPTIONS.map(o => o.id),
  customSnoozeOptions: DEFAULT_CUSTOM_SNOOZE_OPTIONS,

  // Support reminders
  showSupportReminders: true,
  lastSupportReminderDate: 0,
};

export async function getSettings(): Promise<Settings> {
  let { settings } = await chrome.storage.local.get(STORAGE_KEY_SETTINGS);
  return Object.assign({}, DEFAULT_SETTINGS, settings);
}

export async function saveSettings(newSettings: $Shape<Settings>): Promise<void> {
  const currentSettings = await getSettings();
  newSettings = Object.assign(currentSettings, newSettings);
  return chrome.storage.local.set({ [STORAGE_KEY_SETTINGS]: newSettings });
}
