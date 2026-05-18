import { PublicClientApplication } from '@azure/msal-browser';

const clientId = import.meta.env.VITE_ENTRA_CLIENT_ID;
const tenantId = import.meta.env.VITE_ENTRA_TENANT_ID;
const redirectUri = import.meta.env.VITE_ENTRA_REDIRECT_URI || (typeof window !== 'undefined' ? window.location.origin : 'http://localhost:5173');

export const entraEnabled = Boolean(clientId && tenantId);

export const entraLoginRequest = {
  scopes: ['openid', 'profile', 'email', 'User.Read'],
};

export const msalInstance = entraEnabled
  ? new PublicClientApplication({
      auth: {
        clientId,
        authority: `https://login.microsoftonline.com/${tenantId}`,
        redirectUri,
        navigateToLoginRequestUrl: false,
      },
      cache: {
        cacheLocation: 'localStorage',
        storeAuthStateInCookie: false,
      },
    })
  : null;

export const buildEntraProfile = (account, claims = {}) => {
  const email = String(account?.username || claims.preferred_username || claims.email || '').toLowerCase();
  const groups = Array.isArray(claims.groups) ? claims.groups : [];
  const roles = Array.isArray(claims.roles) ? claims.roles : [];
  const roleGroupMap = {
    admin: String(import.meta.env.VITE_ENTRA_ADMIN_GROUP_IDS || '').split(',').map(item => item.trim()).filter(Boolean),
    manager: String(import.meta.env.VITE_ENTRA_MANAGER_GROUP_IDS || '').split(',').map(item => item.trim()).filter(Boolean),
    employee: String(import.meta.env.VITE_ENTRA_EMPLOYEE_GROUP_IDS || '').split(',').map(item => item.trim()).filter(Boolean),
  };

  const resolveRole = () => {
    if (roles.some(role => ['admin', 'manager', 'employee'].includes(String(role).toLowerCase()))) {
      return roles.find(role => ['admin', 'manager', 'employee'].includes(String(role).toLowerCase())).toLowerCase();
    }

    if (groups.some(groupId => roleGroupMap.admin.includes(groupId))) return 'admin';
    if (groups.some(groupId => roleGroupMap.manager.includes(groupId))) return 'manager';
    if (groups.some(groupId => roleGroupMap.employee.includes(groupId))) return 'employee';

    if (email.includes('admin')) return 'admin';
    if (email.includes('manager')) return 'manager';
    return 'employee';
  };

  return {
    azureAdId: claims.oid || account?.localAccountId || account?.homeAccountId || email,
    email,
    name: account?.name || claims.name || email.split('@')[0],
    department: email.includes('admin') ? 'HR' : 'Engineering & Technology',
    role: resolveRole(),
    tenantId: claims.tid || null,
    issuer: claims.iss || null,
    groups,
    roles,
  };
};