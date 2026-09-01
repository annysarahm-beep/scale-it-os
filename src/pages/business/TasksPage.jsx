import { useState, useEffect } from 'react';
import { taskService } from '../../services/business/businessService';
import { authService } from '../../services/auth/authService';
import './TasksPage.css';

export function TasksPage() {
  const [tasks, setTasks] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const session = authService.getSession();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    status: 'Pending',
    priority: 'Medium',
    dueDate: ''
  });

  useEffect(() => {
    loadTasks();
  }, []);

  const loadTasks = () => {
    if (session && session.organizationId) {
      const tasksData = taskService.getAll(session.organizationId);
      setTasks(tasksData);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAddTask = (e) => {
    e.preventDefault();
    if (session && session.organizationId) {
      const result = taskService.create(session.organizationId, formData);
      if (result.success) {
        setTasks(prev => [...prev, result.task]);
        setFormData({
          title: '',
          description: '',
          status: 'Pending',
          priority: 'Medium',
          dueDate: ''
        });
        setShowForm(false);
      }
    }
  };

  const handleDeleteTask = (taskId) => {
    const result = taskService.delete(taskId);
    if (result.success) {
      setTasks(prev => prev.filter(t => t.id !== taskId));
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      'Pending': '#f59e0b',
      'In Progress': '#3b82f6',
      'Completed': '#10b981',
      'Overdue': '#ef4444'
    };
    return colors[status] || '#666';
  };

  const getPriorityColor = (priority) => {
    const colors = {
      'Low': '#10b981',
      'Medium': '#f59e0b',
      'High': '#ef4444'
    };
    return colors[priority] || '#666';
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Tasks</h1>
        <button className="btn-primary" onClick={() => setShowForm(!showForm)}>
          {showForm ? '✕ Close' : '+ Create Task'}
        </button>
      </div>

      {showForm && (
        <div className="form-container">
          <form onSubmit={handleAddTask} className="task-form">
            <div className="form-row">
              <div className="form-group full-width">
                <label>Title</label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  placeholder="Task title"
                  required
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group full-width">
                <label>Description</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Task description"
                  rows="4"
                ></textarea>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Status</label>
                <select name="status" value={formData.status} onChange={handleInputChange}>
                  <option>Pending</option>
                  <option>In Progress</option>
                  <option>Completed</option>
                  <option>Overdue</option>
                </select>
              </div>
              <div className="form-group">
                <label>Priority</label>
                <select name="priority" value={formData.priority} onChange={handleInputChange}>
                  <option>Low</option>
                  <option>Medium</option>
                  <option>High</option>
                </select>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group full-width">
                <label>Due Date</label>
                <input
                  type="date"
                  name="dueDate"
                  value={formData.dueDate}
                  onChange={handleInputChange}
                />
              </div>
            </div>

            <div className="form-actions">
              <button type="submit" className="btn-primary">Create Task</button>
              <button type="button" className="btn-secondary" onClick={() => setShowForm(false)}>Cancel</button>
            </div>
          </form>
        </div>
      )}

      <table className="data-table">
        <thead>
          <tr>
            <th>Title</th>
            <th>Description</th>
            <th>Status</th>
            <th>Priority</th>
            <th>Due Date</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {tasks.map(task => (
            <tr key={task.id}>
              <td><strong>{task.title}</strong></td>
              <td>{task.description || '-'}</td>
              <td>
                <span style={{
                  padding: '4px 12px',
                  borderRadius: '4px',
                  backgroundColor: getStatusColor(task.status),
                  color: 'white',
                  fontSize: '12px',
                  fontWeight: 'bold'
                }}>
                  {task.status}
                </span>
              </td>
              <td>
                <span style={{
                  padding: '4px 12px',
                  borderRadius: '4px',
                  backgroundColor: getPriorityColor(task.priority),
                  color: 'white',
                  fontSize: '12px',
                  fontWeight: 'bold'
                }}>
                  {task.priority}
                </span>
              </td>
              <td>{task.dueDate || '-'}</td>
              <td>
                <button
                  className="btn-delete"
                  onClick={() => handleDeleteTask(task.id)}
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {tasks.length === 0 && !showForm && (
        <div className="empty-state">
          <p>No tasks found. Click "+ Create Task" to add your first task.</p>
        </div>
      )}
    </div>
  );
}
