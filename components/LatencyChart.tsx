// components/LatencyChart.tsx
"use client";

import { useMemo, useState, useEffect } from "react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { useLatency } from "@/context/LatencyContext";
import type { LatencySample } from "@/types/latency";

type TimeRange = "1h" | "24h" | "7d";

const rangeToMs: Record<TimeRange, number> = {
    "1h": 60 * 60 * 1000,
    "24h": 24 * 60 * 60 * 1000,
    "7d": 7 * 24 * 60 * 60 * 1000,
};

type Props = {
    pairId?: string; // future: filter by pair; for now we aggregate
};

export function LatencyChart({ pairId }: Props) {
    const { history } = useLatency();
    const [range, setRange] = useState<TimeRange>("1h");

    const [now, setNow] = useState(() => Date.now());

    // Update 'now' every second to keep the chart window moving
    useEffect(() => {
        const interval = setInterval(() => setNow(Date.now()), 1000);
        return () => clearInterval(interval);
    }, []);

    const filtered: LatencySample[] = useMemo(() => {
        const cutoff = now - rangeToMs[range];
        return history.filter((s) => {
            const t = new Date(s.timestamp).getTime();
            if (t < cutoff) return false;
            if (pairId && s.pairId !== pairId) return false;
            return true;
        });
    }, [history, range, now, pairId]);

    const chartData = filtered.map((s) => ({
        time: new Date(s.timestamp).toLocaleTimeString(),
        latency: s.latencyMs,
    }));

    const stats = useMemo(() => {
        if (!filtered.length) return null;
        const values = filtered.map((s) => s.latencyMs);
        const min = Math.min(...values);
        const max = Math.max(...values);
        const avg = values.reduce((a, b) => a + b, 0) / values.length;
        return { min, max, avg: Number(avg.toFixed(1)) };
    }, [filtered]);

    return (
        <div className="flex flex-col gap-3 p-4 rounded-xl 
       bg-background
       text-foreground
       border border-slate-200 dark:border-slate-800
       shadow-md dark:shadow-lg transition-colors duration-300">
            <div className="mb-2 flex items-center justify-between">
                <h2 className="text-sm font-semibold">Historical Latency</h2>
                <div className="flex gap-1">
                    {(["1h", "24h", "7d"] as TimeRange[]).map((r) => (
                        <button
                            key={r}
                            onClick={() => setRange(r)}
                            className={`
    text-xs px-3 py-1 rounded-full border transition-colors duration-200
    ${r === range
                                    ? // Active state (theme-aware)
                                    "bg-sky-500 text-white border-sky-500 dark:bg-sky-400 dark:text-black dark:border-sky-400"
                                    : // Idle state (theme-aware)
                                    "bg-slate-100 text-slate-700 border-slate-300 hover:bg-slate-200 \
           dark:bg-slate-800 dark:text-slate-200 dark:border-slate-700 dark:hover:bg-slate-700"
                                }
  `}
                        >
                            {r}
                        </button>
                    ))}
                </div>
            </div>

            <div className="h-40">
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData}>
                        <XAxis
                            dataKey="time"
                            hide
                        />
                        <YAxis
                            domain={["auto", "auto"]}
                            tick={{ fontSize: 10 }}
                            tickFormatter={(v) => `${v}ms`}
                        />
                        {/* <Tooltip
                            labelStyle={{ fontSize: 11 }}
                            formatter={(value) => [`${value} ms`, "Latency"]}
                        /> */}
                        <Tooltip
                            contentStyle={{ background: "var(--background)", color: "var(--foreground)", borderRadius: "6px" }}
                            labelStyle={{ color: "var(--foreground)" }}
                        />
                        <Line
                            type="monotone"
                            dataKey="latency"
                            dot={false}
                            strokeWidth={2}
                        />
                    </LineChart>
                </ResponsiveContainer>
            </div>

            {stats ? (
                <div className="mt-3 grid grid-cols-3 gap-2 text-[11px]">
                    <div>
                        <div className="text-slate-400">Min</div>
                        <div className="font-mono text-slate-100">{stats.min} ms</div>
                    </div>
                    <div>
                        <div className="text-slate-400">Avg</div>
                        <div className="font-mono text-slate-100">{stats.avg} ms</div>
                    </div>
                    <div>
                        <div className="text-slate-400">Max</div>
                        <div className="font-mono text-slate-100">{stats.max} ms</div>
                    </div>
                </div>
            ) : (
                <div className="mt-3 text-[11px] text-slate-400">
                    Waiting for latency data...
                </div>
            )}
        </div>
    );
}
