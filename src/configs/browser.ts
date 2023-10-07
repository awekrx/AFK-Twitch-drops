import { PuppeteerLaunchOptions } from 'puppeteer-core';

import config from '../../config.json';

export const browserConfig: PuppeteerLaunchOptions = {
  args: [
    '--disable-dev-shm-usage',
    '--disable-accelerated-2d-canvas',
    '--no-first-run',
    '--no-zygote',
    '--disable-gpu',
    '--no-sandbox',
    '--disable-setuid-sandbox',
  ],
  headless: true,
  executablePath: config.exec,
};
