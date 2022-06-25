const puppeteer = require("puppeteer");
const config = require("./config.json");

const streamersSelector = "article > div > div > div > div > a > p";
const offlineSelector = 'div[data-a-target="home-offline-carousel"]';
const dropsSelector = 'button[data-test-selector="DropsCampaignInProgressRewardPresentation-claim-button"]';
const onlineSelector = 'a[data-a-target="watch-mode-to-home"]';
const gameSelector = 'a[data-a-target="stream-game-link"]';
const qualitySelector = 'div[data-a-target="player-settings-submenu-quality-option"] > label > div';

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
    headless: true,
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

let streamersPage;
let browsers = [];
let streamPages = [];
let dropsPages = [];
let users = [];
let streamer;
let checkOnlineInterval;
let checkDropsInterval;

async function getStreamers() {
    console.log("✅ Finding streamers...");
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
        page.goto(`http://www.twitch.tv/${streamer}`);
        await streamPages[i].waitForSelector("video");
        console.log(`✅ ${users[i]} watch ${streamer} now`);
    }
}

async function onlineInterval() {
    console.log(`⏰ Checking streamer online...`);
    let online = await getOnline(streamPages[0]);
    let game = await getGame(streamPages[0]);
    if (!(online && game == config.game)) {
        console.log(`🛑 ${streamer} is offline now`);
        openNewStreamer();
    } else {
        console.log("✅ It's okay, let's look further");
    }
}

async function dropsInterval() {
    let mainPage = dropsPages[0];
    mainPage.reload();
    try {
        await mainPage.waitForSelector(dropsSelector, { timeout: 30_000 });
        for (page of dropsPages) {
            page.reload();
            await page.evaluate(() => {
                buttons = document.querySelectorAll(dropsSelector);
                for (button of buttons) {
                    button.click();
                }
            });
        }
        console.log("✅ Drops collected");
    } catch {
        console.log("⏰ Drops not available yet");
    }
}

async function openDropPage(browser) {
    dropsPage = await browser.newPage();
    dropsPages.push(dropsPage);
    await dropsPage.setDefaultNavigationTimeout(0);
    await dropsPage.setDefaultTimeout(0);
    await dropsPage.goto(`https://www.twitch.tv/drops/inventory`);
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

async function changeQuality(page) {
    console.log("✅ Сhange quality to 160p");
    await page.evaluate((qualitySelector) => {
        let qualities = Array.from(document.querySelectorAll(qualitySelector));
        let lowQuality = qualities[qualities.length - 1];
        lowQuality.parentElement.parentElement.querySelector("input").click();
    }, qualitySelector);
}

(async function main() {
    console.log("✅ afktwichdrops running...");
    let browser = await puppeteer.launch(browserConfig);
    streamersPage = await browser.newPage();
    await streamersPage.setUserAgent(userAgent);
    await streamersPage.setCookie(cookie);
    await streamersPage.setDefaultNavigationTimeout(0);
    await streamersPage.setDefaultTimeout(0);
    await streamersPage.goto(config.category);
    await streamersPage.waitForSelector(streamersSelector);

    if (Array.isArray(config.tokens)) {
        if (!config.streamer) {
            let streamers = await getStreamers();
            streamer = streamers[0];
        } else {
            streamer = config.streamer;
        }
        for (let i = 0; i < config.tokens.length; i++) {
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
            await openDropPage(browsers[i]);
            await addUser(dropsPages[i]);
            streamPages[i].goto(`https://www.twitch.tv/${streamer}`);
            await streamPages[i].waitForSelector(qualitySelector);
            console.log(`✅ ${users[i]} watch ${streamer} now`);
            await changeQuality(streamPages[i]);
        }
    }

    try {
        await streamPages[0].waitForSelector(offlineSelector, { timeout: 30_000 });
        console.log(`🛑 ${streamer} is offline now`);
        await openNewStreamer();
    } catch {}

    checkOnlineInterval = setInterval(onlineInterval, config.onlineInterval);
    checkDropsInterval = setInterval(dropsInterval, config.dropsInterval);
})();
