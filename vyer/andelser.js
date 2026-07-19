// Orddata + artikel/ändelser/paradigmKey delas med paradigmspelet och GENERERAS ur
// json/ord.json (scripts/gen_ord_snapshot.py). Låg tidigare som verbatim-kopia
// i båda vyerna — 138 rader, utan något som fällde om bara den ena uppdaterades.
// Versionen ärvs ur den egna URL:en så importen cache-bustas som allt annat.
const vv = new URL(import.meta.url).search;
const { ord, ARTIKEL, END, PARADIGM_NAMN, paradigmKey } = await import(`./ord-data.js${vv}`);

// Vy: Artiklar & ändelser — portad exakt från grekiska-andelsespel.html
let __kh = null;
export function teardown(){ if(__kh){ document.removeEventListener("keydown", __kh); __kh = null; } }
const MARKUP = `<div class="vy vy-andelser">
<header>
  <h1>Grekiska — artiklar &amp; ändelser</h1>
  <div class="sub">Bygg formen: välj rätt artikel och ändelse för kasuset.</div>
</header>

<div class="modes" role="group" aria-label="Svårighet">
  <button class="mode" id="mode-full" aria-pressed="true">Artikel + ändelse</button>
  <button class="mode" id="mode-end" aria-pressed="false">Bara ändelse</button>
</div>

<div class="stage">
  <div class="card">
    <div class="lemma" id="lemma">—</div>
    <div class="tag" id="tag"></div>
    <div class="slot" id="slot"></div>

    <div class="answers" id="answers">
      <div class="answer-block" id="block-art">
        <div class="answer-label">artikel</div>
        <div class="opts" id="opts-art"></div>
      </div>
      <div class="answer-block">
        <div class="answer-label">ändelse</div>
        <div class="opts" id="opts-end"></div>
      </div>
    </div>

    <div class="reveal hidden" id="reveal">
      <div class="form" id="r-form"></div>
      <div class="glosa" id="r-glosa"></div>
      <div class="not hidden" id="r-not"></div>
    </div>
  </div>

  <div class="controls" id="controls">
    <button class="btn primary" id="btn-go" disabled>Rätta</button>
  </div>

  <div class="streak">
    Svit: <b id="streak">0</b> &nbsp;·&nbsp; bästa: <b id="best">0</b>
    &nbsp;·&nbsp; <b id="runda-kvar">0</b> kvar i rundan
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
        <span class="quicklabel">Kategori:</span>
        <button class="chip" data-deck="oxytona">Oxytona</button>
        <button class="chip" data-deck="neutrum">Neutrum</button>
        <button class="chip" data-deck="feminina">Feminina</button>
      </div>
      <div class="grid" id="grid-ord"></div>
    </div>

    <div class="picker-section">
      <h2>Kasus</h2>
      <div class="quickrow">
        <button class="chip" data-kasus-all>alla</button>
        <button class="chip" data-kasus-core>utan vokativ</button>
        <button class="chip" data-kasus-clear>rensa</button>
      </div>
      <div class="grid" id="grid-kasus"></div>
    </div>

    <div class="picker-section">
      <h2>Numerus</h2>
      <div class="seg" id="seg-num" role="group" aria-label="Numerus">
        <button data-num="sg" aria-pressed="true">singular</button>
        <button data-num="pl" aria-pressed="false">plural</button>
        <button data-num="blandat" aria-pressed="false">blandat</button>
      </div>
    </div>

  </div>
</div>

<footer>
  Du får lemmat (nominativ) och en målruta — välj <b>artikel</b> och <b>ändelse</b>, så visas
  hela den attesterade formen. Ändelserna står accent-fritt på knapparna; accenten hör till
  ordet och dyker upp först i facit (<code>ἄνθρωπος → ἀνθρώπῳ</code>). I läget
  <i>bara ändelse</i> är artikeln redan given. Deklination 1 har tre singular-typer som bara
  nominativ avslöjar: <code>ἀρχή</code> (η), <code>ἡμέρα</code> (ren α), <code>θάλασσα</code> (blandad α).
</footer>
</div>`;
export function render(root){
  root.innerHTML = MARKUP;

/* ── DATA ─────────────────────────────────────────────────────────────
   Ord-arrayen och kortlekarna är samma ögonblicksbild som kasusspelet.
   Ändelsetabellen (END) och paradigm-nyckeln är verifierade mot alla 530
   former i ord.json: stam + ändelse återger den attesterade formen exakt.
   Ändelserna visas accent-fritt på knapparna; accenten dyker upp först i
   den fullständiga formen i facit (ἄνθρωπος→ἀνθρώπῳ är inte mekanisk).   */

const GENUS_NAMN = { m:"maskulinum", n:"neutrum", f:"femininum" };
const KASUS = {
  nom:{namn:"nominativ"}, gen:{namn:"genitiv"}, dat:{namn:"dativ"}, ack:{namn:"ackusativ"}, vok:{namn:"vokativ"},
};
const KASUS_ORDNING = ["nom","gen","dat","ack","vok"];


const KORTLEKAR = {
  oxytona: ["θεός","ἀδελφός","καιρός","καρπός","λαός","οὐρανός","ὀφθαλμός","υἱός","Χριστός","ἱερόν","ἀρχή","φωνή","ψυχή","ζωή","ἐντολή","ἀδελφή","κεφαλή","συναγωγή","ὁδός","μαθητής"],
  neutrum: ["ἔργον","τέκνον","εὐαγγέλιον","ἱερόν","σημεῖον","πλοῖον","σάββατον","δαιμόνιον"],
  feminina: ["ἀρχή","φωνή","ψυχή","ζωή","ἐντολή","ἀδελφή","κεφαλή","συναγωγή","ἀγάπη","εἰρήνη","δικαιοσύνη","ἐκκλησία","ἡμέρα","ἁμαρτία","ἐξουσία","καρδία","βασιλεία","ὥρα","ἀλήθεια","θάλασσα","κώμη","δόξα","νόσος","ὁδός","ἔρημος","παρθένος"],
};

/* Kategori-deck ∩ snapshoten: decken listar även ord som generatorn utelämnar
   (2:a-dekl-femininer, 1:a-dekl-maskulina), så vi filtrerar till lemman som
   faktiskt finns. Ger korrekt urval OCH exakt chip-matchning nedan. */
const deckLemman = deck => (KORTLEKAR[deck] || []).filter(l => ord.some(o => o.lemma === l));
const setEq = (a, b) => a.size === b.size && [...a].every(x => b.has(x));

/* Seminarie-axel: varje ord bär sem:[…] ur ord.json. 0 = "Övriga" (otaggade
   högfrekventa NT-ord). Skalar till fler seminarier — chipsen radbryts. */
const SEMINARIER = [...new Set(ord.flatMap(o => o.sem))].sort((a,b) => a - b);
const HAR_OVRIGA = ord.some(o => o.sem.length === 0);
const SEM_VARDEN = [...SEMINARIER, ...(HAR_OVRIGA ? [0] : [])];
const semNamn = s => s === 0 ? "Övriga" : "Sem " + s;
const semMatch = o => o.sem.length
  ? o.sem.some(s => state.valdaSem.has(s))
  : state.valdaSem.has(0);

/* ── HJÄLPARE ────────────────────────────────────────────────────────── */
function pick(arr){ return arr[Math.floor(Math.random()*arr.length)]; }
function shuffle(arr){ const a=arr.slice(); for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]];} return a; }
/* Härleder paradigm ur GENUS + nominativens/genitivens utljud. Det fungerar
   bara för deklination 1 och 2.
   VARNING: ord ur deklination 3 (ἡγεμών, ἀμπελών — sem 7) får ALDRIG in i
   `ord`-snapshoten ovan. De böjs på genitivstammen, inte ur genus, så de skulle
   tyst få paradigmKey "m2" och ge fel facit. Samma skäl som 2:a-dekl-feminina
   och 1:a-dekl-maskulina utelämnas. De övas i kasus- och kongruensspelen, där
   explicita former läses. Se json/ord.json → _tredjeklasser._om. */

