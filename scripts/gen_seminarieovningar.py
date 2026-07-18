#!/usr/bin/env python3
"""Genererar seminarieövnings-sidan ur json/seminarier.json.

Speglar grammatikreferensens layout (.gr-*), men lägger till ett övnings-
namespace (.ov-*) för uppgiftslistor med döljbart facit. Körs lokalt, output
committas (samma statiska deploy-modell som resten av sajten).

Skriver två filer: webbversion (seminarieovningar.html, döljbart facit) och
utskriftsversion (seminarieovningar-utskrift.html, tvåkolumns självtest där
facit ligger i ett fast högerband som kan täckas med en pappersremsa).
"""
import json
import re
import html
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
DATA = ROOT / "json" / "seminarier.json"
INDEX = ROOT / "index.html"


def css_version():
    """app.css-stämpeln ur index.html — den är kanonisk.

    Sidan bar tidigare en egen hårdkodad stämpel och hamnade på v=8 medan
    index.html gick vidare till v=11: två cache-nycklar för samma fil, och en
    besökare med den gamla nyckeln fick föråldrad CSS. Att ärva i stället för
    att kopiera gör drift omöjlig — samma skäl som app.js ärver sin version via
    import.meta.url."""
    m = re.search(r'app\.css\?v=(\d+)', INDEX.read_text())
    if not m:
        raise SystemExit("Hittade ingen app.css?v=NN i index.html")
    return m.group(1)

# Vilka seminarier som renderas.
SEMINARIER = [2, 3, 4, 5, 6, 7]

# ── Parsning av instruktion (sem 6: grupp härleds ur instruktionstexten) ─
RE_BREAKOUT = re.compile(r"Breakout\s+(\S+?):\s*översätt\s*\(([^)]*)\)")
RE_MENING = re.compile(r"\(mening\s+(\d+)\)")
RE_SJALV = re.compile(r"Översättningsmening för självstudium\s*\(([^)]*)\)")


def esc(s):
    return html.escape(s, quote=True)


