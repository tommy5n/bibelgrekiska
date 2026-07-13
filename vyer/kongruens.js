// Vy: Kongruens — portad exakt från grekiska-kongruensspel.html
let __kh = null;
export function teardown(){ if(__kh){ document.removeEventListener("keydown", __kh); __kh = null; } }
const MARKUP = `<div class="vy vy-kongruens">
<header>
  <h1>Grekiska — kongruens</h1>
  <div class="sub" id="sub">Adjektivet rättar sig efter sitt huvudord — i genus, numerus och kasus.</div>
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
  </div>
</div>

<div class="picker">
  <button class="picker-toggle" id="picker-toggle" aria-expanded="false">
    <span>Anpassa övningen</span><span class="chev">▾</span>
  </button>
  <div class="picker-body hidden" id="picker-body">
    <div class="picker-section">
      <h2>Konstruktion</h2>
      <div class="seg" id="seg-konstr" role="group" aria-label="Konstruktion">
        <button data-v="attributiv" aria-pressed="true">attributiv</button>
        <button data-v="predikativ" aria-pressed="false">predikativ</button>
      </div>
      <div class="hint">Attributiv: ὁ ἀγαθὸς ἀδελφός (kongruens i genus, numerus, kasus). Predikativ: ὁ ἀδελφός ἐστιν ἀγαθός (alltid nominativ — bara genus och numerus rättas).</div>
    </div>
    <div class="picker-section">
      <h2>Adjektivhög</h2>
      <div class="seg" id="seg-adj" role="group" aria-label="Adjektivhög">
        <button data-v="oxytona" aria-pressed="false">oxytona</button>
        <button data-v="ovriga"  aria-pressed="false">förskjutande</button>
        <button data-v="alla"    aria-pressed="true">alla</button>
      </div>
      <div class="hint">Förskjutande = proparoxytona och properispomena (ἅγιος, πρῶτος), där accenten flyttar i böjningen.</div>
    </div>
    <div class="picker-section">
      <h2>Substantiv</h2>
      <div class="seg" id="seg-subst" role="group" aria-label="Substantiv">
        <button data-v="m"    aria-pressed="false">maskulinum</button>
        <button data-v="n"    aria-pressed="false">neutrum</button>
        <button data-v="f"    aria-pressed="false">femininum</button>
        <button data-v="alla" aria-pressed="true">alla</button>
      </div>
      <div class="hint">Neutrumhögen ger nom = ack-fällan: ändelsen avgör inte rollen.</div>
    </div>
    <div class="picker-section">
      <h2>Seminarium</h2>
      <div class="quickrow">
        <span class="quicklabel">Snabbval:</span>
        <button class="chip" data-sem-all>alla</button>
        <button class="chip" data-sem-none>inga</button>
      </div>
      <div class="grid" id="grid-sem"></div>
      <div class="hint">Vilka substantiv (per seminarium) som dyker upp. Sem 5: feminin kongruens med 2:a-dekl feminina (ἡ μακρὰ ὁδός).</div>
    </div>
    <div class="picker-section" id="sek-kasus">
      <h2>Kasus</h2>
      <button class="toggle" id="tg-vok" aria-pressed="false">Inkludera vokativ</button>
      <div class="hint">Standard: nominativ, genitiv, dativ, ackusativ.</div>
    </div>
    <div class="picker-section hidden" id="sek-tempus">
      <h2>Tempus (εἰμί)</h2>
      <div class="seg" id="seg-tempus" role="group" aria-label="Tempus">
        <button data-v="pres"    aria-pressed="false">presens</button>
        <button data-v="impf"    aria-pressed="false">imperfekt</button>
        <button data-v="blandat" aria-pressed="true">blandat</button>
      </div>
      <div class="hint">Kopulan ἐστιν/εἰσιν (presens) eller ἦν/ἦσαν (imperfekt). Påverkar inte adjektivets form.</div>
    </div>
    <div class="picker-section hidden" id="sek-verblucka">
      <h2>εἰμί</h2>
      <button class="toggle" id="tg-verblucka" aria-pressed="false">Lucka även i verbet</button>
      <div class="hint">Ibland blankas kopulan istället för adjektivet — då övar du εἰμί i rätt numerus och tempus.</div>
    </div>
  </div>
</div>

<footer>
  Alla former verifierade mot seminariets facit, NT-attestationer (MorphGNT) och LSJ.
  Femininum (1:a deklinationen) ingår, δίκαιος medräknad. Feminin gen.pl följer maskulinums accent (ἁγίων), inte substantivens -ῶν.
</footer>
</div>`;
export function render(root){
  root.innerHTML = MARKUP;

const ADJEKTIV = [
  {lemma:"ἀγαθός", glosa:"god", accenttyp:"oxyton", kortlek:"oxytona", sem:[3, 4],
   m:{nom:["ἀγαθός","ἀγαθοί"], gen:["ἀγαθοῦ","ἀγαθῶν"], dat:["ἀγαθῷ","ἀγαθοῖς"], ack:["ἀγαθόν","ἀγαθούς"], vok:["ἀγαθέ","ἀγαθοί"]},
   f:{nom:["ἀγαθή","ἀγαθαί"], gen:["ἀγαθῆς","ἀγαθῶν"], dat:["ἀγαθῇ","ἀγαθαῖς"], ack:["ἀγαθήν","ἀγαθάς"], vok:["ἀγαθή","ἀγαθαί"]},
   n:{nom:["ἀγαθόν","ἀγαθά"], gen:["ἀγαθοῦ","ἀγαθῶν"], dat:["ἀγαθῷ","ἀγαθοῖς"], ack:["ἀγαθόν","ἀγαθά"], vok:["ἀγαθόν","ἀγαθά"]}},
  {lemma:"πονηρός", glosa:"ond, fördärvad", accenttyp:"oxyton", kortlek:"oxytona", sem:[3, 4],
   m:{nom:["πονηρός","πονηροί"], gen:["πονηροῦ","πονηρῶν"], dat:["πονηρῷ","πονηροῖς"], ack:["πονηρόν","πονηρούς"], vok:["πονηρέ","πονηροί"]},
   f:{nom:["πονηρά","πονηραί"], gen:["πονηρᾶς","πονηρῶν"], dat:["πονηρᾷ","πονηραῖς"], ack:["πονηράν","πονηράς"], vok:["πονηρά","πονηραί"]},
   n:{nom:["πονηρόν","πονηρά"], gen:["πονηροῦ","πονηρῶν"], dat:["πονηρῷ","πονηροῖς"], ack:["πονηρόν","πονηρά"], vok:["πονηρόν","πονηρά"]}},
  {lemma:"καλός", glosa:"vacker, god", accenttyp:"oxyton", kortlek:"oxytona", sem:[3, 4],
   m:{nom:["καλός","καλοί"], gen:["καλοῦ","καλῶν"], dat:["καλῷ","καλοῖς"], ack:["καλόν","καλούς"], vok:["καλέ","καλοί"]},
   f:{nom:["καλή","καλαί"], gen:["καλῆς","καλῶν"], dat:["καλῇ","καλαῖς"], ack:["καλήν","καλάς"], vok:["καλή","καλαί"]},
   n:{nom:["καλόν","καλά"], gen:["καλοῦ","καλῶν"], dat:["καλῷ","καλοῖς"], ack:["καλόν","καλά"], vok:["καλόν","καλά"]}},
  {lemma:"νεκρός", glosa:"död", accenttyp:"oxyton", kortlek:"oxytona", sem:[3],
   m:{nom:["νεκρός","νεκροί"], gen:["νεκροῦ","νεκρῶν"], dat:["νεκρῷ","νεκροῖς"], ack:["νεκρόν","νεκρούς"], vok:["νεκρέ","νεκροί"]},
   f:{nom:["νεκρά","νεκραί"], gen:["νεκρᾶς","νεκρῶν"], dat:["νεκρᾷ","νεκραῖς"], ack:["νεκράν","νεκράς"], vok:["νεκρά","νεκραί"]},
   n:{nom:["νεκρόν","νεκρά"], gen:["νεκροῦ","νεκρῶν"], dat:["νεκρῷ","νεκροῖς"], ack:["νεκρόν","νεκρά"], vok:["νεκρόν","νεκρά"]}},
  {lemma:"πιστός", glosa:"trogen, troende", accenttyp:"oxyton", kortlek:"oxytona", sem:[3],
   m:{nom:["πιστός","πιστοί"], gen:["πιστοῦ","πιστῶν"], dat:["πιστῷ","πιστοῖς"], ack:["πιστόν","πιστούς"], vok:["πιστέ","πιστοί"]},
   f:{nom:["πιστή","πισταί"], gen:["πιστῆς","πιστῶν"], dat:["πιστῇ","πισταῖς"], ack:["πιστήν","πιστάς"], vok:["πιστή","πισταί"]},
   n:{nom:["πιστόν","πιστά"], gen:["πιστοῦ","πιστῶν"], dat:["πιστῷ","πιστοῖς"], ack:["πιστόν","πιστά"], vok:["πιστόν","πιστά"]}},
  {lemma:"μικρός", glosa:"liten", accenttyp:"oxyton", kortlek:"oxytona", sem:[3],
   m:{nom:["μικρός","μικροί"], gen:["μικροῦ","μικρῶν"], dat:["μικρῷ","μικροῖς"], ack:["μικρόν","μικρούς"], vok:["μικρέ","μικροί"]},
   f:{nom:["μικρά","μικραί"], gen:["μικρᾶς","μικρῶν"], dat:["μικρᾷ","μικραῖς"], ack:["μικράν","μικράς"], vok:["μικρά","μικραί"]},
   n:{nom:["μικρόν","μικρά"], gen:["μικροῦ","μικρῶν"], dat:["μικρῷ","μικροῖς"], ack:["μικρόν","μικρά"], vok:["μικρόν","μικρά"]}},
  {lemma:"ἅγιος", glosa:"helig, ren", accenttyp:"proparoxyton", kortlek:"ovriga", sem:[3],
   m:{nom:["ἅγιος","ἅγιοι"], gen:["ἁγίου","ἁγίων"], dat:["ἁγίῳ","ἁγίοις"], ack:["ἅγιον","ἁγίους"], vok:["ἅγιε","ἅγιοι"]},
   f:{nom:["ἁγία","ἅγιαι"], gen:["ἁγίας","ἁγίων"], dat:["ἁγίᾳ","ἁγίαις"], ack:["ἁγίαν","ἁγίας"], vok:["ἁγία","ἅγιαι"]},
   n:{nom:["ἅγιον","ἅγια"], gen:["ἁγίου","ἁγίων"], dat:["ἁγίῳ","ἁγίοις"], ack:["ἅγιον","ἅγια"], vok:["ἅγιον","ἅγια"]}},
  {lemma:"μόνος", glosa:"ensam, allena", accenttyp:"paroxyton", kortlek:"ovriga", sem:[3],
   m:{nom:["μόνος","μόνοι"], gen:["μόνου","μόνων"], dat:["μόνῳ","μόνοις"], ack:["μόνον","μόνους"], vok:["μόνε","μόνοι"]},
   f:{nom:["μόνη","μόναι"], gen:["μόνης","μόνων"], dat:["μόνῃ","μόναις"], ack:["μόνην","μόνας"], vok:["μόνη","μόναι"]},
   n:{nom:["μόνον","μόνα"], gen:["μόνου","μόνων"], dat:["μόνῳ","μόνοις"], ack:["μόνον","μόνα"], vok:["μόνον","μόνα"]}},
  {lemma:"πρῶτος", glosa:"först, främst", accenttyp:"properispomenon", kortlek:"ovriga", sem:[3],
   m:{nom:["πρῶτος","πρῶτοι"], gen:["πρώτου","πρώτων"], dat:["πρώτῳ","πρώτοις"], ack:["πρῶτον","πρώτους"], vok:["πρῶτε","πρῶτοι"]},
   f:{nom:["πρώτη","πρῶται"], gen:["πρώτης","πρώτων"], dat:["πρώτῃ","πρώταις"], ack:["πρώτην","πρώτας"], vok:["πρώτη","πρῶται"]},
   n:{nom:["πρῶτον","πρῶτα"], gen:["πρώτου","πρώτων"], dat:["πρώτῳ","πρώτοις"], ack:["πρῶτον","πρῶτα"], vok:["πρῶτον","πρῶτα"]}},
  {lemma:"δίκαιος", glosa:"rättvis, rättfärdig", accenttyp:"proparoxyton", kortlek:"ovriga", sem:[4],
   m:{nom:["δίκαιος","δίκαιοι"], gen:["δικαίου","δικαίων"], dat:["δικαίῳ","δικαίοις"], ack:["δίκαιον","δικαίους"], vok:["δίκαιε","δίκαιοι"]},
   f:{nom:["δικαία","δίκαιαι"], gen:["δικαίας","δικαίων"], dat:["δικαίᾳ","δικαίαις"], ack:["δικαίαν","δικαίας"], vok:["δικαία","δίκαιαι"]},
   n:{nom:["δίκαιον","δίκαια"], gen:["δικαίου","δικαίων"], dat:["δικαίῳ","δικαίοις"], ack:["δίκαιον","δίκαια"], vok:["δίκαιον","δίκαια"]}},
  {lemma:"μακρός", glosa:"lång", accenttyp:"oxyton", kortlek:"oxytona", sem:[5],
   m:{nom:["μακρός","μακροί"], gen:["μακροῦ","μακρῶν"], dat:["μακρῷ","μακροῖς"], ack:["μακρόν","μακρούς"], vok:["μακρέ","μακροί"]},
   f:{nom:["μακρά","μακραί"], gen:["μακρᾶς","μακρῶν"], dat:["μακρᾷ","μακραῖς"], ack:["μακράν","μακράς"], vok:["μακρά","μακραί"]},
   n:{nom:["μακρόν","μακρά"], gen:["μακροῦ","μακρῶν"], dat:["μακρῷ","μακροῖς"], ack:["μακρόν","μακρά"], vok:["μακρόν","μακρά"]}},
  {lemma:"πτωχός", glosa:"fattig", accenttyp:"oxyton", kortlek:"oxytona", sem:[5],
   m:{nom:["πτωχός","πτωχοί"], gen:["πτωχοῦ","πτωχῶν"], dat:["πτωχῷ","πτωχοῖς"], ack:["πτωχόν","πτωχούς"], vok:["πτωχέ","πτωχοί"]},
   f:{nom:["πτωχή","πτωχαί"], gen:["πτωχῆς","πτωχῶν"], dat:["πτωχῇ","πτωχαῖς"], ack:["πτωχήν","πτωχάς"], vok:["πτωχή","πτωχαί"]},
   n:{nom:["πτωχόν","πτωχά"], gen:["πτωχοῦ","πτωχῶν"], dat:["πτωχῷ","πτωχοῖς"], ack:["πτωχόν","πτωχά"], vok:["πτωχόν","πτωχά"]}},
  {lemma:"ἁμαρτωλός", glosa:"syndig", accenttyp:"oxyton", kortlek:"oxytona", sem:[5],
   m:{nom:["ἁμαρτωλός","ἁμαρτωλοί"], gen:["ἁμαρτωλοῦ","ἁμαρτωλῶν"], dat:["ἁμαρτωλῷ","ἁμαρτωλοῖς"], ack:["ἁμαρτωλόν","ἁμαρτωλούς"], vok:["ἁμαρτωλέ","ἁμαρτωλοί"]},
   f:{nom:["ἁμαρτωλή","ἁμαρτωλαί"], gen:["ἁμαρτωλῆς","ἁμαρτωλῶν"], dat:["ἁμαρτωλῇ","ἁμαρτωλαῖς"], ack:["ἁμαρτωλήν","ἁμαρτωλάς"], vok:["ἁμαρτωλή","ἁμαρτωλαί"]},
   n:{nom:["ἁμαρτωλόν","ἁμαρτωλά"], gen:["ἁμαρτωλοῦ","ἁμαρτωλῶν"], dat:["ἁμαρτωλῷ","ἁμαρτωλοῖς"], ack:["ἁμαρτωλόν","ἁμαρτωλά"], vok:["ἁμαρτωλόν","ἁμαρτωλά"]}},
  {lemma:"πλούσιος", glosa:"rik", accenttyp:"proparoxyton", kortlek:"ovriga", sem:[5],
   m:{nom:["πλούσιος","πλούσιοι"], gen:["πλουσίου","πλουσίων"], dat:["πλουσίῳ","πλουσίοις"], ack:["πλούσιον","πλουσίους"], vok:["πλούσιε","πλούσιοι"]},
   f:{nom:["πλουσία","πλούσιαι"], gen:["πλουσίας","πλουσίων"], dat:["πλουσίᾳ","πλουσίαις"], ack:["πλουσίαν","πλουσίας"], vok:["πλουσία","πλούσιαι"]},
   n:{nom:["πλούσιον","πλούσια"], gen:["πλουσίου","πλουσίων"], dat:["πλουσίῳ","πλουσίοις"], ack:["πλούσιον","πλούσια"], vok:["πλούσιον","πλούσια"]}},
  {lemma:"αἰώνιος", glosa:"evig", accenttyp:"proparoxyton", kortlek:"ovriga", sem:[5],
   m:{nom:["αἰώνιος","αἰώνιοι"], gen:["αἰωνίου","αἰωνίων"], dat:["αἰωνίῳ","αἰωνίοις"], ack:["αἰώνιον","αἰωνίους"], vok:["αἰώνιε","αἰώνιοι"]},
   f:{nom:["αἰώνιος","αἰώνιοι"], gen:["αἰωνίου","αἰωνίων"], dat:["αἰωνίῳ","αἰωνίοις"], ack:["αἰώνιον","αἰωνίους"], vok:["αἰώνιε","αἰώνιοι"]},
   n:{nom:["αἰώνιον","αἰώνια"], gen:["αἰωνίου","αἰωνίων"], dat:["αἰωνίῳ","αἰωνίοις"], ack:["αἰώνιον","αἰώνια"], vok:["αἰώνιον","αἰώνια"]}}
];

const SUBSTANTIV = [
  {lemma:"ἄνθρωπος", glosa:"människa", genus:"m", accenttyp:"proparoxyton", sem:[2], former:{nom:["ἄνθρωπος","ἄνθρωποι"], gen:["ἀνθρώπου","ἀνθρώπων"], dat:["ἀνθρώπῳ","ἀνθρώποις"], ack:["ἄνθρωπον","ἀνθρώπους"], vok:["ἄνθρωπε","ἄνθρωποι"]}},
  {lemma:"λόγος", glosa:"ord, berättelse", genus:"m", accenttyp:"paroxyton", sem:[2], former:{nom:["λόγος","λόγοι"], gen:["λόγου","λόγων"], dat:["λόγῳ","λόγοις"], ack:["λόγον","λόγους"], vok:["λόγε","λόγοι"]}},
  {lemma:"οἶκος", glosa:"hus", genus:"m", accenttyp:"properispomenon", sem:[2], former:{nom:["οἶκος","οἶκοι"], gen:["οἴκου","οἴκων"], dat:["οἴκῳ","οἴκοις"], ack:["οἶκον","οἴκους"], vok:["οἶκε","οἶκοι"]}},
  {lemma:"κύριος", glosa:"herre", genus:"m", accenttyp:"proparoxyton", sem:[2], former:{nom:["κύριος","κύριοι"], gen:["κυρίου","κυρίων"], dat:["κυρίῳ","κυρίοις"], ack:["κύριον","κυρίους"], vok:["κύριε","κύριοι"]}},
  {lemma:"θεός", glosa:"gud", genus:"m", accenttyp:"oxyton", sem:[1, 2], former:{nom:["θεός","θεοί"], gen:["θεοῦ","θεῶν"], dat:["θεῷ","θεοῖς"], ack:["θεόν","θεούς"], vok:["θεέ","θεοί"]}},
  {lemma:"ἀπόστολος", glosa:"apostel", genus:"m", accenttyp:"proparoxyton", sem:[2], former:{nom:["ἀπόστολος","ἀπόστολοι"], gen:["ἀποστόλου","ἀποστόλων"], dat:["ἀποστόλῳ","ἀποστόλοις"], ack:["ἀπόστολον","ἀποστόλους"], vok:["ἀπόστολε","ἀπόστολοι"]}},
  {lemma:"ἄγγελος", glosa:"budbärare, ängel", genus:"m", accenttyp:"proparoxyton", sem:[1, 2], former:{nom:["ἄγγελος","ἄγγελοι"], gen:["ἀγγέλου","ἀγγέλων"], dat:["ἀγγέλῳ","ἀγγέλοις"], ack:["ἄγγελον","ἀγγέλους"], vok:["ἄγγελε","ἄγγελοι"]}},
  {lemma:"δοῦλος", glosa:"slav", genus:"m", accenttyp:"properispomenon", sem:[2], former:{nom:["δοῦλος","δοῦλοι"], gen:["δούλου","δούλων"], dat:["δούλῳ","δούλοις"], ack:["δοῦλον","δούλους"], vok:["δοῦλε","δοῦλοι"]}},
  {lemma:"ἀδελφός", glosa:"bror", genus:"m", accenttyp:"oxyton", sem:[2], former:{nom:["ἀδελφός","ἀδελφοί"], gen:["ἀδελφοῦ","ἀδελφῶν"], dat:["ἀδελφῷ","ἀδελφοῖς"], ack:["ἀδελφόν","ἀδελφούς"], vok:["ἀδελφέ","ἀδελφοί"]}},
  {lemma:"ἄρτος", glosa:"bröd", genus:"m", accenttyp:"paroxyton", sem:[], former:{nom:["ἄρτος","ἄρτοι"], gen:["ἄρτου","ἄρτων"], dat:["ἄρτῳ","ἄρτοις"], ack:["ἄρτον","ἄρτους"], vok:["ἄρτε","ἄρτοι"]}},
  {lemma:"θάνατος", glosa:"död", genus:"m", accenttyp:"proparoxyton", sem:[], former:{nom:["θάνατος","θάνατοι"], gen:["θανάτου","θανάτων"], dat:["θανάτῳ","θανάτοις"], ack:["θάνατον","θανάτους"], vok:["θάνατε","θάνατοι"]}},
  {lemma:"καιρός", glosa:"tid", genus:"m", accenttyp:"oxyton", sem:[], former:{nom:["καιρός","καιροί"], gen:["καιροῦ","καιρῶν"], dat:["καιρῷ","καιροῖς"], ack:["καιρόν","καιρούς"], vok:["καιρέ","καιροί"]}},
  {lemma:"καρπός", glosa:"frukt", genus:"m", accenttyp:"oxyton", sem:[], former:{nom:["καρπός","καρποί"], gen:["καρποῦ","καρπῶν"], dat:["καρπῷ","καρποῖς"], ack:["καρπόν","καρπούς"], vok:["καρπέ","καρποί"]}},
  {lemma:"κόσμος", glosa:"värld", genus:"m", accenttyp:"paroxyton", sem:[], former:{nom:["κόσμος","κόσμοι"], gen:["κόσμου","κόσμων"], dat:["κόσμῳ","κόσμοις"], ack:["κόσμον","κόσμους"], vok:["κόσμε","κόσμοι"]}},
  {lemma:"λαός", glosa:"folk", genus:"m", accenttyp:"oxyton", sem:[], former:{nom:["λαός","λαοί"], gen:["λαοῦ","λαῶν"], dat:["λαῷ","λαοῖς"], ack:["λαόν","λαούς"], vok:["λαέ","λαοί"]}},
  {lemma:"νόμος", glosa:"lag", genus:"m", accenttyp:"paroxyton", sem:[], former:{nom:["νόμος","νόμοι"], gen:["νόμου","νόμων"], dat:["νόμῳ","νόμοις"], ack:["νόμον","νόμους"], vok:["νόμε","νόμοι"]}},
  {lemma:"οὐρανός", glosa:"himmel", genus:"m", accenttyp:"oxyton", sem:[2], former:{nom:["οὐρανός","οὐρανοί"], gen:["οὐρανοῦ","οὐρανῶν"], dat:["οὐρανῷ","οὐρανοῖς"], ack:["οὐρανόν","οὐρανούς"], vok:["οὐρανέ","οὐρανοί"]}},
  {lemma:"ὀφθαλμός", glosa:"öga", genus:"m", accenttyp:"oxyton", sem:[], former:{nom:["ὀφθαλμός","ὀφθαλμοί"], gen:["ὀφθαλμοῦ","ὀφθαλμῶν"], dat:["ὀφθαλμῷ","ὀφθαλμοῖς"], ack:["ὀφθαλμόν","ὀφθαλμούς"], vok:["ὀφθαλμέ","ὀφθαλμοί"]}},
  {lemma:"ὄχλος", glosa:"folkhop", genus:"m", accenttyp:"paroxyton", sem:[], former:{nom:["ὄχλος","ὄχλοι"], gen:["ὄχλου","ὄχλων"], dat:["ὄχλῳ","ὄχλοις"], ack:["ὄχλον","ὄχλους"], vok:["ὄχλε","ὄχλοι"]}},
  {lemma:"τόπος", glosa:"plats", genus:"m", accenttyp:"paroxyton", sem:[], former:{nom:["τόπος","τόποι"], gen:["τόπου","τόπων"], dat:["τόπῳ","τόποις"], ack:["τόπον","τόπους"], vok:["τόπε","τόποι"]}},
  {lemma:"υἱός", glosa:"son", genus:"m", accenttyp:"oxyton", sem:[1], former:{nom:["υἱός","υἱοί"], gen:["υἱοῦ","υἱῶν"], dat:["υἱῷ","υἱοῖς"], ack:["υἱόν","υἱούς"], vok:["υἱέ","υἱοί"]}},
  {lemma:"Φαρισαῖος", glosa:"farisé", genus:"m", accenttyp:"properispomenon", sem:[], former:{nom:["Φαρισαῖος","Φαρισαῖοι"], gen:["Φαρισαίου","Φαρισαίων"], dat:["Φαρισαίῳ","Φαρισαίοις"], ack:["Φαρισαῖον","Φαρισαίους"], vok:["Φαρισαῖε","Φαρισαῖοι"]}},
  {lemma:"Χριστός", glosa:"Kristus", genus:"m", accenttyp:"oxyton", sem:[], former:{nom:["Χριστός","Χριστοί"], gen:["Χριστοῦ","Χριστῶν"], dat:["Χριστῷ","Χριστοῖς"], ack:["Χριστόν","Χριστούς"], vok:["Χριστέ","Χριστοί"]}},
  {lemma:"διάβολος", glosa:"djävul", genus:"m", accenttyp:"proparoxyton", sem:[1], former:{nom:["διάβολος","διάβολοι"], gen:["διαβόλου","διαβόλων"], dat:["διαβόλῳ","διαβόλοις"], ack:["διάβολον","διαβόλους"], vok:["διάβολε","διάβολοι"]}},
  {lemma:"παράδεισος", glosa:"paradis", genus:"m", accenttyp:"proparoxyton", sem:[1], former:{nom:["παράδεισος","παράδεισοι"], gen:["παραδείσου","παραδείσων"], dat:["παραδείσῳ","παραδείσοις"], ack:["παράδεισον","παραδείσους"], vok:["παράδεισε","παράδεισοι"]}},
  {lemma:"κατάλογος", glosa:"förteckning", genus:"m", accenttyp:"proparoxyton", sem:[1], former:{nom:["κατάλογος","κατάλογοι"], gen:["καταλόγου","καταλόγων"], dat:["καταλόγῳ","καταλόγοις"], ack:["κατάλογον","καταλόγους"], vok:["κατάλογε","κατάλογοι"]}},
  {lemma:"ἔργον", glosa:"verk, arbete", genus:"n", accenttyp:"paroxyton", sem:[3], former:{nom:["ἔργον","ἔργα"], gen:["ἔργου","ἔργων"], dat:["ἔργῳ","ἔργοις"], ack:["ἔργον","ἔργα"], vok:["ἔργον","ἔργα"]}},
  {lemma:"τέκνον", glosa:"barn", genus:"n", accenttyp:"paroxyton", sem:[3], former:{nom:["τέκνον","τέκνα"], gen:["τέκνου","τέκνων"], dat:["τέκνῳ","τέκνοις"], ack:["τέκνον","τέκνα"], vok:["τέκνον","τέκνα"]}},
  {lemma:"εὐαγγέλιον", glosa:"evangelium, glatt budskap", genus:"n", accenttyp:"proparoxyton", sem:[3], former:{nom:["εὐαγγέλιον","εὐαγγέλια"], gen:["εὐαγγελίου","εὐαγγελίων"], dat:["εὐαγγελίῳ","εὐαγγελίοις"], ack:["εὐαγγέλιον","εὐαγγέλια"], vok:["εὐαγγέλιον","εὐαγγέλια"]}},
  {lemma:"ἱερόν", glosa:"tempel", genus:"n", accenttyp:"oxyton", sem:[3], former:{nom:["ἱερόν","ἱερά"], gen:["ἱεροῦ","ἱερῶν"], dat:["ἱερῷ","ἱεροῖς"], ack:["ἱερόν","ἱερά"], vok:["ἱερόν","ἱερά"]}},
  {lemma:"σημεῖον", glosa:"tecken", genus:"n", accenttyp:"properispomenon", sem:[3], former:{nom:["σημεῖον","σημεῖα"], gen:["σημείου","σημείων"], dat:["σημείῳ","σημείοις"], ack:["σημεῖον","σημεῖα"], vok:["σημεῖον","σημεῖα"]}},
  {lemma:"πλοῖον", glosa:"båt, skepp", genus:"n", accenttyp:"properispomenon", sem:[3], former:{nom:["πλοῖον","πλοῖα"], gen:["πλοίου","πλοίων"], dat:["πλοίῳ","πλοίοις"], ack:["πλοῖον","πλοῖα"], vok:["πλοῖον","πλοῖα"]}},
  {lemma:"σάββατον", glosa:"sabbat", genus:"n", accenttyp:"proparoxyton", sem:[3], former:{nom:["σάββατον","σάββατα"], gen:["σαββάτου","σαββάτων"], dat:["σαββάτῳ","σαββάτοις"], ack:["σάββατον","σάββατα"], vok:["σάββατον","σάββατα"]}},
  {lemma:"ἀρχή", glosa:"begynnelse", genus:"f", accenttyp:"oxyton", sem:[4], former:{nom:["ἀρχή","ἀρχαί"], gen:["ἀρχῆς","ἀρχῶν"], dat:["ἀρχῇ","ἀρχαῖς"], ack:["ἀρχήν","ἀρχάς"], vok:["ἀρχή","ἀρχαί"]}},
  {lemma:"φωνή", glosa:"röst", genus:"f", accenttyp:"oxyton", sem:[], former:{nom:["φωνή","φωναί"], gen:["φωνῆς","φωνῶν"], dat:["φωνῇ","φωναῖς"], ack:["φωνήν","φωνάς"], vok:["φωνή","φωναί"]}},
  {lemma:"ψυχή", glosa:"själ", genus:"f", accenttyp:"oxyton", sem:[4], former:{nom:["ψυχή","ψυχαί"], gen:["ψυχῆς","ψυχῶν"], dat:["ψυχῇ","ψυχαῖς"], ack:["ψυχήν","ψυχάς"], vok:["ψυχή","ψυχαί"]}},
  {lemma:"ζωή", glosa:"liv", genus:"f", accenttyp:"oxyton", sem:[], former:{nom:["ζωή","ζωαί"], gen:["ζωῆς","ζωῶν"], dat:["ζωῇ","ζωαῖς"], ack:["ζωήν","ζωάς"], vok:["ζωή","ζωαί"]}},
  {lemma:"ἐντολή", glosa:"bud, uppdrag", genus:"f", accenttyp:"oxyton", sem:[4], former:{nom:["ἐντολή","ἐντολαί"], gen:["ἐντολῆς","ἐντολῶν"], dat:["ἐντολῇ","ἐντολαῖς"], ack:["ἐντολήν","ἐντολάς"], vok:["ἐντολή","ἐντολαί"]}},
  {lemma:"ἀδελφή", glosa:"syster", genus:"f", accenttyp:"oxyton", sem:[4], former:{nom:["ἀδελφή","ἀδελφαί"], gen:["ἀδελφῆς","ἀδελφῶν"], dat:["ἀδελφῇ","ἀδελφαῖς"], ack:["ἀδελφήν","ἀδελφάς"], vok:["ἀδελφή","ἀδελφαί"]}},
  {lemma:"κεφαλή", glosa:"huvud", genus:"f", accenttyp:"oxyton", sem:[], former:{nom:["κεφαλή","κεφαλαί"], gen:["κεφαλῆς","κεφαλῶν"], dat:["κεφαλῇ","κεφαλαῖς"], ack:["κεφαλήν","κεφαλάς"], vok:["κεφαλή","κεφαλαί"]}},
  {lemma:"συναγωγή", glosa:"synagoga", genus:"f", accenttyp:"oxyton", sem:[], former:{nom:["συναγωγή","συναγωγαί"], gen:["συναγωγῆς","συναγωγῶν"], dat:["συναγωγῇ","συναγωγαῖς"], ack:["συναγωγήν","συναγωγάς"], vok:["συναγωγή","συναγωγαί"]}},
  {lemma:"ἀγάπη", glosa:"kärlek", genus:"f", accenttyp:"paroxyton", sem:[4], former:{nom:["ἀγάπη","ἀγάπαι"], gen:["ἀγάπης","ἀγαπῶν"], dat:["ἀγάπῃ","ἀγάπαις"], ack:["ἀγάπην","ἀγάπας"], vok:["ἀγάπη","ἀγάπαι"]}},
  {lemma:"εἰρήνη", glosa:"fred", genus:"f", accenttyp:"paroxyton", sem:[4], former:{nom:["εἰρήνη","εἰρῆναι"], gen:["εἰρήνης","εἰρηνῶν"], dat:["εἰρήνῃ","εἰρήναις"], ack:["εἰρήνην","εἰρήνας"], vok:["εἰρήνη","εἰρῆναι"]}},
  {lemma:"δικαιοσύνη", glosa:"rättfärdighet, rättvisa", genus:"f", accenttyp:"paroxyton", sem:[], former:{nom:["δικαιοσύνη","δικαιοσύναι"], gen:["δικαιοσύνης","δικαιοσυνῶν"], dat:["δικαιοσύνῃ","δικαιοσύναις"], ack:["δικαιοσύνην","δικαιοσύνας"], vok:["δικαιοσύνη","δικαιοσύναι"]}},
  {lemma:"ἐκκλησία", glosa:"församling, kyrka", genus:"f", accenttyp:"paroxyton", sem:[], former:{nom:["ἐκκλησία","ἐκκλησίαι"], gen:["ἐκκλησίας","ἐκκλησιῶν"], dat:["ἐκκλησίᾳ","ἐκκλησίαις"], ack:["ἐκκλησίαν","ἐκκλησίας"], vok:["ἐκκλησία","ἐκκλησίαι"]}},
  {lemma:"ἡμέρα", glosa:"dag", genus:"f", accenttyp:"paroxyton", sem:[], former:{nom:["ἡμέρα","ἡμέραι"], gen:["ἡμέρας","ἡμερῶν"], dat:["ἡμέρᾳ","ἡμέραις"], ack:["ἡμέραν","ἡμέρας"], vok:["ἡμέρα","ἡμέραι"]}},
  {lemma:"ἁμαρτία", glosa:"synd, felsteg", genus:"f", accenttyp:"paroxyton", sem:[], former:{nom:["ἁμαρτία","ἁμαρτίαι"], gen:["ἁμαρτίας","ἁμαρτιῶν"], dat:["ἁμαρτίᾳ","ἁμαρτίαις"], ack:["ἁμαρτίαν","ἁμαρτίας"], vok:["ἁμαρτία","ἁμαρτίαι"]}},
  {lemma:"ἐξουσία", glosa:"makt", genus:"f", accenttyp:"paroxyton", sem:[], former:{nom:["ἐξουσία","ἐξουσίαι"], gen:["ἐξουσίας","ἐξουσιῶν"], dat:["ἐξουσίᾳ","ἐξουσίαις"], ack:["ἐξουσίαν","ἐξουσίας"], vok:["ἐξουσία","ἐξουσίαι"]}},
  {lemma:"καρδία", glosa:"hjärta", genus:"f", accenttyp:"paroxyton", sem:[], former:{nom:["καρδία","καρδίαι"], gen:["καρδίας","καρδιῶν"], dat:["καρδίᾳ","καρδίαις"], ack:["καρδίαν","καρδίας"], vok:["καρδία","καρδίαι"]}},
  {lemma:"βασιλεία", glosa:"rike, kungadöme", genus:"f", accenttyp:"paroxyton", sem:[4], former:{nom:["βασιλεία","βασιλεῖαι"], gen:["βασιλείας","βασιλειῶν"], dat:["βασιλείᾳ","βασιλείαις"], ack:["βασιλείαν","βασιλείας"], vok:["βασιλεία","βασιλεῖαι"]}},
  {lemma:"ὥρα", glosa:"stund, timme", genus:"f", accenttyp:"paroxyton", sem:[], former:{nom:["ὥρα","ὧραι"], gen:["ὥρας","ὡρῶν"], dat:["ὥρᾳ","ὥραις"], ack:["ὥραν","ὥρας"], vok:["ὥρα","ὧραι"]}},
  {lemma:"ἀλήθεια", glosa:"sanning", genus:"f", accenttyp:"proparoxyton", sem:[4], former:{nom:["ἀλήθεια","ἀλήθειαι"], gen:["ἀληθείας","ἀληθειῶν"], dat:["ἀληθείᾳ","ἀληθείαις"], ack:["ἀλήθειαν","ἀληθείας"], vok:["ἀλήθεια","ἀλήθειαι"]}},
  {lemma:"θάλασσα", glosa:"hav, sjö", genus:"f", accenttyp:"proparoxyton", sem:[], former:{nom:["θάλασσα","θάλασσαι"], gen:["θαλάσσης","θαλασσῶν"], dat:["θαλάσσῃ","θαλάσσαις"], ack:["θάλασσαν","θαλάσσας"], vok:["θάλασσα","θάλασσαι"]}},
  {lemma:"νόσος", glosa:"sjukdom", genus:"f", accenttyp:"paroxyton", sem:[5], former:{nom:["νόσος","νόσοι"], gen:["νόσου","νόσων"], dat:["νόσῳ","νόσοις"], ack:["νόσον","νόσους"], vok:["νόσε","νόσοι"]}},
  {lemma:"ὁδός", glosa:"väg", genus:"f", accenttyp:"oxyton", sem:[5], former:{nom:["ὁδός","ὁδοί"], gen:["ὁδοῦ","ὁδῶν"], dat:["ὁδῷ","ὁδοῖς"], ack:["ὁδόν","ὁδούς"], vok:["ὁδέ","ὁδοί"]}},
  {lemma:"ἔρημος", glosa:"öken", genus:"f", accenttyp:"proparoxyton", sem:[5], former:{nom:["ἔρημος","ἔρημοι"], gen:["ἐρήμου","ἐρήμων"], dat:["ἐρήμῳ","ἐρήμοις"], ack:["ἔρημον","ἐρήμους"], vok:["ἔρημε","ἔρημοι"]}},
  {lemma:"παρθένος", glosa:"flicka, jungfru", genus:"f", accenttyp:"paroxyton", sem:[5], former:{nom:["παρθένος","παρθένοι"], gen:["παρθένου","παρθένων"], dat:["παρθένῳ","παρθένοις"], ack:["παρθένον","παρθένους"], vok:["παρθένε","παρθένοι"]}},
  {lemma:"μαθητής", glosa:"lärjunge, elev", genus:"m", accenttyp:"oxyton", sem:[5], former:{nom:["μαθητής","μαθηταί"], gen:["μαθητοῦ","μαθητῶν"], dat:["μαθητῇ","μαθηταῖς"], ack:["μαθητήν","μαθητάς"], vok:["μαθητά","μαθηταί"]}},
  {lemma:"προφήτης", glosa:"profet", genus:"m", accenttyp:"paroxyton", sem:[5], former:{nom:["προφήτης","προφῆται"], gen:["προφήτου","προφητῶν"], dat:["προφήτῃ","προφήταις"], ack:["προφήτην","προφήτας"], vok:["προφῆτα","προφῆται"]}},
  {lemma:"νεανίας", glosa:"yngling", genus:"m", accenttyp:"paroxyton", sem:[5], former:{nom:["νεανίας","νεανίαι"], gen:["νεανίου","νεανιῶν"], dat:["νεανίᾳ","νεανίαις"], ack:["νεανίαν","νεανίας"], vok:["νεανία","νεανίαι"]}},
  {lemma:"οἰκοδεσπότης", glosa:"husbonde", genus:"m", accenttyp:"paroxyton", sem:[5], former:{nom:["οἰκοδεσπότης","οἰκοδεσπόται"], gen:["οἰκοδεσπότου","οἰκοδεσποτῶν"], dat:["οἰκοδεσπότῃ","οἰκοδεσπόταις"], ack:["οἰκοδεσπότην","οἰκοδεσπότας"], vok:["οἰκοδέσποτα","οἰκοδεσπόται"]}},
  {lemma:"κώμη", glosa:"by", genus:"f", accenttyp:"paroxyton", sem:[5], former:{nom:["κώμη","κῶμαι"], gen:["κώμης","κωμῶν"], dat:["κώμῃ","κώμαις"], ack:["κώμην","κώμας"], vok:["κώμη","κῶμαι"]}},
  {lemma:"δόξα", glosa:"härlighet", genus:"f", accenttyp:"paroxyton", sem:[5], former:{nom:["δόξα","δόξαι"], gen:["δόξης","δοξῶν"], dat:["δόξῃ","δόξαις"], ack:["δόξαν","δόξας"], vok:["δόξα","δόξαι"]}},
  {lemma:"λίθος", glosa:"sten", genus:"m", accenttyp:"paroxyton", sem:[5], former:{nom:["λίθος","λίθοι"], gen:["λίθου","λίθων"], dat:["λίθῳ","λίθοις"], ack:["λίθον","λίθους"], vok:["λίθε","λίθοι"]}},
  {lemma:"δαιμόνιον", glosa:"demon", genus:"n", accenttyp:"proparoxyton", sem:[5], former:{nom:["δαιμόνιον","δαιμόνια"], gen:["δαιμονίου","δαιμονίων"], dat:["δαιμονίῳ","δαιμονίοις"], ack:["δαιμόνιον","δαιμόνια"], vok:["δαιμόνιον","δαιμόνια"]}},
  {lemma:"φίλος", glosa:"vän", genus:"m", accenttyp:"paroxyton", sem:[5], former:{nom:["φίλος","φίλοι"], gen:["φίλου","φίλων"], dat:["φίλῳ","φίλοις"], ack:["φίλον","φίλους"], vok:["φίλε","φίλοι"]}}
];

const ARTIKEL = {
  m:{nom:["ὁ","οἱ"], gen:["τοῦ","τῶν"], dat:["τῷ","τοῖς"], ack:["τόν","τούς"], vok:["ὦ","ὦ"]},
  n:{nom:["τό","τά"], gen:["τοῦ","τῶν"], dat:["τῷ","τοῖς"], ack:["τό","τά"], vok:["ὦ","ὦ"]},
  f:{nom:["ἡ","αἱ"], gen:["τῆς","τῶν"], dat:["τῇ","ταῖς"], ack:["τήν","τάς"], vok:["ὦ","ὦ"]},
};

/* εἰμί, 3:e person — verifierat mot S4-bladet (presens och imperfekt) */
const EIMI = { pres:{sg:"ἐστιν", pl:"εἰσιν"}, impf:{sg:"ἦν", pl:"ἦσαν"} };
const TEMPUS_NAMN = { pres:"presens", impf:"imperfekt" };

/* ── HJÄLPARE ────────────────────────────────────────────────────────── */
const $ = id => document.getElementById(id);
function shuffle(a){ for(let i=a.length-1;i>0;i--){ const j=Math.floor(Math.random()*(i+1)); [a[i],a[j]]=[a[j],a[i]]; } return a; }
function pick(arr){ return arr[Math.floor(Math.random()*arr.length)]; }
const idx = num => num==="sg" ? 0 : 1;

const KASUS = ["nom","gen","dat","ack"];
const KASUS_NAMN = {nom:"nominativ", gen:"genitiv", dat:"dativ", ack:"ackusativ", vok:"vokativ"};
const NUM_NAMN   = {sg:"singular", pl:"plural"};
const GEN_NAMN   = {m:"maskulinum", n:"neutrum", f:"femininum"};
const ACC_NOT = {
  oxyton:"Oxytont adjektiv: accenten blir cirkumflex i genitiv och dativ (-οῦ, -ῷ, -ῶν, -οῖς).",
  paroxyton:"Paroxytont: accenten ligger fast på samma stavelse genom hela böjningen.",
  proparoxyton:"Proparoxytont: accenten flyttar ett steg framåt när ändelsen blir lång (t.ex. ἁγίου).",
  properispomenon:"Properispomenon: cirkumflexen blir akut när ändelsen blir lång (t.ex. πρώτου).",
};

/* Seminarie-axel: varje substantiv bär sem:[…] ur ord.json. 0 = "Övriga"
   (otaggade högfrekventa NT-ord). Skalar till fler seminarier. */
const SEMINARIER = [...new Set(SUBSTANTIV.flatMap(s => s.sem))].sort((a,b) => a - b);
const HAR_OVRIGA = SUBSTANTIV.some(s => s.sem.length === 0);
const SEM_VARDEN = [...SEMINARIER, ...(HAR_OVRIGA ? [0] : [])];
const semNamn = s => s === 0 ? "Övriga" : "Sem " + s;

/* ── TILLSTÅND ───────────────────────────────────────────────────────── */
const LAGER = "grekiska-kongruens-v1";
const state = {
  adjDeck:"alla", substSet:"alla", valdaSem:new Set(SEM_VARDEN), vokativ:false,
  konstruktion:"attributiv", tempus:"blandat", verblucka:false,
  streak:0, best:0,
  subst:null, adj:null, kasus:null, num:null, genus:null,
  artikel:"", substForm:"", ratt:"",
  prompt:"", fras:[],          // fras = ordnade tokens; {slot:true} markerar luckan
  lucka:"adj",                 // "adj" | "verb"  (predikativt)
  tempusVal:null, copula:"",   // valt tempus + kopulaform för aktuellt kort
  analys:"", not:"",           // upplöst facittext
  alternativ:[],               // [{form, axel, korrekt, klickad}]
  sistFel:null,                // form för senaste felklick (för skak-animation)
  klar:false, smutsig:false,
  forra:"",
};

/* ── PERSISTENS ──────────────────────────────────────────────────────── */
function spara(){
  try{
    localStorage.setItem(LAGER, JSON.stringify({
      adjDeck:state.adjDeck, substSet:state.substSet, valdaSem:[...state.valdaSem], vokativ:state.vokativ,
      konstruktion:state.konstruktion, tempus:state.tempus, verblucka:state.verblucka,
      best:state.best,
    }));
  }catch(e){}
}
function ladda(){
  try{
    const r = JSON.parse(localStorage.getItem(LAGER)); if(!r) return;
    if(r.adjDeck)  state.adjDeck  = r.adjDeck;
    if(r.substSet) state.substSet = r.substSet;
    if(Array.isArray(r.valdaSem)) state.valdaSem = new Set(r.valdaSem.filter(s => SEM_VARDEN.includes(s)));
    if(!state.valdaSem.size) state.valdaSem = new Set(SEM_VARDEN);
    if(typeof r.vokativ === "boolean") state.vokativ = r.vokativ;
    if(r.konstruktion==="attributiv"||r.konstruktion==="predikativ") state.konstruktion=r.konstruktion;
    if(["pres","impf","blandat"].includes(r.tempus)) state.tempus=r.tempus;
    if(typeof r.verblucka === "boolean") state.verblucka = r.verblucka;
    if(typeof r.best === "number") state.best = r.best;
  }catch(e){}
}

/* ── URVAL ───────────────────────────────────────────────────────────── */
function aktivaAdj(){
  const p = ADJEKTIV.filter(a => state.adjDeck==="alla" || a.kortlek===state.adjDeck);
  return p.length ? p : ADJEKTIV.slice();
}
const semMatch = s => s.sem.length ? s.sem.some(x => state.valdaSem.has(x)) : state.valdaSem.has(0);
function aktivaSubst(){
  const p = SUBSTANTIV.filter(s => (state.substSet==="alla" || s.genus===state.substSet) && semMatch(s));
  if(p.length) return p;
  const bySem = SUBSTANTIV.filter(semMatch);
  return bySem.length ? bySem : SUBSTANTIV.slice();
}

/* ── NYTT KORT ───────────────────────────────────────────────────────────
   Allt löses EN gång här och läggs i state; render() läser bara state.    */
function newQuestion(){
  state.klar = false; state.smutsig = false; state.sistFel = null;
  if(state.konstruktion === "predikativ") nyttPredikativt();
  else nyttAttributivt();
  render();
}

/* Gemensam alternativbyggare: rätt + distraktorer, backfylld till fyra,
   kollisioner borttagna. fyllPool = former att backfylla med vid behov. */
function byggAlternativ(korrekt, kand, fyllPool){
  const set = new Map();
  set.set(korrekt, {form:korrekt, axel:"rätt", korrekt:true, klickad:false});
  for(const d of kand) if(d && !set.has(d.form)) set.set(d.form, {form:d.form, axel:d.axel, korrekt:false, klickad:false});
  if(set.size < 4){
    for(const f of shuffle(fyllPool.slice())){
      if(set.size >= 4) break;
      if(!set.has(f)) set.set(f, {form:f, axel:"annan form", korrekt:false, klickad:false});
    }
  }
  state.alternativ = shuffle([...set.values()]);
}

/* ── ATTRIBUTIV (ὁ ἀγαθὸς ἀδελφός) ──────────────────────────────────── */
function nyttAttributivt(){
  const adjPool = aktivaAdj(), substPool = aktivaSubst();
  const kasusVal = state.vokativ ? [...KASUS,"vok"] : KASUS.slice();

  let subst, adj, kasus, num, nyckel, forsok = 0;
  do {
    subst = pick(substPool); adj = pick(adjPool);
    kasus = pick(kasusVal);  num = pick(["sg","pl"]);
    nyckel = "a"+subst.lemma + adj.lemma + kasus + num;
  } while(nyckel === state.forra && ++forsok < 30);
  state.forra = nyckel;

  const g = subst.genus, ni = idx(num);
  const korrekt = adj[g][kasus][ni];
  state.subst = subst; state.adj = adj; state.kasus = kasus; state.num = num; state.genus = g;
  state.lucka = "adj"; state.ratt = korrekt;
  const artikel = ARTIKEL[g][kasus][ni], substForm = subst.former[kasus][ni];
  state.artikel = artikel; state.substForm = substForm;

  state.prompt = `Vilken form av <span class="lemma">${adj.lemma}</span> <span class="glosa">(${adj.glosa})</span> passar?`;
  state.fras = [ {text:artikel}, {slot:true}, {text:substForm} ];
  state.analys = GEN_NAMN[g] + " · " + NUM_NAMN[num] + " · " + KASUS_NAMN[kasus];
  if(g==="f" && kasus==="gen" && num==="pl")
    state.not = "Feminint adjektiv i genitiv plural följer maskulinums accent (ἁγίων) — inte substantivens -ῶν (ἐκκλησιῶν).";
  else
    state.not = ACC_NOT[adj.accenttyp] || "";

  const annatNum = num==="sg" ? "pl" : "sg";
  const kand = [];
  for(const k of shuffle(kasusVal.filter(k => k!==kasus)))
    if(adj[g][k][ni] !== korrekt){ kand.push({form:adj[g][k][ni], axel:"fel kasus"}); break; }
  if(adj[g][kasus][idx(annatNum)] !== korrekt)
    kand.push({form:adj[g][kasus][idx(annatNum)], axel:"fel numerus"});
  for(const ag of shuffle(["m","n","f"].filter(x => x !== g)))
    if(adj[ag][kasus][ni] !== korrekt){ kand.push({form:adj[ag][kasus][ni], axel:"fel genus"}); break; }

  const fyll = [];
  for(const gg of ["m","n","f"]) for(const k of ["nom","gen","dat","ack","vok"]) for(const n2 of [0,1]) fyll.push(adj[gg][k][n2]);
  byggAlternativ(korrekt, kand, fyll);
}

/* ── PREDIKATIV (ὁ ἀδελφός ἐστιν ἀγαθός) ────────────────────────────────
   Subjekt och predikatsfyllnad står BÅDA i nominativ; bara genus + numerus
   rättas. Med verblucka blankas ibland εἰμί istället. */
function nyttPredikativt(){
  const adjPool = aktivaAdj(), substPool = aktivaSubst();

  let subst, adj, num, tempus, lucka, nyckel, forsok = 0;
  do {
    subst = pick(substPool); adj = pick(adjPool); num = pick(["sg","pl"]);
    tempus = state.tempus==="blandat" ? pick(["pres","impf"]) : state.tempus;
    lucka = (state.verblucka && Math.random() < 0.4) ? "verb" : "adj";
    nyckel = "p"+subst.lemma + adj.lemma + num + tempus + lucka;
  } while(nyckel === state.forra && ++forsok < 30);
  state.forra = nyckel;

  const g = subst.genus, ni = idx(num), annatNum = num==="sg" ? "pl" : "sg";
  const annatTempus = tempus==="pres" ? "impf" : "pres";
  const copula = EIMI[tempus][num];
  const adjForm = adj[g].nom[ni];
  const subjekt = ARTIKEL[g].nom[ni] + " " + subst.former.nom[ni];

  state.subst = subst; state.adj = adj; state.kasus = "nom"; state.num = num; state.genus = g;
  state.tempusVal = tempus; state.copula = copula; state.lucka = lucka;
  state.artikel = ARTIKEL[g].nom[ni]; state.substForm = subst.former.nom[ni];

  if(lucka === "adj"){
    state.ratt = adjForm;
    state.prompt = `Vilken form av <span class="lemma">${adj.lemma}</span> <span class="glosa">(${adj.glosa})</span> passar som predikatsfyllnad?`;
    state.fras = [ {text:subjekt}, {text:copula}, {slot:true} ];
    state.analys = "predikativ · " + GEN_NAMN[g] + " " + NUM_NAMN[num] + " · nominativ";
    state.not = "Predikatsfyllnaden står i nominativ precis som subjektet — εἰμί fungerar som ett likhetstecken och tar inget objekt. Den rättar sig bara i genus och numerus.";

    const kand = []; const tagna = new Set([adjForm]);
    const lagg = (form, axel) => { if(form!==undefined && !tagna.has(form)){ kand.push({form,axel}); tagna.add(form); return true; } return false; };
    // mest begränsad först: numerus (1 kandidat) → genus (2) → kasus-fällan (3),
    // så Greek-syncretism inte raderar en hel axel
    lagg(adj[g].nom[idx(annatNum)], "fel numerus");
    for(const ag of shuffle(["m","n","f"].filter(x => x !== g))) if(lagg(adj[ag].nom[ni], "fel genus")) break;
    for(const k of ["ack","gen","dat"]) if(lagg(adj[g][k][ni], "ej nominativ")) break;

    const fyll = [];
    for(const gg of ["m","n","f"]) for(const k of ["nom","gen","dat","ack"]) for(const n2 of [0,1]) fyll.push(adj[gg][k][n2]);
    byggAlternativ(adjForm, kand, fyll);
  } else {
    state.ratt = copula;
    state.prompt = `Vilken form av <span class="lemma">εἰμί</span> <span class="glosa">(vara)</span> passar?`;
    state.fras = [ {text:subjekt}, {slot:true}, {text:adjForm} ];
    state.analys = "εἰμί · " + TEMPUS_NAMN[tempus] + " · " + NUM_NAMN[num] + " (3:e person)";
    state.not = "εἰμί rättar sig efter subjektet i numerus. Predikatsfyllnaden står ändå i nominativ.";

    const kand = [
      {form:EIMI[tempus][annatNum],      axel:"fel numerus"},
      {form:EIMI[annatTempus][num],      axel:"fel tempus"},
      {form:EIMI[annatTempus][annatNum], axel:"fel num. + tempus"},
    ];
    const fyll = [EIMI.pres.sg,EIMI.pres.pl,EIMI.impf.sg,EIMI.impf.pl];
    byggAlternativ(copula, kand, fyll);
  }
}

/* ── SVAR ────────────────────────────────────────────────────────────── */
function svara(i){
  if(state.klar) return;
  const o = state.alternativ[i];
  if(o.klickad) return;
  o.klickad = true;
  if(o.korrekt){
    state.klar = true;
    if(!state.smutsig){ state.streak++; if(state.streak > state.best){ state.best = state.streak; spara(); } }
  } else {
    state.smutsig = true; state.streak = 0; state.sistFel = o.form;
  }
  render();
}

function visaSvar(){                       // ge upp → sviten nollas
  state.klar = true; state.smutsig = true; state.streak = 0; state.sistFel = null;
  render();
}

/* ── RENDERING ───────────────────────────────────────────────────────── */
function render(){
  $("streak").textContent = state.streak;
  $("best").textContent   = state.best;
  $("prompt").innerHTML   = state.prompt;

  // frasen byggs ur tokens; {slot:true} blir luckan (fylld vid facit)
  const fras = $("fras"); fras.innerHTML = "";
  state.fras.forEach(tok => {
    const span = document.createElement("span");
    if(tok.slot){
      span.className = "slot" + (state.klar ? " fylld" : "");
      span.textContent = state.klar ? state.ratt : "\u00A0";
    } else {
      span.textContent = tok.text;
    }
    fras.appendChild(span);
  });

  const box = $("alternativ"); box.innerHTML = "";
  state.alternativ.forEach((o,i) => {
    const b = document.createElement("button");
    b.className = "opt";
    const form = document.createElement("span"); form.textContent = o.form; b.appendChild(form);
    const axel = document.createElement("span"); axel.className = "axel"; b.appendChild(axel);
    if(state.klar && o.korrekt){ b.classList.add("ratt"); b.disabled = true; }
    if(o.klickad && !o.korrekt){
      b.classList.add("fel"); axel.textContent = o.axel; b.disabled = true;
      if(o.form === state.sistFel) b.classList.add("skaka");
    }
    if(state.klar) b.disabled = true;
    b.addEventListener("click", () => svara(i));
    box.appendChild(b);
  });

  const rev = $("reveal");
  if(state.klar){
    rev.classList.remove("hidden");
    $("helfras").textContent = state.fras.map(t => t.slot ? state.ratt : t.text).join(" ");
    $("analys").textContent  = state.analys;
    $("not").textContent     = state.not;
  } else {
    rev.classList.add("hidden");
  }
  $("btn-visa").classList.toggle("hidden", state.klar);
}

/* ── INSTÄLLNINGAR ───────────────────────────────────────────────────── */
function segVal(grupp, varde){
  [...grupp.children].forEach(b => b.setAttribute("aria-pressed", String(b.dataset.v === varde)));
}
function bindSeg(id, getter, setter){
  const g = $(id);
  g.addEventListener("click", e => {
    const b = e.target.closest("button"); if(!b) return;
    setter(b.dataset.v); segVal(g, getter()); spara(); newQuestion();
  });
}
function byggGridSem(){
  const g = $("grid-sem"); g.innerHTML = "";
  SEM_VARDEN.forEach(s => {
    const b = document.createElement("button");
    b.className = "toggle"; b.textContent = semNamn(s);
    b.setAttribute("aria-pressed", String(state.valdaSem.has(s)));
    b.onclick = () => {
      state.valdaSem.has(s) ? state.valdaSem.delete(s) : state.valdaSem.add(s);
      b.setAttribute("aria-pressed", String(state.valdaSem.has(s))); uppdateraSnabbChips(); spara(); newQuestion();
    };
    g.appendChild(b);
  });
  uppdateraSnabbChips();
}
/* "alla"/"inga"-chipsen blir svarta (aria-pressed) när seminarieurvalet exakt
   motsvarar allt resp. inget — så valet syns även på snabbvalen. */
function setEq(a, b){ return a.size === b.size && [...a].every(x => b.has(x)); }
function uppdateraSnabbChips(){
  const v = state.valdaSem;
  const all = document.querySelector("[data-sem-all]"), none = document.querySelector("[data-sem-none]");
  if(all)  all.setAttribute("aria-pressed", setEq(v, new Set(SEM_VARDEN)));
  if(none) none.setAttribute("aria-pressed", v.size === 0);
}

/* visar rätt inställningssektioner för aktuell konstruktion */
function syncPickerSynlighet(){
  const pred = state.konstruktion === "predikativ";
  $("sek-kasus").classList.toggle("hidden", pred);       // kasus irrelevant predikativt
  $("sek-tempus").classList.toggle("hidden", !pred);
  $("sek-verblucka").classList.toggle("hidden", !pred);
  $("sub").textContent = pred
    ? "Predikatsfyllnaden står i nominativ och rättar sig efter subjektet i genus och numerus."
    : "Adjektivet rättar sig efter sitt huvudord — i genus, numerus och kasus.";
}

function init(){
  ladda();
  segVal($("seg-konstr"), state.konstruktion);
  segVal($("seg-adj"),    state.adjDeck);
  segVal($("seg-subst"),  state.substSet);
  segVal($("seg-tempus"), state.tempus);
  $("tg-vok").setAttribute("aria-pressed", String(state.vokativ));
  $("tg-verblucka").setAttribute("aria-pressed", String(state.verblucka));
  syncPickerSynlighet();

  bindSeg("seg-adj",   () => state.adjDeck,  v => state.adjDeck  = v);
  bindSeg("seg-subst", () => state.substSet, v => state.substSet = v);
  bindSeg("seg-tempus",() => state.tempus,   v => state.tempus   = v);
  $("seg-konstr").addEventListener("click", e => {
    const b = e.target.closest("button"); if(!b) return;
    state.konstruktion = b.dataset.v; segVal($("seg-konstr"), state.konstruktion);
    syncPickerSynlighet(); spara(); newQuestion();
  });

  $("tg-vok").addEventListener("click", () => {
    state.vokativ = !state.vokativ;
    $("tg-vok").setAttribute("aria-pressed", String(state.vokativ));
    spara(); newQuestion();
  });
  $("tg-verblucka").addEventListener("click", () => {
    state.verblucka = !state.verblucka;
    $("tg-verblucka").setAttribute("aria-pressed", String(state.verblucka));
    spara(); newQuestion();
  });

  byggGridSem();
  document.querySelector("[data-sem-all]").addEventListener("click", () => { state.valdaSem = new Set(SEM_VARDEN); byggGridSem(); spara(); newQuestion(); });
  document.querySelector("[data-sem-none]").addEventListener("click", () => { state.valdaSem = new Set(); byggGridSem(); spara(); newQuestion(); });

  $("btn-next").addEventListener("click", newQuestion);
  $("btn-visa").addEventListener("click", visaSvar);

  $("picker-toggle").addEventListener("click", () => {
    const open = $("picker-toggle").getAttribute("aria-expanded") === "true";
    $("picker-toggle").setAttribute("aria-expanded", String(!open));
    $("picker-body").classList.toggle("hidden", open);
  });

  newQuestion();
}
init();

}
