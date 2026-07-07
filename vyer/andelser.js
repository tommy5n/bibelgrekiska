// Vy: Artiklar & ändelser — portad exakt från grekiska-andelsespel.html
let __kh = null;
export function teardown(){ if(__kh){ document.removeEventListener("keydown", __kh); __kh = null; } }
const MARKUP = `<div class="vy vy-andelser">
<header>
  <h1>Grekiska — artiklar &amp; ändelser</h1>
  <div class="sub">Bygg formen: välj rätt artikel och ändelse för kasuset.</div>
</header>

<div class="modes" role="group" aria-label="Svårighet">
  <button class="mode" id="mode-full" aria-pressed="true">Artikel + ändelse</button>
  <button class="mode" id="mode-end" aria-pressed="false">Bara ändelse</button>
</div>

<div class="stage">
  <div class="card">
    <div class="lemma" id="lemma">—</div>
    <div class="tag" id="tag"></div>
    <div class="slot" id="slot"></div>

    <div class="answers" id="answers">
      <div class="answer-block" id="block-art">
        <div class="answer-label">artikel</div>
        <div class="opts" id="opts-art"></div>
      </div>
      <div class="answer-block">
        <div class="answer-label">ändelse</div>
        <div class="opts" id="opts-end"></div>
      </div>
    </div>

    <div class="reveal hidden" id="reveal">
      <div class="form" id="r-form"></div>
      <div class="glosa" id="r-glosa"></div>
      <div class="not hidden" id="r-not"></div>
    </div>
  </div>

  <div class="controls" id="controls">
    <button class="btn primary" id="btn-go" disabled>Rätta</button>
  </div>

  <div class="streak">
    Svit: <b id="streak">0</b> &nbsp;·&nbsp; bästa: <b id="best">0</b>
  </div>
</div>

<div class="picker">
  <button class="picker-toggle" id="picker-toggle" aria-expanded="false">
    <span>Anpassa övningen <span class="count" id="ord-count"></span></span><span class="chev">▾</span>
  </button>
  <div class="picker-body hidden" id="picker-body">

    <div class="picker-section">
      <h2>Seminarium</h2>
      <div class="quickrow">
        <span class="quicklabel">Snabbval:</span>
        <button class="chip" data-sem-all>alla</button>
        <button class="chip" data-sem-none>inga</button>
      </div>
      <div class="grid" id="grid-sem"></div>
    </div>

    <div class="picker-section">
      <h2>Ord</h2>
      <div class="quickrow">
        <button class="chip" data-ord-all>alla</button>
        <button class="chip" data-ord-clear>rensa</button>
      </div>
      <div class="quickrow">
        <span class="quicklabel">Kategori:</span>
        <button class="chip" data-deck="oxytona">Oxytona</button>
        <button class="chip" data-deck="neutrum">Neutrum</button>
        <button class="chip" data-deck="feminina">Feminina</button>
      </div>
      <div class="grid" id="grid-ord"></div>
    </div>

    <div class="picker-section">
      <h2>Kasus</h2>
      <div class="quickrow">
        <button class="chip" data-kasus-all>alla</button>
        <button class="chip" data-kasus-core>utan vokativ</button>
        <button class="chip" data-kasus-clear>rensa</button>
      </div>
      <div class="grid" id="grid-kasus"></div>
    </div>

    <div class="picker-section">
      <h2>Numerus</h2>
      <div class="seg" id="seg-num" role="group" aria-label="Numerus">
        <button data-num="sg" aria-pressed="true">singular</button>
        <button data-num="pl" aria-pressed="false">plural</button>
        <button data-num="blandat" aria-pressed="false">blandat</button>
      </div>
    </div>

  </div>
</div>

<footer>
  Du får lemmat (nominativ) och en målruta — välj <b>artikel</b> och <b>ändelse</b>, så visas
  hela den attesterade formen. Ändelserna står accent-fritt på knapparna; accenten hör till
  ordet och dyker upp först i facit (<code>ἄνθρωπος → ἀνθρώπῳ</code>). I läget
  <i>bara ändelse</i> är artikeln redan given. Deklination 1 har tre singular-typer som bara
  nominativ avslöjar: <code>ἀρχή</code> (η), <code>ἡμέρα</code> (ren α), <code>θάλασσα</code> (blandad α).
</footer>
</div>`;
export function render(root){
  root.innerHTML = MARKUP;

/* ── DATA ─────────────────────────────────────────────────────────────
   Ord-arrayen och kortlekarna är samma ögonblicksbild som kasusspelet.
   Ändelsetabellen (END) och paradigm-nyckeln är verifierade mot alla 530
   former i ord.json: stam + ändelse återger den attesterade formen exakt.
   Ändelserna visas accent-fritt på knapparna; accenten dyker upp först i
   den fullständiga formen i facit (ἄνθρωπος→ἀνθρώπῳ är inte mekanisk).   */

const ARTIKEL = {
  m:{ nom:{sg:"ὁ",pl:"οἱ"}, gen:{sg:"τοῦ",pl:"τῶν"}, dat:{sg:"τῷ",pl:"τοῖς"}, ack:{sg:"τὸν",pl:"τοὺς"}, vok:{sg:"ὦ",pl:"ὦ"} },
  n:{ nom:{sg:"τὸ",pl:"τὰ"}, gen:{sg:"τοῦ",pl:"τῶν"}, dat:{sg:"τῷ",pl:"τοῖς"}, ack:{sg:"τὸ",pl:"τὰ"}, vok:{sg:"ὦ",pl:"ὦ"} },
  f:{ nom:{sg:"ἡ",pl:"αἱ"}, gen:{sg:"τῆς",pl:"τῶν"}, dat:{sg:"τῇ",pl:"ταῖς"}, ack:{sg:"τὴν",pl:"τὰς"}, vok:{sg:"ὦ",pl:"ὦ"} },
};
const END = {
  m2:{ nom:{sg:"ος",pl:"οι"}, gen:{sg:"ου",pl:"ων"}, dat:{sg:"ῳ",pl:"οις"}, ack:{sg:"ον",pl:"ους"}, vok:{sg:"ε",pl:"οι"} },
  n2:{ nom:{sg:"ον",pl:"α"},  gen:{sg:"ου",pl:"ων"}, dat:{sg:"ῳ",pl:"οις"}, ack:{sg:"ον",pl:"α"},   vok:{sg:"ον",pl:"α"} },
  f1h:{nom:{sg:"η",pl:"αι"},  gen:{sg:"ης",pl:"ων"}, dat:{sg:"ῃ",pl:"αις"}, ack:{sg:"ην",pl:"ας"},  vok:{sg:"η",pl:"αι"} },
  f1a:{nom:{sg:"α",pl:"αι"},  gen:{sg:"ας",pl:"ων"}, dat:{sg:"ᾳ",pl:"αις"}, ack:{sg:"αν",pl:"ας"},  vok:{sg:"α",pl:"αι"} },
  f1m:{nom:{sg:"α",pl:"αι"},  gen:{sg:"ης",pl:"ων"}, dat:{sg:"ῃ",pl:"αις"}, ack:{sg:"αν",pl:"ας"},  vok:{sg:"α",pl:"αι"} },
};
const PARADIGM_NAMN = { m2:"deklination 2 (-ος)", n2:"deklination 2, neutrum (-ον)",
  f1h:"deklination 1, η-stam", f1a:"deklination 1, ren α", f1m:"deklination 1, blandad α" };
const GENUS_NAMN = { m:"maskulinum", n:"neutrum", f:"femininum" };
const KASUS = {
  nom:{namn:"nominativ"}, gen:{namn:"genitiv"}, dat:{namn:"dativ"}, ack:{namn:"ackusativ"}, vok:{namn:"vokativ"},
};
const KASUS_ORDNING = ["nom","gen","dat","ack","vok"];

const ord = [
  { lemma:"ἄνθρωπος", glosa:"människa", glosaGen:"människas", glosaPl:"människor", genus:"m", sem:[2], former:{
    nom:{sg:"ἄνθρωπος",pl:"ἄνθρωποι"}, gen:{sg:"ἀνθρώπου",pl:"ἀνθρώπων"}, dat:{sg:"ἀνθρώπῳ",pl:"ἀνθρώποις"}, ack:{sg:"ἄνθρωπον",pl:"ἀνθρώπους"}, vok:{sg:"ἄνθρωπε",pl:"ἄνθρωποι"} }},
  { lemma:"λόγος", glosa:"ord, berättelse", glosaGen:"ords, berättelses", glosaPl:"ord, berättelser", glosaGenPl:"ords, berättelsers", genus:"m", sem:[2], former:{
    nom:{sg:"λόγος",pl:"λόγοι"}, gen:{sg:"λόγου",pl:"λόγων"}, dat:{sg:"λόγῳ",pl:"λόγοις"}, ack:{sg:"λόγον",pl:"λόγους"}, vok:{sg:"λόγε",pl:"λόγοι"} }},
  { lemma:"οἶκος", glosa:"hus", glosaGen:"husets", glosaPl:"hus", glosaGenPl:"husens", genus:"m", sem:[2], former:{
    nom:{sg:"οἶκος",pl:"οἶκοι"}, gen:{sg:"οἴκου",pl:"οἴκων"}, dat:{sg:"οἴκῳ",pl:"οἴκοις"}, ack:{sg:"οἶκον",pl:"οἴκους"}, vok:{sg:"οἶκε",pl:"οἶκοι"} }},
  { lemma:"κύριος", glosa:"herre", glosaGen:"herres", glosaPl:"herrar", genus:"m", sem:[2], former:{
    nom:{sg:"κύριος",pl:"κύριοι"}, gen:{sg:"κυρίου",pl:"κυρίων"}, dat:{sg:"κυρίῳ",pl:"κυρίοις"}, ack:{sg:"κύριον",pl:"κυρίους"}, vok:{sg:"κύριε",pl:"κύριοι"} }},
  { lemma:"θεός", glosa:"gud", glosaGen:"guds", glosaPl:"gudar", genus:"m", sem:[1, 2], former:{
    nom:{sg:"θεός",pl:"θεοί"}, gen:{sg:"θεοῦ",pl:"θεῶν"}, dat:{sg:"θεῷ",pl:"θεοῖς"}, ack:{sg:"θεόν",pl:"θεούς"}, vok:{sg:"θεέ",pl:"θεοί"} }},
  { lemma:"ἀπόστολος", glosa:"apostel", glosaGen:"apostels", glosaPl:"apostlar", genus:"m", sem:[2], former:{
    nom:{sg:"ἀπόστολος",pl:"ἀπόστολοι"}, gen:{sg:"ἀποστόλου",pl:"ἀποστόλων"}, dat:{sg:"ἀποστόλῳ",pl:"ἀποστόλοις"}, ack:{sg:"ἀπόστολον",pl:"ἀποστόλους"}, vok:{sg:"ἀπόστολε",pl:"ἀπόστολοι"} }},
  { lemma:"ἄγγελος", glosa:"budbärare, ängel", glosaGen:"budbärares, ängels", glosaPl:"budbärare, änglar", glosaGenPl:"budbärares, änglars", genus:"m", sem:[1, 2], former:{
    nom:{sg:"ἄγγελος",pl:"ἄγγελοι"}, gen:{sg:"ἀγγέλου",pl:"ἀγγέλων"}, dat:{sg:"ἀγγέλῳ",pl:"ἀγγέλοις"}, ack:{sg:"ἄγγελον",pl:"ἀγγέλους"}, vok:{sg:"ἄγγελε",pl:"ἄγγελοι"} }},
  { lemma:"δοῦλος", glosa:"slav", glosaGen:"slavs", glosaPl:"slavar", genus:"m", sem:[2], former:{
    nom:{sg:"δοῦλος",pl:"δοῦλοι"}, gen:{sg:"δούλου",pl:"δούλων"}, dat:{sg:"δούλῳ",pl:"δούλοις"}, ack:{sg:"δοῦλον",pl:"δούλους"}, vok:{sg:"δοῦλε",pl:"δοῦλοι"} }},
  { lemma:"ἀδελφός", glosa:"bror", glosaGen:"brors", glosaPl:"bröder", genus:"m", sem:[2], former:{
    nom:{sg:"ἀδελφός",pl:"ἀδελφοί"}, gen:{sg:"ἀδελφοῦ",pl:"ἀδελφῶν"}, dat:{sg:"ἀδελφῷ",pl:"ἀδελφοῖς"}, ack:{sg:"ἀδελφόν",pl:"ἀδελφούς"}, vok:{sg:"ἀδελφέ",pl:"ἀδελφοί"} }},
  { lemma:"ἄρτος", glosa:"bröd", glosaGen:"bröds", glosaPl:"bröd", genus:"m", sem:[], former:{
    nom:{sg:"ἄρτος",pl:"ἄρτοι"}, gen:{sg:"ἄρτου",pl:"ἄρτων"}, dat:{sg:"ἄρτῳ",pl:"ἄρτοις"}, ack:{sg:"ἄρτον",pl:"ἄρτους"}, vok:{sg:"ἄρτε",pl:"ἄρτοι"} }},
  { lemma:"θάνατος", glosa:"död", glosaGen:"döds", glosaPl:"dödar", genus:"m", sem:[], former:{
    nom:{sg:"θάνατος",pl:"θάνατοι"}, gen:{sg:"θανάτου",pl:"θανάτων"}, dat:{sg:"θανάτῳ",pl:"θανάτοις"}, ack:{sg:"θάνατον",pl:"θανάτους"}, vok:{sg:"θάνατε",pl:"θάνατοι"} }},
  { lemma:"καιρός", glosa:"tid", glosaGen:"tids", glosaPl:"tider", genus:"m", sem:[], former:{
    nom:{sg:"καιρός",pl:"καιροί"}, gen:{sg:"καιροῦ",pl:"καιρῶν"}, dat:{sg:"καιρῷ",pl:"καιροῖς"}, ack:{sg:"καιρόν",pl:"καιρούς"}, vok:{sg:"καιρέ",pl:"καιροί"} }},
  { lemma:"καρπός", glosa:"frukt", glosaGen:"frukts", glosaPl:"frukter", genus:"m", sem:[], former:{
    nom:{sg:"καρπός",pl:"καρποί"}, gen:{sg:"καρποῦ",pl:"καρπῶν"}, dat:{sg:"καρπῷ",pl:"καρποῖς"}, ack:{sg:"καρπόν",pl:"καρπούς"}, vok:{sg:"καρπέ",pl:"καρποί"} }},
  { lemma:"κόσμος", glosa:"värld", glosaGen:"världs", glosaPl:"världar", genus:"m", sem:[], former:{
    nom:{sg:"κόσμος",pl:"κόσμοι"}, gen:{sg:"κόσμου",pl:"κόσμων"}, dat:{sg:"κόσμῳ",pl:"κόσμοις"}, ack:{sg:"κόσμον",pl:"κόσμους"}, vok:{sg:"κόσμε",pl:"κόσμοι"} }},
  { lemma:"λαός", glosa:"folk", glosaGen:"folks", glosaPl:"folk", genus:"m", sem:[], former:{
    nom:{sg:"λαός",pl:"λαοί"}, gen:{sg:"λαοῦ",pl:"λαῶν"}, dat:{sg:"λαῷ",pl:"λαοῖς"}, ack:{sg:"λαόν",pl:"λαούς"}, vok:{sg:"λαέ",pl:"λαοί"} }},
  { lemma:"νόμος", glosa:"lag", glosaGen:"lags", glosaPl:"lagar", genus:"m", sem:[], former:{
    nom:{sg:"νόμος",pl:"νόμοι"}, gen:{sg:"νόμου",pl:"νόμων"}, dat:{sg:"νόμῳ",pl:"νόμοις"}, ack:{sg:"νόμον",pl:"νόμους"}, vok:{sg:"νόμε",pl:"νόμοι"} }},
  { lemma:"οὐρανός", glosa:"himmel", glosaGen:"himmels", glosaPl:"himlar", genus:"m", sem:[2], former:{
    nom:{sg:"οὐρανός",pl:"οὐρανοί"}, gen:{sg:"οὐρανοῦ",pl:"οὐρανῶν"}, dat:{sg:"οὐρανῷ",pl:"οὐρανοῖς"}, ack:{sg:"οὐρανόν",pl:"οὐρανούς"}, vok:{sg:"οὐρανέ",pl:"οὐρανοί"} }},
  { lemma:"ὀφθαλμός", glosa:"öga", glosaGen:"ögas", glosaPl:"ögon", genus:"m", sem:[], former:{
    nom:{sg:"ὀφθαλμός",pl:"ὀφθαλμοί"}, gen:{sg:"ὀφθαλμοῦ",pl:"ὀφθαλμῶν"}, dat:{sg:"ὀφθαλμῷ",pl:"ὀφθαλμοῖς"}, ack:{sg:"ὀφθαλμόν",pl:"ὀφθαλμούς"}, vok:{sg:"ὀφθαλμέ",pl:"ὀφθαλμοί"} }},
  { lemma:"ὄχλος", glosa:"folkhop", glosaGen:"folkhops", glosaPl:"folkhopar", genus:"m", sem:[], former:{
    nom:{sg:"ὄχλος",pl:"ὄχλοι"}, gen:{sg:"ὄχλου",pl:"ὄχλων"}, dat:{sg:"ὄχλῳ",pl:"ὄχλοις"}, ack:{sg:"ὄχλον",pl:"ὄχλους"}, vok:{sg:"ὄχλε",pl:"ὄχλοι"} }},
  { lemma:"τόπος", glosa:"plats", glosaGen:"platsens", glosaPl:"platser", genus:"m", sem:[], former:{
    nom:{sg:"τόπος",pl:"τόποι"}, gen:{sg:"τόπου",pl:"τόπων"}, dat:{sg:"τόπῳ",pl:"τόποις"}, ack:{sg:"τόπον",pl:"τόπους"}, vok:{sg:"τόπε",pl:"τόποι"} }},
  { lemma:"υἱός", glosa:"son", glosaGen:"sons", glosaPl:"söner", genus:"m", sem:[1], former:{
    nom:{sg:"υἱός",pl:"υἱοί"}, gen:{sg:"υἱοῦ",pl:"υἱῶν"}, dat:{sg:"υἱῷ",pl:"υἱοῖς"}, ack:{sg:"υἱόν",pl:"υἱούς"}, vok:{sg:"υἱέ",pl:"υἱοί"} }},
  { lemma:"Φαρισαῖος", glosa:"farisé", glosaGen:"farisés", glosaPl:"fariséer", genus:"m", sem:[], former:{
    nom:{sg:"Φαρισαῖος",pl:"Φαρισαῖοι"}, gen:{sg:"Φαρισαίου",pl:"Φαρισαίων"}, dat:{sg:"Φαρισαίῳ",pl:"Φαρισαίοις"}, ack:{sg:"Φαρισαῖον",pl:"Φαρισαίους"}, vok:{sg:"Φαρισαῖε",pl:"Φαρισαῖοι"} }},
  { lemma:"Χριστός", glosa:"Kristus", glosaGen:"Kristi", glosaPl:"Kristus", genus:"m", sem:[], former:{
    nom:{sg:"Χριστός",pl:"Χριστοί"}, gen:{sg:"Χριστοῦ",pl:"Χριστῶν"}, dat:{sg:"Χριστῷ",pl:"Χριστοῖς"}, ack:{sg:"Χριστόν",pl:"Χριστούς"}, vok:{sg:"Χριστέ",pl:"Χριστοί"} }},
  { lemma:"διάβολος", glosa:"djävul", glosaGen:"djävuls", glosaPl:"djävlar", genus:"m", sem:[1], former:{
    nom:{sg:"διάβολος",pl:"διάβολοι"}, gen:{sg:"διαβόλου",pl:"διαβόλων"}, dat:{sg:"διαβόλῳ",pl:"διαβόλοις"}, ack:{sg:"διάβολον",pl:"διαβόλους"}, vok:{sg:"διάβολε",pl:"διάβολοι"} }},
  { lemma:"παράδεισος", glosa:"paradis", glosaGen:"paradisets", glosaPl:"paradis", glosaGenPl:"paradisens", genus:"m", sem:[1], former:{
    nom:{sg:"παράδεισος",pl:"παράδεισοι"}, gen:{sg:"παραδείσου",pl:"παραδείσων"}, dat:{sg:"παραδείσῳ",pl:"παραδείσοις"}, ack:{sg:"παράδεισον",pl:"παραδείσους"}, vok:{sg:"παράδεισε",pl:"παράδεισοι"} }},
  { lemma:"κατάλογος", glosa:"förteckning", glosaGen:"förtecknings", glosaPl:"förteckningar", genus:"m", sem:[1], former:{
    nom:{sg:"κατάλογος",pl:"κατάλογοι"}, gen:{sg:"καταλόγου",pl:"καταλόγων"}, dat:{sg:"καταλόγῳ",pl:"καταλόγοις"}, ack:{sg:"κατάλογον",pl:"καταλόγους"}, vok:{sg:"κατάλογε",pl:"κατάλογοι"} }},
  { lemma:"ἔργον", glosa:"verk, arbete", glosaGen:"verks", glosaPl:"verk, arbeten", glosaGenPl:"verks, arbetens", genus:"n", sem:[3], former:{
    nom:{sg:"ἔργον",pl:"ἔργα"}, gen:{sg:"ἔργου",pl:"ἔργων"}, dat:{sg:"ἔργῳ",pl:"ἔργοις"}, ack:{sg:"ἔργον",pl:"ἔργα"}, vok:{sg:"ἔργον",pl:"ἔργα"} }},
  { lemma:"τέκνον", glosa:"barn", glosaGen:"barns", glosaPl:"barn", genus:"n", sem:[3], former:{
    nom:{sg:"τέκνον",pl:"τέκνα"}, gen:{sg:"τέκνου",pl:"τέκνων"}, dat:{sg:"τέκνῳ",pl:"τέκνοις"}, ack:{sg:"τέκνον",pl:"τέκνα"}, vok:{sg:"τέκνον",pl:"τέκνα"} }},
  { lemma:"εὐαγγέλιον", glosa:"evangelium, glatt budskap", glosaGen:"evangeliums", glosaPl:"evangelier, glada budskap", glosaGenPl:"evangeliers, glada budskaps", genus:"n", sem:[3], former:{
    nom:{sg:"εὐαγγέλιον",pl:"εὐαγγέλια"}, gen:{sg:"εὐαγγελίου",pl:"εὐαγγελίων"}, dat:{sg:"εὐαγγελίῳ",pl:"εὐαγγελίοις"}, ack:{sg:"εὐαγγέλιον",pl:"εὐαγγέλια"}, vok:{sg:"εὐαγγέλιον",pl:"εὐαγγέλια"} }},
  { lemma:"ἱερόν", glosa:"tempel", glosaGen:"tempels", glosaPl:"tempel", genus:"n", sem:[3], former:{
    nom:{sg:"ἱερόν",pl:"ἱερά"}, gen:{sg:"ἱεροῦ",pl:"ἱερῶν"}, dat:{sg:"ἱερῷ",pl:"ἱεροῖς"}, ack:{sg:"ἱερόν",pl:"ἱερά"}, vok:{sg:"ἱερόν",pl:"ἱερά"} }},
  { lemma:"σημεῖον", glosa:"tecken", glosaGen:"tecknets", glosaPl:"tecken", genus:"n", sem:[3], former:{
    nom:{sg:"σημεῖον",pl:"σημεῖα"}, gen:{sg:"σημείου",pl:"σημείων"}, dat:{sg:"σημείῳ",pl:"σημείοις"}, ack:{sg:"σημεῖον",pl:"σημεῖα"}, vok:{sg:"σημεῖον",pl:"σημεῖα"} }},
  { lemma:"πλοῖον", glosa:"båt, skepp", glosaGen:"båts", glosaPl:"båtar, skepp", glosaGenPl:"båtars, skepps", genus:"n", sem:[3], former:{
    nom:{sg:"πλοῖον",pl:"πλοῖα"}, gen:{sg:"πλοίου",pl:"πλοίων"}, dat:{sg:"πλοίῳ",pl:"πλοίοις"}, ack:{sg:"πλοῖον",pl:"πλοῖα"}, vok:{sg:"πλοῖον",pl:"πλοῖα"} }},
  { lemma:"σάββατον", glosa:"sabbat", glosaGen:"sabbats", glosaPl:"sabbater", genus:"n", sem:[3], former:{
    nom:{sg:"σάββατον",pl:"σάββατα"}, gen:{sg:"σαββάτου",pl:"σαββάτων"}, dat:{sg:"σαββάτῳ",pl:"σαββάτοις"}, ack:{sg:"σάββατον",pl:"σάββατα"}, vok:{sg:"σάββατον",pl:"σάββατα"} }},
  { lemma:"ἀρχή", glosa:"begynnelse", glosaGen:"begynnelses", glosaPl:"begynnelser", genus:"f", sem:[4], former:{
    nom:{sg:"ἀρχή",pl:"ἀρχαί"}, gen:{sg:"ἀρχῆς",pl:"ἀρχῶν"}, dat:{sg:"ἀρχῇ",pl:"ἀρχαῖς"}, ack:{sg:"ἀρχήν",pl:"ἀρχάς"}, vok:{sg:"ἀρχή",pl:"ἀρχαί"} }},
  { lemma:"φωνή", glosa:"röst", glosaGen:"rösts", glosaPl:"röster", genus:"f", sem:[], former:{
    nom:{sg:"φωνή",pl:"φωναί"}, gen:{sg:"φωνῆς",pl:"φωνῶν"}, dat:{sg:"φωνῇ",pl:"φωναῖς"}, ack:{sg:"φωνήν",pl:"φωνάς"}, vok:{sg:"φωνή",pl:"φωναί"} }},
  { lemma:"ψυχή", glosa:"själ", glosaGen:"själs", glosaPl:"själar", genus:"f", sem:[4], former:{
    nom:{sg:"ψυχή",pl:"ψυχαί"}, gen:{sg:"ψυχῆς",pl:"ψυχῶν"}, dat:{sg:"ψυχῇ",pl:"ψυχαῖς"}, ack:{sg:"ψυχήν",pl:"ψυχάς"}, vok:{sg:"ψυχή",pl:"ψυχαί"} }},
  { lemma:"ζωή", glosa:"liv", glosaGen:"livs", glosaPl:"liv", genus:"f", sem:[], former:{
    nom:{sg:"ζωή",pl:"ζωαί"}, gen:{sg:"ζωῆς",pl:"ζωῶν"}, dat:{sg:"ζωῇ",pl:"ζωαῖς"}, ack:{sg:"ζωήν",pl:"ζωάς"}, vok:{sg:"ζωή",pl:"ζωαί"} }},
  { lemma:"ἐντολή", glosa:"bud, uppdrag", glosaGen:"buds", glosaPl:"bud, uppdrag", glosaGenPl:"buds, uppdrags", genus:"f", sem:[4], former:{
    nom:{sg:"ἐντολή",pl:"ἐντολαί"}, gen:{sg:"ἐντολῆς",pl:"ἐντολῶν"}, dat:{sg:"ἐντολῇ",pl:"ἐντολαῖς"}, ack:{sg:"ἐντολήν",pl:"ἐντολάς"}, vok:{sg:"ἐντολή",pl:"ἐντολαί"} }},
  { lemma:"ἀδελφή", glosa:"syster", glosaGen:"systers", glosaPl:"systrar", genus:"f", sem:[4], former:{
    nom:{sg:"ἀδελφή",pl:"ἀδελφαί"}, gen:{sg:"ἀδελφῆς",pl:"ἀδελφῶν"}, dat:{sg:"ἀδελφῇ",pl:"ἀδελφαῖς"}, ack:{sg:"ἀδελφήν",pl:"ἀδελφάς"}, vok:{sg:"ἀδελφή",pl:"ἀδελφαί"} }},
  { lemma:"κεφαλή", glosa:"huvud", glosaGen:"huvuds", glosaPl:"huvuden", genus:"f", sem:[], former:{
    nom:{sg:"κεφαλή",pl:"κεφαλαί"}, gen:{sg:"κεφαλῆς",pl:"κεφαλῶν"}, dat:{sg:"κεφαλῇ",pl:"κεφαλαῖς"}, ack:{sg:"κεφαλήν",pl:"κεφαλάς"}, vok:{sg:"κεφαλή",pl:"κεφαλαί"} }},
  { lemma:"συναγωγή", glosa:"synagoga", glosaGen:"synagogas", glosaPl:"synagogor", genus:"f", sem:[], former:{
    nom:{sg:"συναγωγή",pl:"συναγωγαί"}, gen:{sg:"συναγωγῆς",pl:"συναγωγῶν"}, dat:{sg:"συναγωγῇ",pl:"συναγωγαῖς"}, ack:{sg:"συναγωγήν",pl:"συναγωγάς"}, vok:{sg:"συναγωγή",pl:"συναγωγαί"} }},
  { lemma:"ἀγάπη", glosa:"kärlek", glosaGen:"kärleks", glosaPl:"kärlekar", genus:"f", sem:[4], former:{
    nom:{sg:"ἀγάπη",pl:"ἀγάπαι"}, gen:{sg:"ἀγάπης",pl:"ἀγαπῶν"}, dat:{sg:"ἀγάπῃ",pl:"ἀγάπαις"}, ack:{sg:"ἀγάπην",pl:"ἀγάπας"}, vok:{sg:"ἀγάπη",pl:"ἀγάπαι"} }},
  { lemma:"εἰρήνη", glosa:"fred", glosaGen:"freds", glosaPl:"freder", genus:"f", sem:[4], former:{
    nom:{sg:"εἰρήνη",pl:"εἰρῆναι"}, gen:{sg:"εἰρήνης",pl:"εἰρηνῶν"}, dat:{sg:"εἰρήνῃ",pl:"εἰρήναις"}, ack:{sg:"εἰρήνην",pl:"εἰρήνας"}, vok:{sg:"εἰρήνη",pl:"εἰρῆναι"} }},
  { lemma:"δικαιοσύνη", glosa:"rättfärdighet, rättvisa", glosaGen:"rättfärdighets", glosaPl:"rättfärdigheter, rättvisor", glosaGenPl:"rättfärdigheters, rättvisors", genus:"f", sem:[], former:{
    nom:{sg:"δικαιοσύνη",pl:"δικαιοσύναι"}, gen:{sg:"δικαιοσύνης",pl:"δικαιοσυνῶν"}, dat:{sg:"δικαιοσύνῃ",pl:"δικαιοσύναις"}, ack:{sg:"δικαιοσύνην",pl:"δικαιοσύνας"}, vok:{sg:"δικαιοσύνη",pl:"δικαιοσύναι"} }},
  { lemma:"ἐκκλησία", glosa:"församling, kyrka", glosaGen:"församlings", glosaPl:"församlingar, kyrkor", glosaGenPl:"församlingars, kyrkors", genus:"f", sem:[], former:{
    nom:{sg:"ἐκκλησία",pl:"ἐκκλησίαι"}, gen:{sg:"ἐκκλησίας",pl:"ἐκκλησιῶν"}, dat:{sg:"ἐκκλησίᾳ",pl:"ἐκκλησίαις"}, ack:{sg:"ἐκκλησίαν",pl:"ἐκκλησίας"}, vok:{sg:"ἐκκλησία",pl:"ἐκκλησίαι"} }},
  { lemma:"ἡμέρα", glosa:"dag", glosaGen:"dags", glosaPl:"dagar", genus:"f", sem:[], former:{
    nom:{sg:"ἡμέρα",pl:"ἡμέραι"}, gen:{sg:"ἡμέρας",pl:"ἡμερῶν"}, dat:{sg:"ἡμέρᾳ",pl:"ἡμέραις"}, ack:{sg:"ἡμέραν",pl:"ἡμέρας"}, vok:{sg:"ἡμέρα",pl:"ἡμέραι"} }},
  { lemma:"ἁμαρτία", glosa:"synd, felsteg", glosaGen:"synds", glosaPl:"synder, felsteg", glosaGenPl:"synders, felstegs", genus:"f", sem:[], former:{
    nom:{sg:"ἁμαρτία",pl:"ἁμαρτίαι"}, gen:{sg:"ἁμαρτίας",pl:"ἁμαρτιῶν"}, dat:{sg:"ἁμαρτίᾳ",pl:"ἁμαρτίαις"}, ack:{sg:"ἁμαρτίαν",pl:"ἁμαρτίας"}, vok:{sg:"ἁμαρτία",pl:"ἁμαρτίαι"} }},
  { lemma:"ἐξουσία", glosa:"makt", glosaGen:"makts", glosaPl:"makter", genus:"f", sem:[], former:{
    nom:{sg:"ἐξουσία",pl:"ἐξουσίαι"}, gen:{sg:"ἐξουσίας",pl:"ἐξουσιῶν"}, dat:{sg:"ἐξουσίᾳ",pl:"ἐξουσίαις"}, ack:{sg:"ἐξουσίαν",pl:"ἐξουσίας"}, vok:{sg:"ἐξουσία",pl:"ἐξουσίαι"} }},
  { lemma:"καρδία", glosa:"hjärta", glosaGen:"hjärtas", glosaPl:"hjärtan", genus:"f", sem:[], former:{
    nom:{sg:"καρδία",pl:"καρδίαι"}, gen:{sg:"καρδίας",pl:"καρδιῶν"}, dat:{sg:"καρδίᾳ",pl:"καρδίαις"}, ack:{sg:"καρδίαν",pl:"καρδίας"}, vok:{sg:"καρδία",pl:"καρδίαι"} }},
  { lemma:"βασιλεία", glosa:"rike, kungadöme", glosaGen:"rikes", glosaPl:"riken, kungadömen", glosaGenPl:"rikens, kungadömens", genus:"f", sem:[4], former:{
    nom:{sg:"βασιλεία",pl:"βασιλεῖαι"}, gen:{sg:"βασιλείας",pl:"βασιλειῶν"}, dat:{sg:"βασιλείᾳ",pl:"βασιλείαις"}, ack:{sg:"βασιλείαν",pl:"βασιλείας"}, vok:{sg:"βασιλεία",pl:"βασιλεῖαι"} }},
  { lemma:"ὥρα", glosa:"stund, timme", glosaGen:"stunds", glosaPl:"stunder, timmar", glosaGenPl:"stunders, timmars", genus:"f", sem:[], former:{
    nom:{sg:"ὥρα",pl:"ὧραι"}, gen:{sg:"ὥρας",pl:"ὡρῶν"}, dat:{sg:"ὥρᾳ",pl:"ὥραις"}, ack:{sg:"ὥραν",pl:"ὥρας"}, vok:{sg:"ὥρα",pl:"ὧραι"} }},
  { lemma:"ἀλήθεια", glosa:"sanning", glosaGen:"sannings", glosaPl:"sanningar", genus:"f", sem:[4], former:{
    nom:{sg:"ἀλήθεια",pl:"ἀλήθειαι"}, gen:{sg:"ἀληθείας",pl:"ἀληθειῶν"}, dat:{sg:"ἀληθείᾳ",pl:"ἀληθείαις"}, ack:{sg:"ἀλήθειαν",pl:"ἀληθείας"}, vok:{sg:"ἀλήθεια",pl:"ἀλήθειαι"} }},
  { lemma:"θάλασσα", glosa:"hav, sjö", glosaGen:"havs", glosaPl:"hav, sjöar", glosaGenPl:"havs, sjöars", genus:"f", sem:[], former:{
    nom:{sg:"θάλασσα",pl:"θάλασσαι"}, gen:{sg:"θαλάσσης",pl:"θαλασσῶν"}, dat:{sg:"θαλάσσῃ",pl:"θαλάσσαις"}, ack:{sg:"θάλασσαν",pl:"θαλάσσας"}, vok:{sg:"θάλασσα",pl:"θάλασσαι"} }},
  { lemma:"κώμη", glosa:"by", glosaGen:"bys", glosaPl:"byar", genus:"f", sem:[5], former:{
    nom:{sg:"κώμη",pl:"κῶμαι"}, gen:{sg:"κώμης",pl:"κωμῶν"}, dat:{sg:"κώμῃ",pl:"κώμαις"}, ack:{sg:"κώμην",pl:"κώμας"}, vok:{sg:"κώμη",pl:"κῶμαι"} }},
  { lemma:"δόξα", glosa:"härlighet", glosaGen:"härlighets", glosaPl:"härligheter", genus:"f", sem:[5], former:{
    nom:{sg:"δόξα",pl:"δόξαι"}, gen:{sg:"δόξης",pl:"δοξῶν"}, dat:{sg:"δόξῃ",pl:"δόξαις"}, ack:{sg:"δόξαν",pl:"δόξας"}, vok:{sg:"δόξα",pl:"δόξαι"} }},
  { lemma:"λίθος", glosa:"sten", glosaGen:"stens", glosaPl:"stenar", genus:"m", sem:[5], former:{
    nom:{sg:"λίθος",pl:"λίθοι"}, gen:{sg:"λίθου",pl:"λίθων"}, dat:{sg:"λίθῳ",pl:"λίθοις"}, ack:{sg:"λίθον",pl:"λίθους"}, vok:{sg:"λίθε",pl:"λίθοι"} }},
  { lemma:"δαιμόνιον", glosa:"demon", glosaGen:"demons", glosaPl:"demoner", genus:"n", sem:[5], former:{
    nom:{sg:"δαιμόνιον",pl:"δαιμόνια"}, gen:{sg:"δαιμονίου",pl:"δαιμονίων"}, dat:{sg:"δαιμονίῳ",pl:"δαιμονίοις"}, ack:{sg:"δαιμόνιον",pl:"δαιμόνια"}, vok:{sg:"δαιμόνιον",pl:"δαιμόνια"} }},
  { lemma:"φίλος", glosa:"vän", glosaGen:"väns", glosaPl:"vänner", genus:"m", sem:[5], former:{
    nom:{sg:"φίλος",pl:"φίλοι"}, gen:{sg:"φίλου",pl:"φίλων"}, dat:{sg:"φίλῳ",pl:"φίλοις"}, ack:{sg:"φίλον",pl:"φίλους"}, vok:{sg:"φίλε",pl:"φίλοι"} }}
];

const KORTLEKAR = {
  oxytona: ["θεός","ἀδελφός","καιρός","καρπός","λαός","οὐρανός","ὀφθαλμός","υἱός","Χριστός","ἱερόν","ἀρχή","φωνή","ψυχή","ζωή","ἐντολή","ἀδελφή","κεφαλή","συναγωγή","ὁδός","μαθητής"],
  neutrum: ["ἔργον","τέκνον","εὐαγγέλιον","ἱερόν","σημεῖον","πλοῖον","σάββατον","δαιμόνιον"],
  feminina: ["ἀρχή","φωνή","ψυχή","ζωή","ἐντολή","ἀδελφή","κεφαλή","συναγωγή","ἀγάπη","εἰρήνη","δικαιοσύνη","ἐκκλησία","ἡμέρα","ἁμαρτία","ἐξουσία","καρδία","βασιλεία","ὥρα","ἀλήθεια","θάλασσα","κώμη","δόξα","νόσος","ὁδός","ἔρημος","παρθένος"],
};

/* Seminarie-axel: varje ord bär sem:[…] ur ord.json. 0 = "Övriga" (otaggade
   högfrekventa NT-ord). Skalar till fler seminarier — chipsen radbryts. */
const SEMINARIER = [...new Set(ord.flatMap(o => o.sem))].sort((a,b) => a - b);
const HAR_OVRIGA = ord.some(o => o.sem.length === 0);
const SEM_VARDEN = [...SEMINARIER, ...(HAR_OVRIGA ? [0] : [])];
const semNamn = s => s === 0 ? "Övriga" : "Sem " + s;
const semMatch = o => o.sem.length
  ? o.sem.some(s => state.valdaSem.has(s))
  : state.valdaSem.has(0);

/* ── HJÄLPARE ────────────────────────────────────────────────────────── */
function pick(arr){ return arr[Math.floor(Math.random()*arr.length)]; }
function shuffle(arr){ const a=arr.slice(); for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]];} return a; }
function strip(s){ return s.normalize("NFD").replace(/[\u0300\u0301\u0342\u0313\u0314\u0308\u0304\u0306]/g,"").normalize("NFC"); }
function paradigmKey(o){
  if(o.genus==="m") return "m2";
  if(o.genus==="n") return "n2";
  if(strip(o.former.nom.sg).endsWith("η")) return "f1h";
  return strip(o.former.gen.sg).endsWith("ας") ? "f1a" : "f1m";
}

