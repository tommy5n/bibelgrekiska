#!/usr/bin/env python3
"""Formaterar om json/pronomen-satser.json till kompakt, handredigerbar layout.

    python3 scripts/formatera_pronomen_satser.py

Mastern underhålls för hand: en sats ska gå att läsa och rätta som ett block,
inte som 30 rader. json.dumps(indent=…) spränger ut varje nyckel på egen rad och
gör filen nästan fem gånger så lång (538 → 2577 rader). Kör det här efter varje
programmatisk ändring.

`kanonisk_text()` är sanningen om formatet och importeras av
validera_pronomen_satser.py, som FALLER om filen på disk avviker. Därför kan man
inte glömma att köra formateraren — en osnygg master är ett valideringsfel, inte
något man upptäcker långt senare. Håll formatlogiken här, inte på två ställen.

Layouten: header med indent 2, sedan ett block per sats med målen indragna under.
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


def kanonisk_text(bank):
    """Bankens kanoniska filtext. Muterar inte `bank` — validatorn skickar in
    sitt eget inlästa objekt och ska få tillbaka det orört."""
    bank = dict(bank)                       # grund kopia: pop får ej slå tillbaka
    satser = bank.pop("satser")
    header = ",\n".join(f" {J(k)}: {json.dumps(v, ensure_ascii=False, indent=2)}"
                        for k, v in bank.items())
    kropp = ",\n\n".join(rad_sats(s) for s in satser)
    return "{\n" + header + ',\n "satser": [\n\n' + kropp + "\n\n ]\n}\n"


def main():
    bank = json.loads(BANK.read_text())
    text = kanonisk_text(bank)

    # Rundgångskontroll: formateringen får aldrig ändra innehållet.
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
