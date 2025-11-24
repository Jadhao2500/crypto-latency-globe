export type LatencyLink = {
    id: string;
    fromId: string;
    toId: string;
    fromLat: number;
    fromLng: number;
    toLat: number;
    toLng: number;
    latencyMs: number;
    lastUpdated: string;
};

export type LatencySample = {
    timestamp: string;
    pairId: string;
    fromId: string;
    toId: string;
    latencyMs: number;
};
