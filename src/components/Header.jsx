import { useState, useRef, useEffect } from 'react';
import { Bell, Search, Menu, UserCircle, CheckCircle, ShieldAlert, Target, Clock, Settings, LogOut, MessageSquare } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import './Header.css';

const NOTIFICATIONS = [
  { id: 1, type: 'approval', title: 'Goal Approved', message: 'Your Q3 Sales Goal has been approved.', time: '10m ago', read: false, icon: CheckCircle, color: 'text-green-500', bg: 'bg-green-50' },
  { id: 2, type: 'escalation', title: 'Escalation Triggered', message: 'Jessica Alba is 5 days overdue.', time: '1h ago', read: false, icon: ShieldAlert, color: 'text-red-500', bg: 'bg-red-50' },
  { id: 3, type: 'reminder', title: 'Check-in Overdue', message: 'Please submit your Q3 check-in.', time: '1d ago', read: true, icon: Clock, color: 'text-yellow-500', bg: 'bg-yellow-50' },
  { id: 4, type: 'shared', title: 'Shared Goal Updated', message: 'Department Revenue KPI was synced.', time: '2d ago', read: true, icon: Target, color: 'text-blue-500', bg: 'bg-blue-50' }
];

const SEARCH_RESULTS = [
  { type: 'Employee', title: 'Sarah Jenkins', subtitle: 'Sales Rep' },
  { type: 'Goal', title: 'Increase Q3 Sales Revenue', subtitle: 'Revenue Growth' },
  { type: 'Report', title: 'Q2 Completion Report', subtitle: 'Generated 2 days ago' },
  { type: 'Shared KPI', title: 'Reduce Department Churn', subtitle: 'Assigned to 5 employees' },
];

