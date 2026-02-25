'use client';

import { useEffect, useRef, useState } from 'react';

type DashboardNode = {
  id?: string | number;
  title?: string;
  eeat_score?: number | null;
};

export default function GraphView() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [clientId, setClientId] = useState('DEMO');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const queryClientId = params.get('clientId');
    if (queryClientId) {
      setClientId(queryClientId);
    }
  }, []);

  useEffect(() => {
    if (!containerRef.current) return;
    let graphInstance: { _destructor?: () => void } | null = null;

    const fetchData = async () => {
      try {
        const [{ default: ForceGraph3D }, res] = await Promise.all([
          import('3d-force-graph'),
          fetch(`/api/graph?clientId=${clientId}`)
        ]);
        const data = await res.json();
        
        graphInstance = new ForceGraph3D(containerRef.current!)
          .graphData(data)
          .nodeLabel((node: DashboardNode) => {
            const label = node.title || String(node.id ?? '');
            const eeat = node.eeat_score ?? 'N/A';
            return `${label}<br/>EEAT: ${eeat}`;
          })
          .nodeAutoColorBy('id')
          .linkDirectionalArrowLength(3.5)
          .linkDirectionalArrowRelPos(1)
          .linkCurvature(0.25)
          .linkColor((link) => ((link as { is_menu_link?: boolean }).is_menu_link ? '#444' : '#007bff'))
          .linkOpacity(0.3);

        setLoading(false);
      } catch (err) {
        console.error('Failed to load graph:', err);
        setLoading(false);
      }
    };

    fetchData();

    return () => {
      if (graphInstance && typeof graphInstance._destructor === 'function') {
        graphInstance._destructor();
      }
    };
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
