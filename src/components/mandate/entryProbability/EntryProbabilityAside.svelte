<script lang="ts">
    import SectionCard from "$components/section/SectionCard.svelte";
    import SectionTitle from "$components/section/SectionTitle.svelte";
    import EntryProbabilityCard from "./EntryProbabilityCard.svelte";
    import type { HistoricalSimulationData, Party } from "$lib/types";
    import {
        addDays,
        findPreviousSundayWithData,
        getNextOrTodaySunday,
    } from "$lib/historicalSimulationUtils";
    import AsidePartyLegend from "$components/ui/AsidePartyLegend.svelte";

    export let parties: Party[] = [];
    export let selectedSimulation: string = "";
    export let historicalSimulationData: HistoricalSimulationData = {};

    $: scenario = historicalSimulationData[selectedSimulation];
    $: selectedDates = (() => {
        if (!scenario) return [];
        const now = new Date();
        return [
            {
                name: "Legfrissebb",
                date: findPreviousSundayWithData(
                    getNextOrTodaySunday(now),
                    scenario
                ),
            },
            {
                name: "Múlt vasárnap",
                date: findPreviousSundayWithData(
                    getNextOrTodaySunday(addDays(now, -7)),
                    scenario
                ),
            },
            {
                name: "Egy hónapja",
                date: findPreviousSundayWithData(
                    getNextOrTodaySunday(addDays(now, -30)),
                    scenario
                ),
            },
            {
                name: "Fél éve",
                date: findPreviousSundayWithData(
                    getNextOrTodaySunday(addDays(now, -180)),
                    scenario
                ),
            },
            {
                name: "Egy éve",
                date: findPreviousSundayWithData(
                    getNextOrTodaySunday(addDays(now, -365)),
                    scenario
                ),
            },
        ];
    })();
</script>

<SectionCard>
    <SectionTitle variant="tiny" centered>Bejutás esélye</SectionTitle>
    <AsidePartyLegend {parties} />
    <div class="entryProbabilityContainer">
        {#if scenario}
            <EntryProbabilityCard parties={parties} historicalSimulationData={scenario} date={selectedDates[0]} />
        {/if}
    </div>
    <div class="entryProbabilityContainer">
        {#if scenario}
            {#each selectedDates.slice(1) as dateItem}
                <EntryProbabilityCard
                    parties={parties}
                    historicalSimulationData={scenario}
                    date={dateItem}
                />
            {/each}
        {/if}
    </div>
</SectionCard>

<style lang="scss">
    .entryProbabilityContainer {
        display: flex;
        flex-direction: column;
        gap: 1rem;
        padding: 1rem 0;
        
        &:last-child {
            padding-bottom: 0;
        }
    }
</style>