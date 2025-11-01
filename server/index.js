// server/index.js
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

const app = express();
app.use(cors());
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: '*' } });

const PORT = process.env.PORT || 4000;

// Fake endpoints to attack
const endpoints = [
  { id: 'svc-1', name: 'Auth Service', ip: '10.0.0.1' },
  { id: 'svc-2', name: 'Web Frontend', ip: '10.0.0.2' },
  { id: 'svc-3', name: 'Database Proxy', ip: '10.0.0.3' },
  { id: 'svc-4', name: 'Admin Panel', ip: '10.0.0.10' }
];

// Attack types and simple weightings for severity
const ATTACK_TYPES = [
  { type: 'brute_force', label: 'Brute Force', severity: 3 },
  { type: 'port_scan', label: 'Port Scan', severity: 2 },
  { type: 'phishing', label: 'Phishing Attempt', severity: 4 },
  { type: 'sqli', label: 'SQLi Probe', severity: 4 }
];

function randomChoice(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}
function randInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Build a simulated event
function generateEvent() {
  const target = randomChoice(endpoints);
  const attack = randomChoice(ATTACK_TYPES);
  const timestamp = new Date().toISOString();
  const sourceIp = `192.168.${randInt(0, 255)}.${randInt(1, 254)}`;

  // Add some payload metrics for visualization
  const event = {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    timestamp,
    type: attack.type,
    label: attack.label,
    severity: attack.severity,
    targetId: target.id,
    targetName: target.name,
    targetIp: target.ip,
    sourceIp,
    details: {
      attempts: randInt(1, 200),
      ports: Array.from({length: randInt(1,4)}, () => randInt(20,65000)).slice(0,3)
    }
  };
  return event;
}

// Emit events to connected clients at variable intervals
let emitInterval = 1200; // base interval 1.2s
let emitting = true;

io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);
  socket.emit('endpoints', endpoints);
  socket.emit('info', { msg: 'Welcome to Threat Visualizer' });

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

// Start emitter loop (non-blocking)
(function emitterLoop() {
  if (!emitting) return;
  const e = generateEvent();
  io.emit('attack_event', e); // broadcast
  // randomize interval a bit to look realistic
  const jitter = Math.random() * 1200;
  setTimeout(emitterLoop, emitInterval + jitter);
})();

app.get('/', (req, res) => {
  res.json({ status: 'ok', description: 'Threat Visualizer backend' });
});

server.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
});
