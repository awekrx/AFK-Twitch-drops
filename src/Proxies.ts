import proxyChain from 'proxy-chain'
import logging from 'improved-logging'
import axios from 'axios'
import env from './env.js'

export async function getAnonProxy(proxies: string[], i: number): Promise<string | undefined> {
    if (i === 0) return undefined
    const proxy = proxies[i - 1]
    const anonProxy = await proxyChain.anonymizeProxy(proxy)
    logging.info(`Anonymizing proxy ${proxy} to ${anonProxy}`)
    return anonProxy
}

export default async function getProxies(): Promise<string[]> {
    const PROXY_API_KEY = env.PROXY_API_KEY
    const url = `https://proxy-seller.io/personal/api/v1/${PROXY_API_KEY}/proxy/list/`

    const response = await axios(url)
    const ipv4ProxiesArray = response.data.data.ipv4
    const proxies = ipv4ProxiesArray.map((proxy: any) => {
        //http://services0D3dL:iLpwgrgtWX@185.121.12.104:50100
        return `http://${proxy.login}:${proxy.password}@${proxy.ip}:${proxy.port_http}`
    })
    logging.success(`Got ${proxies.length} proxies from proxy-seller.io`)
    return proxies
}
