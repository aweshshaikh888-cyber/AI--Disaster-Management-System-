import React, { useState, useEffect } from 'react';
import { 
  Package, AlertTriangle, CheckCircle2, Plus, 
  Send, RefreshCw, X, Truck, HeartPulse, Tent, Droplets
} from 'lucide-react';
import { api } from '../services/api';
import { EmergencyResource, ResourceRequest, Incident } from '../types';

export const ResourcesPage: React.FC = () => {
  const [resources, setResources] = useState<EmergencyResource[]>([]);
  const [requests, setRequests] = useState<ResourceRequest[]>([]);
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [showRequestModal, setShowRequestModal] = useState<boolean>(false);
  const [selectedResourceId, setSelectedResourceId] = useState<number | null>(null);
  const [selectedIncidentId, setSelectedIncidentId] = useState<number | null>(null);
  const [requestQty, setRequestQty] = useState<number>(10);
  const [urgency, setUrgency] = useState<string>('High');
  const [requestedBy, setRequestedBy] = useState<string>('Sector Field Commander');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [resList, reqList, incList] = await Promise.all([
        api.getResources(),
        api.getResourceRequests(),
        api.getIncidents()
      ]);
      setResources(resList);
      setRequests(reqList);
      setIncidents(incList);
      if (resList.length > 0) setSelectedResourceId(resList[0].id);
      if (incList.length > 0) setSelectedIncidentId(incList[0].id);
    } catch (err) {
      console.error("Resources load error:", err);
    }
  };

  const handleCreateRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedResourceId) return;
    try {
      await api.createResourceRequest({
        resource_id: selectedResourceId,
        incident_id: selectedIncidentId,
        requested_quantity: requestQty,
        urgency,
        requested_by: requestedBy
      });
      alert("Emergency requisition submitted to Central Depot logistics!");
      setShowRequestModal(false);
      loadData();
    } catch (err: any) {
      alert(`Requisition failed: ${err.message}`);
    }
  };

  const handleApprove = async (id: number) => {
    try {
      await api.approveResourceRequest(id);
      alert("Requisition approved and stock dispatched from warehouse!");
      loadData();
    } catch (err: any) {
      alert(`Approval error: ${err.message}`);
    }
  };

  return (
    <div className="space-y-6 pb-16">
      {/* Header */}
      <div className="bg-slate-900/60 border border-slate-800 p-4 rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-emerald-600/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
            <Package className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-extrabold text-white">Emergency Logistics & Resource Depot</h1>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                Central Inventory
              </span>
            </div>
            <p className="text-xs text-slate-400 font-mono">
              Ambulances, hydraulic cutters, blood plasma, tents, and field ration supply chains
            </p>
          </div>
        </div>

        <button
          onClick={() => setShowRequestModal(true)}
          className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md shadow-emerald-600/30 flex items-center gap-1.5 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Create Emergency Requisition
        </button>
      </div>

      {/* Resource Inventory Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {resources.map((res) => {
          const pct = Math.round((res.available_quantity / res.total_quantity) * 100);
          return (
            <div key={res.id} className="bg-[#0b1222] border border-slate-800 p-4 rounded-xl space-y-3">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h3 className="font-bold text-xs text-white leading-tight">{res.name}</h3>
                  <span className="text-[10px] font-mono text-slate-400">{res.category}</span>
                </div>
                <span className={`text-[9px] font-mono font-bold px-1.5 py-0.2 rounded border ${
                  res.status === 'Critical' ? 'bg-red-950 text-red-300 border-red-700' :
                  res.status === 'Low Stock' ? 'bg-amber-950 text-amber-300 border-amber-700' :
                  'bg-emerald-950 text-emerald-300 border-emerald-700'
                }`}>
                  {res.status}
                </span>
              </div>

              <div>
                <div className="flex justify-between text-xs font-mono mb-1">
                  <span className="text-slate-400">Available:</span>
                  <span className="text-white font-bold">{res.available_quantity} / {res.total_quantity} {res.unit}</span>
                </div>
                <div className="w-full bg-slate-900 h-2 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${
                      pct < 25 ? 'bg-red-500' : pct < 50 ? 'bg-amber-500' : 'bg-emerald-500'
                    }`}
                    style={{ width: `${pct}%` }}
                  ></div>
                </div>
              </div>

              <div className="text-[10px] text-slate-500 font-mono flex items-center justify-between pt-1 border-t border-slate-800">
                <span>Depot: {res.warehouse_location}</span>
                <span>Min: {res.min_threshold}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Requisition Orders & Dispatch Ledger */}
      <div className="bg-[#0b1222] border border-slate-800 p-5 rounded-xl space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-white">Active Emergency Requisitions</h3>
            <p className="text-xs text-slate-400">Field supply requests and warehouse approval pipeline</p>
          </div>
          <span className="text-xs font-mono text-slate-400">{requests.length} Requisitions</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-900 text-slate-400 font-mono text-[11px] uppercase border-b border-slate-800">
              <tr>
                <th className="py-2 px-3">Resource Item</th>
                <th className="py-2 px-3">Destination / Incident</th>
                <th className="py-2 px-3">Quantity</th>
                <th className="py-2 px-3">Urgency</th>
                <th className="py-2 px-3">Requested By</th>
                <th className="py-2 px-3">Status</th>
                <th className="py-2 px-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-sans">
              {requests.map((rq) => (
                <tr key={rq.id} className="hover:bg-slate-800/30">
                  <td className="py-3 px-3 font-semibold text-white">{rq.resource_name}</td>
                  <td className="py-3 px-3 font-mono text-slate-300">{rq.incident_code}</td>
                  <td className="py-3 px-3 font-mono font-bold text-emerald-400">{rq.requested_quantity} {rq.unit}</td>
                  <td className="py-3 px-3">
                    <span className="px-2 py-0.5 rounded bg-red-950 text-red-300 border border-red-800 text-[10px] font-mono">
                      {rq.urgency}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-slate-300">{rq.requested_by}</td>
                  <td className="py-3 px-3">
                    <span className={`text-[11px] font-mono ${
                      rq.status.includes('Approved') ? 'text-emerald-400 font-bold' : 'text-amber-400'
                    }`}>
                      {rq.status}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-right">
                    {!rq.status.includes('Approved') ? (
                      <button
                        onClick={() => handleApprove(rq.id)}
                        className="px-2.5 py-1 rounded bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-bold"
                      >
                        Approve & Ship
                      </button>
                    ) : (
                      <span className="text-slate-500 text-[10px] font-mono">Dispatched</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* New Requisition Modal */}
      {showRequestModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0b1222] border border-slate-700 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Plus className="w-4 h-4 text-emerald-400" />
                Submit Emergency Requisition
              </h3>
              <button onClick={() => setShowRequestModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateRequest} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Select Resource Item</label>
                <select
                  value={selectedResourceId || ''}
                  onChange={(e) => setSelectedResourceId(parseInt(e.target.value))}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white"
                >
                  {resources.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.name} ({r.available_quantity} {r.unit} available)
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Destination Incident Code</label>
                <select
                  value={selectedIncidentId || ''}
                  onChange={(e) => setSelectedIncidentId(parseInt(e.target.value))}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white"
                >
                  {incidents.map((inc) => (
                    <option key={inc.id} value={inc.id}>
                      [{inc.incident_code}] {inc.title}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Quantity</label>
                  <input
                    type="number"
                    min="1"
                    max="1000"
                    value={requestQty}
                    onChange={(e) => setRequestQty(parseInt(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Urgency</label>
                  <select
                    value={urgency}
                    onChange={(e) => setUrgency(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white"
                  >
                    <option value="Critical">Critical</option>
                    <option value="High">High</option>
                    <option value="Medium">Medium</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Requisitioning Officer</label>
                <input
                  type="text"
                  value={requestedBy}
                  onChange={(e) => setRequestedBy(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowRequestModal(false)}
                  className="px-3 py-2 rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold"
                >
                  Submit Order
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
