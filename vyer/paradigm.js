// Vy: Paradigm — fyll i hela böjningstabellen (5 kasus × sg/pl) för ett ord.
// Kompletterar ändelsespelet (#7): där byggs EN cell i taget, här produceras
// hela paradigmet på en gång så mönstret syns som helhet (neutrum nom=ack,
// α-skiftena i dekl. 1, osv). Datan är samma ögonblicksbild som ändelsespelet.
let __kh = null;
export function teardown(){ if(__kh){ document.removeEventListener("keydown", __kh); __kh = null; } }

const CSS = `
.vy-paradigm .stage{ max-width:640px; margin:0 auto; }
.vy-paradigm .card{ background:var(--card); border:1px solid var(--line); border-radius:14px; padding:1rem 1.1rem 1.2rem; }
.vy-paradigm .lemma{ font-size:var(--fs-4xl); text-align:center; line-height:1.1; }
.vy-paradigm .tag{ text-align:center; color:var(--ink-soft); font-size:var(--fs-sm); margin-top:.2rem; }
.vy-paradigm .glosa{ text-align:center; color:var(--ink-soft); font-size:var(--fs-sm); font-style:italic; margin-top:.15rem; }
.vy-paradigm table.par{ width:100%; border-collapse:collapse; margin:1rem 0 .3rem; }
.vy-paradigm table.par th{ font-weight:600; color:var(--ink-soft); font-size:var(--fs-xs); padding:.3rem .4rem; text-align:center; }
.vy-paradigm table.par th.rowlab{ text-align:left; width:4.6rem; }
.vy-paradigm table.par td{ padding:.22rem .28rem; }
.vy-paradigm td.rowlab{ color:var(--ink-soft); font-size:var(--fs-sm); white-space:nowrap; }
.vy-paradigm .cell{ width:100%; min-height:2.6rem; border:1px solid var(--line); border-radius:9px; background:var(--paper);
  font-size:var(--fs-lg); color:var(--ink); cursor:pointer; padding:.35rem .3rem; line-height:1.15; text-align:center; }
.vy-paradigm .cell:hover:not(:disabled){ border-color:var(--gold); }
.vy-paradigm .cell.active{ border-color:var(--gold); box-shadow:0 0 0 2px color-mix(in srgb, var(--gold) 40%, transparent); }
.vy-paradigm .cell.empty{ color:var(--line); }
.vy-paradigm .cell .sub{ display:block; font-size:var(--fs-3xs); color:var(--bad); margin-top:.1rem; }
.vy-paradigm .cell.good{ background:var(--good-bg); border-color:var(--good); color:var(--good); cursor:default; }
.vy-paradigm .cell.bad{ background:var(--bad-bg); border-color:var(--bad); color:var(--bad); cursor:default; }
.vy-paradigm .cell.study{ cursor:default; background:var(--card); }
.vy-paradigm .palette{ display:flex; flex-wrap:wrap; gap:.4rem; justify-content:center; margin:.8rem 0 .2rem; }
.vy-paradigm .palette .end{ border:1px solid var(--line); border-radius:8px; background:var(--card); color:var(--ink);
  font-size:var(--fs-md); padding:.4rem .7rem; cursor:pointer; min-width:2.6rem; }
.vy-paradigm .palette .end:hover{ border-color:var(--gold); }
.vy-paradigm .palette-label{ text-align:center; color:var(--ink-soft); font-size:var(--fs-xs); margin-top:.6rem; }
.vy-paradigm .controls{ display:flex; gap:.6rem; justify-content:center; margin-top:1rem; }
.vy-paradigm .btn{ border:1px solid var(--line); border-radius:9px; background:var(--card); color:var(--ink);
  font-size:var(--fs-md); padding:.5rem 1.2rem; cursor:pointer; }
.vy-paradigm .btn.primary{ background:var(--gold); border-color:var(--gold); color:#fff; }
.vy-paradigm .btn:disabled{ opacity:.4; cursor:default; }
.vy-paradigm .scorebar{ text-align:center; color:var(--ink-soft); font-size:var(--fs-sm); margin-top:.9rem; }
.vy-paradigm .scorebar b{ color:var(--ink); }
.vy-paradigm .modes{ display:flex; gap:.5rem; justify-content:center; margin:0 0 1rem; }
.vy-paradigm .mode{ border:1px solid var(--line); border-radius:9px; background:var(--card); color:var(--ink-soft);
  font-size:var(--fs-sm); padding:.4rem .9rem; cursor:pointer; }
.vy-paradigm .seg{ display:inline-flex; border:1px solid var(--line); border-radius:9px; overflow:hidden; }
.vy-paradigm .seg button{ border:0; background:var(--card); color:var(--ink-soft); font-size:var(--fs-sm); padding:.4rem .9rem; cursor:pointer; }
.vy-paradigm .seg button + button{ border-left:1px solid var(--line); }
.vy-paradigm footer{ max-width:640px; margin:1.4rem auto 0; color:var(--ink-soft); font-size:var(--fs-sm); line-height:1.5; }
.vy-paradigm footer code{ font-size:var(--fs-md); }
/* .mode/.seg "valt"-svart + .hidden ärvs nu från de delade reglerna i app.css. */
`;

