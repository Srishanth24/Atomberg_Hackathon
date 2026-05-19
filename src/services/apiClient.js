const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

const request = async (path, options = {}) => {
  const token = localStorage.getItem('authToken');
  const userRole = localStorage.getItem('userRole');
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(userRole ? { 'x-user-role': userRole } : {}),
      ...options.headers,
    },
  });

  const payload = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(payload.error || payload.message || 'Request failed');
  }

  return payload.data;
};

export const apiClient = {
  login: (credentials) => request('/auth/login', {
    method: 'POST',
    body: JSON.stringify(credentials),
  }),
  loginWithEntra: (profile) => request('/auth/entra', {
    method: 'POST',
    body: JSON.stringify(profile),
  }),
  getGoals: () => request('/goals'),
  createGoalDraft: (goal) => request('/goals/drafts', {
    method: 'POST',
    body: JSON.stringify(goal),
  }),
  updateGoalDraft: (goalId, goal) => request(`/goals/${goalId}`, {
    method: 'PUT',
    body: JSON.stringify(goal),
  }),
  submitGoalSheet: () => request('/goals/submit', {
    method: 'POST',
    body: JSON.stringify({ cycle: 'FY2026' }),
  }),
  submitCheckin: (goalId, checkin) => request(`/goals/${goalId}/checkins`, {
    method: 'POST',
    body: JSON.stringify(checkin),
  }),
  unlockGoal: (goalId) => request(`/goals/${goalId}/unlock`, {
    method: 'PUT',
    body: JSON.stringify({}),
  }),
  getApprovals: () => request('/approvals'),
  updateApproval: (approvalId, body) => request(`/approvals/${approvalId}`, {
    method: 'PUT',
    body: JSON.stringify(body),
  }),
  getAchievementReport: () => request('/reports/achievement'),
  getAnalyticsDashboard: () => request('/analytics/dashboard'),
  getCycleSettings: () => request('/cycle-settings'),
  updateCycleSettings: (settings) => request('/cycle-settings', {
    method: 'PUT',
    body: JSON.stringify(settings),
  }),
  getOrgHierarchy: () => request('/org-hierarchy'),
  syncOrgHierarchy: (members = []) => request('/org-hierarchy/sync', {
    method: 'POST',
    body: JSON.stringify({ members }),
  }),
  exportAchievementReport: (format = 'csv') => {
    const token = localStorage.getItem('authToken');
    const url = `${API_BASE_URL}/reports/achievement/export?format=${format}`;
    return fetch(url, {
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    }).then(res => {
      if (!res.ok) throw new Error('Export failed');
      return res.blob();
    });
  },
  exportAuditReport: (format = 'csv') => {
    const token = localStorage.getItem('authToken');
    const url = `${API_BASE_URL}/reports/audit/export?format=${format}`;
    return fetch(url, {
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    }).then(res => {
      if (!res.ok) throw new Error('Export failed');
      return res.blob();
    });
  },
  getAuditLogs: () => request('/reports/audit'),
  getSharedGoals: () => request('/shared-goals'),
  syncSharedGoal: (sharedGoalId, actualAchievement) => request(`/shared-goals/${sharedGoalId}/sync`, {
    method: 'POST',
    body: JSON.stringify({ actualAchievement }),
  }),
  createSharedGoal: (sharedGoal) => request('/shared-goals', {
    method: 'POST',
    body: JSON.stringify(sharedGoal),
  }),
  getNotifications: () => request('/notifications'),
  getEscalations: () => request('/escalations'),
  markNotificationRead: (notificationId) => request(`/notifications/${notificationId}/read`, {
    method: 'PUT',
    body: JSON.stringify({}),
  }),
  markAllNotificationsRead: () => request('/notifications/read-all', {
    method: 'PUT',
    body: JSON.stringify({}),
  }),
  deleteNotification: (notificationId) => request(`/notifications/${notificationId}`, {
    method: 'DELETE',
  }),
};
