import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { 
  Target, TrendingUp, Clock, CheckCircle2, AlertCircle, 
  Plus, Edit2, Lock, ChevronRight 
} from 'lucide-react';
import { 
  PieChart, Pie, Cell, ResponsiveContainer, 
  BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid 
} from 'recharts';
import './EmployeeDashboard.css';

const MOCK_GOALS = [
  { id: 1, title: 'Increase Q3 Sales Revenue', thrustArea: 'Revenue Growth', progress: 75, status: 'On Track', weightage: 30, isApproved: true },
  { id: 2, title: 'Launch New Client Portal', thrustArea: 'Product', progress: 100, status: 'Completed', weightage: 40, isApproved: true },
  { id: 3, title: 'Reduce Customer Churn by 5%', thrustArea: 'Customer Success', progress: 20, status: 'Behind', weightage: 20, isApproved: true },
  { id: 4, title: 'Complete Leadership Training', thrustArea: 'Learning & Dev', progress: 0, status: 'Draft', weightage: 10, isApproved: false },
];

const PIE_DATA = [
  { name: 'Completed', value: 1, color: '#10b981' },
  { name: 'On Track', value: 2, color: '#3b82f6' },
  { name: 'Behind', value: 1, color: '#ef4444' }
];

const BAR_DATA = [
  { name: 'Week 1', progress: 20 },
  { name: 'Week 2', progress: 35 },
  { name: 'Week 3', progress: 45 },
  { name: 'Week 4', progress: 65 },
];

