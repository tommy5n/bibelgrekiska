#!/usr/bin/env python3
"""Regenererar GLOSOR-arrayen i vyer/glosor.js ur json/glosor.json.

Spelvyerna bär inbäddade snapshots och läser inte json/ vid runtime. Kör efter
varje ändring i mastern:

    python3 scripts/gen_glosor_snapshot.py

Fältnamnen kortas för att hålla snapshoten liten: l=lemma, g=glosa, o=ordklass,
gen=genus, f=frekvens, s=seminarium, d=kortlekar. 'd' härleds: "sem" om ordet
finns i något seminariedäck, "60" om NT-frekvensen är över 60.
"""
import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
MASTER = ROOT / "json" / "glosor.json"
VY = ROOT / "vyer" / "glosor.js"


def main():
    G = json.loads(MASTER.read_text())["glosor"]
    rader = []
    for x in G:
        d = []
        if x["seminarium"]:
            d.append("sem")
        if (x.get("frekvens") or 0) > 60:
            d.append("60")
        rader.append({
            "l": x["lemma"], "g": x["glosa"], "o": x["ordklass"], "gen": x.get("genus"),
            "f": x.get("frekvens"), "s": x["seminarium"], "d": d,
        })
    # en post per rad för läsbar diff
    array = "const GLOSOR = [\n" + "\n".join(
        "  " + json.dumps(r, ensure_ascii=False) + "," for r in rader
    ).rstrip(",") + "\n];"

    src = VY.read_text()
    ny, n = re.subn(r"const GLOSOR = \[.*?\n\];", lambda m: array, src, count=1, flags=re.S)
    if not n:
        raise SystemExit("Hittade ingen 'const GLOSOR = [...]' i vyer/glosor.js")

    sem = sorted({s for x in G for s in x["seminarium"]})
    ny = re.sub(r"const SEMINARIER = \[[^\]]*\];",
                "const SEMINARIER = [" + ", ".join(str(s) for s in sem) + "];", ny, count=1)
    # underrubriker/etiketter följer seminarieintervallet
    span = f"{sem[0]}–{sem[-1]}"
    ny = re.sub(r"seminarium \d+–\d+", f"seminarium {span}", ny)
    ny = re.sub(r"Seminarium \d+–\d+", f"Seminarium {span}", ny)
    VY.write_text(ny)

    per = {s: sum(1 for x in G if s in x["seminarium"]) for s in sem}
    print(f"Skrev {VY.relative_to(ROOT)} — {len(rader)} glosor, seminarium {span}.")
    print("  per seminarium:", per)
    print("  däck: sem =", sum(1 for r in rader if "sem" in r["d"]), "| 60 =", sum(1 for r in rader if "60" in r["d"]))


if __name__ == "__main__":
    main()
