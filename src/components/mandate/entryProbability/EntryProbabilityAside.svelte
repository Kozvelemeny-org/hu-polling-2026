<script lang="ts">
    import SectionCard from "$components/section/SectionCard.svelte";
    import SectionTitle from "$components/section/SectionTitle.svelte";
    import EntryProbabilityCard from "./EntryProbabilityCard.svelte";
    import type { Party, Simulation } from "$lib/types";
    import AsidePartyLegend from "$components/ui/AsidePartyLegend.svelte";

    export let parties: Party[] = [];
    export let selectedSimulationData: Simulation | undefined = undefined;

    const weekends = [
        {
            'name': 'Most vasárnap',
            'date': new Date(2026, 2, 8),
        },
        {
            'name': 'Múlt vasárnap',
            'date': new Date(2026, 2, 1),
        },
        {
            'name': 'Egy hónapja',
            'date': new Date(2026, 1, 8),
        },
        {
            'name': 'Fél éve',
            'date': new Date(2025, 8, 8),
        },
        {
            'name': 'Egy éve',
            'date': new Date(2025, 3, 8),
        },
        {
            'name': 'Két éve',
            'date': new Date(2024, 3, 8),
        }
    ]

</script>

<SectionCard>
    <SectionTitle variant="tiny" centered>Bejutás esélye</SectionTitle>
    <AsidePartyLegend {parties} />
    <div class="entryProbabilityContainer">
        {#if selectedSimulationData}
            <EntryProbabilityCard parties={parties} selectedSimulationData={selectedSimulationData} weekend={weekends[0]} />
        {/if}
    </div>
    <div class="entryProbabilityContainer">
        {#if selectedSimulationData}
            {#each weekends.slice(1) as weekend}
                <EntryProbabilityCard parties={parties} selectedSimulationData={selectedSimulationData} weekend={weekend} />
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