/* Distraktorer: most-constrained-first. Tier 1 = rätt slot men FEL paradigm/
   genus (den vassaste förväxlingen), tier 2 = samma paradigm men annan slot,
   tier 3 = global utfyllnad. Kollisioner och facit gallras bort. */
function byggDistraktorer(facit, tier1, tier2, tier3, antal){
  const ut = [facit];
  for(const tier of [shuffle(tier1), shuffle(tier2), shuffle(tier3)]){
    for(const x of tier){ if(ut.length>=antal) break; if(!ut.includes(x)) ut.push(x); }
  }
  return shuffle(ut);
}
function andelseOptioner(pk, k, n, antal){
  const facit = END[pk][k][n];
  const t1=[], t2=[], t3=[];
  for(const p in END){ if(p!==pk){ const e=END[p][k][n]; if(e!==facit) t1.push(e); } }
  for(const kk of KASUS_ORDNING) for(const nn of ["sg","pl"]){ const e=END[pk][kk][nn]; if(e!==facit) t2.push(e); }
  const alla=new Set(); for(const p in END) for(const kk of KASUS_ORDNING) for(const nn of ["sg","pl"]) alla.add(END[p][kk][nn]);
  alla.forEach(e=>{ if(e!==facit) t3.push(e); });
  return { facit, optioner: byggDistraktorer(facit, t1, t2, t3, antal) };
}
function artikelOptioner(genus, k, n, antal){
  const facit = ARTIKEL[genus][k][n];
  const t1=[], t2=[], t3=[];
  for(const g of ["m","n","f"]){ if(g!==genus){ const a=ARTIKEL[g][k][n]; if(a!==facit) t1.push(a); } }
  for(const kk of KASUS_ORDNING) for(const nn of ["sg","pl"]){ const a=ARTIKEL[genus][kk][nn]; if(a!==facit) t2.push(a); }
  const alla=new Set(); for(const g of ["m","n","f"]) for(const kk of KASUS_ORDNING) for(const nn of ["sg","pl"]) alla.add(ARTIKEL[g][kk][nn]);
  alla.forEach(a=>{ if(a!==facit) t3.push(a); });
  return { facit, optioner: byggDistraktorer(facit, t1, t2, t3, antal) };
}

