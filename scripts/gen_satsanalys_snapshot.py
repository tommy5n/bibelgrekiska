#!/usr/bin/env python3
"""Regenererar SATSER + NIVAER i vyer/satsanalys.js ur json/satsanalys-satser.json.

    python3 scripts/formatera_satsanalys_satser.py && \
    python3 scripts/validera_satsanalys_satser.py && \
    python3 scripts/gen_satsanalys_snapshot.py

Banken bodde tidigare direkt i vyfilen. 51 av 95 satser fanns BARA där — hade
vyn någonsin regenererats ur en källa utan dem vore de spårlöst borta, precis
som sem6-glosorna nästan blev. Nu äger mastern dem och vyn är en avskrift.

`i_seminarier` följer INTE med till snapshoten: det är ett valideringsfält som
säger var satsen kan kontrolleras, och spelet har ingen användning för det.
"""
import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
MASTER = ROOT / "json" / "satsanalys-satser.json"
VY = ROOT / "vyer" / "satsanalys.js"


def jsstr(s):
    return '"' + s.replace("\\", "\\\\").replace('"', '\\"') + '"'


def rad_sats(s):
    huvud = [f'id:{jsstr(s["id"])}', f'niva:{s["niva"]}', f'kalla:{jsstr(s["kalla"])}',
             f'ref:{jsstr(s["ref"])}', f'sv:{jsstr(s["sv"])}']
    if s.get("subjI"):
        huvud.append(f'subjI:{jsstr(s["subjI"])}')
    if s.get("impf"):
        huvud.append("impf:true")
    chunks = ",".join("{t:" + jsstr(c["t"]) + ',roll:"' + c["roll"] + '"}'
                      for c in s["chunks"])
    return f'  {{ {", ".join(huvud)}, chunks:[\n      {chunks} ]}},'


def main():
    bank = json.loads(MASTER.read_text())
    satser = bank["satser"]

    rader = [rad_sats(s) for s in satser]
    rader[-1] = rader[-1].rstrip(",")
    array = "const SATSER = [\n" + "\n".join(rader) + "\n];"

    nivaer = "const NIVAER = {\n" + "\n".join(
        f'  {n}:{jsstr(v)},' for n, v in sorted(bank["_nivaer"].items(), key=lambda x: int(x[0]))
    ) + "\n};"

    src = VY.read_text()
    for monster, ersattning, namn in (
            (r"const SATSER = \[.*?\n\];", array, "const SATSER = [...]"),
            (r"const NIVAER = \{.*?\n\};", nivaer, "const NIVAER = {...}")):
        src, n = re.subn(monster, lambda m: ersattning, src, count=1, flags=re.S)
        if not n:
            raise SystemExit(f"Hittade ingen '{namn}' i vyer/satsanalys.js")
    VY.write_text(src)

    skapade = sum(1 for s in satser if s["kalla"] == "skapad")
    chunks = sum(len(s["mal"]) if "mal" in s else len(s["chunks"]) for s in satser)
    print(f"Skrev {VY.relative_to(ROOT)} — {len(satser)} satser "
          f"({len(satser) - skapade} ur kursmaterialet, {skapade} konstruerade), "
          f"{chunks} chunks, {len(bank['_nivaer'])} nivåer.")


if __name__ == "__main__":
    main()
