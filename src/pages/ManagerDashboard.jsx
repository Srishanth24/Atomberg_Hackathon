import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Users, CheckCircle, AlertCircle, BarChart2,
  MessageSquare, UserPlus, FileText, Check, X,
  RefreshCw, History, Clock, Lock, Target, Share2, CornerDownRight, Plus
} from 'lucide-react';
import toast from 'react-hot-toast';
import { apiClient } from '../services/apiClient';
import './ManagerDashboard.css';

const TEAM_MEMBERS = [
  { id: 1, name: 'Sarah Jenkins', role: 'Sales Rep', goals: 4, progress: 62, status: 'On Track' },
  { id: 2, name: 'Mike Chen', role: 'Account Executive', goals: 3, progress: 85, status: 'Completed' },
  { id: 3, name: 'Jessica Alba', role: 'Sales Engineer', goals: 5, progress: 30, status: 'Behind' },
  { id: 4, name: 'Tom Hardy', role: 'SDR', goals: 2, progress: 50, status: 'On Track' },
];

const SHARED_KPIS = [
  {
    id: 201, title: 'Increase Department Revenue by 15%', owner: 'Alex Manager',
    linkedEmployees: ['Sarah Jenkins', 'Mike Chen'], syncStatus: 'Synced', lastSync: '10 mins ago',
    progress: 65,
    children: [
      { name: 'Sarah Jenkins', progress: 70, weightage: 40 },
      { name: 'Mike Chen', progress: 60, weightage: 60 }
    ]
  },
  {
    id: 202, title: 'Reduce Churn by 5%', owner: 'Alex Manager',
    linkedEmployees: ['Jessica Alba'], syncStatus: 'Pending Sync', lastSync: '2 days ago',
    progress: 30,
    children: [
      { name: 'Jessica Alba', progress: 30, weightage: 100 }
    ]
  }
];

const SHARED_GOAL_TEMPLATES = [
  {
    title: 'Improve Department Goal Completion to 95%',
    description: 'Operational KPI for improving completion quality in the current cycle.',
    thrustArea: 'Operational Excellence',
    target: 95,
  },
  {
    title: 'Reduce Engineering Escalations by 30%',
    description: 'Track proactive risk mitigation and reduce escalation volume quarter over quarter.',
    thrustArea: 'Risk Management',
    target: 30,
  },
  {
    title: 'Increase Customer Success Renewal Rate to 92%',
    description: 'Shared KPI aligned with retention and service quality outcomes.',
    thrustArea: 'Customer Excellence',
    target: 92,
  },
];

const normalizeSharedKpis = (kpis) => {
  const seen = new Set();
  return (Array.isArray(kpis) ? kpis : []).filter((kpi) => {
    const key = String(kpi.title || '').trim().toLowerCase();
    if (!key || seen.has(key)) return false;
    seen.add(key);
    return true;
  });
};

