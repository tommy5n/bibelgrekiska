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
  { lemma:"λύω", glosa:"lösa", klass:"omega", kortlekar:["sem2", "sem6"], sem:[2, 6], former:{ pres:{"1sg":"λύω", "2sg":"λύεις", "3sg":"λύει", "1pl":"λύομεν", "2pl":"λύετε", "3pl":"λύουσι(ν)"}, fut:{"1sg":"λύσω", "2sg":"λύσεις", "3sg":"λύσει", "1pl":"λύσομεν", "2pl":"λύσετε", "3pl":"λύσουσι(ν)"} } },
  { lemma:"βλέπω", glosa:"se", klass:"omega", kortlekar:["sem2"], sem:[2, 5], former:{ pres:{"1sg":"βλέπω", "2sg":"βλέπεις", "3sg":"βλέπει", "1pl":"βλέπομεν", "2pl":"βλέπετε", "3pl":"βλέπουσι(ν)"} } },
  { lemma:"ἀκούω", glosa:"höra", klass:"omega", kortlekar:["sem2", "sem6"], sem:[2, 5, 6], former:{ pres:{"1sg":"ἀκούω", "2sg":"ἀκούεις", "3sg":"ἀκούει", "1pl":"ἀκούομεν", "2pl":"ἀκούετε", "3pl":"ἀκούουσι(ν)"}, fut:{"1sg":"ἀκούσω", "2sg":"ἀκούσεις", "3sg":"ἀκούσει", "1pl":"ἀκούσομεν", "2pl":"ἀκούσετε", "3pl":"ἀκούσουσι(ν)"} } },
  { lemma:"λέγω", glosa:"säga", klass:"omega", kortlekar:["sem2"], sem:[2, 5], former:{ pres:{"1sg":"λέγω", "2sg":"λέγεις", "3sg":"λέγει", "1pl":"λέγομεν", "2pl":"λέγετε", "3pl":"λέγουσι(ν)"} } },
  { lemma:"γράφω", glosa:"skriva", klass:"omega", kortlekar:["sem2"], sem:[2, 5], former:{ pres:{"1sg":"γράφω", "2sg":"γράφεις", "3sg":"γράφει", "1pl":"γράφομεν", "2pl":"γράφετε", "3pl":"γράφουσι(ν)"} } },
  { lemma:"ἐσθίω", glosa:"äta", klass:"omega", kortlekar:["sem2"], sem:[2], former:{ pres:{"1sg":"ἐσθίω", "2sg":"ἐσθίεις", "3sg":"ἐσθίει", "1pl":"ἐσθίομεν", "2pl":"ἐσθίετε", "3pl":"ἐσθίουσι(ν)"} } },
  { lemma:"κηρύσσω", glosa:"predika", klass:"omega", kortlekar:["sem2"], sem:[2, 5], former:{ pres:{"1sg":"κηρύσσω", "2sg":"κηρύσσεις", "3sg":"κηρύσσει", "1pl":"κηρύσσομεν", "2pl":"κηρύσσετε", "3pl":"κηρύσσουσι(ν)"} } },
  { lemma:"λαμβάνω", glosa:"ta, gripa", klass:"omega", kortlekar:["sem2"], sem:[2], former:{ pres:{"1sg":"λαμβάνω", "2sg":"λαμβάνεις", "3sg":"λαμβάνει", "1pl":"λαμβάνομεν", "2pl":"λαμβάνετε", "3pl":"λαμβάνουσι(ν)"} } },
  { lemma:"παιδεύω", glosa:"uppfostra", klass:"omega", kortlekar:["sem2", "sem6"], sem:[2, 6], former:{ pres:{"1sg":"παιδεύω", "2sg":"παιδεύεις", "3sg":"παιδεύει", "1pl":"παιδεύομεν", "2pl":"παιδεύετε", "3pl":"παιδεύουσι(ν)"}, fut:{"1sg":"παιδεύσω", "2sg":"παιδεύσεις", "3sg":"παιδεύσει", "1pl":"παιδεύσομεν", "2pl":"παιδεύσετε", "3pl":"παιδεύσουσι(ν)"} } },
  { lemma:"πέμπω", glosa:"skicka", klass:"omega", kortlekar:["sem2"], sem:[2], former:{ pres:{"1sg":"πέμπω", "2sg":"πέμπεις", "3sg":"πέμπει", "1pl":"πέμπομεν", "2pl":"πέμπετε", "3pl":"πέμπουσι(ν)"} } },
  { lemma:"εὑρίσκω", glosa:"finna", klass:"omega", kortlekar:["sem2"], sem:[2], former:{ pres:{"1sg":"εὑρίσκω", "2sg":"εὑρίσκεις", "3sg":"εὑρίσκει", "1pl":"εὑρίσκομεν", "2pl":"εὑρίσκετε", "3pl":"εὑρίσκουσι(ν)"} } },
  { lemma:"πιστεύω", glosa:"tro (på)", klass:"omega", kortlekar:["sem2", "sem6"], sem:[2, 5, 6], former:{ pres:{"1sg":"πιστεύω", "2sg":"πιστεύεις", "3sg":"πιστεύει", "1pl":"πιστεύομεν", "2pl":"πιστεύετε", "3pl":"πιστεύουσι(ν)"}, fut:{"1sg":"πιστεύσω", "2sg":"πιστεύσεις", "3sg":"πιστεύσει", "1pl":"πιστεύσομεν", "2pl":"πιστεύσετε", "3pl":"πιστεύσουσι(ν)"} } },
  { lemma:"βαπτίζω", glosa:"döpa", klass:"omega", kortlekar:["sem2"], sem:[2], former:{ pres:{"1sg":"βαπτίζω", "2sg":"βαπτίζεις", "3sg":"βαπτίζει", "1pl":"βαπτίζομεν", "2pl":"βαπτίζετε", "3pl":"βαπτίζουσι(ν)"} } },
  { lemma:"σῴζω", glosa:"rädda", klass:"omega", kortlekar:["sem2"], sem:[2, 5], former:{ pres:{"1sg":"σῴζω", "2sg":"σῴζεις", "3sg":"σῴζει", "1pl":"σῴζομεν", "2pl":"σῴζετε", "3pl":"σῴζουσι(ν)"} } },
  { lemma:"κλέπτω", glosa:"stjäla", klass:"omega", kortlekar:["sem2"], sem:[2], former:{ pres:{"1sg":"κλέπτω", "2sg":"κλέπτεις", "3sg":"κλέπτει", "1pl":"κλέπτομεν", "2pl":"κλέπτετε", "3pl":"κλέπτουσι(ν)"} } },
  { lemma:"ἄγω", glosa:"leda", klass:"omega", kortlekar:["sem2"], sem:[2, 5], former:{ pres:{"1sg":"ἄγω", "2sg":"ἄγεις", "3sg":"ἄγει", "1pl":"ἄγομεν", "2pl":"ἄγετε", "3pl":"ἄγουσι(ν)"} } },
  { lemma:"φιλέω", glosa:"älska, gilla", klass:"kontrakt_e", kortlekar:["sem4", "sem6"], sem:[4, 5, 6], former:{ pres:{"1sg":"φιλῶ", "2sg":"φιλεῖς", "3sg":"φιλεῖ", "1pl":"φιλοῦμεν", "2pl":"φιλεῖτε", "3pl":"φιλοῦσι(ν)"}, fut:{"1sg":"φιλήσω", "2sg":"φιλήσεις", "3sg":"φιλήσει", "1pl":"φιλήσομεν", "2pl":"φιλήσετε", "3pl":"φιλήσουσι(ν)"} } },
  { lemma:"ζητέω", glosa:"söka", klass:"kontrakt_e", kortlekar:["sem4", "sem6"], sem:[4, 5, 6], former:{ pres:{"1sg":"ζητῶ", "2sg":"ζητεῖς", "3sg":"ζητεῖ", "1pl":"ζητοῦμεν", "2pl":"ζητεῖτε", "3pl":"ζητοῦσι(ν)"}, fut:{"1sg":"ζητήσω", "2sg":"ζητήσεις", "3sg":"ζητήσει", "1pl":"ζητήσομεν", "2pl":"ζητήσετε", "3pl":"ζητήσουσι(ν)"} } },
  { lemma:"καλέω", glosa:"kalla", klass:"kontrakt_e", kortlekar:["sem4"], sem:[4, 5], former:{ pres:{"1sg":"καλῶ", "2sg":"καλεῖς", "3sg":"καλεῖ", "1pl":"καλοῦμεν", "2pl":"καλεῖτε", "3pl":"καλοῦσι(ν)"} } },
  { lemma:"λαλέω", glosa:"tala", klass:"kontrakt_e", kortlekar:["sem4", "sem6"], sem:[4, 5, 6], former:{ pres:{"1sg":"λαλῶ", "2sg":"λαλεῖς", "3sg":"λαλεῖ", "1pl":"λαλοῦμεν", "2pl":"λαλεῖτε", "3pl":"λαλοῦσι(ν)"}, fut:{"1sg":"λαλήσω", "2sg":"λαλήσεις", "3sg":"λαλήσει", "1pl":"λαλήσομεν", "2pl":"λαλήσετε", "3pl":"λαλήσουσι(ν)"} } },
  { lemma:"μαρτυρέω", glosa:"vittna om", klass:"kontrakt_e", kortlekar:["sem4", "sem6"], sem:[4, 5, 6], former:{ pres:{"1sg":"μαρτυρῶ", "2sg":"μαρτυρεῖς", "3sg":"μαρτυρεῖ", "1pl":"μαρτυροῦμεν", "2pl":"μαρτυρεῖτε", "3pl":"μαρτυροῦσι(ν)"}, fut:{"1sg":"μαρτυρήσω", "2sg":"μαρτυρήσεις", "3sg":"μαρτυρήσει", "1pl":"μαρτυρήσομεν", "2pl":"μαρτυρήσετε", "3pl":"μαρτυρήσουσι(ν)"} } },
  { lemma:"ποιέω", glosa:"göra", klass:"kontrakt_e", kortlekar:["sem4", "sem6"], sem:[4, 5, 6], former:{ pres:{"1sg":"ποιῶ", "2sg":"ποιεῖς", "3sg":"ποιεῖ", "1pl":"ποιοῦμεν", "2pl":"ποιεῖτε", "3pl":"ποιοῦσι(ν)"}, fut:{"1sg":"ποιήσω", "2sg":"ποιήσεις", "3sg":"ποιήσει", "1pl":"ποιήσομεν", "2pl":"ποιήσετε", "3pl":"ποιήσουσι(ν)"} } },
  { lemma:"τηρέω", glosa:"bevaka, bevara", klass:"kontrakt_e", kortlekar:["sem4", "sem6"], sem:[4, 5, 6], former:{ pres:{"1sg":"τηρῶ", "2sg":"τηρεῖς", "3sg":"τηρεῖ", "1pl":"τηροῦμεν", "2pl":"τηρεῖτε", "3pl":"τηροῦσι(ν)"}, fut:{"1sg":"τηρήσω", "2sg":"τηρήσεις", "3sg":"τηρήσει", "1pl":"τηρήσομεν", "2pl":"τηρήσετε", "3pl":"τηρήσουσι(ν)"} } },
  { lemma:"εἰμί", glosa:"vara", klass:"oregelbunden", kortlekar:["sem4", "eimi", "sem6"], sem:[4, 5, 6], former:{ pres:{"1sg":"εἰμί", "2sg":"εἶ", "3sg":"ἐστί(ν)", "1pl":"ἐσμέν", "2pl":"ἐστέ", "3pl":"εἰσί(ν)"}, impf:{"1sg":"ἤμην", "2sg":"ἦς", "3sg":"ἦν", "1pl":"ἦμεν", "2pl":"ἦτε", "3pl":"ἦσαν"}, fut:{"1sg":"ἔσομαι", "2sg":"ἔσῃ", "3sg":"ἔσται", "1pl":"ἐσόμεθα", "2pl":"ἔσεσθε", "3pl":"ἔσονται"} }, varianter:{ impf:{"1sg":["ἦν"], "2sg":["ἦσθα"], "1pl":["ἤμεθα"]} } },
  { lemma:"αἰτέω", glosa:"be om", klass:"kontrakt_e", kortlekar:["sem5", "sem6"], sem:[5, 6], former:{ pres:{"1sg":"αἰτῶ", "2sg":"αἰτεῖς", "3sg":"αἰτεῖ", "1pl":"αἰτοῦμεν", "2pl":"αἰτεῖτε", "3pl":"αἰτοῦσι(ν)"}, fut:{"1sg":"αἰτήσω", "2sg":"αἰτήσεις", "3sg":"αἰτήσει", "1pl":"αἰτήσομεν", "2pl":"αἰτήσετε", "3pl":"αἰτήσουσι(ν)"} } },
  { lemma:"θεραπεύω", glosa:"hela, bota", klass:"omega", kortlekar:["sem5", "sem6"], sem:[5, 6], former:{ pres:{"1sg":"θεραπεύω", "2sg":"θεραπεύεις", "3sg":"θεραπεύει", "1pl":"θεραπεύομεν", "2pl":"θεραπεύετε", "3pl":"θεραπεύουσι(ν)"}, fut:{"1sg":"θεραπεύσω", "2sg":"θεραπεύσεις", "3sg":"θεραπεύσει", "1pl":"θεραπεύσομεν", "2pl":"θεραπεύσετε", "3pl":"θεραπεύσουσι(ν)"} } },
  { lemma:"ἁμαρτάνω", glosa:"synda", klass:"omega", kortlekar:["sem5"], sem:[5], former:{ pres:{"1sg":"ἁμαρτάνω", "2sg":"ἁμαρτάνεις", "3sg":"ἁμαρτάνει", "1pl":"ἁμαρτάνομεν", "2pl":"ἁμαρτάνετε", "3pl":"ἁμαρτάνουσι(ν)"} } },
  { lemma:"λατρεύω", glosa:"tjäna (med dativ)", klass:"omega", kortlekar:["sem6"], sem:[6], former:{ pres:{"1sg":"λατρεύω", "2sg":"λατρεύεις", "3sg":"λατρεύει", "1pl":"λατρεύομεν", "2pl":"λατρεύετε", "3pl":"λατρεύουσι(ν)"}, fut:{"1sg":"λατρεύσω", "2sg":"λατρεύσεις", "3sg":"λατρεύσει", "1pl":"λατρεύσομεν", "2pl":"λατρεύσετε", "3pl":"λατρεύσουσι(ν)"} } },
  { lemma:"προσκυνέω", glosa:"tillbedja", klass:"kontrakt_e", kortlekar:["sem6"], sem:[6], former:{ pres:{"1sg":"προσκυνῶ", "2sg":"προσκυνεῖς", "3sg":"προσκυνεῖ", "1pl":"προσκυνοῦμεν", "2pl":"προσκυνεῖτε", "3pl":"προσκυνοῦσι(ν)"}, fut:{"1sg":"προσκυνήσω", "2sg":"προσκυνήσεις", "3sg":"προσκυνήσει", "1pl":"προσκυνήσομεν", "2pl":"προσκυνήσετε", "3pl":"προσκυνήσουσι(ν)"} } }
];

