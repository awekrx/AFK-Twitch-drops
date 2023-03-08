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
npm install
```

## How to setup and start

1. Get twitch account token

    1. Login to Twitch account
    2. Open Inspector(F12) on site
    3. Find cookie storage
    4. Copy `auth-token` value

> Disclaimer: If you are using multiple accounts. Open them in incognito mode and don't log out of the session, just close the incognito browser.

2. Paste the token in the `config.js` file in the _tokens_ field (Select the tokens separated by commas if you want to
   view in multiple accounts)

3. Copy the path to the browser chrome or chromium and paste it into the _exec_ field in the `config.js`

4. Write the name of the desired in `game` game if you need drops.

5. Write the name of the category in `category` to search for new streams (_required_)

6. Write in command line in this folder: `npm start`

```js

{
    //Path to Chrome
    "exec": "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
    //Account tokens
    "tokens": [""],
    //Preferred streamer
    "streamer": "",
    //Category to find new streamers. It must match the desired game if autodrops is true
    "category": "https://www.twitch.tv/directory/game/The%20Cycle%3A%20Frontier?sort=VIEWER_COUNT&tl=c2542d6d-cd10-4532-919b-3d19f30a768b",
    //The parameter is needed to receive drops. It must match the desired game if autodrops is true
    "game": "The Cycle: Frontier",
    //Сhange this if you want to see open browsers
    "browsers": false,
    //Automatic collection of drops
    "autodrops": true,
    //Automatic find new streamers if the stream is over, the program will end
    "autonewstreamer": true,
    //Automatic quality change to minimum
    "quality160p": true,
    //Automatic mute streamer in open browser mode
    "mutestreamer": true,
    //Automatic acceptance of adult streams
    "adultcontent": true,
    //Time between online checks, more than 60 seconds recommended
    "onlineinterval": 60000,
    //Time between drops checks, more than 60 seconds recommended
    "dropsinterval": 60000
}
```
