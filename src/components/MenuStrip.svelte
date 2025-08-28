<script lang="ts">
    import { page } from "$app/state";

    let currentPage = "";

    $: {
        currentPage = page.url.pathname
    }
</script>

<nav class="menuStrip">
    <ul>
        <a href="/" class="desktopOnly"><li class:activePage={page.url.pathname === "/"}>
            <span>Áttekintés</span>
        </li></a>
        <a href="/mandatumbecsles"><li class:activePage={page.url.pathname === "/mandatumbecsles"}>
            <span>Mandátumbecslés</span>
        </li></a>
        <!-- <a href="/terkepek"><li class:activePage={page.url.pathname === "/terkepek"}>
            <span>Térképek</span>
        </li></a> -->
        <a href="//kozvelemeny.org" target="_blank"><li class="externalLink">
            <span>Vox Populi blog</span>
        </li></a>
    </ul>
</nav>

<style lang="scss">
    .menuStrip {
        position: relative;
        display: flex;
        width: 100%;
        margin: 1rem 0;
        margin-top: -1rem;
        border: 1px solid #eee;
        border-top: none;
        background-color: #fff;
        z-index: 3;

        .desktopOnly {
            display: none;
        }
    }

    ul {
        width: 100%;
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        align-items: center;
        list-style: none;
        padding: 0;
    }

    li {
        width: 100%;
        padding: 1rem 6px;
        text-align: center;
        font-weight: 300;

        &.activePage {
            font-weight: 400;
            background-color: #fcfcfc;

            span {
                color: #333;
            }
        }
    }

    a {
        text-decoration: none;
    }

    span {
        color: #666;
    }

    a:hover span {
        text-decoration: underline;
    }

    @media (min-width: 600px) {
        .menuStrip ul {
            grid-template-columns: repeat(3, 1fr);
            .desktopOnly {
                display: block;
            }
        }
    }
</style>