// Vy: Satsanalys — portad exakt från grekiska-satsanalys.html
let __kh = null;
export function teardown(){ if(__kh){ document.removeEventListener("keydown", __kh); __kh = null; } }
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
        <button class="chip" data-deck-sem5>Seminarium 5 (prepositioner, negation, pronomen)</button>
        <button class="chip" data-deck-sem6>Seminarium 6 (pronomen, futurum)</button>
        <button class="chip" data-deck-sem7>Seminarium 7 (possessiva, imperfekt, infinitiv)</button>
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
  /* Dativobjekt delar färg med io: samma kasus, och en egen färg vore att påstå
     att ögat ska skilja dem åt — det är verbet som gör det, inte formen. Men
     frågan är en annan, och det är hela poängen: πιστεύω αὐτῷ är inte "tror åt
     honom" utan "tror PÅ honom". Ingen tar emot något. */
  "obj-dat":{ namn:"dativobjektet",etikett:"dativobjekt",     klass:"r-io",   kasus:"dativ",
         raknare:"dativ",       fraga:"Vilket ord kräver verbet i dativ?",     instr:"Klicka på dativobjektet." },
  gen: { namn:"genitivattributet", etikett:"genitivattribut", klass:"r-gen",  kasus:"genitiv",
         raknare:"genitiv",     fraga:"Till vem hör någon eller något?",       instr:"Klicka på genitivattributet." },
  vok: { namn:"vokativen",         etikett:"vokativ",         klass:"r-vok",  kasus:"vokativ",
         raknare:"vokativ",     fraga:"Vem tilltalas?",                        instr:"Klicka på vokativen." },
  pf:  { namn:"predikatsfyllnaden",etikett:"predikatsfyllnad", klass:"r-pf",   kasus:"nominativ",
         raknare:"nominativ",   fraga:"Vad sägs om subjektet?",                instr:"Klicka på predikatsfyllnaden." },
  adv: { namn:"adverbialet",       etikett:"adverbial",        klass:"r-adv",
         raknare:"rum/tid",     fraga:"Var eller när äger handlingen rum?",    instr:"Klicka på adverbialet (prepositionsfrasen)." },
  inf: { namn:"infinitivkomplementet", etikett:"infinitiv",    klass:"r-inf",
         raknare:"infinitiv",   fraga:"Vad är det man vill eller tänker göra?", instr:"Klicka på infinitiven." },
};
const ROLL_ORDNING = ["pred","subj","do","io","obj-dat","adv","pf","gen","vok","inf"];

const NIVAER = {
  1:"S-V-O (rak ordföljd)",
  2:"Fri ordföljd",
  3:"Subjekt i ändelsen",
  4:"Indirekt objekt",
  5:"Genitivattribut",
  6:"Vokativ",
  7:"Predikatsfyllnad (εἰμί)",
  8:"εἰμί i imperfekt (var)",
  9:"Adverbial (prepositionsfras)",
  10:"Prepositioner (sem 5)",
  11:"Negationen οὐ (sem 5)",
  12:"Personliga pronomen (sem 5)",
  13:"3:e person & demonstrativa pronomen (sem 6)",
  14:"Interrogativa pronomen (sem 6)",
  15:"Futurum (sem 6)",
  16:"Possessiva pronomen (sem 7)",
  17:"Imperfekt (sem 7)",
  18:"Infinitiv som komplement (sem 7)",
};

/* ── MENINGSBANK ──────────────────────────────────────────────────────
   Varje sats: ordnad lista av chunks (artikel+substantiv hålls ihop,
   genitivattribut är en egen chunk enligt presentationens analys).
   Subjekt i ändelsen markeras subjI: <person> (ingen subj-chunk finns).
   kalla:"kurs" + ref = exakt ur kursmaterialet (facit verifierat).
   kalla:"skapad" = jag har konstruerat den; former kollade mot ord.json.
   Accenter återges som i källan (grav före nästa ord, akut sist).        */
