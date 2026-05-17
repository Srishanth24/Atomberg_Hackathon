import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Target, 
  CheckSquare, 
  Bell, 
  User, 
  Users, 
  CheckCircle, 
  BarChart2, 
  Settings, 
  ShieldAlert, 
  FileText,
  Network
} from 'lucide-react';
import './Sidebar.css';

const Sidebar = () => {
  const location = useLocation();
  const path = location.pathname;
  const fullPath = location.pathname + location.hash;

  let links = [];

  if (path.includes('/employee')) {
    links = [
      { name: 'Dashboard', path: '/employee', icon: LayoutDashboard },
      { name: 'My Goals', path: '/employee#goals', icon: Target },
      { name: 'Quarterly Check-ins', path: '/employee#checkins', icon: CheckSquare },
      { name: 'Analytics', path: '/analytics', icon: BarChart2 },
    ];
  } else if (path.includes('/manager')) {
    links = [
      { name: 'Team Overview', path: '/manager', icon: Users },
      { name: 'Approvals', path: '/manager#approvals', icon: CheckCircle },
      { name: 'Shared Goals', path: '/manager#shared', icon: Target },
      { name: 'Analytics', path: '/analytics', icon: BarChart2 },
    ];
  } else if (path.includes('/admin')) {
    links = [
      { name: 'System Overview', path: '/admin', icon: LayoutDashboard },
      { name: 'Audit Trail', path: '/admin#audit', icon: FileText },
      { name: 'Reports Builder', path: '/admin#reports', icon: BarChart2 },
      { name: 'Escalations', path: '/admin#escalations', icon: ShieldAlert },
      { name: 'Analytics', path: '/analytics', icon: BarChart2 },
    ];
  } else if (path.includes('/analytics')) {
     links = [
      { name: 'Back to Dashboard', path: '/employee', icon: LayoutDashboard },
      { name: 'Analytics', path: '/analytics', icon: BarChart2 },
     ];
  } else {
    // default
    links = [
      { name: 'Dashboard', path: '/employee', icon: LayoutDashboard },
    ];
  }

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <div className="logo-container">
          <Target className="logo-icon" size={28} />
          <span className="logo-text">GoalSync AI</span>
        </div>
      </div>
      
      <nav className="sidebar-nav">
        <div className="nav-group">
          <div className="nav-group-label">Menu</div>
          {links.map((link, index) => (
            <Link 
              key={index} 
              to={link.path} 
              className={`nav-link ${fullPath === link.path ? 'active' : ''}`}
            >
              <link.icon size={18} />
              <span>{link.name}</span>
            </Link>
          ))}
        </div>
      </nav>

      <div className="sidebar-footer">
        <Link to="/login" className="nav-link logout-link">
          <User size={18} />
          <span>Switch User</span>
        </Link>
      </div>
    </aside>
  );
};

export default Sidebar;
