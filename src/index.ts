import express, { Request, Response } from 'express'
import logging from 'improved-logging'
import fs from 'fs'
import path from 'path'
import getProxies, { getAnonProxy } from './Proxies.js'
import Bot from './Bot.js'
import env from './env.js'

const proxiesFromServer: string[] | undefined = await getProxies()
if (!proxiesFromServer) {
    logging.error('No proxies found, exiting')
    process.exit(1)
}
const proxies = proxiesFromServer || []


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

const totalBotsNumber = proxies.length + 1
async function respawnBots() {
    logging.important(`Spawning ${totalBotsNumber} bots...`)
    for (let i = 0; i < totalBotsNumber; i++) {
        const proxy = await getAnonProxy(proxies, i)
        const newBot = new Bot(proxy)
        bots.push(newBot)
        await newBot.start()
    }
    logging.success('All bots started!')
}

