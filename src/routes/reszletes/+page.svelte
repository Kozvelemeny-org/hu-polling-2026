<script lang="ts">
    import { onMount } from "svelte";
    import type { PageData } from "./$types";
    import type { SiteDataBundle } from "$lib/server/siteData";
    import SimulationSelectorBlock from "../../components/mandate/SimulationSelectorBlock.svelte";
    import GridItem from "../../components/grid/GridItem.svelte";
    import FideszTiszaBeeswarmCard from "$components/mandate/beeswarm/FideszTiszaBeeswarmCard.svelte";

    export let data: PageData;
    const siteData = data.siteData as SiteDataBundle;
    let selectedSimulation: string = "main";

    let beeswarmContainer: HTMLElement | null = null;
    let containerWidth = 0;

    function beeswarmRForWidth(w: number): number {
        if (w === 0) return 2.5;
        if (w >= 600) return 2.5;

        const minR = 1.2;
        const scaled = 2.5 * (w / 600);
        return Math.max(minR, scaled);
    }

    $: beeswarmR = beeswarmRForWidth(containerWidth);

    onMount(() => {
        if (!beeswarmContainer) return;

        const update = () => {
            containerWidth = beeswarmContainer?.clientWidth ?? 0;
        };

        update();

        if (typeof ResizeObserver !== "undefined") {
            const ro = new ResizeObserver(() => update());
            ro.observe(beeswarmContainer);
            return () => ro.disconnect();
        }
    });
    const pageTitle = "Részletes mandátumbecslés | Vox Populi";
    const pageDescription = "A mandátumbecslésünkhöz szimulált választások részletes eredménye, a Fidesz és a TISZA várható mandátumainak eloszlása.";
    const canonicalUrl = "https://2026.kozvelemeny.org/reszletes";
    const ogImage = "https://2026.kozvelemeny.org/images/bg.webp";
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

<SimulationSelectorBlock data={siteData.simulationData} bind:selectedSimulation />
<GridItem variant="main">
    <div bind:this={beeswarmContainer}>
        <FideszTiszaBeeswarmCard
            simulationData={siteData.simulationData}
            {selectedSimulation}
            r={beeswarmR}
        />
    </div>
</GridItem>