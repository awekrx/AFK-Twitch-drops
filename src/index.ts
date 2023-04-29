import getAnonProxy from './anonProxy.js'
import logging from 'improved-logging'
import Bot from './Bot.js'
import env from './env.js'


const tokens: string[] = env.TOKENS
const proxies: string[] = env.PROXIES

const smallestArray = Math.min(tokens.length, proxies.length + 1) // +1 because we don't need proxy for first bot
logging.important(`Starting ${smallestArray} bots...`)

for (let i = 0; i < smallestArray; i++) {
    const proxy = await getAnonProxy(proxies, i)
    await new Bot(tokens[i], proxy).start()
}

logging.success('All bots started!')
