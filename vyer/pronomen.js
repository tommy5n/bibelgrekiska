// Vy: Pronomen — personliga (ἐγώ, σύ), 3:e person + demonstrativa + interrogativa.
// Snapshot av pronomen.json (mastern). Formerna är verifierade — ej genererade här.
// Två frågemodeller styrda av 'modell':
//   person  (ἐγώ, σύ): person + numerus + kasus + betoning (betonad/enklitisk).
//   genus   (αὐτός, οὗτος, ἐκεῖνος, τίς): genus + kasus + numerus, böjs som adjektiv.
// Självförsörjande: injicerar egen .vy-pron-stil (designvariabler från app.css) och städar i teardown.
let __ph = null;

export function teardown(){
  if(__ph){ document.removeEventListener("keydown", __ph); __ph = null; }
  const s = document.getElementById("vy-pron-style");
  if(s) s.remove();
}

/* ── DATA — snapshot av pronomen.json. Regenereras ur mastern vid ändring.
   person: former[num][kas] = [betonad, obetonad]; obetonad=null där särform saknas.
   genus:  former[genus][kas] = {sg, pl}; sv[genus][num][kas] = svensk översättning. ─── */
const pronomen = [
  { lemma:"ἐγώ", glosa:"jag", modell:"person", sem:[5],
    former:{ sg:{ nom:["ἐγώ",null], gen:["ἐμοῦ","μου"], dat:["ἐμοί","μοι"], ack:["ἐμέ","με"] }, pl:{ nom:["ἡμεῖς",null], gen:["ἡμῶν",null], dat:["ἡμῖν",null], ack:["ἡμᾶς",null] } },
    sv:{ sg:{ nom:"jag", gen:"min", dat:"till mig", ack:"mig" }, pl:{ nom:"vi", gen:"vår", dat:"till oss", ack:"oss" } } },
  { lemma:"σύ", glosa:"du", modell:"person", sem:[5],
    former:{ sg:{ nom:["σύ",null], gen:["σοῦ","σου"], dat:["σοί","σοι"], ack:["σέ","σε"] }, pl:{ nom:["ὑμεῖς",null], gen:["ὑμῶν",null], dat:["ὑμῖν",null], ack:["ὑμᾶς",null] } },
    sv:{ sg:{ nom:"du", gen:"din", dat:"till dig", ack:"dig" }, pl:{ nom:"ni", gen:"er", dat:"till er", ack:"er" } } },
  { lemma:"αὐτός", glosa:"han, hon, det", modell:"genus", sem:[6],
    former:{ m:{ nom:{sg:"αὐτός",pl:"αὐτοί"}, gen:{sg:"αὐτοῦ",pl:"αὐτῶν"}, dat:{sg:"αὐτῷ",pl:"αὐτοῖς"}, ack:{sg:"αὐτόν",pl:"αὐτούς"} }, f:{ nom:{sg:"αὐτή",pl:"αὐταί"}, gen:{sg:"αὐτῆς",pl:"αὐτῶν"}, dat:{sg:"αὐτῇ",pl:"αὐταῖς"}, ack:{sg:"αὐτήν",pl:"αὐτάς"} }, n:{ nom:{sg:"αὐτό",pl:"αὐτά"}, gen:{sg:"αὐτοῦ",pl:"αὐτῶν"}, dat:{sg:"αὐτῷ",pl:"αὐτοῖς"}, ack:{sg:"αὐτό",pl:"αὐτά"} } },
    sv:{ m:{ sg:{nom:"han (själv)", gen:"hans", dat:"till honom", ack:"honom"}, pl:{nom:"de (själva)", gen:"deras", dat:"till dem", ack:"dem"} }, f:{ sg:{nom:"hon (själv)", gen:"hennes", dat:"till henne", ack:"henne"}, pl:{nom:"de (själva)", gen:"deras", dat:"till dem", ack:"dem"} }, n:{ sg:{nom:"det (självt)", gen:"dess", dat:"till det", ack:"det"}, pl:{nom:"de (själva)", gen:"deras", dat:"till dem", ack:"dem"} } } },
  { lemma:"οὗτος", glosa:"denne, denna, detta", modell:"genus", sem:[6],
    former:{ m:{ nom:{sg:"οὗτος",pl:"οὗτοι"}, gen:{sg:"τούτου",pl:"τούτων"}, dat:{sg:"τούτῳ",pl:"τούτοις"}, ack:{sg:"τοῦτον",pl:"τούτους"} }, f:{ nom:{sg:"αὕτη",pl:"αὗται"}, gen:{sg:"ταύτης",pl:"τούτων"}, dat:{sg:"ταύτῃ",pl:"ταύταις"}, ack:{sg:"ταύτην",pl:"ταύτας"} }, n:{ nom:{sg:"τοῦτο",pl:"ταῦτα"}, gen:{sg:"τούτου",pl:"τούτων"}, dat:{sg:"τούτῳ",pl:"τούτοις"}, ack:{sg:"τοῦτο",pl:"ταῦτα"} } },
    sv:{ m:{ sg:{nom:"denne", gen:"dennes", dat:"till denne", ack:"denne"}, pl:{nom:"dessa", gen:"dessas", dat:"till dessa", ack:"dessa"} }, f:{ sg:{nom:"denna", gen:"dennas", dat:"till denna", ack:"denna"}, pl:{nom:"dessa", gen:"dessas", dat:"till dessa", ack:"dessa"} }, n:{ sg:{nom:"detta", gen:"dettas", dat:"till detta", ack:"detta"}, pl:{nom:"dessa (detta)", gen:"dessas", dat:"till dessa", ack:"dessa"} } } },
  { lemma:"ἐκεῖνος", glosa:"den där", modell:"genus", sem:[6],
    former:{ m:{ nom:{sg:"ἐκεῖνος",pl:"ἐκεῖνοι"}, gen:{sg:"ἐκείνου",pl:"ἐκείνων"}, dat:{sg:"ἐκείνῳ",pl:"ἐκείνοις"}, ack:{sg:"ἐκεῖνον",pl:"ἐκείνους"} }, f:{ nom:{sg:"ἐκείνη",pl:"ἐκεῖναι"}, gen:{sg:"ἐκείνης",pl:"ἐκείνων"}, dat:{sg:"ἐκείνῃ",pl:"ἐκείναις"}, ack:{sg:"ἐκείνην",pl:"ἐκείνας"} }, n:{ nom:{sg:"ἐκεῖνο",pl:"ἐκεῖνα"}, gen:{sg:"ἐκείνου",pl:"ἐκείνων"}, dat:{sg:"ἐκείνῳ",pl:"ἐκείνοις"}, ack:{sg:"ἐκεῖνο",pl:"ἐκεῖνα"} } },
    sv:{ m:{ sg:{nom:"den där", gen:"den därs", dat:"till den där", ack:"den där"}, pl:{nom:"de där", gen:"de därs", dat:"till de där", ack:"de där"} }, f:{ sg:{nom:"den där", gen:"den därs", dat:"till den där", ack:"den där"}, pl:{nom:"de där", gen:"de därs", dat:"till de där", ack:"de där"} }, n:{ sg:{nom:"det där", gen:"det därs", dat:"till det där", ack:"det där"}, pl:{nom:"de där", gen:"de därs", dat:"till de där", ack:"de där"} } } },
  { lemma:"τίς", glosa:"vem?, vad?", modell:"genus", sem:[6],
    former:{ m:{ nom:{sg:"τίς",pl:"τίνες"}, gen:{sg:"τίνος",pl:"τίνων"}, dat:{sg:"τίνι",pl:"τίσι(ν)"}, ack:{sg:"τίνα",pl:"τίνας"} }, f:{ nom:{sg:"τίς",pl:"τίνες"}, gen:{sg:"τίνος",pl:"τίνων"}, dat:{sg:"τίνι",pl:"τίσι(ν)"}, ack:{sg:"τίνα",pl:"τίνας"} }, n:{ nom:{sg:"τί",pl:"τίνα"}, gen:{sg:"τίνος",pl:"τίνων"}, dat:{sg:"τίνι",pl:"τίσι(ν)"}, ack:{sg:"τί",pl:"τίνα"} } },
    sv:{ m:{ sg:{nom:"vem?", gen:"vems?", dat:"till vem?", ack:"vem?"}, pl:{nom:"vilka?", gen:"vilkas?", dat:"till vilka?", ack:"vilka?"} }, f:{ sg:{nom:"vem?", gen:"vems?", dat:"till vem?", ack:"vem?"}, pl:{nom:"vilka?", gen:"vilkas?", dat:"till vilka?", ack:"vilka?"} }, n:{ sg:{nom:"vad?", gen:"vilkens?", dat:"till vilken?", ack:"vad?"}, pl:{nom:"vilka?", gen:"vilkas?", dat:"till vilka?", ack:"vilka?"} } } },
];

