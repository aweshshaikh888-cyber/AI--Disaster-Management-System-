import React, { useState, useEffect, useRef } from 'react';
import { 
  Map as MapIcon, Layers, Filter, Search, 
  MapPin, AlertOctagon, Plus, Building2, Users, 
  ShieldAlert, RefreshCw, X, ArrowRight
} from 'lucide-react';
import { api } from '../services/api';
import L from 'leaflet';

export const DisasterMapPage: React.FC = () => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);

  const [mapData, setMapData] = useState<any>(null);
  const [selectedIncident, setSelectedIncident] = useState<any>(null);
  const [showIncidents, setShowIncidents] = useState<boolean>(true);
  const [showRescueTeams, setShowRescueTeams] = useState<boolean>(true);
  const [showFacilities, setShowFacilities] = useState<boolean>(true);
  const [filterSeverity, setFilterSeverity] = useState<string>('All');
  const [clickLocation, setClickLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [showNewIncidentModal, setShowNewIncidentModal] = useState<boolean>(false);
  const [newTitle, setNewTitle] = useState<string>('');
  const [newDisasterType, setNewDisasterType] = useState<string>('Building Collapse');
  const [newSeverity, setNewSeverity] = useState<string>('Moderate Damage');

  useEffect(() => {
    loadMapLayers();
  }, []);

  const loadMapLayers = async () => {
    try {
      const data = await api.getMapLayers();
      setMapData(data);
    } catch (err) {
      console.error("Map layer load error:", err);
    }
  };

  // Initialize Leaflet Map
  useEffect(() => {
    if (!mapContainerRef.current) return;
    if (mapInstanceRef.current) return;

    // Center on New Delhi metropolitan disaster sector
    const map = L.map(mapContainerRef.current, {
      center: [28.6139, 77.2090],
      zoom: 12,
      zoomControl: true,
    });

    // Dark-themed tactical tiles from CartoDB / OSM
    L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
      maxZoom: 19,
    }).addTo(map);

    const markersGroup = L.layerGroup().addTo(map);
    markersLayerRef.current = markersGroup;
    mapInstanceRef.current = map;

    // Click map to report incident at exact coordinates
    map.on('click', (e: L.LeafletMouseEvent) => {
      setClickLocation({ lat: e.latlng.lat, lng: e.latlng.lng });
      setShowNewIncidentModal(true);
    });

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Update Markers whenever data or layer toggles change
  useEffect(() => {
    if (!mapInstanceRef.current || !markersLayerRef.current || !mapData) return;

    markersLayerRef.current.clearLayers();

    // 1. Incidents Layer
    if (showIncidents && mapData.incidents) {
      mapData.incidents.forEach((inc: any) => {
        if (filterSeverity !== 'All' && inc.severity !== filterSeverity) return;

        // Custom SVG circle marker
        const marker = L.circleMarker([inc.latitude, inc.longitude], {
          radius: inc.severity === 'Critical Damage' ? 12 : 9,
          fillColor: inc.color,
          color: '#ffffff',
          weight: 2,
          opacity: 0.9,
          fillOpacity: 0.85,
        });

        marker.on('click', (e) => {
          L.DomEvent.stopPropagation(e);
          setSelectedIncident(inc);
        });

        marker.bindTooltip(`<b>${inc.code}</b>: ${inc.title} (${inc.severity})`, {
          direction: 'top',
          className: 'bg-slate-900 text-white font-mono text-xs border border-slate-700 p-1 rounded'
        });

        markersLayerRef.current?.addLayer(marker);
      });
    }

    // 2. Rescue Teams Layer
    if (showRescueTeams && mapData.rescue_teams) {
      mapData.rescue_teams.forEach((t: any) => {
        const teamIcon = L.divIcon({
          className: 'custom-team-icon',
          html: `<div style="background-color: #3b82f6; width: 22px; height: 22px; border-radius: 50%; border: 2px solid white; display: flex; align-items: center; justify-content: center; color: white; font-size: 10px; font-weight: bold; box-shadow: 0 0 8px rgba(59,130,246,0.8);">USAR</div>`,
          iconSize: [22, 22],
          iconAnchor: [11, 11]
        });

        const marker = L.marker([t.latitude, t.longitude], { icon: teamIcon });
        marker.bindTooltip(`<b>Team</b>: ${t.name} (${t.status})`, {
          direction: 'top'
        });
        markersLayerRef.current?.addLayer(marker);
      });
    }

    // 3. Hospitals & Shelters Layer
    if (showFacilities && mapData.facilities) {
      mapData.facilities.forEach((f: any) => {
        const isHospital = f.facility_type === 'Hospital';
        const facIcon = L.divIcon({
          className: 'custom-fac-icon',
          html: `<div style="background-color: ${isHospital ? '#10b981' : '#8b5cf6'}; width: 20px; height: 20px; border-radius: 4px; border: 2px solid white; display: flex; align-items: center; justify-content: center; color: white; font-size: 10px; font-weight: bold;">${isHospital ? 'H' : 'S'}</div>`,
          iconSize: [20, 20],
          iconAnchor: [10, 10]
        });

        const marker = L.marker([f.latitude, f.longitude], { icon: facIcon });
        marker.bindTooltip(`<b>${f.name}</b><br/>Available: ${f.available_capacity} / ${f.total_capacity}`, {
          direction: 'top'
        });
        markersLayerRef.current?.addLayer(marker);
      });
    }
  }, [mapData, showIncidents, showRescueTeams, showFacilities, filterSeverity]);

  const handleCreateIncidentAtClick = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!clickLocation) return;

    try {
      const inc = await api.createIncident({
        title: newTitle || `Incident at ${clickLocation.lat.toFixed(4)}, ${clickLocation.lng.toFixed(4)}`,
        disaster_type: newDisasterType,
        severity: newSeverity,
        location_name: `Coordinates: ${clickLocation.lat.toFixed(4)}, ${clickLocation.lng.toFixed(4)}`,
        latitude: clickLocation.lat,
        longitude: clickLocation.lng,
        affected_people_est: 10,
        critical_infra_affected: false,
        medical_emergency: false
      });
      alert(`Incident ${inc.incident_code} registered at map location!`);
      setShowNewIncidentModal(false);
      loadMapLayers();
    } catch (err: any) {
      alert(`Failed to add incident: ${err.message}`);
    }
  };

  return (
    <div className="space-y-4 pb-12 relative">
      {/* Header & Layer Controls Bar */}
      <div className="bg-[#0b1222] border border-slate-800 p-4 rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-blue-600/20 border border-blue-500/40 flex items-center justify-center text-blue-400">
            <MapIcon className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-extrabold text-white">Geospatial Disaster Operations Map</h1>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                Leaflet + OpenStreetMap
              </span>
            </div>
            <p className="text-xs text-slate-400 font-mono">
              Click anywhere on the map to log a new incident with precise coordinates
            </p>
          </div>
        </div>

        {/* Toggles & Filter */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <label className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-slate-300 cursor-pointer">
            <input
              type="checkbox"
              checked={showIncidents}
              onChange={(e) => setShowIncidents(e.target.checked)}
              className="rounded text-red-600 focus:ring-0"
            />
            <span>Incidents</span>
          </label>

          <label className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-slate-300 cursor-pointer">
            <input
              type="checkbox"
              checked={showRescueTeams}
              onChange={(e) => setShowRescueTeams(e.target.checked)}
              className="rounded text-blue-600 focus:ring-0"
            />
            <span>Rescue Units (USAR)</span>
          </label>

          <label className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-slate-300 cursor-pointer">
            <input
              type="checkbox"
              checked={showFacilities}
              onChange={(e) => setShowFacilities(e.target.checked)}
              className="rounded text-emerald-600 focus:ring-0"
            />
            <span>Hospitals & Shelters</span>
          </label>

          <select
            value={filterSeverity}
            onChange={(e) => setFilterSeverity(e.target.value)}
            className="px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-white font-mono focus:outline-none"
          >
            <option value="All">All Severity</option>
            <option value="Critical Damage">Critical (Red)</option>
            <option value="Severe Damage">Severe (Orange)</option>
            <option value="Moderate Damage">Moderate (Yellow)</option>
            <option value="Low Damage">Low (Green)</option>
            <option value="No Damage">No Damage (Green)</option>
          </select>
        </div>
      </div>

      {/* Full-Height Leaflet Map Container */}
      <div className="relative rounded-xl overflow-hidden border border-slate-800 shadow-2xl h-[650px] w-full bg-slate-900">
        <div ref={mapContainerRef} className="h-full w-full z-10" />

        {/* Floating Map Legend */}
        <div className="absolute bottom-4 left-4 z-20 bg-slate-900/90 backdrop-blur-md border border-slate-800 p-3 rounded-lg shadow-xl text-xs font-mono space-y-1.5 text-slate-300">
          <div className="font-bold text-white text-[11px] uppercase border-b border-slate-800 pb-1">
            Map Legend
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-[#ef4444] border border-white"></span>
            <span>Critical Damage</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-[#f97316] border border-white"></span>
            <span>Severe Damage</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-[#eab308] border border-white"></span>
            <span>Moderate Damage</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-[#10b981] border border-white"></span>
            <span>Low / No Damage</span>
          </div>
          <div className="flex items-center gap-2 pt-1 border-t border-slate-800">
            <span className="w-3 h-3 rounded-full bg-blue-500 border border-white"></span>
            <span>USAR Strike Team</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded bg-emerald-500 border border-white text-[8px] text-white flex items-center justify-center font-bold">H</span>
            <span>Hospital (Verified)</span>
          </div>
        </div>

        {/* Selected Incident Drawer / Popup */}
        {selectedIncident && (
          <div className="absolute top-4 right-4 z-20 w-80 bg-slate-900/95 backdrop-blur-md border border-slate-700 p-4 rounded-xl shadow-2xl text-xs space-y-3">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <span className="font-mono font-bold text-red-400">{selectedIncident.code}</span>
              <button onClick={() => setSelectedIncident(null)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div>
              <div className="text-sm font-bold text-white">{selectedIncident.title}</div>
              <div className="text-[11px] text-slate-400 font-mono mt-0.5">{selectedIncident.location_name}</div>
            </div>

            <div className="grid grid-cols-2 gap-2 font-mono text-[11px]">
              <div className="bg-slate-800/80 p-2 rounded">
                <span className="text-slate-500 block">SEVERITY:</span>
                <span className="text-white font-bold">{selectedIncident.severity}</span>
              </div>
              <div className="bg-slate-800/80 p-2 rounded">
                <span className="text-slate-500 block">PRIORITY:</span>
                <span className="text-red-400 font-bold">{selectedIncident.priority_score} / 100</span>
              </div>
            </div>

            <div className="text-[11px] text-slate-300">
              <span className="text-slate-500 font-mono">Affected People: </span>
              <span className="font-bold">{selectedIncident.affected_people}</span>
            </div>

            <div className="text-[11px] text-slate-300">
              <span className="text-slate-500 font-mono">GPS: </span>
              <span className="font-mono">{selectedIncident.latitude.toFixed(4)}, {selectedIncident.longitude.toFixed(4)}</span>
            </div>

            <div className="pt-2 border-t border-slate-800 flex gap-2">
              <button
                onClick={() => alert(`Assigned rescue squad to incident ${selectedIncident.code}`)}
                className="w-full py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs"
              >
                Dispatch Team
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Click-on-Map New Incident Modal */}
      {showNewIncidentModal && clickLocation && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0b1222] border border-slate-700 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <MapPin className="w-4 h-4 text-red-500" />
                Report Incident at Selected GPS Location
              </h3>
              <button onClick={() => setShowNewIncidentModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-2.5 rounded bg-slate-900 border border-slate-800 text-xs font-mono text-slate-300">
              Coordinates: <span className="text-white font-bold">{clickLocation.lat.toFixed(5)}, {clickLocation.lng.toFixed(5)}</span>
            </div>

            <form onSubmit={handleCreateIncidentAtClick} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Incident Title</label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. Metro Bridge Rubble Hazard"
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Disaster Type</label>
                <select
                  value={newDisasterType}
                  onChange={(e) => setNewDisasterType(e.target.value)}
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
                <label className="block text-slate-300 font-semibold mb-1">Estimated Severity</label>
                <select
                  value={newSeverity}
                  onChange={(e) => setNewSeverity(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white"
                >
                  <option value="Critical Damage">Critical Damage (Red)</option>
                  <option value="Severe Damage">Severe Damage (Orange)</option>
                  <option value="Moderate Damage">Moderate Damage (Yellow)</option>
                  <option value="Low Damage">Low Damage (Green)</option>
                  <option value="No Damage">No Damage (Green)</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowNewIncidentModal(false)}
                  className="px-3 py-2 rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-500 text-white font-bold"
                >
                  Register Incident
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
