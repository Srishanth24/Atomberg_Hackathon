import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { 
  Building, Settings, Clock, ShieldAlert, 
  Download, FileSpreadsheet, LockOpen, ArrowRight,
  Activity, Users
} from 'lucide-react';
import './AdminDashboard.css';

const AUDIT_LOGS = [
  { id: 1, user: 'Manager A', action: 'Approved Goal', target: 'Sarah Jenkins', oldValue: 'Draft', newValue: 'Approved', time: '10 mins ago' },
  { id: 2, user: 'Admin System', action: 'Triggered Escalation', target: 'Manager B', oldValue: 'None', newValue: 'Level 1 Escalation', time: '1 hour ago' },
  { id: 3, user: 'HR Admin', action: 'Unlocked Goal', target: 'Jessica Alba', oldValue: 'Locked', newValue: 'Editable', time: '2 hours ago' },
  { id: 4, user: 'Employee C', action: 'Submitted Check-in', target: 'Goal #1042', oldValue: '20%', newValue: '45%', time: '3 hours ago' },
];

const ESCALATIONS = [
  { id: 1, employee: 'Mark Ruffalo', manager: 'Tony Stark', daysOverdue: 5, level: 2, status: 'Pending Manager' },
  { id: 2, employee: 'Natasha R.', manager: 'Nick Fury', daysOverdue: 12, level: 3, status: 'Escalated to HR' },
];

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const hash = location.hash.replace('#', '');
    if (hash === 'reports') {
      setActiveTab(hash);
    } else {
      setActiveTab('overview');
    }
  }, [location.hash]);

  const handleTabChange = (tab) => {
    if (tab === 'overview') {
      navigate('/admin');
    } else {
      navigate(`/admin#${tab}`);
    }
  };

  const renderOverview = () => (
    <div className="animate-fade-in">
      <div className="dashboard-header mb-6">
        <div>
          <h1 className="text-2xl font-bold">Admin Workspace</h1>
          <p className="text-secondary mt-1">Manage organization settings, users, and goal cycles.</p>
        </div>
        <div className="flex gap-4">
          <button className="btn btn-outline">
            <Settings size={16} /> Cycle Settings
          </button>
          <button className="btn btn-primary">
            <LockOpen size={16} /> Global Unlock
          </button>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-6 mb-6">
        <div className="card stat-card">
          <div className="stat-icon-wrapper bg-blue-100 text-blue-600">
            <Building size={24} />
          </div>
          <div className="stat-content">
            <p className="stat-label">Total Employees</p>
            <h3 className="stat-value">1,245</h3>
          </div>
        </div>
        <div className="card stat-card">
          <div className="stat-icon-wrapper bg-green-100 text-green-600">
            <Activity size={24} />
          </div>
          <div className="stat-content">
            <p className="stat-label">Org Adoption Rate</p>
            <h3 className="stat-value">94%</h3>
          </div>
        </div>
        <div className="card stat-card">
          <div className="stat-icon-wrapper bg-yellow-100 text-yellow-600">
            <Clock size={24} />
          </div>
          <div className="stat-content">
            <p className="stat-label">Current Cycle</p>
            <h3 className="stat-value text-lg">Q3 2026</h3>
          </div>
        </div>
        <div className="card stat-card">
          <div className="stat-icon-wrapper bg-red-100 text-red-600">
            <ShieldAlert size={24} />
          </div>
          <div className="stat-content">
            <p className="stat-label">Active Escalations</p>
            <h3 className="stat-value">28</h3>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div className="card">
          <div className="card-header">
            <h2 className="card-title">Recent Audit Activity</h2>
            <button className="btn btn-outline btn-sm">View Full Log</button>
          </div>
          <div className="audit-timeline">
            {AUDIT_LOGS.map((log, idx) => (
              <div key={log.id} className="audit-item">
                <div className="audit-dot"></div>
                {idx !== AUDIT_LOGS.length - 1 && <div className="audit-line"></div>}
                <div className="audit-content">
                  <div className="flex justify-between items-start mb-1">
                    <span className="font-bold">{log.user}</span>
                    <span className="text-xs text-secondary">{log.time}</span>
                  </div>
                  <div className="text-sm">
                    {log.action} for <span className="font-medium text-primary">{log.target}</span>
                  </div>
                  <div className="audit-change mt-2">
                    <span className="old-value">{log.oldValue}</span>
                    <ArrowRight size={14} className="text-tertiary mx-2" />
                    <span className="new-value">{log.newValue}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-6">
          <div className="card">
            <div className="card-header">
              <h2 className="card-title">Escalation Monitor</h2>
            </div>
            <div className="escalation-flow mb-4">
              <div className="flow-step">
                <div className="flow-icon"><Users size={16}/></div>
                <span>Employee</span>
              </div>
              <div className="flow-line active"></div>
              <div className="flow-step active">
                <div className="flow-icon"><Users size={16}/></div>
                <span>Manager</span>
              </div>
              <div className="flow-line"></div>
              <div className="flow-step danger">
                <div className="flow-icon"><ShieldAlert size={16}/></div>
                <span>HR Admin</span>
              </div>
            </div>
            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>Employee</th>
                    <th>Days Overdue</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {ESCALATIONS.map(esc => (
                    <tr key={esc.id}>
                      <td className="font-medium">{esc.employee}</td>
                      <td className="text-danger font-bold">{esc.daysOverdue} days</td>
                      <td>
                        <span className={`badge ${esc.level === 3 ? 'badge-danger' : 'badge-warning'}`}>
                          {esc.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderReports = () => (
    <div className="animate-fade-in">
      <div className="dashboard-header mb-6">
        <div>
          <h1 className="text-2xl font-bold">Reports & Exports</h1>
          <p className="text-secondary mt-1">Generate and download comprehensive organizational reports.</p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6">
        <div className="card export-card">
          <div className="export-icon bg-blue-100 text-blue-600">
            <FileSpreadsheet size={32} />
          </div>
          <h3 className="font-bold text-lg mt-4">Completion Report</h3>
          <p className="text-secondary text-sm mt-2 mb-4">Full export of goal completion rates across all departments.</p>
          <div className="flex gap-2 w-full mt-auto">
            <button className="btn btn-outline flex-1"><Download size={16} /> CSV</button>
            <button className="btn btn-primary flex-1"><Download size={16} /> Excel</button>
          </div>
        </div>
        
        <div className="card export-card">
          <div className="export-icon bg-green-100 text-green-600">
            <FileSpreadsheet size={32} />
          </div>
          <h3 className="font-bold text-lg mt-4">Check-in Compliance</h3>
          <p className="text-secondary text-sm mt-2 mb-4">List of users who missed their quarterly check-ins.</p>
          <div className="flex gap-2 w-full mt-auto">
            <button className="btn btn-outline flex-1"><Download size={16} /> CSV</button>
            <button className="btn btn-primary flex-1"><Download size={16} /> Excel</button>
          </div>
        </div>

        <div className="card export-card">
          <div className="export-icon bg-purple-100 text-purple-600">
            <FileSpreadsheet size={32} />
          </div>
          <h3 className="font-bold text-lg mt-4">Audit History</h3>
          <p className="text-secondary text-sm mt-2 mb-4">Complete system audit trail for compliance purposes.</p>
          <div className="flex gap-2 w-full mt-auto">
            <button className="btn btn-outline flex-1"><Download size={16} /> CSV</button>
            <button className="btn btn-primary flex-1"><Download size={16} /> Excel</button>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div>
      <div className="tabs-nav mb-6">
        <button 
          className={`tab-btn ${activeTab === 'overview' ? 'active' : ''}`}
          onClick={() => handleTabChange('overview')}
        >
          System Overview
        </button>
        <button 
          className={`tab-btn ${activeTab === 'reports' ? 'active' : ''}`}
          onClick={() => handleTabChange('reports')}
        >
          Reports Builder
        </button>
      </div>

      {activeTab === 'overview' && renderOverview()}
      {activeTab === 'reports' && renderReports()}
    </div>
  );
};

export default AdminDashboard;
