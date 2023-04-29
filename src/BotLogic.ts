import puppeteer from 'puppeteer-core';
import config from './config.js';


export default class BotLogic {

    protected browserConfig;
    protected cookie;

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

    constructor(token: string, proxy?: string) {
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
            executablePath: config.exec,
        };

        if (proxy)
            this.browserConfig.args.push("--proxy-server=" + proxy)

        this.cookie = {
            domain: ".twitch.tv",
            httpOnly: false,
            name: "auth-token",
            path: "/",
            secure: true,
            session: false,
            value: token,
        };

        this.streamer = config.streamer;
    }
}