const MARKUP = `<div class="vy vy-paradigm">
<style>${CSS}</style>
<header>
  <h1>Grekiska — paradigm</h1>
  <div class="sub">Fyll i hela böjningstabellen: alla kasus i singular och plural.</div>
</header>

<div class="modes" role="group" aria-label="Läge">
  <button class="mode" id="mode-fyll" aria-pressed="true">Fyll i</button>
  <button class="mode" id="mode-studera" aria-pressed="false">Studera</button>
</div>

<div class="stage">
  <div class="card">
    <div class="lemma" id="lemma">—</div>
    <div class="tag" id="tag"></div>
    <div class="glosa" id="glosa"></div>

    <table class="par">
      <thead>
        <tr><th class="rowlab"></th><th>singular</th><th>plural</th></tr>
      </thead>
      <tbody id="tbody"></tbody>
    </table>

    <div id="palette-wrap">
      <div class="palette" id="palette"></div>
      <div class="palette-label">Tryck på en ruta, välj sedan ändelse. Accenten hör till ordet och visas i facit.</div>
    </div>
  </div>

  <div class="controls">
    <button class="btn primary" id="btn-go" disabled>Rätta</button>
  </div>

  <div class="scorebar">
    Rätt i rad: <b id="streak">0</b> &nbsp;·&nbsp; bästa: <b id="best">0</b>
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
        <span class="quicklabel">Deklination:</span>
        <button class="chip" data-cat="d1">Dekl. 1</button>
        <button class="chip" data-cat="d2">Dekl. 2</button>
      </div>
      <div class="quickrow">
        <span class="quicklabel">Typ:</span>
        <button class="chip" data-cat="m">mask. -ος</button>
        <button class="chip" data-cat="n">neutr. -ον</button>
        <button class="chip" data-cat="fh">fem. η</button>
        <button class="chip" data-cat="fa">fem. ren α</button>
        <button class="chip" data-cat="fm">fem. blandad α</button>
      </div>
      <div class="grid" id="grid-ord"></div>
    </div>

    <div class="picker-section">
      <h2>Vokativ</h2>
      <div class="seg" id="seg-vok" role="group" aria-label="Vokativ">
        <button data-vok="0" aria-pressed="true">utan vokativ</button>
        <button data-vok="1" aria-pressed="false">med vokativ</button>
      </div>
    </div>

  </div>
</div>

<footer>
  Du får lemmat (nominativ) och en tom tabell — fyll varje ruta med rätt ändelse, så visas
  hela det attesterade paradigmet. Sviten räknas bara upp när <b>hela</b> tabellen är rätt.
  I <i>studera</i>-läget visas paradigmet färdigt att läsa. Deklination 1 har tre singular-typer
  som bara nominativ avslöjar: <code>ἀρχή</code> (η), <code>ἡμέρα</code> (ren α), <code>θάλασσα</code> (blandad α).
</footer>
</div>`;

