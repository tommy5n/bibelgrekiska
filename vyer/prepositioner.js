// Vy: Prepositioner — kasus styr betydelsen.
// Snapshot av prepositioner.json (mastern), GENERERAD:
//     python3 scripts/gen_prepositioner_snapshot.py
// Kasus→betydelse-kartan speglar grammatikreferensens prepositionskort
// (#prepositioner) — håll dem i synk vid ändring i mastern.
//
// Spelmekanik (ett läge): visa en verklig prepositionsfras där kasus syns på
// artikel/ändelse (διὰ τῆς θαλάσσης [gen] vs διὰ τὸν λόγον [ack]). Spelaren väljer
// prepositionens betydelse. Distraktorerna är i första hand SAMMA prepositions
// betydelse i andra kasus — så valet kräver att man läser kasus, inte gissar.
// Självförsörjande: injicerar egen .vy-prep-stil (designvariabler från app.css) och städar i teardown.
let __ph = null;

export function teardown(){
  if(__ph){ document.removeEventListener("keydown", __ph); __ph = null; }
  const s = document.getElementById("vy-prep-style");
  if(s) s.remove();
}

/* ── DATA — snapshot av prepositioner.json. Regenereras ur mastern vid ändring.
   kasus: kasusnyckel → kort svensk betydelse (= svarsalternativ).
   grupp: antal kasus prepositionen styr (1/2/3). ─── */
const prepositioner = [
  { lemma:"ἐν",   grupp:1, frekvens:2733, sem:[4,5],   kasus:{ dat:"i" } },
  { lemma:"εἰς",  grupp:1, frekvens:1754, sem:[4,5],   kasus:{ ack:"in i, till" } },
  { lemma:"ἐκ",   grupp:1, frekvens:913,  sem:[5],     kasus:{ gen:"ur, ut ur" } },
  { lemma:"ἀπό",  grupp:1, frekvens:644,  sem:[5],     kasus:{ gen:"från, av" } },
  { lemma:"σύν",  grupp:1, frekvens:129,  sem:[5],     kasus:{ dat:"med, jämte" } },
  { lemma:"πρό",  grupp:1, frekvens:47,   sem:[5],     kasus:{ gen:"framför, före" } },

  { lemma:"διά",  grupp:2, frekvens:666,  sem:[5],     kasus:{ gen:"genom", ack:"på grund av" } },
  { lemma:"μετά", grupp:2, frekvens:470,  sem:[5],     kasus:{ gen:"med", ack:"efter" } },
  { lemma:"κατά", grupp:2, frekvens:469,  sem:[5],     kasus:{ gen:"mot, utför", ack:"enligt" } },
  { lemma:"περί", grupp:2, frekvens:332,  sem:[5],     kasus:{ gen:"om, angående", ack:"kring, omkring" } },
  { lemma:"ὑπό",  grupp:2, frekvens:220,  sem:[5],     kasus:{ gen:"av (agent)", ack:"under, in under" } },
  { lemma:"ὑπέρ", grupp:2, frekvens:150,  sem:[5],     kasus:{ gen:"för, över", ack:"mer än" } },

  { lemma:"ἐπί",  grupp:3, frekvens:885,  sem:[5],     kasus:{ gen:"på, över", dat:"vid", ack:"mot, fram till" } },
  { lemma:"πρός", grupp:3, frekvens:696,  sem:[5],     kasus:{ gen:"på (ngns sida)", dat:"vid, nära", ack:"till, hos" } },
  { lemma:"παρά", grupp:3, frekvens:193,  sem:[5],     kasus:{ gen:"från", dat:"hos, vid", ack:"bredvid, längs" } },
];

