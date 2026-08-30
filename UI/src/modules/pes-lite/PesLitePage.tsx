import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Zap, Activity, BatteryCharging, AlertCircle } from 'lucide-react';

export const PesLitePage: React.FC = () => {
  const navigate = useNavigate();

  const dummyRuns = [
    { runId: 'RUN-LITE-042', product: 'Piston Bolt A-3', qty: 240, machine: 'CNC-01', status: 'Completed' },
    { runId: 'RUN-LITE-043', product: 'Bearing Case B-9', qty: 850, machine: 'CNC-03', status: 'Running' },
  ];

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Subheader status bar */}
      <div 
        className="flex items-center justify-between px-4 py-1.5 border-b shrink-0" 
        style={{ background: 'rgb(248, 250, 252)', borderColor: 'rgb(232, 238, 248)' }}
      >
        <div className="flex items-center gap-2 text-xs text-slate-500">
          <span className="font-semibold text-slate-700">PES Lite Module</span>
          <span className="text-slate-300">·</span>
          <span className="text-slate-400">Simplified execution control &amp; quick run rates</span>
        </div>
        <button 
          onClick={() => navigate('/')} 
          className="text-xs text-slate-400 hover:text-slate-600 transition-colors px-2 py-1 rounded hover:bg-slate-100"
        >
          ← Back to Dashboard
        </button>
      </div>

      {/* Main Panel Content */}
      <main className="flex-1 overflow-y-auto p-5 space-y-5" style={{ scrollbarWidth: 'thin' }}>
        {/* Title */}
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-cyan-50 text-cyan-600 border border-cyan-200">
            <Zap className="w-4 h-4" />
          </div>
          <div>
            <h1 className="text-sm font-bold text-slate-800 leading-none">PES Lite Control</h1>
            <p className="text-[10px] text-slate-400 mt-1">Lightweight planning, quick execution run rates</p>
          </div>
        </div>

        {/* PES Lite KPIs */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="bg-white border border-slate-200 rounded-xl p-4 flex flex-col gap-1 shadow-sm">
            <span className="text-[10px] font-mono uppercase tracking-widest text-slate-600 font-bold">Planned Runs Today</span>
            <span className="text-2xl font-bold text-slate-900">4 Active</span>
            <span className="text-[10px] text-slate-500 font-medium flex items-center gap-1">
              <Activity className="w-3.5 h-3.5 text-cyan-500" /> CNC units online
            </span>
          </div>
          <div className="bg-white border border-slate-200 rounded-xl p-4 flex flex-col gap-1 shadow-sm">
            <span className="text-[10px] font-mono uppercase tracking-widest text-slate-600 font-bold">Execution SLA Target</span>
            <span className="text-2xl font-bold text-slate-900">85% Rate</span>
            <span className="text-[10px] text-emerald-600 font-medium flex items-center gap-1">
              <BatteryCharging className="w-3.5 h-3.5" /> High load capacity
            </span>
          </div>
          <div className="bg-white border border-slate-200 rounded-xl p-4 flex flex-col gap-1 shadow-sm">
            <span className="text-[10px] font-mono uppercase tracking-widest text-slate-600 font-bold">Active Warnings</span>
            <span className="text-2xl font-bold text-slate-700">0 Alerts</span>
            <span className="text-[10px] text-emerald-600 font-medium flex items-center gap-1">
              <AlertCircle className="w-3.5 h-3.5" /> No downtime reported
            </span>
          </div>
        </div>

        {/* Quick execution register */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
          <h3 className="text-[11px] font-mono uppercase tracking-widest text-slate-600 font-bold mb-3">
            Quick Execution Run Status
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-[10px] text-slate-500 font-bold uppercase tracking-wider">
                  <th className="p-2.5">Run ID</th>
                  <th className="p-2.5">Target Product</th>
                  <th className="p-2.5 text-right">Planned Qty</th>
                  <th className="p-2.5">Machine Assigned</th>
                  <th className="p-2.5 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {dummyRuns.map(r => (
                  <tr key={r.runId} className="hover:bg-slate-50/50">
                    <td className="p-2.5 font-mono font-bold text-blue-700">{r.runId}</td>
                    <td className="p-2.5 font-semibold text-slate-800">{r.product}</td>
                    <td className="p-2.5 text-right font-mono font-bold text-slate-700">{r.qty}</td>
                    <td className="p-2.5 font-semibold">{r.machine}</td>
                    <td className="p-2.5 text-center">
                      <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold ${
                        r.status === 'Completed' ? 'bg-emerald-50 text-emerald-800 ring-1 ring-emerald-300' : 'bg-blue-50 text-blue-800 ring-1 ring-blue-300'
                      }`}>
                        {r.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
};

export default PesLitePage;
