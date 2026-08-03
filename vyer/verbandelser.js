// Vy: Verbändelser — receptivt. Läs en form (eller bara ändelsen) och parsa den:
// person, tempus/modus. Fyra nivåer: personen ur hel form, bara ändelsen, tempus/
// modus, full parsning (tvågruppssvar). Speglar lärarens två bilder / grammatik-
// referensens översiktskort. Testar MORFOLOGI (vad ändelsen signalerar) — verb.js
// testar i stället betydelse (form → svensk översättning); de kompletterar varandra.
//
// Datan bärs som snapshots: verb-formerna importeras ur verb.js (mastern
// json/verb.json, regenereras med gen_verb_snapshot.py), ändelse-kartan ur den
// genererade verb-andelser-data.js. Versionen ärvs ur den egna URL:en så importerna
// cache-bustas som allt annat.
const vv = new URL(import.meta.url).search;
const { verb } = await import(`./verb.js${vv}`);
const { VERB_ANDELSER } = await import(`./verb-andelser-data.js${vv}`);

let __vh = null;
export function teardown(){
  if(__vh){ document.removeEventListener("keydown", __vh); __vh = null; }
  const s = document.getElementById("vy-verband-style");
  if(s) s.remove();
}

/* Etiketter — samma vokabulär som verb.js. */
const TEMPUS = { pres:"presens", impf:"imperfekt", fut:"futurum", aor:"aorist" };
const TEMPUS_ORDNING = ["pres","impf","fut","aor"];
const MODUS = { ind:"indikativ", imp:"imperativ", inf:"infinitiv" };
const MODUS_ORDNING = ["ind","imp","inf"];
const PN = {
  "1sg":{ pron:"jag", namn:"1:a person singular", kort:"1 sg" },
  "2sg":{ pron:"du", namn:"2:a person singular", kort:"2 sg" },
  "3sg":{ pron:"han/hon/det", namn:"3:e person singular", kort:"3 sg" },
  "1pl":{ pron:"vi", namn:"1:a person plural", kort:"1 pl" },
  "2pl":{ pron:"ni", namn:"2:a person plural", kort:"2 pl" },
  "3pl":{ pron:"de", namn:"3:e person plural", kort:"3 pl" },
};
const PN_ORDNING = ["1sg","2sg","3sg","1pl","2pl","3pl"];
const IMP_ORDNING = ["2sg","3sg","2pl","3pl"];      // imperativ saknar 1:a person
const modusAv  = k => k.split(".")[1];
const tempusAv = k => k.split(".")[0];
const cellerFor = k => modusAv(k)==="inf" ? ["inf"] : modusAv(k)==="imp" ? IMP_ORDNING : PN_ORDNING;
const keyLabel = k => TEMPUS[tempusAv(k)] + " " + MODUS[modusAv(k)];

/* Klasser: fältet klass ur snapshoten. Ändelse-kartan täcker bara ω-verb och
   kontraherade (lärarens två bilder); εἰμί och μι-verb har egna system och möter
   man i nivåerna bara som HELA former att parsa. */
const KLASSER = ["omega","kontrakt_e","oregelbunden","mi"];
const KLASSNAMN = { omega:"ω-verb", kontrakt_e:"kontraherade", oregelbunden:"εἰμί", mi:"μι-verb" };
const ANDELSEKLASSER = ["omega","kontrakt_e"];

/* Inför provet — provets 16 verb (samma lista som verb.js). */
const PROV_VERB_LISTA = ["ἀκολουθέω","ἀκούω","ἀποστέλλω","βαπτίζω","βλέπω","γράφω","δίδωμι","εἰμί","καλέω","κηρύσσω","λαλέω","λέγω","λύω","πέμπω","πιστεύω","ποιέω"];
const PROV_VERB = new Set(PROV_VERB_LISTA.filter(l => verb.some(v => v.lemma === l)));

