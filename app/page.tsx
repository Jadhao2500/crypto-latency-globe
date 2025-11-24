"use client";

import { useState } from "react";
import { LatencyProvider } from "@/context/LatencyContext";
import { GlobeScene } from "@/components/GlobeScene";
import { ControlPanel } from "@/components/ControlPanel";
import { LatencyChart } from "@/components/LatencyChart";
import { ThemeToggle } from "@/components/ThemeToggle";
import type { CloudProvider } from "@/data/exchanges";
import { exchanges } from "@/data/exchanges";

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

  const selectedExchange = exchanges.find(
    (ex) => ex.id === selectedExchangeId
  ) || null;

  return (
    <LatencyProvider>
      <main className="flex min-h-screen flex-col gap-4 p-4 md:p-6">
        {/* Top bar */}
        <header className="flex flex-col gap-3 sm:flex-row justify-between items-start sm:items-center p-2 rounded-xl
  bg-background border border-slate-200 dark:border-slate-800 shadow-sm dark:shadow-md transition-colors">

          <div>
            <h1 className="text-xl font-semibold">Crypto Latency Globe</h1>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Real-time cloud + exchange latency visualization
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
            <LatencyChart
              selectedExchangeId={selectedExchangeId}
              selectedExchangeLabel={
                selectedExchange
                  ? `${selectedExchange.name} – ${selectedExchange.city}`
                  : undefined
              }
            />
          </div>

          {/* Globe */}
          <div
            className="
    order-1 lg:order-2
    rounded-2xl
    overflow-hidden
    border border-slate-200 dark:border-slate-800
   bg-background shadow-md dark:shadow-lg
    transition-colors duration-300
  "
          >
            <div className="h-[260px] sm:h-[320px] md:h-full lg:h-full">
              <GlobeScene
                activeProviders={activeProviders}
                maxLatency={maxLatency}
                showRegions={showRegions}
                showRealTime={showRealTime}
                selectedExchangeId={selectedExchangeId}
              />
            </div>
          </div>
        </section>
      </main>
    </LatencyProvider>
  );
}
