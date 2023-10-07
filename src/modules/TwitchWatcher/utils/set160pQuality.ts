export const set160pQuality = (selector: string): void => {
  let qualities = Array.from(document.querySelectorAll(selector));
  let lowQuality = qualities[qualities.length - 1];
  lowQuality.querySelector('input').click();
};
