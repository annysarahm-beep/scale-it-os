/**
 * Scale IT OS - Glassmorphic Toast Notification System
 * Displays non-intrusive status feedback matching the Scale IT OS visual theme.
 */

window.ScaleIT = window.ScaleIT || {};

(function () {
    class NotificationManager {
        constructor() {
            this.container = null;
            this._ensureContainer();
        }

        _ensureContainer() {
            if (this.container && document.body.contains(this.container)) return;
            this.container = document.createElement('div');
            this.container.id = 'scale-it-toast-container';
            this.container.className = 'fixed bottom-6 right-6 z-[9999] flex flex-col gap-3 pointer-events-none max-w-sm w-full';
            document.body.appendChild(this.container);
        }

        show(message, type = 'success', title = '') {
            this._ensureContainer();

            const toast = document.createElement('div');
            toast.className = 'pointer-events-auto transform transition-all duration-300 translate-y-4 opacity-0 glass-panel p-4 rounded-xl border border-white/10 shadow-2xl flex items-start gap-3 bg-surface/90 backdrop-blur-2xl';

            let iconName = 'check_circle';
            let iconColor = 'text-emerald-400';
            let borderColor = 'border-emerald-500/30';

            if (type === 'error') {
                iconName = 'error';
                iconColor = 'text-rose-400';
                borderColor = 'border-rose-500/30';
            } else if (type === 'info') {
                iconName = 'info';
                iconColor = 'text-purple-400';
                borderColor = 'border-purple-500/30';
            }

            toast.classList.add(borderColor);

            toast.innerHTML = `
                <div class="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center shrink-0 mt-0.5">
                    <span class="material-symbols-outlined text-lg ${iconColor}">${iconName}</span>
                </div>
                <div class="flex-1 min-w-0">
                    ${title ? `<p class="text-sm font-semibold text-white mb-0.5">${title}</p>` : ''}
                    <p class="text-xs text-on-surface-variant leading-relaxed">${message}</p>
                </div>
                <button class="text-white/40 hover:text-white transition-colors shrink-0 text-xs">
                    <span class="material-symbols-outlined text-sm">close</span>
                </button>
            `;

            const closeBtn = toast.querySelector('button');
            const dismiss = () => {
                toast.classList.add('opacity-0', 'translate-x-4');
                setTimeout(() => {
                    if (toast.parentElement) toast.remove();
                }, 300);
            };

            closeBtn.addEventListener('click', dismiss);

            this.container.appendChild(toast);

            // Animate in
            requestAnimationFrame(() => {
                toast.classList.remove('translate-y-4', 'opacity-0');
            });

            // Auto dismiss after 3.5s
            setTimeout(dismiss, 3500);
        }

        success(message, title = 'Success') {
            this.show(message, 'success', title);
        }

        error(message, title = 'Error') {
            this.show(message, 'error', title);
        }

        info(message, title = 'Information') {
            this.show(message, 'info', title);
        }
    }

    window.ScaleIT.Notifications = new NotificationManager();
})();
