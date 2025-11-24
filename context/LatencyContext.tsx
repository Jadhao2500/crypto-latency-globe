// context/LatencyContext.tsx
"use client";

import {
    createContext,
    useContext,
    useEffect,
    useState,
    ReactNode,
} from "react";
import type { LatencyLink, LatencySample } from "@/types/latency";

type LatencyContextValue = {
    links: LatencyLink[];
    history: LatencySample[];
};

const LatencyContext = createContext<LatencyContextValue | undefined>(
    undefined
);

const HISTORY_LIMIT = 4000; // keep memory under control

export function LatencyProvider({ children }: { children: ReactNode }) {
    const [links, setLinks] = useState<LatencyLink[]>([]);
    const [history, setHistory] = useState<LatencySample[]>([]);
    const [seededDemoHistory, setSeededDemoHistory] = useState(false);

    // ---- live polling ----
    useEffect(() => {
        let isCancelled = false;

        const fetchLatency = async () => {
            try {
                const res = await fetch("/api/latency");
                if (!res.ok) return;
                const data = await res.json();
                if (isCancelled) return;

                const newLinks: LatencyLink[] = data.links;
                setLinks(newLinks);

                const samples: LatencySample[] = newLinks.map((l) => ({
                    timestamp: l.lastUpdated,
                    pairId: l.id,
                    fromId: l.fromId,
                    toId: l.toId,
                    latencyMs: l.latencyMs,
                }));

                setHistory((prev) => {
                    const merged = [...prev, ...samples];
                    if (merged.length > HISTORY_LIMIT) {
                        return merged.slice(merged.length - HISTORY_LIMIT);
                    }
                    return merged;
                });
            } catch (e) {
                console.error("Latency fetch failed", e);
            }
        };

        fetchLatency();
        const id = setInterval(fetchLatency, 5000);

        return () => {
            isCancelled = true;
            clearInterval(id);
        };
    }, []);

    // ---- seed synthetic 7d / 24h / 1h history for demo ----
    useEffect(() => {
        // Only seed once, when we have some real links but almost no history yet
        if (seededDemoHistory) return;
        if (!links.length) return;
        if (history.length > 5) return; // if you already have data, skip seeding

        const now = Date.now();
        const sevenDaysMs = 7 * 24 * 60 * 60 * 1000;

        const synthetic: LatencySample[] = [];

        const addSyntheticPoints = (
            startOffsetMs: number,
            endOffsetMs: number,
            stepMs: number,
            jitterFactor: number
        ) => {
            for (let t = now - startOffsetMs; t < now - endOffsetMs; t += stepMs) {
                links.forEach((l) => {
                    const base = l.latencyMs || 20;
                    const jitter =
                        base *
                        (1 + (Math.random() - 0.5) * jitterFactor); // e.g. +/- 20–40%
                    const value = Math.max(2, Math.round(jitter));

                    synthetic.push({
                        timestamp: new Date(t).toISOString(),
                        pairId: l.id,
                        fromId: l.fromId,
                        toId: l.toId,
                        latencyMs: value,
                    });
                });
            }
        };

        // last 7d: every 3h, mild jitter
        addSyntheticPoints(sevenDaysMs, 24 * 60 * 60 * 1000, 3 * 60 * 60 * 1000, 0.25);

        // last 24h: every 30min, medium jitter
        addSyntheticPoints(24 * 60 * 60 * 1000, 60 * 60 * 1000, 30 * 60 * 1000, 0.4);

        // last 1h: every 5min, higher jitter (more “live”)
        addSyntheticPoints(60 * 60 * 1000, 0, 5 * 60 * 1000, 0.6);

        // sort synthetic data by time
        synthetic.sort(
            (a, b) =>
                new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
        );

        setHistory((prev) => {
            const merged = [...synthetic, ...prev]; // synthetic first, then real
            if (merged.length > HISTORY_LIMIT) {
                return merged.slice(merged.length - HISTORY_LIMIT);
            }
            return merged;
        });

        setSeededDemoHistory(true);
    }, [links, history.length, seededDemoHistory]);

    return (
        <LatencyContext.Provider value={{ links, history }}>
            {children}
        </LatencyContext.Provider>
    );
}

export function useLatency() {
    const ctx = useContext(LatencyContext);
    if (!ctx) throw new Error("useLatency must be used inside LatencyProvider");
    return ctx;
}
