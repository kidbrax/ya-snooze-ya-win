// @flow

// import { addTrackingIdToUrl } from './core/analytics';

// Base app file path
export const APP_BASE_PATH = '/index.html#';

// App routes
export const POPUP_PATH = '/popup';
export const OPTIONS_PATH = '/options';
export const SLEEPING_TABS_PATH = '/options/sleeping-tabs';
export const SETTINGS_PATH = '/options/settings';
export const TODO_PATH = '/todo';
export const FIRST_SNOOZE_PATH = '/first-snooze';
export const SUPPORT_TS_PATH = '/support-tab-snooze';
export const BETA_PATH = '/beta';
export const TUTORIAL_PATH = '/tutorial';
export const WHATS_NEW_PATH = '/whats-new';

// A special route that is meant to execute the background.js
// script, and not any GUI rendering.
// **NOTE**: intentionally without a preceding '/'
export const BACKGROUND_PATH = 'background';

// External links
// export const CHROME_WEB_STORE_INSTALL_SHARE_LINK = 'https://chromewebstore.google.com/detail/tab-snooze-works-as-of-no/kgnigbfnfjgpfaiaafcbgdkpalapiinb';
export const CHROME_SETTINGS_SHORTCUTS = 'chrome://extensions/shortcuts';

// Miscellaneous Section on Settings Page
// TODO: update these
export const CHROME_WEB_STORE = "https://chromewebstore.google.com/detail/ya-snooze-ya-win/gkllapkgbpaichomaefmmpdebcocpeeg"
export const CHROME_WEB_STORE_REVIEW = `${CHROME_WEB_STORE}/reviews`;
export const DONATE_URL_DEVELOPER2 = "https://ko-fi.com/csandapp"
export const DONATE_URL_DEVELOPER3 = "https://ko-fi.com/kidbrax"
export const DONATE_URL_ORIGINAL_DEVELOPER = 'https://www.paypal.com/cgi-bin/webscr?cmd=_donations&business=82HLJCDURLVME&currency_code=USD&source=url';
export const GITHUB_REPO_URL = "https://github.com/kidbrax/ya-snooze-ya-win"
export const SUPPORT_EMAIL_URL = "mailto:support@braxtonbeyer.com"
