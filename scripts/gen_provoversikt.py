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
    "Verb": "Lär verbet som <b>verbtema</b> — presens · futurum · aorist (t.ex. λύω · λύσω · ἔλυσα). Presens är uppslagsformen; de gyllene formerna är futurum och aorist. † = oregelbundet/suppletivt tema som måste läras utantill.",
    "Substantiv": "Kan artikeln (= genus) och grundbetydelsen. <b>Tredje deklinationen</b> (märkt <span class=\"pv-d3\">3</span>) lärs med både nominativ och genitiv — genitiven visas som hel form (ὁ πατήρ, πατρός).",
    "Adjektiv": "μέγας, πᾶς och πολύς böjs oregelbundet — se de egna korten.",
    "Prepositioner": "Betydelsen skiftar med kasus — se prepositionskortet.",
    "Blandade småord": "Vanliga men lätta att blanda ihop.",
}

# Grekisk visning där PDF:en avviker från lemmat (varianter Oskar räknar upp).
DISPLAY = {
    "ἐκ": "ἐκ / ἐξ",
    "οὐ": "οὐ (οὐκ, οὐχ)",
}

# Verbtema (principaldelar) per provverb: (presens 1sg, futurum 1sg, aorist 1sg).
# Läraren tipsar om att lära verb som verbtema — presens · futurum · aorist.
# Presens = uppslagsformen (= lemmat). Denna bank är visnings-/ordningskällan och
# KORSVALIDERAS mot verb.json (valideraverbtema): sedan 2026-08-06 bär verb.json
# alla dessa former (även de suppletiva δίδωμι/λέγω och καλέω:fut), så banken och
# mastern måste stämma överens. εἰμί saknar aorist (defekt verb). Suppletiva/
# oregelbundna teman flaggas (OREGELB) så eleven ser att de inte följer det
# sigmatiska mönstret.
VERBTEMA = {
    "ἀκολουθέω": ("ἀκολουθῶ", "ἀκολουθήσω", "ἠκολούθησα"),
    "ἀκούω":     ("ἀκούω", "ἀκούσω", "ἤκουσα"),
    "ἀποστέλλω": ("ἀποστέλλω", "ἀποστελῶ", "ἀπέστειλα"),
    "βαπτίζω":   ("βαπτίζω", "βαπτίσω", "ἐβάπτισα"),
    "βλέπω":     ("βλέπω", "βλέψω", "ἔβλεψα"),
    "γράφω":     ("γράφω", "γράψω", "ἔγραψα"),
    "δίδωμι":    ("δίδωμι", "δώσω", "ἔδωκα"),
    "εἰμί":      ("εἰμί", "ἔσομαι", None),
    "καλέω":     ("καλῶ", "καλέσω", "ἐκάλεσα"),
    "κηρύσσω":   ("κηρύσσω", "κηρύξω", "ἐκήρυξα"),
    "λαλέω":     ("λαλῶ", "λαλήσω", "ἐλάλησα"),
    "λέγω":      ("λέγω", "ἐρῶ", "εἶπον"),
    "λύω":       ("λύω", "λύσω", "ἔλυσα"),
    "πέμπω":     ("πέμπω", "πέμψω", "ἔπεμψα"),
    "πιστεύω":   ("πιστεύω", "πιστεύσω", "ἐπίστευσα"),
    "ποιέω":     ("ποιῶ", "ποιήσω", "ἐποίησα"),
}
# Teman som INTE följer det regelbundna (sigmatiska) mönstret från presensstammen
# — markeras med † och en not, så eleven vet att de måste läras utantill.
OREGELB = {"δίδωμι", "εἰμί", "λέγω"}

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


def valideraverbtema(prov):
    """Verbtema-banken måste täcka exakt provverben och stämma med verb.json.

    Drift-vakt: (1) varje provverb måste ha ett tema, och inga extra; (2) de
    temadelar verb.json FAKTISKT bär (pres/fut/aor 1sg indikativ) måste vara
    byte-identiska med bankens — så en rättad form i mastern inte tyst driver isär.
    Delar som verb.json medvetet utelämnat (δίδωμι/λέγω fut+aor, καλέω fut) hoppas.
    """
    provverb = {l for l, x in prov.items() if x.get("ordklass") == "verb"}
    saknas = provverb - set(VERBTEMA)
    extra = set(VERBTEMA) - provverb
    if saknas:
        raise SystemExit("Provverb utan verbtema i gen_provoversikt.py: " + ", ".join(sorted(saknas)))
    if extra:
        raise SystemExit("Verbtema för lemman som inte är provverb: " + ", ".join(sorted(extra)))

    vd = json.loads((ROOT / "json" / "verb.json").read_text())
    verbs = {v["lemma"]: v for v in vd["verb"]}

    def f1(v, key):
        f = (v.get("former") or {}).get(key) or {}
        return f.get("1sg")

    avvik = []
    for lemma, (pres, fut, aor) in VERBTEMA.items():
        v = verbs.get(lemma)
        if not v:
            continue
        for tempus, egen, keys in (
            ("presens", pres, ["pres.ind.akt", "pres.ind.med"]),
            ("futurum", fut, ["fut.ind.akt", "fut.ind.med"]),
            ("aorist", aor, ["aor.ind.akt", "aor.ind.med"]),
        ):
            master = next((f1(v, k) for k in keys if f1(v, k)), None)
            if master and egen and master != egen:
                avvik.append(f"{lemma} {tempus}: bank {egen} ≠ verb.json {master}")
    if avvik:
        raise SystemExit("Verbtema avviker från verb.json:\n  " + "\n  ".join(avvik))


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

    valideraverbtema(prov)

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
                # Tredje deklinationen har lagrad (hel) genitiv → märks så eleven
                # vet att just dessa ska läras med både nominativ och genitiv.
                if x.get("genitiv"):
                    post["dekl3"] = True
            # Verb visas med verbtema: futurum · aorist (presens = uppslagsformen).
            if x.get("ordklass") == "verb" and lemma in VERBTEMA:
                _, fut, aor = VERBTEMA[lemma]
                post["tema"] = f"{fut} · {aor}" if aor else f"{fut} · —"
                if lemma in OREGELB:
                    post["oregelb"] = True
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


PV_LEGEND = (
    '<p class="pv-legend">Verb visas som <b>verbtema</b>: presens (uppslagsformen) · '
    '<i>futurum · aorist</i>; † = oregelbundet/suppletivt tema. '
    '<b>3</b> = tredje deklinationen — lär både nominativ och genitiv.</p>'
)


def render_utskrift(grupper):
    sektioner = []
    for g in grupper:
        rader = []
        for o in g["ord"]:
            d3 = '<span class="d3">3</span> ' if o.get("dekl3") else ""
            gen = f'<span class="gen">{esc(o["gen"])}</span> ' if o.get("gen") else ""
            tema = ""
            if o.get("tema"):
                dagger = "†" if o.get("oregelb") else ""
                tema = f'<span class="tema">{esc(o["tema"])}{dagger}</span> '
            rader.append(
                f'<div class="pv-word"><span class="g">{esc(o["grek"])}</span> '
                f'{d3}{gen}{tema}<span class="sv">{esc(o["sv"])}</span></div>'
            )
        sektioner.append(
            f'<section class="pv-cat">\n'
            f'  <h3>{esc(g["kat"])} <span class="antal">{len(g["ord"])}</span></h3>\n'
            f'  <div class="pv-list">\n    ' + "\n    ".join(rader) + "\n  </div>\n"
            f"</section>"
        )
    blob = PV_LEGEND + "\n" + "\n".join(sektioner)
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
