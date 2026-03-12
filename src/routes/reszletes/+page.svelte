<script lang="ts">
    import { onMount } from "svelte";
    import {
        fetchData,
        mandateProjectionData,
        pollData,
        simulationData,
    } from "$stores/dataStore";
    import type { MandateProjectionData, Party, PollData, PollsterGroup, Simulation } from "$lib/types";
    import SimulationSelectorBlock from "../../components/mandate/SimulationSelectorBlock.svelte";
    import GridItem from "../../components/grid/GridItem.svelte";
    import FideszTiszaBeeswarmCard from "$components/mandate/beeswarm/FideszTiszaBeeswarmCard.svelte";

    let data = {
        sure_voters: [] as PollData,
        all_voters: [] as PollData,
        mandateProjectionData: [] as MandateProjectionData,
        simulationData: {} as Record<string, Simulation>,
    };
    let selectedSimulation: string = "main";

    onMount(fetchData);

    $: data = {
        sure_voters: $pollData.sure_voters,
        all_voters: $pollData.all_voters,
        mandateProjectionData: $mandateProjectionData,
        simulationData: $simulationData,
    };
</script>

<SimulationSelectorBlock data={data.simulationData} bind:selectedSimulation />
<GridItem variant="main">
    <FideszTiszaBeeswarmCard simulationData={data.simulationData} {selectedSimulation} />
</GridItem>