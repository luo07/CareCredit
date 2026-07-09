import { useState } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';
import { HeartHandshake, Home, Trophy, Store, Menu, X, PlusCircle, Sparkles, User as UserIcon, LogOut, Settings as SettingsIcon, Ticket, Mail, MapPin } from 'lucide-react';
import { Logo } from './Logo';
import ActiveTaskBanner from './ActiveTaskBanner';

export default function Layout() {
  const { profile, logout } = useAuthStore();
  const location = useLocation();
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const navItems = [
    { label: 'Home Dashboard', path: '/profile', icon: Home },
    { label: 'Recommend Task', path: '/recommendations', icon: Sparkles },
    { label: 'Offer Help', path: '/feed', icon: HeartHandshake },
    { label: 'Request Help', path: '/create', icon: PlusCircle },
    { label: 'Campus Map', path: '/map', icon: MapPin },
    { label: 'Achievements', path: '/achievements', icon: Trophy },
  ];

  const bottomNavItems = [
    { label: 'Settings', path: '/settings', icon: SettingsIcon },
  ];

  const SidebarContent = () => (
    <div className="flex flex-col h-full bg-white border-r border-slate-200">
      <div className="p-6 flex items-center justify-between">
        <Link to="/profile" className="flex items-center gap-3 group">
          <Logo className="w-10 h-10" />
          <span className="text-2xl font-extrabold tracking-tight text-indigo-900 truncate">CareCredit</span>
        </Link>
        <button className="md:hidden p-2 bg-slate-100 rounded-full" onClick={() => setIsSidebarOpen(false)}>
          <X className="w-5 h-5 text-slate-500" />
        </button>
      </div>

      <div className="px-6 mb-8">
        <div className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-3 rounded-2xl font-bold shadow-md justify-between">
          <div className="flex items-center gap-2">
            <HeartHandshake className="w-5 h-5" />
            <span>Balance</span>
          </div>
          <span>{profile?.credits?.toFixed(1) || '0.0'} UC</span>
        </div>
      </div>

      <nav className="flex-1 px-4 space-y-2 overflow-y-auto">
        <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 px-2">Menu</div>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path || (location.pathname === '/create' && item.path.includes('/create'));
          return (
            <Link 
              key={item.path} 
              to={item.path} 
              onClick={() => setIsSidebarOpen(false)}
              className={`flex items-center gap-3 px-4 py-3 rounded-2xl transition-all font-bold ${isActive ? 'bg-indigo-50 text-indigo-700' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'}`}
            >
              <Icon className={`w-5 h-5 ${isActive ? 'fill-current opacity-20' : ''}`} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-slate-200 space-y-2">
        <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 px-2">Account</div>
        {bottomNavItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname.startsWith(item.path);
          return (
            <Link 
              key={item.path} 
              to={item.path} 
              onClick={() => setIsSidebarOpen(false)}
              className={`flex items-center gap-3 px-4 py-3 rounded-2xl transition-all font-bold ${isActive ? 'bg-slate-100 text-slate-900' : 'text-slate-500 hover:bg-slate-50'}`}
            >
              <Icon className="w-5 h-5" />
              <span>{item.label}</span>
            </Link>
          );
        })}
        <button 
          onClick={logout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl transition-all font-bold text-slate-500 hover:bg-red-50 hover:text-coral-600"
        >
          <LogOut className="w-5 h-5" />
          <span>Log Out</span>
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-transparent text-slate-800 font-sans flex text-base">
      
      {/* Desktop Sidebar */}
      <aside className="hidden md:block w-72 fixed inset-y-0 left-0 z-20">
        <SidebarContent />
      </aside>

      {/* Mobile Drawer */}
      {isSidebarOpen && (
        <div className="md:hidden fixed inset-0 z-30 flex">
          <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={() => setIsSidebarOpen(false)} />
          <div className="w-4/5 max-w-sm bg-white relative">
            <SidebarContent />
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 md:ml-72 flex flex-col min-h-screen">
        {/* Mobile Header */}
        <header className="md:hidden flex items-center justify-between p-4 bg-white border-b border-slate-200 sticky top-0 z-10">
          <button 
            onClick={() => setIsSidebarOpen(true)}
            className="p-2 -ml-2 rounded-xl text-slate-500 hover:bg-slate-100"
          >
            <Menu className="w-6 h-6" />
          </button>
          <span className="text-xl font-extrabold tracking-tight text-indigo-900">CareCredit</span>
          <Logo className="w-10 h-10" />
        </header>

        <main className="flex-1 p-4 md:p-8 max-w-5xl w-full mx-auto pb-24">
          <Outlet />
        </main>
      </div>
      <ActiveTaskBanner />
    </div>
  );
}
