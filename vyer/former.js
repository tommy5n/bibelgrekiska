// Vy: Formverkstaden — omvandla en verbform till en annan.
//
// Bygger på övningsblad 1:7 del I, som inte översätter utan FÖRVANDLAR former:
//   (a) presens → futurum      βλέπομεν → βλέψομεν
//   (b) indikativ → imperativ  πέμπεις → πέμπε,  οὐ μένετε → μὴ μένετε
//   (c) imperativ → indikativ  βάλλε → βάλλεις,  μὴ ζητεῖτε → οὐ ζητεῖτε
//   (d) presens → imperfekt    κηρύσσω → ἐκήρυσσον
//   (e) imperfekt → presens    ἔβαλλε → βάλλει
//
// Skiljer sig från verbspelet (#8): där går frågan uppslagsform + person → form.
// Här ges en BÖJD form och spelaren måste först läsa av person/numerus ur
// ändelsen och sedan bygga om den i ett annat tempus/modus.
//
// Delar verbspelets snapshot — ingen egen kopia, så json/verb.json →
// gen_verb_snapshot.py når båda spelen på en gång.
// Självförsörjande: injicerar egen .vy-former-stil och städar i teardown.
//
// Versionen ärvs ur den egna URL:en. En bar `import { verb } from "./verb.js"`
// hämtar en OVERSIONERAD kopia: annan cache-nyckel än app.js:s verb.js?v=NN, så
// modulen laddas två gånger och den bara kan ligga upp till max-age (600 s) för
// gammal efter en deploy. Med versionen med blir det samma URL som routern
// använder — en instans, och cache-bustad som allt annat.
const vv = new URL(import.meta.url).search;
const { verb } = await import(`./verb.js${vv}`);

let __fh = null;

export function teardown(){
  if(__fh){ document.removeEventListener("keydown", __fh); __fh = null; }
  const s = document.getElementById("vy-former-style");
  if(s) s.remove();
}

/* ── FORMLÄRA ────────────────────────────────────────────────────────── */
const PN_ORDNING = ["1sg","2sg","3sg","1pl","2pl","3pl"];
const IMP_ORDNING = ["2sg","3sg","2pl","3pl"];
const PN_NAMN = { "1sg":"1:a sg", "2sg":"2:a sg", "3sg":"3:e sg",
                  "1pl":"1:a pl", "2pl":"2:a pl", "3pl":"3:e pl", "inf":"infinitiv" };
const NYCKEL_NAMN = { "pres.ind":"presens indikativ", "impf.ind":"imperfekt", "fut.ind":"futurum",
                      "pres.imp":"presens imperativ", "pres.inf":"presens infinitiv", "fut.inf":"futurum infinitiv" };
const cellerFor = k => k.endsWith(".inf") ? ["inf"] : k.endsWith(".imp") ? IMP_ORDNING : PN_ORDNING;

/* Omvandlingarna, i övningsbladets ordning. `id` används av filterchipsen. */
const OMVANDLINGAR = [
  { id:"fut",   from:"pres.ind", to:"fut.ind",   namn:"presens → futurum",
    regel:"Futurum skjuter in σ mellan rot och ändelse: κ/χ/γ/σσ+σ=ξ, π/φ/β/πτ+σ=ψ, τ/θ/δ/ζ+σ=σ; ε förlängs till η." },
  { id:"imp",   from:"pres.ind", to:"pres.imp",  namn:"indikativ → imperativ",
    regel:"Imperativ: -ε, -έτω, -ετε, -έτωσαν (-ει, -είτω, -εῖτε, -είτωσαν vid -έω). 2:a pl är IDENTISK med indikativen." },
  { id:"ind",   from:"pres.imp", to:"pres.ind",  namn:"imperativ → indikativ",
    regel:"Tillbaka till indikativens primärändelser. 2:a pl ändras inte." },
  { id:"impf",  from:"pres.ind", to:"impf.ind",  namn:"presens → imperfekt",
    regel:"Augment framför stammen (ἐ- vid konsonant; vokalen förlängs vid vokal) + sekundärändelser -ον, -ες, -ε(ν), -ομεν, -ετε, -ον." },
  { id:"pres",  from:"impf.ind", to:"pres.ind",  namn:"imperfekt → presens",
    regel:"Dra bort augmentet och sätt tillbaka primärändelsen." },
  { id:"inf",   from:"pres.ind", to:"pres.inf",  namn:"presens → infinitiv",
    regel:"Infinitiv = stam + -ειν (kontraherat -εῖν vid -έω). Ingen person, inget numerus." },
  { id:"futinf",from:"fut.ind",  to:"fut.inf",   namn:"futurum → futurum infinitiv",
    regel:"Futurum infinitiv byggs på futurstammen: παιδεύ-σ-ειν." },
];

