<script lang="ts">
    import ViolinChart from './ViolinChart.svelte';
    import { buildBeeswarmDataFromPolls } from '$lib/beeswarm/oevk';
    import { partyData } from '$stores/dataStore';
    import type { BeeswarmData, Party, Simulation } from '$lib/types';

    let {
        party,
        simulation,
        height = 260,
        bandwidth = 1.0,
        xDomain = [0, 1],
        xTicks = null,
    }: {
        party: Party;
        simulation: Simulation | null | undefined;
        height?: number;
        bandwidth?: number;
        xDomain?: [number, number];
        xTicks?: number[] | null;
    } = $props();

    const pollsData = $derived(simulation ? buildBeeswarmDataFromPolls(simulation, party) : null);
    const data = $derived((): BeeswarmData => {
        if (pollsData) return pollsData;
        return { party, points: [], average: 0, histogram: [] };
    });
    const color = $derived(partyData[party]?.color || '#000');
    const titleAccessor = $derived((d: any) => `${partyData[party]?.name}: ${(d["value"] * 100).toFixed(1)}% támogatottság`);
</script>

<ViolinChart
    data={data()}
    color={color}
    {height}
    {bandwidth}
    titleAccessor={titleAccessor}
    xDomain={xDomain}
    unitLabel="%"
    showMajorityMarkers={false}
    xTicks={xTicks}
/>
