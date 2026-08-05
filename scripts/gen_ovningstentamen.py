#!/usr/bin/env python3
"""Genererar övningstentamen (generalrepetitionen) till webb + utskrift.

    python3 scripts/gen_ovningstentamen.py

Källa: json/ovningstentamen.json — ett FAST dokument (Oskars generalrepetition
med facit, seminarium-10), inte härlett ur någon master. En generator fyller
BÅDA filerna så webb och utskrift aldrig kan driva isär:
  • ovningstentamen.html          — webb, döljbart facit (Visa facit-toggle +
    Visa alla/Dölj alla), sticky TOC + filter, ärver app.css (samma idiom som
    seminarieövningarna och provöversikten).
  • ovningstentamen-utskrift.html — svartvit A4, toner-snål, facit alltid synligt,
    inbäddad Cardo (font-blocket plockas ur grammatikreferens-utskrift.html).

Fyra delar med olika posttyper (ord / sats / lucka / blandat) renderas med var
sin liten renderare; alla delar samma facit-toggle-mekanik.
"""
import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
DATA = ROOT / "json" / "ovningstentamen.json"
SIDA = ROOT / "ovningstentamen.html"
UTSKRIFT = ROOT / "ovningstentamen-utskrift.html"

# app.css-stämpeln speglas hit (som gen_seminarieovningar) så återvändande
# besökare inte får stale CSS. Läses ur index.html (kanonisk).
def css_version():
    m = re.search(r"app\.css\?v=(\d+)", (ROOT / "index.html").read_text())
    return m.group(1) if m else "1"


def esc(s):
    return (s or "").replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;")


def las_fontface():
    src = (ROOT / "grammatikreferens-utskrift.html").read_text()
    m = re.search(r"@font-face\s*\{.*?\}", src, re.DOTALL)
    return m.group(0) if m else ""


# ── Webbrendering ──────────────────────────────────────────────────────
def gloss_html(ordl):
    if not ordl:
        return ""
    rader = "".join(f'<span class="rad">{esc(r)}</span>' for r in ordl)
    return f'<div class="ov-gloss"><span class="ov-gloss-h">Glosor</span>{rader}</div>'


def facit_html(p):
    bitar = []
    if p.get("sv"):
        bitar.append(f'<div class="ov-sv">{esc(p["sv"])}</div>')
    if p.get("facit"):
        bitar.append(f'<div class="ov-sv">{esc(p["facit"])}</div>')
    if p.get("extra"):
        bitar.append(f'<div class="ov-komm"><span class="ov-tag">↳ Bisats</span> {esc(p["extra"])}</div>')
    for f in p.get("foljd", []):
        bitar.append(
            f'<div class="ot-foljd"><span class="ot-fq">{esc(f["q"])}</span>'
            f'<span class="ot-fa">{esc(f["a"])}</span></div>'
        )
    if p.get("ref"):
        bitar.append(f'<div class="ov-meta">{esc(p["ref"])}</div>')
    return "\n            ".join(bitar)


def render_item(nr, p):
    is_fraga = "fraga" in p
    content = esc(p["fraga"]) if is_fraga else esc(p["gr"])
    content_cls = "ot-fraga" if is_fraga else "ot-grek gr-grek"
    instr = f'<div class="ot-instr">{esc(p["instruktion"])}</div>' if p.get("instruktion") else ""
    return f'''          <li class="ot-item">
            <div class="ot-q"><span class="ot-num">{nr}</span><span class="{content_cls}">{content}</span></div>
            {instr}{gloss_html(p.get("ordlista"))}
            <button class="ov-toggle" type="button" aria-expanded="false">Visa facit</button>
            <div class="ov-facit" hidden>
            {facit_html(p)}
            </div>
          </li>'''


def render_del(d):
    delid = f'del-{d["nr"].lower()}'
    items = "\n".join(render_item(i + 1, p) for i, p in enumerate(d["poster"]))
    tema = f' <span class="ov-tema">{esc(d["tema"])}</span>' if d.get("tema") else ""
    return f'''        <section class="gr-card ot-card" id="{delid}">
          <h3>{esc(d["nr"])}. {esc(d["rubrik"])}{tema} <span class="sem">{len(d["poster"])} uppg.</span></h3>
          <p class="note">{esc(d["instruktion"])}</p>
          <ol class="ot-list">
{items}
          </ol>
        </section>'''


