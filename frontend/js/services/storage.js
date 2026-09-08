/**
 * Scale IT OS - Storage & Multi-Tenant Data Service
 * Provides an isolated, tenant-aware storage engine with API-ready asynchronous methods.
 * UI components must NEVER access localStorage directly; always go through this service.
 */

window.ScaleIT = window.ScaleIT || {};

(function () {
    const PREFIX = (window.ScaleIT.Config && window.ScaleIT.Config.STORAGE_PREFIX) || 'scale_it_';

    class StorageService {
        constructor() {
            this.initialized = false;
            this.init();
        }

        init() {
            if (this.initialized) return;
            this._seedInitialDataIfNeeded();
            this.initialized = true;
        }

        // --- Low-level Storage Operations ---

        getItem(key) {
            try {
                const data = localStorage.getItem(PREFIX + key);
                return data ? JSON.parse(data) : null;
            } catch (e) {
                console.error('[StorageService] Read error for key:', key, e);
                return null;
            }
        }

        setItem(key, value) {
            try {
                localStorage.setItem(PREFIX + key, JSON.stringify(value));
                return true;
            } catch (e) {
                console.error('[StorageService] Write error for key:', key, e);
                return false;
            }
        }

        removeItem(key) {
            try {
                localStorage.removeItem(PREFIX + key);
                return true;
            } catch (e) {
                console.error('[StorageService] Delete error for key:', key, e);
                return false;
            }
        }

        // --- Multi-Tenant Collection Helpers ---

        /**
         * Get a specific collection for a tenant (e.g. 'leads', 'deals', 'tasks')
         */
        async getTenantCollection(tenantId, collectionName) {
            const key = `tenant_${tenantId}_${collectionName}`;
            const data = this.getItem(key);
            return data || [];
        }

        /**
         * Overwrite a tenant collection
         */
        async setTenantCollection(tenantId, collectionName, items) {
            const key = `tenant_${tenantId}_${collectionName}`;
            return this.setItem(key, items);
        }

        /**
         * Get user profile by role or user ID
         */
        async getUserProfile(role) {
            const profiles = this.getItem('user_profiles') || {};
            return profiles[role] || null;
        }

        /**
         * Update user profile
         */
        async updateUserProfile(role, updatedFields) {
            const profiles = this.getItem('user_profiles') || {};
            if (!profiles[role]) {
                profiles[role] = {};
            }
            profiles[role] = { ...profiles[role], ...updatedFields, updatedAt: new Date().toISOString() };
            this.setItem('user_profiles', profiles);
            return profiles[role];
        }

        /**
         * Get all organizations registered on platform
         */
        async getOrganizations() {
            return this.getItem('organizations') || window.ScaleIT.Config.DEFAULT_TENANTS;
        }

        /**
         * Update an organization details
         */
        async updateOrganization(orgId, updatedFields) {
            const orgs = await this.getOrganizations();
            if (orgs[orgId]) {
                orgs[orgId] = { ...orgs[orgId], ...updatedFields };
                this.setItem('organizations', orgs);
                return orgs[orgId];
            }
            return null;
        }

        // --- Initial Mock Data Seeding ---

        _seedInitialDataIfNeeded() {
            // Seed Profiles
            if (!this.getItem('user_profiles')) {
                const initialProfiles = {
                    'organization': {
                        name: 'Maya Rivera',
                        initials: 'MR',
                        roleTitle: 'Organization Admin',
                        email: 'maya.rivera@northstarlabs.io',
                        phone: '+1 (555) 234-8901',
                        company: 'Northstar Labs',
                        tenantId: 'org_northstar',
                        department: 'Executive Operations',
                        status: 'Active'
                    },
                    'employee': {
                        name: 'Ari Reed',
                        initials: 'AR',
                        roleTitle: 'Operations Specialist',
                        email: 'ari.reed@northstarlabs.io',
                        phone: '+1 (555) 876-4321',
                        company: 'Northstar Labs',
                        tenantId: 'org_northstar',
                        team: 'Operations',
                        status: 'Active'
                    },
                    'company': {
                        name: 'Celeste Lumen',
                        initials: 'CL',
                        roleTitle: 'Client Representative',
                        email: 'celeste.lumen@northwind.com',
                        phone: '+1 (555) 432-7890',
                        company: 'Northwind',
                        tenantId: 'org_northwind',
                        status: 'Premium'
                    },
                    'scale-it-admin': {
                        name: 'Ava Stone',
                        initials: 'AS',
                        roleTitle: 'Platform Administrator',
                        email: 'ava.stone@scaleit.os',
                        phone: '+1 (555) 900-1122',
                        region: 'Global',
                        access: 'Full Platform Access',
                        status: 'Active'
                    }
                };
                this.setItem('user_profiles', initialProfiles);
            }

            // Seed Organizations
            if (!this.getItem('organizations')) {
                this.setItem('organizations', window.ScaleIT.Config.DEFAULT_TENANTS);
            }

            // Seed Northstar Labs Team Members
            const northstarTeamKey = 'tenant_org_northstar_team';
            if (!this.getItem(northstarTeamKey)) {
                this.setItem(northstarTeamKey, [
                    { id: 'usr_1', name: 'Maya Rivera', email: 'maya.rivera@northstarlabs.io', role: 'Organization Admin', department: 'Executive', status: 'Active', avatar: 'MR' },
                    { id: 'usr_2', name: 'Ari Reed', email: 'ari.reed@northstarlabs.io', role: 'Operations', department: 'Operations', status: 'Active', avatar: 'AR' },
                    { id: 'usr_3', name: 'Liam Vance', email: 'liam.vance@northstarlabs.io', role: 'Sales Lead', department: 'Sales', status: 'Active', avatar: 'LV' },
                    { id: 'usr_4', name: 'Elena Chen', email: 'elena.chen@northstarlabs.io', role: 'Product Manager', department: 'Product', status: 'Active', avatar: 'EC' },
                    { id: 'usr_5', name: 'Marcus Brody', email: 'marcus.brody@northstarlabs.io', role: 'Engineering Lead', department: 'Tech', status: 'Active', avatar: 'MB' }
                ]);
            }

            // Seed Employee Tasks (Ari Reed)
            const employeeTasksKey = 'tenant_org_northstar_tasks';
            if (!this.getItem(employeeTasksKey)) {
                this.setItem(employeeTasksKey, [
                    { id: 'tsk_1', title: 'Prepare Q3 Delivery Program roadmap', priority: 'High', dueDate: '2026-09-10', completed: false, category: 'Deliverables' },
                    { id: 'tsk_2', title: 'Review Northwind enterprise SLA agreement', priority: 'Urgent', dueDate: '2026-09-05', completed: false, category: 'Contracts' },
                    { id: 'tsk_3', title: 'Sync with frontend engineering team on CRM milestones', priority: 'Medium', dueDate: '2026-09-08', completed: true, category: 'Engineering' },
                    { id: 'tsk_4', title: 'Conduct quarterly system access audit', priority: 'Low', dueDate: '2026-09-20', completed: false, category: 'Security' },
                    { id: 'tsk_5', title: 'Update onboarding documentation for operations staff', priority: 'Medium', dueDate: '2026-09-15', completed: false, category: 'Operations' }
                ]);
            }

            // Seed Company Deliverables (Celeste Lumen / Northwind)
            const clientDeliverablesKey = 'tenant_org_northwind_deliverables';
            if (!this.getItem(clientDeliverablesKey)) {
                this.setItem(clientDeliverablesKey, [
                    { id: 'del_1', title: 'Intelligent Workflow Orchestrator v2.4', milestone: 'Milestone 1', status: 'Completed', deliveryDate: '2026-08-15', health: 'Healthy' },
                    { id: 'del_2', title: 'Enterprise Single Sign-On & Security Gateway', milestone: 'Milestone 2', status: 'In Progress', deliveryDate: '2026-09-18', health: 'On Track' },
                    { id: 'del_3', title: 'Automated Real-Time Telemetry Pipeline', milestone: 'Milestone 3', status: 'In Progress', deliveryDate: '2026-10-02', health: 'On Track' },
                    { id: 'del_4', title: 'Custom Analytics & Intelligence Dashboard', milestone: 'Milestone 4', status: 'Planned', deliveryDate: '2026-10-25', health: 'Pending' }
                ]);
            }

            // Seed Platform Admin Org Access overview
            const platformOrgsKey = 'platform_managed_orgs';
            if (!this.getItem(platformOrgsKey)) {
                this.setItem(platformOrgsKey, [
                    { id: 'org_northstar', name: 'Northstar Labs', plan: 'Professional', users: '12 / 15', status: 'Active', health: '99.98% SLA', mrr: '$4,200/mo' },
                    { id: 'org_northwind', name: 'Northwind Holdings', plan: 'Enterprise', users: '48 / 100', status: 'Active', health: '100% SLA', mrr: '$12,500/mo' },
                    { id: 'org_apex', name: 'Apex Digital Systems', plan: 'Business', users: '24 / 50', status: 'Active', health: '99.95% SLA', mrr: '$7,800/mo' },
                    { id: 'org_horizon', name: 'Horizon Cloud Dynamics', plan: 'Starter', users: '3 / 3', status: 'Active', health: '99.90% SLA', mrr: '$890/mo' },
                    { id: 'org_solaris', name: 'Solaris Healthtech', plan: 'Enterprise', users: '82 / 200', status: 'Active', health: '99.99% SLA', mrr: '$18,000/mo' }
                ]);
            }
        }
    }

    window.ScaleIT.StorageService = new StorageService();
})();
