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
         * Log user in and set role
         */
        login(role, targetDashboard) {
            localStorage.setItem('userRole', role);
            if (targetDashboard) {
                window.location.href = targetDashboard;
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
