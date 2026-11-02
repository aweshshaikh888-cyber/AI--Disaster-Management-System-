import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Upload, Camera, AlertTriangle, ShieldCheck, 
  MapPin, CheckCircle2, RefreshCw, FileDown, PlusCircle,
  Eye, Zap, Cpu, AlertOctagon, HelpCircle
} from 'lucide-react';
import { api, API_BASE } from '../services/api';
import { AIAnalysisResult, DisasterType } from '../types';

export const AIAnalysisPage: React.FC = () => {
  const navigate = useNavigate();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [disasterType, setDisasterType] = useState<DisasterType>('Building Collapse');
  const [locationName, setLocationName] = useState<string>('Sector 4 Commercial Plaza, New Delhi');
  const [latitude, setLatitude] = useState<number>(28.6328);
  const [longitude, setLongitude] = useState<number>(77.2197);
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [analysisResult, setAnalysisResult] = useState<AIAnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'side-by-side' | 'gradcam-only' | 'orig-only'>('side-by-side');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      setAnalysisResult(null);
      setError(null);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      setAnalysisResult(null);
      setError(null);
    }
  };

  const handleSampleImage = async (sampleType: string) => {
    // Generate a quick sample image blob so user can click a button to test without having files on disk!
    const canvas = document.createElement('canvas');
    canvas.width = 400;
    canvas.height = 300;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      // Draw simulated rubble/disaster backdrop
      ctx.fillStyle = sampleType === 'Fire' ? '#2c0c04' : '#222938';
      ctx.fillRect(0, 0, 400, 300);
      
      // Draw rubble cracks
      ctx.strokeStyle = sampleType === 'Fire' ? '#f97316' : '#ef4444';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(80, 50);
      ctx.lineTo(200, 180);
      ctx.lineTo(320, 120);
      ctx.stroke();

      ctx.fillStyle = '#64748b';
      ctx.fillRect(150, 150, 120, 80);
      
      ctx.fillStyle = '#ffffff';
      ctx.font = '14px monospace';
      ctx.fillText(`SIMULATED ${sampleType.toUpperCase()} CAPTURE`, 30, 260);

      canvas.toBlob((blob) => {
        if (blob) {
          const file = new File([blob], `${sampleType.toLowerCase()}_sample_drone_frame.jpg`, { type: 'image/jpeg' });
          setSelectedFile(file);
          setPreviewUrl(URL.createObjectURL(file));
          setDisasterType(sampleType as DisasterType);
          setAnalysisResult(null);
        }
      }, 'image/jpeg');
    }
  };

  const runAnalysis = async () => {
    if (!selectedFile) {
      setError('Please select or drag an image file to analyze.');
      return;
    }

    setIsAnalyzing(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('disaster_type', disasterType);
      formData.append('location_name', locationName);
      formData.append('latitude', latitude.toString());
      formData.append('longitude', longitude.toString());

      const res = await api.analyzeImage(formData);
      setAnalysisResult(res);
    } catch (err: any) {
      setError(err.message || 'Image analysis failed.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const createIncidentFromAnalysis = async () => {
    if (!analysisResult) return;
    try {
      const inc = await api.createIncident({
        title: `${disasterType} Damage at ${locationName}`,
        disaster_type: disasterType,
        severity: analysisResult.predicted_class,
        description: `Automated incident created from AI analysis. Confidence: ${analysisResult.confidence_percentage}%. Grad-CAM hotspot validated.`,
        location_name: locationName,
        latitude: latitude,
        longitude: longitude,
        image_url: analysisResult.image_url,
        gradcam_url: analysisResult.gradcam_url,
        affected_people_est: analysisResult.predicted_class === 'Critical Damage' ? 50 : 15,
        critical_infra_affected: analysisResult.predicted_class === 'Critical Damage',
        medical_emergency: analysisResult.predicted_class === 'Critical Damage'
      });
      alert(`Incident ${inc.incident_code} successfully registered!`);
      navigate('/incidents');
    } catch (err: any) {
      alert(`Failed to create incident: ${err.message}`);
    }
  };

  return (
    <div className="space-y-6 pb-16">
      {/* Header */}
      <div className="bg-slate-900/60 border border-slate-800 p-4 rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-orange-600/20 border border-orange-500/40 flex items-center justify-center text-orange-400">
            <Camera className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-extrabold text-white">AI Disaster Image Analysis</h1>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 border border-blue-500/30">
                CNN ResNet-50 + Grad-CAM
              </span>
            </div>
            <p className="text-xs text-slate-400 font-mono">
              Upload aerial drone footage or ground imagery for automated 5-class structural damage triage
            </p>
          </div>
        </div>

        {/* Quick Sample Buttons */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400 font-mono">Load Demo Frame:</span>
          <button
            type="button"
            onClick={() => handleSampleImage('Building Collapse')}
            className="px-2.5 py-1 text-xs rounded bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700"
          >
            Collapse
          </button>
          <button
            type="button"
            onClick={() => handleSampleImage('Fire')}
            className="px-2.5 py-1 text-xs rounded bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700"
          >
            Fire
          </button>
          <button
            type="button"
            onClick={() => handleSampleImage('Flood')}
            className="px-2.5 py-1 text-xs rounded bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700"
          >
            Flood
          </button>
        </div>
      </div>

      {error && (
        <div className="p-3 rounded-lg bg-red-950/70 border border-red-800 text-xs text-red-300 flex items-center gap-2">
          <AlertOctagon className="w-4 h-4 text-red-400 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Main Workspace Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Upload & Metadata Input (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-[#0b1222] border border-slate-800 p-5 rounded-xl space-y-4">
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <Upload className="w-4 h-4 text-orange-400" />
              1. Image Ingestion
            </h2>

            {/* Drag & Drop Zone */}
            <div
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleDrop}
              className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-colors ${
                previewUrl ? 'border-orange-500/50 bg-slate-900/40' : 'border-slate-700 hover:border-slate-500 bg-slate-900/20'
              }`}
              onClick={() => document.getElementById('imageFileInput')?.click()}
            >
              <input
                id="imageFileInput"
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={handleFileChange}
                className="hidden"
              />

              {previewUrl ? (
                <div className="space-y-3">
                  <img
                    src={previewUrl}
                    alt="Uploaded preview"
                    className="max-h-52 mx-auto rounded-lg object-cover border border-slate-700"
                  />
                  <div className="text-xs text-slate-300 font-mono truncate">{selectedFile?.name}</div>
                  <span className="text-[11px] text-orange-400 hover:underline">Click or drop to replace</span>
                </div>
              ) : (
                <div className="space-y-2 py-4">
                  <div className="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center mx-auto text-slate-400">
                    <Upload className="w-6 h-6" />
                  </div>
                  <div className="text-sm font-semibold text-white">Drag & drop disaster photo here</div>
                  <p className="text-xs text-slate-400">JPG, PNG, WEBP (Max 20MB)</p>
                  <span className="inline-block mt-2 px-3 py-1 bg-slate-800 text-slate-300 rounded text-xs">
                    Browse Local File
                  </span>
                </div>
              )}
            </div>

            {/* Incident Metadata */}
            <div className="space-y-3 pt-2">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Disaster Category</label>
                <select
                  value={disasterType}
                  onChange={(e) => setDisasterType(e.target.value as DisasterType)}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white focus:outline-none focus:border-orange-500"
                >
                  <option value="Building Collapse">Building Collapse</option>
                  <option value="Earthquake">Earthquake</option>
                  <option value="Flood">Flood</option>
                  <option value="Cyclone">Cyclone</option>
                  <option value="Landslide">Landslide</option>
                  <option value="Fire">Fire</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Incident Location Name</label>
                <input
                  type="text"
                  value={locationName}
                  onChange={(e) => setLocationName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white focus:outline-none focus:border-orange-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Latitude</label>
                  <input
                    type="number"
                    step="0.0001"
                    value={latitude}
                    onChange={(e) => setLatitude(parseFloat(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Longitude</label>
                  <input
                    type="number"
                    step="0.0001"
                    value={longitude}
                    onChange={(e) => setLongitude(parseFloat(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white font-mono"
                  />
                </div>
              </div>
            </div>

            {/* Run Button */}
            <button
              type="button"
              onClick={runAnalysis}
              disabled={isAnalyzing || !selectedFile}
              className={`w-full py-3 rounded-xl font-bold text-sm text-white shadow-xl transition-all flex items-center justify-center gap-2 ${
                isAnalyzing || !selectedFile
                  ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                  : 'bg-gradient-to-r from-red-600 via-orange-600 to-amber-600 hover:from-red-500 hover:to-orange-500 shadow-orange-600/30'
              }`}
            >
              {isAnalyzing ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  Running CNN Forward Pass & Grad-CAM...
                </>
              ) : (
                <>
                  <Cpu className="w-4 h-4" />
                  Execute AI Damage Classification
                </>
              )}
            </button>
          </div>
        </div>

        {/* Right: Results & Grad-CAM Heatmap (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          {analysisResult ? (
            <div className="bg-[#0b1222] border border-slate-800 p-5 rounded-xl space-y-6">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div>
                  <span className="text-[10px] font-mono uppercase tracking-wider text-orange-400 font-bold">
                    INFERENCE VERDICT // {analysisResult.model_name}
                  </span>
                  <div className="text-xl font-extrabold text-white flex items-center gap-2 mt-0.5">
                    <span>{analysisResult.predicted_class}</span>
                    <span className="text-xs font-mono px-2 py-0.5 rounded bg-red-950 border border-red-700 text-red-400">
                      {analysisResult.severity_level}
                    </span>
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-xs text-slate-400 font-mono">CONFIDENCE</div>
                  <div className="text-2xl font-black text-emerald-400">{analysisResult.confidence_percentage}%</div>
                </div>
              </div>

              {/* View Mode Switcher */}
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-300">Visual Evidence & Spatial Feature Map:</span>
                <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-lg border border-slate-800 text-xs">
                  <button
                    onClick={() => setViewMode('side-by-side')}
                    className={`px-2 py-1 rounded transition-colors ${viewMode === 'side-by-side' ? 'bg-slate-700 text-white font-bold' : 'text-slate-400'}`}
                  >
                    Side-by-Side
                  </button>
                  <button
                    onClick={() => setViewMode('gradcam-only')}
                    className={`px-2 py-1 rounded transition-colors ${viewMode === 'gradcam-only' ? 'bg-slate-700 text-white font-bold' : 'text-slate-400'}`}
                  >
                    Grad-CAM
                  </button>
                  <button
                    onClick={() => setViewMode('orig-only')}
                    className={`px-2 py-1 rounded transition-colors ${viewMode === 'orig-only' ? 'bg-slate-700 text-white font-bold' : 'text-slate-400'}`}
                  >
                    Original
                  </button>
                </div>
              </div>

              {/* Image Inspection Display */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {(viewMode === 'side-by-side' || viewMode === 'orig-only') && (
                  <div className="space-y-1.5">
                    <span className="text-[11px] font-mono text-slate-400">ORIGINAL CAPTURE:</span>
                    <div className="rounded-lg overflow-hidden border border-slate-800 bg-black aspect-video flex items-center justify-center">
                      <img
                        src={`http://127.0.0.1:8000${analysisResult.image_url}`}
                        alt="Original"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </div>
                )}

                {(viewMode === 'side-by-side' || viewMode === 'gradcam-only') && (
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-mono text-red-400 font-bold">GRAD-CAM ACTIVATION HEATMAP:</span>
                      <span className="text-[10px] text-slate-500 font-mono">Red = High Rubble Influence</span>
                    </div>
                    <div className="rounded-lg overflow-hidden border border-red-900/50 bg-black aspect-video flex items-center justify-center relative">
                      <img
                        src={`http://127.0.0.1:8000${analysisResult.gradcam_url}`}
                        alt="Grad-CAM"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* 5-Class Probability Distribution */}
              <div className="space-y-2">
                <span className="text-xs font-semibold text-slate-300">Damage Probability Distribution across 5 Classes:</span>
                <div className="space-y-1.5">
                  {Object.entries(analysisResult.class_probabilities).map(([cls, prob]) => {
                    const pct = Math.round(prob * 100);
                    return (
                      <div key={cls} className="space-y-0.5">
                        <div className="flex justify-between text-[11px] font-mono">
                          <span className={cls === analysisResult.predicted_class ? 'text-white font-bold' : 'text-slate-400'}>{cls}</span>
                          <span className="text-slate-300">{pct}%</span>
                        </div>
                        <div className="w-full bg-slate-900 h-1.5 rounded-full overflow-hidden">
                          <div
                            className={`h-full ${
                              cls === 'Critical Damage' ? 'bg-red-500' :
                              cls === 'Severe Damage' ? 'bg-orange-500' :
                              cls === 'Moderate Damage' ? 'bg-amber-500' : 'bg-emerald-500'
                            }`}
                            style={{ width: `${pct}%` }}
                          ></div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Recommended Next Steps */}
              <div className="space-y-2 bg-slate-900/80 p-4 rounded-xl border border-slate-800">
                <h4 className="text-xs font-bold text-orange-400 uppercase tracking-wider font-mono flex items-center gap-1.5">
                  <Zap className="w-3.5 h-3.5" />
                  Operational Response Protocol:
                </h4>
                <ul className="text-xs text-slate-300 space-y-1.5">
                  {analysisResult.recommended_actions.map((act, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="text-orange-400 font-bold">•</span>
                      <span>{act}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Mandatory Structural Safety Warning */}
              <div className="p-3 rounded-lg bg-amber-950/40 border border-amber-800/60 text-xs text-amber-300 flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <p className="leading-relaxed">
                  {analysisResult.structural_safety_disclaimer}
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={createIncidentFromAnalysis}
                  className="w-full sm:w-auto px-5 py-2.5 rounded-lg bg-red-600 hover:bg-red-500 text-white font-bold text-xs shadow-md shadow-red-600/30 flex items-center justify-center gap-2 transition-all"
                >
                  <PlusCircle className="w-4 h-4" />
                  Convert to Official Incident
                </button>

                <button
                  type="button"
                  onClick={() => window.print()}
                  className="w-full sm:w-auto px-4 py-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs border border-slate-700 flex items-center justify-center gap-2 transition-colors"
                >
                  <FileDown className="w-4 h-4" />
                  Print / Save Analysis Report
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-[#0b1222] border border-slate-800 p-12 rounded-xl text-center space-y-4">
              <div className="w-16 h-16 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center mx-auto text-slate-500">
                <Cpu className="w-8 h-8" />
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-bold text-white">Awaiting Disaster Image Ingestion</h3>
                <p className="text-xs text-slate-400 max-w-md mx-auto">
                  Select a local disaster photograph or click one of the preset demo frames above to trigger the convolutional feature extraction pipeline.
                </p>
              </div>
              <div className="pt-4 grid grid-cols-3 gap-2 max-w-sm mx-auto text-[11px] font-mono text-slate-500">
                <div className="border border-slate-800/80 p-2 rounded">224×224 Tensor</div>
                <div className="border border-slate-800/80 p-2 rounded">Sobel Gradient</div>
                <div className="border border-slate-800/80 p-2 rounded">Grad-CAM Jet</div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
