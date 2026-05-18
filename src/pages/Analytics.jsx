import { useEffect, useState } from 'react';
import { Sparkles, TrendingUp, AlertTriangle, Trophy, Clock, ShieldAlert } from 'lucide-react';
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    BarChart, Bar, Legend, PieChart, Pie, Cell, ScatterChart, Scatter, ZAxis, LineChart, Line
} from 'recharts';
import toast from 'react-hot-toast';
import { apiClient } from '../services/apiClient';
import './Analytics.css';

const FALLBACK_DATA = {
    summary: {
        totalGoals: 0,
        lockedGoals: 0,
        pendingApprovals: 0,
        completedGoals: 0,
        averageProgress: 0,
    },
    monthlyProgress: [
        { name: 'Jan', completed: 1, progress: 42 },
        { name: 'Feb', completed: 2, progress: 55 },
        { name: 'Mar', completed: 2, progress: 61 },
    ],
    statusBreakdown: [
        { name: 'Draft', value: 1, color: '#94a3b8' },
        { name: 'Submitted', value: 2, color: '#3b82f6' },
        { name: 'Approved', value: 3, color: '#10b981' },
    ],
    thrustBreakdown: [
        { name: 'Revenue', value: 4, color: '#3b82f6' },
        { name: 'Product', value: 3, color: '#8b5cf6' },
        { name: 'Customer', value: 3, color: '#10b981' },
        { name: 'Ops', value: 2, color: '#f59e0b' },
    ],
    managerEffectiveness: [
        { name: 'Manager A', teamSize: 4, avgDecisionDays: 2.4, approvalRate: 88, effectiveness: 76 },
        { name: 'Manager B', teamSize: 5, avgDecisionDays: 4.2, approvalRate: 82, effectiveness: 61 },
        { name: 'Manager C', teamSize: 3, avgDecisionDays: 1.5, approvalRate: 91, effectiveness: 84 },
    ],
};

