/**
 * Hungary basemap MapLibre style and default map options.
 */

import type { LngLatBoundsLike, StyleSpecification } from "maplibre-gl";

export function getHungaryBasemapStyle(staticBase: string): StyleSpecification {
    return {
        version: 8,
        sources: {
            basemap: {
                type: "vector",
                url: `pmtiles://${staticBase}/basemap-hu.pmtiles`,
            },
        },
        layers: [
            {
                id: "water",
                type: "fill",
                source: "basemap",
                "source-layer": "water",
                paint: { "fill-color": "#e8f1fb" },
            },
            {
                id: "land",
                type: "fill",
                source: "basemap",
                "source-layer": "land",
                paint: { "fill-color": "#f5f5f5" },
            },
        ],
    };
}

export function getHungaryMapOptions(
    bounds: [[number, number], [number, number]],
    disableZoomPan = false
): {
    center: [number, number];
    zoom: number;
    minZoom: number;
    maxZoom: number;
    maxBounds: LngLatBoundsLike;
    scrollZoom?: boolean;
    dragPan?: boolean;
} {
    const center: [number, number] = [
        (bounds[0][0] + bounds[1][0]) / 2,
        (bounds[0][1] + bounds[1][1]) / 2,
    ];
    return {
        center,
        zoom: 5,
        minZoom: 4.5,
        maxZoom: 10,
        maxBounds: bounds,
        ...(disableZoomPan ? { scrollZoom: false, dragPan: false } : {}),
    };
}