/* ── NEGATION (övningsbladets fotnot + uppgift b/c) ───────────────────
   Indikativ negeras med οὐ, som rättar sig efter LJUDET efter:
     οὐ  framför konsonant        οὐ βλέπει
     οὐκ framför mjuk vokalansats οὐκ ἀκούει
     οὐχ framför sträv vokalansats (spiritus asper) οὐχ ὑπάγει
   Imperativ negeras ALLTID med μή — ljudet spelar ingen roll.
   Spiritus sitter på diftongens ANDRA vokal (εὑρίσκω), så vi tittar på de
   två första bokstäverna, inte bara den första.                          */
const ASPER = "̔", LENIS = "̓";
function ansats(form){
  const d = form.normalize("NFD");
  let baser = 0;
  for(const ch of d){
    if(/\p{M}/u.test(ch)){                       // kombinerande tecken hör till föregående bas
      if(ch === ASPER) return "asper";
      if(ch === LENIS) return "lenis";
      continue;
    }
    if(++baser > 2) break;                       // bara första vokalklustret kan bära spiritus
  }
  return "konsonant";
}
const negationFor = (form, nyckel) =>
  nyckel.endsWith(".imp") ? "μή" : { asper:"οὐχ", lenis:"οὐκ", konsonant:"οὐ" }[ansats(form)];
const NEG_ALTERNATIV = ["οὐ","οὐκ","οὐχ","μή"];
/* Svarsalternativen visas som uppslagsformer (μή), men framför ett följande ord
   byter oxytona μή till grav: μὴ γράφετε. οὐ är proklitiskt och saknar egen
   accent i den ställningen (οὐ βλέπει), så bara μή berörs. */
const negationForan = neg => neg === "μή" ? "μὴ" : neg;

/* ── URVAL ───────────────────────────────────────────────────────────── */
const SEMINARIER = [...new Set(verb.flatMap(v => v.sem))].sort((a,b) => a - b);
const semNamn = s => "Sem " + s;
const KLASSER = { omega:"ω-verb", kontrakt_e:"kontraherade -έω", oregelbunden:"εἰμί" };

