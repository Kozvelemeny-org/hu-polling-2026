<script lang="ts">
    import { LayerCake, Svg } from 'layercake';
    import { scaleOrdinal, scaleBand } from 'd3';
    import CirclePackForce from './_components/CirclePackForce.svelte';
    import type { CategoryData } from '$lib/entryProbability';

    let { 
        categories, 
        totalDots = 100, 
        height = 200, 
        r = 4, 
        showPercentage = false,
        groupBy = true,
        manyBodyStrength = 3,
        xStrength = 0.1,
        animateMount = false,
        nodeStroke = '#fff',
        nodeStrokeWidth = 0.5
    }: {
        categories: CategoryData[];
        totalDots?: number;
        height?: number;
        r?: number;
        showPercentage?: boolean;
        groupBy?: boolean;
        manyBodyStrength?: number;
        xStrength?: number;
        animateMount?: boolean;
        nodeStroke?: string;
        nodeStrokeWidth?: number;
    } = $props();

    // Create data for the circle pack
    function buildCirclePackData() {
        const dots: Array<{ category: string; value: number; group: string; color: string; shape: string }> = [];
        
        // Calculate total count from categories
        const totalCount = categories.reduce((sum, cat) => sum + cat.count, 0);
        
        // Create dots for each category, ensuring we get exactly totalDots
        let remainingDots = totalDots;
        let remainingCount = totalCount;
        
        categories.forEach((category, index) => {
            if (category.name === 'success') {
                remainingDots -= category.count;
                remainingCount -= category.count;
                return;
            }
            // For the last category, use all remaining dots to ensure we get exactly totalDots
            const dotsForCategory = index === categories.length - 1 
                ? remainingDots 
                : Math.round((category.count / totalCount) * totalDots);
            
            for (let i = 0; i < dotsForCategory; i++) {
                dots.push({
                    category: category.name,
                    value: r,
                    group: category.name,
                    color: category.color,
                    shape: category.shape || 'circle'
                });
            }
            
            remainingDots -= dotsForCategory;
            remainingCount -= category.count;
        });
        
        return dots;
    }

    const xKey = 'category';
    const rKey = 'value';
    const zKey = 'group';

    const seriesColors = categories.map(cat => cat.color);
</script>

<div class="chart-container" style={`height:${height}px`}>
    <LayerCake
        data={buildCirclePackData()}
        x={xKey}
        r={rKey}
        z={zKey}
        xScale={scaleBand()}
        rRange={[r, r]}
        zScale={scaleOrdinal()}
        zRange={seriesColors}
        padding={{ bottom: 8, left: 8, right: 8, top: 8 }}
    >
        <Svg>
            <CirclePackForce 
                {manyBodyStrength} 
                {xStrength} 
                {groupBy}
                {showPercentage}
                {animateMount}
                {nodeStroke}
                {nodeStrokeWidth}
                {categories}
            />
        </Svg>
    </LayerCake>
</div>

<style>
    .chart-container { 
        width: 100%; 
    }
    :global(.circle-pack-group .node) { 
        transition: opacity 120ms ease; 
    }
    :global(.circle-pack-group .node:hover) { 
        opacity: 0.8; 
    }
</style>
