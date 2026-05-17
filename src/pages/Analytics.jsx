import { Sparkles, TrendingUp, AlertTriangle, Trophy, Clock, ShieldAlert } from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, Legend, PieChart, Pie, Cell, ScatterChart, Scatter, ZAxis, LineChart, Line
} from 'recharts';
import './Analytics.css';

const TREND_DATA = [
  { name: 'Jan', sales: 40, engineering: 24, marketing: 24 },
  { name: 'Feb', sales: 30, engineering: 13, marketing: 22 },
  { name: 'Mar', sales: 20, engineering: 58, marketing: 22 },
  { name: 'Apr', sales: 27, engineering: 39, marketing: 20 },
  { name: 'May', sales: 18, engineering: 48, marketing: 21 },
  { name: 'Jun', sales: 23, engineering: 38, marketing: 25 },
  { name: 'Jul', sales: 34, engineering: 43, marketing: 21 },
];

const DISTRIBUTION_DATA = [
  { name: 'Revenue', value: 400, color: '#3b82f6' },
  { name: 'Product', value: 300, color: '#8b5cf6' },
  { name: 'Customer', value: 300, color: '#10b981' },
  { name: 'Ops', value: 200, color: '#f59e0b' },
];

const LEADERBOARD = [
  { rank: 1, dept: 'Engineering', score: 92, trend: '+5%' },
  { rank: 2, dept: 'Customer Success', score: 88, trend: '+2%' },
  { rank: 3, dept: 'Sales', score: 85, trend: '+8%' },
  { rank: 4, dept: 'Marketing', score: 78, trend: '-3%' },
];

const HEATMAP_DATA = [
  { x: 10, y: 30, z: 200 },
  { x: 30, y: 200, z: 260 },
  { x: 45, y: 100, z: 400 },
  { x: 50, y: 400, z: 280 },
  { x: 70, y: 150, z: 500 },
  { x: 100, y: 250, z: 200 },
];

const DELAY_DATA = [
  { name: 'Manager A', delay: 4.2 },
  { name: 'Manager B', delay: 2.1 },
  { name: 'Manager C', delay: 1.5 },
  { name: 'Manager D', delay: 0.8 },
];

const ESCALATION_DATA = [
  { month: 'Jan', lvl1: 10, lvl2: 4, lvl3: 1 },
  { month: 'Feb', lvl1: 15, lvl2: 6, lvl3: 2 },
  { month: 'Mar', lvl1: 8, lvl2: 2, lvl3: 0 },
  { month: 'Apr', lvl1: 12, lvl2: 5, lvl3: 1 },
];

