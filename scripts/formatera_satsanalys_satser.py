#!/usr/bin/env python3
"""Formaterar om json/satsanalys-satser.json till kompakt, handredigerbar layout.

    python3 scripts/formatera_satsanalys_satser.py

Samma skäl och samma mönster som formatera_pronomen_satser.py: mastern redigeras
för hand, en sats ska gå att läsa som ett block, och `kanonisk_text()` importeras
av validatorn som FALLER om filen på disk avviker — så formatet kan inte tyst
förfalla. Håll formatlogiken här, inte på två ställen.
"""
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
BANK = ROOT / "json" / "satsanalys-satser.json"

J = lambda v: json.dumps(v, ensure_ascii=False)


def rad_sats(s):
    huvud = ", ".join(f"{J(k)}: {J(s[k])}" for k in
                      ("id", "niva", "kalla", "ref", "i_seminarier") if k in s)
    andra = ", ".join(f"{J(k)}: {J(s[k])}" for k in ("sv", "subjI", "impf") if k in s)
    chunks = ", ".join("{" + f'"t": {J(c["t"])}, "roll": {J(c["roll"])}' + "}"
                       for c in s["chunks"])
    return f"  {{ {huvud},\n    {andra},\n    \"chunks\": [{chunks}] }}"


def kanonisk_text(bank):
    """Bankens kanoniska filtext. Muterar inte `bank`."""
    bank = dict(bank)
    satser = bank.pop("satser")
    header = ",\n".join(f" {J(k)}: {json.dumps(v, ensure_ascii=False, indent=2)}"
                        for k, v in bank.items())
    kropp = ",\n\n".join(rad_sats(s) for s in satser)
    return "{\n" + header + ',\n "satser": [\n\n' + kropp + "\n\n ]\n}\n"


def main():
    bank = json.loads(BANK.read_text())
    text = kanonisk_text(bank)

    if json.loads(text) != bank:
        raise SystemExit("FEL: formateringen ändrade innehållet — filen är inte skriven.")

    if text == BANK.read_text():
        print(f"{BANK.relative_to(ROOT)} — redan kanonisk, inget skrivet.")
        return
    BANK.write_text(text)
    print(f"Skrev {BANK.relative_to(ROOT)} — {len(bank['satser'])} satser, "
          f"{len(text.splitlines())} rader.")


if __name__ == "__main__":
    main()
