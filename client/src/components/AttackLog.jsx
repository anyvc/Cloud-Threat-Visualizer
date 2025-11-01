import React from 'react';

export default function AttackLog({ events }) {
  return (
    <div className="max-h-96 overflow-auto space-y-2">
      {events.slice(0, 50).map(ev => (
        <div key={ev.id} className="p-2 bg-black/20 rounded border border-slate-700">
          <div className="text-xs text-slate-300">{new Date(ev.timestamp).toLocaleTimeString()}</div>
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-medium">{ev.label} → {ev.targetName}</div>
              <div className="text-xs text-slate-400">{ev.sourceIp} • attempts: {ev.details.attempts}</div>
            </div>
            <div className={`px-2 py-1 rounded text-xs ${ev.severity >= 4 ? 'bg-red-600' : 'bg-yellow-600'}`}>{ev.severity}</div>
          </div>
        </div>
      ))}
    </div>
  );
}
