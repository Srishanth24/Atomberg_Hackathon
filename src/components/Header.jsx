import { Bell, Search, Menu, UserCircle } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import './Header.css';

const Header = () => {
  const location = useLocation();
  
  // Determine role from path for demo display purposes
  const getRole = () => {
    if (location.pathname.includes('/employee')) return 'Employee';
    if (location.pathname.includes('/manager')) return 'Manager';
    if (location.pathname.includes('/admin')) return 'Admin';
    return 'User';
  };

  return (
    <header className="header">
      <div className="header-left">
        <button className="icon-btn mobile-menu">
          <Menu size={20} />
        </button>
        <div className="search-bar">
          <Search size={16} className="search-icon" />
          <input type="text" placeholder="Search goals, users, or reports..." className="search-input" />
        </div>
      </div>
      
      <div className="header-right">
        <button className="icon-btn notifications-btn">
          <Bell size={20} />
          <span className="notification-badge">3</span>
        </button>
        
        <div className="user-profile">
          <div className="user-info">
            <span className="user-name">Demo {getRole()}</span>
            <span className="user-role">{getRole()} Role</span>
          </div>
          <div className="avatar">
            <UserCircle size={32} />
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
