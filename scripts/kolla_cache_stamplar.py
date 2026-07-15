#!/usr/bin/env python3
"""Kontrollerar att cache-stämplarna för app.css och app.js är hederliga.

    python3 scripts/kolla_cache_stamplar.py

Appen cache-bustar med `app.css?v=NN` och `app.js?v=NN` i index.html. Ändras en
av filerna utan att stämpeln bumpas serverar webbläsaren gammal kod till alla
återvändande besökare — och `curl` mot live ser rätt ut, eftersom den kringgår
cachen. Felet är alltså osynligt just där man tittar.

Det har hänt: commit 93ca80c (2026-07-14) la till `.vy-satsanalys .r-inf` i
app.css men bumpade bara app.js?v=. I ett dygn såg återvändande besökare
infinitivrollen ofärgad, och ingen märkte det förrän stämplarna granskades
2026-07-15.

Två kontroller:

  1. Alla HTML-sidor stämplar SAMMA version. index.html är kanonisk;
     seminarieovningar.html ärver den via generatorn, grammatikreferens.html är
     handunderhållen och måste följa med.
  2. Ingen commit har rört det stämpeln TÄCKER efter den commit som senast
     bumpade den. app.js?v= täcker app.js OCH vyer/ (modulerna ärver versionen
     via import.meta.url) — den första versionen av den här kontrollen tittade
     bara på app.js och sa "hederlig" om en release där bara en vy ändrats,
     vilket är det vanligaste fallet av alla.

Faller med exit 1 och säger vad som ska göras. Kör före deploy.
"""
import re
import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
INDEX = ROOT / "index.html"
# Sidor som länkar app.css. Utskriftsversionerna gör det inte — de är
# självförsörjande med inbäddade fonter (se seminarieovningar-minnet).
SIDOR = ["index.html", "seminarieovningar.html", "grammatikreferens.html"]


def git(*args):
    return subprocess.run(["git", "-C", str(ROOT), *args],
                          capture_output=True, text=True).stdout.strip()


# Vad varje stämpel FAKTISKT täcker. app.js?v= gäller inte bara app.js: alla
# vy-moduler ärver den via import.meta.url, så en ändrad vy kräver samma bump.
# Att bara titta på app.js vore att missa det vanligaste fallet — det gjorde
# den här kontrollen i sin första version, och den sa "hederlig" om en release
# där vyer/ ändrats efter bumpen.
TACKER = {
    "app.js": ["app.js", "vyer"],
    "app.css": ["app.css"],
}


def senaste_commit_som_rorde(sokvagar):
    """Nyaste commiten som rört NÅGON av sökvägarna."""
    commits = [c for c in (git("log", "-1", "--format=%H", "--", s) for s in sokvagar) if c]
    if not commits:
        return ""
    # Nyaste = den som har alla andra som förfäder.
    for c in commits:
        if all(c == other or ar_efter(c, other) for other in commits):
            return c
    return commits[0]


def senaste_commit_som_bumpade(fil, stampel):
    """Commiten som senast införde 'app.<x>?v=NN' med NUVARANDE NN i index.html."""
    return git("log", "-1", "--format=%H", "-S", f"{fil}?v={stampel}", "--", "index.html")


def ar_efter(a, b):
    """Är commit a nyare än b? (a är efterkommande till b i historiken)"""
    if not a or not b or a == b:
        return False
    return git("merge-base", "--is-ancestor", b, a) == "" and \
        subprocess.run(["git", "-C", str(ROOT), "merge-base", "--is-ancestor", b, a],
                       capture_output=True).returncode == 0


def main():
    fel = []
    index = INDEX.read_text()

    for fil in ("app.css", "app.js"):
        m = re.search(rf"{re.escape(fil)}\?v=(\d+)", index)
        if not m:
            fel.append(f"index.html saknar {fil}?v=NN")
            continue
        stampel = m.group(1)

        # 1. samma stämpel överallt (bara app.css länkas från flera sidor)
        if fil == "app.css":
            for sida in SIDOR:
                p = ROOT / sida
                if not p.exists():
                    continue
                hittade = set(re.findall(r"app\.css\?v=(\d+)", p.read_text()))
                if hittade and hittade != {stampel}:
                    fel.append(f"{sida} stämplar app.css?v={'/'.join(sorted(hittade))} "
                               f"men index.html säger v={stampel}"
                               + (" — kör gen_seminarieovningar.py"
                                  if sida == "seminarieovningar.html" else
                                  " — rätta för hand"))

        # 2. stämpeln minst lika ny som filen den stämplar
        rord = senaste_commit_som_rorde(TACKER[fil])
        bumpad = senaste_commit_som_bumpade(fil, stampel)
        if rord and bumpad and ar_efter(rord, bumpad):
            vad = " eller ".join(TACKER[fil])
            fel.append(
                f"{vad} ändrades i {rord[:7]} EFTER att {fil}?v={stampel} sattes "
                f"i {bumpad[:7]} — bumpa {fil}?v={int(stampel)+1} i index.html, "
                f"annars får återvändande besökare gammal fil")

    if fel:
        print(f"{len(fel)} problem:")
        for f in fel:
            print(f"  ✗ {f}")
        sys.exit(1)

    for fil in ("app.css", "app.js"):
        v = re.search(rf"{re.escape(fil)}\?v=(\d+)", index).group(1)
        print(f'  ✓ {fil}?v={v} — minst lika ny som {"/".join(TACKER[fil])}')
    print("Cache-stämplarna är hederliga.")


if __name__ == "__main__":
    main()
