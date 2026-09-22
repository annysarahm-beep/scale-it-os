import { useState, useEffect } from 'react';
import { invoiceService } from '../../services/business/businessService';
import { authService } from '../../services/auth/authService';
import './InvoicesPage.css';

export function InvoicesPage() {
  const [invoices, setInvoices] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const session = authService.getSession();
  const [formData, setFormData] = useState({
    invoiceNumber: '',
    customerId: '',
    amount: '',
    status: 'Draft',
    dueDate: ''
  });

  useEffect(() => {
    loadInvoices();
  }, []);

  const loadInvoices = () => {
    if (session && session.organizationId) {
      const invoicesData = invoiceService.getAll(session.organizationId);
      setInvoices(invoicesData);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'amount' ? parseFloat(value) : value
    }));
  };

  const handleAddInvoice = (e) => {
    e.preventDefault();
    if (session && session.organizationId) {
      const result = invoiceService.create(session.organizationId, formData);
      if (result.success) {
        setInvoices(prev => [...prev, result.invoice]);
        setFormData({
          invoiceNumber: '',
          customerId: '',
          amount: '',
          status: 'Draft',
          dueDate: ''
        });
        setShowForm(false);
      }
    }
  };

  const handleDeleteInvoice = (invoiceId) => {
    const result = invoiceService.delete(invoiceId);
    if (result.success) {
      setInvoices(prev => prev.filter(inv => inv.id !== invoiceId));
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      'Draft': '#6b7280',
      'Sent': '#3b82f6',
      'Paid': '#10b981',
      'Overdue': '#ef4444'
    };
    return colors[status] || '#666';
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Invoices</h1>
        <button className="btn-primary" onClick={() => setShowForm(!showForm)}>
          {showForm ? '✕ Close' : '+ New Invoice'}
        </button>
      </div>

      {showForm && (
        <div className="form-container">
          <form onSubmit={handleAddInvoice} className="invoice-form">
            <div className="form-row">
              <div className="form-group">
                <label>Invoice Number</label>
                <input
                  type="text"
                  name="invoiceNumber"
                  value={formData.invoiceNumber}
                  onChange={handleInputChange}
                  placeholder="INV-001"
                  required
                />
              </div>
              <div className="form-group">
                <label>Customer</label>
                <input
                  type="text"
                  name="customerId"
                  value={formData.customerId}
                  onChange={handleInputChange}
                  placeholder="Customer ID"
                  required
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Amount</label>
                <input
                  type="number"
                  name="amount"
                  value={formData.amount}
                  onChange={handleInputChange}
                  placeholder="0.00"
                  step="0.01"
                  required
                />
              </div>
              <div className="form-group">
                <label>Status</label>
                <select name="status" value={formData.status} onChange={handleInputChange}>
                  <option>Draft</option>
                  <option>Sent</option>
                  <option>Paid</option>
                  <option>Overdue</option>
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
              <button type="submit" className="btn-primary">Create Invoice</button>
              <button type="button" className="btn-secondary" onClick={() => setShowForm(false)}>Cancel</button>
            </div>
          </form>
        </div>
      )}

      <table className="data-table">
        <thead>
          <tr>
            <th>Invoice #</th>
            <th>Customer</th>
            <th>Amount</th>
            <th>Status</th>
            <th>Due Date</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {invoices.map(invoice => (
            <tr key={invoice.id}>
              <td><strong>{invoice.invoiceNumber}</strong></td>
              <td>{invoice.customerId}</td>
              <td>${parseFloat(invoice.amount).toFixed(2)}</td>
              <td>
                <span style={{
                  padding: '4px 12px',
                  borderRadius: '4px',
                  backgroundColor: getStatusColor(invoice.status),
                  color: 'white',
                  fontSize: '12px',
                  fontWeight: 'bold'
                }}>
                  {invoice.status}
                </span>
              </td>
              <td>{invoice.dueDate || '-'}</td>
              <td>
                <button
                  className="btn-delete"
                  onClick={() => handleDeleteInvoice(invoice.id)}
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {invoices.length === 0 && !showForm && (
        <div className="empty-state">
          <p>No invoices found. Click "+ New Invoice" to create your first invoice.</p>
        </div>
      )}
    </div>
  );
}
