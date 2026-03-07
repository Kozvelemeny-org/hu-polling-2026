<script lang="ts">
    import * as d3 from 'd3';
    import { onMount } from "svelte";
    import { partyData } from "$stores/dataStore";
    import type { Party, Simulation } from "$lib/types";

    export let data: Simulation;
    export let party: Party;

    let svgElement: SVGSVGElement | null = null;
    let chartGroup: d3.Selection<SVGGElement, unknown, null, undefined> | null = null;
    
    const width = 600;
    const height = 350;
    const margin = { top: 20, right: 20, bottom: 20, left: 20 };
    const chartWidth = width - margin.left - margin.right;
    const chartHeight = height - margin.top - margin.bottom;
    const seatRadius = 7;
    const seatPadding = 4;
    const spacing = 2 * seatRadius + seatPadding;
    const arcAngle = Math.PI;
    const center: [number, number] = [chartWidth / 2, chartHeight];
    const totalSeats = 199;

    interface Seat {
        x: number;
        y: number;
        row: number;
        angle: number;
        bin?: number;
        probability: number;
        opacity: number;
    }

    onMount(() => {
        if (svgElement) {
            initializeChart();
            if (data && party) {
                drawChart();
            }
        }
    });

    $: {
        if (svgElement && chartGroup && data && party) {
            drawChart();
        }
    }

    function initializeChart() {
        if (!svgElement) return;

        const svg = d3.select(svgElement);
        svg
            .attr('viewBox', `0 0 ${width} ${height}`)
            .attr('preserveAspectRatio', 'xMidYMid meet');

        chartGroup = svg.append('g')
            .attr('transform', `translate(${margin.left},${margin.top})`);
    }

    function calculateSeatProbabilities(): number[] {
        const distribution = data[party] as number[] | undefined;
        if (!distribution || distribution.length === 0) {
            return Array(totalSeats).fill(0);
        }

        // For seat k (1-indexed), calculate P(winning >= k seats)
        const probabilities: number[] = [];
        for (let k = 1; k <= totalSeats; k++) {
            let probability = 0;
            for (let i = k; i < distribution.length; i++) {
                probability += distribution[i] || 0;
            }
            probabilities.push(probability);
        }

        return probabilities;
    }

    function calculateSeatLayout(): Seat[] {
        let seats: Seat[] = [];
        let seatsRemaining = totalSeats;
        let rowIndex = 0;
        const outerRadius = Math.min(
            chartWidth / 2 - seatRadius,
            chartHeight - seatRadius
        );

        while (seatsRemaining > 0) {
            const r = outerRadius - rowIndex * spacing;
            if (r < seatRadius) break;

            const theoreticalCapacity = Math.floor((arcAngle * r) / spacing);
            if (theoreticalCapacity <= 0) break;

            const seatsInRow = Math.min(theoreticalCapacity, seatsRemaining);
            seatsRemaining -= seatsInRow;

            let angles: number[] = [];
            if (seatsInRow === 1) {
                angles.push((Math.PI + 0) / 2);
            } else {
                const angleStep = arcAngle / (seatsInRow - 1);
                for (let i = 0; i < seatsInRow; i++) {
                    angles.push(Math.PI - i * angleStep);
                }
            }

            for (let i = 0; i < seatsInRow; i++) {
                const angle = angles[i];
                const x = center[0] + r * Math.cos(angle);
                const y = center[1] - r * Math.sin(angle);
                seats.push({ x, y, row: rowIndex, angle, probability: 0, opacity: 0 });
            }
            rowIndex++;
        }

        return seats;
    }

    function drawChart() {
        if (!chartGroup || !data || !party) return;

        let seats = calculateSeatLayout();

        if (seats.length !== totalSeats) {
            console.warn(`Expected ${totalSeats} seats but got ${seats.length}`);
        }

        if (seats.length === 0) return;

        // Save maxRow for calculating inner radius before modifying seats
        const maxRow = Math.max(...seats.map(s => s.row));

        // Determine the number of bins from the outer row's capacity (same as ParliamentChart)
        const outerRowCapacity = seats.filter(s => s.row === 0).length;
        const globalBins = outerRowCapacity;

        // Compute a bin for each seat based solely on its angle (same as ParliamentChart)
        // Mapping: angle π → bin 0 (leftmost), angle 0 → bin (globalBins - 1) (rightmost)
        seats.forEach(seat => {
            seat.bin = Math.round(((Math.PI - seat.angle) / Math.PI) * (globalBins - 1));
        });

        // Sort seats by bin value (left to right), then by row (outer rows first) - same as ParliamentChart
        seats.sort((a, b) => {
            if (a.bin === b.bin) {
                return a.row - b.row;
            }
            return (a.bin ?? 0) - (b.bin ?? 0);
        });

        // Now seats are ordered left-to-right, column-by-column
        // Calculate probabilities for each seat position in this left-to-right order
        const probabilities = calculateSeatProbabilities();

        // Assign probabilities to seats in left-to-right order
        // Seat position k (1-indexed) gets probability P(winning >= k seats)
        const seatsWithProbabilities = seats.map((seat, index) => {
            // index is 0-indexed, so seat position is (index + 1)
            const seatPosition = index + 1;
            return {
                ...seat,
                probability: probabilities[seatPosition - 1] || 0, // probabilities array is 0-indexed
            };
        });

        // Assign categorical opacity based on probability thresholds
        // Categories: 0.99+, 0.90+, 0.75+, 0.50+, 0.25+, 0.10+, below 0.10
        function getOpacityForProbability(probability: number): number {
            if (probability >= 0.95) return 1.0;      // .95+
            if (probability >= 0.75) return 0.70;     // .75+
            if (probability >= 0.50) return 0.50;     // .50+
            if (probability >= 0.25) return 0.25;     // .25+
            if (probability >= 0.10) return 0.10;     // .10+
            return 0.00;                               // below .10
        }

        // Assign opacity based on actual probability value (categorical)
        seatsWithProbabilities.forEach((seat) => {
            seat.opacity = getOpacityForProbability(seat.probability);
        });

        // Clear previous content
        chartGroup.selectAll("*").remove();

        // Render circles for each seat
        seatsWithProbabilities.forEach((seat, index) => {
            const color = partyData[party].color;
            chartGroup!
                .append("circle")
                .attr("cx", seat.x)
                .attr("cy", seat.y)
                .attr("r", seatRadius)
                .attr("fill", color)
                .attr("stroke", '#f7f7f7')
                .attr("fill-opacity", seat.opacity);
        });

        // Draw majority lines (similar to ParliamentChart)
        // Calculate inner radius from the actual layout
        const outerRadius = Math.min(
            chartWidth / 2 - seatRadius,
            chartHeight - seatRadius
        );
        
        const innerRadius = outerRadius - maxRow * spacing;

        const majorityLine = chartGroup.append("line")
            .attr("x1", center[0])
            .attr("y1", center[1] - innerRadius + 40)
            .attr("x2", center[0])
            .attr("y2", center[1] - outerRadius - 40)
            .attr("stroke", "#aaa")
            .attr("stroke-dasharray", "2,2")
            .attr("stroke-width", 2);

        const majorityText = chartGroup.append("text")
            .attr("x", center[0] + 5)
            .attr("y", center[1] - outerRadius - 40)
            .style("dominant-baseline", "text-before-edge")
            .attr("fill", "#333")
            .attr("font-size", "12px")
            .text("Többség");

        const absMajorityLine = chartGroup.append("line")
            .attr("x1", Math.cos(Math.PI - (Math.PI * 2/3)) * (innerRadius - 40) + center[0])
            .attr("y1", -Math.sin(Math.PI - (Math.PI * 2/3)) * (innerRadius - 40) + center[1])
            .attr("x2", Math.cos(Math.PI - (Math.PI * 2/3)) * (outerRadius + 40) + center[0])
            .attr("y2", -Math.sin(Math.PI - (Math.PI * 2/3)) * (outerRadius + 40) + center[1])
            .attr("stroke", "#aaa")
            .attr("stroke-dasharray", "2,2")
            .attr("stroke-width", 2);

        const absMajorityText = chartGroup.append("text")
            .attr("x", Math.cos(Math.PI - (Math.PI * 2/3)) * (outerRadius + 40) + center[0] + 5)
            .attr("y", -Math.sin(Math.PI - (Math.PI * 2/3)) * (outerRadius + 40) + center[1])
            .style("dominant-baseline", "text-before-edge")
            .attr("dy", -2)
            .attr("fill", "#333")
            .attr("font-size", "12px")
            .text("Kétharmad");
    }
</script>

<article>
    <div id="chart">
        <svg bind:this={svgElement}></svg>
    </div>
</article>

<style lang="scss">
    article {
        width: 100%;
    }

    #chart {
        width: 100%;
    }
</style>