const EmployeeDashboard = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [showAddModal, setShowAddModal] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const hash = location.hash.replace('#', '');
    if (hash === 'goals' || hash === 'checkins') {
      setActiveTab(hash);
    } else {
      setActiveTab('dashboard');
    }
  }, [location.hash]);

  const handleTabChange = (tab) => {
    if (tab === 'dashboard') {
      navigate('/employee');
    } else {
      navigate(`/employee#${tab}`);
    }
  };

  const renderDashboard = () => (
    <div className="animate-fade-in">
      <div className="dashboard-header mb-6">
        <div>
          <h1 className="text-2xl font-bold">Welcome back, Sarah!</h1>
          <p className="text-secondary mt-1">Here's your performance overview for Q3 2026.</p>
        </div>
        <button className="btn btn-primary" onClick={() => handleTabChange('goals')}>
          <Plus size={16} />
          Add New Goal
        </button>
      </div>

      <div className="grid grid-cols-4 gap-6 mb-6">
        <div className="card stat-card">
          <div className="stat-icon-wrapper bg-blue-100 text-blue-600">
            <Target size={24} />
          </div>
          <div className="stat-content">
            <p className="stat-label">Total Goals</p>
            <h3 className="stat-value">4</h3>
          </div>
        </div>
        <div className="card stat-card">
          <div className="stat-icon-wrapper bg-green-100 text-green-600">
            <CheckCircle2 size={24} />
          </div>
          <div className="stat-content">
            <p className="stat-label">Overall Completion</p>
            <h3 className="stat-value">62%</h3>
          </div>
        </div>
        <div className="card stat-card">
          <div className="stat-icon-wrapper bg-yellow-100 text-yellow-600">
            <Clock size={24} />
          </div>
          <div className="stat-content">
            <p className="stat-label">Pending Approvals</p>
            <h3 className="stat-value">1</h3>
          </div>
        </div>
        <div className="card stat-card">
          <div className="stat-icon-wrapper bg-teal-100 text-teal-600">
            <TrendingUp size={24} />
          </div>
          <div className="stat-content">
            <p className="stat-label">Performance Score</p>
            <h3 className="stat-value">4.2/5</h3>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6 mb-6">
        <div className="card col-span-2">
          <div className="card-header">
            <h2 className="card-title">Quarterly Progress</h2>
          </div>
          <div className="chart-container" style={{ height: 300 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={BAR_DATA}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" axisLine={false} tickLine={false} />
                <YAxis axisLine={false} tickLine={false} />
                <Tooltip cursor={{ fill: 'rgba(0,0,0,0.02)' }} />
                <Bar dataKey="progress" fill="var(--primary)" radius={[4, 4, 0, 0]} barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <h2 className="card-title">Goal Status</h2>
          </div>
          <div className="chart-container" style={{ height: 300, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
            <ResponsiveContainer width="100%" height="80%">
              <PieChart>
                <Pie
                  data={PIE_DATA}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {PIE_DATA.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="pie-legend">
              {PIE_DATA.map((entry, index) => (
                <div key={index} className="legend-item">
                  <div className="legend-color" style={{ backgroundColor: entry.color }}></div>
                  <span className="legend-label">{entry.name}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div className="card">
          <div className="card-header">
            <h2 className="card-title">Upcoming Deadlines</h2>
            <button className="btn btn-outline btn-sm">View All</button>
          </div>
          <div className="list-group">
            <div className="list-item">
              <div className="list-icon bg-red-100 text-red-600"><AlertCircle size={18} /></div>
              <div className="list-content">
                <h4>Q3 Mid-quarter Check-in</h4>
                <p>Due in 2 days</p>
              </div>
              <ChevronRight size={18} className="text-tertiary" />
            </div>
            <div className="list-item">
              <div className="list-icon bg-blue-100 text-blue-600"><Target size={18} /></div>
              <div className="list-content">
                <h4>Submit Q4 Draft Goals</h4>
                <p>Due in 15 days</p>
              </div>
              <ChevronRight size={18} className="text-tertiary" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderGoals = () => (
    <div className="animate-fade-in">
      <div className="dashboard-header mb-6">
        <div>
          <h1 className="text-2xl font-bold">My Goals</h1>
          <p className="text-secondary mt-1">Manage and track your objectives for this cycle.</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowAddModal(true)}>
          <Plus size={16} />
          Add Goal
        </button>
      </div>

      {showAddModal && (
        <div className="modal-overlay">
          <div className="modal-card">
            <div className="modal-header">
              <h2>Create New Goal</h2>
              <button className="close-btn" onClick={() => setShowAddModal(false)}>&times;</button>
            </div>
            <div className="modal-body">
              <form>
                <div className="grid grid-cols-2 gap-4">
                  <div className="form-group col-span-2">
                    <label className="form-label">Goal Title</label>
                    <input type="text" className="form-control" placeholder="E.g., Increase sales by 20%" />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Thrust Area</label>
                    <select className="form-control">
                      <option>Revenue Growth</option>
                      <option>Customer Success</option>
                      <option>Product Development</option>
                      <option>Operational Excellence</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Weightage (%)</label>
                    <input type="number" className="form-control" min="10" max="100" placeholder="e.g. 20" />
                    <small className="text-secondary">Minimum 10%. Total must equal 100%.</small>
                  </div>
                  <div className="form-group col-span-2">
                    <label className="form-label">Description</label>
                    <textarea className="form-control" rows="3" placeholder="Detailed description..."></textarea>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Unit of Measurement</label>
                    <select className="form-control">
                      <option>Percentage (%)</option>
                      <option>Numeric Value</option>
                      <option>Timeline</option>
                      <option>Boolean (Done/Not Done)</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Target Value</label>
                    <input type="text" className="form-control" placeholder="100" />
                  </div>
                </div>
              </form>
            </div>
            <div className="modal-footer">
              <button className="btn btn-outline" onClick={() => setShowAddModal(false)}>Cancel</button>
              <button className="btn btn-primary">Save as Draft</button>
            </div>
          </div>
        </div>
      )}

      <div className="card">
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Goal Title & Area</th>
                <th>Weight</th>
                <th>Progress</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {MOCK_GOALS.map(goal => (
                <tr key={goal.id}>
                  <td>
                    <div className="font-bold">{goal.title}</div>
                    <div className="text-secondary text-sm">{goal.thrustArea}</div>
                  </td>
                  <td>{goal.weightage}%</td>
                  <td>
                    <div className="progress-cell">
                      <span className="text-sm font-bold w-8">{goal.progress}%</span>
                      <div className="progress-bar-bg">
                        <div 
                          className="progress-bar-fill" 
                          style={{ 
                            width: `${goal.progress}%`,
                            backgroundColor: goal.progress === 100 ? 'var(--success)' : 'var(--primary)'
                          }}
                        ></div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span className={`badge badge-${
                      goal.status === 'Completed' ? 'success' : 
                      goal.status === 'On Track' ? 'info' : 
                      goal.status === 'Behind' ? 'danger' : 'warning'
                    }`}>
                      {goal.status}
                    </span>
                  </td>
                  <td>
                    <div className="flex gap-2">
                      {goal.isApproved ? (
                        <button className="icon-btn text-secondary" title="Locked (Approved)">
                          <Lock size={16} />
                        </button>
                      ) : (
                        <button className="icon-btn text-primary" title="Edit Draft">
                          <Edit2 size={16} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
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
          className={`tab-btn ${activeTab === 'dashboard' ? 'active' : ''}`}
          onClick={() => handleTabChange('dashboard')}
        >
          Overview
        </button>
        <button 
          className={`tab-btn ${activeTab === 'goals' ? 'active' : ''}`}
          onClick={() => handleTabChange('goals')}
        >
          My Goals
        </button>
        <button 
          className={`tab-btn ${activeTab === 'checkins' ? 'active' : ''}`}
          onClick={() => handleTabChange('checkins')}
        >
          Quarterly Check-ins
        </button>
      </div>

      {activeTab === 'dashboard' && renderDashboard()}
      {activeTab === 'goals' && renderGoals()}
      {activeTab === 'checkins' && (
        <div className="animate-fade-in card">
          <div className="card-header">
            <h2 className="card-title">Q3 Check-in</h2>
            <span className="badge badge-warning">Draft</span>
          </div>
          <p className="text-secondary mb-6">Update your achievements and progress against planned targets.</p>
          
          <div className="checkin-list">
            {MOCK_GOALS.filter(g => g.isApproved).map(goal => (
              <div key={goal.id} className="checkin-item">
                <div className="checkin-item-header">
                  <h4>{goal.title}</h4>
                  <span className="text-secondary">Target: 100%</span>
                </div>
                <div className="grid grid-cols-3 gap-4 mt-4">
                  <div className="form-group">
                    <label className="form-label">Current Progress (%)</label>
                    <input type="number" className="form-control" defaultValue={goal.progress} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Status</label>
                    <select className="form-control" defaultValue={goal.status}>
                      <option>On Track</option>
                      <option>Behind</option>
                      <option>At Risk</option>
                      <option>Completed</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Manager Comment</label>
                    <div className="form-control bg-tertiary text-secondary" style={{ pointerEvents: 'none' }}>
                      Keep up the good work.
                    </div>
                  </div>
                  <div className="form-group col-span-3">
                    <label className="form-label">Achievement / Blockers Update</label>
                    <textarea className="form-control" rows="2" placeholder="What went well? Any blockers?"></textarea>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          <div className="mt-6 flex justify-end gap-4">
            <button className="btn btn-outline">Save Draft</button>
            <button className="btn btn-primary">Submit Check-in</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmployeeDashboard;
