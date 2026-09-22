const { callModelJSON } = require('../config/aiClient');

const BASE_RULES = `You are the AI engine inside Scale IT OS, a B2B CRM used by small and mid-size companies in India.
Rules:
- Use ONLY the CRM data given to you. Never invent customers, numbers, dates or contacts.
- If the data is insufficient, say so in the output instead of guessing.
- Be concrete and short. Every sentence must be usable by a salesperson.
- Amounts are Indian Rupees (INR) unless a currency is stated.
- Reply with ONE valid JSON object and nothing else.`;

async function scoreLead(lead) {
  const system = `${BASE_RULES}

Task: score the sales lead from 0-100 on likelihood of converting.
Output schema:
{
  "score": <integer 0-100>,
  "confidence": <number 0-1>,
  "grade": "Hot" | "Warm" | "Cold",
  "factors": [<2-4 short strings, each citing a field from the data>],
  "risks": [<0-3 short strings>],
  "recommendedAction": <one sentence, a specific next step>
}`;
  const user = `Lead record:\n${JSON.stringify(lead, null, 2)}`;
  return callModelJSON({ system, user, maxTokens: 700 });
}

async function analyzeDealRisk(deal, activities = []) {
  const system = `${BASE_RULES}

Task: analyse the risk of this deal not closing.
Output schema:
{
  "riskLevel": "Low" | "Moderate" | "High",
  "riskScore": <integer 0-100, higher = more risk>,
  "insights": [<2-4 short strings grounded in the data>],
  "blockers": [<0-3 short strings>],
  "nextSteps": <one sentence>
}`;
  const user = `Deal record:\n${JSON.stringify(deal, null, 2)}\n\nRecent activities (may be empty):\n${JSON.stringify(activities, null, 2)}`;
  return callModelJSON({ system, user, maxTokens: 700 });
}

async function generateCustomerSummary(company, related = {}) {
  const system = `${BASE_RULES}

Task: write an executive summary of this customer for an account manager.
Output schema:
{
  "summary": <2-3 sentences>,
  "sentiment": "Positive" | "Neutral" | "At Risk",
  "healthScore": <integer 0-100>,
  "opportunities": [<1-3 short strings>]
}`;
  const user = `Company record:\n${JSON.stringify(company, null, 2)}\n\nRelated CRM data (contacts, deals, activities - may be partial):\n${JSON.stringify(related, null, 2)}`;
  return callModelJSON({ system, user, maxTokens: 700 });
}

async function askAssistant(question, snapshot) {
  const system = `${BASE_RULES}

Task: answer the user's question about their CRM using the snapshot provided.
- If the snapshot does not contain the answer, set "answer" to a short sentence saying which data is missing.
- Never reveal data from other organizations; the snapshot is already scoped to this one.
Output schema:
{
  "answer": <1-4 sentences>,
  "usedData": [<short strings naming which parts of the snapshot you used>],
  "suggestedFollowUps": [<0-3 short question strings>]
}`;
  const user = `Question: ${question}\n\nCRM snapshot for this organization:\n${JSON.stringify(snapshot, null, 2)}`;
  return callModelJSON({ system, user, maxTokens: 900 });
}

module.exports = { scoreLead, analyzeDealRisk, generateCustomerSummary, askAssistant };