export function render(root){
  root.innerHTML = MARKUP;

/* ── DATA (samma ögonblicksbild som ändelsespelet) ───────────────────── */
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
const KASUS = { nom:"nominativ", gen:"genitiv", dat:"dativ", ack:"ackusativ", vok:"vokativ" };
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

/* Kategori-förval på deklinations-/typaxeln, som predikat på paradigmKey —
   härleds ur ord-listan så nya ord fångas automatiskt. Klick sätter ordurvalet;
   chipet blir svart (aria-pressed) när urvalet exakt motsvarar kategorin. */
const KATEGORIER = {
  d1: o => ["f1h","f1a","f1m"].includes(paradigmKey(o)),   // hela deklination 1
  d2: o => ["m2","n2"].includes(paradigmKey(o)),           // hela deklination 2
  m:  o => paradigmKey(o) === "m2",                        // mask. -ος
  n:  o => paradigmKey(o) === "n2",                        // neutr. -ον
  fh: o => paradigmKey(o) === "f1h",                       // fem. η-stam
  fa: o => paradigmKey(o) === "f1a",                       // fem. ren α
  fm: o => paradigmKey(o) === "f1m",                       // fem. blandad α
};
const katLemman = key => new Set(ord.filter(KATEGORIER[key]).map(o => o.lemma));

/* Seminarie-axel: varje ord bär sem:[…] ur ord.json. 0 = "Övriga". */
const SEMINARIER = [...new Set(ord.flatMap(o => o.sem))].sort((a,b) => a - b);
const HAR_OVRIGA = ord.some(o => o.sem.length === 0);
const SEM_VARDEN = [...SEMINARIER, ...(HAR_OVRIGA ? [0] : [])];
const semNamn = s => s === 0 ? "Övriga" : "Sem " + s;
const semMatch = o => o.sem.length
  ? o.sem.some(s => state.valdaSem.has(s))
  : state.valdaSem.has(0);

/* Palett: alla distinkta (accent-fria) ändelser över paradigmen — så valet
   kräver verklig diskriminering (dat.sg -ῳ vs -ῃ vs -ᾳ), inte bara matchning. */
const ANDELSER_ALLA = (() => {
  const s = [];
  for(const p in END) for(const k of KASUS_ORDNING) for(const n of ["sg","pl"]){
    const e = END[p][k][n]; if(!s.includes(e)) s.push(e);
  }
  return s;
})();

/* ── HJÄLPARE ────────────────────────────────────────────────────────── */
function pick(arr){ return arr[Math.floor(Math.random()*arr.length)]; }
function setEq(a,b){ return a.size===b.size && [...a].every(x=>b.has(x)); }
function strip(s){ return s.normalize("NFD").replace(/[̀́͂̓̔̈̄̆]/g,"").normalize("NFC"); }
function paradigmKey(o){
  if(o.genus==="m") return "m2";
  if(o.genus==="n") return "n2";
  if(strip(o.former.nom.sg).endsWith("η")) return "f1h";
  return strip(o.former.gen.sg).endsWith("ας") ? "f1a" : "f1m";
}

/* ── TILLSTÅND ───────────────────────────────────────────────────────── */
const LAGER = "grekiska-paradigmspel";
const state = {
  mode: "fyll",                                   // "fyll" | "studera"
  medVok: false,
  valdaOrd: new Set(ord.map(o => o.lemma)),
  valdaSem: new Set(SEM_VARDEN),
  streak: 0, best: 0,
  ord: null, pk: null,
  svar: {},                                        // "k|n" -> vald ändelse
  aktiv: null,                                     // "k|n" som fylls just nu
  besvarad: false,
};

function aktivaKasus(){ return state.medVok ? KASUS_ORDNING : KASUS_ORDNING.filter(k => k !== "vok"); }
function celler(){ const ut = []; for(const k of aktivaKasus()) for(const n of ["sg","pl"]) ut.push(k+"|"+n); return ut; }
function synligaOrd(){ const p = ord.filter(semMatch); return p.length ? p : ord; }
function aktivaOrd(){
  const v = synligaOrd().filter(o => state.valdaOrd.has(o.lemma));
  return v.length ? v : synligaOrd();
}

/* ── PERSISTENS ──────────────────────────────────────────────────────── */
function spara(){
  try{ localStorage.setItem(LAGER, JSON.stringify({
    mode:state.mode, medVok:state.medVok,
    valdaOrd:[...state.valdaOrd], valdaSem:[...state.valdaSem], best:state.best,
  })); }catch(e){}
}
function ladda(){
  try{
    const r = JSON.parse(localStorage.getItem(LAGER)); if(!r) return;
    if(r.mode) state.mode = r.mode;
    if(typeof r.medVok === "boolean") state.medVok = r.medVok;
    if(Array.isArray(r.valdaOrd)) state.valdaOrd = new Set(r.valdaOrd.filter(l => ord.some(o=>o.lemma===l)));
    if(Array.isArray(r.valdaSem)) state.valdaSem = new Set(r.valdaSem.filter(s => SEM_VARDEN.includes(s)));
    if(!state.valdaSem.size) state.valdaSem = new Set(SEM_VARDEN);
    if(typeof r.best === "number") state.best = r.best;
  }catch(e){}
}

/* ── KORTLOGIK ───────────────────────────────────────────────────────── */
const $ = id => document.getElementById(id);
function uppdateraAntal(){ const el = $("ord-count"); if(el) el.textContent = "(" + aktivaOrd().length + " ord)"; }

function nyttOrd(){
  uppdateraAntal();
  let o;
  do { o = pick(aktivaOrd()); } while(aktivaOrd().length > 1 && o === state.ord);
  state.ord = o;
  state.pk = paradigmKey(o);
  state.svar = {};
  state.besvarad = false;
  state.aktiv = state.mode === "fyll" ? celler()[0] : null;
  render();
}

function nastaTom(){
  const c = celler();
  const start = c.indexOf(state.aktiv);
  for(let i = 1; i <= c.length; i++){
    const key = c[(start + i) % c.length];
    if(!state.svar[key]) return key;
  }
  return null;                                     // allt ifyllt
}
function allaIfyllda(){ return celler().every(key => state.svar[key]); }

/* ── RENDERING ───────────────────────────────────────────────────────── */
function cellInnehall(key){
  const [k, n] = key.split("|");
  const o = state.ord, pk = state.pk;
  if(state.mode === "studera"){
    return { cls:"cell study", html: ARTIKEL[o.genus][k][n] + " " + o.former[k][n] };
  }
  if(state.besvarad){
    const vald = state.svar[key], facit = END[pk][k][n];
    const ratt = vald === facit;
    const full = ARTIKEL[o.genus][k][n] + " " + o.former[k][n];
    const sub = ratt ? "" : `<span class="sub">du valde -${vald}</span>`;
    return { cls:"cell " + (ratt ? "good" : "bad"), html: full + sub };
  }
  const vald = state.svar[key];
  const aktiv = key === state.aktiv ? " active" : "";
  if(vald) return { cls:"cell" + aktiv, html:"-" + vald };
  return { cls:"cell empty" + aktiv, html:"·" };
}

function renderTabell(){
  const tb = $("tbody"); tb.innerHTML = "";
  for(const k of aktivaKasus()){
    const tr = document.createElement("tr");
    const lab = document.createElement("td");
    lab.className = "rowlab"; lab.textContent = KASUS[k];
    tr.appendChild(lab);
    for(const n of ["sg","pl"]){
      const td = document.createElement("td");
      const key = k + "|" + n;
      const info = cellInnehall(key);
      const b = document.createElement("button");
      b.className = info.cls; b.innerHTML = info.html;
      b.setAttribute("aria-label", KASUS[k] + " " + (n === "sg" ? "singular" : "plural"));
      if(state.mode === "fyll" && !state.besvarad){
        b.onclick = () => { state.aktiv = key; renderTabell(); };
      } else { b.disabled = true; }
      td.appendChild(b);
      tr.appendChild(td);
    }
    tb.appendChild(tr);
  }
}

function renderPalett(){
  const wrap = $("palette-wrap"), pal = $("palette");
  const dolj = state.mode === "studera" || state.besvarad;
  wrap.style.display = dolj ? "none" : "";
  if(dolj) return;
  pal.innerHTML = "";
  ANDELSER_ALLA.forEach(e => {
    const b = document.createElement("button");
    b.className = "end"; b.textContent = "-" + e;
    b.onclick = () => {
      if(!state.aktiv) state.aktiv = celler()[0];
      state.svar[state.aktiv] = e;
      state.aktiv = nastaTom() || state.aktiv;
      renderTabell(); renderPalett(); uppdateraGo();
    };
    pal.appendChild(b);
  });
}

function uppdateraGo(){
  const go = $("btn-go");
  if(state.mode === "studera"){ go.textContent = "Nästa ord"; go.disabled = false; return; }
  if(state.besvarad){ go.textContent = "Nästa"; go.disabled = false; return; }
  go.textContent = "Rätta"; go.disabled = !allaIfyllda();
}

function render(){
  const o = state.ord;
  $("lemma").textContent = o.lemma;
  $("tag").textContent = GENUS_NAMN[o.genus] + " · " + PARADIGM_NAMN[state.pk];
  $("glosa").textContent = o.glosa;
  $("streak").textContent = state.streak; $("best").textContent = state.best;
  renderTabell(); renderPalett(); uppdateraGo();
}

/* ── SVAR & SVIT ─────────────────────────────────────────────────────── */
function ratta(){
  if(!allaIfyllda()) return;
  const alltRatt = celler().every(key => {
    const [k, n] = key.split("|");
    return state.svar[key] === END[state.pk][k][n];
  });
  state.besvarad = true;
  if(alltRatt){ state.streak++; if(state.streak > state.best){ state.best = state.streak; spara(); } }
  else state.streak = 0;
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
      b.setAttribute("aria-pressed", state.valdaSem.has(s)); byggGridOrd(); spara(); nyttOrd();
    };
    g.appendChild(b);
  });
}
function byggGridOrd(){
  const g = $("grid-ord"); g.innerHTML = "";
  synligaOrd().forEach(o => {
    const b = document.createElement("button");
    b.className = "toggle"; b.textContent = o.lemma;
    b.setAttribute("aria-pressed", state.valdaOrd.has(o.lemma));
    b.onclick = () => {
      state.valdaOrd.has(o.lemma) ? state.valdaOrd.delete(o.lemma) : state.valdaOrd.add(o.lemma);
      b.setAttribute("aria-pressed", state.valdaOrd.has(o.lemma)); uppdateraKatChips(); spara(); nyttOrd();
    };
    g.appendChild(b);
  });
  uppdateraKatChips();
}
function uppdateraKatChips(){
  document.querySelectorAll("[data-cat]").forEach(b =>
    b.setAttribute("aria-pressed", setEq(state.valdaOrd, katLemman(b.dataset.cat))));
}
function uppdateraVokKnappar(){
  document.querySelectorAll("#seg-vok button").forEach(b =>
    b.setAttribute("aria-pressed", (b.dataset.vok === "1") === state.medVok));
}
function uppdateraLagesknappar(){
  $("mode-fyll").setAttribute("aria-pressed", state.mode === "fyll");
  $("mode-studera").setAttribute("aria-pressed", state.mode === "studera");
}

