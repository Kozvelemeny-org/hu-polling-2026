<script lang="ts">
    export let variant = "featured" as "featured" | "big" | "medium" | "small";
</script>

<h2 class={variant}>
    <slot />
</h2>

<style lang="scss">
    h2 {
        font-weight: 400;
        font-size: 22px;

        &.featured {
            font-size: 26px;
            font-weight: 500;
        }

        &.big {
            font-size: 26px;
        }

        &.medium {
            font-size: 22px;
        }

        &.small {
            font-size: 20px;
        }
    }
</style>
