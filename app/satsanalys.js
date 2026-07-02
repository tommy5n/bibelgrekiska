// Vy: Satsanalys — portad exakt från grekiska-satsanalys.html
let _added = [];
export function teardown(){
  for (const [tg,t,f,o] of _added){ try{ (tg==='w'?window:document).removeEventListener(t,f,o); }catch(e){} }
  _added = [];
}
const MARKUP = `<div class="vy vy-satsanalys">
<header>
  <h1>Grekiska — satsanalys</h1>
  <div class="sub">Ta ut satsdelarna. Kasus avslöjar rollen — inte ordföljden.</div>
</header>

<div class="modes" role="group" aria-label="Spelläge">
  <button class="mode" id="mode-guidat" aria-pressed="true">Guidat</button>
  <button class="mode" id="mode-fritt"  aria-pressed="false">Fritt</button>
</div>

<div class="stage">
  <div class="card">
    <div class="kalla" id="kalla"></div>

    <div class="sats" id="sats"></div>

    <!-- GUIDAT: stegfråga -->
    <div class="steg" id="steg"></div>

    <!-- FRITT: rollpalett -->
    <div class="palett hidden" id="palett"></div>

    <!-- facit -->
    <div class="reveal hidden" id="reveal">
      <div class="sv" id="r-sv"></div>
      <div class="not" id="r-not"></div>
    </div>
  </div>

  <div class="controls" id="controls">
    <!-- knappar injiceras per läge/läge-tillstånd -->
  </div>

  <div class="streak">
    Svit: <b id="streak">0</b> &nbsp;·&nbsp; bästa: <b id="best">0</b>
  </div>
</div>

<div class="picker">
  <button class="picker-toggle" id="picker-toggle" aria-expanded="false">
    <span>Anpassa övningen</span><span class="chev">▾</span>
  </button>
  <div class="picker-body hidden" id="picker-body">

    <div class="picker-section">
      <h2>Nivå</h2>
      <div class="quickrow">
        <button class="chip" data-niva-all>alla</button>
        <button class="chip" data-niva-core>kärna (1–3)</button>
        <button class="chip" data-niva-clear>rensa</button>
        <button class="chip" data-deck-sem2>Seminarium 2 (facit)</button>
        <button class="chip" data-deck-sem4>Seminarium 4 (εἰμί impf + adverbial)</button>
      </div>
      <div class="grid" id="grid-niva"></div>
    </div>

    <div class="picker-section">
      <h2>Källa</h2>
      <div class="seg" id="seg-kalla" role="group" aria-label="Källa">
        <button data-kalla="alla"   aria-pressed="true">alla</button>
        <button data-kalla="kurs"   aria-pressed="false">ur kursen</button>
        <button data-kalla="skapad" aria-pressed="false">skapade</button>
      </div>
    </div>

  </div>
</div>

<footer>
  Metoden går alltid uppifrån: först <b>predikatet</b> (verbhandlingen), sedan
  subjektet i nominativ, det direkta objektet i ackusativ, det indirekta i dativ.
  Inte alla satsdelar finns i varje sats — välj <code>Saknas</code> när en roll fattas
  (subjektet ligger då ofta i verbets ändelse). En prepositionsfras (<code>ἐν</code>, <code>εἰς</code>,
  <code>ἐκ/ἐξ</code> + substantiv) räknas som <b>ett</b> adverbial — en egen satsdel som svarar på
  var/när. Flaggan uppe i kortet visar om
  meningen är hämtad <code>ur kursen</code> eller <code>skapad</code> som extra övning.
</footer>
</div>`;
export function render(root){
  root.innerHTML = MARKUP;
  const _da = document.addEventListener.bind(document);
  const _wa = window.addEventListener.bind(window);
  _added = [];
  document.addEventListener = (t,f,o)=>{ _added.push(['d',t,f,o]); _da(t,f,o); };
  window.addEventListener   = (t,f,o)=>{ _added.push(['w',t,f,o]); _wa(t,f,o); };
  try {

/* ── ROLLER ───────────────────────────────────────────────────────────
   Predikatet är ingen kasusroll — det är verbet. De fem övriga rollerna
   svarar mot kasus: nom→subjekt, ack→direkt obj, dat→indirekt obj,
   gen→genitivattribut, vok→vokativ. Metodordningen styr stegen.        */
const ROLLER = {
  pred:{ namn:"predikatet",        etikett:"predikat",        klass:"r-pred",
         raknare:"verbet",      fraga:"Vilken är verbhandlingen?",            instr:"Klicka på predikatet." },
  subj:{ namn:"subjektet",         etikett:"subjekt",         klass:"r-subj", kasus:"nominativ",
         raknare:"nominativ",   fraga:"Vem eller vad utför handlingen?",       instr:"Klicka på subjektet, eller välj Saknas." },
  do:  { namn:"direkta objektet",  etikett:"direkt objekt",   klass:"r-do",   kasus:"ackusativ",
         raknare:"ackusativ",   fraga:"Vem eller vad påverkas direkt?",        instr:"Klicka på det direkta objektet, eller välj Saknas." },
  io:  { namn:"indirekta objektet",etikett:"indirekt objekt", klass:"r-io",   kasus:"dativ",
         raknare:"dativ",       fraga:"Till, åt eller för vem utförs handlingen?", instr:"Klicka på det indirekta objektet." },
  gen: { namn:"genitivattributet", etikett:"genitivattribut", klass:"r-gen",  kasus:"genitiv",
         raknare:"genitiv",     fraga:"Till vem hör någon eller något?",       instr:"Klicka på genitivattributet." },
  vok: { namn:"vokativen",         etikett:"vokativ",         klass:"r-vok",  kasus:"vokativ",
         raknare:"vokativ",     fraga:"Vem tilltalas?",                        instr:"Klicka på vokativen." },
  pf:  { namn:"predikatsfyllnaden",etikett:"predikatsfyllnad", klass:"r-pf",   kasus:"nominativ",
         raknare:"nominativ",   fraga:"Vad sägs om subjektet?",                instr:"Klicka på predikatsfyllnaden." },
  adv: { namn:"adverbialet",       etikett:"adverbial",        klass:"r-adv",
         raknare:"rum/tid",     fraga:"Var eller när äger handlingen rum?",    instr:"Klicka på adverbialet (prepositionsfrasen)." },
};
const ROLL_ORDNING = ["pred","subj","do","io","adv","pf","gen","vok"];

const NIVAER = {
  1:"S-V-O (rak ordföljd)", 2:"Fri ordföljd", 3:"Subjekt i ändelsen",
  4:"Indirekt objekt", 5:"Genitivattribut", 6:"Vokativ",
  7:"Predikatsfyllnad (εἰμί)", 8:"εἰμί i imperfekt (var)",
  9:"Adverbial (prepositionsfras)",
};

/* ── MENINGSBANK ──────────────────────────────────────────────────────
   Varje sats: ordnad lista av chunks (artikel+substantiv hålls ihop,
   genitivattribut är en egen chunk enligt presentationens analys).
   Subjekt i ändelsen markeras subjI: <person> (ingen subj-chunk finns).
   kalla:"kurs" + ref = exakt ur kursmaterialet (facit verifierat).
   kalla:"skapad" = jag har konstruerat den; former kollade mot ord.json.
   Accenter återges som i källan (grav före nästa ord, akut sist).        */
const SATSER = [

  /* ══ UR KURSMATERIALET ══════════════════════════════════════════ */

  // Breakout rooms (facit, presentationen s.57)
  { id:"k01", niva:1, kalla:"kurs", ref:"Breakout 2:1", sv:"Människan ser huset.", chunks:[
      {t:"ὁ ἄνθρωπος",roll:"subj"},{t:"βλέπει",roll:"pred"},{t:"τὸν οἶκον",roll:"do"} ]},
  { id:"k02", niva:2, kalla:"kurs", ref:"Breakout 2:2", sv:"Gud ser människan.", chunks:[
      {t:"τὸν ἄνθρωπον",roll:"do"},{t:"βλέπει",roll:"pred"},{t:"ὁ θεός",roll:"subj"} ]},
  { id:"k03", niva:2, kalla:"kurs", ref:"Breakout 2:3", sv:"Slavarna skriver ett ord.", chunks:[
      {t:"γράφουσι",roll:"pred"},{t:"λόγον",roll:"do"},{t:"οἱ δοῦλοι",roll:"subj"} ]},
  { id:"k04", niva:4, kalla:"kurs", ref:"Breakout 2:4", sv:"Aposteln skriver ordet till bröderna.", chunks:[
      {t:"ὁ ἀπόστολος",roll:"subj"},{t:"γράφει",roll:"pred"},{t:"τὸν λόγον",roll:"do"},{t:"τοῖς ἀδελφοῖς",roll:"io"} ]},

  // Övningsblad b)
  { id:"k05", niva:3, kalla:"kurs", ref:"Övningsblad b:1", sv:"Ni ser himlen.", subjI:"ni", chunks:[
      {t:"τὸν οὐρανὸν",roll:"do"},{t:"βλέπετε",roll:"pred"} ]},
  { id:"k06", niva:3, kalla:"kurs", ref:"Övningsblad b:2", sv:"Han/hon hör en berättelse.", subjI:"han/hon/det", chunks:[
      {t:"ἀκούει",roll:"pred"},{t:"λόγον",roll:"do"} ]},
  { id:"k07", niva:5, kalla:"kurs", ref:"Övningsblad b:3", sv:"Slavarna griper herrens frukt.", chunks:[
      {t:"οἱ δοῦλοι",roll:"subj"},{t:"λαμβάνουσι",roll:"pred"},{t:"τὸν καρπὸν",roll:"do"},{t:"τοῦ κυρίου",roll:"gen"} ]},
  { id:"k08", niva:5, kalla:"kurs", ref:"Övningsblad b:4", sv:"Folket hör apostelns ord.", chunks:[
      {t:"ἀκούει",roll:"pred"},{t:"ὁ λαὸς",roll:"subj"},{t:"τοὺς λόγους",roll:"do"},{t:"τοῦ ἀποστόλου",roll:"gen"} ]},
  { id:"k09", niva:4, kalla:"kurs", ref:"Övningsblad b:5", sv:"Han skickar slavarna till brodern.", subjI:"han/hon/det", chunks:[
      {t:"πέμπει",roll:"pred"},{t:"τοὺς δούλους",roll:"do"},{t:"τῷ ἀδελφῷ",roll:"io"} ]},
  { id:"k10", niva:5, kalla:"kurs", ref:"Övningsblad b:6", sv:"Herrarna hör slavens berättelse.", chunks:[
      {t:"ἀκούουσιν",roll:"pred"},{t:"οἱ κύριοι",roll:"subj"},{t:"τὸν λόγον",roll:"do"},{t:"τοῦ δούλου",roll:"gen"} ]},

  // Presentationen — genomgångna exempel
  { id:"k11", niva:1, kalla:"kurs", ref:"Presentation s.36", sv:"Människan ser ängeln.", chunks:[
      {t:"ὁ ἄνθρωπος",roll:"subj"},{t:"βλέπει",roll:"pred"},{t:"τὸν ἄγγελον",roll:"do"} ]},
  { id:"k12", niva:4, kalla:"kurs", ref:"Presentation s.44", sv:"Aposteln skriver en berättelse för människorna.", chunks:[
      {t:"ὁ ἀπόστολος",roll:"subj"},{t:"γράφει",roll:"pred"},{t:"λόγον",roll:"do"},{t:"τοῖς ἀνθρώποις",roll:"io"} ]},
  { id:"k13", niva:5, kalla:"kurs", ref:"Presentation s.47", sv:"Jag ser apostelns hus.", subjI:"jag", chunks:[
      {t:"βλέπω",roll:"pred"},{t:"τὸν οἶκον",roll:"do"},{t:"τοῦ ἀποστόλου",roll:"gen"} ]},
  { id:"k14", niva:6, kalla:"kurs", ref:"Presentation s.50", sv:"Du, o ängel, ser apostelns hus.", subjI:"du", chunks:[
      {t:"ὦ ἄγγελε",roll:"vok"},{t:"βλέπεις",roll:"pred"},{t:"τὸν οἶκον",roll:"do"},{t:"τοῦ ἀποστόλου",roll:"gen"} ]},
  { id:"k15", niva:1, kalla:"kurs", ref:"Presentation s.54", sv:"Människorna ser himlen.", chunks:[
      {t:"οἱ ἄνθρωποι",roll:"subj"},{t:"βλέπουσι",roll:"pred"},{t:"τὸν οὐρανόν",roll:"do"} ]},
  { id:"k16", niva:1, kalla:"kurs", ref:"Presentation s.54", sv:"Brodern skriver en berättelse.", chunks:[
      {t:"ὁ ἀδελφὸς",roll:"subj"},{t:"γράφει",roll:"pred"},{t:"λόγον",roll:"do"} ]},

  // ── Seminarium 3 ────────────────────────────────────────────────
  // Breakout 1 (facit, presentation s.7)
  { id:"k17", niva:2, kalla:"kurs", ref:"Breakout 1:2", sv:"Änglarna räddar bröderna.", chunks:[
      {t:"σῴζουσιν",roll:"pred"},{t:"οἱ ἄγγελοι",roll:"subj"},{t:"τοὺς ἀδελφούς",roll:"do"} ]},
  { id:"k18", niva:4, kalla:"kurs", ref:"Breakout 1:3", sv:"Slaven talar till aposteln.", chunks:[
      {t:"ὁ δοῦλος",roll:"subj"},{t:"τῷ ἀποστόλῳ",roll:"io"},{t:"λέγει",roll:"pred"} ]},
  { id:"k19", niva:5, kalla:"kurs", ref:"Breakout 1:4", sv:"Ni skriver brödernas ord till slavarna.", subjI:"ni", chunks:[
      {t:"γράφετε",roll:"pred"},{t:"τοῖς δούλοις",roll:"io"},{t:"τοὺς λόγους",roll:"do"},{t:"τῶν ἀδελφῶν",roll:"gen"} ]},

  // Breakout 2 (facit, presentation s.21) — neutrala substantiv
  { id:"k20", niva:5, kalla:"kurs", ref:"Breakout 2:1", sv:"Vi ser Guds tecken.", subjI:"vi", chunks:[
      {t:"βλέπομεν",roll:"pred"},{t:"τὸ σημεῖον",roll:"do"},{t:"τοῦ θεοῦ",roll:"gen"} ]},
  { id:"k21", niva:2, kalla:"kurs", ref:"Breakout 2:2", sv:"Slavarna skickar båtarna.", chunks:[
      {t:"πέμπουσιν",roll:"pred"},{t:"οἱ δοῦλοι",roll:"subj"},{t:"τὰ πλοῖα",roll:"do"} ]},
  { id:"k22", niva:1, kalla:"kurs", ref:"Breakout 2:3", sv:"Bröderna finner evangelierna.", chunks:[
      {t:"οἱ ἀδελφοὶ",roll:"subj"},{t:"εὑρίσκουσι",roll:"pred"},{t:"τὰ εὐαγγέλια",roll:"do"} ]},
  { id:"k23", niva:6, kalla:"kurs", ref:"Breakout 2:4", sv:"Du, o ängel, skriver evangeliets ord till barnen.", subjI:"du", chunks:[
      {t:"ὦ ἄγγελε",roll:"vok"},{t:"γράφεις",roll:"pred"},{t:"τοὺς λόγους",roll:"do"},{t:"τοῦ εὐαγγελίου",roll:"gen"},{t:"τοῖς τέκνοις",roll:"io"} ]},

  // Övningsbladet (facit) — adjektivattribut + neutrum
  { id:"k24", niva:1, kalla:"kurs", ref:"Övningsblad 1", sv:"Den vackre brodern talar.", chunks:[
      {t:"ὁ καλὸς ἀδελφὸς",roll:"subj"},{t:"λέγει",roll:"pred"} ]},
  { id:"k25", niva:1, kalla:"kurs", ref:"Övningsblad 2", sv:"De trogna apostlarna predikar det heliga evangeliet.", chunks:[
      {t:"οἱ πιστοὶ ἀπόστολοι",roll:"subj"},{t:"κηρύσσουσι",roll:"pred"},{t:"τὸ ἅγιον εὐαγγέλιον",roll:"do"} ]},
  { id:"k26", niva:2, kalla:"kurs", ref:"Övningsblad 3", sv:"Ni döper de små barnen.", subjI:"ni", chunks:[
      {t:"τὰ μικρὰ τέκνα",roll:"do"},{t:"βαπτίζετε",roll:"pred"} ]},
  { id:"k27", niva:3, kalla:"kurs", ref:"Övningsblad 4", sv:"Vi äter det goda brödet.", subjI:"vi", chunks:[
      {t:"ἐσθίομεν",roll:"pred"},{t:"τὸν ἀγαθὸν ἄρτον",roll:"do"} ]},
  { id:"k28", niva:4, kalla:"kurs", ref:"Övningsblad 5", sv:"Gud skickar sonen till människorna.", chunks:[
      {t:"τὸν υἱὸν",roll:"do"},{t:"ὁ θεὸς",roll:"subj"},{t:"πέμπει",roll:"pred"},{t:"τοῖς ἀνθρώποις",roll:"io"} ]},
  { id:"k29", niva:1, kalla:"kurs", ref:"Övningsblad 6", sv:"De onda människorna lyssnar till det vackra evangeliet.", chunks:[
      {t:"οἱ πονηροὶ ἄνθρωποι",roll:"subj"},{t:"ἀκούουσι",roll:"pred"},{t:"τὸ καλὸν εὐαγγέλιον",roll:"do"} ]},
  { id:"k30", niva:4, kalla:"kurs", ref:"Övningsblad 7", sv:"De tror på Gud.", subjI:"de", chunks:[
      {t:"τῷ θεῷ",roll:"io"},{t:"πιστεύουσιν",roll:"pred"} ]},

  // εἰμί — predikatsfyllnad (facit, presentation s.41–42)
  { id:"k31", niva:7, kalla:"kurs", ref:"Presentation s.41", sv:"Människan är ond.", chunks:[
      {t:"ὁ ἄνθρωπός",roll:"subj"},{t:"ἐστι",roll:"pred"},{t:"πονηρός",roll:"pf"} ]},
  { id:"k32", niva:7, kalla:"kurs", ref:"Presentation s.41", sv:"Evangeliet är vackert.", chunks:[
      {t:"τὸ εὐαγγέλιόν",roll:"subj"},{t:"ἐστι",roll:"pred"},{t:"καλόν",roll:"pf"} ]},
  { id:"k33", niva:7, kalla:"kurs", ref:"Presentation s.41", sv:"Människorna är vackra.", chunks:[
      {t:"οἱ ἄνθρωποί",roll:"subj"},{t:"εἰσι",roll:"pred"},{t:"καλοί",roll:"pf"} ]},
  { id:"k34", niva:7, kalla:"kurs", ref:"Presentation s.42", sv:"Jesus är Guds son.", chunks:[
      {t:"ὁ Ἰησοῦς",roll:"subj"},{t:"ἐστιν",roll:"pred"},{t:"ὁ υἱὸς",roll:"pf"},{t:"τοῦ θεοῦ",roll:"gen"} ]},
  { id:"k35", niva:7, kalla:"kurs", ref:"Presentation s.41 (överkurs)", sv:"Evangelierna är vackra.", chunks:[
      {t:"τὰ εὐαγγέλιά",roll:"subj"},{t:"ἐστι",roll:"pred"},{t:"καλά",roll:"pf"} ]},

  /* ══ SKAPADE ÖVNINGAR (former kollade mot ord.json — verifiera gärna) ══ */

  // Nivå 1
  { id:"s01", niva:1, kalla:"skapad", ref:"konstruerad", sv:"Herren ser slaven.", chunks:[
      {t:"ὁ κύριος",roll:"subj"},{t:"βλέπει",roll:"pred"},{t:"τὸν δοῦλον",roll:"do"} ]},
  { id:"s02", niva:1, kalla:"skapad", ref:"konstruerad", sv:"Sonen tar brödet.", chunks:[
      {t:"ὁ υἱὸς",roll:"subj"},{t:"λαμβάνει",roll:"pred"},{t:"τὸν ἄρτον",roll:"do"} ]},
  { id:"s03", niva:1, kalla:"skapad", ref:"konstruerad (utan objekt)", sv:"Aposteln skriver.", chunks:[
      {t:"ὁ ἀπόστολος",roll:"subj"},{t:"γράφει",roll:"pred"} ]},

  // Nivå 2
  { id:"s04", niva:2, kalla:"skapad", ref:"konstruerad", sv:"Människan ser ängeln.", chunks:[
      {t:"τὸν ἄγγελον",roll:"do"},{t:"βλέπει",roll:"pred"},{t:"ὁ ἄνθρωπος",roll:"subj"} ]},
  { id:"s05", niva:2, kalla:"skapad", ref:"konstruerad", sv:"Slavarna tar frukten.", chunks:[
      {t:"λαμβάνουσι",roll:"pred"},{t:"τὸν καρπὸν",roll:"do"},{t:"οἱ δοῦλοι",roll:"subj"} ]},

  // Nivå 3
  { id:"s06", niva:3, kalla:"skapad", ref:"konstruerad", sv:"Vi ser himlen.", subjI:"vi", chunks:[
      {t:"βλέπομεν",roll:"pred"},{t:"τὸν οὐρανόν",roll:"do"} ]},
  { id:"s07", niva:3, kalla:"skapad", ref:"konstruerad", sv:"Han skriver orden.", subjI:"han/hon/det", chunks:[
      {t:"γράφει",roll:"pred"},{t:"τοὺς λόγους",roll:"do"} ]},

  // Nivå 4
  { id:"s08", niva:4, kalla:"skapad", ref:"konstruerad", sv:"Herren skickar ängeln till folket.", chunks:[
      {t:"ὁ κύριος",roll:"subj"},{t:"πέμπει",roll:"pred"},{t:"τὸν ἄγγελον",roll:"do"},{t:"τῷ λαῷ",roll:"io"} ]},
  { id:"s09", niva:4, kalla:"skapad", ref:"konstruerad", sv:"Vi skriver en berättelse till bröderna.", subjI:"vi", chunks:[
      {t:"γράφομεν",roll:"pred"},{t:"λόγον",roll:"do"},{t:"τοῖς ἀδελφοῖς",roll:"io"} ]},

  // Nivå 5
  { id:"s10", niva:5, kalla:"skapad", ref:"konstruerad", sv:"Vi ser Guds hus.", subjI:"vi", chunks:[
      {t:"βλέπομεν",roll:"pred"},{t:"τὸν οἶκον",roll:"do"},{t:"τοῦ θεοῦ",roll:"gen"} ]},
  { id:"s11", niva:5, kalla:"skapad", ref:"konstruerad (gen. på subjektet)", sv:"Herrens slav tar brödet.", chunks:[
      {t:"ὁ δοῦλος",roll:"subj"},{t:"τοῦ κυρίου",roll:"gen"},{t:"λαμβάνει",roll:"pred"},{t:"τὸν ἄρτον",roll:"do"} ]},

  // Nivå 6
  { id:"s12", niva:6, kalla:"skapad", ref:"konstruerad", sv:"Du, o slav, ser herren.", subjI:"du", chunks:[
      {t:"ὦ δοῦλε",roll:"vok"},{t:"βλέπεις",roll:"pred"},{t:"τὸν κύριον",roll:"do"} ]},
  { id:"s13", niva:6, kalla:"skapad", ref:"konstruerad", sv:"Du, o människa, hör Guds ord.", subjI:"du", chunks:[
      {t:"ὦ ἄνθρωπε",roll:"vok"},{t:"ἀκούεις",roll:"pred"},{t:"τὸν λόγον",roll:"do"},{t:"τοῦ θεοῦ",roll:"gen"} ]},

  // ══ SEMINARIUM 4 ════════════════════════════════════════════════════

  // εἰμί i imperfekt — predikatsfyllnad (facit). impf:true → facit-not om ἦν/ἦσαν.
  { id:"e01", niva:8, kalla:"kurs", ref:"Presentation s.14", impf:true, sv:"Jesus var Guds son.", chunks:[
      {t:"ὁ Ἰησοῦς",roll:"subj"},{t:"ἦν",roll:"pred"},{t:"ὁ υἱὸς",roll:"pf"},{t:"τοῦ θεοῦ",roll:"gen"} ]},
  { id:"e02", niva:8, kalla:"kurs", ref:"Presentation s.14", impf:true, sv:"Barnen var slavar.", chunks:[
      {t:"τὰ τέκνα",roll:"subj"},{t:"ἦσαν",roll:"pred"},{t:"δοῦλοι",roll:"pf"} ]},
  { id:"e03", niva:8, kalla:"kurs", ref:"Presentation s.17", impf:true, sv:"Bröderna var goda.", chunks:[
      {t:"οἱ ἀδελφοὶ",roll:"subj"},{t:"ἦσαν",roll:"pred"},{t:"ἀγαθοί",roll:"pf"} ]},
  { id:"e04", niva:8, kalla:"kurs", ref:"Presentation s.17", impf:true, sv:"Verket var vackert.", chunks:[
      {t:"τὸ ἔργον",roll:"subj"},{t:"ἦν",roll:"pred"},{t:"καλόν",roll:"pf"} ]},
  { id:"e05", niva:8, kalla:"kurs", ref:"Presentation s.17", impf:true, sv:"Verken var vackra.", chunks:[
      {t:"τὰ ἔργα",roll:"subj"},{t:"ἦν",roll:"pred"},{t:"καλά",roll:"pf"} ]},

  // Adverbial — prepositionsfras som en enhet (facit)
  { id:"a01", niva:9, kalla:"kurs", ref:"Presentation s.44", sv:"I huset skriver aposteln.", chunks:[
      {t:"ἐν τῷ οἴκῳ",roll:"adv"},{t:"ὁ ἀπόστολος",roll:"subj"},{t:"γράφει",roll:"pred"} ]},
  { id:"a02", niva:9, kalla:"kurs", ref:"Övningsblad 8", sv:"Bröderna leder barnen till huset.", chunks:[
      {t:"οἱ ἀδελφοὶ",roll:"subj"},{t:"ἄγουσι",roll:"pred"},{t:"τὰ τέκνα",roll:"do"},{t:"εἰς τὸν οἶκον",roll:"adv"} ]},
  { id:"a03", niva:9, kalla:"kurs", ref:"Övningsblad 7", sv:"Vi söker husbondens slavar på fältet.", subjI:"vi", chunks:[
      {t:"ζητοῦμεν",roll:"pred"},{t:"ἐν τῷ ἀγρῷ",roll:"adv"},{t:"τοὺς δούλους",roll:"do"},{t:"τοῦ κυρίου",roll:"gen"} ]},

  // Adverbial — konstruerade (en preposition var: εἰς+ack, ἐν+dat, ἐκ+gen)
  { id:"a04", niva:9, kalla:"skapad", ref:"konstruerad (εἰς + ack.)", sv:"Herren skickar slaven till huset.", chunks:[
      {t:"ὁ κύριος",roll:"subj"},{t:"πέμπει",roll:"pred"},{t:"τὸν δοῦλον",roll:"do"},{t:"εἰς τὸν οἶκον",roll:"adv"} ]},
  { id:"a05", niva:9, kalla:"skapad", ref:"konstruerad (ἐν + dat.)", sv:"I huset skriver vi orden.", subjI:"vi", chunks:[
      {t:"ἐν τῷ οἴκῳ",roll:"adv"},{t:"γράφομεν",roll:"pred"},{t:"τοὺς λόγους",roll:"do"} ]},
  { id:"a06", niva:9, kalla:"skapad", ref:"konstruerad (ἐκ + gen.)", sv:"Aposteln leder barnen ut ur huset.", chunks:[
      {t:"ὁ ἀπόστολος",roll:"subj"},{t:"ἄγει",roll:"pred"},{t:"τὰ τέκνα",roll:"do"},{t:"ἐκ τοῦ οἴκου",roll:"adv"} ]},

  // Feminina substantiv av första deklinationen (facit) — bonus, sprider sig över nivåerna
  { id:"f01", niva:2, kalla:"kurs", ref:"Breakout 3:5", sv:"Kärleken räddar själen.", chunks:[
      {t:"ἡ ἀγάπη",roll:"subj"},{t:"τὴν ψυχήν",roll:"do"},{t:"σῴζει",roll:"pred"} ]},
  { id:"f02", niva:5, kalla:"kurs", ref:"Övningsblad 9", sv:"Systrarna söker Guds rike.", chunks:[
      {t:"ζητοῦσιν",roll:"pred"},{t:"αἱ ἀδελφαὶ",roll:"subj"},{t:"τὴν βασιλείαν",roll:"do"},{t:"τοῦ θεοῦ",roll:"gen"} ]},
  { id:"f03", niva:6, kalla:"kurs", ref:"Övningsblad 3", sv:"Du, o broder, tror på änglarnas vackra bud.", subjI:"du", chunks:[
      {t:"ὦ ἀδελφέ",roll:"vok"},{t:"πιστεύεις",roll:"pred"},{t:"ταῖς καλαῖς ἐντολαῖς",roll:"io"},{t:"τῶν ἀγγέλων",roll:"gen"} ]},
  { id:"f04", niva:1, kalla:"kurs", ref:"Övningsblad 2", sv:"Jesus gör sköna under.", chunks:[
      {t:"ὁ Ἰησοῦς",roll:"subj"},{t:"ποιεῖ",roll:"pred"},{t:"καλὰ σημεῖα",roll:"do"} ]},
  { id:"f05", niva:5, kalla:"kurs", ref:"Övningsblad 6", sv:"Änglarna talar Guds ord.", chunks:[
      {t:"λαλοῦσιν",roll:"pred"},{t:"οἱ ἄγγελοι",roll:"subj"},{t:"τοὺς λόγους",roll:"do"},{t:"τοῦ θεοῦ",roll:"gen"} ]},
];

/* ── TILLSTÅND ───────────────────────────────────────────────────────── */
const LAGER = "grekiska-satsanalys";
const state = {
  mode: "guidat",                         // "guidat" | "fritt"
  valdaNivaer: new Set(Object.keys(NIVAER).map(Number)),
  kalla: "alla",                          // "alla" | "kurs" | "skapad"
  streak: 0, best: 0,
  sats: null,                             // upplöst EN gång i newQuestion()
  // guidat:
  steg: [], stegIdx: 0,
  // fritt:
  armadRoll: null,
  tilldelad: {},                          // chunkIndex -> roll
  smutsig: false,                         // felklick i denna sats?
  klar: false,                            // satsen avklarad?
  forra: null,                            // id, undvik upprepning
};

/* ── HJÄLPARE ────────────────────────────────────────────────────────── */
const $ = id => document.getElementById(id);
function pick(arr){ return arr[Math.floor(Math.random()*arr.length)]; }

function aktivaSatser(){
  let p = SATSER.filter(s => state.valdaNivaer.has(s.niva));
  if(!p.length) p = SATSER.slice();                       // tom nivå = alla
  if(state.kalla !== "alla") p = p.filter(s => s.kalla === state.kalla);
  return p.length ? p : SATSER.slice();                   // aldrig tomt
}
function harRoll(s, roll){ return s.chunks.some(c => c.roll === roll); }

/* Guidat: vilka steg ska gås igenom, i metodordning.
   pred/subj/do alltid (subj/do kan besvaras med Saknas → lär ut frånvaro).
   io/gen/vok bara när de finns (deras närvaro är poängen).               */
function byggSteg(s){
  if(harRoll(s,"pf")){                          // kopulativ sats (εἰμί): inget objekt
    const steg = ["pred","subj","pf"];          // metodordning: pred → subj → predikatsfyllnad
    ["adv","gen","vok"].forEach(r => { if(harRoll(s,r)) steg.push(r); });  // adv/gen kan tillkomma
    return steg;
  }
  const steg = ["pred","subj","do"];
  ["io","adv","gen","vok"].forEach(r => { if(harRoll(s,r)) steg.push(r); });
  return steg;
}

/* ── PERSISTENS ──────────────────────────────────────────────────────── */
function spara(){
  try{
    localStorage.setItem(LAGER, JSON.stringify({
      mode: state.mode, valdaNivaer:[...state.valdaNivaer], kalla:state.kalla, best:state.best,
    }));
  }catch(e){}
}
function ladda(){
  try{
    const r = JSON.parse(localStorage.getItem(LAGER)); if(!r) return;
    if(r.mode) state.mode = r.mode;
    if(Array.isArray(r.valdaNivaer)) state.valdaNivaer = new Set(r.valdaNivaer.filter(n => NIVAER[n]));
    if(r.kalla) state.kalla = r.kalla;
    if(typeof r.best === "number") state.best = r.best;
  }catch(e){}
}

/* ── NY SATS ─────────────────────────────────────────────────────────── */
function newQuestion(){
  const pool = aktivaSatser();
  let s, forsok = 0;
  do { s = pick(pool); } while(pool.length > 1 && s.id === state.forra && ++forsok < 30);
  state.forra = s.id;

  state.sats = s;                         // upplöst en gång; render läser bara
  state.steg = byggSteg(s);
  state.stegIdx = 0;
  state.tilldelad = {};
  state.armadRoll = null;
  state.smutsig = false;
  state.klar = false;
  render();
}

/* ── RENDERING ───────────────────────────────────────────────────────── */
function render(){
  const s = state.sats;
  $("streak").textContent = state.streak;
  $("best").textContent = state.best;

  // källflagga
  const kf = $("kalla");
  kf.className = "kalla " + s.kalla;
  kf.textContent = s.kalla === "kurs" ? "ur kursen · " + s.ref
                                      : "skapad · " + s.ref;

  ritaSats();

  // dölj allt lägesspecifikt
  $("steg").classList.add("hidden");
  $("palett").classList.add("hidden");
  $("reveal").classList.add("hidden");

  if(state.mode === "guidat"){
    if(!state.klar){ ritaSteg(); $("steg").classList.remove("hidden"); }
  }else{
    if(!state.klar){ ritaPalett(); $("palett").classList.remove("hidden"); }
  }

  if(state.klar) visaFacit();
  ritaControls();
}

function ritaSats(){
  const box = $("sats"); box.innerHTML = "";
  state.sats.chunks.forEach((c, i) => {
    const b = document.createElement("button");
    b.className = "chunk";
    const ord = document.createElement("span"); ord.textContent = c.t; b.appendChild(ord);
    const et  = document.createElement("span"); et.className = "etikett"; b.appendChild(et);

    const roll = state.tilldelad[i];
    if(roll){
      b.classList.add("satt", ROLLER[roll].klass);
      et.textContent = ROLLER[roll].etikett;
    }
    // facit-utvärdering i fritt läge: markera fel
    if(state.klar && state.mode === "fritt"){
      b.disabled = true;
      if(roll !== c.roll){
        b.classList.remove("satt", ROLLER[roll]?.klass);
        b.classList.add("fel");
        et.textContent = "→ " + ROLLER[c.roll].etikett;   // visa rätt roll
      }
    }
    if(state.klar && state.mode === "guidat") b.disabled = true;

    b.onclick = () => state.mode === "guidat" ? guidatKlick(i) : frittKlick(i);
    box.appendChild(b);
  });
}

/* GUIDAT */
function ritaSteg(){
  const r = ROLLER[state.steg[state.stegIdx]];
  $("steg").innerHTML =
    `<div class="raknare">steg ${state.stegIdx+1} av ${state.steg.length} · ${r.raknare}</div>
     <div class="fraga">${r.fraga}</div>
     <div class="instr">${r.instr}</div>`;
}

function lasChunk(i, roll){              // lås en korrekt identifierad chunk
  state.tilldelad[i] = roll;
}
function guidatKlick(i){
  if(state.klar) return;
  const mal = state.steg[state.stegIdx];
  const c = state.sats.chunks[i];
  if(state.tilldelad[i]) return;                          // redan satt
  if(c.roll === mal){
    lasChunk(i, mal);
    naestaSteg();
  }else{
    felKlick(i);
  }
}
// Saknas-knappen (bara på subj/do-steg)
function guidatSaknas(){
  if(state.klar) return;
  const mal = state.steg[state.stegIdx];
  if(!harRoll(state.sats, mal)){                          // rätt: rollen saknas
    naestaSteg(true);
  }else{
    skaka($("btn-saknas")); state.streak = 0; state.smutsig = true; render();
  }
}
function naestaSteg(){
  state.stegIdx++;
  if(state.stegIdx >= state.steg.length){
    state.klar = true;
    if(!state.smutsig){ state.streak++; if(state.streak > state.best){ state.best = state.streak; spara(); } }
  }
  render();
}

/* FRITT */
function ritaPalett(){
  const box = $("palett"); box.innerHTML = "";
  ROLL_ORDNING.forEach(r => {
    const b = document.createElement("button");
    b.className = "roll " + ROLLER[r].klass;
    b.textContent = ROLLER[r].etikett;
    b.setAttribute("aria-pressed", state.armadRoll === r);
    b.onclick = () => { state.armadRoll = (state.armadRoll === r ? null : r); render(); };
    box.appendChild(b);
  });
  const tips = document.createElement("div");
  tips.className = "palett-tips";
  tips.textContent = state.armadRoll
    ? `”${ROLLER[state.armadRoll].etikett}” valt — klicka på orden som har den rollen.`
    : "Välj en roll, måla sedan orden. Klicka ett ord utan vald roll för att ångra.";
  box.appendChild(tips);
}
function frittKlick(i){
  if(state.klar) return;
  if(state.armadRoll) state.tilldelad[i] = state.armadRoll;
  else delete state.tilldelad[i];                         // ångra
  render();
}
function rattaFritt(){
  // alla chunks måste ha fått en roll
  const alla = state.sats.chunks.every((_, i) => state.tilldelad[i]);
  if(!alla){
    const box = $("sats");
    state.sats.chunks.forEach((_, i) => { if(!state.tilldelad[i]) skaka(box.children[i]); });
    return;
  }
  const rentRatt = state.sats.chunks.every((c, i) => state.tilldelad[i] === c.roll);
  state.klar = true;
  if(rentRatt){ state.streak++; if(state.streak > state.best){ state.best = state.streak; spara(); } }
  else state.streak = 0;
  render();
}

/* gemensamt */
function felKlick(i){ skaka($("sats").children[i]); state.streak = 0; state.smutsig = true; render(); }
function skaka(el){ if(!el) return; el.classList.remove("skaka"); void el.offsetWidth; el.classList.add("skaka"); }

function visaFacit(){
  // färglägg hela satsen efter facit
  state.sats.chunks.forEach((c, i) => { if(state.mode === "guidat") state.tilldelad[i] = c.roll; });
  ritaSats();

  $("r-sv").textContent = state.sats.sv;
  const noter = [];
  if(state.sats.subjI)
    noter.push(`Inget utskrivet subjekt — det ligger i verbets ändelse (<b>${state.sats.subjI}</b>).`);
  if(harRoll(state.sats, "gen"))
    noter.push("Genitivattributet hör till ett substantiv (subjekt/objekt), inte direkt till verbet.");
  if(harRoll(state.sats, "vok"))
    noter.push("<b>ὦ</b> är en interjektion vid tilltal, inte en artikel.");
  if(harRoll(state.sats, "pf"))
    noter.push("Predikatsfyllnaden står i nominativ precis som subjektet — εἰμί fungerar som ett likhetstecken och tar inget objekt.");
  if(state.sats.impf)
    noter.push("Verbet står i <b>imperfekt</b> av εἰμί (<b>ἦν</b> sg., <b>ἦσαν</b> pl. = ’var’). Det beter sig precis som presens: tar predikatsfyllnad i nominativ, inget objekt.");
  if(harRoll(state.sats, "adv"))
    noter.push("Prepositionsfrasen är ett <b>adverbial</b> — den svarar på var/när och hör till hela verbhandlingen, inte till ett enskilt substantiv. Prepositionen styr kasus inuti frasen (<b>ἐν</b>+dativ, <b>εἰς</b>+ackusativ, <b>ἐκ/ἐξ</b>+genitiv), så ackusativen eller dativen där gör den inte till objekt.");
  $("r-not").innerHTML = noter.join("<br>");
  $("r-not").classList.toggle("hidden", !noter.length);
  $("reveal").classList.remove("hidden");
}

/* ── KNAPPRAD ────────────────────────────────────────────────────────── */
function ritaControls(){
  const c = $("controls"); c.innerHTML = "";
  const mk = (txt, klass, fn, id) => {
    const b = document.createElement("button");
    b.className = "btn " + klass; b.textContent = txt; if(id) b.id = id; b.onclick = fn; c.appendChild(b);
  };
  if(state.klar){
    mk("Nästa", "primary", newQuestion);
    return;
  }
  if(state.mode === "guidat"){
    const mal = state.steg[state.stegIdx];
    if(mal === "subj" || mal === "do") mk("Saknas i satsen", "", guidatSaknas, "btn-saknas");
    mk("Visa lösning", "ghost", visaLosning);
  }else{
    mk("Rätta", "primary", rattaFritt);
  }
}
function visaLosning(){                                   // ger upp → svit nollas
  state.smutsig = true; state.streak = 0; state.klar = true; render();
}

/* ── VÄLJAREN ────────────────────────────────────────────────────────── */
function byggGridNiva(){
  const g = $("grid-niva"); g.innerHTML = "";
  Object.keys(NIVAER).forEach(nStr => {
    const n = +nStr;
    const b = document.createElement("button");
    b.className = "toggle"; b.textContent = n;
    b.dataset.tip = "Nivå " + n + " — " + NIVAER[n];
    b.setAttribute("aria-label", "Nivå " + n + ", " + NIVAER[n]);
    b.setAttribute("aria-pressed", state.valdaNivaer.has(n));
    b.onclick = () => {
      state.valdaNivaer.has(n) ? state.valdaNivaer.delete(n) : state.valdaNivaer.add(n);
      b.setAttribute("aria-pressed", state.valdaNivaer.has(n));
      spara(); newQuestion();
    };
    g.appendChild(b);
  });
}
function uppdateraKallaKnappar(){
  document.querySelectorAll("#seg-kalla button").forEach(b =>
    b.setAttribute("aria-pressed", b.dataset.kalla === state.kalla));
}
function uppdateraLagesknappar(){
  $("mode-guidat").setAttribute("aria-pressed", state.mode === "guidat");
  $("mode-fritt").setAttribute("aria-pressed", state.mode === "fritt");
}

/* ── HÄNDELSER ───────────────────────────────────────────────────────── */
$("mode-guidat").onclick = () => { state.mode="guidat"; uppdateraLagesknappar(); spara(); newQuestion(); };
$("mode-fritt").onclick  = () => { state.mode="fritt";  uppdateraLagesknappar(); spara(); newQuestion(); };

$("picker-toggle").onclick = () => {
  const open = $("picker-toggle").getAttribute("aria-expanded") === "true";
  $("picker-toggle").setAttribute("aria-expanded", !open);
  $("picker-body").classList.toggle("hidden", open);
};

document.querySelector("[data-niva-all]").onclick   = () => { state.valdaNivaer = new Set(Object.keys(NIVAER).map(Number)); byggGridNiva(); spara(); newQuestion(); };
document.querySelector("[data-niva-core]").onclick  = () => { state.valdaNivaer = new Set([1,2,3]); byggGridNiva(); spara(); newQuestion(); };
document.querySelector("[data-niva-clear]").onclick = () => { state.valdaNivaer = new Set(); byggGridNiva(); spara(); newQuestion(); };
document.querySelector("[data-deck-sem2]").onclick  = () => {
  state.valdaNivaer = new Set(Object.keys(NIVAER).map(Number)); state.kalla = "kurs";
  byggGridNiva(); uppdateraKallaKnappar(); spara(); newQuestion();
};
document.querySelector("[data-deck-sem4]").onclick  = () => {
  state.valdaNivaer = new Set([8,9]); state.kalla = "kurs";     // εἰμί imperfekt + adverbial
  byggGridNiva(); uppdateraKallaKnappar(); spara(); newQuestion();
};
document.querySelectorAll("#seg-kalla button").forEach(b =>
  b.onclick = () => { state.kalla = b.dataset.kalla; uppdateraKallaKnappar(); spara(); newQuestion(); });

// tangentbord: Enter → nästa/rätta
document.addEventListener("keydown", e => {
  if(e.key === "Enter"){
    if(state.klar) newQuestion();
    else if(state.mode === "fritt") rattaFritt();
  }
});

/* ── START ───────────────────────────────────────────────────────────── */
ladda();
uppdateraLagesknappar();
uppdateraKallaKnappar();
byggGridNiva();
newQuestion();

  } finally {
    document.addEventListener = _da;
    window.addEventListener   = _wa;
  }
}