def toc_html(delar):
    rader = ['          <li class="group"><span>Övningstentamen</span></li>']
    for d in delar:
        rader.append(f'          <li><a href="#del-{d["nr"].lower()}">{esc(d["nr"])}. {esc(d["rubrik"])}</a></li>')
    return "\n".join(rader)


# ── Utskriftsrendering (svartvit, facit alltid synligt) ────────────────
def facit_print(p):
    bitar = []
    if p.get("sv"):
        bitar.append(f'<div class="ot-svar">{esc(p["sv"])}</div>')
    if p.get("facit"):
        bitar.append(f'<div class="ot-svar">{esc(p["facit"])}</div>')
    if p.get("extra"):
        bitar.append(f'<div class="ot-note"><b>Bisats:</b> {esc(p["extra"])}</div>')
    for f in p.get("foljd", []):
        bitar.append(f'<div class="ot-note"><b>{esc(f["q"])}</b> {esc(f["a"])}</div>')
    if p.get("ref"):
        bitar.append(f'<div class="ot-note ot-meta">{esc(p["ref"])}</div>')
    return "".join(bitar)


def render_item_print(nr, p):
    is_fraga = "fraga" in p
    content = esc(p["fraga"]) if is_fraga else f'<span class="ot-grek">{esc(p["gr"])}</span>'
    instr = f' <span class="ot-instr">— {esc(p["instruktion"])}</span>' if p.get("instruktion") else ""
    gloss = ""
    if p.get("ordlista"):
        inner = "".join(f'<span class="g">{esc(r)}</span>' for r in p["ordlista"])
        gloss = f'<div class="ot-gloss">{inner}</div>'
    return (
        f'<div class="ot-item">'
        f'<div class="ot-q"><span class="ot-num">{nr}.</span> {content}{instr}</div>'
        f'{gloss}'
        f'<div class="ot-facit">{facit_print(p)}</div>'
        f'</div>'
    )


def render_del_print(d):
    items = "\n".join(render_item_print(i + 1, p) for i, p in enumerate(d["poster"]))
    tema = f' <span class="ex">{esc(d["tema"])}</span>' if d.get("tema") else ""
    return f'''      <section class="ot-del">
        <h3>{esc(d["nr"])}. {esc(d["rubrik"])}{tema}</h3>
        <p class="note">{esc(d["instruktion"])}</p>
{items}
      </section>'''


def main():
    d = json.loads(DATA.read_text())
    delar = d["delar"]

    SIDA.write_text(SIDMALL.format(
        css_v=css_version(),
        toc=toc_html(delar),
        delar="\n\n".join(render_del(x) for x in delar),
    ))
    antal = sum(len(x["poster"]) for x in delar)
    print(f"Skrev {SIDA.relative_to(ROOT)} — {len(delar)} delar, {antal} uppgifter.")

    UTSKRIFT.write_text(SIDMALL_PRINT.format(
        fontface=las_fontface(),
        delar="\n\n".join(render_del_print(x) for x in delar),
    ))
    print(f"Skrev {UTSKRIFT.relative_to(ROOT)}")


