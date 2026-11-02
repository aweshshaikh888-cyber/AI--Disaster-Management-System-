import React, { useState, useEffect } from 'react';
import { 
  Building2, Hospital, Tent, Phone, 
  MapPin, CheckCircle2, Search, Navigation, AlertTriangle, ShieldCheck
} from 'lucide-react';
import { api } from '../services/api';
import { HospitalShelter } from '../types';

export const FacilitiesPage: React.FC = () => {
  const [facilities, setFacilities] = useState<HospitalShelter[]>([]);
  const [filterType, setFilterType] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [referenceLat, setReferenceLat] = useState<number>(28.6328); // Sector 4 default
  const [referenceLon, setReferenceLon] = useState<number>(77.2197);

  useEffect(() => {
    loadFacilities();
  }, [filterType, referenceLat, referenceLon]);

  const loadFacilities = async () => {
    try {
      const data = await api.getFacilities(filterType, referenceLat, referenceLon);
      setFacilities(data);
    } catch (err) {
      console.error("Facilities load error:", err);
    }
  };

  const filteredFacilities = facilities.filter(f => 
    f.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    f.address.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6 pb-16">
      {/* Header */}
      <div className="bg-slate-900/60 border border-slate-800 p-4 rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-purple-600/20 border border-purple-500/40 flex items-center justify-center text-purple-400">
            <Building2 className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-extrabold text-white">Emergency Facilities & Safe Shelters</h1>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30">
                Verified Directory
              </span>
            </div>
            <p className="text-xs text-slate-400 font-mono">
              Trauma hospitals, temporary indoor relief shelters, bed capacities, and proximity routing
            </p>
          </div>
        </div>

        {/* Filter controls */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search hospital or shelter..."
              className="pl-8 pr-3 py-1.5 text-xs bg-slate-900 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 w-44"
            />
          </div>

          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-2.5 py-1.5 text-xs bg-slate-900 border border-slate-700 rounded-lg text-white focus:outline-none"
          >
            <option value="All">All Facilities</option>
            <option value="Hospital">Hospitals Only</option>
            <option value="Temporary Shelter">Temporary Shelters</option>
            <option value="Relief Camp">Relief Camps</option>
          </select>
        </div>
      </div>

      {/* Proximity Calculator Bar */}
      <div className="bg-[#0b1222] border border-slate-800 p-4 rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-4 text-xs">
        <div className="flex items-center gap-2 text-slate-300">
          <Navigation className="w-4 h-4 text-purple-400" />
          <span>Calculate Distances from Disaster Origin (GPS Lat/Lon):</span>
        </div>
        <div className="flex items-center gap-2 font-mono">
          <input
            type="number"
            step="0.001"
            value={referenceLat}
            onChange={(e) => setReferenceLat(parseFloat(e.target.value))}
            className="w-24 px-2 py-1 bg-slate-900 border border-slate-700 rounded text-white"
          />
          <span className="text-slate-500">,</span>
          <input
            type="number"
            step="0.001"
            value={referenceLon}
            onChange={(e) => setReferenceLon(parseFloat(e.target.value))}
            className="w-24 px-2 py-1 bg-slate-900 border border-slate-700 rounded text-white"
          />
          <button
            onClick={loadFacilities}
            className="px-3 py-1 rounded bg-purple-600 hover:bg-purple-500 text-white font-bold"
          >
            Recalculate Proximity
          </button>
        </div>
      </div>

      {/* Facility Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredFacilities.map((fac) => {
          const isHospital = fac.facility_type === 'Hospital';
          const occPct = Math.round(((fac.total_capacity - fac.available_capacity) / fac.total_capacity) * 100);

          return (
            <div key={fac.id} className="bg-[#0b1222] border border-slate-800 rounded-xl p-5 space-y-4 shadow-xl flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                      isHospital ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30' : 'bg-purple-500/10 text-purple-400 border border-purple-500/30'
                    }`}>
                      {isHospital ? <Hospital className="w-4 h-4" /> : <Tent className="w-4 h-4" />}
                    </div>
                    <div>
                      <h3 className="font-bold text-xs text-white leading-tight">{fac.name}</h3>
                      <span className="text-[10px] font-mono text-slate-400">{fac.facility_type}</span>
                    </div>
                  </div>

                  {fac.distance_km !== undefined && (
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-purple-300 font-bold border border-slate-700 shrink-0">
                      {fac.distance_km} km away
                    </span>
                  )}
                </div>

                <div className="space-y-1.5 text-xs text-slate-300">
                  <div className="flex items-start gap-1.5 text-slate-400">
                    <MapPin className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                    <span className="text-[11px] leading-snug">{fac.address}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-slate-400">
                    <Phone className="w-3.5 h-3.5 shrink-0" />
                    <span className="font-mono text-[11px] text-white">{fac.contact_phone}</span>
                  </div>
                </div>

                {/* Capacity Gauge */}
                <div className="space-y-1 pt-1">
                  <div className="flex justify-between text-[11px] font-mono">
                    <span className="text-slate-400">Available Beds/Spaces:</span>
                    <span className="font-bold text-emerald-400">{fac.available_capacity} / {fac.total_capacity}</span>
                  </div>
                  <div className="w-full bg-slate-900 h-2 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${
                        occPct > 85 ? 'bg-red-500' : occPct > 60 ? 'bg-amber-500' : 'bg-emerald-500'
                      }`}
                      style={{ width: `${occPct}%` }}
                    ></div>
                  </div>
                  <div className="text-[10px] font-mono text-slate-500 text-right">
                    Occupancy: {occPct}% ({fac.status})
                  </div>
                </div>

                {/* Services */}
                <div className="p-2.5 rounded bg-slate-900 border border-slate-800 text-[11px] text-slate-300">
                  <span className="font-mono text-slate-500 block text-[10px]">SERVICES:</span>
                  <p className="line-clamp-2">{fac.services}</p>
                </div>
              </div>

              {/* Actions */}
              <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-xs">
                <span className="text-[10px] font-mono text-emerald-400 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" /> Verified Status
                </span>
                <a
                  href={`https://www.google.com/maps/dir/?api=1&destination=${fac.latitude},${fac.longitude}`}
                  target="_blank"
                  rel="noreferrer"
                  className="px-3 py-1.5 rounded bg-purple-600/80 hover:bg-purple-600 text-white font-semibold inline-flex items-center gap-1 transition-colors"
                >
                  <Navigation className="w-3 h-3" />
                  Route Directions
                </a>
              </div>
            </div>
          );
        })}
      </div>

      {/* Safety Advisory Banner */}
      <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-300 space-y-1">
        <div className="font-bold text-amber-400 flex items-center gap-1.5">
          <AlertTriangle className="w-4 h-4" />
          Mandatory Civil Safety Disclaimer:
        </div>
        <p className="text-[11px] text-slate-400 leading-relaxed font-mono">
          Never assume that a facility is open or has available beds without current verified information. Operational bed counts are updated hourly via hospital telemetry relays.
        </p>
      </div>
    </div>
  );
};
