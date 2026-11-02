import React, { useState, useEffect } from 'react';
import { 
  FileText, AlertOctagon, Plus, CheckCircle2, 
  Clock, MapPin, ShieldAlert, ArrowRight, X, MessageSquare, ChevronRight
} from 'lucide-react';
import { api } from '../services/api';
import { Incident, DisasterType, DamageSeverity, IncidentStatus } from '../types';

export const IncidentReportingPage: React.FC = () => {
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [selectedIncident, setSelectedIncident] = useState<Incident | null>(null);
  const [timeline, setTimeline] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'case-list' | 'new-report'>('case-list');

  // New report form state
  const [title, setTitle] = useState('');
  const [disasterType, setDisasterType] = useState<DisasterType>('Building Collapse');
  const [severity, setSeverity] = useState<DamageSeverity>('Moderate Damage');
  const [description, setDescription] = useState('');
  const [locationName, setLocationName] = useState('');
  const [latitude, setLatitude] = useState(28.6139);
  const [longitude, setLongitude] = useState(77.2090);
  const [affectedPeople, setAffectedPeople] = useState(0);
  const [reporterContact, setReporterContact] = useState('');
  const [reportedBy, setReportedBy] = useState('Citizen Dispatch Form');

  // Case update state
  const [updateStatus, setUpdateStatus] = useState<IncidentStatus>('Reported');
  const [updateOfficer, setUpdateOfficer] = useState('');
  const [caseNote, setCaseNote] = useState('');

  useEffect(() => {
    loadIncidents();
  }, []);

  const loadIncidents = async () => {
    try {
      const data = await api.getIncidents();
      setIncidents(data);
      if (data.length > 0 && !selectedIncident) {
        loadIncidentDetails(data[0].id);
      }
    } catch (err) {
      console.error("Incidents load error:", err);
    }
  };

  const loadIncidentDetails = async (id: number) => {
    try {
      const res = await api.getIncident(id);
      setSelectedIncident(res.incident);
      setTimeline(res.timeline);
      setUpdateStatus(res.incident.status);
      setUpdateOfficer(res.incident.assigned_officer || '');
    } catch (err) {
      console.error("Detail load error:", err);
    }
  };

  const handleSubmitNewReport = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await api.createIncident({
        title,
        disaster_type: disasterType,
        severity,
        description,
        location_name: locationName,
        latitude,
        longitude,
        affected_people_est: affectedPeople,
        reporter_contact: reporterContact,
        reported_by: reportedBy
      });
      alert(`Incident ${res.incident_code} successfully registered into active queue!`);
      setActiveTab('case-list');
      loadIncidents();
      loadIncidentDetails(res.id);
    } catch (err: any) {
      alert(`Submission error: ${err.message}`);
    }
  };

  const handleUpdateCase = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedIncident) return;
    try {
      await api.updateIncident(selectedIncident.id, {
        status: updateStatus,
        assigned_officer: updateOfficer,
        notes: caseNote || undefined
      });
      alert(`Case ${selectedIncident.incident_code} status updated!`);
      setCaseNote('');
      loadIncidents();
      loadIncidentDetails(selectedIncident.id);
    } catch (err: any) {
      alert(`Update error: ${err.message}`);
    }
  };

  return (
    <div className="space-y-6 pb-16">
      {/* Header */}
      <div className="bg-slate-900/60 border border-slate-800 p-4 rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-orange-600/20 border border-orange-500/40 flex items-center justify-center text-orange-400">
            <AlertOctagon className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-extrabold text-white">Incident Reporting & Case Management</h1>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-orange-500/20 text-orange-300 border border-orange-500/30">
                {incidents.length} Active Incidents
              </span>
            </div>
            <p className="text-xs text-slate-400 font-mono">
              Citizen intake form, duplicate review, status pipeline, and case audit timeline
            </p>
          </div>
        </div>

        {/* Tab switch */}
        <div className="flex items-center gap-2 bg-slate-900 p-1 rounded-lg border border-slate-800 text-xs">
          <button
            onClick={() => setActiveTab('case-list')}
            className={`px-3 py-1.5 rounded-md font-semibold transition-colors ${
              activeTab === 'case-list' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            Active Incident Files
          </button>
          <button
            onClick={() => setActiveTab('new-report')}
            className={`px-3 py-1.5 rounded-md font-semibold transition-colors flex items-center gap-1 ${
              activeTab === 'new-report' ? 'bg-orange-600 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Plus className="w-3.5 h-3.5" />
            File New Report
          </button>
        </div>
      </div>

      {activeTab === 'new-report' ? (
        /* Report Submission Form */
        <div className="max-w-2xl mx-auto bg-[#0b1222] border border-slate-800 p-6 rounded-2xl shadow-2xl space-y-5">
          <div className="border-b border-slate-800 pb-3">
            <h2 className="text-base font-bold text-white">File Emergency Incident Report</h2>
            <p className="text-xs text-slate-400 font-mono">Citizen & Field Officer Intake Form</p>
          </div>

          <form onSubmit={handleSubmitNewReport} className="space-y-4 text-xs">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Incident Headline / Title</label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Commercial Arcade Structural Wall Collapse"
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Disaster Category</label>
                <select
                  value={disasterType}
                  onChange={(e) => setDisasterType(e.target.value as DisasterType)}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white"
                >
                  <option value="Building Collapse">Building Collapse</option>
                  <option value="Earthquake">Earthquake</option>
                  <option value="Flood">Flood</option>
                  <option value="Cyclone">Cyclone</option>
                  <option value="Fire">Fire</option>
                  <option value="Landslide">Landslide</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Estimated Damage Severity</label>
                <select
                  value={severity}
                  onChange={(e) => setSeverity(e.target.value as DamageSeverity)}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white"
                >
                  <option value="Critical Damage">Critical Damage</option>
                  <option value="Severe Damage">Severe Damage</option>
                  <option value="Moderate Damage">Moderate Damage</option>
                  <option value="Low Damage">Low Damage</option>
                  <option value="No Damage">No Damage</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Detailed Description</label>
              <textarea
                rows={3}
                required
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe structural collapse points, trapped individuals, water level, or smoke presence..."
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white font-sans"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Physical Location Address</label>
              <input
                type="text"
                required
                value={locationName}
                onChange={(e) => setLocationName(e.target.value)}
                placeholder="e.g. Connaught Outer Ring, Sector 4, New Delhi"
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">GPS Latitude</label>
                <input
                  type="number"
                  step="0.0001"
                  value={latitude}
                  onChange={(e) => setLatitude(parseFloat(e.target.value))}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">GPS Longitude</label>
                <input
                  type="number"
                  step="0.0001"
                  value={longitude}
                  onChange={(e) => setLongitude(parseFloat(e.target.value))}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white font-mono"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Estimated Affected People</label>
                <input
                  type="number"
                  min="0"
                  value={affectedPeople}
                  onChange={(e) => setAffectedPeople(parseInt(e.target.value))}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Reporter Contact Hotline</label>
                <input
                  type="text"
                  value={reporterContact}
                  onChange={(e) => setReporterContact(e.target.value)}
                  placeholder="+91-98711-XXXXX"
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white font-mono"
                />
              </div>
            </div>

            <div className="pt-3 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setActiveTab('case-list')}
                className="px-4 py-2 rounded-lg bg-slate-800 text-slate-300"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-6 py-2 rounded-lg bg-orange-600 hover:bg-orange-500 text-white font-bold text-xs"
              >
                Submit Incident Report
              </button>
            </div>
          </form>
        </div>
      ) : (
        /* Two-Pane Case Management View */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left: Incident List (5 cols) */}
          <div className="lg:col-span-5 space-y-3">
            {incidents.map((inc) => (
              <div
                key={inc.id}
                onClick={() => loadIncidentDetails(inc.id)}
                className={`p-4 rounded-xl border cursor-pointer transition-all ${
                  selectedIncident?.id === inc.id
                    ? 'bg-slate-800/90 border-orange-500/80 shadow-lg'
                    : 'bg-[#0b1222] border-slate-800 hover:bg-slate-800/40'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono font-bold text-orange-400 text-xs">{inc.incident_code}</span>
                  <span className={`text-[10px] font-mono px-2 py-0.5 rounded ${
                    inc.severity === 'Critical Damage' ? 'bg-red-950 text-red-300' :
                    inc.severity === 'Severe Damage' ? 'bg-orange-950 text-orange-300' :
                    inc.severity === 'Moderate Damage' ? 'bg-amber-950 text-amber-300' :
                    'bg-emerald-950 text-emerald-300'
                  }`}>
                    {inc.severity}
                  </span>
                </div>

                <h3 className="font-bold text-xs text-white mt-1.5">{inc.title}</h3>
                <div className="text-[11px] text-slate-400 font-mono mt-1 truncate">{inc.location_name}</div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-800/60 mt-2 text-[10px] font-mono text-slate-400">
                  <span>Priority: <strong className="text-white">{inc.priority_score}</strong></span>
                  <span className="text-amber-400 font-bold">{inc.status}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Right: Selected Case Details & Timeline (7 cols) */}
          <div className="lg:col-span-7 space-y-4">
            {selectedIncident ? (
              <div className="bg-[#0b1222] border border-slate-800 p-6 rounded-xl space-y-6">
                <div className="flex items-start justify-between border-b border-slate-800 pb-3">
                  <div>
                    <span className="text-xs font-mono font-bold text-orange-400">{selectedIncident.incident_code}</span>
                    <h2 className="text-lg font-bold text-white mt-0.5">{selectedIncident.title}</h2>
                    <div className="text-xs text-slate-400 font-mono">{selectedIncident.location_name}</div>
                  </div>

                  <div className="text-right">
                    <span className="text-xs font-mono text-slate-500">PRIORITY</span>
                    <div className="text-2xl font-black text-red-500">{selectedIncident.priority_score}</div>
                  </div>
                </div>

                {/* Description */}
                <div className="text-xs text-slate-300 leading-relaxed font-sans bg-slate-900/60 p-3.5 rounded-lg border border-slate-800">
                  {selectedIncident.description || 'No detailed narrative provided.'}
                </div>

                {/* Case Status Update Form */}
                <form onSubmit={handleUpdateCase} className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-3 text-xs">
                  <div className="font-bold text-white">Update Case Status & Assignment</div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-slate-400 mb-1">Status Pipeline</label>
                      <select
                        value={updateStatus}
                        onChange={(e) => setUpdateStatus(e.target.value as IncidentStatus)}
                        className="w-full px-2.5 py-1.5 bg-slate-800 border border-slate-700 rounded text-white font-mono"
                      >
                        <option value="Reported">Reported</option>
                        <option value="Under Review">Under Review</option>
                        <option value="Confirmed">Confirmed</option>
                        <option value="Response Initiated">Response Initiated</option>
                        <option value="Resolved">Resolved</option>
                        <option value="Closed">Closed</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-slate-400 mb-1">Assigned Officer</label>
                      <input
                        type="text"
                        value={updateOfficer}
                        onChange={(e) => setUpdateOfficer(e.target.value)}
                        placeholder="e.g. Captain Priya Patel"
                        className="w-full px-2.5 py-1.5 bg-slate-800 border border-slate-700 rounded text-white"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-slate-400 mb-1">Log Case Note / Directive</label>
                    <input
                      type="text"
                      value={caseNote}
                      onChange={(e) => setCaseNote(e.target.value)}
                      placeholder="e.g. Structural stabilization underway by USAR Strike Alpha..."
                      className="w-full px-2.5 py-1.5 bg-slate-800 border border-slate-700 rounded text-white"
                    />
                  </div>

                  <div className="flex justify-end">
                    <button
                      type="submit"
                      className="px-4 py-1.5 rounded bg-blue-600 hover:bg-blue-500 text-white font-bold"
                    >
                      Update Case Record
                    </button>
                  </div>
                </form>

                {/* Case Chronological Timeline */}
                <div className="space-y-3">
                  <h3 className="text-xs font-mono uppercase text-slate-400 font-bold">
                    Incident Audit & Dispatch Timeline
                  </h3>

                  <div className="space-y-3 border-l-2 border-slate-800 ml-2 pl-4">
                    {timeline.map((item) => (
                      <div key={item.id} className="relative space-y-1">
                        <span className="absolute -left-[21px] top-1 w-2.5 h-2.5 rounded-full bg-orange-500 border border-slate-900"></span>
                        <div className="flex items-center justify-between text-xs">
                          <strong className="text-white">{item.action}</strong>
                          <span className="text-[10px] font-mono text-slate-500">{new Date(item.timestamp).toLocaleTimeString()}</span>
                        </div>
                        <p className="text-[11px] text-slate-400">{item.notes}</p>
                        <span className="text-[10px] font-mono text-slate-500">Logged by: {item.author}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-[#0b1222] border border-slate-800 p-12 rounded-xl text-center text-slate-500 text-xs">
                Select an incident on the left to inspect case records.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
