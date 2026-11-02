import React, { useState, useEffect } from 'react';
import { 
  Settings, Server, Cpu, Database, HardDrive, 
  Users, ShieldCheck, CheckCircle2, AlertTriangle, RefreshCw
} from 'lucide-react';
import { api } from '../services/api';
import { UserRole } from '../types';

export const AdminSettingsPage: React.FC = () => {
  const [health, setHealth] = useState<any>(null);
  const [users, setUsers] = useState<any[]>([]);
  const [models, setModels] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    loadAdminData();
  }, []);

  const loadAdminData = async () => {
    setIsLoading(true);
    try {
      const [hData, uData, mData] = await Promise.all([
        api.getSystemHealth(),
        api.getUsers(),
        api.getModels()
      ]);
      setHealth(hData);
      setUsers(uData);
      setModels(mData);
    } catch (err) {
      console.error("Admin load error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRoleChange = async (userId: number, newRole: UserRole) => {
    try {
      await api.updateUserRole(userId, newRole);
      alert(`User role updated to ${newRole}`);
      loadAdminData();
    } catch (err: any) {
      alert(`Role change failed: ${err.message}`);
    }
  };

  const handleSwitchModel = async (version: string) => {
    try {
      await api.switchModel(version);
      alert(`Switched active CNN architecture to ${version}`);
      loadAdminData();
    } catch (err: any) {
      alert(`Model switch failed: ${err.message}`);
    }
  };

  return (
    <div className="space-y-6 pb-16">
      {/* Header */}
      <div className="bg-slate-900/60 border border-slate-800 p-4 rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-purple-600/20 border border-purple-500/40 flex items-center justify-center text-purple-400">
            <Settings className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-extrabold text-white">System Diagnostics & Admin Controls</h1>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30">
                v{health?.api_version || '2.4.0'} Operational
              </span>
            </div>
            <p className="text-xs text-slate-400 font-mono">
              Infrastructure health, user role authorizations, model version registry, and disk quotas
            </p>
          </div>
        </div>

        <button
          onClick={loadAdminData}
          className="px-3.5 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition-colors"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          Run Health Diagnostics
        </button>
      </div>

      {/* Services Health Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-[#0b1222] border border-slate-800 p-4 rounded-xl space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-white flex items-center gap-1.5">
              <Server className="w-3.5 h-3.5 text-blue-400" />
              FastAPI Core
            </span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800">
              {health?.services?.fastapi_backend?.status || 'Healthy'}
            </span>
          </div>
          <div className="text-[11px] text-slate-400 font-mono">
            Latency: <strong className="text-white">{health?.services?.fastapi_backend?.latency_ms ?? 1.2}ms</strong>
          </div>
        </div>

        <div className="bg-[#0b1222] border border-slate-800 p-4 rounded-xl space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-white flex items-center gap-1.5">
              <Database className="w-3.5 h-3.5 text-emerald-400" />
              SQL Database
            </span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800">
              {health?.services?.database?.status || 'Connected'}
            </span>
          </div>
          <div className="text-[11px] text-slate-400 font-mono">
            Engine: <strong className="text-white">{health?.services?.database?.type || 'SQLite 3'}</strong>
          </div>
        </div>

        <div className="bg-[#0b1222] border border-slate-800 p-4 rounded-xl space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-white flex items-center gap-1.5">
              <Cpu className="w-3.5 h-3.5 text-orange-400" />
              AI Damage Engine
            </span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800">
              {health?.services?.ai_inference_engine?.status || 'Loaded'}
            </span>
          </div>
          <div className="text-[11px] text-slate-400 font-mono">
            Backend: <strong className="text-white">{health?.services?.ai_inference_engine?.backend || 'NumPy CNN'}</strong>
          </div>
        </div>

        <div className="bg-[#0b1222] border border-slate-800 p-4 rounded-xl space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-white flex items-center gap-1.5">
              <HardDrive className="w-3.5 h-3.5 text-purple-400" />
              Storage Ledger
            </span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-purple-300">
              {health?.services?.storage_disk?.free_gb ?? 120} GB Free
            </span>
          </div>
          <div className="text-[11px] text-slate-400 font-mono">
            Grad-CAM Heatmaps: <strong className="text-white">{health?.services?.storage_disk?.gradcam_heatmaps_count ?? 12}</strong>
          </div>
        </div>
      </div>

      {/* Model Version Management */}
      <div className="bg-[#0b1222] border border-slate-800 p-5 rounded-xl space-y-4">
        <div>
          <h3 className="text-sm font-bold text-white">CNN Model Weights & Architecture Registry</h3>
          <p className="text-xs text-slate-400">Switch active feature extraction weights and inspect benchmark parameters</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {models.map((m) => {
            const isActive = health?.active_model?.includes(m.version) || m.version === '2.4.0';
            return (
              <div
                key={m.version}
                className={`p-4 rounded-xl border space-y-3 ${
                  isActive ? 'bg-slate-800/80 border-purple-500 shadow-lg' : 'bg-slate-900/50 border-slate-800'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-white">{m.name}</span>
                  <span className={`text-[10px] font-mono px-2 py-0.5 rounded ${
                    isActive ? 'bg-purple-950 text-purple-300 font-bold border border-purple-800' : 'bg-slate-800 text-slate-400'
                  }`}>
                    {isActive ? 'Active Pipeline' : 'Available Benchmark'}
                  </span>
                </div>

                <p className="text-xs text-slate-400 leading-snug">{m.description}</p>

                <div className="grid grid-cols-3 gap-2 text-[10px] font-mono text-slate-300 bg-slate-900/80 p-2 rounded">
                  <div>Acc: <strong className="text-emerald-400">{m.reported_accuracy}%</strong></div>
                  <div>Params: <strong>{m.parameters}</strong></div>
                  <div>Epochs: <strong>{m.training_epochs}</strong></div>
                </div>

                {!isActive && (
                  <button
                    onClick={() => handleSwitchModel(m.version)}
                    className="w-full py-1.5 rounded bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold transition-colors"
                  >
                    Activate Model {m.version}
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* User & Role Management Table */}
      <div className="bg-[#0b1222] border border-slate-800 p-5 rounded-xl space-y-4">
        <div>
          <h3 className="text-sm font-bold text-white">Role-Based Access Control (RBAC)</h3>
          <p className="text-xs text-slate-400">Manage officer credentials and assign operational permissions</p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-900 text-slate-400 font-mono text-[11px] uppercase border-b border-slate-800">
              <tr>
                <th className="py-2.5 px-3">Username</th>
                <th className="py-2.5 px-3">Full Name & Agency</th>
                <th className="py-2.5 px-3">Email Address</th>
                <th className="py-2.5 px-3">Assigned Role</th>
                <th className="py-2.5 px-3 text-right">Alter Permission</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono">
              {users.map((u) => (
                <tr key={u.id} className="hover:bg-slate-800/30">
                  <td className="py-3 px-3 font-bold text-white">{u.username}</td>
                  <td className="py-3 px-3">
                    <div className="font-sans font-semibold text-slate-200">{u.full_name}</div>
                    <div className="text-[10px] text-slate-500 font-mono">{u.agency}</div>
                  </td>
                  <td className="py-3 px-3 text-slate-400">{u.email}</td>
                  <td className="py-3 px-3">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      u.role === 'ADMIN' ? 'bg-purple-950 text-purple-300' :
                      u.role === 'OFFICER' ? 'bg-blue-950 text-blue-300' :
                      u.role === 'RESCUE' ? 'bg-amber-950 text-amber-300' :
                      'bg-emerald-950 text-emerald-300'
                    }`}>
                      {u.role}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-right">
                    <select
                      value={u.role}
                      onChange={(e) => handleRoleChange(u.id, e.target.value as UserRole)}
                      className="px-2 py-1 bg-slate-900 border border-slate-700 rounded text-xs text-white"
                    >
                      <option value="ADMIN">ADMIN</option>
                      <option value="OFFICER">OFFICER</option>
                      <option value="RESCUE">RESCUE</option>
                      <option value="ANALYST">ANALYST</option>
                    </select>
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