/* Distraktorer: most-constrained-first. Tier 1 = rätt slot men FEL paradigm/
   genus (den vassaste förväxlingen), tier 2 = samma paradigm men annan slot,
   tier 3 = global utfyllnad. Kollisioner och facit gallras bort. */
function byggDistraktorer(facit, tier1, tier2, tier3, antal){
  const ut = [facit];
  for(const tier of [shuffle(tier1), shuffle(tier2), shuffle(tier3)]){
    for(const x of tier){ if(ut.length>=antal) break; if(!ut.includes(x)) ut.push(x); }
  }
  return shuffle(ut);
}
function andelseOptioner(pk, k, n, antal){
  const facit = END[pk][k][n];
  const t1=[], t2=[], t3=[];
  for(const p in END){ if(p!==pk){ const e=END[p][k][n]; if(e!==facit) t1.push(e); } }
  for(const kk of KASUS_ORDNING) for(const nn of ["sg","pl"]){ const e=END[pk][kk][nn]; if(e!==facit) t2.push(e); }
  const alla=new Set(); for(const p in END) for(const kk of KASUS_ORDNING) for(const nn of ["sg","pl"]) alla.add(END[p][kk][nn]);
  alla.forEach(e=>{ if(e!==facit) t3.push(e); });
  return { facit, optioner: byggDistraktorer(facit, t1, t2, t3, antal) };
}
function artikelOptioner(genus, k, n, antal){
  const facit = ARTIKEL[genus][k][n];
  const t1=[], t2=[], t3=[];
  for(const g of ["m","n","f"]){ if(g!==genus){ const a=ARTIKEL[g][k][n]; if(a!==facit) t1.push(a); } }
  for(const kk of KASUS_ORDNING) for(const nn of ["sg","pl"]){ const a=ARTIKEL[genus][kk][nn]; if(a!==facit) t2.push(a); }
  const alla=new Set(); for(const g of ["m","n","f"]) for(const kk of KASUS_ORDNING) for(const nn of ["sg","pl"]) alla.add(ARTIKEL[g][kk][nn]);
  alla.forEach(a=>{ if(a!==facit) t3.push(a); });
  return { facit, optioner: byggDistraktorer(facit, t1, t2, t3, antal) };
}

