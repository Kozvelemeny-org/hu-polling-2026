<script lang="ts">
    import ViolinChart from './ViolinChart.svelte';
    import { buildBeeswarmData } from '$lib/beeswarm/oevk';
    import { partyData } from '$stores/dataStore';
    import type { BeeswarmData, Party, Simulation } from '$lib/types';

    let { 
        party, 
        simulation, 
        simulationKey, 
        numDots = 100, 
        height = 260, 
        bandwidth = 1.0,
        hideZeros = false,
        xDomain = [0, 199],
        xTicks = null,
        showMajorityMarkers = true,
    }: {
        party: Party;
        simulation: Simulation;
        simulationKey: string;
        numDots?: number;
        height?: number;
        bandwidth?: number;
        hideZeros?: boolean;
        xDomain?: [number, number];
        xTicks?: number[] | null;
        showMajorityMarkers?: boolean;
    } = $props();

    const data = $derived(buildBeeswarmData({ simulation, party, simulationKey, numDots }));
    const color = $derived(partyData[party]?.color || '#000');
    const titleAccessor = $derived((d: any) => `${partyData[party]?.name}: ${d["value"]} mandátum`);
</script>

<ViolinChart 
    data={data} 
    color={color} 
    {height} 
    {bandwidth} 
    titleAccessor={titleAccessor}
    {hideZeros}
    {xDomain}
    {xTicks}
    {showMajorityMarkers}
/>
