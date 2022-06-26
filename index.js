const puppeteer = require("puppeteer");
const config = require("./config.json");

const streamersSelector = "article > div > div > div > div > a > p";
const offlineSelector = 'div[data-a-target="home-offline-carousel"]';
const dropsSelector = 'button[data-test-selector="DropsCampaignInProgressRewardPresentation-claim-button"]';
const onlineSelector = 'a[data-a-target="watch-mode-to-home"]';
const gameSelector = 'a[data-a-target="stream-game-link"]';
const qualitySelector = 'div[data-a-target="player-settings-submenu-quality-option"]';
const dropPageSelector = 'div[data-a-page-loaded-name="DropsInventoryPage"]';
const settingsButtonSelector = 'button[data-a-target="player-settings-button"]';
const qualitySettingsButtonSelector = 'button[data-a-target="player-settings-menu-item-quality"]';

const browserConfig = {
    args: [
        "--disable-dev-shm-usage",
        "--disable-accelerated-2d-canvas",
        "--no-first-run",
        "--no-zygote",
        "--disable-gpu",
        "--no-sandbox",
        "--disable-setuid-sandbox",
    ],
    headless: !config.browsers,
    executablePath: config.exec,
};

const cookie = {
    domain: ".twitch.tv",
    httpOnly: false,
    name: "auth-token",
    path: "/",
    secure: true,
    session: false,
    value: config.tokens[0],
};

const userAgent =
    process.env.userAgent ||
    "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/78.0.3904.108 Safari/537.36";

let browser;
let streamersPage;
let browsers = [];
let streamPages = [];
let dropsPages = [];
let users = [];
let streamer;
let checkOnlineInterval;
let checkDropsInterval;

async function checkGoToLoad(fgoto) {
    try {
        fgoto();
    } catch {
        log("[Error] Failed to load page, please check your internet connection");
        process.exit(1);
    }
}

async function getStreamers() {
    log("Finding streamers...");
    await streamersPage.waitForSelector(streamersSelector);
    return JSON.parse(
        await streamersPage.evaluate((streamersSelector) => {
            const streamers = [];
            const streamersP = Array.from(document.querySelectorAll(streamersSelector));
            for (const streamer of streamersP) {
                streamers.push(streamer.innerText);
            }
            return JSON.stringify(streamers);
        }, streamersSelector),
    );
}

async function getOnline(page) {
    try {
        await page.waitForSelector(onlineSelector, { timeout: 30_000 });
        return await page.evaluate((onlineSelector) => {
            return document.querySelector(onlineSelector).innerText;
        }, onlineSelector);
    } catch {
        return false;
    }
}
async function getGame(page) {
    try {
        await page.waitForSelector(gameSelector, { timeout: 30_000 });
        return await page.evaluate((gameSelector) => {
            return document.querySelector(gameSelector).innerText;
        }, gameSelector);
    } catch {
        return false;
    }
}

async function openNewStreamer() {
    streamersPage.reload();
    let streamers = await getStreamers();
    streamer = await streamers[0];
    for (page of streamPages) {
        checkGoToLoad(async () => {
            await page.goto(`http://www.twitch.tv/${streamer}`);
        });
        await page.waitForSelector("video");
        log(`${users[i]} watch ${streamer} now`);
    }
}

async function onlineInterval() {
    log("Checking streamer online...");
    let online = await getOnline(streamPages[0]);
    let game = await getGame(streamPages[0]);
    if (config.autodrops && !config.game == game) {
        log(`${streamer} changed game, looking for a new streamer`);
        openNewStreamer();
    } else if (!online) {
        log(`${streamer} is offline now`);
        if (config.autonewstreamer) {
            log(`${streamer} is offline, looking for a new streamer`);
            openNewStreamer();
        } else {
            log("[Error] Stream is over, the program is shutting down");
            process.exit(1);
        }
    } else {
        log(`${streamer} is online`);
    }
}

async function dropsInterval() {
    log("Start check drops...");
    for (let i = 0; i < dropsPages.length; i++) {
        let page = dropsPages[i];
        try {
            await page.reload();
            page.waitForSelector(dropsSelector, { timeout: 10_000 })
                .then(() => {
                    page.evaluate((dropsSelector) => {
                        buttons = document.querySelectorAll(dropsSelector);
                        for (button of buttons) {
                            button.click();
                        }
                    }, dropsSelector)
                        .then(() => {
                            log(`${users[i]} drops collected`);
                        })
                        .catch(() => {
                            log(`${users[i]} drops not aviable yet`);
                        });
                })
                .catch(() => {
                    log(`${users[i]} drops not aviable yet`);
                });
        } catch {
            log(`${users[i]} drops not aviable yet`);
        }
    }
}

