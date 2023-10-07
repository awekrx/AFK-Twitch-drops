const START_SELECTOR = 'displayName%22:%22';
const END_SELECTOR = '%22%2C%22id%';

export const extractUserNameFromCookie = (cookie: string) => {
  const start = cookie.indexOf(START_SELECTOR) + START_SELECTOR.length;
  const end = cookie.indexOf(END_SELECTOR);

  return cookie.substring(start, end);
};
