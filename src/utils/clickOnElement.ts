export const clickOnElement = (selector: string): void => {
  const element: HTMLLIElement = document.querySelector(selector);
  element.click();
};