const KASUS = { nom:"nominativ", gen:"genitiv", dat:"dativ", ack:"ackusativ" };
const KASUS_ORDNING = ["nom","gen","dat","ack"];
const NUM = { sg:"singular", pl:"plural" };
const NUM_ORDNING = ["sg","pl"];
const BET = { betonad:"betonad", obetonad:"obetonad" };
const BET_ORDNING = ["betonad","obetonad"];
const GENUS = { m:"maskulinum", f:"femininum", n:"neutrum" };
const GENUS_ORDNING = ["m","f","n"];

/* Seminarie-axel: varje pronomen bär sem:[…] ur pronomen.json. */
const SEMINARIER = [...new Set(pronomen.flatMap(p => p.sem))].sort((a,b) => a - b);
const semNamn = s => "Sem " + s;

const prom = l => pronomen.find(p => p.lemma === l);

// Alla giltiga kort ur en pronomenlista. Person-pronomen ger betonings-kort där
// formen finns (obetonad saknas i nominativ och hela pluralen); genus-pronomen
// ger genus-kort (m/f/n × kasus × numerus).
function kombosFor(list){
  const out = [];
  list.forEach(p => {
    if(p.modell === "person"){
      NUM_ORDNING.forEach(num => KASUS_ORDNING.forEach(kas => BET_ORDNING.forEach(bet => {
        const form = p.former[num][kas][bet === "betonad" ? 0 : 1];
        if(form) out.push({ lemma:p.lemma, modell:"person", num, kas, bet, genus:null, form });
      })));
    } else {
      GENUS_ORDNING.forEach(g => KASUS_ORDNING.forEach(kas => NUM_ORDNING.forEach(num => {
        const form = p.former[g][kas][num];
        if(form) out.push({ lemma:p.lemma, modell:"genus", num, kas, bet:null, genus:g, form });
      })));
    }
  });
  return out;
}
const alla_kombos = () => kombosFor(pronomen);

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
.vy-pron .bet.hidden{ display:none !important; }
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
/* Picker (.picker/.picker-toggle/.toggle/.chip/.quickrow m.fl.) stylas av den
   delade komponenten i app.css — inga vy-lokala regler här. */
