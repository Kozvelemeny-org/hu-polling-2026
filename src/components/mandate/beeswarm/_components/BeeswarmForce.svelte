<script lang="ts">
    import { getContext, untrack } from 'svelte';
    import { forceSimulation, forceX, forceY, forceCollide } from 'd3';

    let { r = 4, strokeWidth = 1, stroke = '#fff', xStrength = 0.95, yStrength = 0.075, getTitle, hideZeros = false, paddingTop = 0 }: {
        r?: number;
        strokeWidth?: number;
        stroke?: string;
        xStrength?: number;
        yStrength?: number;
        getTitle?: (d: any) => string;
        hideZeros?: boolean;
        paddingTop?: number;
    } = $props();

    const { width, height, data, xGet, zGet } = getContext<any>('LayerCake');
    let nodes: any[] = $state([]);
    let animationState = $state<'visible' | 'fading-out' | 'hidden' | 'fading-in'>('hidden');
    let previousSimulation: any = null;

    let simulation = $derived.by(() => {
        if (!$width || !$height || !$data?.length) return null;

        const filteredData = $data.filter((d: any) => !hideZeros || d.value > 0);
        const nodeCount = filteredData.length;
        
        const sim = forceSimulation(filteredData.map((d: any) => ({ ...d })))
            .force('x', forceX().x((d: any) => $xGet(d)).strength(xStrength))
            .force('y', forceY().y($height / 2).strength(yStrength))
            .force('collide', forceCollide(r*(2/3)))
            // Optimize for large datasets: faster decay and stopping
            .alphaMin(nodeCount > 500 ? 0.01 : 0.001)
            .alphaDecay(nodeCount > 500 ? 0.07 : 0.0224)
            .velocityDecay(0.4)
            .stop();

        return sim;
    });

    // Detect when simulation changes (new data)
    $effect(() => {
        const simChanged = previousSimulation !== null && simulation !== previousSimulation && nodes.length > 0;
        
        if (simChanged) {
            // Start fade-out when we get new data
            animationState = 'fading-out';
        }
        
        previousSimulation = simulation;
    });
    
    $effect(() => {
        if (!simulation) {
            if (nodes.length > 0) {
                // Fade out before clearing
                animationState = 'fading-out';
                setTimeout(() => {
                    nodes = [];
                    animationState = 'hidden';
                }, 300); // Match fade-out duration
            } else {
                nodes = [];
                animationState = 'hidden';
            }
            return;
        }
        
        // Capture simulation reference to avoid reactive updates during async execution
        const sim = simulation;
        const nodeCount = sim.nodes().length;
        
        // Optimize for large datasets (1000+ dots)
        // Cap iterations to avoid blocking UI - typically converges in 50-100 ticks for large datasets
        const maxIterations = nodeCount > 500 ? 200 : Math.ceil(
            Math.log(sim.alphaMin()) / Math.log(1 - sim.alphaDecay())
        );
        
        // Process ticks in chunks to allow browser to handle other tasks
        // Use smaller chunks for larger datasets to keep UI responsive
        const ticksPerChunk = nodeCount > 500 ? 5 : 10;
        
        // Run simulation asynchronously to avoid blocking UI
        let cancelled = false;
        let currentIteration = 0;
        let simulationComplete = false;
        
        const runSimulationChunk = () => {
            if (cancelled) return;
            
            const chunkEnd = Math.min(currentIteration + ticksPerChunk, maxIterations);
            
            // Process a chunk of ticks
            for (let i = currentIteration; i < chunkEnd; ++i) {
                const alphaBefore = sim.alpha();
                sim.tick();
                
                // Early stop if alpha drops below threshold (converged)
                if (sim.alpha() < sim.alphaMin()) {
                    simulationComplete = true;
                    finalizeSimulation();
                    return;
                }
                
                // Early stop if alpha didn't decrease much (already converged)
                if (alphaBefore - sim.alpha() < 0.0001) {
                    simulationComplete = true;
                    finalizeSimulation();
                    return;
                }
            }
            
            currentIteration = chunkEnd;
            
            // Check if simulation is complete
            if (currentIteration >= maxIterations) {
                simulationComplete = true;
                finalizeSimulation();
                return;
            }
            
            // Continue to next chunk on next frame
            requestAnimationFrame(runSimulationChunk);
        };
        
        const finalizeSimulation = () => {
            if (cancelled) return;
            
            const finalNodes = sim.nodes();
            const wasFadingOut = animationState === 'fading-out';
            
            // Sort nodes by x position (mandate count) to calculate stagger delays
            const sortedByX = [...finalNodes].sort((a: any, b: any) => a.x - b.x);
            
            // Assign stagger delays based on sorted position, then shuffle for random z-order
            const nodesWithDelays = sortedByX.map((node: any, index: number) => ({
                ...node,
                _staggerDelay: index * 0.0003, // Match the delay in template
                _sortKey: `${node.x.toFixed(2)}-${node.y.toFixed(2)}` // Stable key for Svelte
            }));
            
            // Shuffle for random z-order (Fisher-Yates)
            const shuffledNodes = [...nodesWithDelays];
            for (let i = shuffledNodes.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [shuffledNodes[i], shuffledNodes[j]] = [shuffledNodes[j], shuffledNodes[i]];
            }
            
            const applyNodes = () => {
                if (cancelled) return;
                
                // Set nodes first with opacity 0 (hidden state)
                nodes = shuffledNodes;
                animationState = 'hidden';
                
                // Force a reflow so DOM renders with opacity 0
                requestAnimationFrame(() => {
                    if (cancelled) return;
                    requestAnimationFrame(() => {
                        if (cancelled) return;
                        // Now trigger fade-in - this will start the transition
                        animationState = 'fading-in';
                        
                        // Calculate total animation time: max stagger delay + transition duration
                        const maxStaggerDelay = shuffledNodes.length * 0.0003;
                        const transitionDuration = 300; // 0.3s in ms
                        const totalAnimationTime = maxStaggerDelay * 1000 + transitionDuration;
                        
                        // Wait for all animations to complete before switching to visible
                        setTimeout(() => {
                            if (cancelled) return;
                            animationState = 'visible';
                        }, Math.min(totalAnimationTime, 8000)); // Cap at 8000ms
                    });
                });
            };
            
            // Wait for fade-out to complete if it's happening
            if (wasFadingOut) {
                // Wait for fade-out animation (300ms)
                setTimeout(() => {
                    applyNodes();
                }, 300); // Match fade-out duration
            } else {
                // No fade-out needed (initial load)
                applyNodes();
            }
        };
        
        // Start simulation
        // If fading out, simulation runs during fade-out (efficient!)
        // Otherwise, run for initial load
        if (animationState === 'fading-out' || animationState === 'hidden' || nodes.length === 0) {
            requestAnimationFrame(runSimulationChunk);
        }
        
        // Cleanup: cancel if effect re-runs
        return () => {
            cancelled = true;
        };
    });
