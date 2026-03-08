<script lang="ts">
    import { LayerCake, Svg, Html } from 'layercake';
    import { scaleOrdinal } from 'd3';
    import { xKey, zKey } from '$lib/beeswarm/oevk';
    import ViolinShape from './_components/ViolinShape.svelte';
    import AxisX from '../beeswarm/_components/AxisX.svelte';
    import MedianLine from '../beeswarm/_components/MedianLine.svelte';
    import type { BeeswarmData } from '$lib/types';

    let { 
        data, 
        color = '#000',
        height = 260, 
        bandwidth = 1.0,
        titleAccessor = (d: any) => `${d["value"]} mandátum`,
        xDomain = [0, 199],
        xTicks = null,
        unitLabel = 'mandátum',
        showMajorityMarkers = true,
        hideZeros = false
    }: {
        data: BeeswarmData;
        color?: string;
        height?: number;
        bandwidth?: number;
        titleAccessor?: (d: any) => string;
        xDomain?: [number, number];
        xTicks?: number[] | null;
        unitLabel?: string;
        showMajorityMarkers?: boolean;
        hideZeros?: boolean;
    } = $props();
</script>

<div class="chart-container" style={`height:${height}px`}>
    <LayerCake
        padding={{ bottom: 24, left: 8, right: 8, top: 20 }}
        x={xKey}
        xDomain={xDomain}
        z={zKey}
        zScale={scaleOrdinal()}
        zRange={[color]}
        zDomainSort={true}
        data={data.points}
    >
        <Svg>
            <AxisX tickCount={4} {unitLabel} {showMajorityMarkers} {xTicks} histogram={data.histogram} party={data.party} />
            <ViolinShape {bandwidth} stroke={color} strokeWidth={1} getTitle={titleAccessor} {hideZeros} {color} />
            {#if data.median !== undefined}
                <MedianLine medianValue={data.median} showMandateLabel={unitLabel === 'mandátum'} />
            {/if}
        </Svg>
        <Html pointerEvents={false} />
    </LayerCake>
</div>

<style>
    .chart-container { width: 100%; }
    :global(.axis-x .marker-label) { background: white; }
</style>
