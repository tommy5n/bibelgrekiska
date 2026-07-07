// Vy: Pronomen — personliga pronomen (ἐγώ, σύ) i 1:a och 2:a person.
// Snapshot av pronomen.json (mastern). Formerna är verifierade — ej genererade här.
// Övar person + numerus + kasus samt den betonade/obetonade (enklitiska) distinktionen.
// Självförsörjande: injicerar egen .vy-pron-stil (designvariabler från app.css) och städar i teardown.
//
// Byggd för att växa: 'modell' avgör frågelogiken. Idag finns bara personliga
// pronomen (modell="person"). Demonstrativa/interrogativa (modell="genus",
// B § 120/122) böjs efter genus som adjektiv och läggs till i pronomen.json +
// en genus-gren i newQuestion() när seminarium 6 kommer.
let __ph = null;

export function teardown(){
  if(__ph){ document.removeEventListener("keydown", __ph); __ph = null; }
  const s = document.getElementById("vy-pron-style");
  if(s) s.remove();
}

/* ── DATA — snapshot av pronomen.json (personliga pronomen).
   former[numerus][kasus] = [betonad, obetonad]; obetonad=null där särform saknas
   (nominativ, samt hela pluralen). sv = svensk översättning per kasus. ───────── */
const pronomen = [
  { lemma:"ἐγώ", glosa:"jag", person:1, modell:"person",
    former:{
      sg:{ nom:["ἐγώ",null], gen:["ἐμοῦ","μου"], dat:["ἐμοί","μοι"], ack:["ἐμέ","με"] },
      pl:{ nom:["ἡμεῖς",null], gen:["ἡμῶν",null], dat:["ἡμῖν",null], ack:["ἡμᾶς",null] },
    },
    sv:{ sg:{ nom:"jag", gen:"min", dat:"till mig", ack:"mig" },
         pl:{ nom:"vi",  gen:"vår", dat:"till oss", ack:"oss" } } },
  { lemma:"σύ", glosa:"du", person:2, modell:"person",
    former:{
      sg:{ nom:["σύ",null], gen:["σοῦ","σου"], dat:["σοί","σοι"], ack:["σέ","σε"] },
      pl:{ nom:["ὑμεῖς",null], gen:["ὑμῶν",null], dat:["ὑμῖν",null], ack:["ὑμᾶς",null] },
    },
    sv:{ sg:{ nom:"du", gen:"din", dat:"till dig", ack:"dig" },
         pl:{ nom:"ni", gen:"er",  dat:"till er",  ack:"er" } } },
];

const KASUS = { nom:"nominativ", gen:"genitiv", dat:"dativ", ack:"ackusativ" };
const KASUS_ORDNING = ["nom","gen","dat","ack"];
const NUM = { sg:"singular", pl:"plural" };
const NUM_ORDNING = ["sg","pl"];
const BET = { betonad:"betonad", obetonad:"obetonad" };
const BET_ORDNING = ["betonad","obetonad"];

// Alla giltiga kort = kombinationer (pronomen × numerus × kasus × betoning)
// där en form faktiskt finns (obetonad saknas i nominativ och i pluralen).
function alla_kombos(){
  const out = [];
  pronomen.forEach(p => NUM_ORDNING.forEach(num => KASUS_ORDNING.forEach(kas => BET_ORDNING.forEach(bet => {
    const form = formen(p, num, kas, bet);
    if(form) out.push({ lemma:p.lemma, num, kas, bet, form });
  }))));
  return out;
}
const formen = (p, num, kas, bet) => p.former[num][kas][bet==="betonad" ? 0 : 1];
const prom   = l => pronomen.find(p => p.lemma === l);

