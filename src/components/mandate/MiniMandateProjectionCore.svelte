<script lang="ts">
    import { onMount } from "svelte";
    import type { Simulation } from "$lib/types";
    import { MiniMandateChart } from "$lib/mini-mandate-chart/MiniMandateChart";
    import { DeviceType, getLayoutConfiguration, LAYOUT_BREAKPOINTS } from "$lib/mini-mandate-chart/MiniMandateChartTypes";

    export let data: Record<string, Simulation> = {};
    export let selectedSimulation = 'main';
    export let forceHorizontalMode = false;
    export let simplified = false;

    let width = 0;
    let height = 0;
    let margin = { top: 20, right: 70, bottom: 20, left: 70 };
    let container: HTMLElement;
    let svg: SVGSVGElement;
    let chart: MiniMandateChart | null = null;
    let simulationData = {} as Simulation;
    let deviceType = DeviceType.Desktop;

    function updateDimensions() {
        if (!container) return;
        const containerWidth = container.clientWidth;
        const windowWidth = window.innerWidth;
        
        const effectiveWindowWidth = forceHorizontalMode ? LAYOUT_BREAKPOINTS.TABLET - 1 : windowWidth;
        const layoutConfig = getLayoutConfiguration(containerWidth, effectiveWindowWidth);
        
        width = containerWidth;
        height = width / layoutConfig.aspectRatio;
        margin = layoutConfig.margin;
        deviceType = layoutConfig.deviceType;
        
        if (chart) {
            chart.update({ width, height, margin, deviceType, simplified });
        }
    }

    onMount(() => {
        if (container) {
            updateDimensions();
        }
        
        if (typeof ResizeObserver !== 'undefined') {
            const resizeObserver = new ResizeObserver(entries => {
                if (entries.length > 0) {
                    const { width: newWidth } = entries[0].contentRect;
                    if (newWidth !== width && newWidth > 0) {
                        updateDimensions();
                    }
                }
            });
            
            if (container) {
                resizeObserver.observe(container);
            }
            
            return () => {
                resizeObserver.disconnect();
            };
        } else {
            let resizeTimeout: ReturnType<typeof setTimeout>;
            const resizeHandler = () => {
                clearTimeout(resizeTimeout);
                resizeTimeout = setTimeout(() => {
                    updateDimensions();
                }, 100);
            };
            
            window.addEventListener('resize', resizeHandler);
            
            return () => {
                window.removeEventListener('resize', resizeHandler);
            };
        }
    });
    
    $: if (data && selectedSimulation && data[selectedSimulation]) {
        simulationData = data[selectedSimulation];
    }
    
    $: if (simulationData['fidesz']?.length && simulationData['tisza']?.length && svg && width > 0) {
        if (!chart) {
            chart = new MiniMandateChart(svg, { width, height, margin, deviceType, simplified });
            chart.draw(simulationData);
        } else {
            chart.draw(simulationData);
        }
    }

    $: if (forceHorizontalMode !== undefined) {
        updateDimensions();
    }
</script>

<article id="mandate-visualization" bind:this={container}>
    <svg bind:this={svg} viewBox="0 0 {width} {height}" class:simplified></svg>
</article>

<style lang="scss">
svg {
    width: 100%;
    height: auto;
    
    &:not(.simplified) {
        padding-bottom: 30px;
        background-color: #f9f9f9;
        border: 2px solid #f5f5f5;
    }
}
</style>
