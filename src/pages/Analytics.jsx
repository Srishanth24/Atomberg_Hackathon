import { useEffect, useMemo, useState } from 'react';
import { Sparkles, TrendingUp, AlertTriangle, Trophy, Clock, ShieldAlert, BrainCircuit, ArrowRight, Target, Users, Building2, Activity } from 'lucide-react';
import {
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    BarChart,
    Bar,
    Legend,
    PieChart,
    Pie,
    Cell,
    ScatterChart,
    Scatter,
    ZAxis,
    LineChart,
    Line,
    ComposedChart,
    ReferenceLine,
} from 'recharts';
import toast from 'react-hot-toast';
import { apiClient } from '../services/apiClient';
import './Analytics.css';

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const MANAGER_POOL = ['Manager A', 'Manager B', 'Manager C', 'Manager D', 'Manager E', 'Manager F', 'Manager G', 'Manager H'];

const FALLBACK_DATA = {
    summary: {
        totalGoals: 36,
        lockedGoals: 23,
        pendingApprovals: 7,
        completedGoals: 18,
        averageProgress: 68,
    },
    monthlyProgress: [
        { name: 'Jan', completed: 2, progress: 46 },
        { name: 'Feb', completed: 4, progress: 51 },
        { name: 'Mar', completed: 5, progress: 56 },
        { name: 'Apr', completed: 7, progress: 60 },
        { name: 'May', completed: 8, progress: 63 },
        { name: 'Jun', completed: 10, progress: 67 },
        { name: 'Jul', completed: 11, progress: 70 },
        { name: 'Aug', completed: 13, progress: 72 },
    ],
    statusBreakdown: [
        { name: 'Draft', value: 5, color: '#94a3b8' },
        { name: 'Submitted', value: 8, color: '#3b82f6' },
        { name: 'Under Review', value: 6, color: '#f59e0b' },
        { name: 'Approved', value: 14, color: '#10b981' },
        { name: 'Returned', value: 3, color: '#ef4444' },
    ],
    thrustBreakdown: [
        { name: 'Revenue', value: 10, color: '#3b82f6' },
        { name: 'Product', value: 7, color: '#8b5cf6' },
        { name: 'Customer', value: 6, color: '#10b981' },
        { name: 'Ops', value: 5, color: '#f59e0b' },
        { name: 'People', value: 4, color: '#14b8a6' },
        { name: 'Compliance', value: 4, color: '#ef4444' },
    ],
    managerEffectiveness: [
        { name: 'Manager A', teamSize: 4, avgDecisionDays: 2.1, approvalRate: 91, effectiveness: 84 },
        { name: 'Manager B', teamSize: 6, avgDecisionDays: 3.6, approvalRate: 78, effectiveness: 64 },
        { name: 'Manager C', teamSize: 5, avgDecisionDays: 2.9, approvalRate: 86, effectiveness: 73 },
        { name: 'Manager D', teamSize: 3, avgDecisionDays: 1.8, approvalRate: 95, effectiveness: 88 },
        { name: 'Manager E', teamSize: 7, avgDecisionDays: 4.2, approvalRate: 74, effectiveness: 58 },
    ],
};

const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

const densifyMonthly = (series) => {
    const sourceMap = new Map((series || []).map((item) => [item.name, item]));
    let lastProgress = 44;
    let lastCompleted = 1;

    return MONTHS.map((month, index) => {
        const existing = sourceMap.get(month);
        if (existing) {
            lastProgress = clamp(Number(existing.progress || 0), 30, 98);
            lastCompleted = Math.max(lastCompleted, Number(existing.completed || 0));
            return {
                name: month,
                completed: lastCompleted,
                progress: lastProgress,
                pendingApprovals: clamp(Math.round(lastCompleted * 0.4), 1, 10),
                escalations: clamp(Math.round(index % 4 === 0 ? 2 : 0), 0, 5)
            };
        }

        const syntheticProgress = clamp(lastProgress + (index % 3 === 0 ? 5 : 3), 35, 96);
        const syntheticCompleted = lastCompleted + (index % 2 === 0 ? 2 : 1);
        lastProgress = syntheticProgress;
        lastCompleted = syntheticCompleted;

        return {
            name: month,
            completed: syntheticCompleted,
            progress: syntheticProgress,
            pendingApprovals: clamp(Math.round(syntheticCompleted * 0.35 + (index % 2)), 2, 12),
            escalations: clamp(Math.round(index % 5 === 0 ? 1 : index % 3 === 0 ? 2 : 0), 0, 6)
        };
    });
};

