// Vy: Verbböjning — presens ind. aktiv (ω-verb, kontraherade -έω, εἰμί) + imperfekt (εἰμί).
// Snapshot av verb.json (mastern). Formerna är verifierade — ej genererade här.
// Självförsörjande: injicerar egen .vy-verb-stil (designvariabler från app.css) och städar i teardown.
let __vh = null;

export function teardown(){
  if(__vh){ document.removeEventListener("keydown", __vh); __vh = null; }
  const s = document.getElementById("vy-verb-style");
  if(s) s.remove();
}

/* ── DATA — snapshot av verb.json. Former nycklas per tempus (pres, impf …);
   varianter håller godtagbara dubbelformer per tempus/person. ───────────── */
const verb = [
  { lemma:"λύω", glosa:"lösa", klass:"omega", kortlekar:["sem2"], former:{ pres:{"1sg":"λύω", "2sg":"λύεις", "3sg":"λύει", "1pl":"λύομεν", "2pl":"λύετε", "3pl":"λύουσι(ν)"} } },
  { lemma:"βλέπω", glosa:"se", klass:"omega", kortlekar:["sem2"], former:{ pres:{"1sg":"βλέπω", "2sg":"βλέπεις", "3sg":"βλέπει", "1pl":"βλέπομεν", "2pl":"βλέπετε", "3pl":"βλέπουσι(ν)"} } },
  { lemma:"ἀκούω", glosa:"höra", klass:"omega", kortlekar:["sem2"], former:{ pres:{"1sg":"ἀκούω", "2sg":"ἀκούεις", "3sg":"ἀκούει", "1pl":"ἀκούομεν", "2pl":"ἀκούετε", "3pl":"ἀκούουσι(ν)"} } },
  { lemma:"λέγω", glosa:"säga", klass:"omega", kortlekar:["sem2"], former:{ pres:{"1sg":"λέγω", "2sg":"λέγεις", "3sg":"λέγει", "1pl":"λέγομεν", "2pl":"λέγετε", "3pl":"λέγουσι(ν)"} } },
  { lemma:"γράφω", glosa:"skriva", klass:"omega", kortlekar:["sem2"], former:{ pres:{"1sg":"γράφω", "2sg":"γράφεις", "3sg":"γράφει", "1pl":"γράφομεν", "2pl":"γράφετε", "3pl":"γράφουσι(ν)"} } },
  { lemma:"ἐσθίω", glosa:"äta", klass:"omega", kortlekar:["sem2"], former:{ pres:{"1sg":"ἐσθίω", "2sg":"ἐσθίεις", "3sg":"ἐσθίει", "1pl":"ἐσθίομεν", "2pl":"ἐσθίετε", "3pl":"ἐσθίουσι(ν)"} } },
  { lemma:"κηρύσσω", glosa:"predika", klass:"omega", kortlekar:["sem2"], former:{ pres:{"1sg":"κηρύσσω", "2sg":"κηρύσσεις", "3sg":"κηρύσσει", "1pl":"κηρύσσομεν", "2pl":"κηρύσσετε", "3pl":"κηρύσσουσι(ν)"} } },
  { lemma:"λαμβάνω", glosa:"ta, gripa", klass:"omega", kortlekar:["sem2"], former:{ pres:{"1sg":"λαμβάνω", "2sg":"λαμβάνεις", "3sg":"λαμβάνει", "1pl":"λαμβάνομεν", "2pl":"λαμβάνετε", "3pl":"λαμβάνουσι(ν)"} } },
  { lemma:"παιδεύω", glosa:"uppfostra", klass:"omega", kortlekar:["sem2"], former:{ pres:{"1sg":"παιδεύω", "2sg":"παιδεύεις", "3sg":"παιδεύει", "1pl":"παιδεύομεν", "2pl":"παιδεύετε", "3pl":"παιδεύουσι(ν)"} } },
  { lemma:"πέμπω", glosa:"skicka", klass:"omega", kortlekar:["sem2"], former:{ pres:{"1sg":"πέμπω", "2sg":"πέμπεις", "3sg":"πέμπει", "1pl":"πέμπομεν", "2pl":"πέμπετε", "3pl":"πέμπουσι(ν)"} } },
  { lemma:"εὑρίσκω", glosa:"finna", klass:"omega", kortlekar:["sem2"], former:{ pres:{"1sg":"εὑρίσκω", "2sg":"εὑρίσκεις", "3sg":"εὑρίσκει", "1pl":"εὑρίσκομεν", "2pl":"εὑρίσκετε", "3pl":"εὑρίσκουσι(ν)"} } },
  { lemma:"πιστεύω", glosa:"tro (på)", klass:"omega", kortlekar:["sem2"], former:{ pres:{"1sg":"πιστεύω", "2sg":"πιστεύεις", "3sg":"πιστεύει", "1pl":"πιστεύομεν", "2pl":"πιστεύετε", "3pl":"πιστεύουσι(ν)"} } },
  { lemma:"βαπτίζω", glosa:"döpa", klass:"omega", kortlekar:["sem2"], former:{ pres:{"1sg":"βαπτίζω", "2sg":"βαπτίζεις", "3sg":"βαπτίζει", "1pl":"βαπτίζομεν", "2pl":"βαπτίζετε", "3pl":"βαπτίζουσι(ν)"} } },
  { lemma:"σῴζω", glosa:"rädda", klass:"omega", kortlekar:["sem2"], former:{ pres:{"1sg":"σῴζω", "2sg":"σῴζεις", "3sg":"σῴζει", "1pl":"σῴζομεν", "2pl":"σῴζετε", "3pl":"σῴζουσι(ν)"} } },
  { lemma:"κλέπτω", glosa:"stjäla", klass:"omega", kortlekar:["sem2"], former:{ pres:{"1sg":"κλέπτω", "2sg":"κλέπτεις", "3sg":"κλέπτει", "1pl":"κλέπτομεν", "2pl":"κλέπτετε", "3pl":"κλέπτουσι(ν)"} } },
  { lemma:"ἄγω", glosa:"leda", klass:"omega", kortlekar:["sem2"], former:{ pres:{"1sg":"ἄγω", "2sg":"ἄγεις", "3sg":"ἄγει", "1pl":"ἄγομεν", "2pl":"ἄγετε", "3pl":"ἄγουσι(ν)"} } },
  { lemma:"φιλέω", glosa:"älska, gilla", klass:"kontrakt_e", kortlekar:["sem4"], former:{ pres:{"1sg":"φιλῶ", "2sg":"φιλεῖς", "3sg":"φιλεῖ", "1pl":"φιλοῦμεν", "2pl":"φιλεῖτε", "3pl":"φιλοῦσι(ν)"} } },
  { lemma:"ζητέω", glosa:"söka", klass:"kontrakt_e", kortlekar:["sem4"], former:{ pres:{"1sg":"ζητῶ", "2sg":"ζητεῖς", "3sg":"ζητεῖ", "1pl":"ζητοῦμεν", "2pl":"ζητεῖτε", "3pl":"ζητοῦσι(ν)"} } },
  { lemma:"καλέω", glosa:"kalla", klass:"kontrakt_e", kortlekar:["sem4"], former:{ pres:{"1sg":"καλῶ", "2sg":"καλεῖς", "3sg":"καλεῖ", "1pl":"καλοῦμεν", "2pl":"καλεῖτε", "3pl":"καλοῦσι(ν)"} } },
  { lemma:"λαλέω", glosa:"tala", klass:"kontrakt_e", kortlekar:["sem4"], former:{ pres:{"1sg":"λαλῶ", "2sg":"λαλεῖς", "3sg":"λαλεῖ", "1pl":"λαλοῦμεν", "2pl":"λαλεῖτε", "3pl":"λαλοῦσι(ν)"} } },
  { lemma:"μαρτυρέω", glosa:"vittna om", klass:"kontrakt_e", kortlekar:["sem4"], former:{ pres:{"1sg":"μαρτυρῶ", "2sg":"μαρτυρεῖς", "3sg":"μαρτυρεῖ", "1pl":"μαρτυροῦμεν", "2pl":"μαρτυρεῖτε", "3pl":"μαρτυροῦσι(ν)"} } },
  { lemma:"ποιέω", glosa:"göra", klass:"kontrakt_e", kortlekar:["sem4"], former:{ pres:{"1sg":"ποιῶ", "2sg":"ποιεῖς", "3sg":"ποιεῖ", "1pl":"ποιοῦμεν", "2pl":"ποιεῖτε", "3pl":"ποιοῦσι(ν)"} } },
  { lemma:"τηρέω", glosa:"bevaka, bevara", klass:"kontrakt_e", kortlekar:["sem4"], former:{ pres:{"1sg":"τηρῶ", "2sg":"τηρεῖς", "3sg":"τηρεῖ", "1pl":"τηροῦμεν", "2pl":"τηρεῖτε", "3pl":"τηροῦσι(ν)"} } },
  { lemma:"εἰμί", glosa:"vara", klass:"oregelbunden", kortlekar:["sem4","eimi"], former:{ pres:{"1sg":"εἰμί", "2sg":"εἶ", "3sg":"ἐστί(ν)", "1pl":"ἐσμέν", "2pl":"ἐστέ", "3pl":"εἰσί(ν)"}, impf:{"1sg":"ἤμην", "2sg":"ἦς", "3sg":"ἦν", "1pl":"ἦμεν", "2pl":"ἦτε", "3pl":"ἦσαν"} }, varianter:{ impf:{"1sg":["ἦν"], "2sg":["ἦσθα"], "1pl":["ἤμεθα"]} } }
];

