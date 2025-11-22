// app/api/latency/route.ts
import { NextResponse } from "next/server";
import { exchanges } from "@/data/exchanges";
import { cloudRegions } from "@/data/cloudRegions";

function randomLatencyForDistance(km: number): number {
    // Very rough: base ~ ms for distance/100 + jitter
    const base = Math.max(10, (km / 100) * 2); // 2ms per 100km baseline
    const jitter = Math.random() * 20 - 10; // -10 to +10
    return Math.round(base + jitter);
}

function toRadians(deg: number) {
    return (deg * Math.PI) / 180;
}

// Haversine distance
function distanceKm(lat1: number, lon1: number, lat2: number, lon2: number) {
    const R = 6371;
    const dLat = toRadians(lat2 - lat1);
    const dLon = toRadians(lon2 - lon1);
    const a =
        Math.sin(dLat / 2) ** 2 +
        Math.cos(toRadians(lat1)) *
        Math.cos(toRadians(lat2)) *
        Math.sin(dLon / 2) ** 2;
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
}

export async function GET() {
    const now = new Date().toISOString();

    const links = exchanges.map((ex) => {
        const region = cloudRegions.find((r) => r.regionCode === ex.regionCode);
        if (!region) return null;

        const dist = distanceKm(ex.lat, ex.lng, region.lat, region.lng);
        const latencyMs = randomLatencyForDistance(dist);

        return {
            id: `${ex.id}-${region.id}`,
            fromId: ex.id,
            toId: region.id,
            fromLat: ex.lat,
            fromLng: ex.lng,
            toLat: region.lat,
            toLng: region.lng,
            latencyMs,
            lastUpdated: now,
        };
    });

    return NextResponse.json({
        links: links.filter(Boolean),
    });
}
