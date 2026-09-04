const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const supabase = require('../config/supabaseClient');

const router = express.Router();

router.post('/signup', async (req, res) => {
  try {
   const { organizationName, adminFullName, ownerEmail, phoneNumber, password } = req.body;

if (!organizationName || !adminFullName || !ownerEmail || !password) {
  return res.status(400).json({ error: 'organizationName, adminFullName, ownerEmail and password are required' });
}

const { data: newOrg, error: orgError } = await supabase
  .from('organizations')
  .insert([{ name: organizationName, owner_email: ownerEmail }])
  .select()
  .single();

if (orgError) return res.status(500).json({ error: orgError.message });

const passwordHash = await bcrypt.hash(password, 10);

const { data: newUser, error: userError } = await supabase
  .from('users')
  .insert([{
    organization_id: newOrg.id,
    name: adminFullName,
    email: ownerEmail,
    phone: phoneNumber || null,
    password_hash: passwordHash,
    role: 'organization',
    role_title: 'Organization Admin'
  }])
  .select()
  .single();

    if (userError) return res.status(500).json({ error: userError.message });

    res.status(201).json({
      message: 'Organization and admin user created successfully',
      organization: newOrg,
      user: { id: newUser.id, name: newUser.name, email: newUser.email, role: newUser.role }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'email and password are required' });
    }

    const { data: user, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single();

    if (userError || !user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const isPasswordCorrect = await bcrypt.compare(password, user.password_hash);

    if (!isPasswordCorrect) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const token = jwt.sign(
      { userId: user.id, organizationId: user.organization_id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      message: 'Login successful',
      token: token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        organization_id: user.organization_id
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;