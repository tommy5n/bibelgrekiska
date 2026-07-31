// Vy: Satsläran — huvudsats/bisats + subjunktioner (seminarium 8; relativa bisatser sem 9).
// Byggd på satsanalys-mönstret: mening → klickbara chunks, streak + rundkö,
// facit med svensk översättning och not. Två lägen:
//   (1) Hitta bisatsen — markera hela det underordnade ledet (börjar vid
//       subjunktionen). Neutra: en bisats har eget predikat.
//   (2) Subjunktioner — flerval på småordens betydelse (jfr. kasus-spelets flerval).
// Datan ligger inbäddad (som kasus.js). Meningarna är ur seminariets övningsblad,
// breakout-rum och presentation; former oförändrade från källan.
let __kh = null;
export function teardown(){ if(__kh){ document.removeEventListener("keydown", __kh); __kh = null; } }

// Scopad CSS (mönstret för nya vyer: bo i vyn, inte app.css). Self-cleaning —
// följer med när root.innerHTML byts, ingen teardown behövs. Ärver skalklasserna
// (.modes/.card/.reveal/.controls/.streak) + globala tokens; här bara det
// spelspecifika. Grön = rätt (--cbg/--cbd/--c, samma "rätt"-trio som satsanalys).
const CSS = `
.vy-satslara .modes { display: flex; gap: 0.5rem; justify-content: center; margin: 0.9rem 0 0.2rem; }
.vy-satslara .mode {
  font-family: inherit; font-size: var(--fs-sm); color: var(--ink-soft); background: var(--card);
  border: 1.5px solid var(--line); border-radius: 999px; padding: 0.3rem 0.9rem; cursor: pointer; transition: 0.15s;
}
/* .mode pressed-svart + hover ärvs från de delade reglerna i app.css. */
.vy-satslara .sats {
  display: flex; flex-wrap: wrap; gap: 0.45rem; justify-content: center;
  margin: 1.5rem 0 0.4rem; min-height: 3.2rem; align-items: flex-end;
}
.vy-satslara .chunk {
  font-family: inherit; font-size: 1.85rem; line-height: 1.15;
  color: var(--ink); background: var(--card); border: 1.5px solid var(--line);
  border-radius: 12px; padding: 0.35rem 0.7rem 0.3rem; cursor: pointer; transition: 0.15s;
}
@media (hover: hover) { .vy-satslara .chunk:hover:not(:disabled) { border-color: var(--gold); } }
.vy-satslara .chunk:disabled { cursor: default; }
.vy-satslara .chunk.vald { background: var(--cbg); border-color: var(--gold); color: var(--ink); }
.vy-satslara .chunk.bisats { background: var(--cbg); border-color: var(--cbd); color: var(--c); }
.vy-satslara .chunk.fel { background: var(--bad-bg); border-color: var(--bad); color: var(--bad); }
.vy-satslara .fraga { display: flex; flex-direction: column; align-items: center; gap: 0.4rem; margin: 1.4rem 0 0.6rem; }
.vy-satslara .subj-stor { font-size: 2.4rem; color: var(--ink); }
.vy-satslara .subj-fraga { font-size: var(--fs-sm); color: var(--ink-soft); }
.vy-satslara .options { display: flex; flex-wrap: wrap; gap: 0.5rem; justify-content: center; margin: 0.4rem 0 0.6rem; }
.vy-satslara .opt {
  font-family: inherit; font-size: var(--fs-lg); color: var(--ink); background: var(--card);
  border: 1.5px solid var(--line); border-radius: 12px; padding: 0.5rem 1rem; cursor: pointer; transition: 0.15s;
}
@media (hover: hover) { .vy-satslara .options:not(.no-hover) .opt:hover:not(:disabled) { border-color: var(--gold); } }
.vy-satslara .opt:disabled { cursor: default; }
.vy-satslara .opt.ratt { background: var(--cbg); border-color: var(--cbd); color: var(--c); }
.vy-satslara .opt.fel { background: var(--bad-bg); border-color: var(--bad); color: var(--bad); }
.vy-satslara .controls { display: flex; gap: 0.6rem; justify-content: center; margin-top: 0.6rem; }
.vy-satslara .ctl {
  font-family: inherit; font-size: var(--fs-sm); color: var(--ink); background: var(--card);
  border: 1.5px solid var(--line); border-radius: 10px; padding: 0.45rem 1rem; cursor: pointer; transition: 0.15s;
}
@media (hover: hover) { .vy-satslara .ctl:hover { border-color: var(--gold); } }
.vy-satslara .ctl.primar { background: var(--gold); border-color: var(--gold); color: #fff; }
`;

