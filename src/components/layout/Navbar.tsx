import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  ShieldAlert, Bell, CloudLightning, Activity,
  User as UserIcon, LogOut, ChevronDown, CheckCircle, AlertTriangle
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { UserRole } from '../../types';

export const Navbar: React.FC = () => {
  const { user, role, demoLogin, logout } = useAuth();
  const navigate = useNavigate();
  const [timeStr, setTimeStr] = useState<string>('');
  const [showRoleMenu, setShowRoleMenu] = useState<boolean>(false);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTimeStr(now.toUTCString().replace('GMT', 'UTC'));
    };
    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, []);

  const roles: { key: UserRole; label: string; badge: string; color: string }[] = [
    { key: 'ADMIN', label: 'Administrator', badge: 'HQ Command', color: 'bg-purple-500/20 text-purple-300 border-purple-500/30' },
    { key: 'OFFICER', label: 'Disaster Officer', badge: 'Ops Lead', color: 'bg-blue-500/20 text-blue-300 border-blue-500/30' },
    { key: 'RESCUE', label: 'Rescue Team Member', badge: 'Tactical Unit', color: 'bg-amber-500/20 text-amber-300 border-amber-500/30' },
    { key: 'ANALYST', label: 'Analyst / Researcher', badge: 'GEOINT AI', color: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' },
  ];

  const currentRoleObj = roles.find(r => r.key === role) || roles[1];

  return (
    <header className="sticky top-0 z-40 bg-[#090e1a]/95 backdrop-blur-md border-b border-slate-800/80 px-4 py-2.5">
      <div className="flex items-center justify-between">
        {/* Left: Branding & Mission Alert */}
        <div className="flex items-center gap-4">
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-tr from-red-600 via-orange-500 to-amber-500 flex items-center justify-center shadow-lg shadow-red-500/20 group-hover:scale-105 transition-transform">
              <ShieldAlert className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-base tracking-wider text-white">Disaster<span className="text-red-500">AI</span></span>
                <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-red-950/60 border border-red-700/50 text-red-400 font-semibold tracking-wider flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-ping"></span>
                  DEFCON 2
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-mono tracking-tight hidden sm:block">National Emergency Operations Center</p>
            </div>
          </Link>

          {/* Real-time Ticker */}
          <div className="hidden lg:flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900/80 border border-slate-800 text-xs">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <span className="text-slate-300 font-medium truncate max-w-[280px]">
              Sector 4 Collapse Cordon Active | Heavy Rainfall Warning Active
            </span>
          </div>
        </div>

        {/* Right: Telemetry, Role Switcher, Profile */}
        <div className="flex items-center gap-3">
          {/* UTC Clock */}
          <div className="hidden md:flex items-center gap-1.5 text-xs font-mono text-slate-300 bg-slate-900/90 border border-slate-800 px-2.5 py-1.5 rounded-md">
            <Activity className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
            <span>{timeStr || 'SYNCING UTC'}</span>
          </div>

          {/* Quick Demo Role Switcher */}
          <div className="relative">
            <button
              onClick={() => setShowRoleMenu(!showRoleMenu)}
              className={`flex items-center gap-2 px-2.5 py-1.5 rounded-md text-xs font-medium border transition-all ${currentRoleObj.color}`}
              title="Click to switch demonstration role"
            >
              <span className="w-2 h-2 rounded-full bg-current"></span>
              <span className="font-mono">{currentRoleObj.badge}</span>
              <span className="hidden sm:inline text-slate-300 font-normal">({role})</span>
              <ChevronDown className="w-3.5 h-3.5 opacity-70" />
            </button>

            {showRoleMenu && (
              <div className="absolute right-0 mt-2 w-64 bg-slate-900 border border-slate-800 rounded-lg shadow-2xl p-2 z-50">
                <div className="px-2 py-1 text-[11px] font-semibold text-slate-400 uppercase tracking-wider border-b border-slate-800 mb-1">
                  Switch Demonstration Role
                </div>
                {roles.map((r) => (
                  <button
                    key={r.key}
                    onClick={() => {
                      demoLogin(r.key);
                      setShowRoleMenu(false);
                    }}
                    className={`w-full text-left px-2.5 py-2 rounded text-xs flex items-center justify-between hover:bg-slate-800/80 transition-colors ${
                      role === r.key ? 'bg-slate-800 text-white font-semibold' : 'text-slate-300'
                    }`}
                  >
                    <div>
                      <div className="font-medium">{r.label}</div>
                      <div className="text-[10px] text-slate-400">{r.badge}</div>
                    </div>
                    {role === r.key && <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Quick Alerts Bell */}
          <Link
            to="/alerts"
            className="relative p-2 rounded-md bg-slate-900/80 border border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
            title="Emergency Notifications"
          >
            <Bell className="w-4 h-4" />
            <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-red-600 text-[10px] font-bold text-white flex items-center justify-center">
              2
            </span>
          </Link>

          {/* User Profile / Logout */}
          <div className="flex items-center gap-2 pl-2 border-l border-slate-800">
            <div className="hidden xl:block text-right">
              <div className="text-xs font-semibold text-white leading-tight">{user?.full_name || 'Officer'}</div>
              <div className="text-[10px] text-slate-400 font-mono truncate max-w-[130px]">{user?.agency || 'NDMA'}</div>
            </div>
            <button
              onClick={() => {
                logout();
                navigate('/login');
              }}
              className="p-2 rounded-md bg-slate-900/80 border border-slate-800 text-slate-400 hover:text-red-400 hover:bg-red-950/30 transition-colors"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
