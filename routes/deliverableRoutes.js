const express = require('express');
const supabase = require('../config/supabaseClient');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/', authMiddleware, async (req, res) => {
  try {
    const { data: deliverables, error } = await supabase
      .from('deliverables')
      .select('*')
      .eq('organization_id', req.user.organizationId)
      .order('created_at', { ascending: false });

    if (error) return res.status(500).json({ error: error.message });

    res.json(deliverables);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/', authMiddleware, async (req, res) => {
  try {
    const { title, milestone, status, deliveryDate, health } = req.body;

    if (!title) {
      return res.status(400).json({ error: 'title is required' });
    }

    const { data: newDeliverable, error } = await supabase
      .from('deliverables')
      .insert([{
        organization_id: req.user.organizationId,
        title,
        milestone: milestone || null,
        status: status || 'Planned',
        delivery_date: deliveryDate || null,
        health: health || 'Pending'
      }])
      .select()
      .single();

    if (error) return res.status(500).json({ error: error.message });

    res.status(201).json(newDeliverable);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;