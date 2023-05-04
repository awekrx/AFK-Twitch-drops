import express, { Request, Response } from 'express'
import logging from 'improved-logging'
import fs from 'fs'
import path from 'path'
import getProxies, { getAnonProxy } from './Proxies.js'
import Bot from './Bot.js'
import env from './env.js'

const tokens: string[] = env.TOKENS
const proxies: string[] = await getProxies()
let bots: Bot[] = []

const app = express()

app.use(express.json())

app.get('/', (req: Request, res: Response) => {
    const filepath = path.join('resources', 'index.html')
    const file = fs.readFileSync(filepath, 'utf8')
    res.send(file)
})

app.get('/bots/running', (req: Request, res: Response) => {
    const runningBots = getRunningBots().length
    res.send(`Currently running ${runningBots} bots`)
})

function getRunningBots() {
    return bots.filter(bot => bot.status === 'running')
}


app.post('/bots/start', (req, res) => {
    bots.forEach(bot => {
        if (!bot.isRunning()) {
            bot.start()
        }
    })
    res.send('Started all bots')
})

app.post('/bots/stop', async (req, res) => {
    await stopBots()
    res.send('Stopped all bots')
})

app.post('/bots/chat/:message', (req: Request, res: Response) => {
    // const message = req.params.message
    // const randomBot = getRunningBots()[Math.floor(Math.random() * bots.length)]
    // if (!message) return res.send('No message provided')
    // if (!randomBot) return res.send('No bots running')
    // randomBot.chat(message)
    // logging.info(`Chat function executed on bots with message: ${message}`)
    // res.send('Chat function executed on bots with message: ' + message)
    res.send('Not implemented yet')
})


app.listen(3000, () => {
    logging.info('Server running on port 3000')
    respawnBots();
})


async function stopBots() {
    logging.important('Stopping all bots...')
    for (let i = 0; i < bots.length; i++) {
        const bot = bots[i]
        if (bot.isRunning())
            await bot.stop()
    }
    bots = []
    logging.success('All bots stopped!')
}

const smallestArray = Math.min(tokens.length, proxies.length + 1) // +1 because we don't need proxy for first bot
async function respawnBots() {
    logging.important(`Spawning ${smallestArray} bots...`)
    for (let i = 0; i < smallestArray; i++) {
        const proxy = await getAnonProxy(proxies, i)
        const newBot = new Bot(tokens[i], proxy, streamer)
        bots.push(newBot)
        await newBot.start()
    }
    logging.success('All bots started!')
}

