import 'dotenv/config'
import express from 'express'
import { GoogleGenerativeAI } from '@google/generative-ai'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const app = express()
const PORT = process.env.PORT || 3001

const GEMINI_SYSTEM_PROMPT = `You are a productivity assistant. The user will describe a goal or task. Break it down into 5 to 8 specific, clear, actionable to-do items. Return ONLY a valid JSON array of strings, no explanation, no markdown, just the raw JSON array.`

app.use(express.json())

app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', req.headers.origin || '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
  if (req.method === 'OPTIONS') return res.sendStatus(200)
  next()
})

app.post('/api/chat', async (req, res) => {
  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey) {
    return res.status(503).json({ error: 'AI service is not configured.' })
  }

  const message = req.body?.message
  if (typeof message !== 'string' || !message.trim()) {
    return res.status(400).json({ error: 'Message is required.' })
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKey)
    const model = genAI.getGenerativeModel({
      model: 'gemini-2.5-flash',
      systemInstruction: GEMINI_SYSTEM_PROMPT,
    })
    const result = await model.generateContent(message.trim())
    const response = result.response
    if (!response?.text) {
      return res.status(502).json({ error: 'Invalid response from AI.' })
    }
    const raw = response.text().trim()
    let parsed
    try {
      parsed = JSON.parse(raw)
    } catch (parseErr) {
      return res.status(502).json({ error: 'Invalid response from AI.' })
    }
    if (!Array.isArray(parsed)) {
      return res.status(502).json({ error: 'Invalid response from AI.' })
    }
    const tasks = parsed.filter((item) => typeof item === 'string').map((s) => String(s).trim()).filter(Boolean)
    return res.status(200).json({ tasks })
  } catch (err) {
    console.error('Gemini API error:', err?.message || err)
    const msg = String(err?.message || '')
    const apiKeyInvalid = msg.includes('API key not valid') || msg.includes('API_KEY_INVALID')
    const error = apiKeyInvalid
      ? 'Invalid Gemini API key. Please add a valid GEMINI_API_KEY to your .env file (get one at https://aistudio.google.com/apikey).'
      : 'Sorry, I couldn\'t process that. Please try again later.'
    return res.status(502).json({ error })
  }
})

if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, 'dist')))
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'dist', 'index.html'))
  })
}

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`)
  if (!process.env.GEMINI_API_KEY) {
    console.warn('Warning: GEMINI_API_KEY is not set. /api/chat will return 503.')
  }
})
