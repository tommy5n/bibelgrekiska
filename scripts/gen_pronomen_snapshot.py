#!/usr/bin/env python3
"""Regenererar pronomen-arrayen (snapshoten) i vyer/pronomen.js ur json/pronomen.json.

Spelvyerna bär inbäddade snapshots och läser inte json/ vid runtime. Kör efter
varje ändring i mastern:

    python3 scripts/gen_pronomen_snapshot.py

Två böjningsmodeller (fältet 'modell' styr frågeformen i spelet):
  person: former[num][kas] = [betonad, obetonad]   (ἐγώ, σύ)
  genus:  former[genus][kas] = {sg, pl}            (αὐτός, οὗτος, τίς, ἐμός, τις …)

Spelet frågar bara på nom/gen/dat/ack — vokativen ingår inte.
"""
import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
MASTER = ROOT / "json" / "pronomen.json"
VY = ROOT / "vyer" / "pronomen.js"

KASUS = ["nom", "gen", "dat", "ack"]
NUM = ["sg", "pl"]
GENUS = ["m", "f", "n"]


def jsstr(s):
    return "null" if s is None else '"' + s.replace("\\", "\\\\").replace('"', '\\"') + '"'


def rad_person(p):
    former = ", ".join(
        f"{n}:{{ " + ", ".join(
            f'{k}:[{jsstr(p["former"][n][k]["betonad"])},{jsstr(p["former"][n][k].get("obetonad"))}]'
            for k in KASUS
        ) + " }"
        for n in NUM
    )
    sv = ", ".join(
        f"{n}:{{ " + ", ".join(f'{k}:{jsstr(p["glosa_kasus"][n][k])}' for k in KASUS) + " }"
        for n in NUM
    )
    return (f'  {{ lemma:{jsstr(p["lemma"])}, glosa:{jsstr(p["glosa"])}, modell:"person", '
            f'sem:[{", ".join(str(s) for s in p["seminarium"])}],\n'
            f"    former:{{ {former} }},\n    sv:{{ {sv} }} }},")


def rad_genus(p):
    former = ", ".join(
        f"{g}:{{ " + ", ".join(
            f'{k}:{{sg:{jsstr(p["former"][g][k]["sg"])},pl:{jsstr(p["former"][g][k]["pl"])}}}'
            for k in KASUS
        ) + " }"
        for g in GENUS
    )
    sv = ", ".join(
        f"{g}:{{ " + ", ".join(
            f'{n}:{{' + ", ".join(f'{k}:{jsstr(p["glosa_kasus"][g][n][k])}' for k in KASUS) + "}"
            for n in NUM
        ) + " }"
        for g in GENUS
    )
    return (f'  {{ lemma:{jsstr(p["lemma"])}, glosa:{jsstr(p["glosa"])}, modell:"genus", '
            f'sem:[{", ".join(str(s) for s in p["seminarium"])}],\n'
            f"    former:{{ {former} }},\n    sv:{{ {sv} }} }},")


def main():
    P = json.loads(MASTER.read_text())["pronomen"]
    rader = [rad_person(p) if p["bojningsmodell"] == "person" else rad_genus(p) for p in P]
    rader[-1] = rader[-1].rstrip(",")
    array = "const pronomen = [\n" + "\n".join(rader) + "\n];"

    src = VY.read_text()
    ny, n = re.subn(r"const pronomen = \[.*?\n\];", lambda m: array, src, count=1, flags=re.S)
    if not n:
        raise SystemExit("Hittade ingen 'const pronomen = [...]' i vyer/pronomen.js")
    VY.write_text(ny)

    sem = sorted({s for p in P for s in p["seminarium"]})
    print(f"Skrev {VY.relative_to(ROOT)} — {len(rader)} pronomen, seminarium {sem}.")
    for p in P:
        print(f'  {p["lemma"]:10s} {p["bojningsmodell"]:7s} {p["typ"]:13s} sem{p["seminarium"]}')


if __name__ == "__main__":
    main()
