import proxyChain from 'proxy-chain'
import logging from 'improved-logging'
import Bot from './Bot.js'
import env from './env.js'


const tokens: string[] = env.TOKENS
const proxies: string[] = env.PROXIES

const smallestArray = Math.min(tokens.length, proxies.length)

for (let i = 0; i < smallestArray; i++) {
    const proxy = await proxyChain.anonymizeProxy(proxies[i])
    await new Bot(tokens[i], proxy).start()
}

logging.success('All bots started!')
