/**
 * Register the pmtiles protocol with MapLibre. Call once before creating a map that uses pmtiles sources.
 */

import maplibregl from "maplibre-gl";
import * as pmtiles from "pmtiles";

let registered = false;

export function registerPmtilesProtocol(): void {
    if (registered) return;
    const protocol = new pmtiles.Protocol();
    maplibregl.addProtocol("pmtiles", protocol.tile);
    registered = true;
}
