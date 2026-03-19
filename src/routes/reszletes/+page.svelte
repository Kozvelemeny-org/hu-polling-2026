<script lang="ts">
    import type { PageData } from "./$types";
    import type { SiteDataBundle } from "$lib/server/siteData";
    import SimulationSelectorBlock from "../../components/mandate/SimulationSelectorBlock.svelte";
    import GridItem from "../../components/grid/GridItem.svelte";
    import FideszTiszaBeeswarmCard from "$components/mandate/beeswarm/FideszTiszaBeeswarmCard.svelte";

    export let data: PageData;
    const siteData = data.siteData as SiteDataBundle;
    let selectedSimulation: string = "main";
</script>

<SimulationSelectorBlock data={siteData.simulationData} bind:selectedSimulation />
<GridItem variant="main">
    <FideszTiszaBeeswarmCard simulationData={siteData.simulationData} {selectedSimulation} />
</GridItem>