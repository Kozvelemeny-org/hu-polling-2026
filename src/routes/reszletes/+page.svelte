<script lang="ts">
    import type { PageData } from "./$types";
    import type { SiteDataBundle } from "$lib/server/siteData";
    import SimulationSelectorBlock from "../../components/mandate/SimulationSelectorBlock.svelte";
    import GridItem from "../../components/grid/GridItem.svelte";
    import FideszTiszaBeeswarmCard from "$components/mandate/beeswarm/FideszTiszaBeeswarmCard.svelte";

    export let data: PageData;
    const siteData = data.siteData as SiteDataBundle;
    let selectedSimulation: string = "main";
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
    <FideszTiszaBeeswarmCard simulationData={siteData.simulationData} {selectedSimulation} />
</GridItem>