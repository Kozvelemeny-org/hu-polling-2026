<script lang="ts">
    import type { PollData, Party } from "$lib/types";
    import SectionCard from "$components/section/SectionCard.svelte";
    import { partyData, pollsterData } from "$stores/dataStore";

    export let pollData: PollData = [];

    // Parties to show in the list
    let selectedParties: Party[] = ["fidesz", "tisza", "mihazank", "dk"];

    // Pagination
    let itemsPerPage = 20;
    let currentPage = 1;

    $: totalPages = Math.ceil(pollData.length / itemsPerPage);
    $: displayedPolls = pollData.slice(0, currentPage * itemsPerPage);

    function loadMore() {
        if (currentPage < totalPages) {
            currentPage++;
        }
    }

    function getPartyColor(party: Party) {
        return partyData[party]?.color || "#ccc";
    }

    function getPollsterName(id: string) {
        return pollsterData[id]?.name || id;
    }

    function formatDate(date: Date) {
        return new Date(date).toLocaleDateString("hu-HU", {
            month: "short",
            day: "numeric",
        });
    }
</script>

<SectionCard>
    <div class="polls-list">
        {#each displayedPolls as poll}
            <div class="poll-row">
                <div class="poll-info">
                    <div class="pollster">{getPollsterName(poll.pollster)}</div>
                    <div class="date">{formatDate(poll.date)}</div>
                </div>
                <div class="poll-bars">
                    {#each selectedParties as party}
                        {#if poll[party] !== undefined}
                            <div class="bar-container">
                                <div
                                    class="bar-bg"
                                    style="background-color: {getPartyColor(
                                        party,
                                    )}11"
                                >
                                    <div
                                        class="bar-fill"
                                        style="width: {poll[party] *
                                            100}%; background-color: {getPartyColor(
                                            party,
                                        )}22; border: 1px solid {getPartyColor(
                                            party,
                                        )}44;"
                                    ></div>
                                </div>
                                <div
                                    class="bar-value"
                                    style="color: {getPartyColor(party)}"
                                >
                                    <span class="percent"
                                        >{(poll[party] * 100).toFixed(0)}%</span
                                    >
                                </div>
                            </div>
                        {/if}
                    {/each}
                </div>
            </div>
        {/each}
    </div>

    {#if currentPage < totalPages}
        <div class="load-more">
            <button on:click={loadMore}>További kutatások betöltése</button>
        </div>
    {/if}
</SectionCard>

<style lang="scss">
    .polls-list {
        display: flex;
        flex-direction: column;
        gap: 1.5rem;
    }

    .poll-row {
        display: grid;
        grid-template-columns: 100px 1fr;
        gap: 1rem;
        align-items: flex-start;

        @media (max-width: 600px) {
            grid-template-columns: 1fr;
            gap: 0.5rem;
        }
    }

    .poll-info {
        display: flex;
        flex-direction: column;
        gap: 0.25rem;

        .pollster {
            font-weight: 600;
            font-size: 0.95rem;
            color: #333;
        }

        .date {
            font-size: 0.85rem;
            color: #888;
        }
    }

    .poll-bars {
        display: flex;
        flex-direction: column;
        gap: 4px;
    }

    .bar-container {
        display: flex;
        align-items: center;
        gap: 8px;
        height: 24px;
        position: relative;

        .bar-bg {
            flex-grow: 1;
            height: 100%;
            position: relative;
            border-radius: 2px;
            overflow: hidden;
        }

        .bar-fill {
            height: 100%;
            border-right: 1px solid rgba(0, 0, 0, 0.1);
        }

        .bar-value {
            font-size: 0.9rem;
            font-weight: 600;
            width: 35px;
            text-align: right;
            flex-shrink: 0;
        }
    }

    .load-more {
        display: flex;
        justify-content: center;
        margin-top: 2rem;
        padding-top: 1rem;
        border-top: 1px solid #eee;

        button {
            background: white;
            border: 1px solid #ddd;
            padding: 8px 24px;
            border-radius: 20px;
            color: #666;
            font-size: 0.9rem;
            cursor: pointer;
            transition: all 0.2s;

            &:hover {
                background: #f5f5f5;
                color: #333;
                border-color: #ccc;
            }
        }
    }
</style>
