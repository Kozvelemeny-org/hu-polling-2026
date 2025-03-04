<script lang="ts">
    import type { Simulation } from "$lib/types";
    import OevkMap from "../OEVKMap.svelte";
    import ExplainerCard from "../section/ExplainerCard.svelte";
    import SectionCard from "../section/SectionCard.svelte";
    import SectionTitle from "../section/SectionTitle.svelte";
    import OevkDistribution from "./OEVKDistribution.svelte";
    import SimulationNameSpan from "./SimulationNameSpan.svelte";

    export let data = {} as Simulation["oevkDiffs"];
    export let simulationName: string;

    let highlightedOevk = null as string | null;

    function handleOevkHover(event: CustomEvent<string>) {
        highlightedOevk = String(event.detail);
    }
</script>

<SectionCard>
    <SectionTitle>Egyéni választókerületek térképe</SectionTitle>
    <p>
        Az alábbi térképen a 106 egyéni választókerület látható, és a
        <SimulationNameSpan>{simulationName}</SimulationNameSpan>
        által becsült várható különbség a két esélyes párt között.
    </p>
    <ExplainerCard image="/images/hungary-shape.webp" alt="Választási földrajz">
        A szimuláció azt feltételezi, hogy az EP-választás óta nem változott a
        választási földrajz, de az ellenzéki szavazók nagyobb része szavaz majd
        a Tiszára.
        <a href="#">Módszertan</a>
    </ExplainerCard>
    <OevkMap {data} {highlightedOevk} on:oevkHover={handleOevkHover} />
    <OevkDistribution {data} {highlightedOevk} on:oevkHover={handleOevkHover} />
</SectionCard>
