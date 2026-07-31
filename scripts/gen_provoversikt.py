#!/usr/bin/env python3
"""Regenererar PROV-arrayen i provoversikt.html ur json/glosor.json.

Provöversikten (Inför provet) bär en inbäddad snapshot av gloslistan precis som
spelvyerna — den läser inte json/ vid runtime. Kör efter varje ändring i glosor.json
som rör orden i "prov"-listan:

    python3 scripts/gen_provoversikt.py

Punkt 4 i ORDKUNSKAP 1-10 (seminarier/seminarium-9/ORDKUNSKAP 1-10.pdf) grupperar de
~70 provorden i sex kategorier. Oskars kategorier mappar INTE 1:1 mot glosor.json:s
'ordklass'-fält (subjunktionerna ὅτι/ὅτε/ὡς/ἐπεί/εἰ ligger spridda på partikel/
pron.adv/konjunktion; "blandade småord" är ingen ordklass), så kategori + ordning
styrs av den handhållna KATEGORIER-kartan nedan — författad ur PDF:en. Glosorna (sv)
kommer däremot alltid ur mastern, så översättningarna kan aldrig driva.

Validering: varje ord i "prov"-listan måste ligga i exakt en kategori, annars faller
skriptet. Lägger man till ett nytt provord i glosor.json utan att kategorisera det här
smäller generatorn — precis så drift fångas.
"""
import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
MASTER = ROOT / "json" / "glosor.json"
SIDA = ROOT / "provoversikt.html"

# Oskars sex kategorier, i PDF:ens ordning. Varje lista är lemman i PDF:ens ordning.
KATEGORIER = [
    ("Subjunktioner", [
        "ὅτι", "ὅτε", "ὡς", "ἐπεί", "εἰ",
    ]),
    ("Verb", [
        "ἀκολουθέω", "ἀκούω", "ἀποστέλλω", "βαπτίζω", "βλέπω", "γράφω", "δίδωμι",
        "εἰμί", "καλέω", "κηρύσσω", "λαλέω", "λέγω", "λύω", "πέμπω", "πιστεύω", "ποιέω",
    ]),
    ("Substantiv", [
        "ἀδελφή", "ἀδελφός", "ἄγγελος", "ἀνήρ", "ἄνθρωπος", "ἀπόστολος", "ἀρχή",
        "βαπτιστής", "δοῦλος", "ἐκκλησία", "ἔργον", "ζωή", "θεός", "ἱερόν", "κύριος",
        "λόγος", "μαθητής", "μήτηρ", "ὁδός", "οἶκος", "οὐρανός", "ὄρος", "τέκνον",
        "ὕδωρ", "υἱός", "πατήρ", "πλοῖον", "πνεῦμα", "προφήτης", "φῶς",
    ]),
    ("Adjektiv", [
        "ἀγαθός", "ἅγιος", "δίκαιος", "μέγας", "πᾶς", "πολύς", "πονηρός",
    ]),
    ("Prepositioner", [
        "ἐν", "εἰς", "ἐκ", "περί", "πρός", "σύν",
    ]),
    ("Blandade småord", [
        "γάρ", "δέ", "καί", "μή", "οὐ", "εὖ",
    ]),
]

# Kort ledtext per kategori (författad, inte ur mastern).
NOTER = {
    "Subjunktioner": "Inleder bisatser. Lär in dem tillsammans med bisatskortet.",
    "Verb": "Grundbetydelsen räcker — böjningsformerna testas i punkt 3.",
    "Substantiv": "Kan artikeln (= genus) och grundbetydelsen.",
    "Adjektiv": "μέγας, πᾶς och πολύς böjs oregelbundet — se de egna korten.",
    "Prepositioner": "Betydelsen skiftar med kasus — se prepositionskortet.",
    "Blandade småord": "Vanliga men lätta att blanda ihop.",
}

# Grekisk visning där PDF:en avviker från lemmat (varianter Oskar räknar upp).
DISPLAY = {
    "ἐκ": "ἐκ / ἐξ",
    "οὐ": "οὐ (οὐκ, οὐχ)",
}

ARTIKEL = {"m": "ὁ", "f": "ἡ", "n": "τό"}


def main():
    glosor = json.loads(MASTER.read_text())["glosor"]
    prov = {x["lemma"]: x for x in glosor if "prov" in (x.get("listor") or [])}

    kategoriserade = {l for _, lemman in KATEGORIER for l in lemman}
    saknas = set(prov) - kategoriserade
    om_mycket = kategoriserade - set(prov)
    if saknas:
        raise SystemExit(
            "Provord i glosor.json utan kategori i gen_provoversikt.py: "
            + ", ".join(sorted(saknas))
        )
    if om_mycket:
        raise SystemExit(
            "Kategoriserade lemman som inte längre är 'prov' i glosor.json: "
            + ", ".join(sorted(om_mycket))
        )

    grupper = []
    for namn, lemman in KATEGORIER:
        ord = []
        for lemma in lemman:
            x = prov[lemma]
            grek = DISPLAY.get(lemma, lemma)
            # Substantiv visas med artikel (= genus), som på Oskars provblad.
            if x.get("ordklass") == "substantiv" and x.get("genus") in ARTIKEL:
                grek = f"{ARTIKEL[x['genus']]} {grek}"
            ord.append({"grek": grek, "sv": x["glosa"]})
        grupper.append({"kat": namn, "not": NOTER[namn], "ord": ord})

    block = "const PROV = [\n" + "\n".join(
        "  " + json.dumps(g, ensure_ascii=False) + "," for g in grupper
    ).rstrip(",") + "\n];"

    src = SIDA.read_text()
    ny, n = re.subn(r"const PROV = \[.*?\n\s*\];", lambda m: block, src, count=1, flags=re.S)
    if not n:
        raise SystemExit("Hittade ingen 'const PROV = [...]' i provoversikt.html")
    SIDA.write_text(ny)

    antal = sum(len(g["ord"]) for g in grupper)
    print(f"Skrev {antal} provord i {len(grupper)} kategorier till {SIDA.name}.")


if __name__ == "__main__":
    main()
