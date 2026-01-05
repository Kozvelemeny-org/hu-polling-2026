<script lang="ts">
    export let noMargin = false;
</script>

<div class="chart-card" class:noMargin={noMargin}>
    <slot />
</div>

<style lang="scss">
    .chart-card {
        padding: 8px 1rem;
        width: 100%;
        margin: 12px auto;

        &.noMargin {
            margin: 0 auto;
        }

        background-color: #f9f9f9;
        border: 2px solid #f5f5f5;
    }
</style>