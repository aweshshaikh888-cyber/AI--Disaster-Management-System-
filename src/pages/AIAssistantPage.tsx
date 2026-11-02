import React, { useState } from 'react';
import { 
  Bot, Send, Sparkles, AlertCircle, FileText, 
  CheckSquare, ShieldAlert, Cpu, RefreshCw, User
} from 'lucide-react';
import { api } from '../services/api';

interface Message {
  sender: 'user' | 'assistant';
  text: string;
  source?: string;
  timestamp: string;
}

export const AIAssistantPage: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      sender: 'assistant',
      text: "Greetings, Commander. I am the **DisasterAI Operations Copilot**. I assist authorized officers with automated SITREP drafts, emergency deployment checklists, inventory summaries, and priority score explainability.",
      source: "DisasterAI Emergency Operations Engine",
      timestamp: new Date().toLocaleTimeString()
    }
  ]);
  const [inputQuery, setInputQuery] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSendMessage = async (textToSend?: string, taskType?: string) => {
    const query = textToSend || inputQuery;
    if (!query.trim()) return;

    const userMsg: Message = {
      sender: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString()
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInputQuery('');
    setIsProcessing(true);

    try {
      const res = await api.queryCopilot(query, 1, taskType || 'general');
      const assistantMsg: Message = {
        sender: 'assistant',
        text: res.response,
        source: res.source,
        timestamp: new Date().toLocaleTimeString()
      };
      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err: any) {
      setMessages((prev) => [
        ...prev,
        {
          sender: 'assistant',
          text: `Operational Assistant Error: ${err.message || 'Unable to process request.'}`,
          source: 'System Error Handler',
          timestamp: new Date().toLocaleTimeString()
        }
      ]);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-6 pb-16 max-w-4xl mx-auto">
      {/* Header */}
      <div className="bg-slate-900/60 border border-slate-800 p-4 rounded-xl flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-red-600/20 border border-red-500/40 flex items-center justify-center text-red-400">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-extrabold text-white">Disaster Operations AI Copilot</h1>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 border border-blue-500/30">
                SOP Reasoning Engine
              </span>
            </div>
            <p className="text-xs text-slate-400 font-mono">
              Operational checklist synthesis, rapid situation reports, and priority score explainability
            </p>
          </div>
        </div>
      </div>

      {/* Suggested Quick Prompts */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs font-mono text-slate-400">Tactical Directives:</span>
        <button
          onClick={() => handleSendMessage('Generate Operational SITREP', 'sitrep')}
          className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 hover:border-slate-500 text-xs text-slate-200 flex items-center gap-1.5 transition-colors"
        >
          <FileText className="w-3.5 h-3.5 text-blue-400" />
          Generate SITREP
        </button>
        <button
          onClick={() => handleSendMessage('Show Rapid Deployment Checklist', 'checklist')}
          className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 hover:border-slate-500 text-xs text-slate-200 flex items-center gap-1.5 transition-colors"
        >
          <CheckSquare className="w-3.5 h-3.5 text-emerald-400" />
          Deployment Checklist
        </button>
        <button
          onClick={() => handleSendMessage('Explain Priority Score for Incident DIS-2026-001', 'explain_priority')}
          className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 hover:border-slate-500 text-xs text-slate-200 flex items-center gap-1.5 transition-colors"
        >
          <Cpu className="w-3.5 h-3.5 text-red-400" />
          Explain Priority Score
        </button>
        <button
          onClick={() => handleSendMessage('Summarize Available Depot Resources', 'resource_summary')}
          className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 hover:border-slate-500 text-xs text-slate-200 flex items-center gap-1.5 transition-colors"
        >
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          Resource Audit
        </button>
      </div>

      {/* Chat Messages Viewport */}
      <div className="bg-[#0b1222] border border-slate-800 rounded-2xl p-5 shadow-2xl h-[520px] flex flex-col justify-between">
        <div className="flex-1 overflow-y-auto space-y-4 pr-2">
          {messages.map((msg, i) => (
            <div
              key={i}
              className={`flex items-start gap-3 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {msg.sender === 'assistant' && (
                <div className="w-8 h-8 rounded-lg bg-red-600/20 border border-red-500/40 flex items-center justify-center text-red-400 shrink-0 mt-1">
                  <Bot className="w-4 h-4" />
                </div>
              )}

              <div
                className={`max-w-[85%] rounded-2xl p-4 text-xs leading-relaxed space-y-1.5 shadow-md ${
                  msg.sender === 'user'
                    ? 'bg-red-600 text-white rounded-tr-none'
                    : 'bg-slate-900/90 border border-slate-800 text-slate-200 rounded-tl-none font-sans'
                }`}
              >
                <div className="whitespace-pre-wrap">{msg.text}</div>

                <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono pt-1">
                  <span>{msg.source || ''}</span>
                  <span>{msg.timestamp}</span>
                </div>
              </div>

              {msg.sender === 'user' && (
                <div className="w-8 h-8 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-300 shrink-0 mt-1">
                  <User className="w-4 h-4" />
                </div>
              )}
            </div>
          ))}

          {isProcessing && (
            <div className="flex items-center gap-2 text-xs font-mono text-slate-400 bg-slate-900/60 p-3 rounded-lg border border-slate-800 w-fit">
              <RefreshCw className="w-3.5 h-3.5 animate-spin text-orange-400" />
              Synthesizing response from operational disaster protocols...
            </div>
          )}
        </div>

        {/* Input Bar */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="pt-4 border-t border-slate-800 flex items-center gap-2"
        >
          <input
            type="text"
            value={inputQuery}
            onChange={(e) => setInputQuery(e.target.value)}
            placeholder="Ask Copilot for SITREPs, checklist synthesis, or priority breakdown..."
            className="flex-1 px-4 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-red-500"
          />
          <button
            type="submit"
            disabled={isProcessing || !inputQuery.trim()}
            className="p-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white shadow-md shadow-red-600/30 transition-colors disabled:opacity-50"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>

      {/* Mandatory Safety Notice */}
      <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-400 font-mono flex items-start gap-2">
        <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
        <p className="leading-snug">
          Operational Assistant Protocol: The AI assistant assists emergency professionals by synthesizing database reports and SOPs. It must not invent incident facts, claim to independently contact emergency services, or replace official incident command directives.
        </p>
      </div>
    </div>
  );
};
