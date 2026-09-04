const express = require('express');
const supabase = require('../config/supabaseClient');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/', authMiddleware, async (req, res) => {
  try {
    const { type, description, leadId, contactId, dealId } = req.body;

    if (!description) {
      return res.status(400).json({ error: 'description is required' });
    }

    const { data: newActivity, error } = await supabase
      .from('activities')
      .insert([{
        organization_id: req.user.organizationId,
        type: type || 'Note',
        description,
        lead_id: leadId || null,
        contact_id: contactId || null,
        deal_id: dealId || null,
        performed_by: req.user.userId
      }])
      .select()
      .single();

    if (error) return res.status(500).json({ error: error.message });

    res.status(201).json(newActivity);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/', authMiddleware, async (req, res) => {
  try {
    const { data: activities, error } = await supabase
      .from('activities')
      .select('*')
      .eq('organization_id', req.user.organizationId)
      .order('created_at', { ascending: false });

    if (error) return res.status(500).json({ error: error.message });

    res.json(activities);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;