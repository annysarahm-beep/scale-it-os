import { useEffect, useState } from 'react';
import { authService } from '../../services/auth/authService';
import { customerService } from '../../services/crm/crmService';
import { leadService } from '../../services/crm/crmService';
import { taskService } from '../../services/business/businessService';
import { invoiceService } from '../../services/business/businessService';
import './DashboardPage.css';

export function DashboardPage() {
  const session = authService.getSession();
  const [stats, setStats] = useState({
    totalCustomers: 0,
    totalLeads: 0,
    qualifiedLeads: 0,
    pipelineValue: 0,
    wonRevenue: 0,
    pendingTasks: 0,
    completedTasks: 0,
    outstandingInvoices: 0,
    overdueInvoices: 0,
    totalRevenue: 0,
  });

  useEffect(() => {
    if (!session) return;
    
    const orgId = session.organizationId;

    const customers = customerService.getAll(orgId);
    const leads = leadService.getAll(orgId);
    const tasks = taskService.getAll(orgId);
    const invoices = invoiceService.getAll(orgId);

    const qualifiedLeads = leads.filter(l => l.status === 'Qualified').length;
    const outstandingInvoices = invoices.filter(i => i.status !== 'Paid').length;
    const overdueInvoices = invoiceService.getOverdue(orgId).length;

    setStats({
      totalCustomers: customers.length,
      totalLeads: leads.length,
      qualifiedLeads,
      pipelineValue: 50000,
      wonRevenue: 125000,
      pendingTasks: taskService.getPendingCount(orgId),
      completedTasks: taskService.getCompletedCount(orgId),
      outstandingInvoices,
      overdueInvoices,
      totalRevenue: invoiceService.getTotalRevenue(orgId),
    });
  }, []);

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1>Welcome, {session.firstName}!</h1>
        <p className="dashboard-subtitle">You're logged in as <strong>{session.role}</strong></p>
      </div>

      <div className="stats-grid">
        <StatCard
          title="Total Customers"
          value={stats.totalCustomers}
          icon="👥"
          color="blue"
        />
        <StatCard
          title="Total Leads"
          value={stats.totalLeads}
          icon="📈"
          color="green"
        />
        <StatCard
          title="Qualified Leads"
          value={stats.qualifiedLeads}
          icon="⭐"
          color="orange"
        />
        <StatCard
          title="Pipeline Value"
          value={`$${stats.pipelineValue.toLocaleString()}`}
          icon="💰"
          color="purple"
        />
        <StatCard
          title="Won Revenue"
          value={`$${stats.wonRevenue.toLocaleString()}`}
          icon="🏆"
          color="gold"
        />
        <StatCard
          title="Pending Tasks"
          value={stats.pendingTasks}
          icon="✅"
          color="red"
        />
        <StatCard
          title="Completed Tasks"
          value={stats.completedTasks}
          icon="✔️"
          color="green"
        />
        <StatCard
          title="Outstanding Invoices"
          value={stats.outstandingInvoices}
          icon="📄"
          color="blue"
        />
        <StatCard
          title="Overdue Invoices"
          value={stats.overdueInvoices}
          icon="⚠️"
          color="red"
        />
        <StatCard
          title="Total Revenue"
          value={`$${stats.totalRevenue.toLocaleString()}`}
          icon="💳"
          color="green"
        />
      </div>

      <div className="dashboard-sections">
        <section className="dashboard-section">
          <h2>Quick Actions</h2>
          <div className="quick-actions">
            <button className="action-btn">+ Add Customer</button>
            <button className="action-btn">+ Add Lead</button>
            <button className="action-btn">+ Create Task</button>
            <button className="action-btn">+ New Invoice</button>
          </div>
        </section>

        <section className="dashboard-section">
          <h2>Recent Activities</h2>
          <p className="empty-state">No recent activities</p>
        </section>
      </div>
    </div>
  );
}

function StatCard({ title, value, icon, color }) {
  return (
    <div className={`stat-card stat-${color}`}>
      <div className="stat-icon">{icon}</div>
      <div className="stat-content">
        <h3>{title}</h3>
        <p className="stat-value">{value}</p>
      </div>
    </div>
  );
}
