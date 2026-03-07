<script lang="ts">
    import { getContext } from 'svelte';

    let { 
        bandwidth = 1.0, // Bandwidth adjustment factor (like seaborn's bw_adjust: 1.0 = optimal, <1.0 = less smooth, >1.0 = more smooth)
        stroke = '#f9f9f9',
        strokeWidth = 0.5,
        getTitle = (d: any) => `${d["value"]}`,
        hideZeros = false,
        color = '#000'
    }: {
        bandwidth?: number; // Bandwidth adjustment factor (0.1-2.0 range recommended)
        stroke?: string;
        strokeWidth?: number;
        getTitle?: (d: any) => string;
        hideZeros?: boolean;
        color?: string;
    } = $props();

    const { width, height, data, xGet, xScale } = getContext<any>('LayerCake');

    // KDE with proper bandwidth control (similar to seaborn's bw_adjust)
    function kde(values: number[], bandwidth: number, domain: [number, number]): [number, number][] {
        const n = values.length;
        if (n === 0) return [];
        
        const [min, max] = domain;
        const numPoints = 100; // More points for smoother curves
        const step = (max - min) / (numPoints - 1);
        const result: [number, number][] = [];
        
        for (let i = 0; i < numPoints; i++) {
            const x = min + i * step;
            let density = 0;
            
            for (const value of values) {
                const diff = (x - value) / bandwidth;
                density += Math.exp(-0.5 * diff * diff);
            }
            
            density /= (n * bandwidth * Math.sqrt(2 * Math.PI));
            result.push([x, density]);
        }
        
        return result;
    }
    
    // Calculate optimal bandwidth using Silverman's rule of thumb (like seaborn)
    function calculateBandwidth(values: number[], bwAdjust: number): number {
        const n = values.length;
        if (n < 2) return 1;
        
        // Calculate standard deviation
        const mean = values.reduce((sum, val) => sum + val, 0) / n;
        const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / n;
        const stdDev = Math.sqrt(variance);
        
        // Silverman's rule of thumb
        const silvermanBandwidth = 1.06 * stdDev * Math.pow(n, -1/5);
        
        // Apply bandwidth adjustment (like seaborn's bw_adjust)
        return silvermanBandwidth * bwAdjust;
    }

    // Create violin path
    const violinPath = $derived(() => {
        if (!$data || !$width || !$height || !$xScale) return '';

        // Filter out zeros if hideZeros is true
        const filteredData = hideZeros ? $data.filter((d: any) => d.value > 0) : $data;
        
        if (filteredData.length === 0) return '';

        // Extract values for KDE
        const values = filteredData.map((d: any) => d.value);
        
        // Calculate optimal bandwidth with adjustment (like seaborn's bw_adjust)
        const optimalBandwidth = calculateBandwidth(values, bandwidth);
        
        // Create domain with some padding around the data
        const minValue = Math.min(...values);
        const maxValue = Math.max(...values);
        const padding = optimalBandwidth * 2;
        const domain: [number, number] = [minValue - padding, maxValue + padding];
        
        // Create KDE with proper smoothing
        const density = kde(values, optimalBandwidth, domain);
        
        // Scale the density to fit the chart height
        const maxDensity = Math.max(...density.map(d => d[1]));
        if (maxDensity === 0) return '';
        
        const scaledDensity = density.map(d => [
            d[0], // x value
            d[1] / maxDensity * ($height * 0.25) // scaled y value (25% of height for violin width)
        ]);

        const centerY = $height / 2;
        
        // Create the violin shape by mirroring the density curve
        let path = '';
        
        if (scaledDensity.length === 0) return '';
        
        // Start from the top center
        path += `M ${$xScale(scaledDensity[0][0])} ${centerY}`;
        
        // Draw the right side of the violin (positive density)
        for (let i = 0; i < scaledDensity.length; i++) {
            const [x, density] = scaledDensity[i];
            path += ` L ${$xScale(x)} ${centerY - density}`;
        }
        
        // Draw the left side of the violin (negative density)
        for (let i = scaledDensity.length - 1; i >= 0; i--) {
            const [x, density] = scaledDensity[i];
            path += ` L ${$xScale(x)} ${centerY + density}`;
        }
        
        // Close the path
        path += ' Z';
        
        return path;
    });
</script>

{#if violinPath && violinPath().length > 0}
    <g class="violin-group">
        <path 
            d={violinPath()} 
            fill={color} 
            fill-opacity="0.3"
            stroke={stroke} 
            stroke-width={strokeWidth}
            vector-effect="non-scaling-stroke"
        />
    </g>
{/if}