<script lang="ts">
    import { staticBase } from '$lib/staticAssets';
    import SectionCard from "$components/section/SectionCard.svelte";
    import SectionTitle from "$components/section/SectionTitle.svelte";
    import Paragraph from "./grid/Paragraph.svelte";
</script>

<SectionCard>
    <SectionTitle variant="small">Linkek</SectionTitle>
    <div class="linksContainer">
        <a href="https://www.facebook.com/valasztasi.kalauz" target="_blank">
            <article>
                <div class="iconContainer">
                    <img src="{staticBase}/images/vox-populi/facebook.webp" alt="Facebook">
                </div>
                <Paragraph noMargin>A legfrissebb rövidebb posztok a Facebookon.</Paragraph>
            </article>
        </a>
        <a href="https://kozvelemeny.org" target="_blank">
            <article>
                <div class="iconContainer">
                    <img src="{staticBase}/images/vox-populi/vox-populi.webp" alt="Website">
                </div>
                <Paragraph noMargin>Hosszabb elemzések a weboldalukon.</Paragraph>
            </article>
        </a>
        <a href="https://voxpopuli.444.hu" target="_blank">
            <article>
                <div class="iconContainer">
                    <img src="{staticBase}/images/vox-populi/444.svg" alt="444.hu">
                </div>
                <Paragraph noMargin>Válogatott posztok a 444-es blogunkon.</Paragraph>
            </article>
        </a>
    </div>
</SectionCard>

<style lang="scss">
    .linksContainer {
        display: flex;
        flex-direction: column;
        gap: 1rem;
        margin-top: 6px;

        a {
            text-decoration: none;
            color: unset;
        }

        article {
            display: flex;
            align-items: center;
            gap: 1rem;

            .iconContainer {
                min-width: 32px;
                height: 32px;

                img {
                    width: 100%;
                    height: 100%;
                    object-fit: contain;
                }
            }
        }
    }
</style>