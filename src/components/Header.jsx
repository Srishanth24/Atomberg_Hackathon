import { useState, useRef, useEffect } from 'react';
import { Bell, Search, Menu, UserCircle, CheckCircle, ShieldAlert, Target, Clock, Settings, LogOut, MessageSquare, Trash2, ExternalLink } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { apiClient } from '../services/apiClient.js';
import { DEPARTMENTS, EMPLOYEES, GOALS, REALISTIC_GOALS } from '../data/mockData.js';
import './Header.css';

const NOTIFICATIONS = [
  { id: 1, type: 'approval', title: 'Goal Approved', message: 'Your Q3 Sales Goal has been approved.', time: '10m ago', read: false, icon: CheckCircle, color: 'text-green-500', bg: 'bg-green-50' },
  { id: 2, type: 'escalation', title: 'Escalation Triggered', message: 'Jessica Alba is 5 days overdue.', time: '1h ago', read: false, icon: ShieldAlert, color: 'text-red-500', bg: 'bg-red-50' },
  { id: 3, type: 'reminder', title: 'Check-in Overdue', message: 'Please submit your Q3 check-in.', time: '1d ago', read: true, icon: Clock, color: 'text-yellow-500', bg: 'bg-yellow-50' },
  { id: 4, type: 'shared', title: 'Shared Goal Updated', message: 'Department Revenue KPI was synced.', time: '2d ago', read: true, icon: Target, color: 'text-blue-500', bg: 'bg-blue-50' }
];

const FALLBACK_NOTIFICATIONS = NOTIFICATIONS.map((notification, index) => ({
  id: notification.id,
  type: notification.type === 'shared' ? 'shared_update' : notification.type,
  title: notification.title,
  message: notification.message,
  isRead: notification.read,
  createdAt: new Date(Date.now() - (index + 1) * 1000 * 60 * 45).toISOString(),
  linkData: notification.type === 'approval'
    ? '/manager#approvals'
    : notification.type === 'escalation'
      ? '/admin#escalations'
      : notification.type === 'reminder'
        ? '/employee#checkins'
        : '/analytics',
}));

