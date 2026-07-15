#!/usr/bin/env python3
"""Validerar json/pronomen-satser.json mot sina två källor.

    python3 scripts/validera_pronomen_satser.py

Meningsbanken är hand­författad ovanpå två master-filer och kan glida ifrån dem:

  seminarier.json  äger grekiskan och översättningen. Banken får inte ändra dem —
                   den lägger bara till målanalysen (lemma/analys/roll/sv).
  pronomen.json    äger formerna. En måls analys måste ge exakt den form som står
                   i satsen, annars är analysen fel.

Satser med kalla="skapad" står inte i kursmaterialet och har ingen källa att
jämföras mot. För dem gäller ett hårdare krav i stället: VARJE ord måste gå att
härleda ur en verifierad paradigmkälla (ord.json, verb.json, adjektiv.json,
pronomen.json, artikeln i vyer/ord-data.js). Ett ord som inte kan härledas är
antingen felstavat eller påhittat, och båda ska falla.

Kontrollerna:
  0. filen är i kanoniskt format (annars är den inte handredigerbar längre)
  1. id är unika
  2. grekiska/oversattning/seminarium/kalla/sida oförändrade mot seminarier.json
     (kalla != "skapad")
  3. varje ord härleds ur en paradigmkälla (kalla == "skapad")
  4. varje mål-form står i satsen, och n pekar på en förekomst som finns
  5. mål-formen är den form analysen förutsäger enligt pronomen.json
  6. roll finns i _nycklar.roll eller roll_reserverade, sv är ifyllt
  7. _tackning stämmer med innehållet

Accenter: löptext har grav accent där paradigmet har akut (αὐτὸν mot αὐτόν), och
satsinitialt står versal (Τί mot τί). Jämförelser normaliseras för båda. Enklitika
kastar dessutom en extra akut bakåt (ἄνθρωπός τις) — den varianten prövas separat
i ordhärledningen.
"""
import json
import re
import sys
import unicodedata
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
from formatera_pronomen_satser import kanonisk_text  # noqa: E402  (samma katalog)

ROOT = Path(__file__).resolve().parent.parent
BANK = ROOT / "json" / "pronomen-satser.json"
SEMINARIER = ROOT / "json" / "seminarier.json"
PRONOMEN = ROOT / "json" / "pronomen.json"
ORD = ROOT / "json" / "ord.json"
VERB = ROOT / "json" / "verb.json"
ADJEKTIV = ROOT / "json" / "adjektiv.json"
PREPOSITIONER = ROOT / "json" / "prepositioner.json"
ORD_DATA = ROOT / "vyer" / "ord-data.js"

SKILJETECKEN = ".,;:·;?!()»«\"'’·[]…"


def norm(s):
    """Grav → akut, versal → gemen. Gör löptext jämförbar med paradigmform."""
    d = unicodedata.normalize("NFD", s).replace("̀", "́")
    return unicodedata.normalize("NFC", d).lower()


def tokens(grekiska):
    return [w for w in (t.strip(SKILJETECKEN) for t in grekiska.split()) if w]


def former_for(mal, pron):
    """Formen/formerna som målets analys förutsäger. genus kan vara 'm|f'."""
    p = pron[mal["lemma"]]
    a = mal["analys"]
    if mal["modell"] == "person":
        return [p["former"][a["num"]][a["kas"]][a["bet"]]]
    return [p["former"][g][a["kas"]][a["num"]] for g in a["genus"].split("|")]


def platta(nod, ut):
    """Samlar varje strängvärde ur en godtyckligt nästlad form-struktur."""
    if isinstance(nod, str):
        ut.add(nod)
    elif isinstance(nod, dict):
        for v in nod.values():
            platta(v, ut)
    elif isinstance(nod, list):
        for v in nod:
            platta(v, ut)


def artikelformer():
    """Artikeln bor i vyer/ord-data.js, inte i json/ — den är oböjlig och delas
    av ändelse- och paradigmspelet. (Låg fram till 2026-07-15 kopierad i båda
    vyerna; den här kontrollen läste den ur paradigm.js och föll när kopiorna
    ersattes av den delade modulen.)"""
    m = re.search(r"export const ARTIKEL = \{.*?\n\};", ORD_DATA.read_text(), re.S)
    if not m:
        raise SystemExit("Hittade ingen ARTIKEL i vyer/ord-data.js — "
                         "kör scripts/gen_ord_snapshot.py")
    return set(re.findall(r'"([^"]+)"', m.group(0)))


