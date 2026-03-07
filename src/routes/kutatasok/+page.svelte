<script lang="ts">
    import { onMount } from "svelte";
    import { fetchData, pollData } from "$stores/dataStore";
    import PollsterHeatmap from "$components/poll/PollsterHeatmap.svelte";
    import IndividualPollsList from "$components/poll/IndividualPollsList.svelte";
    import SectionTitle from "$components/section/SectionTitle.svelte";
    import GridItem from "$components/grid/GridItem.svelte";
    import GridSectionTitle from "$components/grid/GridSectionTitle.svelte";
    import RecentPollsAside from "$components/poll/RecentPollsAside.svelte";
    import SectionCard from "$components/section/SectionCard.svelte";

    onMount(fetchData);
</script>

<GridItem variant="aside">
    <RecentPollsAside pollData={$pollData.sure_voters} selectedGroup="big_parties" nItems={6} />
</GridItem>
<GridItem variant="main">
    <SectionCard>
        <SectionTitle variant="medium">Kutatóintézetek aktivitása</SectionTitle>
    </SectionCard>
</GridItem>

<GridItem variant="full">
    <GridSectionTitle>Összes közvélemény-kutatás</GridSectionTitle>
</GridItem>

<GridItem variant="full">
    <PollsterHeatmap pollData={$pollData.sure_voters} />
</GridItem>

<GridItem variant="full">
    <SectionTitle variant="medium" hasTopMargin>Egyéni kutatások</SectionTitle>
    <IndividualPollsList pollData={$pollData.sure_voters} />
</GridItem>
