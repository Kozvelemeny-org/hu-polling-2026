<script>
    export let inactive = false;
</script>

<span class:inactive>
    <slot />
</span>

<style lang="scss">
    span {
        padding: 3px;
        border-radius: 4px;
        border: 1px solid #6de635;
        font-family: 'Helvetica Neue', sans-serif;
        white-space: nowrap;

        &.inactive {
            border-color: #eee;
            font-weight: 300;
        }
    }
</style>