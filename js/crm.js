/**
 * Scale IT OS - CRM UI Controller
 * Orchestrates CRM Shell interactions, Overview KPI calculations, module preview states,
 * and entitlement validation strictly through the Phase 1 service layer.
 */

window.ScaleIT = window.ScaleIT || {};

(function () {
    class CRMController {
        constructor() {
            this.auth = window.ScaleIT.AuthService;
            this.entitlements = window.ScaleIT.EntitlementsService;
            this.crm = window.ScaleIT.CRMService;
            this.modals = window.ScaleIT.Modals;
            this.notifications = window.ScaleIT.Notifications;
            this.activeTab = 'overview';
        }

        async init() {
            // 1. Session & Role Verification
            if (!this.auth) return;
            const role = this.auth.getCurrentRole();
            if (!role) {
                window.location.href = 'get-started.html';
                return;
            }

            // 2. Populate Header & User Profile
            await this.renderHeader();

            // 3. Populate Plan Entitlements & Capacity Meter
            await this.renderPlanMeters();

            // 4. Render Overview View (KPIs, Leads stream, Tasks)
            await this.renderOverview();

            // 5. Attach Event Listeners
            this.bindEvents();
        }

        /**
         * Render tenant branding and authenticated user information in header
         */
        async renderHeader() {
            try {
                const user = await this.auth.getCurrentUser();
                const tenantId = this.auth.getCurrentTenantId();
                const plan = await this.entitlements.getCurrentPlan();

                // Tenant name
                const tenantNameEl = document.getElementById('header-tenant-name');
                if (tenantNameEl) {
                    tenantNameEl.textContent = tenantId === 'org_northwind' ? 'Northwind Traders' : 'Northstar Labs';
                }

                // Plan badge
                const planBadgeEl = document.getElementById('header-plan-badge');
                if (planBadgeEl && plan) {
                    planBadgeEl.textContent = `${plan.badge || plan.name} Tier`;
                }

                // User profile
                if (user) {
                    const avatarEl = document.getElementById('header-user-avatar');
                    if (avatarEl && user.initials) avatarEl.textContent = user.initials;

                    const nameEl = document.getElementById('header-user-name');
                    if (nameEl && user.name) nameEl.textContent = user.name;

                    const roleEl = document.getElementById('header-user-role');
                    if (roleEl && user.roleTitle) roleEl.textContent = user.roleTitle;
                }
            } catch (err) {
                console.error('[CRM] Error rendering header:', err);
            }
        }

        /**
         * Render subscription plan badge and usage meters from EntitlementsService
         */
        async renderPlanMeters() {
            try {
                const plan = await this.entitlements.getCurrentPlan();
                if (!plan) return;

                const meterPkgNameEl = document.getElementById('meter-package-name');
                if (meterPkgNameEl) {
                    meterPkgNameEl.textContent = `${plan.name} Package • Active`;
                }

                // Leads Usage
                const leadUsage = await this.entitlements.getUsage('leads');
                const leadLimit = await this.entitlements.getLimit('leads');
                const leadLimitDisplay = leadLimit === Infinity ? 'Unlimited' : leadLimit.toLocaleString();
                const leadPercent = leadLimit === Infinity ? 5 : Math.min(100, Math.round((leadUsage / leadLimit) * 100));

                const leadsCountEl = document.getElementById('meter-leads-count');
                if (leadsCountEl) leadsCountEl.textContent = `${leadUsage} / ${leadLimitDisplay}`;
                const leadsBarEl = document.getElementById('meter-leads-bar');
                if (leadsBarEl) leadsBarEl.style.width = `${Math.max(5, leadPercent)}%`;

                // Team Seats Usage
                const teamUsage = await this.entitlements.getUsage('team');
                const teamLimit = await this.entitlements.getLimit('users');
                const teamLimitDisplay = teamLimit === Infinity ? 'Unlimited' : teamLimit.toLocaleString();
                const teamPercent = teamLimit === Infinity ? 10 : Math.min(100, Math.round((teamUsage / teamLimit) * 100));

                const teamCountEl = document.getElementById('meter-team-count');
                if (teamCountEl) teamCountEl.textContent = `${teamUsage} / ${teamLimitDisplay}`;
                const teamBarEl = document.getElementById('meter-team-bar');
                if (teamBarEl) teamBarEl.style.width = `${Math.max(5, teamPercent)}%`;

                // AI Actions
                const aiLimit = await this.entitlements.getLimit('aiActions');
                const aiLimitDisplay = aiLimit === Infinity ? 'Unlimited' : (aiLimit === 0 ? 'Disabled' : `${aiLimit.toLocaleString()} Actions`);
                const aiCountEl = document.getElementById('meter-ai-count');
                if (aiCountEl) aiCountEl.textContent = aiLimitDisplay;
                const aiBarEl = document.getElementById('meter-ai-bar');
                if (aiBarEl) aiBarEl.style.width = aiLimit > 0 ? '100%' : '0%';

            } catch (err) {
                console.error('[CRM] Error rendering plan meters:', err);
            }
        }

        /**
         * Compute Overview KPIs, render active leads preview stream and upcoming tasks
         */
        async renderOverview() {
            try {
                const leads = (await this.crm.getLeads()) || [];
                const tasks = (await this.crm.getTasks()) || [];

                // 1. Calculate Metrics from existing data
                const totalPipelineValue = leads.reduce((sum, lead) => sum + (Number(lead.value) || 0), 0);
                const activeLeadsCount = leads.length;
                const avgOpportunityValue = activeLeadsCount > 0 ? Math.round(totalPipelineValue / activeLeadsCount) : 0;
                const wonDealsCount = leads.filter(l => l.status && l.status.toLowerCase() === 'won').length;

                // 2. Populate KPI Cards
                const kpiPipelineEl = document.getElementById('kpi-pipeline-value');
                if (kpiPipelineEl) kpiPipelineEl.textContent = `$${totalPipelineValue.toLocaleString()}`;

                const kpiActiveEl = document.getElementById('kpi-active-leads');
                if (kpiActiveEl) kpiActiveEl.textContent = `${activeLeadsCount} Leads`;

                const kpiAvgEl = document.getElementById('kpi-avg-value');
                if (kpiAvgEl) kpiAvgEl.textContent = `$${avgOpportunityValue.toLocaleString()}`;

                const kpiWonEl = document.getElementById('kpi-won-deals');
                if (kpiWonEl) kpiWonEl.textContent = `${wonDealsCount}`;

                // 3. Render Active Leads Preview Stream
                this.renderLeadsTable(leads);

                // 4. Render Upcoming Tasks Preview
                this.renderTasksWidget(tasks);

            } catch (err) {
                console.error('[CRM] Error rendering overview:', err);
            }
        }

        /**
         * Render Active Leads Table Rows
         */
        renderLeadsTable(leads) {
            const tbody = document.getElementById('overview-leads-tbody');
            if (!tbody) return;

            if (!leads || leads.length === 0) {
                tbody.innerHTML = `
                    <tr>
                        <td colspan="5" class="py-8 text-center text-on-surface-variant font-mono">
                            No lead records found. Use Quick Actions to add a lead.
                        </td>
                    </tr>
                `;
                return;
            }

            tbody.innerHTML = leads.slice(0, 5).map(lead => {
                const stageColor = this._getStageBadgeClass(lead.status);
                const priorityColor = this._getPriorityBadgeClass(lead.priority);
                const valFormatted = Number(lead.value) > 0 ? `$${Number(lead.value).toLocaleString()}` : '$0';

                return `
                    <tr class="hover:bg-white/[0.02] transition-colors">
                        <td class="py-3 pr-3">
                            <p class="font-semibold text-white font-sans text-xs">${this._escapeHTML(lead.name)}</p>
                            <p class="text-[11px] text-on-surface-variant">${this._escapeHTML(lead.email || '')}</p>
                        </td>
                        <td class="py-3 px-3 text-white/90 font-sans text-xs">
                            ${this._escapeHTML(lead.company || 'Direct')}
                        </td>
                        <td class="py-3 px-3">
                            <span class="px-2 py-0.5 rounded text-[10px] font-mono uppercase tracking-wider ${stageColor}">
                                ${this._escapeHTML(lead.status || 'New')}
                            </span>
                        </td>
                        <td class="py-3 px-3">
                            <span class="px-2 py-0.5 rounded text-[10px] font-mono uppercase ${priorityColor}">
                                ${this._escapeHTML(lead.priority || 'Medium')}
                            </span>
                        </td>
                        <td class="py-3 pl-3 text-right font-bold text-white text-xs">
                            ${valFormatted}
                        </td>
                    </tr>
                `;
            }).join('');
        }

        /**
         * Render Upcoming Tasks Widget
         */
        renderTasksWidget(tasks) {
            const container = document.getElementById('overview-tasks-list');
            const countBadge = document.getElementById('overview-task-count');
            if (!container) return;

            const pendingTasks = (tasks || []).filter(t => !t.completed);
            if (countBadge) countBadge.textContent = `${pendingTasks.length} Pending`;

            if (!tasks || tasks.length === 0) {
                container.innerHTML = `
                    <p class="text-xs text-on-surface-variant py-8 text-center font-mono">
                        No pending tasks.
                    </p>
                `;
                return;
            }

            container.innerHTML = tasks.slice(0, 5).map(task => {
                const isDone = task.completed;
                const priorityColor = this._getPriorityBadgeClass(task.priority);

                return `
                    <div class="flex items-start gap-3 p-3 rounded-xl bg-white/5 border border-white/5 hover:border-white/10 transition-all">
                        <input type="checkbox" data-task-id="${task.id}" ${isDone ? 'checked' : ''} 
                               class="crm-task-toggle mt-1 rounded bg-black/40 border-white/20 text-purple-600 focus:ring-purple-500 focus:ring-offset-0 cursor-pointer">
                        <div class="flex-1 min-w-0">
                            <p class="text-xs font-medium ${isDone ? 'line-through text-on-surface-variant' : 'text-white'} font-sans leading-tight">
                                ${this._escapeHTML(task.title)}
                            </p>
                            <div class="flex items-center gap-2 mt-1.5 font-mono text-[10px] text-on-surface-variant">
                                <span>📅 ${task.dueDate || 'No date'}</span>
                                <span class="px-1.5 py-0.2 rounded ${priorityColor}">${this._escapeHTML(task.priority || 'Normal')}</span>
                            </div>
                        </div>
                    </div>
                `;
            }).join('');

            // Attach toggle listeners
            container.querySelectorAll('.crm-task-toggle').forEach(input => {
                input.addEventListener('change', async (e) => {
                    const taskId = e.target.dataset.taskId;
                    await this.crm.toggleTask(taskId);
                    if (this.notifications) {
                        this.notifications.info('Task status updated');
                    }
                    const updatedTasks = await this.crm.getTasks();
                    this.renderTasksWidget(updatedTasks);
                });
            });
        }

        /**
         * Bind tab switching, quick actions, back button, and logout
         */
        bindEvents() {
            // 1. Module Navigation Tabs
            document.querySelectorAll('.crm-tab-btn').forEach(btn => {
                btn.addEventListener('click', async (e) => {
                    e.preventDefault();
                    const tabKey = btn.dataset.tab;
                    const featureKey = btn.dataset.feature;

                    // If overview, switch immediately
                    if (tabKey === 'overview') {
                        this.switchTab('overview', btn);
                        return;
                    }

                    // Check entitlement for the module
                    if (featureKey && this.entitlements) {
                        const canAccess = await this.entitlements.canAccess(featureKey);
                        if (!canAccess) {
                            this.showLockedModal(featureKey);
                            return;
                        }
                    }

                    // Switch to module preview container
                    this.switchTab(tabKey, btn);
                });
            });

            // 2. Return to Overview button
            const btnReturnOverview = document.getElementById('btn-return-overview');
            if (btnReturnOverview) {
                btnReturnOverview.addEventListener('click', () => {
                    const overviewBtn = document.querySelector('.crm-tab-btn[data-tab="overview"]');
                    if (overviewBtn) this.switchTab('overview', overviewBtn);
                });
            }

            // 3. Quick Action Buttons (Phase 2 Preview)
            const quickLeadBtn = document.getElementById('quick-btn-lead');
            if (quickLeadBtn) {
                quickLeadBtn.addEventListener('click', () => {
                    this.showPhase2PreviewModal('Leads Creation Workflow', 'Phase 2B: Leads Management');
                });
            }

            const quickDealBtn = document.getElementById('quick-btn-deal');
            if (quickDealBtn) {
                quickDealBtn.addEventListener('click', () => {
                    this.showPhase2PreviewModal('Deals Pipeline Workflow', 'Phase 2E: Pipeline & Deals');
                });
            }

            const quickTaskBtn = document.getElementById('quick-btn-task');
            if (quickTaskBtn) {
                quickTaskBtn.addEventListener('click', () => {
                    this.showPhase2PreviewModal('Quick Task Creator', 'Phase 2G: Tasks Management');
                });
            }

            // 4. Back to Dashboard Button
            const backBtn = document.getElementById('btn-back-dashboard');
            if (backBtn) {
                backBtn.addEventListener('click', (e) => {
                    e.preventDefault();
                    this.navigateBackToDashboard();
                });
            }

            // 5. Brand Logo Link
            const brandLink = document.getElementById('brand-link');
            if (brandLink) {
                brandLink.addEventListener('click', (e) => {
                    e.preventDefault();
                    this.navigateBackToDashboard();
                });
            }

            // 6. Logout Button
            const logoutBtn = document.getElementById('btn-crm-logout');
            if (logoutBtn) {
                logoutBtn.addEventListener('click', (e) => {
                    e.preventDefault();
                    if (this.auth) {
                        this.auth.logout();
                    } else {
                        localStorage.clear();
                        window.location.href = 'landing%20page.html';
                    }
                });
            }
        }

        /**
         * Switch active navigation tab and view container
         */
        switchTab(tabKey, targetBtn) {
            this.activeTab = tabKey;

            // Update Tab UI Styles
            document.querySelectorAll('.crm-tab-btn').forEach(btn => {
                btn.classList.remove('active', 'bg-purple-600/30', 'text-white', 'border-purple-500/50', 'shadow-[0_0_15px_rgba(138,43,226,0.3)]');
                btn.classList.add('text-on-surface-variant', 'border-transparent');
            });

            targetBtn.classList.add('active', 'bg-purple-600/30', 'text-white', 'border-purple-500/50', 'shadow-[0_0_15px_rgba(138,43,226,0.3)]');
            targetBtn.classList.remove('text-on-surface-variant', 'border-transparent');

            const overviewView = document.getElementById('crm-view-overview');
            const previewView = document.getElementById('crm-view-preview');

            if (tabKey === 'overview') {
                if (overviewView) overviewView.classList.remove('hidden');
                if (previewView) previewView.classList.add('hidden');
            } else {
                if (overviewView) overviewView.classList.add('hidden');
                if (previewView) previewView.classList.remove('hidden');

                // Update Preview Content
                const tabTitles = {
                    leads: { title: 'Leads Management', icon: 'groups', desc: 'Full leads database, qualification stages, lead scoring, and bulk import will be activated in Phase 2B.' },
                    contacts: { title: 'Contact Directory', icon: 'contact_page', desc: 'Customer contact records, interaction timelines, and communication logs will be activated in Phase 2C.' },
                    companies: { title: 'Account & Company Hub', icon: 'domain', desc: 'Corporate hierarchy, domain mapping, and account health metrics will be activated in Phase 2D.' },
                    pipeline: { title: 'Deals & Sales Pipeline', icon: 'view_kanban', desc: 'Interactive Kanban pipeline, deal progression, and sales forecasting will be activated in Phase 2E.' },
                    activities: { title: 'Activity & Audit Stream', icon: 'event_note', desc: 'Call logging, meeting agendas, and automated action histories will be activated in Phase 2F.' },
                    tasks: { title: 'Task Command Center', icon: 'task_alt', desc: 'Team task delegation, priority queues, and deadline automation will be activated in Phase 2G.' },
                    reports: { title: 'Analytics & Reporting', icon: 'analytics', desc: 'Revenue velocity charts, conversion funnels, and executive exports will be activated in Phase 2H.' },
                    aiAssistant: { title: 'CRM AI Copilot', icon: 'psychology', desc: 'Autonomous lead qualification, deal risk analysis, and customer summaries will be activated in Phase 2I.' }
                };

                const info = tabTitles[tabKey] || { title: 'CRM Module', icon: 'extension', desc: 'Module workflows scheduled for implementation in Phase 2.' };
                
                const titleEl = document.getElementById('preview-module-title');
                if (titleEl) titleEl.textContent = info.title;

                const iconEl = document.getElementById('preview-module-icon');
                if (iconEl) iconEl.textContent = info.icon;

                const descEl = document.getElementById('preview-module-desc');
                if (descEl) descEl.textContent = info.desc;
            }
        }

        /**
         * Open a glassmorphic preview dialog for Phase 2 action workflows
         */
        showPhase2PreviewModal(actionTitle, targetPhase) {
            const overlay = document.createElement('div');
            overlay.className = 'fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in';
            overlay.innerHTML = `
                <div class="glass-panel w-full max-w-md p-6 rounded-2xl border border-white/10 space-y-5 bg-surface/90 text-center">
                    <div class="w-14 h-14 rounded-full bg-purple-500/10 border border-purple-500/20 flex items-center justify-center mx-auto text-purple-400">
                        <span class="material-symbols-outlined text-2xl">rocket_launch</span>
                    </div>
                    <div>
                        <h3 class="text-lg font-bold text-white">${this._escapeHTML(actionTitle)}</h3>
                        <p class="text-xs text-on-surface-variant font-mono mt-1">${this._escapeHTML(targetPhase)}</p>
                    </div>
                    <p class="text-xs text-on-surface-variant leading-relaxed">
                        This creation workflow is part of upcoming Phase 2 sub-phases. In Phase 2A, the CRM shell and Overview foundation are active.
                    </p>
                    <button class="modal-close-btn w-full py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-purple-700 text-white font-mono text-xs uppercase tracking-wider">
                        Got it
                    </button>
                </div>
            `;
            document.body.appendChild(overlay);
            overlay.querySelector('.modal-close-btn').addEventListener('click', () => overlay.remove());
            overlay.addEventListener('click', (e) => { if (e.target === overlay) overlay.remove(); });
        }

        /**
         * Open a locked feature modal explaining plan upgrade requirements
         */
        showLockedModal(featureKey) {
            const overlay = document.createElement('div');
            overlay.className = 'fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in';
            overlay.innerHTML = `
                <div class="glass-panel w-full max-w-md p-6 rounded-2xl border border-amber-500/20 space-y-5 bg-surface/90 text-center">
                    <div class="w-14 h-14 rounded-full bg-amber-500/10 border border-amber-500/20 flex items-center justify-center mx-auto text-amber-400">
                        <span class="material-symbols-outlined text-2xl">lock</span>
                    </div>
                    <div>
                        <h3 class="text-lg font-bold text-white">Feature Locked on Current Plan</h3>
                        <p class="text-xs text-amber-400 font-mono mt-1">${this._escapeHTML(featureKey)}</p>
                    </div>
                    <p class="text-xs text-on-surface-variant leading-relaxed">
                        This capability requires an upgraded subscription tier (Business or Enterprise). Contact your organization administrator to unlock this feature.
                    </p>
                    <button class="modal-close-btn w-full py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-mono text-xs uppercase tracking-wider border border-white/10">
                        Close
                    </button>
                </div>
            `;
            document.body.appendChild(overlay);
            overlay.querySelector('.modal-close-btn').addEventListener('click', () => overlay.remove());
            overlay.addEventListener('click', (e) => { if (e.target === overlay) overlay.remove(); });
        }

        /**
         * Navigate back to the appropriate dashboard based on authenticated role
         */
        navigateBackToDashboard() {
            const role = (this.auth && this.auth.getCurrentRole()) || 'organization';
            const routes = {
                organization: 'dashboard-organization.html',
                employee: 'dashboard-employee.html',
                company: 'dashboard-company.html',
                'scale-it-admin': 'dashboard-scale-it-admin.html'
            };
            window.location.href = routes[role] || 'dashboard-organization.html';
        }

        // --- Helper Formatting Utilities ---

        _getStageBadgeClass(status) {
            const s = (status || '').toLowerCase();
            if (s === 'won') return 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30';
            if (s === 'proposal' || s === 'negotiation') return 'bg-purple-500/20 text-purple-300 border border-purple-500/30';
            if (s === 'qualified') return 'bg-blue-500/20 text-blue-300 border border-blue-500/30';
            return 'bg-white/10 text-white/80 border border-white/10';
        }

        _getPriorityBadgeClass(priority) {
            const p = (priority || '').toLowerCase();
            if (p === 'urgent' || p === 'high') return 'bg-red-500/20 text-red-300 border border-red-500/30';
            if (p === 'medium') return 'bg-amber-500/20 text-amber-300 border border-amber-500/30';
            return 'bg-blue-500/20 text-blue-300 border border-blue-500/30';
        }

        _escapeHTML(str) {
            if (!str) return '';
            return String(str)
                .replace(/&/g, '&amp;')
                .replace(/</g, '&lt;')
                .replace(/>/g, '&gt;')
                .replace(/"/g, '&quot;')
                .replace(/'/g, '&#039;');
        }
    }

    // Initialize controller on DOMContentLoaded
    document.addEventListener('DOMContentLoaded', () => {
        window.ScaleIT.CRMController = new CRMController();
        window.ScaleIT.CRMController.init();
    });
})();
