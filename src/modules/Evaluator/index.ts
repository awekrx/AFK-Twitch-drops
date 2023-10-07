import { InnerParams, Page } from 'puppeteer-core';

export class Evaluator {
  constructor(private readonly page: Page) {}

  async evaluate<
    Return extends string | object | void,
    Selectors extends string[] = string[],
  >(
    selectors: Selectors,
    callback: (...args: InnerParams<Selectors>) => string | void,
    wouldReturnObject = false,
  ): Promise<Return> {
    const result = await this.page.evaluate(callback, ...selectors);

    if (wouldReturnObject && result) {
      return JSON.parse(result);
    }

    return result as Return;
  }
}
