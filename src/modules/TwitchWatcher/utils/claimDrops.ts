export const claimDrops = (selector: string): string => {
  const buttons = document.querySelectorAll(selector);
  buttons.forEach((button: HTMLElement) => button.click());

  return String(buttons.length);
};