const MARKUP = `<div class="vy vy-satslara"><style>${CSS}</style>
<header>
  <h1>Grekiska — satsläran</h1>
  <div class="sub">Hitta bisatsen — och lär dig subjunktionerna som inleder den.</div>
</header>

<div class="modes" role="group" aria-label="Spelläge">
  <button class="mode" id="mode-bisats" aria-pressed="true">Hitta bisatsen</button>
  <button class="mode" id="mode-subj"   aria-pressed="false">Subjunktioner</button>
</div>

<div class="stage">
  <div class="card">
    <div class="kalla" id="kalla"></div>
    <div class="sats" id="sats"></div>
    <div class="fraga hidden" id="fraga"></div>
    <div class="options hidden" id="options"></div>
    <div class="reveal hidden" id="reveal">
      <div class="sv" id="r-sv"></div>
      <div class="not" id="r-not"></div>
    </div>
  </div>

  <div class="controls" id="controls"></div>

  <div class="streak">
    Svit: <b id="streak">0</b> &nbsp;·&nbsp; bästa: <b id="best">0</b>
    &nbsp;·&nbsp; <b id="runda-kvar">0</b> kvar i rundan
  </div>
</div>

<footer>
  En <b>bisats</b> har ett eget predikat men kan inte stå själv. Den inleds oftast av en
  <b>subjunktion</b> (ὅτι, ὅτε, ὡς, εἰ, ἵνα, ὥστε …) — men en <b>relativ bisats</b>
  inleds i stället av ett <b>relativpronomen</b> (ὅς, ἥ, ὅ, ὅν …) och fungerar som
  attribut till sitt korrelat. I <b>Hitta bisatsen</b> markerar du hela det
  underordnade ledet; börja vid subjunktionen eller relativpronomenet. I
  <b>Subjunktioner</b> nöter du vad småorden betyder.
</footer>
</div>`;