SIDMALL = '''<!doctype html>
<html lang="sv">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Övningstentamen · Bibelgrekiska</title>
    <meta name="theme-color" content="#a8842c" />
    <link rel="apple-touch-icon" href="appletouchicon.png" />
    <!-- Ärver Cardo/Spectral-fonter och :root-temat från appen -->
    <link rel="stylesheet" href="app.css?v={css_v}" />
    <style>
      body {{ background: var(--paper); }}
      .gr-bar {{
        position: sticky; top: 0; z-index: 20; display: flex; align-items: center; gap: 1rem;
        padding: 0.7rem 1.4rem; background: color-mix(in srgb, var(--paper) 88%, transparent);
        backdrop-filter: blur(8px); border-bottom: 1px solid var(--line);
      }}
      .gr-bar .hem {{ color: var(--gold); text-decoration: none; font-weight: 600; font-size: var(--fs-sm); }}
      .gr-bar .wordmark {{ font-weight: 600; color: var(--ink-soft); font-size: var(--fs-sm); letter-spacing: 0.02em; min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }}
      .gr-bar .utskrift {{ margin-left: auto; color: var(--gold); text-decoration: none; font-weight: 600; font-size: var(--fs-sm); white-space: nowrap; }}
      .gr-bar .xref {{ color: var(--gold); text-decoration: none; font-weight: 600; font-size: var(--fs-sm); white-space: nowrap; }}
      @media (hover: hover) {{ .gr-bar .hem:hover, .gr-bar .utskrift:hover, .gr-bar .xref:hover {{ text-decoration: underline; }} }}
      .gr-layout {{ display: grid; grid-template-columns: 240px minmax(0, 1fr); gap: 2.5rem; max-width: 1120px; margin: 0 auto; padding: 1.6rem 1.6rem 5rem; }}
      .gr-toc {{ position: sticky; top: 4rem; align-self: start; max-height: calc(100vh - 5rem); overflow-y: auto; font-size: var(--fs-2xs); }}
      .gr-toc h2 {{ font-size: var(--fs-xs); text-transform: uppercase; letter-spacing: 0.08em; color: var(--ink-soft); font-weight: 600; margin: 0 0 0.6rem; }}
      .gr-actions {{ display: flex; gap: 0.5rem; margin-bottom: 0.8rem; flex-wrap: wrap; }}
      .gr-actions button {{ flex: 1; padding: 0.4rem 0.5rem; border: 1px solid var(--line); border-radius: 9px; background: var(--card); color: var(--ink); font-family: inherit; font-size: var(--fs-3xs); font-weight: 600; cursor: pointer; white-space: nowrap; }}
      @media (hover: hover) {{ .gr-actions button:hover {{ border-color: var(--gold); color: var(--gold); }} }}
      .gr-filter {{ width: 100%; padding: 0.5rem 0.7rem; margin-bottom: 0.8rem; border: 1px solid var(--line); border-radius: 9px; background: var(--card); color: var(--ink); font-family: inherit; font-size: var(--fs-2xs); }}
      .gr-filter:focus {{ outline: none; border-color: var(--gold); }}
      .gr-toc ul {{ list-style: none; margin: 0; padding: 0; }}
      .gr-toc li.group {{ margin-top: 0.8rem; }}
      .gr-toc li.group > span {{ display: block; font-weight: 700; color: var(--ink); font-size: var(--fs-3xs); margin-bottom: 0.15rem; }}
      .gr-toc a {{ display: block; padding: 0.28rem 0.6rem; border-radius: 7px; color: var(--ink-soft); text-decoration: none; border-left: 3px solid transparent; }}
      @media (hover: hover) {{ .gr-toc a:hover {{ background: var(--card); color: var(--ink); }} }}
      .gr-toc a.active {{ color: var(--gold); border-left-color: var(--gold); font-weight: 600; }}
      .gr-toc a.hidden {{ display: none; }}
      .gr-main {{ min-width: 0; }}
      .gr-main > .lead {{ margin: 0 0 1.8rem; color: var(--ink-soft); max-width: 62ch; font-size: var(--fs-lg); }}
      .gr-card {{ background: var(--card); border: 1px solid var(--line); border-left: 4px solid var(--accent, var(--gold)); border-radius: 14px; padding: 1.3rem 1.5rem 1.5rem; margin-bottom: 1.5rem; scroll-margin-top: 4.5rem; }}
      .gr-card.dim {{ opacity: 0.28; }}
      .gr-card > h3 {{ margin: 0 0 0.2rem; font-size: var(--fs-2xl); color: var(--ink); display: flex; align-items: baseline; gap: 0.6rem; flex-wrap: wrap; }}
      .gr-card > .note {{ color: var(--ink-soft); font-size: var(--fs-sm); margin: 0.1rem 0 1rem; }}
      .gr-card .sem {{ font-size: var(--fs-3xs); color: var(--ink-soft); border: 1px solid var(--line); border-radius: 999px; padding: 0.05rem 0.55rem; font-weight: 600; white-space: nowrap; }}
      .ov-tema {{ font-size: var(--fs-md); color: var(--gold); font-weight: 600; }}

      /* ── Övningstentamens poster (.ot-*) — blocklayout ──────────── */
      .ot-list {{ list-style: none; margin: 0; padding: 0; }}
      .ot-item {{ padding: 0.8rem 0; border-bottom: 1px solid var(--line); }}
      .ot-item:last-child {{ border-bottom: none; }}
      .ot-q {{ display: flex; gap: 0.55rem; align-items: baseline; color: var(--ink); line-height: 1.5; }}
      .ot-num {{ color: var(--ink-soft); font-size: var(--fs-xs); font-weight: 600; font-variant-numeric: tabular-nums; min-width: 1.4rem; text-align: right; }}
      .ot-grek {{ font-size: var(--fs-lg); }}
      .ot-fraga {{ font-size: var(--fs-md); }}
      .ot-instr {{ margin: 0.25rem 0 0 2rem; font-size: var(--fs-xs); font-style: italic; color: var(--ink-soft); }}
      .ov-gloss {{ margin: 0.3rem 0 0.15rem 2rem; font-size: var(--fs-xs); color: var(--ink-soft); line-height: 1.5; }}
      .ov-gloss .ov-gloss-h {{ font-weight: 700; font-size: var(--fs-3xs); text-transform: uppercase; letter-spacing: 0.05em; color: var(--ink-soft); margin-right: 0.5rem; }}
      .ov-gloss .rad {{ display: block; color: var(--ink); }}
      .ov-toggle {{ margin: 0.5rem 0 0 2rem; white-space: nowrap; border: 1px solid var(--line); border-radius: 999px; background: var(--paper-2); color: var(--ink-soft); font-family: inherit; font-size: var(--fs-3xs); font-weight: 600; padding: 0.2rem 0.7rem; cursor: pointer; }}
      @media (hover: hover) {{ .ov-toggle:hover {{ border-color: var(--gold); color: var(--gold); }} }}
      .ov-toggle[aria-expanded="true"] {{ background: transparent; color: var(--gold); border-color: var(--gold); }}
      .ov-facit {{ margin: 0.4rem 0 0.1rem 2rem; padding: 0.7rem 0.9rem; background: var(--paper-2); border-radius: 10px; font-size: var(--fs-sm); display: flex; flex-direction: column; gap: 0.5rem; }}
      .ov-facit[hidden] {{ display: none; }}
      .ov-sv {{ color: var(--ink); font-size: var(--fs-md); line-height: 1.5; }}
      .ov-tag {{ font-weight: 700; font-size: var(--fs-2xs); margin-right: 0.3rem; white-space: nowrap; }}
      .ov-komm {{ color: var(--ink); border-left: 3px solid var(--gold); padding-left: 0.6rem; }}
      .ov-komm .ov-tag {{ color: var(--gold); }}
      .ov-meta {{ color: var(--ink-soft); font-size: var(--fs-2xs); }}
      .ot-foljd {{ border-left: 3px solid var(--line); padding-left: 0.6rem; }}
      .ot-foljd .ot-fq {{ display: block; font-weight: 600; color: var(--ink); }}
      .ot-foljd .ot-fa {{ display: block; color: var(--ink-soft); }}

      @media (max-width: 900px) {{
        .gr-layout {{ grid-template-columns: 1fr; }}
        .gr-toc {{ position: static; max-height: none; margin-bottom: 1rem; }}
      }}
    </style>
  </head>
  <body>
    <header class="gr-bar">
      <a class="hem" href="index.html">← Meny</a>
      <span class="wordmark">Bibelgrekiska · Övningstentamen</span>
      <a class="utskrift" href="ovningstentamen-utskrift.html">🖨 Utskriftsversion</a>
      <a class="xref" href="provoversikt.html">★ Inför provet</a>
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
          Kursens generalrepetition — Oskars övningstentamen inför skrivningen, med facit.
          Fyra delar: ordkunskap, satslära, formlära och blandade uppgifter. Gör uppgiften
          först och klicka <b>Visa facit</b> för att kontrollera. Se även <a href="provoversikt.html">Inför provet</a>.
        </p>

{delar}
      </main>
    </div>

    <script>
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

      const links = [...document.querySelectorAll('#toc a')];
      const byId = new Map(links.map((a) => [a.getAttribute('href').slice(1), a]));
      const spy = new IntersectionObserver((entries) => {{
        entries.forEach((e) => {{ if (e.isIntersecting) {{ links.forEach((l) => l.classList.remove('active')); const a = byId.get(e.target.id); if (a) a.classList.add('active'); }} }});
      }}, {{ rootMargin: '-10% 0px -75% 0px', threshold: 0 }});
      document.querySelectorAll('.gr-card').forEach((s) => spy.observe(s));
      links.forEach((a) => a.addEventListener('click', (ev) => {{
        const el = document.getElementById(a.getAttribute('href').slice(1));
        if (el) {{ ev.preventDefault(); el.scrollIntoView({{ behavior: 'smooth', block: 'start' }}); history.replaceState(null, '', a.getAttribute('href')); }}
      }}));
      const filter = document.querySelector('.gr-filter');
      const cards = [...document.querySelectorAll('.gr-card')];
      filter.addEventListener('input', () => {{
        const q = filter.value.trim().toLowerCase();
        cards.forEach((c) => c.classList.toggle('dim', !(!q || c.textContent.toLowerCase().includes(q))));
        links.forEach((a) => {{ const c = document.getElementById(a.getAttribute('href').slice(1)); a.classList.toggle('hidden', !(!q || (c && c.textContent.toLowerCase().includes(q)))); }});
      }});
    </script>
  </body>
</html>
'''


