<script lang="ts">
    import BeeswarmChart from './BeeswarmChart.svelte';
    import { buildBeeswarmData } from '$lib/beeswarm/oevk';
    import { partyData } from '$stores/dataStore';
    import type { BeeswarmData, Party, Simulation } from '$lib/types';

    let { 
        party, 
        simulation, 
        simulationKey, 
        numDots = 100, 
        height = 260, 
        r = 4,
        hideZeros = false,
        xDomain = [0, 199],
        xTicks = [4, 100, 133, 199],
        showMajorityMarkers = true,
    }: {
        party: Party;
        simulation: Simulation;
        simulationKey: string;
        numDots?: number;
        height?: number;
        r?: number;
        hideZeros?: boolean;
        xDomain?: [number, number];
        xTicks?: number[];
        showMajorityMarkers?: boolean;
    } = $props();

    const data = $derived(buildBeeswarmData({ simulation, party, simulationKey, numDots }));
    const color = $derived(partyData[party]?.color || '#000');
    const titleAccessor = $derived((d: any) => `${partyData[party]?.name}: ${d["value"]} mandátum`);
</script>

<BeeswarmChart 
    {data} 
    {color} 
    {height} 
    {r} 
    {titleAccessor}
    {hideZeros}
    {xDomain}
    {xTicks}
    {showMajorityMarkers}
    paddingTop={showMajorityMarkers ? 55 : 0}
/>
