<script lang="ts">
    import { getContext } from 'svelte';
    import type { Party } from '$lib/types';
    import { partyData } from '$stores/dataStore';
    import * as d3 from 'd3';
    
    const { width, height, xScale, xDomain } = getContext<any>('LayerCake');

    let { xTicks = null, tickCount = 5, showGrid = true, medianValue = null, party = null, unitLabel = 'mandátum', showMajorityMarkers = true, histogram = null }: { 
        xTicks?: number[] | null;
        tickCount?: number; 
        showGrid?: boolean; 
        medianValue?: number | null; 
        party?: Party | null;
        unitLabel?: string;
        showMajorityMarkers?: boolean;
        histogram?: number[] | null;
    } = $props();

    const entry = 4;
    const majority = 100;
    const twoThirds = 133;

    let x0: number = $derived.by(() => ($xDomain?.[0] ?? 0));
    let x1: number = $derived.by(() => ($xDomain?.[1] ?? 199));
    let tickVals: number[] = $derived.by(() => xTicks ?? d3.ticks(x0, x1, tickCount));
    let baselineY: number = $derived.by(() => $height - 1);
    
    let cumulativePercentages: string[] = $derived.by(() => {
        return histogram?.map((value, index) => {
            return Math.abs(100 - d3.sum(histogram.slice(0, index)) * 100).toFixed(0);
        }) ?? [];
    });
</script>

<g class="axis-x">
    <!-- Grid lines -->
    {#if showGrid}
        {#each tickVals as t}
            {#if true}
                <line x1={$xScale(t)} y1={0} x2={$xScale(t)} y2={$height} class="grid" />
            {/if}
        {/each}
    {/if}

    <!-- Majority and two-thirds markers -->
    {#if showMajorityMarkers}
        <line x1={$xScale(entry)} y1={0} x2={$xScale(entry)} y2={$height} class="marker entry" />
        <line x1={$xScale(majority)} y1={0} x2={$xScale(majority)} y2={$height} class="marker majority" />
        <line x1={$xScale(twoThirds)} y1={0} x2={$xScale(twoThirds)} y2={$height} class="marker twothirds" />
        <text x={$xScale(entry)} y={12} dx={4} class="marker-label" text-anchor="start">{partyData[party]?.name} bejutás esélye</text>
        <text x={$xScale(majority)} y={12} dx={4} class="marker-label" text-anchor="start">Többség</text>
        <text x={$xScale(twoThirds)} y={12} dx={4} class="marker-label" text-anchor="start">Kétharmad</text>
        {#if histogram && party}
            <text
                x={$xScale(entry)} y={26} dx={4} class="marker-label" text-anchor="start"
                style="fill: {partyData[party]?.color}"
            >
                {cumulativePercentages[entry]}%
            </text>
            <text
                x={$xScale(majority)} y={26} dx={4} class="marker-label" text-anchor="start"
                style="fill: {partyData[party]?.color}"
            >
                {cumulativePercentages[majority]}%
            </text>
            <text
                x={$xScale(twoThirds)} y={26} dx={4} class="marker-label" text-anchor="start"
                style="fill: {partyData[party]?.color}"
            >
                {cumulativePercentages[twoThirds]}%
            </text>
        {/if}
    {/if}

    <!-- Baseline -->
    <line x1={$xScale(x0)} y1={baselineY} x2={$xScale(x1)} y2={baselineY} class="baseline" />
    <g class="tick-label-group">
        {#each tickVals as t, i}
            <text x={$xScale(t)} y={baselineY + 12} class="tick-label" text-anchor="middle">
                {#if unitLabel === '%'}
                    {(t * 100).toFixed(0)}{i === 0 ? unitLabel : ''}
                {:else}
                    {t}{i === 0 ? ` ${unitLabel}` : ''}
                {/if}
            </text>
        {/each}
    </g>
</g>

<style>
    .axis-x .baseline { stroke: #000; stroke-width: 1; }
    .axis-x .tick-label { fill: #000; font-size: 10px; }
    .axis-x .tick-label:first-child { text-anchor: start; }
    .axis-x .tick-label:last-child { text-anchor: end; }
    .axis-x .grid { stroke: #eee; stroke-width: 1; }
    .axis-x .marker { stroke-width: 1; z-index: 2;}
    .axis-x .marker.median { fill: #000; stroke: #fff; }
    /* .axis-x .marker.majority, .axis-x .marker.twothirds { stroke: #aaa; stroke-dasharray: 2 2; } */
    .axis-x .marker-label { fill: #555; font-size: 11px; dominant-baseline: text-bottom; }
</style>