# Gruppkonfiguration: grupp_id → (rubrik, tema, note, accent).
# Sektionerna ordnas efter första förekomst i datan (= PDF-ordning).
# Nyckeln "<sem>:<gid>" vinner över "<gid>" — sem 6 och 7 delar grupp-id
# (breakout-1/2/3) men har olika teman.
GRUPPER = {
    # sem 2–5 (grupp bärs av fältet ovningsgrupp)
    "verbformer": ("Verbformer", "Presens indikativ",
        "Skriv av, läs högt och översätt. Personändelsen avslöjar vem som handlar — subjektet behöver inte skrivas ut.", "#3f7a4f"),
    "satser": ("Satser", "Satsdelar &amp; översättning",
        "Läs högt, ta ut satsdelar och översätt. Kasus — inte ordföljden — avgör vilken satsdel ett ord är.", "#a8842c"),
    "substantivfraser": ("Substantivfraser", "Bestäm kasus",
        "Bestäm kasus, genus och numerus och översätt. Flera former är tvetydiga och avgörs bara av sammanhanget.", "#4a6a8a"),
    "breakout": ("Breakout", "Satsdelar &amp; översättning",
        "Identifiera satsdelar och översätt till svenska; läs meningarna för varandra.", "#3f7a4f"),
    "prepositionsfraser": ("Breakout 1", "Prepositionsfraser",
        "Översätt prepositionsfraserna. Prepositionen styr kasus och färgar betydelsen.", "#3f7a4f"),
    "negation": ("Breakout 2", "Negationen οὐ",
        "Sätt in rätt form av οὐ och översätt. Formen (οὐ/οὐκ/οὐχ) styrs av ljudet efter.", "#4a6a8a"),
    "pronomen": ("Breakout 3", "Personliga pronomen",
        "Översätt. Håll koll på de obetonade (enklitiska) pronomenformerna.", "#b0642f"),
    "sjalvstudium": ("Självstudium", "Meningar att översätta",
        "Meningar för självstudium (facit fanns i övningsbladet, s. 4).", "#8a5a86"),
    # Presentationsexempel är INTE övningar utan genomgångna exempel från
    # föreläsningen — de backportades till seminarier.json 2026-07-15 och dök
    # då upp här. Egen sektion så det framgår att svaret gavs på plats.
    "presentation": ("Presentation", "Genomgångna exempel",
        "Exempel som gicks igenom på föreläsningen, med lärarens egen översättning. Inte övningar — men bra att pröva innan du läser facit.", "#6a6a6a"),
    # sem 6 (grupp härleds ur instruktion → breakout-1/2/3)
    "breakout-1": ("Breakout 1", "Personliga &amp; possessiva pronomen",
        "Översätt till svenska. Håll koll på enklitiska (obetonade) pronomen och på αὐτός i genitiv som possessivt ord.", "#3f7a4f"),
    "breakout-2": ("Breakout 2", "Interrogativa pronomen",
        "Översätt till svenska. Frågeorden τίς/τί böjs i kasus och numerus.", "#4a6a8a"),
    "breakout-3": ("Breakout 3", "Futurum",
        "Översätt till svenska. Futurum känns igen på tempustecknet σ före ändelsen — men några meningar är insmugen presens.", "#b0642f"),
    # sem 7 — formläran omvandlar former (facit_form), inte översätter
    "formlara-fut": ("Formlära (a)", "Presens → futurum",
        "Omvandla till futurum. Tempustecknet σ möter rotens sista ljud: κ/χ/γ/σσ→ξ, π/φ/β/πτ→ψ, τ/θ/δ/ζ→σ; ε förlängs till η.", "#3f7a4f"),
    "formlara-imp": ("Formlära (b)", "Indikativ → imperativ",
        "Omvandla till presens imperativ. Tänk på att negationen οὐ växlar till μή vid imperativ.", "#4a6a8a"),
    "formlara-ind": ("Formlära (c)", "Imperativ → indikativ",
        "Omvandla tillbaka till presens indikativ — och växla μή tillbaka till οὐ.", "#4a6a8a"),
    "formlara-impf": ("Formlära (d)", "Presens → imperfekt",
        "Omvandla till imperfekt: augment framför stammen + sekundära ändelser (-ον, -ες, -ε(ν), -ομεν, -ετε, -ον).", "#b0642f"),
    "formlara-pres": ("Formlära (e)", "Imperfekt → presens",
        "Omvandla tillbaka till presens: dra bort augmentet och sätt tillbaka primärändelsen.", "#b0642f"),
    "oversattning": ("Översättning", "Meningar ur NT",
        "Översätt till svenska. Meningarna är ordagranna och ibland lätt modifierade — de följer inte alltid Bibel 2000.", "#8a5a86"),
    "7:breakout-1": ("Breakout 1", "Futurum &amp; personliga pronomen",
        "Översätt till svenska. Leta efter tempustecknet σ — flera meningar är minimala par där bara futurum skiljer.", "#3f7a4f"),
    "7:breakout-2": ("Breakout 2", "Possessiva pronomen",
        "Översätt till svenska. Obetonad possessiv står efter substantivet, betonad mellan artikel och substantiv.", "#4a6a8a"),
    "7:breakout-3": ("Breakout 3", "Imperfekt",
        "Översätt till svenska. Imperfekt känns igen på augmentet framför stammen — och -ον är både 1:a sg och 3:e pl.", "#b0642f"),
    "ovrigt": ("Övrigt", "", "", "#a8842c"),
}

# Standardvärden när en grupp saknar konfiguration.
GRUPP_FALLBACK = ("Övrigt", "", "", "#a8842c")


def grupp_meta(sem, gid):
    """Gruppmetadata; seminariespecifik nyckel vinner över den generella."""
    return GRUPPER.get(f"{sem}:{gid}") or GRUPPER.get(gid) or GRUPP_FALLBACK


def grupp_av(sats):
    """Grupp-id för en sats: fältet ovningsgrupp (sem 2–5) eller parsning (sem 6)."""
    if sats.get("ovningsgrupp"):
        return sats["ovningsgrupp"]
    instr = sats.get("instruktion") or ""
    m = RE_BREAKOUT.search(instr)
    if m:
        return f"breakout-{m.group(1).rstrip('.')}"
    if RE_SJALV.search(instr):
        return "sjalvstudium"
    return "ovrigt"


def bygg_grupper(satser):
    """Grupper i förekomstordning; uteslutna satser hoppas."""
    grupper = {}
    for s in satser:
        if s.get("uteslut"):
            continue
        grupper.setdefault(grupp_av(s), []).append(s)
    return grupper


