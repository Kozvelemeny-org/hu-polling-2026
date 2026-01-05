<script lang="ts">
    import { LayerCake, Svg, Html } from 'layercake';
    import { scaleOrdinal } from 'd3';
    import { xKey, zKey } from '$lib/beeswarm/oevk';
    import BeeswarmForce from './_components/BeeswarmForce.svelte';
    import AxisX from './_components/AxisX.svelte';
    import MedianLine from './_components/MedianLine.svelte';
    import type { BeeswarmData } from '$lib/types';

    let { 
        data, 
        color = '#000',
        height = 260, 
        r = 4, 
        titleAccessor = (d: any) => `${d["value"]} mandátum`,
        xDomain = [0, 199],
        xTicks = null,
        unitLabel = 'mandátum',
        showMajorityMarkers = true,
        hideZeros = false,
        paddingTop = 0,
    }: {
        data: BeeswarmData | null;
        color?: string;
        height?: number;
        r?: number;
        titleAccessor?: (d: any) => string;
        xDomain?: [number, number];
        xTicks?: number[] | null;
        unitLabel?: string;
        showMajorityMarkers?: boolean;
        hideZeros?: boolean;
        paddingTop?: number;
    } = $props();

    $effect(() => {
        console.log(paddingTop, showMajorityMarkers);
    });
</script>

<div class="chart-container" style={`height:${height}px`}>
    <LayerCake
        padding={{ bottom: 24, left: 0, right: 0, top: 20 }}
        x={xKey}
        xDomain={xDomain}
        z={zKey}
        zScale={scaleOrdinal()}
        zRange={[color]}
        zDomainSort={true}
        data={data?.points ?? []}
    >
        <Svg>
            <AxisX tickCount={4} {unitLabel} {showMajorityMarkers} {xTicks} histogram={data?.histogram} party={data?.party} />
            <BeeswarmForce {r} stroke='#f7f7f7' strokeWidth={.5} xStrength={3} yStrength={0.2} getTitle={titleAccessor} {hideZeros} {paddingTop} />
            {#if data?.median !== undefined}
                <MedianLine medianValue={data.median} paddingTop={paddingTop} />
            {/if}
        </Svg>
        <Html pointerEvents={false} />
    </LayerCake>
</div>

<style>
    .chart-container {
        width: 100%;
    }
    :global(.bee-group circle) {
        transition: opacity 120ms ease;
        overflow: visible;
        background-color: #f9f9f9;
        border: 2px solid #f5f5f5;
    }
    :global(.axis-x .marker-label) {
        background: white;
    }
</style>


