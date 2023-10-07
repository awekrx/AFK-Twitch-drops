import { TWITCH_BASE_URL, config, cookies, userAgent } from '../../configs';
import { Selector } from '../../types';
import { createTwitchCategoryUrl, goTo } from '../../utils';

import { Logger } from '../Logger';
import { Evaluator } from '../Evaluator';
import { CustomBrowser } from '../CustomBrowser';
import { TwitchWatcher } from '../TwitchWatcher';

import { STEAMERS_TIMEOUT } from './constants';
import { getStreamers } from './utils';
import { Categories, Route } from './types';

export class WatcherMaster extends CustomBrowser {
  private readonly category: string;
  private evaluator: Evaluator;
  private watchers: Record<string, TwitchWatcher>;

  constructor(private readonly tokens: string[]) {
    super();

    this.category = new URL(
      `${Route.CATEGORY}${createTwitchCategoryUrl(config.game.toLowerCase())}${
        Categories.DROPS
      }`,
      TWITCH_BASE_URL,
    ).toString();

    this.prepare();
  }

  protected async prepare(): Promise<void> {
    await super.prepare();

    this.evaluator = new Evaluator(this.page);

    this.logger.log('AFK-Twitch-drops running...');

    await this.startStreamsPage();

    this.watchers = Object.fromEntries(
      this.tokens.map((token) => [token, new TwitchWatcher(token, this)]),
    );
  }

  private async startStreamsPage(): Promise<void> {
    await this.page.setUserAgent(userAgent);
    await this.page.setCookie({ ...cookies, value: this.tokens[0] });

    this.page.setDefaultNavigationTimeout(0);
    this.page.setDefaultTimeout(0);

    goTo(this.page, this.category);

    await this.page.waitForSelector(Selector.STREAMERS);
  }

  async getStreamers(): Promise<string[]> {
    await this.page.reload();

    try {
      await this.page.waitForSelector(Selector.LOGIN_BUTTON, {
        timeout: STEAMERS_TIMEOUT,
      });
    } catch {}

    this.logger.log('Finding streamers...');

    try {
      await this.page.waitForSelector(Selector.STREAMERS, { timeout: 2000 });
    } catch {
      this.logger.error(
        'The streamer category is empty, there is nothing to watch',
      );
      process.exit(1);
    }

    const streamers = await this.evaluator.evaluate<string[]>(
      [Selector.STREAMERS],
      getStreamers,
      true,
    );

    return streamers;
  }

  shutDownWatcher(token: string): void {
    delete this.watchers[token];

    if (Object.keys(this.watchers).length === 0) {
      this.logger.log('All watchers have been shut down');
      process.exit(1);
    }
  }
}