def facit_ref(sats):
    """Bibelreferens: eget fält, annars ur självstudie-instruktionen."""
    ref = sats.get("bibelreferens")
    if not ref:
        m = RE_SJALV.search(sats.get("instruktion") or "")
        if m:
            ref = re.sub(r",?\s*facit.*$", "", m.group(1)).strip()
    return ref


# ── Webbrendering (döljbart facit) ─────────────────────────────────────
def render_item(nr, sats):
    grek = esc(sats["grekiska"])
    facit_bitar = []
    if sats.get("oversattning"):
        facit_bitar.append(f'<div class="ov-sv">{esc(sats["oversattning"])}</div>')
    if sats.get("facit_form"):
        facit_bitar.append(f'<div class="ov-sv"><span class="ov-lbl">Rätt form:</span> <span class="gr-grek">{esc(sats["facit_form"])}</span></div>')
    if sats.get("negerad"):
        facit_bitar.append(f'<div class="ov-sv"><span class="ov-lbl">Negerad:</span> <span class="gr-grek">{esc(sats["negerad"])}</span></div>')
    if sats.get("falla"):
        facit_bitar.append(f'<div class="ov-falla"><span class="ov-tag">⚠︎ Fälla</span> {esc(sats["falla"])}</div>')
    if sats.get("kommentar"):
        facit_bitar.append(f'<div class="ov-komm"><span class="ov-tag">💡 Kommentar</span> {esc(sats["kommentar"])}</div>')
    meta = []
    ref = facit_ref(sats)
    if ref:
        meta.append(esc(ref))
    if sats.get("avvikelse"):
        meta.append("Avvikelse: " + esc(sats["avvikelse"]))
    if meta:
        facit_bitar.append(f'<div class="ov-meta">{" · ".join(meta)}</div>')

    facit = "\n            ".join(facit_bitar)
    num = f'<span class="ov-num">{nr}</span>' if nr else ""
    return f'''          <li class="ov-item">
            {num}<div class="ov-grek gr-grek">{grek}</div>
            <button class="ov-toggle" type="button" aria-expanded="false">Visa facit</button>
            <div class="ov-facit" hidden>
            {facit}
            </div>
          </li>'''


def render_sektion(sem, gid, poster):
    rub, tema, note, accent = grupp_meta(sem, gid)
    sekid = f"sem{sem}-{gid}"
    items = "\n".join(render_item(i + 1, s) for i, s in enumerate(poster))
    temahtml = f' <span class="ov-tema">{tema}</span>' if tema else ""
    return f'''        <section class="gr-card ov-card" id="{sekid}" style="--accent:{accent}">
          <h3>{rub}{temahtml} <span class="sem">Sem {sem}</span></h3>
          <p class="note">{esc(note)}</p>
          <ol class="ov-list">
{items}
          </ol>
        </section>'''


# ── Utskriftsrendering ─────────────────────────────────────────────────
# Tvåkolumns självtest: fråga (grekiska) vänster, facit höger. Facit-
# kolumnen ligger i ett fast högerband (table-layout: fixed) så att den kan
# täckas med en pappersremsa medan man övar; band-x är detsamma på alla sidor.
def render_item_print(nr, sats):
    grek = esc(sats["grekiska"])
    # Frågecell: nummer + grekiska (fråga man ska översätta/omvandla).
    fraga = f'<span class="ov-num">{nr}</span><span class="ov-grek">{grek}</span>'

    # Facitcell: svaret + alla noter (fälla, kommentar, referens).
    sv = esc(sats.get("oversattning") or "")
    svar_bitar = []
    if sv:
        svar_bitar.append(sv)
    if sats.get("facit_form"):
        svar_bitar.append(f'<span class="ov-form">→ {esc(sats["facit_form"])}</span>')
    if sats.get("negerad"):
        svar_bitar.append(f'<span class="ov-form">neg. {esc(sats["negerad"])}</span>')
    svar = " ".join(svar_bitar)
    delar = [f'<div class="ov-svar">{svar}</div>'] if svar else []
    if sats.get("falla"):
        delar.append(f'<div class="ov-note"><b>Fälla:</b> {esc(sats["falla"])}</div>')
    if sats.get("kommentar"):
        delar.append(f'<div class="ov-note"><b>Kommentar:</b> {esc(sats["kommentar"])}</div>')
    meta = []
    ref = facit_ref(sats)
    if ref:
        meta.append(esc(ref))
    if sats.get("avvikelse"):
        meta.append("Avvikelse: " + esc(sats["avvikelse"]))
    if meta:
        delar.append(f'<div class="ov-note ov-meta">{" · ".join(meta)}</div>')
    facit = "".join(delar)

    return (f'<tr class="ov-item">'
            f'<td class="ov-q">{fraga}</td>'
            f'<td class="ov-a">{facit}</td>'
            f'</tr>')


