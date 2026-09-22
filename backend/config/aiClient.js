require('dotenv').config();
const Anthropic = require('@anthropic-ai/sdk');

const apiKey = process.env.ANTHROPIC_API_KEY;

if (!apiKey) {
  console.warn('[aiClient] ANTHROPIC_API_KEY is missing in backend/.env - AI routes will return 503.');
}

const client = apiKey ? new Anthropic({ apiKey }) : null;

const MODEL = process.env.AI_MODEL || 'claude-sonnet-4-5';
const MAX_TOKENS = Number(process.env.AI_MAX_TOKENS || 800);
const TIMEOUT_MS = Number(process.env.AI_TIMEOUT_MS || 25000);

async function callModel({ system, user, maxTokens = MAX_TOKENS, temperature = 0.2 }) {
  if (!client) {
    const err = new Error('AI provider is not configured');
    err.status = 503;
    throw err;
  }

  const response = await client.messages.create(
    {
      model: MODEL,
      max_tokens: maxTokens,
      temperature,
      system,
      messages: [{ role: 'user', content: user }]
    },
    { timeout: TIMEOUT_MS }
  );

  return (response.content || [])
    .filter((block) => block.type === 'text')
    .map((block) => block.text)
    .join('\n')
    .trim();
}

async function callModelJSON({ system, user, maxTokens = MAX_TOKENS }) {
  const parse = (text) => {
    const cleaned = text.replace(/```json/gi, '').replace(/```/g, '').trim();
    const start = cleaned.indexOf('{');
    const end = cleaned.lastIndexOf('}');
    if (start === -1 || end === -1) throw new Error('No JSON object in model reply');
    return JSON.parse(cleaned.slice(start, end + 1));
  };

  const raw = await callModel({ system, user, maxTokens });
  try {
    return parse(raw);
  } catch (e) {
    const retry = await callModel({
      system: system + '\n\nCRITICAL: reply with ONE valid JSON object only. No prose, no markdown.',
      user,
      maxTokens
    });
    return parse(retry);
  }
}

module.exports = { callModel, callModelJSON, MODEL };