/* Svensk glosa med kasusmarkör — samma princip som kasusspelet. */
function glosaMedKasus(w, k, n){
  const genS = b => /[sxz]$/.test(b) ? b : b + "s";
  const bas  = n === "pl" ? (w.glosaPl || w.glosa) : w.glosa;
  if(k === "gen"){ if(n === "pl") return w.glosaGenPl || genS(bas); return w.glosaGen || genS(bas); }
  if(k === "dat") return "till " + bas;
  if(k === "vok") return "o " + bas;
  return bas;
}

/* Pedagogisk not — lyfter just den diskriminering kortet tränar. */
function byggNot(o, pk, k, n){
  if(k === "vok") return "ὦ är en interjektion vid tilltal, inte en riktig artikel."
    + (pk === "m2" && n === "sg" ? " Vokativ singular har egen ändelse -ε i deklination 2 mask." : "");
  if(pk === "n2" && (k === "nom" || k === "ack"))
    return "Neutrum: nominativ och ackusativ är alltid lika (-ον i singular, -α i plural) — bara satsen avgör vilket.";
  if(pk === "f1h") return "η-stam: η genom hela singularis (nom -η, gen -ης, dat -ῃ, ack -ην).";
  if(pk === "f1a") return "Ren α: stammen slutar på ε, ι eller ρ, så α behålls i hela singularis (gen -ας, inte -ης).";
  if(pk === "f1m") return "Blandad α: nom och ack har α (-α, -αν), men gen och dat går över till η (-ης, -ῃ). Pluralen är som de andra.";
  return "";
}

