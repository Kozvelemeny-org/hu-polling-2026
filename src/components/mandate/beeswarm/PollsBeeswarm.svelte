<script lang="ts">
    import BeeswarmChart from './BeeswarmChart.svelte';
    import { calculateRealSupportProbabilities } from '$lib/beeswarm/polls';
    import { partyData } from '$stores/dataStore';
    import type { Party, PollData } from '$lib/types';

    let { 
        party, 
        pollData,
        pollsterGroup,
        numDots = 100, 
        height = 260, 
        r = 4,
        xDomain = [0, 1],
    }: {
        party: Party;
        pollData: PollData;
        pollsterGroup: string;
        numDots?: number;
        height?: number;
        r?: number;
        xDomain?: [number, number];
    } = $props();

    const data = $derived(calculateRealSupportProbabilities({ pollData, pollsterGroup, party, numDots }));
    const color = $derived(partyData[party]?.color || '#000');
    const titleAccessor = $derived((d: any) => `${partyData[party]?.name}: ${(d["value"] * 100).toFixed(1)}% támogatottság`);
</script>

<BeeswarmChart 
    {data} 
    {color} 
    {height} 
    {r} 
    {titleAccessor}
    xDomain={xDomain}
    unitLabel="%"
    showMajorityMarkers={false}
/>
