import puppeteer from 'puppeteer-core';
import config from './config.js';
import env from './env.js';


export default class BotLogic {

    protected browserConfig;
    // @ts-ignore
    browser: puppeteer.Browser;
    // @ts-ignore
    streamersPage: puppeteer.Page;
    // @ts-ignore
    streamPage: puppeteer.Page;
    // @ts-ignore
    user: string; // login TODO: rename field
    streamer: string;
    // @ts-ignore
    checkOnlineInterval: NodeJS.Timeout;

    constructor(proxy?: string) {
        this.browserConfig = {
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
            executablePath: env.CHROME_PATH,
        };

        if (proxy)
            this.browserConfig.args.push("--proxy-server=" + proxy)

        this.streamer = config.streamer;
    }
}