const Analytics = () => {
  return (
    <div className="animate-fade-in">
      <div className="dashboard-header mb-6">
        <div>
          <h1 className="text-2xl font-bold">Enterprise Analytics Module</h1>
          <p className="text-secondary mt-1">Deep dive into organizational performance metrics and manager effectiveness.</p>
        </div>
      </div>

      <div className="ai-insights-panel mb-8 bg-purple-50/50 border border-purple-100 rounded-xl p-6 shadow-sm">
        <div className="ai-header flex items-center gap-2 mb-4">
          <Sparkles className="text-purple-500" size={24} />
          <h2 className="font-bold text-xl text-purple-900">AI Performance Insights</h2>
        </div>
        <div className="grid grid-cols-4 gap-6">
          <div className="insight-card bg-white p-4 rounded-lg border border-purple-50 shadow-sm flex items-start gap-3 hover:shadow-md transition-shadow">
            <div className="insight-icon bg-green-100 text-green-600 p-2 rounded-full shrink-0"><TrendingUp size={20}/></div>
            <p className="text-sm text-gray-700"><strong>Sales goals</strong> improved by 18% QoQ, driven by the new product launch.</p>
          </div>
          <div className="insight-card bg-white p-4 rounded-lg border border-purple-50 shadow-sm flex items-start gap-3 hover:shadow-md transition-shadow">
            <div className="insight-icon bg-red-100 text-red-600 p-2 rounded-full shrink-0"><AlertTriangle size={20}/></div>
            <p className="text-sm text-gray-700"><strong>3 employees</strong> in Marketing are currently behind schedule on Q3 OKRs.</p>
          </div>
          <div className="insight-card bg-white p-4 rounded-lg border border-purple-50 shadow-sm flex items-start gap-3 hover:shadow-md transition-shadow">
            <div className="insight-icon bg-yellow-100 text-yellow-600 p-2 rounded-full shrink-0"><Clock size={20}/></div>
            <p className="text-sm text-gray-700"><strong>Manager A</strong> has the highest approval delays (avg 4.2 days).</p>
          </div>
          <div className="insight-card bg-white p-4 rounded-lg border border-purple-50 shadow-sm flex items-start gap-3 hover:shadow-md transition-shadow">
            <div className="insight-icon bg-purple-100 text-purple-600 p-2 rounded-full shrink-0"><Trophy size={20}/></div>
            <p className="text-sm text-gray-700"><strong>Engineering</strong> is the top-performing department this quarter at 92% completion.</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6 mb-6">
        <div className="card shadow-sm border border-gray-200">
          <div className="card-header border-b border-gray-100 pb-4">
            <h2 className="card-title">Quarterly Completion Trends</h2>
          </div>
          <div style={{ height: 300 }} className="p-4">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={TREND_DATA} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorEng" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="name" axisLine={false} tickLine={false} />
                <YAxis axisLine={false} tickLine={false} />
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                <Legend />
                <Area type="monotone" dataKey="sales" name="Sales Dept" stroke="#3b82f6" fillOpacity={1} fill="url(#colorSales)" />
                <Area type="monotone" dataKey="engineering" name="Engineering Dept" stroke="#8b5cf6" fillOpacity={1} fill="url(#colorEng)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card shadow-sm border border-gray-200">
          <div className="card-header border-b border-gray-100 pb-4">
            <h2 className="card-title">Team Performance Comparison</h2>
          </div>
          <div style={{ height: 300 }} className="p-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={TREND_DATA} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} />
                <YAxis axisLine={false} tickLine={false} />
                <Tooltip cursor={{fill: 'rgba(0,0,0,0.05)'}} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                <Legend />
                <Bar dataKey="sales" name="Sales" stackId="a" fill="#3b82f6" />
                <Bar dataKey="engineering" name="Engineering" stackId="a" fill="#8b5cf6" />
                <Bar dataKey="marketing" name="Marketing" stackId="a" fill="#10b981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6 mb-6">
        <div className="card shadow-sm border border-gray-200">
          <div className="card-header border-b border-gray-100 pb-4">
            <h2 className="card-title">Approval Delay Analytics</h2>
          </div>
          <div style={{ height: 250 }} className="p-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart layout="vertical" data={DELAY_DATA} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f0f0f0" />
                <XAxis type="number" name="Days" />
                <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} width={80} />
                <Tooltip cursor={{fill: 'rgba(0,0,0,0.05)'}} />
                <Bar dataKey="delay" name="Avg Delay (Days)" fill="#f59e0b" radius={[0, 4, 4, 0]} barSize={20} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card shadow-sm border border-gray-200">
          <div className="card-header border-b border-gray-100 pb-4">
            <h2 className="card-title flex items-center gap-2"><ShieldAlert size={18} className="text-red-500"/> Escalation Analytics</h2>
          </div>
          <div style={{ height: 250 }} className="p-4">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={ESCALATION_DATA} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                <XAxis dataKey="month" axisLine={false} tickLine={false} />
                <YAxis axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                <Legend />
                <Line type="monotone" dataKey="lvl1" name="Level 1" stroke="#3b82f6" strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                <Line type="monotone" dataKey="lvl2" name="Level 2" stroke="#f59e0b" strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                <Line type="monotone" dataKey="lvl3" name="Level 3" stroke="#ef4444" strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
        
        <div className="card shadow-sm border border-gray-200">
          <div className="card-header border-b border-gray-100 pb-4">
            <h2 className="card-title">Manager Effectiveness (Heatmap)</h2>
          </div>
          <div style={{ height: 250 }} className="p-4 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                <CartesianGrid stroke="#f0f0f0" />
                <XAxis type="number" dataKey="x" name="Team Size" tickLine={false} axisLine={false} />
                <YAxis type="number" dataKey="y" name="Goals Comp." tickLine={false} axisLine={false} />
                <ZAxis type="number" dataKey="z" range={[100, 500]} name="Effectiveness" />
                <Tooltip cursor={{ strokeDasharray: '3 3' }} />
                <Scatter name="Managers" data={HEATMAP_DATA} fill="#8b5cf6" fillOpacity={0.7} />
              </ScatterChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div className="card shadow-sm border border-gray-200">
          <div className="card-header border-b border-gray-100 pb-4">
            <h2 className="card-title">Goal Distribution</h2>
          </div>
          <div style={{ height: 300 }} className="p-4 flex items-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={DISTRIBUTION_DATA}
                  innerRadius={80}
                  outerRadius={110}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {DISTRIBUTION_DATA.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                <Legend verticalAlign="middle" align="right" layout="vertical" iconType="circle" />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card shadow-sm border border-gray-200">
          <div className="card-header border-b border-gray-100 pb-4">
            <h2 className="card-title">Dept Leaderboard</h2>
          </div>
          <div className="leaderboard p-4 space-y-4">
            {LEADERBOARD.map(item => (
              <div key={item.rank} className="leaderboard-item flex items-center gap-4 bg-gray-50 p-3 rounded-lg border border-gray-100 hover:shadow-sm transition-shadow">
                <div className={`rank-badge w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${item.rank === 1 ? 'bg-yellow-100 text-yellow-700' : item.rank === 2 ? 'bg-gray-200 text-gray-700' : item.rank === 3 ? 'bg-orange-100 text-orange-700' : 'bg-blue-50 text-blue-600'}`}>
                  #{item.rank}
                </div>
                <div className="flex-1">
                  <div className="font-bold text-gray-800">{item.dept}</div>
                  <div className="score-bar-bg mt-2 h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div className="score-bar-fill h-full bg-blue-500" style={{ width: `${item.score}%` }}></div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-lg text-gray-800">{item.score}%</div>
                  <div className={`text-xs font-medium flex items-center justify-end gap-1 ${item.trend.startsWith('+') ? 'text-green-600' : 'text-red-600'}`}>
                    <TrendingUp size={12} className={item.trend.startsWith('-') ? 'rotate-180 transform' : ''}/> {item.trend}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;
