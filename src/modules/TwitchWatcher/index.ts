import { Page } from 'puppeteer-core';

import { TWITCH_BASE_URL, config, cookies, userAgent } from '../../configs';
import { Selector } from '../../types';
import { clickOnElement, getText, goTo, random } from '../../utils';

import { Logger } from '../Logger';
import { Evaluator } from '../Evaluator';
import { CustomBrowser } from '../CustomBrowser';
import { WatcherMaster } from '../WatcherMaster';

import {
  DROPS_PAGE_TIMEOUT,
  CLAIM_DROPS_TIMEOUT,
  ADULT_CONTENT_TIMEOUT,
  INTERVAL,
  DROPS_URL,
  USER_COOKIE_NAME,
} from './constants';
import { claimDrops, extractUserNameFromCookie, set160pQuality } from './utils';

export class TwitchWatcher extends CustomBrowser {
  private drops: Page;
  private streamEvaluator: Evaluator;
  private dropsEvaluator: Evaluator;
  private readonly master: WatcherMaster;

  private username: string;
  private streamer: string;

  private checkDropsInterval: NodeJS.Timeout;
  private checkOnlineInterval: NodeJS.Timeout;

  constructor(
    private readonly token: string,
    master: WatcherMaster,
  ) {
    super();

    this.master = master;
    this.prepare();
  }

  protected async prepare(): Promise<void> {
    await super.prepare();

    this.streamEvaluator = new Evaluator(this.page);

    await this.createWatchPage();

    this.username = await this.getUserName();

    if (!this.username) {
      this.logger.error(`Token ${this.token} is invalid`);
      return await this.shutDown();
    }

    this.logger = new Logger(this.username);

    await this.start();
    await this.openDropPage();
    await this.page.bringToFront();
    this.dropsEvaluator = new Evaluator(this.drops);
  }

  private async shutDown(): Promise<void> {
    clearInterval(this.checkOnlineInterval);
    clearInterval(this.checkDropsInterval);

    await this.browser.close();
    this.master.shutDownWatcher(this.token);
  }

  private async createWatchPage() {
    await this.page.setUserAgent(userAgent);
    await this.page.setCookie({ ...cookies, value: this.token });

    await goTo(this.page, TWITCH_BASE_URL);

    this.browser.on('disconnected', () => {
      this.logger.error('Browser closed');
      this.shutDown();
    });

    this.page.setDefaultNavigationTimeout(0);
    this.page.setDefaultTimeout(0);
  }

  private async openDropPage() {
    this.drops = await this.browser.newPage();

    this.drops.setDefaultNavigationTimeout(0);
    this.drops.setDefaultTimeout(0);

    await this.drops.setUserAgent(userAgent);
    await this.drops.setCookie({ ...cookies, value: this.token });

    try {
      await goTo(this.drops, DROPS_URL, DROPS_PAGE_TIMEOUT);
    } catch {}

    await this.drops.waitForSelector(Selector.DROPS_PAGE);
  }

  private async getUserName() {
    const cookies = await this.page.cookies();

    const userCookie = cookies.find(({ name }) => name === USER_COOKIE_NAME);

    if (!userCookie) {
      this.logger.error(`Authorization error, check token '${this.token}'`);
      process.exit(1);
    }

    return extractUserNameFromCookie(userCookie.value);
  }

  private async start(): Promise<void> {
    await this.openNewStreamer();
    await this.muteStream();
    await this.changeQuality();

    this.logger.log('Starting autodrops check intervals...');
    this.checkDropsInterval = setInterval(this.checkDrops.bind(this), INTERVAL);

    this.logger.log('Starting online check intervals...');
    this.checkOnlineInterval = setInterval(
      this.checkOnline.bind(this),
      INTERVAL,
    );
  }

  private async openNewStreamer(): Promise<void> {
    const streamers = await this.master.getStreamers();
    this.streamer = streamers[random(0, streamers.length - 1)];

    await goTo(this.page, `${TWITCH_BASE_URL}${this.streamer}`);
    await this.page.waitForSelector(Selector.VIDEO);

    this.logger.log(`Watch ${this.streamer} now`);

    this.checkAdultStream();
  }

  private async checkAdultStream(): Promise<void> {
    try {
      await this.page.waitForSelector(Selector.ADULT_CONTENT, {
        timeout: ADULT_CONTENT_TIMEOUT,
      });

      await this.page.click(Selector.ADULT_CONTENT);

      this.streamEvaluator.evaluate<void>(
        [Selector.ADULT_CONTENT],
        clickOnElement,
      );

      this.logger.log(`Adult stream accepted`);
    } catch {}
  }

  private async muteStream(): Promise<void> {
    await this.page.keyboard.press('m');
    this.logger.log('Stream muted');
  }

  private async changeQuality(): Promise<void> {
    await this.page.waitForSelector(Selector.SETTINGS_BUTTON);
    this.streamEvaluator.evaluate<void>(
      [Selector.SETTINGS_BUTTON],
      clickOnElement,
    );

    await this.page.waitForSelector(Selector.QUALITY_SETTINGS_BUTTON);
    this.streamEvaluator.evaluate<void>(
      [Selector.QUALITY_SETTINGS_BUTTON],
      clickOnElement,
    );

    await this.page.waitForSelector(Selector.QUALITY);
    this.streamEvaluator.evaluate<void>([Selector.QUALITY], set160pQuality);

    this.logger.log('Change stream quality to 160p');
  }

  private async isOnline(): Promise<boolean> {
    try {
      await this.streamEvaluator.evaluate<string[]>([Selector.ONLINE], getText);

      return true;
    } catch {
      return false;
    }
  }

  private async getGameName(): Promise<string | null> {
    try {
      return this.streamEvaluator.evaluate<string>([Selector.GAME], getText);
    } catch {
      return null;
    }
  }

  private async checkOnline(): Promise<void> {
    this.logger.log('Checking streamer online...');

    let online = await this.isOnline();
    let game = await this.getGameName();

    if (config.game !== game) {
      this.logger.log(
        `${this.streamer} changed game, looking for a new streamer`,
      );

      return this.openNewStreamer();
    }

    if (online) {
      return this.logger.log(`${this.streamer} is online`);
    }

    this.logger.log(`${this.streamer} is offline, looking for a new streamer`);
    this.openNewStreamer();
  }

  private async checkDrops(): Promise<void> {
    this.logger.log('Start check drops...');

    await this.drops.reload();

    try {
      await this.drops.waitForSelector(Selector.CLAIM_DROPS, {
        timeout: CLAIM_DROPS_TIMEOUT,
      });
    } catch {}

    try {
      const dropsCount = await this.dropsEvaluator.evaluate<string>(
        [Selector.CLAIM_DROPS],
        claimDrops,
      );

      if (Number(dropsCount) === 0) {
        return this.logger.log('Nothing to collect');
      }

      return this.logger.log(`${dropsCount} drops ready`);
    } catch {}
  }
}