/* ── TILLSTÅND ───────────────────────────────────────────────────────── */
const LAGER = "grekiska-andelsespel";
const state = {
  mode: "full",                                   // "full" | "end"
  numerus: "sg",                                  // "sg" | "pl" | "blandat"
  valdaOrd: new Set(ord.map(o => o.lemma)),
  valdaSem: new Set(SEM_VARDEN),
  valdaKasus: new Set(KASUS_ORDNING),
  streak: 0, best: 0,
  card: null, besvarad: false,
  selArt: null, selEnd: null, forraKort: null,
};

// Seminarie-urvalet styr vilka ord som visas i rutnätet; ordrutnätet finjusterar.
function synligaOrd(){ const p = ord.filter(semMatch); return p.length ? p : ord; }
function aktivaOrd(){
  const v = synligaOrd().filter(o => state.valdaOrd.has(o.lemma));
  return v.length ? v : synligaOrd();
}
function aktivaKasus(){ const v = KASUS_ORDNING.filter(k => state.valdaKasus.has(k)); return v.length ? v : KASUS_ORDNING; }

/* ── PERSISTENS ──────────────────────────────────────────────────────── */
function spara(){
  try{ localStorage.setItem(LAGER, JSON.stringify({
    mode:state.mode, numerus:state.numerus,
    valdaOrd:[...state.valdaOrd], valdaSem:[...state.valdaSem], valdaKasus:[...state.valdaKasus], best:state.best,
  })); }catch(e){}
}
function ladda(){
  try{
    const r = JSON.parse(localStorage.getItem(LAGER)); if(!r) return;
    if(r.mode) state.mode = r.mode;
    if(r.numerus) state.numerus = r.numerus;
    if(Array.isArray(r.valdaOrd))   state.valdaOrd   = new Set(r.valdaOrd.filter(l => ord.some(o=>o.lemma===l)));
    if(Array.isArray(r.valdaSem))   state.valdaSem   = new Set(r.valdaSem.filter(s => SEM_VARDEN.includes(s)));
    if(Array.isArray(r.valdaKasus)) state.valdaKasus = new Set(r.valdaKasus.filter(k => KASUS_ORDNING.includes(k)));
    if(!state.valdaSem.size) state.valdaSem = new Set(SEM_VARDEN);
    if(typeof r.best === "number") state.best = r.best;
  }catch(e){}
}

