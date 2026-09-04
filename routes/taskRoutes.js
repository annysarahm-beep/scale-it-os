const express = require('express');
const supabase = require('../config/supabaseClient');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/', authMiddleware, async (req, res) => {
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

router.get('/', authMiddleware, async (req, res) => {
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

router.patch('/:id', authMiddleware, async (req, res) => {
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

router.delete('/:id', authMiddleware, async (req, res) => {
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

module.exports = router;