const Header = () => {
  const [showNotifications, setShowNotifications] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [notifications, setNotifications] = useState([]);
  const [loadingNotifications, setLoadingNotifications] = useState(false);
  const [teamsEnabled, setTeamsEnabled] = useState(true);
  const [notificationActionId, setNotificationActionId] = useState(null);
  const [notificationFilter, setNotificationFilter] = useState('all');
  const [clockTick, setClockTick] = useState(new Date('2026-05-19T09:00:00.000Z').getTime());

  const location = useLocation();
  const navigate = useNavigate();
  const searchRef = useRef(null);
  const notifRef = useRef(null);
  const profileRef = useRef(null);

  // Load notifications on mount and periodically
  useEffect(() => {
    const loadNotifications = () => {
      setLoadingNotifications(true);
      apiClient.getNotifications()
        .then(data => {
          const nextNotifications = Array.isArray(data) && data.length ? data : FALLBACK_NOTIFICATIONS;
          setNotifications(nextNotifications);
        })
        .catch(_err => {
          console.error('Failed to load notifications:', _err);
          setNotifications(FALLBACK_NOTIFICATIONS);
        })
        .finally(() => setLoadingNotifications(false));
    };

    loadNotifications();
    const interval = setInterval(loadNotifications, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, []);

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

  useEffect(() => {
    const clockInterval = setInterval(() => setClockTick(Date.now()), 60000);
    return () => clearInterval(clockInterval);
  }, []);

  const getRole = () => {
    if (location.pathname.includes('/employee')) return 'Employee';
    if (location.pathname.includes('/manager')) return 'Manager';
    if (location.pathname.includes('/admin')) return 'Admin';
    return 'User';
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;
  const filteredNotifications = notifications.filter(notification => {
    if (notificationFilter === 'all') return true;
    if (notificationFilter === 'unread') return !notification.isRead;
    return notification.type === notificationFilter;
  });

  const searchRole = location.pathname.includes('/admin') ? 'admin' : location.pathname.includes('/manager') ? 'manager' : 'employee';

  const buildSearchResults = (query) => {
    const normalized = query.trim().toLowerCase();
    const items = [
      ...EMPLOYEES.map(employee => ({
        type: 'Employee',
        title: employee.name,
        subtitle: employee.title,
        route: searchRole === 'manager' ? '/manager#shared' : '/employee#goals',
      })),
      ...GOALS.map(goal => ({
        type: 'Goal',
        title: goal.title,
        subtitle: `${goal.thrustArea} · ${goal.progress}% progress`,
        route: '/employee#goals',
      })),
      ...REALISTIC_GOALS.slice(0, 4).map(goal => ({
        type: 'AI Insight',
        title: `AI review: ${goal.title}`,
        subtitle: `${goal.status} · ${goal.weightage}% weightage`,
        route: '/analytics',
      })),
      ...DEPARTMENTS.slice(0, 3).map(department => ({
        type: 'Department',
        title: department.name,
        subtitle: `${department.employeeCount} employees`,
        route: '/admin',
      })),
      { type: 'Report', title: 'Q3 Completion Report', subtitle: 'Analytics export', route: '/analytics' },
      { type: 'Report', title: 'Audit Trail', subtitle: 'Admin compliance log', route: '/admin#audit' },
      { type: 'Report', title: 'Team Effectiveness', subtitle: 'Manager insights', route: '/analytics' },
      { type: 'AI Insight', title: 'Risk warnings and recommendations', subtitle: 'Predicted delays and next actions', route: '/analytics' },
    ];

    return items.filter(item => {
      if (!normalized) return true;
      return [item.title, item.subtitle, item.type].some(value => value.toLowerCase().includes(normalized));
    });
  };

  const searchResults = buildSearchResults(searchQuery).slice(0, 8);

  const navigateToSearchResult = (result) => {
    if (!result?.route) return;
    setShowSearch(false);
    setSearchQuery('');
    navigate(result.route);
  };

  const handleSearchKeyDown = (event) => {
    if (event.key === 'Enter') {
      const firstResult = searchResults[0];
      if (firstResult) {
        navigateToSearchResult(firstResult);
      }
    }
  };

  const activityReferenceTime = clockTick || new Date('2026-05-19T09:00:00.000Z').getTime();

  const activityFeed = [
    ...notifications.slice(0, 3).map((item) => ({
      id: `notif-${item.id}`,
      title: item.title,
      context: item.message,
      timestamp: item.createdAt,
      severity: item.type === 'escalation' ? 'high' : item.type === 'approval' ? 'medium' : 'low',
    })),
    {
      id: 'system-sync',
      title: 'Shared KPI sync completed',
      context: 'Sales and CS goals aligned with the latest org targets.',
      timestamp: new Date(activityReferenceTime - 1000 * 60 * 8).toISOString(),
      severity: 'low',
    },
    {
      id: 'manager-reminder',
      title: 'Manager reminder triggered',
      context: '2 pending approvals are nearing escalation threshold.',
      timestamp: new Date(activityReferenceTime - 1000 * 60 * 19).toISOString(),
      severity: 'medium',
    },
  ].slice(0, 4);

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'approval': return CheckCircle;
      case 'escalation': return ShieldAlert;
      case 'reminder': return Clock;
      case 'shared_update': return Target;
      default: return Bell;
    }
  };

  const getNotificationColor = (type) => {
    switch (type) {
      case 'approval': return { bg: 'bg-green-50', color: 'text-green-500' };
      case 'escalation': return { bg: 'bg-red-50', color: 'text-red-500' };
      case 'reminder': return { bg: 'bg-yellow-50', color: 'text-yellow-500' };
      case 'shared_update': return { bg: 'bg-blue-50', color: 'text-blue-500' };
      default: return { bg: 'bg-gray-50', color: 'text-gray-500' };
    }
  };

  const formatTime = (timestamp) => {
    if (!timestamp) return 'just now';
    const date = new Date(timestamp);
    const now = new Date(clockTick);
    const diff = now - date;

    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return date.toLocaleDateString();
  };

  const markAllRead = () => {
    apiClient.markAllNotificationsRead()
      .then(() => {
        setNotifications(notifications.map(n => ({ ...n, isRead: true })));
      })
      .catch(_err => toast.error('Failed to mark notifications as read'));
  };

  const openNotificationLink = (notification) => {
    if (!notification.linkData) return;

    const rawLink = notification.linkData;
    let targetPath = rawLink;

    if (typeof rawLink === 'string' && rawLink.trim().startsWith('{')) {
      try {
        const parsed = JSON.parse(rawLink);
        targetPath = parsed.path || parsed.link || parsed.route || rawLink;
      } catch {
        targetPath = rawLink;
      }
    }

    if (typeof targetPath === 'string' && targetPath.startsWith('/')) {
      navigate(targetPath);
    }
  };

  const markNotificationRead = (notificationId) => {
    setNotificationActionId(notificationId);
    apiClient.markNotificationRead(notificationId)
      .then(() => {
        setNotifications(prev => prev.map(notification => (
          notification.id === notificationId ? { ...notification, isRead: true } : notification
        )));
      })
      .catch(() => toast.error('Failed to mark notification as read'))
      .finally(() => setNotificationActionId(null));
  };

  const deleteNotification = (notificationId) => {
    setNotificationActionId(notificationId);
    apiClient.deleteNotification(notificationId)
      .then(() => {
        setNotifications(prev => prev.filter(notification => notification.id !== notificationId));
      })
      .catch(() => toast.error('Failed to delete notification'))
      .finally(() => setNotificationActionId(null));
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
            onKeyDown={handleSearchKeyDown}
            onFocus={() => {
              if (searchQuery.length > 0) setShowSearch(true);
            }}
          />

          {showSearch && (
            <div className="absolute top-full left-0 mt-2 w-full bg-white border border-gray-200 rounded-lg shadow-xl overflow-hidden animate-fade-in z-50">
              <div className="p-3 border-b border-gray-100 bg-gray-50 flex items-center justify-between gap-3">
                <div>
                  <div className="text-xs font-semibold text-gray-500 uppercase">Quick Results</div>
                  <div className="text-[11px] text-gray-400 mt-0.5">Search goals, employees, reports, and AI insights</div>
                </div>
                <span className="badge badge-secondary text-[11px]">{searchResults.length} found</span>
              </div>
              {searchResults.length > 0 ? (
                <div className="max-h-64 overflow-y-auto">
                  {searchResults.map((result, idx) => (
                    <button
                      key={`${result.type}-${idx}`}
                      className="search-result-item w-full text-left p-3 hover:bg-gray-50 cursor-pointer border-b border-gray-50 last:border-0 flex items-center justify-between group transition-colors"
                      onClick={() => navigateToSearchResult(result)}
                    >
                      <div>
                        <div className="font-semibold text-gray-800 group-hover:text-blue-600 transition-colors">{result.title}</div>
                        <div className="text-xs text-gray-500">{result.subtitle}</div>
                      </div>
                      <span className="badge badge-secondary text-xs">{result.type}</span>
                    </button>
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
        {showNotifications && (
          <div className="notif-backdrop" onClick={() => setShowNotifications(false)} aria-hidden="true"></div>
        )}
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
            <div
              className="notification-panel absolute right-0 bg-white border border-gray-200 rounded-xl overflow-hidden animate-fade-in shadow-2xl flex flex-col"
              style={{
                zIndex: 9999,
                backgroundColor: 'white',
                top: '5rem',
                position: 'fixed',
                right: '1.5rem',
                width: '420px',
                maxHeight: 'calc(100vh - 6rem)',
                boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04), 0 0 0 1px rgba(0,0,0,0.05)'
              }}
            >
              <div className="notif-panel-header p-5 border-b border-gray-100 bg-white shrink-0 relative z-10">
                <div className="flex justify-between items-center mb-5">
                  <div>
                    <h3 className="text-xl font-extrabold text-gray-900 tracking-tight">Notification Center</h3>
                    <p className="text-xs text-gray-500 mt-1 uppercase tracking-wider font-medium">Updates & Alerts</p>
                  </div>
                  <div className="bg-blue-600 px-3 py-1 rounded-full shadow-sm">
                    <span className="text-xs font-bold text-white tracking-wide">{unreadCount} New</span>
                  </div>
                </div>
                <div className="flex gap-2 mb-4 overflow-x-auto pb-2 custom-scrollbar-slim no-scrollbar">
                  {['all', 'unread', 'approval', 'escalation', 'reminder', 'shared_update'].map(filterKey => (
                    <button
                      key={filterKey}
                      className={`px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all border uppercase tracking-wider whitespace-nowrap ${notificationFilter === filterKey
                        ? 'bg-blue-600 text-white border-blue-600 shadow-md'
                        : 'bg-white text-gray-400 border-gray-100 hover:border-blue-400 hover:text-blue-600'
                        }`}
                      onClick={() => setNotificationFilter(filterKey)}
                    >
                      {filterKey === 'all' ? 'All' : filterKey === 'shared_update' ? 'Shared' : filterKey.split('_')[0]}
                    </button>
                  ))}
                </div>
                {unreadCount > 0 && (
                  <button
                    className="text-[11px] font-bold text-blue-600 hover:text-blue-700 uppercase tracking-widest flex items-center gap-1.5 transition-colors"
                    onClick={markAllRead}
                  >
                    <div className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-pulse" />
                    Mark all as read
                  </button>
                )}
              </div>

              {/* Scrollable Area */}
              <div className="flex-1 overflow-y-auto bg-white custom-scrollbar-slim" style={{ minHeight: '200px' }}>
                {loadingNotifications ? (
                  <div className="p-6 space-y-4">
                    {Array.from({ length: 4 }).map((_, index) => (
                      <div key={index} className="h-20 bg-gray-50 rounded-xl animate-pulse border border-gray-100" />
                    ))}
                  </div>
                ) : filteredNotifications.length > 0 ? (
                  <div className="notification-list divide-y divide-gray-100 overflow-x-hidden">
                    {filteredNotifications.map(notif => {
                      const Icon = getNotificationIcon(notif.type);
                      const { bg, color } = getNotificationColor(notif.type);
                      return (
                        <div
                          key={notif.id}
                          className={`group p-6 hover:bg-gray-50 cursor-pointer transition-all flex gap-5 relative border-l-4 ${!notif.isRead ? 'bg-blue-50/10 border-l-blue-600' : 'border-l-transparent'}`}
                          onClick={() => {
                            if (!notif.isRead) markNotificationRead(notif.id);
                            openNotificationLink(notif);
                          }}
                        >
                          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-[0_4px_12px_rgba(0,0,0,0.05)] border-2 border-white ${bg} ${color}`}>
                            <Icon size={22} />
                          </div>
                          <div className="flex-1 min-w-0 pr-2">
                            <div className="flex justify-between items-start mb-2 gap-3">
                              <h4 className={`text-[13px] leading-tight flex-1 line-clamp-2 ${!notif.isRead ? 'font-extrabold text-gray-900' : 'font-bold text-gray-700'}`}>{notif.title}</h4>
                              <span className="text-[9px] text-gray-400 font-extrabold uppercase bg-white border border-gray-100 px-1.5 py-0.5 rounded shadow-sm whitespace-nowrap mt-0.5 shrink-0">{formatTime(notif.createdAt)}</span>
                            </div>
                            <p className="text-[12px] text-gray-500 leading-normal mb-5 line-clamp-3 font-medium tracking-tight pr-4">{notif.message}</p>
                            <div className="flex items-center justify-between">
                              {notif.linkData ? (
                                <span className="inline-flex items-center gap-1.5 text-blue-600 font-extrabold text-[9px] uppercase tracking-[0.05em] border border-blue-100 bg-blue-50/50 px-2.5 py-1 rounded-md shadow-sm">
                                  Action Needed
                                </span>
                              ) : <div />}
                              <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-all transform translate-x-2 group-hover:translate-x-0">
                                <button
                                  className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all border border-transparent hover:border-red-100"
                                  onClick={(event) => {
                                    event.stopPropagation();
                                    deleteNotification(notif.id);
                                  }}
                                  title="Delete"
                                >
                                  <Trash2 size={15} />
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="p-12 text-center text-gray-500 flex flex-col items-center justify-center">
                    <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                      <Bell size={32} className="text-gray-300" />
                    </div>
                    <p className="font-bold text-gray-700">No Notifications</p>
                    <p className="text-xs text-gray-400 mt-2">You're all caught up for now.</p>
                  </div>
                )}
              </div>

              {/* Feed & Footer */}
              <div className="mt-auto border-t border-gray-200 bg-white shadow-[0_-4px_12px_rgba(0,0,0,0.03)] shrink-0">
                <div className="px-5 py-3 border-b border-gray-100 flex items-center justify-between bg-gray-50/80">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.4)]" />
                    <h4 className="text-[10px] font-extrabold text-gray-600 uppercase tracking-widest">Live System Feed</h4>
                  </div>
                </div>

                <div className="activity-feed-list max-h-[160px] overflow-y-auto bg-white custom-scrollbar-slim">
                  {activityFeed.map((item) => (
                    <div key={item.id} className="px-6 py-4 hover:bg-gray-50 transition-colors border-b border-gray-50 last:border-0 group">
                      <div className="flex items-start gap-4">
                        <div className={`mt-1.5 w-2.5 h-2.5 rounded-full shrink-0 group-hover:scale-110 transition-transform ${item.severity === 'high' ? 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.4)]' :
                          item.severity === 'medium' ? 'bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.3)]' : 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.3)]'
                          }`} />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-[11px] font-extrabold text-gray-900 truncate uppercase tracking-tight">{item.title}</span>
                            <span className="text-[9px] font-bold text-gray-400 uppercase bg-gray-50 px-1 py-0.5 rounded border border-gray-100 whitespace-nowrap">{formatTime(item.timestamp)}</span>
                          </div>
                          <p className="text-[11px] text-gray-500 leading-normal font-medium">{item.context}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex items-center justify-between bg-gray-50 p-1.5 gap-1.5">
                  <button
                    className="flex-1 py-3 text-[10px] font-extrabold text-blue-600 hover:bg-white transition-all uppercase tracking-widest rounded-lg flex items-center justify-center gap-2 border border-transparent hover:border-blue-100 hover:shadow-sm group"
                    onClick={() => {
                      setShowNotifications(false);
                      const role = localStorage.getItem('userRole');
                      const base = role === 'admin' ? '/admin' : role === 'manager' ? '/manager' : '/employee';
                      navigate(`${base}#audit`);
                    }}
                  >
                    Logs
                    <span className="group-hover:translate-x-1 transition-transform">→</span>
                  </button>
                  <div className="w-px h-6 bg-gray-200" />
                  <button
                    className="flex-1 py-3 text-[10px] font-extrabold text-gray-400 hover:text-gray-700 hover:bg-white transition-all uppercase tracking-widest rounded-lg border border-transparent hover:border-gray-200"
                    onClick={() => setShowNotifications(false)}
                  >
                    Dismiss
                  </button>
                </div>
              </div>
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