/* Svensk glosa med kasusmarkör — samma princip som kasusspelet. */
function glosaMedKasus(w, k, n){
  const genS = b => /[sxz]$/.test(b) ? b : b + "s";
  const bas  = n === "pl" ? (w.glosaPl || w.glosa) : w.glosa;
  if(k === "gen"){ if(n === "pl") return w.glosaGenPl || genS(bas); return w.glosaGen || genS(bas); }
  if(k === "dat") return "till " + bas;
  if(k === "vok") return "o " + bas;
  return bas;
}

/* Pedagogisk not — lyfter just den diskriminering kortet tränar. */
function byggNot(o, pk, k, n){
  if(k === "vok") return "ὦ är en interjektion vid tilltal, inte en riktig artikel."
    + (pk === "m2" && n === "sg" ? " Vokativ singular har egen ändelse -ε i deklination 2 mask." : "");
  if(pk === "n2" && (k === "nom" || k === "ack"))
    return "Neutrum: nominativ och ackusativ är alltid lika (-ον i singular, -α i plural) — bara satsen avgör vilket.";
  if(pk === "f1h") return "η-stam: η genom hela singularis (nom -η, gen -ης, dat -ῃ, ack -ην).";
  if(pk === "f1a") return "Ren α: stammen slutar på ε, ι eller ρ, så α behålls i hela singularis (gen -ας, inte -ης).";
  if(pk === "f1m") return "Blandad α: nom och ack har α (-α, -αν), men gen och dat går över till η (-ης, -ῃ). Pluralen är som de andra.";
  return "";
}

/* ── TILLSTÅND ───────────────────────────────────────────────────────── */
const LAGER = "grekiska-andelsespel";
const state = {
  mode: "full",                                   // "full" | "end"
  numerus: "sg",                                  // "sg" | "pl" | "blandat"
  valdaOrd: new Set(ord.map(o => o.lemma)),
  valdaSem: new Set(SEM_VARDEN),
  valdaKasus: new Set(KASUS_ORDNING),
  streak: 0, best: 0,
  card: null, besvarad: false,
  selArt: null, selEnd: null, forraKort: null,
  rk: { ko: [], kvar: 0, forra: null, forraRen: true, bas: null },  // rundkö (glosmodell)
};

