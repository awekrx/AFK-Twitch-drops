import proxyChain from 'proxy-chain'
import logging from 'improved-logging'

export default async function getAnonProxy(proxies: string[], i: number): Promise<string | undefined> {
    if (i === 0) return undefined
    const proxy = proxies[i - 1]
    const anonProxy = await proxyChain.anonymizeProxy(proxy)
    logging.info(`Anonymizing proxy ${proxy} to ${anonProxy}`)
    return anonProxy
}