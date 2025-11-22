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
    if (ms < 50) return "#22c55e";
    if (ms < 120) return "#eab308";
    return "#ef4444";
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
    const globeRef = useRef<GlobeMethods | undefined>();
    const containerRef = useRef<HTMLDivElement | null>(null);

    const { links } = useLatency();
    const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

    // Measure container and keep globe width/height in sync
    useEffect(() => {
        const handleResize = () => {
            if (!containerRef.current) return;
            const rect = containerRef.current.getBoundingClientRect();
            setDimensions({
                width: rect.width,
                height: rect.height,
            });
        };

        handleResize();
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    // Initial camera POV
    useEffect(() => {
        if (!globeRef.current) return;
        globeRef.current.pointOfView({ lat: 20, lng: 0, altitude: 2.8 }, 1000);
    }, [dimensions.width, dimensions.height]); // rerun once we know size

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
                (l) => l.latencyMs <= maxLatency && showRealTime
            ),
        [links, maxLatency, showRealTime]
    );

    const ready = dimensions.width > 0 && dimensions.height > 0;

    return (
        <div
            ref={containerRef}
            className="relative h-full w-full overflow-hidden"
        >
            {ready && (
                <Globe
                    ref={globeRef as any}
                    width={dimensions.width}
                    height={dimensions.height}
                    globeImageUrl="//unpkg.com/three-globe/example/img/earth-blue-marble.jpg"
                    bumpImageUrl="//unpkg.com/three-globe/example/img/earth-topology.png"
                    backgroundColor="rgba(15,23,42,1)"
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
                    arcColor={(d: any) => [
                        latencyColor(d.latencyMs),
                        latencyColor(d.latencyMs),
                    ]}
                    arcStroke={0.5}
                    arcDashLength={0.4}
                    arcDashGap={0.7}
                    arcDashAnimateTime={4000}
                />
            )}

            {/* Region markers could be added via custom objects; for now they’re still
          represented via exchange mapping + legend. */}

            {/* Legend */}
            <div className="absolute left-2 top-2 max-w-[70vw] space-y-1 rounded-xl bg-slate-900/80 p-2 text-[10px] text-slate-100 shadow-lg backdrop-blur sm:left-4 sm:top-4 sm:max-w-xs sm:p-3 sm:text-xs">
                <div className="font-semibold">Legend</div>
                <div className="flex items-center gap-2">
                    <span
                        className="h-2 w-2 rounded-full"
                        style={{ background: providerColor.AWS }}
                    />
                    <span>AWS exchanges / regions</span>
                </div>
                <div className="flex items-center gap-2">
                    <span
                        className="h-2 w-2 rounded-full"
                        style={{ background: providerColor.GCP }}
                    />
                    <span>GCP exchanges / regions</span>
                </div>
                <div className="flex items-center gap-2">
                    <span
                        className="h-2 w-2 rounded-full"
                        style={{ background: providerColor.AZURE }}
                    />
                    <span>Azure exchanges / regions</span>
                </div>
                <div className="mt-1 text-[9px] text-slate-400">
                    Link colors: green (&lt;50ms), yellow (&lt;120ms), red (slow)
                </div>
            </div>
        </div>
    );
}
