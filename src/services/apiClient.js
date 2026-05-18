const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const request = async (path, options = {}) => {
  const token = localStorage.getItem('authToken');
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
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
  getGoals: () => request('/goals'),
  createGoalDraft: (goal) => request('/goals/drafts', {
    method: 'POST',
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
  getApprovals: () => request('/approvals'),
  updateApproval: (approvalId, body) => request(`/approvals/${approvalId}`, {
    method: 'PUT',
    body: JSON.stringify(body),
  }),
  getAchievementReport: () => request('/reports/achievement'),
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
};
