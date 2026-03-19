<script lang="ts">
    import type { PageData } from "./$types";
    import type { SiteDataBundle } from "$lib/server/siteData";
    import PollsterHeatmap from "$components/poll/PollsterHeatmap.svelte";
    import IndividualPollsList from "$components/poll/IndividualPollsList.svelte";
    import SectionTitle from "$components/section/SectionTitle.svelte";
    import GridItem from "$components/grid/GridItem.svelte";
    import GridSectionTitle from "$components/grid/GridSectionTitle.svelte";
    import RecentPollsAside from "$components/poll/RecentPollsAside.svelte";
    import SectionCard from "$components/section/SectionCard.svelte";
    export let data: PageData;
    const siteData = data.siteData as SiteDataBundle;
    const pageTitle = "Összes kutatás | Vox Populi";
    const pageDescription = "Az összes nyilvános választási közvélemény-kutatás 2018-tól egy oldalon: kutatóintézeti aktivitás, idősorok és egyes kutatások.";
    const canonicalUrl = "https://2026.kozvelemeny.org/kutatasok";
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

<GridItem variant="aside">
    <RecentPollsAside pollData={siteData.pollData.sure_voters} selectedGroup="big_parties" nItems={6} />
</GridItem>
<GridItem variant="main">
    <SectionCard>
        <SectionTitle variant="medium">Kutatóintézetek aktivitása</SectionTitle>
    </SectionCard>
</GridItem>

<GridItem variant="full">
    <GridSectionTitle>Összes közvélemény-kutatás</GridSectionTitle>
</GridItem>

<GridItem variant="full">
    <PollsterHeatmap pollData={siteData.pollData.sure_voters} />
</GridItem>

<GridItem variant="full">
    <SectionTitle variant="medium" hasTopMargin>Egyéni kutatások</SectionTitle>
    <IndividualPollsList pollData={siteData.pollData.sure_voters} />
</GridItem>
