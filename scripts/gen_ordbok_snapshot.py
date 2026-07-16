#!/usr/bin/env python3
"""Regenererar ORDBOK-arrayen i vyer/ordbok.js ur json/glosor.json + json/prepositioner.json.

Uppslagsboken bär en inbäddad snapshot precis som spelvyerna och läser inte json/
vid runtime. Kör efter varje ändring i mastrarna:

    python3 scripts/gen_ordbok_snapshot.py

Fältnamnen kortas: l=lemma, g=glosa, o=ordklass, gen=genus, f=frekvens,
s=seminarium, d=kortlekar (härlett: "sem" om ordet finns i något seminariedäck,
"60" om NT-frekvensen är över 60). Rika uppslagsfält tas bara med när de finns:
git=genitiv (masterns 'genitiv'), not=uppslagsnot (masterns 'not'), rekt=kasusrektion
(byggd ur prepositioner.json:s kasus→betydelse-karta, ordnad gen→dat→ack).
Framtida namngivna listor (masterns 'listor') följer med som lst för tenta-urval.
"""
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
MASTER = ROOT / "json" / "glosor.json"
PREP = ROOT / "json" / "prepositioner.json"
VY = ROOT / "vyer" / "ordbok.js"

KASUS_ORDNING = ["gen", "dat", "ack"]


def bygg_rektion():
    """lemma -> [[kasus, betydelse], …] i ordningen gen, dat, ack."""
    prep = json.loads(PREP.read_text())["prepositioner"]
    karta = {}
    for x in prep:
        kasus = x.get("kasus") or {}
        rader = [[k, kasus[k]] for k in KASUS_ORDNING if k in kasus]
        if rader:
            karta[x["lemma"]] = rader
    return karta


def main():
    G = json.loads(MASTER.read_text())["glosor"]
    REKT = bygg_rektion()
    rader = []
    for x in G:
        d = []
        if x["seminarium"]:
            d.append("sem")
        if (x.get("frekvens") or 0) > 60:
            d.append("60")
        r = {
            "l": x["lemma"], "g": x["glosa"], "o": x["ordklass"], "gen": x.get("genus"),
            "f": x.get("frekvens"), "s": x["seminarium"], "d": d,
        }
        if x.get("genitiv"):
            r["git"] = x["genitiv"]
        if x["lemma"] in REKT:
            r["rekt"] = REKT[x["lemma"]]
        if x.get("not"):
            r["not"] = x["not"]
        if x.get("listor"):
            r["lst"] = x["listor"]
        rader.append(r)

    array = "const ORDBOK = [\n" + "\n".join(
        "  " + json.dumps(r, ensure_ascii=False) + "," for r in rader
    ).rstrip(",") + "\n];"

    src = VY.read_text()
    import re
    ny, n = re.subn(r"const ORDBOK = \[.*?\n\];", lambda m: array, src, count=1, flags=re.S)
    if not n:
        raise SystemExit("Hittade ingen 'const ORDBOK = [...]' i vyer/ordbok.js")

    sem = sorted({s for x in G for s in x["seminarium"]})
    ny = re.sub(r"const SEMINARIER = \[[^\]]*\];",
                "const SEMINARIER = [" + ", ".join(str(s) for s in sem) + "];", ny, count=1)
    VY.write_text(ny)

    med_git = sum(1 for r in rader if "git" in r)
    med_rekt = sum(1 for r in rader if "rekt" in r)
    med_not = sum(1 for r in rader if "not" in r)
    print(f"Skrev {VY.relative_to(ROOT)} — {len(rader)} ord.")
    print(f"  rika fält: genitiv {med_git} · rektion {med_rekt} · noter {med_not}")
    print("  däck: sem =", sum(1 for r in rader if "sem" in r["d"]),
          "| 60 =", sum(1 for r in rader if "60" in r["d"]))


if __name__ == "__main__":
    main()