const fraser = [
  { lemma:"ἐν",   kasus:"dat", gr:"ἐν τῷ οἴκῳ",         sv:"i huset" },
  { lemma:"ἐν",   kasus:"dat", gr:"ἐν τῷ κόσμῳ",        sv:"i världen" },
  { lemma:"ἐν",   kasus:"dat", gr:"ἐν ἀρχῇ",            sv:"i begynnelsen" },
  { lemma:"εἰς",  kasus:"ack", gr:"εἰς τὸν οἶκον",      sv:"in i huset" },
  { lemma:"εἰς",  kasus:"ack", gr:"εἰς τὴν θάλασσαν",   sv:"ut i havet" },
  { lemma:"εἰς",  kasus:"ack", gr:"εἰς τὸν κόσμον",     sv:"in i världen" },
  { lemma:"ἐκ",   kasus:"gen", gr:"ἐκ τοῦ οὐρανοῦ",     sv:"ur himlen" },
  { lemma:"ἐκ",   kasus:"gen", gr:"ἐκ τοῦ ἱεροῦ",       sv:"ut ur templet" },
  { lemma:"ἀπό",  kasus:"gen", gr:"ἀπὸ τοῦ θεοῦ",       sv:"från Gud" },
  { lemma:"ἀπό",  kasus:"gen", gr:"ἀπ᾿ ἀρχῆς",          sv:"från begynnelsen" },
  { lemma:"σύν",  kasus:"dat", gr:"σὺν τοῖς ἀδελφοῖς",  sv:"med bröderna" },
  { lemma:"σύν",  kasus:"dat", gr:"σὺν τῷ κυρίῳ",       sv:"med Herren" },
  { lemma:"πρό",  kasus:"gen", gr:"πρὸ τῆς ἡμέρας",     sv:"före dagen" },
  { lemma:"πρό",  kasus:"gen", gr:"πρὸ τοῦ κόσμου",     sv:"före världen" },

  { lemma:"διά",  kasus:"gen", gr:"διὰ τῆς θαλάσσης",   sv:"genom havet" },
  { lemma:"διά",  kasus:"gen", gr:"διὰ τῆς γραφῆς",     sv:"genom skriften" },
  { lemma:"διά",  kasus:"ack", gr:"διὰ τὸν λόγον",      sv:"på grund av ordet" },
  { lemma:"διά",  kasus:"ack", gr:"διὰ τὸν κύριον",     sv:"på grund av Herren" },
  { lemma:"μετά", kasus:"gen", gr:"μετὰ τῶν ἀδελφῶν",   sv:"med bröderna" },
  { lemma:"μετά", kasus:"gen", gr:"μετὰ τοῦ κυρίου",    sv:"med Herren" },
  { lemma:"μετά", kasus:"ack", gr:"μετὰ τὰς ἡμέρας",    sv:"efter dagarna" },
  { lemma:"μετά", kasus:"ack", gr:"μετὰ τὸν νόμον",     sv:"efter lagen" },
  { lemma:"κατά", kasus:"gen", gr:"κατὰ τοῦ ἀνθρώπου",  sv:"mot människan" },
  { lemma:"κατά", kasus:"ack", gr:"κατὰ τὸν νόμον",     sv:"enligt lagen" },
  { lemma:"κατά", kasus:"ack", gr:"κατὰ τὰς γραφάς",    sv:"enligt skrifterna" },
  { lemma:"περί", kasus:"gen", gr:"περὶ τοῦ λόγου",     sv:"angående ordet" },
  { lemma:"περί", kasus:"gen", gr:"περὶ τῆς βασιλείας", sv:"om riket" },
  { lemma:"περί", kasus:"ack", gr:"περὶ τὸν οἶκον",     sv:"omkring huset" },
  { lemma:"ὑπό",  kasus:"gen", gr:"ὑπὸ τοῦ θεοῦ",       sv:"av Gud" },
  { lemma:"ὑπό",  kasus:"gen", gr:"ὑπὸ τοῦ κυρίου",     sv:"av Herren" },
  { lemma:"ὑπό",  kasus:"ack", gr:"ὑπὸ τὸν οἶκον",      sv:"in under huset" },
  { lemma:"ὑπέρ", kasus:"gen", gr:"ὑπὲρ τοῦ κόσμου",    sv:"för världen" },
  { lemma:"ὑπέρ", kasus:"ack", gr:"ὑπὲρ τὸν κύριον",    sv:"mer än Herren" },

  { lemma:"ἐπί",  kasus:"gen", gr:"ἐπὶ τῆς γῆς",        sv:"på jorden" },
  { lemma:"ἐπί",  kasus:"dat", gr:"ἐπὶ τῷ λόγῳ",        sv:"vid ordet" },
  { lemma:"ἐπί",  kasus:"ack", gr:"ἐπὶ τὴν θάλασσαν",   sv:"fram till havet" },
  { lemma:"πρός", kasus:"ack", gr:"πρὸς τὸν θεόν",      sv:"till Gud" },
  { lemma:"πρός", kasus:"ack", gr:"πρὸς τὸν κύριον",    sv:"till Herren" },
  { lemma:"πρός", kasus:"dat", gr:"πρὸς τῇ θαλάσσῃ",    sv:"vid havet" },
  { lemma:"παρά", kasus:"gen", gr:"παρὰ τοῦ θεοῦ",      sv:"från Gud" },
  { lemma:"παρά", kasus:"dat", gr:"παρὰ τῷ κυρίῳ",      sv:"hos Herren" },
  { lemma:"παρά", kasus:"ack", gr:"παρὰ τὴν θάλασσαν",  sv:"bredvid havet" },

  { lemma:"ἐν",   kasus:"dat", gr:"ἐν τῇ καρδίᾳ",       sv:"i hjärtat" },
  { lemma:"ἐν",   kasus:"dat", gr:"ἐν ταῖς ἡμέραις",    sv:"i dagarna" },
  { lemma:"ἐν",   kasus:"dat", gr:"ἐν τῷ ἱερῷ",         sv:"i templet" },
  { lemma:"ἐν",   kasus:"dat", gr:"ἐν τῇ ἐκκλησίᾳ",     sv:"i församlingen" },
  { lemma:"εἰς",  kasus:"ack", gr:"εἰς τὸν οὐρανόν",    sv:"upp till himlen" },
  { lemma:"εἰς",  kasus:"ack", gr:"εἰς τὴν συναγωγήν",  sv:"in i synagogan" },
  { lemma:"εἰς",  kasus:"ack", gr:"εἰς τὸν ἀγρόν",      sv:"ut på fältet" },
  { lemma:"εἰς",  kasus:"ack", gr:"εἰς τὸ πλοῖον",      sv:"in i båten" },
  { lemma:"ἐκ",   kasus:"gen", gr:"ἐκ τῆς γῆς",         sv:"ur jorden" },
  { lemma:"ἐκ",   kasus:"gen", gr:"ἐκ τοῦ οἴκου",       sv:"ut ur huset" },
  { lemma:"ἐκ",   kasus:"gen", gr:"ἐκ τῆς συναγωγῆς",   sv:"ut ur synagogan" },
  { lemma:"ἀπό",  kasus:"gen", gr:"ἀπὸ τοῦ οἴκου",      sv:"från huset" },
  { lemma:"ἀπό",  kasus:"gen", gr:"ἀπὸ τῶν ἁμαρτιῶν",   sv:"från synderna" },
  { lemma:"ἀπό",  kasus:"gen", gr:"ἀπὸ τῆς γῆς",        sv:"från jorden" },
  { lemma:"σύν",  kasus:"dat", gr:"σὺν τοῖς μαθηταῖς",  sv:"med lärjungarna" },
  { lemma:"σύν",  kasus:"dat", gr:"σὺν τῷ ἀποστόλῳ",    sv:"med aposteln" },
  { lemma:"πρό",  kasus:"gen", gr:"πρὸ τοῦ σαββάτου",   sv:"före sabbaten" },
  { lemma:"πρό",  kasus:"gen", gr:"πρὸ τῆς ὥρας",       sv:"före stunden" },

  { lemma:"διά",  kasus:"gen", gr:"διὰ τοῦ λόγου",      sv:"genom ordet" },
  { lemma:"διά",  kasus:"gen", gr:"διὰ τοῦ ἀγροῦ",      sv:"genom fältet" },
  { lemma:"διά",  kasus:"ack", gr:"διὰ τὴν ἀγάπην",     sv:"på grund av kärleken" },
  { lemma:"διά",  kasus:"ack", gr:"διὰ τὴν ἁμαρτίαν",   sv:"på grund av synden" },
  { lemma:"διά",  kasus:"ack", gr:"διὰ τὸ εὐαγγέλιον",  sv:"på grund av evangeliet" },
  { lemma:"μετά", kasus:"gen", gr:"μετὰ τῶν μαθητῶν",   sv:"med lärjungarna" },
  { lemma:"μετά", kasus:"gen", gr:"μετὰ τοῦ ὄχλου",     sv:"med folkhopen" },
  { lemma:"μετά", kasus:"ack", gr:"μετὰ τὸν θάνατον",   sv:"efter döden" },
  { lemma:"μετά", kasus:"ack", gr:"μετὰ τὸ σάββατον",   sv:"efter sabbaten" },
  { lemma:"κατά", kasus:"gen", gr:"κατὰ τοῦ κυρίου",    sv:"mot Herren" },
  { lemma:"κατά", kasus:"ack", gr:"κατὰ τὸ εὐαγγέλιον", sv:"enligt evangeliet" },
  { lemma:"κατά", kasus:"ack", gr:"κατὰ τὴν ἐντολήν",   sv:"enligt budet" },
  { lemma:"περί", kasus:"gen", gr:"περὶ τῆς ἀληθείας",  sv:"angående sanningen" },
  { lemma:"περί", kasus:"gen", gr:"περὶ τῆς ζωῆς",      sv:"om livet" },
  { lemma:"περί", kasus:"ack", gr:"περὶ τὸν τόπον",     sv:"kring platsen" },
  { lemma:"ὑπό",  kasus:"gen", gr:"ὑπὸ τῶν ἀνθρώπων",   sv:"av människorna" },
  { lemma:"ὑπό",  kasus:"gen", gr:"ὑπὸ τῶν μαθητῶν",    sv:"av lärjungarna" },
  { lemma:"ὑπό",  kasus:"ack", gr:"ὑπὸ τὸ πλοῖον",      sv:"in under båten" },
  { lemma:"ὑπέρ", kasus:"gen", gr:"ὑπὲρ τῶν ἁμαρτιῶν",  sv:"för synderna" },
  { lemma:"ὑπέρ", kasus:"gen", gr:"ὑπὲρ τοῦ λαοῦ",      sv:"för folket" },
  { lemma:"ὑπέρ", kasus:"ack", gr:"ὑπὲρ τὸν δοῦλον",    sv:"mer än tjänaren" },

  { lemma:"ἐπί",  kasus:"gen", gr:"ἐπὶ τῆς θαλάσσης",   sv:"på havet" },
  { lemma:"ἐπί",  kasus:"gen", gr:"ἐπὶ τῆς ὁδοῦ",       sv:"på vägen" },
  { lemma:"ἐπί",  kasus:"dat", gr:"ἐπὶ τῇ θαλάσσῃ",     sv:"vid havet" },
  { lemma:"ἐπί",  kasus:"ack", gr:"ἐπὶ τὴν γῆν",        sv:"ner mot jorden" },
  { lemma:"ἐπί",  kasus:"ack", gr:"ἐπὶ τὴν συναγωγήν",  sv:"fram till synagogan" },
  { lemma:"πρός", kasus:"ack", gr:"πρὸς τοὺς μαθητάς",  sv:"till lärjungarna" },
  { lemma:"πρός", kasus:"ack", gr:"πρὸς τὸν ὄχλον",     sv:"till folkhopen" },
  { lemma:"πρός", kasus:"dat", gr:"πρὸς τῷ οἴκῳ",       sv:"nära huset" },
  { lemma:"παρά", kasus:"gen", gr:"παρὰ τοῦ κυρίου",    sv:"från Herren" },
  { lemma:"παρά", kasus:"dat", gr:"παρὰ τῷ θεῷ",        sv:"hos Gud" },
  { lemma:"παρά", kasus:"ack", gr:"παρὰ τὴν ὁδόν",      sv:"längs vägen" },
];

