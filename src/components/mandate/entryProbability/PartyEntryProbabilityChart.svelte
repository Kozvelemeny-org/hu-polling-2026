<script lang="ts">
    import CirclePackChart from './CirclePackChart.svelte';
    import { getPartyEntryProbability, type CategoryData } from '$lib/entryProbability';
    import { partyData } from '$stores/dataStore';
    import type { Party, Simulation } from '$lib/types';

    let { 
        party, 
        simulation, 
        simulationKey, 
        totalDots = 100, 
        height = 200, 
        r = 4, 
        showPercentage = true,
        groupBy = true,
        manyBodyStrength = 5,
        xStrength = 0.4,
        animateMount = false
    }: {
        party: Party;
        simulation: Simulation;
        simulationKey: string;
        totalDots?: number;
        height?: number;
        r?: number;
        showPercentage?: boolean;
        groupBy?: boolean;
        manyBodyStrength?: number;
        xStrength?: number;
        animateMount?: boolean;
    } = $props();

    // Calculate the entry probability for this party
    let entryProbability = $derived(getPartyEntryProbability(simulation, party));

    // Get party color for the success group
    let partyColor = $derived(partyData[party]?.color || '#007fff');

    // Create categories data for the circle pack
    let categories = $derived<CategoryData[]>([
        {
            name: 'success',
            count: Math.round(entryProbability * 100),
            color: partyColor,
            shape: 'circle'
        },
        {
            name: 'failure',
            count: Math.round((1 - entryProbability) * 100),
            color: '#aaa',
            shape: 'circle'
        }
    ]);
</script>

<div class="party-entry-chart">
    <CirclePackChart
        {categories}
        {totalDots}
        {height}
        {r}
        {showPercentage}
        {groupBy}
        {manyBodyStrength}
        {xStrength}
        {animateMount}
    />
</div>

<style>
    .party-entry-chart {
        width: 100%;
    }
</style>
