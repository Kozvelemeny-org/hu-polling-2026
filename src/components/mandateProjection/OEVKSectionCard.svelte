<script lang="ts">
    import OevkMap from "$components/mandate/map/OEVKMap.svelte";
    import SimulationNameSpan from "$components/mandate/SimulationNameSpan.svelte";
    import type { Simulation } from "$lib/types";
    import SectionCard from "$components/section/SectionCard.svelte";
    import SectionTitle from "$components/section/SectionTitle.svelte";
    import OevkDistribution from "./OEVKDistribution.svelte";
    import BottomMenu from "$components/ui/bottom-menu/BottomMenu.svelte";
    import BottomMenuItem from "$components/ui/bottom-menu/BottomMenuItem.svelte";

    export let data = {} as Simulation["oevkDiffs"];
    export let simulationName: string;
    export let simulationKey: string;
    export let hideBottomMenu = false;

    let highlightedOevk = null as string | null;

    function handleOevkHover(event: CustomEvent<string>) {
        highlightedOevk = String(event.detail);
    }
</script>

<SectionCard smallPadding id="oevkSectionCard">
    <SectionTitle variant="medium">Hol fog eldőlni a választás?</SectionTitle>
    <p>
        Az alábbi térkép azt mutatja, hogy a <SimulationNameSpan>{simulationName}</SimulationNameSpan>
        becslés alapján hol nyerhet magabiztosan (5%+ előnnyel) a Fidesz vagy a Tisza, és melyek lehetnek
        a választást eldöntő csatatér körzetek (utóbbiak fehér színnel jelennek meg a térképen).

    </p>
    <div class="mapContainer">
        <OevkMap {data} {highlightedOevk} on:oevkHover={handleOevkHover} showInfoBar={false} disableZoomPan={true} />
    </div>
    <OevkDistribution {data} {highlightedOevk} on:oevkHover={handleOevkHover} />
    {#if !hideBottomMenu}
        <BottomMenu>
            <BottomMenuItem link="/abra/t-{simulationKey}">Megosztás</BottomMenuItem>
            <BottomMenuItem link="/abra/t-{simulationKey}">Beágyazás</BottomMenuItem>
        </BottomMenu>
    {/if}
</SectionCard>

<style lang="scss">
    .mapContainer {
        //margin-top: -20px;
    }
</style>