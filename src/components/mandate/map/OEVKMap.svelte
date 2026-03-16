<script lang="ts">
    import { createEventDispatcher, onMount } from "svelte";
    import maplibregl from "maplibre-gl";

    import { partyData } from "$stores/dataStore";
    import type { Simulation } from "$lib/types";
    import { staticBase } from "$lib/staticAssets";

    import {
        HUNGARY_BOUNDS,
        DEFAULT_LEGEND_STATE,
        diffToLegendState,
        getOevkColors,
        loadOevkGeojson,
    } from "$lib/map/oevkMapConfig";
    import { getHungaryBasemapStyle, getHungaryMapOptions } from "$lib/map/hungaryBasemapStyle";
    import { registerPmtilesProtocol } from "$lib/map/pmtilesProtocol";
    import {
        getFirstSymbolLayerId,
        addOevkLayers,
        updateOevkData,
        setOevkHighlight,
        OEVK_FILL_LAYER_ID,
    } from "$lib/map/oevkLayers";
    import OEVKMapLegend from "./OEVKMapLegend.svelte";

    export let data = {} as Simulation["oevkDiffs"];
    export let highlightedOevk = null as string | null;
    export let showInfoBar = false;
    export let disableZoomPan = false;

    const dispatch = createEventDispatcher();

    let mapContainer: HTMLElement;
    let map: maplibregl.Map;
    let mapLoaded = false;
    let geoJsonLoaded = false;
    let geoJsonLoading = false;
    let geojsonData: GeoJSON.FeatureCollection;
    let legendState = DEFAULT_LEGEND_STATE;

    const colors = getOevkColors(partyData);

    $: if (mapLoaded && map && data && !geoJsonLoaded && !geoJsonLoading) {
        loadGeoJSON();
    }

    async function loadGeoJSON() {
        if (!data || !map || !mapLoaded) return;
        if (geoJsonLoading) return;
        geoJsonLoading = true;
        try {
            if (!geojsonData) {
                geojsonData = await loadOevkGeojson(staticBase);
            }
            for (const feature of geojsonData.features) {
                if (!feature.properties) continue;
                feature.properties.diff = data[feature.properties?.OEVK as string] ?? 0;
            }
            const firstSymbolId = getFirstSymbolLayerId(map);
            addOevkLayers(map, geojsonData, colors, firstSymbolId, partyData);
            geoJsonLoaded = true;
        } finally {
            geoJsonLoading = false;
        }
    }

    $: if (mapLoaded && geoJsonLoaded && data) {
        updateOevkData(map, geojsonData, data);
    }

    $: if (mapLoaded && geoJsonLoaded && map) {
        setOevkHighlight(map, highlightedOevk);
    }

    async function loadMap() {
        registerPmtilesProtocol();
        await import("maplibre-gl/dist/maplibre-gl.css");

        map = new maplibregl.Map({
            container: mapContainer,
            attributionControl: false,
            style: getHungaryBasemapStyle(staticBase),
            ...getHungaryMapOptions(HUNGARY_BOUNDS, disableZoomPan),
        });

        map.on("load", () => {
            mapLoaded = true;
            if (disableZoomPan) {
                map.touchZoomRotate.disable();
            } else {
                map.addControl(new maplibregl.NavigationControl(), "top-right");
            }
            map.on("mousemove", (event) => {
                const features = map.queryRenderedFeatures(event.point, {
                    layers: [OEVK_FILL_LAYER_ID],
                });
                if (features.length > 0 && features[0].properties) {
                    const diff = features[0].properties.diff;
                    legendState = diffToLegendState(Number(diff));
                    dispatch("oevkHover", features[0].properties.OEVK);
                } else {
                    legendState = DEFAULT_LEGEND_STATE;
                    dispatch("oevkHover", null);
                }
            });
            map.on("mouseleave", () => {
                legendState = DEFAULT_LEGEND_STATE;
                dispatch("oevkHover", null);
            });
        });

        if (disableZoomPan) {
            map.on("mouseover", () => {
                map.getCanvas().style.cursor = "default";
            });
        }
    }

    onMount(() => {
        loadMap();
    });
</script>

<article class="oevk-map-container" class:no-zoom-pan={disableZoomPan}>
    {#if showInfoBar}
        <OEVKMapLegend
            segmentColors={colors}
            position={legendState.position}
            label={legendState.category}
        />
    {/if}
    <div class="oevk-map" bind:this={mapContainer}></div>
</article>

<style lang="scss">
    .oevk-map-container {
        position: relative;
    }
    .oevk-map-container.no-zoom-pan .oevk-map {
        touch-action: pan-x pan-y;
    }
    .oevk-map {
        width: 100%;
        aspect-ratio: 3 / 2;
    }
</style>
