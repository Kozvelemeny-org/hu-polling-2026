<header id="mainHeader">
    <img class="headerImage" src="/images/bg.png" alt="header" />
    <h1>
        <span><a href="https://kozvelemeny.org" target="_blank">Vox Populi:</a></span>
        <span>Választás 2026</span>
    </h1>
</header>

<style lang="scss">
header {
    position: relative;
    display: flex;
    align-items: end;
    justify-content: center;
    margin-bottom: 1rem;
    padding: 8px 16px;
    height: 160px;
    background-color: #fff;
    z-index: 4;
}
header img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    object-position: 0 10%;
    position: absolute;
    top: 0;
    left: 0;
    z-index: -1;
}
header h1 {
    font-size: 2rem;
    background-color: #fff;
    color: #333;
    padding: 0 12px;
}

header h1 span {
    padding: 2px;
    font-weight: 400;

    &:first-child {
        font-weight: 400;
    }

    a {
        text-decoration: none;
    }
}

@media (max-width: 500px) {
    header {
        padding: 8px;

        h1 {
            font-size: 1rem;
        }
    }
}
</style>