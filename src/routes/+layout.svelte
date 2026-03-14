<script lang="ts">
    import { page } from "$app/state";

    $: isEmbed = page.url.pathname.includes('/embed');
</script>

{#if isEmbed}
    <div class="embed-root">
        <slot />
    </div>
{:else}
    {#await import('$components/MainLayout.svelte')}
        <div></div>
    {:then mod}
        <svelte:component this={mod.default}>
            <slot />
        </svelte:component>
    {/await}
{/if}

<style>
    .embed-root {
        min-height: 0;
    }
</style>
