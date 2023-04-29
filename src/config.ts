import env from "./env.js";

const config = {
    "streamer": env.STREAMER,
    "browsers": env.USE_BROWSERS,
    "quality160p": true,
    "adultcontent": true,
    "onlineinterval": env.ONLINE_INTERVAL_MS,
    "screenshotInterval": env.SCREENSHOT_INTERVAL_MS,
    "userAgent": "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/78.0.3904.108 Safari/537.36"
}

export default config;
