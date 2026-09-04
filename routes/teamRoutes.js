const express = require('express');
const bcrypt = require('bcryptjs');
const supabase = require('../config/supabaseClient');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/', authMiddleware, async (req, res) => {
  try {
    const { data: team, error } = await supabase
      .from('users')
      .select('id, name, email, role, role_title, department, status, created_at')
      .eq('organization_id', req.user.organizationId)
      .order('created_at', { ascending: false });

    if (error) return res.status(500).json({ error: error.message });

    res.json(team);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/', authMiddleware, async (req, res) => {
  try {
    const { name, email, password, roleTitle, department } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ error: 'name, email and password are required' });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const { data: newMember, error } = await supabase
      .from('users')
      .insert([{
        organization_id: req.user.organizationId,
        name,
        email,
        password_hash: passwordHash,
        role: 'employee',
        role_title: roleTitle || 'Team Member',
        department: department || 'Operations'
      }])
      .select('id, name, email, role, role_title, department, status, created_at')
      .single();

    if (error) return res.status(500).json({ error: error.message });

    res.status(201).json(newMember);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;