const puppeteer = require("puppeteer");
const config = require("./config.json");

const streamersSelector = "article > div > div > div > div > a > p";
const offlineSelector = 'div[data-a-target="home-offline-carousel"]';
const dropsSelector = 'button[data-test-selector="DropsCampaignInProgressRewardPresentation-claim-button"]';

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
    hostOnly: false,
    httpOnly: false,
    name: "auth-token",
    path: "/",
    sameSite: "no_restriction",
    secure: true,
    session: false,
    storeId: "0",
    id: 1,
    value: config.tokens[0],
};

const userAgent =
    process.env.userAgent ||
    "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/78.0.3904.108 Safari/537.36";

let streamersPage;
let browsers = [];
let streamPages = [];
let dropsPages = [];
let streamer;
let checkOnlineInterval;
let checkDropsInterval;

async function getStreamers() {
    console.log("🔎Finding streamers...");
    await streamersPage.waitForSelector(streamersSelector);
    return JSON.parse(
        await streamersPage.evaluate(() => {
            const streamers = [];
            const streamersP = Array.from(document.querySelectorAll("article > div > div > div > div > a > p"));
            for (const streamer of streamersP) {
                streamers.push(streamer.innerText);
            }
            return JSON.stringify(streamers);
        }),
    );
}

async function getOnline(page) {
    try {
        await page.waitForSelector('a[data-a-target="watch-mode-to-home"]', { timeout: 30_000 });
        return await page.evaluate(() => {
            return document.querySelector('a[data-a-target="watch-mode-to-home"]').innerText;
        });
    } catch {
        return false;
    }
}
async function getGame(page) {
    try {
        await page.waitForSelector('a[data-a-target="stream-game-link"]', { timeout: 30_000 });
        return await page.evaluate(() => {
            return document.querySelector('a[data-a-target="stream-game-link"]').innerText;
        });
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
    }
    console.log(`👀Watch ${streamer} now`);
}

async function onlineInterval() {
    let online = await getOnline(streamPages[0]);
    let game = await getGame(streamPages[0]);
    if (!(online && game == config.game)) {
        console.log(`🛑${streamer} is offline now`);
        openNewStreamer();
    }
}

async function dropsInterval() {
    let mainPage = dropsPages[0];
    mainPage.reload();
    try {
        await mainPage.waitForSelector(dropsSelector);
        for (page of dropsPages) {
            page.reload();
            await page.evaluate(() => {
                buttons = document.querySelectorAll(
                    'button[data-test-selector="DropsCampaignInProgressRewardPresentation-claim-button"]',
                );
                for (button of buttons) {
                    button.click();
                }
            });
        }
        console.log("✅Drops collected");
    } catch {
        console.log("⏰Drops not available yet");
    }
}

async function openDropPage(browser) {
    dropsPage = await browser.newPage();
    dropsPages.push(dropsPage);
    await dropsPage.setDefaultNavigationTimeout(0);
    await dropsPage.setDefaultTimeout(0);
    await dropsPage.goto(`https://www.twitch.tv/drops/inventory`);
}

(async function main() {
    console.log("✅afktwichdrops running...");
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
            await streamPages[i].goto(`https://www.twitch.tv/${streamer}`);
            console.log(`👀Watch ${streamer} now`);
        }
    }

    try {
        await streamPages[0].waitForSelector(offlineSelector, { timeout: 30_000 });
        console.log(`🛑${streamer} is offline now`);
        await openNewStreamer();
    } catch {}

    checkOnlineInterval = setInterval(onlineInterval, 10_000);
    checkDropsInterval = setInterval(dropsInterval, 60_000);
})();
