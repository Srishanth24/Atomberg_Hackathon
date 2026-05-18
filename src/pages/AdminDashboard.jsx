import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Building, Settings, Clock, ShieldAlert,
  Download, FileSpreadsheet, LockOpen, ArrowRight,
  Activity, Search, Filter, Calendar, RefreshCw, AlertTriangle, Users
} from 'lucide-react';
import toast from 'react-hot-toast';
import { apiClient } from '../services/apiClient';
import './AdminDashboard.css';

const AUDIT_LOGS = [
  { id: 1, action: 'Approved Goal', user: 'Manager A', role: 'Manager', previousValue: 'Draft', updatedValue: 'Approved', timestamp: '2026-05-17 10:15 AM', entityType: 'Goal' },
  { id: 2, action: 'Triggered Escalation', user: 'System', role: 'System', previousValue: 'None', updatedValue: 'Level 1', timestamp: '2026-05-17 09:30 AM', entityType: 'Escalation' },
  { id: 3, action: 'Unlocked Goal', user: 'HR Admin', role: 'Admin', previousValue: 'Locked', updatedValue: 'Editable', timestamp: '2026-05-16 04:20 PM', entityType: 'Goal' },
  { id: 4, action: 'Submitted Check-in', user: 'Employee C', role: 'Employee', previousValue: '20%', updatedValue: '45%', timestamp: '2026-05-16 11:00 AM', entityType: 'Check-in' },
  { id: 5, action: 'Shared Goal Sync', user: 'Manager B', role: 'Manager', previousValue: 'Outdated', updatedValue: 'Synced', timestamp: '2026-05-15 02:45 PM', entityType: 'Shared Goal' },
];

const ESCALATIONS = [
  { id: 'demo-1', employee: 'Mark Ruffalo', manager: 'Tony Stark', triggerType: 'Pending Approval', daysOverdue: 5, level: 2, status: 'Pending Manager', severity: 'warning' },
  { id: 'demo-2', employee: 'Natasha R.', manager: 'Nick Fury', triggerType: 'Overdue Check-in', daysOverdue: 12, level: 3, status: 'Escalated to HR', severity: 'danger' },
  { id: 'demo-3', employee: 'Steve Rogers', manager: 'Peggy Carter', triggerType: 'Missing Goals', daysOverdue: 2, level: 1, status: 'Employee Reminder', severity: 'info' },
];

const escapeExportCell = (value) => {
  const text = String(value ?? '');
  return `"${text.replace(/"/g, '""')}"`;
};