const STYLE = `
.vy-former .modes{ display:flex; gap:.5rem; justify-content:center; margin:1rem 0 0; flex-wrap:wrap; }
.vy-former .mode{ font-family:"Spectral",serif; font-size:var(--fs-sm); padding:.35rem .9rem;
  border:1px solid var(--line); border-radius:999px; background:var(--card); color:var(--ink-soft); cursor:pointer; }
/* .mode "valt"-svart ärvs från den delade .modes-regeln i app.css. */
.vy-former .stage{ display:flex; flex-direction:column; align-items:center; gap:1rem; margin-top:1rem; }
.vy-former .card{ background:var(--card); border:1px solid var(--line); border-radius:14px;
  padding:1.6rem 1.4rem; min-width:min(30rem,92vw); text-align:center; box-shadow:0 1px 0 rgba(0,0,0,.03); }
.vy-former .kalla{ font-family:"Spectral",serif; font-size:var(--fs-2xs); color:var(--ink-soft);
  text-transform:uppercase; letter-spacing:.06em; margin-bottom:.5rem; }
.vy-former .prompt{ font-family:"Cardo",serif; font-size:var(--fs-4xl); color:var(--ink); line-height:1.15; }
.vy-former .prompt .neg{ color:var(--gold); }
.vy-former .lemma{ font-family:"Spectral",serif; color:var(--ink-soft); font-size:var(--fs-sm); margin-top:.35rem; }
.vy-former .pil{ font-family:"Spectral",serif; color:var(--ink-soft); font-size:var(--fs-lg); margin:.7rem 0 .2rem; }
.vy-former .pil b{ color:var(--ink); }
.vy-former .reveal{ margin-top:1rem; border-top:1px dashed var(--line); padding-top:1rem; }
.vy-former .svar{ font-family:"Cardo",serif; font-size:var(--fs-2xl); color:var(--ink); }
.vy-former .svarlabel{ font-family:"Spectral",serif; color:var(--ink-soft); font-size:var(--fs-sm); margin-top:.3rem; }
.vy-former .regel{ font-family:"Spectral",serif; color:var(--ink-soft); font-size:var(--fs-xs);
  margin-top:.6rem; max-width:34rem; margin-inline:auto; line-height:1.45; }
.vy-former .hidden{ display:none !important; }
.vy-former .options{ display:grid; grid-template-columns:1fr 1fr; gap:.6rem; min-width:min(30rem,92vw); }
.vy-former .options.neg{ grid-template-columns:repeat(4,1fr); }
.vy-former .opt{ font-family:"Cardo",serif; font-size:var(--fs-2xl); padding:.7rem .5rem;
  border:1px solid var(--line); border-radius:10px; background:var(--card); color:var(--ink); cursor:pointer; }
.vy-former .opt:hover:not(:disabled){ border-color:var(--gold); }
.vy-former .opt:disabled{ cursor:default; }
.vy-former .opt.correct{ background:var(--good-bg); border-color:var(--good); color:var(--good); }
.vy-former .opt.wrong{ background:var(--bad-bg); border-color:var(--bad); color:var(--bad); }
.vy-former .controls{ display:flex; gap:.6rem; justify-content:center; }
.vy-former .btn{ font-family:"Spectral",serif; font-size:var(--fs-md); padding:.55rem 1.2rem;
  border:1px solid var(--line); border-radius:10px; background:var(--card); color:var(--ink); cursor:pointer; }
.vy-former .btn.primary{ background:var(--gold); color:#fff; border-color:var(--gold); }
.vy-former .streak{ font-family:"Spectral",serif; color:var(--ink-soft); font-size:var(--fs-sm); }
/* .picker, .toggle, .chip m.fl. ärvs från de delade reglerna i app.css. */
.vy-former footer{ margin-top:1.4rem; font-family:"Spectral",serif; color:var(--ink-soft); font-size:var(--fs-2xs); text-align:center; }
.vy-former footer a{ color:var(--gold); text-decoration:none; }
.vy-former footer a:hover{ text-decoration:underline; }
.vy-former .gr-lank{ margin-top:.6rem; }
`;

const MARKUP = `<div class="vy vy-former">
<header>
  <h1>Grekiska — formverkstaden</h1>
  <div class="sub" id="sub">Läs av formen och bygg om den.</div>
</header>

<div class="modes" role="group" aria-label="Spelläge">
  <button class="mode" id="mode-bygg" aria-pressed="true">Bygg om formen</button>
  <button class="mode" id="mode-neg" aria-pressed="false">Vilken negation?</button>
</div>

<div class="stage">
  <div class="card">
    <div class="kalla" id="kalla"></div>
    <div class="prompt" id="prompt">—</div>
    <div class="lemma" id="lemma"></div>
    <div class="pil" id="pil"></div>
    <div class="reveal hidden" id="reveal">
      <div class="svar" id="svar"></div>
      <div class="svarlabel" id="svarlabel"></div>
      <div class="regel" id="regel"></div>
    </div>
  </div>

  <div class="options" id="options"></div>
  <div class="controls hidden" id="controls-next"><button class="btn primary" id="btn-next">Nästa</button></div>

  <div class="streak">Svit: <b id="streak">0</b> &nbsp;·&nbsp; bästa: <b id="best">0</b> &nbsp;·&nbsp; <b id="runda-kvar">0</b> kvar i rundan</div>
</div>

<div class="picker">
  <button class="picker-toggle" id="picker-toggle" aria-expanded="false"><span>Anpassa övningen <span class="count" id="antal"></span></span><span>▾</span></button>
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
    <div id="sec-omv">
      <h2>Omvandling</h2>
      <div class="quickrow">
        <span class="quicklabel">Snabbval:</span>
        <button class="chip" data-omv-all>alla</button>
        <button class="chip" data-omv-blad>övningsbladets (a–e)</button>
      </div>
      <div class="grid" id="grid-omv"></div>
    </div>
    <div>
      <h2>Verbklass</h2>
      <div class="grid" id="grid-klass"></div>
    </div>
  </div>
</div>

<footer>Övningsbladets formlära, men åt båda hållen. Först måste du läsa av <b>person och numerus</b> ur den givna ändelsen — sedan bygga om formen. Vissa former ändras inte alls (2:a pl är samma i indikativ och imperativ), och <b>-ον</b> i imperfekt är både 1:a sg och 3:e pl, så då godtas båda svaren.
<div class="gr-lank"><a href="grammatikreferens.html#verb-imperfekt">§ Imperfekt</a> · <a href="grammatikreferens.html#verb-imperativ">§ Imperativ</a> · <a href="grammatikreferens.html#verb-futurum">§ Futurum</a></div></footer>
</div>`;

