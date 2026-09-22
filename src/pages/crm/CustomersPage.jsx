import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../../services/auth/authService';
import { customerService } from '../../services/crm/crmService';
import './CustomersPage.css';

export function CustomersPage() {
  const navigate = useNavigate();
  const session = authService.getSession();
  const [customers, setCustomers] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    status: 'Active',
    tier: 'Standard',
  });

  const loadCustomers = () => {
    if (!session) return;
    const data = customerService.getAll(session.organizationId);
    setCustomers(data);
  };

  useEffect(() => {
    loadCustomers();
  }, []);

  const handleAddCustomer = (e) => {
    e.preventDefault();
    const result = customerService.create(session.organizationId, formData);
    if (result.success) {
      setCustomers(prev => [...prev, result.customer]);
      setFormData({
        name: '',
        email: '',
        phone: '',
        company: '',
        status: 'Active',
        tier: 'Standard',
      });
      setShowForm(false);
    }
  };

  const handleDeleteCustomer = (customerId) => {
    if (window.confirm('Are you sure you want to delete this customer?')) {
      customerService.delete(customerId);
      setCustomers(prev => prev.filter(c => c.id !== customerId));
    }
  };

  return (
    <div className="customers-container">
      <div className="page-header">
        <h1>Customers</h1>
        <button
          className="btn-primary"
          onClick={() => setShowForm(!showForm)}
        >
          + Add Customer
        </button>
      </div>

      {showForm && (
        <form className="customer-form" onSubmit={handleAddCustomer}>
          <div className="form-row">
            <div className="form-group">
              <label>Name</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>
            <div className="form-group">
              <label>Email</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Phone</label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label>Company</label>
              <input
                type="text"
                value={formData.company}
                onChange={(e) => setFormData({ ...formData, company: e.target.value })}
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Status</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              >
                <option>Active</option>
                <option>Inactive</option>
              </select>
            </div>
            <div className="form-group">
              <label>Tier</label>
              <select
                value={formData.tier}
                onChange={(e) => setFormData({ ...formData, tier: e.target.value })}
              >
                <option>Standard</option>
                <option>Premium</option>
                <option>Enterprise</option>
              </select>
            </div>
          </div>

          <div className="form-actions">
            <button type="submit" className="btn-primary">Save Customer</button>
            <button type="button" className="btn-secondary" onClick={() => setShowForm(false)}>Cancel</button>
          </div>
        </form>
      )}

      <div className="customers-list">
        {customers.length === 0 ? (
          <p className="empty-state">No customers yet. Add your first customer!</p>
        ) : (
          <table className="customers-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Company</th>
                <th>Status</th>
                <th>Tier</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {customers.map((customer) => (
                <tr key={customer.id}>
                  <td>
                    <a href={`/crm/customers/${customer.id}`} className="link">
                      {customer.name}
                    </a>
                  </td>
                  <td>{customer.email}</td>
                  <td>{customer.company}</td>
                  <td>
                    <span className={`status-badge status-${customer.status.toLowerCase()}`}>
                      {customer.status}
                    </span>
                  </td>
                  <td>{customer.tier}</td>
                  <td>
                    <button
                      className="btn-delete"
                      onClick={() => handleDeleteCustomer(customer.id)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