const SATSER = [
  { id:"k01", niva:1, kalla:"kurs", ref:"Breakout 2:1", sv:"Människan ser huset.", chunks:[
      {t:"ὁ ἄνθρωπος",roll:"subj"},{t:"βλέπει",roll:"pred"},{t:"τὸν οἶκον",roll:"do"} ]},
  { id:"k02", niva:2, kalla:"kurs", ref:"Breakout 2:2", sv:"Gud ser människan.", chunks:[
      {t:"τὸν ἄνθρωπον",roll:"do"},{t:"βλέπει",roll:"pred"},{t:"ὁ θεός",roll:"subj"} ]},
  { id:"k03", niva:2, kalla:"kurs", ref:"Breakout 2:3", sv:"Slavarna skriver ett ord.", chunks:[
      {t:"γράφουσι",roll:"pred"},{t:"λόγον",roll:"do"},{t:"οἱ δοῦλοι",roll:"subj"} ]},
  { id:"k04", niva:4, kalla:"kurs", ref:"Breakout 2:4", sv:"Aposteln skriver ordet till bröderna.", chunks:[
      {t:"ὁ ἀπόστολος",roll:"subj"},{t:"γράφει",roll:"pred"},{t:"τὸν λόγον",roll:"do"},{t:"τοῖς ἀδελφοῖς",roll:"io"} ]},
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
  { id:"k17", niva:2, kalla:"kurs", ref:"Breakout 1:2", sv:"Änglarna räddar bröderna.", chunks:[
      {t:"σῴζουσιν",roll:"pred"},{t:"οἱ ἄγγελοι",roll:"subj"},{t:"τοὺς ἀδελφούς",roll:"do"} ]},
  { id:"k18", niva:4, kalla:"kurs", ref:"Breakout 1:3", sv:"Slaven talar till aposteln.", chunks:[
      {t:"ὁ δοῦλος",roll:"subj"},{t:"τῷ ἀποστόλῳ",roll:"io"},{t:"λέγει",roll:"pred"} ]},
  { id:"k19", niva:5, kalla:"kurs", ref:"Breakout 1:4", sv:"Ni skriver brödernas ord till slavarna.", subjI:"ni", chunks:[
      {t:"γράφετε",roll:"pred"},{t:"τοῖς δούλοις",roll:"io"},{t:"τοὺς λόγους",roll:"do"},{t:"τῶν ἀδελφῶν",roll:"gen"} ]},
  { id:"k20", niva:5, kalla:"kurs", ref:"Breakout 2:1", sv:"Vi ser Guds tecken.", subjI:"vi", chunks:[
      {t:"βλέπομεν",roll:"pred"},{t:"τὸ σημεῖον",roll:"do"},{t:"τοῦ θεοῦ",roll:"gen"} ]},
  { id:"k21", niva:2, kalla:"kurs", ref:"Breakout 2:2", sv:"Slavarna skickar båtarna.", chunks:[
      {t:"πέμπουσιν",roll:"pred"},{t:"οἱ δοῦλοι",roll:"subj"},{t:"τὰ πλοῖα",roll:"do"} ]},
  { id:"k22", niva:1, kalla:"kurs", ref:"Breakout 2:3", sv:"Bröderna finner evangelierna.", chunks:[
      {t:"οἱ ἀδελφοὶ",roll:"subj"},{t:"εὑρίσκουσι",roll:"pred"},{t:"τὰ εὐαγγέλια",roll:"do"} ]},
  { id:"k23", niva:6, kalla:"kurs", ref:"Breakout 2:4", sv:"Du, o ängel, skriver evangeliets ord till barnen.", subjI:"du", chunks:[
      {t:"ὦ ἄγγελε",roll:"vok"},{t:"γράφεις",roll:"pred"},{t:"τοὺς λόγους",roll:"do"},{t:"τοῦ εὐαγγελίου",roll:"gen"},{t:"τοῖς τέκνοις",roll:"io"} ]},
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
      {t:"τῷ θεῷ",roll:"obj-dat"},{t:"πιστεύουσιν",roll:"pred"} ]},
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
  { id:"s01", niva:1, kalla:"skapad", ref:"konstruerad", sv:"Herren ser slaven.", chunks:[
      {t:"ὁ κύριος",roll:"subj"},{t:"βλέπει",roll:"pred"},{t:"τὸν δοῦλον",roll:"do"} ]},
  { id:"s02", niva:1, kalla:"skapad", ref:"konstruerad", sv:"Sonen tar brödet.", chunks:[
      {t:"ὁ υἱὸς",roll:"subj"},{t:"λαμβάνει",roll:"pred"},{t:"τὸν ἄρτον",roll:"do"} ]},
  { id:"s03", niva:1, kalla:"skapad", ref:"konstruerad (utan objekt)", sv:"Aposteln skriver.", chunks:[
      {t:"ὁ ἀπόστολος",roll:"subj"},{t:"γράφει",roll:"pred"} ]},
  { id:"s04", niva:2, kalla:"skapad", ref:"konstruerad", sv:"Människan ser ängeln.", chunks:[
      {t:"τὸν ἄγγελον",roll:"do"},{t:"βλέπει",roll:"pred"},{t:"ὁ ἄνθρωπος",roll:"subj"} ]},
  { id:"s05", niva:2, kalla:"skapad", ref:"konstruerad", sv:"Slavarna tar frukten.", chunks:[
      {t:"λαμβάνουσι",roll:"pred"},{t:"τὸν καρπὸν",roll:"do"},{t:"οἱ δοῦλοι",roll:"subj"} ]},
  { id:"s06", niva:3, kalla:"skapad", ref:"konstruerad", sv:"Vi ser himlen.", subjI:"vi", chunks:[
      {t:"βλέπομεν",roll:"pred"},{t:"τὸν οὐρανόν",roll:"do"} ]},
  { id:"s07", niva:3, kalla:"skapad", ref:"konstruerad", sv:"Han skriver orden.", subjI:"han/hon/det", chunks:[
      {t:"γράφει",roll:"pred"},{t:"τοὺς λόγους",roll:"do"} ]},
  { id:"s08", niva:4, kalla:"skapad", ref:"konstruerad", sv:"Herren skickar ängeln till folket.", chunks:[
      {t:"ὁ κύριος",roll:"subj"},{t:"πέμπει",roll:"pred"},{t:"τὸν ἄγγελον",roll:"do"},{t:"τῷ λαῷ",roll:"io"} ]},
  { id:"s09", niva:4, kalla:"skapad", ref:"konstruerad", sv:"Vi skriver en berättelse till bröderna.", subjI:"vi", chunks:[
      {t:"γράφομεν",roll:"pred"},{t:"λόγον",roll:"do"},{t:"τοῖς ἀδελφοῖς",roll:"io"} ]},
  { id:"s10", niva:5, kalla:"skapad", ref:"konstruerad", sv:"Vi ser Guds hus.", subjI:"vi", chunks:[
      {t:"βλέπομεν",roll:"pred"},{t:"τὸν οἶκον",roll:"do"},{t:"τοῦ θεοῦ",roll:"gen"} ]},
  { id:"s11", niva:5, kalla:"skapad", ref:"konstruerad (gen. på subjektet)", sv:"Herrens slav tar brödet.", chunks:[
      {t:"ὁ δοῦλος",roll:"subj"},{t:"τοῦ κυρίου",roll:"gen"},{t:"λαμβάνει",roll:"pred"},{t:"τὸν ἄρτον",roll:"do"} ]},
  { id:"s12", niva:6, kalla:"skapad", ref:"konstruerad", sv:"Du, o slav, ser herren.", subjI:"du", chunks:[
      {t:"ὦ δοῦλε",roll:"vok"},{t:"βλέπεις",roll:"pred"},{t:"τὸν κύριον",roll:"do"} ]},
  { id:"s13", niva:6, kalla:"skapad", ref:"konstruerad", sv:"Du, o människa, hör Guds ord.", subjI:"du", chunks:[
      {t:"ὦ ἄνθρωπε",roll:"vok"},{t:"ἀκούεις",roll:"pred"},{t:"τὸν λόγον",roll:"do"},{t:"τοῦ θεοῦ",roll:"gen"} ]},
  { id:"e01", niva:8, kalla:"kurs", ref:"Presentation s.14", sv:"Jesus var Guds son.", impf:true, chunks:[
      {t:"ὁ Ἰησοῦς",roll:"subj"},{t:"ἦν",roll:"pred"},{t:"ὁ υἱὸς",roll:"pf"},{t:"τοῦ θεοῦ",roll:"gen"} ]},
  { id:"e02", niva:8, kalla:"kurs", ref:"Presentation s.14", sv:"Barnen var slavar.", impf:true, chunks:[
      {t:"τὰ τέκνα",roll:"subj"},{t:"ἦσαν",roll:"pred"},{t:"δοῦλοι",roll:"pf"} ]},
  { id:"e03", niva:8, kalla:"kurs", ref:"Presentation s.17", sv:"Bröderna var goda.", impf:true, chunks:[
      {t:"οἱ ἀδελφοὶ",roll:"subj"},{t:"ἦσαν",roll:"pred"},{t:"ἀγαθοί",roll:"pf"} ]},
  { id:"e04", niva:8, kalla:"kurs", ref:"Presentation s.17", sv:"Verket var vackert.", impf:true, chunks:[
      {t:"τὸ ἔργον",roll:"subj"},{t:"ἦν",roll:"pred"},{t:"καλόν",roll:"pf"} ]},
  { id:"e05", niva:8, kalla:"kurs", ref:"Presentation s.17", sv:"Verken var vackra.", impf:true, chunks:[
      {t:"τὰ ἔργα",roll:"subj"},{t:"ἦν",roll:"pred"},{t:"καλά",roll:"pf"} ]},
  { id:"a01", niva:9, kalla:"kurs", ref:"Presentation s.44", sv:"I huset skriver aposteln.", chunks:[
      {t:"ἐν τῷ οἴκῳ",roll:"adv"},{t:"ὁ ἀπόστολος",roll:"subj"},{t:"γράφει",roll:"pred"} ]},
  { id:"a02", niva:9, kalla:"kurs", ref:"Övningsblad 8", sv:"Bröderna leder barnen till huset.", chunks:[
      {t:"οἱ ἀδελφοὶ",roll:"subj"},{t:"ἄγουσι",roll:"pred"},{t:"τὰ τέκνα",roll:"do"},{t:"εἰς τὸν οἶκον",roll:"adv"} ]},
  { id:"a03", niva:9, kalla:"kurs", ref:"Övningsblad 7", sv:"Vi söker husbondens slavar på fältet.", subjI:"vi", chunks:[
      {t:"ζητοῦμεν",roll:"pred"},{t:"ἐν τῷ ἀγρῷ",roll:"adv"},{t:"τοὺς δούλους",roll:"do"},{t:"τοῦ κυρίου",roll:"gen"} ]},
  { id:"a04", niva:9, kalla:"skapad", ref:"konstruerad (εἰς + ack.)", sv:"Herren skickar slaven till huset.", chunks:[
      {t:"ὁ κύριος",roll:"subj"},{t:"πέμπει",roll:"pred"},{t:"τὸν δοῦλον",roll:"do"},{t:"εἰς τὸν οἶκον",roll:"adv"} ]},
  { id:"a05", niva:9, kalla:"skapad", ref:"konstruerad (ἐν + dat.)", sv:"I huset skriver vi orden.", subjI:"vi", chunks:[
      {t:"ἐν τῷ οἴκῳ",roll:"adv"},{t:"γράφομεν",roll:"pred"},{t:"τοὺς λόγους",roll:"do"} ]},
  { id:"a06", niva:9, kalla:"skapad", ref:"konstruerad (ἐκ + gen.)", sv:"Aposteln leder barnen ut ur huset.", chunks:[
      {t:"ὁ ἀπόστολος",roll:"subj"},{t:"ἄγει",roll:"pred"},{t:"τὰ τέκνα",roll:"do"},{t:"ἐκ τοῦ οἴκου",roll:"adv"} ]},
  { id:"f01", niva:2, kalla:"kurs", ref:"Breakout 3:5", sv:"Kärleken räddar själen.", chunks:[
      {t:"ἡ ἀγάπη",roll:"subj"},{t:"τὴν ψυχήν",roll:"do"},{t:"σῴζει",roll:"pred"} ]},
  { id:"f02", niva:5, kalla:"kurs", ref:"Övningsblad 9", sv:"Systrarna söker Guds rike.", chunks:[
      {t:"ζητοῦσιν",roll:"pred"},{t:"αἱ ἀδελφαὶ",roll:"subj"},{t:"τὴν βασιλείαν",roll:"do"},{t:"τοῦ θεοῦ",roll:"gen"} ]},
  { id:"f03", niva:6, kalla:"kurs", ref:"Övningsblad 3", sv:"Du, o broder, tror på änglarnas vackra bud.", subjI:"du", chunks:[
      {t:"ὦ ἀδελφέ",roll:"vok"},{t:"πιστεύεις",roll:"pred"},{t:"ταῖς καλαῖς ἐντολαῖς",roll:"obj-dat"},{t:"τῶν ἀγγέλων",roll:"gen"} ]},
  { id:"f04", niva:1, kalla:"kurs", ref:"Övningsblad 2", sv:"Jesus gör sköna under.", chunks:[
      {t:"ὁ Ἰησοῦς",roll:"subj"},{t:"ποιεῖ",roll:"pred"},{t:"καλὰ σημεῖα",roll:"do"} ]},
  { id:"f05", niva:5, kalla:"kurs", ref:"Övningsblad 6", sv:"Änglarna talar Guds ord.", chunks:[
      {t:"λαλοῦσιν",roll:"pred"},{t:"οἱ ἄγγελοι",roll:"subj"},{t:"τοὺς λόγους",roll:"do"},{t:"τοῦ θεοῦ",roll:"gen"} ]},
  { id:"s5p1", niva:10, kalla:"kurs", ref:"Övningsblad 5:1", sv:"Slavarna leder flickorna till byn.", chunks:[
      {t:"ἄγουσιν",roll:"pred"},{t:"οἱ δοῦλοι",roll:"subj"},{t:"τὰς παρθένους",roll:"do"},{t:"εἰς τὴν κώμην",roll:"adv"} ]},
  { id:"s5p2", niva:10, kalla:"kurs", ref:"Presentation 5 s.34", sv:"Husbonden övervakar barnen framför templet.", chunks:[
      {t:"ὁ οἰκοδεσπότης",roll:"subj"},{t:"τηρεῖ",roll:"pred"},{t:"τὰ τέκνα",roll:"do"},{t:"πρὸ τοῦ ἱεροῦ",roll:"adv"} ]},
  { id:"s5p3", niva:10, kalla:"kurs", ref:"Övningsblad 5:2", sv:"I kyrkan ser vi Guds härlighet.", subjI:"vi", chunks:[
      {t:"ἐν τῇ ἐκκλησίᾳ",roll:"adv"},{t:"βλέπομεν",roll:"pred"},{t:"τὴν δόξαν",roll:"do"},{t:"τοῦ θεοῦ",roll:"gen"} ]},
  { id:"s5n1", niva:11, kalla:"kurs", ref:"Breakout 5:2a", sv:"Vännerna tror inte.", chunks:[
      {t:"οἱ φίλοι",roll:"subj"},{t:"οὐ πιστεύουσιν",roll:"pred"} ]},
  { id:"s5n2", niva:11, kalla:"kurs", ref:"Övningsblad 5:5", sv:"Flickan helar inte sjukdomarna.", chunks:[
      {t:"οὐ θεραπεύει",roll:"pred"},{t:"ἡ παρθένος",roll:"subj"},{t:"τὰς νόσους",roll:"do"} ]},
  { id:"s5r1", niva:12, kalla:"kurs", ref:"Breakout 5:3", sv:"Vi söker er.", subjI:"vi", chunks:[
      {t:"ζητοῦμεν",roll:"pred"},{t:"ὑμᾶς",roll:"do"} ]},
  { id:"s5r2", niva:12, kalla:"kurs", ref:"Breakout 5:3", sv:"De predikar för er.", subjI:"de", chunks:[
      {t:"κηρύσσουσιν",roll:"pred"},{t:"ὑμῖν",roll:"io"} ]},
  { id:"s5r3", niva:12, kalla:"kurs", ref:"Breakout 5:3", sv:"Han talar om dig.", subjI:"han/hon/det", chunks:[
      {t:"λέγει",roll:"pred"},{t:"περὶ σοῦ",roll:"adv"} ]},
  { id:"s6a1", niva:13, kalla:"kurs", ref:"Breakout 6:1:1", sv:"Jag döper dig.", subjI:"jag", chunks:[
      {t:"βαπτίζω",roll:"pred"},{t:"σε",roll:"do"} ]},
  { id:"s6a2", niva:13, kalla:"kurs", ref:"Breakout 6:1:5", sv:"Hon döper dem.", chunks:[
      {t:"αὕτη",roll:"subj"},{t:"βαπτίζει",roll:"pred"},{t:"αὐτούς",roll:"do"} ]},
  { id:"s6a3", niva:13, kalla:"kurs", ref:"Breakout 6:1:8", sv:"Han talar om henne.", chunks:[
      {t:"οὗτος",roll:"subj"},{t:"λέγει",roll:"pred"},{t:"περὶ αὐτῆς",roll:"adv"} ]},
  { id:"s6a4", niva:13, kalla:"kurs", ref:"Breakout 6:1:9 (förkortad)", sv:"Jesus söker lärjungarna.", chunks:[
      {t:"ὁ Ἰησοῦς",roll:"subj"},{t:"ζητεῖ",roll:"pred"},{t:"τοὺς μαθητάς",roll:"do"} ]},
  { id:"s6i1", niva:14, kalla:"kurs", ref:"Breakout 6:2:1", sv:"Vem är det?", chunks:[
      {t:"τίς",roll:"subj"},{t:"ἐστιν",roll:"pred"} ]},
  { id:"s6i2", niva:14, kalla:"kurs", ref:"Breakout 6:2:3", sv:"Vilket vin dricker du?", subjI:"du", chunks:[
      {t:"τίνα οἶνον",roll:"do"},{t:"πίνεις",roll:"pred"} ]},
  { id:"s6i3", niva:14, kalla:"kurs", ref:"Breakout 6:2:5", sv:"Vad gör du?", subjI:"du", chunks:[
      {t:"τί",roll:"do"},{t:"ποιεῖς",roll:"pred"} ]},
  { id:"s6f1", niva:15, kalla:"kurs", ref:"Breakout 6:3:1", sv:"Lärjungarna ska tro.", chunks:[
      {t:"οἱ μαθηταὶ",roll:"subj"},{t:"πιστεύσουσιν",roll:"pred"} ]},
  { id:"s6f2", niva:15, kalla:"kurs", ref:"Breakout 6:3:2", sv:"Jag ska tro på Gud.", subjI:"jag", chunks:[
      {t:"πιστεύσω",roll:"pred"},{t:"τῷ θεῷ",roll:"obj-dat"} ]},
  { id:"s6f3", niva:15, kalla:"kurs", ref:"Breakout 6:3:3", sv:"Herren ska tala med dig.", chunks:[
      {t:"ὁ κύριος",roll:"subj"},{t:"λαλήσει",roll:"pred"},{t:"σοι",roll:"io"} ]},
  { id:"s6f4", niva:15, kalla:"kurs", ref:"Breakout 6:3:6", sv:"Apostlarna ska undervisa lärjungarna.", chunks:[
      {t:"οἱ ἀπόστολοι",roll:"subj"},{t:"παιδεύσουσι",roll:"pred"},{t:"τοὺς μαθητάς",roll:"do"} ]},
  { id:"s7p1", niva:16, kalla:"kurs", ref:"Breakout 7:1:8", sv:"Min bror talar med dig.", chunks:[
      {t:"ὁ ἀδελφός",roll:"subj"},{t:"μου",roll:"gen"},{t:"λαλεῖ",roll:"pred"},{t:"σοι",roll:"io"} ]},
  { id:"s7p2", niva:16, kalla:"kurs", ref:"Breakout 7:1:9", sv:"Vår herre ska skicka båten till er.", chunks:[
      {t:"πέμψει",roll:"pred"},{t:"ὁ κύριος",roll:"subj"},{t:"ἡμῶν",roll:"gen"},{t:"τὸ πλοῖον",roll:"do"},{t:"πρὸς ὑμᾶς",roll:"adv"} ]},
  { id:"s7p3", niva:16, kalla:"kurs", ref:"Breakout 7:1:10", sv:"Deras syster ska döpa oss.", chunks:[
      {t:"βαπτίσει",roll:"pred"},{t:"ἡ ἀδελφὴ",roll:"subj"},{t:"αὐτῶν",roll:"gen"},{t:"ἡμᾶς",roll:"do"} ]},
  { id:"s7p4", niva:16, kalla:"kurs", ref:"Breakout 7:2:4 (utbyggd)", sv:"Hans slav ser huset.", chunks:[
      {t:"ὁ τούτου",roll:"gen"},{t:"δοῦλος",roll:"subj"},{t:"βλέπει",roll:"pred"},{t:"τὸν οἶκον",roll:"do"} ]},
  { id:"s7i1", niva:17, kalla:"kurs", ref:"Breakout 7:3:2", sv:"Johannes döpte många människor.", chunks:[
      {t:"ὁ Ἰωάννης",roll:"subj"},{t:"ἐβάπτιζε",roll:"pred"},{t:"πολλοὺς ἀνθρώπους",roll:"do"} ]},
  { id:"s7i2", niva:17, kalla:"kurs", ref:"Breakout 7:3:3", sv:"Han undervisade dem i deras synagoga.", subjI:"han/hon/det", chunks:[
      {t:"ἐδίδασκεν",roll:"pred"},{t:"αὐτοὺς",roll:"do"},{t:"ἐν τῇ συναγωγῇ",roll:"adv"},{t:"αὐτῶν",roll:"gen"} ]},
  { id:"s7i3", niva:17, kalla:"kurs", ref:"Övningsblad 7:II:17 (förkortad)", sv:"I synagogorna predikade han.", subjI:"han/hon/det", chunks:[
      {t:"ἐν ταῖς συναγωγαῖς",roll:"adv"},{t:"ἐκήρυσσεν",roll:"pred"} ]},
  { id:"s7i4", niva:17, kalla:"kurs", ref:"Övningsblad 7:II:14", sv:"Den stora folkhopen hörde hans ord.", chunks:[
      {t:"ὁ πολὺς ὄχλος",roll:"subj"},{t:"ἤκουεν",roll:"pred"},{t:"τὸν λόγον",roll:"do"},{t:"αὐτοῦ",roll:"gen"} ]},
  { id:"s7n1", niva:18, kalla:"kurs", ref:"Övningsblad 7:II:9", sv:"Vad tänker du göra?", subjI:"du", chunks:[
      {t:"τί",roll:"do"},{t:"μέλλεις",roll:"pred"},{t:"ποιεῖν",roll:"inf"} ]},
  { id:"s7n2", niva:18, kalla:"kurs", ref:"Presentation 7 s.22", sv:"Jag vill predika för er.", subjI:"jag", chunks:[
      {t:"θέλω",roll:"pred"},{t:"κηρύσσειν",roll:"inf"},{t:"ὑμῖν",roll:"io"} ]},
  { id:"s7n3", niva:18, kalla:"kurs", ref:"Presentation 7 s.22", sv:"Jag tänker predika för er.", subjI:"jag", chunks:[
      {t:"μέλλω",roll:"pred"},{t:"κηρύσσειν",roll:"inf"},{t:"ὑμῖν",roll:"io"} ]},
  { id:"s7n4", niva:18, kalla:"kurs", ref:"Övningsblad 7:II:10 (förkortad)", sv:"Gud kommer att slå dig.", chunks:[
      {t:"τύπτειν",roll:"inf"},{t:"σε",roll:"do"},{t:"μέλλει",roll:"pred"},{t:"ὁ θεός",roll:"subj"} ]}
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
  ["io","obj-dat","adv","gen","vok"].forEach(r => { if(harRoll(s,r)) steg.push(r); });
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
      uppdateraSnabbChips(); spara(); newQuestion();
    };
    g.appendChild(b);
  });
  uppdateraSnabbChips();
}
/* Snabbvals-chipsen blir svarta (aria-pressed) när nivåurvalet exakt motsvarar
   det chipet sätter — som deck-chipsen i verbspelet. */
