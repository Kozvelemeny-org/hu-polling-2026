<script lang="ts">
    import OevkMap from "$components/mandate/map/OEVKMap.svelte";
    import SimulationNameSpan from "$components/mandate/SimulationNameSpan.svelte";
    import type { Simulation } from "$lib/types";
    import SectionCard from "$components/section/SectionCard.svelte";
    import SectionTitle from "$components/section/SectionTitle.svelte";
    import OevkDistribution from "./OEVKDistribution.svelte";

    export let data = {} as Simulation["oevkDiffs"];
    export let simulationName: string;

    let highlightedOevk = null as string | null;

    function handleOevkHover(event: CustomEvent<string>) {
        highlightedOevk = String(event.detail);
    }
</script>

<SectionCard smallPadding id="oevkSectionCard">
    <SectionTitle>Egyéni választókerületek térképe</SectionTitle>
    <p>
        Az alábbi térképen a 106 egyéni választókerület látható, és a
        <SimulationNameSpan>{simulationName}</SimulationNameSpan>
        által becsült várható különbség a két esélyes párt között.
    </p>
    <div class="mapContainer">
        <OevkMap {data} {highlightedOevk} on:oevkHover={handleOevkHover} showInfoBar={false} disableZoomPan={true} />
    </div>
    <OevkDistribution {data} {highlightedOevk} on:oevkHover={handleOevkHover} />
</SectionCard>

<style lang="scss">
    .mapContainer {
        margin-top: -20px;
    }
</style>