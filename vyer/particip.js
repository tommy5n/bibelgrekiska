// Vy: Presens particip — verbaladjektiv som kongruerar med sitt huvudord.
// Byggt på kongruens-mönstret: dra ett substantiv (genus/kasus/numerus) och
// välj den participform som kongruerar. Particip böjs som ett treändelseadjektiv
// (mask./neutr. efter 3:e dekl. -οντ-, fem. efter 1:a dekl. -ουσ-). Förberett för
// seminarium 9 (particip med huvudord).
//
// Dataomfång v1: presens particip aktiv för regelbundna ω-verb. λύω är verifierad
// mot presentationens paradigm (slides 79–80); övriga följer identiskt mönster
// med stambyte. Kontraherade (-έω → -ῶν) och fler verb läggs till additivt.
let __kh = null;
export function teardown(){ if(__kh){ document.removeEventListener("keydown", __kh); __kh = null; } }

// Scopad CSS (mönstret för nya vyer: bo i vyn, inte app.css). Self-cleaning —
// följer med när root.innerHTML byts, ingen teardown behövs. Ärver skalet +
// globala tokens; här bara det spelspecifika. Grön = rätt (--cbg/--cbd/--c).
const CSS = `
.vy-particip .prompt { font-size: var(--fs-lg); color: var(--ink); text-align: center; margin-top: 0.8rem; }
.vy-particip .fras { display: flex; flex-direction: column; align-items: center; gap: 0.25rem; margin: 1.1rem 0 0.8rem; }
.vy-particip .hufras { font-size: 1.85rem; color: var(--ink); }
.vy-particip .huanalys { font-size: var(--fs-sm); color: var(--ink-soft); font-style: italic; }
.vy-particip .alternativ { display: flex; flex-wrap: wrap; gap: 0.5rem; justify-content: center; margin: 0.4rem 0 0.6rem; }
.vy-particip .alt {
  font-family: inherit; font-size: var(--fs-2xl); color: var(--ink); background: var(--card);
  border: 1.5px solid var(--line); border-radius: 12px; padding: 0.45rem 1rem; cursor: pointer; transition: 0.15s;
}
.vy-particip .alt:hover:not(:disabled) { border-color: var(--gold); }
.vy-particip .alt:disabled { cursor: default; }
.vy-particip .alt.ratt { background: var(--cbg); border-color: var(--cbd); color: var(--c); }
.vy-particip .alt.fel { background: var(--bad-bg); border-color: var(--bad); color: var(--bad); }
.vy-particip .reveal { text-align: center; margin-top: 0.4rem; }
.vy-particip .helfras { font-size: var(--fs-2xl); color: var(--ink); margin-bottom: 0.3rem; }
.vy-particip .analys { font-size: var(--fs-sm); color: var(--ink-soft); }
.vy-particip .not { font-size: var(--fs-xs); color: var(--ink-soft); font-style: italic; margin-top: 0.2rem; }
`;

const MARKUP = `<div class="vy vy-particip"><style>${CSS}</style>
<header>
  <h1>Grekiska — presens particip</h1>
  <div class="sub">Participet är ett verbaladjektiv — det kongruerar med sitt huvudord i genus, numerus och kasus.</div>
</header>

<div class="stage">
  <div class="card">
    <div class="prompt" id="prompt"></div>
    <div class="fras" id="fras"></div>
    <div class="alternativ" id="alternativ"></div>
    <div class="reveal hidden" id="reveal">
      <div class="helfras" id="helfras"></div>
      <div class="analys" id="analys"></div>
      <div class="not" id="not"></div>
    </div>
    <div class="controls">
      <button class="btn ghost" id="btn-visa">Visa svar</button>
      <button class="btn primary" id="btn-next">Nästa</button>
    </div>
  </div>
  <div class="streak">
    Svit: <b id="streak">0</b> &nbsp;·&nbsp; bästa: <b id="best">0</b>
    &nbsp;·&nbsp; <b id="runda-kvar">0</b> kvar i rundan
  </div>
</div>

<footer>
  Presens particip aktiv bildas <b>-ων, -ουσα, -ον</b> (λύων, λύουσα, λῦον) och böjs
  som ett adjektiv: maskulinum och neutrum efter tredje deklinationen (-οντ-),
  femininum efter första (-ουσ-). Neutrum har nom = ack. Här väljer du den form som
  kongruerar med huvudordet.
</footer>
</div>`;

