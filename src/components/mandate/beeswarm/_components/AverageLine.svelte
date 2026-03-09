<script lang="ts">
    import { getContext } from "svelte";

    let { averageValue, paddingTop = 0, showMandateLabel = true }: { averageValue: number, paddingTop?: number, showMandateLabel?: boolean } = $props();

    let displayedaverageValue = $derived(averageValue < 1 ? (averageValue * 100).toFixed(1) : averageValue.toFixed(0));

    const { width, height, xScale, xDomain } = getContext<any>('LayerCake');
</script>

<!-- Average value -->
{#if averageValue}
    <rect x={$xScale(averageValue)} y={paddingTop} width={4} height={$height - paddingTop} class="marker average" />
    {#if showMandateLabel}
        <text x={$xScale(averageValue)} y={paddingTop - 3} class="marker-label" text-anchor="middle">{displayedaverageValue} mandátum</text>
    {:else}
        <text x={$xScale(averageValue)} y={paddingTop - 3} class="marker-label" text-anchor="middle">{displayedaverageValue}</text>
    {/if}
{/if}
<style lang="scss">
    .marker.average { fill: #000; stroke: #fff; stroke-width: 2; dominant-baseline: text-after-edge; }
    .marker-label { fill: #000; font-size: 1rem; font-weight: 500;  }
</style>