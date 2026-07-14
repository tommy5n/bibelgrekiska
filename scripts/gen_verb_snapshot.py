#!/usr/bin/env python3
"""Regenererar verb-arrayen (snapshoten) i vyer/verb.js ur json/verb.json.

Spelvyerna läser inte json/ vid runtime — de bär inbäddade snapshots. Kör det
här skriptet efter varje ändring i mastern, annars når ändringen aldrig spelet:

    python3 scripts/gen_verb_snapshot.py

Snapshoten nycklar former per "tempus.modus" (pres.ind, impf.ind, fut.ind,
pres.imp, pres.inf, fut.inf). Diatesen fälls bort — kursen lär inte ut
medium/passiv än. Cellerna skiljer sig per modus: indikativ 6 (1sg..3pl),
imperativ 4 (ingen 1:a person), infinitiv 1 ("inf").

'varianter' listar bara EXTRA godtagbara former; mastern listar primärformen
tillsammans med varianterna, så primärformen subtraheras här.
"""
import collections
import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
MASTER = ROOT / "json" / "verb.json"
VY = ROOT / "vyer" / "verb.js"

PN6 = ["1sg", "2sg", "3sg", "1pl", "2pl", "3pl"]
IMP4 = ["2sg", "3sg", "2pl", "3pl"]

# λαμβάνω → λήμψομαι är futurum MEDIUM med ändelser kursen inte lärt ut, och
# Oskar tar inte upp verbet i futurum. εἰμί → ἔσομαι är däremot uttryckligen
# lärt (B § 171, sem 6) och används i övningsblad 7 → den tas med.
UTESLUT = {("λαμβάνω", "fut.ind.med")}


def jsstr(s):
    return '"' + s.replace("\\", "\\\\").replace('"', '\\"') + '"'


def celler_for(nyckel):
    return ["inf"] if ".inf." in nyckel else (IMP4 if ".imp." in nyckel else PN6)


def rendera_celler(nyckel, celler):
    return "{" + ", ".join(
        f"{jsstr(p)}:{jsstr(celler[p])}" for p in celler_for(nyckel) if p in celler
    ) + "}"


def bygg_rad(v):
    lemma = v["lemma"]
    former = collections.OrderedDict()
    for k, c in v["former"].items():
        if (lemma, k) in UTESLUT:
            continue
        former[".".join(k.split(".")[:2])] = rendera_celler(k, c)

    var = collections.OrderedDict()
    for k, cs in (v.get("varianter") or {}).items():
        if (lemma, k) in UTESLUT:
            continue
        extra = {}
        for pn, lista in cs.items():
            primar = v["former"][k][pn]
            ex = [f for f in lista if f != primar]
            if ex:
                extra[pn] = ex
        if extra:
            var[".".join(k.split(".")[:2])] = "{" + ", ".join(
                f'{jsstr(p)}:[{", ".join(jsstr(x) for x in ex)}]' for p, ex in extra.items()
            ) + "}"

    bitar = [
        f"lemma:{jsstr(lemma)}",
        f'glosa:{jsstr(v["glosa"])}',
        f'klass:{jsstr(v["klass"])}',
        "kortlekar:[" + ", ".join(jsstr(x) for x in v["kortlekar"]) + "]",
        "sem:[" + ", ".join(str(s) for s in v["seminarium"]) + "]",
        "former:{ " + ", ".join(f"{jsstr(k)}:{c}" for k, c in former.items()) + " }",
    ]
    if var:
        bitar.append("varianter:{ " + ", ".join(f"{jsstr(k)}:{c}" for k, c in var.items()) + " }")
    return "  { " + ", ".join(bitar) + " },"


def main():
    d = json.loads(MASTER.read_text())
    rader = [bygg_rad(v) for v in d["verb"]]
    rader[-1] = rader[-1].rstrip(",")
    array = "export const verb = [\n" + "\n".join(rader) + "\n];"

    src = VY.read_text()
    ny, n = re.subn(r"(?:export )?const verb = \[.*?\n\];", lambda m: array, src, count=1, flags=re.S)
    if not n:
        raise SystemExit("Hittade ingen 'export const verb = [...]' i vyer/verb.js")
    VY.write_text(ny)

    st = collections.Counter()
    for v in d["verb"]:
        for k in v["former"]:
            if (v["lemma"], k) not in UTESLUT:
                st[".".join(k.split(".")[:2])] += 1
    print(f"Skrev {VY.relative_to(ROOT)} — {len(rader)} verb.")
    for k, antal in sorted(st.items()):
        print(f"  {k:9s} {antal} verb")
    if UTESLUT:
        print("  uteslutet:", ", ".join(f"{l} {k}" for l, k in sorted(UTESLUT)))


if __name__ == "__main__":
    main()
