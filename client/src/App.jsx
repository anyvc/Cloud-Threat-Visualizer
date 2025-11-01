// src/App.jsx
import React, { useEffect, useState, useRef } from 'react';
import { io } from 'socket.io-client';
import AttackChart from './components/AttackChart.jsx';
import AttackLog from './components/AttackLog.jsx';
import Topology from './components/Topology.jsx';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:4000';

function App() {
  const [events, setEvents] = useState([]);
  const [endpoints, setEndpoints] = useState([]);
  const socketRef = useRef(null);

  useEffect(() => {
    const s = io(SOCKET_URL, { transports: ['websocket'] });
    socketRef.current = s;

    s.on('connect', () => console.log('Connected to backend', s.id));
    s.on('endpoints', (data) => setEndpoints(data));
    s.on('attack_event', (ev) => {
      // keep recent 200 events max
      setEvents(prev => [ev, ...prev].slice(0, 200));
    });

    return () => {
      s.disconnect();
    };
  }, []);

  // Aggregate counts by type for chart
  const countsByType = events.reduce((acc, e) => {
    acc[e.label] = (acc[e.label] || 0) + 1;
    return acc;
  }, {});

  const chartData = Object.entries(countsByType).map(([label, count]) => ({ label, count }));

  return (
    <div className="min-h-screen p-6">
      <header className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-semibold">Real Cloud Threat Visualizer</h1>
        <div className="text-sm text-slate-300">Live simulated attacks • No credentials</div>
      </header>

      <main className="grid grid-cols-3 gap-6">
        <section className="col-span-2 space-y-4">
          <div className="p-4 bg-slate-800/60 rounded-2xl shadow-lg">
            <Topology endpoints={endpoints} events={events.slice(0,30)} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-slate-800/60 rounded-2xl">
              <h2 className="text-lg font-medium mb-2">Attack Types (live)</h2>
              <AttackChart data={chartData} />
            </div>
            <div className="p-4 bg-slate-800/60 rounded-2xl">
              <h2 className="text-lg font-medium mb-2">Quick stats</h2>
              <div className="grid grid-cols-3 gap-3">
                <StatCard label="Total Events" value={events.length} />
                <StatCard label="Unique Sources" value={new Set(events.map(e=>e.sourceIp)).size} />
                <StatCard label="Top Severity" value={events[0]?.severity ?? 0} />
              </div>
            </div>
          </div>
        </section>

        <aside className="col-span-1">
          <div className="p-4 bg-slate-800/60 rounded-2xl mb-4">
            <h2 className="text-lg font-medium mb-2">Live Log</h2>
            <AttackLog events={events} />
          </div>

          <div className="p-4 bg-slate-800/60 rounded-2xl">
            <h2 className="text-lg font-medium mb-2">About</h2>
            <p className="text-sm text-slate-300">This demo simulates attack telemetry from fake endpoints over a Socket.IO stream. Use it to show understanding of observability, event pipelines, and visualization.</p>
          </div>
        </aside>
      </main>
    </div>
  );
}

function StatCard({ label, value }) {
  return (
    <div className="bg-slate-900/60 p-3 rounded-lg text-center">
      <div className="text-2xl font-bold">{value}</div>
      <div className="text-sm text-slate-400">{label}</div>
    </div>
  );
}

export default App;
