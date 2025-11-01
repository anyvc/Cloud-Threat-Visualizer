import React, { useMemo } from 'react';

export default function Topology({ endpoints, events }) {
  // map endpoints to screen positions
  const nodes = useMemo(() => {
    const base = [
      { x: 60, y: 50 }, { x: 260, y: 40 }, { x: 460, y: 50 }, { x: 200, y: 160 }
    ];
    return endpoints.map((ep, i) => ({ ...ep, x: base[i]?.x ?? (100 + i*120), y: base[i]?.y ?? (100 + (i%2)*80) }));
  }, [endpoints]);

  // create quick lookup of recent attacks by endpoint
  const recent = {};
  events.forEach(e => { recent[e.targetId] = (recent[e.targetId] || 0) + 1; });

  return (
    <div className="w-full h-56 relative">
      <svg viewBox="0 0 560 200" className="w-full h-full">
        <defs>
          <filter id="glow">
            <feGaussianBlur stdDeviation="3.5" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>

        {/* draw nodes */}
        {nodes.map((n) => {
          const attacks = recent[n.id] || 0;
          const scale = Math.min(1 + attacks * 0.12, 2);
          const color = attacks > 0 ? '#ff6b6b' : '#60a5fa';
          return (
            <g key={n.id} transform={`translate(${n.x},${n.y})`}>
              <circle r={18 * scale} fill={color} fillOpacity="0.14" />
              <circle r={12} fill={color} stroke="#071024" strokeWidth="2" />
              <text x="20" y="6" fontSize="11" fill="#cbd5e1">{n.name}</text>
            </g>
          );
        })}

        {/* draw simple lines (topology) */}
        {nodes.map((n, i) => {
          const target = nodes[(i+1) % nodes.length];
          return <line key={i} x1={n.x} y1={n.y} x2={target.x} y2={target.y} stroke="#0ea5e9" strokeOpacity="0.12" />;
        })}

      </svg>
    </div>
  );
}
