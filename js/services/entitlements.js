/**
 * Scale IT OS - Centralized Entitlements & Subscription Service
 * Decouples feature availability, resource limits, and tier upgrades from UI views.
 * Call canAccess(featureKey) or getLimit(resourceKey) instead of checking plan strings directly.
 */

window.ScaleIT = window.ScaleIT || {};

(function () {
    class EntitlementsService {
        constructor() {
            this.config = window.ScaleIT.Config;
            this.auth = window.ScaleIT.AuthService;
            this.storage = window.ScaleIT.StorageService;
        }

        /**
         * Get current organization subscription plan object
         */
        async getCurrentPlan() {
            const tenantId = this.auth.getCurrentTenantId();
            const orgs = await this.storage.getOrganizations();
            const org = orgs[tenantId] || orgs['org_northstar'];
            const planId = (org && org.planId) || 'professional';
            
            const pkgKey = planId.toUpperCase();
            return this.config.PACKAGES[pkgKey] || this.config.PACKAGES.PROFESSIONAL;
        }

        /**
         * Check if current tenant has access to a specific feature key
         * Example: canAccess('crm.leads'), canAccess('crm.aiAssistant'), canAccess('crm.teamAccess')
         */
        async canAccess(featureKey) {
            const plan = await this.getCurrentPlan();
            return plan.features.includes(featureKey);
        }

        /**
         * Get the numeric limit for a resource on current plan
         * Example: getLimit('leads'), getLimit('users'), getLimit('aiActions')
         */
        async getLimit(resourceKey) {
            const plan = await this.getCurrentPlan();
            return (plan.limits && plan.limits[resourceKey]) !== undefined ? plan.limits[resourceKey] : Infinity;
        }

        /**
         * Get current usage count for a resource
         */
        async getUsage(resourceKey) {
            const tenantId = this.auth.getCurrentTenantId();
            const collection = await this.storage.getTenantCollection(tenantId, resourceKey);
            return Array.isArray(collection) ? collection.length : 0;
        }

        /**
         * Check if tenant has exceeded plan limit for a resource
         */
        async isLimitReached(resourceKey) {
            const limit = await this.getLimit(resourceKey);
            const usage = await this.getUsage(resourceKey);
            return usage >= limit;
        }

        /**
         * Upgrade organization to a new package plan
         */
        async upgradePlan(newPlanId) {
            const tenantId = this.auth.getCurrentTenantId();
            return await this.storage.updateOrganization(tenantId, { planId: newPlanId });
        }
    }

    window.ScaleIT.EntitlementsService = new EntitlementsService();
})();