const KASUS = { gen:"genitiv", dat:"dativ", ack:"ackusativ" };
const KASUS_ORDNING = ["gen","dat","ack"];
const GRUPP = { 1:"ett kasus", 2:"två kasus", 3:"tre kasus" };
const GRUPP_ORDNING = [1,2,3];

/* Fasta prepositioner = styr bara ett kasus (ingen betydelseglidning). Bär
   "Vilket kasus?"-läget. endaKasus() ger deras enda kasusnyckel. */
const FASTA = prepositioner.filter(p => p.grupp === 1);
const endaKasus = p => Object.keys(p.kasus)[0];

/* Seminarie-axel: varje preposition bär sem:[…] ur mastern. */
const SEMINARIER = [...new Set(prepositioner.flatMap(p => p.sem))].sort((a,b) => a - b);
const semNamn = s => "Sem " + s;
const prep = l => prepositioner.find(p => p.lemma === l);

/* Alla distinkta betydelser över alla prepositioner (distraktor-pool). */
const ALLA_BETYDELSER = [...new Set(prepositioner.flatMap(p => Object.values(p.kasus)))];
/* Innehållsord i en betydelse (för synonym-vakt vid distraktorval). */
const ord = s => s.toLowerCase().split(/[\s,()]+/).filter(Boolean);

