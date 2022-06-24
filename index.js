const puppeteer = require("puppeteer");
const config = require("./config.json");

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

const cookie = [
    {
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
        value: config.token,
    },
];

const userAgent =
    process.env.userAgent ||
    "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/78.0.3904.108 Safari/537.36";

let page;
(async function main() {
    const browser = await puppeteer.launch(browserConfig);
    page = await browser.newPage();
    await page.setUserAgent(userAgent); //Set userAgent
    await page.setCookie(...cookie); //Set cookie
    await page.setDefaultNavigationTimeout(process.env.timeout || 0);
    await page.setDefaultTimeout(process.env.timeout || 0);
    await page.goto(config.streamer);
})();
