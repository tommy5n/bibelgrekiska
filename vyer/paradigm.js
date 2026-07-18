// Orddata + artikel/ändelser/paradigmKey delas med ändelsespelet och GENERERAS ur
// json/ord.json (scripts/gen_ord_snapshot.py). Låg tidigare som verbatim-kopia
// i båda vyerna — 138 rader, utan något som fällde om bara den ena uppdaterades.
// Versionen ärvs ur den egna URL:en så importen cache-bustas som allt annat.
const vv = new URL(import.meta.url).search;
const { ord, ARTIKEL, END, PARADIGM_NAMN, paradigmKey } = await import(`./ord-data.js${vv}`);

// Vy: Paradigm — fyll i hela böjningstabellen (5 kasus × sg/pl) för ett ord.
// Kompletterar ändelsespelet (#7): där byggs EN cell i taget, här produceras
// hela paradigmet på en gång så mönstret syns som helhet (neutrum nom=ack,
// α-skiftena i dekl. 1, osv). Datan är samma ögonblicksbild som ändelsespelet.
let __kh = null;
export function teardown(){ if(__kh){ document.removeEventListener("keydown", __kh); __kh = null; } }

const CSS = `
.vy-paradigm .stage{ max-width:640px; margin:0 auto; }
.vy-paradigm .card{ background:var(--card); border:1px solid var(--line); border-radius:14px; padding:1rem 1.1rem 1.2rem; }
.vy-paradigm .lemma{ font-size:var(--fs-4xl); text-align:center; line-height:1.1; }
.vy-paradigm .tag{ text-align:center; color:var(--ink-soft); font-size:var(--fs-sm); margin-top:.2rem; }
.vy-paradigm .glosa{ text-align:center; color:var(--ink-soft); font-size:var(--fs-sm); font-style:italic; margin-top:.15rem; }
.vy-paradigm table.par{ width:100%; border-collapse:collapse; margin:1rem 0 .3rem; }
.vy-paradigm table.par th{ font-weight:600; color:var(--ink-soft); font-size:var(--fs-xs); padding:.3rem .4rem; text-align:center; }
.vy-paradigm table.par th.rowlab{ text-align:left; width:4.6rem; }
.vy-paradigm table.par td{ padding:.22rem .28rem; }
.vy-paradigm td.rowlab{ color:var(--ink-soft); font-size:var(--fs-sm); white-space:nowrap; }
.vy-paradigm .cell{ width:100%; min-height:2.6rem; border:1px solid var(--line); border-radius:9px; background:var(--paper);
  font-size:var(--fs-lg); color:var(--ink); cursor:pointer; padding:.35rem .3rem; line-height:1.15; text-align:center; }
.vy-paradigm .cell:hover:not(:disabled){ border-color:var(--gold); }
.vy-paradigm .cell.active{ border-color:var(--gold); box-shadow:0 0 0 2px color-mix(in srgb, var(--gold) 40%, transparent); }
.vy-paradigm .cell.empty{ color:var(--line); }
.vy-paradigm .cell .sub{ display:block; font-size:var(--fs-3xs); color:var(--bad); margin-top:.1rem; }
.vy-paradigm .cell.good{ background:var(--good-bg); border-color:var(--good); color:var(--good); cursor:default; }
.vy-paradigm .cell.bad{ background:var(--bad-bg); border-color:var(--bad); color:var(--bad); cursor:default; }
.vy-paradigm .cell.study{ cursor:default; background:var(--card); }
.vy-paradigm .palette{ display:flex; flex-wrap:wrap; gap:.4rem; justify-content:center; margin:.8rem 0 .2rem; }
.vy-paradigm .palette .end{ border:1px solid var(--line); border-radius:8px; background:var(--card); color:var(--ink);
  font-size:var(--fs-md); padding:.4rem .7rem; cursor:pointer; min-width:2.6rem; }
.vy-paradigm .palette .end:hover{ border-color:var(--gold); }
.vy-paradigm .palette-label{ text-align:center; color:var(--ink-soft); font-size:var(--fs-xs); margin-top:.6rem; }
.vy-paradigm .controls{ display:flex; gap:.6rem; justify-content:center; margin-top:1rem; }
.vy-paradigm .btn{ border:1px solid var(--line); border-radius:9px; background:var(--card); color:var(--ink);
  font-size:var(--fs-md); padding:.5rem 1.2rem; cursor:pointer; }
.vy-paradigm .btn.primary{ background:var(--gold); border-color:var(--gold); color:#fff; }
.vy-paradigm .btn:disabled{ opacity:.4; cursor:default; }
.vy-paradigm .scorebar{ text-align:center; color:var(--ink-soft); font-size:var(--fs-sm); margin-top:.9rem; }
.vy-paradigm .scorebar b{ color:var(--ink); }
.vy-paradigm .modes{ display:flex; gap:.5rem; justify-content:center; margin:0 0 1rem; }
.vy-paradigm .mode{ border:1px solid var(--line); border-radius:9px; background:var(--card); color:var(--ink-soft);
  font-size:var(--fs-sm); padding:.4rem .9rem; cursor:pointer; }
.vy-paradigm .seg{ display:inline-flex; border:1px solid var(--line); border-radius:9px; overflow:hidden; }
.vy-paradigm .seg button{ border:0; background:var(--card); color:var(--ink-soft); font-size:var(--fs-sm); padding:.4rem .9rem; cursor:pointer; }
.vy-paradigm .seg button + button{ border-left:1px solid var(--line); }
.vy-paradigm footer{ max-width:640px; margin:1.4rem auto 0; color:var(--ink-soft); font-size:var(--fs-sm); line-height:1.5; }
.vy-paradigm footer code{ font-size:var(--fs-md); }
/* .mode/.seg "valt"-svart + .hidden ärvs nu från de delade reglerna i app.css. */
`;

