<script lang="ts">
    export let noMargin = false;
</script>

<div class="bottomMenu" class:noMargin={noMargin}>
    <slot />
</div>

<style lang="scss">
    .bottomMenu {
        margin-top: 1rem;

        &.noMargin {
            margin-top: 0;
        }

        display: flex;
        gap: 6px;
    }
</style>
