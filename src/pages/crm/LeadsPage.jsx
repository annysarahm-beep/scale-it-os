import { useState, useEffect } from 'react';
import { leadService } from '../../services/crm/crmService';
import { authService } from '../../services/auth/authService';
import './LeadsPage.css';

export function LeadsPage() {
  const [leads, setLeads] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const session = authService.getSession();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    status: 'New',
    score: 50,
    source: 'Website'
  });

  useEffect(() => {
    loadLeads();
  }, []);

  const loadLeads = () => {
    if (session && session.organizationId) {
      const leadsData = leadService.getAll(session.organizationId);
      setLeads(leadsData);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'score' ? parseInt(value) : value
    }));
  };

  const handleAddLead = (e) => {
    e.preventDefault();
    if (session && session.organizationId) {
      const result = leadService.create(session.organizationId, formData);
      if (result.success) {
        setLeads(prev => [...prev, result.lead]);
        setFormData({
          name: '',
          email: '',
          phone: '',
          company: '',
          status: 'New',
          score: 50,
          source: 'Website'
        });
        setShowForm(false);
      }
    }
  };

  const handleDeleteLead = (leadId) => {
    const result = leadService.delete(leadId);
    if (result.success) {
      setLeads(prev => prev.filter(l => l.id !== leadId));
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      'New': '#3b82f6',
      'Contacted': '#8b5cf6',
      'Qualified': '#10b981',
      'Lost': '#ef4444'
    };
    return colors[status] || '#666';
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Leads</h1>
        <button className="btn-primary" onClick={() => setShowForm(!showForm)}>
          {showForm ? '✕ Close' : '+ Add Lead'}
        </button>
      </div>

      {showForm && (
        <div className="form-container">
          <form onSubmit={handleAddLead} className="lead-form">
            <div className="form-row">
              <div className="form-group">
                <label>Name</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Lead name"
                  required
                />
              </div>
              <div className="form-group">
                <label>Email</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="Email address"
                  required
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Phone</label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  placeholder="Phone number"
                />
              </div>
              <div className="form-group">
                <label>Company</label>
                <input
                  type="text"
                  name="company"
                  value={formData.company}
                  onChange={handleInputChange}
                  placeholder="Company name"
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Status</label>
                <select name="status" value={formData.status} onChange={handleInputChange}>
                  <option>New</option>
                  <option>Contacted</option>
                  <option>Qualified</option>
                  <option>Lost</option>
                </select>
              </div>
              <div className="form-group">
                <label>Lead Score</label>
                <input
                  type="number"
                  name="score"
                  min="0"
                  max="100"
                  value={formData.score}
                  onChange={handleInputChange}
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group full-width">
                <label>Source</label>
                <select name="source" value={formData.source} onChange={handleInputChange}>
                  <option>Website</option>
                  <option>Referral</option>
                  <option>Event</option>
                  <option>Social Media</option>
                  <option>Cold Call</option>
                </select>
              </div>
            </div>

            <div className="form-actions">
              <button type="submit" className="btn-primary">Add Lead</button>
              <button type="button" className="btn-secondary" onClick={() => setShowForm(false)}>Cancel</button>
            </div>
          </form>
        </div>
      )}

      <table className="data-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Company</th>
            <th>Status</th>
            <th>Score</th>
            <th>Source</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {leads.map(lead => (
            <tr key={lead.id}>
              <td>{lead.name}</td>
              <td>{lead.email}</td>
              <td>{lead.company}</td>
              <td>
                <span style={{
                  padding: '4px 12px',
                  borderRadius: '4px',
                  backgroundColor: getStatusColor(lead.status),
                  color: 'white',
                  fontSize: '12px',
                  fontWeight: 'bold'
                }}>
                  {lead.status}
                </span>
              </td>
              <td>{lead.score}/100</td>
              <td>{lead.source}</td>
              <td>
                <button
                  className="btn-delete"
                  onClick={() => handleDeleteLead(lead.id)}
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {leads.length === 0 && !showForm && (
        <div className="empty-state">
          <p>No leads found. Click "+ Add Lead" to create your first lead.</p>
        </div>
      )}
    </div>
  );
}
