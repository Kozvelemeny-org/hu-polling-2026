/**
 * MapLibre OEVK layer helpers: add layers, update data, and control the highlight outline.
 */

import type { Map, AddLayerObject } from "maplibre-gl";
import { DIFF_THRESHOLDS, type PartyDataColors } from "./oevkMapConfig";

export const OEVK_FILL_LAYER_ID = "oevk-fill";
export const OEVK_HIGHLIGHT_LAYER_ID = "oevk-highlight";

/**
 * Returns the id of the first symbol layer in the style, or undefined if there are none
 * (e.g. minimal basemap with only water/land). Use undefined to add layers on top.
 */
export function getFirstSymbolLayerId(map: Map): string | undefined {
    const layers = map.getStyle()?.layers;
    if (layers) {
        for (const layer of layers) {
            if (layer.type === "symbol") return layer.id;
        }
    }
    return undefined;
}

function addLayerBefore(map: Map, layer: AddLayerObject, beforeId: string | undefined): void {
    if (beforeId != null && map.getLayer(beforeId)) {
        map.addLayer(layer, beforeId);
    } else {
        map.addLayer(layer);
    }
}

export function addOevkLayers(
    map: Map,
    geojsonData: GeoJSON.FeatureCollection,
    colors: string[],
    firstSymbolId: string | undefined,
    partyData: PartyDataColors
): void {
    // Line layer (thin outlines)
    addLayerBefore(
        map,
        {
            id: "oevk-lines",
            type: "line",
            source: { type: "geojson", data: geojsonData },
            paint: {
                "line-width": 0.5,
                "line-opacity": 0.2,
            },
        },
        firstSymbolId
    );
    map.setPaintProperty("oevk-lines", "line-color", [
        "case",
        [">=", ["get", "diff"], 0.05],
        partyData.tisza.color,
        ["<=", ["get", "diff"], -0.05],
        partyData.fidesz.color,
        "#000",
    ]);

    // Highlight layer (thicker grey outline when hovering from distribution)
    addLayerBefore(
        map,
        {
            id: OEVK_HIGHLIGHT_LAYER_ID,
            type: "line",
            source: { type: "geojson", data: geojsonData },
            filter: ["==", "OEVK", ""],
            paint: {
                "line-color": "#666",
                "line-width": 2.5,
            },
        },
        firstSymbolId
    );

    // Fill layer
    addLayerBefore(
        map,
        {
            id: OEVK_FILL_LAYER_ID,
            type: "fill",
            source: { type: "geojson", data: geojsonData },
            paint: {
                "fill-color": [
                    "step",
                    ["get", "diff"],
                    colors[0],
                    DIFF_THRESHOLDS[0],
                    colors[1],
                    DIFF_THRESHOLDS[1],
                    colors[2],
                    DIFF_THRESHOLDS[2],
                    colors[3],
                    DIFF_THRESHOLDS[3],
                    colors[4],
                ],
                "fill-opacity": 0.6,
            },
        },
        firstSymbolId
    );
}

export function updateOevkData(
    map: Map,
    geojsonData: GeoJSON.FeatureCollection,
    oevkDiffs: Record<string, number>
): void {
    for (const feature of geojsonData.features) {
        if (!feature.properties) continue;
        feature.properties.diff = oevkDiffs[feature.properties.OEVK as string] ?? 0;
    }
    const linesSource = map.getSource("oevk-lines");
    const highlightSource = map.getSource(OEVK_HIGHLIGHT_LAYER_ID);
    const fillSource = map.getSource(OEVK_FILL_LAYER_ID);
    const setGeoJsonData = (s: unknown, d: GeoJSON.FeatureCollection) => (s as { setData: (d: GeoJSON.FeatureCollection) => void }).setData(d);
    if (linesSource && linesSource.type === "geojson") setGeoJsonData(linesSource, geojsonData);
    if (highlightSource && highlightSource.type === "geojson") setGeoJsonData(highlightSource, geojsonData);
    if (fillSource && fillSource.type === "geojson") setGeoJsonData(fillSource, geojsonData);
}

/**
 * Set which OEVK is highlighted on the map (e.g. from hovering in OEVKDistribution).
 * Pass null to clear the highlight.
 */
export function setOevkHighlight(map: Map, oevkId: string | null): void {
    if (!map.getLayer(OEVK_HIGHLIGHT_LAYER_ID)) return;
    map.setFilter(OEVK_HIGHLIGHT_LAYER_ID, oevkId ? ["==", "OEVK", oevkId] : ["==", "OEVK", ""]);
}
