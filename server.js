import express from 'express';
import dotenv from 'dotenv';
import { prompts, personas } from './src/prompts.js';
import Groq from "groq-sdk";

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;
const model = "llama-3.1-8b-instant";

// Middleware
app.use(express.json({ limit: '1mb' }));
app.use(express.static('public'));

// Validate API 
if (!process.env.GROQ_API_KEY) {
  console.error("GROQ_API_KEY is missing in .env");
  process.exit(1);
}

const client = new Groq({
  apiKey: process.env.GROQ_API_KEY
});

// Get personas
app.get('/api/personas', (req, res) => {
  res.json({ personas });
});

// Chat endpoint
app.post('/api/chat', async (req, res) => {
  const { personaId, messages } = req.body || {};

  if (!personaId || !prompts[personaId]) {
    return res.status(400).json({ error: 'Unknown persona selected.' });
  }

  const systemPrompt = prompts[personaId];

  let conversation = Array.isArray(messages) ? messages : [];

  const MAX_MESSAGES = 20;
  conversation = conversation.slice(-MAX_MESSAGES);

  try {
    console.log("Incoming:", conversation);

    const completion = await client.chat.completions.create({
      model: model,
      temperature: 0.7,
      messages: [
        { role: "system", content: systemPrompt },
        ...conversation
      ]
    });

    console.log("Groq response received");

    const assistantMessage =
      completion.choices?.[0]?.message?.content || '';

    return res.json({ reply: assistantMessage });

  } catch (error) {
    console.error("Groq error:", error);

    return res.status(500).json({
      error: error.message || 'Chat service failed.'
    });
  }
});

// Start server
app.listen(port, () => {
  console.log(`Persona chat app running on http://localhost:${port}`);
});
