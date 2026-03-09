<script lang="ts">
    import ViolinChart from './ViolinChart.svelte';
    import { calculateRealSupportProbabilities } from '$lib/beeswarm/polls';
    import { partyData } from '$stores/dataStore';
    import type { BeeswarmData, Party, PollData, PollsterGroup } from '$lib/types';

    let { 
        party, 
        pollData, 
        pollsterGroup,
        numDots = 100, 
        height = 260, 
        bandwidth = 1.0,
        xDomain = [0, 1],
        xTicks = null,
    }: {
        party: Party;
        pollData: PollData;
        pollsterGroup: PollsterGroup;
        numDots?: number;
        height?: number;
        bandwidth?: number;
        xDomain?: [number, number];
        xTicks?: number[] | null;
    } = $props();

    const rawData = $derived(calculateRealSupportProbabilities({ pollData, pollsterGroup, party, numDots }));
    const data = $derived(() => {
        // Handle case where calculateRealSupportProbabilities returns empty array
        if (Array.isArray(rawData) && rawData.length === 0) {
            return { points: [], average: 0, party, histogram: [] } as BeeswarmData;
        }
        return rawData;
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