function setEq(a, b){ return a.size === b.size && [...a].every(x => b.has(x)); }
function uppdateraSnabbChips(){
  const v = state.valdaNivaer, alla = new Set(Object.keys(NIVAER).map(Number));
  const karta = [
    ["[data-niva-all]",   alla],
    ["[data-niva-core]",  new Set([1,2,3])],
    ["[data-niva-clear]", new Set()],
    ["[data-deck-sem2]",  alla],
    ["[data-deck-sem4]",  new Set([8,9])],
    ["[data-deck-sem5]",  new Set([10,11,12])],
    ["[data-deck-sem6]",  new Set([13,14,15])],
    ["[data-deck-sem7]",  new Set([16,17,18])],
  ];
  for(const [sel, set] of karta){ const b = document.querySelector(sel); if(b) b.setAttribute("aria-pressed", setEq(v, set)); }
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
document.querySelector("[data-deck-sem5]").onclick  = () => {
  state.valdaNivaer = new Set([10,11,12]); state.kalla = "kurs";  // prepositioner, negation, pronomen
  byggGridNiva(); uppdateraKallaKnappar(); spara(); newQuestion();
};
document.querySelector("[data-deck-sem6]").onclick  = () => {
  state.valdaNivaer = new Set([13,14,15]); state.kalla = "kurs";  // pronomen (3:e/dem/interr), futurum
  byggGridNiva(); uppdateraKallaKnappar(); spara(); newQuestion();
};
document.querySelector("[data-deck-sem7]").onclick  = () => {
  state.valdaNivaer = new Set([16,17,18]); state.kalla = "kurs";  // possessiva, imperfekt, infinitiv
  byggGridNiva(); uppdateraKallaKnappar(); spara(); newQuestion();
};
document.querySelectorAll("#seg-kalla button").forEach(b =>
  b.onclick = () => { state.kalla = b.dataset.kalla; uppdateraKallaKnappar(); spara(); newQuestion(); });

// tangentbord: Enter → nästa/rätta
__kh = e => {
  if(e.key === "Enter"){
    if(state.klar) newQuestion();
    else if(state.mode === "fritt") rattaFritt();
  }
};
  document.addEventListener("keydown", __kh);;

/* ── START ───────────────────────────────────────────────────────────── */
ladda();
uppdateraLagesknappar();
uppdateraKallaKnappar();
byggGridNiva();
newQuestion();

}
