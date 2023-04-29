import Bot from './Bot.js'
import proxyChain from 'proxy-chain'
import env from './env.js'


const tokens: string[] = env.TOKENS
const proxies: string[] = env.PROXIES

const smallestArray = Math.min(tokens.length, proxies.length)

for (let i = 0; i < smallestArray; i++) {
    const proxy = await proxyChain.anonymizeProxy(proxies[i])
    await new Bot(tokens[i], proxy).start()
}

console.log('All bots started!')