const ManagerDashboard = () => {
  const [approvals, setApprovals] = useState([]);
  const [goals, setGoals] = useState([]);
  const [sharedKpis, setSharedKpis] = useState(SHARED_KPIS);
  const [syncingKpi, setSyncingKpi] = useState(null);
  const [creatingSharedGoal, setCreatingSharedGoal] = useState(false);
  const [highlightedApprovalId, setHighlightedApprovalId] = useState(null);
  const [approvalEdits, setApprovalEdits] = useState({});
  const location = useLocation();
  const navigate = useNavigate();
  const hash = location.hash.replace('#', '');
  const activeTab = hash === 'approvals' || hash === 'shared' ? hash : 'team';

  useEffect(() => {
    Promise.all([apiClient.getGoals(), apiClient.getApprovals(), apiClient.getSharedGoals()])
      .then(([goalsData, approvalsData, sharedGoalsData]) => {
        setGoals(goalsData);
        setApprovals(approvalsData);
        setSharedKpis(normalizeSharedKpis(sharedGoalsData.length ? sharedGoalsData : SHARED_KPIS));
      })
      .catch(error => toast.error(error.message));
  }, []);

  const approvalItems = approvals;

  const getApprovalGoals = (approval) => goals.filter(goal => String(goal.employeeId) === String(approval.employeeId) && approval.goals.some(snapshot => String(snapshot.goalId) === String(goal.id)));

  const updateApprovalGoalEdit = (approvalId, goalId, field, value) => {
    setApprovalEdits((previous) => ({
      ...previous,
      [approvalId]: {
        ...(previous[approvalId] || {}),
        [goalId]: {
          ...(previous[approvalId]?.[goalId] || {}),
          [field]: field === 'weightage' ? Number(value) : value,
        },
      },
    }));
  };

  const buildGoalEdits = (approval) => {
    const approvalGoals = getApprovalGoals(approval);
    return approvalGoals.map((goal) => {
      const draft = approvalEdits[approval.id]?.[goal.id] || {};
      return {
        goalId: goal.id,
        target: draft.target ?? goal.target,
        weightage: draft.weightage ?? goal.weightage,
      };
    });
  };

  const handleTabChange = (tab) => {
    if (tab === 'team') {
      navigate('/manager');
    } else {
      navigate(`/manager#${tab}`);
    }
  };

  const handleAction = async (approval, actionType) => {
    if (!String(approval.id).startsWith('goal-')) {
      const loadingToast = toast.loading(`${actionType === 'Approved' ? 'Approving' : 'Returning'} goal sheet...`);
      try {
        const updatedApproval = await apiClient.updateApproval(approval.id, {
          action: actionType === 'Approved' ? 'approve' : actionType === 'Returned' ? 'return' : 'reject',
          managerComment: approval.comment || '',
          goalEdits: buildGoalEdits(approval),
        });
        setApprovals(approvals.map(item => item.id === approval.id ? updatedApproval : item));
        setGoals(await apiClient.getGoals());
        if (actionType === 'Approved') {
          setHighlightedApprovalId(approval.id);
          setTimeout(() => setHighlightedApprovalId(null), 1200);
        }
        toast.success(actionType === 'Approved' ? 'Goal sheet approved and locked' : 'Goal sheet returned', { id: loadingToast });
      } catch (error) {
        toast.error(error.message, { id: loadingToast });
      }
      return;
    }
  };

  const handleSync = (id) => {
    setSyncingKpi(id);
    apiClient.syncSharedGoal(id, 100)
      .then(() => apiClient.getSharedGoals())
      .then((goals) => setSharedKpis(normalizeSharedKpis(goals)))
      .catch(error => toast.error(error.message))
      .finally(() => setSyncingKpi(null));
  };

  const handleExportReport = async () => {
    try {
      const rows = await apiClient.getAchievementReport();
      const headers = Object.keys(rows[0] || { message: 'No report rows available' });
      const csv = [
        headers.join(','),
        ...rows.map(row => headers.map(header => `"${String(row[header] ?? '').replace(/"/g, '""')}"`).join(',')),
      ].join('\n');
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'team_achievement_report.csv';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      toast.success('Team report exported');
    } catch (error) {
      toast.error(error.message);
    }
  };

  const handleCreateSharedGoal = async () => {
    setCreatingSharedGoal(true);
    try {
      const existingTitles = new Set(sharedKpis.map((kpi) => String(kpi.title || '').trim().toLowerCase()));
      const template = SHARED_GOAL_TEMPLATES.find((item) => !existingTitles.has(item.title.toLowerCase())) || {
        title: `Shared KPI ${new Date().toLocaleTimeString()}`,
        description: 'Custom shared KPI created for this reporting cycle.',
        thrustArea: 'Operational Excellence',
        target: 90,
      };

      await apiClient.createSharedGoal({
        title: template.title,
        description: template.description,
        thrustArea: template.thrustArea,
        uom: 'Min (Numeric / %)',
        target: template.target,
        defaultWeightage: 10,
      });

      setSharedKpis(normalizeSharedKpis(await apiClient.getSharedGoals()));
      toast.success('Shared goal created for your team');
    } catch (error) {
      toast.error(error.message);
    } finally {
      setCreatingSharedGoal(false);
    }
  };

  const renderTeam = () => (
    <div className="animate-fade-in">
      <div className="dashboard-header mb-6">
        <div>
          <h1 className="text-2xl font-bold">Manager Dashboard</h1>
          <p className="text-secondary mt-1">Overview of your team's performance and pending items.</p>
        </div>
        <div className="flex gap-4">
          <button className="btn btn-outline" onClick={handleExportReport}>
            <FileText size={16} />
            Export Report
          </button>
          <button className="btn btn-primary" onClick={() => handleTabChange('shared')}>
            <UserPlus size={16} />
            Assign Shared Goal
          </button>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-6 mb-6">
        <div className="card stat-card hover:shadow-md transition-shadow cursor-pointer">
          <div className="stat-icon-wrapper bg-blue-100 text-blue-600">
            <Users size={24} />
          </div>
          <div className="stat-content">
            <p className="stat-label">Team Members</p>
            <h3 className="stat-value">8</h3>
          </div>
        </div>
        <div className="card stat-card hover:shadow-md transition-shadow cursor-pointer">
          <div className="stat-icon-wrapper bg-yellow-100 text-yellow-600">
            <CheckCircle size={24} />
          </div>
          <div className="stat-content">
            <p className="stat-label">Pending Approvals</p>
            <h3 className="stat-value">{approvalItems.filter(a => a.status === 'Pending' || a.status === 'Under Review').length}</h3>
          </div>
        </div>
        <div className="card stat-card hover:shadow-md transition-shadow cursor-pointer">
          <div className="stat-icon-wrapper bg-green-100 text-green-600">
            <BarChart2 size={24} />
          </div>
          <div className="stat-content">
            <p className="stat-label">Avg Completion</p>
            <h3 className="stat-value">56%</h3>
          </div>
        </div>
        <div className="card stat-card hover:shadow-md transition-shadow cursor-pointer border-l-4 border-red-500">
          <div className="stat-icon-wrapper bg-red-100 text-red-600">
            <AlertCircle size={24} />
          </div>
          <div className="stat-content">
            <p className="stat-label">At Risk Goals</p>
            <h3 className="stat-value">3</h3>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6 mb-6">
        <div className="card shadow-sm hover:shadow-md transition-shadow">
          <div className="card-header border-b border-gray-100 pb-3 mb-4">
            <h2 className="card-title flex items-center gap-2"><Clock size={18} className="text-yellow-600" /> Manager Pulse</h2>
          </div>
          <div className="space-y-4">
            {[
              { label: 'Pending approvals', value: approvalItems.filter(item => item.status === 'Pending' || item.status === 'Under Review').length, tone: 'bg-yellow-500' },
              { label: 'Shared goals synced', value: sharedKpis.filter(kpi => kpi.syncStatus === 'Synced').length, tone: 'bg-green-500' },
              { label: 'At-risk teammates', value: TEAM_MEMBERS.filter(member => member.status === 'Behind').length, tone: 'bg-red-500' },
            ].map(item => (
              <div key={item.label}>
                <div className="flex justify-between text-sm mb-1.5">
                  <span className="text-gray-700 font-medium">{item.label}</span>
                  <span className="font-bold text-gray-900">{item.value}</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2.5">
                  <div className={`${item.tone} h-2.5 rounded-full`} style={{ width: `${Math.max(24, item.value * 28)}%` }}></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="card shadow-sm hover:shadow-md transition-shadow">
          <div className="card-header border-b border-gray-100 pb-3 mb-4">
            <h2 className="card-title flex items-center gap-2"><Target size={18} className="text-blue-600" /> Team Spotlight</h2>
          </div>
          <div className="space-y-3">
            {TEAM_MEMBERS.slice(0, 3).map(member => (
              <div key={member.id} className="flex items-center justify-between rounded-xl border border-gray-100 bg-gray-50/70 px-3 py-3">
                <div>
                  <p className="font-semibold text-gray-800">{member.name}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{member.role}</p>
                </div>
                <div className="text-right">
                  <div className="text-sm font-bold text-gray-900">{member.progress}%</div>
                  <span className={`badge ${member.status === 'Completed' ? 'badge-success' : member.status === 'Behind' ? 'badge-danger' : 'badge-primary'}`}>{member.status}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="card shadow-sm hover:shadow-md transition-shadow">
          <div className="card-header border-b border-gray-100 pb-3 mb-4 flex justify-between items-center">
            <h2 className="card-title flex items-center gap-2"><MessageSquare size={18} className="text-indigo-600" /> Action Queue</h2>
            <span className="badge badge-secondary">Today</span>
          </div>
          <div className="space-y-3">
            <button className="w-full rounded-xl border border-gray-200 px-4 py-3 text-left hover:bg-gray-50 transition-colors" onClick={() => handleTabChange('approvals')}>
              <p className="font-semibold text-gray-800">Review pending approvals</p>
              <p className="text-xs text-gray-500 mt-0.5">Clear the queue before cycle lock-in.</p>
            </button>
            <button className="w-full rounded-xl border border-gray-200 px-4 py-3 text-left hover:bg-gray-50 transition-colors" onClick={() => handleTabChange('shared')}>
              <p className="font-semibold text-gray-800">Sync shared KPIs</p>
              <p className="text-xs text-gray-500 mt-0.5">Push the latest target values to the team.</p>
            </button>
            <button className="w-full rounded-xl border border-gray-200 px-4 py-3 text-left hover:bg-gray-50 transition-colors" onClick={handleExportReport}>
              <p className="font-semibold text-gray-800">Export team report</p>
              <p className="text-xs text-gray-500 mt-0.5">Generate a fresh spreadsheet for review.</p>
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6">
        <div className="card col-span-2">
          <div className="card-header border-b border-gray-100 pb-4">
            <h2 className="card-title">Team Progress Tracker</h2>
          </div>
          <div className="table-container">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3">Employee</th>
                  <th className="px-4 py-3">Role</th>
                  <th className="px-4 py-3">Goals</th>
                  <th className="px-4 py-3">Progress</th>
                  <th className="px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {TEAM_MEMBERS.map(member => (
                  <tr key={member.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <div className="font-bold">{member.name}</div>
                    </td>
                    <td className="px-4 py-3 text-secondary">{member.role}</td>
                    <td className="px-4 py-3">{member.goals}</td>
                    <td className="px-4 py-3">
                      <div className="progress-cell flex items-center gap-2">
                        <span className="text-sm font-bold w-8">{member.progress}%</span>
                        <div className="progress-bar-bg flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div
                            className="progress-bar-fill h-full transition-all"
                            style={{
                              width: `${member.progress}%`,
                              backgroundColor: member.progress >= 80 ? 'var(--success)' : member.progress <= 40 ? 'var(--danger)' : 'var(--primary)'
                            }}
                          ></div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <button className="btn btn-outline btn-sm hover:bg-gray-100" onClick={() => toast(`${member.name}: ${member.progress}% progress across ${member.goals} goals`)}>View Profile</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="card">
          <div className="card-header border-b border-gray-100 pb-4">
            <h2 className="card-title flex items-center gap-2"><AlertCircle size={18} className="text-red-500" /> Needs Attention</h2>
          </div>
          <div className="list-group p-4 space-y-4">
            {approvalItems.filter(a => a.status === 'Pending').map(approval => (
              <div key={approval.id} className="list-item flex items-start gap-3 p-3 bg-yellow-50 rounded border border-yellow-100">
                <div className="list-icon text-yellow-600 mt-1"><Clock size={16} /></div>
                <div className="list-content">
                  <h4 className="font-semibold text-gray-800">{approval.user}</h4>
                  <p className="text-sm text-gray-600">{approval.type}: {approval.title}</p>
                </div>
              </div>
            ))}
            <div className="list-item flex items-start gap-3 p-3 bg-red-50 rounded border border-red-100">
              <div className="list-icon text-red-600 mt-1"><AlertCircle size={16} /></div>
              <div className="list-content">
                <h4 className="font-semibold text-gray-800">Jessica Alba</h4>
                <p className="text-sm text-gray-600">Goal "Q3 Product Demo" is behind schedule</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderApprovals = () => (
    <div className="animate-fade-in">
      <div className="dashboard-header mb-6">
        <div>
          <h1 className="text-2xl font-bold">Pending Approvals</h1>
          <p className="text-secondary mt-1">Review and approve goal requests and check-ins.</p>
        </div>
      </div>

      <div className="approval-list space-y-6">
        {approvalItems.map(approval => (
          <div key={approval.id} className={`card approval-card border border-gray-200 shadow-sm overflow-hidden ${highlightedApprovalId === approval.id ? 'approval-flash' : ''}`}>
            <div className="approval-header bg-gray-50 p-4 border-b border-gray-200 flex justify-between items-center">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center"><Users size={20} /></div>
                <div>
                  <h3 className="font-bold text-lg">{approval.user}</h3>
                  <p className="text-sm text-secondary flex items-center gap-1"><Clock size={12} /> Submitted {approval.submittedAt}</p>
                </div>
              </div>
              <div className="flex flex-col items-end gap-2">
                <span className={`badge ${approval.status === 'Approved' ? 'badge-success' : approval.status === 'Rejected' ? 'badge-danger' : approval.status === 'Returned' ? 'badge-warning' : 'badge-primary'}`}>
                  {approval.status}
                </span>
                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">{approval.type}</span>
              </div>
            </div>

            <div className="approval-body p-6 grid grid-cols-2 gap-6">
              <div>
                <div className="form-group">
                  <label className="form-label text-sm text-gray-500 uppercase">Inline Goal Edits</label>
                  <div className="space-y-3 mt-2">
                    {getApprovalGoals(approval).length > 0 ? getApprovalGoals(approval).map(goal => (
                      <div key={goal.id} className="rounded-lg border border-gray-200 bg-white p-3 shadow-sm">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <div className="font-semibold text-gray-800">{goal.title}</div>
                            <div className="text-xs text-secondary mt-0.5">{goal.thrustArea} · {goal.uom}</div>
                          </div>
                          {goal.locked ? <Lock size={14} className="text-gray-400 mt-1" /> : <span className="text-xs font-medium text-green-600 mt-1">Editable</span>}
                        </div>
                        <div className="grid grid-cols-2 gap-3 mt-3">
                          <div>
                            <label className="form-label text-xs text-gray-500 uppercase">Target</label>
                            <input
                              type="text"
                              className="form-control"
                              value={approvalEdits[approval.id]?.[goal.id]?.target ?? goal.target}
                              onChange={(event) => updateApprovalGoalEdit(approval.id, goal.id, 'target', event.target.value)}
                              disabled={approval.status !== 'Pending' && approval.status !== 'Under Review'}
                            />
                          </div>
                          <div>
                            <label className="form-label text-xs text-gray-500 uppercase">Weightage</label>
                            <input
                              type="number"
                              min="10"
                              max="100"
                              className="form-control"
                              value={approvalEdits[approval.id]?.[goal.id]?.weightage ?? goal.weightage}
                              onChange={(event) => updateApprovalGoalEdit(approval.id, goal.id, 'weightage', event.target.value)}
                              disabled={approval.status !== 'Pending' && approval.status !== 'Under Review'}
                            />
                          </div>
                        </div>
                      </div>
                    )) : (
                      <div className="rounded-lg border border-dashed border-gray-300 bg-gray-50 p-4 text-sm text-secondary">
                        Goal details are loading from the employee sheet.
                      </div>
                    )}
                  </div>
                </div>
                <div className="form-group mt-6">
                  <label className="form-label text-sm text-gray-500 uppercase">Manager Comment</label>
                  <textarea
                    className="form-control"
                    rows="3"
                    placeholder="Add feedback before approving/rejecting..."
                    value={approval.comment}
                    onChange={(e) => {
                      if (String(approval.id).startsWith('goal-')) {
                        setGoals(goals.map(goal => goal.id === approval.goalId ? { ...goal, managerComment: e.target.value } : goal));
                        return;
                      }
                      const newApprovals = [...approvals];
                      const idx = newApprovals.findIndex(a => a.id === approval.id);
                      newApprovals[idx].comment = e.target.value;
                      setApprovals(newApprovals);
                    }}
                  ></textarea>
                </div>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                <h4 className="font-semibold flex items-center gap-2 mb-4"><History size={16} /> Approval Timeline</h4>
                <div className="space-y-4">
                  {approval.history.map((hist, i) => (
                    <div key={i} className="flex gap-3">
                      <div className="flex flex-col items-center">
                        <div className="w-2 h-2 bg-blue-500 rounded-full mt-1.5"></div>
                        {i < approval.history.length - 1 && <div className="w-0.5 h-full bg-blue-200 my-1"></div>}
                      </div>
                      <div>
                        <p className="font-medium text-sm text-gray-800">{hist.action}</p>
                        <p className="text-xs text-gray-500">{hist.date}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="approval-footer p-4 bg-gray-50 border-t border-gray-200 flex justify-end gap-3">
              {approval.status === 'Pending' || approval.status === 'Under Review' ? (
                <>
                  <button className="btn btn-outline text-danger border-danger hover:bg-red-50" onClick={() => handleAction(approval, 'Rejected')}>
                    <X size={16} /> Reject
                  </button>
                  <button className="btn btn-outline text-warning border-warning hover:bg-yellow-50" onClick={() => handleAction(approval, 'Returned')}>
                    <MessageSquare size={16} /> Request Changes
                  </button>
                  <button className="btn btn-primary" onClick={() => handleAction(approval, 'Approved')}>
                    <Check size={16} /> Approve
                  </button>
                </>
              ) : (
                <button className="btn btn-outline" disabled>Action Taken</button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderShared = () => (
    <div className="animate-fade-in">
      <div className="dashboard-header mb-6">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2"><Share2 size={24} /> Shared KPIs</h1>
          <p className="text-secondary mt-1">Create, assign, and sync departmental KPIs to your team.</p>
        </div>
        <button className="btn btn-primary shadow-lg hover:shadow-xl transition-shadow" onClick={handleCreateSharedGoal} disabled={creatingSharedGoal}>
          <Plus size={16} /> {creatingSharedGoal ? 'Creating...' : 'Create Shared Goal'}
        </button>
      </div>

      <div className="space-y-6">
        {sharedKpis.map(kpi => (
          <div key={kpi.id} className="card shadow-sm border border-gray-200 overflow-hidden">
            <div className="card-header bg-gray-50 p-4 border-b border-gray-200 flex justify-between items-center">
              <div>
                <span className="badge badge-dark mb-2 inline-flex items-center gap-1"><Share2 size={12} /> Shared KPI</span>
                <h2 className="card-title text-lg font-bold">{kpi.title}</h2>
                <p className="text-sm text-gray-500">Primary Owner: <span className="font-medium text-gray-700">{kpi.owner}</span></p>
              </div>
              <div className="flex flex-col items-end gap-2">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-gray-600">Sync Status:</span>
                  <span className={`badge ${kpi.syncStatus === 'Synced' ? 'badge-success' : 'badge-warning'}`}>
                    {kpi.syncStatus}
                  </span>
                </div>
                <p className="text-xs text-gray-400">Last Sync: {kpi.lastSync}</p>
                <button
                  className={`btn btn-sm ${kpi.syncStatus === 'Pending Sync' ? 'btn-primary' : 'btn-outline'} flex items-center gap-1 mt-2`}
                  onClick={() => handleSync(kpi.id)}
                  disabled={syncingKpi === kpi.id}
                >
                  <RefreshCw size={14} className={syncingKpi === kpi.id ? 'animate-spin' : ''} />
                  {syncingKpi === kpi.id ? 'Syncing...' : 'Sync Now'}
                </button>
              </div>
            </div>

            <div className="p-4">
              <div className="mb-4">
                <div className="flex justify-between text-sm font-semibold mb-1">
                  <span>Overall KPI Progress</span>
                  <span>{kpi.progress}%</span>
                </div>
                <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
                  <div className="h-full bg-blue-600" style={{ width: `${kpi.progress}%` }}></div>
                </div>
              </div>

              <div className="bg-white border border-gray-100 rounded-lg p-4">
                <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                  <Target size={16} /> Linked Employee Goals ({kpi.linkedEmployees.length})
                </h4>
                <div className="space-y-3">
                  {kpi.children.map((child, idx) => (
                    <div key={idx} className="flex items-center gap-4 bg-gray-50 p-2 rounded">
                      <CornerDownRight size={16} className="text-gray-400" />
                      <div className="w-1/4 font-medium text-sm">{child.name}</div>
                      <div className="flex-1">
                        <div className="flex justify-between text-xs mb-1">
                          <span>Progress: {child.progress}%</span>
                          <span>Weightage: {child.weightage}%</span>
                        </div>
                        <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
                          <div className="h-full bg-green-500" style={{ width: `${child.progress}%` }}></div>
                        </div>
                      </div>
                      <div className="w-10">
                        <Lock size={14} className="text-gray-400" title="Employees cannot edit this title" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="manager-dashboard">
      <div className="tabs-nav mb-6 border-b border-gray-200">
        <button
          className={`tab-btn relative px-4 py-2 font-medium transition-colors ${activeTab === 'team' ? 'active text-primary border-b-2 border-primary' : 'text-gray-500 hover:text-gray-700'}`}
          onClick={() => handleTabChange('team')}
        >
          Team Overview
        </button>
        <button
          className={`tab-btn relative px-4 py-2 font-medium transition-colors flex items-center gap-2 ${activeTab === 'approvals' ? 'active text-primary border-b-2 border-primary' : 'text-gray-500 hover:text-gray-700'}`}
          onClick={() => handleTabChange('approvals')}
        >
          Approvals
          {approvalItems.filter(a => a.status === 'Pending' || a.status === 'Under Review').length > 0 && (
            <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full ml-1">
              {approvalItems.filter(a => a.status === 'Pending' || a.status === 'Under Review').length}
            </span>
          )}
        </button>
        <button
          className={`tab-btn relative px-4 py-2 font-medium transition-colors ${activeTab === 'shared' ? 'active text-primary border-b-2 border-primary' : 'text-gray-500 hover:text-gray-700'}`}
          onClick={() => handleTabChange('shared')}
        >
          Shared Goals
        </button>
      </div>

      {activeTab === 'team' && renderTeam()}
      {activeTab === 'approvals' && renderApprovals()}
      {activeTab === 'shared' && renderShared()}
    </div>
  );
};

export default ManagerDashboard;
