# AFK-Twitch-drops

A small app based on Puppeteer to watch Twitch and get drops.

## Capabilities

- Login via cookies
- Using multiple accounts
- Auto-claim drops
- Auto-find new streamers

## How to download

1. To clone and run this repository you'll need [Git](https://git-scm.com) and
   [Node.js](https://nodejs.org/en/download/) (which comes with [npm](http://npmjs.com)) installed on your computer.
2. From your command line

```bash
#Clone this repository
git clone https://github.com/awekrx/AFK-Twitch-drops.git
cd AFK-Twitch-drops
npm ci
```

## How to setup and start

1. Get twitch account token

    1. Login to Twitch account
    2. Open Inspector(F12) on site
    3. Find cookie storage
    4. Copy `auth-token` value

> Disclaimer: If you are using multiple accounts. Open them in incognito mode and don't log out of the session, just close the incognito browser.

2. Paste the token in the `config.json` file in the _tokens_ field (Select the tokens separated by commas if you want to
   view in multiple accounts)

3. Copy the path to the browser chrome or chromium and paste it into the _exec_ field in the `config.json`

4. Write the name of the desired in `game` game if you need drops.

5. Write in command line in this folder: `npm start`

```js

{
    //Path to Chrome
    "exec": "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
    //Account tokens
    "tokens": [""],
    //The parameter is needed to receive drops.
    "game": "The Cycle: Frontier",
}
```
