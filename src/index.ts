import proxyChain from 'proxy-chain'
import logging from 'improved-logging'
import Bot from './Bot.js'
import env from './env.js'


const tokens: string[] = env.TOKENS
const proxies: string[] = env.PROXIES

const smallestArray = Math.min(tokens.length, proxies.length + 1) // +1 because we don't need proxy for first bot
logging.important(`Starting ${smallestArray} bots...`)

for (let i = 0; i < smallestArray; i++) {
    const proxy = await getAnonProxy(i)
    await new Bot(tokens[i], proxy).start()
}

async function getAnonProxy(i: number): Promise<string | undefined> {
    if (i === 0) return undefined
    const proxy = proxies[i - 1]
    const anonProxy = await proxyChain.anonymizeProxy(proxy)
    logging.info(`Anonymizing proxy ${proxy} to ${anonProxy}`)
    return anonProxy
}

logging.success('All bots started!')