def render_sektion_print(sem, gid, poster):
    rub, tema, note, _ = grupp_meta(sem, gid)
    rader = "\n".join(render_item_print(i + 1, s) for i, s in enumerate(poster))
    temahtml = f' <span class="ex">{tema}</span>' if tema else ""
    return f'''      <section class="gr-card">
        <h3>{rub}{temahtml} <span class="sem">Sem {sem}</span></h3>
        <p class="note">{esc(note)}</p>
        <table class="ov-list">
          <colgroup><col class="c-q" /><col class="c-a" /></colgroup>
          <thead><tr><th>Grekiska</th><th>Facit</th></tr></thead>
          <tbody>
{rader}
          </tbody>
        </table>
      </section>'''


def toc_for_sem(sem, grupper):
    rader = [f'          <li class="group"><span>Seminarium {sem}</span></li>']
    for gid in grupper:
        rub, tema = grupp_meta(sem, gid)[:2]
        # Generiska breakout-rubriker disambigueras med temat i sidopanelen.
        etikett = tema if (rub.startswith("Breakout ") and rub != "Breakout" and tema) else rub
        rader.append(f'          <li><a href="#sem{sem}-{gid}">{etikett}</a></li>')
    return "\n".join(rader)


def toc_print_for_sem(sem, grupper):
    items = "".join(
        f'<span class="toc-item">{grupp_meta(sem, gid)[0]}'
        f'{" · " + grupp_meta(sem, gid)[1] if grupp_meta(sem, gid)[1] else ""}</span>'
        for gid in grupper
    )
    return f'<div class="toc-group"><span class="toc-h">Seminarium {sem}</span>{items}</div>'


def las_fontface():
    """Plockar det inbäddade @font-face-blocket ur grammatikreferensens utskrift."""
    src = (ROOT / "grammatikreferens-utskrift.html").read_text()
    m = re.search(r"@font-face\s*\{.*?\}", src, re.DOTALL)
    if not m:
        print("VARNING: hittade inget @font-face i grammatikreferens-utskrift.html")
        return ""
    return m.group(0)


def main():
    d = json.loads(DATA.read_text())
    alla = [s for s in d["satser"] if s.get("seminarium") in SEMINARIER]

    toc_block = []
    sektion_block = []
    toc_print_block = []
    sektion_print_block = []
    antal = 0
    for sem in SEMINARIER:
        satser = [s for s in alla if s.get("seminarium") == sem]
        if not satser:
            continue
        grupper = bygg_grupper(satser)
        toc_block.append(toc_for_sem(sem, grupper))
        toc_print_block.append(toc_print_for_sem(sem, grupper))
        for gid, poster in grupper.items():
            sektion_block.append(render_sektion(sem, gid, poster))
            sektion_print_block.append(render_sektion_print(sem, gid, poster))
            antal += len(poster)

    # Webbversion
    ut = ROOT / "seminarieovningar.html"
    ut.write_text(SIDMALL.format(
        css_v=css_version(),
        toc="\n".join(toc_block),
        sektioner="\n\n".join(sektion_block),
    ))
    print(f"Skrev {ut.relative_to(ROOT)} — {antal} uppgifter, {len(sektion_block)} sektioner.")

    # Utskriftsversion (ärver inbäddad Cardo-font ur grammatikreferensens utskrift)
    ut_p = ROOT / "seminarieovningar-utskrift.html"
    ut_p.write_text(SIDMALL_PRINT.format(
        fontface=las_fontface(),
        toc="\n".join(toc_print_block),
        sektioner="\n\n".join(sektion_print_block),
    ))
    print(f"Skrev {ut_p.relative_to(ROOT)}")


