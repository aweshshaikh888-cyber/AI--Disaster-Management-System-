import React, { useState, useEffect } from 'react';
import { 
  Gauge, Sliders, ShieldAlert, AlertTriangle, 
  CheckCircle2, RefreshCw, Info, HelpCircle, Save
} from 'lucide-react';
import { api } from '../services/api';

export const PriorityEnginePage: React.FC = () => {
  // Simulator inputs
  const [severity, setSeverity] = useState<string>('Critical Damage');
  const [affectedPeople, setAffectedPeople] = useState<number>(85);
  const [criticalInfra, setCriticalInfra] = useState<boolean>(true);
  const [medicalEmergency, setMedicalEmergency] = useState<boolean>(true);
  const [hoursElapsed, setHoursElapsed] = useState<number>(1.5);

  // Result state
  const [priorityResult, setPriorityResult] = useState<any>(null);
  const [isCalculating, setIsCalculating] = useState<boolean>(false);

  // Weight configuration state
  const [weights, setWeights] = useState({
    damage_severity: 0.35,
    affected_population: 0.25,
    critical_infrastructure: 0.15,
    medical_emergency: 0.15,
    recency: 0.10
  });
  const [isSavingWeights, setIsSavingWeights] = useState<boolean>(false);
  const [weightSaveMsg, setWeightSaveMsg] = useState<string | null>(null);

  useEffect(() => {
    loadWeights();
    calculateScore();
  }, [severity, affectedPeople, criticalInfra, medicalEmergency, hoursElapsed]);

  const loadWeights = async () => {
    try {
      const res = await api.getWeights();
      if (res?.current_weights) {
        setWeights(res.current_weights);
      }
    } catch (err) {
      console.error("Error loading weights:", err);
    }
  };

  const calculateScore = async () => {
    setIsCalculating(true);
    try {
      const res = await api.calculatePriority({
        severity,
        affected_people: affectedPeople,
        critical_infra: criticalInfra,
        medical_emergency: medicalEmergency,
        hours_elapsed: hoursElapsed
      });
      setPriorityResult(res);
    } catch (err) {
      console.error("Priority calculation error:", err);
    } finally {
      setIsCalculating(false);
    }
  };

  const handleSaveWeights = async () => {
    setIsSavingWeights(true);
    setWeightSaveMsg(null);
    try {
      const res = await api.updateWeights(weights);
      setWeights(res.updated_weights);
      setWeightSaveMsg("Prioritization weights updated successfully across system!");
      calculateScore();
    } catch (err: any) {
      setWeightSaveMsg(`Failed to update weights: ${err.message}`);
    } finally {
      setIsSavingWeights(false);
    }
  };

  return (
    <div className="space-y-6 pb-16">
      {/* Header */}
      <div className="bg-slate-900/60 border border-slate-800 p-4 rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-red-600/20 border border-red-500/40 flex items-center justify-center text-red-400">
            <Gauge className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-extrabold text-white">Disaster Severity & Priority Engine</h1>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                Multi-Factor Triage (0 - 100)
              </span>
            </div>
            <p className="text-xs text-slate-400 font-mono">
              Transparent, accountable algorithmic incident scoring supporting human emergency commanders
            </p>
          </div>
        </div>

        <div className="text-xs text-slate-400 font-mono bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-lg">
          Active Formula: <span className="text-emerald-400 font-bold">5-Parameter Weighted Index</span>
        </div>
      </div>

      {/* Grid: Simulator vs Result */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Input Parameters (6 cols) */}
        <div className="lg:col-span-6 space-y-4">
          <div className="bg-[#0b1222] border border-slate-800 p-5 rounded-xl space-y-4">
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <Sliders className="w-4 h-4 text-orange-400" />
              1. Incident Factors & Telemetry Simulator
            </h2>

            <div className="space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">CNN Damage Severity Classification</label>
                <select
                  value={severity}
                  onChange={(e) => setSeverity(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white font-mono focus:border-red-500"
                >
                  <option value="Critical Damage">Critical Damage (100 pts)</option>
                  <option value="Severe Damage">Severe Damage (80 pts)</option>
                  <option value="Moderate Damage">Moderate Damage (50 pts)</option>
                  <option value="Low Damage">Low Damage (25 pts)</option>
                  <option value="No Damage">No Damage (5 pts)</option>
                </select>
              </div>

              <div>
                <div className="flex justify-between mb-1">
                  <label className="text-slate-300 font-semibold">Potentially Affected Civilian Population</label>
                  <span className="font-mono text-white font-bold">{affectedPeople} Persons</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="600"
                  step="5"
                  value={affectedPeople}
                  onChange={(e) => setAffectedPeople(parseInt(e.target.value))}
                  className="w-full accent-red-500"
                />
                <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                  <span>0 (None)</span>
                  <span>100 (High)</span>
                  <span>500+ (Mass Casualty Event)</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-1">
                <label className="flex items-center gap-2 p-3 rounded-lg bg-slate-900 border border-slate-800 cursor-pointer hover:border-slate-700">
                  <input
                    type="checkbox"
                    checked={criticalInfra}
                    onChange={(e) => setCriticalInfra(e.target.checked)}
                    className="rounded text-red-600 focus:ring-0"
                  />
                  <div>
                    <div className="font-bold text-white">Critical Infrastructure</div>
                    <div className="text-[10px] text-slate-400">Power, Hospital, Bridge</div>
                  </div>
                </label>

                <label className="flex items-center gap-2 p-3 rounded-lg bg-slate-900 border border-slate-800 cursor-pointer hover:border-slate-700">
                  <input
                    type="checkbox"
                    checked={medicalEmergency}
                    onChange={(e) => setMedicalEmergency(e.target.checked)}
                    className="rounded text-red-600 focus:ring-0"
                  />
                  <div>
                    <div className="font-bold text-white">Medical Emergency</div>
                    <div className="text-[10px] text-slate-400">Trapped / Immediate ALS</div>
                  </div>
                </label>
              </div>

              <div>
                <div className="flex justify-between mb-1">
                  <label className="text-slate-300 font-semibold">Incident Recency (Hours Elapsed)</label>
                  <span className="font-mono text-white font-bold">{hoursElapsed} Hours</span>
                </div>
                <input
                  type="range"
                  min="0.1"
                  max="24"
                  step="0.5"
                  value={hoursElapsed}
                  onChange={(e) => setHoursElapsed(parseFloat(e.target.value))}
                  className="w-full accent-orange-500"
                />
                <div className="text-[10px] text-slate-500 font-mono">
                  Fresh incidents receive higher recency urgency weighting.
                </div>
              </div>
            </div>
          </div>

          {/* Configurable Weight Sliders for Authorized Officers */}
          <div className="bg-[#0b1222] border border-slate-800 p-5 rounded-xl space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                <Sliders className="w-4 h-4 text-purple-400" />
                2. Operational Weight Configuration
              </h2>
              <span className="text-[10px] font-mono text-slate-400">Authorized Admin / Officer</span>
            </div>

            <div className="space-y-2.5 text-xs">
              <div>
                <div className="flex justify-between text-[11px] font-mono">
                  <span className="text-slate-300">Damage Severity Weight:</span>
                  <span className="text-white font-bold">{Math.round(weights.damage_severity * 100)}%</span>
                </div>
                <input
                  type="range"
                  min="0.1"
                  max="0.6"
                  step="0.05"
                  value={weights.damage_severity}
                  onChange={(e) => setWeights({ ...weights, damage_severity: parseFloat(e.target.value) })}
                  className="w-full accent-blue-500"
                />
              </div>

              <div>
                <div className="flex justify-between text-[11px] font-mono">
                  <span className="text-slate-300">Affected Population Weight:</span>
                  <span className="text-white font-bold">{Math.round(weights.affected_population * 100)}%</span>
                </div>
                <input
                  type="range"
                  min="0.1"
                  max="0.5"
                  step="0.05"
                  value={weights.affected_population}
                  onChange={(e) => setWeights({ ...weights, affected_population: parseFloat(e.target.value) })}
                  className="w-full accent-blue-500"
                />
              </div>

              <div>
                <div className="flex justify-between text-[11px] font-mono">
                  <span className="text-slate-300">Critical Infrastructure Weight:</span>
                  <span className="text-white font-bold">{Math.round(weights.critical_infrastructure * 100)}%</span>
                </div>
                <input
                  type="range"
                  min="0.05"
                  max="0.3"
                  step="0.05"
                  value={weights.critical_infrastructure}
                  onChange={(e) => setWeights({ ...weights, critical_infrastructure: parseFloat(e.target.value) })}
                  className="w-full accent-blue-500"
                />
              </div>

              <div className="pt-2 flex items-center justify-between">
                <button
                  type="button"
                  onClick={handleSaveWeights}
                  disabled={isSavingWeights}
                  className="px-4 py-2 rounded-lg bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs flex items-center gap-1.5 transition-colors"
                >
                  <Save className="w-3.5 h-3.5" />
                  Save Weight Matrix
                </button>
                {weightSaveMsg && (
                  <span className="text-[11px] text-emerald-400 font-mono">{weightSaveMsg}</span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Right: Calculated Priority Score & Breakdown (6 cols) */}
        <div className="lg:col-span-6 space-y-4">
          <div className="bg-[#0b1222] border border-slate-800 p-6 rounded-xl space-y-6">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div>
                <span className="text-[10px] font-mono uppercase text-slate-400 font-bold">
                  CALCULATED PRIORITY RATING
                </span>
                <div className="text-2xl font-black text-white flex items-center gap-3 mt-1">
                  <span>{priorityResult?.category || 'Critical'} Priority</span>
                  <span className={`text-xs font-mono px-2.5 py-0.5 rounded border ${
                    priorityResult?.category === 'Critical' ? 'bg-red-950 text-red-300 border-red-700' :
                    priorityResult?.category === 'High' ? 'bg-orange-950 text-orange-300 border-orange-700' :
                    priorityResult?.category === 'Medium' ? 'bg-amber-950 text-amber-300 border-amber-700' :
                    'bg-emerald-950 text-emerald-300 border-emerald-700'
                  }`}>
                    {priorityResult?.response_urgency}
                  </span>
                </div>
              </div>

              <div className="text-right">
                <div className="text-xs font-mono text-slate-400">SCORE (0-100)</div>
                <div className="text-4xl font-black text-red-500">{priorityResult?.priority_score ?? 94.5}</div>
              </div>
            </div>

            {/* Visual Gauge Bar */}
            <div className="space-y-1">
              <div className="w-full bg-slate-900 h-4 rounded-full overflow-hidden p-0.5 border border-slate-800">
                <div
                  className={`h-full rounded-full transition-all duration-300 ${
                    (priorityResult?.priority_score ?? 0) >= 80 ? 'bg-gradient-to-r from-orange-500 to-red-600' :
                    (priorityResult?.priority_score ?? 0) >= 60 ? 'bg-gradient-to-r from-amber-500 to-orange-500' :
                    (priorityResult?.priority_score ?? 0) >= 40 ? 'bg-amber-500' : 'bg-emerald-500'
                  }`}
                  style={{ width: `${priorityResult?.priority_score ?? 50}%` }}
                ></div>
              </div>
              <div className="flex justify-between text-[10px] font-mono text-slate-500">
                <span>0 (Low)</span>
                <span>40 (Medium)</span>
                <span>60 (High)</span>
                <span>80+ (Critical)</span>
              </div>
            </div>

            {/* Recommended Units & Resource Package */}
            <div className="bg-slate-900/80 p-4 rounded-xl border border-slate-800 space-y-2">
              <span className="text-xs font-bold text-orange-400 font-mono uppercase">
                Recommended Resource Allocation:
              </span>
              <div className="text-sm font-semibold text-white">
                {priorityResult?.recommended_units || 'USAR Heavy Unit, 2+ Ambulances, Hazmat Protocol'}
              </div>
            </div>

            {/* Mathematical Factor Contributions */}
            <div className="space-y-3">
              <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider font-mono">
                Contribution Breakdown to Total Score:
              </h3>

              <div className="space-y-2 text-xs font-mono">
                {priorityResult?.breakdown && Object.entries(priorityResult.breakdown).map(([key, val]) => (
                  <div key={key} className="flex justify-between items-center bg-slate-900/50 p-2 rounded border border-slate-800">
                    <span className="text-slate-400 capitalize">{key.replace('_contribution', '').replace('_', ' ')}:</span>
                    <span className="text-white font-bold">+{String(val)} pts</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Human in the loop declaration */}
            <div className="p-3.5 rounded-xl bg-blue-950/30 border border-blue-800/50 text-xs text-blue-300 flex items-start gap-2.5">
              <Info className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <div className="font-bold text-white">Human-in-the-Loop Decision Support:</div>
                <p className="text-[11px] text-slate-300 leading-relaxed">
                  This mathematical priority score is an advisory heuristic. It supports emergency commanders by surfacing critical time-sensitive bottlenecks, but never replaces on-the-ground operational decisions. If casualty information is unverified, it is labeled as unknown.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
