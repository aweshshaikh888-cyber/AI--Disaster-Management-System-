import React, { useState, useEffect } from 'react';
import { 
  Video, Radio, Battery, Compass, ArrowUp, 
  Upload, AlertTriangle, ShieldCheck, Play, Pause,
  Layers, Camera, CheckCircle2, RefreshCw
} from 'lucide-react';
import { api } from '../services/api';
import { Drone } from '../types';

export const DroneMonitoringPage: React.FC = () => {
  const [drones, setDrones] = useState<Drone[]>([]);
  const [selectedDrone, setSelectedDrone] = useState<Drone | null>(null);
  const [detections, setDetections] = useState<any[]>([]);
  const [isRecording, setIsRecording] = useState<boolean>(true);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [uploadStatus, setUploadStatus] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState<boolean>(false);

  useEffect(() => {
    loadDrones();
  }, []);

  const loadDrones = async () => {
    try {
      const droneList = await api.getDrones();
      const detList = await api.getDetections();
      setDrones(droneList);
      if (droneList.length > 0) setSelectedDrone(droneList[0]);
      setDetections(detList);
    } catch (err) {
      console.error("Drone data load error:", err);
    }
  };

  const handleVideoUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!videoFile) return;
    setIsUploading(true);
    setUploadStatus(null);
    try {
      const formData = new FormData();
      formData.append('file', videoFile);
      const res = await api.uploadDroneVideo(formData);
      setUploadStatus(res.message);
    } catch (err: any) {
      setUploadStatus(err.message || 'Video upload failed');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="space-y-6 pb-16">
      {/* Header */}
      <div className="bg-slate-900/60 border border-slate-800 p-4 rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-red-600/20 border border-red-500/40 flex items-center justify-center text-red-400">
            <Video className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-extrabold text-white">Live Tactical Drone Aerial Monitoring</h1>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                UAV RTK Link
              </span>
            </div>
            <p className="text-xs text-slate-400 font-mono">
              Real-time video telemetry, flight avionics HUD, and automated damage detection stream
            </p>
          </div>
        </div>

        {/* Simulator Banner */}
        <div className="text-xs font-mono bg-slate-900 border border-amber-700/50 text-amber-400 px-3 py-1.5 rounded-lg flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping"></span>
          <span>CALIBRATED DEMO UAV FEED (No Physical Hardware Required)</span>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Video Stream & Telemetry HUD (8 cols) */}
        <div className="lg:col-span-8 space-y-4">
          <div className="bg-[#0b1222] border border-slate-800 rounded-xl overflow-hidden shadow-2xl relative">
            {/* Top HUD Overlay */}
            <div className="absolute top-3 left-3 right-3 z-20 flex items-center justify-between text-xs font-mono pointer-events-none">
              <div className="bg-black/70 backdrop-blur-md px-3 py-1 rounded border border-slate-700 text-emerald-400 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                <span>{selectedDrone?.id || 'DRONE-ALPHA-01'} // LIVE FEED</span>
              </div>

              <div className="flex items-center gap-2">
                <div className="bg-black/70 backdrop-blur-md px-3 py-1 rounded border border-slate-700 text-white flex items-center gap-1.5">
                  <Battery className="w-3.5 h-3.5 text-emerald-400" />
                  <span>{selectedDrone?.battery_pct ?? 84}%</span>
                </div>
                <div className="bg-black/70 backdrop-blur-md px-3 py-1 rounded border border-slate-700 text-red-400 flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
                  <span>REC 00:24:18</span>
                </div>
              </div>
            </div>

            {/* Video Viewport */}
            <div className="aspect-video w-full bg-black relative flex items-center justify-center">
              {selectedDrone?.feed_url ? (
                <video
                  src={selectedDrone.feed_url}
                  autoPlay
                  loop
                  muted
                  playsInline
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="text-center p-8 space-y-3">
                  <Radio className="w-12 h-12 text-slate-600 mx-auto animate-pulse" />
                  <div className="text-sm font-mono text-slate-400">CONNECTING TO HIGH-ALTITUDE SATELLITE RELAY...</div>
                  <div className="text-xs text-slate-600 font-mono">UAV STANDBY MODE</div>
                </div>
              )}

              {/* Tactical Crosshair Overlay */}
              <div className="absolute inset-0 pointer-events-none border border-slate-800/40 flex items-center justify-center">
                <div className="w-24 h-24 border border-red-500/30 rounded-full flex items-center justify-center">
                  <div className="w-2 h-2 bg-red-500/60 rounded-full"></div>
                </div>
              </div>

              {/* Bottom Telemetry Bar */}
              <div className="absolute bottom-3 left-3 right-3 z-20 bg-black/75 backdrop-blur-md border border-slate-700/80 rounded-lg p-2.5 flex items-center justify-between text-xs font-mono text-slate-300">
                <div className="flex items-center gap-4">
                  <div>ALT: <span className="text-white font-bold">{selectedDrone?.altitude_m ?? 125.4}m</span></div>
                  <div>SPD: <span className="text-white font-bold">{selectedDrone?.speed_kmh ?? 32.5} km/h</span></div>
                  <div>HDG: <span className="text-white font-bold">{selectedDrone?.heading_deg ?? 142}°</span></div>
                </div>
                <div className="text-right">
                  <span>GPS: {selectedDrone?.latitude.toFixed(4)}, {selectedDrone?.longitude.toFixed(4)}</span>
                </div>
              </div>
            </div>

            {/* Controls */}
            <div className="p-3 bg-slate-900 border-t border-slate-800 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsRecording(!isRecording)}
                  className={`px-3 py-1.5 rounded font-mono font-semibold flex items-center gap-1.5 ${
                    isRecording ? 'bg-red-600 text-white' : 'bg-slate-800 text-slate-300'
                  }`}
                >
                  {isRecording ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                  {isRecording ? 'Pause Recording' : 'Resume Recording'}
                </button>
                <span className="text-slate-400 font-mono">Mission: {selectedDrone?.mission}</span>
              </div>

              <span className="text-slate-400 font-mono">Signal: {selectedDrone?.connection_signal}</span>
            </div>
          </div>

          {/* Upload Recorded Video Option */}
          <div className="bg-[#0b1222] border border-slate-800 p-4 rounded-xl space-y-3">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Upload className="w-4 h-4 text-orange-400" />
              Upload Recorded Drone Inspection Video
            </h3>
            <form onSubmit={handleVideoUpload} className="flex flex-col sm:flex-row items-center gap-3">
              <input
                type="file"
                accept="video/mp4,video/avi,video/mov"
                onChange={(e) => e.target.files && setVideoFile(e.target.files[0])}
                className="text-xs text-slate-300 file:mr-3 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-slate-800 file:text-slate-200 hover:file:bg-slate-700 w-full"
              />
              <button
                type="submit"
                disabled={isUploading || !videoFile}
                className="w-full sm:w-auto px-4 py-2 rounded-lg bg-orange-600 hover:bg-orange-500 text-white font-bold text-xs shrink-0 flex items-center justify-center gap-1.5 transition-colors disabled:opacity-50"
              >
                {isUploading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Upload className="w-3.5 h-3.5" />}
                Ingest & Process Video
              </button>
            </form>
            {uploadStatus && (
              <div className="p-2.5 rounded bg-emerald-950/50 border border-emerald-800 text-xs text-emerald-300 font-mono">
                {uploadStatus}
              </div>
            )}
          </div>
        </div>

        {/* Right: Drone Selector & Detection Events (4 cols) */}
        <div className="lg:col-span-4 space-y-4">
          {/* Drone Selector */}
          <div className="bg-[#0b1222] border border-slate-800 p-4 rounded-xl space-y-3">
            <h3 className="text-xs font-mono uppercase tracking-wider font-bold text-slate-400">
              Active UAV Squadron Roster
            </h3>

            <div className="space-y-2">
              {drones.map((d) => (
                <button
                  key={d.id}
                  onClick={() => setSelectedDrone(d)}
                  className={`w-full text-left p-3 rounded-lg border transition-all ${
                    selectedDrone?.id === d.id
                      ? 'bg-slate-800/90 border-red-500/80 shadow-md'
                      : 'bg-slate-900/50 border-slate-800 hover:bg-slate-800/40'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-white">{d.name}</span>
                    <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${
                      d.status.includes('Online') ? 'bg-emerald-950 text-emerald-300' : 'bg-slate-800 text-slate-400'
                    }`}>
                      {d.status}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-400 font-mono mt-1">Camera: {d.camera_mode}</div>
                  <div className="flex items-center justify-between text-[10px] text-slate-500 font-mono mt-2">
                    <span>Battery: {d.battery_pct}%</span>
                    <span>Alt: {d.altitude_m}m</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* AI Detection Event Feed */}
          <div className="bg-[#0b1222] border border-slate-800 p-4 rounded-xl space-y-3">
            <h3 className="text-xs font-mono uppercase tracking-wider font-bold text-red-400 flex items-center gap-1.5">
              <AlertTriangle className="w-3.5 h-3.5" />
              Real-Time AI Damage Detections
            </h3>

            <div className="space-y-2.5">
              {detections.map((det) => (
                <div key={det.id} className="p-3 rounded-lg bg-slate-900/80 border border-slate-800 space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-white">{det.event_type}</span>
                    <span className="text-[10px] font-mono text-slate-400">{det.timestamp}</span>
                  </div>
                  <div className="flex items-center justify-between text-[11px] font-mono">
                    <span className="text-red-400 font-semibold">{det.damage_level}</span>
                    <span className="text-emerald-400 font-bold">{Math.round(det.confidence * 100)}% Conf</span>
                  </div>
                  <div className="text-[10px] text-slate-400 font-mono truncate">GPS: {det.coordinates}</div>
                  <div className="text-[10px] text-slate-300 bg-slate-800 px-2 py-1 rounded mt-1 font-mono">
                    Action: {det.action_taken}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
