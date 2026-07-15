#!/usr/bin/env python3
"""Formaterar om json/pronomen-satser.json till kompakt, handredigerbar layout.

    python3 scripts/formatera_pronomen_satser.py

Mastern underhålls för hand: en sats ska gå att läsa och rätta som ett block,
inte som 30 rader. json.dumps(indent=…) spränger ut varje nyckel på egen rad och
gör filen fyra gånger så lång. Kör det här efter varje programmatisk ändring.

Layouten: header med indent 1, sedan ett block per sats med målen indragna under.
"""
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
BANK = ROOT / "json" / "pronomen-satser.json"

J = lambda v: json.dumps(v, ensure_ascii=False)


def rad_mal(m):
    """Ett mål: allt utom not/alt på en rad, not och alt indragna under."""
    huvud = ", ".join(f"{J(k)}: {J(m[k])}" for k in
                      ("form", "n", "lemma", "modell", "analys", "roll", "sv") if k in m)
    svans = ", ".join(f"{J(k)}: {J(m[k])}" for k in ("alt", "not") if k in m)
    if not svans:
        return f"    {{ {huvud} }}"
    return f"    {{ {huvud},\n      {svans} }}"


def rad_sats(s):
    rad1 = ", ".join(f"{J(k)}: {J(s[k])}" for k in
                     ("id", "seminarium", "grekiska", "oversattning"))
    rad2 = ", ".join(f"{J(k)}: {J(s[k])}" for k in ("kalla", "sida") if k in s)
    mal = ",\n".join(rad_mal(m) for m in s["mal"])
    return f"  {{ {rad1},\n    {rad2}, \"mal\": [\n{mal} ] }}"


def main():
    bank = json.loads(BANK.read_text())
    satser = bank.pop("satser")

    delar = [f" {J(k)}: {json.dumps(v, ensure_ascii=False, indent=2)}"
             for k, v in bank.items()]
    header = ",\n".join(delar)
    kropp = ",\n\n".join(rad_sats(s) for s in satser)

    BANK.write_text("{\n" + header + ',\n "satser": [\n\n' + kropp + "\n\n ]\n}\n")

    # Rundgångskontroll: formateringen får inte ändra innehållet.
    om = json.loads(BANK.read_text())
    bank["satser"] = satser
    if om != bank:
        raise SystemExit("FEL: formateringen ändrade innehållet — filen är inte skriven.")
    rader = len(BANK.read_text().splitlines())
    print(f"Skrev {BANK.relative_to(ROOT)} — {len(satser)} satser, {rader} rader.")


if __name__ == "__main__":
    main()
