"use client";
import { useState, useEffect } from "react";

export default function Home() {
  const [rps, setRps] = useState(500);
  const [servers, setServers] = useState(2);
  const [cache, setCache] = useState(false);
  const [queue, setQueue] = useState(false);
  const [metrics, setMetrics] = useState<any>(null);

  const fetchMetrics = async () => {
    try {
      const res = await fetch(
        `http://localhost:5012/api/simulate?rps=${rps}&servers=${servers}&cache=${cache}&queue=${queue}`
      );
      const data = await res.json();
      setMetrics(data);
    } catch (err) {
      console.error("Backend not running or CORS blocked", err);
    }
  };

  useEffect(() => {
    fetchMetrics();
  }, [rps, servers, cache, queue]);

  return (
    <main className="p-8 max-w-2xl mx-auto bg-slate-900 text-white min-h-screen rounded-xl">
      <h1 className="text-2xl font-bold mb-6">Data Center ESG & Scalability Twin</h1>

      <div className="space-y-4 mb-8">
        <div>
          <label>Traffic Load (RPS): {rps}</label>
          <input type="range" min="100" max="5000" value={rps} onChange={(e) => setRps(Number(e.target.value))} className="w-full" />
        </div>

        <div>
          <label>Servers: {servers}</label>
          <input type="range" min="1" max="10" value={servers} onChange={(e) => setServers(Number(e.target.value))} className="w-full" />
        </div>

        <div className="flex gap-4">
          <label className="flex items-center gap-2">
            <input type="checkbox" checked={cache} onChange={(e) => setCache(e.target.checked)} /> Enable Caching
          </label>
          <label className="flex items-center gap-2">
            <input type="checkbox" checked={queue} onChange={(e) => setQueue(e.target.checked)} /> Enable Queue
          </label>
        </div>
      </div>

      {metrics && (
        <div className="p-4 bg-slate-800 rounded-lg space-y-2 border border-slate-700">
          <h2 className="font-semibold text-lg border-b border-slate-700 pb-2">Thermodynamic & System Output</h2>
          <p>PUE: <span className="font-mono text-green-400">{metrics.pue}</span></p>
          <p>WUE: <span className="font-mono text-blue-400">{metrics.wue} L/kWh</span></p>
          <p>Facility Power: <span className="font-mono text-yellow-400">{metrics.facilityPowerKW} kW</span></p>
          <p>Status: <span className="font-semibold">{metrics.status}</span></p>
        </div>
      )}
    </main>
  );
}