/* ── HÄNDELSER ───────────────────────────────────────────────────────── */
$("mode-fyll").onclick    = () => { state.mode="fyll";    uppdateraLagesknappar(); spara(); nyttOrd(); };
$("mode-studera").onclick = () => { state.mode="studera"; uppdateraLagesknappar(); spara(); nyttOrd(); };
$("btn-go").onclick = () => {
  if(state.mode === "studera") nyttOrd();
  else if(state.besvarad) nyttOrd();
  else ratta();
};

$("picker-toggle").onclick = () => {
  const open = $("picker-toggle").getAttribute("aria-expanded") === "true";
  $("picker-toggle").setAttribute("aria-expanded", !open);
  $("picker-body").classList.toggle("hidden", open);
};
document.querySelector("[data-ord-all]").onclick   = () => { state.valdaOrd = new Set(ord.map(o=>o.lemma)); byggGridOrd(); spara(); nyttOrd(); };
document.querySelector("[data-ord-clear]").onclick = () => { state.valdaOrd = new Set(); byggGridOrd(); spara(); nyttOrd(); };
document.querySelectorAll("[data-cat]").forEach(b => {
  b.onclick = () => { state.valdaOrd = katLemman(b.dataset.cat); byggGridOrd(); spara(); nyttOrd(); };
});
document.querySelector("[data-sem-all]").onclick  = () => { state.valdaSem = new Set(SEM_VARDEN); byggGridSem(); byggGridOrd(); spara(); nyttOrd(); };
document.querySelector("[data-sem-none]").onclick = () => { state.valdaSem = new Set(); byggGridSem(); byggGridOrd(); spara(); nyttOrd(); };
document.querySelectorAll("#seg-vok button").forEach(b =>
  b.onclick = () => { state.medVok = b.dataset.vok === "1"; uppdateraVokKnappar(); spara(); nyttOrd(); });

__kh = e => {
  if(e.key === "Enter"){
    if(state.mode === "studera" || state.besvarad) nyttOrd();
    else if(allaIfyllda()) ratta();
  }
};
document.addEventListener("keydown", __kh);

/* ── START ───────────────────────────────────────────────────────────── */
ladda(); uppdateraLagesknappar(); uppdateraVokKnappar();
byggGridOrd(); byggGridSem(); nyttOrd();

}
