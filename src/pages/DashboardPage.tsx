import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  AlertOctagon, Camera, Users, ShieldAlert, 
  Clock, CloudRain, ArrowUpRight, Filter, Search,
  Activity, CheckCircle, Zap, ShieldCheck
} from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, BarChart, Bar 
} from 'recharts';
import { api } from '../services/api';
import { Incident, AIAnalysisResult, WeatherAlert } from '../types';

export const DashboardPage: React.FC = () => {
  const [summary, setSummary] = useState<any>(null);
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [selectedDisaster, setSelectedDisaster] = useState<string>('All');
  const [selectedSeverity, setSelectedSeverity] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    loadData();
  }, [selectedDisaster, selectedSeverity, searchQuery]);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [sumData, incData] = await Promise.all([
        api.getDashboardSummary(),
        api.getIncidents({
          disaster_type: selectedDisaster,
          severity: selectedSeverity,
          search: searchQuery
        })
      ]);
      setSummary(sumData);
      setIncidents(incData);
    } catch (err) {
      console.error("Dashboard data load error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  // Severity Chart colors
  const SEVERITY_COLORS: Record<string, string> = {
    'No Damage': '#10b981',
    'Low Damage': '#22c55e',
    'Moderate Damage': '#eab308',
    'Severe Damage': '#f97316',
    'Critical Damage': '#ef4444'
  };

  const severityPieData = summary?.severity_distribution
    ? Object.entries(summary.severity_distribution).map(([name, value]) => ({
        name,
        value: Number(value),
        color: SEVERITY_COLORS[name] || '#94a3b8'
      }))
    : [];

  const disasterTypeBarData = summary?.disaster_type_distribution
    ? Object.entries(summary.disaster_type_distribution).map(([type, count]) => ({
        type,
        count: Number(count)
      }))
    : [];

  return (
    <div className="space-y-6 pb-12">
      {/* Top Banner / Ticker */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900/60 border border-slate-800 p-4 rounded-xl">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-red-600/20 border border-red-500/40 flex items-center justify-center text-red-400">
            <Activity className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <h1 className="text-xl font-extrabold text-white">Operational Disaster Command</h1>
            <p className="text-xs text-slate-400 font-mono">Real-time Situational Awareness & AI Severity Triage</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/ai-analysis"
            className="px-3.5 py-2 rounded-lg bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-500 hover:to-orange-500 text-white font-bold text-xs shadow-md shadow-red-600/20 flex items-center gap-1.5 transition-all"
          >
            <Camera className="w-4 h-4" />
            Analyze Disaster Image
          </Link>
          <Link
            to="/report-incident"
            className="px-3.5 py-2 rounded-lg bg-slate-800 border border-slate-700 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition-colors"
          >
            <AlertOctagon className="w-4 h-4 text-orange-400" />
            File Incident Report
          </Link>
        </div>
      </div>

      {/* KPI Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3.5">
        <div className="bg-[#0b1222] border border-slate-800/80 p-4 rounded-xl space-y-1">
          <span className="text-[11px] font-mono text-slate-400 uppercase">Total Incidents</span>
          <div className="text-2xl font-black text-white">{summary?.kpis?.total_incidents ?? 6}</div>
          <div className="text-[10px] text-emerald-400 flex items-center gap-1">
            <CheckCircle className="w-3 h-3" /> Active registry
          </div>
        </div>

        <div className="bg-[#0b1222] border border-slate-800/80 p-4 rounded-xl space-y-1">
          <span className="text-[11px] font-mono text-slate-400 uppercase">AI Analyses</span>
          <div className="text-2xl font-black text-blue-400">{summary?.kpis?.areas_analyzed ?? 12}</div>
          <div className="text-[10px] text-blue-300 font-mono">CNN ResNet-50</div>
        </div>

        <div className="bg-[#0b1222] border border-slate-800/80 p-4 rounded-xl space-y-1">
          <span className="text-[11px] font-mono text-slate-400 uppercase">Critical Priority</span>
          <div className="text-2xl font-black text-red-500 flex items-center gap-2">
            {summary?.kpis?.critical_incidents ?? 3}
            <span className="w-2 h-2 rounded-full bg-red-500 radar-pulse-red"></span>
          </div>
          <div className="text-[10px] text-red-400 font-mono">Immediate Triage</div>
        </div>

        <div className="bg-[#0b1222] border border-slate-800/80 p-4 rounded-xl space-y-1">
          <span className="text-[11px] font-mono text-slate-400 uppercase">Active USAR Teams</span>
          <div className="text-2xl font-black text-amber-400">
            {summary?.kpis?.active_rescue_teams ?? 4}
            <span className="text-xs text-slate-500 font-normal"> / {summary?.kpis?.total_rescue_teams ?? 6}</span>
          </div>
          <div className="text-[10px] text-amber-300 font-mono">Units Deployed</div>
        </div>

        <div className="bg-[#0b1222] border border-slate-800/80 p-4 rounded-xl space-y-1">
          <span className="text-[11px] font-mono text-slate-400 uppercase">Pending Intake</span>
          <div className="text-2xl font-black text-orange-400">{summary?.kpis?.pending_reports ?? 2}</div>
          <div className="text-[10px] text-orange-300 font-mono">Under verification</div>
        </div>

        <div className="bg-[#0b1222] border border-slate-800/80 p-4 rounded-xl space-y-1">
          <span className="text-[11px] font-mono text-slate-400 uppercase">Model Accuracy</span>
          <div className="text-2xl font-black text-emerald-400">98.1%</div>
          <div className="text-[10px] text-emerald-400/80 font-mono">+8.0% via Augment</div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Incident Trend Chart */}
        <div className="lg:col-span-2 bg-[#0b1222] border border-slate-800 p-5 rounded-xl space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-white">7-Day Incident Frequency & Escalation Trend</h3>
              <p className="text-xs text-slate-400">Weekly trajectory of reported vs critical emergency events</p>
            </div>
            <span className="text-[10px] font-mono bg-slate-800 text-slate-300 px-2 py-1 rounded">Daily Aggregates</span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={summary?.trends || []}>
                <defs>
                  <linearGradient id="colorReported" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.0}/>
                  </linearGradient>
                  <linearGradient id="colorCritical" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.6}/>
                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0.0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="day" stroke="#64748b" fontSize={11} />
                <YAxis stroke="#64748b" fontSize={11} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', fontSize: '12px' }}
                />
                <Area type="monotone" dataKey="reported" stroke="#3b82f6" strokeWidth={2} fillOpacity={1} fill="url(#colorReported)" name="Total Reported" />
                <Area type="monotone" dataKey="critical" stroke="#ef4444" strokeWidth={2} fillOpacity={1} fill="url(#colorCritical)" name="Critical Severity" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Severity Distribution Donut */}
        <div className="bg-[#0b1222] border border-slate-800 p-5 rounded-xl space-y-4">
          <div>
            <h3 className="text-sm font-bold text-white">Damage Severity Distribution</h3>
            <p className="text-xs text-slate-400">CNN visual classification breakdown</p>
          </div>

          <div className="h-48 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={severityPieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={75}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {severityPieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', fontSize: '12px' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs font-mono">
            {severityPieData.map((entry, i) => (
              <div key={i} className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: entry.color }}></span>
                <span className="text-slate-300 truncate">{entry.name}: {entry.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Filter Bar & Incident Case List */}
      <div className="bg-[#0b1222] border border-slate-800 rounded-xl p-5 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h3 className="text-sm font-bold text-white">Active Operational Incidents</h3>
            <p className="text-xs text-slate-400">Prioritized incident register with automated triage index</p>
          </div>

          {/* Filters */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search location, code..."
                className="pl-8 pr-3 py-1.5 text-xs bg-slate-900 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-red-500 w-44"
              />
            </div>

            <select
              value={selectedDisaster}
              onChange={(e) => setSelectedDisaster(e.target.value)}
              className="px-2.5 py-1.5 text-xs bg-slate-900 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-red-500"
            >
              <option value="All">All Disasters</option>
              <option value="Building Collapse">Building Collapse</option>
              <option value="Flood">Flood</option>
              <option value="Fire">Fire</option>
              <option value="Landslide">Landslide</option>
              <option value="Earthquake">Earthquake</option>
              <option value="Cyclone">Cyclone</option>
            </select>

            <select
              value={selectedSeverity}
              onChange={(e) => setSelectedSeverity(e.target.value)}
              className="px-2.5 py-1.5 text-xs bg-slate-900 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-red-500"
            >
              <option value="All">All Severities</option>
              <option value="Critical Damage">Critical</option>
              <option value="Severe Damage">Severe</option>
              <option value="Moderate Damage">Moderate</option>
              <option value="Low Damage">Low</option>
              <option value="No Damage">No Damage</option>
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-900/80 text-slate-400 font-mono text-[11px] uppercase border-b border-slate-800">
              <tr>
                <th className="py-2.5 px-3">Code</th>
                <th className="py-2.5 px-3">Title & Location</th>
                <th className="py-2.5 px-3">Type</th>
                <th className="py-2.5 px-3">Severity</th>
                <th className="py-2.5 px-3">Priority Score</th>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-sans">
              {incidents.map((inc) => (
                <tr key={inc.id} className="hover:bg-slate-800/40 transition-colors">
                  <td className="py-3 px-3 font-mono font-bold text-slate-200">
                    {inc.incident_code}
                  </td>
                  <td className="py-3 px-3">
                    <div className="font-semibold text-white">{inc.title}</div>
                    <div className="text-[11px] text-slate-400 font-mono truncate max-w-xs">{inc.location_name}</div>
                  </td>
                  <td className="py-3 px-3">
                    <span className="px-2 py-0.5 rounded bg-slate-800 border border-slate-700 text-slate-300 text-[10px] font-mono">
                      {inc.disaster_type}
                    </span>
                  </td>
                  <td className="py-3 px-3">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      inc.severity === 'Critical Damage' ? 'bg-red-950/70 text-red-300 border border-red-700' :
                      inc.severity === 'Severe Damage' ? 'bg-orange-950/70 text-orange-300 border border-orange-700' :
                      inc.severity === 'Moderate Damage' ? 'bg-amber-950/70 text-amber-300 border border-amber-700' :
                      'bg-emerald-950/70 text-emerald-300 border border-emerald-700'
                    }`}>
                      {inc.severity}
                    </span>
                  </td>
                  <td className="py-3 px-3">
                    <div className="flex items-center gap-2">
                      <div className="w-12 bg-slate-800 h-2 rounded-full overflow-hidden">
                        <div
                          className={`h-full ${
                            inc.priority_score >= 80 ? 'bg-red-500' :
                            inc.priority_score >= 60 ? 'bg-orange-500' :
                            inc.priority_score >= 40 ? 'bg-amber-500' : 'bg-emerald-500'
                          }`}
                          style={{ width: `${inc.priority_score}%` }}
                        ></div>
                      </div>
                      <span className="font-mono font-bold text-white">{inc.priority_score}</span>
                    </div>
                  </td>
                  <td className="py-3 px-3">
                    <span className={`text-[11px] font-mono ${
                      inc.status === 'Response Initiated' ? 'text-amber-400' :
                      inc.status === 'Resolved' ? 'text-emerald-400' : 'text-slate-300'
                    }`}>
                      {inc.status}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-right">
                    <Link
                      to={`/incidents`}
                      className="text-xs text-blue-400 hover:text-blue-300 font-semibold inline-flex items-center gap-1"
                    >
                      Manage
                      <ArrowUpRight className="w-3.5 h-3.5" />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
