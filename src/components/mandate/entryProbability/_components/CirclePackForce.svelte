<script lang="ts">
    import { getContext, untrack } from 'svelte';
    import { forceSimulation, forceX, forceY, forceManyBody, forceCollide, forceCenter } from 'd3';
    import type { CategoryData } from '$lib/entryProbability';

    let { 
        manyBodyStrength = 3, 
        xStrength = 0.1, 
        nodeColor, 
        nodeStroke = '#fff', 
        nodeStrokeWidth = 1,
        groupBy = true,
        showPercentage = false,
        animateMount = false,
        categories = []
    }: {
        manyBodyStrength?: number;
        xStrength?: number;
        nodeColor?: string;
        nodeStroke?: string;
        nodeStrokeWidth?: number;
        groupBy?: boolean;
        showPercentage?: boolean;
        animateMount?: boolean;
        categories?: CategoryData[];
    } = $props();

    const { width, height, data, xScale, xGet, rGet, zGet } = getContext<any>('LayerCake');
    let nodes: any[] = $state([]);

    let simulation = $derived.by(() => {
        if (!$width || !$height || !$data?.length) return null;

        // For mount animation, start all nodes at center
        const initialNodes = $data.map((d: any) => {
            const node = { ...d };
            if (animateMount) {
                node.x = $width / 2;
                node.y = $height / 2;
            }
            return node;
        });

        const sim = forceSimulation(initialNodes)
            .force('x', forceX().x((d: any) => {
                return groupBy === true ? $xGet(d) + $xScale.bandwidth() / 2 : $width / 2;
            }).strength(xStrength))
            .force('y', forceY().y($height / 2).strength(xStrength))
            .force('charge', forceManyBody().strength(manyBodyStrength))
            .force('collision', forceCollide().radius((d: any) => {
                return $rGet(d) + nodeStrokeWidth / 2;
            }))
            .alpha(animateMount ? 1 : 0.3)
            .stop();

        return sim;
    });

    $effect(() => {
        if (!simulation) {
            nodes = [];
            return;
        }
        untrack(() => {
            const maxIterations = Math.ceil(
                Math.log(simulation.alphaMin()) / Math.log(1 - simulation.alphaDecay())
            );
            for (let i = 0; i < maxIterations; ++i) simulation.tick();
            nodes = [...simulation.nodes()];
        });
    });
</script>

<g class="circle-pack-group">
    {#each nodes as node}
        {#if node.shape === 'cross'}
            <g class="node" transform="translate({node.x}, {node.y})">
                <line
                    x1={-$rGet(node) / 2}
                    y1={-$rGet(node) / 2}
                    x2={$rGet(node) / 2}
                    y2={$rGet(node) / 2}
                    stroke={nodeColor || node.color || $zGet(node)}
                    stroke-width={nodeStrokeWidth * 2}
                />
                <line
                    x1={-$rGet(node) / 2}
                    y1={$rGet(node) / 2}
                    x2={$rGet(node) / 2}
                    y2={-$rGet(node) / 2}
                    stroke={nodeColor || node.color || $zGet(node)}
                    stroke-width={nodeStrokeWidth * 2}
                />
            </g>
        {:else}
            <circle 
                class="node"
                cx={node.x}
                cy={node.y}
                r={$rGet(node)}
                fill={nodeColor || node.color || $zGet(node)}
                stroke={nodeStroke}
                stroke-width={nodeStrokeWidth}
            />
        {/if}
    {/each}
    
    {#if showPercentage && categories.length > 0}
        <!-- Percentage labels for each category -->
        {#each categories as category, index}
            {@const totalCount = categories.reduce((sum, cat) => sum + cat.count, 0)}
            {@const percentage = category.count / totalCount}
            {@const xPosition = $width * (0.2 + (index * 0.6) / Math.max(categories.length - 1, 1))}
            <text 
                x={xPosition} 
                y={$height * 0.75} 
                text-anchor="middle" 
                font-size="16" 
                font-weight="bold"
                stroke="white"
                stroke-width="3"
            >
                {(percentage * 100).toFixed(1)}%
            </text>
            <text 
                x={xPosition} 
                y={$height * 0.75} 
                text-anchor="middle" 
                font-size="16" 
                font-weight="bold"
                fill={category.color}
            >
                {(percentage * 100).toFixed(1)}%
            </text>
        {/each}
    {/if}
</g>
