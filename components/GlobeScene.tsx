// components/GlobeScene.tsx
"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Globe, { GlobeMethods } from "react-globe.gl";
import { exchanges } from "@/data/exchanges";
import { cloudRegions } from "@/data/cloudRegions";
import { useLatency } from "@/context/LatencyContext";
import type { CloudProvider } from "@/data/exchanges";
import type { LatencyLink } from "@/types/latency";

const providerColor: Record<CloudProvider, string> = {
    AWS: "#22c55e",
    GCP: "#3b82f6",
    AZURE: "#eab308",
};

function latencyColor(ms: number) {
    if (ms < 50) return "#22c55e"; // green
    if (ms < 120) return "#eab308"; // yellow
    return "#ef4444"; // red
}

type Props = {
    activeProviders: CloudProvider[];
    maxLatency: number;
    showRegions: boolean;
    showRealTime: boolean;
};

export function GlobeScene({
    activeProviders,
    maxLatency,
    showRegions,
    showRealTime,
}: Props) {
    const globeRef = useRef<GlobeMethods | undefined>(undefined);
    const { links } = useLatency();
    const [hoverInfo, setHoverInfo] = useState<string | null>(null);

    useEffect(() => {
        if (!globeRef.current) return;
        globeRef.current.pointOfView({ lat: 20, lng: 0, altitude: 2.5 }, 1000);
    }, []);

    const filteredExchanges = useMemo(
        () => exchanges.filter((ex) => activeProviders.includes(ex.provider)),
        [activeProviders]
    );

    const filteredRegions = useMemo(
        () =>
            cloudRegions.filter((r) =>
                activeProviders.includes(r.provider as CloudProvider)
            ),
        [activeProviders]
    );

    const filteredLinks: LatencyLink[] = useMemo(
        () =>
            links.filter(
                (l) =>
                    l.latencyMs <= maxLatency &&
                    showRealTime // toggle layer
            ),
        [links, maxLatency, showRealTime]
    );

    return (
        <div className="relative h-full w-full">
            <Globe
                ref={globeRef as any}
                globeImageUrl="//unpkg.com/three-globe/example/img/earth-blue-marble.jpg"
                bumpImageUrl="//unpkg.com/three-globe/example/img/earth-topology.png"
                backgroundColor="rgba(15,23,42,1)" // slate-900
                showAtmosphere
                atmosphereColor="lightskyblue"
                atmosphereAltitude={0.25}
                pointsData={filteredExchanges}
                pointLat="lat"
                pointLng="lng"
                pointAltitude={0.03}
                pointColor={(d: any) => providerColor[d.provider as CloudProvider]}
                pointRadius={0.3}
                pointLabel={(d: any) =>
                    `${d.name} (${d.city})\n${d.provider} - ${d.regionCode}`
                }
                arcsData={filteredLinks}
                arcStartLat="fromLat"
                arcStartLng="fromLng"
                arcEndLat="toLat"
                arcEndLng="toLng"
                arcColor={(d: any) => [latencyColor(d.latencyMs), latencyColor(d.latencyMs)]}
                arcStroke={0.5}
                arcDashLength={0.4}
                arcDashGap={0.7}
                arcDashAnimateTime={4000}
            />

            {/* Region markers as rings */}
            {showRegions && (
                <Globe
                    // overlay with small rings – quick hack using second instance
                    ref={undefined as any}
                    globeImageUrl=""
                    width={0}
                    height={0}
                    pointsData={filteredRegions}
                    pointLat="lat"
                    pointLng="lng"
                    pointAltitude={0.02}
                    pointColor={(d: any) => providerColor[d.provider as CloudProvider]}
                    pointRadius={0.2}
                    pointLabel={(d: any) =>
                        `${d.name}\n${d.provider} - ${d.regionCode}`
                    }
                />
            )}

            {/* Legend */}
            <div className="absolute left-4 top-4 space-y-2 rounded-xl bg-slate-900/80 p-3 text-xs shadow-lg backdrop-blur">
                <div className="font-semibold text-slate-100">Legend</div>
                <div className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full" style={{ background: providerColor.AWS }} />
                    <span>AWS exchanges / regions</span>
                </div>
                <div className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full" style={{ background: providerColor.GCP }} />
                    <span>GCP exchanges / regions</span>
                </div>
                <div className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full" style={{ background: providerColor.AZURE }} />
                    <span>Azure exchanges / regions</span>
                </div>
                <div className="mt-1 text-[10px] text-slate-400">
                    Link colors: green (&lt;50ms), yellow (&lt;120ms), red (slow)
                </div>
            </div>

            {hoverInfo && (
                <div className="pointer-events-none absolute bottom-4 left-1/2 -translate-x-1/2 rounded-xl bg-slate-900/90 px-3 py-2 text-xs text-slate-100 shadow-lg">
                    {hoverInfo}
                </div>
            )}
        </div>
    );
}
