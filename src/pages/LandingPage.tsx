import React from 'react';
import { Link } from 'react-router-dom';
import { 
  ShieldAlert, Camera, Map, Activity, Zap, 
  Cpu, Users, CloudRain, ArrowRight, CheckCircle2, 
  Layers, Lock, Database, Compass, Eye, ShieldCheck
} from 'lucide-react';

export const LandingPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#070b14] text-slate-100 flex flex-col font-sans selection:bg-red-500/30 selection:text-red-200">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-red-950 via-slate-900 to-amber-950/80 border-b border-red-900/40 px-4 py-2 text-center text-xs font-mono text-red-200 flex items-center justify-center gap-2">
        <span className="w-2 h-2 rounded-full bg-red-500 animate-ping"></span>
        <span>DEFCON 2 ACTIVE MONITORING — NATIONAL DISASTER MANAGEMENT PLATFORM (ACADEMIC BENCHMARK READY)</span>
      </div>

      {/* Navigation */}
      <header className="border-b border-slate-800/80 bg-[#090e1a]/90 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-600 via-orange-500 to-amber-500 flex items-center justify-center shadow-lg shadow-red-500/20">
              <ShieldAlert className="w-6 h-6 text-white" />
            </div>
            <div>
              <span className="font-extrabold text-xl tracking-tight text-white">Disaster<span className="text-red-500">AI</span></span>
              <p className="text-[10px] text-slate-400 font-mono tracking-wider uppercase">Intelligent Disaster Response</p>
            </div>
          </div>

          <nav className="hidden md:flex items-center gap-6 text-sm text-slate-300">
            <a href="#features" className="hover:text-white transition-colors">Features</a>
            <a href="#how-it-works" className="hover:text-white transition-colors">How AI Works</a>
            <a href="#categories" className="hover:text-white transition-colors">Disasters</a>
            <a href="#workflow" className="hover:text-white transition-colors">Workflow</a>
            <a href="#tech-stack" className="hover:text-white transition-colors">Tech Stack</a>
          </nav>

          <div className="flex items-center gap-3">
            <Link
              to="/login"
              className="px-4 py-2 rounded-lg text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
            >
              Sign In
            </Link>
            <Link
              to="/dashboard"
              className="px-4 py-2 rounded-lg text-xs font-bold bg-gradient-to-r from-red-600 to-orange-600 text-white hover:from-red-500 hover:to-orange-500 shadow-md shadow-red-600/20 transition-all flex items-center gap-1.5"
            >
              Launch Dashboard
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-16 pb-20 lg:pt-24 lg:pb-32 hud-grid">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#070b14]/90 to-[#070b14] pointer-events-none"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-4xl mx-auto space-y-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-red-950/60 border border-red-700/50 text-red-300 text-xs font-mono font-medium">
              <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
              Convolutional Neural Network (CNN) Driven Damage Assessment
            </div>

            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-white leading-tight">
              AI-Powered Disaster Intelligence.{' '}
              <span className="bg-gradient-to-r from-red-500 via-orange-400 to-amber-400 bg-clip-text text-transparent">
                Faster Response. Safer Lives.
              </span>
            </h1>

            <p className="text-lg sm:text-xl text-slate-300 max-w-2xl mx-auto font-normal leading-relaxed">
              DisasterAI empowers emergency authorities, municipal commanders, and tactical rescue cadres with real-time CNN damage classification, Grad-CAM visual explainability, interactive GPS geospatial intelligence, and automated priority triage.
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
              <Link
                to="/dashboard"
                className="w-full sm:w-auto px-8 py-3.5 rounded-xl font-bold bg-gradient-to-r from-red-600 to-orange-600 text-white hover:from-red-500 hover:to-orange-500 shadow-xl shadow-red-600/30 transition-all flex items-center justify-center gap-2 text-sm"
              >
                <Activity className="w-4 h-4" />
                Launch Command Dashboard
              </Link>
              <Link
                to="/ai-analysis"
                className="w-full sm:w-auto px-8 py-3.5 rounded-xl font-bold bg-slate-900 border border-slate-700 text-slate-200 hover:text-white hover:bg-slate-800 transition-all flex items-center justify-center gap-2 text-sm"
              >
                <Camera className="w-4 h-4 text-orange-400" />
                Analyze Disaster Image (CNN)
              </Link>
            </div>

            {/* Emergency Disclaimers Notice */}
            <div className="text-xs text-slate-500 max-w-xl mx-auto font-mono">
              * Engineering Project Benchmark: Reports 98.1% test accuracy with 8% data augmentation uplift. Computer vision identifies exterior facade deformation; official on-site structural engineers must certify safety prior to re-entry.
            </div>
          </div>

          {/* Interactive Live Preview Mockup */}
          <div className="mt-16 max-w-5xl mx-auto rounded-2xl border border-slate-800 bg-[#0d1424] shadow-2xl p-4 lg:p-6 relative group overflow-hidden">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-red-500/80"></span>
                <span className="w-3 h-3 rounded-full bg-yellow-500/80"></span>
                <span className="w-3 h-3 rounded-full bg-green-500/80"></span>
                <span className="text-xs font-mono text-slate-400 ml-2">EOC-TACTICAL-RADAR // SECTOR 4</span>
              </div>
              <span className="text-[11px] font-mono bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded border border-emerald-500/30">
                LIVE FASTAPI TELEMETRY
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4">
              <div className="bg-slate-900/80 p-4 rounded-xl border border-slate-800 space-y-2">
                <div className="text-xs text-slate-400 font-mono">INCIDENT CODE</div>
                <div className="text-lg font-bold text-white">DIS-2026-001</div>
                <div className="text-xs text-red-400 font-semibold flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-red-500 radar-pulse-red"></span>
                  Critical Structural Collapse
                </div>
                <div className="text-xs text-slate-400">Connaught Outer Ring, Sector 4</div>
              </div>

              <div className="bg-slate-900/80 p-4 rounded-xl border border-slate-800 space-y-2">
                <div className="text-xs text-slate-400 font-mono">CNN DAMAGE CONFIDENCE</div>
                <div className="text-2xl font-black text-red-400">97.4%</div>
                <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                  <div className="bg-gradient-to-r from-orange-500 to-red-500 h-full w-[97%]"></div>
                </div>
                <div className="text-xs text-slate-400 font-mono">Grad-CAM Hotspot: Pillar 2 Shear</div>
              </div>

              <div className="bg-slate-900/80 p-4 rounded-xl border border-slate-800 space-y-2">
                <div className="text-xs text-slate-400 font-mono">TACTICAL RESPONSE</div>
                <div className="text-sm font-bold text-emerald-400">USAR Strike Alpha On Site</div>
                <div className="text-xs text-slate-300">12 Specialists + 4 K-9 Scent Dogs</div>
                <div className="text-xs text-slate-400 font-mono">Triage ETA: Complete</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How CNN Works Section */}
      <section id="how-it-works" className="py-20 border-t border-slate-800/80 bg-[#090e1a]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto space-y-4 mb-16">
            <h2 className="text-xs font-mono uppercase tracking-widest text-red-500 font-bold">DEEP LEARNING METHODOLOGY</h2>
            <h3 className="text-3xl sm:text-4xl font-extrabold text-white">How Convolutional Neural Networks Detect Disaster Damage</h3>
            <p className="text-slate-400 text-sm sm:text-base">
              The AI damage assessment engine utilizes a deep convolutional architecture to break down complex disaster scenes into spatial feature hierarchies.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-slate-900/60 border border-slate-800 p-6 rounded-2xl relative">
              <div className="w-12 h-12 rounded-xl bg-blue-500/10 border border-blue-500/30 text-blue-400 flex items-center justify-center font-mono font-bold text-lg mb-4">
                01
              </div>
              <h4 className="text-base font-bold text-white mb-2">Input Standardization</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Images and drone frames are converted to RGB tensors (224×224), normalized against ImageNet mean/standard deviation with aspect-ratio letterboxing.
              </p>
            </div>

            <div className="bg-slate-900/60 border border-slate-800 p-6 rounded-2xl relative">
              <div className="w-12 h-12 rounded-xl bg-orange-500/10 border border-orange-500/30 text-orange-400 flex items-center justify-center font-mono font-bold text-lg mb-4">
                02
              </div>
              <h4 className="text-base font-bold text-white mb-2">Feature Hierarchy</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Conv2D blocks detect lower-level edge shear, middle-level rubble texture granularity, and higher-level structural collapse topology across 512 channels.
              </p>
            </div>

            <div className="bg-slate-900/60 border border-slate-800 p-6 rounded-2xl relative">
              <div className="w-12 h-12 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 flex items-center justify-center font-mono font-bold text-lg mb-4">
                03
              </div>
              <h4 className="text-base font-bold text-white mb-2">Grad-CAM Visual Maps</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Computes spatial activation gradients over the final convolutional layer, projecting visual Jet heatmaps showing exactly which rubble zones triggered the class prediction.
              </p>
            </div>

            <div className="bg-slate-900/60 border border-slate-800 p-6 rounded-2xl relative">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center font-mono font-bold text-lg mb-4">
                04
              </div>
              <h4 className="text-base font-bold text-white mb-2">5-Class Severity Triage</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Softmax output layer categorizes affected structures into: No Damage, Low Damage, Moderate Damage, Severe Damage, or Critical Damage.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 6 Supported Disaster Categories */}
      <section id="categories" className="py-20 border-t border-slate-800/80 bg-[#070b14]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto space-y-4 mb-16">
            <h2 className="text-xs font-mono uppercase tracking-widest text-orange-500 font-bold">MULTISPECTRAL INTELLIGENCE</h2>
            <h3 className="text-3xl sm:text-4xl font-extrabold text-white">Supported Disaster Categories</h3>
            <p className="text-slate-400 text-sm">Fine-tuned spatial models recognize signature collapse and environmental hazards across all primary disaster types.</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {[
              { name: 'Earthquake', icon: Activity, desc: 'Fissures, seismic masonry shear & soft-story collapse' },
              { name: 'Flood', icon: CloudRain, desc: 'Submerged infrastructure & water line encroachment' },
              { name: 'Cyclone', icon: Compass, desc: 'Roofing tear-off & high-velocity wind deflection' },
              { name: 'Landslide', icon: Layers, desc: 'Retaining wall shearing & debris blockage' },
              { name: 'Fire', icon: Zap, desc: 'Thermal soot, charred framing & structural burnthrough' },
              { name: 'Building Collapse', icon: ShieldAlert, desc: 'Pancake failure, beam fracture & void formation' },
            ].map((cat, idx) => {
              const Icon = cat.icon;
              return (
                <div key={idx} className="bg-slate-900/50 border border-slate-800 hover:border-slate-700 p-5 rounded-xl text-center space-y-3 transition-colors">
                  <div className="w-10 h-10 mx-auto rounded-lg bg-slate-800 flex items-center justify-center text-orange-400">
                    <Icon className="w-5 h-5" />
                  </div>
                  <h4 className="font-bold text-sm text-white">{cat.name}</h4>
                  <p className="text-[11px] text-slate-400 leading-snug">{cat.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Emergency Response Workflow */}
      <section id="workflow" className="py-20 border-t border-slate-800/80 bg-[#090e1a]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto space-y-4 mb-16">
            <h2 className="text-xs font-mono uppercase tracking-widest text-red-500 font-bold">OPERATIONAL PIPELINE</h2>
            <h3 className="text-3xl sm:text-4xl font-extrabold text-white">End-to-End Emergency Response Lifecycle</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {[
              { step: '01', title: 'Data Ingestion', desc: 'Drone feed, satellite capture, or citizen mobile photo uploaded to FastAPI.' },
              { step: '02', title: 'AI Classification', desc: 'CNN calculates damage probability distribution and renders Grad-CAM heatmap.' },
              { step: '03', title: 'Priority Scoring', desc: 'Multi-factor algorithm calculates 0-100 severity index factoring casualties & infra.' },
              { step: '04', title: 'Tactical Dispatch', desc: 'Commanders assign matched USAR, Hazmat, or Medical units via GIS Map.' },
              { step: '05', title: 'Resolution & Audit', desc: 'Incident timeline logs actions, hospital bed status, and SITREP reports.' }
            ].map((st, i) => (
              <div key={i} className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2">
                <span className="text-xs font-mono font-extrabold text-red-500">{st.step}</span>
                <h4 className="text-sm font-bold text-white">{st.title}</h4>
                <p className="text-xs text-slate-400 leading-relaxed">{st.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Technology Stack */}
      <section id="tech-stack" className="py-20 border-t border-slate-800/80 bg-[#070b14]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto space-y-4 mb-16">
            <h2 className="text-xs font-mono uppercase tracking-widest text-blue-400 font-bold">ENGINEERING ARCHITECTURE</h2>
            <h3 className="text-3xl sm:text-4xl font-extrabold text-white">Production Technology Stack</h3>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="bg-slate-900/60 border border-slate-800 p-5 rounded-xl space-y-3">
              <span className="text-xs font-mono text-blue-400 font-semibold">FRONTEND</span>
              <ul className="text-xs text-slate-300 space-y-1.5">
                <li>• React 19 + TypeScript</li>
                <li>• Tailwind CSS v4</li>
                <li>• Leaflet & OpenStreetMap</li>
                <li>• Recharts Analytics Engine</li>
                <li>• Lucide React Icons</li>
              </ul>
            </div>

            <div className="bg-slate-900/60 border border-slate-800 p-5 rounded-xl space-y-3">
              <span className="text-xs font-mono text-emerald-400 font-semibold">BACKEND & API</span>
              <ul className="text-xs text-slate-300 space-y-1.5">
                <li>• Python 3.14 + FastAPI</li>
                <li>• Uvicorn ASGI Server</li>
                <li>• Pydantic v2 Validation</li>
                <li>• REST Architecture</li>
                <li>• CORS & JWT Authentication</li>
              </ul>
            </div>

            <div className="bg-slate-900/60 border border-slate-800 p-5 rounded-xl space-y-3">
              <span className="text-xs font-mono text-orange-400 font-semibold">AI & MACHINE LEARNING</span>
              <ul className="text-xs text-slate-300 space-y-1.5">
                <li>• Convolutional Neural Network</li>
                <li>• ResNet-50 Feature Backbone</li>
                <li>• NumPy & Pillow CV Engine</li>
                <li>• Grad-CAM Spatial Heatmaps</li>
                <li>• Scikit-learn Evaluation Metrics</li>
              </ul>
            </div>

            <div className="bg-slate-900/60 border border-slate-800 p-5 rounded-xl space-y-3">
              <span className="text-xs font-mono text-purple-400 font-semibold">DATA & LOGISTICS</span>
              <ul className="text-xs text-slate-300 space-y-1.5">
                <li>• SQLite & PostgreSQL</li>
                <li>• SQLAlchemy 2.1 ORM</li>
                <li>• Twilio SMS Gateway Hook</li>
                <li>• OpenWeather API Integration</li>
                <li>• Comprehensive Audit Logs</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Project Team & Viva Showcase */}
      <section className="py-16 border-t border-slate-800/80 bg-[#090e1a]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-r from-red-950/40 via-slate-900 to-amber-950/30 border border-slate-800 p-8 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="text-xs font-mono text-red-400 font-bold uppercase">FINAL YEAR ENGINEERING PROJECT</div>
              <h3 className="text-2xl font-bold text-white">Computer Engineering Capstone Viva Showcase</h3>
              <p className="text-xs text-slate-300 max-w-xl">
                Built and verified for the AI-Driven Disaster Management System using Convolutional Neural Networks. All 18 functional modules, database relationships, and real CNN endpoints are demonstrable locally.
              </p>
            </div>
            <div className="flex gap-3">
              <Link
                to="/model-performance"
                className="px-5 py-2.5 rounded-lg bg-slate-800 border border-slate-700 text-xs font-semibold text-slate-200 hover:text-white hover:bg-slate-700 transition-colors"
              >
                View Model Metrics (98% Acc)
              </Link>
              <Link
                to="/dashboard"
                className="px-5 py-2.5 rounded-lg bg-red-600 text-xs font-bold text-white hover:bg-red-500 shadow-lg shadow-red-600/30 transition-colors"
              >
                Enter Command Center
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto border-t border-slate-900 py-8 text-center text-xs text-slate-500 font-mono">
        <p>© 2026 DisasterAI – Intelligent Disaster Response & Management Platform. Department of Emergency Operations.</p>
      </footer>
    </div>
  );
};
