import React, { useState, useEffect } from 'react';
import { 
  History, ShieldCheck, Activity, Search, 
  Filter, CheckCircle2, User, Database, Clock
} from 'lucide-react';
import { api } from '../services/api';
import { AuditLog } from '../types';

export const ActivityLogsPage: React.FC = () => {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [filterEntity, setFilterEntity] = useState<string>('All');
  const [search, setSearch] = useState<string>('');

  useEffect(() => {
    loadLogs();
  }, []);

  const loadLogs = async () => {
    try {
      const data = await api.getAuditLogs(100);
      setLogs(data);
    } catch (err) {
      console.error("Audit logs load error:", err);
    }
  };

  const filteredLogs = logs.filter(l => {
    const matchesEntity = filterEntity === 'All' || l.entity_type === filterEntity;
    const matchesSearch = search === '' || 
      l.action.toLowerCase().includes(search.toLowerCase()) ||
      (l.details && l.details.toLowerCase().includes(search.toLowerCase())) ||
      l.username.toLowerCase().includes(search.toLowerCase());
    return matchesEntity && matchesSearch;
  });

  return (
    <div className="space-y-6 pb-16">
      {/* Header */}
      <div className="bg-slate-900/60 border border-slate-800 p-4 rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-blue-600/20 border border-blue-500/40 flex items-center justify-center text-blue-400">
            <History className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-extrabold text-white">System Audit & Activity Logs</h1>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 border border-blue-500/30">
                Immutable Ledger
              </span>
            </div>
            <p className="text-xs text-slate-400 font-mono">
              Traceability trail of incident creations, team dispatches, model inferences, and administrative events
            </p>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search action or user..."
              className="pl-8 pr-3 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none w-44"
            />
          </div>

          <select
            value={filterEntity}
            onChange={(e) => setFilterEntity(e.target.value)}
            className="px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-white font-mono focus:outline-none"
          >
            <option value="All">All Entity Types</option>
            <option value="Incident">Incidents</option>
            <option value="RescueTeam">Rescue Teams</option>
            <option value="AIAnalysis">AI Model</option>
            <option value="System">System Engine</option>
          </select>
        </div>
      </div>

      {/* Audit Log Table */}
      <div className="bg-[#0b1222] border border-slate-800 rounded-xl overflow-hidden shadow-2xl">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-900 text-slate-400 font-mono text-[11px] uppercase border-b border-slate-800">
            <tr>
              <th className="py-2.5 px-3">Timestamp (UTC)</th>
              <th className="py-2.5 px-3">Actor / User</th>
              <th className="py-2.5 px-3">Action</th>
              <th className="py-2.5 px-3">Target Entity</th>
              <th className="py-2.5 px-3">Operational Details</th>
              <th className="py-2.5 px-3 text-right">IP Origin</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 font-mono">
            {filteredLogs.map((log) => (
              <tr key={log.id} className="hover:bg-slate-800/30">
                <td className="py-3 px-3 text-slate-400">
                  {new Date(log.timestamp).toLocaleString()}
                </td>
                <td className="py-3 px-3">
                  <span className="font-bold text-white flex items-center gap-1.5">
                    <User className="w-3 h-3 text-blue-400" />
                    {log.username}
                  </span>
                </td>
                <td className="py-3 px-3">
                  <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-700 text-slate-200 font-semibold">
                    {log.action}
                  </span>
                </td>
                <td className="py-3 px-3 text-slate-300">
                  {log.entity_type} {log.entity_id ? `(#${log.entity_id})` : ''}
                </td>
                <td className="py-3 px-3 font-sans text-slate-300 max-w-md truncate">
                  {log.details || 'System event executed.'}
                </td>
                <td className="py-3 px-3 text-right text-slate-500">
                  {log.ip_address}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