const STYLE = `
.vy-pron .stage{ display:flex; flex-direction:column; align-items:center; gap:1rem; margin-top:1rem; }
.vy-pron .card{ background:var(--card); border:1px solid var(--line); border-radius:14px;
  padding:1.6rem 1.4rem; min-width:min(30rem,92vw); text-align:center;
  box-shadow:0 1px 0 rgba(0,0,0,.03); }
.vy-pron .prompt{ font-family:"Cardo",serif; font-size:var(--fs-4xl); color:var(--ink); line-height:1.1; }
.vy-pron .glosa{ font-family:"Spectral",serif; color:var(--ink-soft); font-size:var(--fs-lg); margin-top:.3rem; }
.vy-pron .target{ font-family:"Spectral",serif; color:var(--gold); font-size:var(--fs-xl); margin-top:.7rem; }
.vy-pron .target b{ color:var(--ink); }
.vy-pron .bet{ font-family:"Spectral",serif; font-size:var(--fs-sm); margin-top:.3rem; color:var(--ink-soft); }
.vy-pron .bet.enklit{ color:var(--gold); }
.vy-pron .reveal{ margin-top:1rem; border-top:1px dashed var(--line); padding-top:1rem; }
.vy-pron .svar{ font-family:"Cardo",serif; font-size:var(--fs-3xl); color:var(--ink); }
.vy-pron .svarlabel{ font-family:"Spectral",serif; color:var(--ink-soft); font-size:var(--fs-sm); margin-top:.2rem; }
.vy-pron .hidden{ display:none !important; }
.vy-pron .controls{ display:flex; gap:.6rem; justify-content:center; }
.vy-pron .btn{ font-family:"Spectral",serif; font-size:var(--fs-md); padding:.55rem 1.2rem;
  border:1px solid var(--line); border-radius:10px; background:var(--card); color:var(--ink); cursor:pointer; }
.vy-pron .btn.primary{ background:var(--gold); color:#fff; border-color:var(--gold); }
.vy-pron .btn.good{ background:var(--good-bg); color:var(--good); border-color:var(--good); }
.vy-pron .btn.bad{ background:var(--bad-bg); color:var(--bad); border-color:var(--bad); }
.vy-pron .options{ display:grid; grid-template-columns:1fr 1fr; gap:.6rem; min-width:min(30rem,92vw); }
.vy-pron .opt{ font-family:"Cardo",serif; font-size:var(--fs-2xl); padding:.5rem .3rem;
  border:1px solid var(--line); border-radius:10px; background:var(--card); color:var(--ink); cursor:pointer; }
.vy-pron .opt:hover:not(:disabled){ border-color:var(--gold); }
.vy-pron .opt:disabled{ cursor:default; }
.vy-pron .opt.correct{ background:var(--good-bg); border-color:var(--good); color:var(--good); }
.vy-pron .opt.wrong{ background:var(--bad-bg); border-color:var(--bad); color:var(--bad); }
.vy-pron .streak{ font-family:"Spectral",serif; color:var(--ink-soft); font-size:var(--fs-sm); }
.vy-pron .modes{ display:flex; gap:.5rem; justify-content:center; margin:.4rem 0 0; }
.vy-pron .mode{ font-family:"Spectral",serif; font-size:var(--fs-sm); padding:.35rem .9rem;
  border:1px solid var(--line); border-radius:999px; background:var(--card); color:var(--ink-soft); cursor:pointer; }
.vy-pron .mode[aria-pressed="true"]{ background:var(--ink); color:var(--paper); border-color:var(--ink); }
/* Picker (.picker/.picker-toggle/.toggle m.fl.) stylas nu av den delade
   komponenten i app.css — inga vy-lokala regler här. */
.vy-pron footer{ margin-top:1.4rem; font-family:"Spectral",serif; color:var(--ink-soft); font-size:var(--fs-2xs); text-align:center; }
`;

const MARKUP = `<div class="vy vy-pron">
<header>
  <h1>Grekiska — personliga pronomen</h1>
  <div class="sub" id="sub">Person, numerus och kasus + betoning. Ge den rätta formen.</div>
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
    <div class="bet" id="betlabel"></div>
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
      <h2>Pronomen</h2>
      <div class="grid" id="grid-pron"></div>
    </div>
    <div>
      <h2>Numerus</h2>
      <div class="grid" id="grid-num"></div>
    </div>
    <div>
      <h2>Kasus</h2>
      <div class="grid" id="grid-kas"></div>
    </div>
    <div>
      <h2>Betoning</h2>
      <div class="grid" id="grid-bet"></div>
    </div>
  </div>
</div>

<footer>Betonade former (ἐμοῦ, ἐμοί, ἐμέ) står efter preposition och vid emfas; obetonade/enklitiska (μου, μοι, με) i övriga fall. Nominativ och pluralen saknar obetonad särform.</footer>
</div>`;

