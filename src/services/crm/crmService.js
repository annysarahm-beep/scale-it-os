import { storageService, STORAGE_KEYS } from '../storage/storageService';

class CustomerService {
  // Get all customers for organization
  getAll(organizationId) {
    const customers = storageService.getData(STORAGE_KEYS.CUSTOMERS) || [];
    return customers.filter(c => c.organizationId === organizationId);
  }

  // Get customer by ID
  getById(customerId) {
    const customers = storageService.getData(STORAGE_KEYS.CUSTOMERS) || [];
    return customers.find(c => c.id === customerId);
  }

  // Create customer
  create(organizationId, customerData) {
    try {
      const customer = {
        id: storageService.generateId(),
        organizationId,
        ...customerData,
        createdAt: new Date().toISOString(),
      };

      const customers = storageService.getData(STORAGE_KEYS.CUSTOMERS) || [];
      customers.push(customer);
      storageService.setData(STORAGE_KEYS.CUSTOMERS, customers);

      return { success: true, customer };
    } catch (error) {
      console.error('Create customer error:', error);
      return { success: false, error: 'Failed to create customer' };
    }
  }

  // Update customer
  update(customerId, updates) {
    try {
      const customers = storageService.getData(STORAGE_KEYS.CUSTOMERS) || [];
      const index = customers.findIndex(c => c.id === customerId);

      if (index === -1) {
        return { success: false, error: 'Customer not found' };
      }

      customers[index] = {
        ...customers[index],
        ...updates,
        updatedAt: new Date().toISOString(),
      };

      storageService.setData(STORAGE_KEYS.CUSTOMERS, customers);
      return { success: true, customer: customers[index] };
    } catch (error) {
      console.error('Update customer error:', error);
      return { success: false, error: 'Failed to update customer' };
    }
  }

  // Delete customer
  delete(customerId) {
    try {
      const customers = storageService.getData(STORAGE_KEYS.CUSTOMERS) || [];
      const filtered = customers.filter(c => c.id !== customerId);
      storageService.setData(STORAGE_KEYS.CUSTOMERS, filtered);
      return { success: true };
    } catch (error) {
      console.error('Delete customer error:', error);
      return { success: false, error: 'Failed to delete customer' };
    }
  }
}

class LeadService {
  // Get all leads for organization
  getAll(organizationId) {
    const leads = storageService.getData(STORAGE_KEYS.LEADS) || [];
    return leads.filter(l => l.organizationId === organizationId);
  }

  // Get lead by ID
  getById(leadId) {
    const leads = storageService.getData(STORAGE_KEYS.LEADS) || [];
    return leads.find(l => l.id === leadId);
  }

  // Create lead
  create(organizationId, leadData) {
    try {
      const lead = {
        id: storageService.generateId(),
        organizationId,
        ...leadData,
        createdAt: new Date().toISOString(),
      };

      const leads = storageService.getData(STORAGE_KEYS.LEADS) || [];
      leads.push(lead);
      storageService.setData(STORAGE_KEYS.LEADS, leads);

      return { success: true, lead };
    } catch (error) {
      console.error('Create lead error:', error);
      return { success: false, error: 'Failed to create lead' };
    }
  }

  // Update lead
  update(leadId, updates) {
    try {
      const leads = storageService.getData(STORAGE_KEYS.LEADS) || [];
      const index = leads.findIndex(l => l.id === leadId);

      if (index === -1) {
        return { success: false, error: 'Lead not found' };
      }

      leads[index] = {
        ...leads[index],
        ...updates,
        updatedAt: new Date().toISOString(),
      };

      storageService.setData(STORAGE_KEYS.LEADS, leads);
      return { success: true, lead: leads[index] };
    } catch (error) {
      console.error('Update lead error:', error);
      return { success: false, error: 'Failed to update lead' };
    }
  }

  // Delete lead
  delete(leadId) {
    try {
      const leads = storageService.getData(STORAGE_KEYS.LEADS) || [];
      const filtered = leads.filter(l => l.id !== leadId);
      storageService.setData(STORAGE_KEYS.LEADS, filtered);
      return { success: true };
    } catch (error) {
      console.error('Delete lead error:', error);
      return { success: false, error: 'Failed to delete lead' };
    }
  }

  // Convert lead to customer
  convertToCustomer(leadId, organizationId) {
    try {
      const lead = this.getById(leadId);
      if (!lead) {
        return { success: false, error: 'Lead not found' };
      }

      const customerData = {
        name: lead.name,
        email: lead.email,
        phone: lead.phone,
        company: lead.company,
        status: 'Active',
        tier: 'Standard',
      };

      const customerResult = new CustomerService().create(organizationId, customerData);
      if (customerResult.success) {
        this.delete(leadId);
      }

      return customerResult;
    } catch (error) {
      console.error('Convert lead error:', error);
      return { success: false, error: 'Failed to convert lead' };
    }
  }
}

export const customerService = new CustomerService();
export const leadService = new LeadService();
