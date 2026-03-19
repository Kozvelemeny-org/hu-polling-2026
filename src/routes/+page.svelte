<script lang="ts">
    import type { SiteDataBundle } from "$lib/server/siteData";
    import RecentPollsAside from "$components/poll/RecentPollsAside.svelte";
    import PollsCardFromData from "$components/poll/PollsCardFromData.svelte";
    import SectionCard from "$components/section/SectionCard.svelte";
    import SectionTitle from "$components/section/SectionTitle.svelte";
    import GridItem from "$components/grid/GridItem.svelte";
    import GridSectionTitle from "$components/grid/GridSectionTitle.svelte";
    import Paragraph from "$components/grid/Paragraph.svelte";
    import RecentMandateProjectionsAside from "$components/mandate/RecentMandateProjectionsAside.svelte";
    import SimulationNameSpan from "$components/mandate/SimulationNameSpan.svelte";
    import PollsChartFromData from "$components/poll/PollsChartFromData.svelte";
    import BottomMenu from "$components/ui/bottom-menu/BottomMenu.svelte";
    import BottomMenuItem from "$components/ui/bottom-menu/BottomMenuItem.svelte";
    import VoxPopuliLinksAside from "$components/VoxPopuliLinksAside.svelte";
    import { EXPLAINER_ARTICLE_LINK } from "$lib/charts";
    import type { PageData } from "./$types";

    export let data: PageData;
    const siteData = data.siteData as SiteDataBundle;
    const chartData = {
        sure_voters: siteData.pollData.sure_voters,
        all_voters: siteData.pollData.all_voters,
        mandateProjectionData: siteData.mandateProjectionData,
        historicalSimulationData: siteData.historicalSimulationData,
    };
    const pageTitle = "Vox Populi: Választás 2026";
    const pageDescription = "Folyamatosan frissülő 2026-os választási közvélemény-kutatások és mandátumbecslések. Fidesz–TISZA trendek, kis pártok esélyei, részletes ábrák és módszertani háttér.";
    const canonicalUrl = "https://2026.kozvelemeny.org/";
    const ogImage = "https://2026.kozvelemeny.org/images/bg.webp";

    const datasetJsonLd = (() => {
        const dataset: Record<string, unknown> = {
            "@context": "https://schema.org",
            "@type": "Dataset",
            name: "Vox Populi: Választás 2026",
            description: pageDescription,
            url: canonicalUrl,
            inLanguage: "hu-HU"
        };
        const updatedAt = siteData.simulationData.main?.metadata.updatedAt;
        if (updatedAt instanceof Date) {
            dataset.dateModified = updatedAt.toISOString();
        }
        return dataset;
    })();
    $: datasetJsonLdScript = `<script type="application/ld+json">${JSON.stringify(datasetJsonLd).replace(/</g, "\\u003c")}<\/script>`;
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

    {@html datasetJsonLdScript}
</svelte:head>

<GridItem variant="aside" hideOnMobile>
    <RecentPollsAside pollData={siteData.pollData.sure_voters} selectedGroup="big_parties" nItems={9} />
</GridItem>
<GridItem variant="main">
    <PollsCardFromData data={chartData} chart_id="fidesz-tisza" />
</GridItem>

<GridItem variant="full">
    <GridSectionTitle>Ki fog nyerni?</GridSectionTitle>
</GridItem>

<GridItem variant="aside" hideOnMobile>
    <RecentMandateProjectionsAside mandateProjectionData={siteData.mandateProjectionData} selectedGroup="big_parties" nItems={9} />
</GridItem>
<GridItem variant="main">
    <SectionCard>
        <SectionTitle variant="featured">Mandátumbecslések alakulása</SectionTitle>
        <Paragraph --margin="2px">
            a <SimulationNameSpan>{siteData.simulationData["main"]?.metadata.name}</SimulationNameSpan>
            szimuláció alapján, 60 napos súlyozott mozgóátlag. 
        </Paragraph>
        <PollsChartFromData data={chartData} pollsterGroup={"voxpopuli"} scenarioKey={"main"} chart_id="mandate-projection-chart" />
        <Paragraph noMargin>
            Ez az ábra a megelőzőben látható szavazatarány-becsléseket fordítja át
            mandátumbecslésekké az <a href="{EXPLAINER_ARTICLE_LINK}" target="_blank">itt</a>
            részletesen leírt adatok és feltevések felhasználásával. A bal oldalt látható “A
            legfrissebb adatok” táblázat a legutóbb megjelent kutatásokra nézve mutat be
            ugyanilyen számításokat. 
        </Paragraph>
        <Paragraph>
            További részletek a mandátumszámításaink eredményeiről
            (egyéni és listás mandátumok száma pártonként, győzteskompenzáció hatása,
            különböző parlamenti többségek valószínűsége, illetve minden szám statisztikai
            hibahatára) érhetők el <a href="{EXPLAINER_ARTICLE_LINK}" target="_blank">itt</a>,
            valamint a fenti menüben a “Mandátumbecslés” illetve a “Részletes becslés” pontra ráklikkelve.
        </Paragraph>
        <BottomMenu>
            <BottomMenuItem link={`/abra/g-mandate-projection-chart`}>Megosztás</BottomMenuItem>
            <BottomMenuItem link={`/abra/g-mandate-projection-chart`}>Beágyazás</BottomMenuItem>
        </BottomMenu>
    </SectionCard>
