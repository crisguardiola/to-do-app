const { GoogleGenerativeAI } = require('@google/generative-ai')

const GEMINI_SYSTEM_PROMPT = `You are a productivity assistant. The user will describe a goal or task. Break it down into 5 to 8 specific, clear, actionable to-do items. Return ONLY a valid JSON array of strings, no explanation, no markdown, just the raw JSON array.`

const jsonHeaders = { 'Content-Type': 'application/json' }

function jsonResponse(statusCode, data) {
  return {
    statusCode,
    headers: { ...jsonHeaders, 'Access-Control-Allow-Origin': '*' },
    body: JSON.stringify(data),
  }
}

exports.handler = async (event, context) => {
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
      body: '',
    }
  }

  if (event.httpMethod !== 'POST') {
    return jsonResponse(405, { error: 'Method not allowed.' })
  }

  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey) {
    return jsonResponse(503, { error: 'AI service is not configured.' })
  }

  let body
  try {
    body = typeof event.body === 'string' ? JSON.parse(event.body) : event.body || {}
  } catch {
    return jsonResponse(400, { error: 'Invalid JSON body.' })
  }

  const message = body.message
  if (typeof message !== 'string' || !message.trim()) {
    return jsonResponse(400, { error: 'Message is required.' })
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
      return jsonResponse(502, { error: 'Invalid response from AI.' })
    }
    const raw = response.text().trim()
    let parsed
    try {
      parsed = JSON.parse(raw)
    } catch {
      return jsonResponse(502, { error: 'Invalid response from AI.' })
    }
    if (!Array.isArray(parsed)) {
      return jsonResponse(502, { error: 'Invalid response from AI.' })
    }
    const tasks = parsed
      .filter((item) => typeof item === 'string')
      .map((s) => String(s).trim())
      .filter(Boolean)
    return jsonResponse(200, { tasks })
  } catch (err) {
    console.error('Gemini API error:', err?.message || err)
    const msg = String(err?.message || '')
    const apiKeyInvalid = msg.includes('API key not valid') || msg.includes('API_KEY_INVALID')
    const quotaExceeded = msg.includes('429') || msg.includes('quota') || msg.includes('Too Many Requests') || msg.includes('exceeded your current quota') || msg.includes('Quota exceeded')
    let error
    if (apiKeyInvalid) {
      error = 'Invalid Gemini API key. Please add a valid GEMINI_API_KEY to your .env file (get one at https://aistudio.google.com/apikey).'
    } else if (quotaExceeded) {
      error = "You've reached the free tier limit for the AI (about 20 requests per day). Try again tomorrow or check your plan: https://ai.google.dev/gemini-api/docs/rate-limits"
    } else {
      error = msg || "Sorry, I couldn't process that. Please try again later."
    }
    return jsonResponse(502, { error })
  }
}
