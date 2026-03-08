<script lang="ts">
    import { getContext } from 'svelte';
    import * as d3 from 'd3';

    const { height, xScale, xDomain } = getContext<any>('LayerCake');

    let {
        xTicks = null,
        unitLabel = 'mandátum',
        showGrid = true,
    }: {
        xTicks?: number[] | null;
        unitLabel?: string;
        showGrid?: boolean;
    } = $props();

    const x0 = $derived($xDomain?.[0] ?? 0);
    const x1 = $derived($xDomain?.[1] ?? 199);
    const tickVals = $derived(xTicks ?? d3.ticks(x0, x1, Math.min(6, Math.max(2, Math.round(x1 - x0) + 1))));
    const baselineY = $derived($height);
</script>

<g class="histogram-axis-x">
    {#if showGrid}
        {#each tickVals as t}
            <!-- <line x1={$xScale(t)} y1={0} x2={$xScale(t)} y2={$height} class="grid" /> -->
        {/each}
    {/if}

    <line x1={$xScale(x0)} y1={baselineY} x2={$xScale(x1)} y2={baselineY} class="baseline" />
    <g class="tick-label-group">
        {#each tickVals as t, i}
            {#if i === 0}
                <text x={$xScale(t)} y={baselineY + 12} class="tick-label" text-anchor="end">
                    {t}{i === 0 ? ` ${unitLabel}` : ''}
                </text>
            {:else}
                <text x={$xScale(t + 0.5)} y={baselineY + 12} class="tick-label" text-anchor="middle">
                    {t}{i === 0 ? ` ${unitLabel}` : ''}
                </text>
            {/if}
        {/each}
    </g>
</g>

<style>
    .histogram-axis-x .baseline { stroke: #000; stroke-width: 1; }
    .histogram-axis-x .tick-label { fill: #000; font-size: 10px; }
    .histogram-axis-x .tick-label:first-child { text-anchor: start; }
    .histogram-axis-x .grid { stroke: #eee; stroke-width: 1; }
    .histogram-axis-x .marker { stroke-width: 1; }
</style>
