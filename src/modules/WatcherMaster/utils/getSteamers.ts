export const getStreamers = (selector: string): string => {
  const streamersList = Array.from(document.querySelectorAll(selector));

  const steamers = streamersList.map(
    (streamerItem: HTMLElement) => streamerItem.innerText,
  );

  return JSON.stringify(steamers);
};
