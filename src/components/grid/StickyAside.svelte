<script lang="ts">
    import { onMount, onDestroy } from "svelte";

    let aside: HTMLElement;
    let placeholder: HTMLElement;
    let sticky = false;
    let headerHeight = 0;
    let asideWidth = 0;
    let initialAsideHeight = 0;

    function detectHeaderHeight() {
        if (typeof window === 'undefined') return;
        
        // Find the header element - adjust selector as needed for your header
        const header = document.querySelector('header') || document.querySelector('.header') || document.querySelector('[data-header]');
        if (header) {
            headerHeight = (header as HTMLElement).offsetHeight;
        } else {
            // Fallback: try to detect from common header patterns
            const possibleHeaders = document.querySelectorAll('nav, .nav, .navigation, .header, header');
            if (possibleHeaders.length > 0) {
                headerHeight = Math.max(...Array.from(possibleHeaders).map(el => (el as HTMLElement).offsetHeight));
            } else {
                // Ultimate fallback
                headerHeight = 160 + 55;
            }
        }
    }

    function detectAsideWidth() {
        if (!aside || typeof window === 'undefined') return;
        
        // Get the parent container width or use viewport width
        const parent = aside.parentElement;
        if (parent) {
            const parentRect = parent.getBoundingClientRect();
            asideWidth = parentRect.width;
        } else {
            asideWidth = window.innerWidth;
        }
    }

    function keepAsidePosition() {
        if (!aside || typeof window == 'undefined') return;

        // Use the initial (non-sticky) aside height for the sticky threshold, otherwise the
        // threshold changes when the aside collapses to a compact sticky header.
        const shouldBeSticky =
            window.scrollY > headerHeight + 16 + initialAsideHeight && window.innerWidth > 600;
                
        if (shouldBeSticky) {
            aside.style.position = "fixed";
            aside.style.top = "0";
            aside.style.width = `${asideWidth}px`;
            
            // Show placeholder to maintain layout
            if (placeholder) {
                placeholder.style.display = "block";
                placeholder.style.height = `${initialAsideHeight}px`;
            }
        } else {
            aside.style.position = "static";
            aside.style.width = "auto";
            
            // Hide placeholder when not sticky
            if (placeholder) {
                placeholder.style.display = "none";
            }
        }
        
        sticky = shouldBeSticky;
    }

    function handleResize() {
        detectHeaderHeight();
        detectAsideWidth();
        keepAsidePosition();
    }

    onMount(() => {
        detectHeaderHeight();
        detectAsideWidth();
        
        // Store initial height before any sticky behavior
        if (aside) {
            initialAsideHeight = aside.offsetHeight;
        }
        
        keepAsidePosition();
        
        window.addEventListener("scroll", keepAsidePosition);
        window.addEventListener("resize", handleResize);

        return () => {
            window.removeEventListener("scroll", keepAsidePosition);
            window.removeEventListener("resize", handleResize);
        };
    });
</script>

{#if globalThis?.window?.innerWidth > 600}
    <aside bind:this={aside} class="grid-item aside" class:sticky>
        <slot {sticky} />
    </aside>
    <!-- Placeholder to prevent layout shift when aside becomes sticky -->
    <div bind:this={placeholder} class="placeholder" style="display: none;"></div>
{/if}

<style lang="scss">
    .grid-item.aside {
        grid-column: 1 / -1;
        height: min-content;

        &.sticky {
            z-index: 3;
        }
    }

    .placeholder {
        grid-column: 1 / -1;
        width: 100%;
        pointer-events: none;
    }

    @media (min-width: 600px) {
        .grid-item.aside {
            grid-column: 1 / 2;
        }
        
        .placeholder {
            grid-column: 1 / 2;
        }
    }
</style>
