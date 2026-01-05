<script lang="ts">
    import { onMount } from "svelte";
    import { fetchData, pollData } from "$stores/dataStore";
    import PollsterHeatmap from "$components/poll/PollsterHeatmap.svelte";
    import PollsterStats from "$components/poll/PollsterStats.svelte";
    import IndividualPollsList from "$components/poll/IndividualPollsList.svelte";
    import SectionTitle from "$components/section/SectionTitle.svelte";
    import GridItem from "$components/grid/GridItem.svelte";
    import GridSectionTitle from "$components/grid/GridSectionTitle.svelte";

    onMount(fetchData);
</script>

<GridItem variant="full">
    <GridSectionTitle>Összes közvélemény-kutatás</GridSectionTitle>
</GridItem>

<GridItem variant="full">
    <PollsterHeatmap pollData={$pollData.sure_voters} />
</GridItem>

<GridItem variant="full">
    <SectionTitle variant="medium">Kutatóintézetek aktivitása</SectionTitle>
    <PollsterStats pollData={$pollData.sure_voters} />
</GridItem>

<GridItem variant="full">
    <SectionTitle variant="medium" hasTopMargin>Egyéni kutatások</SectionTitle>
    <IndividualPollsList pollData={$pollData.sure_voters} />
</GridItem>
