// components/ControlPanel.tsx
"use client";

import { useMemo, useState } from "react";
import { exchanges } from "@/data/exchanges";
import type { CloudProvider } from "@/data/exchanges";
import { useLatency } from "@/context/LatencyContext";
import type { LatencyLink, LatencySample } from "@/types/latency";
import { LineChart, Line, ResponsiveContainer } from "recharts";

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
    const { links, history } = useLatency();

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

    const focusedExchange = selectedExchangeId
        ? exchanges.find((e) => e.id === selectedExchangeId)
        : null;

    // Visible links: match exactly what globe shows
    const visibleLinks: LatencyLink[] = useMemo(
        () =>
            links.filter((l) => {
                if (!showRealTime || l.latencyMs > maxLatency) return false;
                const ex = exchanges.find((e) => e.id === l.fromId);
                if (!ex) return false;
                if (!activeProviders.includes(ex.provider)) return false;
                if (selectedExchangeId && l.fromId !== selectedExchangeId) return false;
                return true;
            }),
        [links, showRealTime, maxLatency, activeProviders, selectedExchangeId]
    );

    const latencyStats = useMemo(() => {
        if (!visibleLinks.length) return null;
        const vals = visibleLinks.map((l) => l.latencyMs);
        const min = Math.min(...vals);
        const max = Math.max(...vals);
        const avg = vals.reduce((a, b) => a + b, 0) / vals.length;
        return { min, max, avg: Number(avg.toFixed(1)) };
    }, [visibleLinks]);

    // Sparkline data: last 30 samples that match current filters
    const sparklineData = useMemo(() => {
        const relevantPairs = new Set(visibleLinks.map((l) => l.id));
        const filteredHistory: LatencySample[] = history.filter((s) =>
            relevantPairs.has(s.pairId)
        );
        const last = filteredHistory.slice(-30); // last 30 samples

        return last.map((s, idx) => ({
            x: idx,
            latency: s.latencyMs,
        }));
    }, [history, visibleLinks]);

    // Per-provider stats table
    const perProviderStats = useMemo(() => {
        const map: Record<
            CloudProvider,
            { count: number; min: number; max: number; sum: number }
        > = {
            AWS: { count: 0, min: Infinity, max: -Infinity, sum: 0 },
            GCP: { count: 0, min: Infinity, max: -Infinity, sum: 0 },
            AZURE: { count: 0, min: Infinity, max: -Infinity, sum: 0 },
        };

        visibleLinks.forEach((l) => {
            const ex = exchanges.find((e) => e.id === l.fromId);
            if (!ex) return;
            const p = ex.provider;
            const bucket = map[p];
            bucket.count += 1;
            bucket.sum += l.latencyMs;
            bucket.min = Math.min(bucket.min, l.latencyMs);
            bucket.max = Math.max(bucket.max, l.latencyMs);
        });

        return (Object.keys(map) as CloudProvider[]).map((p) => {
            const b = map[p];
            return {
                provider: p,
                count: b.count,
                min: b.count ? b.min : 0,
                max: b.count ? b.max : 0,
                avg: b.count ? Number((b.sum / b.count).toFixed(1)) : 0,
            };
        });
    }, [visibleLinks]);

    return (
        <div className="flex h-full flex-col gap-4 p-4 rounded-xl
  bg-background
  border border-slate-200 dark:border-slate-800
  text-foreground
  shadow-md dark:shadow-lg
  transition-colors duration-300">
            <h2 className="text-base font-semibold text-foreground">
                Controls
            </h2>

            {/* KPI strip + sparkline / provider stats */}
            <div className="space-y-3">
                {/* Top KPI row */}
                <div className="grid grid-cols-3 gap-2 text-[10px] sm:text-[11px]">
                    <div className="rounded-lg bg-slate-100/60 p-2 dark:bg-slate-900/60">
                        <div className="text-slate-500 dark:text-slate-400">
                            Visible links
                        </div>
                        <div className="mt-1 font-mono text-sm text-foreground">
                            {visibleLinks.length}
                        </div>
                    </div>
                    <div className="rounded-lg bg-slate-100/60 p-2 dark:bg-slate-900/60">
                        <div className="text-slate-500 dark:text-slate-400">
                            Avg latency
                        </div>
                        <div className="mt-1 font-mono text-sm">
                            {latencyStats ? `${latencyStats.avg} ms` : "--"}
                        </div>
                    </div>
                    <div className="rounded-lg bg-slate-100/60 p-2 dark:bg-slate-900/60">
                        <div className="text-slate-500 dark:text-slate-400">
                            Max latency
                        </div>
                        <div className="mt-1 font-mono text-sm">
                            {latencyStats ? `${latencyStats.max} ms` : "--"}
                        </div>
                    </div>
                </div>

                {/* Sparkline + per-provider table */}
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    {/* Sparkline mini chart */}
                    <div className="rounded-lg bg-slate-100/60 p-2 dark:bg-slate-900/60">
                        <div className="mb-1 flex items-center justify-between text-[10px] text-slate-500 dark:text-slate-400">
                            <span>Recent latency</span>
                            <span>{sparklineData.length ? "last samples" : "no data"}</span>
                        </div>
                        <div className="h-16">
                            {sparklineData.length ? (
                                <ResponsiveContainer width="100%" height="100%">
                                    <LineChart data={sparklineData}>
                                        <Line
                                            type="monotone"
                                            dataKey="latency"
                                            dot={false}
                                            strokeWidth={1.5}
                                        />
                                    </LineChart>
                                </ResponsiveContainer>
                            ) : (
                                <div className="flex h-full items-center justify-center text-[10px] text-slate-400">
                                    Waiting for samples…
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Per-provider stats */}
                    <div className="rounded-lg bg-slate-100/60 p-2 dark:bg-slate-900/60">
                        <div className="mb-1 text-[10px] font-medium text-slate-500 dark:text-slate-400">
                            Latency by provider
                        </div>
                        <table className="w-full border-collapse text-[10px]">
                            <thead>
                                <tr className="text-slate-500 dark:text-slate-400">
                                    <th className="py-1 text-left font-normal">Cloud</th>
                                    <th className="py-1 text-right font-normal">Links</th>
                                    <th className="py-1 text-right font-normal">Avg</th>
                                </tr>
                            </thead>
                            <tbody>
                                {perProviderStats.map((row) => (
                                    <tr key={row.provider}>
                                        <td className="py-0.5 text-left">
                                            {providerLabels[row.provider]}
                                        </td>
                                        <td className="py-0.5 text-right font-mono">
                                            {row.count}
                                        </td>
                                        <td className="py-0.5 text-right font-mono">
                                            {row.count ? `${row.avg} ms` : "--"}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Providers */}
            <div>
                <div className="mb-1 text-[11px] font-semibold text-slate-400">
                    Cloud providers
                </div>
                <div className="flex flex-wrap gap-2">
                    {(Object.keys(providerLabels) as CloudProvider[]).map((p) => (
                        <button
                            key={p}
                            onClick={() => toggleProvider(p)}
                            className={`rounded-full border px-3 py-1 text-[11px] transition-colors ${activeProviders.includes(p)
                                ? "bg-sky-500 text-white border-sky-500 dark:bg-sky-400 dark:text-black dark:border-sky-400"
                                : "bg-slate-100 text-slate-700 border-slate-300 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-200 dark:border-slate-700 dark:hover:bg-slate-700"
                                }`}
                        >
                            {providerLabels[p]}
                        </button>
                    ))}
                </div>
            </div>

            {/* Latency range */}
            <div>
                <div className="mb-1 flex items-center justify-between text-[11px] font-semibold text-slate-400">
                    <span>Max latency</span>
                    <span className="font-mono text-foreground">
                        {maxLatency} ms
                    </span>
                </div>
                <input
                    type="range"
                    min={20}
                    max={300}
                    value={maxLatency}
                    onChange={(e) => setMaxLatency(Number(e.target.value))}
                    className="w-full accent-sky-500 dark:accent-sky-300"
                />
            </div>

            {/* Toggles */}
            <div className="flex flex-wrap gap-3">
                <label className="flex items-center gap-2 text-[11px] sm:text-xs">
                    <input
                        type="checkbox"
                        checked={showRegions}
                        onChange={(e) => setShowRegions(e.target.checked)}
                    />
                    <span>Show cloud regions</span>
                </label>
                <label className="flex items-center gap-2 text-[11px] sm:text-xs">
                    <input
                        type="checkbox"
                        checked={showRealTime}
                        onChange={(e) => setShowRealTime(e.target.checked)}
                    />
                    <span>Show latency arcs</span>
                </label>
            </div>

            {/* Search */}
            <div className="min-h-0">
                <div className="mb-1 text-[11px] font-semibold text-slate-400">
                    Search exchange
                </div>
                <input
                    className="w-full rounded-lg border border-slate-300 bg-slate-100 px-2 py-1 text-xs text-foreground outline-none dark:border-slate-700 dark:bg-slate-800"
                    placeholder="Binance, OKX, Frankfurt..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />

                {focusedExchange && (
                    <div className="mt-2 flex items-center justify-between rounded-md bg-sky-500/10 px-2 py-1 text-[10px] text-sky-700 dark:text-sky-300">
                        <span>
                            Focusing on{" "}
                            <strong>{focusedExchange.name}</strong> – {focusedExchange.city}
                        </span>
                        <button
                            onClick={() => setSelectedExchangeId(null)}
                            className="text-[10px] underline underline-offset-2"
                        >
                            Clear
                        </button>
                    </div>
                )}

                {/* Scrollable list */}
                <div className="mt-2 max-h-38 space-y-1 overflow-y-auto text-xs">
                    {filteredExchanges.length === 0 && (
                        <div className="rounded-md bg-slate-100 text-slate-500 p-2 text-center dark:bg-slate-800 dark:text-slate-400">
                            No matches found
                        </div>
                    )}

                    {filteredExchanges.map((ex) => {
                        const isSelected = selectedExchangeId === ex.id;

                        return (
                            <button
                                key={ex.id}
                                onClick={() =>
                                    setSelectedExchangeId(isSelected ? null : ex.id)
                                }
                                className={`
          flex w-full items-center justify-between rounded-md border px-2 py-1 text-left transition
          ${isSelected
                                        ? // Selected state
                                        "bg-sky-500 text-white border-sky-500 dark:bg-sky-400 dark:text-black dark:border-sky-400"
                                        : // Idle state
                                        "bg-background text-foreground border-slate-300 hover:bg-slate-200/70 dark:bg-slate-900/80 dark:hover:bg-slate-700 dark:text-slate-200 dark:border-slate-700"
                                    }
        `}
                            >
                                <span className="truncate">{ex.name}</span>

                                <span
                                    className={`ml-2 text-[10px] ${isSelected
                                        ? "text-white dark:text-black"
                                        : "text-slate-500 dark:text-slate-400"
                                        }`}
                                >
                                    {ex.city}
                                </span>
                            </button>
                        );
                    })}
                </div>

            </div>
        </div>
    );
}
