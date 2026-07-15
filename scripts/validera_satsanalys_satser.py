#!/usr/bin/env python3
"""Validerar json/satsanalys-satser.json.

    python3 scripts/validera_satsanalys_satser.py

Banken är hand­författad och delvis självägande, vilket gör den känsligare än
pronomen-satser.json:

  i_seminarier=true   satsen står ordagrant i seminarier.json:s `satser` och
                      får INTE glida.
  harledd_ur: "..."   satsen är en BEARBETNING av en mening arkivet har: spelet
                      behöver EN sats, källan ger en periodmening. Fältet bär
                      källmeningen ordagrant, och bankens ord måste vara en
                      DELSEKVENS av den. Delsekvens (inte prefix) är rätt test:
                      s5p1 plockar bort "ἐκ τοῦ οἴκου" mitt i satsen. Testet
                      faller om spelet hittat på ett ord som inte står i källan.
  varken eller        mastern äger satsen: konstruerade satser, samt de få
                      kursmeningar som byggts ut och därför inte är en
                      delsekvens av något. Kontrollen är att varje ord ska gå
                      att härleda ur ett verifierat paradigm.

Den viktigaste kontrollen är nog #3: en sats märkt i_seminarier=false som ändå
DYKER UPP i seminarier.json fälls. Utan den skulle en senare extraktion tyst ge
två sanningar om samma sats, och ingen märker vilken som är rätt.

Kontrollerna:
  0. kanoniskt format (kör formatera_satsanalys_satser.py)
  1. id unika; niva finns i _nivaer; kalla är kurs|skapad
  2. i_seminarier=true → finns i seminarier.json, grekiskan+översättningen matchar
  3. i_seminarier=false → finns INTE i seminarier.json (annars: backporta)
  3b. harledd_ur → källmeningen finns i seminarier.json och bankens ord är en
      delsekvens av den
  4. varje ord i en sats mastern äger själv härleds ur en paradigmkälla
  5. roll finns i _nycklar.roll eller roll_reserverade
  6. varje sats har exakt ett pred; subj XOR subjI
  7. _tackning stämmer

Accent-/versalnormalisering som i validera_pronomen_satser.py — se den för varför.
"""
import json
import sys
import unicodedata
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
from validera_pronomen_satser import norm, tokens, ordforrad, enklitisk_variant  # noqa: E402
from formatera_satsanalys_satser import kanonisk_text  # noqa: E402

ROOT = Path(__file__).resolve().parent.parent
BANK = ROOT / "json" / "satsanalys-satser.json"
SEMINARIER = ROOT / "json" / "seminarier.json"


def utan_akut(s):
    d = unicodedata.normalize("NFD", s).replace("́", "")
    return unicodedata.normalize("NFC", d)


def harledbar(w, lexikon, tillatna, lexikon_utan_akut):
    """Går ordet att härleda ur en verifierad paradigmkälla?

    Tre försök, i tur och ordning:
      1. rakt av
      2. utan enklitikans extra akut (ἄνθρωπός τις → ἄνθρωπος)
      3. helt utan akut. Enklitika tappar sin EGEN accent — εἰμί:s ἐστί(ν) står
         som ἐστι/ἐστιν i löptext — och paradigmet bär bara den betonade formen.
         Kontrollen gäller ordförråd, inte accentuering: att formen är rätt
         accentuerad är författarens ansvar, att ordet finns är maskinens.

    `tillatna` är bankens egen lista över ord som paradigmkällorna helt saknar
    (egennamn, partiklar). Den är explicit just för att ett NYTT okänt ord ska
    falla i stället för att glida igenom.
    """
    if norm(w) in tillatna:
        return True
    if norm(w) in lexikon:
        return True
    ek = enklitisk_variant(w)
    if ek and norm(ek) in lexikon:
        return True
    return utan_akut(norm(w)) in lexikon_utan_akut


def satstext(s):
    return " ".join(c["t"] for c in s["chunks"])


