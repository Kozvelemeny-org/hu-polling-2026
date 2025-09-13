<script lang="ts">
    import type { MandateProjectionData, PollData, Simulation } from "$lib/types";
    import { onMount } from "svelte";
    import {
        pollData,
        simulationData,
        fetchData,
        mandateProjectionData,
    } from "$stores/dataStore";
    import RecentPollsAside from "$components/poll/RecentPollsAside.svelte";
    import MiniMandateProjection from "$components/mandate/MiniMandateProjection.svelte";
    import PollsCardFromData from "$components/poll/PollsCardFromData.svelte";
    import SectionCard from "$components/section/SectionCard.svelte";
    import SectionTitle from "$components/section/SectionTitle.svelte";
    import GridItem from "$components/grid/GridItem.svelte";
    import GridSectionTitle from "$components/grid/GridSectionTitle.svelte";
    import SimulationNameSpan from "$components/mandate/SimulationNameSpan.svelte";
    import ExplainerCard from "$components/section/ExplainerCard.svelte";
    import BottomMenu from "$components/ui/bottom-menu/BottomMenu.svelte";
    import BottomMenuItem from "$components/ui/bottom-menu/BottomMenuItem.svelte";
    import OevkSectionCard from "$components/mandateProjection/OEVKSectionCard.svelte";
    import Paragraph from "$components/grid/Paragraph.svelte";

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
</script>

<GridItem variant="aside">
    <RecentPollsAside pollData={data.sure_voters} selectedGroup="big_parties" nItems={6} />
</GridItem>
<GridItem variant="main">
    <PollsCardFromData {data} chart_id="fidesz-tisza" />
</GridItem>

<GridItem variant="full">
    <GridSectionTitle>A Vox Populi mandátumbecslése</GridSectionTitle>
</GridItem>

<GridItem variant="aside">
    <SectionCard>
        <SectionTitle variant="medium" centered>Várható eredmény</SectionTitle>
        <Paragraph>
            A Fidesz és a Tisza képviselőinek várható aránya az EP-választás
            és a friss kutatások átlaga alapján:
        </Paragraph>
        <MiniMandateProjection data={data.simulationData} />
        <Paragraph>
            Részletes adatok és alakulásuk a <a href="/mandatumbecsles"
                >mandátumbecslés</a
            > oldalon.
        </Paragraph>
        <BottomMenu>
            <BottomMenuItem>Módszertan</BottomMenuItem>
        </BottomMenu>
    </SectionCard>
</GridItem>
<GridItem variant="main">
    <PollsCardFromData {data} chart_id="mandate-projection" />
</GridItem>


<GridItem variant="full">
    <GridSectionTitle>A kis pártok támogatottsága</GridSectionTitle>
</GridItem>
<GridItem variant="aside">
    {#if data.sure_voters.length > 0}
        <RecentPollsAside pollData={data.sure_voters} selectedGroup="small_parties" />
    {/if}
</GridItem>
<GridItem variant="main">
    <PollsCardFromData {data} chart_id="kis-partok" />
</GridItem>

<GridItem variant="full">
    <GridSectionTitle>Rólunk</GridSectionTitle>
</GridItem>
<GridItem variant="aside">
    <SectionCard>
        <SectionTitle variant="small">Linkek</SectionTitle>
        <ul>
            <li>
                <a href="https://www.facebook.com/valasztasi.kalauz">Választási Kalauz Facebook</a><br>
                A legfrissebb rövidebb posztok a Facebookon.
            </li>
            <li>
                <a href="https://kozvelemeny.org">Közvélemény.org</a><br>
                Hosszabb elemzések a weboldalukon.
            </li>
            <li>
                <a href="https://voxpopuli.444.hu">Vox Populi a 444-en</a><br>
                Válogatott posztok a 444-es blogunkon.
            </li>
        </ul>
    </SectionCard>
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
        <Paragraph>@ Tóka Gábor, 2019-</Paragraph>
        <SectionTitle variant="small" hasTopMargin>Ki fejlesztette az oldalt?</SectionTitle>
        <Paragraph>
            Én.
        </Paragraph>
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
