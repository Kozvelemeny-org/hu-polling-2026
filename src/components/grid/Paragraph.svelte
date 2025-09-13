<script lang="ts">
    export let noMargin = false;
</script>

<p class:noMargin={noMargin}>
    <slot />
</p>

<style lang="scss">
    p {
        margin-top: 12px;

        &.noMargin {
            margin-top: 0;
        }
    }
</style>