const STYLE = `
.vy-prep .modes{ display:flex; gap:.5rem; justify-content:center; margin:1rem 0 0; }
.vy-prep .mode{ font-family:"Spectral",serif; font-size:var(--fs-sm); padding:.35rem .9rem;
  border:1px solid var(--line); border-radius:999px; background:var(--card); color:var(--ink-soft); cursor:pointer; }
/* .mode "valt"-svart ärvs från den delade .modes-regeln i app.css. */
.vy-prep .stage{ display:flex; flex-direction:column; align-items:center; gap:1rem; margin-top:1rem; }
.vy-prep .glosa{ font-family:"Spectral",serif; color:var(--ink-soft); font-size:var(--fs-md); margin-top:.4rem; }
.vy-prep .card{ background:var(--card); border:1px solid var(--line); border-radius:14px;
  padding:1.6rem 1.4rem; min-width:min(30rem,92vw); text-align:center;
  box-shadow:0 1px 0 rgba(0,0,0,.03); }
.vy-prep .prompt{ font-family:"Cardo",serif; font-size:var(--fs-4xl); color:var(--ink); line-height:1.15; }
.vy-prep .prompt .pp{ color:var(--gold); }
.vy-prep .fraga{ font-family:"Spectral",serif; color:var(--ink-soft); font-size:var(--fs-md); margin-top:.5rem; }
.vy-prep .fraga b{ color:var(--ink); }
.vy-prep .reveal{ margin-top:1rem; border-top:1px dashed var(--line); padding-top:1rem; }
.vy-prep .svar{ font-family:"Cardo",serif; font-size:var(--fs-2xl); color:var(--ink); }
.vy-prep .svar .kas{ font-weight:700; }
.vy-prep .oversatt{ font-family:"Spectral",serif; color:var(--ink-soft); font-size:var(--fs-md); margin-top:.3rem; }
.vy-prep .oversatt b{ color:var(--ink); }
.vy-prep .tabell{ margin-top:.7rem; display:inline-flex; flex-direction:column; gap:.15rem; }
.vy-prep .trow{ font-family:"Spectral",serif; font-size:var(--fs-sm); color:var(--ink-soft); }
.vy-prep .trow.akt{ color:var(--ink); font-weight:600; }
.vy-prep .trow .tk{ display:inline-block; min-width:5.5rem; text-align:right; color:var(--gold); }
.vy-prep .hidden{ display:none !important; }
.vy-prep .options{ display:grid; grid-template-columns:1fr 1fr; gap:.6rem; min-width:min(30rem,92vw); }
.vy-prep .opt{ font-family:"Spectral",serif; font-size:var(--fs-lg); padding:.7rem .5rem;
  border:1px solid var(--line); border-radius:10px; background:var(--card); color:var(--ink); cursor:pointer; }
.vy-prep .opt:hover:not(:disabled){ border-color:var(--gold); }
.vy-prep .opt:disabled{ cursor:default; }
.vy-prep .opt.correct{ background:var(--good-bg); border-color:var(--good); color:var(--good); }
.vy-prep .opt.wrong{ background:var(--bad-bg); border-color:var(--bad); color:var(--bad); }
.vy-prep .controls{ display:flex; gap:.6rem; justify-content:center; }
.vy-prep .btn{ font-family:"Spectral",serif; font-size:var(--fs-md); padding:.55rem 1.2rem;
  border:1px solid var(--line); border-radius:10px; background:var(--card); color:var(--ink); cursor:pointer; }
.vy-prep .btn.primary{ background:var(--gold); color:#fff; border-color:var(--gold); }
.vy-prep .streak{ font-family:"Spectral",serif; color:var(--ink-soft); font-size:var(--fs-sm); }
/* .picker, .toggle, .chip m.fl. ärvs från de delade reglerna i app.css. */
.vy-prep footer{ margin-top:1.4rem; font-family:"Spectral",serif; color:var(--ink-soft); font-size:var(--fs-2xs); text-align:center; }
.vy-prep footer a{ color:var(--gold); text-decoration:none; }
.vy-prep footer a:hover{ text-decoration:underline; }
.vy-prep .gr-lank{ margin-top:.6rem; }
`;