const MARKUP = `<div class="vy vy-paradigm">
<style>${CSS}</style>
<header>
  <h1>Grekiska — paradigm</h1>
  <div class="sub">Fyll i hela böjningstabellen: alla kasus i singular och plural.</div>
</header>

<div class="modes" role="group" aria-label="Läge">
  <button class="mode" id="mode-fyll" aria-pressed="true">Fyll i</button>
  <button class="mode" id="mode-studera" aria-pressed="false">Studera</button>
</div>

<div class="stage">
  <div class="card">
    <div class="lemma" id="lemma">—</div>
    <div class="tag" id="tag"></div>
    <div class="glosa" id="glosa"></div>

    <table class="par">
      <thead>
        <tr><th class="rowlab"></th><th>singular</th><th>plural</th></tr>
      </thead>
      <tbody id="tbody"></tbody>
    </table>

    <div id="palette-wrap">
      <div class="palette" id="palette"></div>
      <div class="palette-label">Tryck på en ruta, välj sedan ändelse. Accenten hör till ordet och visas i facit.</div>
    </div>
  </div>

  <div class="controls">
    <button class="btn primary" id="btn-go" disabled>Rätta</button>
  </div>

  <div class="scorebar">
    Rätt i rad: <b id="streak">0</b> &nbsp;·&nbsp; bästa: <b id="best">0</b> &nbsp;·&nbsp; <b id="runda-kvar">0</b> kvar i rundan
  </div>
</div>

<div class="picker">
  <button class="picker-toggle" id="picker-toggle" aria-expanded="false">
    <span>Anpassa övningen <span class="count" id="ord-count"></span></span><span class="chev">▾</span>
  </button>
  <div class="picker-body hidden" id="picker-body">

    <div class="picker-section">
      <h2>Seminarium</h2>
      <div class="quickrow">
        <span class="quicklabel">Snabbval:</span>
        <button class="chip" data-sem-all>alla</button>
        <button class="chip" data-sem-none>inga</button>
      </div>
      <div class="grid" id="grid-sem"></div>
    </div>

    <div class="picker-section">
      <h2>Ord</h2>
      <div class="quickrow">
        <button class="chip" data-ord-all>alla</button>
        <button class="chip" data-ord-clear>rensa</button>
      </div>
      <div class="quickrow">
        <span class="quicklabel">Deklination:</span>
        <button class="chip" data-cat="d1">Dekl. 1</button>
        <button class="chip" data-cat="d2">Dekl. 2</button>
      </div>
      <div class="quickrow">
        <span class="quicklabel">Typ:</span>
        <button class="chip" data-cat="m">mask. -ος</button>
        <button class="chip" data-cat="n">neutr. -ον</button>
        <button class="chip" data-cat="fh">fem. η</button>
        <button class="chip" data-cat="fa">fem. ren α</button>
        <button class="chip" data-cat="fm">fem. blandad α</button>
      </div>
      <div class="grid" id="grid-ord"></div>
    </div>

    <div class="picker-section">
      <h2>Vokativ</h2>
      <div class="seg" id="seg-vok" role="group" aria-label="Vokativ">
        <button data-vok="0" aria-pressed="true">utan vokativ</button>
        <button data-vok="1" aria-pressed="false">med vokativ</button>
      </div>
    </div>

  </div>
</div>

<footer>
  Du får lemmat (nominativ) och en tom tabell — fyll varje ruta med rätt ändelse, så visas
  hela det attesterade paradigmet. Sviten räknas bara upp när <b>hela</b> tabellen är rätt.
  I <i>studera</i>-läget visas paradigmet färdigt att läsa. Deklination 1 har tre singular-typer
  som bara nominativ avslöjar: <code>ἀρχή</code> (η), <code>ἡμέρα</code> (ren α), <code>θάλασσα</code> (blandad α).
</footer>
</div>`;

