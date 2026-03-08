<script lang="ts">
    import { getContext } from 'svelte';
    import * as d3 from 'd3';

    const { height, width, xScale, xDomain } = getContext<any>('LayerCake');

    let {
        xTicks = null,
    }: {
        xTicks?: number[] | null;
    } = $props();

    const x0 = $derived($xDomain?.[0] ?? 0);
    const x1 = $derived($xDomain?.[1] ?? 199);
    const tickVals = $derived(xTicks ?? d3.ticks(x0, x1, Math.min(6, Math.max(2, Math.round(x1 - x0) + 1))));
</script>

<g class="histogram-grid">
    <line x1={0} y1={0} x2={0} y2={$height} class="grid-lines" />
    {#each tickVals as t}
        <line x1={$xScale(t)} y1={0} x2={$xScale(t)} y2={$height} class="grid-lines" />
    {/each}
    <line x1={$width} y1={0} x2={$width} y2={$height} class="grid-lines" />
    <line x1={0} y1={0} x2={$width} y2={0} class="grid-lines" />
</g>

<style>
    .histogram-grid .grid-lines { stroke: #eee; stroke-width: 1; }
</style>