// Seminarie-urvalet styr vilka ord som visas i rutnätet; ordrutnätet finjusterar.
function synligaOrd(){ const p = ord.filter(semMatch); return p.length ? p : ord; }
function aktivaOrd(){
  const v = synligaOrd().filter(o => state.valdaOrd.has(o.lemma));
  return v.length ? v : synligaOrd();
}
function aktivaKasus(){ const v = KASUS_ORDNING.filter(k => state.valdaKasus.has(k)); return v.length ? v : KASUS_ORDNING; }

/* Rundkö (glosmodell, som satsanalys): gå igenom orden en gång; ett ord som
   missas läggs sist och återkommer inom rundan; tom kö → ny omblandad runda.
   Rundan fylls om automatiskt när ordurvalet ändras. "kvar i rundan" räknar
   distinkta ord kvar att klara. */
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
    mode:state.mode, numerus:state.numerus,
    valdaOrd:[...state.valdaOrd], valdaSem:[...state.valdaSem], valdaKasus:[...state.valdaKasus], best:state.best,
  })); }catch(e){}
}
function ladda(){
  try{
    const r = JSON.parse(localStorage.getItem(LAGER)); if(!r) return;
    if(r.mode) state.mode = r.mode;
    if(r.numerus) state.numerus = r.numerus;
    if(Array.isArray(r.valdaOrd))   state.valdaOrd   = new Set(r.valdaOrd.filter(l => ord.some(o=>o.lemma===l)));
    if(Array.isArray(r.valdaSem))   state.valdaSem   = new Set(r.valdaSem.filter(s => SEM_VARDEN.includes(s)));
    if(Array.isArray(r.valdaKasus)) state.valdaKasus = new Set(r.valdaKasus.filter(k => KASUS_ORDNING.includes(k)));
    if(!state.valdaSem.size) state.valdaSem = new Set(SEM_VARDEN);
    if(typeof r.best === "number") state.best = r.best;
  }catch(e){}
}

/* ── KORTLOGIK ───────────────────────────────────────────────────────── */
function uppdateraAntal(){ const el = $("ord-count"); if(el) el.textContent = "(" + aktivaOrd().length + " ord)"; }
function newQuestion(){
  const ordLista = aktivaOrd(), kasusLista = aktivaKasus();
  uppdateraAntal();
  const _id = rkNasta();
  const o = ord.find(x => x.lemma === _id) || pick(ordLista);
  const k = pick(kasusLista);
  const n = state.numerus === "blandat" ? pick(["sg","pl"]) : state.numerus;

  const pk = paradigmKey(o), g = o.genus;
  const eo = andelseOptioner(pk, k, n, 6);
  const ao = artikelOptioner(g, k, n, 6);
  const form = o.former[k][n];

  state.card = {
    lemma:o.lemma, genus:g, pk:pk, kasus:k, numerus:n,
    tag: GENUS_NAMN[g] + " · " + PARADIGM_NAMN[pk],
    slot: KASUS[k].namn + " " + (n === "sg" ? "singular" : "plural"),
    artFacit:ao.facit, artOpt:ao.optioner,
    endFacit:eo.facit, endOpt:eo.optioner,
    formFull: ARTIKEL[g][k][n] + " " + form,
    glosa: glosaMedKasus(o, k, n),
    not: byggNot(o, pk, k, n),
  };
  state.selArt = null; state.selEnd = null; state.besvarad = false;
  render();
}

/* ── RENDERING ───────────────────────────────────────────────────────── */
const $ = id => document.getElementById(id);

function klar(){ return state.mode === "end" ? !!state.selEnd : (!!state.selArt && !!state.selEnd); }

