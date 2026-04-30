import { prompts } from '../src/prompts.js';
import Groq from 'groq-sdk';

const model = 'llama-3.1-8b-instant';

export default async function handler(req, res) {
  if (!process.env.GROQ_API_KEY) {
    res.status(500).json({ error: 'Missing GROQ_API_KEY' });
    return;
  }

  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const { personaId, messages } = req.body || {};

  if (!personaId || !prompts[personaId]) {
    res.status(400).json({ error: 'Unknown persona selected.' });
    return;
  }

  const systemPrompt = prompts[personaId];
  const conversation = Array.isArray(messages) ? messages.slice(-20) : [];

  try {
    const client = new Groq({
      apiKey: process.env.GROQ_API_KEY,
    });

    const completion = await client.chat.completions.create({
      model,
      temperature: 0.7,
      messages: [{ role: 'system', content: systemPrompt }, ...conversation],
    });

    res.status(200).json({
      reply: completion.choices?.[0]?.message?.content || '',
    });
  } catch (error) {
    console.error('Groq error:', error);
    res.status(500).json({
      error: error.message || 'Chat failed',
    });
  }
}