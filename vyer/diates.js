// Vy: Medium-passivum (diates) — seminarium 10, kursens sista grammatik.
// Receptivt spel (grekisk form/sats → svenska), som matchar det receptiva provet.
//
// Två lägen:
//  • "Läs formen"  — visa en medium-/passivform, välj rätt ANALYS (tempus · diates
//     · person). Analys, inte översättning, för att svenskan inte skiljer imperfekt
//     från aorist i passiv ("löstes" = både ἐλυόμην och ἐλύθην); tempusskillnaden
//     är det provet uttryckligen kräver ("ta hänsyn till tempus"). Presens/imperfekt
//     märks "medium-passivum" (formerna ÄR identiska); först aoristen delar upp
//     passivum/medium — samma ärlighet mot tvetydigheten som Formverkstaden.
//  • "Läs satsen" — visa en passiv sats med agent (ὑπό + genitiv), välj den svenska
//     översättningen. Huvuddistraktorn är den AKTIVA motsvarigheten (materialets egen
//     kontrast: objektet blir subjekt, agenten står i ὑπό + gen).
//
// Data inline (som particip.js): formerna är standardparadigm verifierade mot
// presentation 10 (λύω, φιλέω) och grammatikreferensens verb-diates-kort; satserna
// är ordagranna ur breakout-rummet (2) och presentationen (agentexemplen).
let __kh = null;
export function teardown(){ if(__kh){ document.removeEventListener("keydown", __kh); __kh = null; } }

const CSS = `
.vy-diates .modes { display: flex; gap: 0.5rem; justify-content: center; margin: 0.9rem 0 0.2rem; flex-wrap: wrap; }
.vy-diates .mode {
  font-family: inherit; font-size: var(--fs-sm); color: var(--ink-soft); background: var(--card);
  border: 1.5px solid var(--line); border-radius: 999px; padding: 0.3rem 0.9rem; cursor: pointer; transition: 0.15s;
}
@media (hover: hover) { .vy-diates .mode:not([aria-pressed="true"]):hover { border-color: var(--gold); color: var(--ink); } }
.vy-diates .prompt { font-size: var(--fs-lg); color: var(--ink); text-align: center; margin-top: 0.8rem; }
.vy-diates .fras { display: flex; flex-direction: column; align-items: center; gap: 0.25rem; margin: 1.1rem 0 0.8rem; }
.vy-diates .huvud { font-size: 2rem; color: var(--ink); text-align: center; line-height: 1.35; }
.vy-diates .huvud.sats { font-size: 1.6rem; }
.vy-diates .hint { font-size: var(--fs-sm); color: var(--ink-soft); font-style: italic; }
.vy-diates .alternativ { display: flex; flex-direction: column; gap: 0.5rem; align-items: stretch; margin: 0.4rem auto 0.6rem; max-width: 34rem; }
.vy-diates .alt {
  font-family: inherit; font-size: var(--fs-lg); color: var(--ink); background: var(--card);
  border: 1.5px solid var(--line); border-radius: 12px; padding: 0.5rem 1rem; cursor: pointer; transition: 0.15s; text-align: center;
}
@media (hover: hover) { .vy-diates .alternativ:not(.no-hover) .alt:hover:not(:disabled) { border-color: var(--gold); } }
.vy-diates .alt:disabled { cursor: default; }
.vy-diates .alt.ratt { background: var(--cbg); border-color: var(--cbd); color: var(--c); }
.vy-diates .alt.fel { background: var(--bad-bg); border-color: var(--bad); color: var(--bad); }
.vy-diates .reveal { text-align: center; margin-top: 0.4rem; }
.vy-diates .helfras { font-size: var(--fs-xl); color: var(--ink); margin-bottom: 0.3rem; }
.vy-diates .analys { font-size: var(--fs-sm); color: var(--ink-soft); }
.vy-diates .not { font-size: var(--fs-xs); color: var(--ink-soft); font-style: italic; margin-top: 0.3rem; }
`;