.vy-pron footer{ margin-top:1.4rem; font-family:"Spectral",serif; color:var(--ink-soft); font-size:var(--fs-2xs); text-align:center; }
.vy-pron footer a{ color:var(--gold); text-decoration:none; }
.vy-pron footer a:hover{ text-decoration:underline; }
.vy-pron .gr-lank{ margin-top:.6rem; }
`;

const MARKUP = `<div class="vy vy-pron">
<header>
  <h1>Grekiska — pronomen</h1>
  <div class="sub" id="sub">Personliga, demonstrativa och interrogativa pronomen. Ge den rätta formen.</div>
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
      <h2>Seminarium</h2>
      <div class="quickrow">
        <span class="quicklabel">Snabbval:</span>
        <button class="chip" data-sem-all>alla</button>
        <button class="chip" data-sem-none>inga</button>
      </div>
      <div class="grid" id="grid-sem"></div>
    </div>
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
    <div id="sec-bet">
      <h2>Betoning <span class="quicklabel">(ἐγώ, σύ)</span></h2>
      <div class="grid" id="grid-bet"></div>
    </div>
    <div id="sec-genus">
      <h2>Genus <span class="quicklabel">(αὐτός, οὗτος, ἐκεῖνος, τίς)</span></h2>
      <div class="grid" id="grid-genus"></div>
    </div>
  </div>
</div>