/* ── KORTLOGIK ───────────────────────────────────────────────────────── */
function uppdateraAntal(){ const el = $("ord-count"); if(el) el.textContent = "(" + aktivaOrd().length + " ord)"; }
function newQuestion(){
  const ordLista = aktivaOrd(), kasusLista = aktivaKasus();
  uppdateraAntal();
  let o, k, n, sig, forsok = 0;
  do {
    o = pick(ordLista); k = pick(kasusLista);
    n = state.numerus === "blandat" ? pick(["sg","pl"]) : state.numerus;
    sig = o.lemma + "|" + k + "|" + n;
  } while(sig === state.forraKort && ++forsok < 30);
  state.forraKort = sig;

  const pk = paradigmKey(o), g = o.genus;
  const eo = andelseOptioner(pk, k, n, 6);
  const ao = artikelOptioner(g, k, n, 6);
  const form = o.former[k][n];

  state.card = {
    lemma:o.lemma, genus:g, pk:pk, kasus:k, numerus:n,
    tag: GENUS_NAMN[g] + " · " + PARADIGM_NAMN[pk],
    slot: KASUS[k].namn + " " + (n === "sg" ? "singular" : "plural"),
    artFacit:ao.facit, artOpt:ao.optioner,
    endFacit:eo.facit, endOpt:eo.optioner,
    formFull: ARTIKEL[g][k][n] + " " + form,
    glosa: glosaMedKasus(o, k, n),
    not: byggNot(o, pk, k, n),
  };
  state.selArt = null; state.selEnd = null; state.besvarad = false;
  render();
}