const MARKUP = `<div class="vy vy-prep">
<header>
  <h1>Grekiska — prepositioner</h1>
  <div class="sub">Kasus styr betydelsen hos grekiska prepositioner.</div>
</header>

<div class="modes" role="group" aria-label="Spelläge">
  <button class="mode" id="mode-valj" aria-pressed="true">Välj betydelse</button>
  <button class="mode" id="mode-kasus" aria-pressed="false">Vilket kasus?</button>
</div>

<div class="stage">
  <div class="card">
    <div class="prompt" id="prompt">—</div>
    <div class="fraga" id="fraga"></div>
    <div class="reveal hidden" id="reveal">
      <div class="svar" id="svar"></div>
      <div class="oversatt" id="oversatt"></div>
      <div class="tabell" id="tabell"></div>
    </div>
  </div>

  <div class="options" id="options"></div>
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
    <div id="sec-grupp">
      <h2>Antal kasus <span class="quicklabel">(betydelsen glider vid två/tre)</span></h2>
      <div class="grid" id="grid-grupp"></div>
    </div>
    <div>
      <h2>Prepositioner</h2>
      <div class="grid" id="grid-prep"></div>
    </div>
    <div id="sec-kas">
      <h2>Kasus i frasen</h2>
      <div class="grid" id="grid-kas"></div>
    </div>
  </div>
</div>

<footer>En preposition kräver alltid ett bestämt kasus. <b>Fasta</b> prepositioner (ἐν, εἰς, ἐκ, ἀπό, σύν, πρό) har en betydelse; många andra <b>glider</b>: διά + gen ”genom”, men + ack ”på grund av”. Kasus syns på artikeln (τοῦ/τῷ/τόν) och ändelsen.
<div class="gr-lank"><a href="grammatikreferens.html#prepositioner">§ Prepositioner i grammatikreferensen →</a></div></footer>
</div>`;

