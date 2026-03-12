<script lang="ts">
    type Variant = "aside" | "right-aside" | "main" | "left-main" | "full";

    export let variant: Variant = "main";
</script>

<div class="grid-item {variant}">
    <slot />
</div>

<style lang="scss">
    .grid-item {
        grid-column: 1 / -1;
        grid-row: var(--grid-row);
        height: fit-content;
    }

    @media (min-width: 600px) {
        .grid-item.aside {
            grid-column: 1 / 2;
        }
        .grid-item.right-aside {
            grid-column: 3 / 4;
        }
        .grid-item.main {
            grid-column: 2 / 4;
        }
        .grid-item.left-main {
            grid-column: 1 / 3;
        }
    }

    @media (min-width: 800px) {
        .grid-item.aside {
            grid-column: 1 / 2;
        }
        .grid-item.right-aside {
            grid-column: 4 / 5;
        }
        .grid-item.main {
            grid-column: 2 / 5;
        }
        .grid-item.left-main {
            grid-column: 1 / 4;
        }
        .grid-item.full {
            grid-column: 1 / -1;
        }
    }
</style>
