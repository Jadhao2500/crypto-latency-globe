// components/LatencyChart.tsx
"use client";

import { useMemo, useState } from "react";
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

    const now = Date.now();

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
        <div className="flex h-full flex-col rounded-xl bg-slate-900/80 p-4 text-xs text-slate-200 shadow-xl backdrop-blur">
            <div className="mb-2 flex items-center justify-between">
                <h2 className="text-sm font-semibold">Historical Latency</h2>
                <div className="flex gap-1">
                    {(["1h", "24h", "7d"] as TimeRange[]).map((r) => (
                        <button
                            key={r}
                            onClick={() => setRange(r)}
                            className={`rounded-full px-2 py-1 text-[11px] ${r === range ? "bg-sky-500 text-white" : "bg-slate-800"
                                }`}
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
                        <Tooltip
                            labelStyle={{ fontSize: 11 }}
                            formatter={(value) => [`${value} ms`, "Latency"]}
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