const downloadBlob = (content, filename, type) => {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

const buildCsv = (rows) => {
  if (!rows.length) return '';
  const headers = Object.keys(rows[0]);
  return [
    headers.map(escapeExportCell).join(','),
    ...rows.map(row => headers.map(header => escapeExportCell(row[header])).join(',')),
  ].join('\n');
};

const buildExcelHtml = (rows) => {
  if (!rows.length) return '<table></table>';
  const headers = Object.keys(rows[0]);
  const headerCells = headers.map(header => `<th>${String(header)}</th>`).join('');
  const bodyRows = rows.map(row => `<tr>${headers.map(header => `<td>${String(row[header] ?? '')}</td>`).join('')}</tr>`).join('');
  return `<html><body><table><thead><tr>${headerCells}</tr></thead><tbody>${bodyRows}</tbody></table></body></html>`;
};

const AdminDashboard = () => {
  const [reportLoading, setReportLoading] = useState(null);
  const [goals, setGoals] = useState([]);
  const [auditLogs, setAuditLogs] = useState(AUDIT_LOGS);
  const [escalations, setEscalations] = useState(ESCALATIONS);
  const [orgHierarchy, setOrgHierarchy] = useState({ summary: { totalUsers: 0, managers: 0, employees: 0, linkedEmployees: 0, unresolvedEmployees: 0 }, users: [] });
  const [cycleSettings, setCycleSettings] = useState(null);
  const [showCycleModal, setShowCycleModal] = useState(false);
  const [savingCycleSettings, setSavingCycleSettings] = useState(false);
  const [syncingHierarchy, setSyncingHierarchy] = useState(false);
  const [auditSearch, setAuditSearch] = useState('');
  const [auditEntityType, setAuditEntityType] = useState('All Entity Types');
  const [auditDate, setAuditDate] = useState('');
  const location = useLocation();
  const navigate = useNavigate();
  const hash = location.hash.replace('#', '');
  const activeTab = ['overview', 'audit', 'reports', 'escalations'].includes(hash) ? hash : 'overview';

  useEffect(() => {
    Promise.all([apiClient.getAuditLogs(), apiClient.getGoals(), apiClient.getEscalations(), apiClient.getOrgHierarchy()])
      .then(([logs, goalData, escalationData, hierarchyData]) => {
        setAuditLogs(logs.length ? logs : AUDIT_LOGS);
        setGoals(Array.isArray(goalData) ? goalData : []);
        setEscalations(Array.isArray(escalationData) && escalationData.length ? escalationData : ESCALATIONS);
        setOrgHierarchy(hierarchyData || orgHierarchy);
      })
      .catch(() => {
        setAuditLogs(AUDIT_LOGS);
        setGoals([]);
        setEscalations(ESCALATIONS);
        setOrgHierarchy({ summary: { totalUsers: 0, managers: 0, employees: 0, linkedEmployees: 0, unresolvedEmployees: 0 }, users: [] });
      });

    apiClient.getCycleSettings()
      .then(setCycleSettings)
      .catch(() => setCycleSettings({
        activeCycle: 'FY2026',
        phase: 'Goal Setting',
        isGoalSettingOpen: true,
        q1Window: 'July',
        q2Window: 'October',
        q3Window: 'January',
        q4Window: 'March-April',
      }));
  }, []);

  const handleTabChange = (tab) => {
    if (tab === 'overview') {
      navigate('/admin');
    } else {
      navigate(`/admin#${tab}`);
    }
  };

  const filteredAuditLogs = auditLogs.filter(log => {
    const haystack = `${log.action} ${log.user} ${log.role} ${log.entityType}`.toLowerCase();
    const matchesSearch = haystack.includes(auditSearch.toLowerCase());
    const matchesEntity = auditEntityType === 'All Entity Types' || log.entityType === auditEntityType;
    const matchesDate = !auditDate || String(log.timestamp || log.createdAt || '').startsWith(auditDate);
    return matchesSearch && matchesEntity && matchesDate;
  });

  const handleGenerateReport = (reportName, format) => {
    setReportLoading(reportName);

    setTimeout(async () => {
      try {
        let blob;
        const fileFormat = format === 'CSV' ? 'csv' : 'excel';

        if (reportName.includes('Audit')) {
          blob = await apiClient.exportAuditReport(fileFormat);
        } else {
          blob = await apiClient.exportAchievementReport(fileFormat);
        }

        downloadBlob(
          blob,
          `${reportName.replace(/\s+/g, '_').toLowerCase()}_export.${format === 'CSV' ? 'csv' : 'xls'}`,
          format === 'CSV' ? 'text/csv;charset=utf-8;' : 'application/vnd.ms-excel;charset=utf-8;'
        );
        toast.success(`${reportName} exported successfully as ${format}`);
      } catch (err) {
        console.error('Export failed:', err);
        toast.error('Export failed: ' + err.message);
      } finally {
        setReportLoading(null);
      }
    }, 500);
  };

  const handleSaveCycleSettings = async () => {
    if (!cycleSettings) return;

    setSavingCycleSettings(true);
    try {
      const updated = await apiClient.updateCycleSettings(cycleSettings);
      setCycleSettings(updated);
      setShowCycleModal(false);
      toast.success('Cycle settings saved successfully');
    } catch (error) {
      toast.error(error.message);
    } finally {
      setSavingCycleSettings(false);
    }
  };

  const handleSyncOrgHierarchy = async () => {
    setSyncingHierarchy(true);
    try {
      const result = await apiClient.syncOrgHierarchy();
      setOrgHierarchy(result);
      toast.success('Organization hierarchy synchronized successfully');
    } catch (error) {
      toast.error(error.message);
    } finally {
      setSyncingHierarchy(false);
    }
  };

  const handleGlobalUnlock = async () => {
    const lockedGoals = goals.filter(goal => goal.locked || goal.status === 'locked' || goal.status === 'approved');

    if (!lockedGoals.length) {
      toast('No locked goals are currently available to unlock.');
      return;
    }

    const promptMessage = lockedGoals
      .slice(0, 8)
      .map(goal => `${goal.id} - ${goal.title}`)
      .join('\n');
    const selectedGoalId = window.prompt(`Enter the goal ID to unlock:\n\n${promptMessage}`);

    if (!selectedGoalId) return;

    try {
      await apiClient.unlockGoal(selectedGoalId.trim());
      setGoals(await apiClient.getGoals());
      toast.success('Goal unlocked through the live admin action.');
    } catch (error) {
      toast.error(error.message);
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
          <button className="btn btn-outline hover:bg-gray-50" onClick={() => setShowCycleModal(true)}>
            <Settings size={16} /> Cycle Settings
          </button>
          <button className="btn btn-outline hover:bg-gray-50" onClick={handleSyncOrgHierarchy} disabled={syncingHierarchy}>
            <Users size={16} /> {syncingHierarchy ? 'Syncing...' : 'Sync Org Hierarchy'}
          </button>
          <button className="btn btn-primary shadow-md hover:shadow-lg" onClick={handleGlobalUnlock}>
            <LockOpen size={16} /> Global Unlock
          </button>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-6 mb-6">
        <div className="card stat-card interactive-card">
          <div className="stat-icon-wrapper bg-blue-100 text-blue-600">
            <Building size={24} />
          </div>
          <div className="stat-content">
            <p className="stat-label">Total Employees</p>
            <h3 className="stat-value">1,245</h3>
          </div>
        </div>
        <div className="card stat-card interactive-card">
          <div className="stat-icon-wrapper bg-green-100 text-green-600">
            <Users size={24} />
          </div>
          <div className="stat-content">
            <p className="stat-label">Reporting Lines Synced</p>
            <h3 className="stat-value">{orgHierarchy?.summary?.linkedEmployees || 0}</h3>
          </div>
        </div>
        <div className="card stat-card interactive-card">
          <div className="stat-icon-wrapper bg-yellow-100 text-yellow-600">
            <Clock size={24} />
          </div>
          <div className="stat-content">
            <p className="stat-label">Current Cycle</p>
            <h3 className="stat-value text-lg mt-1">Q3 2026</h3>
          </div>
        </div>
        <div className="card stat-card interactive-card border-b-4 border-red-500">
          <div className="stat-icon-wrapper bg-red-100 text-red-600">
            <ShieldAlert size={24} />
          </div>
          <div className="stat-content">
            <p className="stat-label">Active Escalations</p>
            <h3 className="stat-value">{escalations.length}</h3>
          </div>
        </div>
      </div>

      <div className="card border border-gray-200">
        <div className="card-header border-b border-gray-100 pb-4">
          <h2 className="card-title">Recent Audit Activity</h2>
          <button className="btn btn-outline btn-sm" onClick={() => handleTabChange('audit')}>View Full Log</button>
        </div>
        <div className="audit-timeline p-4">
          {auditLogs.slice(0, 3).map((log, idx) => (
            <div key={log.id} className="audit-item">
              <div className="audit-dot"></div>
              {idx !== 2 && <div className="audit-line"></div>}
              <div className="audit-content">
                <div className="flex justify-between items-start mb-1">
                  <span className="font-bold text-gray-800">{log.user} <span className="text-sm font-normal text-gray-500">({log.role})</span></span>
                  <span className="text-xs text-secondary bg-gray-100 px-2 py-1 rounded">{log.timestamp}</span>
                </div>
                <div className="text-sm text-gray-700">
                  <span className="font-semibold text-blue-700">{log.action}</span> - {log.entityType}
                </div>
                <div className="audit-change mt-2 bg-gray-50 p-2 rounded text-sm flex items-center border border-gray-100 w-fit">
                  <span className="old-value text-gray-500 line-through">{log.previousValue}</span>
                  <ArrowRight size={14} className="text-gray-400 mx-3" />
                  <span className="new-value font-medium text-green-700">{log.updatedValue}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderAudit = () => (
    <div className="animate-fade-in">
      <div className="dashboard-header mb-6">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2"><Activity size={24} /> Enterprise Audit Trail</h1>
          <p className="text-secondary mt-1">Comprehensive log of all system activities and compliance events.</p>
        </div>
        <button className="btn btn-outline shadow-sm flex items-center gap-2" onClick={() => handleGenerateReport('Audit Report', 'CSV')}>
          <Download size={16} /> Export CSV
        </button>
      </div>

      <div className="card shadow-sm border border-gray-200 mb-6">
        <div className="p-4 bg-gray-50 border-b border-gray-200 flex gap-4">
          <div className="form-group mb-0 flex-1 relative">
            <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input type="text" className="form-control pl-9" placeholder="Search audit logs..." value={auditSearch} onChange={(event) => setAuditSearch(event.target.value)} />
          </div>
          <div className="form-group mb-0 w-48">
            <select className="form-control" value={auditEntityType} onChange={(event) => setAuditEntityType(event.target.value)}>
              <option>All Entity Types</option>
              <option>Goal</option>
              <option>Check-in</option>
              <option>Escalation</option>
              <option>Shared Goal</option>
            </select>
          </div>
          <div className="form-group mb-0 w-48 relative">
            <Calendar size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input type="date" className="form-control pl-9" value={auditDate} onChange={(event) => setAuditDate(event.target.value)} />
          </div>
          <button className="btn btn-primary" onClick={() => toast.success(`${filteredAuditLogs.length} audit log rows match the filters`)}><Filter size={16} /> Filter</button>
        </div>

        <div className="table-container">
          <table className="w-full text-sm">
            <thead className="bg-white border-b-2 border-gray-100">
              <tr>
                <th className="px-4 py-3 text-left">Timestamp</th>
                <th className="px-4 py-3 text-left">Action</th>
                <th className="px-4 py-3 text-left">User</th>
                <th className="px-4 py-3 text-left">Role</th>
                <th className="px-4 py-3 text-left">Entity Type</th>
                <th className="px-4 py-3 text-left">Previous Value</th>
                <th className="px-4 py-3 text-left">Updated Value</th>
              </tr>
            </thead>
            <tbody>
              {filteredAuditLogs.map(log => (
                <tr key={log.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 whitespace-nowrap text-gray-500">{log.timestamp}</td>
                  <td className="px-4 py-3 font-medium text-gray-800">{log.action}</td>
                  <td className="px-4 py-3">{log.user}</td>
                  <td className="px-4 py-3"><span className="badge badge-secondary text-xs">{log.role}</span></td>
                  <td className="px-4 py-3">{log.entityType}</td>
                  <td className="px-4 py-3 text-gray-500 line-through">{log.previousValue}</td>
                  <td className="px-4 py-3 font-medium text-green-600">{log.updatedValue}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const renderReports = () => (
    <div className="animate-fade-in">
      <div className="dashboard-header mb-6">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2"><FileSpreadsheet size={24} /> Reports Builder</h1>
          <p className="text-secondary mt-1">Generate and download comprehensive organizational reports.</p>
        </div>
      </div>

      <div className="card shadow-sm border border-gray-200 mb-8 p-6 bg-blue-50/50">
        <h3 className="font-bold text-lg mb-4 flex items-center gap-2"><Filter size={18} /> Global Filters</h3>
        <div className="grid grid-cols-4 gap-4">
          <div className="form-group mb-0">
            <label className="form-label text-xs uppercase text-gray-500">Department</label>
            <select className="form-control"><option>All Departments</option><option>Sales</option><option>Engineering</option></select>
          </div>
          <div className="form-group mb-0">
            <label className="form-label text-xs uppercase text-gray-500">Quarter</label>
            <select className="form-control"><option>Q3 2026</option><option>Q2 2026</option></select>
          </div>
          <div className="form-group mb-0">
            <label className="form-label text-xs uppercase text-gray-500">Employee</label>
            <input type="text" className="form-control" placeholder="Search employee..." />
          </div>
          <div className="flex items-end">
            <div className="w-full bg-white border border-gray-200 rounded p-2 text-center shadow-inner">
              <span className="text-xs text-gray-500 uppercase block mb-1">Export Preview Count</span>
              <span className="font-bold text-xl text-blue-600 block mt-1">1,245 rows</span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6">
        {['Completion Report', 'Audit Report', 'Check-in Compliance', 'Escalation Report', 'Team Performance Report'].map((report, idx) => (
          <div key={idx} className="card export-card border border-gray-200 hover:shadow-lg transition-shadow bg-white flex flex-col">
            <div className={`export-icon mb-4 w-12 h-12 rounded-lg flex items-center justify-center ${idx % 2 === 0 ? 'bg-blue-100 text-blue-600' : 'bg-green-100 text-green-600'}`}>
              <FileSpreadsheet size={24} />
            </div>
            <h3 className="font-bold text-lg">{report}</h3>
            <p className="text-secondary text-sm mt-2 mb-6 flex-1">Comprehensive export including all filtered parameters.</p>

            {reportLoading === report ? (
              <div className="w-full text-center py-2 bg-gray-50 rounded text-blue-600 flex items-center justify-center gap-2 font-medium border border-blue-100">
                <RefreshCw size={16} className="animate-spin" /> Generating...
              </div>
            ) : (
              <div className="flex gap-2 w-full mt-auto">
                <button className="btn btn-outline flex-1 border-gray-300 hover:bg-gray-50 flex items-center justify-center gap-1" onClick={() => handleGenerateReport(report, 'CSV')}><Download size={16} /> CSV</button>
                <button className="btn btn-primary flex-1 flex items-center justify-center gap-1" onClick={() => handleGenerateReport(report, 'Excel')}><Download size={16} /> Excel</button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );

  const renderEscalations = () => (
    <div className="animate-fade-in">
      <div className="dashboard-header mb-6">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2"><ShieldAlert size={24} /> Escalation Monitor</h1>
          <p className="text-secondary mt-1">Track and manage overdue actions and workflow escalations.</p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6 mb-6">
        <div className="card col-span-2">
          <div className="card-header border-b border-gray-100 pb-4 flex justify-between items-center">
            <h2 className="card-title">Active Escalations Table</h2>
            <div className="flex gap-2">
              <select className="form-control form-control-sm"><option>All Status</option><option>Pending Manager</option><option>Escalated to HR</option></select>
            </div>
          </div>
          <div className="table-container">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left">Employee</th>
                  <th className="px-4 py-3 text-left">Manager</th>
                  <th className="px-4 py-3 text-left">Trigger</th>
                  <th className="px-4 py-3 text-left">Days Overdue</th>
                  <th className="px-4 py-3 text-left">Level</th>
                  <th className="px-4 py-3 text-left">Status</th>
                  <th className="px-4 py-3 text-left">Workflow Progression</th>
                </tr>
              </thead>
              <tbody>
                {escalations.map(esc => (
                  <tr key={esc.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium">{esc.employee}</td>
                    <td className="px-4 py-3 text-gray-600">{esc.manager}</td>
                    <td className="px-4 py-3 text-gray-600">{esc.triggerType || 'Pending Approval'}</td>
                    <td className={`px-4 py-3 font-bold ${esc.severity === 'danger' ? 'text-red-600' : esc.severity === 'warning' ? 'text-yellow-600' : 'text-blue-600'}`}>
                      {esc.daysOverdue} days
                    </td>
                    <td className="px-4 py-3">Lvl {esc.level}</td>
                    <td className="px-4 py-3">
                      <span className={`badge ${esc.severity === 'danger' ? 'badge-danger' : esc.severity === 'warning' ? 'badge-warning' : 'badge-primary'}`}>
                        {esc.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1 text-xs">
                        <div className={`w-3 h-3 rounded-full ${esc.level >= 1 ? 'bg-blue-500' : 'bg-gray-200'}`} title="Employee"></div>
                        <div className={`w-4 h-0.5 ${esc.level >= 2 ? 'bg-blue-500' : 'bg-gray-200'}`}></div>
                        <div className={`w-3 h-3 rounded-full ${esc.level >= 2 ? 'bg-yellow-500' : 'bg-gray-200'}`} title="Manager"></div>
                        <div className={`w-4 h-0.5 ${esc.level >= 3 ? 'bg-yellow-500' : 'bg-gray-200'}`}></div>
                        <div className={`w-3 h-3 rounded-full ${esc.level >= 3 ? 'bg-red-500' : 'bg-gray-200'}`} title="HR Admin"></div>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="card shadow-sm border-t-4 border-t-red-500">
          <div className="card-header border-b border-gray-100 pb-4">
            <h2 className="card-title flex items-center gap-2"><AlertTriangle size={18} className="text-red-500" /> Escalation Workflow</h2>
          </div>
          <div className="p-4 space-y-6">
            <div className="relative pl-6 border-l-2 border-gray-200 pb-6">
              <div className="absolute w-4 h-4 bg-blue-500 rounded-full -left-[9px] top-0 border-2 border-white"></div>
              <h4 className="font-bold text-gray-800">Level 1: Employee Reminder</h4>
              <p className="text-sm text-gray-500 mt-1">1-3 days overdue. Automated reminder sent to employee.</p>
            </div>
            <div className="relative pl-6 border-l-2 border-gray-200 pb-6">
              <div className="absolute w-4 h-4 bg-yellow-500 rounded-full -left-[9px] top-0 border-2 border-white"></div>
              <h4 className="font-bold text-gray-800">Level 2: Manager Notification</h4>
              <p className="text-sm text-gray-500 mt-1">4-7 days overdue. Manager is notified to intervene.</p>
            </div>
            <div className="relative pl-6">
              <div className="absolute w-4 h-4 bg-red-500 rounded-full -left-[9px] top-0 border-2 border-white"></div>
              <h4 className="font-bold text-gray-800">Level 3: HR Escalation</h4>
              <p className="text-sm text-gray-500 mt-1">8+ days overdue. HR admin receives an alert for compliance action.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="admin-dashboard">
      {showCycleModal && cycleSettings && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-2xl rounded-2xl bg-white shadow-2xl">
            <div className="border-b border-gray-100 p-5">
              <h3 className="text-lg font-bold text-gray-900">Cycle Settings</h3>
              <p className="text-sm text-gray-500 mt-1">Update the active cycle and quarterly windows.</p>
            </div>
            <div className="grid grid-cols-2 gap-4 p-5">
              <div className="form-group mb-0">
                <label className="form-label text-xs uppercase text-gray-500">Active Cycle</label>
                <input className="form-control" value={cycleSettings.activeCycle || ''} onChange={(event) => setCycleSettings({ ...cycleSettings, activeCycle: event.target.value })} />
              </div>
              <div className="form-group mb-0">
                <label className="form-label text-xs uppercase text-gray-500">Phase</label>
                <input className="form-control" value={cycleSettings.phase || ''} onChange={(event) => setCycleSettings({ ...cycleSettings, phase: event.target.value })} />
              </div>
              <div className="form-group mb-0">
                <label className="form-label text-xs uppercase text-gray-500">Q1 Window</label>
                <input className="form-control" value={cycleSettings.q1Window || ''} onChange={(event) => setCycleSettings({ ...cycleSettings, q1Window: event.target.value })} />
              </div>
              <div className="form-group mb-0">
                <label className="form-label text-xs uppercase text-gray-500">Q2 Window</label>
                <input className="form-control" value={cycleSettings.q2Window || ''} onChange={(event) => setCycleSettings({ ...cycleSettings, q2Window: event.target.value })} />
              </div>
              <div className="form-group mb-0">
                <label className="form-label text-xs uppercase text-gray-500">Q3 Window</label>
                <input className="form-control" value={cycleSettings.q3Window || ''} onChange={(event) => setCycleSettings({ ...cycleSettings, q3Window: event.target.value })} />
              </div>
              <div className="form-group mb-0">
                <label className="form-label text-xs uppercase text-gray-500">Q4 Window</label>
                <input className="form-control" value={cycleSettings.q4Window || ''} onChange={(event) => setCycleSettings({ ...cycleSettings, q4Window: event.target.value })} />
              </div>
              <div className="col-span-2 flex items-center gap-3">
                <input id="goal-setting-open" type="checkbox" checked={Boolean(cycleSettings.isGoalSettingOpen)} onChange={(event) => setCycleSettings({ ...cycleSettings, isGoalSettingOpen: event.target.checked })} />
                <label htmlFor="goal-setting-open" className="text-sm text-gray-700">Goal setting is currently open</label>
              </div>
            </div>
            <div className="flex justify-end gap-3 border-t border-gray-100 p-5">
              <button className="btn btn-outline" onClick={() => setShowCycleModal(false)} disabled={savingCycleSettings}>Cancel</button>
              <button className="btn btn-primary" onClick={handleSaveCycleSettings} disabled={savingCycleSettings}>
                {savingCycleSettings ? 'Saving...' : 'Save Settings'}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="tabs-nav mb-6 border-b border-gray-200">
        <button
          className={`tab-btn relative px-4 py-2 font-medium transition-colors ${activeTab === 'overview' ? 'active text-primary border-b-2 border-primary' : 'text-gray-500 hover:text-gray-700'}`}
          onClick={() => handleTabChange('overview')}
        >
          System Overview
        </button>
        <button
          className={`tab-btn relative px-4 py-2 font-medium transition-colors ${activeTab === 'audit' ? 'active text-primary border-b-2 border-primary' : 'text-gray-500 hover:text-gray-700'}`}
          onClick={() => handleTabChange('audit')}
        >
          Audit Trail
        </button>
        <button
          className={`tab-btn relative px-4 py-2 font-medium transition-colors ${activeTab === 'reports' ? 'active text-primary border-b-2 border-primary' : 'text-gray-500 hover:text-gray-700'}`}
          onClick={() => handleTabChange('reports')}
        >
          Reports Builder
        </button>
        <button
          className={`tab-btn relative px-4 py-2 font-medium transition-colors ${activeTab === 'escalations' ? 'active text-primary border-b-2 border-primary' : 'text-gray-500 hover:text-gray-700'}`}
          onClick={() => handleTabChange('escalations')}
        >
          Escalations
        </button>
      </div>

      {activeTab === 'overview' && renderOverview()}
      {activeTab === 'audit' && renderAudit()}
      {activeTab === 'reports' && renderReports()}
      {activeTab === 'escalations' && renderEscalations()}
    </div>
  );
};

export default AdminDashboard;
