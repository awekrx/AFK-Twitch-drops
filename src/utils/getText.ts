export const getText = (selector: string): string => {
  const element: HTMLElement = document.querySelector(selector);

  return element.innerText;
};
