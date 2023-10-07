import { Logger } from '../modules';
import { Page } from 'puppeteer-core';

const logger = new Logger();

export const goTo = async (
  page: Page,
  url: string,
  timeout?: number,
): Promise<void> => {
  try {
    await page.goto(url, {
      timeout,
    });
  } catch {
    logger.error('Failed to load page, please check your internet connection');
    process.exit(1);
  }
};