export function render(root){
  root.innerHTML = MARKUP;

  /* ── DATA ─────────────────────────────────────────────────────────────
     Particip: former[genus][kasus] = [sg, pl]. λύω verifierad mot slides 79–80. */
  const PART = [
    { lemma:"λύων", verb:"λύω", glosa:"lösande (som löser)", sem:[8], former:{
      m:{nom:["λύων","λύοντες"],gen:["λύοντος","λυόντων"],dat:["λύοντι","λύουσι(ν)"],ack:["λύοντα","λύοντας"]},
      f:{nom:["λύουσα","λύουσαι"],gen:["λυούσης","λυουσῶν"],dat:["λυούσῃ","λυούσαις"],ack:["λύουσαν","λυούσας"]},
      n:{nom:["λῦον","λύοντα"],gen:["λύοντος","λυόντων"],dat:["λύοντι","λύουσι(ν)"],ack:["λῦον","λύοντα"]} }},
    { lemma:"βλέπων", verb:"βλέπω", glosa:"seende", sem:[8], former:{
      m:{nom:["βλέπων","βλέποντες"],gen:["βλέποντος","βλεπόντων"],dat:["βλέποντι","βλέπουσι(ν)"],ack:["βλέποντα","βλέποντας"]},
      f:{nom:["βλέπουσα","βλέπουσαι"],gen:["βλεπούσης","βλεπουσῶν"],dat:["βλεπούσῃ","βλεπούσαις"],ack:["βλέπουσαν","βλεπούσας"]},
      n:{nom:["βλέπον","βλέποντα"],gen:["βλέποντος","βλεπόντων"],dat:["βλέποντι","βλέπουσι(ν)"],ack:["βλέπον","βλέποντα"]} }},
    { lemma:"γράφων", verb:"γράφω", glosa:"skrivande", sem:[8], former:{
      m:{nom:["γράφων","γράφοντες"],gen:["γράφοντος","γραφόντων"],dat:["γράφοντι","γράφουσι(ν)"],ack:["γράφοντα","γράφοντας"]},
      f:{nom:["γράφουσα","γράφουσαι"],gen:["γραφούσης","γραφουσῶν"],dat:["γραφούσῃ","γραφούσαις"],ack:["γράφουσαν","γραφούσας"]},
      n:{nom:["γράφον","γράφοντα"],gen:["γράφοντος","γραφόντων"],dat:["γράφοντι","γράφουσι(ν)"],ack:["γράφον","γράφοντα"]} }},
    { lemma:"ἀκούων", verb:"ἀκούω", glosa:"hörande", sem:[8], former:{
      m:{nom:["ἀκούων","ἀκούοντες"],gen:["ἀκούοντος","ἀκουόντων"],dat:["ἀκούοντι","ἀκούουσι(ν)"],ack:["ἀκούοντα","ἀκούοντας"]},
      f:{nom:["ἀκούουσα","ἀκούουσαι"],gen:["ἀκουούσης","ἀκουουσῶν"],dat:["ἀκουούσῃ","ἀκουούσαις"],ack:["ἀκούουσαν","ἀκουούσας"]},
      n:{nom:["ἀκοῦον","ἀκούοντα"],gen:["ἀκούοντος","ἀκουόντων"],dat:["ἀκούοντι","ἀκούουσι(ν)"],ack:["ἀκοῦον","ἀκούοντα"]} }},
    { lemma:"πέμπων", verb:"πέμπω", glosa:"skickande", sem:[8], former:{
      m:{nom:["πέμπων","πέμποντες"],gen:["πέμποντος","πεμπόντων"],dat:["πέμποντι","πέμπουσι(ν)"],ack:["πέμποντα","πέμποντας"]},
      f:{nom:["πέμπουσα","πέμπουσαι"],gen:["πεμπούσης","πεμπουσῶν"],dat:["πεμπούσῃ","πεμπούσαις"],ack:["πέμπουσαν","πεμπούσας"]},
      n:{nom:["πέμπον","πέμποντα"],gen:["πέμποντος","πεμπόντων"],dat:["πέμποντι","πέμπουσι(ν)"],ack:["πέμπον","πέμποντα"]} }},
    { lemma:"πιστεύων", verb:"πιστεύω", glosa:"troende", sem:[8], former:{
      m:{nom:["πιστεύων","πιστεύοντες"],gen:["πιστεύοντος","πιστευόντων"],dat:["πιστεύοντι","πιστεύουσι(ν)"],ack:["πιστεύοντα","πιστεύοντας"]},
      f:{nom:["πιστεύουσα","πιστεύουσαι"],gen:["πιστευούσης","πιστευουσῶν"],dat:["πιστευούσῃ","πιστευούσαις"],ack:["πιστεύουσαν","πιστευούσας"]},
      n:{nom:["πιστεῦον","πιστεύοντα"],gen:["πιστεύοντος","πιστευόντων"],dat:["πιστεύοντι","πιστεύουσι(ν)"],ack:["πιστεῦον","πιστεύοντα"]} }},
  ];

  const ART = {
    m:{nom:["ὁ","οἱ"],gen:["τοῦ","τῶν"],dat:["τῷ","τοῖς"],ack:["τὸν","τοὺς"]},
    f:{nom:["ἡ","αἱ"],gen:["τῆς","τῶν"],dat:["τῇ","ταῖς"],ack:["τὴν","τὰς"]},
    n:{nom:["τὸ","τὰ"],gen:["τοῦ","τῶν"],dat:["τῷ","τοῖς"],ack:["τὸ","τὰ"]},
  };
  const SUBST = [
    { lemma:"ἄνθρωπος", glosa:"människa", genus:"m", former:{nom:["ἄνθρωπος","ἄνθρωποι"],gen:["ἀνθρώπου","ἀνθρώπων"],dat:["ἀνθρώπῳ","ἀνθρώποις"],ack:["ἄνθρωπον","ἀνθρώπους"]} },
    { lemma:"προφήτης", glosa:"profet", genus:"m", former:{nom:["προφήτης","προφῆται"],gen:["προφήτου","προφητῶν"],dat:["προφήτῃ","προφήταις"],ack:["προφήτην","προφήτας"]} },
    { lemma:"φωνή", glosa:"röst", genus:"f", former:{nom:["φωνή","φωναί"],gen:["φωνῆς","φωνῶν"],dat:["φωνῇ","φωναῖς"],ack:["φωνήν","φωνάς"]} },
    { lemma:"ἀδελφή", glosa:"syster", genus:"f", former:{nom:["ἀδελφή","ἀδελφαί"],gen:["ἀδελφῆς","ἀδελφῶν"],dat:["ἀδελφῇ","ἀδελφαῖς"],ack:["ἀδελφήν","ἀδελφάς"]} },
    { lemma:"τέκνον", glosa:"barn", genus:"n", former:{nom:["τέκνον","τέκνα"],gen:["τέκνου","τέκνων"],dat:["τέκνῳ","τέκνοις"],ack:["τέκνον","τέκνα"]} },
    { lemma:"ἔργον", glosa:"verk", genus:"n", former:{nom:["ἔργον","ἔργα"],gen:["ἔργου","ἔργων"],dat:["ἔργῳ","ἔργοις"],ack:["ἔργον","ἔργα"]} },
  ];
  const KASUS = ["nom","gen","dat","ack"];
  const KASUS_NAMN = {nom:"nominativ",gen:"genitiv",dat:"dativ",ack:"ackusativ"};
  const NUM = ["sg","pl"];
  const NUM_NAMN = {sg:"singular",pl:"plural"};
  const GEN_NAMN = {m:"maskulinum",f:"femininum",n:"neutrum"};

  /* ── TILLSTÅND ────────────────────────────────────────────────────────── */
  const LAGER = "grekiska-particip";
  const state = { streak:0, best:0, q:null, besvarad:false, ko:[], forra:null };

  const $ = id => document.getElementById(id);
  const pick = arr => arr[Math.floor(Math.random()*arr.length)];
  function shuffle(a){ a=a.slice(); for(let i=a.length-1;i>0;i--){ const j=Math.floor(Math.random()*(i+1)); [a[i],a[j]]=[a[j],a[i]]; } return a; }
  const gi = {sg:0,pl:1};
  function spara(){ try{ localStorage.setItem(LAGER, JSON.stringify({best:state.best})); }catch(e){} }
  function ladda(){ try{ const r=JSON.parse(localStorage.getItem(LAGER)||"{}"); if(typeof r.best==="number") state.best=r.best; }catch(e){} }

  // rundkö över substantiven (glosmodell)
  function fyllKo(){ state.ko = shuffle(SUBST.map((_,i)=>i)); }
  function nyRunda(){ state.forra=null; fyllKo(); newQuestion(); }

  function alla(P){ const out=[]; for(const g of ["m","f","n"]) for(const k of KASUS) for(const n of NUM) out.push({form:P.former[g][k][gi[n]],g,k,n}); return out; }

  function newQuestion(){
    if(!state.ko.length) fyllKo();
    let si = state.ko.shift();
    if(SUBST.length>1 && si===state.forra && state.ko.length){ state.ko.push(si); si=state.ko.shift(); }
    state.forra = si;
    const subst = SUBST[si];
    const P = pick(PART);
    const k = pick(KASUS), n = pick(NUM);
    const korrekt = P.former[subst.genus][k][gi[n]];
    // distraktorer: andra celler av samma particip, distinkt form
    const pool = shuffle(alla(P).filter(c => c.form!==korrekt));
    const seen = new Set([korrekt]); const distr=[];
    for(const c of pool){ if(!seen.has(c.form)){ seen.add(c.form); distr.push(c.form); } if(distr.length===3) break; }
    state.q = { subst, P, k, n, korrekt, alternativ: shuffle([korrekt, ...distr]) };
    state.besvarad=false;
    render();
  }

  function render(){
    const q=state.q;
    $("streak").textContent=state.streak; $("best").textContent=state.best;
    $("runda-kvar").textContent=state.ko.length;
    $("prompt").innerHTML = `Vilken form av <b>${q.P.lemma}</b> (”${q.P.glosa}”) kongruerar med huvudordet?`;
    const art = ART[q.subst.genus][q.k][gi[q.n]];
    const subjForm = q.subst.former[q.k][gi[q.n]];
    $("fras").innerHTML = `<span class="hufras">${art} ${subjForm}</span><span class="huanalys">${GEN_NAMN[q.subst.genus]} · ${KASUS_NAMN[q.k]} · ${NUM_NAMN[q.n]}</span>`;
    const alt=$("alternativ"); alt.innerHTML="";
    q.alternativ.forEach(f=>{
      const b=document.createElement("button"); b.className="alt"; b.type="button"; b.textContent=f;
      if(state.besvarad){
        b.disabled=true;
        if(f===q.korrekt) b.classList.add("ratt");
        else if(f===state.__valt) b.classList.add("fel");
      }
      b.onclick=()=>svara(f);
      alt.appendChild(b);
    });
    $("reveal").classList.toggle("hidden", !state.besvarad);
    if(state.besvarad){
      $("helfras").innerHTML = `<b>${art} ${q.korrekt} ${subjForm}</b>`;
      $("analys").textContent = `${q.P.lemma}: ${GEN_NAMN[q.subst.genus]} ${KASUS_NAMN[q.k]} ${NUM_NAMN[q.n]} = ${q.korrekt}`;
      $("not").textContent = q.subst.genus==="n" ? "Neutrum: nominativ = ackusativ." : "Participet böjs som ett treändelseadjektiv.";
    }
  }

  function svara(f){
    if(state.besvarad) return;
    state.__valt=f; state.besvarad=true;
    if(f===state.q.korrekt){ state.streak++; if(state.streak>state.best){ state.best=state.streak; spara(); } }
    else state.streak=0;
    render();
  }

  $("btn-next").onclick = newQuestion;
  $("btn-visa").onclick = ()=>{ if(!state.besvarad){ state.__valt=null; state.besvarad=true; state.streak=0; render(); } };

  __kh=(e)=>{
    if(e.key==="Enter"){ if(state.besvarad) newQuestion(); e.preventDefault(); }
    else if(!state.besvarad && /^[1-4]$/.test(e.key)){ const b=$("alternativ").children[+e.key-1]; if(b) b.click(); }
  };
  document.addEventListener("keydown", __kh);

  ladda();
  nyRunda();
}
