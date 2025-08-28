<script lang="ts">
    import type { PollData, Simulation } from "$lib/types";
    import { onMount } from "svelte";
    import { pollData, simulationData, fetchData } from "$stores/dataStore";
    import GridItem from "$components/grid/GridItem.svelte";
    import OevkSectionCard from "$components/mandateProjection/OEVKSectionCard.svelte";

    let data = {
        sure_voters: [] as PollData,
        all_voters: [] as PollData,
        simulationData: {} as Record<string, Simulation>,
    };

    onMount(fetchData);

    $: data = {
        sure_voters: $pollData.sure_voters,
        all_voters: $pollData.all_voters,
        simulationData: $simulationData,
    }
</script>

<GridItem variant="main">
    <OevkSectionCard
        data={data.simulationData["main"]?.oevkDiffs}
        simulationName={data.simulationData["main"]?.metadata.name}
    />
</GridItem>