def ordforrad():
    """Varje form som går att härleda ur en verifierad paradigmkälla."""
    ut = set()
    for fil, nyckel in ((ORD, "ord"), (VERB, "verb"), (ADJEKTIV, "adjektiv"),
                        (PRONOMEN, "pronomen")):
        for post in json.loads(fil.read_text())[nyckel]:
            platta(post.get("former", {}), ut)
    ut |= artikelformer()
    # Prepositioner är oböjliga: lemmat är formen.
    ut |= {p["lemma"] for p in json.loads(PREPOSITIONER.read_text())["prepositioner"]}

    # (ν) = rörligt slut-ny: både med och utan är giltiga.
    for f in list(ut):
        if "(ν)" in f:
            ut.add(f.replace("(ν)", ""))
            ut.add(f.replace("(ν)", "ν"))
    return {norm(f) for f in ut if f}


def enklitisk_variant(w):
    """Ett ord före ett enklitikon får en extra akut på ultiman (ἄνθρωπός τις).
    Ge tillbaka ordet utan den, så det kan matchas mot sin paradigmform."""
    d = unicodedata.normalize("NFD", w)
    if d.count("́") < 2:
        return None
    i = d.rfind("́")
    return unicodedata.normalize("NFC", d[:i] + d[i + 1:])