</script>

<g class="bee-group" class:fading-out={animationState === 'fading-out'} class:fading-in={animationState === 'fading-in'} class:visible={animationState === 'visible'}>
    {#each nodes as node (node._sortKey)}
        {@const staggerDelay = node._staggerDelay ?? 0}
        <circle
            fill={$zGet(node)}
            {stroke}
            stroke-width={strokeWidth}
            cx={node.x}
            cy={!!paddingTop ? (node.y + paddingTop / 2) : node.y}
            {r}
            class="bee-dot"
            style="transition-delay: {staggerDelay}s"
        >
            {#if getTitle}
                <title>{getTitle(node)}</title>
            {/if}
        </circle>
    {/each}
    <!-- empty if no nodes -->
    {#if !nodes.length}
        <g />
    {/if}
    
</g>

<style>
    :global(.bee-group .bee-dot) {
        scale: 0;
        transition: scale 0.5s ease-out;
        transform-box: fill-box;
        transform-origin: center;
    }
    
    :global(.bee-group.fading-out .bee-dot) {
        scale: 0;
        transition: scale 0.1s ease-out;
    }
    
    :global(.bee-group.fading-in .bee-dot) {
        scale: 1;
    }
    
    :global(.bee-group.visible .bee-dot) {
        scale: 1;
    }
</style>