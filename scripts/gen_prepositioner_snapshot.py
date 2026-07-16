#!/usr/bin/env python3
"""Regenererar prepositioner- och fraser-arrayerna i vyer/prepositioner.js
ur json/prepositioner.json.

    python3 scripts/gen_prepositioner_snapshot.py

Snapshoten låg tidigare handunderhållen i vyn. Den var i synk med mastern — men
ingenting fällde om den slutade vara det, precis den tysta drift som nästan
raderade sem6-glosorna. Nu äger json/prepositioner.json datan och vyn är en
avskrift, kolumnjusterad och grupperad per `grupp` för läsbarhet.

Enda transformationen: masterns `seminarium` blir vyns kortare `sem`. Fraserna
kopieras oförändrade. Kasus-ordningen (gen → dat → ack) bevaras som mastern har
den — den speglar grammatikreferensens prepositionskort.
"""
import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
MASTER = ROOT / "json" / "prepositioner.json"
VY = ROOT / "vyer" / "prepositioner.js"

KASUS_ORDNING = ["gen", "dat", "ack"]


def jsstr(s):
    return '"' + s.replace("\\", "\\\\").replace('"', '\\"') + '"'


def kasus_literal(kasus):
    delar = [f"{k}:{jsstr(kasus[k])}" for k in KASUS_ORDNING if k in kasus]
    return "{ " + ", ".join(delar) + " }"


def grupperat(poster, radfunktion):
    """Rader, med tomrad mellan grupp-byten."""
    ut, forra = [], None
    for p in poster:
        if forra is not None and p["grupp"] != forra:
            ut.append("")
        ut.append(radfunktion(p))
        forra = p["grupp"]
    return "\n".join(ut)


def main():
    master = json.loads(MASTER.read_text())
    prep = master["prepositioner"]
    fraser = master["fraser"]

    # Grupptillhörighet per lemma, så fraserna kan grupperas som prepositionerna.
    grupp_av = {p["lemma"]: p["grupp"] for p in prep}
    for f in fraser:
        f["grupp"] = grupp_av[f["lemma"]]

    # Kolumnbredder för prepositionsblocket.
    w_lemma = max(len(p["lemma"]) for p in prep)
    w_frek = max(len(str(p["frekvens"])) for p in prep)

    def rad_prep(p):
        lemma = (jsstr(p["lemma"]) + ",").ljust(w_lemma + 3)
        frek = (str(p["frekvens"]) + ",").ljust(w_frek + 1)
        sem = ("[" + ",".join(str(s) for s in p["seminarium"]) + "],").ljust(8)
        return f"  {{ lemma:{lemma} grupp:{p['grupp']}, frekvens:{frek} sem:{sem} kasus:{kasus_literal(p['kasus'])} }},"

    # Kolumnbredder för frasblocket.
    wf_lemma = max(len(f["lemma"]) for f in fraser)
    wf_gr = max(len(f["gr"]) for f in fraser)

    def rad_fras(f):
        lemma = (jsstr(f["lemma"]) + ",").ljust(wf_lemma + 3)
        gr = (jsstr(f["gr"]) + ",").ljust(wf_gr + 3)
        return f"  {{ lemma:{lemma} kasus:{jsstr(f['kasus'])}, gr:{gr} sv:{jsstr(f['sv'])} }},"

    prep_arr = "const prepositioner = [\n" + grupperat(prep, rad_prep) + "\n];"
    fras_arr = "const fraser = [\n" + grupperat(fraser, rad_fras) + "\n];"

    src = VY.read_text()
    for monster, ersattning, namn in (
            (r"const prepositioner = \[.*?\n\];", prep_arr, "const prepositioner"),
            (r"const fraser = \[.*?\n\];", fras_arr, "const fraser")):
        src, n = re.subn(monster, lambda m: ersattning, src, count=1, flags=re.S)
        if not n:
            raise SystemExit(f"Hittade ingen '{namn} = [...]' i vyer/prepositioner.js")
    VY.write_text(src)

    print(f"Skrev {VY.relative_to(ROOT)} — {len(prep)} prepositioner, {len(fraser)} fraser.")


if __name__ == "__main__":
    main()