function renderOpts(){
  const c = state.card, ca = $("opts-art"), ce = $("opts-end");
  ca.innerHTML = ""; ce.innerHTML = "";

  if(state.mode === "end"){
    const b = document.createElement("button");
    b.className = "optx locked"; b.textContent = c.artFacit; b.disabled = true;
    b.setAttribute("aria-label", "artikel " + c.artFacit + " (given)");
    ca.appendChild(b);
  } else {
    c.artOpt.forEach(a => {
      const b = document.createElement("button");
      b.className = "optx"; b.textContent = a;
      b.setAttribute("aria-pressed", state.selArt === a);
      if(state.besvarad){ b.disabled = true;
        if(a === c.artFacit) b.classList.add("correct");
        else if(a === state.selArt) b.classList.add("wrong");
      } else { b.onclick = () => { state.selArt = a; renderOpts(); uppdateraGo(); }; }
      ca.appendChild(b);
    });
  }

  c.endOpt.forEach(e => {
    const b = document.createElement("button");
    b.className = "optx"; b.textContent = "-" + e;
    b.setAttribute("aria-pressed", state.selEnd === e);
    if(state.besvarad){ b.disabled = true;
      if(e === c.endFacit) b.classList.add("correct");
      else if(e === state.selEnd) b.classList.add("wrong");
    } else { b.onclick = () => { state.selEnd = e; renderOpts(); uppdateraGo(); }; }
    ce.appendChild(b);
  });
}
function uppdateraGo(){ if(!state.besvarad) $("btn-go").disabled = !klar(); }

function render(){
  const c = state.card;
  $("lemma").textContent = c.lemma;
  $("tag").textContent = c.tag;
  $("slot").textContent = c.slot;
  $("block-art").classList.toggle("hidden", false);
  $("streak").textContent = state.streak; $("best").textContent = state.best;
  $("runda-kvar").textContent = state.rk.kvar;
  renderOpts();

  // Resultat-ram runt kortet: grön vid rätt, amber vid fel (satsanalys-modellen).
  const ratt = state.besvarad && state.selEnd === c.endFacit && state.selArt === c.artFacit;
  const kort = document.querySelector(".vy-andelser .card");
  kort.classList.toggle("svar-ratt", state.besvarad && ratt);
  kort.classList.toggle("svar-fel",  state.besvarad && !ratt);

  if(state.besvarad){
    $("r-form").textContent = c.formFull;
    $("r-glosa").textContent = c.glosa;
    if(c.not){ $("r-not").textContent = c.not; $("r-not").classList.remove("hidden"); }
    else $("r-not").classList.add("hidden");
    $("reveal").classList.remove("hidden");
    $("btn-go").textContent = "Nästa"; $("btn-go").disabled = false;
  } else {
    $("reveal").classList.add("hidden");
    $("btn-go").textContent = "Rätta"; uppdateraGo();
  }
}

/* ── SVAR & SVIT ─────────────────────────────────────────────────────── */
function registrera(rätt){
  if(rätt){ state.streak++; if(state.streak > state.best){ state.best = state.streak; spara(); } }
  else state.streak = 0;
}
function rätta(){
  if(!klar()) return;
  const c = state.card;
  if(state.mode === "end") state.selArt = c.artFacit;
  state.besvarad = true;
  const rätt = state.selEnd === c.endFacit && state.selArt === c.artFacit;
  registrera(rätt);
  if(rätt) rkKlarad();
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
      b.setAttribute("aria-pressed", state.valdaSem.has(s)); byggGridOrd(); spara(); newQuestion();
    };
    g.appendChild(b);
  });
}
function byggGridOrd(){
  const g = $("grid-ord"); g.innerHTML = "";
  synligaOrd().forEach(o => {                        // visar bara ord i valda seminarier
    const b = document.createElement("button");
    b.className = "toggle"; b.textContent = o.lemma;
    b.setAttribute("aria-pressed", state.valdaOrd.has(o.lemma));
    b.onclick = () => {
      state.valdaOrd.has(o.lemma) ? state.valdaOrd.delete(o.lemma) : state.valdaOrd.add(o.lemma);
      b.setAttribute("aria-pressed", state.valdaOrd.has(o.lemma));
      uppdateraKategoriChips(); spara(); newQuestion();
    };
    g.appendChild(b);
  });
  uppdateraKategoriChips();
}
function byggGridKasus(){
  const g = $("grid-kasus"); g.innerHTML = "";
  KASUS_ORDNING.forEach(k => {
    const b = document.createElement("button");
    b.className = "toggle"; b.textContent = k;
    b.dataset.tip = KASUS[k].namn; b.setAttribute("aria-label", KASUS[k].namn);
    b.setAttribute("aria-pressed", state.valdaKasus.has(k));
    b.onclick = () => {
      state.valdaKasus.has(k) ? state.valdaKasus.delete(k) : state.valdaKasus.add(k);
      b.setAttribute("aria-pressed", state.valdaKasus.has(k)); spara(); newQuestion();
    };
    g.appendChild(b);
  });
}
function uppdateraNumKnappar(){
  document.querySelectorAll("#seg-num button").forEach(b =>
    b.setAttribute("aria-pressed", b.dataset.num === state.numerus));
}
function uppdateraLägesknappar(){
  $("mode-full").setAttribute("aria-pressed", state.mode === "full");
  $("mode-end").setAttribute("aria-pressed", state.mode === "end");
}
/* Kategori-chipsen (Oxytona/Neutrum/Feminina) blir svarta när ordurvalet exakt
   motsvarar deras deck — som snabbvals-chipsen i satsanalys. */
