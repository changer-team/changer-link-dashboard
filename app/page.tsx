'use client';

import { useEffect, useRef, useState } from 'react';
import ForceGraph3D from '3d-force-graph';
import { useSearchParams } from 'next/navigation';

export default function GraphView() {
  const containerRef = useRef<HTMLDivElement>(null);
  const searchParams = useSearchParams();
  const clientId = searchParams.get('clientId') || 'DEMO';
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!containerRef.current) return;

    const fetchData = async () => {
      try {
        const res = await fetch(`/api/graph?clientId=${clientId}`);
        const data = await res.json();
        
        const Graph = ForceGraph3D()(containerRef.current)
          .graphData(data)
          .nodeLabel((node: any) => `${node.title || node.id}<br/>EEAT: ${node.eeat_score || 'N/A'}`)
          .nodeAutoColorBy('id')
          .linkDirectionalArrowLength(3.5)
          .linkDirectionalArrowRelPos(1)
          .linkCurvature(0.25)
          .linkColor((link: any) => link.is_menu_link ? '#444' : '#007bff')
          .linkOpacity(0.3);

        setLoading(false);
      } catch (err) {
        console.error('Failed to load graph:', err);
        setLoading(false);
      }
    };

    fetchData();
  }, [clientId]);

  return (
    <main className="flex min-h-screen flex-col items-center justify-between bg-black">
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center z-10 text-white">
          <p className="text-xl animate-pulse">Lade Link-Graph für {clientId}...</p>
        </div>
      )}
      <div ref={containerRef} className="w-full h-screen" />
      <div className="absolute bottom-4 left-4 p-4 bg-black/50 border border-white/20 rounded text-white text-sm">
        <h1 className="font-bold text-lg mb-2">CHANGER Link Dashboard</h1>
        <p>Client: <span className="text-blue-400">{clientId}</span></p>
        <div className="mt-2 flex items-center gap-2">
          <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
          <span>In-Text Link</span>
        </div>
        <div className="mt-1 flex items-center gap-2">
          <div className="w-3 h-3 bg-gray-500 rounded-full"></div>
          <span>Menü-Link</span>
        </div>
      </div>
    </main>
  );
}
