const express = require('express');
const supabase = require('../config/supabaseClient');
const authMiddleware = require('../middleware/authMiddleware');
const ai = require('../services/aiService');
const { MODEL } = require('../config/aiClient');

const router = express.Router();

const WINDOW_MS = 60 * 1000;
const MAX_CALLS_PER_WINDOW = Number(process.env.AI_RATE_LIMIT || 20);
const buckets = new Map();

function aiRateLimit(req, res, next) {
  const orgId = req.user.organizationId;
  const now = Date.now();
  const bucket = buckets.get(orgId) || { count: 0, resetAt: now + WINDOW_MS };
  if (now > bucket.resetAt) { bucket.count = 0; bucket.resetAt = now + WINDOW_MS; }
  bucket.count += 1;
  buckets.set(orgId, bucket);
  if (bucket.count > MAX_CALLS_PER_WINDOW) {
    return res.status(429).json({ error: 'AI request limit reached. Please wait a moment and try again.' });
  }
  next();
}

async function logUsage({ orgId, userId, feature, ok, ms, error }) {
  try {
    await supabase.from('ai_usage_logs').insert([{
      organization_id: orgId, user_id: userId || null, feature, model: MODEL,
      success: ok, duration_ms: ms, error_message: error || null
    }]);
  } catch (e) {
    console.error('[ai] usage log failed:', e.message);
  }
}

function handle(feature, fn) {
  return async (req, res) => {
    const started = Date.now();
    try {
      const result = await fn(req, res);
      await logUsage({ orgId: req.user.organizationId, userId: req.user.userId || req.user.id, feature, ok: true, ms: Date.now() - started });
      res.json({ feature, model: MODEL, ...result });
    } catch (err) {
      await logUsage({ orgId: req.user.organizationId, userId: req.user.userId || req.user.id, feature, ok: false, ms: Date.now() - started, error: err.message });
      console.error(`[ai:${feature}]`, err.message);
      res.status(err.status || 500).json({ error: err.message || 'AI request failed' });
    }
  };
}

router.use(authMiddleware, aiRateLimit);

router.post('/leads/:id/score', handle('lead_score', async (req) => {
  const { data: lead, error } = await supabase.from('leads').select('*')
    .eq('id', req.params.id).eq('organization_id', req.user.organizationId).single();
  if (error || !lead) { const e = new Error('Lead not found'); e.status = 404; throw e; }
  return ai.scoreLead(lead);
}));

router.post('/deals/:id/risk', handle('deal_risk', async (req) => {
  const { data: deal, error } = await supabase.from('deals').select('*')
    .eq('id', req.params.id).eq('organization_id', req.user.organizationId).single();
  if (error || !deal) { const e = new Error('Deal not found'); e.status = 404; throw e; }
  const { data: activities } = await supabase.from('activities').select('type, subject, notes, created_at')
    .eq('organization_id', req.user.organizationId).order('created_at', { ascending: false }).limit(10);
  return ai.analyzeDealRisk(deal, activities || []);
}));

router.post('/companies/:id/summary', handle('customer_summary', async (req) => {
  const { data: company, error } = await supabase.from('crm_companies').select('*')
    .eq('id', req.params.id).eq('organization_id', req.user.organizationId).single();
  if (error || !company) { const e = new Error('Company not found'); e.status = 404; throw e; }
  const [{ data: contacts }, { data: deals }] = await Promise.all([
    supabase.from('contacts').select('name, email, job_title').eq('organization_id', req.user.organizationId).limit(10),
    supabase.from('deals').select('title, value, stage, status').eq('organization_id', req.user.organizationId).limit(10)
  ]);
  return ai.generateCustomerSummary(company, { contacts: contacts || [], deals: deals || [] });
}));

router.post('/assistant', handle('assistant', async (req) => {
  const question = (req.body.question || '').toString().trim();
  if (!question) { const e = new Error('question is required'); e.status = 400; throw e; }
  if (question.length > 1000) { const e = new Error('question is too long (max 1000 characters)'); e.status = 400; throw e; }
  const orgId = req.user.organizationId;
  const [leads, deals, tasks, activities] = await Promise.all([
    supabase.from('leads').select('name, company, status, value, priority, source').eq('organization_id', orgId).order('created_at', { ascending: false }).limit(40),
    supabase.from('deals').select('title, value, stage, status, expected_close_date').eq('organization_id', orgId).order('created_at', { ascending: false }).limit(40),
    supabase.from('tasks').select('title, status, priority, due_date').eq('organization_id', orgId).order('created_at', { ascending: false }).limit(40),
    supabase.from('activities').select('type, subject, created_at').eq('organization_id', orgId).order('created_at', { ascending: false }).limit(20)
  ]);
  return ai.askAssistant(question, {
    leads: leads.data || [], deals: deals.data || [], tasks: tasks.data || [], recentActivities: activities.data || []
  });
}));

module.exports = router;
