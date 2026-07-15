#!/usr/bin/env python3
"""Regenererar satsbank-snapshoten i vyer/pronomen.js ur json/pronomen-satser.json.

    python3 scripts/validera_pronomen_satser.py && \
    python3 scripts/gen_pronomen_satser_snapshot.py

Spelvyerna bär inbäddade snapshots och läser inte json/ vid runtime — samma
mönster som gen_pronomen_snapshot.py. Kör efter varje ändring i mastern.

Två saker görs här i stället för i webbläsaren:

  Tokenisering. Mastern pekar ut sitt mål med form + ordningstal ("andra μου i
  satsen"), vilket är läsbart för hand men kräver accent- och versalnormalisering
  för att slås upp. Den upplösningen görs här, en gång, och snapshoten bär ett
  färdigt ordindex (i). Vyn behöver då varken normalisera eller söka — den
  renderar ord[] och märker ut ord[i].

  Utplattning. analys{num,kas,bet} / analys{genus,num,kas} plattas till fält
  direkt på målet, så ett mål får samma form som ett kort ur kombosFor() och kan
  matchas mot spelets befintliga urvalsdimensioner utan översättningslager.

  Tvetydigheten (ocksa[]). För varje mål räknas ut vad den NAKNA formen också
  hade kunnat betyda, med svenskan ur pronomen.json:s glosa_kasus. αὐτοῦ i
  "hans ord" får ocksa:[{sv:"dess"}] — för formen är också neutrum. Det är
  spelets bästa distraktorer: de är inte gissningar utan de andra svar formen
  faktiskt tillåter, och det är precis dem kontexten ska utesluta. Fältet
  beräknas här och inte i vyn, eftersom matchningen kräver accentnormalisering
  (löptextens αὐτὸν mot paradigmets αὐτόν).

Faller om ett mål inte går att peka ut. Kör validatorn först — den ger bättre fel.
"""
import json
import re
import unicodedata
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
MASTER = ROOT / "json" / "pronomen-satser.json"
PRONOMEN = ROOT / "json" / "pronomen.json"
VY = ROOT / "vyer" / "pronomen.js"

SKILJETECKEN = ".,;:·;?!()»«\"'’·[]…"
KASUS = ["nom", "gen", "dat", "ack"]
NUM = ["sg", "pl"]
GENUS = ["m", "f", "n"]

# Facit skrivs ut i klartext — spelet visar aldrig "n sg gen" på en rad och
# "neutrum genitiv singular" på nästa.
KASUS_SV = {"nom": "nominativ", "gen": "genitiv", "dat": "dativ", "ack": "ackusativ"}
NUM_SV = {"sg": "singular", "pl": "plural"}
GENUS_SV = {"m": "maskulinum", "f": "femininum", "n": "neutrum"}

# Kursens filnamn är saneringar ("7__O_vningsblad.pdf") och duger inte som
# källhänvisning. Kartan är uttömmande; en okänd fil ska falla, inte visas trasig.
KALLA_SV = {
    "Breakout_rooms": "Breakout rooms",
    "O_vningsblad": "Övningsblad",
}


def norm(s):
    d = unicodedata.normalize("NFD", s).replace("̀", "́")
    return unicodedata.normalize("NFC", d).lower()


def jsstr(s):
    return '"' + s.replace("\\", "\\\\").replace('"', '\\"') + '"'


def ordindex(grekiska, form, n):
    """Index för n:te förekomsten av form bland satsens ord."""
    ord_ = grekiska.split()
    traff = 0
    for i, w in enumerate(ord_):
        if norm(w.strip(SKILJETECKEN)) == norm(form.strip(SKILJETECKEN)):
            traff += 1
            if traff == n:
                return i
    raise SystemExit(f'Hittade inte förekomst {n} av "{form}" i: {grekiska}')


def kallatext(s):
    """Läsbar källhänvisning: '7__O_vningsblad.pdf' s.1 -> 'Övningsblad 7, s. 1'."""
    if s["kalla"] == "skapad":
        return "Konstruerad sats — står inte i kursmaterialet."
    m = re.fullmatch(r"(\d+)__(.+)\.pdf", s["kalla"])
    if not m or m.group(2) not in KALLA_SV:
        raise SystemExit(f'Okänd källfil "{s["kalla"]}" ({s["id"]}) — lägg till den i KALLA_SV.')
    ut = f"{KALLA_SV[m.group(2)]} {m.group(1)}"
    return ut + (f", s. {s['sida']}" if "sida" in s else "")


def formindex(pron):
    """norm(form) -> [{etikett, sv}] för varje analys formen tillåter."""
    idx = {}
    def lagg(form, etikett, sv):
        if not form:
            return
        naken = form.replace("(ν)", "")
        for v in {naken, naken + "ν"} if "(ν)" in form else {naken}:
            idx.setdefault(norm(v), []).append({"etikett": etikett, "sv": sv})

    for p in pron:
        if p["bojningsmodell"] == "person":
            for n in NUM:
                for k in KASUS:
                    for b in ("betonad", "obetonad"):
                        lagg(p["former"][n][k][b],
                             f'{p["lemma"]} {KASUS_SV[k]} {NUM_SV[n]}, {b}',
                             p["glosa_kasus"][n][k])
        else:
            for g in GENUS:
                for k in KASUS:
                    for n in NUM:
                        lagg(p["former"][g][k][n],
                             f'{p["lemma"]} {GENUS_SV[g]} {KASUS_SV[k]} {NUM_SV[n]}',
                             p["glosa_kasus"][g][n][k])
    return idx


