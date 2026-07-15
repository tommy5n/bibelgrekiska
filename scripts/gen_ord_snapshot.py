#!/usr/bin/env python3
"""Genererar vyer/ord-data.js ur json/ord.json — delad av ändelse- och paradigmspelet.

    python3 scripts/gen_ord_snapshot.py

Snapshoten låg tidigare som en VERBATIM-KOPIA i både vyer/andelser.js och
vyer/paradigm.js: ~138 rader dubblerade, och inget som fällde om bara den ena
uppdaterades. Nu bor den på ett ställe och båda vyerna importerar den.

UNDANTAGET ÄR NU EN REGEL, INTE EN FRÅNVARO. Spelen härleder paradigmet ur genus
(`paradigmKey`), vilket bara fungerar för 2:a deklinationens maskulina/neutrala
och 1:a deklinationens femininer. Övriga ord måste undantas, och det gjordes
förut genom att de helt enkelt inte fanns i snapshoten — omöjligt att se, och
lätt att göra fel åt båda hållen. Faktiskt fel 2026-07-09: διδάσκαλος, οἶνος och
παραβολή lades i ord.json för sem 6 men aldrig i snapshoten, trots att
paradigmKey klarar dem. De har alltså saknats i spelen sedan dess.

Regeln nedan tar tillbaka dem och håller de andra ute — av dokumenterat skäl.
Undantagen skrivs ut vid varje körning, så de går att granska.
"""
import json
import re
import unicodedata
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
MASTER = ROOT / "json" / "ord.json"
UT = ROOT / "vyer" / "ord-data.js"

GENUS = {"maskulinum": "m", "femininum": "f", "neutrum": "n"}


def spelbar(o):
    """Klarar paradigmKey ordet? Returnerar (ja, skäl-om-nej).

    paradigmKey ser bara genus och ändelser — aldrig deklination. Den mappar
    m→m2, n→n2, f→1:a deklinationen. Ord där den mappningen är fel måste ut,
    annars rättar spelet mot fel paradigm utan att någon märker det."""
    g, d = o["genus"], o.get("deklination")
    if d == 3:
        return False, "3:e deklinationen (paradigmKey ger m2/n2 → fel facit; ἡγεμών m → 'm2')"
    if g == "femininum" and d == 2:
        return False, "2:a deklinationens femininer (böjs som m2, men paradigmKey ser f → 1:a dekl)"
    if g == "maskulinum" and d == 1:
        return False, "1:a deklinationens maskulina (böjs som f1, men paradigmKey ser m → m2)"
    return True, None


def jsstr(s):
    return '"' + s.replace("\\", "\\\\").replace('"', '\\"') + '"'


def rad_ord(o):
    falt = [f'lemma:{jsstr(o["lemma"])}', f'glosa:{jsstr(o["glosa"])}']
    for k in ("glosaGen", "glosaPl", "glosaGenPl"):
        if o.get(k):
            falt.append(f"{k}:{jsstr(o[k])}")
    falt.append(f'genus:{jsstr(GENUS[o["genus"]])}')
    falt.append("sem:[" + ", ".join(str(s) for s in o.get("seminarium", [])) + "]")
    former = ", ".join(
        f'{k}:{{sg:{jsstr(o["former"][k]["sg"])},pl:{jsstr(o["former"][k]["pl"])}}}'
        for k in ("nom", "gen", "dat", "ack", "vok") if k in o["former"])
    return "  { " + ", ".join(falt) + ", former:{\n    " + former + " }},"


HUVUD = '''// Delad orddata för ändelsespelet (#7) och paradigmspelet (#10).
// GENERERAD ur json/ord.json — redigera inte här:
//     python3 scripts/gen_ord_snapshot.py
//
// Låg tidigare som verbatim-kopia i båda vyerna. Ordurvalet är INTE hela
// ord.json: paradigmKey härleder paradigmet ur genus, så ord där den mappningen
// blir fel är undantagna av generatorn. Se dess docstring för regeln och skälen.
'''

