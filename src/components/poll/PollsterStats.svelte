<script lang="ts">
    import type { PollData, Pollster } from "$lib/types";
    import { pollsterData } from "$stores/dataStore";
    import * as d3 from "d3";
    import SectionCard from "$components/section/SectionCard.svelte";

    export let pollData: PollData = [];

    interface PollsterStat {
        id: Pollster;
        name: string;
        count: number;
        lastPoll: Date;
        frequency: string;
        color: string;
    }

    let stats: PollsterStat[] = [];

    $: {
        if (pollData && pollData.length > 0) {
            calculateStats();
        }
    }

    function calculateStats() {
        const grouped = d3.group(pollData, (d) => d.pollster);

        stats = Array.from(grouped)
            .map(([key, polls]) => {
                const sortedPolls = polls.sort(
                    (a, b) =>
                        new Date(b.date).getTime() - new Date(a.date).getTime(),
                );
                const lastPoll = new Date(sortedPolls[0].date);
                const count = polls.length;

                // Simple frequency estimation
                const firstPoll = new Date(
                    sortedPolls[sortedPolls.length - 1].date,
                );
                const daysDiff =
                    (lastPoll.getTime() - firstPoll.getTime()) /
                    (1000 * 3600 * 24);
                const avgDays = daysDiff / count;

                let frequency = "Rendszertelen";
                if (avgDays < 40) frequency = "Havonta";
                else if (avgDays < 100) frequency = "Negyedévente";
                else frequency = "Évente";

                return {
                    id: key,
                    name: pollsterData[key]?.name || key,
                    color: pollsterData[key]?.color || "#ccc",
                    count,
                    lastPoll,
                    frequency,
                };
            })
            .sort((a, b) => b.count - a.count);
    }
</script>

<SectionCard>
    <div class="stats-grid">
        {#each stats as stat}
            <div class="stat-item">
                <div class="stat-header">
                    <div
                        class="dot"
                        style="background-color: {stat.color}"
                    ></div>
                    <h4>{stat.name}</h4>
                </div>
                <div class="stat-body">
                    <div class="stat-row">
                        <span class="label">Kutatások száma</span>
                        <span class="value">{stat.count}</span>
                    </div>
                    <div class="stat-row">
                        <span class="label">Gyakoriság</span>
                        <span class="value">{stat.frequency}</span>
                    </div>
                    <div class="stat-row">
                        <span class="label">Utolsó mérés</span>
                        <span class="value"
                            >{stat.lastPoll.toLocaleDateString("hu-HU")}</span
                        >
                    </div>
                </div>
            </div>
        {/each}
    </div>
</SectionCard>

<style lang="scss">
    .stats-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
        gap: 1.5rem;
    }

    .stat-item {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
    }

    .stat-header {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        margin-bottom: 0.25rem;

        .dot {
            width: 10px;
            height: 10px;
            border-radius: 50%;
        }

        h4 {
            margin: 0;
            font-size: 1rem;
            font-weight: 600;
            color: #333;
        }
    }

    .stat-body {
        display: flex;
        flex-direction: column;
        gap: 0.25rem;
        font-size: 0.85rem;
    }

    .stat-row {
        display: flex;
        justify-content: space-between;
        align-items: baseline;
        border-bottom: 1px solid #f5f5f5;
        padding-bottom: 2px;

        &:last-child {
            border-bottom: none;
        }

        .label {
            color: #888;
        }

        .value {
            font-weight: 500;
            color: #444;
        }
    }
</style>
