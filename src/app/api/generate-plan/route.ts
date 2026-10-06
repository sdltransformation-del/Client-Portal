import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  const { prompt, clientName } = await req.json()
  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) return NextResponse.json({ error: 'ANTHROPIC_API_KEY not set in .env.local' }, { status: 500 })

  const systemPrompt = `You are a physical rehabilitation and fitness coach. Given a description of a workout plan, return a structured JSON plan. The plan name should be brief (e.g. "Bodyweight Strength Program"). Each workout has a name and a list of exercises with sets, reps, duration, and notes fields. Return ONLY valid JSON — no markdown, no explanation.

Format:
{
  "planName": "string",
  "description": "string (1-2 sentences)",
  "workouts": [
    {
      "name": "Workout A",
      "exercises": [
        { "name": "Exercise name", "sets": "3", "reps": "10", "duration": null, "notes": "any coaching cues" }
      ]
    }
  ]
}`

  const userMessage = `Client: ${clientName}\n\nPlan description: ${prompt}`

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 2048,
      system: systemPrompt,
      messages: [{ role: 'user', content: userMessage }],
    }),
  })

  if (!response.ok) {
    const err = await response.text()
    return NextResponse.json({ error: err }, { status: 500 })
  }

  const data = await response.json()
  let text = data.content?.[0]?.text || ''
  // Strip markdown code fences if present
  text = text.replace(/^```(?:json)?\s*/i, '').replace(/\s*```\s*$/, '').trim()
  try {
    const plan = JSON.parse(text)
    return NextResponse.json(plan)
  } catch {
    return NextResponse.json({ error: 'Failed to parse AI response', raw: text }, { status: 500 })
  }
}