export function render(root){
  root.innerHTML = MARKUP;

/* ── DATA (samma ögonblicksbild som ändelsespelet) ───────────────────── */
const GENUS_NAMN = { m:"maskulinum", n:"neutrum", f:"femininum" };
const KASUS = { nom:"nominativ", gen:"genitiv", dat:"dativ", ack:"ackusativ", vok:"vokativ" };
const KASUS_ORDNING = ["nom","gen","dat","ack","vok"];


/* Kategori-förval på deklinations-/typaxeln, som predikat på paradigmKey —
   härleds ur ord-listan så nya ord fångas automatiskt. Klick sätter ordurvalet;
   chipet blir svart (aria-pressed) när urvalet exakt motsvarar kategorin. */
const KATEGORIER = {
  d1: o => ["f1h","f1a","f1m"].includes(paradigmKey(o)),   // hela deklination 1
  d2: o => ["m2","n2"].includes(paradigmKey(o)),           // hela deklination 2
  m:  o => paradigmKey(o) === "m2",                        // mask. -ος
  n:  o => paradigmKey(o) === "n2",                        // neutr. -ον
  fh: o => paradigmKey(o) === "f1h",                       // fem. η-stam
  fa: o => paradigmKey(o) === "f1a",                       // fem. ren α
  fm: o => paradigmKey(o) === "f1m",                       // fem. blandad α
};
const katLemman = key => new Set(ord.filter(KATEGORIER[key]).map(o => o.lemma));

/* Seminarie-axel: varje ord bär sem:[…] ur ord.json. 0 = "Övriga". */
const SEMINARIER = [...new Set(ord.flatMap(o => o.sem))].sort((a,b) => a - b);
const HAR_OVRIGA = ord.some(o => o.sem.length === 0);
const SEM_VARDEN = [...SEMINARIER, ...(HAR_OVRIGA ? [0] : [])];
const semNamn = s => s === 0 ? "Övriga" : "Sem " + s;
const semMatch = o => o.sem.length
  ? o.sem.some(s => state.valdaSem.has(s))
  : state.valdaSem.has(0);

/* Palett: alla distinkta (accent-fria) ändelser över paradigmen — så valet
   kräver verklig diskriminering (dat.sg -ῳ vs -ῃ vs -ᾳ), inte bara matchning. */
const ANDELSER_ALLA = (() => {
  const s = [];
  for(const p in END) for(const k of KASUS_ORDNING) for(const n of ["sg","pl"]){
    const e = END[p][k][n]; if(!s.includes(e)) s.push(e);
  }
  return s;
})();

/* ── HJÄLPARE ────────────────────────────────────────────────────────── */
function pick(arr){ return arr[Math.floor(Math.random()*arr.length)]; }
function shuffle(arr){ const a=arr.slice(); for(let i=a.length-1;i>0;i--){ const j=Math.floor(Math.random()*(i+1)); [a[i],a[j]]=[a[j],a[i]]; } return a; }
function setEq(a,b){ return a.size===b.size && [...a].every(x=>b.has(x)); }
/* Härleder paradigm ur GENUS + nominativens/genitivens utljud. Det fungerar
   bara för deklination 1 och 2.
   VARNING: ord ur deklination 3 (ἡγεμών, ἀμπελών — sem 7) får ALDRIG in i
   `ord`-snapshoten ovan. De böjs på genitivstammen, inte ur genus, så de skulle
   tyst få paradigmKey "m2" och ge fel facit. Samma skäl som 2:a-dekl-feminina
   och 1:a-dekl-maskulina utelämnas. De övas i kasus- och kongruensspelen, där
   explicita former läses. Se json/ord.json → _tredjeklasser._om. */

/* ── TILLSTÅND ───────────────────────────────────────────────────────── */
const LAGER = "grekiska-paradigmspel";
const state = {
  mode: "fyll",                                   // "fyll" | "studera"
  medVok: false,
  valdaOrd: new Set(ord.map(o => o.lemma)),
  valdaSem: new Set(SEM_VARDEN),
  streak: 0, best: 0,
  ord: null, pk: null,
  svar: {},                                        // "k|n" -> vald ändelse
  aktiv: null,                                     // "k|n" som fylls just nu
  besvarad: false,
  rk: { ko: [], kvar: 0, forra: null, forraRen: true, bas: null },  // rundkö (glosmodell)
};

function aktivaKasus(){ return state.medVok ? KASUS_ORDNING : KASUS_ORDNING.filter(k => k !== "vok"); }
function celler(){ const ut = []; for(const k of aktivaKasus()) for(const n of ["sg","pl"]) ut.push(k+"|"+n); return ut; }
function synligaOrd(){ const p = ord.filter(semMatch); return p.length ? p : ord; }
function aktivaOrd(){
  const v = synligaOrd().filter(o => state.valdaOrd.has(o.lemma));
  return v.length ? v : synligaOrd();
}

/* Rundkö (glosmodell, som satsanalys): gå igenom orden en gång; ett ord som
   missas (tabellen ej helt rätt) läggs sist och återkommer inom rundan; tom kö
   → ny omblandad runda. Fylls om automatiskt när ordurvalet ändras. "kvar i
   rundan" räknar distinkta ord kvar att klara. */
function aktivaOrdIds(){ return aktivaOrd().map(o => o.lemma); }
function rkSig(){ return aktivaOrdIds().join(""); }
function rkFyll(){ const ids = aktivaOrdIds(); state.rk.ko = shuffle(ids); state.rk.kvar = ids.length; state.rk.bas = rkSig(); }
function rkNasta(){
  const rk = state.rk;
  if(rk.bas !== rkSig()){ rk.forra = null; rk.forraRen = true; rkFyll(); }
  else { if(rk.forra != null && !rk.forraRen) rk.ko.push(rk.forra); if(!rk.ko.length) rkFyll(); }
  let id = rk.ko.shift();
  if(id === rk.forra && rk.ko.length){ rk.ko.push(id); id = rk.ko.shift(); }
  rk.forra = id; rk.forraRen = false;
  return id;
}
function rkKlarad(){ const rk = state.rk; if(!rk.forraRen){ rk.forraRen = true; rk.kvar = Math.max(0, rk.kvar - 1); } }

/* ── PERSISTENS ──────────────────────────────────────────────────────── */
function spara(){
  try{ localStorage.setItem(LAGER, JSON.stringify({
    mode:state.mode, medVok:state.medVok,
    valdaOrd:[...state.valdaOrd], valdaSem:[...state.valdaSem], best:state.best,
  })); }catch(e){}
}
function ladda(){
  try{
    const r = JSON.parse(localStorage.getItem(LAGER)); if(!r) return;
    if(r.mode) state.mode = r.mode;
    if(typeof r.medVok === "boolean") state.medVok = r.medVok;
    if(Array.isArray(r.valdaOrd)) state.valdaOrd = new Set(r.valdaOrd.filter(l => ord.some(o=>o.lemma===l)));
    if(Array.isArray(r.valdaSem)) state.valdaSem = new Set(r.valdaSem.filter(s => SEM_VARDEN.includes(s)));
    if(!state.valdaSem.size) state.valdaSem = new Set(SEM_VARDEN);
    if(typeof r.best === "number") state.best = r.best;
  }catch(e){}
}

/* ── KORTLOGIK ───────────────────────────────────────────────────────── */
const $ = id => document.getElementById(id);
function uppdateraAntal(){ const el = $("ord-count"); if(el) el.textContent = "(" + aktivaOrd().length + " ord)"; }

function nyttOrd(){
  uppdateraAntal();
  state.ord = ord.find(x => x.lemma === rkNasta()) || pick(aktivaOrd());
  state.pk = paradigmKey(state.ord);
  state.svar = {};
  state.besvarad = false;
  state.svarRatt = null;
  state.aktiv = state.mode === "fyll" ? celler()[0] : null;
  render();
}

function nastaTom(){
  const c = celler();
  const start = c.indexOf(state.aktiv);
  for(let i = 1; i <= c.length; i++){
    const key = c[(start + i) % c.length];
    if(!state.svar[key]) return key;
  }
  return null;                                     // allt ifyllt
}
function allaIfyllda(){ return celler().every(key => state.svar[key]); }

/* ── RENDERING ───────────────────────────────────────────────────────── */
function cellInnehall(key){
  const [k, n] = key.split("|");
  const o = state.ord, pk = state.pk;
  if(state.mode === "studera"){
    return { cls:"cell study", html: ARTIKEL[o.genus][k][n] + " " + o.former[k][n] };
  }
  if(state.besvarad){
    const vald = state.svar[key], facit = END[pk][k][n];
    const ratt = vald === facit;
    const full = ARTIKEL[o.genus][k][n] + " " + o.former[k][n];
    const sub = ratt ? "" : `<span class="sub">du valde -${vald}</span>`;
    return { cls:"cell " + (ratt ? "good" : "bad"), html: full + sub };
  }
  const vald = state.svar[key];
  const aktiv = key === state.aktiv ? " active" : "";
  if(vald) return { cls:"cell" + aktiv, html:"-" + vald };
  return { cls:"cell empty" + aktiv, html:"·" };
}

function renderTabell(){
  const tb = $("tbody"); tb.innerHTML = "";
  for(const k of aktivaKasus()){
    const tr = document.createElement("tr");
    const lab = document.createElement("td");
    lab.className = "rowlab"; lab.textContent = KASUS[k];
    tr.appendChild(lab);
    for(const n of ["sg","pl"]){
      const td = document.createElement("td");
      const key = k + "|" + n;
      const info = cellInnehall(key);
      const b = document.createElement("button");
      b.className = info.cls; b.innerHTML = info.html;
      b.setAttribute("aria-label", KASUS[k] + " " + (n === "sg" ? "singular" : "plural"));
      if(state.mode === "fyll" && !state.besvarad){
        b.onclick = () => { state.aktiv = key; renderTabell(); };
      } else { b.disabled = true; }
      td.appendChild(b);
      tr.appendChild(td);
    }
    tb.appendChild(tr);
  }
}

function renderPalett(){
  const wrap = $("palette-wrap"), pal = $("palette");
  const dolj = state.mode === "studera" || state.besvarad;
  wrap.style.display = dolj ? "none" : "";
  if(dolj) return;
  pal.innerHTML = "";
  ANDELSER_ALLA.forEach(e => {
    const b = document.createElement("button");
    b.className = "end"; b.textContent = "-" + e;
    b.onclick = () => {
      if(!state.aktiv) state.aktiv = celler()[0];
      state.svar[state.aktiv] = e;
      state.aktiv = nastaTom() || state.aktiv;
      renderTabell(); renderPalett(); uppdateraGo();
    };
    pal.appendChild(b);
  });
}

function uppdateraGo(){
  const go = $("btn-go");
  if(state.mode === "studera"){ go.textContent = "Nästa ord"; go.disabled = false; return; }
  if(state.besvarad){ go.textContent = "Nästa"; go.disabled = false; return; }
  go.textContent = "Rätta"; go.disabled = !allaIfyllda();
}

function render(){
  const o = state.ord;
  $("lemma").textContent = o.lemma;
  $("tag").textContent = GENUS_NAMN[o.genus] + " · " + PARADIGM_NAMN[state.pk];
  $("glosa").textContent = o.glosa;
  $("streak").textContent = state.streak; $("best").textContent = state.best;
  $("runda-kvar").textContent = state.rk.kvar;
  renderTabell(); renderPalett(); uppdateraGo();

  // Grön/amber ram: grön när hela tabellen är rätt, amber annars.
  const kort = document.querySelector(".vy-paradigm .card");
  if(kort){
    kort.classList.toggle("svar-ratt", state.besvarad && state.svarRatt === true);
    kort.classList.toggle("svar-fel",  state.besvarad && state.svarRatt === false);
  }
}

/* ── SVAR & SVIT ─────────────────────────────────────────────────────── */
function ratta(){
  if(!allaIfyllda()) return;
  const alltRatt = celler().every(key => {
    const [k, n] = key.split("|");
    return state.svar[key] === END[state.pk][k][n];
  });
  state.besvarad = true;
  state.svarRatt = alltRatt;
  if(alltRatt){ rkKlarad(); state.streak++; if(state.streak > state.best){ state.best = state.streak; spara(); } }
  else state.streak = 0;
  render();
}

/* ── UI-BYGGE (väljaren) ─────────────────────────────────────────────── */
function byggGridSem(){
  const g = $("grid-sem"); g.innerHTML = "";
  SEM_VARDEN.forEach(s => {
    const b = document.createElement("button");
    b.className = "toggle"; b.textContent = semNamn(s);
    b.setAttribute("aria-pressed", state.valdaSem.has(s));
    b.onclick = () => {
      state.valdaSem.has(s) ? state.valdaSem.delete(s) : state.valdaSem.add(s);
      b.setAttribute("aria-pressed", state.valdaSem.has(s)); byggGridOrd(); spara(); nyttOrd();
    };
    g.appendChild(b);
  });
}
function byggGridOrd(){
  const g = $("grid-ord"); g.innerHTML = "";
  synligaOrd().forEach(o => {
    const b = document.createElement("button");
    b.className = "toggle"; b.textContent = o.lemma;
    b.setAttribute("aria-pressed", state.valdaOrd.has(o.lemma));
    b.onclick = () => {
      state.valdaOrd.has(o.lemma) ? state.valdaOrd.delete(o.lemma) : state.valdaOrd.add(o.lemma);
      b.setAttribute("aria-pressed", state.valdaOrd.has(o.lemma)); uppdateraKatChips(); spara(); nyttOrd();
    };
    g.appendChild(b);
  });
  uppdateraKatChips();
}
function uppdateraKatChips(){
  document.querySelectorAll("[data-cat]").forEach(b =>
    b.setAttribute("aria-pressed", setEq(state.valdaOrd, katLemman(b.dataset.cat))));
}
function uppdateraVokKnappar(){
  document.querySelectorAll("#seg-vok button").forEach(b =>
    b.setAttribute("aria-pressed", (b.dataset.vok === "1") === state.medVok));
}
function uppdateraLagesknappar(){
  $("mode-fyll").setAttribute("aria-pressed", state.mode === "fyll");
  $("mode-studera").setAttribute("aria-pressed", state.mode === "studera");
}

/* ── HÄNDELSER ───────────────────────────────────────────────────────── */
$("mode-fyll").onclick    = () => { state.mode="fyll";    uppdateraLagesknappar(); spara(); nyttOrd(); };
$("mode-studera").onclick = () => { state.mode="studera"; uppdateraLagesknappar(); spara(); nyttOrd(); };
$("btn-go").onclick = () => {
  if(state.mode === "studera") nyttOrd();
  else if(state.besvarad) nyttOrd();
  else ratta();
};

$("picker-toggle").onclick = () => {
  const open = $("picker-toggle").getAttribute("aria-expanded") === "true";
  $("picker-toggle").setAttribute("aria-expanded", !open);
  $("picker-body").classList.toggle("hidden", open);
};
document.querySelector("[data-ord-all]").onclick   = () => { state.valdaOrd = new Set(ord.map(o=>o.lemma)); byggGridOrd(); spara(); nyttOrd(); };
document.querySelector("[data-ord-clear]").onclick = () => { state.valdaOrd = new Set(); byggGridOrd(); spara(); nyttOrd(); };
document.querySelectorAll("[data-cat]").forEach(b => {
  b.onclick = () => { state.valdaOrd = katLemman(b.dataset.cat); byggGridOrd(); spara(); nyttOrd(); };
});
document.querySelector("[data-sem-all]").onclick  = () => { state.valdaSem = new Set(SEM_VARDEN); byggGridSem(); byggGridOrd(); spara(); nyttOrd(); };
document.querySelector("[data-sem-none]").onclick = () => { state.valdaSem = new Set(); byggGridSem(); byggGridOrd(); spara(); nyttOrd(); };
document.querySelectorAll("#seg-vok button").forEach(b =>
  b.onclick = () => { state.medVok = b.dataset.vok === "1"; uppdateraVokKnappar(); spara(); nyttOrd(); });

__kh = e => {
  if(e.key === "Enter"){
    if(state.mode === "studera" || state.besvarad) nyttOrd();
    else if(allaIfyllda()) ratta();
  }
};
document.addEventListener("keydown", __kh);

/* ── START ───────────────────────────────────────────────────────────── */
ladda(); uppdateraLagesknappar(); uppdateraVokKnappar();
byggGridOrd(); byggGridSem(); nyttOrd();

}
