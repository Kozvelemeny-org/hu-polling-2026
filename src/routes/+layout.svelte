<script lang="ts">
    import { page } from "$app/state";
    import { PUBLIC_DATA_BASE_URL } from "$env/static/public";

    const faviconHref = (PUBLIC_DATA_BASE_URL ?? '').replace(/\/$/, '') + '/favicon.png';
    $: isEmbed = page.url.pathname.includes('/embed');
</script>

<svelte:head>
    <link rel="icon" href={faviconHref} />
</svelte:head>

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