export function render(root){
  if(!document.getElementById("vy-prep-style")){
    const st = document.createElement("style"); st.id = "vy-prep-style"; st.textContent = STYLE;
    document.head.appendChild(st);
  }
  root.innerHTML = MARKUP;

  const LAGER = "grekiska-prepositionsspel";
  const state = {
    mode: "valj",  // "valj" = välj betydelse, "kasus" = vilket kasus (fasta prep.)
    valdaSem:   new Set(SEMINARIER),
    valdaGrupp: new Set(GRUPP_ORDNING),
    valdaPrep:  new Set(prepositioner.map(p => p.lemma)),
    valdaKas:   new Set(KASUS_ORDNING),
    streak: 0, best: 0, card: null, besvarad: false, valt: null, forra: null,
  };

  const $ = id => document.getElementById(id);
  const pick = a => a[Math.floor(Math.random()*a.length)];
  const shuffle = a => { a=a.slice(); for(let i=a.length-1;i>0;i--){ const j=Math.floor(Math.random()*(i+1)); [a[i],a[j]]=[a[j],a[i]]; } return a; };

  // Prepositioner synliga = de vars seminarium OCH grupp valts (fallback: alla).
  function synligaPrep(){
    const l = prepositioner.filter(p => p.sem.some(s => state.valdaSem.has(s)) && state.valdaGrupp.has(p.grupp));
    return l.length ? l : prepositioner;
  }
  // Aktiva = synliga ∩ valda lemman (fallback: synliga).
  function aktivPrep(){
    const syn = synligaPrep();
    const v = syn.filter(p => state.valdaPrep.has(p.lemma));
    return v.length ? v : syn;
  }
  // Aktiva fraser = fraser vars preposition är aktiv och vars kasus valts.
  function aktivaFraser(){
    const lem = new Set(aktivPrep().map(p => p.lemma));
    const bas = fraser.filter(f => lem.has(f.lemma));
    const k = bas.filter(f => state.valdaKas.has(f.kasus));
    return k.length ? k : (bas.length ? bas : fraser);
  }
  // "Vilket kasus?"-läget: bara fasta prepositioner i valda seminarier ∩ valda
  // lemman (fallback: fasta i sem, sedan alla fasta).
  function fastaAktiv(){
    const inSem = FASTA.filter(p => p.sem.some(s => state.valdaSem.has(s)));
    const bas = inSem.length ? inSem : FASTA;
    const v = bas.filter(p => state.valdaPrep.has(p.lemma));
    return v.length ? v : bas;
  }
  // Prepositions-grid: fasta prep. i "kasus"-läget, annars synliga (sem ∩ grupp).
  function gridPrepList(){
    if(state.mode === "kasus"){
      const l = FASTA.filter(p => p.sem.some(s => state.valdaSem.has(s)));
      return l.length ? l : FASTA;
    }
    return synligaPrep();
  }

  function spara(){ try{ localStorage.setItem(LAGER, JSON.stringify({
    mode:state.mode, valdaSem:[...state.valdaSem], valdaGrupp:[...state.valdaGrupp], valdaPrep:[...state.valdaPrep],
    valdaKas:[...state.valdaKas], best:state.best })); }catch(e){} }
  function ladda(){ try{ const r = JSON.parse(localStorage.getItem(LAGER)); if(!r) return;
    if(r.mode === "valj" || r.mode === "kasus") state.mode = r.mode;
    if(Array.isArray(r.valdaSem))   state.valdaSem   = new Set(r.valdaSem.filter(s => SEMINARIER.includes(s)));
    if(Array.isArray(r.valdaGrupp)) state.valdaGrupp = new Set(r.valdaGrupp.filter(g => GRUPP_ORDNING.includes(g)));
    if(Array.isArray(r.valdaPrep))  state.valdaPrep  = new Set(r.valdaPrep.filter(l => prepositioner.some(p=>p.lemma===l)));
    if(Array.isArray(r.valdaKas))   state.valdaKas   = new Set(r.valdaKas.filter(k => KASUS_ORDNING.includes(k)));
    if(typeof r.best === "number") state.best = r.best;
    if(!state.valdaSem.size)   state.valdaSem   = new Set(SEMINARIER);
    if(!state.valdaGrupp.size) state.valdaGrupp = new Set(GRUPP_ORDNING);
    if(!state.valdaPrep.size)  state.valdaPrep  = new Set(prepositioner.map(p=>p.lemma));
    if(!state.valdaKas.size)   state.valdaKas   = new Set(KASUS_ORDNING);
  }catch(e){} }

  // Distraktorer: i första hand SAMMA prepositions betydelse i övriga kasus (den
  // pedagogiska kontrasten). Fyll på från övriga prepositioners betydelser, men
  // hoppa över sådana som delar innehållsord med rätt svar (synonym-vakt).
  function byggOptioner(f, ratt){
    const p = prep(f.lemma);
    const egna = Object.entries(p.kasus).filter(([k]) => k !== f.kasus).map(([,v]) => v);
    let pool = [...new Set(egna.filter(v => v !== ratt))];
    if(pool.length < 3){
      const rattOrd = new Set(ord(ratt));
      const ovriga = ALLA_BETYDELSER.filter(v =>
        v !== ratt && !pool.includes(v) && !ord(v).some(w => rattOrd.has(w)));
      pool = [...pool, ...shuffle(ovriga)];
    }
    return shuffle([ratt, ...pool.slice(0,3)]);
  }

  function newQuestion(){
    if(state.mode === "kasus"){ newQuestionKasus(); return; }
    const fr = aktivaFraser();
    let f, n=0;
    do { f = pick(fr); } while(fr.length > 1 && f.gr === state.forra && ++n < 30);
    state.forra = f.gr;
    const ratt = prep(f.lemma).kasus[f.kasus];
    state.card = { mode:"valj", ...f, ratt, optioner: byggOptioner(f, ratt) };
    state.besvarad = false; state.valt = null;
    render2();
  }
  // "Vilket kasus?": visa en fast preposition + dess betydelse, välj kasus.
  function newQuestionKasus(){
    const ps = fastaAktiv();
    let p, n=0;
    do { p = pick(ps); } while(ps.length > 1 && p.lemma === state.forra && ++n < 30);
    state.forra = p.lemma;
    const kas = endaKasus(p);
    const ex = fraser.find(f => f.lemma === p.lemma) || null;
    state.card = { mode:"kasus", lemma:p.lemma, kas, betyd:p.kasus[kas], ratt:KASUS[kas],
      optioner: KASUS_ORDNING.map(k => KASUS[k]), ex };
    state.besvarad = false; state.valt = null;
    render2();
  }

  // Markera prepositionen (första token) i frasen med guldfärg.
  function promptHTML(f){
    const i = f.gr.indexOf(" ");
    if(i < 0) return f.gr;
    return `<span class="pp">${f.gr.slice(0,i)}</span>${f.gr.slice(i)}`;
  }

  function render2(){
    const c = state.card;
    if(c.mode === "kasus"){
      $("prompt").textContent = c.lemma;
      $("fraga").innerHTML = "<b>" + c.betyd + "</b> — vilket kasus styr den?";
    } else {
      $("prompt").innerHTML = promptHTML(c);
      $("fraga").innerHTML = "Vad betyder <b>" + c.lemma + "</b> här?";
    }
    $("streak").textContent = state.streak;
    $("best").textContent = state.best;

    renderOptioner();
    if(state.besvarad){ visaSvar(); $("controls-next").classList.remove("hidden"); }
    else { $("reveal").classList.add("hidden"); $("controls-next").classList.add("hidden"); }
  }

  function visaSvar(){
    const c = state.card;
    if(c.mode === "kasus"){
      $("svar").innerHTML = c.lemma + " styr <span class=\"kas\">" + KASUS[c.kas] + "</span> → " + c.betyd;
      $("oversatt").innerHTML = c.ex ? (c.ex.gr + " = <b>" + c.ex.sv + "</b>") : "";
      $("tabell").innerHTML = "";
      $("reveal").classList.remove("hidden");
      return;
    }
    const p = prep(c.lemma);
    $("svar").innerHTML = c.lemma + " + <span class=\"kas\">" + KASUS[c.kasus] + "</span> → " + c.ratt;
    $("oversatt").innerHTML = c.gr + " = <b>" + c.sv + "</b>";
    // Hela prepositionens kasus→betydelse (aktivt kasus markerat) — så kontrasten syns.
    const rader = KASUS_ORDNING.filter(k => p.kasus[k]).map(k =>
      `<div class="trow${k===c.kasus?" akt":""}"><span class="tk">${KASUS[k]}</span> — ${p.kasus[k]}</div>`).join("");
    $("tabell").innerHTML = p.grupp > 1 ? rader : "";
    $("reveal").classList.remove("hidden");
  }

  function renderOptioner(){
    const box = $("options"); box.innerHTML = "";
    state.card.optioner.forEach(v => {
      const b = document.createElement("button");
      b.className = "opt"; b.textContent = v;
      if(state.besvarad){
        b.disabled = true;
        if(v === state.card.ratt) b.classList.add("correct");
        else if(v === state.valt) b.classList.add("wrong");
      } else { b.onclick = () => svara(v); }
      box.appendChild(b);
    });
  }

  function registrera(rätt){ if(rätt){ state.streak++; if(state.streak>state.best){ state.best=state.streak; spara(); } } else state.streak=0; }
  function svara(v){ state.valt=v; state.besvarad=true; registrera(v === state.card.ratt); render2(); }

  // ── Picker: en toggle-grid per dimension (multival, minst ett kvar). ──
  function byggGrid(id, nycklar, etikett, valda, efter){
    const g = $(id); g.innerHTML = "";
    nycklar.forEach(k => {
      const b = document.createElement("button");
      b.className="toggle"; b.textContent = etikett(k);
      b.setAttribute("aria-pressed", valda.has(k));
      b.onclick = () => {
        if(valda.has(k)){ if(valda.size>1) valda.delete(k); } else valda.add(k);
        b.setAttribute("aria-pressed", valda.has(k)); if(efter) efter(); spara(); newQuestion();
      };
      g.appendChild(b);
    });
  }
  // Prepositions-griden visar prep. som är relevanta för läget (se gridPrepList).
  function byggGridPrep(){
    const g = $("grid-prep"); g.innerHTML = "";
    gridPrepList().forEach(p => {
      const b = document.createElement("button");
      b.className="toggle"; b.textContent = p.lemma;
      b.setAttribute("aria-pressed", state.valdaPrep.has(p.lemma));
      b.onclick = () => {
        if(state.valdaPrep.has(p.lemma)){ if(state.valdaPrep.size>1) state.valdaPrep.delete(p.lemma); }
        else state.valdaPrep.add(p.lemma);
        b.setAttribute("aria-pressed", state.valdaPrep.has(p.lemma));
        spara(); newQuestion();
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
        uppdateraSnabbChips(); byggGridPrep(); spara(); newQuestion();
      };
      g.appendChild(b);
    });
    uppdateraSnabbChips();
  }
  function setEq(a, b){ return a.size === b.size && [...a].every(x => b.has(x)); }
  function uppdateraSnabbChips(){
    const v = state.valdaSem;
    const all = document.querySelector("[data-sem-all]"), none = document.querySelector("[data-sem-none]");
    if(all)  all.setAttribute("aria-pressed", setEq(v, new Set(SEMINARIER)));
    if(none) none.setAttribute("aria-pressed", v.size === 0);
  }
  function byggPickers(){
    byggGridSem();
    byggGrid("grid-grupp", GRUPP_ORDNING, g => GRUPP[g], state.valdaGrupp, byggGridPrep);
    byggGridPrep();
    byggGrid("grid-kas", KASUS_ORDNING, k => KASUS[k], state.valdaKas);
  }

  // Läge: uppdatera knappar + dölj de picker-sektioner som inte gäller "kasus".
  function uppdateraLage(){
    $("mode-valj").setAttribute("aria-pressed", state.mode === "valj");
    $("mode-kasus").setAttribute("aria-pressed", state.mode === "kasus");
    const k = state.mode === "kasus";
    $("sec-grupp").classList.toggle("hidden", k);
    $("sec-kas").classList.toggle("hidden", k);
  }
  function bytLage(m){
    if(state.mode === m) return;
    state.mode = m; state.streak = 0;
    uppdateraLage(); byggGridPrep(); spara(); newQuestion();
  }
  $("mode-valj").onclick  = () => bytLage("valj");
  $("mode-kasus").onclick = () => bytLage("kasus");

  $("btn-next").onclick = () => newQuestion();
  $("picker-toggle").onclick = () => { const o = $("picker-toggle").getAttribute("aria-expanded")==="true";
    $("picker-toggle").setAttribute("aria-expanded", !o); $("picker-body").classList.toggle("hidden", o); };
  document.querySelector("[data-sem-all]").onclick  = () => { state.valdaSem = new Set(SEMINARIER); byggGridSem(); byggGridPrep(); spara(); newQuestion(); };
  document.querySelector("[data-sem-none]").onclick = () => { state.valdaSem = new Set(); byggGridSem(); byggGridPrep(); spara(); newQuestion(); };

  __ph = e => {
    if(e.key==="Enter" && state.besvarad){ newQuestion(); }
    else if(!state.besvarad && /^[1-4]$/.test(e.key)){
      const v = state.card.optioner[+e.key-1]; if(v) svara(v); }
  };
  document.addEventListener("keydown", __ph);

  ladda(); uppdateraLage(); byggPickers(); newQuestion();
}
