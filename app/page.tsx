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
      <main className="flex min-h-screen flex-col gap-4 p-3 sm:p-4 md:p-6">
        {/* Top bar */}
        <header className="flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
          <div>
            <h1 className="text-xl font-semibold md:text-2xl">
              Crypto Latency Globe
            </h1>
            <p className="mt-1 text-xs text-slate-600 md:text-sm dark:text-slate-400">
              3D world map of exchange servers, cloud regions & real-time latency.
            </p>
          </div>

          <div className="flex items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400">
            <span className="hidden sm:inline">
              Next.js · TypeScript · Three.js · Recharts
            </span>
            <span className="rounded-full bg-emerald-500/15 px-2 py-1 text-emerald-500">
              Live demo
            </span>
            <ThemeToggle />
          </div>
        </header>

        {/* Main content */}
        <section
          className="
            grid flex-1 gap-4
            grid-rows-[auto_auto]
            lg:grid-rows-1 lg:grid-cols-[minmax(260px,320px)_minmax(0,1fr)]
          "
        >
          {/* GLOBE – on top for mobile, right on desktop */}
          <div
            className="
              order-1 lg:order-2
              rounded-2xl
              bg-slate-100 p-2 shadow-2xl
              dark:bg-slate-900/70
            "
          >
            <div className="h-[260px] sm:h-[320px] md:h-[420px] lg:h-full">
              <GlobeScene
                activeProviders={activeProviders}
                maxLatency={maxLatency}
                showRegions={showRegions}
                showRealTime={showRealTime}
              />
            </div>
          </div>

          {/* Controls + chart – below on mobile, left on desktop */}
          <div
            className="
              order-2 lg:order-1
              flex flex-col gap-4
              min-h-0
            "
          >
            <div className="min-h-[220px] max-h-[320px] overflow-y-auto rounded-xl bg-slate-900/80 p-3 text-sm text-slate-100 shadow-xl backdrop-blur dark:bg-slate-900/80">
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
            </div>

            <div className="min-h-[220px] rounded-xl bg-slate-900/80 text-slate-100 shadow-xl backdrop-blur dark:bg-slate-900/80">
              <LatencyChart />
            </div>
          </div>
        </section>
      </main>
    </LatencyProvider>
  );
}
