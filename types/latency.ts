// types/latency.ts
export type LatencyLink = {
    id: string;
    fromId: string;
    toId: string;
    fromLat: number;
    fromLng: number;
    toLat: number;
    toLng: number;
    latencyMs: number;
    lastUpdated: string; // ISO string
};

export type LatencySample = {
    timestamp: string; // ISO
    pairId: string;
    latencyMs: number;
};
