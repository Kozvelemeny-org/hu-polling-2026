<script lang="ts">
    export let description = false;
</script>

<div class="inline-chart-label" class:description>
    <slot />
</div>

<style lang="scss">
.inline-chart-label {
    font-size: 14px;
    font-weight: 400;
    margin-bottom: 12px;
    font-family: "Helvetica Neue", sans-serif;

    &.description {
        font-size: 12px;
        margin-top: 12px;
        margin-bottom: 0;
        color: #666;

        :global(p) {
            font-size: 12px;
            color: #666;
            margin-top: 12px;
            margin-bottom: 0;
            font-family: "Helvetica Neue", sans-serif;
        }
    }

    :global(p) {
        font-size: 14px;
        margin-bottom: 12px;
        font-family: "Helvetica Neue", sans-serif;
    }
}
</style>