/* Svensk ledtråd, samma regler som verb.js (svenskan böjs inte efter person). */
function svenskFras(sv, pn, tempus, modus){
  if(!sv || !sv.inf) return null;
  const pron = (PN[pn] && PN[pn].pron) || "";
  if(modus === "inf") return "att " + sv.inf;
  if(modus === "imp"){
    if(pn === "3sg" || pn === "3pl") return "må " + pron + " " + sv.inf;
    return sv.imp ? sv.imp + "!" : null;
  }
  if(tempus === "pres") return sv.pres ? pron + " " + sv.pres : null;
  if(tempus === "impf" || tempus === "aor") return sv.pret ? pron + " " + sv.pret : null;
  if(tempus === "fut")  return pron + " kommer att " + sv.inf;
  return null;
}

const NIVAER = [
  { id:"person",  namn:"Personen",       tag:"Vilken person visar ändelsen?" },
  { id:"andelse", namn:"Bara ändelsen",  tag:"Vilken person?" },
  { id:"tempus",  namn:"Tempus & modus", tag:"Vilket tempus och modus?" },
  { id:"full",    namn:"Full parsning",  tag:"Ange person, tempus och modus." },
];
const NIVA_IDS = NIVAER.map(n => n.id);

const STYLE = `
.vy-verband .modes{ display:flex; gap:.5rem; justify-content:center; margin:.4rem 0 0; flex-wrap:wrap; }
.vy-verband .mode{ font-family:"Spectral",serif; font-size:var(--fs-sm); padding:.35rem .9rem;
  border:1px solid var(--line); border-radius:999px; background:var(--card); color:var(--ink-soft); cursor:pointer; }
.vy-verband .mode[aria-pressed="true"]{ background:var(--ink); color:var(--paper); border-color:var(--ink); }
.vy-verband .stage{ display:flex; flex-direction:column; align-items:center; gap:1rem; margin-top:1rem; }
.vy-verband .card{ background:var(--card); border:1px solid var(--line); border-radius:14px;
  padding:1.5rem 1.4rem; min-width:min(32rem,92vw); text-align:center; box-shadow:0 1px 0 rgba(0,0,0,.03); }
.vy-verband .prompt{ font-family:"Cardo",serif; font-size:var(--fs-4xl); color:var(--ink); line-height:1.1; }
.vy-verband .prompt u{ text-decoration:none; color:var(--gold); border-bottom:2px solid var(--gold); }
.vy-verband .prompt.andelse{ color:var(--gold); }
.vy-verband .tag{ font-family:"Spectral",serif; color:var(--ink-soft); font-size:var(--fs-md); margin-top:.5rem; }
.vy-verband .answers{ display:flex; flex-direction:column; gap:.9rem; min-width:min(32rem,92vw); }
.vy-verband .agroup .alabel{ font-family:"Spectral",serif; color:var(--ink-soft); font-size:var(--fs-xs);
  text-transform:uppercase; letter-spacing:.06em; margin-bottom:.4rem; text-align:left; }
.vy-verband .opts.person{ display:grid; grid-template-columns:repeat(3,1fr); gap:.5rem; }
.vy-verband .opts.key{ display:grid; grid-template-columns:1fr 1fr; gap:.5rem; }
.vy-verband .opt{ font-family:"Cardo",serif; font-size:var(--fs-xl); padding:.55rem .3rem;
  border:1px solid var(--line); border-radius:10px; background:var(--card); color:var(--ink); cursor:pointer; text-align:center; }
.vy-verband .opt .sub{ display:block; font-family:"Spectral",serif; font-size:var(--fs-2xs); color:var(--ink-soft); }
.vy-verband .opt.key{ font-family:"Spectral",serif; font-size:var(--fs-md); }
@media (hover:hover){ .vy-verband .opt:hover:not(:disabled):not(.picked){ border-color:var(--gold); } }
.vy-verband .opt.picked{ border-color:var(--gold); background:var(--paper-2); }
.vy-verband .opt:disabled{ cursor:default; }
.vy-verband .opt.correct{ background:var(--good-bg); border-color:var(--good); color:var(--good); }
.vy-verband .opt.wrong{ background:var(--bad-bg); border-color:var(--bad); color:var(--bad); }
.vy-verband .reveal{ margin-top:.4rem; border-top:1px dashed var(--line); padding-top:.9rem; min-width:min(32rem,92vw); text-align:left; }
.vy-verband .reveal .facit{ font-family:"Spectral",serif; color:var(--ink); font-size:var(--fs-md); }
.vy-verband .reveal .facit b{ color:var(--ink); }
.vy-verband .reveal .and{ font-family:"Cardo",serif; color:var(--gold); font-weight:600; }
.vy-verband .reveal .hint{ font-family:"Spectral",serif; color:var(--ink-soft); font-size:var(--fs-sm); margin-top:.35rem; }
.vy-verband .reveal .amb{ font-family:"Spectral",serif; color:var(--ink-soft); font-size:var(--fs-sm); margin-top:.35rem; font-style:italic; }
.vy-verband .hidden{ display:none !important; }
.vy-verband .controls{ display:flex; gap:.6rem; justify-content:center; }
.vy-verband .btn{ font-family:"Spectral",serif; font-size:var(--fs-md); padding:.55rem 1.2rem;
  border:1px solid var(--line); border-radius:10px; background:var(--card); color:var(--ink); cursor:pointer; }
.vy-verband .btn.primary{ background:var(--gold); color:#fff; border-color:var(--gold); }
.vy-verband .streak{ font-family:"Spectral",serif; color:var(--ink-soft); font-size:var(--fs-sm); }
.vy-verband footer{ margin-top:1.4rem; font-family:"Spectral",serif; color:var(--ink-soft); font-size:var(--fs-2xs); text-align:center; }
`;

