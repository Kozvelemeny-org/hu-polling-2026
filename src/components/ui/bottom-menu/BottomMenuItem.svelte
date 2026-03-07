<script lang="ts">
    import { onMount } from "svelte";

    export let link = null as string | null;

    let absoluteUrl = null as string | null;
    let mounted = false;

    onMount(() => mounted = true);

    $: if (link && mounted) {
        absoluteUrl = new URL(link, document.location.origin).toString();
    }
</script>

<div class="item">
    {#if link}
        <a href={absoluteUrl}>
            <slot />
        </a>
    {:else}
        <slot />
    {/if}
</div>

<style lang="scss">
    .item {
        font-size: 14px;
        padding: 5px 10px;
        border: 2px solid #f5f5f5;
        background-color: #f9f9f9;
        border-radius: 20px;
        cursor: pointer;

        &:hover {
            background-color: #f5f5f5;
        }

        a {
            text-decoration: none;
        }
    }
</style>