import { Sparkles, TrendingUp, AlertTriangle, Trophy } from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, Legend, PieChart, Pie, Cell, ScatterChart, Scatter, ZAxis
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

// Mock data for heatmap
const HEATMAP_DATA = [
  { x: 10, y: 30, z: 200 },
  { x: 30, y: 200, z: 260 },
  { x: 45, y: 100, z: 400 },
  { x: 50, y: 400, z: 280 },
  { x: 70, y: 150, z: 500 },
  { x: 100, y: 250, z: 200 },
];

const Analytics = () => {
  return (
    <div className="animate-fade-in">
      <div className="dashboard-header mb-6">
        <div>
          <h1 className="text-2xl font-bold">Analytics & AI Insights</h1>
          <p className="text-secondary mt-1">Deep dive into organizational performance metrics.</p>
        </div>
      </div>

      <div className="ai-insights-panel mb-6">
        <div className="ai-header">
          <Sparkles className="text-purple-500" size={20} />
          <h2 className="font-bold text-lg text-purple-900">AI Performance Insights</h2>
        </div>
        <div className="grid grid-cols-4 gap-4 mt-4">
          <div className="insight-card">
            <div className="insight-icon bg-green-100 text-green-600"><TrendingUp size={18}/></div>
            <p><strong>Sales goals</strong> improved by 18% QoQ, driven by the new product launch.</p>
          </div>
          <div className="insight-card">
            <div className="insight-icon bg-red-100 text-red-600"><AlertTriangle size={18}/></div>
            <p><strong>3 employees</strong> in Marketing are currently behind schedule on Q3 OKRs.</p>
          </div>
          <div className="insight-card">
            <div className="insight-icon bg-yellow-100 text-yellow-600"><AlertTriangle size={18}/></div>
            <p><strong>Manager A</strong> has the highest approval delays (avg 4.2 days).</p>
          </div>
          <div className="insight-card">
            <div className="insight-icon bg-purple-100 text-purple-600"><Trophy size={18}/></div>
            <p><strong>Engineering</strong> is the top-performing department this quarter at 92% completion.</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6 mb-6">
        <div className="card">
          <div className="card-header">
            <h2 className="card-title">Quarterly Trend Analysis</h2>
          </div>
          <div style={{ height: 300 }}>
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
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <Tooltip />
                <Area type="monotone" dataKey="sales" stroke="#3b82f6" fillOpacity={1} fill="url(#colorSales)" />
                <Area type="monotone" dataKey="engineering" stroke="#8b5cf6" fillOpacity={1} fill="url(#colorEng)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <h2 className="card-title">Department Comparison</h2>
          </div>
          <div style={{ height: 300 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={TREND_DATA} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" axisLine={false} tickLine={false} />
                <YAxis axisLine={false} tickLine={false} />
                <Tooltip cursor={{fill: 'rgba(0,0,0,0.05)'}} />
                <Legend />
                <Bar dataKey="sales" stackId="a" fill="#3b82f6" />
                <Bar dataKey="engineering" stackId="a" fill="#8b5cf6" />
                <Bar dataKey="marketing" stackId="a" fill="#10b981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6">
        <div className="card">
          <div className="card-header">
            <h2 className="card-title">Goal Distribution</h2>
          </div>
          <div style={{ height: 250 }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={DISTRIBUTION_DATA}
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {DISTRIBUTION_DATA.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <h2 className="card-title">Completion Heatmap (Simulated)</h2>
          </div>
          <div style={{ height: 250 }}>
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                <CartesianGrid />
                <XAxis type="number" dataKey="x" name="Team Size" />
                <YAxis type="number" dataKey="y" name="Goals" />
                <ZAxis type="number" dataKey="z" range={[60, 400]} name="Score" />
                <Tooltip cursor={{ strokeDasharray: '3 3' }} />
                <Scatter name="Teams" data={HEATMAP_DATA} fill="#f59e0b" />
              </ScatterChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <h2 className="card-title">Dept Leaderboard</h2>
          </div>
          <div className="leaderboard">
            {LEADERBOARD.map(item => (
              <div key={item.rank} className="leaderboard-item">
                <div className="rank-badge">#{item.rank}</div>
                <div className="flex-1">
                  <div className="font-bold">{item.dept}</div>
                  <div className="score-bar-bg mt-1">
                    <div className="score-bar-fill" style={{ width: `${item.score}%` }}></div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-bold">{item.score}%</div>
                  <div className={`text-xs ${item.trend.startsWith('+') ? 'text-success' : 'text-danger'}`}>
                    {item.trend}
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
