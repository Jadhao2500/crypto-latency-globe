// components/ControlPanel.tsx
"use client";

import { useMemo, useState } from "react";
import { exchanges } from "@/data/exchanges";
import type { CloudProvider } from "@/data/exchanges";

const providerLabels: Record<CloudProvider, string> = {
    AWS: "AWS",
    GCP: "GCP",
    AZURE: "Azure",
};

type Props = {
    activeProviders: CloudProvider[];
    setActiveProviders: (p: CloudProvider[]) => void;
    maxLatency: number;
    setMaxLatency: (v: number) => void;
    showRegions: boolean;
    setShowRegions: (b: boolean) => void;
    showRealTime: boolean;
    setShowRealTime: (b: boolean) => void;
    selectedExchangeId: string | null;
    setSelectedExchangeId: (id: string | null) => void;
};

export function ControlPanel(props: Props) {
    const {
        activeProviders,
        setActiveProviders,
        maxLatency,
        setMaxLatency,
        showRegions,
        setShowRegions,
        showRealTime,
        setShowRealTime,
        selectedExchangeId,
        setSelectedExchangeId,
    } = props;

    const [search, setSearch] = useState("");

    const filteredExchanges = useMemo(
        () =>
            exchanges.filter((ex) =>
                `${ex.name} ${ex.city} ${ex.country}`
                    .toLowerCase()
                    .includes(search.toLowerCase())
            ),
        [search]
    );

    const toggleProvider = (provider: CloudProvider) => {
        if (activeProviders.includes(provider)) {
            setActiveProviders(activeProviders.filter((p) => p !== provider));
        } else {
            setActiveProviders([...activeProviders, provider]);
        }
    };

    return (
        <div className="flex h-full flex-col gap-4 rounded-xl bg-slate-900/80 p-4 text-sm shadow-xl backdrop-blur">
            <h2 className="text-base font-semibold text-slate-100">
                Controls
            </h2>

            {/* Providers */}
            <div>
                <div className="mb-1 text-xs font-semibold text-slate-400">
                    Cloud providers
                </div>
                <div className="flex flex-wrap gap-2">
                    {(Object.keys(providerLabels) as CloudProvider[]).map((p) => (
                        <button
                            key={p}
                            onClick={() => toggleProvider(p)}
                            className={`rounded-full px-3 py-1 text-xs ${activeProviders.includes(p)
                                    ? "bg-sky-500 text-slate-50"
                                    : "bg-slate-800 text-slate-300"
                                }`}
                        >
                            {providerLabels[p]}
                        </button>
                    ))}
                </div>
            </div>

            {/* Latency range */}
            <div>
                <div className="mb-1 flex items-center justify-between text-xs font-semibold text-slate-400">
                    <span>Max latency</span>
                    <span className="text-slate-200">{maxLatency} ms</span>
                </div>
                <input
                    type="range"
                    min={20}
                    max={300}
                    value={maxLatency}
                    onChange={(e) => setMaxLatency(Number(e.target.value))}
                    className="w-full"
                />
            </div>

            {/* Toggles */}
            <div className="space-y-2">
                <label className="flex items-center gap-2 text-xs">
                    <input
                        type="checkbox"
                        checked={showRegions}
                        onChange={(e) => setShowRegions(e.target.checked)}
                    />
                    <span>Show cloud regions</span>
                </label>
                <label className="flex items-center gap-2 text-xs">
                    <input
                        type="checkbox"
                        checked={showRealTime}
                        onChange={(e) => setShowRealTime(e.target.checked)}
                    />
                    <span>Show real-time latency arcs</span>
                </label>
            </div>

            {/* Search */}
            <div>
                <div className="mb-1 text-xs font-semibold text-slate-400">
                    Search exchange / region
                </div>
                <input
                    className="w-full rounded-lg bg-slate-800 px-2 py-1 text-xs text-slate-100 outline-none"
                    placeholder="Binance, OKX, Frankfurt..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
                <div className="mt-2 max-h-32 space-y-1 overflow-y-auto text-xs">
                    {filteredExchanges.map((ex) => (
                        <button
                            key={ex.id}
                            onClick={() =>
                                setSelectedExchangeId(
                                    selectedExchangeId === ex.id ? null : ex.id
                                )
                            }
                            className={`flex w-full justify-between rounded-md px-2 py-1 text-left ${selectedExchangeId === ex.id
                                    ? "bg-sky-600 text-slate-50"
                                    : "bg-slate-800 text-slate-200"
                                }`}
                        >
                            <span>{ex.name}</span>
                            <span className="text-[10px] text-slate-400">
                                {ex.city}, {ex.country}
                            </span>
                        </button>
                    ))}
                </div>
            </div>

            {/* Simple status */}
            <div className="mt-auto rounded-lg bg-slate-950/80 p-2 text-[11px] text-slate-400">
                <div className="font-semibold text-slate-200">
                    Performance
                </div>
                <p>
                    Polling latency every <span className="font-mono">5s</span> from
                    Next.js API.
                </p>
            </div>
        </div>
    );
}
