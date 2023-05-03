
const streamers = "article > div > div > div > div > a > p";
const offline = 'div[data-a-target="home-offline-carousel"]';
const drops = 'button[data-test-selector="DropsCampaignInProgressRewardPresentation-claim-button"]';
const online = 'a[data-a-target="watch-mode-to-home"]';
const game = 'a[data-a-target="stream-game-link"]';
const quality = 'div[data-a-target="player-settings-submenu-quality-option"]';
const dropPage = 'div[data-a-page-loaded-name="DropsInventoryPage"]';
const settingsButton = 'button[data-a-target="player-settings-button"]';
const qualitySettingsButton = 'button[data-a-target="player-settings-menu-item-quality"]';
const adultContent = 'button[data-a-target="player-overlay-mature-accept"]';
const loginButton = 'button[data-a-target="login-button"]';

const selectors = {
    streamers,
    offline,
    drops,
    online,
    // game,
    quality,
    dropPage,
    settingsButton,
    qualitySettingsButton,
    adultContent,
    loginButton,
};

export default selectors;