/* Tempus: nyckel → svensk etikett (standard: presens). */
const TEMPUS = { pres:"presens", impf:"imperfekt" };
const TEMPUS_ORDNING = ["pres","impf"];

/* Person/numerus: svensk etikett + pronomen (för kort och facit). */
const PN = {
  "1sg":{ namn:"1:a person singular", pron:"jag" },
  "2sg":{ namn:"2:a person singular", pron:"du" },
  "3sg":{ namn:"3:e person singular", pron:"han/hon/det" },
  "1pl":{ namn:"1:a person plural",   pron:"vi" },
  "2pl":{ namn:"2:a person plural",   pron:"ni" },
  "3pl":{ namn:"3:e person plural",   pron:"de" },
};
const PN_ORDNING = ["1sg","2sg","3sg","1pl","2pl","3pl"];

const LEKAR = {
  alla:  verb.map(v => v.lemma),
  sem2:  verb.filter(v => v.kortlekar.includes("sem2")).map(v => v.lemma),
  sem4:  verb.filter(v => v.kortlekar.includes("sem4")).map(v => v.lemma),
  eimi:  verb.filter(v => v.kortlekar.includes("eimi")).map(v => v.lemma),
};

const STYLE = `
.vy-verb .stage{ display:flex; flex-direction:column; align-items:center; gap:1rem; margin-top:1rem; }
.vy-verb .card{ background:var(--card); border:1px solid var(--line); border-radius:14px;
  padding:1.6rem 1.4rem; min-width:min(30rem,92vw); text-align:center;
  box-shadow:0 1px 0 rgba(0,0,0,.03); }
.vy-verb .prompt{ font-family:"Cardo",serif; font-size:var(--fs-4xl); color:var(--ink); line-height:1.1; }
.vy-verb .glosa{ font-family:"Spectral",serif; color:var(--ink-soft); font-size:var(--fs-lg); margin-top:.3rem; }
.vy-verb .target{ font-family:"Spectral",serif; color:var(--gold); font-size:var(--fs-xl); margin-top:.7rem; }
.vy-verb .target b{ color:var(--ink); }
.vy-verb .reveal{ margin-top:1rem; border-top:1px dashed var(--line); padding-top:1rem; }
.vy-verb .svar{ font-family:"Cardo",serif; font-size:var(--fs-3xl); color:var(--ink); }
.vy-verb .svarlabel{ font-family:"Spectral",serif; color:var(--ink-soft); font-size:var(--fs-sm); margin-top:.2rem; }
.vy-verb .hidden{ display:none !important; }
.vy-verb .controls{ display:flex; gap:.6rem; justify-content:center; }
.vy-verb .btn{ font-family:"Spectral",serif; font-size:var(--fs-md); padding:.55rem 1.2rem;
  border:1px solid var(--line); border-radius:10px; background:var(--card); color:var(--ink); cursor:pointer; }
.vy-verb .btn.primary{ background:var(--gold); color:#fff; border-color:var(--gold); }
.vy-verb .btn.good{ background:var(--good-bg); color:var(--good); border-color:var(--good); }
.vy-verb .btn.bad{ background:var(--bad-bg); color:var(--bad); border-color:var(--bad); }
.vy-verb .options{ display:grid; grid-template-columns:1fr 1fr; gap:.6rem; min-width:min(30rem,92vw); }
.vy-verb .opt{ font-family:"Cardo",serif; font-size:var(--fs-2xl); padding:.5rem .3rem;
  border:1px solid var(--line); border-radius:10px; background:var(--card); color:var(--ink); cursor:pointer; }
.vy-verb .opt:hover:not(:disabled){ border-color:var(--gold); }
.vy-verb .opt:disabled{ cursor:default; }
.vy-verb .opt.correct{ background:var(--good-bg); border-color:var(--good); color:var(--good); }
.vy-verb .opt.wrong{ background:var(--bad-bg); border-color:var(--bad); color:var(--bad); }
.vy-verb .streak{ font-family:"Spectral",serif; color:var(--ink-soft); font-size:var(--fs-sm); }
.vy-verb .modes{ display:flex; gap:.5rem; justify-content:center; margin:.4rem 0 0; }
.vy-verb .mode{ font-family:"Spectral",serif; font-size:var(--fs-sm); padding:.35rem .9rem;
  border:1px solid var(--line); border-radius:999px; background:var(--card); color:var(--ink-soft); cursor:pointer; }
.vy-verb .mode[aria-pressed="true"]{ background:var(--ink); color:var(--paper); border-color:var(--ink); }
.vy-verb .picker{ margin-top:1.4rem; }
.vy-verb .picker-toggle{ font-family:"Spectral",serif; background:none; border:none; color:var(--gold);
  cursor:pointer; font-size:var(--fs-sm); display:flex; align-items:center; gap:.3rem; }
.vy-verb .picker-body{ margin-top:.7rem; display:flex; flex-direction:column; gap:1rem; }
.vy-verb h2{ font-family:"Spectral",serif; font-size:var(--fs-sm); color:var(--ink-soft);
  text-transform:uppercase; letter-spacing:.05em; margin:0 0 .4rem; }
.vy-verb .quickrow{ display:flex; flex-wrap:wrap; gap:.4rem; margin-bottom:.5rem; }
.vy-verb .chip{ font-family:"Spectral",serif; font-size:var(--fs-2xs); padding:.3rem .7rem;
  border:1px solid var(--line); border-radius:999px; background:var(--card); color:var(--ink); cursor:pointer; }
.vy-verb .grid{ display:flex; flex-wrap:wrap; gap:.4rem; }
.vy-verb .toggle{ font-family:"Spectral",serif; font-size:var(--fs-2xs); padding:.35rem .7rem;
  border:1px solid var(--line); border-radius:8px; background:var(--card); color:var(--ink-soft); cursor:pointer; }
.vy-verb .toggle[aria-pressed="true"]{ background:var(--gold); color:#fff; border-color:var(--gold); }
.vy-verb .toggle:disabled{ opacity:.4; cursor:default; }
.vy-verb footer{ margin-top:1.4rem; font-family:"Spectral",serif; color:var(--ink-soft); font-size:var(--fs-2xs); text-align:center; }
`;

