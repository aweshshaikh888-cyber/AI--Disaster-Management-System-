import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ShieldAlert, Lock, User, Mail, ShieldCheck, ArrowRight, AlertCircle, CheckCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { UserRole } from '../types';

export const LoginPage: React.FC = () => {
  const { login, register, demoLogin, isLoading } = useAuth();
  const navigate = useNavigate();
  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<UserRole>('OFFICER');
  const [agency, setAgency] = useState('National Disaster Management Authority');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      if (isRegisterMode) {
        await register({ username, email, password, role, agency });
      } else {
        await login(username, password);
      }
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Authentication failed. Please verify credentials.');
    }
  };

  const handleDemoClick = async (demoRole: UserRole) => {
    setError(null);
    try {
      await demoLogin(demoRole);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Demo authentication failed.');
    }
  };

  return (
    <div className="min-h-screen bg-[#070b14] text-slate-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8 hud-grid relative">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center space-y-3">
        <Link to="/" className="inline-flex items-center gap-2.5">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-red-600 to-orange-500 flex items-center justify-center shadow-lg shadow-red-500/20">
            <ShieldAlert className="w-7 h-7 text-white" />
          </div>
          <span className="font-extrabold text-2xl tracking-tight text-white">Disaster<span className="text-red-500">AI</span></span>
        </Link>
        <h2 className="text-2xl font-bold tracking-tight text-white">
          {isRegisterMode ? 'Register Emergency Personnel' : 'Operational Access Portal'}
        </h2>
        <p className="text-xs text-slate-400 font-mono">
          Authorized Emergency Response Personnel & Command Triage
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-[#0b1222] py-8 px-4 shadow-2xl border border-slate-800 sm:rounded-2xl sm:px-10 space-y-6">
          {error && (
            <div className="p-3 rounded-lg bg-red-950/60 border border-red-800 text-xs text-red-300 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
              <span>{error}</span>
            </div>
          )}

          {/* Form */}
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Username</label>
              <div className="relative">
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="e.g. officer_ops"
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:border-red-500 transition-colors"
                />
              </div>
            </div>

            {isRegisterMode && (
              <>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Official Email</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="officer@disasterai.gov"
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:border-red-500 transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Assigned Role</label>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value as UserRole)}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:border-red-500 transition-colors"
                  >
                    <option value="OFFICER">Disaster Management Officer</option>
                    <option value="RESCUE">Rescue Team Member</option>
                    <option value="ANALYST">Analyst / Researcher</option>
                    <option value="ADMIN">Administrator</option>
                  </select>
                </div>
              </>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Password</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:border-red-500 transition-colors"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2.5 px-4 rounded-lg bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-500 hover:to-orange-500 text-white font-bold text-sm shadow-lg shadow-red-600/30 transition-all flex items-center justify-center gap-2"
            >
              {isLoading ? 'Authenticating...' : isRegisterMode ? 'Create Account' : 'Authenticate & Enter'}
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <div className="text-center">
            <button
              type="button"
              onClick={() => setIsRegisterMode(!isRegisterMode)}
              className="text-xs text-slate-400 hover:text-white transition-colors"
            >
              {isRegisterMode ? 'Already registered? Log in here' : "Need credentials? Register an account"}
            </button>
          </div>

          {/* Quick Demo Switcher */}
          <div className="pt-4 border-t border-slate-800 space-y-3">
            <div className="flex items-center justify-between text-xs font-mono text-slate-400">
              <span>ONE-CLICK DEMO LOGIN:</span>
              <span className="text-[10px] text-emerald-400 font-semibold">NO CREDENTIALS REQUIRED</span>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleDemoClick('ADMIN')}
                className="p-2.5 rounded-lg bg-purple-950/40 border border-purple-800/60 hover:bg-purple-900/40 text-left transition-colors"
              >
                <div className="text-xs font-bold text-purple-200">Administrator</div>
                <div className="text-[10px] text-purple-400 font-mono">Full Command Rights</div>
              </button>

              <button
                type="button"
                onClick={() => handleDemoClick('OFFICER')}
                className="p-2.5 rounded-lg bg-blue-950/40 border border-blue-800/60 hover:bg-blue-900/40 text-left transition-colors"
              >
                <div className="text-xs font-bold text-blue-200">Disaster Officer</div>
                <div className="text-[10px] text-blue-400 font-mono">Incident Dispatch</div>
              </button>

              <button
                type="button"
                onClick={() => handleDemoClick('RESCUE')}
                className="p-2.5 rounded-lg bg-amber-950/40 border border-amber-800/60 hover:bg-amber-900/40 text-left transition-colors"
              >
                <div className="text-xs font-bold text-amber-200">Rescue Member</div>
                <div className="text-[10px] text-amber-400 font-mono">Field USAR Unit</div>
              </button>

              <button
                type="button"
                onClick={() => handleDemoClick('ANALYST')}
                className="p-2.5 rounded-lg bg-emerald-950/40 border border-emerald-800/60 hover:bg-emerald-900/40 text-left transition-colors"
              >
                <div className="text-xs font-bold text-emerald-200">GEOINT Analyst</div>
                <div className="text-[10px] text-emerald-400 font-mono">Model & Data Metrics</div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
