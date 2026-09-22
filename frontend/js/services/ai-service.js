window.ScaleIT = window.ScaleIT || {};

(function () {
    const API_BASE = (window.ScaleIT.Config && window.ScaleIT.Config.API_BASE) || 'http://localhost:3000';

    class AIService {
        constructor() {
            this.entitlements = window.ScaleIT.EntitlementsService;
        }

        async isAIAvailable() {
            return await this.entitlements.canAccess('crm.aiAssistant');
        }

        _locked(message) {
            return { locked: true, message };
        }

        async _post(path, body) {
            const token = localStorage.getItem('authToken');
            if (!token) {
                return { error: 'Your session has expired. Please log in again.' };
            }

            try {
                const res = await fetch(`${API_BASE}${path}`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify(body || {})
                });

                const data = await res.json().catch(() => ({}));

                if (!res.ok) {
                    return { error: data.error || `AI request failed (${res.status})` };
                }
                return data;
            } catch (err) {
                return { error: 'Could not reach the AI service. Is the backend running?' };
            }
        }

        async scoreLead(lead) {
            if (!(await this.isAIAvailable())) {
                return this._locked('AI Lead Scoring requires the Professional plan or above.');
            }
            return this._post(`/ai/leads/${lead.id}/score`);
        }

        async analyzeDealRisk(deal) {
            if (!(await this.isAIAvailable())) {
                return this._locked('AI Risk Analysis requires the Professional plan or above.');
            }
            return this._post(`/ai/deals/${deal.id}/risk`);
        }

        async generateCustomerSummary(company) {
            if (!(await this.isAIAvailable())) {
                return this._locked('AI Customer Summary requires the Professional plan or above.');
            }
            const id = typeof company === 'string' ? company : company.id;
            return this._post(`/ai/companies/${id}/summary`);
        }

        async askAssistant(promptQuery) {
            if (!(await this.isAIAvailable())) {
                return this._locked('The AI CRM Assistant is available on Professional, Business and Enterprise plans.');
            }

            const data = await this._post('/ai/assistant', { question: promptQuery });
            if (data.error) return data;

            return {
                reply: data.answer,
                answer: data.answer,
                usedData: data.usedData || [],
                suggestedFollowUps: data.suggestedFollowUps || []
            };
        }
    }

    window.ScaleIT.AIService = new AIService();
})();
