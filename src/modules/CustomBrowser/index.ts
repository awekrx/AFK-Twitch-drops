import { launch, Browser, Page } from 'puppeteer-core';

import { browserConfig } from '../../configs';

import { Logger } from '../Logger';

export class CustomBrowser {
  protected browser: Browser;
  protected page: Page;

  protected logger: Logger = new Logger();

  protected async prepare(): Promise<void> {
    this.browser = await launch(browserConfig);
    this.page = await this.browser.newPage();
  }
}