SIDMALL_PRINT = '''<!doctype html>
<html lang="sv">
<head>
<meta charset="utf-8" />
<title>Övningstentamen · Bibelgrekiska (utskrift)</title>
<style>
/* ============================================================
   Övningstentamen — UTSKRIFT (svartvit laser, toner-snål).
   Facit alltid synligt; ren vit sida, svart text, hårstreck.
   ============================================================ */
{fontface}

@page {{ size: A4 portrait; margin: 14mm 13mm 12mm; }}
* {{ box-sizing: border-box; }}
html, body {{
  margin: 0; padding: 0; background: #fff; color: #000;
  font-family: "Cardo", "Spectral", "Georgia", "Times New Roman", serif;
  font-size: 9.5pt; line-height: 1.34;
  -webkit-print-color-adjust: exact; print-color-adjust: exact;
}}
.doc-head {{ border-bottom: 1pt solid #000; padding-bottom: 3mm; margin-bottom: 4mm; }}
.doc-head h1 {{ font-size: 15pt; font-weight: 600; margin: 0 0 1mm; }}
.doc-head .lead {{ margin: 0; font-size: 8.8pt; font-style: italic; }}
.ot-del {{ break-inside: auto; margin: 0 0 5mm; }}
.ot-del > h3 {{ font-size: 11pt; font-weight: 600; margin: 0 0 0.8mm; padding-bottom: 0.8mm; border-bottom: 0.75pt solid #000; break-after: avoid; }}
.ot-del > h3 .ex {{ font-weight: 400; font-style: italic; font-size: 9pt; margin-left: 1mm; }}
.ot-del > .note {{ margin: 0 0 2mm; font-size: 8.4pt; font-style: italic; break-after: avoid; }}
.ot-item {{ break-inside: avoid; margin: 0 0 2.6mm; padding: 0 0 1.4mm; border-bottom: 0.4pt solid #c4c4c4; }}
.ot-item:last-child {{ border-bottom: none; }}
.ot-q {{ font-size: 9.5pt; line-height: 1.34; }}
.ot-num {{ font-weight: 600; font-variant-numeric: tabular-nums; margin-right: 0.6mm; }}
.ot-grek {{ font-family: "Cardo", "Spectral", serif; font-size: 1.08em; }}
.ot-instr {{ font-style: italic; font-size: 8.2pt; color: #333; }}
.ot-gloss {{ margin: 0.6mm 0 0 5mm; font-size: 7.6pt; line-height: 1.3; color: #333; }}
.ot-gloss .g:not(:last-child)::after {{ content: " · "; color: #999; }}
.ot-facit {{ margin: 0.9mm 0 0 5mm; font-size: 8.7pt; }}
.ot-svar {{ margin: 0 0 0.4mm; }}
.ot-note {{ font-size: 8pt; line-height: 1.28; margin: 0.4mm 0 0; color: #222; }}
.ot-note b {{ font-weight: 600; }}
.ot-meta {{ font-style: italic; color: #444; }}
b {{ font-weight: 600; }}
</style>
</head>
<body>
  <div class="doc-head">
    <h1>Övningstentamen · Bibelgrekiska I</h1>
    <p class="lead">Generalrepetition inför skrivningen, med facit. Täck facit-raderna och pröva dig själv först.</p>
  </div>

{delar}
</body>
</html>
'''


if __name__ == "__main__":
    main()
