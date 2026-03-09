<script lang="ts">
    import SectionCard from "$components/section/SectionCard.svelte";
    import SectionTitle from "$components/section/SectionTitle.svelte";
    import AsidePartyLegend from "$components/ui/AsidePartyLegend.svelte";
    import type { MandateProjectionData, Party, PollsterGroup } from "$lib/types";
    import { pollsterData } from "$stores/dataStore";
    import RecentMandateProjectionCard from "./RecentMandateProjectionCard.svelte";

    export let mandateProjectionData = [] as MandateProjectionData;
    export let pollsterGroup = "kormányfüggetlen" as PollsterGroup;
    export let selectedGroup = "big_parties" as "big_parties" | "small_parties";
    export let nItems = 5;

    let selectedPartiesMap = {
        big_parties: ["fidesz", "tisza"],
        small_parties: ["dk", "mihazank", "mkkp"],
    } as Record<"big_parties" | "small_parties", Party[]>;


    function getFilteredMandateProjectionData(mandateProjectionData: MandateProjectionData, pollsterGroup: PollsterGroup): MandateProjectionData {
        return mandateProjectionData.filter((mandateProjection) => pollsterData[mandateProjection.pollster]?.group === pollsterGroup);
    }
    $: filteredMandateProjectionData = getFilteredMandateProjectionData(mandateProjectionData, pollsterGroup);

    $: selectedParties = selectedPartiesMap[selectedGroup];
</script>

<SectionCard id="recent-polls">
    <SectionTitle variant="tiny" centered>A legfrissebb becslések</SectionTitle>
    <AsidePartyLegend parties={selectedParties} />
    <section class="pollsContainer">
        {#each filteredMandateProjectionData.slice(0, nItems) as mandateProjection}
            <RecentMandateProjectionCard poll={mandateProjection} {selectedParties} />
        {/each}
    </section>
</SectionCard>

<style lang="scss">
    .pollsContainer {
        display: flex;
        flex-direction: column;
        gap: 1rem;
        padding: 1rem 0;
        padding-bottom: 0;
    }
</style>
