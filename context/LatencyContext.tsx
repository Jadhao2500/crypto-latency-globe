// context/LatencyContext.tsx
"use client";

import React, {
    createContext,
    useContext,
    useEffect,
    useMemo,
    useState,
} from "react";
import type { LatencyLink, LatencySample } from "@/types/latency";

type LatencyContextValue = {
    links: LatencyLink[];
    history: LatencySample[];
};

const LatencyContext = createContext<LatencyContextValue | undefined>(
    undefined
);

export const LatencyProvider: React.FC<{ children: React.ReactNode }> = ({
    children,
}) => {
    const [links, setLinks] = useState<LatencyLink[]>([]);
    const [history, setHistory] = useState<LatencySample[]>([]);

    // Poll every 5s
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
                    // Keep last N samples (e.g., last 1000)
                    return merged.slice(-1000);
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

    const value = useMemo(
        () => ({
            links,
            history,
        }),
        [links, history]
    );

    return (
        <LatencyContext.Provider value={value}>
            {children}
        </LatencyContext.Provider>
    );
};

export const useLatency = () => {
    const ctx = useContext(LatencyContext);
    if (!ctx) {
        throw new Error("useLatency must be used within LatencyProvider");
    }
    return ctx;
};