function uppdateraKategoriChips(){
  document.querySelectorAll("[data-deck]").forEach(b =>
    b.setAttribute("aria-pressed", setEq(state.valdaOrd, new Set(deckLemman(b.dataset.deck)))));
}

/* ── HÄNDELSER ───────────────────────────────────────────────────────── */
$("mode-full").onclick = () => { state.mode="full"; uppdateraLägesknappar(); spara(); newQuestion(); };
$("mode-end").onclick  = () => { state.mode="end";  uppdateraLägesknappar(); spara(); newQuestion(); };
$("btn-go").onclick = () => { if(state.besvarad) newQuestion(); else rätta(); };

$("picker-toggle").onclick = () => {
  const open = $("picker-toggle").getAttribute("aria-expanded") === "true";
  $("picker-toggle").setAttribute("aria-expanded", !open);
  $("picker-body").classList.toggle("hidden", open);
};
document.querySelector("[data-ord-all]").onclick   = () => { state.valdaOrd = new Set(ord.map(o=>o.lemma)); byggGridOrd(); spara(); newQuestion(); };
document.querySelector("[data-ord-clear]").onclick = () => { state.valdaOrd = new Set(); byggGridOrd(); spara(); newQuestion(); };
document.querySelectorAll("[data-deck]").forEach(b => {
  // En genus-kategori är oberoende av seminarium: öppna alla seminarier så orden
  // blir synliga (annars tomt snitt → tyst fallback till alla ord). Filtrera
  // decken mot snapshoten så urval och chip-matchning stämmer exakt.
  b.onclick = () => {
    state.valdaSem = new Set(SEM_VARDEN);
    state.valdaOrd = new Set(deckLemman(b.dataset.deck));
    byggGridSem(); byggGridOrd(); spara(); newQuestion();
  };
});
document.querySelector("[data-sem-all]").onclick  = () => { state.valdaSem = new Set(SEM_VARDEN); byggGridSem(); byggGridOrd(); spara(); newQuestion(); };
document.querySelector("[data-sem-none]").onclick = () => { state.valdaSem = new Set(); byggGridSem(); byggGridOrd(); spara(); newQuestion(); };
document.querySelector("[data-kasus-all]").onclick   = () => { state.valdaKasus = new Set(KASUS_ORDNING); byggGridKasus(); spara(); newQuestion(); };
document.querySelector("[data-kasus-core]").onclick  = () => { state.valdaKasus = new Set(["nom","gen","dat","ack"]); byggGridKasus(); spara(); newQuestion(); };
document.querySelector("[data-kasus-clear]").onclick = () => { state.valdaKasus = new Set(); byggGridKasus(); spara(); newQuestion(); };
document.querySelectorAll("#seg-num button").forEach(b =>
  b.onclick = () => { state.numerus = b.dataset.num; uppdateraNumKnappar(); spara(); newQuestion(); });

__kh = e => {
  if(e.key === "Enter"){ if(state.besvarad) newQuestion(); else if(klar()) rätta(); }
};
  document.addEventListener("keydown", __kh);;

/* ── START ───────────────────────────────────────────────────────────── */
ladda(); uppdateraLägesknappar(); uppdateraNumKnappar();
byggGridOrd(); byggGridKasus(); byggGridSem(); newQuestion();

}
