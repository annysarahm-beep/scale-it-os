const express = require('express');
const supabase = require('../config/supabaseClient');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/', authMiddleware, async (req, res) => {
  try {
    const { name, email, phone, company, status, source, value, priority, notes } = req.body;

    if (!name) {
      return res.status(400).json({ error: 'name is required' });
    }

    const { data: newLead, error } = await supabase
      .from('leads')
      .insert([{
        organization_id: req.user.organizationId,
        name,
        email: email || null,
        phone: phone || null,
        company: company || 'Independent',
        status: status || 'New',
        source: source || 'Website',
        value: value || 0,
        priority: priority || 'Medium',
        notes: notes || null
      }])
      .select()
      .single();

    if (error) return res.status(500).json({ error: error.message });

    res.status(201).json(newLead);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/', authMiddleware, async (req, res) => {
  try {
    let query = supabase
      .from('leads')
      .select('*')
      .eq('organization_id', req.user.organizationId);

    if (req.query.status) {
      query = query.eq('status', req.query.status);
    }
    if (req.query.search) {
      query = query.or(`name.ilike.%${req.query.search}%,company.ilike.%${req.query.search}%,email.ilike.%${req.query.search}%`);
    }

    const { data: leads, error } = await query.order('created_at', { ascending: false });

    if (error) return res.status(500).json({ error: error.message });

    res.json(leads);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.patch('/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const updates = { ...req.body, updated_at: new Date().toISOString() };

    const { data: updatedLead, error } = await supabase
      .from('leads')
      .update(updates)
      .eq('id', id)
      .eq('organization_id', req.user.organizationId)
      .select()
      .single();

    if (error) return res.status(500).json({ error: error.message });
    if (!updatedLead) return res.status(404).json({ error: 'Lead not found' });

    res.json(updatedLead);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;

    const { error } = await supabase
      .from('leads')
      .delete()
      .eq('id', id)
      .eq('organization_id', req.user.organizationId);

    if (error) return res.status(500).json({ error: error.message });

    res.json({ message: 'Lead deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;