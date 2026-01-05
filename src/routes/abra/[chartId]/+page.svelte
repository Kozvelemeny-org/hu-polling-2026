<script lang="ts">
    // get the chartId from the slug parameter
    import { page } from "$app/state";
    import { onMount } from "svelte";
    import { pollData, simulationData, fetchData, mandateProjectionData } from "$stores/dataStore";
    import type { MandateProjectionData, PollData, Simulation } from "$lib/types";
    import PollsCardFromData from "$components/poll/PollsCardFromData.svelte";
    import html2canvas from "html2canvas";
    import GridItem from "$components/grid/GridItem.svelte";
    import SectionCard from "$components/section/SectionCard.svelte";
    import SectionTitle from "$components/section/SectionTitle.svelte";
    import OevkSectionCard from "$components/mandateProjection/OEVKSectionCard.svelte";

    const chartId = page.params.chartId;

    let chartType = null as 'poll' | 'projection' | 'map' | null;
    let chartName = chartId?.slice(2) || null;

    $: {
        if (chartId?.slice(0, 2) === 't-') {
            chartType = 'map';
        } else if (chartId?.slice(0, 2) === 'm-') {
            chartType = 'projection';
        } else if (chartId?.slice(0, 2) === 'g-') {
            chartType = 'poll';
        } else {
            chartType = null;
        }
        console.log(chartType, chartName);
    }

    let data = {
        sure_voters: [] as PollData,
        all_voters: [] as PollData,
        simulationData: {} as Record<string, Simulation>,
        mandateProjectionData: [] as MandateProjectionData,
    };

    onMount(fetchData);

    $: data = {
        sure_voters: $pollData.sure_voters,
        all_voters: $pollData.all_voters,
        simulationData: $simulationData,
        mandateProjectionData: $mandateProjectionData,
    }

    function saveImage() {
        const element = document.querySelector(".pollGraph");
        if (!element) {
            console.error("Element not found");
            return;
        }

        html2canvas(element as HTMLElement)
            .then((canvas) => {
                canvas.toBlob((blob) => {
                    if (!blob) {
                        console.error("Blob not created");
                        return;
                    }
                    const url = URL.createObjectURL(blob);
                    const link = document.createElement("a");
                    link.href = url;
                    link.download =
                        chartId + "-vox-populi-valasztas-2026" + ".png";
                    link.click();
                });
            })
            .catch((err) => console.error("Error capturing element", err));
    }

    // Copies the current page URL to the clipboard
    async function copyLink() {
        try {
            await navigator.clipboard.writeText(window.location.href);
            alert(`Link másolva a vágólapra! (${window.location.href})`);
        } catch (err) {
            console.error("Error copying link:", err);
        }
    }

    async function copyEmbedCode(link: string) {
        if (!link.includes("http")) {
            link = window.location.origin + link;
        }

        const embedCode = `
            <iframe
                src="${link}"
                width="100%"
                style="
                    aspect-ratio: 30 / 22;
                    border: none;
                "
            ></iframe>`;

        try {
            await navigator.clipboard.writeText(embedCode);
            alert("Beágyazási kód másolva a vágólapra!");
        } catch (err) {
            console.error("Error copying embed code:", err);
        }
    }
</script>

<GridItem variant="left-main" --grid-row="1 / 3">
    {#if chartType === 'map'}
        <OevkSectionCard
            data={data.simulationData[chartName || 'main']?.oevkDiffs}
            simulationName={data.simulationData[chartName || 'main']?.metadata.name}
            simulationKey={chartName || 'main'}
        />
    {:else if chartType === 'projection'}
        <!-- TODO: Add mandate projection chart -->
    {:else if chartType === 'poll' && chartName}
        <PollsCardFromData
            {data}
            chart_id={chartName}
            showSource={true}
            featured={true}
        />
    {/if}
</GridItem>

<GridItem variant="right-aside">
    <SectionCard>
        <SectionTitle variant="small">Megosztás</SectionTitle>
        <div class="share-menu">
            <ul>
                <li>
                    <button type="button" on:click={copyLink}>Link másolása</button>
                </li>
                <li>
                    <button type="button" on:click={saveImage}>Mentés képként</button>
                </li>
                <li>
                    <button
                        type="button"
                        on:click={() => copyEmbedCode(`/abra/${chartId}/embed`)}
                    >
                        Kártya beágyazása
                    </button>
                </li>
                <li>
                    <button
                        type="button"
                        on:click={() => copyEmbedCode(`/abra/${chartId}/embed?chart_only=true`)}
                    >
                        Grafikon beágyazása
                    </button>
                </li>
            </ul>
        </div>
    </SectionCard>
</GridItem>

<style lang="scss">
    .share-menu {
        ul {
            display: flex;
            flex-direction: column;
            gap: 6px;
            margin-top: 6px;
            list-style: none;

            li {
                button {
                    width: 100%;
                    padding: 4px 8px;
                    border: 1px solid #f5f5f5;
                    border-radius: 4px;
                    cursor: pointer;
                    background-color: #f9f9f9;
                    font-weight: 400;
                    text-align: left;
                }
            }
        }
    }

    ul.related-posts {
        list-style-type: disc;
        padding-left: 16px;

        li {
            a {
                text-decoration: none;
                &:hover {
                    text-decoration: underline;
                }
            }
            h3 {
                font-size: 1rem;
                font-weight: 400;
            }
        }
    }
</style>