</GridItem>


<GridItem variant="full">
    <GridSectionTitle>A többi párt</GridSectionTitle>
</GridItem>
<GridItem variant="aside" hideOnMobile>
    {#if siteData.pollData.sure_voters.length > 0}
        <RecentPollsAside pollData={siteData.pollData.sure_voters} selectedGroup="small_parties" nItems={9} />
    {/if}
</GridItem>
<GridItem variant="main">
    <PollsCardFromData data={chartData} chart_id="kis-partok" />
</GridItem>

<GridItem variant="full">
    <GridSectionTitle>Rólunk</GridSectionTitle>
</GridItem>
<GridItem variant="aside">
    <VoxPopuliLinksAside />
</GridItem>
<GridItem variant="main">
    <SectionCard>
        <SectionTitle>Vox Populi</SectionTitle>
        <Paragraph>
            A Vox Populi oldal közvélemény-kutatásokkal és (többnyire magyarországi)
            választásokkal kapcsolatos adatokat és elemzéseket közöl pártoktól és pénzbevételtől
            függetlenül, a demokratikus politikai eszmék és gyakorlatok terjesztése mellett
            elkötelezetten. A legfrissebb
            <a href="https://www.facebook.com/valasztasi.kalauz/">rövidebb posztokat itt</a>,
            a hosszabb elemzéseket pedig
            <a href="https://kozvelemeny.wordpress.com/blog-feed/">itt találja meg</a>,
            a jelenleg is aktuális korábbi szövegek javából pedig
            <a href="https://kozvelemeny.org/2022/01/29/orokzold-posztok-a-vox-populin/">itt</a>,
            illetve a 2021. április 2-án indult <a href="https://voxpopuli.444.hu/">https://voxpopuli.444.hu/</a>
            oldalunkon talál egy-egy válogatást.
        </Paragraph>
        <SectionTitle variant="small" hasTopMargin>Ki a szerző?</SectionTitle>
        <Paragraph>
            Munkaidőben a Közép-Európai Egyetem (CEU) kutatóprofesszora vagyok. Szakterületeim a választói magatartás, a kutatás-módszertan, és a választási rendszerek. 1990 óta foglalkozom ezekkel a témákkal, és azóta kb. 40 tudományos célú kérdőíves vizsgálatot vezettem Lengyelországban, Csehországban, Szlovákiában, Magyarországon és Romániában. Idézettségi adataimat <a href="https://scholar.google.com/citations?user=7mLMXH8AAAAJ&amp;hl=en&amp;oi=ao"> itt</a> találja meg. Első olyan cikkeim, amiben mások közvélemény-kutatásait értékeltem, 1998-ban jelentek meg a nyomtatott <a aria-label="Magyar Hirlapban (opens in a new tab)" href="https://web.archive.org/web/20071112095437/http://www.median.hu/object.7293a708-88dd-4f91-b192-d0853aa7f49a.ivy" target="_blank" rel="noreferrer noopener">Magyar Hirlapban</a> és <a aria-label="másutt (opens in a new tab)" href="http://www.personal.ceu.hu/departs/personal/Gabor_Toka/Papers/Toka99Polls.pdf" target="_blank" rel="noreferrer noopener">másutt</a>. Politikai aktivistaként a Közös Ország Mozgalom taktikai szavazást támogató közvélemény-kutatásain és hétpárti támogatottságú választási törvényjavaslatán, illetve választási megfigyelőként, szavazatszámlálóként, utcai és házról-házra kopogtató kampánymunkásként dolgoztam. Egy pártfüggetlen és szakmabeli ellenzéki aktivista perspektívájából írom tehát, ami itt megjelenik, és az olvasók figyelmén kívül semmit nem fogadok el érte.
        </Paragraph>
        <Paragraph>Tóka Gábor</Paragraph>
        <SectionTitle variant="small" hasTopMargin>Ki fejlesztette az oldalt?</SectionTitle>
        <Paragraph>
            Adat- és társadalomtudomány alapszakos hallgató vagyok a CEU-n, emellett fogalkozom webfejlesztéssel
            és kifejezetten érdekel az adatvizualizáció. Korábbi választásokkal kapcsolatos munkáim a Vox Populi
            2024-es amerikai <a target="_blank" href="https://hidegmisi.github.io/us2024_tracker/">közvélemény-kutatás aggregátora</a>
            és egy <a target="_blank" href="https://www.testvot.eu/">vote advice application</a> a 2025-ös román választásokhoz. A
            szakdolgozatom a 2026-os választások szavazatszámlálás alatti, alacsony feldolgozottságnál készített
            eredménybecsléséről fog szólni, erről majd talán a Vox Populi blogon is be fogok számolni.
        </Paragraph>
        <Paragraph>Hideg Mihály, <a href="mailto:hidegmisi@gmail.com">hidegmisi@gmail.com</a> </Paragraph>
    </SectionCard>
</GridItem>

<style lang="scss">
    ul {
        list-style-type: none;
        padding: 0;

        li {
            margin-bottom: 6px;
            font-size: 1rem;

            a {
                color: #3396ff;
            }
        }
    }
</style>
