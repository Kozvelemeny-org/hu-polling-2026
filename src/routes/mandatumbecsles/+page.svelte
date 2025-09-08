<script lang="ts">
    import { onMount } from "svelte";
    import {
        fetchData,
        simulationData,
    } from "$stores/dataStore";
    import type { Party, Simulation } from "$lib/types";
    import MandateProjectionAside from "../../components/mandate/MandateProjectionAside.svelte";
    import ParliamentChart from "../../components/mandate/parliament/ParliamentChart.svelte";
    import PartyMandateTable from "../../components/mandate/party/PartyMandateTable.svelte";
    import SectionCard from "../../components/section/SectionCard.svelte";
    import SectionTitle from "../../components/section/SectionTitle.svelte";
    import StickyAside from "../../components/grid/StickyAside.svelte";
    import GridItem from "../../components/grid/GridItem.svelte";
    import SimulationNameSpan from "../../components/mandate/SimulationNameSpan.svelte";
    import PartyProjectionsSection from "$components/mandate/party/PartyProjectionsSection.svelte";
    import OevkSectionCard from "$components/mandateProjection/OEVKSectionCard.svelte";
    import MiniMandateProjection from "$components/mandate/MiniMandateProjection.svelte";
    import GridSectionTitle from "$components/grid/GridSectionTitle.svelte";
    import Paragraph from "$components/grid/Paragraph.svelte";

    let data: Record<string, Simulation> = {};
    let selectedSimulation = "main";

    function selectSimulation(simulation: string) {
        selectedSimulation = simulation;
    }

    onMount(fetchData);

    $: data = $simulationData;
</script>

<StickyAside let:sticky>
    <MandateProjectionAside
        {data}
        {sticky}
        on:selectSimulation={(e) => selectSimulation(e.detail)}
    />
</StickyAside>
<GridItem variant="main">
    <SectionCard id="parliament-chart">
        <SectionTitle>A legvalószínűbb parlament</SectionTitle>
        <p>
            Az alábbi ábrán a <SimulationNameSpan
                >{data[selectedSimulation]?.metadata.name}</SimulationNameSpan
            >
            országos átlaga és az EP-választás választási földrajza alapján szimulált
            országgyűlési választás eredménye látható.
        </p>
        <!-- <ExplainerCard
            image="/images/hungary-shape.webp"
            alt="Választási földrajz"
        >
            A szimuláció azt feltételezi, hogy az EP-választás óta nem változott
            a választási földrajz, de az ellenzéki szavazók nagyobb része szavaz
            majd a Tiszára.
            <a href="#">Módszertan</a>
        </ExplainerCard> -->
        <ParliamentChart {data} {selectedSimulation} />
        <PartyMandateTable data={data[selectedSimulation]?.seats} />
    </SectionCard>
</GridItem>
<!-- <GridItem variant="middle">
    <SectionCard>
        <SectionTitle>{data[selectedSimulation]?.metadata.name}</SectionTitle>
        <p>
            A <SimulationNameSpan>{data[selectedSimulation]?.metadata.name}</SimulationNameSpan> szimuláció az összes kutatóintézet kutatásait
            figyelembe véve, a közvélemény-kutatások 30 napos mozgóátlagára alapul.
        </p>
        <p>
            Ahogy a többi szimuláció, a {data[selectedSimulation]?.metadata.name} is feltételezi,
            hogy az Európai Parlamenti választás óta nem változott a választási földrajz, de az ellenzéki szavazók nagyobb része szavaz majd a Tiszára.
        </p>
    </SectionCard>
</GridItem> -->

<GridItem variant="full">
    <GridSectionTitle>Rövid magyarázat</GridSectionTitle>
</GridItem>
<GridItem variant="left-main" --grid-row="span 2">
    <SectionCard>
        <SectionTitle>Rövid magyarázat</SectionTitle>
        <Paragraph>
            Lorem ipsum, dolor sit amet consectetur adipisicing elit. Nesciunt voluptate expedita similique, eaque magni mollitia dicta aperiam pariatur et accusamus iste quidem eius delectus vitae modi fuga error voluptas nisi. Lorem ipsum dolor sit amet consectetur, adipisicing elit. Rem sunt, eos, eveniet necessitatibus aut doloremque perspiciatis totam adipisci repellat explicabo iusto, consequuntur ullam pariatur officiis nihil minima id natus enim!
        </Paragraph>
        <Paragraph>
            Lorem ipsum, dolor sit amet consectetur adipisicing elit. Nesciunt voluptate expedita similique, eaque magni mollitia dicta aperiam pariatur et accusamus iste quidem eius delectus vitae modi fuga error voluptas nisi. Lorem ipsum dolor sit amet consectetur, adipisicing elit. Rem sunt, eos, eveniet necessitatibus aut doloremque perspiciatis totam adipisci repellat explicabo iusto, consequuntur ullam pariatur officiis nihil minima id natus enim!
        </Paragraph>
        <Paragraph>
            Lorem ipsum, dolor sit amet consectetur adipisicing elit. Nesciunt voluptate expedita similique, eaque magni mollitia dicta aperiam pariatur et accusamus iste quidem eius delectus vitae modi fuga error voluptas nisi. Lorem ipsum dolor sit amet consectetur, adipisicing elit. Rem sunt, eos, eveniet necessitatibus aut doloremque perspiciatis totam adipisci repellat explicabo iusto, consequuntur ullam pariatur officiis nihil minima id natus enim!
        </Paragraph>

        <Paragraph>Több szimuláció és ábra, részletesebb adatok, valamint módszertan a <a href="/mandatumbecsles">mandátumbecslés</a> oldalon.</Paragraph>
    </SectionCard>
</GridItem>
<GridItem variant="right-aside">
    <SectionCard>
        <SectionTitle variant="small">Várható mandátumok</SectionTitle>
        <p>
            A Fidesz és a Tisza képviselőinek várható aránya az EP-választás
            és a friss kutatások átlaga alapján:
        </p>
        <div class="mandatesContainer">
            <article class="visualization">
                <MiniMandateProjection data={data} selectedSimulation={selectedSimulation} />
            </article>
        </div>
        <p>
            Részletes adatok és alakulásuk a <a href="/mandatumbecsles"
                >mandátumbecslés</a
            > oldalon.
        </p>
    </SectionCard>
</GridItem>

<GridItem variant="full">
    <GridSectionTitle>Egyéni választókerületek</GridSectionTitle>
</GridItem>

<GridItem variant="left-main">
    <OevkSectionCard
        data={data[selectedSimulation]?.oevkDiffs}
        simulationName={data[selectedSimulation]?.metadata.name}
    />
</GridItem>
<GridItem variant="right-aside">
    <SectionCard>
        <SectionTitle variant="small">Hogy jön ez ki?</SectionTitle>
        <Paragraph>Lorem ipsum, dolor sit amet consectetur adipisicing elit. Dignissimos facilis omnis, repellendus, est quia doloremque rem consequuntur perferendis blanditiis pariatur iusto deleniti quibusdam vel libero voluptatum. Dicta eos eveniet maxime!</Paragraph>
        <Paragraph>Lorem ipsum, dolor sit amet consectetur adipisicing elit. Dignissimos facilis omnis, repellendus, est quia doloremque rem consequuntur perferendis blanditiis pariatur iusto deleniti quibusdam vel libero voluptatum. Dicta eos eveniet maxime!</Paragraph>
    </SectionCard>
</GridItem>


<GridItem variant="main">
    <PartyProjectionsSection {data} {selectedSimulation} />
</GridItem>