/* ── RENDERING ───────────────────────────────────────────────────────── */
const $ = id => document.getElementById(id);

function klar(){ return state.mode === "end" ? !!state.selEnd : (!!state.selArt && !!state.selEnd); }

function renderOpts(){
  const c = state.card, ca = $("opts-art"), ce = $("opts-end");
  ca.innerHTML = ""; ce.innerHTML = "";

  if(state.mode === "end"){
    const b = document.createElement("button");
    b.className = "optx locked"; b.textContent = c.artFacit; b.disabled = true;
    b.setAttribute("aria-label", "artikel " + c.artFacit + " (given)");
    ca.appendChild(b);
  } else {
    c.artOpt.forEach(a => {
      const b = document.createElement("button");
      b.className = "optx"; b.textContent = a;
      b.setAttribute("aria-pressed", state.selArt === a);
      if(state.besvarad){ b.disabled = true;
        if(a === c.artFacit) b.classList.add("correct");
        else if(a === state.selArt) b.classList.add("wrong");
      } else { b.onclick = () => { state.selArt = a; renderOpts(); uppdateraGo(); }; }
      ca.appendChild(b);
    });
  }

  c.endOpt.forEach(e => {
    const b = document.createElement("button");
    b.className = "optx"; b.textContent = "-" + e;
    b.setAttribute("aria-pressed", state.selEnd === e);
    if(state.besvarad){ b.disabled = true;
      if(e === c.endFacit) b.classList.add("correct");
      else if(e === state.selEnd) b.classList.add("wrong");
    } else { b.onclick = () => { state.selEnd = e; renderOpts(); uppdateraGo(); }; }
    ce.appendChild(b);
  });
}
function uppdateraGo(){ if(!state.besvarad) $("btn-go").disabled = !klar(); }

