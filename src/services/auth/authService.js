import { storageService, STORAGE_KEYS } from '../storage/storageService';

class AuthService {
  // Login with email and password
  login(email, password) {
    try {
      const users = storageService.getData(STORAGE_KEYS.USERS) || [];
      const user = users.find(u => u.email === email && u.password === password);

      if (!user) {
        return { success: false, error: 'Invalid email or password' };
      }

      const session = {
        userId: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        organizationId: user.organizationId,
        loginTime: new Date().toISOString(),
      };

      storageService.setData(STORAGE_KEYS.SESSION, session);
      return { success: true, user: session };
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, error: 'Login failed' };
    }
  }

  // Logout
  logout() {
    storageService.deleteData(STORAGE_KEYS.SESSION);
    return true;
  }

  // Get current session
  getSession() {
    return storageService.getData(STORAGE_KEYS.SESSION);
  }

  // Check if user is logged in
  isLoggedIn() {
    return !!this.getSession();
  }

  // Get current user
  getCurrentUser() {
    const session = this.getSession();
    if (!session) return null;

    const users = storageService.getData(STORAGE_KEYS.USERS) || [];
    return users.find(u => u.id === session.userId);
  }

  // Signup (create new organization and owner)
  signup(organizationData, ownerData) {
    try {
      const orgId = storageService.generateId();
      const userId = storageService.generateId();

      const organization = {
        id: orgId,
        ...organizationData,
        createdAt: new Date().toISOString(),
      };

      const user = {
        id: userId,
        ...ownerData,
        password: ownerData.password,
        role: 'Owner',
        organizationId: orgId,
      };

      const organizations = storageService.getData(STORAGE_KEYS.ORGANIZATIONS) || [];
      organizations.push(organization);
      storageService.setData(STORAGE_KEYS.ORGANIZATIONS, organizations);

      const users = storageService.getData(STORAGE_KEYS.USERS) || [];
      users.push(user);
      storageService.setData(STORAGE_KEYS.USERS, users);

      return { success: true, organization, user };
    } catch (error) {
      console.error('Signup error:', error);
      return { success: false, error: 'Signup failed' };
    }
  }

  // Check permission
  hasPermission(permission) {
    const session = this.getSession();
    if (!session) return false;

    const permissions = {
      Owner: ['*'], // All permissions
      Admin: ['*'],
      Manager: ['dashboard.view', 'customers.view', 'leads.view', 'tasks.view', 'team.view'],
      Sales: ['dashboard.view', 'customers.view', 'customers.create', 'customers.edit', 'leads.view', 'leads.create', 'leads.edit', 'sales.view', 'tasks.view'],
      Finance: ['dashboard.view', 'customers.view', 'invoices.view', 'invoices.create', 'invoices.edit', 'tasks.view'],
      Employee: ['dashboard.view', 'customers.view', 'leads.view', 'tasks.view', 'tasks.edit'],
    };

    const userPermissions = permissions[session.role] || [];
    return userPermissions.includes('*') || userPermissions.includes(permission);
  }

  // Get all users for organization
  getOrganizationUsers(organizationId) {
    const users = storageService.getData(STORAGE_KEYS.USERS) || [];
    return users.filter(u => u.organizationId === organizationId);
  }
}

export const authService = new AuthService();
