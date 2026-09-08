/**
 * Scale IT OS - Authentication & Session Service
 * Manages user sessions, active role validation, and tenant context.
 * Compatible with existing localStorage 'userRole' flow.
 */

window.ScaleIT = window.ScaleIT || {};

(function () {
    class AuthService {
        constructor() {
            this.storage = window.ScaleIT.StorageService;
        }

        /**
         * Get current logged-in role
         */
        getCurrentRole() {
            return localStorage.getItem('userRole') || null;
        }

        /**
         * Get current active tenant ID (organization)
         */
        getCurrentTenantId() {
            const role = this.getCurrentRole();
            if (role === 'company') {
                return 'org_northwind';
            }
            // Defaults to primary active organization Northstar Labs
            return 'org_northstar';
        }

        /**
         * Check if user is authenticated for a specific expected role
         */
        requireRole(expectedRole, redirectUrl = 'get-started.html') {
            const currentRole = this.getCurrentRole();
            if (!currentRole || currentRole !== expectedRole) {
                window.location.href = redirectUrl;
                return false;
            }
            return true;
        }

        /**
         * Get the active user's full profile
         */
        async getCurrentUser() {
    const stored = localStorage.getItem('currentUser');
    if (stored) {
        const user = JSON.parse(stored);
        const initials = (user.name || 'U')
            .split(' ')
            .map(n => n[0])
            .join('')
            .toUpperCase()
            .substring(0, 2);
        return { ...user, initials };
    }
    const role = this.getCurrentRole();
    if (!role) return null;
    return await this.storage.getUserProfile(role);
}
        /**
         * Update the active user's profile
         */
        async updateCurrentUser(updatedFields) {
            const role = this.getCurrentRole();
            if (!role) return null;
            return await this.storage.updateUserProfile(role, updatedFields);
        }

        /**
         * Verify current password (mock verification for development)
         */
        async verifyPassword(currentPassword) {
            // Safe simulated verification
            return currentPassword && currentPassword.length >= 6;
        }

        /**
         * Update user password
         */
        async changePassword(newPassword) {
            if (!newPassword || newPassword.length < 8) {
                throw new Error('Password must be at least 8 characters.');
            }
            // In a real system, send to backend API
            return true;
        }

        /**
 * Log user in - calls real backend API
 */
async login(email, password, targetDashboard) {
    try {
        const response = await fetch('http://localhost:3000/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || 'Login failed');
        }

        localStorage.setItem('userRole', data.user.role);
        localStorage.setItem('authToken', data.token);
        localStorage.setItem('currentUser', JSON.stringify(data.user));

        if (targetDashboard) {
            window.location.href = targetDashboard;
        }

        return data;
    } catch (err) {
        alert('Login failed: ' + err.message);
        throw err;
    }
}

        /**
         * Clear session and return to landing page
         */
        logout(redirectUrl = 'landing%20page.html') {
            localStorage.clear();
            window.location.href = redirectUrl;
        }
    }

    window.ScaleIT.AuthService = new AuthService();
})();
