"use client";

import { useState } from "react";
import { LatencyProvider } from "@/context/LatencyContext";
import { GlobeScene } from "@/components/GlobeScene";
import { ControlPanel } from "@/components/ControlPanel";
import { LatencyChart } from "@/components/LatencyChart";
import { ThemeToggle } from "@/components/ThemeToggle";
import type { CloudProvider } from "@/data/exchanges";

export default function HomePage() {
  const [activeProviders, setActiveProviders] = useState<CloudProvider[]>([
    "AWS",
    "GCP",
    "AZURE",
  ]);
  const [maxLatency, setMaxLatency] = useState(250);
  const [showRegions, setShowRegions] = useState(true);
  const [showRealTime, setShowRealTime] = useState(true);
  const [selectedExchangeId, setSelectedExchangeId] = useState<string | null>(
    null
  );

  return (
    <LatencyProvider>
      <main className="flex min-h-screen flex-col gap-4 p-4 md:p-6">
        {/* Top bar */}
        <header className="flex items-center justify-between">
          <div>
            <h1 className="text-lg font-semibold md:text-2xl">
              Crypto Latency Globe
            </h1>
            <p className="text-xs text-slate-500 md:text-sm dark:text-slate-400">
              3D world map of exchange servers, cloud regions & real-time latency.
            </p>
          </div>

          <div className="flex items-center gap-3 text-[11px] text-slate-500 dark:text-slate-400">
            <span className="hidden md:inline">
              Next.js · TypeScript · Three.js · Recharts
            </span>
            <span className="rounded-full bg-emerald-500/15 px-2 py-1 text-emerald-500">
              Live demo
            </span>
            <ThemeToggle /> {/* ⬅️ here */}
          </div>
        </header>

        {/* Main grid */}
        <section className="grid flex-1 gap-4 md:grid-cols-[minmax(260px,320px)_minmax(0,1fr)]">
          {/* Left controls & chart */}
          <div className="flex flex-col gap-4">
            <ControlPanel
              activeProviders={activeProviders}
              setActiveProviders={setActiveProviders}
              maxLatency={maxLatency}
              setMaxLatency={setMaxLatency}
              showRegions={showRegions}
              setShowRegions={setShowRegions}
              showRealTime={showRealTime}
              setShowRealTime={setShowRealTime}
              selectedExchangeId={selectedExchangeId}
              setSelectedExchangeId={setSelectedExchangeId}
            />
            <LatencyChart />
          </div>

          {/* Globe */}
          <div
            className="
    
    rounded-2xl
    bg-slate-100
    p-2
    shadow-2xl
    dark:bg-slate-900/70
    overflow-hidden       
  "
          >
            <div className="h-full w-full">
              <GlobeScene
                activeProviders={activeProviders}
                maxLatency={maxLatency}
                showRegions={showRegions}
                showRealTime={showRealTime}
              />
            </div>
          </div>
        </section>
      </main>
    </LatencyProvider>
  );
}