const MARKUP = `<div class="vy vy-diates"><style>${CSS}</style>
<header>
  <h1>Grekiska — medium-passivum</h1>
  <div class="sub" id="sub">Läs av verbgenus (aktiv/medium/passiv) — och känn igen agenten ὑπό + genitiv.</div>
</header>

<div class="modes" role="group" aria-label="Spelläge">
  <button class="mode" id="mode-form" aria-pressed="true">Läs formen</button>
  <button class="mode" id="mode-sats" aria-pressed="false">Läs satsen</button>
</div>

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
  </div>
</div>

<footer>
  <b>Diates</b> säger om subjektet handlar (aktiv) eller berörs (medium/passiv). I presens
  och imperfekt är medium och passivum <b>identiska till formen</b> — först i aoristen skiljer
  de sig (passiv <span class="grek">-θη-</span>, medium <span class="grek">-σα-</span>). Den som
  utför handlingen i en passiv sats — <b>agenten</b> — uttrycks med <span class="grek">ὑπό</span>
  + genitiv. Se grammatikreferensens kort <i>Medium-passivum</i> för hela paradigmet.
</footer>
</div>`;

export function render(root, opts){
  root.innerHTML = MARKUP;

  /* ── DATA ─────────────────────────────────────────────────────────────
     Läs formen: medium-/passivformer med analys + översättning (reveal).
     Paradigmen verifierade mot presentation 10 + grammatikreferensen. */
  const FORMER = [
    // λύω — presens medium-passivum (passiv läsning: "löses")
    { gr:"λύομαι",  lemma:"λύω", glosa:"lösa", t:"presens", d:"medium-passivum", pn:"1 sg", sv:"jag löses" },
    { gr:"λύῃ",     lemma:"λύω", glosa:"lösa", t:"presens", d:"medium-passivum", pn:"2 sg", sv:"du löses" },
    { gr:"λύεται",  lemma:"λύω", glosa:"lösa", t:"presens", d:"medium-passivum", pn:"3 sg", sv:"han/hon löses" },
    { gr:"λυόμεθα", lemma:"λύω", glosa:"lösa", t:"presens", d:"medium-passivum", pn:"1 pl", sv:"vi löses" },
    { gr:"λύεσθε",  lemma:"λύω", glosa:"lösa", t:"presens", d:"medium-passivum", pn:"2 pl", sv:"ni löses" },
    { gr:"λύονται", lemma:"λύω", glosa:"lösa", t:"presens", d:"medium-passivum", pn:"3 pl", sv:"de löses" },
    // λύω — imperfekt medium-passivum ("löstes", pågående/upprepat)
    { gr:"ἐλυόμην",  lemma:"λύω", glosa:"lösa", t:"imperfekt", d:"medium-passivum", pn:"1 sg", sv:"jag löstes" },
    { gr:"ἐλύου",    lemma:"λύω", glosa:"lösa", t:"imperfekt", d:"medium-passivum", pn:"2 sg", sv:"du löstes" },
    { gr:"ἐλύετο",   lemma:"λύω", glosa:"lösa", t:"imperfekt", d:"medium-passivum", pn:"3 sg", sv:"han/hon löstes" },
    { gr:"ἐλυόμεθα", lemma:"λύω", glosa:"lösa", t:"imperfekt", d:"medium-passivum", pn:"1 pl", sv:"vi löstes" },
    { gr:"ἐλύεσθε",  lemma:"λύω", glosa:"lösa", t:"imperfekt", d:"medium-passivum", pn:"2 pl", sv:"ni löstes" },
    { gr:"ἐλύοντο",  lemma:"λύω", glosa:"lösa", t:"imperfekt", d:"medium-passivum", pn:"3 pl", sv:"de löstes" },
    // λύω — aorist passivum ("blev löst")
    { gr:"ἐλύθην",   lemma:"λύω", glosa:"lösa", t:"aorist", d:"passivum", pn:"1 sg", sv:"jag blev löst" },
    { gr:"ἐλύθης",   lemma:"λύω", glosa:"lösa", t:"aorist", d:"passivum", pn:"2 sg", sv:"du blev löst" },
    { gr:"ἐλύθη",    lemma:"λύω", glosa:"lösa", t:"aorist", d:"passivum", pn:"3 sg", sv:"han/hon blev löst" },
    { gr:"ἐλύθημεν", lemma:"λύω", glosa:"lösa", t:"aorist", d:"passivum", pn:"1 pl", sv:"vi blev lösta" },
    { gr:"ἐλύθητε",  lemma:"λύω", glosa:"lösa", t:"aorist", d:"passivum", pn:"2 pl", sv:"ni blev lösta" },
    { gr:"ἐλύθησαν", lemma:"λύω", glosa:"lösa", t:"aorist", d:"passivum", pn:"3 pl", sv:"de blev lösta" },
    // λούω — aorist medium (reflexivt: "tvättade sig")
    { gr:"ἐλουσάμην", lemma:"λούω", glosa:"tvätta", t:"aorist", d:"medium", pn:"1 sg", sv:"jag tvättade mig" },
    { gr:"ἐλούσω",    lemma:"λούω", glosa:"tvätta", t:"aorist", d:"medium", pn:"2 sg", sv:"du tvättade dig" },
    { gr:"ἐλούσατο",  lemma:"λούω", glosa:"tvätta", t:"aorist", d:"medium", pn:"3 sg", sv:"han/hon tvättade sig" },
    { gr:"ἐλουσάμεθα",lemma:"λούω", glosa:"tvätta", t:"aorist", d:"medium", pn:"1 pl", sv:"vi tvättade oss" },
    { gr:"ἐλούσασθε", lemma:"λούω", glosa:"tvätta", t:"aorist", d:"medium", pn:"2 pl", sv:"ni tvättade er" },
    { gr:"ἐλούσαντο", lemma:"λούω", glosa:"tvätta", t:"aorist", d:"medium", pn:"3 pl", sv:"de tvättade sig" },
    // φιλέω — presens medium-passivum (kontraherat: "älskas")
    { gr:"φιλοῦμαι",  lemma:"φιλέω", glosa:"älska", t:"presens", d:"medium-passivum", pn:"1 sg", sv:"jag älskas", kontr:true },
    { gr:"φιλῇ",      lemma:"φιλέω", glosa:"älska", t:"presens", d:"medium-passivum", pn:"2 sg", sv:"du älskas", kontr:true },
    { gr:"φιλεῖται",  lemma:"φιλέω", glosa:"älska", t:"presens", d:"medium-passivum", pn:"3 sg", sv:"han/hon älskas", kontr:true },
    { gr:"φιλούμεθα", lemma:"φιλέω", glosa:"älska", t:"presens", d:"medium-passivum", pn:"1 pl", sv:"vi älskas", kontr:true },
    { gr:"φιλεῖσθε",  lemma:"φιλέω", glosa:"älska", t:"presens", d:"medium-passivum", pn:"2 pl", sv:"ni älskas", kontr:true },
    { gr:"φιλοῦνται", lemma:"φιλέω", glosa:"älska", t:"presens", d:"medium-passivum", pn:"3 pl", sv:"de älskas", kontr:true },
  ];

  /* Läs satsen: passiv sats (agent ὑπό + gen) → svenska; distraktorn är den aktiva
     motsvarigheten. Satser ordagranna ur breakout-rummet (2) och presentationen. */
  const SATSER = [
    { p:"λαμβάνεται ὁ ἄρτος ὑπὸ τοῦ τέκνου.", sv:"Brödet tas av barnet.", a:"Barnet tar brödet." },
    { p:"σῳζόμεθα ὑπὸ τοῦ βαπτιστοῦ.", sv:"Vi räddas av döparen.", a:"Döparen räddar oss." },
    { p:"λούεται τὸ παιδίον ὑπὸ τῆς μητρός.", sv:"Det lilla barnet tvättas av modern.", a:"Modern tvättar det lilla barnet." },
    { p:"ὁ δοῦλος καλεῖται ὑπὸ τοῦ κυρίου.", sv:"Slaven kallas av herren.", a:"Herren kallar slaven." },
    { p:"ὁ μαθητὴς ἐδιδάσκετο ὑπὸ τοῦ διδασκάλου.", sv:"Lärjungen undervisades av läraren.", a:"Läraren undervisade lärjungen." },
    { p:"ὁ σταυρὸς ὁ μέγας ὑπὸ τοῦ Ἰησοῦ βαστάζεται.", sv:"Det stora korset lyfts av Jesus.", a:"Jesus lyfter det stora korset." },
    { p:"βαπτίζονται ὑπὸ τοῦ προφήτου.", sv:"De döps av profeten.", a:"Profeten döper dem." },
    { p:"ὁ μαθητὴς ὑπὸ τοῦ διδασκάλου ἐπαιδεύθη.", sv:"Lärjungen undervisades av läraren.", a:"Läraren undervisade lärjungen." },
  ];

  const ALLA_ANALYSER = [...new Set(FORMER.map(f => `${f.t} ${f.d}, ${f.pn}`))];
  const ALLA_SV = [...new Set(SATSER.map(s => s.sv))];

  /* ── TILLSTÅND ────────────────────────────────────────────────────────── */
  const LAGER = "grekiska-diates";
  const state = { mode:"form", streak:0, best:0, q:null, besvarad:false, ko:[], forra:null, __valt:null };

  const $ = id => document.getElementById(id);
  const pick = arr => arr[Math.floor(Math.random()*arr.length)];
  function shuffle(a){ a=a.slice(); for(let i=a.length-1;i>0;i--){ const j=Math.floor(Math.random()*(i+1)); [a[i],a[j]]=[a[j],a[i]]; } return a; }
  function spara(){ try{ localStorage.setItem(LAGER, JSON.stringify({best:state.best, mode:state.mode})); }catch(e){} }
  function ladda(){ try{ const r=JSON.parse(localStorage.getItem(LAGER)||"{}"); if(typeof r.best==="number") state.best=r.best; if(r.mode==="form"||r.mode==="sats") state.mode=r.mode; }catch(e){} }

  const kalla = () => state.mode==="form" ? FORMER : SATSER;
  function fyllKo(){ state.ko = shuffle(kalla().map((_,i)=>i)); }
  function nyRunda(){ state.forra=null; fyllKo(); newQuestion(); }

  function nästaIndex(){
    if(!state.ko.length) fyllKo();
    let i = state.ko.shift();
    if(kalla().length>1 && i===state.forra && state.ko.length){ state.ko.push(i); i=state.ko.shift(); }
    state.forra = i;
    return i;
  }

  function newForm(){
    const f = FORMER[nästaIndex()];
    const korrekt = `${f.t} ${f.d}, ${f.pn}`;
    const distr = shuffle(ALLA_ANALYSER.filter(a => a!==korrekt)).slice(0,3);
    state.q = { typ:"form", f, korrekt, alternativ: shuffle([korrekt, ...distr]) };
    state.besvarad=false; render();
  }

  function newSats(){
    const s = SATSER[nästaIndex()];
    const korrekt = s.sv;
    // huvuddistraktor: den aktiva motsvarigheten; fyll på med andra satsers svar
    const distr = [s.a];
    const seen = new Set([korrekt, s.a]);
    for(const sv of shuffle(ALLA_SV)){ if(distr.length>=3) break; if(!seen.has(sv)){ seen.add(sv); distr.push(sv); } }
    state.q = { typ:"sats", s, korrekt, alternativ: shuffle([korrekt, ...distr]) };
    state.besvarad=false; render();
  }
  const newQuestion = () => state.mode==="form" ? newForm() : newSats();

  function ritaAlternativ(q){
    const alt=$("alternativ"); alt.innerHTML=""; alt.classList.add("no-hover");
    alt.addEventListener("pointermove", () => alt.classList.remove("no-hover"), { once: true });
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
  }

  function render(){
    const q=state.q;
    $("streak").textContent=state.streak; $("best").textContent=state.best;
    if(q.typ==="form") renderForm(q); else renderSats(q);
    ritaAlternativ(q);
    $("reveal").classList.toggle("hidden", !state.besvarad);
  }

  function renderForm(q){
    const f=q.f;
    $("prompt").innerHTML = `Vilken form är detta? <span class="hint">(${f.lemma} ”${f.glosa}”)</span>`;
    $("fras").innerHTML = `<span class="huvud grek">${f.gr}</span>`;
    if(state.besvarad){
      $("helfras").innerHTML = `<b class="grek">${f.gr}</b> — ${q.korrekt}`;
      $("analys").textContent = `Betyder: ”${f.sv}”.`;
      let not = "";
      if(f.d==="medium-passivum") not = "Presens och imperfekt är identiska för medium och passivum — sammanhanget avgör (”löses” eller ”löser sig”).";
      else if(f.d==="passivum") not = "Aorist passivum känns igen på -θη- (augment + rot + -θη-).";
      else if(f.d==="medium") not = "Aorist medium känns igen på -σα- med medium-ändelser (-άμην, -σω, -σατο …).";
      if(f.kontr) not += " Kontraherat verb på -έω: ändelsen smälter ihop med stammens ε.";
      $("not").textContent = not;
    }
  }

  function renderSats(q){
    $("prompt").innerHTML = `Vad betyder den passiva satsen?`;
    $("fras").innerHTML = `<span class="huvud sats grek">${q.s.p}</span>`;
    if(state.besvarad){
      $("helfras").innerHTML = `<b class="grek">${q.s.p}</b>`;
      $("analys").innerHTML = `Passiv: <b>${q.korrekt}</b> &nbsp;·&nbsp; jämför aktivt: ${q.s.a}`;
      $("not").textContent = "I passivsatsen blir objektet subjekt, verbet får medium-passiv-ändelse och den som utför handlingen står i ὑπό + genitiv (agenten).";
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

  const SUB_TEXT = {
    form: "Läs av verbgenus (aktiv/medium/passiv) — och känn igen agenten ὑπό + genitiv.",
    sats: "Läs den passiva satsen och välj översättningen — objektet blir subjekt, agenten står i ὑπό + genitiv.",
  };
  function setMode(m){
    if(state.mode===m) return;
    state.mode=m; state.streak=0; spara();
    $("mode-form").setAttribute("aria-pressed", m==="form");
    $("mode-sats").setAttribute("aria-pressed", m==="sats");
    $("sub").textContent = SUB_TEXT[m];
    nyRunda();
  }
  $("mode-form").onclick = ()=>setMode("form");
  $("mode-sats").onclick = ()=>setMode("sats");

  __kh=(e)=>{
    if(e.key==="Enter"){ if(state.besvarad) newQuestion(); e.preventDefault(); }
    else if(!state.besvarad && /^[1-4]$/.test(e.key)){ const b=$("alternativ").children[+e.key-1]; if(b) b.click(); }
  };
  document.addEventListener("keydown", __kh);

  ladda();
  // djuplänkat läge (token efter ladda(), vinner över persistensen)
  const tok = opts && opts.mode;
  if(tok==="form"||tok==="sats") state.mode=tok;
  $("mode-form").setAttribute("aria-pressed", state.mode==="form");
  $("mode-sats").setAttribute("aria-pressed", state.mode==="sats");
  $("sub").textContent = SUB_TEXT[state.mode];
  nyRunda();
}
