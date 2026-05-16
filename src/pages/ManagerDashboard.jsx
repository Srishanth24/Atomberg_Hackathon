import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { 
  Users, CheckCircle, AlertCircle, BarChart2, 
  MessageSquare, UserPlus, FileText, Check, X
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

const APPROVALS = [
  { id: 101, user: 'Sarah Jenkins', type: 'New Goal', title: 'Complete Leadership Training', submittedAt: '2 days ago' },
  { id: 102, user: 'Jessica Alba', type: 'Check-in', title: 'Q3 Product Demo Target', submittedAt: '1 day ago' },
];

const TREND_DATA = [
  { name: 'Month 1', teamAvg: 20 },
  { name: 'Month 2', teamAvg: 45 },
  { name: 'Month 3', teamAvg: 70 },
];

const ManagerDashboard = () => {
  const [activeTab, setActiveTab] = useState('team');
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
        <div className="card stat-card">
          <div className="stat-icon-wrapper bg-blue-100 text-blue-600">
            <Users size={24} />
          </div>
          <div className="stat-content">
            <p className="stat-label">Team Members</p>
            <h3 className="stat-value">8</h3>
          </div>
        </div>
        <div className="card stat-card">
          <div className="stat-icon-wrapper bg-yellow-100 text-yellow-600">
            <CheckCircle size={24} />
          </div>
          <div className="stat-content">
            <p className="stat-label">Pending Approvals</p>
            <h3 className="stat-value">{APPROVALS.length}</h3>
          </div>
        </div>
        <div className="card stat-card">
          <div className="stat-icon-wrapper bg-green-100 text-green-600">
            <BarChart2 size={24} />
          </div>
          <div className="stat-content">
            <p className="stat-label">Avg Completion</p>
            <h3 className="stat-value">56%</h3>
          </div>
        </div>
        <div className="card stat-card">
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
          <div className="card-header">
            <h2 className="card-title">Team Progress Tracker</h2>
          </div>
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Employee</th>
                  <th>Role</th>
                  <th>Goals</th>
                  <th>Progress</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {TEAM_MEMBERS.map(member => (
                  <tr key={member.id}>
                    <td>
                      <div className="font-bold">{member.name}</div>
                    </td>
                    <td className="text-secondary">{member.role}</td>
                    <td>{member.goals}</td>
                    <td>
                      <div className="progress-cell">
                        <span className="text-sm font-bold w-8">{member.progress}%</span>
                        <div className="progress-bar-bg">
                          <div 
                            className="progress-bar-fill" 
                            style={{ 
                              width: `${member.progress}%`,
                              backgroundColor: member.progress >= 80 ? 'var(--success)' : member.progress <= 40 ? 'var(--danger)' : 'var(--primary)'
                            }}
                          ></div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <button className="btn btn-outline btn-sm">View Profile</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <h2 className="card-title">Needs Attention</h2>
          </div>
          <div className="list-group">
            {APPROVALS.map(approval => (
              <div key={approval.id} className="list-item">
                <div className="list-icon bg-yellow-100 text-yellow-600"><CheckCircle size={18} /></div>
                <div className="list-content">
                  <h4>{approval.user}</h4>
                  <p>{approval.type}: {approval.title}</p>
                </div>
              </div>
            ))}
            <div className="list-item">
              <div className="list-icon bg-red-100 text-red-600"><AlertCircle size={18} /></div>
              <div className="list-content">
                <h4>Jessica Alba</h4>
                <p>Goal "Q3 Product Demo" is behind schedule</p>
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

      <div className="approval-list">
        {APPROVALS.map(approval => (
          <div key={approval.id} className="card mb-4 approval-card">
            <div className="approval-header">
              <div className="flex items-center gap-3">
                <div className="avatar small"><Users size={16} /></div>
                <div>
                  <h3 className="font-bold">{approval.user}</h3>
                  <p className="text-sm text-secondary">Submitted {approval.submittedAt}</p>
                </div>
              </div>
              <span className="badge badge-warning">{approval.type}</span>
            </div>
            
            <div className="approval-body">
              <div className="form-group mb-0">
                <label className="form-label">Title</label>
                <div className="font-medium">{approval.title}</div>
              </div>
              <div className="form-group mb-0 mt-4">
                <label className="form-label">Manager Comment</label>
                <textarea className="form-control" rows="2" placeholder="Add feedback before approving/rejecting..."></textarea>
              </div>
            </div>
            
            <div className="approval-footer">
              <button className="btn btn-outline text-danger border-danger hover:bg-red-50">
                <X size={16} /> Reject
              </button>
              <button className="btn btn-outline">
                <MessageSquare size={16} /> Request Changes
              </button>
              <button className="btn btn-primary">
                <Check size={16} /> Approve
              </button>
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
          <h1 className="text-2xl font-bold">Shared Goals</h1>
          <p className="text-secondary mt-1">Create and assign departmental KPIs to your team.</p>
        </div>
        <button className="btn btn-primary">
          <Plus size={16} /> Create Shared Goal
        </button>
      </div>

      <div className="card">
        <div className="card-header">
          <h2 className="card-title">Active Shared Goals</h2>
        </div>
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>KPI Title</th>
                <th>Assigned To</th>
                <th>Avg Progress</th>
                <th>Sync Status</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="font-bold">Increase Department Revenue by 15%</td>
                <td>
                  <div className="avatar-group">
                    <div className="avatar-mini">SJ</div>
                    <div className="avatar-mini">MC</div>
                    <div className="avatar-mini">+2</div>
                  </div>
                </td>
                <td>
                  <div className="progress-cell">
                    <span className="text-sm font-bold w-8">65%</span>
                    <div className="progress-bar-bg">
                      <div className="progress-bar-fill" style={{ width: '65%', backgroundColor: 'var(--primary)' }}></div>
                    </div>
                  </div>
                </td>
                <td><span className="badge badge-success">Synced</span></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  return (
    <div>
      <div className="tabs-nav mb-6">
        <button 
          className={`tab-btn ${activeTab === 'team' ? 'active' : ''}`}
          onClick={() => handleTabChange('team')}
        >
          Team Overview
        </button>
        <button 
          className={`tab-btn ${activeTab === 'approvals' ? 'active' : ''}`}
          onClick={() => handleTabChange('approvals')}
        >
          Approvals
          {APPROVALS.length > 0 && <span className="tab-badge">{APPROVALS.length}</span>}
        </button>
        <button 
          className={`tab-btn ${activeTab === 'shared' ? 'active' : ''}`}
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