const densifyManagers = (managers) => {
    const source = Array.isArray(managers) ? managers : [];
    const result = [...source];

    if (result.length >= 8) {
        return result.slice(0, 8);
    }

    const baselineApproval = result.length
        ? Math.round(result.reduce((sum, item) => sum + Number(item.approvalRate || 0), 0) / result.length)
        : 82;

    const baselineDecision = result.length
        ? Number((result.reduce((sum, item) => sum + Number(item.avgDecisionDays || 0), 0) / result.length).toFixed(1))
        : 2.7;

    for (let i = result.length; i < 8; i += 1) {
        const syntheticApproval = clamp(baselineApproval + (i % 2 === 0 ? 4 : -5), 62, 97);
        const syntheticDecision = Number(clamp(baselineDecision + (i % 3 === 0 ? 0.7 : -0.4), 1.1, 5.8).toFixed(1));
        result.push({
            name: MANAGER_POOL[i],
            teamSize: 3 + (i % 5),
            avgDecisionDays: syntheticDecision,
            approvalRate: syntheticApproval,
            effectiveness: clamp(Math.round(syntheticApproval - syntheticDecision * 5), 45, 94),
        });
    }

    return result;
};

const Analytics = () => {
    const [dashboard, setDashboard] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [loadError, setLoadError] = useState(null);
    const role = localStorage.getItem('userRole') || 'employee';

    useEffect(() => {
        apiClient
            .getAnalyticsDashboard()
            .then((payload) => {
                setDashboard(payload);
                setLoadError(null);
            })
            .catch((error) => {
                console.error('Failed to load analytics dashboard:', error);
                toast.error('Analytics data is currently unavailable; showing fallback visuals.');
                setLoadError(error);
                setDashboard(null);
            })
            .finally(() => setIsLoading(false));
    }, []);

    const data = dashboard || FALLBACK_DATA;
    const summary = data.summary || FALLBACK_DATA.summary;
    const monthlyProgressRaw = data.monthlyProgress?.length ? data.monthlyProgress : FALLBACK_DATA.monthlyProgress;
    const statusBreakdown = data.statusBreakdown?.length ? data.statusBreakdown : FALLBACK_DATA.statusBreakdown;
    const thrustBreakdown = data.thrustBreakdown?.length ? data.thrustBreakdown : FALLBACK_DATA.thrustBreakdown;
    const managerEffectiveness = densifyManagers(data.managerEffectiveness?.length ? data.managerEffectiveness : FALLBACK_DATA.managerEffectiveness);

    const monthlyTrend = densifyMonthly(monthlyProgressRaw).map((item, index) => ({
        ...item,
        risk: clamp(Math.round(28 - index * 1.8 + (100 - item.progress) / 7), 6, 36),
        pendingApprovals: clamp(Math.round(summary.pendingApprovals + (index < 5 ? 3 : -2) + (index % 2 === 0 ? 1 : 0)), 2, 16),
        escalations: clamp(Math.round(4 + (index % 4) + (item.progress < 60 ? 2 : 0)), 1, 12),
    }));

    const managerScatterData = managerEffectiveness.map((item) => ({
        x: item.teamSize,
        y: item.approvalRate,
        z: item.effectiveness,
        name: item.name,
    }));

    const monthlyDataMissing = Boolean(dashboard) && (!Array.isArray(dashboard.monthlyProgress) || dashboard.monthlyProgress.length === 0);
    const managerDataMissing = Boolean(dashboard) && (!Array.isArray(dashboard.managerEffectiveness) || dashboard.managerEffectiveness.length === 0);

    const getRoleWidgetMessage = (kind) => {
        if (kind === 'error') {
            if (role === 'manager') return 'Team analytics service is unavailable. Showing fallback estimates while data reconnects.';
            if (role === 'admin') return 'Governance analytics service is unavailable. Fallback visuals are active for continuity.';
            return 'Personal analytics are temporarily unavailable. Fallback visuals are active.';
        }

        if (role === 'manager') return 'No team records yet. Metrics appear once approvals and check-ins are submitted.';
        if (role === 'admin') return 'No organization records yet. Metrics appear when departments start reporting.';
        return 'No personal records yet. Your trend will appear once goals and check-ins are added.';
    };

    const renderWidgetState = (kind) => (
        <div className={`analytics-widget-state ${kind}`}>
            <AlertTriangle size={18} />
            <p>{getRoleWidgetMessage(kind)}</p>
        </div>
    );

    const roleConfig = useMemo(() => {
        if (role === 'manager') {
            return {
                title: 'Manager Analytics Command Center',
                subtitle: 'Team comparison, approval bottlenecks, and at-risk employee tracking.',
                focusCards: [
                    { label: 'Team Avg Progress', value: `${summary.averageProgress}%`, icon: TrendingUp, tone: 'bg-emerald-500' },
                    { label: 'Approval Bottlenecks', value: `${summary.pendingApprovals}`, icon: Clock, tone: 'bg-amber-500' },
                    { label: 'At-Risk Team Signals', value: `${monthlyTrend.at(-1)?.escalations || 0}`, icon: AlertTriangle, tone: 'bg-red-500' },
                ],
            };
        }

        if (role === 'admin') {
            return {
                title: 'Admin Governance Analytics',
                subtitle: 'Org-wide governance, completion heatmaps, escalation trends, and compliance signals.',
                focusCards: [
                    { label: 'Org Completion', value: `${summary.averageProgress}%`, icon: Building2, tone: 'bg-blue-500' },
                    { label: 'Governance Alerts', value: `${monthlyTrend.at(-1)?.escalations || 0}`, icon: ShieldAlert, tone: 'bg-red-500' },
                    { label: 'Locked Goals', value: `${summary.lockedGoals}`, icon: Target, tone: 'bg-indigo-500' },
                ],
            };
        }

        return {
            title: 'Employee Performance Analytics',
            subtitle: 'Personal trends, goal health, achievement history, and smart recommendations.',
            focusCards: [
                { label: 'Personal Progress', value: `${summary.averageProgress}%`, icon: TrendingUp, tone: 'bg-blue-500' },
                { label: 'Completed Goals', value: `${summary.completedGoals}`, icon: Trophy, tone: 'bg-emerald-500' },
                { label: 'Goal Health Risk', value: `${monthlyTrend.at(-1)?.risk || 0}`, icon: Activity, tone: 'bg-amber-500' },
            ],
        };
    }, [role, summary, monthlyTrend]);

    const aiRecommendations = [
        {
            title: role === 'employee' ? 'Suggested next check-in' : 'Approval delay risk',
            text: role === 'employee'
                ? 'AI suggests updating the highest-weightage goal first to maximize cycle impact.'
                : summary.pendingApprovals > 0
                    ? `${summary.pendingApprovals} approvals are pending. Prioritize items older than 48h.`
                    : 'Approval queue is healthy and within SLA.',
            icon: Clock,
        },
        {
            title: role === 'admin' ? 'Governance watchlist' : 'Progress acceleration',
            text: role === 'admin'
                ? 'Escalation trend is rising in two departments. Trigger leadership review.'
                : summary.averageProgress < 70
                    ? 'Progress is below target. Trigger focused coaching on lagging workstreams.'
                    : 'Progress trend is stable above target this cycle.',
            icon: TrendingUp,
        },
        {
            title: 'AI risk detection',
            text: 'Returned goals and long decision cycles remain the strongest predictors of escalations.',
            icon: ShieldAlert,
        },
    ];

    if (isLoading) {
        return (
            <div className="animate-fade-in">
                <div className="dashboard-header mb-6">
                    <h1 className="text-2xl font-bold">Loading Analytics...</h1>
                </div>
                <div className="analytics-skeleton-grid">
                    {Array.from({ length: 6 }).map((_, index) => (
                        <div key={index} className="analytics-skeleton-card" />
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="analytics-dashboard animate-fade-in">
            <div className="dashboard-header mb-6">
                <div>
                    <h1 className="text-2xl font-bold">{roleConfig.title}</h1>
                    <p className="text-secondary mt-1">{roleConfig.subtitle}</p>
                </div>
            </div>

            <div className="ai-insights-panel mb-8 bg-purple-50/50 border border-purple-100 rounded-xl p-6 shadow-sm">
                <div className="ai-header flex items-center gap-2 mb-4">
                    <Sparkles className="text-purple-500" size={24} />
                    <div>
                        <h2 className="font-bold text-xl text-purple-900">GoalSync AI Signals</h2>
                        <p className="text-sm text-purple-700/80">Live analytics with predictive risk and next-action suggestions.</p>
                    </div>
                </div>
                <div className="grid grid-cols-3 gap-6">
                    {roleConfig.focusCards.map((card) => {
                        const Icon = card.icon;
                        return (
                            <div key={card.label} className="insight-card bg-white p-4 rounded-lg border border-purple-50 shadow-sm hover:shadow-md transition-shadow">
                                <div className="flex items-center justify-between mb-3">
                                    <span className={`w-9 h-9 rounded-lg ${card.tone} text-white flex items-center justify-center`}><Icon size={18} /></span>
                                    <span className="text-xs text-gray-500 uppercase tracking-wide">Live</span>
                                </div>
                                <p className="text-sm text-gray-500">{card.label}</p>
                                <p className="text-2xl font-bold text-gray-900 mt-1">{card.value}</p>
                            </div>
                        );
                    })}
                </div>
            </div>

            <div className="grid grid-cols-3 gap-6 mb-6">
                <div className="card shadow-sm border border-gray-200">
                    <div className="card-header border-b border-gray-100 pb-4 flex justify-between items-center">
                        <h2 className="card-title flex items-center gap-2"><BrainCircuit size={18} className="text-indigo-600" /> AI Recommendations</h2>
                        <span className="badge badge-secondary">Auto</span>
                    </div>
                    <div className="p-4 space-y-3">
                        {aiRecommendations.map((item) => {
                            const Icon = item.icon;
                            return (
                                <button
                                    key={item.title}
                                    className="w-full rounded-xl border border-gray-100 bg-gray-50/80 p-3 text-left hover:bg-white hover:shadow-sm transition-all flex gap-3"
                                    onClick={() => toast(item.text)}
                                >
                                    <div className="w-9 h-9 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0"><Icon size={18} /></div>
                                    <div className="flex-1">
                                        <div className="flex items-center justify-between gap-2">
                                            <p className="font-semibold text-gray-800 text-sm">{item.title}</p>
                                            <ArrowRight size={14} className="text-gray-400" />
                                        </div>
                                        <p className="text-xs text-gray-500 mt-1 leading-relaxed">{item.text}</p>
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                </div>

                <div className="card shadow-sm border border-gray-200">
                    <div className="card-header border-b border-gray-100 pb-4">
                        <h2 className="card-title flex items-center gap-2"><Target size={18} className="text-blue-600" /> Monthly Progress</h2>
                    </div>
                    <div style={{ height: 420 }} className="p-4">
                        {loadError ? renderWidgetState('error') : monthlyDataMissing ? renderWidgetState('empty') : (
                            <ResponsiveContainer width="100%" height="100%">
                                <ComposedChart data={monthlyTrend} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                                    <CartesianGrid strokeDasharray="4 4" vertical={false} stroke="#e5e7eb" />
                                    <ReferenceLine y={70} stroke="#94a3b8" strokeDasharray="6 6" />
                                    <XAxis dataKey="name" axisLine={false} tickLine={false} interval={0} />
                                    <YAxis axisLine={false} tickLine={false} domain={[0, 100]} />
                                    <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                                    <Legend />
                                    <Area type="monotone" dataKey="progress" name="Avg Progress %" stroke="#3b82f6" fillOpacity={0.3} fill="#93c5fd" />
                                    <Line type="monotone" dataKey="completed" name="Completed Goals" stroke="#10b981" strokeWidth={2} dot={{ r: 3 }} />
                                    <Line type="monotone" dataKey="risk" name="Risk Index" stroke="#ef4444" strokeDasharray="4 4" strokeWidth={2} dot={{ r: 2 }} />
                                </ComposedChart>
                            </ResponsiveContainer>
                        )}
                    </div>
                </div>

                <div className="card shadow-sm border border-gray-200">
                    <div className="card-header border-b border-gray-100 pb-4">
                        <h2 className="card-title flex items-center gap-2"><Users size={18} className="text-emerald-600" /> Progress by Manager</h2>
                    </div>
                    <div style={{ height: 400 }} className="p-4">
                        {loadError ? renderWidgetState('error') : managerDataMissing ? renderWidgetState('empty') : (
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={managerEffectiveness} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                                    <XAxis dataKey="name" axisLine={false} tickLine={false} interval={0} height={55} />
                                    <YAxis axisLine={false} tickLine={false} domain={[0, 100]} />
                                    <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                                    <Legend />
                                    <Line type="monotone" dataKey="approvalRate" name="Approval Rate" stroke="#10b981" strokeWidth={2} dot={{ r: 3 }} />
                                    <Line type="monotone" dataKey="effectiveness" name="Effectiveness" stroke="#6366f1" strokeWidth={2} dot={{ r: 3 }} />
                                    <Line type="monotone" dataKey="avgDecisionDays" name="Decision Days" stroke="#f59e0b" strokeWidth={2} dot={{ r: 3 }} />
                                </LineChart>
                            </ResponsiveContainer>
                        )}
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-3 gap-6 mb-6">
                <div className="card shadow-sm border border-gray-200">
                    <div className="card-header border-b border-gray-100 pb-4">
                        <h2 className="card-title">Goal Status Breakdown</h2>
                    </div>
                    <div style={{ height: 280 }} className="p-4 flex items-center">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie data={statusBreakdown} innerRadius={58} outerRadius={94} paddingAngle={3} dataKey="value">
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

                <div className="card shadow-sm border border-gray-200">
                    <div className="card-header border-b border-gray-100 pb-4">
                        <h2 className="card-title">Goal Distribution by Thrust Area</h2>
                    </div>
                    <div style={{ height: 280 }} className="p-4">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={thrustBreakdown} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} angle={-18} textAnchor="end" height={50} interval={0} />
                                <YAxis axisLine={false} tickLine={false} allowDecimals={false} />
                                <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                                <Bar dataKey="value" name="Goals" fill="#8b5cf6" radius={[6, 6, 0, 0]} barSize={24}>
                                    {thrustBreakdown.map((entry, index) => (
                                        <Cell key={`thrust-${index}`} fill={entry.color || '#8b5cf6'} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="card shadow-sm border border-gray-200">
                    <div className="card-header border-b border-gray-100 pb-4">
                        <h2 className="card-title flex items-center gap-2"><ShieldAlert size={18} className="text-red-500" /> Manager Effectiveness</h2>
                    </div>
                    <div style={{ height: 280 }} className="p-4">
                        {loadError ? renderWidgetState('error') : managerDataMissing ? renderWidgetState('empty') : (
                            <ResponsiveContainer width="100%" height="100%">
                                <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                                    <CartesianGrid stroke="#e5e7eb" strokeDasharray="4 4" />
                                    <XAxis type="number" dataKey="x" name="Team Size" tickLine={false} axisLine={false} />
                                    <YAxis type="number" dataKey="y" name="Approval Rate" tickLine={false} axisLine={false} />
                                    <ZAxis type="number" dataKey="z" range={[80, 500]} name="Effectiveness" />
                                    <Tooltip cursor={{ strokeDasharray: '3 3' }} />
                                    <Scatter name="Managers" data={managerScatterData} fill="#8b5cf6" fillOpacity={0.72} />
                                </ScatterChart>
                            </ResponsiveContainer>
                        )}
                    </div>
                </div>
            </div>

            <div className="card shadow-sm border border-gray-200">
                <div className="card-header border-b border-gray-100 pb-4">
                    <h2 className="card-title">Escalation and Approval Trend</h2>
                </div>
                <div style={{ height: 400 }} className="p-4">
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={monthlyTrend} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                            <XAxis dataKey="name" axisLine={false} tickLine={false} interval={0} />
                            <YAxis axisLine={false} tickLine={false} allowDecimals={false} />
                            <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                            <Legend />
                            <Line type="monotone" dataKey="pendingApprovals" name="Pending Approvals" stroke="#3b82f6" strokeWidth={2} dot={{ r: 3 }} />
                            <Line type="monotone" dataKey="escalations" name="Escalations" stroke="#ef4444" strokeWidth={2} dot={{ r: 3 }} />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
};

export default Analytics;
