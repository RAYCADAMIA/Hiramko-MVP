import React, { useState, useRef, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Search, PlusCircle, Menu, X, Package, MessageSquare, User as UserIcon, Bell } from 'lucide-react';
import { getNotifications, markAsRead } from '../services/notifications';
import { User, Notification } from '../types';
import Logo from './Logo';

import { useNotification } from '../contexts/NotificationContext';

interface NavbarProps {
  user: User | null;
  onToggleChat?: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ user, onToggleChat }) => {
  const { showNotification } = useNotification();
  const [isOpen, setIsOpen] = useState(false);
  const [navSearchTerm, setNavSearchTerm] = useState('');
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);

  useEffect(() => {
    const fetchNotifs = async () => {
      if (user) {
        const notifs = await getNotifications(user.id);
        setNotifications(notifs);
      }
    };
    fetchNotifs();
  }, [user]);

  const markAllAsRead = async () => {
    if (!user) return;
    await Promise.all(notifications.filter(n => !n.read).map(n => markAsRead(n.id)));
    const updated = await getNotifications(user.id);
    setNotifications(updated);
  };
  const searchInputRef = useRef<HTMLInputElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);

  const location = useLocation();
  const navigate = useNavigate();

  const isActive = (path: string) => location.pathname === path ? "text-cyan-400 font-semibold drop-shadow-[0_0_5px_rgba(34,211,238,0.5)]" : "text-slate-400 hover:text-cyan-400 transition-colors";

  // Close notification dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setIsNotifOpen(false);
      }
    };

    if (isNotifOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isNotifOpen]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (navSearchTerm.trim()) {
      navigate(`/search?q=${encodeURIComponent(navSearchTerm)}`);
      setNavSearchTerm('');
      setIsOpen(false); // Close mobile menu if open
    }
  };

  const handleAuthAction = (e: React.MouseEvent, path: string) => {
    if (!user) {
      e.preventDefault();
      showNotification({
        title: 'Login Required',
        message: 'You need to log in first to access this feature.',
        type: 'info'
      });
      navigate('/login', { state: { from: location.pathname } });
      setIsOpen(false);
    } else {
      setIsOpen(false); // Close mobile menu on valid click
    }
  };

  return (
    <nav className="fixed w-full top-0 z-50 border-b border-slate-800 bg-slate-950/80 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 relative">

          <div className="flex items-center gap-6">
            <Link to="/" className="flex-shrink-0 flex items-center gap-4 group" onClick={() => setIsOpen(false)}>
              <div className="relative">
                <Logo />
                <div className="absolute inset-0 bg-cyan-500/20 blur-lg rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></div>
              </div>
              <span className="font-bold text-2xl tracking-tighter font-display text-white group-hover:text-cyan-400 transition-colors">HiramKo</span>
            </Link>

            {/* Search Bar - Expandable */}
            <div className={`hidden md:flex items-center transition-all duration-300 ease-in-out ${isSearchExpanded ? 'w-96' : 'w-10'}`}>
              {isSearchExpanded ? (
                <form onSubmit={handleSearchSubmit} className="relative w-full">
                  <input
                    ref={searchInputRef}
                    autoFocus
                    type="text"
                    value={navSearchTerm}
                    onChange={(e) => setNavSearchTerm(e.target.value)}
                    onBlur={() => !navSearchTerm && setIsSearchExpanded(false)}
                    placeholder="Search for cameras, drones, tools..."
                    className="w-full bg-slate-900 border border-slate-800 rounded-full py-2 pl-10 pr-20 text-sm text-white focus:outline-none focus:ring-1 focus:ring-cyan-500 shadow-inner transition-all focus:border-cyan-500/50"
                  />
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <button
                    type="submit"
                    className="absolute right-1 top-1 bottom-1 bg-cyan-600 hover:bg-cyan-500 text-white px-4 rounded-full text-xs font-bold transition-colors"
                  >
                    Search
                  </button>
                </form>
              ) : (
                <button
                  onClick={() => setIsSearchExpanded(true)}
                  className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-slate-800 text-slate-400 hover:text-cyan-400 transition-colors"
                >
                  <Search className="w-5 h-5" />
                </button>
              )}
            </div>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-6">

            <button
              onClick={(e) => {
                if (onToggleChat) {
                  e.preventDefault();
                  if (!user) {
                    showNotification({
                      title: 'Login Required',
                      message: 'Please log in to chat with owners.',
                      type: 'info'
                    });
                    return;
                  }
                  onToggleChat();
                } else {
                  handleAuthAction(e, '/messages');
                }
              }}
              className={`transition-all duration-300 hover:scale-105 group ${isActive('/messages')}`}
            >
              <div className="w-9 h-9 flex items-center justify-center rounded-xl bg-slate-900 border border-slate-800 text-slate-400 group-hover:text-cyan-400 group-hover:border-cyan-500/30 transition-all">
                <MessageSquare className="w-4.5 h-4.5" />
              </div>
            </button>

            {/* Notification Icon */}
            <div className="relative" ref={notifRef}>
              <button
                onClick={() => {
                  if (!user) {
                    showNotification({
                      title: 'Login Required',
                      message: 'You need to log in first to view notifications.',
                      type: 'info'
                    });
                    navigate('/login', { state: { from: location.pathname } });
                  } else {
                    setIsNotifOpen(!isNotifOpen);
                  }
                }}
                className="w-9 h-9 flex items-center justify-center rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-cyan-400 hover:border-cyan-500/30 transition-all relative"
              >
                <Bell className="w-4.5 h-4.5" />
                {user && notifications.some(n => !n.read) && (
                  <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border border-slate-900 animate-pulse"></span>
                )}
              </button>

              {isNotifOpen && user && (
                <div className="absolute right-0 mt-2 w-80 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-200">
                  <div className="p-3 border-b border-slate-800 flex justify-between items-center">
                    <h3 className="font-bold text-white text-sm">Notifications</h3>
                    {notifications.some(n => !n.read) && (
                      <span
                        onClick={markAllAsRead}
                        className="text-[10px] text-cyan-400 cursor-pointer hover:underline uppercase font-bold tracking-widest"
                      >
                        Mark all read
                      </span>
                    )}
                  </div>
                  <div className="max-h-64 overflow-y-auto custom-scrollbar">
                    {notifications.length === 0 ? (
                      <div className="p-8 text-center">
                        <p className="text-xs text-slate-500 italic">No notifications yet</p>
                      </div>
                    ) : (
                      notifications.map(notif => (
                        <Link
                          to={notif.link || "/dashboard"}
                          key={notif.id}
                          className={`block p-4 hover:bg-slate-800/50 transition border-b border-slate-800/50 last:border-0 cursor-pointer ${notif.read ? 'opacity-60' : 'bg-cyan-500/[0.02]'}`}
                          onClick={async () => {
                            setIsNotifOpen(false);
                            if (!notif.read) {
                              await markAsRead(notif.id);
                              setNotifications(prev => prev.map(n => n.id === notif.id ? { ...n, read: true } : n));
                            }
                          }}
                        >
                          <div className="flex justify-between items-start gap-2">
                            <p className={`text-sm ${notif.read ? 'text-slate-400' : 'text-white font-bold'} line-clamp-1`}>{notif.title}</p>
                            {!notif.read && <div className="w-2 h-2 bg-cyan-500 rounded-full mt-1 flex-shrink-0"></div>}
                          </div>
                          <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">{notif.message}</p>
                          <p className="text-[10px] text-slate-600 mt-2 font-medium">{notif.time}</p>
                        </Link>
                      ))
                    )}
                  </div>
                  <div className="p-2 text-center border-t border-slate-800 bg-slate-900/50">
                    <Link to="/dashboard" onClick={() => setIsNotifOpen(false)} className="text-[10px] text-cyan-400 hover:text-cyan-300 font-bold uppercase tracking-widest">View Dashboard</Link>
                  </div>
                </div>
              )}
            </div>

            <Link
              to="/post"
              onClick={(e) => handleAuthAction(e, '/post')}
              className="px-5 py-2.5 rounded-2xl text-sm font-bold transition-all duration-300 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white flex items-center gap-2.5 shadow-[0_4px_15px_-4px_rgba(8,145,178,0.4)] hover:shadow-[0_8px_20px_-4px_rgba(8,145,178,0.6)] hover:-translate-y-0.5 active:scale-95"
            >
              <PlusCircle className="w-4 h-4" /> <span>Post Item</span>
            </Link>

            {/* Dashboard / Profile */}
            <Link
              to="/dashboard"
              onClick={(e) => handleAuthAction(e, '/dashboard')}
              className="flex items-center group ml-2"
            >
              <div className={`flex items-center gap-3 pl-3 pr-1 py-1 rounded-full border transition-all duration-300 ${user ? 'bg-slate-900 border-slate-700 hover:border-cyan-500/50' : 'bg-slate-900/50 border-slate-800 hover:border-slate-700'}`}>
                {user ? (
                  <>
                    <div className="flex flex-col items-end mr-1 hidden lg:flex">
                      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-tighter leading-none mb-1">Account</span>
                      <span className="text-xs font-bold text-white leading-none line-clamp-1 max-w-[80px]">{user.name.split(' ')[0]}</span>
                    </div>
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 p-[1.5px] shadow-[0_0_10px_rgba(6,182,212,0.3)] group-hover:shadow-[0_0_15px_rgba(6,182,212,0.5)] transition-all">
                      <img src={user.avatar} alt="Profile" className="w-full h-full rounded-full object-cover border border-slate-950" />
                    </div>
                  </>
                ) : (
                  <>
                    <span className="text-xs font-bold text-slate-400 pl-1">Sign In</span>
                    <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center border border-slate-700">
                      <UserIcon className="w-4 h-4 text-slate-500" />
                    </div>
                  </>
                )}
              </div>
            </Link>
          </div>

          {/* Mobile menu button */}
          <div className="flex items-center md:hidden gap-4">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-slate-400 hover:text-cyan-400 focus:outline-none"
            >
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden bg-slate-900/95 backdrop-blur-xl border-b border-slate-800 absolute w-full shadow-xl animate-in slide-in-from-top-5 duration-200">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            <div className="px-3 pb-2">
              <form onSubmit={handleSearchSubmit} className="relative w-full">
                <input
                  type="text"
                  value={navSearchTerm}
                  onChange={(e) => setNavSearchTerm(e.target.value)}
                  placeholder="Search..."
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg py-2 px-4 text-white focus:outline-none focus:border-cyan-500"
                />
              </form>
            </div>
            <Link
              to="/search"
              onClick={() => setIsOpen(false)}
              className="block px-3 py-3 rounded-md text-base font-medium text-slate-300 hover:text-cyan-400 hover:bg-slate-800"
            >
              Explore
            </Link>

            <button
              onClick={(e) => {
                if (onToggleChat) {
                  e.preventDefault();
                  if (!user) {
                    showNotification({
                      title: 'Login Required',
                      message: 'Please log in to chat.',
                      type: 'info'
                    });
                    return;
                  }
                  onToggleChat();
                  setIsOpen(false);
                } else {
                  handleAuthAction(e, '/messages');
                }
              }}
              className={`flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-xl transition ${location.pathname === '/messages' ? 'bg-cyan-500/10 text-cyan-400' : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                }`}
            >
              <MessageSquare className="w-5 h-5" /> Chat
            </button>
            <Link
              to="/dashboard"
              onClick={(e) => handleAuthAction(e, '/dashboard')}
              className="block px-3 py-3 rounded-md text-base font-medium text-slate-300 hover:text-cyan-400 hover:bg-slate-800"
            >
              Dashboard
            </Link>
            <Link
              to="/post"
              onClick={(e) => handleAuthAction(e, '/post')}
              className="block w-full text-center mt-4 px-3 py-3 rounded-md text-base font-medium bg-cyan-600 text-white hover:bg-cyan-500"
            >
              Post an Item
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
};
export default Navbar;