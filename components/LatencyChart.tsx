// components/LatencyChart.tsx
"use client";

import { useMemo, useState, useEffect } from "react";
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    Tooltip,
    ResponsiveContainer,
} from "recharts";
import { useLatency } from "@/context/LatencyContext";
import type { LatencySample } from "@/types/latency";

type TimeRange = "1h" | "24h" | "7d";

const rangeToMs: Record<TimeRange, number> = {
    "1h": 60 * 60 * 1000,
    "24h": 24 * 60 * 60 * 1000,
    "7d": 7 * 24 * 60 * 60 * 1000,
};

type Props = {
    pairId?: string;
    selectedExchangeId?: string | null;
    selectedExchangeLabel?: string;
};

export function LatencyChart({
    pairId,
    selectedExchangeId,
    selectedExchangeLabel,
}: Props) {
    const { history } = useLatency();
    const [range, setRange] = useState<TimeRange>("1h");
    const [now, setNow] = useState(() => Date.now());

    // keep "now" moving so window slides
    useEffect(() => {
        const id = setInterval(() => setNow(Date.now()), 1000);
        return () => clearInterval(id);
    }, []);

    const cutoff = useMemo(
        () => now - rangeToMs[range],
        [now, range]
    );

    // filter samples by time window + selected exchange
    const filtered: LatencySample[] = useMemo(() => {
        return history.filter((s) => {
            const ts = new Date(s.timestamp).getTime();
            if (ts < cutoff) return false;
            if (selectedExchangeId && s.fromId !== selectedExchangeId) return false;
            return true;
        });
    }, [history, cutoff, selectedExchangeId]);

    // sorted chart data with numeric timestamp
    const chartData = useMemo(
        () =>
            filtered
                .slice()
                .sort(
                    (a, b) =>
                        new Date(a.timestamp).getTime() -
                        new Date(b.timestamp).getTime()
                )
                .map((s) => ({
                    time: new Date(s.timestamp).getTime(), // numeric x
                    latency: s.latencyMs,
                })),
        [filtered]
    );

    const stats = useMemo(() => {
        if (!filtered.length) return null;
        const vals = filtered.map((s) => s.latencyMs);
        const min = Math.min(...vals);
        const max = Math.max(...vals);
        const avg = vals.reduce((a, b) => a + b, 0) / vals.length;
        return { min, max, avg: Number(avg.toFixed(1)) };
    }, [filtered]);

    // helpers to format time for axis / tooltip
    const formatTick = (t: number) => {
        const d = new Date(t);
        if (range === "1h") {
            return d.toLocaleTimeString(undefined, {
                hour: "2-digit",
                minute: "2-digit",
                second: "2-digit",
            });
        }
        if (range === "24h") {
            return d.toLocaleTimeString(undefined, {
                hour: "2-digit",
                minute: "2-digit",
            });
        }
        // 7d -> show date + time
        return d.toLocaleString(undefined, {
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    const formatTooltipLabel = (value: number) => {
        const d = new Date(value);
        if (range === "1h") {
            return d.toLocaleTimeString();
        }
        if (range === "24h") {
            return d.toLocaleString(undefined, {
                hour: "2-digit",
                minute: "2-digit",
                second: "2-digit",
            });
        }
        return d.toLocaleString();
    };

    return (
        <div
            className="flex flex-col gap-3 rounded-xl border border-slate-200
                 bg-[var(--background)] p-4 text-[var(--foreground)]
                 shadow-md transition-colors duration-300 dark:border-slate-800 dark:shadow-lg"
        >
            <div className="mb-2 flex items-center justify-between">
                <div>
                    <h2 className="text-sm font-semibold">Historical Latency</h2>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400">
                        {selectedExchangeId
                            ? `Focused on ${selectedExchangeLabel ?? "selected exchange"}`
                            : "All visible exchanges"}
                    </p>
                </div>
                <div className="flex gap-1">
                    {(["1h", "24h", "7d"] as TimeRange[]).map((r) => (
                        <button
                            key={r}
                            onClick={() => setRange(r)}
                            className={`
                text-xs px-3 py-1 rounded-full border transition-colors duration-200
                ${r === range
                                    ? "bg-sky-500 text-white border-sky-500 dark:bg-sky-400 dark:text-black dark:border-sky-400"
                                    : "bg-slate-100 text-slate-700 border-slate-300 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-200 dark:border-slate-700 dark:hover:bg-slate-700"
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
                            type="number"
                            domain={[cutoff, now]}
                            tickFormatter={formatTick}
                            tick={{ fontSize: 10 }}
                        />
                        <YAxis
                            domain={["auto", "auto"]}
                            tick={{ fontSize: 10 }}
                            tickFormatter={(v) => `${v}ms`}
                        />
                        <Tooltip
                            labelFormatter={(v) => formatTooltipLabel(v as number)}
                            formatter={(value: any) => [`${value} ms`, "Latency"]}
                            contentStyle={{
                                background: "var(--background)",
                                color: "var(--foreground)",
                                borderRadius: 6,
                            }}
                            labelStyle={{ color: "var(--foreground)" }}
                        />
                        <Line
                            type="monotone"
                            dataKey="latency"
                            strokeWidth={2}
                            isAnimationActive={true}
                            animationDuration={400}
                            dot={false}
                        />
                    </LineChart>
                </ResponsiveContainer>
            </div>

            {stats ? (
                <div className="mt-3 grid grid-cols-3 gap-2 text-[11px]">
                    <div>
                        <div className="text-slate-400">Min</div>
                        <div className="font-mono">{stats.min} ms</div>
                    </div>
                    <div>
                        <div className="text-slate-400">Avg</div>
                        <div className="font-mono">{stats.avg} ms</div>
                    </div>
                    <div>
                        <div className="text-slate-400">Max</div>
                        <div className="font-mono">{stats.max} ms</div>
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
