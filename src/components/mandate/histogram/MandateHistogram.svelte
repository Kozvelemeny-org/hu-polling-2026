<script lang="ts">
    import { LayerCake, Svg, Html } from 'layercake';
    import HistogramAxisX from './_components/HistogramAxisX.svelte';
    import HistogramAxisY from './_components/HistogramAxisY.svelte';
    import HistogramBars from './_components/HistogramBars.svelte';
    import { partyData } from '$stores/dataStore';
    import type { Party, Simulation } from '$lib/types';
    import HistogramGrid from './_components/HistogramGrid.svelte';

    const xKey = 'value';

    let {
        simulationData,
        simulationKey,
        party,
        range,
        height = 260,
        xTicks = null,
        yTicks = null,
        unitLabel = 'mandátum',
    }: {
        simulationData: Record<string, Simulation>;
        simulationKey: string;
        party: Party;
        range: [number, number];
        height?: number;
        xTicks?: number[] | null;
        yTicks?: number[] | null;
        unitLabel?: string;
    } = $props();

    const simulation = $derived(simulationData[simulationKey]);
    const distribution = $derived(simulation?.[party] as number[] | undefined);
    const histogramValues = $derived.by(() => {
        if (!distribution || distribution.length === 0) return [];
        const [lo, hi] = range;
        if (lo > hi) return [];
        const result: number[] = [];
        for (let i = lo; i <= hi && i < distribution.length; i++) {
            const p = distribution[i] ?? 0;
            result.push(Math.round(p * 100) / 100);
        }
        return result;
    });
    const color = $derived(partyData[party]?.color ?? '#000');

    const numBuckets = $derived(range[1] - range[0] + 1);
    const xDomain = $derived([range[0], range[1] + 1] as [number, number]);
    const defaultXTicks = $derived(
        Array.from({ length: numBuckets + 1 }, (_, i) => range[0] + i)
    );
    const resolvedXTicks = $derived(xTicks ?? defaultXTicks);

    const chartData = $derived(
        Array.from({ length: numBuckets }, (_, i) => ({ value: range[0] + i }))
    );
</script>

<div class="chart-container" style="height: {height}px">
    <LayerCake
        padding={{ bottom: 24, left: 32, right: 8, top: 16 }}
        x={xKey}
        xDomain={xDomain}
        data={chartData}
    >
        <Svg>
            <HistogramGrid
                xTicks={resolvedXTicks}
            />
            <HistogramBars
                values={histogramValues}
                range={range}
                color={color}
            />
            <HistogramAxisY {yTicks} />
            <HistogramAxisX
                xTicks={resolvedXTicks}
                {unitLabel}
            />
        </Svg>
        <Html pointerEvents={false} />
    </LayerCake>
</div>

<style>
    .chart-container {
        width: 100%;
        overflow: visible;
    }
</style>
