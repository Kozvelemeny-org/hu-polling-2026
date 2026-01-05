<script lang="ts">
    import { getContext } from "svelte";

    let { medianValue, paddingTop = 0 }: { medianValue: number, paddingTop?: number } = $props();

    let displayedMedianValue = $derived(medianValue < 1 ? (medianValue * 100).toFixed(0)+'%' : medianValue.toFixed(0));

    const { width, height, xScale, xDomain } = getContext<any>('LayerCake');
</script>

<!-- Median value -->
{#if medianValue}
    <rect x={$xScale(medianValue)} y={paddingTop} width={4} height={$height - paddingTop} class="marker median" />
    <text x={$xScale(medianValue)} y={paddingTop - 3} class="marker-label" text-anchor="middle">{displayedMedianValue}</text>
{/if}
<style lang="scss">
    .marker.median { fill: #000; stroke: #fff; stroke-width: 2; dominant-baseline: text-after-edge; }
    .marker-label { fill: #000; font-size: 1rem; font-weight: 500;  }
</style>