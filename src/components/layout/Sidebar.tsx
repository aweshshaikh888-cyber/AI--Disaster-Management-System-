import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard, Map, Camera, Cpu, Video,
  Gauge, Users, BellRing, CloudRain, Package,
  Building2, FileText, BarChart3, Bot, History,
  Settings, ChevronLeft, ChevronRight, AlertOctagon,
  LifeBuoy
} from 'lucide-react';

interface SidebarItem {
  name: string;
  path: string;
  icon: React.ElementType;
  badge?: string;
}

interface SidebarGroup {
  groupName: string;
  items: SidebarItem[];
}

export const Sidebar: React.FC = () => {
  const [collapsed, setCollapsed] = useState(false);

  const navigationGroups: SidebarGroup[] = [
    {
      groupName: 'Operational Command',
      items: [
        { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
        { name: 'Interactive Map', path: '/map', icon: Map, badge: 'Live' },
        { name: 'Incident Case Files', path: '/incidents', icon: AlertOctagon, badge: '6' },
        { name: 'Report Incident', path: '/report-incident', icon: FileText },
      ]
    },
    {
      groupName: 'AI & Intelligence',
      items: [
        { name: 'CNN Damage Analysis', path: '/ai-analysis', icon: Camera, badge: 'Core' },
        { name: 'Model & Benchmarks', path: '/model-performance', icon: Cpu },
        { name: 'Drone Telemetry Feed', path: '/drone-monitoring', icon: Video },
        { name: 'Priority Score Engine', path: '/priority-engine', icon: Gauge },
      ]
    },
    {
      groupName: 'Field Logistics',
      items: [
        { name: 'Rescue Teams Dispatch', path: '/rescue-teams', icon: Users },
        { name: 'Resource Inventory', path: '/resources', icon: Package },
        { name: 'Hospitals & Shelters', path: '/facilities', icon: Building2 },
        { name: 'Weather Early Warning', path: '/weather', icon: CloudRain },
      ]
    },
    {
      groupName: 'Strategic Support',
      items: [
        { name: 'Emergency Alerts', path: '/alerts', icon: BellRing },
        { name: 'Operations AI Copilot', path: '/copilot', icon: Bot, badge: 'AI' },
        { name: 'Analytics & Reports', path: '/analytics', icon: BarChart3 },
        { name: 'Activity Audit Logs', path: '/activity-logs', icon: History },
        { name: 'Admin System Health', path: '/admin-settings', icon: Settings },
      ]
    }
  ];

  return (
    <aside
      className={`relative z-30 flex flex-col bg-[#080d19] border-r border-slate-800/80 transition-all duration-300 ease-in-out shrink-0 select-none ${
        collapsed ? 'w-16' : 'w-64'
      }`}
    >
      {/* Collapse Toggle */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="absolute -right-3 top-5 w-6 h-6 rounded-full bg-slate-800 border border-slate-700 text-slate-300 hover:text-white hover:bg-slate-700 flex items-center justify-center shadow-md z-40 transition-colors"
        title={collapsed ? "Expand Sidebar" : "Collapse Sidebar"}
      >
        {collapsed ? <ChevronRight className="w-3.5 h-3.5" /> : <ChevronLeft className="w-3.5 h-3.5" />}
      </button>

      {/* Nav Link Tree */}
      <div className="flex-1 overflow-y-auto py-4 px-2 space-y-6">
        {navigationGroups.map((group, gIdx) => (
          <div key={gIdx} className="space-y-1">
            {!collapsed && (
              <div className="px-3 text-[10px] uppercase tracking-wider font-mono font-bold text-slate-500 mb-1.5">
                {group.groupName}
              </div>
            )}
            {group.items.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={({ isActive }) =>
                    `group relative flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium transition-all duration-150 ${
                      isActive
                        ? 'bg-gradient-to-r from-red-600/20 to-orange-600/10 text-white border-l-2 border-red-500 font-semibold'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                    }`
                  }
                  title={collapsed ? item.name : undefined}
                >
                  <Icon className="w-4 h-4 shrink-0 transition-transform group-hover:scale-110" />
                  {!collapsed && (
                    <div className="flex items-center justify-between w-full">
                      <span className="truncate">{item.name}</span>
                      {item.badge && (
                        <span className="text-[9px] font-mono font-bold px-1.5 py-0.2 rounded bg-slate-800 text-slate-300 border border-slate-700 group-hover:border-slate-600">
                          {item.badge}
                        </span>
                      )}
                    </div>
                  )}
                </NavLink>
              );
            })}
          </div>
        ))}
      </div>

      {/* Footer Info */}
      {!collapsed && (
        <div className="p-3 border-t border-slate-800/80 bg-slate-900/40 text-[11px] text-slate-400">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="font-mono text-slate-300 font-medium">CNN Model v2.4 Active</span>
          </div>
          <div className="text-[10px] text-slate-400 mt-0.5">DisasterAI Operations OS</div>
        </div>
      )}
    </aside>
  );
};
