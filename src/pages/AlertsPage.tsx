import React, { useState, useEffect } from 'react';
import { 
  BellRing, Send, AlertTriangle, ShieldAlert, 
  CheckCircle2, Radio, CheckSquare, MessageSquare, Mail, AlertOctagon
} from 'lucide-react';
import { api } from '../services/api';
import { EmergencyNotification } from '../types';

export const AlertsPage: React.FC = () => {
  const [notifications, setNotifications] = useState<EmergencyNotification[]>([]);
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [severity, setSeverity] = useState('Warning');
  const [targetChannel, setTargetChannel] = useState('Multi-Channel (In-App + SMS + Email)');
  const [targetRegion, setTargetRegion] = useState('All Operational Sectors');
  const [isTestMode, setIsTestMode] = useState<boolean>(true);
  const [confirmedAuth, setConfirmedAuth] = useState<boolean>(false);
  const [isBroadcasting, setIsBroadcasting] = useState<boolean>(false);
  const [statusMsg, setStatusMsg] = useState<string | null>(null);

  useEffect(() => {
    loadNotifications();
  }, []);

  const loadNotifications = async () => {
    try {
      const data = await api.getNotifications();
      setNotifications(data);
    } catch (err) {
      console.error("Alerts load error:", err);
    }
  };

  const handleTemplateSelect = (template: { title: string; message: string; severity: string }) => {
    setTitle(template.title);
    setMessage(template.message);
    setSeverity(template.severity);
  };

  const handleBroadcast = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!confirmedAuth) {
      alert("Operational Safety Protocol: You must check the authorization confirmation box before broadcasting.");
      return;
    }

    setIsBroadcasting(true);
    setStatusMsg(null);

    try {
      await api.broadcastNotification({
        title,
        message,
        severity,
        target_channel: targetChannel,
        target_region: targetRegion,
        is_test_mode: isTestMode,
        authorized_confirmation: confirmedAuth,
        sent_by: "Operations Director"
      });
      setStatusMsg("Emergency alert broadcasted successfully into active queues!");
      setTitle('');
      setMessage('');
      setConfirmedAuth(false);
      loadNotifications();
    } catch (err: any) {
      setStatusMsg(`Broadcast failed: ${err.message}`);
    } finally {
      setIsBroadcasting(false);
    }
  };

  const handleAcknowledge = async (id: number) => {
    try {
      await api.acknowledgeNotification(id);
      loadNotifications();
    } catch (err: any) {
      alert(`Acknowledgment failed: ${err.message}`);
    }
  };

  const templates = [
    {
      title: "EVACUATION: Sector 4 Structural Failure Cordon",
      severity: "Critical Evacuation",
      message: "Mandatory civilian evacuation within 100 meters of Plaza 4 due to unstable structural pancake collapse. Proceed to Thyagaraj Indoor Shelter."
    },
    {
      title: "FLASH FLOOD ADVISORY: Low-Lying Riverine Settlements",
      severity: "Warning",
      message: "River Yamuna levels have crossed 205.33m critical flood mark. Residents in ground-floor dwellings advised to relocate to designated relief camps."
    },
    {
      title: "TOXIC PLUME CAUTION: Industrial Solvent Fire",
      severity: "Advisory",
      message: "Combustible polymer fire in Okhla Phase II. Keep windows closed and avoid non-emergency outdoor transit within 2km downwind."
    }
  ];

  return (
    <div className="space-y-6 pb-16">
      {/* Header */}
      <div className="bg-slate-900/60 border border-slate-800 p-4 rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-red-600/20 border border-red-500/40 flex items-center justify-center text-red-400">
            <BellRing className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-extrabold text-white">Emergency Broadcast & Notifications</h1>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                Multi-Channel Gateway
              </span>
            </div>
            <p className="text-xs text-slate-400 font-mono">
              In-App push broadcasts, Twilio SMS fallback gateway, and civilian emergency alert history
            </p>
          </div>
        </div>

        {/* Safety Warning */}
        <div className="text-xs font-mono bg-red-950/50 border border-red-800 text-red-300 px-3 py-1.5 rounded-lg flex items-center gap-2">
          <ShieldAlert className="w-4 h-4 text-red-400 shrink-0" />
          <span>SAFETY PROTOCOL: TEST MODE ENABLED BY DEFAULT</span>
        </div>
      </div>

      {/* Grid: Composer vs History */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Broadcast Composer (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-[#0b1222] border border-slate-800 p-5 rounded-xl space-y-4">
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <Send className="w-4 h-4 text-orange-400" />
              Compose Emergency Broadcast
            </h2>

            {/* Quick Templates */}
            <div className="space-y-1.5">
              <span className="text-[10px] font-mono text-slate-400 uppercase">Load Standard Directive Template:</span>
              <div className="space-y-1">
                {templates.map((tpl, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleTemplateSelect(tpl)}
                    className="w-full text-left p-2 rounded bg-slate-900 border border-slate-800 hover:border-slate-700 text-xs text-slate-300 truncate transition-colors"
                  >
                    <span className="font-bold text-white block">{tpl.title}</span>
                    <span className="text-[10px] text-slate-500 font-mono">{tpl.severity}</span>
                  </button>
                ))}
              </div>
            </div>

            <form onSubmit={handleBroadcast} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Alert Headline</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. CRITICAL EVACUATION ORDER..."
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Alert Message & Public Directives</label>
                <textarea
                  rows={4}
                  required
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Provide precise safety instructions, safe shelter destinations, and emergency contact frequencies..."
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white font-sans"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Severity Category</label>
                  <select
                    value={severity}
                    onChange={(e) => setSeverity(e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-white"
                  >
                    <option value="Critical Evacuation">Critical Evacuation</option>
                    <option value="Warning">Warning</option>
                    <option value="Advisory">Advisory</option>
                    <option value="Information">Information</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Target Channel</label>
                  <select
                    value={targetChannel}
                    onChange={(e) => setTargetChannel(e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-white"
                  >
                    <option value="Multi-Channel (In-App + SMS + Email)">Multi-Channel Broadcast</option>
                    <option value="In-App Only">In-App Operations Alert</option>
                    <option value="SMS Gateway">SMS Notification</option>
                    <option value="Email Bulletin">Email Bulletin</option>
                  </select>
                </div>
              </div>

              {/* Test Mode Switch */}
              <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 space-y-2">
                <label className="flex items-center justify-between cursor-pointer">
                  <span className="font-bold text-white">Demonstration Test Mode</span>
                  <input
                    type="checkbox"
                    checked={isTestMode}
                    onChange={(e) => setIsTestMode(e.target.checked)}
                    className="rounded text-orange-600 focus:ring-0"
                  />
                </label>
                <p className="text-[10px] text-slate-400 font-mono">
                  When enabled, prevents live external SMS transmission during viva evaluation.
                </p>
              </div>

              {/* Safety Authorization Confirmation Guard */}
              <label className="flex items-start gap-2 p-3 rounded-lg bg-red-950/30 border border-red-900/50 cursor-pointer">
                <input
                  type="checkbox"
                  required
                  checked={confirmedAuth}
                  onChange={(e) => setConfirmedAuth(e.target.checked)}
                  className="mt-0.5 rounded text-red-600 focus:ring-0"
                />
                <span className="text-[11px] text-red-300 leading-tight">
                  I confirm that I am an authorized emergency response officer and certify this broadcast bulletin.
                </span>
              </label>

              <button
                type="submit"
                disabled={isBroadcasting}
                className="w-full py-2.5 rounded-lg bg-red-600 hover:bg-red-500 text-white font-bold text-xs shadow-lg shadow-red-600/30 flex items-center justify-center gap-1.5 transition-colors disabled:opacity-50"
              >
                <Radio className="w-4 h-4" />
                {isBroadcasting ? 'Broadcasting Alert...' : 'Transmit Emergency Notification'}
              </button>

              {statusMsg && (
                <div className="p-2.5 rounded bg-emerald-950/50 border border-emerald-800 text-xs text-emerald-300 font-mono text-center">
                  {statusMsg}
                </div>
              )}
            </form>
          </div>
        </div>

        {/* Right: Notification History & Delivery Ledger (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-[#0b1222] border border-slate-800 p-5 rounded-xl space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-white">Broadcast Delivery History & Audit</h3>
                <p className="text-xs text-slate-400">Chronological ledger of alerts and confirmation receipts</p>
              </div>
              <span className="text-xs font-mono text-slate-400">{notifications.length} Total Alerts</span>
            </div>

            <div className="space-y-3">
              {notifications.map((notif) => (
                <div
                  key={notif.id}
                  className={`p-4 rounded-xl border space-y-2.5 transition-all ${
                    notif.severity === 'Critical Evacuation'
                      ? 'bg-red-950/20 border-red-900/60'
                      : 'bg-slate-900/60 border-slate-800'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-white">{notif.title}</span>
                        {notif.is_test_mode && (
                          <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-amber-950 text-amber-300 border border-amber-800">
                            TEST
                          </span>
                        )}
                      </div>
                      <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                        Transmitted by: {notif.sent_by} • {new Date(notif.created_at).toLocaleTimeString()}
                      </div>
                    </div>

                    <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded shrink-0 ${
                      notif.severity === 'Critical Evacuation' ? 'bg-red-600 text-white' : 'bg-slate-800 text-slate-300'
                    }`}>
                      {notif.severity}
                    </span>
                  </div>

                  <p className="text-xs text-slate-300 leading-relaxed font-sans">{notif.message}</p>

                  <div className="flex items-center justify-between pt-2 border-t border-slate-800/80 text-[11px] font-mono text-slate-400">
                    <div>Channel: <span className="text-slate-300">{notif.target_channel}</span></div>
                    <div className="flex items-center gap-3">
                      <span>Status: <strong className="text-emerald-400">{notif.delivery_status}</strong></span>
                      {!notif.acknowledged ? (
                        <button
                          onClick={() => handleAcknowledge(notif.id)}
                          className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-white text-[10px] font-semibold"
                        >
                          Acknowledge
                        </button>
                      ) : (
                        <span className="text-emerald-400 flex items-center gap-1 text-[10px]">
                          <CheckCircle2 className="w-3 h-3" /> Acknowledged
                        </span>
                      )}
                    </div>
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