function render(){
  const c = state.card;
  $("lemma").textContent = c.lemma;
  $("tag").textContent = c.tag;
  $("slot").textContent = c.slot;
  $("block-art").classList.toggle("hidden", false);
  $("streak").textContent = state.streak; $("best").textContent = state.best;
  renderOpts();

  if(state.besvarad){
    $("r-form").textContent = c.formFull;
    $("r-glosa").textContent = c.glosa;
    if(c.not){ $("r-not").textContent = c.not; $("r-not").classList.remove("hidden"); }
    else $("r-not").classList.add("hidden");
    $("reveal").classList.remove("hidden");
    $("btn-go").textContent = "Nästa"; $("btn-go").disabled = false;
  } else {
    $("reveal").classList.add("hidden");
    $("btn-go").textContent = "Rätta"; uppdateraGo();
  }
}

/* ── SVAR & SVIT ─────────────────────────────────────────────────────── */
function registrera(rätt){
  if(rätt){ state.streak++; if(state.streak > state.best){ state.best = state.streak; spara(); } }
  else state.streak = 0;
}
function rätta(){
  if(!klar()) return;
  const c = state.card;
  if(state.mode === "end") state.selArt = c.artFacit;
  state.besvarad = true;
  registrera(state.selEnd === c.endFacit && state.selArt === c.artFacit);
  render();
}

