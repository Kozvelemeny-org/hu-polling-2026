<script lang="ts">
    import { onMount, onDestroy } from "svelte";

    let aside: HTMLElement;
    let sticky = false;
    const headerHeight = 160 + 55;

    function keepAsidePosition() {
        if (!aside || typeof window == 'undefined') return;

        const asideHeight = aside.offsetHeight;
        const shouldBeSticky = window.scrollY > headerHeight + 16 + asideHeight && window.innerWidth > 600;
                
        if (shouldBeSticky) {
            aside.style.position = "fixed";
            aside.style.top = "0";
            aside.style.width = "968px";
        } else {
            aside.style.position = "static";
            aside.style.width = "auto";
        }
        
        sticky = shouldBeSticky;
    }

    onMount(() => {
        keepAsidePosition();
        window.addEventListener("scroll", keepAsidePosition);
        window.addEventListener("resize", keepAsidePosition);

        return () => {
            window.removeEventListener("scroll", keepAsidePosition);
            window.removeEventListener("resize", keepAsidePosition);
        };
    });
</script>

<aside bind:this={aside} class="grid-item aside" class:sticky>
    <slot {sticky} />
</aside>

<style lang="scss">
    .grid-item.aside {
        grid-column: 1 / -1;
        height: min-content;

        &.sticky {
            z-index: 3;
        }
    }

    @media (min-width: 600px) {
        .grid-item.aside {
            grid-column: 1 / 2;
        }
    }
</style>