SIDMALL = '''<!doctype html>
<html lang="sv">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Seminarieövningar · Bibelgrekiska</title>
    <meta name="theme-color" content="#a8842c" />
    <link rel="apple-touch-icon" href="appletouchicon.png" />
    <!-- Ärver Cardo/Spectral-fonter och :root-temat från appen -->
    <link rel="stylesheet" href="app.css?v={css_v}" />
    <style>
      /* ── Delad grammatikreferens-layout (.gr-*) ─────────────────── */
      body {{ background: var(--paper); }}
      .gr-bar {{
        position: sticky; top: 0; z-index: 20;
        display: flex; align-items: center; gap: 1rem;
        padding: 0.7rem 1.4rem;
        background: color-mix(in srgb, var(--paper) 88%, transparent);
        backdrop-filter: blur(8px);
        border-bottom: 1px solid var(--line);
      }}
      .gr-bar .hem {{ color: var(--gold); text-decoration: none; font-weight: 600; font-size: var(--fs-sm); }}
      .gr-bar .hem:hover {{ text-decoration: underline; }}
      .gr-bar .wordmark {{ font-weight: 600; color: var(--ink-soft); font-size: var(--fs-sm); letter-spacing: 0.02em; }}
      .gr-bar .utskrift {{ margin-left: auto; color: var(--gold); text-decoration: none; font-weight: 600; font-size: var(--fs-sm); white-space: nowrap; }}
      .gr-bar .utskrift:hover {{ text-decoration: underline; }}
      .gr-layout {{
        display: grid; grid-template-columns: 240px minmax(0, 1fr);
        gap: 2.5rem; max-width: 1180px; margin: 0 auto; padding: 1.6rem 1.6rem 5rem;
      }}
      .gr-toc {{
        position: sticky; top: 4rem; align-self: start;
        max-height: calc(100vh - 5rem); overflow-y: auto; font-size: var(--fs-2xs);
      }}
      .gr-toc h2 {{
        font-size: var(--fs-xs); text-transform: uppercase; letter-spacing: 0.08em;
        color: var(--ink-soft); font-weight: 600; margin: 0 0 0.6rem;
      }}
      .gr-actions {{ display: flex; gap: 0.5rem; margin-bottom: 0.8rem; flex-wrap: wrap; }}
      .gr-actions button {{
        flex: 1; padding: 0.4rem 0.5rem; border: 1px solid var(--line); border-radius: 9px;
        background: var(--card); color: var(--ink); font-family: inherit;
        font-size: var(--fs-3xs); font-weight: 600; cursor: pointer; white-space: nowrap;
      }}
      .gr-actions button:hover {{ border-color: var(--gold); color: var(--gold); }}
      .gr-filter {{
        width: 100%; padding: 0.5rem 0.7rem; margin-bottom: 0.8rem;
        border: 1px solid var(--line); border-radius: 9px;
        background: var(--card); color: var(--ink); font-family: inherit; font-size: var(--fs-2xs);
      }}
      .gr-filter:focus {{ outline: none; border-color: var(--gold); }}
      .gr-toc ul {{ list-style: none; margin: 0; padding: 0; }}
      .gr-toc li.group {{ margin-top: 0.8rem; }}
      .gr-toc li.group > span {{
        display: block; font-weight: 700; color: var(--ink);
        font-size: var(--fs-3xs); margin-bottom: 0.15rem;
      }}
      .gr-toc a {{
        display: block; padding: 0.28rem 0.6rem; border-radius: 7px;
        color: var(--ink-soft); text-decoration: none; border-left: 3px solid transparent;
      }}
      .gr-toc a:hover {{ background: var(--card); color: var(--ink); }}
      .gr-toc a.active {{ color: var(--gold); border-left-color: var(--gold); font-weight: 600; }}
      .gr-toc a.hidden {{ display: none; }}
      .gr-main {{ min-width: 0; }}
      .gr-main > .lead {{ margin: 0 0 1.8rem; color: var(--ink-soft); max-width: 60ch; font-size: var(--fs-lg); }}
      .gr-card {{
        background: var(--card); border: 1px solid var(--line);
        border-left: 4px solid var(--accent, var(--gold)); border-radius: 14px;
        padding: 1.3rem 1.5rem 1.5rem; margin-bottom: 1.5rem; scroll-margin-top: 4.5rem;
      }}
      .gr-card.dim {{ opacity: 0.28; }}
      .gr-card > h3 {{
        margin: 0 0 0.2rem; font-size: var(--fs-2xl); color: var(--ink);
        display: flex; align-items: baseline; gap: 0.6rem; flex-wrap: wrap;
      }}
      .gr-card > .note {{ color: var(--ink-soft); font-size: var(--fs-xs); margin: 0.1rem 0 1rem; }}
      .gr-card .sem {{
        font-size: var(--fs-3xs); color: var(--ink-soft); border: 1px solid var(--line);
        border-radius: 999px; padding: 0.05rem 0.55rem; font-weight: 600; white-space: nowrap;
      }}
      .gr-grek {{ font-size: var(--fs-lg); }}

      /* ── Övnings-namespace (.ov-*) ──────────────────────────────── */
      .ov-tema {{ font-size: var(--fs-md); color: var(--accent, var(--gold)); font-weight: 600; }}
      .ov-list {{ list-style: none; margin: 0; padding: 0; counter-reset: none; }}
      .ov-item {{
        display: grid; grid-template-columns: 1.7rem 1fr auto; align-items: baseline;
        gap: 0.3rem 0.7rem; padding: 0.7rem 0; border-bottom: 1px solid var(--line);
      }}
      .ov-item:last-child {{ border-bottom: none; }}
      .ov-num {{
        grid-row: 1; grid-column: 1; color: var(--ink-soft); font-size: var(--fs-xs);
        font-weight: 600; text-align: right; font-variant-numeric: tabular-nums;
      }}
      .ov-grek {{ grid-row: 1; grid-column: 2; color: var(--ink); line-height: 1.5; }}
      .ov-toggle {{
        grid-row: 1; grid-column: 3; justify-self: end; white-space: nowrap;
        border: 1px solid var(--line); border-radius: 999px; background: var(--paper-2);
        color: var(--ink-soft); font-family: inherit; font-size: var(--fs-3xs); font-weight: 600;
        padding: 0.2rem 0.7rem; cursor: pointer;
      }}
      .ov-toggle:hover {{ border-color: var(--gold); color: var(--gold); }}
      .ov-toggle[aria-expanded="true"] {{ background: transparent; color: var(--gold); border-color: var(--gold); }}
      .ov-facit {{
        grid-row: 2; grid-column: 2 / 4; margin: 0.15rem 0 0.1rem;
        padding: 0.7rem 0.9rem; background: var(--paper-2); border-radius: 10px;
        font-size: var(--fs-sm); display: flex; flex-direction: column; gap: 0.5rem;
      }}
      .ov-facit[hidden] {{ display: none; }}
      .ov-sv {{ color: var(--ink); font-size: var(--fs-md); }}
      .ov-lbl {{ color: var(--ink-soft); font-size: var(--fs-xs); font-weight: 600; }}
      .ov-tag {{ font-weight: 700; font-size: var(--fs-2xs); margin-right: 0.3rem; white-space: nowrap; }}
      .ov-falla {{ color: var(--ink); border-left: 3px solid #b0642f; padding-left: 0.6rem; }}
      .ov-falla .ov-tag {{ color: #b0642f; }}
      .ov-komm {{ color: var(--ink-soft); border-left: 3px solid var(--line); padding-left: 0.6rem; }}
      .ov-meta {{ color: var(--ink-soft); font-size: var(--fs-2xs); }}

      @media (max-width: 900px) {{
        .gr-layout {{ grid-template-columns: 1fr; }}
        .gr-toc {{ position: static; max-height: none; margin-bottom: 1rem; }}
        .ov-item {{ grid-template-columns: 1.4rem 1fr; }}
        .ov-toggle {{ grid-row: 2; grid-column: 2; justify-self: start; margin-top: 0.2rem; }}
        .ov-facit {{ grid-row: 3; grid-column: 1 / 3; }}
      }}
    </style>
  </head>
  <body>
    <header class="gr-bar">
      <a class="hem" href="index.html">← Meny</a>
      <span class="wordmark">Bibelgrekiska · Seminarieövningar</span>
      <a class="utskrift" href="grammatikreferens.html">📘 Grammatikreferens</a>
    </header>

    <div class="gr-layout">
      <aside class="gr-toc">
        <h2>Innehåll</h2>
        <div class="gr-actions">
          <button id="visa-alla" type="button">Visa alla facit</button>
          <button id="dolj-alla" type="button">Dölj alla</button>
        </div>
        <input class="gr-filter" type="search" placeholder="Filtrera…" aria-label="Filtrera avsnitt" />
        <ul id="toc">
{toc}
        </ul>
      </aside>

      <main class="gr-main">
        <p class="lead">
          Övningar och breakout-uppgifter ur seminarierna i Bibelgrekiska I, med
          facit, förklarande kommentarer och varningar för vanliga fällor. Klicka
          <b>Visa facit</b> för att pröva dig själv först.
        </p>

{sektioner}
      </main>
    </div>

    <script>
      // Facit-toggle per uppgift.
      document.querySelectorAll('.ov-toggle').forEach((btn) => {{
        btn.addEventListener('click', () => {{
          const facit = btn.parentElement.querySelector('.ov-facit');
          const open = facit.hasAttribute('hidden');
          facit.toggleAttribute('hidden', !open);
          btn.setAttribute('aria-expanded', String(open));
          btn.textContent = open ? 'Dölj facit' : 'Visa facit';
        }});
      }});
      const setAll = (open) => {{
        document.querySelectorAll('.ov-toggle').forEach((btn) => {{
          const facit = btn.parentElement.querySelector('.ov-facit');
          facit.toggleAttribute('hidden', !open);
          btn.setAttribute('aria-expanded', String(open));
          btn.textContent = open ? 'Dölj facit' : 'Visa facit';
        }});
      }};
      document.getElementById('visa-alla').addEventListener('click', () => setAll(true));
      document.getElementById('dolj-alla').addEventListener('click', () => setAll(false));

      // Scrollspy + mjuk scroll + filter (från grammatikreferensen).
      const links = [...document.querySelectorAll('#toc a')];
      const byId = new Map(links.map((a) => [a.getAttribute('href').slice(1), a]));
      const spy = new IntersectionObserver(
        (entries) => {{
          entries.forEach((e) => {{
            if (e.isIntersecting) {{
              links.forEach((l) => l.classList.remove('active'));
              const a = byId.get(e.target.id);
              if (a) a.classList.add('active');
            }}
          }});
        }},
        {{ rootMargin: '-10% 0px -75% 0px', threshold: 0 }},
      );
      document.querySelectorAll('.gr-card').forEach((s) => spy.observe(s));
      links.forEach((a) =>
        a.addEventListener('click', (ev) => {{
          const el = document.getElementById(a.getAttribute('href').slice(1));
          if (el) {{
            ev.preventDefault();
            el.scrollIntoView({{ behavior: 'smooth', block: 'start' }});
            history.replaceState(null, '', a.getAttribute('href'));
          }}
        }}),
      );
      const filter = document.querySelector('.gr-filter');
      const cards = [...document.querySelectorAll('.gr-card')];
      filter.addEventListener('input', () => {{
        const q = filter.value.trim().toLowerCase();
        cards.forEach((c) => {{
          const hit = !q || c.textContent.toLowerCase().includes(q);
          c.classList.toggle('dim', !hit);
        }});
        links.forEach((a) => {{
          const c = document.getElementById(a.getAttribute('href').slice(1));
          const hit = !q || (c && c.textContent.toLowerCase().includes(q));
          a.classList.toggle('hidden', !hit);
        }});
      }});
    </script>
  </body>
</html>
'''