const Analytics = () => {
    const [dashboard, setDashboard] = useState(null);

    useEffect(() => {
        apiClient.getAnalyticsDashboard()
            .then(setDashboard)
            .catch((error) => {
                console.error('Failed to load analytics dashboard:', error);
                toast.error('Analytics data is currently unavailable; showing fallback visuals.');
                setDashboard(null);
            });
    }, []);

    const data = dashboard || FALLBACK_DATA;
    const summary = data.summary || FALLBACK_DATA.summary;
    const monthlyProgress = data.monthlyProgress?.length ? data.monthlyProgress : FALLBACK_DATA.monthlyProgress;
    const statusBreakdown = data.statusBreakdown?.length ? data.statusBreakdown : FALLBACK_DATA.statusBreakdown;
    const thrustBreakdown = data.thrustBreakdown?.length ? data.thrustBreakdown : FALLBACK_DATA.thrustBreakdown;
    const managerEffectiveness = data.managerEffectiveness?.length ? data.managerEffectiveness : FALLBACK_DATA.managerEffectiveness;

    const managerScatterData = managerEffectiveness.map((item) => ({
        x: item.teamSize,
        y: item.approvalRate,
        z: item.effectiveness,
        name: item.name,
    }));

    return (
        <div className="animate-fade-in">
            <div className="dashboard-header mb-6">
                <div>
                    <h1 className="text-2xl font-bold">Enterprise Analytics Module</h1>
                    <p className="text-secondary mt-1">Live performance visibility across goals, approvals, and manager effectiveness.</p>
                </div>
            </div>

            <div className="ai-insights-panel mb-8 bg-purple-50/50 border border-purple-100 rounded-xl p-6 shadow-sm">
                <div className="ai-header flex items-center gap-2 mb-4">
                    <Sparkles className="text-purple-500" size={24} />
                    <h2 className="font-bold text-xl text-purple-900">Live Performance Snapshot</h2>
                </div>
                <div className="grid grid-cols-4 gap-6">
                    <div className="insight-card bg-white p-4 rounded-lg border border-purple-50 shadow-sm flex items-start gap-3 hover:shadow-md transition-shadow">
                        <div className="insight-icon bg-blue-100 text-blue-600 p-2 rounded-full shrink-0"><Trophy size={20} /></div>
                        <p className="text-sm text-gray-700"><strong>{summary.totalGoals}</strong> total goals are registered in the active portal.</p>
                    </div>
                    <div className="insight-card bg-white p-4 rounded-lg border border-purple-50 shadow-sm flex items-start gap-3 hover:shadow-md transition-shadow">
                        <div className="insight-icon bg-green-100 text-green-600 p-2 rounded-full shrink-0"><TrendingUp size={20} /></div>
                        <p className="text-sm text-gray-700"><strong>{summary.completedGoals}</strong> goals are complete and tracking cleanly.</p>
                    </div>
                    <div className="insight-card bg-white p-4 rounded-lg border border-purple-50 shadow-sm flex items-start gap-3 hover:shadow-md transition-shadow">
                        <div className="insight-icon bg-yellow-100 text-yellow-600 p-2 rounded-full shrink-0"><Clock size={20} /></div>
                        <p className="text-sm text-gray-700"><strong>{summary.pendingApprovals}</strong> approvals are still pending manager action.</p>
                    </div>
                    <div className="insight-card bg-white p-4 rounded-lg border border-purple-50 shadow-sm flex items-start gap-3 hover:shadow-md transition-shadow">
                        <div className="insight-icon bg-purple-100 text-purple-600 p-2 rounded-full shrink-0"><ShieldAlert size={20} /></div>
                        <p className="text-sm text-gray-700"><strong>{summary.averageProgress}%</strong> is the average goal progress across the org.</p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-4 gap-6 mb-6">
                <div className="card stat-card interactive-card border-l-4 border-blue-500">
                    <div className="stat-icon-wrapper bg-blue-100 text-blue-600">
                        <Trophy size={24} />
                    </div>
                    <div className="stat-content">
                        <p className="stat-label">Total Goals</p>
                        <h3 className="stat-value">{summary.totalGoals}</h3>
                    </div>
                </div>
                <div className="card stat-card interactive-card border-l-4 border-green-500">
                    <div className="stat-icon-wrapper bg-green-100 text-green-600">
                        <TrendingUp size={24} />
                    </div>
                    <div className="stat-content">
                        <p className="stat-label">Locked / Approved</p>
                        <h3 className="stat-value">{summary.lockedGoals}</h3>
                    </div>
                </div>
                <div className="card stat-card interactive-card border-l-4 border-yellow-500">
                    <div className="stat-icon-wrapper bg-yellow-100 text-yellow-600">
                        <Clock size={24} />
                    </div>
                    <div className="stat-content">
                        <p className="stat-label">Pending Approvals</p>
                        <h3 className="stat-value">{summary.pendingApprovals}</h3>
                    </div>
                </div>
                <div className="card stat-card interactive-card border-l-4 border-red-500">
                    <div className="stat-icon-wrapper bg-red-100 text-red-600">
                        <AlertTriangle size={24} />
                    </div>
                    <div className="stat-content">
                        <p className="stat-label">Completed Goals</p>
                        <h3 className="stat-value">{summary.completedGoals}</h3>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-6 mb-6">
                <div className="card shadow-sm border border-gray-200">
                    <div className="card-header border-b border-gray-100 pb-4">
                        <h2 className="card-title">Monthly Progress</h2>
                    </div>
                    <div style={{ height: 300 }} className="p-4">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={monthlyProgress} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="colorProgress" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8} />
                                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <XAxis dataKey="name" axisLine={false} tickLine={false} />
                                <YAxis axisLine={false} tickLine={false} />
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                                <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                                <Legend />
                                <Area type="monotone" dataKey="progress" name="Avg Progress %" stroke="#3b82f6" fillOpacity={1} fill="url(#colorProgress)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="card shadow-sm border border-gray-200">
                    <div className="card-header border-b border-gray-100 pb-4">
                        <h2 className="card-title">Goal Status Breakdown</h2>
                    </div>
                    <div style={{ height: 300 }} className="p-4 flex items-center">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie data={statusBreakdown} innerRadius={70} outerRadius={100} paddingAngle={4} dataKey="value">
                                    {statusBreakdown.map((entry, index) => (
                                        <Cell key={`status-${index}`} fill={entry.color || ['#94a3b8', '#3b82f6', '#10b981', '#f59e0b'][index % 4]} />
                                    ))}
                                </Pie>
                                <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                                <Legend />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-3 gap-6 mb-6">
                <div className="card shadow-sm border border-gray-200">
                    <div className="card-header border-b border-gray-100 pb-4">
                        <h2 className="card-title">Goal Distribution by Thrust Area</h2>
                    </div>
                    <div style={{ height: 250 }} className="p-4">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={thrustBreakdown} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} />
                                <YAxis axisLine={false} tickLine={false} />
                                <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                                <Bar dataKey="value" name="Goals" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="card shadow-sm border border-gray-200">
                    <div className="card-header border-b border-gray-100 pb-4">
                        <h2 className="card-title flex items-center gap-2"><ShieldAlert size={18} className="text-red-500" /> Manager Effectiveness</h2>
                    </div>
                    <div style={{ height: 250 }} className="p-4">
                        <ResponsiveContainer width="100%" height="100%">
                            <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                                <CartesianGrid stroke="#f0f0f0" />
                                <XAxis type="number" dataKey="x" name="Team Size" tickLine={false} axisLine={false} />
                                <YAxis type="number" dataKey="y" name="Approval Rate" tickLine={false} axisLine={false} />
                                <ZAxis type="number" dataKey="z" range={[80, 500]} name="Effectiveness" />
                                <Tooltip cursor={{ strokeDasharray: '3 3' }} />
                                <Scatter name="Managers" data={managerScatterData} fill="#8b5cf6" fillOpacity={0.7} />
                            </ScatterChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="card shadow-sm border border-gray-200">
                    <div className="card-header border-b border-gray-100 pb-4">
                        <h2 className="card-title">Progress by Manager</h2>
                    </div>
                    <div style={{ height: 250 }} className="p-4">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={managerEffectiveness} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} />
                                <YAxis axisLine={false} tickLine={false} />
                                <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                                <Legend />
                                <Line type="monotone" dataKey="approvalRate" name="Approval Rate" stroke="#10b981" strokeWidth={2} dot={{ r: 4 }} />
                                <Line type="monotone" dataKey="avgDecisionDays" name="Avg Decision Days" stroke="#f59e0b" strokeWidth={2} dot={{ r: 4 }} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Analytics;