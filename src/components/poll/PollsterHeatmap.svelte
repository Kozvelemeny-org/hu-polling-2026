<script lang="ts">
    import type { PollData } from "$lib/types";
    import * as d3 from "d3";
    import SectionCard from "$components/section/SectionCard.svelte";
    import SectionTitle from "$components/section/SectionTitle.svelte";
    import { pollsterData } from "$stores/dataStore";

    export let pollData: PollData = [];

    let selectedYear = new Date().getFullYear();
    let years: number[] = [];

    interface PollsterRow {
        name: string;
        id: string;
        color: string;
        totalCount: number;
        weeks: { date: Date; count: number }[];
    }

    let heatmapRows: PollsterRow[] = [];
    let expanded = false;
    let visibleRows: PollsterRow[] = [];

    $: {
        if (pollData && pollData.length > 0) {
            const allYears = new Set(
                pollData.map((p) => new Date(p.date).getFullYear()),
            );
            years = Array.from(allYears).sort((a, b) => b - a);
            if (!years.includes(selectedYear) && years.length > 0) {
                selectedYear = years[0];
            }
        }
    }

    $: if (pollData && selectedYear) {
        processData();
    }

    $: visibleRows = expanded ? heatmapRows : heatmapRows.slice(0, 7);

    function processData() {
        const filteredPolls = pollData.filter(
            (p) => new Date(p.date).getFullYear() === selectedYear,
        );

        // Generate full year weeks
        const start = new Date(selectedYear, 0, 1);
        const end = new Date(selectedYear, 11, 31);
        const weeks = d3.timeWeeks(d3.timeWeek(start), end);

        // Group by pollster
        const pollsByPollster = d3.group(filteredPolls, (d) => d.pollster);

        const rows: PollsterRow[] = [];

        for (const [pollsterId, polls] of pollsByPollster) {
            const pollsByWeek = d3.rollup(
                polls,
                (v) => v.length,
                (d) => d3.timeWeek(new Date(d.date)).getTime(),
            );

            const weekData = weeks.map((week) => ({
                date: week,
                count: pollsByWeek.get(week.getTime()) || 0,
            }));

            rows.push({
                name: pollsterData[pollsterId]?.name || pollsterId,
                id: pollsterId,
                color: pollsterData[pollsterId]?.color || "#ccc",
                totalCount: polls.length,
                weeks: weekData,
            });
        }

        // Sort by total count descending
        heatmapRows = rows.sort((a, b) => b.totalCount - a.totalCount);
    }

    function getWeekLabel(date: Date) {
        const end = new Date(date);
        end.setDate(end.getDate() + 6);
        return `${date.toLocaleDateString("hu-HU", { month: "short", day: "numeric" })} - ${end.toLocaleDateString("hu-HU", { month: "short", day: "numeric" })}`;
    }

    const cellSize = 12;
    const cellGap = 3;
    const monthLabelHeight = 20;
    const rowHeight = 28;
    const labelWidth = 120;
</script>

<SectionCard>
    <div class="header">
        <SectionTitle variant="small"
            >Kutatási aktivitás (heti bontás)</SectionTitle
        >
        <div class="year-switcher">
            {#each years as year}
                <button
                    class:active={year === selectedYear}
                    on:click={() => (selectedYear = year)}
                >
                    {year}
                </button>
            {/each}
        </div>
    </div>

    <div class="heatmap-container">
        <div class="heatmap-scroll">
            <svg
                width={labelWidth + 54 * (cellSize + cellGap) + 20}
                height={monthLabelHeight + visibleRows.length * rowHeight + 10}
            >
                <g transform="translate({labelWidth}, {monthLabelHeight})">
                    <!-- Month labels -->
                    {#each d3.timeMonths(new Date(selectedYear, 0, 1), new Date(selectedYear, 11, 31)) as month}
                        <text
                            x={d3.timeWeek.count(d3.timeYear(month), month) *
                                (cellSize + cellGap)}
                            y="-5"
                            font-size="10"
                            fill="#767676"
                        >
                            {month.toLocaleString("hu-HU", { month: "short" })}
                        </text>
                    {/each}
                </g>

                <g transform="translate(0, {monthLabelHeight})">
                    {#each visibleRows as row, i}
                        <g transform="translate(0, {i * rowHeight})">
                            <!-- Pollster Label -->
                            <text
                                x={labelWidth - 10}
                                y={(cellSize * 2) / 2}
                                text-anchor="end"
                                font-size="11"
                                font-weight="600"
                                fill="#333"
                                dominant-baseline="middle"
                            >
                                {row.name}
                            </text>

                            <!-- Heatmap Cells -->
                            <g transform="translate({labelWidth}, 0)">
                                {#each row.weeks as week, j}
                                    <rect
                                        x={j * (cellSize + cellGap)}
                                        y="0"
                                        width={cellSize}
                                        height={cellSize * 1.5}
                                        rx="2"
                                        fill={week.count === 0
                                            ? "#f5f5f5"
                                            : row.color}
                                        fill-opacity="1"
                                    >
                                        <title>
                                            {row.name}
                                            {getWeekLabel(week.date)}: {week.count}
                                            kutatás
                                        </title>
                                    </rect>
                                {/each}
                            </g>
                        </g>
                    {/each}
                </g>
            </svg>
        </div>
    </div>

    {#if heatmapRows.length > 7}
        <div class="expand-container">
            <button class="expand-btn" on:click={() => (expanded = !expanded)}>
                {expanded ? "Kevesebb mutatása" : "Összes mutatása"}
            </button>
        </div>
    {/if}
</SectionCard>

<style lang="scss">
    .header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 1rem;
        padding-bottom: 0.5rem;
        border-bottom: 1px solid #eee;
    }

    .year-switcher {
        display: flex;
        gap: 0.25rem;

        button {
            background: none;
            border: 1px solid transparent;
            padding: 2px 8px;
            border-radius: 4px;
            cursor: pointer;
            font-size: 0.85rem;
            color: #666;
            transition: all 0.2s;
            font-family: inherit;

            &:hover {
                background: #f0f0f0;
                color: #333;
            }

            &.active {
                background: #e1e4e8;
                color: #24292e;
                font-weight: 600;
            }
        }
    }

    .heatmap-container {
        width: 100%;
        overflow-x: auto;
    }

    .heatmap-scroll {
        min-width: 800px; /* Ensure SVG doesn't shrink too much */
    }

    .expand-container {
        display: flex;
        justify-content: center;
        margin-top: 1rem;
        padding-top: 0.5rem;
        border-top: 1px solid #f5f5f5;
    }

    .expand-btn {
        background: white;
        border: 1px solid #ddd;
        padding: 6px 16px;
        border-radius: 16px;
        font-size: 0.85rem;
        color: #666;
        cursor: pointer;
        transition: all 0.2s;

        &:hover {
            background: #f5f5f5;
            color: #333;
            border-color: #ccc;
        }
    }
</style>