def main():
    bank = json.loads(BANK.read_text())
    seminarier = json.loads(SEMINARIER.read_text())["satser"]
    pron = {p["lemma"]: p for p in json.loads(PRONOMEN.read_text())["pronomen"]}
    roller = set(bank["_nycklar"]["roll"])
    reserverade = set(bank["_nycklar"]["roll_reserverade"]) - {"_om"}
    lexikon = ordforrad()

    fel = []
    def F(id_, msg):
        fel.append(f"  {id_}: {msg}")

    # 0. kanoniskt format. Mastern redigeras för hand; ett skript som skrivit om
    #    den med json.dumps gör den ~5x längre och oläsbar. Att bara HA en
    #    formaterare räcker inte — den glöms. Här faller bygget i stället.
    if BANK.read_text() != kanonisk_text(bank):
        F("_format", "filen är inte i kanoniskt format "
                     "— kör: python3 scripts/formatera_pronomen_satser.py")

    # 1. id-unika
    sedda = set()
    for s in bank["satser"]:
        if s["id"] in sedda:
            F(s["id"], "duplicerat id")
        sedda.add(s["id"])

    # 2. oförändrat mot seminarier.json (bara kursmaterial)
    kalla = {norm(x["grekiska"]): x for x in seminarier if x.get("grekiska")}
    for s in bank["satser"]:
        if s["kalla"] == "skapad":
            if "sida" in s:
                F(s["id"], "kalla='skapad' ska inte ha sida")
            continue
        src = kalla.get(norm(s["grekiska"]))
        if not src:
            F(s["id"], "grekiskan finns inte i seminarier.json")
            continue
        for falt in ("oversattning", "seminarium", "kalla", "sida"):
            if src.get(falt) != s.get(falt):
                F(s["id"], f"{falt} avviker från seminarier.json\n"
                           f"      bank:   {s.get(falt)!r}\n"
                           f"      master: {src.get(falt)!r}")

    # 3. konstruerade satser: varje ord måste gå att härleda
    for s in bank["satser"]:
        if s["kalla"] != "skapad":
            continue
        for w in tokens(s["grekiska"]):
            if norm(w) in lexikon:
                continue
            utan = enklitisk_variant(w)
            if utan and norm(utan) in lexikon:
                continue
            F(s["id"], f'ordet "{w}" går inte att härleda ur någon paradigmkälla')

    # 4 + 5. målen
    for s in bank["satser"]:
        ord_ = [norm(w) for w in tokens(s["grekiska"])]
        for m in s["mal"]:
            n = m.get("n", 1)
            traffar = ord_.count(norm(m["form"]))
            if traffar == 0:
                F(s["id"], f'formen "{m["form"]}" står inte i satsen')
                continue
            if traffar < n:
                F(s["id"], f'formen "{m["form"]}" förekommer {traffar} ggr, men n={n}')
            if traffar > 1 and "n" not in m:
                F(s["id"], f'formen "{m["form"]}" förekommer {traffar} ggr men saknar n')

            if m["lemma"] not in pron:
                F(s["id"], f'okänt lemma {m["lemma"]}')
                continue
            if pron[m["lemma"]]["bojningsmodell"] != m["modell"]:
                F(s["id"], f'modell "{m["modell"]}" != pronomen.json '
                           f'"{pron[m["lemma"]]["bojningsmodell"]}" ({m["lemma"]})')
                continue
            vantade = {norm(f.replace("(ν)", "")) for f in former_for(m, pron) if f}
            if norm(m["form"].strip(SKILJETECKEN)) not in vantade:
                F(s["id"], f'analysen ger [{", ".join(sorted(vantade))}] '
                           f'men texten har "{m["form"]}" '
                           f'({m["lemma"]} {json.dumps(m["analys"], ensure_ascii=False)})')

            # 6. roll + sv
            if m["roll"] not in roller | reserverade:
                F(s["id"], f'okänd roll "{m["roll"]}"')
            if not m.get("sv", "").strip():
                F(s["id"], "tomt sv")

    # 7. _tackning
    antal_satser = len(bank["satser"])
    antal_mal = sum(len(s["mal"]) for s in bank["satser"])
    skapade = sum(1 for s in bank["satser"] if s["kalla"] == "skapad")
    t = bank["_tackning"]
    for nyckel, faktisk in (("satser", antal_satser), ("mal", antal_mal),
                            ("skapade", skapade),
                            ("kursmaterial", antal_satser - skapade)):
        if t[nyckel] != faktisk:
            F("_tackning", f"{nyckel} säger {t[nyckel]}, faktiskt {faktisk}")

    if fel:
        print(f"{len(fel)} fel:\n" + "\n".join(fel))
        sys.exit(1)

    print(f"OK — {antal_satser} satser ({antal_satser - skapade} ur kursmaterialet, "
          f"{skapade} konstruerade), {antal_mal} mål, inga fel.\n")

    # ── Täckning: vad går att spela, och var är luckorna? ──
    per_lemma, per_roll, per_sem = {}, {}, {}
    for s in bank["satser"]:
        per_sem[s["seminarium"]] = per_sem.get(s["seminarium"], 0) + len(s["mal"])
        for m in s["mal"]:
            per_lemma[m["lemma"]] = per_lemma.get(m["lemma"], 0) + 1
            per_roll[m["roll"]] = per_roll.get(m["roll"], 0) + 1

    print("mål per seminarium:")
    for k in sorted(per_sem):
        print(f"  sem {k}: {per_sem[k]}")
    print("\nmål per roll:")
    for k, v in sorted(per_roll.items(), key=lambda x: -x[1]):
        print(f"  {k:8s} {v:3d}  {bank['_nycklar']['roll'][k].split('.')[0]}")
    oanvanda = sorted(roller - set(per_roll))
    if oanvanda:
        print(f"  (definierade men oanvända: {', '.join(oanvanda)})")
    print(f"  (reserverade för senare grammatik: {', '.join(sorted(reserverade))})")

    print("\nmål per lemma (alla pronomen i pronomen.json):")
    for lemma, p in pron.items():
        n = per_lemma.get(lemma, 0)
        flagga = "  ← LUCKA" if n == 0 else ("  ← tunt" if n < 3 else "")
        print(f"  {lemma:10s} {n:3d}  sem{p['seminarium']}{flagga}")

    # Hur ofta räcker inte formen? Det är hela skälet till att banken finns.
    formindex = {}
    for p in pron.values():
        if p["bojningsmodell"] == "person":
            for num in ("sg", "pl"):
                for kas in ("nom", "gen", "dat", "ack"):
                    for bet in ("betonad", "obetonad"):
                        f = p["former"][num][kas][bet]
                        if f:
                            formindex.setdefault(norm(f), set()).add(
                                f'{p["lemma"]} {num} {kas} {bet}')
        else:
            for g in ("m", "f", "n"):
                for kas in ("nom", "gen", "dat", "ack"):
                    for num in ("sg", "pl"):
                        f = p["former"][g][kas][num]
                        if f:
                            formindex.setdefault(norm(f.replace("(ν)", "")), set()).add(
                                f'{p["lemma"]} {g} {num} {kas}')

    tvetydiga = sum(
        1 for s in bank["satser"] for m in s["mal"]
        if len(formindex.get(norm(m["form"].strip(SKILJETECKEN)), ())) > 1)
    print(f"\n{tvetydiga} av {antal_mal} mål ({round(100 * tvetydiga / antal_mal)}%) "
          f"har en form som ensam tillåter fler än en analys.\n"
          f"Det är de målen kontexten finns för.")


if __name__ == "__main__":
    main()
