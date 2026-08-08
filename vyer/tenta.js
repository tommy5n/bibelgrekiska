// Vy: Övningstentamen (dynamisk) — #/tenta
//
// Lottar fram en komplett fyrdelad tenta ur PROVETS material vid varje laddning
// (eller via "Ny tenta"), så generalrepetitionen kan tas om och om igen med unika
// frågor. Speglar den fasta ovningstentamen.html (Oskars generalrepetition) men
// med slumpat innehåll.
//
// Datakällor — allt facit är verifierat, inget hittas på (korrekthet-fore-kursmaterial):
//   • Del I  (översätt former): live ur verb.js + kasus.js, filtrerat till
//     provlistorna (PROV_VERB_LISTA / PROV_SUBST). Svenskan komponeras med samma
//     verifierade helpers spelen använder (svenskFras, glosaMedKasus) + en liten
//     handverifierad pronomenpool.
//   • Del II (ta ut satsdelar): TENTA.satslara (ur json/satsanalys-satser.json).
//   • Del III (luckor) + IV (begrepp/översättning): TENTA.* (ur json/tenta-pool.json).
//
// Snapshoten byggs av scripts/gen_tenta_snapshot.py. Vyn scopar sin egen CSS i JS
// (css-arkitektur) och städar i teardown.

import { verb, svenskFras, PROV_VERB_LISTA } from "./verb.js";
import { ord, glosaMedKasus, PROV_SUBST } from "./kasus.js";
import { TENTA } from "./tenta-data.js";

/* ── Provets pronomen (punkt: personliga/demonstrativa/interrogativa pronomen).
   Litet handverifierat urval — de vanligaste formerna, korsade mot pronomen.js. */
const PRONOMEN = [
  { gr: "ἐμέ", sv: "mig", upp: "ἐγώ — jag" },
  { gr: "μου", sv: "min / av mig", upp: "ἐγώ — jag" },
  { gr: "ἐμοί", sv: "till mig, åt mig", upp: "ἐγώ — jag" },
  { gr: "σέ", sv: "dig", upp: "σύ — du" },
  { gr: "σου", sv: "din / av dig", upp: "σύ — du" },
  { gr: "ἡμᾶς", sv: "oss", upp: "ἡμεῖς — vi" },
  { gr: "ὑμῖν", sv: "till er, åt er", upp: "ὑμεῖς — ni" },
  { gr: "αὐτόν", sv: "honom", upp: "αὐτός — han" },
  { gr: "αὐτῷ", sv: "till honom, åt honom", upp: "αὐτός — han" },
  { gr: "αὐτοῦ", sv: "hans / dess", upp: "αὐτός — han" },
  { gr: "αὐτούς", sv: "dem", upp: "αὐτός — han" },
  { gr: "αὐτῶν", sv: "deras", upp: "αὐτός — han" },
  { gr: "οὗτος", sv: "denne, den här", upp: "οὗτος — denne" },
  { gr: "τοῦτον", sv: "denne (ackusativ)", upp: "οὗτος — denne" },
  { gr: "τούτου", sv: "dennes", upp: "οὗτος — denne" },
  { gr: "αὕτη", sv: "denna, hon här", upp: "οὗτος — denne (femininum)" },
  { gr: "ἐκεῖνος", sv: "den där, han där", upp: "ἐκεῖνος — den där" },
  { gr: "τίς;", sv: "vem?", upp: "τίς — vem, vilken (interrogativt)" },
  { gr: "τί;", sv: "vad? / varför?", upp: "τίς — vem, vilken (interrogativt)" },
  { gr: "τίνος;", sv: "vems?", upp: "τίς — vem, vilken (interrogativt)" },
  // Possessiva
  { gr: "ἐμός", sv: "min", upp: "ἐμός — min (possessivt)" },
  { gr: "σός", sv: "din", upp: "σός — din (possessivt)" },
  { gr: "ἡμέτερος", sv: "vår", upp: "ἡμέτερος — vår (possessivt)" },
  // Indefinita (enklitiskt τις, obetonat — skilj från interrogativa τίς)
  { gr: "τις", sv: "någon, en viss", upp: "τις — någon (indefinit, enklitiskt — obetonat)" },
  { gr: "τι", sv: "något", upp: "τις — någon (indefinit, enklitiskt — obetonat)" },
  { gr: "τινά", sv: "någon (ackusativ)", upp: "τις — någon (indefinit)" },
  // Relativpronomen (ὅς ἥ ὅ — anda + accent skiljer från artikeln)
  { gr: "ὅς", sv: "som, vilken (subjekt)", upp: "ὅς ἥ ὅ — relativpronomen" },
  { gr: "ἥ", sv: "som, hon som", upp: "ὅς ἥ ὅ — relativpronomen (femininum)" },
  { gr: "ὅν", sv: "som, vilken (ackusativ — objekt)", upp: "ὅς ἥ ὅ — relativpronomen" },
  { gr: "οὗ", sv: "vars, vilkens", upp: "ὅς ἥ ὅ — relativpronomen (genitiv)" },
  { gr: "ᾧ", sv: "åt vilken, som", upp: "ὅς ἥ ὅ — relativpronomen (dativ)" },
  { gr: "οἵ", sv: "som, vilka (plural)", upp: "ὅς ἥ ὅ — relativpronomen (maskulinum plural)" },
];

