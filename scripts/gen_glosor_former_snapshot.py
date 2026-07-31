#!/usr/bin/env python3
"""Regenererar FORMER-snapshoten i vyer/glosor.js ur böjningsmastrarna.

Spelvyerna läser inte json/ vid runtime — de bär inbäddade snapshots. Kör efter
varje ändring i ord/verb/adjektiv/pronomen.json:

    python3 scripts/gen_glosor_former_snapshot.py

FORMER driver glosspelets "Former"-läge (böjd form → glosa). Strukturen är
kompakt: lemma → [{f: böjd form, p: parsning}]. Formerna joinas ur fyra
mastrar och dedupliceras per lemma på ytform (första förekomsten i kanonisk
ordning behålls), så en form visas en gång med en representativ parsning.
Betydelsen (svenska glosan) tas ur GLOSOR-snapshoten vid runtime — inte här.
"""
import json
import re
from collections import OrderedDict
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
VY = ROOT / "vyer" / "glosor.js"

KASUS = {"nom": "nominativ", "gen": "genitiv", "dat": "dativ", "ack": "ackusativ", "vok": "vokativ"}
NUM = {"sg": "singular", "pl": "plural"}
GENUS = {"m": "maskulinum", "f": "femininum", "n": "neutrum"}
TEMPUS = {"pres": "presens", "impf": "imperfekt", "fut": "futurum", "aor": "aorist"}
MODUS = {"ind": "indikativ", "imp": "imperativ", "inf": "infinitiv"}
DIATES = {"akt": "aktiv", "med": "medium", "pass": "passiv"}
PERSON = {"1sg": "1:a sg", "2sg": "2:a sg", "3sg": "3:e sg",
          "1pl": "1:a pl", "2pl": "2:a pl", "3pl": "3:e pl"}

KASUS_ORD = list(KASUS)
NUM_ORD = list(NUM)
GENUS_ORD = list(GENUS)


def substantiv_former(entry):
    for k in KASUS_ORD:
        rad = entry["former"].get(k) or {}
        for n in NUM_ORD:
            form = rad.get(n)
            if form:
                yield form, f"{KASUS[k]} {NUM[n]}"


def adjektiv_former(entry):
    for g in GENUS_ORD:
        blk = entry["former"].get(g) or {}
        for k in KASUS_ORD:
            rad = blk.get(k) or {}
            for n in NUM_ORD:
                form = rad.get(n)
                if form:
                    yield form, f"{GENUS[g]} {KASUS[k]} {NUM[n]}"


def verb_former(entry):
    for nyckel, celler in entry["former"].items():
        t, m, d = (nyckel.split(".") + ["", "", ""])[:3]
        bas = f"{TEMPUS.get(t, t)} {MODUS.get(m, m)} {DIATES.get(d, d)}".strip()
        for pn, form in celler.items():
            if not form:
                continue
            if pn == "inf":
                yield form, bas
            else:
                yield form, f"{bas}, {PERSON.get(pn, pn)}"


def pronomen_former(entry):
    # Strukturen varierar (person- vs genusböjda); gå rekursivt och läs av
    # kända nycklar ur vägen. Löven är strängar (betonad/obetonad-form).
    def walk(node, path):
        if isinstance(node, str):
            if node:
                yield node, path
            return
        if isinstance(node, dict):
            for k, v in node.items():
                yield from walk(v, path + [k])

    for form, path in walk(entry.get("former") or {}, []):
        g = k = n = None
        obeton = False
        for seg in path:
            if seg in GENUS:
                g = GENUS[seg]
            elif seg in KASUS:
                k = KASUS[seg]
            elif seg in NUM:
                n = NUM[seg]
            elif seg == "obetonad":
                obeton = True
        delar = [x for x in (g, k, n) if x]
        parse = " ".join(delar) if delar else "grundform"
        if obeton:
            parse += " (obetonad)"
        yield form, parse


KALLOR = [
    ("ord.json", "ord", substantiv_former),
    ("verb.json", "verb", verb_former),
    ("adjektiv.json", "adjektiv", adjektiv_former),
    ("pronomen.json", "pronomen", pronomen_former),
]


def main():
    former = OrderedDict()   # lemma -> OrderedDict(form -> parse)  (dedup på ytform)
    stat = {}
    for fil, nyckel, plockare in KALLOR:
        data = json.loads((ROOT / "json" / fil).read_text())[nyckel]
        antal = 0
        for entry in data:
            lemma = entry["lemma"]
            bucket = former.setdefault(lemma, OrderedDict())
            for form, parse in plockare(entry):
                if form not in bucket:
                    bucket[form] = parse
            antal += 1
        stat[fil] = antal

    lemman = sorted(former)
    rader = []
    for lemma in lemman:
        celler = ", ".join(
            json.dumps({"f": f, "p": p}, ensure_ascii=False) for f, p in former[lemma].items()
        )
        rader.append(f"  {json.dumps(lemma, ensure_ascii=False)}: [{celler}],")
    if rader:
        rader[-1] = rader[-1].rstrip(",")
    block = "const FORMER = {\n" + "\n".join(rader) + "\n};"

    src = VY.read_text()
    ny, n = re.subn(r"const FORMER = \{.*?\n\};", lambda m: block, src, count=1, flags=re.S)
    if not n:
        raise SystemExit("Hittade ingen 'const FORMER = {...};' i vyer/glosor.js")
    VY.write_text(ny)

    tot_former = sum(len(v) for v in former.values())
    print(f"Skrev {VY.relative_to(ROOT)} — {len(lemman)} lemman, {tot_former} former.")
    for fil, antal in stat.items():
        print(f"  {fil:16s} {antal} poster")


if __name__ == "__main__":
    main()
