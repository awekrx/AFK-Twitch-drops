export enum Selector {
  STREAMERS = 'article > div > div > div > div > a > p',
  OFFLINE = 'div[data-a-target="home-offline-carousel"]',
  ONLINE = 'a[data-a-target="watch-mode-to-home"]',
  CLAIM_DROPS = 'data-a-target="tw-core-button-label-text"',
  DROPS_PAGE = 'div[data-a-page-loaded-name="DropsInventoryPage"]',
  GAME = 'a[data-a-target="stream-game-link"]',
  QUALITY = 'div[data-a-target="player-settings-submenu-quality-option"]',
  SETTINGS_BUTTON = 'button[data-a-target="player-settings-button"]',
  QUALITY_SETTINGS_BUTTON = 'button[data-a-target="player-settings-menu-item-quality"]',
  ADULT_CONTENT = 'button[data-a-target="player-overlay-mature-accept"]',
  LOGIN_BUTTON = 'button[data-a-target="login-button"]',
  VIDEO = 'video',
}