/* ── Seedbar slump (mulberry32) så en tenta är reproducerbar via #/tenta/<seed>.
   Utan seed lottas en ny varje laddning; "Ny tenta" sätter en delbar seed. ─── */
function mulberry32(a) {
  return function () {
    a |= 0; a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
function seedFrom(str) {
  let h = 2166136261;
  for (const ch of str) { h ^= ch.charCodeAt(0); h = Math.imul(h, 16777619); }
  return h >>> 0;
}

let rng = Math.random;
const pick = (arr) => arr[Math.floor(rng() * arr.length)];
function shuffle(arr) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(rng() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; }
  return a;
}
const sample = (arr, n) => shuffle(arr).slice(0, n);

/* ── Del I: bygg poolen av översättbara former ur provscopet ──────────────── */
function partIPool() {
  const items = [];

  // Substantiv: prov-listan, alla kasus × numerus. Svenskan via glosaMedKasus
  // (samma komposition som kasus-spelets Översätt-läge).
  for (const w of ord.filter((o) => PROV_SUBST.includes(o.lemma))) {
    for (const k of ["nom", "gen", "dat", "ack"]) {
      for (const n of ["sg", "pl"]) {
        const form = w.former[k] && w.former[k][n];
        if (!form) continue;
        items.push({ gr: form, sv: glosaMedKasus(w, k, n), upp: `${w.lemma} — ${w.glosa}`, typ: "subst" });
      }
    }
  }

  // Verb: prov-listan, alla tempus·modus·person. Svenskan via svenskFras; hoppa
  // över former där svenskan saknar en rimlig återgivning (returnerar null).
  for (const v of verb.filter((x) => PROV_VERB_LISTA.includes(x.lemma))) {
    for (const nyckel of Object.keys(v.former)) {
      const [tempus, modus] = nyckel.split(".");
      const former = v.former[nyckel];
      for (const pn of Object.keys(former)) {
        const sv = svenskFras({ svenska: v.svenska, pn, tempus, modus });
        if (!sv) continue;
        items.push({ gr: former[pn], sv, upp: `${v.lemma} — ${v.glosa}`, typ: "verb" });
      }
    }
  }

  // Pronomen: den handverifierade poolen (personliga, possessiva, indefinita,
  // interrogativa, demonstrativa, relativa).
  for (const p of PRONOMEN) items.push({ ...p, typ: "pron" });

  // Adjektiv i kongruens med substantiv (punkt 1) + πᾶς/μέγας/πολύς. Kurerade
  // fraser med verifierad svenska; upp tomt → visas utan uppslagstagg.
  for (const f of TENTA.fraser) items.push({ gr: f.gr, sv: f.sv, upp: "", typ: "fras" });

  return items;
}

/* Plocka del I: en blandning som garanterar bredd (verb + substantiv + pronomen),
   utan dubbletter på vare sig form eller svensk betydelse. */
function valjDel1(antal) {
  const pool = partIPool();
  const grupper = { verb: [], subst: [], pron: [], fras: [] };
  for (const it of pool) grupper[it.typ].push(it);

  // Kvoter så alla fyra kategorierna (substantiv, aktiva verb, pronomen,
  // adjektivfraser) garanterat är representerade i varje tenta.
  const kvot = { verb: 5, subst: 4, fras: 3 };
  kvot.pron = antal - kvot.verb - kvot.subst - kvot.fras;

  const valda = [];
  const settGr = new Set(), settSv = new Set(), settUpp = new Set();
  const taFran = (grupp, n) => {
    for (const it of shuffle(grupp)) {
      if (valda.length >= antal) break;
      if (n <= 0) break;
      // Undvik dubbletter på form och betydelse; ett uppslagsord (upp) syns
      // dessutom på sin höjd en gång (tomt upp = fras → ingen sådan spärr).
      if (settGr.has(it.gr) || settSv.has(it.sv) || (it.upp && settUpp.has(it.upp))) continue;
      settGr.add(it.gr); settSv.add(it.sv); if (it.upp) settUpp.add(it.upp);
      valda.push(it); n--;
    }
  };
  taFran(grupper.verb, kvot.verb);
  taFran(grupper.subst, kvot.subst);
  taFran(grupper.fras, kvot.fras);
  taFran(grupper.pron, kvot.pron);
  // Fyll upp ur allt om någon grupp var för liten.
  taFran(pool, antal - valda.length);
  return shuffle(valda);
}

/* ── Rendrering ──────────────────────────────────────────────────────────── */
const CSS = `
.vy-tenta { max-width: 820px; margin: 0 auto; padding: 0.5rem 0 4rem; }
.vy-tenta .kopf { display: flex; flex-wrap: wrap; align-items: baseline; gap: 0.5rem 1rem; margin-bottom: 0.4rem; }
.vy-tenta h1 { font-size: var(--fs-2xl); margin: 0; }
.vy-tenta .seed { font-size: var(--fs-2xs); color: var(--ink-soft); font-variant-numeric: tabular-nums; }
.vy-tenta .lead { color: var(--ink-soft); margin: 0 0 1.1rem; max-width: 62ch; font-size: var(--fs-md); }
.vy-tenta .verktyg { position: sticky; top: 0; z-index: 5; display: flex; flex-wrap: wrap; gap: 0.5rem; padding: 0.6rem 0; margin-bottom: 1.2rem;
  background: color-mix(in srgb, var(--paper) 90%, transparent); backdrop-filter: blur(6px); border-bottom: 1px solid var(--line); }
.vy-tenta .verktyg button { padding: 0.45rem 0.9rem; border: 1px solid var(--line); border-radius: 9px; background: var(--card); color: var(--ink);
  font-family: inherit; font-size: var(--fs-2xs); font-weight: 600; cursor: pointer; }
.vy-tenta .verktyg button.primar { background: var(--gold); border-color: var(--gold); color: var(--paper); }
@media (hover: hover) { .vy-tenta .verktyg button:hover { border-color: var(--gold); color: var(--gold); } .vy-tenta .verktyg button.primar:hover { color: var(--paper); filter: brightness(1.06); } }
.vy-tenta section.del { margin-bottom: 1.8rem; border: 1px solid var(--line); border-left: 4px solid var(--gold); border-radius: 14px; padding: 1.1rem 1.3rem 1.3rem; background: var(--card); }
.vy-tenta section.del > h2 { font-size: var(--fs-lg); margin: 0 0 0.15rem; }
.vy-tenta section.del > .instr { color: var(--ink-soft); font-size: var(--fs-2xs); margin: 0 0 1rem; }
.vy-tenta .upg { padding: 0.7rem 0; border-top: 1px solid var(--line); }
.vy-tenta .upg:first-of-type { border-top: none; }
.vy-tenta .upg .nr { color: var(--ink-soft); font-size: var(--fs-3xs); font-weight: 700; }
.vy-tenta .fraga-gr { font-size: var(--fs-lg); margin: 0.15rem 0; }
.vy-tenta .fraga-sv { margin: 0.15rem 0; }
.vy-tenta .ordlista { color: var(--ink-soft); font-size: var(--fs-3xs); margin: 0.2rem 0 0; }
.vy-tenta .ledtr { color: var(--ink-soft); font-size: var(--fs-2xs); margin: 0.2rem 0 0; }
.vy-tenta .lucka { color: var(--gold); font-weight: 700; }
.vy-tenta .visa-facit { margin-top: 0.45rem; padding: 0.3rem 0.7rem; border: 1px solid var(--line); border-radius: 8px; background: transparent; color: var(--gold);
  font-family: inherit; font-size: var(--fs-3xs); font-weight: 700; cursor: pointer; }
@media (hover: hover) { .vy-tenta .visa-facit:hover { border-color: var(--gold); } }
.vy-tenta .facit { margin-top: 0.5rem; padding: 0.55rem 0.8rem; border-radius: 9px; background: var(--good-bg, color-mix(in srgb, var(--gold) 12%, transparent));
  border: 1px solid color-mix(in srgb, var(--gold) 35%, var(--line)); font-size: var(--fs-2xs); }
.vy-tenta .facit[hidden] { display: none; }
.vy-tenta .facit .sv { font-weight: 700; }
.vy-tenta .facit .upp { color: var(--ink-soft); }
.vy-tenta .facit .bisats { display: block; margin-top: 0.35rem; }
`;

function esc(s) { return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;"); }

// Ersätt ⟨…⟩-markörerna i en luckmening med en tydlig blank.
function markeraLuckor(mall) {
  return esc(mall).replace(/⟨…⟩/g, '<span class="lucka">⟨____⟩</span>');
}

let nr = 0;
function upg(inner, facitHtml) {
  nr++;
  return `<div class="upg">
    <span class="nr">${nr}.</span>
    ${inner}
    <button class="visa-facit" type="button" aria-expanded="false">Visa facit</button>
    <div class="facit" hidden>${facitHtml}</div>
  </div>`;
}

function renderDel1(items) {
  const rader = items.map((it) => {
    const tagg = it.upp ? ` &nbsp;<span class="upp">· ${esc(it.upp)}</span>` : "";
    return upg(`<div class="fraga-gr">${esc(it.gr)}</div>`, `<span class="sv">${esc(it.sv)}</span>${tagg}`);
  }).join("");
  return `<section class="del">
    <h2>Del I · Ordkunskap</h2>
    <p class="instr">Översätt formerna till svenska — substantiv, adjektiv, pronomen och verb. Ta hänsyn till kasus, numerus, tempus och modus.</p>
    ${rader}
  </section>`;
}

// Del III: läs av verbets övriga former — particip (översätt) och medium/
// passivum/aorist passivum (analysera tempus, diates och person).
function renderDel3(particip, diates) {
  const p = particip.map((it) =>
    upg(`<div class="fraga-gr">${esc(it.gr)}</div>`,
      `<span class="sv">${esc(it.sv)}</span> &nbsp;<span class="upp">· ${esc(it.analys)}</span>`));
  const d = diates.map((it) =>
    upg(`<div class="fraga-gr">${esc(it.gr)}</div>`, esc(it.facit)));
  return `<section class="del">
    <h2>Del III · Particip &amp; diates</h2>
    <p class="instr">Particip: översätt (”den som …”). Medium/passivum: ange formens tempus, diates (aktivum/medium/passivum) och person.</p>
    ${[...p, ...d].join("")}
  </section>`;
}

function renderDel2(satser) {
  const rader = satser.map((s) => {
    const facit = s.delar.map(([t, roll]) => `${esc(t)} <span class="upp">(${esc(roll)})</span>`).join(" · ")
      + `<span class="bisats">Översättning: ”${esc(s.sv)}”</span>`;
    const ref = s.ref ? ` <span class="upp">(${esc(s.ref)})</span>` : "";
    return upg(`<div class="fraga-gr">${esc(s.gr)}</div><div class="ledtr">${ref}</div>`, facit);
  }).join("");
  return `<section class="del">
    <h2>Del II · Satslära</h2>
    <p class="instr">Ta ut satsdelarna (subjekt, predikat, direkt/indirekt objekt, predikatsfyllnad, genitivattribut, adverbial …). Alla behöver inte finnas med.</p>
    ${rader}
  </section>`;
}

function renderDel4(luckor) {
  const rader = luckor.map((l) => {
    const ordl = l.ordlista && l.ordlista.length
      ? `<p class="ordlista">Ordlista: ${l.ordlista.map(esc).join(" · ")}</p>` : "";
    return upg(`<div class="fraga-gr">${markeraLuckor(l.mall)}</div>${ordl}`, esc(l.facit));
  }).join("");
  return `<section class="del">
    <h2>Del IV · Form- &amp; satslära</h2>
    <p class="instr">Sätt in rätt form i luckorna ⟨____⟩. Den svenska ledtråden står inom parentes.</p>
    ${rader}
  </section>`;
}

function renderDel5(begrepp, oversatt) {
  const b = begrepp.map((q) => upg(`<div class="fraga-sv">${esc(q.fraga)}</div>`, esc(q.facit)));
  const o = oversatt.map((s) => {
    const ordl = s.ordlista && s.ordlista.length
      ? `<p class="ordlista">Ordlista: ${s.ordlista.map(esc).join(" · ")}</p>` : "";
    const ref = s.ref ? ` <span class="upp">(${esc(s.ref)})</span>` : "";
    const facit = `<span class="sv">${esc(s.sv)}</span>`
      + `<span class="bisats">Bisats: ${esc(s.bisats)} — ${esc(s.funktion)} (inledd av ${esc(s.inledare)}).</span>`;
    return upg(`<div class="fraga-gr">${esc(s.gr)}</div><p class="ledtr">Översätt och stryk under bisatsen.${ref}</p>${ordl}`, facit);
  });
  // Väv samman: begreppsfrågor först, sedan översättningarna.
  return `<section class="del">
    <h2>Del V · Blandat</h2>
    <p class="instr">Blandade frågor om form- och satslära, samt meningar att översätta.</p>
    ${[...b, ...o].join("")}
  </section>`;
}

function nySeed() {
  return Math.floor((Math.random() * 36 ** 6)).toString(36).padStart(6, "0");
}

export function teardown() {
  const s = document.getElementById("vy-tenta-style");
  if (s) s.remove();
}

export function render(root, opts = {}) {
  if (!document.getElementById("vy-tenta-style")) {
    const st = document.createElement("style");
    st.id = "vy-tenta-style";
    st.textContent = CSS;
    document.head.appendChild(st);
  }

  // Seed: djuplänkens token (#/tenta/<seed>) ger en reproducerbar tenta; utan
  // token lottas en ny varje laddning.
  const seed = opts.mode || nySeed();
  const delbar = !!opts.mode; // seeden ligger i URL:en bara när den kom därifrån
  rng = mulberry32(seedFrom(seed));
  nr = 0;

  const del1 = valjDel1(16);
  const del2 = sample(TENTA.satslara, 2);
  const del3p = sample(TENTA.particip, 2);
  const del3d = sample(TENTA.diates, 3);
  const del4 = sample(TENTA.luckor, 3);
  const del5b = sample(TENTA.begrepp, 4);
  const del5o = sample(TENTA.oversattning, 2);

  root.innerHTML = `<div class="vy vy-tenta">
    <div class="kopf">
      <h1>Övningstentamen</h1>
      <span class="seed">Tenta #${esc(seed)}${delbar ? " · delbar länk" : " · slumpad"}</span>
    </div>
    <p class="lead">Hela provets bredd — substantiv, adjektiv, pronomen, verb (även particip och medium/passivum), satslära och glosor — men frågorna lottas fram på nytt varje gång. Ladda om sidan eller tryck <b>Ny tenta</b> för en helt ny uppsättning. Skriv/säg ditt svar och fäll sedan ut facit.</p>
    <div class="verktyg">
      <button type="button" class="primar" id="t-ny">🎲 Ny tenta</button>
      <button type="button" id="t-visa">Visa alla facit</button>
      <button type="button" id="t-dolj">Dölj alla facit</button>
    </div>
    ${renderDel1(del1)}
    ${renderDel2(del2)}
    ${renderDel3(del3p, del3d)}
    ${renderDel4(del4)}
    ${renderDel5(del5b, del5o)}
  </div>`;

  const vy = root.querySelector(".vy-tenta");

  // Facit-toggle (delegerat).
  vy.addEventListener("click", (e) => {
    const btn = e.target.closest(".visa-facit");
    if (!btn) return;
    const facit = btn.nextElementSibling;
    const open = facit.hasAttribute("hidden");
    facit.toggleAttribute("hidden", !open);
    btn.setAttribute("aria-expanded", String(open));
    btn.textContent = open ? "Dölj facit" : "Visa facit";
  });

  const sattAlla = (open) => {
    vy.querySelectorAll(".visa-facit").forEach((btn) => {
      const facit = btn.nextElementSibling;
      facit.toggleAttribute("hidden", !open);
      btn.setAttribute("aria-expanded", String(open));
      btn.textContent = open ? "Dölj facit" : "Visa facit";
    });
  };
  vy.querySelector("#t-visa").addEventListener("click", () => sattAlla(true));
  vy.querySelector("#t-dolj").addEventListener("click", () => sattAlla(false));
  // Ny tenta = ny delbar seed i hashen → routern renderar om.
  vy.querySelector("#t-ny").addEventListener("click", () => { location.hash = "#/tenta/" + nySeed(); });
}
