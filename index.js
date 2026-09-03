const express = require('express');
const bcrypt = require('bcryptjs');
const supabase = require('./supabaseClient');
const authMiddleware = require('./authMiddleware');

const app = express();
const PORT = 3000;

app.use(express.json());

app.get('/', (req, res) => {
  res.send('Scale IT OS backend is running!');
});

app.post('/signup', async (req, res) => {
  try {
    const { organizationName, ownerEmail, password, industry } = req.body;

    if (!organizationName || !ownerEmail || !password) {
      return res.status(400).json({ error: 'organizationName, ownerEmail and password are required' });
    }

    const { data: newOrg, error: orgError } = await supabase
      .from('organizations')
      .insert([{ name: organizationName, owner_email: ownerEmail, industry: industry || null }])
      .select()
      .single();

    if (orgError) {
      return res.status(500).json({ error: orgError.message });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const { data: newUser, error: userError } = await supabase
      .from('users')
      .insert([{
        organization_id: newOrg.id,
        name: organizationName,
        email: ownerEmail,
        password_hash: passwordHash,
        role: 'organization',
        role_title: 'Organization Admin'
      }])
      .select()
      .single();

    if (userError) {
      return res.status(500).json({ error: userError.message });
    }

    res.status(201).json({
      message: 'Organization and admin user created successfully',
      organization: newOrg,
      user: { id: newUser.id, name: newUser.name, email: newUser.email, role: newUser.role }
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
const jwt = require('jsonwebtoken');

app.post('/login', async (req, res) => {
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

// Create a new task
app.post('/tasks', authMiddleware, async (req, res) => {
  try {
    const { title, category, priority, dueDate, assignedTo } = req.body;

    if (!title) {
      return res.status(400).json({ error: 'title is required' });
    }

    const { data: newTask, error } = await supabase
      .from('tasks')
      .insert([{
        organization_id: req.user.organizationId,
        assigned_to: assignedTo || req.user.userId,
        title,
        category: category || 'General',
        priority: priority || 'Medium',
        due_date: dueDate || null
      }])
      .select()
      .single();

    if (error) return res.status(500).json({ error: error.message });

    res.status(201).json(newTask);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get all tasks for the logged-in user's organization
app.get('/tasks', authMiddleware, async (req, res) => {
  try {
    const { data: tasks, error } = await supabase
      .from('tasks')
      .select('*')
      .eq('organization_id', req.user.organizationId)
      .order('created_at', { ascending: false });

    if (error) return res.status(500).json({ error: error.message });

    res.json(tasks);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update a task (e.g. mark complete, change status/priority)
app.patch('/tasks/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const { data: updatedTask, error } = await supabase
      .from('tasks')
      .update(updates)
      .eq('id', id)
      .eq('organization_id', req.user.organizationId)
      .select()
      .single();

    if (error) return res.status(500).json({ error: error.message });
    if (!updatedTask) return res.status(404).json({ error: 'Task not found' });

    res.json(updatedTask);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete a task
app.delete('/tasks/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;

    const { error } = await supabase
      .from('tasks')
      .delete()
      .eq('id', id)
      .eq('organization_id', req.user.organizationId);

    if (error) return res.status(500).json({ error: error.message });

    res.json({ message: 'Task deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create a new lead
app.post('/leads', authMiddleware, async (req, res) => {
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

// Get all leads for the logged-in user's organization (with optional filters)
app.get('/leads', authMiddleware, async (req, res) => {
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

// Update a lead
app.patch('/leads/:id', authMiddleware, async (req, res) => {
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

// Delete a lead
app.delete('/leads/:id', authMiddleware, async (req, res) => {
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

// Get all team members (users) in the logged-in user's organization
app.get('/team', authMiddleware, async (req, res) => {
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

// Add a new team member (employee) to the logged-in user's organization
app.post('/team', authMiddleware, async (req, res) => {
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

// Get all deliverables for the logged-in user's organization
app.get('/deliverables', authMiddleware, async (req, res) => {
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

// Create a new deliverable
app.post('/deliverables', authMiddleware, async (req, res) => {
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

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});