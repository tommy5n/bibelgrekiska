// Vy: Kasusigenkänning — portad exakt från grekiska-kasusspel.html
let __kh = null;
export function teardown(){ if(__kh){ document.removeEventListener("keydown", __kh); __kh = null; } }
const MARKUP = `<div class="vy vy-kasus">
<header>
  <h1>Grekiska — kasusigenkänning</h1>
  <div class="sub">Läs formen, säg kasus. Tre genus, artikeln visar vägen.</div>
</header>

<div class="modes" role="group" aria-label="Spelläge">
  <button class="mode" id="mode-vand" aria-pressed="true">Vänd-kort</button>
  <button class="mode" id="mode-flerval" aria-pressed="false">Flerval</button>
</div>

<div class="stage">
  <div class="card">
    <div class="form" id="form">—</div>
    <div class="glosa" id="glosa"></div>
    <div class="reveal hidden" id="reveal">
      <div class="kasus" id="r-kasus"></div>
      <div class="satsdel" id="r-satsdel"></div>
      <div class="fraga" id="r-fraga"></div>
      <div class="not hidden" id="r-not"></div>
    </div>
  </div>

  <!-- vänd-kort-kontroller -->
  <div class="controls" id="controls-vand">
    <button class="btn primary" id="btn-vand">Vänd</button>
  </div>
  <div class="controls hidden" id="controls-grade">
    <button class="btn good" id="btn-kunde">Kunde</button>
    <button class="btn bad" id="btn-missade">Missade</button>
  </div>

  <!-- flerval-kontroller -->
  <div class="options hidden" id="options"></div>
  <div class="controls hidden" id="controls-next">
    <button class="btn primary" id="btn-next">Nästa</button>
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
        <button class="chip" data-kasus-core>kärnsatsdelar</button>
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
  Tomt urval = allt. Artikeln (<code>ὁ</code> mask., <code>τὸ</code> neutr., <code>ἡ</code> fem.) visas alltid och
  avslöjar genus — den skiljer t.ex. nominativ <code>οἱ ἄνθρωποι</code> från vokativ <code>ὦ ἄνθρωποι</code>.
  Undantag: i neutrum är <code>τὸ ἔργον</code> både nominativ och ackusativ — där godtas båda svaren.
</footer>
</div>`;
export function render(root){
  root.innerHTML = MARKUP;

/* ── DATA ─────────────────────────────────────────────────────────────
   Artikeln är genusberoende (m/n/f) — den visas alltid och gör kortet
   lösbart. Ordformerna är utskrivna explicit, inte genererade ur stam+
   ändelse: accenten är inte mekanisk (ἀρχή→ἀρχῆς, θάλασσα→θαλάσσης).   */

const ARTIKEL = {
  m:{ nom:{sg:"ὁ",  pl:"οἱ"  }, gen:{sg:"τοῦ",pl:"τῶν" }, dat:{sg:"τῷ",pl:"τοῖς"}, ack:{sg:"τὸν",pl:"τοὺς"}, vok:{sg:"ὦ",pl:"ὦ"} },
  n:{ nom:{sg:"τὸ", pl:"τὰ"  }, gen:{sg:"τοῦ",pl:"τῶν" }, dat:{sg:"τῷ",pl:"τοῖς"}, ack:{sg:"τὸ", pl:"τὰ"  }, vok:{sg:"ὦ",pl:"ὦ"} },
  f:{ nom:{sg:"ἡ",  pl:"αἱ"  }, gen:{sg:"τῆς",pl:"τῶν" }, dat:{sg:"τῇ",pl:"ταῖς"}, ack:{sg:"τὴν",pl:"τὰς" }, vok:{sg:"ὦ",pl:"ὦ"} },
};   // grav på ack (τὸν/τὴν) — artikeln står före substantivet; vok ὦ är interjektion

const KASUS = {
  nom:{namn:"nominativ", satsdel:"subjekt",         fraga:"vem/vad gör?",          not:""},
  gen:{namn:"genitiv",   satsdel:"genitivattribut", fraga:"vems?",                 not:"Hör till ett substantiv, inte direkt till verbet — ett attribut."},
  dat:{namn:"dativ",     satsdel:"indirekt objekt", fraga:"till/åt/för vem?",      not:""},
  ack:{namn:"ackusativ", satsdel:"direkt objekt",   fraga:"vem/vad påverkas?",     not:""},
  vok:{namn:"vokativ",   satsdel:"tilltal",         fraga:"vem tilltalas?",        not:"ὦ är en interjektion, inte en artikel."},
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
  { lemma:"νόσος", glosa:"sjukdom", glosaGen:"sjukdoms", glosaPl:"sjukdomar", genus:"f", sem:[5], former:{
    nom:{sg:"νόσος",pl:"νόσοι"}, gen:{sg:"νόσου",pl:"νόσων"}, dat:{sg:"νόσῳ",pl:"νόσοις"}, ack:{sg:"νόσον",pl:"νόσους"}, vok:{sg:"νόσε",pl:"νόσοι"} }},
  { lemma:"ὁδός", glosa:"väg", glosaGen:"vägs", glosaPl:"vägar", genus:"f", sem:[5], former:{
    nom:{sg:"ὁδός",pl:"ὁδοί"}, gen:{sg:"ὁδοῦ",pl:"ὁδῶν"}, dat:{sg:"ὁδῷ",pl:"ὁδοῖς"}, ack:{sg:"ὁδόν",pl:"ὁδούς"}, vok:{sg:"ὁδέ",pl:"ὁδοί"} }},
  { lemma:"ἔρημος", glosa:"öken", glosaGen:"öknens", glosaPl:"öknar", genus:"f", sem:[5], former:{
    nom:{sg:"ἔρημος",pl:"ἔρημοι"}, gen:{sg:"ἐρήμου",pl:"ἐρήμων"}, dat:{sg:"ἐρήμῳ",pl:"ἐρήμοις"}, ack:{sg:"ἔρημον",pl:"ἐρήμους"}, vok:{sg:"ἔρημε",pl:"ἔρημοι"} }},
  { lemma:"παρθένος", glosa:"flicka, jungfru", glosaGen:"flickas", glosaPl:"flickor", genus:"f", sem:[5], former:{
    nom:{sg:"παρθένος",pl:"παρθένοι"}, gen:{sg:"παρθένου",pl:"παρθένων"}, dat:{sg:"παρθένῳ",pl:"παρθένοις"}, ack:{sg:"παρθένον",pl:"παρθένους"}, vok:{sg:"παρθένε",pl:"παρθένοι"} }},
  { lemma:"μαθητής", glosa:"lärjunge, elev", glosaGen:"lärjunges", glosaPl:"lärjungar", genus:"m", sem:[5], former:{
    nom:{sg:"μαθητής",pl:"μαθηταί"}, gen:{sg:"μαθητοῦ",pl:"μαθητῶν"}, dat:{sg:"μαθητῇ",pl:"μαθηταῖς"}, ack:{sg:"μαθητήν",pl:"μαθητάς"}, vok:{sg:"μαθητά",pl:"μαθηταί"} }},
  { lemma:"προφήτης", glosa:"profet", glosaGen:"profets", glosaPl:"profeter", genus:"m", sem:[5], former:{
    nom:{sg:"προφήτης",pl:"προφῆται"}, gen:{sg:"προφήτου",pl:"προφητῶν"}, dat:{sg:"προφήτῃ",pl:"προφήταις"}, ack:{sg:"προφήτην",pl:"προφήτας"}, vok:{sg:"προφῆτα",pl:"προφῆται"} }},
  { lemma:"νεανίας", glosa:"yngling", glosaGen:"ynglings", glosaPl:"ynglingar", genus:"m", sem:[5], former:{
    nom:{sg:"νεανίας",pl:"νεανίαι"}, gen:{sg:"νεανίου",pl:"νεανιῶν"}, dat:{sg:"νεανίᾳ",pl:"νεανίαις"}, ack:{sg:"νεανίαν",pl:"νεανίας"}, vok:{sg:"νεανία",pl:"νεανίαι"} }},
  { lemma:"οἰκοδεσπότης", glosa:"husbonde", glosaGen:"husbondes", glosaPl:"husbönder", genus:"m", sem:[5], former:{
    nom:{sg:"οἰκοδεσπότης",pl:"οἰκοδεσπόται"}, gen:{sg:"οἰκοδεσπότου",pl:"οἰκοδεσποτῶν"}, dat:{sg:"οἰκοδεσπότῃ",pl:"οἰκοδεσπόταις"}, ack:{sg:"οἰκοδεσπότην",pl:"οἰκοδεσπότας"}, vok:{sg:"οἰκοδέσποτα",pl:"οἰκοδεσπόται"} }},
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

/* Namngivna kortlekar (kategori-förval) — sparade ord-urval som återanvänder
   samma motor. Axel: accenttyp (oxytona får cirkumflex i gen/dat) resp. genus.
   Lekarna får överlappa. Seminarie-urvalet är en egen axel (se SEMINARIER). */
const KORTLEKAR = {
  oxytona: ["θεός","ἀδελφός","καιρός","καρπός","λαός","οὐρανός","ὀφθαλμός","υἱός","Χριστός","ἱερόν","ἀρχή","φωνή","ψυχή","ζωή","ἐντολή","ἀδελφή","κεφαλή","συναγωγή","ὁδός","μαθητής"],
  neutrum: ["ἔργον","τέκνον","εὐαγγέλιον","ἱερόν","σημεῖον","πλοῖον","σάββατον","δαιμόνιον"],
  feminina: ["ἀρχή","φωνή","ψυχή","ζωή","ἐντολή","ἀδελφή","κεφαλή","συναγωγή","ἀγάπη","εἰρήνη","δικαιοσύνη","ἐκκλησία","ἡμέρα","ἁμαρτία","ἐξουσία","καρδία","βασιλεία","ὥρα","ἀλήθεια","θάλασσα","κώμη","δόξα","νόσος","ὁδός","ἔρημος","παρθένος"],
};

/* Seminarie-axel: varje ord bär sem:[…] ur ord.json. 0 = "Övriga" (ord utan
   seminarietaggning, t.ex. högfrekventa NT-ord). Skalar till fler seminarier —
   chipsen radbryts. */
const SEMINARIER = [...new Set(ord.flatMap(o => o.sem))].sort((a,b) => a - b);
const HAR_OVRIGA = ord.some(o => o.sem.length === 0);
const SEM_VARDEN = [...SEMINARIER, ...(HAR_OVRIGA ? [0] : [])];
const semNamn = s => s === 0 ? "Övriga" : "Sem " + s;
const semMatch = o => o.sem.length
  ? o.sem.some(s => state.valdaSem.has(s))
  : state.valdaSem.has(0);

/* ── TILLSTÅND ───────────────────────────────────────────────────────── */
const LAGER = "grekiska-kasusspel";
const state = {
  mode: "vand",                                  // "vand" | "flerval"
  numerus: "sg",                                 // "sg" | "pl" | "blandat"
  valdaOrd: new Set(ord.map(o => o.lemma)),      // namn (lemma), inte objekt
  valdaSem: new Set(SEM_VARDEN),                 // seminarie-filter (0 = övriga)
  valdaKasus: new Set(KASUS_ORDNING),
  streak: 0,
  best: 0,
  card: null,                                    // upplöst EN gång i newQuestion()
  besvarad: false,
};

/* ── HJÄLPARE ────────────────────────────────────────────────────────── */
function pick(arr){ return arr[Math.floor(Math.random()*arr.length)]; }
function shuffle(arr){                            // Fisher-Yates
  const a = arr.slice();
  for(let i=a.length-1;i>0;i--){ const j=Math.floor(Math.random()*(i+1)); [a[i],a[j]]=[a[j],a[i]]; }
  return a;
}
function aktivaOrd(){
  const valda = ord.filter(o => state.valdaOrd.has(o.lemma) && semMatch(o));
  if(valda.length) return valda;
  const bySem = ord.filter(semMatch);            // tomt ord-urval = alla i valda seminarier
  return bySem.length ? bySem : ord;             // tomt seminarie-urval = alla
}
function aktivaKasus(){
  const valda = KASUS_ORDNING.filter(k => state.valdaKasus.has(k));
  return valda.length ? valda : KASUS_ORDNING;   // tomt = alla
}

/* ── PERSISTENS (localStorage, try/catch) ────────────────────────────── */
function spara(){
  try{
    localStorage.setItem(LAGER, JSON.stringify({
      mode: state.mode,
      numerus: state.numerus,
      valdaOrd: [...state.valdaOrd],
      valdaSem: [...state.valdaSem],
      valdaKasus: [...state.valdaKasus],
      best: state.best,
    }));
  }catch(e){ /* privat läge e.d. — strunt samma */ }
}
function ladda(){
  try{
    const r = JSON.parse(localStorage.getItem(LAGER));
    if(!r) return;
    if(r.mode) state.mode = r.mode;
    if(r.numerus) state.numerus = r.numerus;
    if(Array.isArray(r.valdaOrd))   state.valdaOrd   = new Set(r.valdaOrd.filter(l => ord.some(o=>o.lemma===l)));
    if(Array.isArray(r.valdaSem))   state.valdaSem   = new Set(r.valdaSem.filter(s => SEM_VARDEN.includes(s)));
    if(Array.isArray(r.valdaKasus)) state.valdaKasus = new Set(r.valdaKasus.filter(k => KASUS_ORDNING.includes(k)));
    if(!state.valdaSem.size) state.valdaSem = new Set(SEM_VARDEN);
    if(typeof r.best === "number") state.best = r.best;
  }catch(e){ /* trasig data — börja om rent */ }
}

/* ── KORTLOGIK ───────────────────────────────────────────────────────── */
function byggOptioner(facitSet){
  // alltid 4 alternativ: alla rätta svar + distraktorer ur aktiva kasus
  const behov = 4 - facitSet.length;            // 3 normalt, 2 vid neutrum nom/ack
  let pool = aktivaKasus().filter(k => !facitSet.includes(k));
  if(pool.length < behov){
    const extra = KASUS_ORDNING.filter(k => !facitSet.includes(k) && !pool.includes(k));
    pool = pool.concat(extra);
  }
  return shuffle([...facitSet, ...shuffle(pool).slice(0,behov)]);
}

/* Svensk kasusmarkör på glosan. Svenskan böjer inte i kasus — vi markerar
   funktionen: gen tar -s (svenskans enda äkta kasusböjning), dat och vok får
   ett ord framför som muterar inget. nom/ack är bara — svenskan skiljer dem
   med ordföljd, inte på ordet. Flerordiga/-s-slutande glosor har explicit glosaGen. */
function glosaMedKasus(w, k, n){
  // svensk genitiv: + "s", utom när basen redan slutar på s/x/z (då ingen extra)
  const genS = b => /[sxz]$/.test(b) ? b : b + "s";
  const bas  = n === "pl" ? (w.glosaPl || w.glosa) : w.glosa;   // numerus-bas
  if(k === "gen"){
    if(n === "pl") return w.glosaGenPl || genS(bas);            // människors
    return w.glosaGen || genS(bas);                             // människas (ev. oregelb.)
  }
  if(k === "dat") return "till " + bas;
  if(k === "vok") return "o " + bas;
  return bas;                                                   // nom, ack
}

function newQuestion(){
  const ordLista   = aktivaOrd();
  const kasusLista = aktivaKasus();

  // Dra kort, men undvik exakt samma kort (ord+kasus+numerus) två ggr i rad.
  // Taket skyddar mot loop när bara ett kort är möjligt — då finns inget annat.
  let w, k, n, sig, forsok = 0;
  do {
    w = pick(ordLista);
    k = pick(kasusLista);
    n = state.numerus === "blandat" ? pick(["sg","pl"]) : state.numerus;
    // neutrum nom/ack visar samma kort — normalisera så samma kort ej upprepas
    const ksig = (w.genus === "n" && (k === "nom" || k === "ack")) ? "nomack" : k;
    sig = w.lemma + "|" + ksig + "|" + n;
  } while(sig === state.forraKort && ++forsok < 30);
  state.forraKort = sig;

  // Neutrum: nom och ack är identiska (τὸ ἔργον = τὸ ἔργον) även med artikel
  // — bägge svaren gäller. Övriga genus skiljs alltid av artikeln.
  const tvetydig = w.genus === "n" && (k === "nom" || k === "ack");
  const facitSet = tvetydig ? ["nom","ack"] : [k];

  // ALLT löses upp en gång här — render() räknar aldrig om något.
  state.card = {
    visa:     ARTIKEL[w.genus][k][n] + " " + w.former[k][n],
    glosa:    glosaMedKasus(w, k, n),   // glosa + svensk kasusmarkör, upplöst en gång här
    numerus:  n,                     // sg/pl sparas så facit kan bekräfta numerus
    genus:    w.genus,
    facit:    k,
    facitSet: facitSet,              // godtagbara svar (≥2 endast för neutrum nom/ack)
    optioner: state.mode === "flerval" ? byggOptioner(facitSet) : null,
  };
  state.besvarad = false;
  render();
}

/* ── RENDERING ───────────────────────────────────────────────────────── */
const $ = id => document.getElementById(id);

function render(){
  const c = state.card;
  $("form").textContent = c.visa;
  $("glosa").textContent = c.glosa;
  $("glosa").classList.toggle("hidden", !state.besvarad);   // visas först vid vändning/svar

  $("streak").textContent = state.streak;
  $("best").textContent = state.best;

  // dölj allt lägesspecifikt först
  $("reveal").classList.add("hidden");
  $("controls-vand").classList.add("hidden");
  $("controls-grade").classList.add("hidden");
  $("options").classList.add("hidden");
  $("controls-next").classList.add("hidden");

  if(state.mode === "vand"){
    if(state.besvarad){
      visaFacit();
      $("controls-grade").classList.remove("hidden");
    }else{
      $("controls-vand").classList.remove("hidden");
    }
  }else{
    renderOptioner();
    $("options").classList.remove("hidden");
    if(state.besvarad){
      visaFacit();
      $("controls-next").classList.remove("hidden");
    }
  }
}

function visaFacit(){
  const c = state.card;
  if(c.facitSet.length > 1){            // neutrum: nom = ack
    $("r-kasus").textContent   = "nominativ / ackusativ · " + c.numerus;
    $("r-satsdel").textContent = "subjekt eller direkt objekt";
    $("r-fraga").textContent   = "(neutrum skiljer dem inte)";
    $("r-not").textContent     = "I neutrum är nominativ och ackusativ alltid lika — bara sammanhanget i satsen avgör vilket.";
    $("r-not").classList.remove("hidden");
  } else {
    const k = KASUS[c.facit];
    $("r-kasus").textContent   = k.namn + " · " + c.numerus;
    $("r-satsdel").textContent = k.satsdel;
    $("r-fraga").textContent   = "(" + k.fraga + ")";
    if(k.not){ $("r-not").textContent = k.not; $("r-not").classList.remove("hidden"); }
    else { $("r-not").classList.add("hidden"); }
  }
  $("reveal").classList.remove("hidden");
}

function renderOptioner(){
  const box = $("options"); box.innerHTML = "";
  state.card.optioner.forEach(k => {
    const b = document.createElement("button");
    b.className = "opt"; b.textContent = KASUS[k].namn; b.dataset.kasus = k;
    if(state.besvarad){
      b.disabled = true;
      if(state.card.facitSet.includes(k)) b.classList.add("correct");
      else if(k === state.valt) b.classList.add("wrong");
    }else{
      b.onclick = () => svaraFlerval(k);
    }
    box.appendChild(b);
  });
}

/* ── SVAR & SVIT ─────────────────────────────────────────────────────── */
function registrera(rätt){
  if(rätt){ state.streak++; if(state.streak > state.best){ state.best = state.streak; spara(); } }
  else { state.streak = 0; }
}
function svaraFlerval(k){
  state.valt = k;
  state.besvarad = true;
  registrera(state.card.facitSet.includes(k));
  render();
}

/* ── UI-BYGGE ────────────────────────────────────────────────────────── */
function byggGridOrd(){
  const g = $("grid-ord"); g.innerHTML = "";
  ord.forEach(o => {
    const b = document.createElement("button");
    b.className = "toggle"; b.textContent = o.lemma;
    b.setAttribute("aria-pressed", state.valdaOrd.has(o.lemma));
    b.onclick = () => {
      state.valdaOrd.has(o.lemma) ? state.valdaOrd.delete(o.lemma) : state.valdaOrd.add(o.lemma);
      b.setAttribute("aria-pressed", state.valdaOrd.has(o.lemma));
      spara(); newQuestion();
    };
    g.appendChild(b);
  });
}
function byggGridKasus(){
  const g = $("grid-kasus"); g.innerHTML = "";
  KASUS_ORDNING.forEach(k => {
    const b = document.createElement("button");
    b.className = "toggle";
    b.textContent = k;                              // gemener: "nom", "gen", "dat", "ack", "vok"
    b.dataset.tip = KASUS[k].namn;                  // egen CSS-tooltip (hover/fokus): hela ordet
    b.setAttribute("aria-label", KASUS[k].namn);    // skärmläsare läser hela ordet
    b.setAttribute("aria-pressed", state.valdaKasus.has(k));
    b.onclick = () => {
      state.valdaKasus.has(k) ? state.valdaKasus.delete(k) : state.valdaKasus.add(k);
      b.setAttribute("aria-pressed", state.valdaKasus.has(k));
      spara(); newQuestion();
    };
    g.appendChild(b);
  });
}
function byggGridSem(){
  const g = $("grid-sem"); g.innerHTML = "";
  SEM_VARDEN.forEach(s => {
    const b = document.createElement("button");
    b.className = "toggle"; b.textContent = semNamn(s);
    b.setAttribute("aria-pressed", state.valdaSem.has(s));
    b.onclick = () => {
      state.valdaSem.has(s) ? state.valdaSem.delete(s) : state.valdaSem.add(s);
      b.setAttribute("aria-pressed", state.valdaSem.has(s));
      spara(); newQuestion();
    };
    g.appendChild(b);
  });
}
function uppdateraNumKnappar(){
  document.querySelectorAll("#seg-num button").forEach(b =>
    b.setAttribute("aria-pressed", b.dataset.num === state.numerus));
}
function uppdateraLägesknappar(){
  $("mode-vand").setAttribute("aria-pressed", state.mode === "vand");
  $("mode-flerval").setAttribute("aria-pressed", state.mode === "flerval");
}

/* ── HÄNDELSER ───────────────────────────────────────────────────────── */
$("mode-vand").onclick = () => { state.mode="vand"; uppdateraLägesknappar(); spara(); newQuestion(); };
$("mode-flerval").onclick = () => { state.mode="flerval"; uppdateraLägesknappar(); spara(); newQuestion(); };

$("btn-vand").onclick = () => { state.besvarad = true; render(); };
$("btn-kunde").onclick = () => { registrera(true); newQuestion(); };
$("btn-missade").onclick = () => { registrera(false); newQuestion(); };
$("btn-next").onclick = () => newQuestion();

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
document.querySelector("[data-sem-all]").onclick  = () => { state.valdaSem = new Set(SEM_VARDEN); byggGridSem(); spara(); newQuestion(); };
document.querySelector("[data-sem-none]").onclick = () => { state.valdaSem = new Set(); byggGridSem(); spara(); newQuestion(); };
document.querySelector("[data-kasus-all]").onclick   = () => { state.valdaKasus = new Set(KASUS_ORDNING); byggGridKasus(); spara(); newQuestion(); };
document.querySelector("[data-kasus-core]").onclick  = () => { state.valdaKasus = new Set(["nom","ack","dat"]); byggGridKasus(); spara(); newQuestion(); };
document.querySelector("[data-kasus-clear]").onclick = () => { state.valdaKasus = new Set(); byggGridKasus(); spara(); newQuestion(); };

document.querySelectorAll("#seg-num button").forEach(b =>
  b.onclick = () => { state.numerus = b.dataset.num; uppdateraNumKnappar(); spara(); newQuestion(); });

// tangentbord: mellanslag vänder, siffror svarar i flerval
__kh = e => {
  if(e.code === "Space" && state.mode === "vand" && !state.besvarad){ e.preventDefault(); state.besvarad = true; render(); }
  else if(e.key === "Enter" && state.besvarad){ if(state.mode==="flerval") newQuestion(); }
  else if(state.mode === "flerval" && !state.besvarad && /^[1-4]$/.test(e.key)){
    const k = state.card.optioner[+e.key - 1]; if(k) svaraFlerval(k);
  }
};
  document.addEventListener("keydown", __kh);;

/* ── START ───────────────────────────────────────────────────────────── */
ladda();
uppdateraLägesknappar();
uppdateraNumKnappar();
byggGridOrd();
byggGridKasus();
byggGridSem();
newQuestion();

}