const MARKUP = `<div class="vy vy-verband">
<header>
  <h1>Grekiska — verbändelser</h1>
  <div class="sub" id="sub">Läs formen och avgör vilken person ändelsen visar.</div>
</header>

<div class="modes" role="group" aria-label="Nivå">
  ${NIVAER.map(n => `<button class="mode" id="niva-${n.id}" aria-pressed="false">${n.namn}</button>`).join("")}
</div>

<div class="stage">
  <div class="card">
    <div class="prompt" id="prompt">—</div>
    <div class="tag" id="tag"></div>
  </div>

  <div class="answers" id="answers">
    <div class="agroup hidden" id="grp-person">
      <div class="alabel">Person &amp; numerus</div>
      <div class="opts person" id="opts-person"></div>
    </div>
    <div class="agroup hidden" id="grp-key">
      <div class="alabel">Tempus &amp; modus</div>
      <div class="opts key" id="opts-key"></div>
    </div>
  </div>

  <div class="reveal hidden" id="reveal"></div>
  <div class="controls hidden" id="controls-next"><button class="btn primary" id="btn-next">Nästa</button></div>

  <div class="streak">Svit: <b id="streak">0</b> &nbsp;·&nbsp; bästa: <b id="best">0</b></div>
</div>

<div class="picker">
  <button class="picker-toggle" id="picker-toggle" aria-expanded="false"><span>Anpassa övningen <span class="count" id="vb-count"></span></span><span>▾</span></button>
  <div class="picker-body hidden" id="picker-body">
    <div>
      <h2>Tempus</h2>
      <div class="grid" id="grid-tempus"></div>
    </div>
    <div>
      <h2>Modus</h2>
      <div class="grid" id="grid-modus"></div>
    </div>
    <div>
      <h2>Verbklass</h2>
      <div class="quickrow">
        <span class="quicklabel">Prov:</span>
        <button class="chip chip-prov" data-prov title="Provets 16 verb i alla tempus och modus">Inför provet</button>
      </div>
      <div class="grid" id="grid-klass"></div>
    </div>
    <div id="sec-pn">
      <h2>Person &amp; numerus</h2>
      <div class="quickrow">
        <button class="chip" data-pn="all">alla</button>
        <button class="chip" data-pn="sg">singular</button>
        <button class="chip" data-pn="pl">plural</button>
      </div>
      <div class="grid" id="grid-pn"></div>
    </div>
  </div>
</div>

<footer>Receptivt: du <em>avläser</em> vad ändelsen signalerar. Ändelserna för ω-verb och kontraherade följer lärarens två bilder; εἰμί och μι-verb dyker upp som hela former. Vissa ändelser är tvetydiga — <span class="and">-ον</span> är både 1 sg och 3 pl i imperfekt, <span class="and">λύετε</span> både indikativ och imperativ — och då räknas alla giltiga svar som rätt.</footer>
</div>`;

