<script lang="ts">
    // get the chartId from the slug parameter
    import { page } from "$app/state";
    import { PUBLIC_EMBED_BASE_URL } from "$env/static/public";
    import type { PageData } from "./$types";
    import type { SiteDataBundle } from "$lib/server/siteData";
    import PollsCardFromData from "$components/poll/PollsCardFromData.svelte";
    import html2canvas from "html2canvas";
    import GridItem from "$components/grid/GridItem.svelte";
    import SectionCard from "$components/section/SectionCard.svelte";
    import SectionTitle from "$components/section/SectionTitle.svelte";
    import OevkSectionCard from "$components/mandateProjection/OEVKSectionCard.svelte";
    import FideszTiszaBeeswarmCard from "$components/mandate/beeswarm/FideszTiszaBeeswarmCard.svelte";

    const chartId = page.params.chartId;

    let chartType = null as 'poll' | 'beeswarm' | 'map' | null;
    let chartName = chartId?.slice(2) || null;
    export let data: PageData;
    const siteData = data.siteData as SiteDataBundle;
    const chartData = {
        sure_voters: siteData.pollData.sure_voters,
        all_voters: siteData.pollData.all_voters,
        mandateProjectionData: siteData.mandateProjectionData,
        historicalSimulationData: siteData.historicalSimulationData,
    };
    const pageTitle = "Ábra | Vox Pop";
    const pageDescription = "Megosztható és beágyazható Vox Populi ábra a 2026-os választási közvélemény-kutatások és mandátumbecslések adataiból.";
    const canonicalUrl = `https://2026.kozvelemeny.org/abra/${chartId}`;
    const ogImage = "https://2026.kozvelemeny.org/images/bg.webp";

    $: {
        if (chartId?.slice(0, 2) === 't-') {
            chartType = 'map';
        } else if (chartId?.slice(0, 2) === 'b-') {
            chartType = 'beeswarm';
        } else if (chartId?.slice(0, 2) === 'g-') {
            chartType = 'poll';
        } else {
            chartType = null;
        }
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
        const rawBase =
            PUBLIC_EMBED_BASE_URL && PUBLIC_EMBED_BASE_URL.length > 0
                ? PUBLIC_EMBED_BASE_URL
                : window.location.origin;

        const base = rawBase.replace(/\/+$/, "");

        if (!link.includes("http")) {
            link = base + link;
        }
        const origin = base;

        const embedCode = `<div id="vox-populi-embed-wrapper">
            <iframe
                id="vox-populi-embed-iframe"
                src="${link}"
                width="100%"
                height="700"
                style="border: none;"
            ></iframe>
        <script>
        (function() {
            var iframe = document.getElementById("vox-populi-embed-iframe");
            if (!iframe) return;
            var allowedOrigin = "${origin}";
            window.addEventListener("message", function(e) {
                if (e.origin !== allowedOrigin) return;
                if (e.data && e.data.type === "vox-populi-embed-resize" && e.source === iframe.contentWindow) {
                    iframe.style.height = e.data.height + "px";
                }
            });
        })();
        <\/script>
        </div>`;

        try {
            await navigator.clipboard.writeText(embedCode);
            alert("Beágyazási kód másolva a vágólapra!");
        } catch (err) {
            console.error("Error copying embed code:", err);
        }
    }
</script>

<svelte:head>
    <title>{pageTitle}</title>
    <meta name="description" content={pageDescription} />
    <link rel="canonical" href={canonicalUrl} />

    <meta property="og:type" content="website" />
    <meta property="og:site_name" content="Vox Populi: 2026 - Közvélemény-kutatások és mandátumbecslés" />
    <meta property="og:locale" content="hu_HU" />
    <meta property="og:title" content={pageTitle} />
    <meta property="og:description" content={pageDescription} />
    <meta property="og:url" content={canonicalUrl} />
    <meta property="og:image" content={ogImage} />

    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content={pageTitle} />
    <meta name="twitter:description" content={pageDescription} />
    <meta name="twitter:image" content={ogImage} />
</svelte:head>

<GridItem variant="left-main" --grid-row="1 / 3">
    {#if chartType === 'map'}
        <OevkSectionCard
            data={siteData.simulationData[chartName || 'main']?.oevkDiffs}
            simulationName={siteData.simulationData[chartName || 'main']?.metadata.name}
            simulationKey={chartName || 'main'}
        />
    {:else if chartType === 'beeswarm'}
        <FideszTiszaBeeswarmCard simulationData={siteData.simulationData} selectedSimulation={chartName ?? 'main'} />
    {:else if chartType === 'poll' && chartName}
        <PollsCardFromData
            data={chartData}
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
</style>
