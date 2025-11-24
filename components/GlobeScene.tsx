// components/GlobeScene.tsx
"use client";

import { useLatency } from "@/context/LatencyContext";
import type { CloudProvider } from "@/data/exchanges";
import { exchanges } from "@/data/exchanges";
import type { LatencyLink } from "@/types/latency";
import { useEffect, useMemo, useRef, useState } from "react";
import Globe, { GlobeMethods } from "react-globe.gl";

const providerColor: Record<CloudProvider, string> = {
    AWS: "#22c55e",
    GCP: "#3b82f6",
    AZURE: "#eab308",
};

function latencyColor(ms: number) {
    if (ms < 50) return "#22c55e"; // low
    if (ms < 120) return "#eab308"; // medium
    return "#ef4444"; // high
}

function latencyLabel(ms: number) {
    if (ms < 50) return "Low";
    if (ms < 120) return "Medium";
    return "High";
}

type Props = {
    activeProviders: CloudProvider[];
    maxLatency: number;
    showRegions?: boolean;
    showRealTime: boolean;
    selectedExchangeId: string | null;
};

export function GlobeScene({
    activeProviders,
    maxLatency,
    showRealTime,
    selectedExchangeId,
}: Props) {
    const globeRef = useRef<GlobeMethods | undefined>(undefined);
    const containerRef = useRef<HTMLDivElement | null>(null);
    const { links } = useLatency();

    const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
    const [hoveredLink, setHoveredLink] = useState<LatencyLink | null>(null);

    // measure container for proper canvas size
    useEffect(() => {
        const handleResize = () => {
            if (!containerRef.current) return;
            const rect = containerRef.current.getBoundingClientRect();
            setDimensions({ width: rect.width, height: rect.height });
        };

        handleResize();
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    // initial camera
    useEffect(() => {
        if (!globeRef.current) return;
        globeRef.current.pointOfView({ lat: 20, lng: 0, altitude: 2.8 }, 1000);
    }, [dimensions.width, dimensions.height]);

    useEffect(() => {
        if (!globeRef.current || !selectedExchangeId) return;
        const ex = exchanges.find((e) => e.id === selectedExchangeId);
        if (!ex) return;

        globeRef.current.pointOfView(
            { lat: ex.lat, lng: ex.lng, altitude: 1.5 },
            1000
        );
    }, [selectedExchangeId]);


    const filteredExchanges = useMemo(
        () => exchanges.filter((ex) => activeProviders.includes(ex.provider)),
        [activeProviders]
    );


    // only keep links for active providers and within latency slider
    const filteredLinks: LatencyLink[] = useMemo(
        () =>
            links.filter((l) => {
                if (!showRealTime || l.latencyMs > maxLatency) return false;

                const ex = exchanges.find((e) => e.id === l.fromId);
                if (!ex) return false;
                if (!activeProviders.includes(ex.provider)) return false;

                if (selectedExchangeId && l.fromId !== selectedExchangeId) return false;

                return true;
            }),
        [links, maxLatency, showRealTime, activeProviders, selectedExchangeId]
    );


    // Pulse effect: rings at the "from" exchange locations,
    // speed slightly slower for high latency so it "feels" sluggish.
    const ringData = useMemo(
        () =>
            filteredLinks.map((l) => {
                const ex = exchanges.find((e) => e.id === l.fromId)!;
                const baseSpeed = 0.8; // lower = slower propagation
                const speed =
                    l.latencyMs < 50 ? baseSpeed * 1.6 : l.latencyMs < 120 ? baseSpeed : baseSpeed * 0.6;

                return {
                    ...l,
                    lat: ex.lat,
                    lng: ex.lng,
                    propagationSpeed: speed,
                    maxRadius: 3.5,
                };
            }),
        [filteredLinks]
    );

    const ready = dimensions.width > 0 && dimensions.height > 0;

    return (
        <div
            ref={containerRef}
            className="relative h-full w-full overflow-hidden"
        >
            {ready && (
                <Globe
                    ref={globeRef}
                    width={dimensions.width}
                    height={dimensions.height}
                    globeImageUrl="//unpkg.com/three-globe/example/img/earth-blue-marble.jpg"
                    bumpImageUrl="//unpkg.com/three-globe/example/img/earth-topology.png"
                    backgroundColor="rgba(15,23,42,1)"
                    showAtmosphere
                    atmosphereColor="lightskyblue"
                    atmosphereAltitude={0.25}
                    // exchange points
                    pointsData={filteredExchanges}
                    pointLat="lat"
                    pointLng="lng"
                    pointAltitude={0.03}
                    pointColor={(d: any) => providerColor[d.provider as CloudProvider]}
                    pointRadius={0.3}
                    pointLabel={(d: any) =>
                        `${d.name} (${d.city})\n${d.provider} - ${d.regionCode}`
                    }
                    // animated latency arcs (data streams)
                    arcsData={filteredLinks}
                    arcStartLat="fromLat"
                    arcStartLng="fromLng"
                    arcEndLat="toLat"
                    arcEndLng="toLng"
                    arcAltitude={0.2}
                    arcStroke={0.5}
                    arcColor={(d: any) => [
                        latencyColor(d.latencyMs),
                        latencyColor(d.latencyMs),
                    ]}
                    // makes it look like moving packets
                    arcDashLength={0.3}
                    arcDashGap={0.7}
                    arcDashAnimateTime={3000}
                    onArcHover={(arc: any) => setHoveredLink(arc ?? null)}
                    // pulsing rings from each exchange
                    ringsData={ringData}
                    ringLat="lat"
                    ringLng="lng"
                    ringColor={(d: any) => latencyColor(d.latencyMs)}
                    ringMaxRadius={(d: any) => d.maxRadius}
                    ringPropagationSpeed={(d: any) => d.propagationSpeed}
                    ringRepeatPeriod={2000}
                />
            )}

            {/* Legend */}
            <div
                className="
        pointer-events-none
        absolute
        bottom-2 left-2 max-w-[80%]
        rounded-lg px-3 py-2 text-[10px] sm:text-xs shadow-md backdrop-blur
        border border-slate-200 dark:border-slate-800
        bg-(--background)/85
        sm:bottom-4 sm:left-4 sm:max-w-xs
        md:top-2 md:bottom-auto
      "
            >
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

            {/* Hover pill with real-time latency value */}
            {hoveredLink && (
                <div className="pointer-events-none absolute bottom-3 left-1/2 flex -translate-x-1/2 items-center gap-3 rounded-full bg-slate-900/90 px-4 py-2 text-[11px] text-slate-100 shadow-xl backdrop-blur">
                    <span className="font-mono">
                        {hoveredLink.latencyMs} ms
                    </span>
                    <span
                        className="h-2 w-2 rounded-full"
                        style={{ background: latencyColor(hoveredLink.latencyMs) }}
                    />
                    <span className="uppercase tracking-wide text-slate-300">
                        {latencyLabel(hoveredLink.latencyMs)} latency
                    </span>
                    <span className="text-slate-400">
                        (updated&nbsp;{new Date(hoveredLink.lastUpdated).toLocaleTimeString()})
                    </span>
                </div>
            )}
        </div>
    );

}