SVANS = '''
// Bestämd artikel. Bor här, inte i json/ — den är oböjlig och delas av vyerna.
export const ARTIKEL = {
  m:{ nom:{sg:"ὁ",pl:"οἱ"}, gen:{sg:"τοῦ",pl:"τῶν"}, dat:{sg:"τῷ",pl:"τοῖς"}, ack:{sg:"τὸν",pl:"τοὺς"}, vok:{sg:"ὦ",pl:"ὦ"} },
  n:{ nom:{sg:"τὸ",pl:"τὰ"}, gen:{sg:"τοῦ",pl:"τῶν"}, dat:{sg:"τῷ",pl:"τοῖς"}, ack:{sg:"τὸ",pl:"τὰ"}, vok:{sg:"ὦ",pl:"ὦ"} },
  f:{ nom:{sg:"ἡ",pl:"αἱ"}, gen:{sg:"τῆς",pl:"τῶν"}, dat:{sg:"τῇ",pl:"ταῖς"}, ack:{sg:"τὴν",pl:"τὰς"}, vok:{sg:"ὦ",pl:"ὦ"} },
};
export const END = {
  m2:{ nom:{sg:"ος",pl:"οι"}, gen:{sg:"ου",pl:"ων"}, dat:{sg:"ῳ",pl:"οις"}, ack:{sg:"ον",pl:"ους"}, vok:{sg:"ε",pl:"οι"} },
  n2:{ nom:{sg:"ον",pl:"α"},  gen:{sg:"ου",pl:"ων"}, dat:{sg:"ῳ",pl:"οις"}, ack:{sg:"ον",pl:"α"},   vok:{sg:"ον",pl:"α"} },
  f1h:{nom:{sg:"η",pl:"αι"},  gen:{sg:"ης",pl:"ων"}, dat:{sg:"ῃ",pl:"αις"}, ack:{sg:"ην",pl:"ας"},  vok:{sg:"η",pl:"αι"} },
  f1a:{nom:{sg:"α",pl:"αι"},  gen:{sg:"ας",pl:"ων"}, dat:{sg:"ᾳ",pl:"αις"}, ack:{sg:"αν",pl:"ας"},  vok:{sg:"α",pl:"αι"} },
  f1m:{nom:{sg:"α",pl:"αι"},  gen:{sg:"ης",pl:"ων"}, dat:{sg:"ῃ",pl:"αις"}, ack:{sg:"αν",pl:"ας"},  vok:{sg:"α",pl:"αι"} },
};
export const PARADIGM_NAMN = { m2:"deklination 2 (-ος)", n2:"deklination 2, neutrum (-ον)",
  f1h:"deklination 1, η-stam", f1a:"deklination 1, ren α", f1m:"deklination 1, blandad α" };

// Exakt samma teckenuppsättning som vyerna hade var för sig: grav, akut,
// cirkumflex, båda andetecknen, trema, makron, breve. INTE ett intervall
// (\\u0300-\\u036f) — det skulle även strippa iota subscriptum (\\u0345). Ingen
// av paradigmKeys jämförelser råkar bero på det i dag, men en flytt ska inte
// ändra beteende på köpet.
const strip = s => s.normalize("NFD").replace(/[\\u0300\\u0301\\u0342\\u0313\\u0314\\u0308\\u0304\\u0306]/g, "").normalize("NFC");

// FÄLLA: härleder paradigmet ur GENUS, inte ur deklination. Fungerar bara för
// orden generatorn släpper igenom — 3:e deklinationen, 2:a-dekl femininer och
// 1:a-dekl maskulina får tyst fel facit och är därför undantagna i ord-data.
export function paradigmKey(o){
  if(o.genus==="m") return "m2";
  if(o.genus==="n") return "n2";
  if(strip(o.former.nom.sg).endsWith("η")) return "f1h";
  return strip(o.former.gen.sg).endsWith("ας") ? "f1a" : "f1m";
}
'''


def main():
    master = json.loads(MASTER.read_text())["ord"]
    med, ute = [], []
    for o in master:
        ja, skal = spelbar(o)
        (med if ja else ute).append((o, skal))

    rader = [rad_ord(o) for o, _ in med]
    rader[-1] = rader[-1].rstrip(",")
    UT.write_text(HUVUD + "export const ord = [\n" + "\n".join(rader) + "\n];\n" + SVANS)

    print(f"Skrev {UT.relative_to(ROOT)} — {len(med)} ord av {len(master)} i mastern.")
    print(f"\n{len(ute)} undantagna, per regel:")
    per = {}
    for o, skal in ute:
        per.setdefault(skal, []).append(o["lemma"])
    for skal, lemman in per.items():
        print(f"  {skal}")
        print(f"    {', '.join(lemman)}")


if __name__ == "__main__":
    main()
