#!/usr/bin/env python3
"""Genererar datasnapshoten för den dynamiska övningstentamen (#/tenta).

    python3 scripts/gen_tenta_snapshot.py

Skriver HELA vyer/tenta-data.js från grunden (ren datamodul, ingen egen kod —
till skillnad från spelvyernas snapshots som patchas in i en befintlig vy).
Vyn vyer/tenta.js importerar `TENTA` härifrån och plockar ihop del II–IV; del I
(översätt former) tar vyn direkt ur verb.js + kasus.js i körtid.

Källor (JSON-mastrar som Python kan läsa):
  • json/satsanalys-satser.json → del II (ta ut satsdelar). Varje sats bär redan
    satsled (chunks) med syntaktisk roll + full svensk översättning + ref → vi
    behöver aldrig hitta på facit. Rollkoderna översätts till läsbara etiketter.
  • json/tenta-pool.json → del III (luckor) och del IV (begreppsfrågor +
    översättningsmeningar med bisats). Passeras i stort sett rakt igenom.

Substantiv-/verbparadigmen bor kvar i kasus.js/verb.js och importeras live av
vyn — de speglas INTE hit (ingen dubblering, ingen drift).
"""
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
SATSANALYS = ROOT / "json" / "satsanalys-satser.json"
POOL = ROOT / "json" / "tenta-pool.json"
UT = ROOT / "vyer" / "tenta-data.js"

# Rollkod → läsbar satsdelsetikett (speglar satsanalys-satser.json:s _nycklar.roll
# och ovningstentamen.json:s facit-språk).
ROLL_ETIKETT = {
    "subj": "subjekt",
    "pred": "predikat",
    "do": "direkt objekt",
    "obj-dat": "dativobjekt",
    "io": "indirekt objekt",
    "gen": "genitivattribut",
    "pf": "predikatsfyllnad",
    "vok": "vokativ",
    "adv": "adverbial",
    "inf": "infinitivkomplement",
    "obj-gen": "genitivobjekt",
    "attr": "attribut",
    "gen-abs": "genitivus absolutus",
    "aci-subj": "ackusativsubjekt (aci)",
    "agent": "agent",
}


def bygg_satslara():
    """Del II — kursens satser med satsled + roll + översättning."""
    satser = json.loads(SATSANALYS.read_text())["satser"]
    ut = []
    for s in satser:
        delar = []
        for c in s["chunks"]:
            roll = c["roll"]
            if roll not in ROLL_ETIKETT:
                raise SystemExit(f"{s['id']}: okänd roll {roll!r} — lägg till i ROLL_ETIKETT")
            delar.append([c["t"], ROLL_ETIKETT[roll]])
        gr = " ".join(c["t"] for c in s["chunks"])
        if gr and gr[-1] not in ".;·":
            gr += "."
        ut.append({
            "id": s["id"],
            "gr": gr,
            "sv": s["sv"],
            "delar": delar,
            "ref": s.get("ref", ""),
        })
    return ut


def js_block(namn, rader):
    """`namn: [ {…}, … ]` med en post per rad — diffvänligt."""
    inner = "\n".join("    " + json.dumps(r, ensure_ascii=False) + "," for r in rader)
    return f"  {namn}: [\n{inner}\n  ],"


def main():
    pool = json.loads(POOL.read_text())
    satslara = bygg_satslara()

    delar = [
        js_block("satslara", satslara),
        js_block("luckor", pool["luckor"]),
        js_block("begrepp", pool["begrepp"]),
        js_block("oversattning", pool["oversattning"]),
    ]

    src = (
        "// GENERERAD — redigera inte för hand.\n"
        "// Källa: json/satsanalys-satser.json (del II) + json/tenta-pool.json (del III–IV).\n"
        "// Regenerera: python3 scripts/gen_tenta_snapshot.py\n"
        "// Del I (översätt former) importeras live ur verb.js/kasus.js av vyer/tenta.js.\n"
        "export const TENTA = {\n"
        + "\n".join(delar)
        + "\n};\n"
    )
    UT.write_text(src)

    print(f"Skrev {UT.relative_to(ROOT)}")
    print(f"  del II satslära     : {len(satslara)} satser")
    print(f"  del III luckor      : {len(pool['luckor'])}")
    print(f"  del IV begrepp      : {len(pool['begrepp'])} "
          f"(diates {sum(1 for b in pool['begrepp'] if b.get('niva') == 'diates')})")
    print(f"  del IV översättning : {len(pool['oversattning'])}")


if __name__ == "__main__":
    main()
