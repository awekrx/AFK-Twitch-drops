import { Protocol } from 'puppeteer-core';

export const cookies: Omit<Protocol.Network.CookieParam, 'value'> = {
  domain: '.twitch.tv',
  httpOnly: false,
  name: 'auth-token',
  path: '/',
  secure: true,
};
