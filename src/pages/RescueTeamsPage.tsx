import React, { useState, useEffect } from 'react';
import { 
  Users, UserCheck, ShieldAlert, Truck, 
  Phone, Plus, MapPin, CheckCircle2, AlertOctagon,
  X, Radio, Send
} from 'lucide-react';
import { api } from '../services/api';
import { RescueTeam, Incident, TeamStatus } from '../types';

export const RescueTeamsPage: React.FC = () => {
  const [teams, setTeams] = useState<RescueTeam[]>([]);
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [selectedTeam, setSelectedTeam] = useState<RescueTeam | null>(null);
  const [showAssignModal, setShowAssignModal] = useState<boolean>(false);
  const [showAddTeamModal, setShowAddTeamModal] = useState<boolean>(false);
  
  // Assign modal state
  const [assignIncidentId, setAssignIncidentId] = useState<number | null>(null);
  const [assignInstructions, setAssignInstructions] = useState<string>('Deploy immediately to site. Establish acoustic listening cordon and search for trapped occupants.');

  // Add team form
  const [newTeamName, setNewTeamName] = useState<string>('');
  const [newSpec, setNewSpec] = useState<string>('Urban Search & Rescue (USAR)');
  const [newLead, setNewLead] = useState<string>('');
  const [newPhone, setNewPhone] = useState<string>('');
  const [newMembers, setNewMembers] = useState<number>(8);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [tList, incList] = await Promise.all([
        api.getRescueTeams(),
        api.getIncidents()
      ]);
      setTeams(tList);
      setIncidents(incList);
      if (incList.length > 0) setAssignIncidentId(incList[0].id);
    } catch (err) {
      console.error("Rescue data load error:", err);
    }
  };

  const handleAssignSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTeam || !assignIncidentId) return;

    try {
      await api.assignTeam({
        team_id: selectedTeam.id,
        incident_id: assignIncidentId,
        task_instructions: assignInstructions,
        assigned_by: "Command Center Officer"
      });
      alert(`Team '${selectedTeam.name}' dispatched to incident successfully!`);
      setShowAssignModal(false);
      loadData();
    } catch (err: any) {
      alert(`Dispatch failed: ${err.message}`);
    }
  };

  const handleAddTeamSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.createRescueTeam({
        name: newTeamName,
        specialization: newSpec,
        lead_name: newLead,
        contact_phone: newPhone,
        member_count: newMembers,
        latitude: 28.6139,
        longitude: 77.2090
      });
      alert(`New rescue team '${newTeamName}' registered in operational roster!`);
      setShowAddTeamModal(false);
      loadData();
    } catch (err: any) {
      alert(`Failed to add team: ${err.message}`);
    }
  };

  const handleUpdateStatus = async (teamId: number, newStatus: TeamStatus) => {
    try {
      await api.updateTeam(teamId, { status: newStatus });
      loadData();
    } catch (err: any) {
      alert(`Status update failed: ${err.message}`);
    }
  };

  return (
    <div className="space-y-6 pb-16">
      {/* Header */}
      <div className="bg-slate-900/60 border border-slate-800 p-4 rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-blue-600/20 border border-blue-500/40 flex items-center justify-center text-blue-400">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-extrabold text-white">Rescue Coordination & Squad Roster</h1>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 border border-blue-500/30">
                {teams.length} Tactical Cadres
              </span>
            </div>
            <p className="text-xs text-slate-400 font-mono">
              Urban Search & Rescue (USAR), Hazmat, Medical First Response, and Water Rescue dispatch
            </p>
          </div>
        </div>

        <button
          onClick={() => setShowAddTeamModal(true)}
          className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-md shadow-blue-600/30 flex items-center gap-1.5 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Register New Squad
        </button>
      </div>

      {/* Squad Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {teams.map((t) => (
          <div key={t.id} className="bg-[#0b1222] border border-slate-800 rounded-xl p-5 space-y-4 shadow-xl relative flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h3 className="font-bold text-sm text-white">{t.name}</h3>
                  <span className="text-[11px] font-mono text-blue-400 font-semibold">{t.specialization}</span>
                </div>
                <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border shrink-0 ${
                  t.status === 'On Site' ? 'bg-red-950 text-red-300 border-red-700' :
                  t.status === 'En Route' ? 'bg-amber-950 text-amber-300 border-amber-700' :
                  t.status === 'Assigned' ? 'bg-blue-950 text-blue-300 border-blue-700' :
                  'bg-emerald-950 text-emerald-300 border-emerald-700'
                }`}>
                  {t.status}
                </span>
              </div>

              <div className="space-y-1.5 text-xs text-slate-300">
                <div className="flex items-center gap-2">
                  <UserCheck className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span>Lead: <strong className="text-white">{t.lead_name}</strong> ({t.member_count} Specialists)</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span className="font-mono text-[11px]">{t.contact_phone}</span>
                </div>
                {t.vehicle_info && (
                  <div className="flex items-center gap-2">
                    <Truck className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="text-[11px] text-slate-400">{t.vehicle_info}</span>
                  </div>
                )}
              </div>

              {t.equipment_summary && (
                <div className="p-2.5 rounded bg-slate-900 border border-slate-800 text-[11px] text-slate-300 space-y-0.5">
                  <span className="font-mono text-slate-500 block text-[10px]">TACTICAL GEAR INVENTORY:</span>
                  <p className="line-clamp-2">{t.equipment_summary}</p>
                </div>
              )}
            </div>

            {/* Quick Actions */}
            <div className="pt-3 border-t border-slate-800 flex items-center justify-between gap-2">
              <select
                value={t.status}
                onChange={(e) => handleUpdateStatus(t.id, e.target.value as TeamStatus)}
                className="px-2 py-1 bg-slate-900 border border-slate-700 rounded text-xs text-white font-mono"
              >
                <option value="Available">Available</option>
                <option value="Assigned">Assigned</option>
                <option value="En Route">En Route</option>
                <option value="On Site">On Site</option>
                <option value="Completed">Completed</option>
              </select>

              <button
                type="button"
                onClick={() => {
                  setSelectedTeam(t);
                  setShowAssignModal(true);
                }}
                className="px-3 py-1.5 rounded bg-blue-600/80 hover:bg-blue-600 text-white text-xs font-semibold flex items-center gap-1 transition-colors"
              >
                <Send className="w-3 h-3" />
                Dispatch
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Dispatch Assignment Modal */}
      {showAssignModal && selectedTeam && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0b1222] border border-slate-700 rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Send className="w-4 h-4 text-blue-400" />
                Dispatch Mission: {selectedTeam.name}
              </h3>
              <button onClick={() => setShowAssignModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAssignSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Target Incident</label>
                <select
                  value={assignIncidentId || ''}
                  onChange={(e) => setAssignIncidentId(parseInt(e.target.value))}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white"
                >
                  {incidents.map((inc) => (
                    <option key={inc.id} value={inc.id}>
                      [{inc.incident_code}] {inc.title} - Severity: {inc.severity} (Score: {inc.priority_score})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Operational Directives & Directives</label>
                <textarea
                  rows={3}
                  value={assignInstructions}
                  onChange={(e) => setAssignInstructions(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white font-sans"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowAssignModal(false)}
                  className="px-3 py-2 rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold"
                >
                  Confirm Dispatch Order
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Team Modal */}
      {showAddTeamModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0b1222] border border-slate-700 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Plus className="w-4 h-4 text-blue-400" />
                Register Tactical Rescue Unit
              </h3>
              <button onClick={() => setShowAddTeamModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddTeamSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Squad Name</label>
                <input
                  type="text"
                  required
                  value={newTeamName}
                  onChange={(e) => setNewTeamName(e.target.value)}
                  placeholder="e.g. USAR Unit 14 Delta"
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Specialization</label>
                <select
                  value={newSpec}
                  onChange={(e) => setNewSpec(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white"
                >
                  <option value="Urban Search & Rescue (USAR)">Urban Search & Rescue (USAR)</option>
                  <option value="Medical First Response & Advanced Triage">Medical First Response</option>
                  <option value="Flood & Water Rescue">Flood & Water Rescue</option>
                  <option value="Hazmat & Chemical Hazard Squad">Hazmat & Chemical</option>
                  <option value="Canine Scent Detection">K-9 Search Cadre</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Unit Leader Name</label>
                <input
                  type="text"
                  required
                  value={newLead}
                  onChange={(e) => setNewLead(e.target.value)}
                  placeholder="e.g. Inspector R. Banner"
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Phone Hotline</label>
                  <input
                    type="text"
                    required
                    value={newPhone}
                    onChange={(e) => setNewPhone(e.target.value)}
                    placeholder="+91-98711-XXXXX"
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Member Count</label>
                  <input
                    type="number"
                    min="2"
                    max="50"
                    value={newMembers}
                    onChange={(e) => setNewMembers(parseInt(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white font-mono"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowAddTeamModal(false)}
                  className="px-3 py-2 rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold"
                >
                  Register Unit
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