def delsekvens(liten, stor):
    """Är varje ord i `liten` med i `stor`, i samma ordning? Fångar både
    avkortning i änden och bortplock mitt i."""
    it = iter(stor)
    return all(any(w == s for s in it) for w in liten)


def satsnyckel(text):
    """Jämförbar nyckel för en sats. Chunkarna bär ingen slutinterpunktion medan
    seminarier.json gör det, så jämförelsen måste ske ord för ord — norm() ensam
    (accent + versal) räcker inte här, till skillnad från i pronomen-banken där
    båda sidor kom från samma sträng."""
    return " ".join(norm(w) for w in tokens(text))


def main():
    bank = json.loads(BANK.read_text())
    seminarier = [x for x in json.loads(SEMINARIER.read_text())["satser"] if x.get("grekiska")]
    kalla = {satsnyckel(x["grekiska"]): x for x in seminarier}
    roller = set(bank["_nycklar"]["roll"]) | (set(bank["_nycklar"]["roll_reserverade"]) - {"_om"})
    nivaer = set(bank["_nivaer"])
    lexikon = ordforrad()
    # Ordförråd som paradigmkällorna helt saknar. Explicit lista: ett NYTT okänt
    # ord ska falla, inte glida igenom.
    tillatna = {norm(w) for w in bank["_ordforrad_utanfor_paradigm"]}
    # utan_akut-jämförelsen är dyr per ord — bygg den en gång.
    lexikon_utan_akut = {utan_akut(x) for x in lexikon}

    fel = []
    sv_divergens = []
    def F(id_, msg):
        fel.append(f"  {id_}: {msg}")

    # 0. kanoniskt format
    if BANK.read_text() != kanonisk_text(bank):
        F("_format", "filen är inte i kanoniskt format "
                     "— kör: python3 scripts/formatera_satsanalys_satser.py")

    sedda = set()
    for s in bank["satser"]:
        # 1. grundfält
        if s["id"] in sedda:
            F(s["id"], "duplicerat id")
        sedda.add(s["id"])
        if str(s["niva"]) not in nivaer:
            F(s["id"], f'niva {s["niva"]} finns inte i _nivaer')
        if s["kalla"] not in ("kurs", "skapad"):
            F(s["id"], f'kalla "{s["kalla"]}" ska vara kurs eller skapad')
        if s["kalla"] == "skapad" and s["i_seminarier"]:
            F(s["id"], "kalla=skapad kan inte vara i_seminarier=true")

        gr = satstext(s)
        src = kalla.get(satsnyckel(gr))

        # 2 + 3. förhållandet till seminarier.json — åt båda hållen.
        # GREKISKAN valideras hårt: den är källtext och kan inte legitimt skilja.
        # SVENSKAN gör det inte, och det är avsiktligt: spelets sv är dess facit,
        # medan seminarier.json:s oversattning är arkivets. De skiljer sig i dag
        # på 16 satser, mest kosmetiskt (mastern saknar slutpunkt, bär
        # metakommentarer som "(förenat)") och ibland som ren synonymi
        # (λόγος = ord/berättelse). Att tvinga fram likhet vore att importera
        # OCR-brus in i facit. Divergenserna rapporteras i stället nedan.
        if s["i_seminarier"]:
            if not src:
                F(s["id"], f"i_seminarier=true men grekiskan finns inte i "
                           f"seminarier.json (drift? stavfel?):\n      {gr}")
            elif src.get("oversattning") != s["sv"]:
                sv_divergens.append((s["id"], s["sv"], src["oversattning"]))
        else:
            if src:
                F(s["id"], "i_seminarier=false men satsen HAR dykt upp i "
                           "seminarier.json — sätt i_seminarier=true och "
                           "stäm av texten, annars finns två sanningar")
            if "harledd_ur" in s:
                # 3b. bearbetning av en arkiverad mening
                kalltext = kalla.get(satsnyckel(s["harledd_ur"]))
                if not kalltext:
                    F(s["id"], f'harledd_ur finns inte i seminarier.json:\n'
                               f'      {s["harledd_ur"]}')
                elif not delsekvens([norm(w) for w in tokens(gr)],
                                    [norm(w) for w in tokens(s["harledd_ur"])]):
                    F(s["id"], "bankens ord är inte en delsekvens av harledd_ur "
                               "— spelet har lagt till eller ändrat något som "
                               "inte står i källan")
            else:
                # 4. mastern äger satsen → varje ord måste gå att härleda
                for w in tokens(gr):
                    if not harledbar(w, lexikon, tillatna, lexikon_utan_akut):
                        F(s["id"], f'ordet "{w}" går inte att härleda ur någon '
                                   f'paradigmkälla — stavfel, eller lägg till det i '
                                   f'_ordforrad_utanfor_paradigm med skäl')

        # 5 + 6. chunks
        for c in s["chunks"]:
            if c["roll"] not in roller:
                F(s["id"], f'okänd roll "{c["roll"]}"')
        pred = [c for c in s["chunks"] if c["roll"] == "pred"]
        if len(pred) != 1:
            F(s["id"], f"{len(pred)} pred-chunks, ska vara exakt 1")
        har_subj = any(c["roll"] == "subj" for c in s["chunks"])
        if har_subj and s.get("subjI"):
            F(s["id"], "både subj-chunk och subjI — subjektet står på ett ställe")
        if not har_subj and not s.get("subjI"):
            F(s["id"], "varken subj-chunk eller subjI")

    # 7. _tackning
    t = bank["_tackning"]
    fakta = {
        "satser": len(bank["satser"]),
        "validerbara_mot_seminarier": sum(1 for s in bank["satser"] if s["i_seminarier"]),
        "harledda_ur_seminarier": sum(1 for s in bank["satser"] if "harledd_ur" in s),
        "mastern_ager_sjalv": sum(1 for s in bank["satser"]
                                  if not s["i_seminarier"] and "harledd_ur" not in s),
    }
    for k, v in fakta.items():
        if t[k] != v:
            F("_tackning", f"{k} säger {t[k]}, faktiskt {v}")

    if fel:
        print(f"{len(fel)} fel:\n" + "\n".join(fel))
        sys.exit(1)

    print(f'OK — {fakta["satser"]} satser: '
          f'{fakta["validerbara_mot_seminarier"]} validerade ordagrant mot seminarier.json, '
          f'{fakta["harledda_ur_seminarier"]} härledda ur en arkiverad mening, '
          f'{fakta["mastern_ager_sjalv"]} som mastern äger själv. Inga fel.\n')

    per_roll, per_niva = {}, {}
    for s in bank["satser"]:
        per_niva[s["niva"]] = per_niva.get(s["niva"], 0) + 1
        for c in s["chunks"]:
            per_roll[c["roll"]] = per_roll.get(c["roll"], 0) + 1
    print("chunks per roll:")
    for k, v in sorted(per_roll.items(), key=lambda x: -x[1]):
        print(f'  {k:8s} {v:3d}  {bank["_nycklar"]["roll"][k].split(".")[0]}')
    oanvanda = sorted(set(bank["_nycklar"]["roll"]) - set(per_roll))
    if oanvanda:
        print(f"  (definierade men oanvända: {', '.join(oanvanda)})")
    print("\nsatser per nivå:")
    for n in sorted(per_niva):
        print(f'  {n:2d}: {per_niva[n]:2d}  {bank["_nivaer"][str(n)]}')

    if sv_divergens:
        print(f"\n{len(sv_divergens)} satser översätts annorlunda än seminarier.json "
              f"(inte ett fel — se kommentaren vid kontroll 2):")
        for id_, spel, master in sv_divergens:
            print(f"  {id_}\n    spel:   {spel}\n    master: {master}")


if __name__ == "__main__":
    main()
