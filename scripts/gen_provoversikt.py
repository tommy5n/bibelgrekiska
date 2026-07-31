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
import unicodedata
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
MASTER = ROOT / "json" / "glosor.json"
SIDA = ROOT / "provoversikt.html"
UTSKRIFT = ROOT / "provoversikt-utskrift.html"

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

AKUT = "́"
VOKALER = set("αεηιουω")


def oxyton(ord):
    """True om nominativ har akut på ultima (sista vokalen bär akut).

    Oxytona 1:a/2:a-dekl-ord får CIRKUMFLEX i genitiv (θεός→θεοῦ, ἀρχή→ἀρχῆς),
    paroxytona behåller akut (λόγος→λόγου). Perispomena (cirkumflex på ultima)
    finns inte bland dessa nominativer, så det räcker att leta akut.
    """
    d = unicodedata.normalize("NFD", ord)
    baser = []  # [(basbokstav, kombinerande tecken)]
    for ch in d:
        if unicodedata.combining(ch):
            if baser:
                baser[-1][1] += ch
        else:
            baser.append([ch, ""])
    for bas, tecken in reversed(baser):
        if bas.lower() in VOKALER:
            return AKUT in tecken
    return False


def genitiv_display(x):
    """Genitiv att visa efter substantivets lemma, eller None.

    Lagrad 'genitiv' (oförutsägbar 3:e-dekl-stam) har företräde och visas som HEL
    form (ἀνδρός, φωτός). Regelbunden 1:a/2:a dekl härleds till en ÄNDELSE (-οῦ, -ης)
    ur nominativändelsen + oxytonregeln — lagras aldrig i mastern (härledbar).
    """
    if x.get("genitiv"):
        return x["genitiv"]
    lemma = x["lemma"]
    ox = oxyton(lemma)
    # Ändelsen matchas mot en ACCENTSTRIPPAD form — annars missar endswith de
    # oxytona orden vars sista vokal är förkomponerad med accent (θεός, ζωή).
    naken = "".join(
        c for c in unicodedata.normalize("NFD", lemma) if not unicodedata.combining(c)
    )
    if naken.endswith(("ος", "ον")):        # 2:a dekl (θεός, λόγος, ἔργον, ὁδός)
        return "-οῦ" if ox else "-ου"
    if naken.endswith("η"):                  # 1:a dekl fem (ἀρχή, ζωή)
        return "-ῆς" if ox else "-ης"
    if naken.endswith("α"):                  # 1:a dekl fem (ἐκκλησία)
        return "-ᾶς" if ox else "-ας"
    if naken.endswith(("ης", "ας")):         # 1:a dekl mask (μαθητής, προφήτης)
        return "-οῦ" if ox else "-ου"
    return None                              # okänt mönster → visa ingen genitiv


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
            post = {"grek": grek, "sv": x["glosa"]}
            # Substantiv visas med artikel (= genus) + genitiv, som på Oskars provblad.
            if x.get("ordklass") == "substantiv" and x.get("genus") in ARTIKEL:
                post["grek"] = f"{ARTIKEL[x['genus']]} {grek}"
                gen = genitiv_display(x)
                if gen:
                    post["gen"] = gen
            ord.append(post)
        grupper.append({"kat": namn, "not": NOTER[namn], "ord": ord})

    block = "const PROV = [\n" + "\n".join(
        "  " + json.dumps(g, ensure_ascii=False) + "," for g in grupper
    ).rstrip(",") + "\n];"

    src = SIDA.read_text()
    ny, n = re.subn(r"const PROV = \[.*?\n\s*\];", lambda m: block, src, count=1, flags=re.S)
    if not n:
        raise SystemExit("Hittade ingen 'const PROV = [...]' i provoversikt.html")
    SIDA.write_text(ny)

    # Utskriften bär samma gloslista som statisk (JS-fri) HTML — renderas här in
    # mellan markörerna, precis som grammatikreferens-utskrift.html.
    render_utskrift(grupper)

    antal = sum(len(g["ord"]) for g in grupper)
    print(f"Skrev {antal} provord i {len(grupper)} kategorier till {SIDA.name} + {UTSKRIFT.name}.")


def esc(s):
    return s.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;")


def render_utskrift(grupper):
    sektioner = []
    for g in grupper:
        rader = []
        for o in g["ord"]:
            gen = f'<span class="gen">{esc(o["gen"])}</span> ' if o.get("gen") else ""
            rader.append(
                f'<div class="pv-word"><span class="g">{esc(o["grek"])}</span> '
                f'{gen}<span class="sv">{esc(o["sv"])}</span></div>'
            )
        sektioner.append(
            f'<section class="pv-cat">\n'
            f'  <h3>{esc(g["kat"])} <span class="antal">{len(g["ord"])}</span></h3>\n'
            f'  <div class="pv-list">\n    ' + "\n    ".join(rader) + "\n  </div>\n"
            f"</section>"
        )
    blob = "\n".join(sektioner)
    src = UTSKRIFT.read_text()
    ny, n = re.subn(
        r"(<!-- GEN:vocab START -->).*?(<!-- GEN:vocab END -->)",
        lambda m: f"{m.group(1)}\n{blob}\n{m.group(2)}",
        src, count=1, flags=re.S,
    )
    if not n:
        raise SystemExit("Hittade inga GEN:vocab-markörer i provoversikt-utskrift.html")
    UTSKRIFT.write_text(ny)


if __name__ == "__main__":
    main()
