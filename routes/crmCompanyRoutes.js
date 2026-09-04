const express = require('express');
const supabase = require('../config/supabaseClient');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/', authMiddleware, async (req, res) => {
  try {
    const { name, industry, website, phone, address, size, notes } = req.body;

    if (!name) {
      return res.status(400).json({ error: 'name is required' });
    }

    const { data: newCompany, error } = await supabase
      .from('crm_companies')
      .insert([{
        organization_id: req.user.organizationId,
        name,
        industry: industry || null,
        website: website || null,
        phone: phone || null,
        address: address || null,
        size: size || null,
        notes: notes || null
      }])
      .select()
      .single();

    if (error) return res.status(500).json({ error: error.message });

    res.status(201).json(newCompany);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/', authMiddleware, async (req, res) => {
  try {
    let query = supabase
      .from('crm_companies')
      .select('*')
      .eq('organization_id', req.user.organizationId);

    if (req.query.search) {
      query = query.ilike('name', `%${req.query.search}%`);
    }

    const { data: companies, error } = await query.order('created_at', { ascending: false });

    if (error) return res.status(500).json({ error: error.message });

    res.json(companies);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.patch('/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const updates = { ...req.body, updated_at: new Date().toISOString() };

    const { data: updatedCompany, error } = await supabase
      .from('crm_companies')
      .update(updates)
      .eq('id', id)
      .eq('organization_id', req.user.organizationId)
      .select()
      .single();

    if (error) return res.status(500).json({ error: error.message });
    if (!updatedCompany) return res.status(404).json({ error: 'Company not found' });

    res.json(updatedCompany);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;

    const { error } = await supabase
      .from('crm_companies')
      .delete()
      .eq('id', id)
      .eq('organization_id', req.user.organizationId);

    if (error) return res.status(500).json({ error: error.message });

    res.json({ message: 'Company deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;