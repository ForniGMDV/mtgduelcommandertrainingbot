import express, { Express } from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
// @ts-ignore
import { WebSocketServer } from 'ws'
import http from 'http'
import gameRoutes from './routes/gameRoutes.js'
import decksRoutes from './routes/decksRoutes.js'

dotenv.config()

const app: Express = express()
const server = http.createServer(app)
const wss = new WebSocketServer({ server })

const PORT = process.env.PORT || 3001

app.use(cors())
app.use(express.json())

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' })
})

app.use('/api/games', gameRoutes)
app.use('/api/decks', decksRoutes)

wss.on('connection', (ws: any) => {
  console.log('WebSocket client connected')
  
  ws.on('message', (data: any) => {
    console.log('Received:', data)
  })
  
  ws.on('close', () => {
    console.log('WebSocket client disconnected')
  })
})

server.listen(PORT, () => {
  console.log(`Backend server running on port ${PORT}`)
})

export default app