/* Tempus: nyckel → svensk etikett (standard: presens). */
const TEMPUS = { pres:"presens", impf:"imperfekt", fut:"futurum" };
const TEMPUS_ORDNING = ["pres","impf","fut"];

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

/* Seminarie-axel: varje verb bär sem:[…] ur verb.json. Skalar till fler
   seminarier — chipsen radbryts. */
const SEMINARIER = [...new Set(verb.flatMap(v => v.sem))].sort((a,b) => a - b);
const semNamn = s => "Sem " + s;

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
/* Picker (.picker/.picker-toggle/.chip/.toggle m.fl.) stylas nu av den delade
   komponenten i app.css — inga vy-lokala regler här. */
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
  <button class="picker-toggle" id="picker-toggle" aria-expanded="false"><span>Anpassa övningen <span class="count" id="verb-count"></span></span><span>▾</span></button>
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
      <h2>Tempus</h2>
      <div class="grid" id="grid-tempus"></div>
    </div>
    <div>
      <h2>Verb</h2>
      <div class="quickrow">
        <span class="quicklabel">Klass:</span>
        <button class="chip" data-lek="alla">alla</button>
        <button class="chip" data-lek="sem2">ω-verb</button>
        <button class="chip" data-lek="sem4">kontraherade</button>
        <button class="chip" data-lek="eimi">εἰμί</button>
      </div>
      <div class="grid" id="grid-verb"></div>
    </div>
    <div>
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
    valdaSem: new Set(SEMINARIER),
    valdaPN: new Set(PN_ORDNING),
    streak: 0, best: 0, card: null, besvarad: false, valt: null, forra: null,
  };

  const $ = id => document.getElementById(id);
  const pick = a => a[Math.floor(Math.random()*a.length)];
  const shuffle = a => { a=a.slice(); for(let i=a.length-1;i>0;i--){ const j=Math.floor(Math.random()*(i+1)); [a[i],a[j]]=[a[j],a[i]]; } return a; };
  const harTempus  = v => state.tempus==="alla" ? Object.keys(v.former).some(t=>TEMPUS[t]) : !!v.former[state.tempus];
  const tempusFor  = v => state.tempus!=="alla" ? state.tempus : pick(Object.keys(v.former).filter(t=>TEMPUS[t]));
  const semMatch    = o => o.sem.some(s => state.valdaSem.has(s));
  // Seminarie-urvalet styr vilka verb som visas i rutnätet; verbrutnätet finjusterar.
  const synligaVerb = () => { const v = verb.filter(semMatch); return v.length ? v : verb; };
  const aktivaVerb  = () => {
    const v = synligaVerb().filter(o => state.valdaVerb.has(o.lemma) && harTempus(o));
    if(v.length) return v;
    const bs = synligaVerb().filter(harTempus);
    return bs.length ? bs : verb.filter(harTempus);
  };
  const aktivaPN   = () => { const p = PN_ORDNING.filter(k => state.valdaPN.has(k)); return p.length ? p : PN_ORDNING; };
  const setEq = (a, b) => a.size === b.size && [...a].every(x => b.has(x));
  const PN_GRUPPER = { all:PN_ORDNING, sg:["1sg","2sg","3sg"], pl:["1pl","2pl","3pl"] };

  function spara(){ try{ localStorage.setItem(LAGER, JSON.stringify({
    mode:state.mode, tempus:state.tempus, valdaVerb:[...state.valdaVerb], valdaSem:[...state.valdaSem], valdaPN:[...state.valdaPN], best:state.best })); }catch(e){} }
  function ladda(){ try{ const r = JSON.parse(localStorage.getItem(LAGER)); if(!r) return;
    if(r.mode) state.mode = r.mode;
    if(r.tempus && (TEMPUS[r.tempus] || r.tempus==="alla")) state.tempus = r.tempus;
    if(Array.isArray(r.valdaVerb)) state.valdaVerb = new Set(r.valdaVerb.filter(l => verb.some(v=>v.lemma===l)));
    if(Array.isArray(r.valdaSem))  state.valdaSem  = new Set(r.valdaSem.filter(s => SEMINARIER.includes(s)));
    if(Array.isArray(r.valdaPN))   state.valdaPN   = new Set(r.valdaPN.filter(k => PN_ORDNING.includes(k)));
    if(!state.valdaSem.size) state.valdaSem = new Set(SEMINARIER);
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

  function uppdateraAntal(){ const el = $("verb-count"); if(el) el.textContent = "(" + aktivaVerb().length + " verb)"; }
  function newQuestion(){
    uppdateraAntal();
    const vs = aktivaVerb(), ps = aktivaPN();
    let v, k, t, sig, n=0;
    do { v = pick(vs); k = pick(ps); t = tempusFor(v); sig = v.lemma+"|"+k+"|"+t; } while(sig === state.forra && ++n < 30);
    state.forra = sig;
    const rätta = new Set(accepterade(v, t, k));
    state.card = {
      lemma: v.lemma, glosa: v.glosa, pn: k, tempus: t,
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
    const tp = state.tempus==="alla" ? "<b>" + TEMPUS[c.tempus] + "</b> · " : "";
    $("target").innerHTML = "→ " + tp + "<b>" + PN[c.pn].namn + "</b> (" + PN[c.pn].pron + ")";
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
    let label = c.lemma + (state.tempus==="alla" ? " · " + TEMPUS[c.tempus] : "") + " · " + PN[c.pn].namn;
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
    [...TEMPUS_ORDNING, "alla"].forEach(t => {
      const b = document.createElement("button");
      b.className="toggle"; b.textContent = t==="alla" ? "alla" : TEMPUS[t];
      b.setAttribute("aria-pressed", state.tempus===t);
      b.onclick = () => { state.tempus=t; byggGridTempus(); byggGridVerb(); uppdateraSub(); spara(); newQuestion(); };
      g.appendChild(b);
    });
  }
  function byggGridVerb(){
    const g = $("grid-verb"); g.innerHTML = "";
    synligaVerb().forEach(v => {                       // visar bara verb i valda seminarier
      const b = document.createElement("button");
      b.className="toggle"; b.textContent=v.lemma;
      const finns = harTempus(v);
      b.disabled = !finns;
      if(!finns) b.setAttribute("aria-label", v.lemma + " (saknar " + TEMPUS[state.tempus] + ")");
      b.setAttribute("aria-pressed", finns && state.valdaVerb.has(v.lemma));
      b.onclick = () => { state.valdaVerb.has(v.lemma)?state.valdaVerb.delete(v.lemma):state.valdaVerb.add(v.lemma);
        b.setAttribute("aria-pressed", state.valdaVerb.has(v.lemma)); uppdateraVerbChips(); spara(); newQuestion(); };
      g.appendChild(b);
    });
    uppdateraVerbChips();
  }
  function byggGridSem(){
    const g = $("grid-sem"); g.innerHTML = "";
    SEMINARIER.forEach(s => {
      const b = document.createElement("button");
      b.className="toggle"; b.textContent=semNamn(s);
      b.setAttribute("aria-pressed", state.valdaSem.has(s));
      b.onclick = () => { state.valdaSem.has(s)?state.valdaSem.delete(s):state.valdaSem.add(s);
        b.setAttribute("aria-pressed", state.valdaSem.has(s)); byggGridVerb(); spara(); newQuestion(); };
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
        b.setAttribute("aria-pressed", state.valdaPN.has(k)); uppdateraPNChips(); spara(); newQuestion(); };
      g.appendChild(b);
    });
    uppdateraPNChips();
  }
  function uppdateraLäge(){ $("mode-vand").setAttribute("aria-pressed", state.mode==="vand");
    $("mode-flerval").setAttribute("aria-pressed", state.mode==="flerval"); }
  function uppdateraSub(){ $("sub").textContent = state.tempus==="alla"
    ? "Uppslagsform + tempus, person och numerus. Ge den rätta formen."
    : "Uppslagsform + person och numerus. Ge den rätta " + TEMPUS[state.tempus] + "formen."; }
  // Guldram på den kvickvals-chip vars grupp exakt motsvarar nuvarande urval (annars ingen).
  function uppdateraVerbChips(){ document.querySelectorAll("[data-lek]").forEach(b =>
    b.setAttribute("aria-pressed", setEq(state.valdaVerb, new Set(LEKAR[b.dataset.lek] || [])))); }
  function uppdateraPNChips(){ document.querySelectorAll("[data-pn]").forEach(b =>
    b.setAttribute("aria-pressed", setEq(state.valdaPN, new Set(PN_GRUPPER[b.dataset.pn] || [])))); }

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
  document.querySelectorAll("[data-pn]").forEach(b => b.onclick = () => {
    state.valdaPN = new Set(PN_GRUPPER[b.dataset.pn] || PN_ORDNING); byggGridPN(); spara(); newQuestion(); });
  document.querySelector("[data-sem-all]").onclick  = () => { state.valdaSem = new Set(SEMINARIER); byggGridSem(); byggGridVerb(); spara(); newQuestion(); };
  document.querySelector("[data-sem-none]").onclick = () => { state.valdaSem = new Set(); byggGridSem(); byggGridVerb(); spara(); newQuestion(); };

  __vh = e => {
    if(e.code==="Space" && state.mode==="vand" && !state.besvarad){ e.preventDefault(); state.besvarad=true; render2(); }
    else if(e.key==="Enter" && state.besvarad && state.mode==="flerval"){ newQuestion(); }
    else if(state.mode==="flerval" && !state.besvarad && /^[1-4]$/.test(e.key)){
      const f = state.card.optioner[+e.key-1]; if(f) svara(f); }
  };
  document.addEventListener("keydown", __vh);

  ladda(); uppdateraLäge(); byggGridSem(); byggGridTempus(); byggGridVerb(); byggGridPN(); uppdateraSub(); newQuestion();
}