def egna_etiketter(m):
    """Målets egen analys som etikett(er) — samma format som formindex(), annars
    känns den inte igen och målet får sig själv som distraktor. genus 'm|f' ger
    en etikett per genus."""
    a = m["analys"]
    if m["modell"] == "person":
        return {f'{m["lemma"]} {KASUS_SV[a["kas"]]} {NUM_SV[a["num"]]}, {a["bet"]}'}
    return {f'{m["lemma"]} {GENUS_SV[g]} {KASUS_SV[a["kas"]]} {NUM_SV[a["num"]]}'
            for g in a["genus"].split("|")}


def andra_analyser(m, idx):
    """Vad den nakna formen OCKSÅ kan betyda — bara genuint ANDRA analyser.

    Två sorters kandidater rensas bort, och båda skulle bli orättvisa frågor:

      Målets egen analys. pronomen.json ger ὑμῖν den generiska glosan 'till er';
      i κηρύσσουσιν ὑμῖν är den kontextuella översättningen 'för er'. Samma
      analys, annan formulering — 'till er' är inte fel, bara mindre idiomatiskt,
      och får inte erbjudas som felsvar.

      Målets egen svenska och dess godtagna alternativ (alt[]).
    """
    egna_sv = {m["sv"]} | set(m.get("alt", []))
    egna_a = egna_etiketter(m)
    ut, sedda = [], set()
    for kand in idx.get(norm(m["form"].strip(SKILJETECKEN)), []):
        if kand["etikett"] in egna_a or kand["sv"] in egna_sv or kand["sv"] in sedda:
            continue
        sedda.add(kand["sv"])
        ut.append(kand)
    return ut


def rad_mal(m, sats, idx):
    a = m["analys"]
    falt = [f'i:{ordindex(sats["grekiska"], m["form"], m.get("n", 1))}',
            f'form:{jsstr(m["form"])}', f'lemma:{jsstr(m["lemma"])}',
            f'modell:{jsstr(m["modell"])}']
    if m["modell"] == "person":
        falt += [f'num:{jsstr(a["num"])}', f'kas:{jsstr(a["kas"])}',
                 f'bet:{jsstr(a["bet"])}', "genus:null"]
    else:
        falt += [f'num:{jsstr(a["num"])}', f'kas:{jsstr(a["kas"])}',
                 "bet:null", f'genus:{jsstr(a["genus"])}']
    falt += [f'roll:{jsstr(m["roll"])}', f'sv:{jsstr(m["sv"])}']
    if m.get("alt"):
        falt.append("alt:[" + ", ".join(jsstr(x) for x in m["alt"]) + "]")
    ocksa = andra_analyser(m, idx)
    if ocksa:
        falt.append("ocksa:[" + ", ".join(
            "{sv:" + jsstr(o["sv"]) + ", etikett:" + jsstr(o["etikett"]) + "}"
            for o in ocksa) + "]")
    if m.get("not"):
        falt.append(f'not:{jsstr(m["not"])}')
    return "      { " + ", ".join(falt) + " }"


def rad_sats(s, idx):
    ord_ = ", ".join(jsstr(w) for w in s["grekiska"].split())
    mal = ",\n".join(rad_mal(m, s, idx) for m in s["mal"])
    return (f'  {{ id:{jsstr(s["id"])}, sem:{s["seminarium"]}, '
            f'skapad:{"true" if s["kalla"] == "skapad" else "false"},\n'
            f'    kalla:{jsstr(kallatext(s))},\n'
            f'    sv:{jsstr(s["oversattning"])},\n'
            f"    ord:[{ord_}],\n"
            f"    mal:[\n{mal} ] }},")


def main():
    bank = json.loads(MASTER.read_text())
    satser = bank["satser"]
    idx = formindex(json.loads(PRONOMEN.read_text())["pronomen"])

    rader = [rad_sats(s, idx) for s in satser]
    rader[-1] = rader[-1].rstrip(",")
    array = "const satser = [\n" + "\n".join(rader) + "\n];"

    roller = bank["_nycklar"]["roll"]
    # Etiketten spelet visar = första meningen i nyckelns beskrivning; resten är
    # förklaring till den som läser mastern. Ordningen bevaras och styr pickern.
    roll_js = ("const ROLL = {\n" + "\n".join(
        f"  {jsstr(k)}: {jsstr(v.split('.')[0])}," for k, v in roller.items()
    ).rstrip(",") + "\n};\nconst ROLL_ORDNING = Object.keys(ROLL);")

    src = VY.read_text()
    for monster, ersattning, namn in (
            (r"const satser = \[.*?\n\];", array, "const satser = [...]"),
            (r"const ROLL = \{.*?\n\};\nconst ROLL_ORDNING = .*?;", roll_js,
             "const ROLL = {...}")):
        src, n = re.subn(monster, lambda m: ersattning, src, count=1, flags=re.S)
        if not n:
            raise SystemExit(f"Hittade ingen '{namn}' i vyer/pronomen.js")
    VY.write_text(src)

    mal = sum(len(s["mal"]) for s in satser)
    skapade = sum(1 for s in satser if s["kalla"] == "skapad")
    med_ocksa = sum(1 for s in satser for m in s["mal"] if andra_analyser(m, idx))
    print(f"Skrev {VY.relative_to(ROOT)} — {len(satser)} satser "
          f"({len(satser) - skapade} ur kursmaterialet, {skapade} konstruerade), "
          f"{mal} mål, {len(roller)} roller.")
    print(f"  {med_ocksa} mål har en form som ocksa betyder nagot annat "
          f"({round(100 * med_ocksa / mal)}%) — de far akta distraktorer.")
    utan = mal - med_ocksa
    if utan:
        print(f"  {utan} mal maste ta distraktorer fran andra former.")


if __name__ == "__main__":
    main()
