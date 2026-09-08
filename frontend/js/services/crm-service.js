/**
 * Scale IT OS - Core CRM Service Foundation
 * Encapsulates multi-tenant CRM business logic for Leads, Contacts, Companies, Deals, and Tasks.
 * Fully decoupled from UI and API-ready for backend integration.
 */

window.ScaleIT = window.ScaleIT || {};

(function () {
    class CRMService {
        constructor() {
            this.storage = window.ScaleIT.StorageService;
            this.auth = window.ScaleIT.AuthService;
            this.entitlements = window.ScaleIT.EntitlementsService;
            this._ensureSeedCRMData();
        }

        getTenantId() {
            return this.auth.getCurrentTenantId();
        }

        // --- Leads Management ---

        async getLeads(filters = {}) {
            const tenantId = this.getTenantId();
            let leads = await this.storage.getTenantCollection(tenantId, 'leads');
            
            if (filters.status) {
                leads = leads.filter(l => l.status.toLowerCase() === filters.status.toLowerCase());
            }
            if (filters.search) {
                const s = filters.search.toLowerCase();
                leads = leads.filter(l => 
                    l.name.toLowerCase().includes(s) || 
                    l.company.toLowerCase().includes(s) || 
                    l.email.toLowerCase().includes(s)
                );
            }
            return leads;
        }

        async addLead(leadData) {
            const canAdd = await this.entitlements.canAccess('crm.leads');
            if (!canAdd) throw new Error('Leads module is not available on your plan.');

            const isLimitReached = await this.entitlements.isLimitReached('leads');
            if (isLimitReached) throw new Error('Lead limit reached for your current plan. Please upgrade.');

            const tenantId = this.getTenantId();
            const leads = await this.getLeads();
            
            const newLead = {
                id: 'lead_' + Date.now(),
                name: leadData.name,
                email: leadData.email,
                phone: leadData.phone || '',
                company: leadData.company || 'Independent',
                status: leadData.status || 'New',
                source: leadData.source || 'Website',
                value: Number(leadData.value) || 0,
                priority: leadData.priority || 'Medium',
                notes: leadData.notes || '',
                createdAt: new Date().toISOString()
            };

            leads.unshift(newLead);
            await this.storage.setTenantCollection(tenantId, 'leads', leads);
            return newLead;
        }

        async updateLead(leadId, updatedFields) {
            const tenantId = this.getTenantId();
            const leads = await this.getLeads();
            const idx = leads.findIndex(l => l.id === leadId);
            if (idx === -1) throw new Error('Lead not found.');

            leads[idx] = { ...leads[idx], ...updatedFields, updatedAt: new Date().toISOString() };
            await this.storage.setTenantCollection(tenantId, 'leads', leads);
            return leads[idx];
        }

        async deleteLead(leadId) {
            const tenantId = this.getTenantId();
            const leads = await this.getLeads();
            const filtered = leads.filter(l => l.id !== leadId);
            await this.storage.setTenantCollection(tenantId, 'leads', filtered);
            return true;
        }

        // --- Tasks Management ---

        async getTasks() {
            const tenantId = this.getTenantId();
            return await this.storage.getTenantCollection(tenantId, 'tasks');
        }

        async addTask(taskData) {
            const tenantId = this.getTenantId();
            const tasks = await this.getTasks();
            const newTask = {
                id: 'tsk_' + Date.now(),
                title: taskData.title,
                priority: taskData.priority || 'Medium',
                dueDate: taskData.dueDate || new Date().toISOString().split('T')[0],
                completed: false,
                category: taskData.category || 'General',
                createdAt: new Date().toISOString()
            };
            tasks.unshift(newTask);
            await this.storage.setTenantCollection(tenantId, 'tasks', tasks);
            return newTask;
        }

        async toggleTask(taskId) {
            const tenantId = this.getTenantId();
            const tasks = await this.getTasks();
            const task = tasks.find(t => t.id === taskId);
            if (task) {
                task.completed = !task.completed;
                await this.storage.setTenantCollection(tenantId, 'tasks', tasks);
                return task;
            }
            return null;
        }

        async deleteTask(taskId) {
            const tenantId = this.getTenantId();
            const tasks = await this.getTasks();
            const filtered = tasks.filter(t => t.id !== taskId);
            await this.storage.setTenantCollection(tenantId, 'tasks', filtered);
            return true;
        }

        // --- Team Management ---

        async getTeamMembers() {
            const tenantId = this.getTenantId();
            return await this.storage.getTenantCollection(tenantId, 'team');
        }

        async addTeamMember(memberData) {
            const tenantId = this.getTenantId();
            const team = await this.getTeamMembers();
            
            const initials = memberData.name
                .split(' ')
                .map(n => n[0])
                .join('')
                .toUpperCase()
                .substring(0, 2) || 'TM';

            const newMember = {
                id: 'usr_' + Date.now(),
                name: memberData.name,
                email: memberData.email,
                role: memberData.role || 'Member',
                department: memberData.department || 'Operations',
                status: 'Active',
                avatar: initials,
                joinedAt: new Date().toISOString()
            };

            team.push(newMember);
            await this.storage.setTenantCollection(tenantId, 'team', team);
            return newMember;
        }

        // --- Deliverables Management ---

        async getDeliverables() {
            const tenantId = this.getTenantId();
            return await this.storage.getTenantCollection(tenantId, 'deliverables');
        }

        // --- Pre-seeding CRM Core Data ---

        async _ensureSeedCRMData() {
            const tenantId = 'org_northstar';
            const existingLeads = await this.storage.getTenantCollection(tenantId, 'leads');
            if (!existingLeads || existingLeads.length === 0) {
                await this.storage.setTenantCollection(tenantId, 'leads', [
                    { id: 'lead_101', name: 'Alexander Wright', email: 'a.wright@vanguardtech.io', company: 'Vanguard Systems', status: 'Proposal', priority: 'High', value: 48000, source: 'Inbound' },
                    { id: 'lead_102', name: 'Sophia Sterling', email: 'sophia@cybercloud.net', company: 'CyberCloud Global', status: 'Qualified', priority: 'Urgent', value: 92000, source: 'Referral' },
                    { id: 'lead_103', name: 'Daniel Kross', email: 'dkross@nexuslogistics.com', company: 'Nexus Logistics', status: 'Negotiation', priority: 'High', value: 125000, source: 'Sales Outreach' },
                    { id: 'lead_104', name: 'Miriam Vance', email: 'm.vance@pulsebiotech.com', company: 'Pulse Biotech', status: 'Contacted', priority: 'Medium', value: 34000, source: 'Webinar' },
                    { id: 'lead_105', name: 'Julian Mercer', email: 'jmercer@quantumflow.ai', company: 'QuantumFlow AI', status: 'New', priority: 'Medium', value: 65000, source: 'Website' }
                ]);
            }
        }
    }

    window.ScaleIT.CRMService = new CRMService();
})();
