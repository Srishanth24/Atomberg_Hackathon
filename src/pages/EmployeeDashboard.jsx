import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Target, TrendingUp, Clock, CheckCircle2,
  Plus, Edit2, Lock, ChevronRight, Check, ShieldAlert,
  AlertTriangle, RefreshCw, Calculator, Activity
} from 'lucide-react';
import {
  PieChart, Pie, Cell, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid
} from 'recharts';
import toast from 'react-hot-toast';
import { apiClient } from '../services/apiClient';
import './EmployeeDashboard.css';

const PIE_DATA = [
  { name: 'Completed', value: 1, color: '#10b981' },
  { name: 'On Track', value: 2, color: '#3b82f6' },
  { name: 'Not Started', value: 1, color: '#ef4444' }
];

const BAR_DATA = [
  { name: 'Week 1', progress: 20 },
  { name: 'Week 2', progress: 35 },
  { name: 'Week 3', progress: 45 },
  { name: 'Week 4', progress: 65 },
];

const computeProgress = (uom, target, actual) => {
  if (actual === null || actual === undefined || actual === '') return 0;

  let progress = 0;
  if (uom === 'Min (Numeric / %)') {
    const numTarget = Number(target) || 1;
    const numActual = Number(actual) || 0;
    progress = Math.round((numActual / numTarget) * 100);
  } else if (uom === 'Max (Numeric / %)') {
    const numTarget = Number(target) || 0;
    const numActual = Number(actual) || 1;
    if (numActual === 0 && numTarget === 0) {
      progress = 100;
    } else if (numActual === 0) {
      progress = 100; // Avoiding division by zero, consider 0 actual as perfect for max goals usually
    } else {
      progress = Math.round((numTarget / numActual) * 100);
    }
  } else if (uom === 'Timeline') {
    // Rough estimation logic for timeline: If actual <= target, 100%, else scaling down
    const targetDate = new Date(target).getTime();
    const actualDate = new Date(actual).getTime();
    if (isNaN(targetDate) || isNaN(actualDate)) {
      progress = 0;
    } else {
      progress = actualDate <= targetDate ? 100 : Math.max(100 - Math.round((actualDate - targetDate) / (1000 * 3600 * 24)), 0);
    }
  } else if (uom === 'Zero-based') {
    const numActual = Number(actual) || 0;
    progress = numActual === 0 ? 100 : 0;
  }

  return Math.min(Math.max(progress, 0), 100);
};

const getCheckinDraftStorageKey = () => {
  try {
    const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
    return `goalsync-checkin-drafts-${currentUser.email || localStorage.getItem('userRole') || 'guest'}`;
  } catch {
    return `goalsync-checkin-drafts-${localStorage.getItem('userRole') || 'guest'}`;
  }
};