const Header = () => {
  const [showNotifications, setShowNotifications] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [notifications, setNotifications] = useState(NOTIFICATIONS);
  const [teamsEnabled, setTeamsEnabled] = useState(true);
  
  const location = useLocation();
  const navigate = useNavigate();
  const searchRef = useRef(null);
  const notifRef = useRef(null);
  const profileRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowSearch(false);
      }
      if (notifRef.current && !notifRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setShowProfile(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getRole = () => {
    if (location.pathname.includes('/employee')) return 'Employee';
    if (location.pathname.includes('/manager')) return 'Manager';
    if (location.pathname.includes('/admin')) return 'Admin';
    return 'User';
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  const markAllRead = () => {
    setNotifications(notifications.map(n => ({ ...n, read: true })));
  };

  const handleSignOut = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('currentUser');
    localStorage.removeItem('userRole');
    navigate('/login');
  };

  return (
    <header className="header relative z-40 bg-white border-b border-gray-200">
      <div className="header-left">
        <button
          className="icon-btn mobile-menu hover:bg-gray-100 rounded-full p-2 transition-colors"
          onClick={() => toast('Sidebar is already visible on this screen')}
        >
          <Menu size={20} className="text-gray-600" />
        </button>
        <div className="search-bar relative" ref={searchRef}>
          <Search size={16} className="search-icon text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
          <input 
            type="text" 
            placeholder="Search goals, users, or reports..." 
            className="search-input w-96 pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setShowSearch(e.target.value.length > 0);
            }}
            onFocus={() => {
              if (searchQuery.length > 0) setShowSearch(true);
            }}
          />
          
          {showSearch && (
            <div className="absolute top-full left-0 mt-2 w-full bg-white border border-gray-200 rounded-lg shadow-xl overflow-hidden animate-fade-in z-50">
              <div className="p-2 border-b border-gray-100 bg-gray-50 text-xs font-semibold text-gray-500 uppercase">
                Quick Results
              </div>
              {SEARCH_RESULTS.filter(r => r.title.toLowerCase().includes(searchQuery.toLowerCase())).length > 0 ? (
                <div className="max-h-64 overflow-y-auto">
                  {SEARCH_RESULTS.filter(r => r.title.toLowerCase().includes(searchQuery.toLowerCase())).map((result, idx) => (
                    <div key={idx} className="p-3 hover:bg-gray-50 cursor-pointer border-b border-gray-50 last:border-0 flex items-center justify-between group transition-colors">
                      <div>
                        <div className="font-semibold text-gray-800 group-hover:text-blue-600 transition-colors">{result.title}</div>
                        <div className="text-xs text-gray-500">{result.subtitle}</div>
                      </div>
                      <span className="badge badge-secondary text-xs">{result.type}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-6 text-center text-gray-500">
                  <Search size={24} className="mx-auto mb-2 text-gray-300" />
                  <p>No results found for "{searchQuery}"</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
      
      <div className="header-right flex items-center gap-4">
        <div className="relative" ref={notifRef}>
          <button 
            className="icon-btn notifications-btn relative hover:bg-gray-100 rounded-full p-2 transition-colors"
            onClick={() => setShowNotifications(!showNotifications)}
          >
            <Bell size={20} className="text-gray-600" />
            {unreadCount > 0 && (
              <span className="absolute top-0 right-0 w-4 h-4 bg-red-500 text-white text-[10px] font-bold flex items-center justify-center rounded-full border border-white">
                {unreadCount}
              </span>
            )}
          </button>

          {showNotifications && (
            <div className="absolute top-full right-0 mt-2 w-80 bg-white border border-gray-200 rounded-xl shadow-2xl overflow-hidden animate-fade-in z-50">
              <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                <h3 className="font-bold text-gray-800">Notifications</h3>
                {unreadCount > 0 && (
                  <button className="text-xs text-blue-600 font-medium hover:text-blue-800 transition-colors" onClick={markAllRead}>
                    Mark all read
                  </button>
                )}
              </div>
              
              <div className="max-h-[400px] overflow-y-auto">
                {notifications.length > 0 ? (
                  notifications.map(notif => {
                    const Icon = notif.icon;
                    return (
                      <div key={notif.id} className={`p-4 border-b border-gray-50 hover:bg-gray-50 cursor-pointer transition-colors flex gap-3 ${!notif.read ? 'bg-blue-50/30' : ''}`}>
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${notif.bg} ${notif.color}`}>
                          <Icon size={18} />
                        </div>
                        <div className="flex-1">
                          <div className="flex justify-between items-start mb-1">
                            <h4 className={`text-sm ${!notif.read ? 'font-bold text-gray-900' : 'font-medium text-gray-700'}`}>{notif.title}</h4>
                            <span className="text-[10px] text-gray-400 whitespace-nowrap">{notif.time}</span>
                          </div>
                          <p className="text-xs text-gray-600">{notif.message}</p>
                        </div>
                        {!notif.read && <div className="w-2 h-2 bg-blue-500 rounded-full self-center"></div>}
                      </div>
                    )
                  })
                ) : (
                  <div className="p-8 text-center text-gray-500 flex flex-col items-center">
                    <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-3">
                      <Bell size={24} className="text-gray-300" />
                    </div>
                    <p className="font-medium">All caught up!</p>
                    <p className="text-xs text-gray-400 mt-1">No new notifications.</p>
                  </div>
                )}
              </div>
              
              {notifications.length > 0 && (
                <div className="p-3 border-t border-gray-100 text-center bg-gray-50">
                  <button
                    className="text-xs font-semibold text-blue-600 hover:text-blue-800 transition-colors"
                    onClick={() => {
                      setShowNotifications(false);
                      const role = localStorage.getItem('userRole');
                      navigate(role === 'admin' ? '/admin#audit' : role === 'manager' ? '/manager#approvals' : '/employee#goals');
                    }}
                  >
                    View All Activity
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
        
        <div className="relative" ref={profileRef}>
          <div 
            className="user-profile flex items-center gap-3 cursor-pointer hover:bg-gray-50 p-1.5 rounded-lg transition-colors"
            onClick={() => setShowProfile(!showProfile)}
          >
            <div className="user-info text-right">
              <div className="user-name font-semibold text-sm text-gray-800">Demo {getRole()}</div>
              <div className="user-role text-xs text-gray-500 uppercase tracking-wide">{getRole()} Role</div>
            </div>
            <div className="avatar w-10 h-10 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center">
              <UserCircle size={24} />
            </div>
          </div>
          
          {showProfile && (
            <div className="absolute top-full right-0 mt-2 w-64 bg-white border border-gray-200 rounded-xl shadow-2xl overflow-hidden animate-fade-in z-50">
              <div className="p-4 border-b border-gray-100 bg-gray-50">
                <p className="font-bold text-gray-800">Demo {getRole()}</p>
                <p className="text-sm text-gray-500">demo.{getRole().toLowerCase()}@company.com</p>
                <span className="badge badge-primary text-xs mt-2 inline-flex items-center gap-1">Entra ID Connected</span>
              </div>
              
              <div className="p-2 border-b border-gray-100">
                <div className="p-2 flex items-center justify-between hover:bg-gray-50 rounded cursor-pointer transition-colors">
                   <div className="flex items-center gap-2 text-sm text-gray-700">
                     <MessageSquare size={16} className="text-blue-600" />
                     MS Teams Notifications
                   </div>
                   <div 
                     className={`w-8 h-4 rounded-full relative cursor-pointer transition-colors ${teamsEnabled ? 'bg-blue-500' : 'bg-gray-300'}`}
                     onClick={(e) => { e.stopPropagation(); setTeamsEnabled(!teamsEnabled); }}
                   >
                     <div className={`absolute top-0.5 w-3 h-3 bg-white rounded-full transition-all ${teamsEnabled ? 'left-4' : 'left-0.5'}`}></div>
                   </div>
                </div>
                <div className="p-2 flex items-center gap-2 text-sm text-gray-700 hover:bg-gray-50 rounded cursor-pointer transition-colors">
                   <Settings size={16} className="text-gray-400" />
                   Account Settings
                </div>
              </div>
              
              <div className="p-2">
                <button onClick={handleSignOut} className="w-full p-2 flex items-center gap-2 text-sm text-red-600 hover:bg-red-50 rounded cursor-pointer transition-colors">
                   <LogOut size={16} />
                   Sign Out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