const MARKUP = `<div class="vy vy-verb">
<header>
  <h1>Grekiska — verbböjning</h1>
  <div class="sub" id="sub">Uppslagsform + person och numerus. Ge den rätta presensformen.</div>
</header>

<div class="modes" role="group" aria-label="Spelläge">
  <button class="mode" id="mode-vand" aria-pressed="true">Vänd-kort</button>
  <button class="mode" id="mode-flerval" aria-pressed="false">Flerval</button>
</div>

<div class="stage">
  <div class="card">
    <div class="prompt" id="prompt">—</div>
    <div class="glosa" id="glosa"></div>
    <div class="target" id="target"></div>
    <div class="reveal hidden" id="reveal">
      <div class="svar" id="svar"></div>
      <div class="svarlabel" id="svarlabel"></div>
    </div>
  </div>

  <div class="controls" id="controls-vand"><button class="btn primary" id="btn-vand">Visa formen</button></div>
  <div class="controls hidden" id="controls-grade">
    <button class="btn good" id="btn-kunde">Kunde</button>
    <button class="btn bad" id="btn-missade">Missade</button>
  </div>

  <div class="options hidden" id="options"></div>
  <div class="controls hidden" id="controls-next"><button class="btn primary" id="btn-next">Nästa</button></div>

  <div class="streak">Svit: <b id="streak">0</b> &nbsp;·&nbsp; bästa: <b id="best">0</b></div>
</div>

<div class="picker">
  <button class="picker-toggle" id="picker-toggle" aria-expanded="false"><span>Anpassa övningen</span><span>▾</span></button>
  <div class="picker-body hidden" id="picker-body">
    <div>
      <h2>Tempus</h2>
      <div class="grid" id="grid-tempus"></div>
    </div>
    <div>
      <h2>Verb</h2>
      <div class="quickrow">
        <button class="chip" data-lek="alla">alla</button>
        <button class="chip" data-lek="sem2">ω-verb (sem 2)</button>
        <button class="chip" data-lek="sem4">kontraherade (sem 4)</button>
        <button class="chip" data-lek="eimi">εἰμί</button>
      </div>
      <div class="grid" id="grid-verb"></div>
    </div>
    <div>
      <h2>Person &amp; numerus</h2>
      <div class="quickrow">
        <button class="chip" data-pn-all>alla</button>
        <button class="chip" data-pn-sg>singular</button>
        <button class="chip" data-pn-pl>plural</button>
      </div>
      <div class="grid" id="grid-pn"></div>
    </div>
  </div>
</div>

<footer>Distraktorerna i flerval är andra former av <em>samma</em> verb och tempus — de tränar ändelserna, inte gissning.</footer>
</div>`;

