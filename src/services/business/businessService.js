import { storageService, STORAGE_KEYS } from '../storage/storageService';

class TaskService {
  // Get all tasks for organization
  getAll(organizationId) {
    const tasks = storageService.getData(STORAGE_KEYS.TASKS) || [];
    return tasks.filter(t => t.organizationId === organizationId);
  }

  // Get task by ID
  getById(taskId) {
    const tasks = storageService.getData(STORAGE_KEYS.TASKS) || [];
    return tasks.find(t => t.id === taskId);
  }

  // Create task
  create(organizationId, taskData) {
    try {
      const task = {
        id: storageService.generateId(),
        organizationId,
        ...taskData,
        createdAt: new Date().toISOString(),
      };

      const tasks = storageService.getData(STORAGE_KEYS.TASKS) || [];
      tasks.push(task);
      storageService.setData(STORAGE_KEYS.TASKS, tasks);

      return { success: true, task };
    } catch (error) {
      console.error('Create task error:', error);
      return { success: false, error: 'Failed to create task' };
    }
  }

  // Update task
  update(taskId, updates) {
    try {
      const tasks = storageService.getData(STORAGE_KEYS.TASKS) || [];
      const index = tasks.findIndex(t => t.id === taskId);

      if (index === -1) {
        return { success: false, error: 'Task not found' };
      }

      tasks[index] = {
        ...tasks[index],
        ...updates,
        updatedAt: new Date().toISOString(),
      };

      storageService.setData(STORAGE_KEYS.TASKS, tasks);
      return { success: true, task: tasks[index] };
    } catch (error) {
      console.error('Update task error:', error);
      return { success: false, error: 'Failed to update task' };
    }
  }

  // Delete task
  delete(taskId) {
    try {
      const tasks = storageService.getData(STORAGE_KEYS.TASKS) || [];
      const filtered = tasks.filter(t => t.id !== taskId);
      storageService.setData(STORAGE_KEYS.TASKS, filtered);
      return { success: true };
    } catch (error) {
      console.error('Delete task error:', error);
      return { success: false, error: 'Failed to delete task' };
    }
  }

  // Get tasks by user
  getByUser(userId) {
    const tasks = storageService.getData(STORAGE_KEYS.TASKS) || [];
    return tasks.filter(t => t.assignedTo === userId);
  }

  // Get pending tasks count
  getPendingCount(organizationId) {
    const tasks = this.getAll(organizationId);
    return tasks.filter(t => t.status === 'Pending' || t.status === 'In Progress').length;
  }

  // Get completed tasks count
  getCompletedCount(organizationId) {
    const tasks = this.getAll(organizationId);
    return tasks.filter(t => t.status === 'Completed').length;
  }
}

class InvoiceService {
  // Get all invoices for organization
  getAll(organizationId) {
    const invoices = storageService.getData(STORAGE_KEYS.INVOICES) || [];
    return invoices.filter(i => i.organizationId === organizationId);
  }

  // Get invoice by ID
  getById(invoiceId) {
    const invoices = storageService.getData(STORAGE_KEYS.INVOICES) || [];
    return invoices.find(i => i.id === invoiceId);
  }

  // Create invoice
  create(organizationId, invoiceData) {
    try {
      const invoice = {
        id: storageService.generateId(),
        organizationId,
        ...invoiceData,
        createdAt: new Date().toISOString(),
      };

      const invoices = storageService.getData(STORAGE_KEYS.INVOICES) || [];
      invoices.push(invoice);
      storageService.setData(STORAGE_KEYS.INVOICES, invoices);

      return { success: true, invoice };
    } catch (error) {
      console.error('Create invoice error:', error);
      return { success: false, error: 'Failed to create invoice' };
    }
  }

  // Update invoice
  update(invoiceId, updates) {
    try {
      const invoices = storageService.getData(STORAGE_KEYS.INVOICES) || [];
      const index = invoices.findIndex(i => i.id === invoiceId);

      if (index === -1) {
        return { success: false, error: 'Invoice not found' };
      }

      invoices[index] = {
        ...invoices[index],
        ...updates,
        updatedAt: new Date().toISOString(),
      };

      storageService.setData(STORAGE_KEYS.INVOICES, invoices);
      return { success: true, invoice: invoices[index] };
    } catch (error) {
      console.error('Update invoice error:', error);
      return { success: false, error: 'Failed to update invoice' };
    }
  }

  // Delete invoice
  delete(invoiceId) {
    try {
      const invoices = storageService.getData(STORAGE_KEYS.INVOICES) || [];
      const filtered = invoices.filter(i => i.id !== invoiceId);
      storageService.setData(STORAGE_KEYS.INVOICES, filtered);
      return { success: true };
    } catch (error) {
      console.error('Delete invoice error:', error);
      return { success: false, error: 'Failed to delete invoice' };
    }
  }

  // Get outstanding invoices
  getOutstanding(organizationId) {
    const invoices = this.getAll(organizationId);
    return invoices.filter(i => i.status !== 'Paid');
  }

  // Get overdue invoices
  getOverdue(organizationId) {
    const invoices = this.getAll(organizationId);
    const today = new Date();
    return invoices.filter(i => i.status !== 'Paid' && new Date(i.dueDate) < today);
  }

  // Get total revenue
  getTotalRevenue(organizationId) {
    const invoices = this.getAll(organizationId);
    return invoices
      .filter(i => i.status === 'Paid')
      .reduce((sum, i) => sum + (i.amount || 0), 0);
  }

  // Mark as paid
  markAsPaid(invoiceId) {
    return this.update(invoiceId, {
      status: 'Paid',
      paidDate: new Date().toISOString(),
    });
  }
}

export const taskService = new TaskService();
export const invoiceService = new InvoiceService();
