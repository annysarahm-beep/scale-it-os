/**
 * Scale IT OS - Core Configuration
 * Central definitions for roles, subscription packages, and tenant defaults.
 */

window.ScaleIT = window.ScaleIT || {};

window.ScaleIT.Config = {
    APP_NAME: 'Scale IT OS',
    API_BASE: 'http://localhost:3000',
    VERSION: '1.0.0',
    STORAGE_PREFIX: 'scale_it_',

    // System Roles
    ROLES: {
        ORGANIZATION_ADMIN: 'organization',
        EMPLOYEE: 'employee',
        COMPANY_CLIENT: 'company',
        PLATFORM_ADMIN: 'scale-it-admin'
    },

    // Subscription Package Tiers
    PACKAGES: {
        STARTER: {
            id: 'starter',
            name: 'Starter Package',
            badge: 'Starter',
            features: [
                'crm.basicDashboard',
                'crm.leads',
                'crm.contacts',
                'crm.tasks'
            ],
            limits: {
                users: 3,
                leads: 100,
                contacts: 200,
                deals: 15,
                aiActions: 0
            }
        },
        PROFESSIONAL: {
            id: 'professional',
            name: 'Professional Package',
            badge: 'Pro',
            features: [
                'crm.basicDashboard',
                'crm.leads',
                'crm.contacts',
                'crm.companies',
                'crm.deals',
                'crm.pipeline',
                'crm.activities',
                'crm.tasks',
                'crm.reports',
                'crm.teamAccess',
                'crm.aiAssistant'
            ],
            limits: {
                users: 15,
                leads: 2500,
                contacts: 5000,
                deals: 500,
                aiActions: 500
            }
        },
        BUSINESS: {
            id: 'business',
            name: 'Business Package',
            badge: 'Business',
            features: [
                'crm.basicDashboard',
                'crm.leads',
                'crm.contacts',
                'crm.companies',
                'crm.deals',
                'crm.pipeline',
                'crm.activities',
                'crm.tasks',
                'crm.reports',
                'crm.teamAccess',
                'crm.aiAssistant',
                'crm.automation',
                'crm.customFields',
                'crm.api'
            ],
            limits: {
                users: 50,
                leads: 15000,
                contacts: 25000,
                deals: 2500,
                aiActions: 2500
            }
        },
        ENTERPRISE: {
            id: 'enterprise',
            name: 'Enterprise Package',
            badge: 'Enterprise',
            features: [
                'crm.basicDashboard',
                'crm.leads',
                'crm.contacts',
                'crm.companies',
                'crm.deals',
                'crm.pipeline',
                'crm.activities',
                'crm.tasks',
                'crm.reports',
                'crm.teamAccess',
                'crm.aiAssistant',
                'crm.automation',
                'crm.customFields',
                'crm.api',
                'crm.auditLogs',
                'crm.dedicatedSupport'
            ],
            limits: {
                users: 9999,
                leads: 999999,
                contacts: 999999,
                deals: 99999,
                aiActions: 99999
            }
        }
    },

    // Default Seed Tenants for initial state
    DEFAULT_TENANTS: {
        'org_northstar': {
            id: 'org_northstar',
            name: 'Northstar Labs',
            planId: 'professional',
            ownerEmail: 'admin@northstarlabs.io',
            industry: 'Technology & Cloud Solutions',
            status: 'Active',
            createdAt: '2026-01-15T09:00:00Z'
        },
        'org_northwind': {
            id: 'org_northwind',
            name: 'Northwind Holdings',
            planId: 'enterprise',
            ownerEmail: 'contact@northwind.com',
            industry: 'Logistics & Supply',
            status: 'Active',
            createdAt: '2026-02-01T10:30:00Z'
        }
    }
};