export function render(root){
  root.innerHTML = MARKUP;

  /* ── DATA ─────────────────────────────────────────────────────────────
     chunks: { t: grekisk text, b: true om den ingår i bisatsen }.
     subj = subjunktionen som inleder bisatsen; funktion = dess roll. */
  const SATSER = [
    { id:"s01", ref:"Luk 15:25", subj:"ὡς", funktion:"temporal (när)",
      sv:"När han närmade sig huset, hörde han musik och dans.",
      chunks:[{t:"ὡς",b:1},{t:"ἤγγισεν",b:1},{t:"τῇ οἰκίᾳ",b:1},{t:"ἤκουσεν"},{t:"συμφωνίας καὶ χορῶν"}] },
    { id:"s02", ref:"Mark 15:41", subj:"ὅτε", funktion:"temporal (när)",
      sv:"När han var i Galileen, följde många kvinnor honom.",
      chunks:[{t:"ὅτε",b:1},{t:"ἦν",b:1},{t:"ἐν τῇ Γαλιλαίᾳ",b:1},{t:"ἠκολούθουν"},{t:"αὐτῷ"},{t:"πολλαὶ γυναῖκες"}] },
    { id:"s03", ref:"Joh 7:1 (förkortad)", subj:"ὅτι", funktion:"kausal (eftersom)",
      sv:"Jesus vandrade i Galileen, eftersom judarna sökte honom.",
      chunks:[{t:"περιεπάτει"},{t:"ὁ Ἰησοῦς"},{t:"ἐν τῇ Γαλιλαίᾳ"},{t:"ὅτι",b:1},{t:"ἐζήτουν",b:1},{t:"αὐτὸν",b:1},{t:"οἱ Ἰουδαῖοι",b:1}] },
    { id:"s04", ref:"Luk 23:35 (förkortad)", subj:"εἰ", funktion:"villkor (om)",
      sv:"Låt honom rädda sig själv, om denne är Guds Kristus.",
      chunks:[{t:"σωσάτω"},{t:"ἑαυτόν"},{t:"εἰ",b:1},{t:"οὗτός",b:1},{t:"ἐστιν",b:1},{t:"ὁ Χριστὸς τοῦ θεοῦ",b:1}] },
    { id:"s05", ref:"Joh 15:20", subj:"εἰ", funktion:"villkor (om)",
      sv:"Om de förföljde mig, ska de också förfölja er.",
      chunks:[{t:"εἰ",b:1},{t:"ἐμὲ",b:1},{t:"ἐδίωξαν",b:1},{t:"καὶ"},{t:"ὑμᾶς"},{t:"διώξουσιν"}] },
    { id:"s06", ref:"Matt 19:23", subj:"ὅτι", funktion:"att-sats (efter sägeverb)",
      sv:"Sannerligen säger jag er att en rik människa svårligen kommer in i himlarnas rike.",
      chunks:[{t:"ἀμὴν"},{t:"λέγω"},{t:"ὑμῖν"},{t:"ὅτι",b:1},{t:"πλούσιος",b:1},{t:"δυσκόλως",b:1},{t:"εἰσελεύσεται",b:1},{t:"εἰς τὴν βασιλείαν τῶν οὐρανῶν",b:1}] },
    { id:"s07", ref:"Joh 2:23 (jfr breakout)", subj:"ὡς", funktion:"temporal (när)",
      sv:"När han var i Jerusalem, trodde många på hans namn.",
      chunks:[{t:"ὡς",b:1},{t:"ἦν",b:1},{t:"ἐν τοῖς Ἱεροσολύμοις",b:1},{t:"πολλοὶ"},{t:"ἐπίστευσαν"},{t:"εἰς τὸ ὄνομα αὐτοῦ"}] },
    { id:"s08", ref:"Presentation 8 (§280)", subj:"ὅτι", funktion:"att-sats (efter λέγω)",
      sv:"Han säger att profeten är i öknen.",
      chunks:[{t:"οὗτος"},{t:"λέγει"},{t:"ὅτι",b:1},{t:"ὁ προφήτης",b:1},{t:"ἐστὶν",b:1},{t:"ἐν τῇ ἐρήμῳ",b:1}] },
    { id:"s09", ref:"Presentation 8 (§280)", subj:"ὅτι", funktion:"att-sats (efter ἀκούω)",
      sv:"Han hör att profeten talar i öknen.",
      chunks:[{t:"οὗτος"},{t:"ἀκούει"},{t:"ὅτι",b:1},{t:"ὁ προφήτης",b:1},{t:"λαλεῖ",b:1},{t:"ἐν τῇ ἐρήμῳ",b:1}] },
    { id:"s10", ref:"Presentation 8 (§280)", subj:"ὅτι", funktion:"att-sats (efter βλέπω)",
      sv:"Hon ser att döparen predikar i byn.",
      chunks:[{t:"αὕτη"},{t:"βλέπει"},{t:"ὅτι",b:1},{t:"ὁ βαπτιστὴς",b:1},{t:"κηρύσσει",b:1},{t:"ἐν τῇ κώμῃ",b:1}] },
    { id:"s11", ref:"Joh 14:29 (jfr)", subj:"ἵνα", funktion:"final (för att); tar konjunktiv",
      sv:"Jesus säger detta för att ni ska tro.",
      chunks:[{t:"ὁ Ἰησοῦς"},{t:"ταῦτα"},{t:"λέγει"},{t:"ἵνα",b:1},{t:"πιστεύητε",b:1}] },
    { id:"s12", ref:"Matt 12:22 (jfr)", subj:"ὥστε", funktion:"konsekutiv (så att); tar infinitiv",
      sv:"Jesus botade honom, så att den stumme talade.",
      chunks:[{t:"ὁ Ἰησοῦς"},{t:"ἐθεράπευσεν"},{t:"αὐτόν"},{t:"ὥστε",b:1},{t:"τὸν κωφὸν",b:1},{t:"λαλεῖν",b:1}] },
    // Relativa bisatser (seminarium 9, breakout 1). En relativ bisats inleds av ett
    // relativpronomen (ὅς ἥ ὅ) och fungerar som attribut till korrelatet — men den är
    // en bisats: eget predikat, kan inte stå själv. rel:1 → facit säger "relativpronomen".
    { id:"s13", ref:"Mark 6:16", subj:"ὅν", funktion:"som — direkt objekt i bisatsen", rel:1,
      sv:"Vem är den heliga människan som Herodes halshögg?",
      chunks:[{t:"τίς"},{t:"ἐστιν"},{t:"ὁ ἄνθρωπος ὁ ἅγιος"},{t:"ὃν",b:1},{t:"ἀπεκεφάλισεν",b:1},{t:"ὁ Ἡρῴδης",b:1}] },
    { id:"s14", ref:"Matt 10:38", subj:"ὅς", funktion:"som — subjekt i bisatsen", rel:1,
      sv:"Och den som inte tar sitt kors är inte värdig mig.",
      chunks:[{t:"καὶ"},{t:"οὗτος"},{t:"ὃς",b:1},{t:"οὐ λαμβάνει",b:1},{t:"τὸν σταυρὸν αὐτοῦ",b:1},{t:"οὐκ ἔστιν"},{t:"μου ἄξιος"}] },
    { id:"s15", ref:"Joh 2:22", subj:"ὅν", funktion:"som — direkt objekt i bisatsen", rel:1,
      sv:"Lärjungarna trodde på ordet som Jesus sade.",
      chunks:[{t:"οἱ μαθηταὶ"},{t:"ἐπίστευσαν"},{t:"τῷ λόγῳ"},{t:"ὃν",b:1},{t:"ἔλεγεν",b:1},{t:"ὁ Ἰησοῦς",b:1}] },
    { id:"s16", ref:"Joh 6:64", subj:"οἵ", funktion:"som — subjekt i bisatsen", rel:1,
      sv:"Det finns några av er som inte tror.",
      chunks:[{t:"εἰσὶν"},{t:"ἐξ ὑμῶν"},{t:"τινες"},{t:"οἳ",b:1},{t:"οὐ πιστεύουσιν",b:1}] },
  ];

  const SUBJ = [
    { ord:"ὅτι",  sv:"att, eftersom", funktion:"att-sats / orsak" },
    { ord:"διότι", sv:"eftersom",     funktion:"orsak" },
    { ord:"ὅτε",  sv:"när",           funktion:"tid" },
    { ord:"ὡς",   sv:"då, när, som",  funktion:"tid / sätt" },
    { ord:"ἐπεί", sv:"då, eftersom",  funktion:"tid / orsak" },
    { ord:"εἰ",   sv:"om",            funktion:"villkor" },
    { ord:"ὥστε", sv:"så att",        funktion:"följd" },
    { ord:"ἵνα",  sv:"för att",       funktion:"avsikt" },
  ];

  /* ── TILLSTÅND ────────────────────────────────────────────────────────── */
  const LAGER = "grekiska-satslara";
  const state = {
    mode:"bisats",                       // "bisats" | "subj"
    streak:0, best:0,
    sats:null, subj:null, alternativ:[],
    vald:new Set(),                      // valda chunk-index (bisatsläget)
    besvarad:false, ratt:false,
    ko:[], kvar:0, forra:null,
  };

  /* ── HJÄLPARE ─────────────────────────────────────────────────────────── */
  const $ = id => document.getElementById(id);
  const pick = arr => arr[Math.floor(Math.random()*arr.length)];
  function shuffle(arr){ const a=arr.slice(); for(let i=a.length-1;i>0;i--){ const j=Math.floor(Math.random()*(i+1)); [a[i],a[j]]=[a[j],a[i]]; } return a; }

  // Synonym-vakt (jfr prepositionsspelet): ett felalternativ får inte dela
  // innehållsord med rätt svar — annars kan ὡς "då, när, som" dyka upp som
  // distraktor till ὅτε "när", eller διότι "eftersom" till ὅτι "att, eftersom",
  // vilket blir en kuggfråga. Faller tillbaka på överlappande ord bara om det
  // inte går att fylla tre rena (inträffar aldrig med nuvarande SUBJ-lista).
  const ORD = s => new Set(s.toLowerCase().split(/[^a-zåäöé]+/).filter(w => w.length > 1));
  function valjDistraktorer(ratt){
    const ord = ORD(ratt.sv);
    const ovriga = SUBJ.filter(s => s.ord !== ratt.ord);
    const delar = s => { for(const w of ORD(s.sv)) if(ord.has(w)) return true; return false; };
    const fel = shuffle(ovriga.filter(s => !delar(s))).slice(0,3);
    if(fel.length < 3){ for(const s of shuffle(ovriga.filter(s => !fel.includes(s)))){ if(fel.length>=3) break; fel.push(s); } }
    return fel;
  }
  function spara(){ try{ localStorage.setItem(LAGER, JSON.stringify({best:state.best})); }catch(e){} }
  function ladda(){ try{ const r=JSON.parse(localStorage.getItem(LAGER)||"{}"); if(typeof r.best==="number") state.best=r.best; }catch(e){} }

  const bank = () => state.mode==="bisats" ? SATSER : SUBJ;
  function fyllKo(){ state.ko = shuffle(bank().map((_,i)=>i)); state.kvar = state.ko.length; }
  function nyRunda(){ state.forra=null; fyllKo(); newQuestion(); }

  function newQuestion(){
    if(!state.ko.length) fyllKo();
    // undvik omedelbar repris
    let i = state.ko.shift();
    if(bank().length>1 && i===state.forra && state.ko.length){ state.ko.push(i); i=state.ko.shift(); }
    state.forra = i; state.kvar = state.ko.length;
    state.besvarad=false; state.ratt=false; state.vald=new Set();
    if(state.mode==="bisats"){
      state.sats = SATSER[i];
    } else {
      state.subj = SUBJ[i];
      const fel = valjDistraktorer(state.subj);
      state.alternativ = shuffle([state.subj, ...fel]);
    }
    render();
  }

  /* ── RENDER ───────────────────────────────────────────────────────────── */
  function render(){
    $("streak").textContent = state.streak;
    $("best").textContent   = state.best;
    $("runda-kvar").textContent = state.kvar;
    $("mode-bisats").setAttribute("aria-pressed", state.mode==="bisats");
    $("mode-subj").setAttribute("aria-pressed",   state.mode==="subj");
    $("reveal").classList.toggle("hidden", !state.besvarad);
    if(state.mode==="bisats") renderBisats(); else renderSubj();
    renderControls();
  }

  function renderBisats(){
    const s = state.sats;
    $("kalla").textContent = s.ref;
    $("fraga").classList.add("hidden");
    $("options").classList.add("hidden"); $("options").innerHTML="";
    const sats = $("sats"); sats.classList.remove("hidden"); sats.innerHTML="";
    s.chunks.forEach((c,i)=>{
      const b=document.createElement("button");
      b.className="chunk"; b.textContent=c.t; b.type="button";
      if(state.besvarad){
        b.disabled=true;
        if(c.b) b.classList.add("bisats");                       // rätt bisats-led
        else if(state.vald.has(i)) b.classList.add("fel");       // felmarkerat
      } else if(state.vald.has(i)){
        b.classList.add("vald");
      }
      b.onclick = ()=>{ if(state.besvarad) return; state.vald.has(i)?state.vald.delete(i):state.vald.add(i); render(); };
      sats.appendChild(b);
    });
    if(state.besvarad){
      $("r-sv").textContent = s.sv;
      const etikett = s.rel ? "Relativpronomen" : "Subjunktion";
      $("r-not").innerHTML = `${etikett}: <b>${s.subj}</b> — ${s.funktion}. Bisatsen har eget predikat och kan inte stå själv.`;
    }
  }

  function renderSubj(){
    $("kalla").textContent = "Subjunktion";
    $("sats").classList.add("hidden"); $("sats").innerHTML="";
    const fr=$("fraga"); fr.classList.remove("hidden");
    fr.innerHTML = `<span class="subj-stor">${state.subj.ord}</span><span class="subj-fraga">Vad betyder subjunktionen?</span>`;
    const opt=$("options"); opt.classList.remove("hidden"); opt.innerHTML=""; opt.classList.add("no-hover"); opt.addEventListener("pointermove", () => opt.classList.remove("no-hover"), { once: true });
    state.alternativ.forEach(a=>{
      const b=document.createElement("button");
      b.className="opt"; b.type="button"; b.textContent=a.sv;
      if(state.besvarad){
        b.disabled=true;
        if(a.ord===state.subj.ord) b.classList.add("ratt");
        else if(!state.ratt && a===state.__valtFel) b.classList.add("fel");
      }
      b.onclick = ()=>{
        if(state.besvarad) return;
        state.besvarad=true;
        state.ratt = a.ord===state.subj.ord;
        if(!state.ratt) state.__valtFel=a;
        if(state.ratt){ state.streak++; if(state.streak>state.best){ state.best=state.streak; spara(); } }
        else state.streak=0;
        render();
      };
      opt.appendChild(b);
    });
    if(state.besvarad){
      $("r-sv").textContent = `${state.subj.ord} = ${state.subj.sv}`;
      $("r-not").innerHTML = `Funktion: ${state.subj.funktion}.`;
    }
  }

  function renderControls(){
    const c=$("controls"); c.innerHTML="";
    const btn=(txt,fn,cls="")=>{ const b=document.createElement("button"); b.className="ctl "+cls; b.textContent=txt; b.onclick=fn; c.appendChild(b); return b; };
    if(state.mode==="bisats"){
      if(!state.besvarad){
        btn("Rätta", rattaBisats, "primar");
        btn("Visa facit", ()=>{ state.besvarad=true; state.ratt=false; state.streak=0; render(); });
      } else {
        btn("Nästa", newQuestion, "primar");
      }
    } else {
      if(state.besvarad) btn("Nästa", newQuestion, "primar");
    }
  }

  function rattaBisats(){
    const ratt = new Set(state.sats.chunks.map((c,i)=>c.b?i:-1).filter(i=>i>=0));
    const lika = ratt.size===state.vald.size && [...ratt].every(i=>state.vald.has(i));
    state.besvarad=true; state.ratt=lika;
    if(lika){ state.streak++; if(state.streak>state.best){ state.best=state.streak; spara(); } }
    else state.streak=0;
    render();
  }

  /* ── LÄGESVAL + TANGENTBORD ───────────────────────────────────────────── */
  function setMode(m){ if(state.mode===m) return; state.mode=m; nyRunda(); }
  $("mode-bisats").onclick = ()=>setMode("bisats");
  $("mode-subj").onclick   = ()=>setMode("subj");

  __kh = (e)=>{
    if(e.key==="Enter"){
      if(state.mode==="bisats" && !state.besvarad) rattaBisats();
      else if(state.besvarad) newQuestion();
      e.preventDefault();
    } else if(state.mode==="subj" && !state.besvarad && /^[1-4]$/.test(e.key)){
      const b=$("options").children[+e.key-1]; if(b) b.click();
    }
  };
  document.addEventListener("keydown", __kh);

  ladda();
  nyRunda();
}