export function render(root){
  if(!document.getElementById("vy-former-style")){
    const st = document.createElement("style"); st.id = "vy-former-style"; st.textContent = STYLE;
    document.head.appendChild(st);
  }
  root.innerHTML = MARKUP;

  const LAGER = "grekiska-formverkstaden";
  const BLADET = ["fut","imp","ind","impf","pres"];        // övningsbladets a–e
  const state = {
    mode: "bygg",
    valdaSem: new Set(SEMINARIER),
    valdaOmv: new Set(BLADET),
    valdaKlass: new Set(Object.keys(KLASSER)),
    streak: 0, best: 0, card: null, besvarad: false, valt: null, forra: null,
    rk: { ko: [], kvar: 0, forra: null, forraRen: true, bas: null },  // rundkö (glosmodell)
  };

  const $ = id => document.getElementById(id);
  const pick = a => a[Math.floor(Math.random()*a.length)];
  const shuffle = a => { a=a.slice(); for(let i=a.length-1;i>0;i--){ const j=Math.floor(Math.random()*(i+1)); [a[i],a[j]]=[a[j],a[i]]; } return a; };
  const setEq = (a,b) => a.size===b.size && [...a].every(x=>b.has(x));

  const semMatch   = v => v.sem.some(s => state.valdaSem.has(s));
  const klassMatch = v => state.valdaKlass.has(v.klass);
  const kandidatVerb = () => {
    const v = verb.filter(o => semMatch(o) && klassMatch(o));
    return v.length ? v : verb;
  };
  const aktivaOmv = () => {
    const o = OMVANDLINGAR.filter(x => state.valdaOmv.has(x.id));
    return o.length ? o : OMVANDLINGAR;
  };
  // Ett par (verb, omvandling) duger bara om verbet har BÅDA formnycklarna.
  const parFor = omv => kandidatVerb().filter(v => v.former[omv.from] && v.former[omv.to]);
  const giltigaOmv = () => aktivaOmv().filter(o => parFor(o).length > 0);

  /* Rundkö (glosmodell, som satsanalys): gå igenom verben en gång; ett verb som
     missas läggs sist och återkommer inom rundan; tom kö → ny omblandad runda.
     Basmängden är verb som duger i AKTUELLT läge (neg: har ind/imp; bygg: passar
     minst en vald omvandling). Fylls om automatiskt när mängden ändras. */
  const negNyckel = v => Object.keys(v.former).some(k => k.endsWith(".ind") || k.endsWith(".imp"));
  const basVerb = () => {
    if(state.mode === "neg"){ const v = kandidatVerb().filter(negNyckel); return v.length ? v : kandidatVerb(); }
    const oms = giltigaOmv();
    const v = kandidatVerb().filter(x => oms.some(o => x.former[o.from] && x.former[o.to]));
    return v.length ? v : kandidatVerb();
  };
  const basVerbIds = () => basVerb().map(v => v.lemma);
  const rkSig = () => state.mode + "|" + basVerbIds().join("");
  function rkFyll(){ const ids = basVerbIds(); state.rk.ko = shuffle(ids); state.rk.kvar = ids.length; state.rk.bas = rkSig(); }
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

  function spara(){ try{ localStorage.setItem(LAGER, JSON.stringify({
    mode:state.mode, valdaSem:[...state.valdaSem], valdaOmv:[...state.valdaOmv],
    valdaKlass:[...state.valdaKlass], best:state.best })); }catch(e){} }
  function ladda(){ try{ const r = JSON.parse(localStorage.getItem(LAGER)); if(!r) return;
    if(r.mode) state.mode = r.mode;
    if(Array.isArray(r.valdaSem))   state.valdaSem   = new Set(r.valdaSem.filter(s => SEMINARIER.includes(s)));
    if(Array.isArray(r.valdaOmv))   state.valdaOmv   = new Set(r.valdaOmv.filter(o => OMVANDLINGAR.some(x=>x.id===o)));
    if(Array.isArray(r.valdaKlass)) state.valdaKlass = new Set(r.valdaKlass.filter(k => KLASSER[k]));
    if(!state.valdaSem.size)   state.valdaSem   = new Set(SEMINARIER);
    if(!state.valdaKlass.size) state.valdaKlass = new Set(Object.keys(KLASSER));
    if(typeof r.best === "number") state.best = r.best;
  }catch(e){} }

  /* Personer vars form i `nyckel` stavas likadant som cellen `pn`.
     ἔλυον är både 1sg och 3pl → omvandlingen har TVÅ rätta svar, precis som
     övningsbladets facit "ἔσῳζον (σῴζω / σῴζουσι(ν))". */
  const tvetydigaPersoner = (v, nyckel, pn) => {
    const f = v.former[nyckel];
    return cellerFor(nyckel).filter(p => f[p] === f[pn]);
  };

  function nyBygg(vIn){
    // vIn (ur rundkön) styr verbet; välj en omvandling som verbet klarar.
    const omvs = vIn ? giltigaOmv().filter(o => vIn.former[o.from] && vIn.former[o.to]) : giltigaOmv();
    const omv = pick(omvs.length ? omvs : giltigaOmv());
    const kand = parFor(omv);
    const v = (vIn && kand.includes(vIn)) ? vIn : pick(kand);
    // Källcellen måste finnas i BÅDA nycklarna (imperativ saknar 1:a person).
    const gemensamma = cellerFor(omv.from).filter(p => cellerFor(omv.to).includes(p) || omv.to.endsWith(".inf"));
    const pn = pick(omv.to.endsWith(".inf") ? cellerFor(omv.from) : gemensamma);

    const kalla = v.former[omv.from][pn];
    const malPersoner = omv.to.endsWith(".inf") ? ["inf"] : tvetydigaPersoner(v, omv.from, pn);
    const ratta = new Set(malPersoner.map(p => v.former[omv.to][p]).filter(Boolean));

    // Distraktorer, i fallande pedagogisk skärpa:
    //  1. källformen oförändrad  ("gjorde ingenting"-fällan)
    //  2. rätt tempus/modus men FEL person
    //  3. rätt person men fel tempus/modus (verbets övriga nycklar)
    const pool = [];
    pool.push(kalla);
    cellerFor(omv.to).forEach(p => { const f = v.former[omv.to][p]; if(f) pool.push(f); });
    Object.keys(v.former).forEach(k => {
      if(k===omv.to) return;
      const c = v.former[k]; if(c && c[pn]) pool.push(c[pn]);
      if(c && c.inf) pool.push(c.inf);
    });
    const distraktorer = [...new Set(pool)].filter(f => !ratta.has(f));

    state.card = {
      typ:"bygg", lemma:v.lemma, glosa:v.glosa, omv, pn,
      kalla, ratta,
      optioner: shuffle([pick([...ratta]), ...shuffle(distraktorer).slice(0,3)]),
    };
  }

  function nyNeg(vIn){
    const v = (vIn && negNyckel(vIn)) ? vIn : pick(kandidatVerb().filter(negNyckel));
    // Negationen prövas på indikativ (οὐ/οὐκ/οὐχ efter ljudet) och imperativ (alltid μή).
    const nycklar = Object.keys(v.former).filter(k => k.endsWith(".ind") || k.endsWith(".imp"));
    const nyckel = pick(nycklar);
    const pn = pick(cellerFor(nyckel));
    const form = v.former[nyckel][pn];
    const ratt = negationFor(form, nyckel);
    state.card = {
      typ:"neg", lemma:v.lemma, glosa:v.glosa, nyckel, pn, form,
      ratta: new Set([ratt]), optioner: NEG_ALTERNATIV.slice(),
      ansats: ansats(form),
    };
  }

  function newQuestion(){
    uppdateraAntal();
    const v = verb.find(x => x.lemma === rkNasta());
    state.mode === "neg" ? nyNeg(v) : nyBygg(v);
    state.besvarad = false; state.valt = null;
    render2();
  }

  function render2(){
    const c = state.card;
    $("runda-kvar").textContent = state.rk.kvar;
    $("reveal").classList.add("hidden");
    $("controls-next").classList.add("hidden");
    $("options").classList.toggle("neg", c.typ==="neg");

    if(c.typ === "bygg"){
      $("kalla").textContent = NYCKEL_NAMN[c.omv.from] + (c.pn==="inf" ? "" : " · " + PN_NAMN[c.pn]);
      $("prompt").textContent = c.kalla;
      $("lemma").textContent = c.lemma + " — " + c.glosa;
      $("pil").innerHTML = "→ <b>" + NYCKEL_NAMN[c.omv.to] + "</b>";
    } else {
      $("kalla").textContent = NYCKEL_NAMN[c.nyckel] + (c.pn==="inf" ? "" : " · " + PN_NAMN[c.pn]);
      $("prompt").innerHTML = '<span class="neg">…</span> ' + c.form;
      $("lemma").textContent = c.lemma + " — " + c.glosa;
      $("pil").innerHTML = "→ <b>negera formen</b>";
    }
    renderOptioner();
    if(state.besvarad){ visaSvar(); $("controls-next").classList.remove("hidden"); }
    const kort = document.querySelector(".vy-former .card");   // grön/amber ram
    if(kort){
      const svarat = state.besvarad && state.valt!=null;
      kort.classList.toggle("svar-ratt", svarat && c.ratta.has(state.valt));
      kort.classList.toggle("svar-fel",  svarat && !c.ratta.has(state.valt));
    }
  }

  function visaSvar(){
    const c = state.card;
    const facit = [...c.ratta];
    if(c.typ === "bygg"){
      $("svar").textContent = facit.join(" / ");
      const personer = c.omv.to.endsWith(".inf") ? "" :
        " · " + tvetydigaPersonerNamn(c);
      $("svarlabel").textContent = c.lemma + " · " + NYCKEL_NAMN[c.omv.to] + personer;
      let regel = c.omv.regel;
      if(facit.length > 1) regel += "  ⚠︎ Formen " + c.kalla + " är tvetydig — därför två rätta svar.";
      else if(facit[0] === c.kalla) regel += "  ⚠︎ Formen ändras inte.";
      $("regel").textContent = regel;
    } else {
      $("svar").textContent = negationForan(facit[0]) + " " + c.form;
      $("svarlabel").textContent = c.nyckel.endsWith(".imp")
        ? "Imperativ negeras alltid med μή."
        : "Indikativ: οὐ rättar sig efter ljudet efter.";
      $("regel").textContent = c.nyckel.endsWith(".imp")
        ? "Modus avgör, inte ljudet: μή vid imperativ, οὐ (οὐκ/οὐχ) vid indikativ."
        : { konsonant: "οὐ framför konsonant.",
            lenis:     "οὐκ framför vokal med mjuk ansats (spiritus lenis).",
            asper:     "οὐχ framför vokal med sträv ansats (spiritus asper)." }[c.ansats];
    }
    $("reveal").classList.remove("hidden");
  }
  function tvetydigaPersonerNamn(c){
    const v = verb.find(x => x.lemma === c.lemma);
    return tvetydigaPersoner(v, c.omv.from, c.pn).map(p => PN_NAMN[p]).join(" el. ");
  }

  function renderOptioner(){
    const box = $("options"); box.innerHTML = "";
    state.card.optioner.forEach(f => {
      const b = document.createElement("button");
      b.className = "opt"; b.textContent = f;
      if(state.besvarad){
        b.disabled = true;
        if(state.card.ratta.has(f)) b.classList.add("correct");
        else if(f === state.valt) b.classList.add("wrong");
      } else { b.onclick = () => svara(f); }
      box.appendChild(b);
    });
  }
  function svara(f){
    state.valt = f; state.besvarad = true;
    if(state.card.ratta.has(f)){ state.streak++; rkKlarad(); if(state.streak>state.best){ state.best=state.streak; spara(); } }
    else state.streak = 0;
    $("streak").textContent = state.streak; $("best").textContent = state.best;
    render2();
  }

  /* ── PICKER ────────────────────────────────────────────────────────── */
  function uppdateraAntal(){
    const el = $("antal");
    if(el) el.textContent = "(" + kandidatVerb().length + " verb)";
  }
  function byggGridSem(){
    const g = $("grid-sem"); g.innerHTML = "";
    SEMINARIER.forEach(s => {
      const b = document.createElement("button");
      b.className="toggle"; b.textContent=semNamn(s);
      b.setAttribute("aria-pressed", state.valdaSem.has(s));
      b.onclick = () => { state.valdaSem.has(s)?state.valdaSem.delete(s):state.valdaSem.add(s);
        b.setAttribute("aria-pressed", state.valdaSem.has(s)); spara(); newQuestion(); };
      g.appendChild(b);
    });
  }
  function byggGridOmv(){
    const g = $("grid-omv"); g.innerHTML = "";
    OMVANDLINGAR.forEach(o => {
      const b = document.createElement("button");
      b.className="toggle"; b.textContent=o.namn;
      const finns = parFor(o).length > 0;
      b.disabled = !finns;
      if(!finns) b.setAttribute("aria-label", o.namn + " (inget valt verb har båda formerna)");
      b.setAttribute("aria-pressed", finns && state.valdaOmv.has(o.id));
      b.onclick = () => { state.valdaOmv.has(o.id)?state.valdaOmv.delete(o.id):state.valdaOmv.add(o.id);
        b.setAttribute("aria-pressed", state.valdaOmv.has(o.id)); uppdateraOmvChips(); spara(); newQuestion(); };
      g.appendChild(b);
    });
    uppdateraOmvChips();
  }
  function byggGridKlass(){
    const g = $("grid-klass"); g.innerHTML = "";
    Object.entries(KLASSER).forEach(([k, namn]) => {
      const b = document.createElement("button");
      b.className="toggle"; b.textContent=namn;
      b.setAttribute("aria-pressed", state.valdaKlass.has(k));
      b.onclick = () => { state.valdaKlass.has(k)?state.valdaKlass.delete(k):state.valdaKlass.add(k);
        b.setAttribute("aria-pressed", state.valdaKlass.has(k)); byggGridOmv(); spara(); newQuestion(); };
      g.appendChild(b);
    });
  }
  function uppdateraOmvChips(){
    const alla = new Set(OMVANDLINGAR.map(o=>o.id));
    document.querySelector("[data-omv-all]").setAttribute("aria-pressed", setEq(state.valdaOmv, alla));
    document.querySelector("[data-omv-blad]").setAttribute("aria-pressed", setEq(state.valdaOmv, new Set(BLADET)));
  }
  function uppdateraLage(){
    $("mode-bygg").setAttribute("aria-pressed", state.mode==="bygg");
    $("mode-neg").setAttribute("aria-pressed", state.mode==="neg");
    // Negationsläget bryr sig inte om vilken omvandling som är vald.
    $("sec-omv").classList.toggle("hidden", state.mode==="neg");
    $("sub").textContent = state.mode==="neg"
      ? "Modus avgör negationen — och vid indikativ avgör ljudet formen."
      : "Läs av formen och bygg om den.";
  }

  $("mode-bygg").onclick = () => { state.mode="bygg"; state.streak=0; uppdateraLage(); spara(); newQuestion(); };
  $("mode-neg").onclick  = () => { state.mode="neg";  state.streak=0; uppdateraLage(); spara(); newQuestion(); };
  $("btn-next").onclick  = () => newQuestion();
  $("picker-toggle").onclick = () => {
    const b = $("picker-body"), o = b.classList.toggle("hidden");
    $("picker-toggle").setAttribute("aria-expanded", String(!o));
  };
  document.querySelector("[data-sem-all]").onclick  = () => { state.valdaSem = new Set(SEMINARIER); byggGridSem(); spara(); newQuestion(); };
  document.querySelector("[data-sem-none]").onclick = () => { state.valdaSem = new Set(); byggGridSem(); spara(); newQuestion(); };
  document.querySelector("[data-omv-all]").onclick  = () => { state.valdaOmv = new Set(OMVANDLINGAR.map(o=>o.id)); byggGridOmv(); spara(); newQuestion(); };
  document.querySelector("[data-omv-blad]").onclick = () => { state.valdaOmv = new Set(BLADET); byggGridOmv(); spara(); newQuestion(); };

  __fh = e => {
    if(e.key === "Enter" && state.besvarad){ e.preventDefault(); newQuestion(); return; }
    const n = parseInt(e.key, 10);
    if(n >= 1 && n <= state.card.optioner.length && !state.besvarad){
      e.preventDefault(); svara(state.card.optioner[n-1]);
    }
  };
  document.addEventListener("keydown", __fh);

  ladda(); uppdateraLage(); byggGridSem(); byggGridOmv(); byggGridKlass();
  $("streak").textContent = state.streak; $("best").textContent = state.best;
  newQuestion();
}
