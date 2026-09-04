const express = require('express');
const supabase = require('../config/supabaseClient');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/', authMiddleware, async (req, res) => {
  try {
    const { title, value, stage, leadId, contactId, expectedCloseDate, probability, notes } = req.body;

    if (!title) {
      return res.status(400).json({ error: 'title is required' });
    }

    const { data: newDeal, error } = await supabase
      .from('deals')
      .insert([{
        organization_id: req.user.organizationId,
        title,
        value: value || 0,
        stage: stage || 'Qualification',
        lead_id: leadId || null,
        contact_id: contactId || null,
        expected_close_date: expectedCloseDate || null,
        probability: probability || 50,
        notes: notes || null
      }])
      .select()
      .single();

    if (error) return res.status(500).json({ error: error.message });

    res.status(201).json(newDeal);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/', authMiddleware, async (req, res) => {
  try {
    let query = supabase
      .from('deals')
      .select('*')
      .eq('organization_id', req.user.organizationId);

    if (req.query.stage) {
      query = query.eq('stage', req.query.stage);
    }

    const { data: deals, error } = await query.order('created_at', { ascending: false });

    if (error) return res.status(500).json({ error: error.message });

    res.json(deals);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.patch('/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const updates = { ...req.body, updated_at: new Date().toISOString() };

    const { data: updatedDeal, error } = await supabase
      .from('deals')
      .update(updates)
      .eq('id', id)
      .eq('organization_id', req.user.organizationId)
      .select()
      .single();

    if (error) return res.status(500).json({ error: error.message });
    if (!updatedDeal) return res.status(404).json({ error: 'Deal not found' });

    res.json(updatedDeal);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;

    const { error } = await supabase
      .from('deals')
      .delete()
      .eq('id', id)
      .eq('organization_id', req.user.organizationId);

    if (error) return res.status(500).json({ error: error.message });

    res.json({ message: 'Deal deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;