<footer>Personliga pronomen (ἐγώ, σύ) har en <b>betonad</b> form (efter preposition, vid emfas) och en <b>obetonad/enklitisk</b> (i övriga fall); nominativ och pluralen saknar enklitisk särform. <b>αὐτός, οὗτος, ἐκεῖνος</b> och <b>τίς</b> böjs efter genus som adjektiv (neutrum sg på -ο).
<div class="gr-lank"><a href="grammatikreferens.html#pronomen">§ Pronomen i grammatikreferensen →</a></div></footer>
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
    valdaSem:   new Set(SEMINARIER),
    valdaPron:  new Set(pronomen.map(p => p.lemma)),
    valdaNum:   new Set(NUM_ORDNING),
    valdaKas:   new Set(KASUS_ORDNING),
    valdaBet:   new Set(BET_ORDNING),
    valdaGenus: new Set(GENUS_ORDNING),
    streak: 0, best: 0, card: null, besvarad: false, valt: null, forra: null,
  };

  const $ = id => document.getElementById(id);
  const pick = a => a[Math.floor(Math.random()*a.length)];
  const shuffle = a => { a=a.slice(); for(let i=a.length-1;i>0;i--){ const j=Math.floor(Math.random()*(i+1)); [a[i],a[j]]=[a[j],a[i]]; } return a; };

  // Pronomen synliga i valda seminarier (faller tillbaka på alla om urvalet blir tomt).
  const synligaPron = () => { const l = pronomen.filter(p => p.sem.some(s => state.valdaSem.has(s))); return l.length ? l : pronomen; };
  // Aktiva pronomen = synliga ∩ valda (med fallback).
  function aktivPron(){
    const syn = synligaPron();
    const v = syn.filter(p => state.valdaPron.has(p.lemma));
    return v.length ? v : syn;
  }

  // Aktiva kort = giltiga kombinationer från aktiva pronomen som matchar valda
  // dimensioner (betoning gäller person-, genus gäller genus-pronomen).
  function aktivaKombos(){
    const list = aktivPron();
    const k = kombosFor(list).filter(c =>
      state.valdaNum.has(c.num) && state.valdaKas.has(c.kas) &&
      (c.modell === "person" ? state.valdaBet.has(c.bet) : state.valdaGenus.has(c.genus)));
    return k.length ? k : kombosFor(list);
  }

  function spara(){ try{ localStorage.setItem(LAGER, JSON.stringify({
    mode:state.mode, valdaSem:[...state.valdaSem], valdaPron:[...state.valdaPron], valdaNum:[...state.valdaNum],
    valdaKas:[...state.valdaKas], valdaBet:[...state.valdaBet], valdaGenus:[...state.valdaGenus], best:state.best })); }catch(e){} }
  function ladda(){ try{ const r = JSON.parse(localStorage.getItem(LAGER)); if(!r) return;
    if(r.mode) state.mode = r.mode;
    if(Array.isArray(r.valdaSem))   state.valdaSem   = new Set(r.valdaSem.filter(s => SEMINARIER.includes(s)));
    if(Array.isArray(r.valdaPron))  state.valdaPron  = new Set(r.valdaPron.filter(l => pronomen.some(p=>p.lemma===l)));
    if(Array.isArray(r.valdaNum))   state.valdaNum   = new Set(r.valdaNum.filter(k => NUM_ORDNING.includes(k)));
    if(Array.isArray(r.valdaKas))   state.valdaKas   = new Set(r.valdaKas.filter(k => KASUS_ORDNING.includes(k)));
    if(Array.isArray(r.valdaBet))   state.valdaBet   = new Set(r.valdaBet.filter(k => BET_ORDNING.includes(k)));
    if(Array.isArray(r.valdaGenus)) state.valdaGenus = new Set(r.valdaGenus.filter(k => GENUS_ORDNING.includes(k)));
    if(typeof r.best === "number") state.best = r.best;
    // skydda mot tomma urval från gammalt sparat läge
    if(!state.valdaSem.size)   state.valdaSem   = new Set(SEMINARIER);
    if(!state.valdaPron.size)  state.valdaPron  = new Set(pronomen.map(p=>p.lemma));
    if(!state.valdaNum.size)   state.valdaNum   = new Set(NUM_ORDNING);
    if(!state.valdaKas.size)   state.valdaKas   = new Set(KASUS_ORDNING);
    if(!state.valdaBet.size)   state.valdaBet   = new Set(BET_ORDNING);
    if(!state.valdaGenus.size) state.valdaGenus = new Set(GENUS_ORDNING);
  }catch(e){} }

  // Distraktorer = andra former ur SAMMA pronomens paradigm (så böjningen tränas,
  // inte gissning). Fyll på från övriga pronomen om paradigmet inte räcker till 4.
  function byggOptioner(c){
    const egna = alla_kombos().filter(x => x.lemma === c.lemma && x.form !== c.form).map(x => x.form);
    let pool = [...new Set(egna)];
    if(pool.length < 3){
      const ovriga = alla_kombos().filter(x => x.lemma !== c.lemma && x.form !== c.form).map(x => x.form);
      pool = [...new Set([...pool, ...ovriga])];
    }
    return shuffle([c.form, ...shuffle(pool).slice(0,3)]);
  }

  function svFor(p, c){ return c.modell === "person" ? p.sv[c.num][c.kas] : p.sv[c.genus][c.num][c.kas]; }

  function newQuestion(){
    const ks = aktivaKombos();
    let c, sig, n=0;
    do { c = pick(ks); sig = c.lemma+"|"+c.num+"|"+c.kas+"|"+(c.bet||c.genus); } while(sig === state.forra && ++n < 30);
    state.forra = sig;
    const p = prom(c.lemma);
    state.card = {
      ...c, glosa: p.glosa, sv: svFor(p, c),
      optioner: state.mode === "flerval" ? byggOptioner(c) : null,
    };
    state.besvarad = false; state.valt = null;
    render2();
  }

  function render2(){
    const c = state.card;
    $("prompt").textContent = c.lemma;
    $("glosa").textContent = c.glosa;
    const led = c.modell === "genus" ? GENUS[c.genus] + " " : "";
    $("target").innerHTML = "→ <b>" + led + KASUS[c.kas] + " " + NUM[c.num] + "</b> (" + c.sv + ")";
    const betEl = $("betlabel");
    if(c.modell === "person"){
      const enklit = c.bet === "obetonad";
      betEl.textContent = enklit ? "obetonad (enklitisk) form" : "betonad form";
      betEl.classList.toggle("enklit", enklit);
      betEl.classList.remove("hidden");
    } else {
      betEl.classList.add("hidden");
    }
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
    const svag = c.modell === "person"
      ? c.lemma + " · " + KASUS[c.kas] + " " + NUM[c.num] + " · " + BET[c.bet]
      : c.lemma + " · " + GENUS[c.genus] + " " + KASUS[c.kas] + " " + NUM[c.num];
    $("svarlabel").textContent = svag;
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
  // Pronomen-griden visar bara pronomen i valda seminarier.
  function byggGridPron(){
    const g = $("grid-pron"); g.innerHTML = "";
    synligaPron().forEach(p => {
      const b = document.createElement("button");
      b.className="toggle"; b.textContent = p.lemma + " (" + p.glosa + ")";
      b.setAttribute("aria-pressed", state.valdaPron.has(p.lemma));
      b.onclick = () => {
        if(state.valdaPron.has(p.lemma)){ if(state.valdaPron.size>1) state.valdaPron.delete(p.lemma); }
        else state.valdaPron.add(p.lemma);
        b.setAttribute("aria-pressed", state.valdaPron.has(p.lemma));
        uppdateraSektioner(); spara(); newQuestion();
      };
      g.appendChild(b);
    });
  }
  function byggGridSem(){
    const g = $("grid-sem"); g.innerHTML = "";
    SEMINARIER.forEach(s => {
      const b = document.createElement("button");
      b.className="toggle"; b.textContent = semNamn(s);
      b.setAttribute("aria-pressed", state.valdaSem.has(s));
      b.onclick = () => {
        if(state.valdaSem.has(s)){ if(state.valdaSem.size>1) state.valdaSem.delete(s); } else state.valdaSem.add(s);
        b.setAttribute("aria-pressed", state.valdaSem.has(s));
        byggGridPron(); uppdateraSektioner(); spara(); newQuestion();
      };
      g.appendChild(b);
    });
  }
  // Visa Betoning-/Genus-sektionen bara när aktiva pronomen använder dimensionen.
  function uppdateraSektioner(){
    const mods = new Set(aktivPron().map(p => p.modell));
    $("sec-bet").classList.toggle("hidden", !mods.has("person"));
    $("sec-genus").classList.toggle("hidden", !mods.has("genus"));
  }
  function byggPickers(){
    byggGridSem();
    byggGridPron();
    byggGrid("grid-num", NUM_ORDNING, k => NUM[k], state.valdaNum);
    byggGrid("grid-kas", KASUS_ORDNING, k => KASUS[k], state.valdaKas);
    byggGrid("grid-bet", BET_ORDNING, k => BET[k], state.valdaBet);
    byggGrid("grid-genus", GENUS_ORDNING, k => GENUS[k], state.valdaGenus);
    uppdateraSektioner();
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
  document.querySelector("[data-sem-all]").onclick  = () => { state.valdaSem = new Set(SEMINARIER); byggGridSem(); byggGridPron(); uppdateraSektioner(); spara(); newQuestion(); };
  document.querySelector("[data-sem-none]").onclick = () => { state.valdaSem = new Set(); byggGridSem(); byggGridPron(); uppdateraSektioner(); spara(); newQuestion(); };

  __ph = e => {
    if(e.code==="Space" && state.mode==="vand" && !state.besvarad){ e.preventDefault(); state.besvarad=true; render2(); }
    else if(e.key==="Enter" && state.besvarad && state.mode==="flerval"){ newQuestion(); }
    else if(state.mode==="flerval" && !state.besvarad && /^[1-4]$/.test(e.key)){
      const f = state.card.optioner[+e.key-1]; if(f) svara(f); }
  };
  document.addEventListener("keydown", __ph);

  ladda(); uppdateraLäge(); byggPickers(); newQuestion();
}
