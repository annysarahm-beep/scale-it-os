/**
 * Scale IT OS - Master Application Initializer
 * Automatically attaches interactive behaviors to existing DOM buttons without modifying markup.
 * Preserves 100% of the existing UI/UX and styling.
 */

window.ScaleIT = window.ScaleIT || {};

(function () {
    document.addEventListener('DOMContentLoaded', async function () {
        const auth = window.ScaleIT.AuthService;
        const modals = window.ScaleIT.Modals;

        // 1. Sync User Profile in Sidebar if on a dashboard
        if (auth) {
            const user = await auth.getCurrentUser();
            if (user) {
                const nameEl = document.querySelector('aside h2');
                if (nameEl && user.name) nameEl.textContent = user.name;

                const avatarEl = document.querySelector('aside .w-16.h-16');
                if (avatarEl && user.initials) avatarEl.textContent = user.initials;
            }
        }

        // 2. Bind Dashboard Action Buttons dynamically by inspecting their text content
        document.querySelectorAll('aside button, main button').forEach(button => {
            const text = button.textContent.trim().toLowerCase();

            if (text.includes('edit profile')) {
                button.addEventListener('click', (e) => {
                    e.preventDefault();
                    if (modals) modals.openEditProfile();
                });
            } else if (text.includes('change password')) {
                button.addEventListener('click', (e) => {
                    e.preventDefault();
                    if (modals) modals.openChangePassword();
                });
            } else if (text.includes('manage team access')) {
                button.addEventListener('click', (e) => {
                    e.preventDefault();
                    if (modals) modals.openManageTeam();
                });
            } else if (text.includes('my tasks')) {
                button.addEventListener('click', (e) => {
                    e.preventDefault();
                    if (modals) modals.openMyTasks();
                });
            } else if (text.includes('view deliverables')) {
                button.addEventListener('click', (e) => {
                    e.preventDefault();
                    if (modals) modals.openViewDeliverables();
                });
            } else if (text.includes('view organization access')) {
                button.addEventListener('click', (e) => {
                    e.preventDefault();
                    if (modals) modals.openOrganizationAccess();
                });
            }
        });

        // 3. Landing Page Enhancements (Smooth navigation & Mobile menu toggle)
        const mobileMenuBtn = document.querySelector('nav .md\\:hidden button');
        if (mobileMenuBtn) {
            let mobileDrawer = document.getElementById('mobile-drawer');
            if (!mobileDrawer) {
                mobileDrawer = document.createElement('div');
                mobileDrawer.id = 'mobile-drawer';
                mobileDrawer.className = 'hidden md:hidden fixed top-20 left-0 w-full glass-panel border-b border-white/10 p-6 space-y-4 bg-surface/95 backdrop-blur-2xl z-40';
                mobileDrawer.innerHTML = `
                    <div class="flex flex-col gap-4">
                        <a class="text-on-surface-variant hover:text-on-surface transition-colors font-body-md py-2 border-b border-white/5" href="#solutions">Solutions</a>
                        <a class="text-on-surface-variant hover:text-on-surface transition-colors font-body-md py-2 border-b border-white/5" href="#features">Features</a>
                        <a class="text-on-surface-variant hover:text-on-surface transition-colors font-body-md py-2 border-b border-white/5" href="#about">About</a>
                        <a href="get-started.html" class="bg-gradient-to-r from-purple-600 to-purple-700 text-white py-3 rounded text-center font-mono text-xs uppercase tracking-wider block">Get Started →</a>
                    </div>
                `;
                document.body.appendChild(mobileDrawer);
            }

            mobileMenuBtn.addEventListener('click', () => {
                mobileDrawer.classList.toggle('hidden');
            });

            // Close mobile menu on clicking any link inside it
            mobileDrawer.querySelectorAll('a').forEach(link => {
                link.addEventListener('click', () => {
                    mobileDrawer.classList.add('hidden');
                });
            });
        }
    });
})();
