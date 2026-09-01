// Central storage service using localStorage
// All data persistence goes through this service

const STORAGE_KEYS = {
  SESSION: 'scaleit_session',
  USERS: 'scaleit_users',
  ORGANIZATIONS: 'scaleit_organizations',
  CUSTOMERS: 'scaleit_customers',
  LEADS: 'scaleit_leads',
  OPPORTUNITIES: 'scaleit_opportunities',
  TASKS: 'scaleit_tasks',
  INVOICES: 'scaleit_invoices',
  TEAM: 'scaleit_team',
  NOTIFICATIONS: 'scaleit_notifications',
  ACTIVITIES: 'scaleit_activities',
  NOTES: 'scaleit_notes',
  AUTOMATIONS: 'scaleit_automations',
  SETTINGS: 'scaleit_settings',
};

class StorageService {
  // Get data by key
  getData(key) {
    try {
      const data = localStorage.getItem(key);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error(`Error getting data for key ${key}:`, error);
      return null;
    }
  }

  // Set data
  setData(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (error) {
      console.error(`Error setting data for key ${key}:`, error);
      return false;
    }
  }

  // Update nested data
  updateData(key, updates) {
    try {
      const currentData = this.getData(key) || {};
      const updatedData = { ...currentData, ...updates };
      this.setData(key, updatedData);
      return updatedData;
    } catch (error) {
      console.error(`Error updating data for key ${key}:`, error);
      return null;
    }
  }

  // Delete data
  deleteData(key) {
    try {
      localStorage.removeItem(key);
      return true;
    } catch (error) {
      console.error(`Error deleting data for key ${key}:`, error);
      return false;
    }
  }

  // Clear all data
  clearData() {
    try {
      localStorage.clear();
      return true;
    } catch (error) {
      console.error('Error clearing storage:', error);
      return false;
    }
  }

  // Generate unique ID
  generateId() {
    return `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // Initialize demo data
  initializeDemoData() {
    // Check if data already exists
    if (this.getData(STORAGE_KEYS.ORGANIZATIONS)) {
      return;
    }

    // Create demo organizations
    const demoOrg = {
      id: this.generateId(),
      name: 'Scale IT OS Demo',
      email: 'demo@scaleitos.com',
      phone: '+1-800-123-4567',
      website: 'www.scaleit.com',
      industry: 'Technology',
      size: '50-100',
      location: 'San Francisco, CA',
      createdAt: new Date().toISOString(),
    };

    // Create demo users
    const demoUsers = [
      {
        id: this.generateId(),
        email: 'admin@scaleitos.com',
        password: 'admin123',
        firstName: 'Admin',
        lastName: 'User',
        role: 'Owner',
        organizationId: demoOrg.id,
      },
      {
        id: this.generateId(),
        email: 'sales@scaleitos.com',
        password: 'sales123',
        firstName: 'Sales',
        lastName: 'Agent',
        role: 'Sales',
        organizationId: demoOrg.id,
      },
      {
        id: this.generateId(),
        email: 'finance@scaleitos.com',
        password: 'finance123',
        firstName: 'Finance',
        lastName: 'Manager',
        role: 'Finance',
        organizationId: demoOrg.id,
      },
      {
        id: this.generateId(),
        email: 'employee@scaleitos.com',
        password: 'employee123',
        firstName: 'Employee',
        lastName: 'User',
        role: 'Employee',
        organizationId: demoOrg.id,
      },
    ];

    // Demo customers
    const demoCustomers = [
      {
        id: this.generateId(),
        organizationId: demoOrg.id,
        name: 'Tech Startup Inc',
        email: 'contact@techstartup.com',
        phone: '+1-555-001-0001',
        company: 'Tech Startup Inc',
        status: 'Active',
        tier: 'Premium',
        createdAt: new Date().toISOString(),
      },
      {
        id: this.generateId(),
        organizationId: demoOrg.id,
        name: 'Enterprise Solutions',
        email: 'sales@enterprise.com',
        phone: '+1-555-001-0002',
        company: 'Enterprise Solutions LLC',
        status: 'Active',
        tier: 'Enterprise',
        createdAt: new Date().toISOString(),
      },
    ];

    // Demo leads
    const demoLeads = [
      {
        id: this.generateId(),
        organizationId: demoOrg.id,
        name: 'John Smith',
        email: 'john@example.com',
        phone: '+1-555-002-0001',
        company: 'Innovation Corp',
        status: 'Qualified',
        score: 85,
        source: 'Website',
        createdAt: new Date().toISOString(),
      },
    ];

    // Demo tasks
    const demoTasks = [
      {
        id: this.generateId(),
        organizationId: demoOrg.id,
        title: 'Follow up with Tech Startup',
        description: 'Schedule a demo call',
        status: 'Pending',
        priority: 'High',
        assignedTo: demoUsers[1].id,
        dueDate: new Date(Date.now() + 86400000).toISOString(),
        createdAt: new Date().toISOString(),
      },
    ];

    // Demo invoices
    const demoInvoices = [
      {
        id: this.generateId(),
        organizationId: demoOrg.id,
        customerId: demoCustomers[0].id,
        invoiceNumber: 'INV-001',
        amount: 5000,
        status: 'Paid',
        dueDate: new Date().toISOString(),
        paidDate: new Date().toISOString(),
        createdAt: new Date().toISOString(),
      },
    ];

    // Save all demo data
    this.setData(STORAGE_KEYS.ORGANIZATIONS, [demoOrg]);
    this.setData(STORAGE_KEYS.USERS, demoUsers);
    this.setData(STORAGE_KEYS.CUSTOMERS, demoCustomers);
    this.setData(STORAGE_KEYS.LEADS, demoLeads);
    this.setData(STORAGE_KEYS.TASKS, demoTasks);
    this.setData(STORAGE_KEYS.INVOICES, demoInvoices);
    this.setData(STORAGE_KEYS.TEAM, demoUsers);

    console.log('Demo data initialized');
  }
}

export const storageService = new StorageService();
export { STORAGE_KEYS };