SIDMALL_PRINT = '''<!doctype html>
<html lang="sv">
<head>
<meta charset="utf-8" />
<title>Seminarieövningar · Bibelgrekiska (utskrift)</title>
<style>
/* ============================================================
   Seminarieövningar — UTSKRIFT (svartvit laser, toner-snål)
   Samma designprinciper som grammatikreferensens utskrift:
   ren vit sida, svart text, hårstreck, inga fyllningar.
   Facit alltid synligt (ingen toggle).
   ============================================================ */
{fontface}

@page {{ size: A4 portrait; margin: 14mm 13mm 12mm; }}
* {{ box-sizing: border-box; }}
html, body {{
  margin: 0; padding: 0; background: #fff; color: #000;
  font-family: "Cardo", "Spectral", "Georgia", "Times New Roman", serif;
  font-size: 9.3pt; line-height: 1.32;
  -webkit-print-color-adjust: exact; print-color-adjust: exact;
}}

.doc-head {{ border-bottom: 1pt solid #000; padding-bottom: 3mm; margin-bottom: 3mm; }}
.doc-head h1 {{ font-size: 15pt; font-weight: 600; margin: 0 0 1mm; letter-spacing: 0.01em; }}
.doc-head .lead {{ margin: 0; font-size: 8.6pt; }}

.toc {{
  display: grid; grid-template-columns: repeat(5, 1fr); gap: 2mm 4mm;
  margin: 0 0 4mm; padding-bottom: 3mm; border-bottom: 0.5pt solid #000;
}}
.toc-group {{ break-inside: avoid; }}
.toc-h {{
  display: block; font-weight: 600; font-size: 7.4pt;
  text-transform: uppercase; letter-spacing: 0.06em;
  border-bottom: 0.5pt solid #000; padding-bottom: 0.6mm; margin-bottom: 1mm;
}}
.toc-item {{ display: block; font-size: 7.7pt; padding: 0.15mm 0; }}

/* Sektionen får brytas mellan sidor (sem 7 har många rader); bara rubriken
   hålls ihop med sina första rader och enskilda rader bryts aldrig itu. */
.gr-card {{ break-inside: auto; margin: 0 0 4.5mm; }}
.gr-card h3 {{
  font-size: 10.5pt; font-weight: 600; margin: 0 0 0.8mm;
  padding-bottom: 0.8mm; border-bottom: 0.75pt solid #000;
  break-after: avoid;
}}
.gr-card h3 .ex {{ font-weight: 400; font-style: italic; font-size: 9pt; margin-left: 1mm; }}
.gr-card h3 .sem {{ font-weight: 400; font-size: 7.4pt; float: right; margin-top: 1.2pt; }}
.gr-card h3 .sem::before {{ content: "["; }}
.gr-card h3 .sem::after  {{ content: "]"; }}
.note {{ margin: 0 0 1.6mm; font-size: 8.2pt; line-height: 1.3; font-style: italic; break-after: avoid; }}

/* ── Tvåkolumns självtest: fråga | facit ────────────────────────────
   Fast kolumnbredd (table-layout: fixed) håller facit-bandet på samma
   plats på varje sida, så en lodrät pappersremsa täcker alla svar. */
.ov-list {{ width: 100%; border-collapse: collapse; margin: 0; table-layout: fixed; }}
.ov-list col.c-q {{ width: 53%; }}
.ov-list col.c-a {{ width: 47%; }}
.ov-list thead th {{
  font-size: 6.6pt; font-weight: 600; text-transform: uppercase;
  letter-spacing: 0.07em; text-align: left; color: #444;
  padding: 0 0 0.6mm; border-bottom: 0.5pt solid #000;
}}
.ov-list thead th:last-child {{ padding-left: 6mm; }}
.ov-item {{ break-inside: avoid; }}
.ov-item > td {{
  vertical-align: top; padding: 1.7mm 0; border-bottom: 0.4pt solid #b8b8b8;
  font-size: 8.7pt; line-height: 1.32;
}}
.ov-q {{ padding-right: 6mm; }}
/* Lodrät hårlinje = vikkant för pappersremsan; luft på båda sidor om den. */
.ov-a {{ border-left: 0.5pt solid #000; padding-left: 6mm; }}
.ov-num {{
  font-weight: 600; font-size: 0.82em; margin-right: 1.4mm;
  font-variant-numeric: tabular-nums; color: #555;
}}
.ov-grek {{ font-family: "Cardo", "Spectral", serif; font-size: 1.12em; }}
.ov-svar {{ font-size: 8.5pt; }}
.ov-form {{ font-family: "Cardo", "Spectral", serif; }}
.ov-note {{ font-size: 7.7pt; line-height: 1.26; margin: 0.4mm 0 0; color: #222; }}
.ov-note b {{ font-weight: 600; }}
.ov-meta {{ font-style: italic; color: #444; }}
b {{ font-weight: 600; }}
</style>
</head>
<body>
  <div class="doc-head">
    <h1>Seminarieövningar · Bibelgrekiska I</h1>
    <p class="lead">Övningar och breakout-uppgifter ur seminarierna, med facit, kommentarer och fällvarningar. Facit står i högerkolumnen — täck den med ett papper (längs den lodräta linjen) och pröva dig själv först.</p>
  </div>
  <nav class="toc">
{toc}
  </nav>

{sektioner}
</body>
</html>
'''


if __name__ == "__main__":
    main()