/* ── UI-BYGGE (väljaren) ─────────────────────────────────────────────── */
function byggGridSem(){
  const g = $("grid-sem"); g.innerHTML = "";
  SEM_VARDEN.forEach(s => {
    const b = document.createElement("button");
    b.className = "toggle"; b.textContent = semNamn(s);
    b.setAttribute("aria-pressed", state.valdaSem.has(s));
    b.onclick = () => {
      state.valdaSem.has(s) ? state.valdaSem.delete(s) : state.valdaSem.add(s);
      b.setAttribute("aria-pressed", state.valdaSem.has(s)); byggGridOrd(); spara(); newQuestion();
    };
    g.appendChild(b);
  });
}
function byggGridOrd(){
  const g = $("grid-ord"); g.innerHTML = "";
  synligaOrd().forEach(o => {                        // visar bara ord i valda seminarier
    const b = document.createElement("button");
    b.className = "toggle"; b.textContent = o.lemma;
    b.setAttribute("aria-pressed", state.valdaOrd.has(o.lemma));
    b.onclick = () => {
      state.valdaOrd.has(o.lemma) ? state.valdaOrd.delete(o.lemma) : state.valdaOrd.add(o.lemma);
      b.setAttribute("aria-pressed", state.valdaOrd.has(o.lemma)); spara(); newQuestion();
    };
    g.appendChild(b);
  });
}
function byggGridKasus(){
  const g = $("grid-kasus"); g.innerHTML = "";
  KASUS_ORDNING.forEach(k => {
    const b = document.createElement("button");
    b.className = "toggle"; b.textContent = k;
    b.dataset.tip = KASUS[k].namn; b.setAttribute("aria-label", KASUS[k].namn);
    b.setAttribute("aria-pressed", state.valdaKasus.has(k));
    b.onclick = () => {
      state.valdaKasus.has(k) ? state.valdaKasus.delete(k) : state.valdaKasus.add(k);
      b.setAttribute("aria-pressed", state.valdaKasus.has(k)); spara(); newQuestion();
    };
    g.appendChild(b);
  });
}
function uppdateraNumKnappar(){
  document.querySelectorAll("#seg-num button").forEach(b =>
    b.setAttribute("aria-pressed", b.dataset.num === state.numerus));
}
function uppdateraLägesknappar(){
  $("mode-full").setAttribute("aria-pressed", state.mode === "full");
  $("mode-end").setAttribute("aria-pressed", state.mode === "end");
}

/* ── HÄNDELSER ───────────────────────────────────────────────────────── */
$("mode-full").onclick = () => { state.mode="full"; uppdateraLägesknappar(); spara(); newQuestion(); };
$("mode-end").onclick  = () => { state.mode="end";  uppdateraLägesknappar(); spara(); newQuestion(); };
$("btn-go").onclick = () => { if(state.besvarad) newQuestion(); else rätta(); };

$("picker-toggle").onclick = () => {
  const open = $("picker-toggle").getAttribute("aria-expanded") === "true";
  $("picker-toggle").setAttribute("aria-expanded", !open);
  $("picker-body").classList.toggle("hidden", open);
};
document.querySelector("[data-ord-all]").onclick   = () => { state.valdaOrd = new Set(ord.map(o=>o.lemma)); byggGridOrd(); spara(); newQuestion(); };
document.querySelector("[data-ord-clear]").onclick = () => { state.valdaOrd = new Set(); byggGridOrd(); spara(); newQuestion(); };
document.querySelectorAll("[data-deck]").forEach(b => {
  b.onclick = () => { state.valdaOrd = new Set(KORTLEKAR[b.dataset.deck] || []); byggGridOrd(); spara(); newQuestion(); };
});
document.querySelector("[data-sem-all]").onclick  = () => { state.valdaSem = new Set(SEM_VARDEN); byggGridSem(); byggGridOrd(); spara(); newQuestion(); };
document.querySelector("[data-sem-none]").onclick = () => { state.valdaSem = new Set(); byggGridSem(); byggGridOrd(); spara(); newQuestion(); };
document.querySelector("[data-kasus-all]").onclick   = () => { state.valdaKasus = new Set(KASUS_ORDNING); byggGridKasus(); spara(); newQuestion(); };
document.querySelector("[data-kasus-core]").onclick  = () => { state.valdaKasus = new Set(["nom","gen","dat","ack"]); byggGridKasus(); spara(); newQuestion(); };
document.querySelector("[data-kasus-clear]").onclick = () => { state.valdaKasus = new Set(); byggGridKasus(); spara(); newQuestion(); };
document.querySelectorAll("#seg-num button").forEach(b =>
  b.onclick = () => { state.numerus = b.dataset.num; uppdateraNumKnappar(); spara(); newQuestion(); });

__kh = e => {
  if(e.key === "Enter"){ if(state.besvarad) newQuestion(); else if(klar()) rätta(); }
};
  document.addEventListener("keydown", __kh);;

/* ── START ───────────────────────────────────────────────────────────── */
ladda(); uppdateraLägesknappar(); uppdateraNumKnappar();
byggGridOrd(); byggGridKasus(); byggGridSem(); newQuestion();

}
