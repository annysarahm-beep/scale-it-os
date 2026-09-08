/**
 * Scale IT OS - Reusable Glassmorphic Modal Component System
 * Implements functional dialogs for Edit Profile, Change Password, Team Access, Tasks, Deliverables, and Platform Orgs.
 * Preserves 100% of the Scale IT OS glassmorphism visual language.
 */

window.ScaleIT = window.ScaleIT || {};

(function () {
    class ModalManager {
        constructor() {
            this.activeModal = null;
        }

        close() {
            if (this.activeModal) {
                const backdrop = this.activeModal;
                const panel = backdrop.querySelector('.modal-panel');
                if (panel) {
                    panel.classList.add('scale-95', 'opacity-0');
                }
                backdrop.classList.add('opacity-0');
                setTimeout(() => {
                    if (backdrop.parentElement) backdrop.remove();
                    this.activeModal = null;
                }, 250);
            }
        }

        _createBase(title, iconName = 'settings') {
            this.close();

            const backdrop = document.createElement('div');
            backdrop.className = 'fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70 backdrop-blur-md transition-opacity duration-200 opacity-0';
            
            backdrop.addEventListener('click', (e) => {
                if (e.target === backdrop) this.close();
            });

            const panel = document.createElement('div');
            panel.className = 'modal-panel glass-panel w-full max-w-xl p-8 rounded-2xl border border-white/10 shadow-2xl transform transition-all duration-200 scale-95 opacity-0 bg-surface/95 max-h-[90vh] overflow-y-auto';

            panel.innerHTML = `
                <div class="flex items-center justify-between pb-4 mb-6 border-b border-white/10">
                    <div class="flex items-center gap-3">
                        <div class="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-purple-700 flex items-center justify-center text-white">
                            <span class="material-symbols-outlined text-xl">${iconName}</span>
                        </div>
                        <h2 class="text-xl font-bold text-white">${title}</h2>
                    </div>
                    <button class="modal-close-btn text-white/50 hover:text-white transition-colors p-1 rounded-lg hover:bg-white/5">
                        <span class="material-symbols-outlined">close</span>
                    </button>
                </div>
                <div class="modal-body space-y-4"></div>
            `;

            panel.querySelector('.modal-close-btn').addEventListener('click', () => this.close());

            backdrop.appendChild(panel);
            document.body.appendChild(backdrop);
            this.activeModal = backdrop;

            requestAnimationFrame(() => {
                backdrop.classList.remove('opacity-0');
                panel.classList.remove('scale-95', 'opacity-0');
            });

            return panel.querySelector('.modal-body');
        }

        // --- 1. Edit Profile Modal ---

        async openEditProfile() {
            const auth = window.ScaleIT.AuthService;
            const profile = (await auth.getCurrentUser()) || {};
            const body = this._createBase('Edit Profile', 'person');

            body.innerHTML = `
                <form id="edit-profile-form" class="space-y-4">
                    <div>
                        <label class="block text-xs font-mono text-primary uppercase tracking-wider mb-2">Full Name</label>
                        <input type="text" id="profile-name" value="${profile.name || ''}" required 
                               class="w-full px-4 py-3 rounded-lg bg-black/50 border border-purple-500/30 text-white text-sm focus:border-purple-500 focus:outline-none transition-all">
                    </div>
                    <div>
                        <label class="block text-xs font-mono text-primary uppercase tracking-wider mb-2">Email Address</label>
                        <input type="email" id="profile-email" value="${profile.email || ''}" required 
                               class="w-full px-4 py-3 rounded-lg bg-black/50 border border-purple-500/30 text-white text-sm focus:border-purple-500 focus:outline-none transition-all">
                    </div>
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label class="block text-xs font-mono text-primary uppercase tracking-wider mb-2">Phone</label>
                            <input type="text" id="profile-phone" value="${profile.phone || ''}" 
                                   class="w-full px-4 py-3 rounded-lg bg-black/50 border border-purple-500/30 text-white text-sm focus:border-purple-500 focus:outline-none transition-all">
                        </div>
                        <div>
                            <label class="block text-xs font-mono text-primary uppercase tracking-wider mb-2">Department / Role</label>
                            <input type="text" id="profile-dept" value="${profile.department || profile.roleTitle || ''}" 
                                   class="w-full px-4 py-3 rounded-lg bg-black/50 border border-purple-500/30 text-white text-sm focus:border-purple-500 focus:outline-none transition-all">
                        </div>
                    </div>
                    <div class="flex justify-end gap-3 pt-4 border-t border-white/10">
                        <button type="button" class="btn-cancel px-4 py-2.5 rounded-lg border border-white/10 text-white/80 hover:bg-white/5 font-mono text-xs transition-all">Cancel</button>
                        <button type="submit" class="px-5 py-2.5 rounded-lg bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-500 hover:to-purple-600 text-white font-mono text-xs uppercase tracking-wider shadow-[0_0_20px_rgba(138,43,226,0.4)] transition-all">Save Changes</button>
                    </div>
                </form>
            `;

            body.querySelector('.btn-cancel').addEventListener('click', () => this.close());

            body.querySelector('#edit-profile-form').addEventListener('submit', async (e) => {
                e.preventDefault();
                const name = document.getElementById('profile-name').value.trim();
                const email = document.getElementById('profile-email').value.trim();
                const phone = document.getElementById('profile-phone').value.trim();
                const department = document.getElementById('profile-dept').value.trim();

                const initials = name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2) || 'CL';

                await auth.updateCurrentUser({ name, email, phone, department, initials });

                // Dynamically sync visible sidebar avatar & name without page reload
                const sidebarName = document.querySelector('aside h2');
                if (sidebarName) sidebarName.textContent = name;
                
                const sidebarAvatar = document.querySelector('aside .w-16.h-16');
                if (sidebarAvatar) sidebarAvatar.textContent = initials;

                window.ScaleIT.Notifications.success('Profile details updated successfully.', 'Profile Saved');
                this.close();
            });
        }

        // --- 2. Change Password Modal ---

        openChangePassword() {
            const auth = window.ScaleIT.AuthService;
            const body = this._createBase('Change Password', 'lock');

            body.innerHTML = `
                <form id="change-password-form" class="space-y-4">
                    <div>
                        <label class="block text-xs font-mono text-primary uppercase tracking-wider mb-2">Current Password</label>
                        <input type="password" id="curr-password" required placeholder="••••••••" 
                               class="w-full px-4 py-3 rounded-lg bg-black/50 border border-purple-500/30 text-white text-sm focus:border-purple-500 focus:outline-none transition-all">
                    </div>
                    <div>
                        <label class="block text-xs font-mono text-primary uppercase tracking-wider mb-2">New Password (Min 8 chars)</label>
                        <input type="password" id="new-password" required placeholder="••••••••" 
                               class="w-full px-4 py-3 rounded-lg bg-black/50 border border-purple-500/30 text-white text-sm focus:border-purple-500 focus:outline-none transition-all">
                    </div>
                    <div>
                        <label class="block text-xs font-mono text-primary uppercase tracking-wider mb-2">Confirm New Password</label>
                        <input type="password" id="confirm-password" required placeholder="••••••••" 
                               class="w-full px-4 py-3 rounded-lg bg-black/50 border border-purple-500/30 text-white text-sm focus:border-purple-500 focus:outline-none transition-all">
                    </div>
                    <div class="flex justify-end gap-3 pt-4 border-t border-white/10">
                        <button type="button" class="btn-cancel px-4 py-2.5 rounded-lg border border-white/10 text-white/80 hover:bg-white/5 font-mono text-xs transition-all">Cancel</button>
                        <button type="submit" class="px-5 py-2.5 rounded-lg bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-500 hover:to-purple-600 text-white font-mono text-xs uppercase tracking-wider shadow-[0_0_20px_rgba(138,43,226,0.4)] transition-all">Update Password</button>
                    </div>
                </form>
            `;

            body.querySelector('.btn-cancel').addEventListener('click', () => this.close());

            body.querySelector('#change-password-form').addEventListener('submit', async (e) => {
                e.preventDefault();
                const currPass = document.getElementById('curr-password').value;
                const newPass = document.getElementById('new-password').value;
                const confirmPass = document.getElementById('confirm-password').value;

                if (newPass !== confirmPass) {
                    window.ScaleIT.Notifications.error('New passwords do not match.', 'Validation Error');
                    return;
                }

                if (newPass.length < 8) {
                    window.ScaleIT.Notifications.error('New password must be at least 8 characters.', 'Validation Error');
                    return;
                }

                try {
                    await auth.changePassword(newPass);
                    window.ScaleIT.Notifications.success('Password updated successfully.', 'Security Updated');
                    this.close();
                } catch (err) {
                    window.ScaleIT.Notifications.error(err.message, 'Failed');
                }
            });
        }

        // --- 3. Manage Team Access Modal (Org Admin) ---

        async openManageTeam() {
            const crm = window.ScaleIT.CRMService;
            const team = await crm.getTeamMembers();
            const body = this._createBase('Manage Team Access', 'groups');

            const renderMembers = (members) => {
                return members.map(m => `
                    <div class="flex items-center justify-between p-3.5 rounded-xl bg-white/5 border border-white/10">
                        <div class="flex items-center gap-3">
                            <div class="w-9 h-9 rounded-full bg-gradient-to-br from-purple-500 to-purple-700 flex items-center justify-center font-bold text-xs text-white">${m.avatar || 'TM'}</div>
                            <div>
                                <p class="text-sm font-semibold text-white">${m.name}</p>
                                <p class="text-xs text-on-surface-variant font-mono">${m.email}</p>
                            </div>
                        </div>
                        <div class="flex items-center gap-2">
                            <span class="px-2.5 py-1 rounded bg-purple-500/20 text-purple-300 font-mono text-[10px] uppercase border border-purple-500/30">${m.role}</span>
                        </div>
                    </div>
                `).join('');
            };

            body.innerHTML = `
                <div class="space-y-4">
                    <div class="flex items-center justify-between">
                        <p class="text-xs font-mono text-primary uppercase tracking-widest">Active Roster (${team.length} Members)</p>
                        <button id="toggle-add-member" class="text-xs font-mono text-primary hover:text-white flex items-center gap-1 transition-colors">
                            <span class="material-symbols-outlined text-sm">person_add</span> Add Member
                        </button>
                    </div>

                    <div id="add-member-form-container" class="hidden p-4 rounded-xl bg-purple-950/20 border border-purple-500/30 space-y-3">
                        <h4 class="text-xs font-mono text-white uppercase">Invite Team Member</h4>
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <input type="text" id="new-member-name" placeholder="Full Name" class="px-3 py-2 text-xs rounded bg-black/60 border border-white/10 text-white focus:outline-none focus:border-purple-500">
                            <input type="email" id="new-member-email" placeholder="Work Email" class="px-3 py-2 text-xs rounded bg-black/60 border border-white/10 text-white focus:outline-none focus:border-purple-500">
                        </div>
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <select id="new-member-role" class="px-3 py-2 text-xs rounded bg-black/60 border border-white/10 text-white focus:outline-none focus:border-purple-500">
                                <option value="Operations">Operations</option>
                                <option value="Sales Specialist">Sales Specialist</option>
                                <option value="Product Manager">Product Manager</option>
                                <option value="Engineer">Engineer</option>
                            </select>
                            <button id="save-new-member-btn" class="px-3 py-2 text-xs rounded bg-purple-600 hover:bg-purple-500 text-white font-mono uppercase tracking-wider transition-all">Send Invite</button>
                        </div>
                    </div>

                    <div id="team-list" class="space-y-2 max-h-60 overflow-y-auto pr-1">
                        ${renderMembers(team)}
                    </div>
                </div>
            `;

            const toggleBtn = body.querySelector('#toggle-add-member');
            const formContainer = body.querySelector('#add-member-form-container');
            const saveBtn = body.querySelector('#save-new-member-btn');

            toggleBtn.addEventListener('click', () => {
                formContainer.classList.toggle('hidden');
            });

            saveBtn.addEventListener('click', async () => {
                const name = body.querySelector('#new-member-name').value.trim();
                const email = body.querySelector('#new-member-email').value.trim();
                const role = body.querySelector('#new-member-role').value;

                if (!name || !email) {
                    window.ScaleIT.Notifications.error('Please provide name and email.', 'Required Fields');
                    return;
                }

                await crm.addTeamMember({ name, email, role });
                const updatedTeam = await crm.getTeamMembers();
                body.querySelector('#team-list').innerHTML = renderMembers(updatedTeam);
                formContainer.classList.add('hidden');
                body.querySelector('#new-member-name').value = '';
                body.querySelector('#new-member-email').value = '';
                window.ScaleIT.Notifications.success(`${name} has been added to the organization.`, 'Member Invited');
            });
        }

        // --- 4. My Tasks Modal (Employee) ---

        async openMyTasks() {
            const crm = window.ScaleIT.CRMService;
            const tasks = await crm.getTasks();
            const body = this._createBase('My Assigned Tasks', 'checklist');

            const renderTasks = (taskList) => {
                if (taskList.length === 0) {
                    return '<p class="text-xs text-on-surface-variant text-center py-6">No tasks assigned.</p>';
                }
                return taskList.map(t => `
                    <div class="flex items-center justify-between p-3.5 rounded-xl ${t.completed ? 'bg-white/5 opacity-60' : 'bg-white/10'} border border-white/10 transition-all">
                        <div class="flex items-center gap-3">
                            <input type="checkbox" data-task-id="${t.id}" ${t.completed ? 'checked' : ''} 
                                   class="task-toggle-checkbox w-4 h-4 rounded border-purple-500/50 text-purple-600 focus:ring-purple-500 cursor-pointer">
                            <div>
                                <p class="text-sm font-medium ${t.completed ? 'line-through text-white/50' : 'text-white'}">${t.title}</p>
                                <p class="text-[10px] text-primary font-mono mt-0.5">Due: ${t.dueDate} • ${t.category || 'Workstream'}</p>
                            </div>
                        </div>
                        <span class="px-2 py-0.5 rounded font-mono text-[10px] uppercase ${
                            t.priority === 'Urgent' ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30' :
                            t.priority === 'High' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' :
                            'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                        }">${t.priority}</span>
                    </div>
                `).join('');
            };

            body.innerHTML = `
                <div class="space-y-4">
                    <div class="flex items-center justify-between">
                        <p class="text-xs font-mono text-primary uppercase tracking-widest">Active Tasks</p>
                        <button id="toggle-add-task" class="text-xs font-mono text-primary hover:text-white flex items-center gap-1 transition-colors">
                            <span class="material-symbols-outlined text-sm">add_task</span> Add Task
                        </button>
                    </div>

                    <div id="add-task-form" class="hidden p-3.5 rounded-xl bg-purple-950/20 border border-purple-500/30 space-y-3">
                        <input type="text" id="new-task-title" placeholder="What needs to be done?" class="w-full px-3 py-2 text-xs rounded bg-black/60 border border-white/10 text-white focus:outline-none focus:border-purple-500">
                        <div class="flex gap-2">
                            <select id="new-task-priority" class="flex-1 px-3 py-2 text-xs rounded bg-black/60 border border-white/10 text-white focus:outline-none">
                                <option value="Medium">Medium Priority</option>
                                <option value="High">High Priority</option>
                                <option value="Urgent">Urgent Priority</option>
                                <option value="Low">Low Priority</option>
                            </select>
                            <input type="date" id="new-task-date" class="px-3 py-2 text-xs rounded bg-black/60 border border-white/10 text-white focus:outline-none">
                            <button id="save-task-btn" class="px-4 py-2 text-xs rounded bg-purple-600 hover:bg-purple-500 text-white font-mono uppercase">Save</button>
                        </div>
                    </div>

                    <div id="task-list-container" class="space-y-2 max-h-64 overflow-y-auto pr-1">
                        ${renderTasks(tasks)}
                    </div>
                </div>
            `;

            const bindCheckboxes = () => {
                body.querySelectorAll('.task-toggle-checkbox').forEach(cb => {
                    cb.addEventListener('change', async function () {
                        const taskId = this.dataset.taskId;
                        await crm.toggleTask(taskId);
                        const updated = await crm.getTasks();
                        body.querySelector('#task-list-container').innerHTML = renderTasks(updated);
                        bindCheckboxes();
                        window.ScaleIT.Notifications.info('Task status updated.');
                    });
                });
            };

            bindCheckboxes();

            body.querySelector('#toggle-add-task').addEventListener('click', () => {
                body.querySelector('#add-task-form').classList.toggle('hidden');
            });

            body.querySelector('#save-task-btn').addEventListener('click', async () => {
                const title = body.querySelector('#new-task-title').value.trim();
                const priority = body.querySelector('#new-task-priority').value;
                const dueDate = body.querySelector('#new-task-date').value;

                if (!title) {
                    window.ScaleIT.Notifications.error('Please enter task title.');
                    return;
                }

                await crm.addTask({ title, priority, dueDate });
                const updated = await crm.getTasks();
                body.querySelector('#task-list-container').innerHTML = renderTasks(updated);
                bindCheckboxes();
                body.querySelector('#add-task-form').classList.add('hidden');
                body.querySelector('#new-task-title').value = '';
                window.ScaleIT.Notifications.success('Task added successfully.');
            });
        }

        // --- 5. View Deliverables Modal (Company/Client) ---

        async openViewDeliverables() {
            const crm = window.ScaleIT.CRMService;
            const deliverables = await crm.getDeliverables();
            const body = this._createBase('Client Deliverables & Milestones', 'inventory_2');

            body.innerHTML = `
                <div class="space-y-3">
                    <p class="text-xs font-mono text-primary uppercase tracking-widest mb-3">Active Deliverables Schedule</p>
                    <div class="space-y-3 max-h-72 overflow-y-auto pr-1">
                        ${deliverables.map(d => `
                            <div class="p-4 rounded-xl bg-white/5 border border-white/10 hover:border-purple-500/40 transition-all space-y-2">
                                <div class="flex items-center justify-between">
                                    <span class="text-[10px] font-mono text-primary uppercase tracking-wider">${d.milestone}</span>
                                    <span class="px-2 py-0.5 rounded text-[10px] font-mono uppercase ${
                                        d.status === 'Completed' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' :
                                        'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                                    }">${d.status}</span>
                                </div>
                                <h4 class="text-sm font-semibold text-white">${d.title}</h4>
                                <div class="flex items-center justify-between text-xs text-on-surface-variant font-mono pt-1">
                                    <span>Target Date: ${d.deliveryDate}</span>
                                    <span class="text-emerald-400 font-medium">● ${d.health}</span>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>
            `;
        }

        // --- 6. View Organization Access Modal (Scale IT Admin) ---

        async openOrganizationAccess() {
            const storage = window.ScaleIT.StorageService;
            const orgs = (await storage.getItem('platform_managed_orgs')) || [];
            const body = this._createBase('Platform Organization Access', 'shield');

            body.innerHTML = `
                <div class="space-y-4">
                    <div class="flex items-center justify-between">
                        <p class="text-xs font-mono text-primary uppercase tracking-widest">Managed Organizations (${orgs.length})</p>
                    </div>
                    <div class="space-y-3 max-h-72 overflow-y-auto pr-1">
                        ${orgs.map(o => `
                            <div class="p-4 rounded-xl bg-white/5 border border-white/10 hover:border-purple-500/40 transition-all flex items-center justify-between">
                                <div class="space-y-1">
                                    <div class="flex items-center gap-2">
                                        <h4 class="text-sm font-semibold text-white">${o.name}</h4>
                                        <span class="px-2 py-0.5 rounded font-mono text-[10px] uppercase bg-purple-500/20 text-purple-300 border border-purple-500/30">${o.plan}</span>
                                    </div>
                                    <p class="text-xs text-on-surface-variant font-mono">Seats: ${o.users} • Value: ${o.mrr}</p>
                                </div>
                                <div class="text-right">
                                    <span class="inline-flex items-center gap-1.5 text-xs text-emerald-400 font-mono">
                                        <span class="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span> ${o.health}
                                    </span>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>
            `;
        }
    }

    window.ScaleIT.Modals = new ModalManager();
})();