export function render(root){
  if(!document.getElementById("vy-pron-style")){
    const st = document.createElement("style"); st.id = "vy-pron-style"; st.textContent = STYLE;
    document.head.appendChild(st);
  }
  root.innerHTML = MARKUP;

  const LAGER = "grekiska-pronomenspel";
  const state = {
    mode: "vand",
    valdaPron: new Set(pronomen.map(p => p.lemma)),
    valdaNum:  new Set(NUM_ORDNING),
    valdaKas:  new Set(KASUS_ORDNING),
    valdaBet:  new Set(BET_ORDNING),
    streak: 0, best: 0, card: null, besvarad: false, valt: null, forra: null,
  };

  const $ = id => document.getElementById(id);
  const pick = a => a[Math.floor(Math.random()*a.length)];
  const shuffle = a => { a=a.slice(); for(let i=a.length-1;i>0;i--){ const j=Math.floor(Math.random()*(i+1)); [a[i],a[j]]=[a[j],a[i]]; } return a; };

  // Aktiva kort = giltiga kombinationer som matchar alla valda dimensioner.
  // Faller tillbaka på hela mängden om ett urval råkar bli tomt.
  function aktivaKombos(){
    const k = alla_kombos().filter(c =>
      state.valdaPron.has(c.lemma) && state.valdaNum.has(c.num) &&
      state.valdaKas.has(c.kas) && state.valdaBet.has(c.bet));
    return k.length ? k : alla_kombos();
  }

  function spara(){ try{ localStorage.setItem(LAGER, JSON.stringify({
    mode:state.mode, valdaPron:[...state.valdaPron], valdaNum:[...state.valdaNum],
    valdaKas:[...state.valdaKas], valdaBet:[...state.valdaBet], best:state.best })); }catch(e){} }
  function ladda(){ try{ const r = JSON.parse(localStorage.getItem(LAGER)); if(!r) return;
    if(r.mode) state.mode = r.mode;
    if(Array.isArray(r.valdaPron)) state.valdaPron = new Set(r.valdaPron.filter(l => pronomen.some(p=>p.lemma===l)));
    if(Array.isArray(r.valdaNum))  state.valdaNum  = new Set(r.valdaNum.filter(k => NUM_ORDNING.includes(k)));
    if(Array.isArray(r.valdaKas))  state.valdaKas  = new Set(r.valdaKas.filter(k => KASUS_ORDNING.includes(k)));
    if(Array.isArray(r.valdaBet))  state.valdaBet  = new Set(r.valdaBet.filter(k => BET_ORDNING.includes(k)));
    if(typeof r.best === "number") state.best = r.best;
    // skydda mot tomma urval från gammalt sparat läge
    if(!state.valdaPron.size) state.valdaPron = new Set(pronomen.map(p=>p.lemma));
    if(!state.valdaNum.size)  state.valdaNum  = new Set(NUM_ORDNING);
    if(!state.valdaKas.size)  state.valdaKas  = new Set(KASUS_ORDNING);
    if(!state.valdaBet.size)  state.valdaBet  = new Set(BET_ORDNING);
  }catch(e){} }

  // Distraktorer = andra former ur SAMMA pronomens paradigm (så ändelserna tränas,
  // inte gissning). Fyll på från det andra pronomenet om paradigmet inte räcker till 4.
  function byggOptioner(c){
    const egna = alla_kombos().filter(x => x.lemma === c.lemma && x.form !== c.form).map(x => x.form);
    let pool = [...new Set(egna)];
    if(pool.length < 3){
      const ovriga = alla_kombos().filter(x => x.lemma !== c.lemma && x.form !== c.form).map(x => x.form);
      pool = [...new Set([...pool, ...ovriga])];
    }
    return shuffle([c.form, ...shuffle(pool).slice(0,3)]);
  }

  function newQuestion(){
    const ks = aktivaKombos();
    let c, sig, n=0;
    do { c = pick(ks); sig = c.lemma+"|"+c.num+"|"+c.kas+"|"+c.bet; } while(sig === state.forra && ++n < 30);
    state.forra = sig;
    const p = prom(c.lemma);
    state.card = {
      ...c, glosa: p.glosa, sv: p.sv[c.num][c.kas],
      optioner: state.mode === "flerval" ? byggOptioner(c) : null,
    };
    state.besvarad = false; state.valt = null;
    render2();
  }

  function render2(){
    const c = state.card;
    $("prompt").textContent = c.lemma;
    $("glosa").textContent = c.glosa;
    $("target").innerHTML = "→ <b>" + KASUS[c.kas] + " " + NUM[c.num] + "</b> (" + c.sv + ")";
    const enklit = c.bet === "obetonad";
    $("betlabel").textContent = enklit ? "obetonad (enklitisk) form" : "betonad form";
    $("betlabel").classList.toggle("enklit", enklit);
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
    $("svarlabel").textContent = c.lemma + " · " + KASUS[c.kas] + " " + NUM[c.num] + " · " + BET[c.bet];
    $("reveal").classList.remove("hidden");
  }
  function renderOptioner(){
    const box = $("options"); box.innerHTML = "";
    state.card.optioner.forEach(f => {
      const b = document.createElement("button");
      b.className = "opt"; b.textContent = f;
      if(state.besvarad){
        b.disabled = true;
        if(f === state.card.form) b.classList.add("correct");
        else if(f === state.valt) b.classList.add("wrong");
      } else { b.onclick = () => svara(f); }
      box.appendChild(b);
    });
  }
  function registrera(rätt){ if(rätt){ state.streak++; if(state.streak>state.best){ state.best=state.streak; spara(); } } else state.streak=0; }
  function svara(f){ state.valt=f; state.besvarad=true; registrera(f === state.card.form); render2(); }

  // ── Picker: en toggle-grid per dimension (multival, minst ett kvar). ──
  function byggGrid(id, nycklar, etikett, valda){
    const g = $(id); g.innerHTML = "";
    nycklar.forEach(k => {
      const b = document.createElement("button");
      b.className="toggle"; b.textContent = etikett(k);
      b.setAttribute("aria-pressed", valda.has(k));
      b.onclick = () => {
        if(valda.has(k)){ if(valda.size>1) valda.delete(k); } else valda.add(k);
        b.setAttribute("aria-pressed", valda.has(k)); spara(); newQuestion();
      };
      g.appendChild(b);
    });
  }
  function byggPickers(){
    byggGrid("grid-pron", pronomen.map(p=>p.lemma), l => l + " (" + prom(l).glosa + ")", state.valdaPron);
    byggGrid("grid-num", NUM_ORDNING, k => NUM[k], state.valdaNum);
    byggGrid("grid-kas", KASUS_ORDNING, k => KASUS[k], state.valdaKas);
    byggGrid("grid-bet", BET_ORDNING, k => BET[k], state.valdaBet);
  }

  function uppdateraLäge(){ $("mode-vand").setAttribute("aria-pressed", state.mode==="vand");
    $("mode-flerval").setAttribute("aria-pressed", state.mode==="flerval"); }

  $("mode-vand").onclick    = () => { state.mode="vand"; uppdateraLäge(); spara(); newQuestion(); };
  $("mode-flerval").onclick = () => { state.mode="flerval"; uppdateraLäge(); spara(); newQuestion(); };
  $("btn-vand").onclick     = () => { state.besvarad=true; render2(); };
  $("btn-kunde").onclick    = () => { registrera(true); newQuestion(); };
  $("btn-missade").onclick  = () => { registrera(false); newQuestion(); };
  $("btn-next").onclick     = () => newQuestion();
  $("picker-toggle").onclick = () => { const o = $("picker-toggle").getAttribute("aria-expanded")==="true";
    $("picker-toggle").setAttribute("aria-expanded", !o); $("picker-body").classList.toggle("hidden", o); };

  __ph = e => {
    if(e.code==="Space" && state.mode==="vand" && !state.besvarad){ e.preventDefault(); state.besvarad=true; render2(); }
    else if(e.key==="Enter" && state.besvarad && state.mode==="flerval"){ newQuestion(); }
    else if(state.mode==="flerval" && !state.besvarad && /^[1-4]$/.test(e.key)){
      const f = state.card.optioner[+e.key-1]; if(f) svara(f); }
  };
  document.addEventListener("keydown", __ph);

  ladda(); uppdateraLäge(); byggPickers(); newQuestion();
}
