<script lang="ts">
    import { createEventDispatcher, onMount, onDestroy } from "svelte";
    import { fade, slide } from "svelte/transition";

    export let open = false;
    export let disableCloseOnBackdrop = false;

    const dispatch = createEventDispatcher();

    let previousBodyOverflow: string | null = null;

    function close() {
        if (!open) return;
        open = false;
        dispatch("close");
    }

    function onKeydown(event: KeyboardEvent) {
        if (event.key === "Escape") {
            close();
        }
    }

    function lockScroll() {
        if (typeof document === "undefined") return;
        if (previousBodyOverflow === null) {
            previousBodyOverflow = document.body.style.overflow || "";
        }
        document.body.style.overflow = "hidden";
    }

    function unlockScroll() {
        if (typeof document === "undefined") return;
        if (previousBodyOverflow !== null) {
            document.body.style.overflow = previousBodyOverflow;
            previousBodyOverflow = null;
        }
    }

    $: if (open) {
        lockScroll();
    } else {
        unlockScroll();
    }

    onMount(() => {
        if (typeof window !== "undefined") {
            window.addEventListener("keydown", onKeydown);
        }

        return () => {
            if (typeof window !== "undefined") {
                window.removeEventListener("keydown", onKeydown);
            }
            unlockScroll();
        };
    });
</script>

{#if open}
    <div class="bottomSheetPortal" aria-modal="true" role="dialog">
        <div
            role="button"
            tabindex="0"
            on:click={() => {
                if (!disableCloseOnBackdrop) close();
            }}
            on:keydown={(event: KeyboardEvent) => {
                if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    if (!disableCloseOnBackdrop) close();
                }
            }}
            transition:fade
        ></div>
        <div class="sheetContainer" transition:slide|local={{ duration: 180 }}>
            <div class="sheetContent">
                <slot />
            </div>
        </div>
    </div>
{/if}

<style lang="scss">
    .bottomSheetPortal {
        position: fixed;
        inset: 0;
        z-index: 40;
        display: flex;
        justify-content: center;
        align-items: flex-end;
        pointer-events: none;
    }

    .backdrop {
        position: absolute;
        inset: 0;
        background-color: rgba(0, 0, 0, 0.32);
        pointer-events: auto;
    }

    .sheetContainer {
        position: relative;
        width: 100%;
        max-width: 720px;
        margin: 0 auto;
        background-color: #ffffff;
        border-radius: 16px 16px 0 0;
        box-shadow: 0 -4px 24px rgba(0, 0, 0, 0.18);
        pointer-events: auto;
        padding-bottom: max(env(safe-area-inset-bottom, 0px), 12px);
    }

    .sheetContent {
        max-height: min(70vh, 520px);
        overflow-y: auto;
        padding: 8px 16px 0 16px;
    }

    @media (min-width: 768px) {
        .sheetContainer {
            border-radius: 12px;
            max-height: 80vh;
        }
    }
</style>