export function render(root){
  if(!document.getElementById("vy-verb-style")){
    const st = document.createElement("style"); st.id = "vy-verb-style"; st.textContent = STYLE;
    document.head.appendChild(st);
  }
  root.innerHTML = MARKUP;

  const LAGER = "grekiska-verbspel";
  const state = {
    mode: "vand",
    tempus: "pres",
    valdaVerb: new Set(verb.map(v => v.lemma)),
    valdaPN: new Set(PN_ORDNING),
    streak: 0, best: 0, card: null, besvarad: false, valt: null, forra: null,
  };

  const $ = id => document.getElementById(id);
  const pick = a => a[Math.floor(Math.random()*a.length)];
  const shuffle = a => { a=a.slice(); for(let i=a.length-1;i>0;i--){ const j=Math.floor(Math.random()*(i+1)); [a[i],a[j]]=[a[j],a[i]]; } return a; };
  const harTempus  = v => !!v.former[state.tempus];
  const aktivaVerb = () => { const v = verb.filter(o => state.valdaVerb.has(o.lemma) && harTempus(o)); return v.length ? v : verb.filter(harTempus); };
  const aktivaPN   = () => { const p = PN_ORDNING.filter(k => state.valdaPN.has(k)); return p.length ? p : PN_ORDNING; };

  function spara(){ try{ localStorage.setItem(LAGER, JSON.stringify({
    mode:state.mode, tempus:state.tempus, valdaVerb:[...state.valdaVerb], valdaPN:[...state.valdaPN], best:state.best })); }catch(e){} }
  function ladda(){ try{ const r = JSON.parse(localStorage.getItem(LAGER)); if(!r) return;
    if(r.mode) state.mode = r.mode;
    if(r.tempus && TEMPUS[r.tempus]) state.tempus = r.tempus;
    if(Array.isArray(r.valdaVerb)) state.valdaVerb = new Set(r.valdaVerb.filter(l => verb.some(v=>v.lemma===l)));
    if(Array.isArray(r.valdaPN))   state.valdaPN   = new Set(r.valdaPN.filter(k => PN_ORDNING.includes(k)));
    if(typeof r.best === "number") state.best = r.best;
  }catch(e){} }

  // Godtagbara svar för en person = primärform + ev. variantformer (samma tempus).
  const variantformer = (v, t, k) => (v.varianter && v.varianter[t] && v.varianter[t][k]) || [];
  const accepterade   = (v, t, k) => [v.former[t][k], ...variantformer(v, t, k)];

  function byggOptioner(v, t, rätta){
    // distraktorer = alla andra former (primär + variant) av SAMMA verb och tempus,
    // minus de som räknas som rätt svar (så en godtagbar variant aldrig blir "fel").
    const former = v.former[t];
    const pool = [];
    PN_ORDNING.forEach(k => { pool.push(former[k]); variantformer(v, t, k).forEach(f => pool.push(f)); });
    const distraktorer = [...new Set(pool)].filter(f => !rätta.has(f));
    const rätt = pick([...rätta]);   // slumpvis primär- eller variantform som rätt alternativ
    return shuffle([rätt, ...shuffle(distraktorer).slice(0,3)]);
  }

  function newQuestion(){
    const vs = aktivaVerb(), ps = aktivaPN(), t = state.tempus;
    let v, k, sig, n=0;
    do { v = pick(vs); k = pick(ps); sig = v.lemma+"|"+k; } while(sig === state.forra && ++n < 30);
    state.forra = sig;
    const rätta = new Set(accepterade(v, t, k));
    state.card = {
      lemma: v.lemma, glosa: v.glosa, pn: k,
      form: v.former[t][k], varianter: variantformer(v, t, k), rätta,
      optioner: state.mode === "flerval" ? byggOptioner(v, t, rätta) : null,
    };
    state.besvarad = false; state.valt = null;
    render2();
  }

  function render2(){
    const c = state.card;
    $("prompt").textContent = c.lemma;
    $("glosa").textContent = c.glosa;
    $("target").innerHTML = "→ <b>" + PN[c.pn].namn + "</b> (" + PN[c.pn].pron + ")";
    $("streak").textContent = state.streak;
    $("best").textContent = state.best;

    $("reveal").classList.add("hidden");
    $("controls-vand").classList.add("hidden");
    $("controls-grade").classList.add("hidden");
    $("options").classList.add("hidden");
    $("controls-next").classList.add("hidden");

    if(state.mode === "vand"){
      if(state.besvarad){ visaSvar(); $("controls-grade").classList.remove("hidden"); }
      else { $("controls-vand").classList.remove("hidden"); }
    } else {
      renderOptioner(); $("options").classList.remove("hidden");
      if(state.besvarad){ visaSvar(); $("controls-next").classList.remove("hidden"); }
    }
  }
  function visaSvar(){
    const c = state.card;
    $("svar").textContent = c.form;
    let label = c.lemma + " · " + PN[c.pn].namn;
    if(c.varianter.length) label += " · äv. " + c.varianter.join(", ");
    $("svarlabel").textContent = label;
    $("reveal").classList.remove("hidden");
  }
  function renderOptioner(){
    const box = $("options"); box.innerHTML = "";
    state.card.optioner.forEach(f => {
      const b = document.createElement("button");
      b.className = "opt"; b.textContent = f;
      if(state.besvarad){
        b.disabled = true;
        if(state.card.rätta.has(f)) b.classList.add("correct");
        else if(f === state.valt) b.classList.add("wrong");
      } else { b.onclick = () => svara(f); }
      box.appendChild(b);
    });
  }
  function registrera(rätt){ if(rätt){ state.streak++; if(state.streak>state.best){ state.best=state.streak; spara(); } } else state.streak=0; }
  function svara(f){ state.valt=f; state.besvarad=true; registrera(state.card.rätta.has(f)); render2(); }

  function byggGridTempus(){
    const g = $("grid-tempus"); g.innerHTML = "";
    TEMPUS_ORDNING.forEach(t => {
      const b = document.createElement("button");
      b.className="toggle"; b.textContent=TEMPUS[t];
      b.setAttribute("aria-pressed", state.tempus===t);
      b.onclick = () => { state.tempus=t; byggGridTempus(); byggGridVerb(); uppdateraSub(); spara(); newQuestion(); };
      g.appendChild(b);
    });
  }
  function byggGridVerb(){
    const g = $("grid-verb"); g.innerHTML = "";
    verb.forEach(v => {
      const b = document.createElement("button");
      b.className="toggle"; b.textContent=v.lemma;
      const finns = harTempus(v);
      b.disabled = !finns;
      if(!finns) b.setAttribute("aria-label", v.lemma + " (saknar " + TEMPUS[state.tempus] + ")");
      b.setAttribute("aria-pressed", finns && state.valdaVerb.has(v.lemma));
      b.onclick = () => { state.valdaVerb.has(v.lemma)?state.valdaVerb.delete(v.lemma):state.valdaVerb.add(v.lemma);
        b.setAttribute("aria-pressed", state.valdaVerb.has(v.lemma)); spara(); newQuestion(); };
      g.appendChild(b);
    });
  }
  function byggGridPN(){
    const g = $("grid-pn"); g.innerHTML = "";
    PN_ORDNING.forEach(k => {
      const b = document.createElement("button");
      b.className="toggle"; b.textContent=PN[k].pron; b.setAttribute("aria-label", PN[k].namn);
      b.setAttribute("aria-pressed", state.valdaPN.has(k));
      b.onclick = () => { state.valdaPN.has(k)?state.valdaPN.delete(k):state.valdaPN.add(k);
        b.setAttribute("aria-pressed", state.valdaPN.has(k)); spara(); newQuestion(); };
      g.appendChild(b);
    });
  }
  function uppdateraLäge(){ $("mode-vand").setAttribute("aria-pressed", state.mode==="vand");
    $("mode-flerval").setAttribute("aria-pressed", state.mode==="flerval"); }
  function uppdateraSub(){ $("sub").textContent = "Uppslagsform + person och numerus. Ge den rätta " + TEMPUS[state.tempus] + "formen."; }

  $("mode-vand").onclick    = () => { state.mode="vand"; uppdateraLäge(); spara(); newQuestion(); };
  $("mode-flerval").onclick = () => { state.mode="flerval"; uppdateraLäge(); spara(); newQuestion(); };
  $("btn-vand").onclick     = () => { state.besvarad=true; render2(); };
  $("btn-kunde").onclick    = () => { registrera(true); newQuestion(); };
  $("btn-missade").onclick  = () => { registrera(false); newQuestion(); };
  $("btn-next").onclick     = () => newQuestion();
  $("picker-toggle").onclick = () => { const o = $("picker-toggle").getAttribute("aria-expanded")==="true";
    $("picker-toggle").setAttribute("aria-expanded", !o); $("picker-body").classList.toggle("hidden", o); };

  document.querySelectorAll("[data-lek]").forEach(b => b.onclick = () => {
    state.valdaVerb = new Set(LEKAR[b.dataset.lek] || []); byggGridVerb(); spara(); newQuestion(); });
  document.querySelector("[data-pn-all]").onclick = () => { state.valdaPN=new Set(PN_ORDNING); byggGridPN(); spara(); newQuestion(); };
  document.querySelector("[data-pn-sg]").onclick  = () => { state.valdaPN=new Set(["1sg","2sg","3sg"]); byggGridPN(); spara(); newQuestion(); };
  document.querySelector("[data-pn-pl]").onclick  = () => { state.valdaPN=new Set(["1pl","2pl","3pl"]); byggGridPN(); spara(); newQuestion(); };

  __vh = e => {
    if(e.code==="Space" && state.mode==="vand" && !state.besvarad){ e.preventDefault(); state.besvarad=true; render2(); }
    else if(e.key==="Enter" && state.besvarad && state.mode==="flerval"){ newQuestion(); }
    else if(state.mode==="flerval" && !state.besvarad && /^[1-4]$/.test(e.key)){
      const f = state.card.optioner[+e.key-1]; if(f) svara(f); }
  };
  document.addEventListener("keydown", __vh);

  ladda(); uppdateraLäge(); byggGridTempus(); byggGridVerb(); byggGridPN(); uppdateraSub(); newQuestion();
}
