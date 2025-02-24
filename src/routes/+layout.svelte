<script lang="ts">
    import Footer from "../components/Footer.svelte";
    import Header from "../components/Header.svelte";
    import MenuStrip from "../components/MenuStrip.svelte";
    import "../global.scss";
</script>

<article id="appContainer">
    <Header />
    <MenuStrip />
    <div id="mainGrid">
        <slot/>
    </div>
    <Footer />
</article>

<style lang="scss">
#appContainer {
    width: 100%;
    max-width: 1000px;
    margin: 0 auto;
    padding: 8px 16px;
    padding-bottom: 40vh;
}

#mainGrid {
    display: grid;
    grid-template-columns: 1fr;
    grid-template-rows: min-content 1fr;
    gap: 1rem;

    & > aside {
        padding: 0 6px;
        grid-column: 1;
    }
}

@media (min-width: 600px) {
    #mainGrid {
        grid-template-columns: 250px minmax(150px, 1fr);
    }
}

@media (min-width: 800px) {
    #mainGrid {
        grid-template-columns: 250px minmax(110px, 1fr) minmax(110px, 1fr) 250px;
    }
}
</style>