const EmployeeDashboard = () => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [goals, setGoals] = useState([]);
  const [loadingGoals, setLoadingGoals] = useState(true);
  const [editingGoal, setEditingGoal] = useState(null);
  const [checkinDrafts, setCheckinDrafts] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(getCheckinDraftStorageKey()) || '{}');
    } catch {
      return {};
    }
  });
  const location = useLocation();
  const navigate = useNavigate();
  const hash = location.hash.replace('#', '');
  const activeTab = hash === 'goals' || hash === 'checkins' ? hash : 'dashboard';

  // Goal Form State
  const [newGoal, setNewGoal] = useState({
    title: '', thrustArea: 'Revenue Growth', weightage: 10, description: '', uom: 'Min (Numeric / %)', target: ''
  });

  useEffect(() => {
    apiClient.getGoals()
      .then((loadedGoals) => {
        const mergedGoals = loadedGoals.map(goal => {
          const draft = checkinDrafts[goal.id];
          if (!draft) return goal;
          return {
            ...goal,
            actual: draft.actual ?? goal.actual,
            status: draft.status ?? goal.status,
          };
        });
        setGoals(mergedGoals);
      })
      .catch(error => toast.error(error.message))
      .finally(() => setLoadingGoals(false));
  }, []);

  const handleTabChange = (tab) => {
    if (tab === 'dashboard') {
      navigate('/employee');
    } else {
      navigate(`/employee#${tab}`);
    }
  };

  const totalWeightage = goals.reduce((acc, goal) => acc + (Number(goal.weightage) || 0), 0);
  const remainingWeightage = 100 - totalWeightage;
  const currentFormWeightage = totalWeightage + Number(newGoal.weightage || 0);
  const canSubmitSheet = totalWeightage === 100 && goals.length > 0 && goals.length <= 8 && goals.every(goal => Number(goal.weightage) >= 10);

  // Validation
  const isValidWeightage = currentFormWeightage <= 100;
  const isMinWeightage = newGoal.weightage >= 10;
  const isMaxGoals = goals.length >= 8;
  const canSubmitGoal = isValidWeightage && isMinWeightage && !isMaxGoals && newGoal.title && newGoal.target;

  const handleSaveDraft = async () => {
    if (canSubmitGoal) {
      try {
        const createdGoal = await apiClient.createGoalDraft(newGoal);
        setGoals([createdGoal, ...goals]);
        toast.success('Goal draft saved');
        setShowAddModal(false);
        setNewGoal({ title: '', thrustArea: 'Revenue Growth', weightage: 10, description: '', uom: 'Min (Numeric / %)', target: '' });
      } catch (error) {
        toast.error(error.message);
      }
    } else {
      toast.error('Fix validation errors before saving the goal');
    }
  };

  const handleSubmitGoalSheet = async () => {
    if (!canSubmitSheet) {
      toast.error('Goal sheet must have 1-8 goals, each at least 10%, with total weightage exactly 100%');
      return;
    }

    try {
      const updatedGoals = await apiClient.submitGoalSheet();
      setGoals(updatedGoals);
      toast.success('Goal sheet submitted to L1 manager');
    } catch (error) {
      toast.error(error.message);
    }
  };

  const handleCheckinUpdate = (id, actualValue, status) => {
    setGoals(goals.map(g => {
      if (g.id === id) {
        const progress = computeProgress(g.uom, g.target, actualValue);
        return { ...g, actual: actualValue, progress, status };
      }
      return g;
    }));
  };

  const handleSubmitCheckins = async () => {
    try {
      const approvedGoals = goals.filter(goal => goal.isApproved);
      const updatedGoals = await Promise.all(approvedGoals.map(goal => (
        apiClient.submitCheckin(goal.id, {
          quarter: 'Q1',
          year: 2026,
          actualAchievement: goal.actual,
          status: goal.status,
        })
      )));

      setGoals(goals.map(goal => updatedGoals.find(updated => updated.id === goal.id) || goal));
      toast.success('Quarterly check-in submitted');
    } catch (error) {
      toast.error(error.message);
    }
  };

  const handleSaveCheckinDraft = () => {
    const draftMap = goals
      .filter(goal => goal.isApproved)
      .reduce((accumulator, goal) => {
        accumulator[goal.id] = {
          actual: goal.actual,
          status: goal.status,
          savedAt: new Date().toISOString(),
        };
        return accumulator;
      }, {});

    setCheckinDrafts(draftMap);
    localStorage.setItem(getCheckinDraftStorageKey(), JSON.stringify(draftMap));
    toast.success('Check-in draft saved');
  };

  const handleEditDraft = (goal) => {
    setEditingGoal({ ...goal });
    setShowEditModal(true);
  };

  const handleSaveEditedGoal = async () => {
    if (!editingGoal) return;

    try {
      const updatedGoal = await apiClient.updateGoalDraft(editingGoal.id, {
        title: editingGoal.title,
        thrustArea: editingGoal.thrustArea,
        weightage: editingGoal.weightage,
        description: editingGoal.description,
        uom: editingGoal.uom,
        target: editingGoal.target,
      });
      setGoals(goals.map(goal => goal.id === updatedGoal.id ? updatedGoal : goal));
      setShowEditModal(false);
      setEditingGoal(null);
      toast.success('Goal draft updated');
    } catch (error) {
      toast.error(error.message);
    }
  };

  const getWeightageColor = () => {
    if (remainingWeightage === 0) return 'text-success';
    if (remainingWeightage < 0) return 'text-danger';
    return 'text-warning';
  };

  const getLifecycleBadge = (lifecycle) => {
    const colors = {
      'Draft': 'badge-secondary',
      'Submitted': 'badge-primary',
      'Under Review': 'badge-warning',
      'Approved': 'badge-success',
      'Returned': 'badge-danger',
      'Locked': 'badge-dark'
    };
    return <span className={`badge ${colors[lifecycle] || 'badge-secondary'}`}>{lifecycle}</span>;
  };

  const renderOverview = () => (
    <div className="animate-fade-in">
      <div className="dashboard-header mb-6 flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold">My Workspace</h1>
          <p className="text-secondary mt-1">Track your performance, check-ins, and active goals.</p>
        </div>
        <button className="btn btn-primary transition-transform hover:scale-105" onClick={() => handleTabChange('goals')}>
          <Plus size={16} />
          Add New Goal
        </button>
      </div>

      {/* Row 1: KPI cards */}
      <div className="grid grid-cols-4 gap-6 mb-6">
        <div className="card stat-card interactive-card border-l-4 border-blue-500">
          <div className="stat-icon-wrapper bg-blue-100 text-blue-600">
            <Target size={24} />
          </div>
          <div className="stat-content">
            <p className="stat-label">Total Goals</p>
            <h3 className="stat-value">{goals.length} / 8</h3>
          </div>
        </div>
        <div className="card stat-card interactive-card border-l-4 border-green-500">
          <div className="stat-icon-wrapper bg-green-100 text-green-600">
            <CheckCircle2 size={24} />
          </div>
          <div className="stat-content">
            <p className="stat-label">Overall Completion</p>
            <h3 className="stat-value">{Math.min(Math.round(goals.reduce((acc, g) => acc + (g.progress * (g.weightage / 100)), 0)), 100)}%</h3>
          </div>
        </div>
        <div className="card stat-card interactive-card border-l-4 border-yellow-500">
          <div className="stat-icon-wrapper bg-yellow-100 text-yellow-600">
            <Clock size={24} />
          </div>
          <div className="stat-content">
            <p className="stat-label">Pending Approvals</p>
            <h3 className="stat-value">{goals.filter(g => g.lifecycle === 'Under Review').length}</h3>
          </div>
        </div>
        <div className="card stat-card interactive-card border-l-4 border-teal-500">
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
        <div className="card shadow-sm hover:shadow-md transition-shadow">
          <div className="card-header border-b border-gray-100 pb-3 mb-4">
            <h2 className="card-title flex items-center gap-2"><Activity size={18} className="text-indigo-600" /> Cycle Snapshot</h2>
          </div>
          <div className="space-y-4">
            {[
              { label: 'Approved Goals', value: goals.filter(goal => goal.lifecycle === 'Approved').length, tone: 'bg-green-500' },
              { label: 'Draft Goals', value: goals.filter(goal => goal.lifecycle === 'Draft').length, tone: 'bg-yellow-500' },
              { label: 'Locked or Review', value: goals.filter(goal => goal.lifecycle === 'Locked' || goal.lifecycle === 'Under Review').length, tone: 'bg-blue-500' },
            ].map(item => (
              <div key={item.label}>
                <div className="flex justify-between text-sm mb-1.5">
                  <span className="text-gray-700 font-medium">{item.label}</span>
                  <span className="font-bold text-gray-900">{item.value}</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2.5">
                  <div className={`${item.tone} h-2.5 rounded-full`} style={{ width: `${Math.max(25, item.value * 24)}%` }}></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="card shadow-sm hover:shadow-md transition-shadow">
          <div className="card-header border-b border-gray-100 pb-3 mb-4 flex justify-between items-center">
            <h2 className="card-title flex items-center gap-2"><RefreshCw size={18} className="text-teal-600" /> Quick Actions</h2>
            <span className="badge badge-secondary">Live</span>
          </div>
          <div className="space-y-3">
            <button className="w-full flex items-center justify-between rounded-xl border border-gray-200 px-4 py-3 text-left hover:bg-gray-50 transition-colors" onClick={() => handleTabChange('goals')}>
              <div>
                <p className="font-semibold text-gray-800">Add or refine goals</p>
                <p className="text-xs text-gray-500 mt-0.5">Keep the sheet aligned to 100% weightage.</p>
              </div>
              <Plus size={16} className="text-blue-600" />
            </button>
            <button className="w-full flex items-center justify-between rounded-xl border border-gray-200 px-4 py-3 text-left hover:bg-gray-50 transition-colors" onClick={handleSaveCheckinDraft}>
              <div>
                <p className="font-semibold text-gray-800">Save check-in draft</p>
                <p className="text-xs text-gray-500 mt-0.5">Persist progress before manager review.</p>
              </div>
              <CheckCircle2 size={16} className="text-green-600" />
            </button>
            <button className="w-full flex items-center justify-between rounded-xl border border-gray-200 px-4 py-3 text-left hover:bg-gray-50 transition-colors" onClick={handleSubmitGoalSheet}>
              <div>
                <p className="font-semibold text-gray-800">Submit goal sheet</p>
                <p className="text-xs text-gray-500 mt-0.5">Send the full cycle to your manager.</p>
              </div>
              <ChevronRight size={16} className="text-gray-500" />
            </button>
          </div>
        </div>

        <div className="card shadow-sm hover:shadow-md transition-shadow">
          <div className="card-header border-b border-gray-100 pb-3 mb-4">
            <h2 className="card-title flex items-center gap-2"><Target size={18} className="text-purple-600" /> Priority Goals</h2>
          </div>
          <div className="space-y-4">
            {goals.slice(0, 3).map(goal => (
              <div key={goal.id} className="rounded-xl border border-gray-100 bg-gray-50/70 p-3">
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div>
                    <p className="font-semibold text-gray-800 leading-tight">{goal.title}</p>
                    <p className="text-xs text-gray-500 mt-1">{goal.thrustArea}</p>
                  </div>
                  {getLifecycleBadge(goal.lifecycle)}
                </div>
                <div className="flex items-center gap-2 text-xs text-gray-600 mb-1.5">
                  <span>{goal.progress}% progress</span>
                  <span>•</span>
                  <span>{goal.weightage}% weightage</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="h-2 rounded-full bg-blue-500" style={{ width: `${goal.progress}%` }}></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Row 2: AI Insights + Upcoming Deadlines */}
      <div className="grid grid-cols-3 gap-6 mb-6">
        <div className="card col-span-2 bg-gradient-to-br from-slate-900 to-slate-800 text-white shadow-lg overflow-hidden relative">
          <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500 opacity-5 rounded-full blur-3xl -mr-20 -mt-20"></div>
          <div className="card-header border-b border-slate-700 pb-3 mb-4 relative z-10">
            <h2 className="card-title text-white flex items-center gap-2">
              <div className="w-2.5 h-2.5 bg-blue-400 rounded-full animate-pulse shadow-[0_0_10px_rgba(96,165,250,0.8)]"></div>
              AI Performance Insights
            </h2>
          </div>
          <div className="grid grid-cols-2 gap-4 relative z-10">
            <div className="bg-slate-800/80 p-3.5 rounded-xl border border-slate-700/50 flex items-start gap-3 hover:bg-slate-700 transition-colors">
              <AlertTriangle size={20} className="text-yellow-400 mt-0.5 shrink-0" />
              <div>
                <p className="text-sm font-semibold text-slate-100 mb-0.5">1 goal is behind schedule</p>
                <p className="text-xs text-slate-400 leading-tight">Client Portal Launch needs attention.</p>
              </div>
            </div>
            <div className="bg-slate-800/80 p-3.5 rounded-xl border border-slate-700/50 flex items-start gap-3 hover:bg-slate-700 transition-colors">
              <TrendingUp size={20} className="text-green-400 mt-0.5 shrink-0" />
              <div>
                <p className="text-sm font-semibold text-slate-100 mb-0.5">Sales metrics improved 18%</p>
                <p className="text-xs text-slate-400 leading-tight">You are tracking above department average.</p>
              </div>
            </div>
            <div className="bg-slate-800/80 p-3.5 rounded-xl border border-slate-700/50 flex items-start gap-3 hover:bg-slate-700 transition-colors">
              <Clock size={20} className="text-blue-400 mt-0.5 shrink-0" />
              <div>
                <p className="text-sm font-semibold text-slate-100 mb-0.5">1 check-in pending approval</p>
                <p className="text-xs text-slate-400 leading-tight">Manager review expected tomorrow.</p>
              </div>
            </div>
            <div className="bg-slate-800/80 p-3.5 rounded-xl border border-slate-700/50 flex items-start gap-3 hover:bg-slate-700 transition-colors">
              <Target size={20} className="text-purple-400 mt-0.5 shrink-0" />
              <div>
                <p className="text-sm font-semibold text-slate-100 mb-0.5">Shared KPI Synced</p>
                <p className="text-xs text-slate-400 leading-tight">Department ARR target was updated.</p>
              </div>
            </div>
          </div>
        </div>

        <div className="card border-l-4 border-red-500 shadow-md">
          <div className="card-header border-b border-gray-100 pb-3 mb-3">
            <h2 className="card-title flex items-center gap-2 text-red-700"><Clock size={18} /> Upcoming Deadlines</h2>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between items-center p-2.5 bg-red-50/50 rounded-lg border border-red-100">
              <div>
                <p className="text-sm font-bold text-red-800">Q3 Check-in Due</p>
                <p className="text-xs text-red-600 font-medium mt-0.5">Action Required</p>
              </div>
              <span className="badge bg-red-100 text-red-800 font-bold border border-red-200">2 Days</span>
            </div>
            <div className="flex justify-between items-center p-2.5 bg-yellow-50/50 rounded-lg border border-yellow-100">
              <div>
                <p className="text-sm font-bold text-yellow-800">Manager Goal Review</p>
                <p className="text-xs text-yellow-600 font-medium mt-0.5">Pending Feedback</p>
              </div>
              <span className="badge bg-yellow-100 text-yellow-800 font-bold border border-yellow-200">Tomorrow</span>
            </div>
            <div className="flex justify-between items-center p-2.5 bg-blue-50/50 rounded-lg border border-blue-100">
              <div>
                <p className="text-sm font-bold text-blue-800">Submit Q4 Drafts</p>
                <p className="text-xs text-blue-600 font-medium mt-0.5">Upcoming cycle</p>
              </div>
              <span className="badge bg-blue-100 text-blue-800 font-bold border border-blue-200">In 14 Days</span>
            </div>
          </div>
        </div>
      </div>

      {/* Row 3: Weightage + Shared KPI + Activity */}
      <div className="grid grid-cols-3 gap-6 mb-6">
        <div className="card shadow-sm hover:shadow-md transition-shadow">
          <div className="card-header border-b border-gray-100 pb-3 mb-4">
            <h2 className="card-title flex items-center gap-2"><Calculator size={18} className="text-blue-600" /> Weightage Allocation</h2>
          </div>
          <div className="space-y-5">
            <div>
              <div className="flex justify-between text-sm mb-1.5"><span className="text-gray-700 font-medium">Completed Goals</span><span className="font-bold text-green-600">40%</span></div>
              <div className="w-full bg-gray-100 rounded-full h-2.5"><div className="bg-green-500 h-2.5 rounded-full" style={{ width: '40%' }}></div></div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1.5"><span className="text-gray-700 font-medium">In Progress</span><span className="font-bold text-blue-600">50%</span></div>
              <div className="w-full bg-gray-100 rounded-full h-2.5"><div className="bg-blue-500 h-2.5 rounded-full" style={{ width: '50%' }}></div></div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1.5"><span className="text-gray-700 font-medium">Draft / Remaining</span><span className="font-bold text-gray-500">10%</span></div>
              <div className="w-full bg-gray-100 rounded-full h-2.5"><div className="bg-gray-400 h-2.5 rounded-full" style={{ width: '10%' }}></div></div>
            </div>
          </div>
        </div>

        <div className="card shadow-sm hover:shadow-md transition-shadow">
          <div className="card-header border-b border-gray-100 pb-3 mb-3">
            <h2 className="card-title flex items-center gap-2"><RefreshCw size={18} className="text-indigo-600" /> Shared KPI Sync</h2>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between items-center p-2.5 hover:bg-gray-50 rounded-lg border border-gray-100 transition-colors">
              <div>
                <p className="text-sm font-semibold text-gray-800">Sales Growth KPI</p>
                <p className="text-xs text-gray-500 mt-0.5">Dept. Goal</p>
              </div>
              <span className="badge bg-green-50 text-green-700 border border-green-200">Synced</span>
            </div>
            <div className="flex justify-between items-center p-2.5 hover:bg-gray-50 rounded-lg border border-gray-100 transition-colors">
              <div>
                <p className="text-sm font-semibold text-gray-800">Product Launch KPI</p>
                <p className="text-xs text-gray-500 mt-0.5">Org. Goal</p>
              </div>
              <span className="badge bg-yellow-50 text-yellow-700 border border-yellow-200">Pending</span>
            </div>
            <div className="flex justify-between items-center p-2.5 hover:bg-gray-50 rounded-lg border border-gray-100 transition-colors">
              <div>
                <p className="text-sm font-semibold text-gray-800">Customer Retention</p>
                <p className="text-xs text-gray-500 mt-0.5">Updated 5 mins ago</p>
              </div>
              <span className="badge bg-blue-50 text-blue-700 border border-blue-200">Synced</span>
            </div>
          </div>
        </div>

        <div className="card shadow-sm hover:shadow-md transition-shadow">
          <div className="card-header border-b border-gray-100 pb-3 mb-4">
            <h2 className="card-title flex items-center gap-2"><Activity size={18} className="text-purple-600" /> Recent Activity</h2>
          </div>
          <div className="relative pl-5 border-l-2 border-gray-100 space-y-5 ml-2">
            <div className="relative">
              <div className="absolute w-3.5 h-3.5 bg-white border-2 border-green-500 rounded-full -left-[27px] top-0.5"></div>
              <p className="text-sm text-gray-800">Manager approved <span className="font-bold">Sales KPI</span></p>
              <p className="text-xs text-gray-400 mt-0.5 font-medium">2 hours ago</p>
            </div>
            <div className="relative">
              <div className="absolute w-3.5 h-3.5 bg-white border-2 border-blue-500 rounded-full -left-[27px] top-0.5"></div>
              <p className="text-sm text-gray-800">Quarterly update submitted</p>
              <p className="text-xs text-gray-400 mt-0.5 font-medium">Yesterday</p>
            </div>
            <div className="relative">
              <div className="absolute w-3.5 h-3.5 bg-white border-2 border-yellow-500 rounded-full -left-[27px] top-0.5"></div>
              <p className="text-sm text-gray-800">Goal returned for revision</p>
              <p className="text-xs text-gray-400 mt-0.5 font-medium">Oct 12</p>
            </div>
          </div>
        </div>
      </div>

      {/* Row 4: Top Active Goals */}
      <div className="card mb-6 shadow-sm">
        <div className="card-header border-b border-gray-100 pb-4 mb-2 flex justify-between items-center">
          <h2 className="card-title">Top Active Goals</h2>
          <button className="text-sm text-blue-600 font-medium hover:text-blue-800 flex items-center" onClick={() => handleTabChange('goals')}>View All <ChevronRight size={16} /></button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/80 text-gray-500 text-xs uppercase tracking-wider border-y border-gray-100">
                <th className="p-3 pl-4 font-semibold">Goal Title</th>
                <th className="p-3 font-semibold">Progress</th>
                <th className="p-3 font-semibold">Weightage</th>
                <th className="p-3 pr-4 font-semibold text-right">Status</th>
              </tr>
            </thead>
            <tbody className="text-sm divide-y divide-gray-100">
              {goals.filter(g => g.lifecycle === 'Approved' || g.lifecycle === 'Locked').slice(0, 3).map(goal => (
                <tr key={goal.id} className="hover:bg-blue-50/30 transition-colors">
                  <td className="p-3 pl-4 font-semibold text-gray-800">{goal.title}</td>
                  <td className="p-3 w-1/3">
                    <div className="flex items-center gap-3">
                      <div className="w-full max-w-[150px] bg-gray-200 rounded-full h-2">
                        <div className={`h-2 rounded-full ${goal.progress >= 75 ? 'bg-green-500' : goal.progress >= 40 ? 'bg-blue-500' : 'bg-red-500'}`} style={{ width: `${goal.progress}%` }}></div>
                      </div>
                      <span className="text-xs font-bold text-gray-600">{goal.progress}%</span>
                    </div>
                  </td>
                  <td className="p-3 text-gray-600 font-medium">{goal.weightage}%</td>
                  <td className="p-3 pr-4 text-right">
                    <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-bold ${goal.progress >= 75 ? 'bg-green-100 text-green-700' : goal.progress >= 40 ? 'bg-blue-100 text-blue-700' : 'bg-red-100 text-red-700'}`}>
                      {goal.progress >= 75 ? 'On Track' : goal.progress >= 40 ? 'In Progress' : 'Delayed'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Row 5: Charts */}
      <div className="grid grid-cols-3 gap-6 mb-6">
        <div className="card col-span-2 shadow-sm">
          <div className="card-header border-b border-gray-100 pb-4">
            <h2 className="card-title">Weekly Productivity Heatmap</h2>
          </div>
          <div className="chart-container pt-4" style={{ height: 300 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={BAR_DATA}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#6b7280' }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#6b7280' }} />
                <Tooltip cursor={{ fill: 'rgba(59, 130, 246, 0.05)' }} contentStyle={{ borderRadius: '12px', border: '1px solid #e5e7eb', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} />
                <Bar dataKey="progress" fill="#3b82f6" radius={[6, 6, 0, 0]} barSize={48} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card shadow-sm">
          <div className="card-header border-b border-gray-100 pb-4">
            <h2 className="card-title">Goal Distribution</h2>
          </div>
          <div className="chart-container" style={{ height: 300, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
            <ResponsiveContainer width="100%" height="80%">
              <PieChart>
                <Pie
                  data={PIE_DATA}
                  cx="50%"
                  cy="50%"
                  innerRadius={65}
                  outerRadius={85}
                  paddingAngle={5}
                  dataKey="value"
                  stroke="none"
                >
                  {PIE_DATA.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ borderRadius: '12px', border: '1px solid #e5e7eb', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} />
              </PieChart>
            </ResponsiveContainer>
            <div className="pie-legend flex flex-wrap justify-center gap-x-4 gap-y-2 mt-2">
              {PIE_DATA.map((entry, index) => (
                <div key={index} className="legend-item flex items-center gap-1.5">
                  <div className="legend-color w-2.5 h-2.5 rounded-full" style={{ backgroundColor: entry.color }}></div>
                  <span className="legend-label text-xs font-medium text-gray-600">{entry.name}</span>
                </div>
              ))}
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
        <button
          className="btn btn-primary shadow-md hover:shadow-lg transition-shadow"
          onClick={() => setShowAddModal(true)}
          disabled={isMaxGoals}
        >
          <Plus size={16} />
          Add Goal
        </button>
        <button
          className="btn btn-outline shadow-sm"
          onClick={handleSubmitGoalSheet}
          disabled={!canSubmitSheet}
          title="Submit only when total weightage equals 100%"
        >
          <Check size={16} />
          Submit Goal Sheet
        </button>
      </div>

      {goals.some(g => g.isApproved) && (
        <div className="banner bg-blue-50 text-blue-700 border border-blue-200 p-4 rounded-md mb-6 flex items-center gap-3 shadow-sm">
          <ShieldAlert size={20} />
          <span>Approved goals are locked. Contact Admin for modifications.</span>
        </div>
      )}

      {showAddModal && (
        <div className="modal-overlay animate-fade-in">
          <div className="modal-card shadow-xl max-w-2xl w-full">
            <div className="modal-header bg-white">
              <h2>Create New Goal <span className="text-sm font-normal text-secondary ml-2">({goals.length}/8 Goals)</span></h2>
              <button className="close-btn" onClick={() => setShowAddModal(false)}>&times;</button>
            </div>

            <div className="bg-gray-50 p-4 border-y border-gray-100 flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold mb-1 text-gray-700">Weightage Distribution</p>
                <div className="w-64 h-2 bg-gray-200 rounded-full overflow-hidden flex shadow-inner">
                  <div className="bg-blue-500 h-full transition-all" style={{ width: `${totalWeightage}%` }}></div>
                  <div className="bg-yellow-400 h-full transition-all" style={{ width: `${newGoal.weightage}%` }}></div>
                </div>
              </div>
              <div className="text-right">
                <p className={`font-bold text-lg ${getWeightageColor()}`}>{remainingWeightage}% Remaining</p>
                <p className="text-xs text-secondary">Target: exactly 100% total</p>
              </div>
            </div>

            <div className="modal-body p-6 bg-white">
              <form>
                <div className="grid grid-cols-2 gap-6">
                  <div className="form-group col-span-2 mb-0">
                    <label className="form-label text-sm text-gray-600 uppercase tracking-wide font-semibold">Goal Title</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="E.g., Increase sales by 20%"
                      value={newGoal.title}
                      onChange={e => setNewGoal({ ...newGoal, title: e.target.value })}
                    />
                  </div>
                  <div className="form-group mb-0">
                    <label className="form-label text-sm text-gray-600 uppercase tracking-wide font-semibold">Thrust Area</label>
                    <select className="form-control bg-gray-50" value={newGoal.thrustArea} onChange={e => setNewGoal({ ...newGoal, thrustArea: e.target.value })}>
                      <option>Revenue Growth</option>
                      <option>Customer Success</option>
                      <option>Product Development</option>
                      <option>Operational Excellence</option>
                    </select>
                  </div>
                  <div className="form-group mb-0">
                    <label className="form-label text-sm text-gray-600 uppercase tracking-wide font-semibold">Weightage (%)</label>
                    <div className="relative">
                      <input
                        type="number"
                        className={`form-control ${!isMinWeightage || !isValidWeightage ? 'border-red-500 bg-red-50' : 'border-green-500 bg-green-50'}`}
                        min="10"
                        max="100"
                        value={newGoal.weightage}
                        onChange={e => setNewGoal({ ...newGoal, weightage: Number(e.target.value) })}
                      />
                      {!isMinWeightage && <small className="text-red-500 mt-1 block flex items-center gap-1 absolute top-full mt-1 w-full"><AlertTriangle size={12} /> Minimum 10%</small>}
                      {!isValidWeightage && <small className="text-red-500 mt-1 block flex items-center gap-1 absolute top-full mt-1 w-full"><AlertTriangle size={12} /> Exceeds 100%</small>}
                    </div>
                  </div>
                  <div className="form-group mb-0">
                    <label className="form-label text-sm text-gray-600 uppercase tracking-wide font-semibold">Unit of Measurement (UoM)</label>
                    <select className="form-control bg-gray-50" value={newGoal.uom} onChange={e => setNewGoal({ ...newGoal, uom: e.target.value })}>
                      <option>Min (Numeric / %)</option>
                      <option>Max (Numeric / %)</option>
                      <option>Timeline</option>
                      <option>Zero-based</option>
                    </select>
                  </div>
                  <div className="form-group mb-0">
                    <label className="form-label text-sm text-gray-600 uppercase tracking-wide font-semibold">Target Value</label>
                    <input
                      type={newGoal.uom === 'Timeline' ? 'date' : 'text'}
                      className="form-control"
                      placeholder={newGoal.uom === 'Min (Numeric / %)' ? 'E.g., 500000' : 'E.g., 0'}
                      value={newGoal.target}
                      onChange={e => setNewGoal({ ...newGoal, target: e.target.value })}
                    />
                  </div>
                  <div className="form-group col-span-2 mb-0">
                    <label className="form-label text-sm text-gray-600 uppercase tracking-wide font-semibold">Description</label>
                    <textarea
                      className="form-control"
                      rows="3"
                      placeholder="Detailed description..."
                      value={newGoal.description}
                      onChange={e => setNewGoal({ ...newGoal, description: e.target.value })}
                    ></textarea>
                  </div>
                </div>
              </form>
            </div>
            <div className="modal-footer bg-gray-50 border-t border-gray-100">
              <button type="button" className="btn btn-outline hover:bg-gray-100" onClick={() => setShowAddModal(false)}>Cancel</button>
              <button
                type="button"
                className={`btn ${canSubmitGoal ? 'btn-primary shadow-md hover:shadow-lg' : 'btn-disabled opacity-50 cursor-not-allowed'}`}
                onClick={handleSaveDraft}
                disabled={!canSubmitGoal}
              >
                Save as Draft
              </button>
            </div>
          </div>
        </div>
      )}

      {showEditModal && editingGoal && (
        <div className="modal-overlay animate-fade-in">
          <div className="modal-card shadow-xl max-w-2xl w-full">
            <div className="modal-header bg-white">
              <h2>Edit Goal Draft</h2>
              <button className="close-btn" type="button" onClick={() => { setShowEditModal(false); setEditingGoal(null); }}>&times;</button>
            </div>

            <div className="modal-body p-6 bg-white">
              <div className="grid grid-cols-2 gap-6">
                <div className="form-group col-span-2 mb-0">
                  <label className="form-label text-sm text-gray-600 uppercase tracking-wide font-semibold">Goal Title</label>
                  <input
                    type="text"
                    className="form-control"
                    value={editingGoal.title}
                    onChange={(event) => setEditingGoal({ ...editingGoal, title: event.target.value })}
                  />
                </div>
                <div className="form-group mb-0">
                  <label className="form-label text-sm text-gray-600 uppercase tracking-wide font-semibold">Thrust Area</label>
                  <select className="form-control bg-gray-50" value={editingGoal.thrustArea} onChange={(event) => setEditingGoal({ ...editingGoal, thrustArea: event.target.value })}>
                    <option>Revenue Growth</option>
                    <option>Customer Success</option>
                    <option>Product Development</option>
                    <option>Operational Excellence</option>
                  </select>
                </div>
                <div className="form-group mb-0">
                  <label className="form-label text-sm text-gray-600 uppercase tracking-wide font-semibold">Weightage (%)</label>
                  <input
                    type="number"
                    className="form-control"
                    min="10"
                    max="100"
                    value={editingGoal.weightage}
                    onChange={(event) => setEditingGoal({ ...editingGoal, weightage: Number(event.target.value) })}
                  />
                </div>
                <div className="form-group mb-0">
                  <label className="form-label text-sm text-gray-600 uppercase tracking-wide font-semibold">Unit of Measurement (UoM)</label>
                  <select className="form-control bg-gray-50" value={editingGoal.uom} onChange={(event) => setEditingGoal({ ...editingGoal, uom: event.target.value })}>
                    <option>Min (Numeric / %)</option>
                    <option>Max (Numeric / %)</option>
                    <option>Timeline</option>
                    <option>Zero-based</option>
                  </select>
                </div>
                <div className="form-group mb-0">
                  <label className="form-label text-sm text-gray-600 uppercase tracking-wide font-semibold">Target Value</label>
                  <input
                    type={editingGoal.uom === 'Timeline' ? 'date' : 'text'}
                    className="form-control"
                    value={editingGoal.target}
                    onChange={(event) => setEditingGoal({ ...editingGoal, target: event.target.value })}
                  />
                </div>
                <div className="form-group col-span-2 mb-0">
                  <label className="form-label text-sm text-gray-600 uppercase tracking-wide font-semibold">Description</label>
                  <textarea
                    className="form-control"
                    rows="3"
                    value={editingGoal.description}
                    onChange={(event) => setEditingGoal({ ...editingGoal, description: event.target.value })}
                  ></textarea>
                </div>
              </div>
            </div>

            <div className="modal-footer bg-gray-50 border-t border-gray-100">
              <button type="button" className="btn btn-outline hover:bg-gray-100" onClick={() => { setShowEditModal(false); setEditingGoal(null); }}>Cancel</button>
              <button type="button" className="btn btn-primary shadow-md hover:shadow-lg" onClick={handleSaveEditedGoal}>Save Changes</button>
            </div>
          </div>
        </div>
      )}

      {loadingGoals ? (
        <div className="card p-6 text-secondary">Loading goals from API...</div>
      ) : (
        <div className="card shadow-sm border border-gray-100 overflow-hidden">
          <div className="table-container">
            <table className="w-full text-left">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider">Goal Title & Area</th>
                  <th className="px-4 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider">Target & UoM</th>
                  <th className="px-4 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider">Weight</th>
                  <th className="px-4 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider">Progress</th>
                  <th className="px-4 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider">Lifecycle</th>
                  <th className="px-4 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {goals.map(goal => (
                  <tr key={goal.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="font-bold text-gray-800">{goal.title}</div>
                      <div className="text-secondary text-xs mt-0.5">{goal.thrustArea}</div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-medium text-gray-700">{goal.target}</div>
                      <div className="text-xs text-gray-500 bg-gray-100 inline-block px-1.5 py-0.5 rounded mt-1">{goal.uom}</div>
                    </td>
                    <td className="px-4 py-3 font-medium text-blue-600">{goal.weightage}%</td>
                    <td className="px-4 py-3 w-48">
                      <div className="progress-cell flex items-center gap-2">
                        <span className="text-xs font-bold w-8 text-right">{goal.progress}%</span>
                        <div className="progress-bar-bg flex-1 h-2 bg-gray-200 rounded-full overflow-hidden shadow-inner">
                          <div
                            className="progress-bar-fill h-full transition-all duration-500"
                            style={{
                              width: `${goal.progress}%`,
                              backgroundColor: goal.progress === 100 ? 'var(--success)' : 'var(--primary)'
                            }}
                          ></div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      {getLifecycleBadge(goal.lifecycle)}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex justify-end gap-2">
                        {goal.isApproved ? (
                          <button className="icon-btn text-gray-400 hover:text-gray-700 transition-colors bg-gray-100 hover:bg-gray-200 rounded p-1.5" title="Locked (Approved)" onClick={() => toast('Approved goals are locked. Admin unlock is required for edits.')}>
                            <Lock size={16} />
                          </button>
                        ) : (
                          <button className="icon-btn text-blue-600 hover:text-blue-800 transition-colors bg-blue-50 hover:bg-blue-100 rounded p-1.5" title="Edit Draft" onClick={() => handleEditDraft(goal)}>
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
      )}
    </div>
  );

  return (
    <div className="employee-dashboard">
      <div className="tabs-nav mb-6 border-b border-gray-200">
        <button
          className={`tab-btn relative px-4 py-2 font-medium transition-colors ${activeTab === 'dashboard' ? 'active text-primary border-b-2 border-primary' : 'text-gray-500 hover:text-gray-700'}`}
          onClick={() => handleTabChange('dashboard')}
        >
          Overview
        </button>
        <button
          className={`tab-btn relative px-4 py-2 font-medium transition-colors ${activeTab === 'goals' ? 'active text-primary border-b-2 border-primary' : 'text-gray-500 hover:text-gray-700'}`}
          onClick={() => handleTabChange('goals')}
        >
          My Goals
        </button>
        <button
          className={`tab-btn relative px-4 py-2 font-medium transition-colors ${activeTab === 'checkins' ? 'active text-primary border-b-2 border-primary' : 'text-gray-500 hover:text-gray-700'}`}
          onClick={() => handleTabChange('checkins')}
        >
          Quarterly Check-ins
        </button>
      </div>

      {activeTab === 'dashboard' && renderOverview()}
      {activeTab === 'goals' && renderGoals()}
      {activeTab === 'checkins' && (
        <div className="animate-fade-in card shadow-sm border border-gray-200">
          <div className="card-header bg-gray-50 flex justify-between items-center border-b border-gray-200 pb-4 p-6">
            <div>
              <h2 className="card-title text-xl font-bold flex items-center gap-2 text-gray-800"><Calculator size={24} className="text-blue-600" /> Q3 Check-in Window</h2>
              <p className="text-secondary mt-1 text-sm">Update your achievements. Progress scores are auto-computed based on the UoM formula.</p>
            </div>
            <div className="flex flex-col items-end gap-2">
              <span className="badge badge-warning text-sm px-3 py-1">Window Closes in 14 Days</span>
              <span className="text-xs text-gray-500">Jul 1 - Jul 31</span>
            </div>
          </div>

          <div className="checkin-list p-6 space-y-6 bg-white">
            {goals.filter(g => g.isApproved).map(goal => (
              <div key={goal.id} className="checkin-item p-5 border border-gray-200 rounded-xl hover:border-blue-300 hover:shadow-md transition-all">
                <div className="checkin-item-header flex justify-between items-start mb-6 pb-4 border-b border-gray-100">
                  <div>
                    <h4 className="font-bold text-lg text-gray-800">{goal.title}</h4>
                    <span className="text-xs font-medium text-gray-500 bg-gray-100 px-2 py-1 rounded mt-2 inline-block">UoM: {goal.uom}</span>
                  </div>
                  <div className="text-right bg-blue-50 border border-blue-100 px-4 py-2 rounded-lg">
                    <span className="block text-xs text-blue-600 font-bold uppercase tracking-wide">Planned Target</span>
                    <span className="text-lg font-bold text-gray-900 mt-1 block">{goal.target}</span>
                  </div>
                </div>

                <div className="grid grid-cols-4 gap-6">
                  <div className="form-group col-span-1">
                    <label className="form-label text-sm font-semibold text-gray-700">Actual Achievement</label>
                    <input
                      type={goal.uom === 'Timeline' ? 'date' : 'text'}
                      className="form-control border-blue-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                      value={goal.actual}
                      onChange={(e) => handleCheckinUpdate(goal.id, e.target.value, goal.status)}
                    />
                  </div>
                  <div className="form-group col-span-1">
                    <label className="form-label text-sm font-semibold text-gray-700">Auto-Computed Score</label>
                    <div className="flex items-center h-[38px] px-3 bg-gray-50 border border-gray-200 rounded text-lg font-bold text-gray-700 shadow-inner">
                      {goal.progress}%
                    </div>
                  </div>
                  <div className="form-group col-span-2">
                    <label className="form-label text-sm font-semibold text-gray-700">Status</label>
                    <select
                      className="form-control"
                      value={goal.status}
                      onChange={(e) => handleCheckinUpdate(goal.id, goal.actual, e.target.value)}
                    >
                      <option>Not Started</option>
                      <option>On Track</option>
                      <option>Completed</option>
                    </select>
                  </div>
                  <div className="form-group col-span-4">
                    <label className="form-label text-sm font-semibold text-gray-700">Manager Comment Log</label>
                    <div className="form-control bg-gray-50 text-gray-600 border border-gray-200 min-h-[40px] flex items-center italic" style={{ pointerEvents: 'none' }}>
                      "Keep up the good work on the Q3 metrics." - Alex (Manager)
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="p-6 bg-gray-50 border-t border-gray-200 flex justify-between items-center rounded-b-xl">
            <span className="text-xs text-gray-500"><AlertTriangle size={14} className="inline mr-1 text-yellow-500" /> Progress scores are for tracking only, not final ratings.</span>
            <div className="flex gap-4">
              <button className="btn btn-outline px-6 py-2 bg-white hover:bg-gray-50 shadow-sm" onClick={handleSaveCheckinDraft}>Save Draft</button>
              <button
                className="btn btn-primary px-6 py-2 flex items-center gap-2 shadow-md hover:shadow-lg transition-shadow"
                onClick={() => {
                  handleSubmitCheckins();
                }}
              >
                <Check size={16} /> Submit Check-in
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmployeeDashboard;
