import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { 
  Users, CheckCircle, AlertCircle, BarChart2, 
  MessageSquare, UserPlus, FileText, Check, X,
  RefreshCw, History, Clock, Lock, Target, Share2, CornerDownRight
} from 'lucide-react';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer 
} from 'recharts';
import './ManagerDashboard.css';

const TEAM_MEMBERS = [
  { id: 1, name: 'Sarah Jenkins', role: 'Sales Rep', goals: 4, progress: 62, status: 'On Track' },
  { id: 2, name: 'Mike Chen', role: 'Account Executive', goals: 3, progress: 85, status: 'Completed' },
  { id: 3, name: 'Jessica Alba', role: 'Sales Engineer', goals: 5, progress: 30, status: 'Behind' },
  { id: 4, name: 'Tom Hardy', role: 'SDR', goals: 2, progress: 50, status: 'On Track' },
];

const INITIAL_APPROVALS = [
  { 
    id: 101, user: 'Sarah Jenkins', type: 'New Goal', title: 'Complete Leadership Training', submittedAt: '2 days ago',
    status: 'Pending', history: [{action: 'Submitted', date: '2 days ago'}], comment: '', weightage: 20
  },
  { 
    id: 102, user: 'Jessica Alba', type: 'Check-in', title: 'Q3 Product Demo Target', submittedAt: '1 day ago',
    status: 'Under Review', history: [{action: 'Submitted', date: '1 day ago'}, {action: 'Reviewed', date: '12 hours ago'}], comment: '', weightage: 30
  },
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

const TREND_DATA = [
  { name: 'Month 1', teamAvg: 20 },
  { name: 'Month 2', teamAvg: 45 },
  { name: 'Month 3', teamAvg: 70 },
];

const ManagerDashboard = () => {
  const [activeTab, setActiveTab] = useState('team');
  const [approvals, setApprovals] = useState(INITIAL_APPROVALS);
  const [sharedKpis, setSharedKpis] = useState(SHARED_KPIS);
  const [syncingKpi, setSyncingKpi] = useState(null);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const hash = location.hash.replace('#', '');
    if (hash === 'approvals' || hash === 'shared') {
      setActiveTab(hash);
    } else {
      setActiveTab('team');
    }
  }, [location.hash]);

  const handleTabChange = (tab) => {
    if (tab === 'team') {
      navigate('/manager');
    } else {
      navigate(`/manager#${tab}`);
    }
  };

  const handleAction = (id, actionType) => {
    setApprovals(approvals.map(app => {
      if (app.id === id) {
        return { 
          ...app, 
          status: actionType, 
          history: [...app.history, {action: actionType, date: 'Just now'}] 
        };
      }
      return app;
    }));
  };

  const handleSync = (id) => {
    setSyncingKpi(id);
    setTimeout(() => {
      setSharedKpis(sharedKpis.map(kpi => kpi.id === id ? {...kpi, syncStatus: 'Synced', lastSync: 'Just now'} : kpi));
      setSyncingKpi(null);
    }, 1500);
  };

  const renderTeam = () => (
    <div className="animate-fade-in">
      <div className="dashboard-header mb-6">
        <div>
          <h1 className="text-2xl font-bold">Manager Dashboard</h1>
          <p className="text-secondary mt-1">Overview of your team's performance and pending items.</p>
        </div>
        <div className="flex gap-4">
          <button className="btn btn-outline">
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
            <h3 className="stat-value">{approvals.filter(a => a.status === 'Pending' || a.status === 'Under Review').length}</h3>
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
                      <button className="btn btn-outline btn-sm hover:bg-gray-100">View Profile</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="card">
          <div className="card-header border-b border-gray-100 pb-4">
            <h2 className="card-title flex items-center gap-2"><AlertCircle size={18} className="text-red-500"/> Needs Attention</h2>
          </div>
          <div className="list-group p-4 space-y-4">
            {approvals.filter(a => a.status === 'Pending').map(approval => (
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
        {approvals.map(approval => (
          <div key={approval.id} className="card approval-card border border-gray-200 shadow-sm overflow-hidden">
            <div className="approval-header bg-gray-50 p-4 border-b border-gray-200 flex justify-between items-center">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center"><Users size={20} /></div>
                <div>
                  <h3 className="font-bold text-lg">{approval.user}</h3>
                  <p className="text-sm text-secondary flex items-center gap-1"><Clock size={12}/> Submitted {approval.submittedAt}</p>
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
                  <label className="form-label text-sm text-gray-500 uppercase">Goal Title</label>
                  <div className="font-medium text-lg border border-transparent hover:border-gray-300 p-2 rounded transition-colors cursor-text" contentEditable suppressContentEditableWarning>
                    {approval.title}
                  </div>
                  <p className="text-xs text-secondary mt-1 italic">Click to edit inline before approving</p>
                </div>
                <div className="form-group mt-4">
                  <label className="form-label text-sm text-gray-500 uppercase">Weightage</label>
                  <div className="font-medium text-lg">{approval.weightage}%</div>
                </div>
                <div className="form-group mt-6">
                  <label className="form-label text-sm text-gray-500 uppercase">Manager Comment</label>
                  <textarea 
                    className="form-control" 
                    rows="3" 
                    placeholder="Add feedback before approving/rejecting..."
                    value={approval.comment}
                    onChange={(e) => {
                      const newApprovals = [...approvals];
                      const idx = newApprovals.findIndex(a => a.id === approval.id);
                      newApprovals[idx].comment = e.target.value;
                      setApprovals(newApprovals);
                    }}
                  ></textarea>
                </div>
              </div>
              
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                <h4 className="font-semibold flex items-center gap-2 mb-4"><History size={16}/> Approval Timeline</h4>
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
                  <button className="btn btn-outline text-danger border-danger hover:bg-red-50" onClick={() => handleAction(approval.id, 'Rejected')}>
                    <X size={16} /> Reject
                  </button>
                  <button className="btn btn-outline text-warning border-warning hover:bg-yellow-50" onClick={() => handleAction(approval.id, 'Returned')}>
                    <MessageSquare size={16} /> Request Changes
                  </button>
                  <button className="btn btn-primary" onClick={() => handleAction(approval.id, 'Approved')}>
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
          <h1 className="text-2xl font-bold flex items-center gap-2"><Share2 size={24}/> Shared KPIs</h1>
          <p className="text-secondary mt-1">Create, assign, and sync departmental KPIs to your team.</p>
        </div>
        <button className="btn btn-primary shadow-lg hover:shadow-xl transition-shadow">
          <Plus size={16} /> Create Shared Goal
        </button>
      </div>

      <div className="space-y-6">
        {sharedKpis.map(kpi => (
          <div key={kpi.id} className="card shadow-sm border border-gray-200 overflow-hidden">
            <div className="card-header bg-gray-50 p-4 border-b border-gray-200 flex justify-between items-center">
              <div>
                <span className="badge badge-dark mb-2 inline-flex items-center gap-1"><Share2 size={12}/> Shared KPI</span>
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
                  <div className="h-full bg-blue-600" style={{width: `${kpi.progress}%`}}></div>
                </div>
              </div>

              <div className="bg-white border border-gray-100 rounded-lg p-4">
                <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                  <Target size={16}/> Linked Employee Goals ({kpi.linkedEmployees.length})
                </h4>
                <div className="space-y-3">
                  {kpi.children.map((child, idx) => (
                    <div key={idx} className="flex items-center gap-4 bg-gray-50 p-2 rounded">
                      <CornerDownRight size={16} className="text-gray-400"/>
                      <div className="w-1/4 font-medium text-sm">{child.name}</div>
                      <div className="flex-1">
                        <div className="flex justify-between text-xs mb-1">
                          <span>Progress: {child.progress}%</span>
                          <span>Weightage: {child.weightage}%</span>
                        </div>
                        <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
                          <div className="h-full bg-green-500" style={{width: `${child.progress}%`}}></div>
                        </div>
                      </div>
                      <div className="w-10">
                        <Lock size={14} className="text-gray-400" title="Employees cannot edit this title"/>
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
          {approvals.filter(a => a.status === 'Pending' || a.status === 'Under Review').length > 0 && (
            <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full ml-1">
              {approvals.filter(a => a.status === 'Pending' || a.status === 'Under Review').length}
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
