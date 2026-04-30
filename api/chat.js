import express from 'express';
import { prompts, personas } from '../src/prompts.js';
import Groq from "groq-sdk";
import serverless from "serverless-http";

const app = express();
const model = "llama-3.1-8b-instant";

app.use(express.json({ limit: '1mb' }));

if (!process.env.GROQ_API_KEY) {
  throw new Error("Missing GROQ_API_KEY");
}

const client = new Groq({
  apiKey: process.env.GROQ_API_KEY
});

// routes (NO /api prefix)
app.get('/personas', (req, res) => {
  res.json({ personas });
});

app.post('/chat', async (req, res) => {
  const { personaId, messages } = req.body || {};

  if (!personaId || !prompts[personaId]) {
    return res.status(400).json({ error: 'Unknown persona selected.' });
  }

  const systemPrompt = prompts[personaId];
  let conversation = Array.isArray(messages) ? messages : [];

  conversation = conversation.slice(-20);

  try {
    const completion = await client.chat.completions.create({
      model,
      temperature: 0.7,
      messages: [
        { role: "system", content: systemPrompt },
        ...conversation
      ]
    });

    return res.json({
      reply: completion.choices?.[0]?.message?.content || ''
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({
      error: error.message || 'Chat failed'
    });
  }
});

export default serverless(app);