export function render(root, opts = {}){
  if(!document.getElementById("vy-verband-style")){
    const st = document.createElement("style"); st.id = "vy-verband-style"; st.textContent = STYLE;
    document.head.appendChild(st);
  }
  root.innerHTML = MARKUP;

  const LAGER = "grekiska-verbandelser";
  const state = {
    niva: "person",
    selTempus: new Set(TEMPUS_ORDNING),
    selModus: new Set(MODUS_ORDNING),
    selKlass: new Set(KLASSER),
    selPN: new Set(PN_ORDNING),
    prov: false,
    streak: 0, best: 0, card: null, besvarad: false,
    valdPerson: null, valdKey: null,
  };

  const $ = id => document.getElementById(id);
  const pick = a => a[Math.floor(Math.random()*a.length)];
  const shuffle = a => { a=a.slice(); for(let i=a.length-1;i>0;i--){ const j=Math.floor(Math.random()*(i+1)); [a[i],a[j]]=[a[j],a[i]]; } return a; };
  const setEq = (a, b) => a.size === b.size && [...a].every(x => b.has(x));

  function spara(){ try{ localStorage.setItem(LAGER, JSON.stringify({
    niva:state.niva, selTempus:[...state.selTempus], selModus:[...state.selModus],
    selKlass:[...state.selKlass], selPN:[...state.selPN], prov:state.prov, best:state.best })); }catch(e){} }
  function ladda(){ try{ const r = JSON.parse(localStorage.getItem(LAGER)); if(!r) return;
    if(NIVA_IDS.includes(r.niva)) state.niva = r.niva;
    if(Array.isArray(r.selTempus)) state.selTempus = new Set(r.selTempus.filter(t => TEMPUS[t]));
    if(Array.isArray(r.selModus))  state.selModus  = new Set(r.selModus.filter(m => MODUS[m]));
    if(Array.isArray(r.selKlass))  state.selKlass  = new Set(r.selKlass.filter(k => KLASSER.includes(k)));
    if(Array.isArray(r.selPN))     state.selPN     = new Set(r.selPN.filter(k => PN_ORDNING.includes(k)));
    if(typeof r.prov === "boolean") state.prov = r.prov;
    if(typeof r.best === "number")  state.best = r.best;
    if(!state.selTempus.size) state.selTempus = new Set(TEMPUS_ORDNING);
    if(!state.selModus.size)  state.selModus  = new Set(MODUS_ORDNING);
    if(!state.selKlass.size)  state.selKlass  = new Set(KLASSER);
    if(!state.selPN.size)     state.selPN     = new Set(PN_ORDNING);
  }catch(e){} }

  /* ── Urval ─────────────────────────────────────────────────────── */
  const klassAktiv = v => state.selKlass.has(v.klass) && (!state.prov || PROV_VERB.has(v.lemma));
  const keyAktiv   = k => state.selTempus.has(tempusAv(k)) && state.selModus.has(modusAv(k));

  // Former att parsa (nivå 1/3/4). kravPerson=true hoppar över infinitiv (ingen person).
  function parsItems(kravPerson, ignorera){
    const ut = [];
    verb.filter(v => ignorera==="klass" || klassAktiv(v)).forEach(v => {
      Object.keys(v.former).filter(k => ignorera==="key" || keyAktiv(k)).forEach(k => {
        if(kravPerson && modusAv(k)==="inf") return;
        cellerFor(k).forEach(p => {
          if(p==="inf"){ if(!kravPerson) ut.push({ v, k, p }); }
          else if(ignorera==="pn" || state.selPN.has(p)) ut.push({ v, k, p });
        });
      });
    });
    return ut;
  }

  // Ändelser att parsa (nivå 2) — direkt ur kartan, klass-agnostiskt.
  function andelseItems(ignorera){
    const klasser = ANDELSEKLASSER.filter(kl => ignorera==="klass" || state.selKlass.has(kl));
    const use = klasser.length ? klasser : ANDELSEKLASSER;
    const ut = [];
    use.forEach(kl => Object.keys(VERB_ANDELSER[kl]).filter(k => ignorera==="key" || keyAktiv(k)).forEach(k => {
      cellerFor(k).forEach(p => {
        if(p === "inf") return;                       // ändelse-läget frågar person → hoppa infinitiv
        if(ignorera==="pn" || state.selPN.has(p)) ut.push({ kl, k, p });
      });
    }));
    return ut;
  }

  // Distinkta formnycklar i urvalet — pool för tempus/modus-alternativen.
  function aktivaKeys(){
    const s = new Set();
    verb.filter(klassAktiv).forEach(v => Object.keys(v.former).filter(keyAktiv).forEach(k => s.add(k)));
    return [...s];
  }

  /* ── Frågebygge ────────────────────────────────────────────────── */
  const endFor = (klass, key, pn) => {
    const kl = VERB_ANDELSER[klass]; if(!kl) return null;
    return (kl[key] && kl[key][pn]) || null;
  };
  const rensa = e => e ? e.replace(/^-/, "") : "";
  function markeraAndelse(form, ending){
    const e = rensa(ending);
    if(e && form.endsWith(e)){
      return form.slice(0, form.length - e.length) + "<u>" + e + "</u>";
    }
    return form;
  }

  function byggKeyOptions(v, pn, acceptedK){
    const aktiva = aktivaKeys();
    const finnsICell = kk => cellerFor(kk).includes(pn);
    const korrekta = [...acceptedK].filter(kk => aktiva.includes(kk) && finnsICell(kk));
    const ut = [...new Set(korrekta)];
    const distr = shuffle(aktiva.filter(kk => !acceptedK.has(kk)));
    for(const kk of distr){
      if(ut.length >= 4) break;
      if(!ut.some(x => keyLabel(x) === keyLabel(kk))) ut.push(kk);
    }
    return shuffle(ut.slice(0, Math.max(4, korrekta.length)));
  }

  function newQuestion(){
    uppdateraAntal();
    state.besvarad = false; state.valdPerson = null; state.valdKey = null;
    if(state.niva === "andelse"){
      let items = andelseItems(); if(!items.length) items = andelseItems("pn"); if(!items.length) items = andelseItems("key");
      const it = pick(items);
      const ending = VERB_ANDELSER[it.kl][it.k][it.p];
      const acceptedP = new Set(cellerFor(it.k).filter(p => VERB_ANDELSER[it.kl][it.k][p] === ending));
      state.card = {
        niva:"andelse", ending, klass:it.kl, key:it.k, pn:it.p,
        acceptedP, personOptions: cellerFor(it.k),
        tempus: tempusAv(it.k), modus: modusAv(it.k),
      };
    } else {
      const krav = state.niva !== "tempus";
      let items = parsItems(krav); if(!items.length) items = parsItems(krav, "pn"); if(!items.length) items = parsItems(krav, "key"); if(!items.length) items = parsItems(krav, "klass");
      const { v, k, p } = pick(items);
      const form = v.former[k][p];
      const acceptedP = p === "inf" ? new Set() : new Set(cellerFor(k).filter(pp => v.former[k][pp] === form));
      const acceptedK = new Set(Object.keys(v.former).filter(kk => v.former[kk][p] !== undefined && v.former[kk][p] === form));
      state.card = {
        niva: state.niva, v, key:k, pn:p, form, acceptedP, acceptedK,
        klass:v.klass, tempus:tempusAv(k), modus:modusAv(k),
        personOptions: p === "inf" ? [] : cellerFor(k),
        keyOptions: byggKeyOptions(v, p, acceptedK),
        ending: endFor(v.klass, k, p),
      };
    }
    render2();
  }

  /* ── Rendering ─────────────────────────────────────────────────── */
  function render2(){
    const c = state.card;
    const promptEl = $("prompt");
    if(c.niva === "andelse"){
      promptEl.className = "prompt andelse";
      promptEl.textContent = c.ending;
    } else {
      promptEl.className = "prompt";
      promptEl.innerHTML = markeraAndelse(c.form, c.ending);
    }
    const niva = NIVAER.find(n => n.id === c.niva);
    $("tag").textContent = state.besvarad ? "" : niva.tag;

    const visaPerson = c.niva !== "tempus" && c.personOptions.length > 0;
    const visaKey    = c.niva === "tempus" || c.niva === "full";
    $("grp-person").classList.toggle("hidden", !visaPerson);
    $("grp-key").classList.toggle("hidden", !visaKey);
    if(visaPerson) renderPersonOptions();
    if(visaKey) renderKeyOptions();

    $("reveal").classList.toggle("hidden", !state.besvarad);
    $("controls-next").classList.toggle("hidden", !state.besvarad);
    if(state.besvarad) visaFacit();
    $("streak").textContent = state.streak;
    $("best").textContent = state.best;
  }

  function renderPersonOptions(){
    const c = state.card, box = $("opts-person"); box.innerHTML = "";
    c.personOptions.forEach(p => {
      const b = document.createElement("button");
      b.className = "opt person";
      b.innerHTML = PN[p].kort + '<span class="sub">' + PN[p].pron + "</span>";
      if(state.besvarad){
        b.disabled = true;
        if(c.acceptedP.has(p)) b.classList.add("correct");
        else if(p === state.valdPerson) b.classList.add("wrong");
      } else {
        if(p === state.valdPerson) b.classList.add("picked");
        b.onclick = () => valjPerson(p);
      }
      box.appendChild(b);
    });
  }
  function renderKeyOptions(){
    const c = state.card, box = $("opts-key"); box.innerHTML = "";
    c.keyOptions.forEach(k => {
      const b = document.createElement("button");
      b.className = "opt key"; b.textContent = keyLabel(k);
      if(state.besvarad){
        b.disabled = true;
        if(c.acceptedK.has(k)) b.classList.add("correct");
        else if(k === state.valdKey) b.classList.add("wrong");
      } else {
        if(k === state.valdKey) b.classList.add("picked");
        b.onclick = () => valjKey(k);
      }
      box.appendChild(b);
    });
  }

  function valjPerson(p){
    if(state.besvarad) return;
    state.valdPerson = p;
    if(state.card.niva === "full"){ if(state.valdKey != null) rätta(); else render2(); }
    else rätta();
  }
  function valjKey(k){
    if(state.besvarad) return;
    state.valdKey = k;
    if(state.card.niva === "full"){ if(state.valdPerson != null) rätta(); else render2(); }
    else rätta();
  }

  function rätta(){
    const c = state.card;
    let rätt;
    if(c.niva === "tempus") rätt = c.acceptedK.has(state.valdKey);
    else if(c.niva === "full") rätt = c.acceptedP.has(state.valdPerson) && c.acceptedK.has(state.valdKey);
    else rätt = c.acceptedP.has(state.valdPerson);
    state.besvarad = true;
    if(rätt){ state.streak++; if(state.streak > state.best){ state.best = state.streak; spara(); } }
    else state.streak = 0;
    render2();
  }

  function visaFacit(){
    const c = state.card;
    const rev = $("reveal");
    const bitar = [];
    // Grammatisk facit
    const gram = [];
    if(c.niva === "andelse"){
      const perss = [...c.acceptedP];
      gram.push("<b>" + perss.map(p => PN[p].namn).join(" / ") + "</b>");
      gram.push(keyLabel(c.key));
    } else {
      if(c.pn !== "inf") gram.push("<b>" + [...c.acceptedP].map(p => PN[p].namn).join(" / ") + "</b>");
      gram.push([...c.acceptedK].map(keyLabel).join(" / "));
    }
    const formtext = c.niva === "andelse" ? c.ending
      : '<span class="and">' + c.form + "</span>";
    bitar.push('<div class="facit">' + formtext + " · " + gram.join(" · ") + "</div>");

    // Ändelse + svensk ledtråd
    const rader = [];
    if(c.niva !== "andelse"){
      const sv = c.v ? svenskFras(c.v.svenska, c.pn, c.tempus, c.modus) : null;
      if(sv) rader.push("→ " + sv);
      if(c.ending) rader.push('ändelsen <span class="and">' + c.ending + "</span>");
      else rader.push("oregelbunden — hela formen lärs in");
    }
    if(rader.length) bitar.push('<div class="hint">' + rader.join(" &nbsp;·&nbsp; ") + "</div>");

    // Tempus-signaler
    const sig = [];
    if(c.tempus === "fut" || c.tempus === "aor") sig.push("σ = tempustecken (futurum/aorist)");
    if((c.tempus === "impf" || c.tempus === "aor") && c.modus === "ind") sig.push("augment ἐ- = dåtid");
    if(sig.length) bitar.push('<div class="hint">' + sig.join(" &nbsp;·&nbsp; ") + "</div>");

    // Tvetydighet
    const ambP = c.acceptedP.size > 1;
    const ambK = c.niva !== "andelse" && [...c.acceptedK].filter(keyAktiv).length > 1;
    if(ambP || ambK){
      const noteringar = [];
      if(ambP) noteringar.push("samma ändelse för " + [...c.acceptedP].map(p => PN[p].kort).join(" och "));
      if(ambK) noteringar.push("samma form i " + [...c.acceptedK].map(keyLabel).join(" och "));
      bitar.push('<div class="amb">Tvetydig: ' + noteringar.join("; ") + " — kontexten avgör.</div>");
    }
    rev.innerHTML = bitar.join("");
  }

  /* ── Picker ────────────────────────────────────────────────────── */
  const parFinns = (t, m) => verb.some(v => Object.keys(v.former).some(k => tempusAv(k)===t && modusAv(k)===m));
  function byggGridTempus(){
    const g = $("grid-tempus"); g.innerHTML = "";
    TEMPUS_ORDNING.forEach(t => {
      const b = document.createElement("button");
      b.className = "toggle"; b.textContent = TEMPUS[t];
      b.setAttribute("aria-pressed", state.selTempus.has(t));
      b.onclick = () => { toggla(state.selTempus, t, TEMPUS_ORDNING); byggGridTempus(); spara(); newQuestion(); };
      g.appendChild(b);
    });
  }
  function byggGridModus(){
    const g = $("grid-modus"); g.innerHTML = "";
    MODUS_ORDNING.forEach(m => {
      const b = document.createElement("button");
      b.className = "toggle"; b.textContent = MODUS[m];
      b.setAttribute("aria-pressed", state.selModus.has(m));
      b.onclick = () => { toggla(state.selModus, m, MODUS_ORDNING); byggGridModus(); byggGridPN(); spara(); newQuestion(); };
      g.appendChild(b);
    });
  }
  function byggGridKlass(){
    const g = $("grid-klass"); g.innerHTML = "";
    KLASSER.forEach(kl => {
      const b = document.createElement("button");
      b.className = "toggle"; b.textContent = KLASSNAMN[kl];
      b.setAttribute("aria-pressed", state.selKlass.has(kl));
      b.onclick = () => { toggla(state.selKlass, kl, KLASSER); byggGridKlass(); uppdateraProvChip(); spara(); newQuestion(); };
      g.appendChild(b);
    });
  }
  function byggGridPN(){
    const g = $("grid-pn"); g.innerHTML = "";
    // Bara imperativ valt → 1:a person kan inte förekomma; knapparna inaktiveras.
    const baraImp = setEq(state.selModus, new Set(["imp"]));
    PN_ORDNING.forEach(k => {
      const b = document.createElement("button");
      b.className = "toggle"; b.textContent = PN[k].pron; b.setAttribute("aria-label", PN[k].namn);
      const finns = !(baraImp && (k === "1sg" || k === "1pl"));
      b.disabled = !finns;
      b.setAttribute("aria-pressed", finns && state.selPN.has(k));
      b.onclick = () => { toggla(state.selPN, k, PN_ORDNING); uppdateraPNChips(); spara(); newQuestion(); };
      g.appendChild(b);
    });
    uppdateraPNChips();
  }
  function toggla(set, v, alla){
    set.has(v) ? set.delete(v) : set.add(v);
    if(!set.size) alla.forEach(x => set.add(x));      // aldrig tomt urval
  }
  const PN_GRUPPER = { all:PN_ORDNING, sg:["1sg","2sg","3sg"], pl:["1pl","2pl","3pl"] };
  function uppdateraPNChips(){ document.querySelectorAll("[data-pn]").forEach(b =>
    b.setAttribute("aria-pressed", setEq(state.selPN, new Set(PN_GRUPPER[b.dataset.pn] || [])))); }
  function uppdateraProvChip(){ const c = $("picker-body").querySelector("[data-prov]");
    if(c) c.setAttribute("aria-pressed", state.prov); }
  function uppdateraLäge(){ NIVA_IDS.forEach(id => $("niva-" + id).setAttribute("aria-pressed", state.niva === id)); }
  function uppdateraSub(){ $("sub").textContent =
      state.niva === "person" ? "Läs formen och avgör vilken person ändelsen visar."
    : state.niva === "andelse" ? "Bara ändelsen visas — vilken person?"
    : state.niva === "tempus" ? "Läs formen och avgör tempus och modus."
    : "Läs formen och ange person, tempus och modus."; }
  function uppdateraAntal(){ const el = $("vb-count");
    if(el) el.textContent = "(" + [...state.selKlass].map(k => KLASSNAMN[k]).join(", ") + ")"; }

  /* ── Händelser ─────────────────────────────────────────────────── */
  const bytNiva = id => { state.niva = id; uppdateraLäge(); uppdateraSub(); byggGridPN(); spara(); newQuestion(); };
  NIVA_IDS.forEach(id => $("niva-" + id).onclick = () => bytNiva(id));
  $("btn-next").onclick = () => newQuestion();
  $("picker-toggle").onclick = () => { const o = $("picker-toggle").getAttribute("aria-expanded")==="true";
    $("picker-toggle").setAttribute("aria-expanded", !o); $("picker-body").classList.toggle("hidden", o); };
  $("picker-body").querySelector("[data-prov]").onclick = () => { state.prov = !state.prov; uppdateraProvChip(); spara(); newQuestion(); };
  document.querySelectorAll("[data-pn]").forEach(b => b.onclick = () => {
    state.selPN = new Set(PN_GRUPPER[b.dataset.pn] || PN_ORDNING); byggGridPN(); spara(); newQuestion(); });

  __vh = e => {
    if(e.target && /^(INPUT|TEXTAREA)$/.test(e.target.tagName)) return;
    if((e.key === "Enter" || e.key === " ") && state.besvarad){ e.preventDefault(); newQuestion(); return; }
    if(!state.besvarad){
      const c = state.card;
      const n = parseInt(e.key, 10);
      if(c && !isNaN(n) && n >= 1){
        // Siffror väljer i persongruppen (nivå 1/2/full) annars i tempus-gruppen (nivå 3).
        if(c.niva === "tempus"){ if(c.keyOptions[n-1]) valjKey(c.keyOptions[n-1]); }
        else if(c.personOptions[n-1]) valjPerson(c.personOptions[n-1]);
      }
    }
  };
  document.addEventListener("keydown", __vh);

  // Deep-link: #/verbandelser/<niva> landar direkt i rätt nivå (annars sparat val).
  ladda();
  if(opts.mode && NIVA_IDS.includes(opts.mode)) state.niva = opts.mode;
  uppdateraLäge(); uppdateraSub();
  byggGridTempus(); byggGridModus(); byggGridKlass(); byggGridPN(); uppdateraProvChip();
  newQuestion();
}