async function openDropPage(browser) {
    dropsPage = await browser.newPage();
    dropsPages.push(dropsPage);
    await dropsPage.setDefaultNavigationTimeout(0);
    await dropsPage.setDefaultTimeout(0);
    await dropsPage.setUserAgent(userAgent);
    await dropsPage.setCookie(cookie);
    try {
        await dropsPage.goto(`https://www.twitch.tv/drops/inventory`, { timeout: 10_000 });
    } catch {
        checkGoToLoad(async () => {
            await dropsPage.goto(`https://www.twitch.tv/drops/inventory`);
        });
    }
    await dropsPage.waitForSelector(dropPageSelector);
}

async function addUser(page) {
    let coockies = await page.cookies();
    for (let i = 0; i < coockies.length; i++) {
        let c = coockies[i];
        if (c.name === "twilight-user") {
            let start = c.value.indexOf("displayName%22:%22") + "displayName%22:%22".length;
            let end = c.value.indexOf("%22%2C%22id%");
            users.push(c.value.substring(start, end));
        }
    }
}

async function changeQuality(page, i) {
    await page.waitForSelector(settingsButtonSelector);
    await page.evaluate((settingsButtonSelector) => {
        document.querySelector(settingsButtonSelector).click();
    }, settingsButtonSelector);
    await page.waitForSelector(qualitySettingsButtonSelector);
    await page.evaluate((qualitySettingsButtonSelector) => {
        document.querySelector(qualitySettingsButtonSelector).click();
    }, qualitySettingsButtonSelector);
    await page.waitForSelector(qualitySelector);
    log(`${users[i]} change stream quality to 160p`);
    await page.evaluate((qualitySelector) => {
        let qualities = Array.from(document.querySelectorAll(qualitySelector));
        let lowQuality = qualities[qualities.length - 1];
        lowQuality.querySelector("input").click();
    }, qualitySelector);
}

async function startStreamsPage() {
    browser = await puppeteer.launch(browserConfig);

    streamersPage = await browser.newPage();
    await streamersPage.setUserAgent(userAgent);
    await streamersPage.setCookie(cookie);
    await streamersPage.setDefaultNavigationTimeout(0);
    await streamersPage.setDefaultTimeout(0);
    checkGoToLoad(async () => {
        await streamersPage.goto(config.category);
    });
    await streamersPage.waitForSelector(streamersSelector);
}

async function startWatching(i) {
    cookie.value = config.tokens[i];
    if (i === 0) {
        browsers.push(browser);
        streamPages.push(await browser.newPage());
    } else {
        browsers.push(await puppeteer.launch(browserConfig));
        streamPages.push(await browsers[i].newPage());
        await streamPages[i].setUserAgent(userAgent);
        await streamPages[i].setCookie(cookie);
    }
    await streamPages[i].setDefaultNavigationTimeout(0);
    await streamPages[i].setDefaultTimeout(0);
}

function log(msg) {
    let time = new Date();
    let stime = `${time.getHours() < 10 ? "0" + time.getHours() : time.getHours()}:${
        time.getMinutes() < 10 ? "0" + time.getMinutes() : time.getMinutes()
    }:${time.getSeconds() < 10 ? "0" + time.getSeconds() : time.getSeconds()}`;
    console.log(`[${stime}] ${msg}`);
}

(async function main() {
    log("afktwichdrops running...");
    await startStreamsPage();

    if (Array.isArray(config.tokens)) {
        if (!config.streamer) {
            if (config.autonewstreamer) {
                let streamers = await getStreamers();
                streamer = streamers[0];
            } else {
                log("[Error] Enable autonewstreamer in config or add a streamer to watch");
                process.exit(1);
            }
        } else {
            streamer = config.streamer;
        }
        for (let i = 0; i < config.tokens.length; i++) {
            await startWatching(i);
            await openDropPage(browsers[i]);
            await addUser(dropsPages[i]);
            if (users[i] == undefined) {
                log(`$token {config.tokens[i]} is invalid`);
                process.exit(1);
            }
            checkGoToLoad(async () => {
                await streamPages[i].goto(`https://www.twitch.tv/${streamer}`);
            });
            log(`${users[i]} starting change quality...`);
            await changeQuality(streamPages[i], i);
            log(`${users[i]} watch ${streamer} now`);
            if (config.browsers) {
                await streamPages[i].keyboard.press("m");
            }
        }
    }

    if (config.streamer) {
        try {
            await streamPages[0].waitForSelector(offlineSelector, { timeout: 30_000 });
            log(`${streamer} is offline now`);
            await openNewStreamer();
        } catch {}
    }
    if (config.autodrops) {
        log("Starting autodrops check intervals...");
        checkDropsInterval = setInterval(dropsInterval, config.dropsinterval);
    }
    log("Starting online check intervals...");
    checkOnlineInterval = setInterval(onlineInterval, config.onlineinterval);
})();
