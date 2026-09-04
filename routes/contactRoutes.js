const express = require('express');
const supabase = require('../config/supabaseClient');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/', authMiddleware, async (req, res) => {
  try {
    const { name, email, phone, company, jobTitle, notes } = req.body;

    if (!name) {
      return res.status(400).json({ error: 'name is required' });
    }

    const { data: newContact, error } = await supabase
      .from('contacts')
      .insert([{
        organization_id: req.user.organizationId,
        name,
        email: email || null,
        phone: phone || null,
        company: company || null,
        job_title: jobTitle || null,
        notes: notes || null
      }])
      .select()
      .single();

    if (error) return res.status(500).json({ error: error.message });

    res.status(201).json(newContact);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/', authMiddleware, async (req, res) => {
  try {
    let query = supabase
      .from('contacts')
      .select('*')
      .eq('organization_id', req.user.organizationId);

    if (req.query.search) {
      query = query.or(`name.ilike.%${req.query.search}%,company.ilike.%${req.query.search}%,email.ilike.%${req.query.search}%`);
    }

    const { data: contacts, error } = await query.order('created_at', { ascending: false });

    if (error) return res.status(500).json({ error: error.message });

    res.json(contacts);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.patch('/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const updates = { ...req.body, updated_at: new Date().toISOString() };

    const { data: updatedContact, error } = await supabase
      .from('contacts')
      .update(updates)
      .eq('id', id)
      .eq('organization_id', req.user.organizationId)
      .select()
      .single();

    if (error) return res.status(500).json({ error: error.message });
    if (!updatedContact) return res.status(404).json({ error: 'Contact not found' });

    res.json(updatedContact);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;

    const { error } = await supabase
      .from('contacts')
      .delete()
      .eq('id', id)
      .eq('organization_id', req.user.organizationId);

    if (error) return res.status(500).json({ error: error.message });

    res.json({ message: 'Contact deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;