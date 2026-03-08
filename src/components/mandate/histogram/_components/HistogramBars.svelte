<script lang="ts">
    import { getContext } from 'svelte';

    let {
        values,
        range,
        color,
    }: {
        values: number[];
        range: [number, number];
        color: string;
    } = $props();

    const { height, xScale } = getContext<any>('LayerCake');

    const yScale = $derived.by(() => {
        const h = $height;
        return (v: number) => h - v * h;
    });

    const bars = $derived.by(() =>
        values.map((prob, i) => {
            const mandateCount = range[0] + i;
            const x = $xScale(mandateCount);
            const width = $xScale(mandateCount + 1) - x;
            const barHeight = prob * $height;
            const y = $height - barHeight;
            return { x, y, width: Math.max(0, width), barHeight, mandateCount, prob };
        })
    );
</script>

<g class="histogram-bars">
    {#each bars as bar}
        {#if bar.barHeight > 0}
            <rect
                x={bar.x}
                y={bar.y}
                width={bar.width}
                height={bar.barHeight}
                fill={color}
                fill-opacity="0.3"
                stroke={color}
                stroke-width="1"
                class="bar"
            />
        {/if}
    {/each}
</g>

<style>
    .histogram-bars .bar {
        vector-effect: non-scaling-stroke;
    }
</style>
