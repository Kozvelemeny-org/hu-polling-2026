<script lang="ts">
    import { getContext } from 'svelte';

    const { width, height } = getContext<any>('LayerCake');

    let {
        yTicks = null,
        tickSize = 0,
        showGrid = true,
    }: {
        yTicks?: number[] | null;
        tickSize?: number;
        showGrid?: boolean;
    } = $props();

    const defaultYTicks = [0, 1];
    const tickVals = $derived(yTicks ?? defaultYTicks);

    function yScale(v: number): number {
        return $height - v * $height;
    }
</script>

<g class="histogram-axis-y">
    {#if showGrid}
        {#each tickVals.filter((v) => v >= 0 && v < 1) as v}
            <line
                x1={0}
                y1={yScale(v)}
                x2={$width}
                y2={yScale(v)}
                class="grid"
            />
        {/each}
    {/if}

    <line x1={0} y1={0} x2={0} y2={$height} class="axis-line" stroke-linecap="square" />
    {#each tickVals.filter((v) => v >= 0 && v <= 1) as v}
        <line
            x1={-tickSize}
            y1={yScale(v)}
            x2={0}
            y2={yScale(v)}
            class="tick"
        />
        <text
            x={-tickSize - 2}
            y={yScale(v)}
            class="tick-label"
            text-anchor="end"
            dominant-baseline="middle"
        >
            {v === 0 ? '0%' : v === 1 ? '100%' : `${Math.round(v * 100)}%`}
        </text>
    {/each}
</g>

<style>
    .histogram-axis-y .axis-line { stroke: #000; stroke-width: 1; }
    .histogram-axis-y .tick { stroke: #000; stroke-width: 1; }
    .histogram-axis-y .grid { stroke: #eee; stroke-width: 1; }
    .histogram-axis-y .tick-label { fill: #000; font-size: 10px; }
</style>
