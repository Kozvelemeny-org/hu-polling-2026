import type { ChartData } from "./types";

export const EXPLAINER_ARTICLE_LINK = "https://kozvelemeny.org/2024/12/25/a-valasztasi-kozvelemeny-kutatasok-allasa-a-2026-ra-vart-orszaggyulesi-valasztasok-elott/";
export const DOCS_WITH_LINKS_LINK = "https://docs.google.com/document/d/1_Oay2Jg4W16CY_ySoUAJHDchWAYdq7vSgqYmv4YI0G0/edit?tab=t.0"

export const charts: Record<string, ChartData> = {
    // Homepage
    'fidesz-tisza': {
        featured: true,
        title: "A Fidesz és a Tisza versenyfutása",
        selectedParties: ["tisza", "fidesz", "unsure"],
        dataSelects: ["pollster_group", "voter_type"],
        dateRange: { start: new Date(2023, 11, 1), end: new Date(2026, 3, 13) },
        annotations: [
            {
                id: "marc-15",
                text: "Március 15.",
                date: new Date(2024, 2, 15),
                lineType: "dotted",
            },
            {
                id: "ep-24",
                text: "EP 2024",
                date: new Date(2024, 5, 9),
                lineType: "dotted",
            },
            {
                id: "ogy-26",
                text: "OGY 2026",
                date: new Date(2026, 3, 12),
                lineType: "dotted",
            },
        ],
        renderOptions: { aspectRatio: 3 / 2, yLims: [0, 0.69] },
        description: `
            <p>
                A fenti ábra TISZA Párt színrelépésétől a mai napig egy-egy ponttal mutatja
                az összes a sajtóban megjelent választási közvélemény-kutatás eredményét a TISZA
                és a Fidesz aktuális szavazatarányáról (a levélszavazatok nélkül). Az itt
                megjelenő százalékok átlagolják az „összes pártot választókra”, illetve a „biztos
                szavazó pártot választókra” vonatkozóan megjelent számokat, mert a korábbi országos
                választások tapasztalatai szerint a kettő átlaga legjobb tipp.
            </p>
            <p>
                A bal oldalt látható “A legfrissebb adatok” táblázat a legutóbb megjelent megjelent
                kutatásokra nézve mutatja ezeket az átlagokat. Az összes 2018 óta megjelent kutatások
                nyers adatait
                <a
                    href="https://drive.google.com/drive/folders/1IVTl_cXGcOfDf8vt03MrwDsNa41Xb8a0"
                    target="_blank"
                >itt</a>
                osztjuk meg mindenkivel.
            </p>
            <p>
                Kormányközelinek (narancsgazdagnak) a következő intézetek kutatásait tekintjük:
                Alapjogokért Központ, Nézőpont, Reál-PR 93, Századvég, Társadalomkutató.
                Az index.hu-n havonta publikáló  McLaughlin & Associates adatait minden jel
                szerint a Századvég, a XXI. Század Intézetét pedig a Nézőpont gyűjti és dolgozza
                fel, ezért azokat Századvég, illetve Nézőpont vizsgálatoknak könyveljük el.
                Minden más kutatót a kormányfüggetlen (narancsmentes) csoportba sorolunk.
            </p>
            <p>
                A Vox Populi saját becslése a kormányfüggetlen intézetek adataiból indul ki, de az
                időközi választások eredményei, az ELTE Társadalomtudományi Kutatóközpont őszi
                vizsgálata, és egyéb megfigyelések alapján korrigálja (a részleteket lásd
                <a href="${EXPLAINER_ARTICLE_LINK}" target="_blank">itt</a>)
            </p>
        `
    },
    'mandate-projection-chart': {
        title: "Mandátumbecslések alakulása",
        dataSelects: ["pollster_group"],
        selectedParties: ["fidesz", "tisza"],
        dateRange: { start: new Date(2023, 11, 1), end: new Date(2026, 3, 13) },
        annotations: [
            {
                id: "ogy-26",
                text: "OGY 2026",
                date: new Date(2026, 3, 12),
                lineType: "dotted",
            }
        ],
        isMandateProjection: true,
        renderOptions: { aspectRatio: 3 / 2 },
        description: `
            <p>
                Ez az ábra a megelőzőben látható szavazatarány-becsléseket fordítja át
                mandátumbecslésekké az <a href="${EXPLAINER_ARTICLE_LINK}" target="_blank">itt</a>
                részletesen leírt adatok és feltevések felhasználásával. A bal oldalt látható “A
                legfrissebb adatok” táblázat a legutóbb megjelent kutatásokra nézve mutat be
                ugyanilyen számításokat. További részletek a mandátumszámításaink eredményeiről
                (egyéni és listás mandátumok száma pártonként, győzteskompenzáció hatása,
                különböző parlamenti többségek valószínűsége, illetve minden szám statisztikai
                hibahatára) érhetők el <a href="${DOCS_WITH_LINKS_LINK}" target="_blank">itt</a>,
                valamint a fenti menüben a “Mandátumbecslés” illetve a “Részletes becslés” pontra
                ráklikkelve.
            </p>
        `
    },
    'all-parties': {
        title: "Parlamentbe jutásra esélyes pártok támogatottsága",
        selectedParties: ["tisza", "fidesz", "dk", "mihazank", "mkkp", "momentum"],
        dataSelects: ["pollster_group", "voter_type"],
        dateRange: { start: new Date(2018, 0, 1), end: new Date(2026, 3, 13) },
        annotations: [
            {
                id: "ogy-18",
                text: "OGY. 2018",
                date: new Date(2018, 3, 8),
                lineType: "dotted",
            },
            {
                id: "ogy-22",
                text: "OGY. 2022",
                date: new Date(2022, 3, 3),
                lineType: "dotted",
            },
            {
                id: "ogy-26",
                text: "OGY. 2026",
                date: new Date(2026, 3, 12),
                lineType: "dotted",
            },
        ],
        renderOptions: { aspectRatio: 3 / 2, yLims: [0, 0.59] },
    },
    'kis-partok': {
        title: "A kis pártok támogatottsága",
        dataSelects: ["pollster_group"],
        selectedParties: ["mkkp", "mihazank", "dk"],
        dateRange: { start: new Date(2023, 11, 1), end: new Date() },
        annotations: [
            {
                id: "ep-24",
                text: "EP 2024",
                date: new Date(2024, 5, 9),
                lineType: "dotted",
            },
            {
                id: "ogy-26",
                text: "OGY 2026",
                date: new Date(2026, 3, 12),
                lineType: "dotted",
            }
        ],
        renderOptions: { aspectRatio: 3 / 2, yLims: [0, 0.23], showEntryTreshold: true },
        description: `
            <p>
                Az ábra a Demokratikus Koalíció, a Magyar Kétfarkú Kutyapárt és Mi Hazánk
                szavazatarányára vonatkozó becsléseket mutatja be az összes nyilvános
                közvélemény-kutatás adatai alapján. Az egyes pártok mandátumszerzési esélyét
                külön ábrában is megmutatjuk a “Mandátumbecslések” menüpontunkra klikkelve
                elérhető oldalunk alján. Minden további részletre ld. feljebb “A TISZA és a
                Fidesz versenyfutása” című ábránk alatti magyarázatokat.
            </p>
        `
    },
}