// Vy: Glosor — portad exakt från grekiska-glosspel.html
let __kh = null;
export function teardown(){ if(__kh){ document.removeEventListener("keydown", __kh); __kh = null; } }
const MARKUP = `<div class="vy vy-glosor">
<header>
  <h1>Bibelgrekiska — glosor</h1>
  <div class="sub" id="subtitle">seminarium 2–10 · grekiska → svenska</div>
</header>

<div class="modes" role="group" aria-label="Spelläge">
  <button class="mode" id="mode-flashcard" aria-pressed="true">Flashcard</button>
  <button class="mode" id="mode-flerval" aria-pressed="false">Flerval</button>
  <button class="mode" id="mode-former" aria-pressed="false">Former</button>
</div>

<div class="stage">
  <div class="card" id="card"></div>
  <div class="controls" id="controls"></div>
  <div class="stats" id="stats"></div>
</div>

<div class="picker">
  <button class="picker-toggle" id="picker-toggle" aria-expanded="false">
    <span>Anpassa övningen <span class="count" id="picker-count"></span></span>
    <span class="chev">▾</span>
  </button>
  <div class="picker-body" id="picker-body" hidden>
    <div class="picker-section">
      <h2>Kortlek</h2>
      <div class="grid deck-grid" id="deck-grid"></div>
      <div class="deck-desc" id="deck-desc"></div>
    </div>
    <div class="picker-section" id="sem-section">
      <h2>Seminarium</h2>
      <div class="quickrow">
        <span class="quicklabel">Snabbval:</span>
        <button class="chip" data-quick="sem-all">alla</button>
        <button class="chip" data-quick="sem-none">inga</button>
      </div>
      <div class="grid" id="sem-grid"></div>
    </div>
    <div class="picker-section" id="band-section" hidden>
      <h2>Frekvens i NT</h2>
      <div class="quickrow">
        <span class="quicklabel">Snabbval:</span>
        <button class="chip" data-quick="band-all">alla</button>
        <button class="chip" data-quick="band-none">inga</button>
      </div>
      <div class="grid" id="band-grid"></div>
    </div>
    <div class="picker-section">
      <h2>Ordklass</h2>
      <div class="quickrow">
        <span class="quicklabel">Snabbval:</span>
        <button class="chip" data-quick="ok-all">alla</button>
        <button class="chip" data-quick="ok-none">inga</button>
      </div>
      <div class="grid" id="ok-grid"></div>
    </div>
    <div class="note" id="picker-note"></div>
  </div>
</div>
</div>`;
export function render(root, opts = {}){
  root.innerHTML = MARKUP;

/* ── DATA (snapshot ur glosor.json: hela uppsättningen, d=kortlek ["sem"|"60"], f=effektiv frekvens) ─ */
const GLOSOR = [
  {"l": "ἀγαθός", "g": "god", "o": "adjektiv", "gen": null, "f": 101, "s": [3, 4, 5], "d": ["sem", "60", "prov"]},
  {"l": "ἀγαπάω", "g": "älska", "o": "verb", "gen": null, "f": 143, "s": [], "d": ["60"]},
  {"l": "ἀγάπη", "g": "kärlek", "o": "substantiv", "gen": "f", "f": 116, "s": [4], "d": ["sem", "60"]},
  {"l": "ἄγγελος", "g": "budbärare, ängel", "o": "substantiv", "gen": "m", "f": 175, "s": [2, 3, 6], "d": ["sem", "60", "prov"]},
  {"l": "ἅγιος", "g": "helig, vördnadsvärd", "o": "adjektiv", "gen": null, "f": 233, "s": [3], "d": ["sem", "60", "prov"]},
  {"l": "ἀδελφός", "g": "bror", "o": "substantiv", "gen": "m", "f": 342, "s": [2, 3, 4, 5, 7], "d": ["sem", "60", "prov"]},
  {"l": "αἷμα", "g": "blod", "o": "substantiv", "gen": "n", "f": 97, "s": [8, 9], "d": ["sem", "60"]},
  {"l": "αἴρω", "g": "ta upp, lyfta, höja", "o": "verb", "gen": null, "f": 101, "s": [], "d": ["60"]},
  {"l": "αἰτέω", "g": "bedja, begära, kräva", "o": "verb", "gen": null, "f": 70, "s": [5, 7], "d": ["sem", "60"]},
  {"l": "αἰών", "g": "evighet", "o": "substantiv", "gen": "m", "f": 122, "s": [], "d": ["60"]},
  {"l": "αἰώνιος", "g": "evig", "o": "adjektiv", "gen": null, "f": 69, "s": [5, 9], "d": ["sem", "60"]},
  {"l": "ἀκολουθέω", "g": "följa", "o": "verb", "gen": null, "f": 89, "s": [8], "d": ["sem", "60", "prov"]},
  {"l": "ἀκούω", "g": "höra, lyssna", "o": "verb", "gen": null, "f": 427, "s": [2, 3, 5, 7, 8], "d": ["sem", "60", "prov"]},
  {"l": "ἀλήθεια", "g": "sanning", "o": "substantiv", "gen": "f", "f": 109, "s": [4, 5, 6], "d": ["sem", "60"]},
  {"l": "ἀλλά", "g": "utan, men, dock", "o": "partikel", "gen": null, "f": 638, "s": [5], "d": ["sem", "60"]},
  {"l": "ἀλλήλων", "g": "varandra", "o": "pron.adj", "gen": null, "f": 100, "s": [], "d": ["60"]},
  {"l": "ἄλλος", "g": "annan, annat", "o": "pron.adj", "gen": null, "f": 154, "s": [8], "d": ["sem", "60"]},
  {"l": "ἁμαρτία", "g": "synd", "o": "substantiv", "gen": "f", "f": 172, "s": [7], "d": ["sem", "60"]},
  {"l": "ἀμήν", "g": "amen, sannerligen", "o": "partikel", "gen": null, "f": 128, "s": [], "d": ["60"]},
  {"l": "ἄν", "g": "modalpartikel", "o": "partikel", "gen": null, "f": 171, "s": [], "d": ["60"]},
  {"l": "ἀναβαίνω", "g": "stiga upp, gå upp", "o": "verb", "gen": null, "f": 81, "s": [8], "d": ["sem", "60"]},
  {"l": "ἀνήρ", "g": "man", "o": "substantiv", "gen": "m", "f": 216, "s": [9], "d": ["sem", "60", "prov"]},
  {"l": "ἄνθρωπος", "g": "människa", "o": "substantiv", "gen": "m", "f": 550, "s": [2, 5, 7], "d": ["sem", "60", "prov"]},
  {"l": "ἀνίστημι", "g": "resa upp, resa sig, uppträda", "o": "verb", "gen": null, "f": 108, "s": [], "d": ["60"]},
  {"l": "ἀνοίγω", "g": "öppna", "o": "verb", "gen": null, "f": 77, "s": [], "d": ["60"]},
  {"l": "ἀπέρχομαι", "g": "gå bort, bege sig", "o": "verb", "gen": null, "f": 117, "s": [], "d": ["60"]},
  {"l": "ἀπό", "g": "från, av", "o": "preposition", "gen": null, "f": 644, "s": [5], "d": ["sem", "60"]},
  {"l": "ἀποθνῄσκω", "g": "dö", "o": "verb", "gen": null, "f": 111, "s": [], "d": ["60"]},
  {"l": "ἀποκρίνομαι", "g": "svara", "o": "verb", "gen": null, "f": 232, "s": [], "d": ["60"]},
  {"l": "ἀποκτείνω", "g": "döda", "o": "verb", "gen": null, "f": 74, "s": [], "d": ["60"]},
  {"l": "ἀπόλλυμι", "g": "förlora, förgöra", "o": "verb", "gen": null, "f": 90, "s": [], "d": ["60"]},
  {"l": "ἀποστέλλω", "g": "sända ut, skicka", "o": "verb", "gen": null, "f": 132, "s": [], "d": ["60", "prov"]},
  {"l": "ἀπόστολος", "g": "sändebud, apostel", "o": "substantiv", "gen": "m", "f": 79, "s": [2, 6], "d": ["sem", "60", "prov"]},
  {"l": "ἄρτος", "g": "bröd", "o": "substantiv", "gen": "m", "f": 97, "s": [3, 4, 5, 9], "d": ["sem", "60"]},
  {"l": "ἀρχιερεύς", "g": "överstepräst", "o": "substantiv", "gen": "m", "f": 122, "s": [], "d": ["60"]},
  {"l": "ἄρχω", "g": "börja, härska över", "o": "verb", "gen": null, "f": 86, "s": [], "d": ["60"]},
  {"l": "αὐτός", "g": "han, hon, den, det", "o": "pronomen", "gen": null, "f": 5546, "s": [6, 7], "d": ["sem", "60"]},
  {"l": "βάλλω", "g": "kasta, lägga, sätta", "o": "verb", "gen": null, "f": 121, "s": [7], "d": ["sem", "60"]},
  {"l": "βαπτίζω", "g": "döpa", "o": "verb", "gen": null, "f": 77, "s": [3, 6, 7], "d": ["sem", "60", "prov"]},
  {"l": "βασιλεία", "g": "rike", "o": "substantiv", "gen": "f", "f": 162, "s": [4, 8], "d": ["sem", "60"]},
  {"l": "βασιλεύς", "g": "kung", "o": "substantiv", "gen": "m", "f": 115, "s": [], "d": ["60"]},
  {"l": "βαστάζω", "g": "bära, lyfta", "o": "verb", "gen": null, "f": 27, "s": [10], "d": ["sem"]},
  {"l": "βλέπω", "g": "se, titta", "o": "verb", "gen": null, "f": 133, "s": [2, 3, 5, 7], "d": ["sem", "60", "prov"]},
  {"l": "γάρ", "g": "ty, för, ju", "o": "partikel", "gen": null, "f": 1039, "s": [4, 5], "d": ["sem", "60", "prov"]},
  {"l": "γεννάω", "g": "föda, avla, framkalla", "o": "verb", "gen": null, "f": 97, "s": [], "d": ["60"]},
  {"l": "γῆ", "g": "jord", "o": "substantiv", "gen": "f", "f": 248, "s": [5, 9], "d": ["sem", "60"]},
  {"l": "γίνομαι", "g": "bli, födas, uppstå", "o": "verb", "gen": null, "f": 667, "s": [], "d": ["60"]},
  {"l": "γινώσκω", "g": "känna, veta, förstå, inse", "o": "verb", "gen": null, "f": 221, "s": [], "d": ["60"]},
  {"l": "γραμματεύς", "g": "skrivare, skriftlärd", "o": "substantiv", "gen": "m", "f": 62, "s": [], "d": ["60"]},
  {"l": "γράφω", "g": "skriva, rita", "o": "verb", "gen": null, "f": 190, "s": [2, 3, 5, 7, 8], "d": ["sem", "60", "prov"]},
  {"l": "γυνή", "g": "kvinna", "o": "substantiv", "gen": "f", "f": 212, "s": [8], "d": ["sem", "60"]},
  {"l": "δαιμόνιον", "g": "ond ande, demon", "o": "substantiv", "gen": "n", "f": 63, "s": [5, 7], "d": ["sem", "60"]},
  {"l": "δέ", "g": "och, men", "o": "partikel", "gen": null, "f": 2766, "s": [5, 6], "d": ["sem", "60", "prov"]},
  {"l": "δεῖ", "g": "man måste, det åligger", "o": "verb", "gen": null, "f": null, "s": [], "d": []},
  {"l": "δείκνυμι", "g": "visa, peka", "o": "verb", "gen": null, "f": 33, "s": [10], "d": ["sem"]},
  {"l": "δέχομαι", "g": "ta emot", "o": "verb", "gen": null, "f": 56, "s": [10], "d": ["sem"]},
  {"l": "διά", "g": "genom; på grund av", "o": "preposition", "gen": null, "f": 666, "s": [5, 7], "d": ["sem", "60"]},
  {"l": "διδάσκω", "g": "undervisa, lära", "o": "verb", "gen": null, "f": 96, "s": [7, 8], "d": ["sem", "60"]},
  {"l": "δίδωμι", "g": "ge", "o": "verb", "gen": null, "f": 415, "s": [10], "d": ["sem", "60", "prov"]},
  {"l": "δίκαιος", "g": "rättvis, rättfärdig", "o": "adjektiv", "gen": null, "f": 79, "s": [4, 5], "d": ["sem", "60", "prov"]},
  {"l": "δικαιοσύνη", "g": "rättvisa, rättfärdighet", "o": "substantiv", "gen": "f", "f": 91, "s": [5], "d": ["sem", "60"]},
  {"l": "δόξα", "g": "ära, heder; glans", "o": "substantiv", "gen": "f", "f": 165, "s": [5], "d": ["sem", "60"]},
  {"l": "δοῦλος", "g": "tjänare, slav", "o": "substantiv", "gen": "m", "f": 126, "s": [2, 3, 4, 5, 7], "d": ["sem", "60", "prov"]},
  {"l": "δύναμαι", "g": "kunna, förmå", "o": "verb", "gen": null, "f": 209, "s": [], "d": ["60"]},
  {"l": "δύναμις", "g": "förmåga, makt, kraft", "o": "substantiv", "gen": "f", "f": 119, "s": [], "d": ["60"]},
  {"l": "δύο", "g": "två", "o": "räkneord", "gen": null, "f": 135, "s": [], "d": ["60"]},
  {"l": "δώδεκα", "g": "tolv", "o": "räkneord", "gen": null, "f": 75, "s": [], "d": ["60"]},
  {"l": "ἐάν", "g": "om", "o": "partikel", "gen": null, "f": 331, "s": [], "d": ["60"]},
  {"l": "ἑαυτοῦ", "g": "sig själv", "o": "pronomen", "gen": null, "f": 333, "s": [], "d": ["60"]},
  {"l": "ἐγείρω", "g": "väcka, låta stå upp", "o": "verb", "gen": null, "f": 143, "s": [6], "d": ["sem", "60"]},
  {"l": "ἐγώ", "g": "jag", "o": "pronomen", "gen": null, "f": 2572, "s": [5, 7], "d": ["sem", "60"]},
  {"l": "ἔθνος", "g": "folkstam, folk, hednafolk", "o": "substantiv", "gen": "n", "f": 160, "s": [], "d": ["60"]},
  {"l": "εἰ", "g": "om", "o": "partikel", "gen": null, "f": 502, "s": [7, 8], "d": ["sem", "60", "prov"]},
  {"l": "εἶδον", "g": "jag såg", "o": "verb", "gen": null, "f": null, "s": [], "d": []},
  {"l": "εἰμί", "g": "vara", "o": "verb", "gen": null, "f": 2456, "s": [4, 5, 7], "d": ["sem", "60", "prov"]},
  {"l": "εἶπον", "g": "jag sade", "o": "verb", "gen": null, "f": null, "s": [], "d": []},
  {"l": "εἰρήνη", "g": "fred", "o": "substantiv", "gen": "f", "f": 91, "s": [4, 6, 9], "d": ["sem", "60"]},
  {"l": "εἰς", "g": "in i, mot", "o": "preposition", "gen": null, "f": 1754, "s": [4, 5], "d": ["sem", "60", "prov"]},
  {"l": "εἷς", "g": "en, ett", "o": "räkneord", "gen": null, "f": 342, "s": [7], "d": ["sem", "60"]},
  {"l": "εἰσέρχομαι", "g": "gå in, komma in", "o": "verb", "gen": null, "f": 193, "s": [8], "d": ["sem", "60"]},
  {"l": "ἐκ", "g": "ur, ut ur, från", "o": "preposition", "gen": null, "f": 913, "s": [5], "d": ["sem", "60", "prov"]},
  {"l": "ἕκαστος", "g": "varje, var och en", "o": "pron.adj", "gen": null, "f": 81, "s": [], "d": ["60"]},
  {"l": "ἐκβάλλω", "g": "kasta ut, förkasta", "o": "verb", "gen": null, "f": 81, "s": [6, 7], "d": ["sem", "60"]},
  {"l": "ἐκεῖ", "g": "där", "o": "adverb", "gen": null, "f": 95, "s": [], "d": ["60"]},
  {"l": "ἐκεῖνος", "g": "den där", "o": "pronomen", "gen": null, "f": 242, "s": [6, 7], "d": ["sem", "60"]},
  {"l": "ἐκκλησία", "g": "församling", "o": "substantiv", "gen": "f", "f": 114, "s": [5, 7], "d": ["sem", "60", "prov"]},
  {"l": "ἐμός", "g": "min, mitt", "o": "pron.adj", "gen": null, "f": 76, "s": [7], "d": ["sem", "60"]},
  {"l": "ἐν", "g": "i, med", "o": "preposition", "gen": null, "f": 2733, "s": [4, 5, 7], "d": ["sem", "60", "prov"]},
  {"l": "ἐντολή", "g": "bud, budord", "o": "substantiv", "gen": "f", "f": 66, "s": [4, 5], "d": ["sem", "60"]},
  {"l": "ἐνώπιον", "g": "inför", "o": "preposition", "gen": null, "f": 94, "s": [], "d": ["60"]},
  {"l": "ἐξέρχομαι", "g": "gå ut, komma ut", "o": "verb", "gen": null, "f": 216, "s": [], "d": ["60"]},
  {"l": "ἐξουσία", "g": "rätt, fullmakt, myndighet", "o": "substantiv", "gen": "f", "f": 102, "s": [5], "d": ["sem", "60"]},
  {"l": "ἐπί", "g": "på, över, vid, mot", "o": "preposition", "gen": null, "f": 885, "s": [5, 7], "d": ["sem", "60"]},
  {"l": "ἑπτά", "g": "sju", "o": "räkneord", "gen": null, "f": 88, "s": [], "d": ["60"]},
  {"l": "ἐργάζομαι", "g": "arbeta", "o": "verb", "gen": null, "f": 41, "s": [10], "d": ["sem"]},
  {"l": "ἔργον", "g": "verk, gärning", "o": "substantiv", "gen": "n", "f": 169, "s": [4, 5, 7], "d": ["sem", "60", "prov"]},
  {"l": "ἔρχομαι", "g": "gå, komma", "o": "verb", "gen": null, "f": 631, "s": [10], "d": ["sem", "60"]},
  {"l": "ἐσθίω", "g": "äta", "o": "verb", "gen": null, "f": 157, "s": [2, 3, 4, 7, 8], "d": ["sem", "60"]},
  {"l": "ἕτερος", "g": "annan, övrig", "o": "pron.adj", "gen": null, "f": 97, "s": [], "d": ["60"]},
  {"l": "ἔτι", "g": "ännu, fortfarande", "o": "partikel", "gen": null, "f": 93, "s": [], "d": ["60"]},
  {"l": "εὐαγγέλιον", "g": "glatt budskap, evangelium", "o": "substantiv", "gen": "n", "f": 75, "s": [3, 5], "d": ["sem", "60"]},
  {"l": "εὐθύς", "g": "rakt, genast", "o": "adverb", "gen": null, "f": 59, "s": [], "d": []},
  {"l": "εὑρίσκω", "g": "finna, hitta, påträffa", "o": "verb", "gen": null, "f": 176, "s": [2, 6], "d": ["sem", "60"]},
  {"l": "ἔχω", "g": "ha, hålla, äga", "o": "verb", "gen": null, "f": 706, "s": [], "d": ["60"]},
  {"l": "ἕως", "g": "till dess, förrän", "o": "partikel", "gen": null, "f": 145, "s": [], "d": ["60"]},
  {"l": "ζάω", "g": "leva", "o": "verb", "gen": null, "f": 140, "s": [], "d": ["60"]},
  {"l": "ζητέω", "g": "söka, sträva efter, undersöka", "o": "verb", "gen": null, "f": 117, "s": [4, 5, 6, 7, 8], "d": ["sem", "60"]},
  {"l": "ζωή", "g": "liv", "o": "substantiv", "gen": "f", "f": 135, "s": [], "d": ["60", "prov"]},
  {"l": "ἤ", "g": "eller", "o": "partikel", "gen": null, "f": 346, "s": [], "d": ["60"]},
  {"l": "ἦλθον", "g": "jag kom, jag gick", "o": "verb", "gen": null, "f": null, "s": [], "d": []},
  {"l": "ἡμεῖς", "g": "vi", "o": "pronomen", "gen": null, "f": null, "s": [5], "d": ["sem"]},
  {"l": "ἡμέρα", "g": "dag", "o": "substantiv", "gen": "f", "f": 389, "s": [], "d": ["60"]},
  {"l": "θάλασσα", "g": "hav, sjö", "o": "substantiv", "gen": "f", "f": 90, "s": [5], "d": ["sem", "60"]},
  {"l": "θάνατος", "g": "död", "o": "substantiv", "gen": "m", "f": 120, "s": [6], "d": ["sem", "60"]},
  {"l": "θεάομαι", "g": "skåda, betrakta", "o": "verb", "gen": null, "f": 22, "s": [10], "d": ["sem"]},
  {"l": "θέλημα", "g": "vilja, lust", "o": "substantiv", "gen": "n", "f": 62, "s": [], "d": ["60"]},
  {"l": "θέλω", "g": "vilja, önska", "o": "verb", "gen": null, "f": 208, "s": [7, 8], "d": ["sem", "60"]},
  {"l": "θεός", "g": "gud", "o": "substantiv", "gen": "m", "f": 1307, "s": [2, 3, 5, 7], "d": ["sem", "60", "prov"]},
  {"l": "ἴδιος", "g": "egen, eget", "o": "pron.adj", "gen": null, "f": 114, "s": [], "d": ["60"]},
  {"l": "ἰδού", "g": "se!", "o": "interjektion", "gen": null, "f": 200, "s": [], "d": ["60"]},
  {"l": "ἱερόν", "g": "tempel, helgedom", "o": "substantiv", "gen": "n", "f": null, "s": [3, 5], "d": ["sem", "prov"]},
  {"l": "ἵνα", "g": "för att", "o": "partikel", "gen": null, "f": 662, "s": [8], "d": ["sem", "60"]},
  {"l": "ἵστημι", "g": "ställa, stå, bestå", "o": "verb", "gen": null, "f": 153, "s": [], "d": ["60"]},
  {"l": "κάθημαι", "g": "sitta, sätta sig", "o": "verb", "gen": null, "f": 91, "s": [], "d": ["60"]},
  {"l": "καθώς", "g": "som, sådan som", "o": "partikel", "gen": null, "f": 182, "s": [], "d": ["60"]},
  {"l": "καί", "g": "och, också", "o": "partikel", "gen": null, "f": 8973, "s": [4, 5], "d": ["sem", "60", "prov"]},
  {"l": "καιρός", "g": "tid, tidpunkt", "o": "substantiv", "gen": "m", "f": 85, "s": [7], "d": ["sem", "60"]},
  {"l": "καλέω", "g": "kalla", "o": "verb", "gen": null, "f": 148, "s": [5, 8], "d": ["sem", "60", "prov"]},
  {"l": "καλός", "g": "fin, skön, vacker", "o": "adjektiv", "gen": null, "f": 101, "s": [3, 4], "d": ["sem", "60"]},
  {"l": "καρδία", "g": "hjärta", "o": "substantiv", "gen": "f", "f": 156, "s": [7], "d": ["sem", "60"]},
  {"l": "καρπός", "g": "frukt", "o": "substantiv", "gen": "m", "f": 66, "s": [7], "d": ["sem", "60"]},
  {"l": "κατά", "g": "mot; enligt", "o": "preposition", "gen": null, "f": 469, "s": [5], "d": ["sem", "60"]},
  {"l": "καταβαίνω", "g": "stiga ned, komma ned", "o": "verb", "gen": null, "f": 80, "s": [8], "d": ["sem", "60"]},
  {"l": "κεφαλή", "g": "huvud", "o": "substantiv", "gen": "f", "f": 75, "s": [], "d": ["60"]},
  {"l": "κόσμος", "g": "värld, världsordning", "o": "substantiv", "gen": "m", "f": 185, "s": [4, 5, 9], "d": ["sem", "60"]},
  {"l": "κρίνω", "g": "döma, bedöma", "o": "verb", "gen": null, "f": 114, "s": [8], "d": ["sem", "60"]},
  {"l": "κυνάριον", "g": "hund, liten hund", "o": "substantiv", "gen": "n", "f": 4, "s": [10], "d": ["sem"]},
  {"l": "κύριος", "g": "herre, härskare", "o": "substantiv", "gen": "m", "f": 713, "s": [2, 4, 5, 7], "d": ["sem", "60", "prov"]},
  {"l": "λαλέω", "g": "prata, tala", "o": "verb", "gen": null, "f": 297, "s": [4, 5, 6, 7, 8], "d": ["sem", "60", "prov"]},
  {"l": "λαμβάνω", "g": "ta, ta emot, få", "o": "verb", "gen": null, "f": 258, "s": [2], "d": ["sem", "60"]},
  {"l": "λαός", "g": "folk", "o": "substantiv", "gen": "m", "f": 141, "s": [], "d": ["60"]},
  {"l": "λέγω", "g": "tala, säga", "o": "verb", "gen": null, "f": 2345, "s": [2, 3, 5, 6, 7], "d": ["sem", "60", "prov"]},
  {"l": "λόγος", "g": "ord, tal, berättelse", "o": "substantiv", "gen": "m", "f": 330, "s": [2, 3, 5, 7], "d": ["sem", "60", "prov"]},
  {"l": "λούω", "g": "tvätta", "o": "verb", "gen": null, "f": 5, "s": [10], "d": ["sem"]},
  {"l": "μαθητής", "g": "lärjunge", "o": "substantiv", "gen": "m", "f": 262, "s": [5, 6, 7], "d": ["sem", "60", "prov"]},
  {"l": "μᾶλλον", "g": "mer, snarare", "o": "adverb", "gen": null, "f": 81, "s": [], "d": ["60"]},
  {"l": "μαρτυρέω", "g": "vittna, intyga", "o": "verb", "gen": null, "f": 76, "s": [5, 7], "d": ["sem", "60"]},
  {"l": "μέγας", "g": "stor, stark", "o": "adjektiv", "gen": null, "f": 240, "s": [7, 8], "d": ["sem", "60", "prov"]},
  {"l": "μέλλω", "g": "kommer att", "o": "hjälpverb", "gen": null, "f": 109, "s": [7], "d": ["sem", "60"]},
  {"l": "μένω", "g": "stanna, bli kvar, förbliva", "o": "verb", "gen": null, "f": 118, "s": [7], "d": ["sem", "60"]},
  {"l": "μετά", "g": "med; efter", "o": "preposition", "gen": null, "f": 470, "s": [5, 7], "d": ["sem", "60"]},
  {"l": "μή", "g": "inte", "o": "negation", "gen": null, "f": 1036, "s": [], "d": ["60", "prov"]},
  {"l": "μηδείς", "g": "ingen", "o": "pron.adj", "gen": null, "f": 90, "s": [], "d": ["60"]},
  {"l": "μήτηρ", "g": "mor", "o": "substantiv", "gen": "f", "f": 83, "s": [7, 9], "d": ["sem", "60", "prov"]},
  {"l": "μόνος", "g": "ensam, allena", "o": "adjektiv", "gen": null, "f": 110, "s": [3], "d": ["sem", "60"]},
  {"l": "νεκρός", "g": "död, avliden", "o": "adjektiv", "gen": null, "f": 128, "s": [3], "d": ["sem", "60"]},
  {"l": "νόμος", "g": "lag, sed, ordning", "o": "substantiv", "gen": "m", "f": 193, "s": [], "d": ["60"]},
  {"l": "νῦν", "g": "nu", "o": "adverb", "gen": null, "f": 145, "s": [], "d": ["60"]},
  {"l": "νύξ", "g": "natt", "o": "substantiv", "gen": "f", "f": 61, "s": [], "d": ["60"]},
  {"l": "ὁ", "g": "den, det", "o": "artikel", "gen": null, "f": 19769, "s": [], "d": ["60"]},
  {"l": "ὁδός", "g": "väg, färd", "o": "substantiv", "gen": "f", "f": 101, "s": [5], "d": ["sem", "60", "prov"]},
  {"l": "οἶδα", "g": "veta", "o": "verb", "gen": null, "f": 296, "s": [], "d": ["60"]},
  {"l": "οἶκος", "g": "hus", "o": "substantiv", "gen": "m", "f": 112, "s": [2, 3, 4, 5, 7], "d": ["sem", "60", "prov"]},
  {"l": "ὅλος", "g": "hel", "o": "adjektiv", "gen": null, "f": 108, "s": [], "d": ["60"]},
  {"l": "ὄνομα", "g": "namn", "o": "substantiv", "gen": "n", "f": 229, "s": [8], "d": ["sem", "60"]},
  {"l": "ὅπου", "g": "där (som)", "o": "pron.adv", "gen": null, "f": 81, "s": [], "d": ["60"]},
  {"l": "ὁράω", "g": "se", "o": "verb", "gen": null, "f": 476, "s": [], "d": ["60"]},
  {"l": "ὄρος", "g": "berg", "o": "substantiv", "gen": "n", "f": 62, "s": [6, 8], "d": ["sem", "60", "prov"]},
  {"l": "ὅς", "g": "som, vilken", "o": "pronomen", "gen": null, "f": 1408, "s": [], "d": ["60"]},
  {"l": "ὅσος", "g": "så stor/många som", "o": "pron.adj", "gen": null, "f": 111, "s": [], "d": ["60"]},
  {"l": "ὅστις", "g": "den som", "o": "pronomen", "gen": null, "f": 144, "s": [], "d": ["60"]},
  {"l": "ὅταν", "g": "när (som helst)", "o": "pron.adv", "gen": null, "f": 123, "s": [], "d": ["60"]},
  {"l": "ὅτε", "g": "när", "o": "pron.adv", "gen": null, "f": 102, "s": [8], "d": ["sem", "60", "prov"]},
  {"l": "ὅτι", "g": "att, eftersom", "o": "partikel", "gen": null, "f": 1294, "s": [7, 8], "d": ["sem", "60", "prov"]},
  {"l": "οὐ", "g": "inte", "o": "negation", "gen": null, "f": 1605, "s": [5], "d": ["sem", "60", "prov"]},
  {"l": "οὐδέ", "g": "och inte, inte heller", "o": "partikel", "gen": null, "f": 142, "s": [], "d": ["60"]},
  {"l": "οὐδείς", "g": "ingen", "o": "pron.adj", "gen": null, "f": 232, "s": [], "d": ["60"]},
  {"l": "οὖν", "g": "alltså", "o": "partikel", "gen": null, "f": 494, "s": [5], "d": ["sem", "60"]},
  {"l": "οὐρανός", "g": "himmel", "o": "substantiv", "gen": "m", "f": 273, "s": [2, 3, 5, 8], "d": ["sem", "60", "prov"]},
  {"l": "οὔτε", "g": "varken ... eller", "o": "partikel", "gen": null, "f": 87, "s": [], "d": ["60"]},
  {"l": "οὗτος", "g": "denne, denna, detta", "o": "pronomen", "gen": null, "f": 1385, "s": [6, 7], "d": ["sem", "60"]},
  {"l": "οὕτω(ς)", "g": "på så sätt, sålunda", "o": "pron.adv", "gen": null, "f": 207, "s": [], "d": ["60"]},
  {"l": "ὀφθαλμός", "g": "öga", "o": "substantiv", "gen": "m", "f": 100, "s": [], "d": ["60"]},
  {"l": "ὄχλος", "g": "folkhop", "o": "substantiv", "gen": "m", "f": 174, "s": [7], "d": ["sem", "60"]},
  {"l": "παιδίον", "g": "litet barn", "o": "substantiv", "gen": "n", "f": 52, "s": [10], "d": ["sem"]},
  {"l": "πάλιν", "g": "igen, åter", "o": "adverb", "gen": null, "f": 139, "s": [], "d": ["60"]},
  {"l": "παρά", "g": "från; hos, vid; bredvid", "o": "preposition", "gen": null, "f": 193, "s": [5], "d": ["sem", "60"]},
  {"l": "παραδίδωμι", "g": "överlämna, uppge", "o": "verb", "gen": null, "f": 119, "s": [], "d": ["60"]},
  {"l": "παρακαλέω", "g": "tillkalla, förmana, uppmuntra", "o": "verb", "gen": null, "f": 109, "s": [8], "d": ["sem", "60"]},
  {"l": "πᾶς", "g": "var och en, all", "o": "pron.adj", "gen": null, "f": 1244, "s": [7, 8], "d": ["sem", "60", "prov"]},
  {"l": "πατήρ", "g": "far", "o": "substantiv", "gen": "m", "f": 413, "s": [8, 9], "d": ["sem", "60", "prov"]},
  {"l": "πέμπω", "g": "skicka", "o": "verb", "gen": null, "f": 79, "s": [2, 3, 7, 8], "d": ["sem", "60", "prov"]},
  {"l": "περί", "g": "om, angående; kring", "o": "preposition", "gen": null, "f": 332, "s": [5, 7], "d": ["sem", "60", "prov"]},
  {"l": "περιπατέω", "g": "gå omkring, vandra", "o": "verb", "gen": null, "f": 95, "s": [8], "d": ["sem", "60"]},
  {"l": "πίνω", "g": "dricka", "o": "verb", "gen": null, "f": 72, "s": [6], "d": ["sem", "60"]},
  {"l": "πίπτω", "g": "falla", "o": "verb", "gen": null, "f": 90, "s": [], "d": ["60"]},
  {"l": "πιστεύω", "g": "tro, lita på", "o": "verb", "gen": null, "f": 241, "s": [3, 4, 5, 6, 7, 8], "d": ["sem", "60", "prov"]},
  {"l": "πίστις", "g": "tro, förtroende, tillit", "o": "substantiv", "gen": "f", "f": 242, "s": [], "d": ["60"]},
  {"l": "πληρόω", "g": "fylla", "o": "verb", "gen": null, "f": 86, "s": [], "d": ["60"]},
  {"l": "πλοῖον", "g": "båt", "o": "substantiv", "gen": "n", "f": 67, "s": [3, 5, 7], "d": ["sem", "60", "prov"]},
  {"l": "πνεῦμα", "g": "ande", "o": "substantiv", "gen": "n", "f": 379, "s": [8], "d": ["sem", "60", "prov"]},
  {"l": "ποιέω", "g": "göra, handla", "o": "verb", "gen": null, "f": 568, "s": [4, 5, 7, 8], "d": ["sem", "60", "prov"]},
  {"l": "πόλις", "g": "stad", "o": "substantiv", "gen": "f", "f": 162, "s": [], "d": ["60"]},
  {"l": "πολύς", "g": "mycket, många", "o": "adjektiv", "gen": null, "f": 415, "s": [7, 8], "d": ["sem", "60", "prov"]},
  {"l": "πονηρός", "g": "dålig, ond", "o": "adjektiv", "gen": null, "f": 78, "s": [3, 4, 5], "d": ["sem", "60", "prov"]},
  {"l": "πορεύομαι", "g": "färdas, resa, gå", "o": "verb", "gen": null, "f": 150, "s": [], "d": ["60"]},
  {"l": "πούς", "g": "fot", "o": "substantiv", "gen": "m", "f": 93, "s": [], "d": ["60"]},
  {"l": "πρεσβύτερος", "g": "äldste", "o": "substantiv", "gen": "m", "f": 65, "s": [], "d": ["60"]},
  {"l": "πρός", "g": "på; vid; till, hos", "o": "preposition", "gen": null, "f": 696, "s": [5, 7], "d": ["sem", "60", "prov"]},
  {"l": "προσέρχομαι", "g": "gå/komma till, träda fram", "o": "verb", "gen": null, "f": 86, "s": [], "d": ["60"]},
  {"l": "προσεύχομαι", "g": "be", "o": "verb", "gen": null, "f": 85, "s": [], "d": ["60"]},
  {"l": "πρόσωπον", "g": "ansikte", "o": "substantiv", "gen": "n", "f": 76, "s": [], "d": ["60"]},
  {"l": "προφήτης", "g": "profet", "o": "substantiv", "gen": "m", "f": 144, "s": [5, 6], "d": ["sem", "60", "prov"]},
  {"l": "πρῶτος", "g": "först", "o": "adjektiv", "gen": null, "f": 153, "s": [3, 7], "d": ["sem", "60"]},
  {"l": "πῦρ", "g": "eld", "o": "substantiv", "gen": "n", "f": 71, "s": [], "d": ["60"]},
  {"l": "πῶς", "g": "hur", "o": "adverb", "gen": null, "f": 103, "s": [], "d": ["60"]},
  {"l": "σάρξ", "g": "kött, kropp", "o": "substantiv", "gen": "f", "f": 147, "s": [9], "d": ["sem", "60"]},
  {"l": "σημεῖον", "g": "tecken", "o": "substantiv", "gen": "n", "f": 77, "s": [3, 4, 7], "d": ["sem", "60"]},
  {"l": "στόμα", "g": "mun", "o": "substantiv", "gen": "n", "f": 78, "s": [], "d": ["60"]},
  {"l": "σύ", "g": "du", "o": "pronomen", "gen": null, "f": 2894, "s": [5, 7], "d": ["sem", "60"]},
  {"l": "σύν", "g": "med, jämte", "o": "preposition", "gen": null, "f": 129, "s": [5], "d": ["sem", "60", "prov"]},
  {"l": "συναγωγή", "g": "samlingsställe, synagoga", "o": "substantiv", "gen": "f", "f": 56, "s": [7], "d": ["sem"]},
  {"l": "σῴζω", "g": "rädda, hjälpa, bevara", "o": "verb", "gen": null, "f": 106, "s": [3, 4, 5, 7, 8], "d": ["sem", "60"]},
  {"l": "σῶμα", "g": "kropp", "o": "substantiv", "gen": "n", "f": 142, "s": [8], "d": ["sem", "60"]},
  {"l": "τέ", "g": "och", "o": "partikel", "gen": null, "f": 213, "s": [], "d": ["60"]},
  {"l": "τέκνον", "g": "barn", "o": "substantiv", "gen": "n", "f": 99, "s": [3, 4, 5, 6], "d": ["sem", "60", "prov"]},
  {"l": "τηρέω", "g": "iaktta, bevaka, bevara", "o": "verb", "gen": null, "f": 71, "s": [4, 5, 7, 8], "d": ["sem", "60"]},
  {"l": "τίθημι", "g": "ställa, lägga, sätta", "o": "verb", "gen": null, "f": 100, "s": [], "d": ["60"]},
  {"l": "τίς", "g": "vem, vad", "o": "pronomen", "gen": null, "f": 554, "s": [6, 7], "d": ["sem", "60"]},
  {"l": "τις", "g": "någon, något", "o": "pronomen", "gen": null, "f": 530, "s": [7], "d": ["sem", "60"]},
  {"l": "τόπος", "g": "plats, ställe, ort", "o": "substantiv", "gen": "m", "f": 94, "s": [6], "d": ["sem", "60"]},
  {"l": "τότε", "g": "då, därpå", "o": "adverb", "gen": null, "f": 159, "s": [], "d": ["60"]},
  {"l": "τρεῖς", "g": "tre", "o": "räkneord", "gen": null, "f": 67, "s": [], "d": ["60"]},
  {"l": "ὕδωρ", "g": "vatten", "o": "substantiv", "gen": "n", "f": 76, "s": [8], "d": ["sem", "60", "prov"]},
  {"l": "υἱός", "g": "son", "o": "substantiv", "gen": "m", "f": 375, "s": [3, 5, 7], "d": ["sem", "60", "prov"]},
  {"l": "ὑμεῖς", "g": "ni", "o": "pronomen", "gen": null, "f": null, "s": [5], "d": ["sem"]},
  {"l": "ὑπάγω", "g": "gå bort, gå", "o": "verb", "gen": null, "f": 79, "s": [7], "d": ["sem", "60"]},
  {"l": "ὑπέρ", "g": "över, för; mer än", "o": "preposition", "gen": null, "f": 150, "s": [5], "d": ["sem", "60"]},
  {"l": "ὑπό", "g": "av, genom; under", "o": "preposition", "gen": null, "f": 220, "s": [5], "d": ["sem", "60"]},
  {"l": "Φαρισαῖος", "g": "farisé", "o": "substantiv", "gen": "m", "f": 96, "s": [], "d": ["60"]},
  {"l": "φοβέομαι", "g": "frukta", "o": "verb", "gen": null, "f": 95, "s": [], "d": ["60"]},
  {"l": "φωνή", "g": "röst, ljud", "o": "substantiv", "gen": "f", "f": 139, "s": [5], "d": ["sem", "60"]},
  {"l": "φῶς", "g": "ljus", "o": "substantiv", "gen": "n", "f": 72, "s": [8], "d": ["sem", "60", "prov"]},
  {"l": "χαίρω", "g": "glädja sig, vara glad", "o": "verb", "gen": null, "f": 74, "s": [], "d": ["60"]},
  {"l": "χάρις", "g": "nåd, gunst, tack", "o": "substantiv", "gen": "f", "f": 155, "s": [], "d": ["60"]},
  {"l": "χείρ", "g": "hand", "o": "substantiv", "gen": "f", "f": 176, "s": [], "d": ["60"]},
  {"l": "Χριστός", "g": "Kristus", "o": "substantiv", "gen": "m", "f": 528, "s": [], "d": ["60"]},
  {"l": "ψυχή", "g": "själ", "o": "substantiv", "gen": "f", "f": 102, "s": [4, 5], "d": ["sem", "60"]},
  {"l": "ὧδε", "g": "här, hit, så här", "o": "pron.adv", "gen": null, "f": 61, "s": [], "d": ["60"]},
  {"l": "ὥρα", "g": "tid, stund, timme", "o": "substantiv", "gen": "f", "f": 106, "s": [], "d": ["60"]},
  {"l": "ὡς", "g": "såsom", "o": "partikel", "gen": null, "f": 503, "s": [8], "d": ["sem", "60", "prov"]},
  {"l": "ὥστε", "g": "så att, därför", "o": "partikel", "gen": null, "f": 83, "s": [8], "d": ["sem", "60"]},
  {"l": "κηρύσσω", "g": "predika", "o": "verb", "gen": null, "f": 61, "s": [2, 3, 4, 5, 7], "d": ["sem", "60", "prov"]},
  {"l": "κλέπτω", "g": "stjäla", "o": "verb", "gen": null, "f": 13, "s": [4], "d": ["sem"]},
  {"l": "λύω", "g": "lösa", "o": "verb", "gen": null, "f": 42, "s": [2, 7], "d": ["sem", "prov"]},
  {"l": "μικρός", "g": "liten", "o": "adjektiv", "gen": null, "f": 46, "s": [3], "d": ["sem"]},
  {"l": "παιδεύω", "g": "uppfostra", "o": "verb", "gen": null, "f": 13, "s": [2, 6, 7], "d": ["sem"]},
  {"l": "πιστός", "g": "trogen", "o": "adjektiv", "gen": null, "f": 67, "s": [3], "d": ["sem", "60"]},
  {"l": "πτωχός", "g": "fattig", "o": "adjektiv", "gen": null, "f": 34, "s": [4, 5], "d": ["sem"]},
  {"l": "φιλέω", "g": "gilla, älska", "o": "verb", "gen": null, "f": 25, "s": [4, 5, 7], "d": ["sem"]},
  {"l": "ἀγρός", "g": "fält", "o": "substantiv", "gen": "m", "f": 36, "s": [4, 8], "d": ["sem"]},
  {"l": "ἀδελφή", "g": "syster", "o": "substantiv", "gen": "f", "f": 25, "s": [4, 7], "d": ["sem", "prov"]},
  {"l": "ἀργύριον", "g": "pengar, silver", "o": "substantiv", "gen": "n", "f": 20, "s": [4], "d": ["sem"]},
  {"l": "ἄγω", "g": "leda", "o": "verb", "gen": null, "f": 68, "s": [4, 5, 7], "d": ["sem", "60"]},
  {"l": "Ἰησοῦς", "g": "Jesus", "o": "substantiv", "gen": "m", "f": 906, "s": [4], "d": ["sem", "60"]},
  {"l": "θεραπεύω", "g": "hela, bota", "o": "verb", "gen": null, "f": 43, "s": [5, 7, 8], "d": ["sem"]},
  {"l": "ἁμαρτάνω", "g": "synda", "o": "verb", "gen": null, "f": 42, "s": [5], "d": ["sem"]},
  {"l": "κώμη", "g": "by", "o": "substantiv", "gen": "f", "f": 27, "s": [5], "d": ["sem"]},
  {"l": "λίθος", "g": "sten", "o": "substantiv", "gen": "m", "f": 58, "s": [5], "d": ["sem"]},
  {"l": "νόσος", "g": "sjukdom", "o": "substantiv", "gen": "f", "f": 11, "s": [5], "d": ["sem"]},
  {"l": "νεανίας", "g": "yngling", "o": "substantiv", "gen": "m", "f": 4, "s": [5], "d": ["sem"]},
  {"l": "οἰκοδεσπότης", "g": "husbonde", "o": "substantiv", "gen": "m", "f": 12, "s": [5, 7], "d": ["sem"]},
  {"l": "παρθένος", "g": "flicka, jungfru", "o": "substantiv", "gen": "f", "f": 15, "s": [5], "d": ["sem"]},
  {"l": "ἔρημος", "g": "öken", "o": "substantiv", "gen": "f", "f": 48, "s": [5, 6], "d": ["sem"]},
  {"l": "φίλος", "g": "vän", "o": "substantiv", "gen": "m", "f": 29, "s": [5, 7], "d": ["sem"]},
  {"l": "ἀρχή", "g": "begynnelse", "o": "substantiv", "gen": "f", "f": 55, "s": [5], "d": ["sem", "prov"]},
  {"l": "σάββατον", "g": "sabbat", "o": "substantiv", "gen": "n", "f": 68, "s": [5], "d": ["sem", "60"]},
  {"l": "μακρός", "g": "lång", "o": "adjektiv", "gen": null, "f": 11, "s": [5], "d": ["sem"]},
  {"l": "πλούσιος", "g": "rik", "o": "adjektiv", "gen": null, "f": 28, "s": [5, 8], "d": ["sem"]},
  {"l": "ἁμαρτωλός", "g": "syndig", "o": "adjektiv", "gen": null, "f": 47, "s": [5, 7], "d": ["sem"]},
  {"l": "πρό", "g": "framför (rum), före (tid)", "o": "preposition", "gen": null, "f": 47, "s": [5], "d": ["sem"]},
  {"l": "ὦ", "g": "o! (vokativpartikel)", "o": "interjektion", "gen": null, "f": 17, "s": [5], "d": ["sem"]},
  {"l": "φέρω", "g": "föra, bära", "o": "verb", "gen": null, "f": 66, "s": [6], "d": ["sem", "60"]},
  {"l": "οἶνος", "g": "vin", "o": "substantiv", "gen": "m", "f": 34, "s": [6], "d": ["sem"]},
  {"l": "ὑβρίζω", "g": "förolämpa", "o": "verb", "gen": null, "f": 5, "s": [6], "d": ["sem"]},
  {"l": "ποῦ", "g": "var?", "o": "pron.adv", "gen": null, "f": 47, "s": [6], "d": ["sem"]},
  {"l": "πόθεν", "g": "varifrån?", "o": "pron.adv", "gen": null, "f": 29, "s": [6], "d": ["sem"]},
  {"l": "πότε", "g": "när?", "o": "pron.adv", "gen": null, "f": 19, "s": [6], "d": ["sem"]},
  {"l": "ἐξάγω", "g": "leda ut, föra ut", "o": "verb", "gen": null, "f": 12, "s": [6], "d": ["sem"]},
  {"l": "ἀναφέρω", "g": "föra upp", "o": "verb", "gen": null, "f": 10, "s": [6], "d": ["sem"]},
  {"l": "παραλαμβάνω", "g": "ta med sig", "o": "verb", "gen": null, "f": 49, "s": [6], "d": ["sem"]},
  {"l": "ἕξ", "g": "sex", "o": "räkneord", "gen": null, "f": 13, "s": [6], "d": ["sem"]},
  {"l": "διδάσκαλος", "g": "lärare", "o": "substantiv", "gen": "m", "f": 58, "s": [6, 7], "d": ["sem"]},
  {"l": "βαπτιστής", "g": "döpare", "o": "substantiv", "gen": "m", "f": 12, "s": [6, 7], "d": ["sem", "prov"]},
  {"l": "παραβολή", "g": "liknelse, parabel", "o": "substantiv", "gen": "f", "f": 50, "s": [6, 8], "d": ["sem"]},
  {"l": "ἀγαπητός", "g": "älskad, kär", "o": "adjektiv", "gen": null, "f": 61, "s": [6, 7], "d": ["sem", "60"]},
  {"l": "ὑψηλός", "g": "hög", "o": "adjektiv", "gen": null, "f": 11, "s": [6], "d": ["sem"]},
  {"l": "προσκυνέω", "g": "tillbedja", "o": "verb", "gen": null, "f": 60, "s": [6], "d": ["sem"]},
  {"l": "λατρεύω", "g": "tjäna (med dativ)", "o": "verb", "gen": null, "f": 21, "s": [6], "d": ["sem"]},
  {"l": "διώκω", "g": "förfölja", "o": "verb", "gen": null, "f": 45, "s": [7, 8], "d": ["sem"]},
  {"l": "πείθω", "g": "övertyga", "o": "verb", "gen": null, "f": 52, "s": [7, 8], "d": ["sem"]},
  {"l": "τύπτω", "g": "slå", "o": "verb", "gen": null, "f": 13, "s": [7], "d": ["sem"]},
  {"l": "οἰκοδομέω", "g": "bygga", "o": "verb", "gen": null, "f": 40, "s": [7, 8], "d": ["sem"]},
  {"l": "ἀλείφω", "g": "smörja", "o": "verb", "gen": null, "f": 9, "s": [7], "d": ["sem"]},
  {"l": "ἀμπελών", "g": "vingård", "o": "substantiv", "gen": "m", "f": 23, "s": [7, 8], "d": ["sem"]},
  {"l": "ἡγεμών", "g": "ståthållare, landshövding", "o": "substantiv", "gen": "m", "f": 20, "s": [7, 8], "d": ["sem"]},
  {"l": "διάκονος", "g": "tjänare", "o": "substantiv", "gen": "m", "f": 29, "s": [7], "d": ["sem"]},
  {"l": "μισθός", "g": "lön", "o": "substantiv", "gen": "m", "f": 29, "s": [7], "d": ["sem"]},
  {"l": "πέτρα", "g": "klippa", "o": "substantiv", "gen": "f", "f": 15, "s": [7], "d": ["sem"]},
  {"l": "τελώνης", "g": "tulltjänsteman", "o": "substantiv", "gen": "m", "f": 21, "s": [7], "d": ["sem"]},
  {"l": "ἔλαιον", "g": "olja", "o": "substantiv", "gen": "n", "f": 11, "s": [7], "d": ["sem"]},
  {"l": "πάσχα", "g": "påskmåltid (oböjligt)", "o": "substantiv", "gen": "n", "f": 29, "s": [7], "d": ["sem"]},
  {"l": "ἐχθρός", "g": "fiende", "o": "adjektiv", "gen": null, "f": 32, "s": [7], "d": ["sem"]},
  {"l": "ὕψιστος", "g": "högst; den Högste", "o": "adjektiv", "gen": null, "f": 13, "s": [7], "d": ["sem"]},
  {"l": "ἕτοιμος", "g": "beredd, redo", "o": "adjektiv", "gen": null, "f": 17, "s": [7], "d": ["sem"]},
  {"l": "ἄρρωστος", "g": "sjuk", "o": "adjektiv", "gen": null, "f": 5, "s": [7], "d": ["sem"]},
  {"l": "πάντοτε", "g": "alltid", "o": "adverb", "gen": null, "f": 41, "s": [7], "d": ["sem"]},
  {"l": "ἐγγύς", "g": "nära", "o": "adverb", "gen": null, "f": 30, "s": [7], "d": ["sem"]},
  {"l": "οὔπω", "g": "ännu inte", "o": "adverb", "gen": null, "f": 26, "s": [7], "d": ["sem"]},
  {"l": "σός", "g": "din, ditt", "o": "pron.adj", "gen": null, "f": 25, "s": [7], "d": ["sem"]},
  {"l": "ἡμέτερος", "g": "vår, vårt", "o": "pron.adj", "gen": null, "f": 7, "s": [7], "d": ["sem"]},
  {"l": "ὑμέτερος", "g": "er, ert", "o": "pron.adj", "gen": null, "f": 11, "s": [7, 8], "d": ["sem"]},
  {"l": "διότι", "g": "eftersom", "o": "konjunktion", "gen": null, "f": 23, "s": [8], "d": ["sem"]},
  {"l": "ἐπεί", "g": "då, eftersom", "o": "konjunktion", "gen": null, "f": 26, "s": [8], "d": ["sem", "prov"]},
  {"l": "ἐγγίζω", "g": "närma sig", "o": "verb", "gen": null, "f": 42, "s": [8], "d": ["sem"]},
  {"l": "βόσκω", "g": "vakta, utfordra", "o": "verb", "gen": null, "f": 9, "s": [8], "d": ["sem"]},
  {"l": "φυτεύω", "g": "plantera", "o": "verb", "gen": null, "f": 11, "s": [8], "d": ["sem"]},
  {"l": "αὐξάνω", "g": "öka, växa", "o": "verb", "gen": null, "f": 21, "s": [8], "d": ["sem"]},
  {"l": "ὀνομάζω", "g": "kalla, nämna", "o": "verb", "gen": null, "f": 9, "s": [8], "d": ["sem"]},
  {"l": "προστάσσω", "g": "anordna, befalla", "o": "verb", "gen": null, "f": 7, "s": [8], "d": ["sem"]},
  {"l": "εἰσάγω", "g": "införa", "o": "verb", "gen": null, "f": 11, "s": [8], "d": ["sem"]},
  {"l": "δεῖπνον", "g": "måltid, middag", "o": "substantiv", "gen": "n", "f": 16, "s": [8], "d": ["sem"]},
  {"l": "συμφωνία", "g": "musik", "o": "substantiv", "gen": "f", "f": 1, "s": [8], "d": ["sem"]},
  {"l": "χορός", "g": "dans", "o": "substantiv", "gen": "m", "f": 1, "s": [8], "d": ["sem"]},
  {"l": "χοῖρος", "g": "svin", "o": "substantiv", "gen": "m", "f": 12, "s": [8], "d": ["sem"]},
  {"l": "ἑορτή", "g": "fest, högtid", "o": "substantiv", "gen": "f", "f": 25, "s": [8], "d": ["sem"]},
  {"l": "στοά", "g": "pelarhall, portik", "o": "substantiv", "gen": "f", "f": 3, "s": [8], "d": ["sem"]},
  {"l": "ἐκλεκτός", "g": "utvald", "o": "adjektiv", "gen": null, "f": 23, "s": [8], "d": ["sem"]},
  {"l": "δυσκόλως", "g": "med svårighet", "o": "adverb", "gen": null, "f": 3, "s": [8], "d": ["sem"]},
  {"l": "ἀναγινώσκω", "g": "läsa", "o": "verb", "gen": null, "f": 32, "s": [8], "d": ["sem"]},
  {"l": "σταυρός", "g": "kors", "o": "substantiv", "gen": "m", "f": 27, "s": [9], "d": ["sem"]},
  {"l": "ἄξιος", "g": "värdig", "o": "adjektiv", "gen": null, "f": 41, "s": [9], "d": ["sem"]},
  {"l": "εὖ", "g": "väl, gott", "o": "adverb", "gen": null, "f": 5, "s": [9], "d": ["sem", "prov"]},
  {"l": "θυγάτηρ", "g": "dotter", "o": "substantiv", "gen": "f", "f": 28, "s": [9], "d": ["sem"]}
];

/* ── FORMER (snapshot ur ord/verb/adjektiv/pronomen.json; lemma → [{f:böjd form, p:parsning}]).
   Genereras av scripts/gen_glosor_former_snapshot.py och driver "Former"-läget. ─ */
const FORMER = {
  "Φαρισαῖος": [{"f": "Φαρισαῖος", "p": "nominativ singular"}, {"f": "Φαρισαῖοι", "p": "nominativ plural"}, {"f": "Φαρισαίου", "p": "genitiv singular"}, {"f": "Φαρισαίων", "p": "genitiv plural"}, {"f": "Φαρισαίῳ", "p": "dativ singular"}, {"f": "Φαρισαίοις", "p": "dativ plural"}, {"f": "Φαρισαῖον", "p": "ackusativ singular"}, {"f": "Φαρισαίους", "p": "ackusativ plural"}, {"f": "Φαρισαῖε", "p": "vokativ singular"}],
  "Χριστός": [{"f": "Χριστός", "p": "nominativ singular"}, {"f": "Χριστοί", "p": "nominativ plural"}, {"f": "Χριστοῦ", "p": "genitiv singular"}, {"f": "Χριστῶν", "p": "genitiv plural"}, {"f": "Χριστῷ", "p": "dativ singular"}, {"f": "Χριστοῖς", "p": "dativ plural"}, {"f": "Χριστόν", "p": "ackusativ singular"}, {"f": "Χριστούς", "p": "ackusativ plural"}, {"f": "Χριστέ", "p": "vokativ singular"}],
  "αἰτέω": [{"f": "αἰτῶ", "p": "presens indikativ aktiv, 1:a sg"}, {"f": "αἰτεῖς", "p": "presens indikativ aktiv, 2:a sg"}, {"f": "αἰτεῖ", "p": "presens indikativ aktiv, 3:e sg"}, {"f": "αἰτοῦμεν", "p": "presens indikativ aktiv, 1:a pl"}, {"f": "αἰτεῖτε", "p": "presens indikativ aktiv, 2:a pl"}, {"f": "αἰτοῦσι(ν)", "p": "presens indikativ aktiv, 3:e pl"}, {"f": "αἰτήσω", "p": "futurum indikativ aktiv, 1:a sg"}, {"f": "αἰτήσεις", "p": "futurum indikativ aktiv, 2:a sg"}, {"f": "αἰτήσει", "p": "futurum indikativ aktiv, 3:e sg"}, {"f": "αἰτήσομεν", "p": "futurum indikativ aktiv, 1:a pl"}, {"f": "αἰτήσετε", "p": "futurum indikativ aktiv, 2:a pl"}, {"f": "αἰτήσουσι(ν)", "p": "futurum indikativ aktiv, 3:e pl"}, {"f": "αἰτεῖν", "p": "presens infinitiv aktiv"}, {"f": "αἴτει", "p": "presens imperativ aktiv, 2:a sg"}, {"f": "αἰτείτω", "p": "presens imperativ aktiv, 3:e sg"}, {"f": "αἰτείτωσαν", "p": "presens imperativ aktiv, 3:e pl"}, {"f": "ᾔτουν", "p": "imperfekt indikativ aktiv, 1:a sg"}, {"f": "ᾔτεις", "p": "imperfekt indikativ aktiv, 2:a sg"}, {"f": "ᾔτει", "p": "imperfekt indikativ aktiv, 3:e sg"}, {"f": "ᾐτοῦμεν", "p": "imperfekt indikativ aktiv, 1:a pl"}, {"f": "ᾐτεῖτε", "p": "imperfekt indikativ aktiv, 2:a pl"}, {"f": "αἰτήσειν", "p": "futurum infinitiv aktiv"}, {"f": "ᾔτησα", "p": "aorist indikativ aktiv, 1:a sg"}, {"f": "ᾔτησας", "p": "aorist indikativ aktiv, 2:a sg"}, {"f": "ᾔτησε(ν)", "p": "aorist indikativ aktiv, 3:e sg"}, {"f": "ᾐτήσαμεν", "p": "aorist indikativ aktiv, 1:a pl"}, {"f": "ᾐτήσατε", "p": "aorist indikativ aktiv, 2:a pl"}, {"f": "ᾔτησαν", "p": "aorist indikativ aktiv, 3:e pl"}, {"f": "αἴτησον", "p": "aorist imperativ aktiv, 2:a sg"}, {"f": "αἰτησάτω", "p": "aorist imperativ aktiv, 3:e sg"}, {"f": "αἰτήσατε", "p": "aorist imperativ aktiv, 2:a pl"}, {"f": "αἰτησάτωσαν", "p": "aorist imperativ aktiv, 3:e pl"}, {"f": "αἰτῆσαι", "p": "aorist infinitiv aktiv"}],
  "αἰώνιος": [{"f": "αἰώνιος", "p": "maskulinum nominativ singular"}, {"f": "αἰώνιοι", "p": "maskulinum nominativ plural"}, {"f": "αἰωνίου", "p": "maskulinum genitiv singular"}, {"f": "αἰωνίων", "p": "maskulinum genitiv plural"}, {"f": "αἰωνίῳ", "p": "maskulinum dativ singular"}, {"f": "αἰωνίοις", "p": "maskulinum dativ plural"}, {"f": "αἰώνιον", "p": "maskulinum ackusativ singular"}, {"f": "αἰωνίους", "p": "maskulinum ackusativ plural"}, {"f": "αἰώνιε", "p": "maskulinum vokativ singular"}, {"f": "αἰώνια", "p": "neutrum nominativ plural"}],
  "αἷμα": [{"f": "αἷμα", "p": "nominativ singular"}, {"f": "αἵματα", "p": "nominativ plural"}, {"f": "αἵματος", "p": "genitiv singular"}, {"f": "αἱμάτων", "p": "genitiv plural"}, {"f": "αἵματι", "p": "dativ singular"}, {"f": "αἵμασι(ν)", "p": "dativ plural"}],
  "αὐτός": [{"f": "αὐτός", "p": "maskulinum nominativ singular"}, {"f": "αὐτοί", "p": "maskulinum nominativ plural"}, {"f": "αὐτοῦ", "p": "maskulinum genitiv singular"}, {"f": "αὐτῶν", "p": "maskulinum genitiv plural"}, {"f": "αὐτῷ", "p": "maskulinum dativ singular"}, {"f": "αὐτοῖς", "p": "maskulinum dativ plural"}, {"f": "αὐτόν", "p": "maskulinum ackusativ singular"}, {"f": "αὐτούς", "p": "maskulinum ackusativ plural"}, {"f": "αὐτή", "p": "femininum nominativ singular"}, {"f": "αὐταί", "p": "femininum nominativ plural"}, {"f": "αὐτῆς", "p": "femininum genitiv singular"}, {"f": "αὐτῇ", "p": "femininum dativ singular"}, {"f": "αὐταῖς", "p": "femininum dativ plural"}, {"f": "αὐτήν", "p": "femininum ackusativ singular"}, {"f": "αὐτάς", "p": "femininum ackusativ plural"}, {"f": "αὐτό", "p": "neutrum nominativ singular"}, {"f": "αὐτά", "p": "neutrum nominativ plural"}],
  "βάλλω": [{"f": "βάλλω", "p": "presens indikativ aktiv, 1:a sg"}, {"f": "βάλλεις", "p": "presens indikativ aktiv, 2:a sg"}, {"f": "βάλλει", "p": "presens indikativ aktiv, 3:e sg"}, {"f": "βάλλομεν", "p": "presens indikativ aktiv, 1:a pl"}, {"f": "βάλλετε", "p": "presens indikativ aktiv, 2:a pl"}, {"f": "βάλλουσι(ν)", "p": "presens indikativ aktiv, 3:e pl"}, {"f": "βάλλειν", "p": "presens infinitiv aktiv"}, {"f": "βάλλε", "p": "presens imperativ aktiv, 2:a sg"}, {"f": "βαλλέτω", "p": "presens imperativ aktiv, 3:e sg"}, {"f": "βαλλέτωσαν", "p": "presens imperativ aktiv, 3:e pl"}, {"f": "ἔβαλλον", "p": "imperfekt indikativ aktiv, 1:a sg"}, {"f": "ἔβαλλες", "p": "imperfekt indikativ aktiv, 2:a sg"}, {"f": "ἔβαλλε(ν)", "p": "imperfekt indikativ aktiv, 3:e sg"}, {"f": "ἐβάλλομεν", "p": "imperfekt indikativ aktiv, 1:a pl"}, {"f": "ἐβάλλετε", "p": "imperfekt indikativ aktiv, 2:a pl"}],
  "βαπτίζω": [{"f": "βαπτίζω", "p": "presens indikativ aktiv, 1:a sg"}, {"f": "βαπτίζεις", "p": "presens indikativ aktiv, 2:a sg"}, {"f": "βαπτίζει", "p": "presens indikativ aktiv, 3:e sg"}, {"f": "βαπτίζομεν", "p": "presens indikativ aktiv, 1:a pl"}, {"f": "βαπτίζετε", "p": "presens indikativ aktiv, 2:a pl"}, {"f": "βαπτίζουσι(ν)", "p": "presens indikativ aktiv, 3:e pl"}, {"f": "βαπτίσω", "p": "futurum indikativ aktiv, 1:a sg"}, {"f": "βαπτίσεις", "p": "futurum indikativ aktiv, 2:a sg"}, {"f": "βαπτίσει", "p": "futurum indikativ aktiv, 3:e sg"}, {"f": "βαπτίσομεν", "p": "futurum indikativ aktiv, 1:a pl"}, {"f": "βαπτίσετε", "p": "futurum indikativ aktiv, 2:a pl"}, {"f": "βαπτίσουσι(ν)", "p": "futurum indikativ aktiv, 3:e pl"}, {"f": "βαπτίζειν", "p": "presens infinitiv aktiv"}, {"f": "βάπτιζε", "p": "presens imperativ aktiv, 2:a sg"}, {"f": "βαπτιζέτω", "p": "presens imperativ aktiv, 3:e sg"}, {"f": "βαπτιζέτωσαν", "p": "presens imperativ aktiv, 3:e pl"}, {"f": "ἐβάπτιζον", "p": "imperfekt indikativ aktiv, 1:a sg"}, {"f": "ἐβάπτιζες", "p": "imperfekt indikativ aktiv, 2:a sg"}, {"f": "ἐβάπτιζε(ν)", "p": "imperfekt indikativ aktiv, 3:e sg"}, {"f": "ἐβαπτίζομεν", "p": "imperfekt indikativ aktiv, 1:a pl"}, {"f": "ἐβαπτίζετε", "p": "imperfekt indikativ aktiv, 2:a pl"}, {"f": "βαπτίσειν", "p": "futurum infinitiv aktiv"}, {"f": "ἐβάπτισα", "p": "aorist indikativ aktiv, 1:a sg"}, {"f": "ἐβάπτισας", "p": "aorist indikativ aktiv, 2:a sg"}, {"f": "ἐβάπτισε(ν)", "p": "aorist indikativ aktiv, 3:e sg"}, {"f": "ἐβαπτίσαμεν", "p": "aorist indikativ aktiv, 1:a pl"}, {"f": "ἐβαπτίσατε", "p": "aorist indikativ aktiv, 2:a pl"}, {"f": "ἐβάπτισαν", "p": "aorist indikativ aktiv, 3:e pl"}, {"f": "βάπτισον", "p": "aorist imperativ aktiv, 2:a sg"}, {"f": "βαπτισάτω", "p": "aorist imperativ aktiv, 3:e sg"}, {"f": "βαπτίσατε", "p": "aorist imperativ aktiv, 2:a pl"}, {"f": "βαπτισάτωσαν", "p": "aorist imperativ aktiv, 3:e pl"}, {"f": "βαπτίσαι", "p": "aorist infinitiv aktiv"}],
  "βαπτιστής": [{"f": "βαπτιστής", "p": "nominativ singular"}, {"f": "βαπτισταί", "p": "nominativ plural"}, {"f": "βαπτιστοῦ", "p": "genitiv singular"}, {"f": "βαπτιστῶν", "p": "genitiv plural"}, {"f": "βαπτιστῇ", "p": "dativ singular"}, {"f": "βαπτισταῖς", "p": "dativ plural"}, {"f": "βαπτιστήν", "p": "ackusativ singular"}, {"f": "βαπτιστάς", "p": "ackusativ plural"}, {"f": "βαπτιστά", "p": "vokativ singular"}],
  "βασιλεία": [{"f": "βασιλεία", "p": "nominativ singular"}, {"f": "βασιλεῖαι", "p": "nominativ plural"}, {"f": "βασιλείας", "p": "genitiv singular"}, {"f": "βασιλειῶν", "p": "genitiv plural"}, {"f": "βασιλείᾳ", "p": "dativ singular"}, {"f": "βασιλείαις", "p": "dativ plural"}, {"f": "βασιλείαν", "p": "ackusativ singular"}],
  "βλέπω": [{"f": "βλέπω", "p": "presens indikativ aktiv, 1:a sg"}, {"f": "βλέπεις", "p": "presens indikativ aktiv, 2:a sg"}, {"f": "βλέπει", "p": "presens indikativ aktiv, 3:e sg"}, {"f": "βλέπομεν", "p": "presens indikativ aktiv, 1:a pl"}, {"f": "βλέπετε", "p": "presens indikativ aktiv, 2:a pl"}, {"f": "βλέπουσι(ν)", "p": "presens indikativ aktiv, 3:e pl"}, {"f": "βλέψω", "p": "futurum indikativ aktiv, 1:a sg"}, {"f": "βλέψεις", "p": "futurum indikativ aktiv, 2:a sg"}, {"f": "βλέψει", "p": "futurum indikativ aktiv, 3:e sg"}, {"f": "βλέψομεν", "p": "futurum indikativ aktiv, 1:a pl"}, {"f": "βλέψετε", "p": "futurum indikativ aktiv, 2:a pl"}, {"f": "βλέψουσι(ν)", "p": "futurum indikativ aktiv, 3:e pl"}, {"f": "βλέπειν", "p": "presens infinitiv aktiv"}, {"f": "βλέπε", "p": "presens imperativ aktiv, 2:a sg"}, {"f": "βλεπέτω", "p": "presens imperativ aktiv, 3:e sg"}, {"f": "βλεπέτωσαν", "p": "presens imperativ aktiv, 3:e pl"}, {"f": "ἔβλεπον", "p": "imperfekt indikativ aktiv, 1:a sg"}, {"f": "ἔβλεπες", "p": "imperfekt indikativ aktiv, 2:a sg"}, {"f": "ἔβλεπε(ν)", "p": "imperfekt indikativ aktiv, 3:e sg"}, {"f": "ἐβλέπομεν", "p": "imperfekt indikativ aktiv, 1:a pl"}, {"f": "ἐβλέπετε", "p": "imperfekt indikativ aktiv, 2:a pl"}, {"f": "βλέψειν", "p": "futurum infinitiv aktiv"}, {"f": "ἔβλεψα", "p": "aorist indikativ aktiv, 1:a sg"}, {"f": "ἔβλεψας", "p": "aorist indikativ aktiv, 2:a sg"}, {"f": "ἔβλεψε(ν)", "p": "aorist indikativ aktiv, 3:e sg"}, {"f": "ἐβλέψαμεν", "p": "aorist indikativ aktiv, 1:a pl"}, {"f": "ἐβλέψατε", "p": "aorist indikativ aktiv, 2:a pl"}, {"f": "ἔβλεψαν", "p": "aorist indikativ aktiv, 3:e pl"}, {"f": "βλέψον", "p": "aorist imperativ aktiv, 2:a sg"}, {"f": "βλεψάτω", "p": "aorist imperativ aktiv, 3:e sg"}, {"f": "βλέψατε", "p": "aorist imperativ aktiv, 2:a pl"}, {"f": "βλεψάτωσαν", "p": "aorist imperativ aktiv, 3:e pl"}, {"f": "βλέψαι", "p": "aorist infinitiv aktiv"}],
  "γράφω": [{"f": "γράφω", "p": "presens indikativ aktiv, 1:a sg"}, {"f": "γράφεις", "p": "presens indikativ aktiv, 2:a sg"}, {"f": "γράφει", "p": "presens indikativ aktiv, 3:e sg"}, {"f": "γράφομεν", "p": "presens indikativ aktiv, 1:a pl"}, {"f": "γράφετε", "p": "presens indikativ aktiv, 2:a pl"}, {"f": "γράφουσι(ν)", "p": "presens indikativ aktiv, 3:e pl"}, {"f": "γράψω", "p": "futurum indikativ aktiv, 1:a sg"}, {"f": "γράψεις", "p": "futurum indikativ aktiv, 2:a sg"}, {"f": "γράψει", "p": "futurum indikativ aktiv, 3:e sg"}, {"f": "γράψομεν", "p": "futurum indikativ aktiv, 1:a pl"}, {"f": "γράψετε", "p": "futurum indikativ aktiv, 2:a pl"}, {"f": "γράψουσι(ν)", "p": "futurum indikativ aktiv, 3:e pl"}, {"f": "γράφειν", "p": "presens infinitiv aktiv"}, {"f": "γράφε", "p": "presens imperativ aktiv, 2:a sg"}, {"f": "γραφέτω", "p": "presens imperativ aktiv, 3:e sg"}, {"f": "γραφέτωσαν", "p": "presens imperativ aktiv, 3:e pl"}, {"f": "ἔγραφον", "p": "imperfekt indikativ aktiv, 1:a sg"}, {"f": "ἔγραφες", "p": "imperfekt indikativ aktiv, 2:a sg"}, {"f": "ἔγραφε(ν)", "p": "imperfekt indikativ aktiv, 3:e sg"}, {"f": "ἐγράφομεν", "p": "imperfekt indikativ aktiv, 1:a pl"}, {"f": "ἐγράφετε", "p": "imperfekt indikativ aktiv, 2:a pl"}, {"f": "γράψειν", "p": "futurum infinitiv aktiv"}, {"f": "ἔγραψα", "p": "aorist indikativ aktiv, 1:a sg"}, {"f": "ἔγραψας", "p": "aorist indikativ aktiv, 2:a sg"}, {"f": "ἔγραψε(ν)", "p": "aorist indikativ aktiv, 3:e sg"}, {"f": "ἐγράψαμεν", "p": "aorist indikativ aktiv, 1:a pl"}, {"f": "ἐγράψατε", "p": "aorist indikativ aktiv, 2:a pl"}, {"f": "ἔγραψαν", "p": "aorist indikativ aktiv, 3:e pl"}, {"f": "γράψον", "p": "aorist imperativ aktiv, 2:a sg"}, {"f": "γραψάτω", "p": "aorist imperativ aktiv, 3:e sg"}, {"f": "γράψατε", "p": "aorist imperativ aktiv, 2:a pl"}, {"f": "γραψάτωσαν", "p": "aorist imperativ aktiv, 3:e pl"}, {"f": "γράψαι", "p": "aorist infinitiv aktiv"}],
  "δίδωμι": [{"f": "δίδωμι", "p": "presens indikativ aktiv, 1:a sg"}, {"f": "δίδως", "p": "presens indikativ aktiv, 2:a sg"}, {"f": "δίδωσι(ν)", "p": "presens indikativ aktiv, 3:e sg"}, {"f": "δίδομεν", "p": "presens indikativ aktiv, 1:a pl"}, {"f": "δίδοτε", "p": "presens indikativ aktiv, 2:a pl"}, {"f": "διδόασι(ν)", "p": "presens indikativ aktiv, 3:e pl"}],
  "δίκαιος": [{"f": "δίκαιος", "p": "maskulinum nominativ singular"}, {"f": "δίκαιοι", "p": "maskulinum nominativ plural"}, {"f": "δικαίου", "p": "maskulinum genitiv singular"}, {"f": "δικαίων", "p": "maskulinum genitiv plural"}, {"f": "δικαίῳ", "p": "maskulinum dativ singular"}, {"f": "δικαίοις", "p": "maskulinum dativ plural"}, {"f": "δίκαιον", "p": "maskulinum ackusativ singular"}, {"f": "δικαίους", "p": "maskulinum ackusativ plural"}, {"f": "δίκαιε", "p": "maskulinum vokativ singular"}, {"f": "δικαία", "p": "femininum nominativ singular"}, {"f": "δίκαιαι", "p": "femininum nominativ plural"}, {"f": "δικαίας", "p": "femininum genitiv singular"}, {"f": "δικαίᾳ", "p": "femininum dativ singular"}, {"f": "δικαίαις", "p": "femininum dativ plural"}, {"f": "δικαίαν", "p": "femininum ackusativ singular"}, {"f": "δίκαια", "p": "neutrum nominativ plural"}],
  "δαιμόνιον": [{"f": "δαιμόνιον", "p": "nominativ singular"}, {"f": "δαιμόνια", "p": "nominativ plural"}, {"f": "δαιμονίου", "p": "genitiv singular"}, {"f": "δαιμονίων", "p": "genitiv plural"}, {"f": "δαιμονίῳ", "p": "dativ singular"}, {"f": "δαιμονίοις", "p": "dativ plural"}],
  "δείκνυμι": [{"f": "δείκνυμι", "p": "presens indikativ aktiv, 1:a sg"}, {"f": "δείκνυς", "p": "presens indikativ aktiv, 2:a sg"}, {"f": "δείκνυσι(ν)", "p": "presens indikativ aktiv, 3:e sg"}, {"f": "δείκνυμεν", "p": "presens indikativ aktiv, 1:a pl"}, {"f": "δείκνυτε", "p": "presens indikativ aktiv, 2:a pl"}, {"f": "δεικνύασι(ν)", "p": "presens indikativ aktiv, 3:e pl"}],
  "διάβολος": [{"f": "διάβολος", "p": "nominativ singular"}, {"f": "διάβολοι", "p": "nominativ plural"}, {"f": "διαβόλου", "p": "genitiv singular"}, {"f": "διαβόλων", "p": "genitiv plural"}, {"f": "διαβόλῳ", "p": "dativ singular"}, {"f": "διαβόλοις", "p": "dativ plural"}, {"f": "διάβολον", "p": "ackusativ singular"}, {"f": "διαβόλους", "p": "ackusativ plural"}, {"f": "διάβολε", "p": "vokativ singular"}],
  "διδάσκαλος": [{"f": "διδάσκαλος", "p": "nominativ singular"}, {"f": "διδάσκαλοι", "p": "nominativ plural"}, {"f": "διδασκάλου", "p": "genitiv singular"}, {"f": "διδασκάλων", "p": "genitiv plural"}, {"f": "διδασκάλῳ", "p": "dativ singular"}, {"f": "διδασκάλοις", "p": "dativ plural"}, {"f": "διδάσκαλον", "p": "ackusativ singular"}, {"f": "διδασκάλους", "p": "ackusativ plural"}, {"f": "διδάσκαλε", "p": "vokativ singular"}],
  "διδάσκω": [{"f": "διδάσκω", "p": "presens indikativ aktiv, 1:a sg"}, {"f": "διδάσκεις", "p": "presens indikativ aktiv, 2:a sg"}, {"f": "διδάσκει", "p": "presens indikativ aktiv, 3:e sg"}, {"f": "διδάσκομεν", "p": "presens indikativ aktiv, 1:a pl"}, {"f": "διδάσκετε", "p": "presens indikativ aktiv, 2:a pl"}, {"f": "διδάσκουσι(ν)", "p": "presens indikativ aktiv, 3:e pl"}, {"f": "διδάξω", "p": "futurum indikativ aktiv, 1:a sg"}, {"f": "διδάξεις", "p": "futurum indikativ aktiv, 2:a sg"}, {"f": "διδάξει", "p": "futurum indikativ aktiv, 3:e sg"}, {"f": "διδάξομεν", "p": "futurum indikativ aktiv, 1:a pl"}, {"f": "διδάξετε", "p": "futurum indikativ aktiv, 2:a pl"}, {"f": "διδάξουσι(ν)", "p": "futurum indikativ aktiv, 3:e pl"}, {"f": "διδάσκειν", "p": "presens infinitiv aktiv"}, {"f": "διδάξειν", "p": "futurum infinitiv aktiv"}, {"f": "δίδασκε", "p": "presens imperativ aktiv, 2:a sg"}, {"f": "διδασκέτω", "p": "presens imperativ aktiv, 3:e sg"}, {"f": "διδασκέτωσαν", "p": "presens imperativ aktiv, 3:e pl"}, {"f": "ἐδίδασκον", "p": "imperfekt indikativ aktiv, 1:a sg"}, {"f": "ἐδίδασκες", "p": "imperfekt indikativ aktiv, 2:a sg"}, {"f": "ἐδίδασκε(ν)", "p": "imperfekt indikativ aktiv, 3:e sg"}, {"f": "ἐδιδάσκομεν", "p": "imperfekt indikativ aktiv, 1:a pl"}, {"f": "ἐδιδάσκετε", "p": "imperfekt indikativ aktiv, 2:a pl"}, {"f": "ἐδίδαξα", "p": "aorist indikativ aktiv, 1:a sg"}, {"f": "ἐδίδαξας", "p": "aorist indikativ aktiv, 2:a sg"}, {"f": "ἐδίδαξε(ν)", "p": "aorist indikativ aktiv, 3:e sg"}, {"f": "ἐδιδάξαμεν", "p": "aorist indikativ aktiv, 1:a pl"}, {"f": "ἐδιδάξατε", "p": "aorist indikativ aktiv, 2:a pl"}, {"f": "ἐδίδαξαν", "p": "aorist indikativ aktiv, 3:e pl"}, {"f": "δίδαξον", "p": "aorist imperativ aktiv, 2:a sg"}, {"f": "διδαξάτω", "p": "aorist imperativ aktiv, 3:e sg"}, {"f": "διδάξατε", "p": "aorist imperativ aktiv, 2:a pl"}, {"f": "διδαξάτωσαν", "p": "aorist imperativ aktiv, 3:e pl"}, {"f": "διδάξαι", "p": "aorist infinitiv aktiv"}],
  "δικαιοσύνη": [{"f": "δικαιοσύνη", "p": "nominativ singular"}, {"f": "δικαιοσύναι", "p": "nominativ plural"}, {"f": "δικαιοσύνης", "p": "genitiv singular"}, {"f": "δικαιοσυνῶν", "p": "genitiv plural"}, {"f": "δικαιοσύνῃ", "p": "dativ singular"}, {"f": "δικαιοσύναις", "p": "dativ plural"}, {"f": "δικαιοσύνην", "p": "ackusativ singular"}, {"f": "δικαιοσύνας", "p": "ackusativ plural"}],
  "διώκω": [{"f": "διώκω", "p": "presens indikativ aktiv, 1:a sg"}, {"f": "διώκεις", "p": "presens indikativ aktiv, 2:a sg"}, {"f": "διώκει", "p": "presens indikativ aktiv, 3:e sg"}, {"f": "διώκομεν", "p": "presens indikativ aktiv, 1:a pl"}, {"f": "διώκετε", "p": "presens indikativ aktiv, 2:a pl"}, {"f": "διώκουσι(ν)", "p": "presens indikativ aktiv, 3:e pl"}, {"f": "διώξω", "p": "futurum indikativ aktiv, 1:a sg"}, {"f": "διώξεις", "p": "futurum indikativ aktiv, 2:a sg"}, {"f": "διώξει", "p": "futurum indikativ aktiv, 3:e sg"}, {"f": "διώξομεν", "p": "futurum indikativ aktiv, 1:a pl"}, {"f": "διώξετε", "p": "futurum indikativ aktiv, 2:a pl"}, {"f": "διώξουσι(ν)", "p": "futurum indikativ aktiv, 3:e pl"}, {"f": "διώκειν", "p": "presens infinitiv aktiv"}, {"f": "διώξειν", "p": "futurum infinitiv aktiv"}, {"f": "δίωκε", "p": "presens imperativ aktiv, 2:a sg"}, {"f": "διωκέτω", "p": "presens imperativ aktiv, 3:e sg"}, {"f": "διωκέτωσαν", "p": "presens imperativ aktiv, 3:e pl"}, {"f": "ἐδίωκον", "p": "imperfekt indikativ aktiv, 1:a sg"}, {"f": "ἐδίωκες", "p": "imperfekt indikativ aktiv, 2:a sg"}, {"f": "ἐδίωκε(ν)", "p": "imperfekt indikativ aktiv, 3:e sg"}, {"f": "ἐδιώκομεν", "p": "imperfekt indikativ aktiv, 1:a pl"}, {"f": "ἐδιώκετε", "p": "imperfekt indikativ aktiv, 2:a pl"}, {"f": "ἐδίωξα", "p": "aorist indikativ aktiv, 1:a sg"}, {"f": "ἐδίωξας", "p": "aorist indikativ aktiv, 2:a sg"}, {"f": "ἐδίωξε(ν)", "p": "aorist indikativ aktiv, 3:e sg"}, {"f": "ἐδιώξαμεν", "p": "aorist indikativ aktiv, 1:a pl"}, {"f": "ἐδιώξατε", "p": "aorist indikativ aktiv, 2:a pl"}, {"f": "ἐδίωξαν", "p": "aorist indikativ aktiv, 3:e pl"}, {"f": "δίωξον", "p": "aorist imperativ aktiv, 2:a sg"}, {"f": "διωξάτω", "p": "aorist imperativ aktiv, 3:e sg"}, {"f": "διώξατε", "p": "aorist imperativ aktiv, 2:a pl"}, {"f": "διωξάτωσαν", "p": "aorist imperativ aktiv, 3:e pl"}, {"f": "διῶξαι", "p": "aorist infinitiv aktiv"}],
  "δοῦλος": [{"f": "δοῦλος", "p": "nominativ singular"}, {"f": "δοῦλοι", "p": "nominativ plural"}, {"f": "δούλου", "p": "genitiv singular"}, {"f": "δούλων", "p": "genitiv plural"}, {"f": "δούλῳ", "p": "dativ singular"}, {"f": "δούλοις", "p": "dativ plural"}, {"f": "δοῦλον", "p": "ackusativ singular"}, {"f": "δούλους", "p": "ackusativ plural"}, {"f": "δοῦλε", "p": "vokativ singular"}],
  "δόξα": [{"f": "δόξα", "p": "nominativ singular"}, {"f": "δόξαι", "p": "nominativ plural"}, {"f": "δόξης", "p": "genitiv singular"}, {"f": "δοξῶν", "p": "genitiv plural"}, {"f": "δόξῃ", "p": "dativ singular"}, {"f": "δόξαις", "p": "dativ plural"}, {"f": "δόξαν", "p": "ackusativ singular"}, {"f": "δόξας", "p": "ackusativ plural"}],
  "εἰμί": [{"f": "εἰμί", "p": "presens indikativ aktiv, 1:a sg"}, {"f": "εἶ", "p": "presens indikativ aktiv, 2:a sg"}, {"f": "ἐστί(ν)", "p": "presens indikativ aktiv, 3:e sg"}, {"f": "ἐσμέν", "p": "presens indikativ aktiv, 1:a pl"}, {"f": "ἐστέ", "p": "presens indikativ aktiv, 2:a pl"}, {"f": "εἰσί(ν)", "p": "presens indikativ aktiv, 3:e pl"}, {"f": "ἤμην", "p": "imperfekt indikativ aktiv, 1:a sg"}, {"f": "ἦς", "p": "imperfekt indikativ aktiv, 2:a sg"}, {"f": "ἦν", "p": "imperfekt indikativ aktiv, 3:e sg"}, {"f": "ἦμεν", "p": "imperfekt indikativ aktiv, 1:a pl"}, {"f": "ἦτε", "p": "imperfekt indikativ aktiv, 2:a pl"}, {"f": "ἦσαν", "p": "imperfekt indikativ aktiv, 3:e pl"}, {"f": "ἔσομαι", "p": "futurum indikativ medium, 1:a sg"}, {"f": "ἔσῃ", "p": "futurum indikativ medium, 2:a sg"}, {"f": "ἔσται", "p": "futurum indikativ medium, 3:e sg"}, {"f": "ἐσόμεθα", "p": "futurum indikativ medium, 1:a pl"}, {"f": "ἔσεσθε", "p": "futurum indikativ medium, 2:a pl"}, {"f": "ἔσονται", "p": "futurum indikativ medium, 3:e pl"}, {"f": "εἶναι", "p": "presens infinitiv aktiv"}, {"f": "ἴσθι", "p": "presens imperativ aktiv, 2:a sg"}, {"f": "ἔστω", "p": "presens imperativ aktiv, 3:e sg"}, {"f": "ἔστε", "p": "presens imperativ aktiv, 2:a pl"}, {"f": "ἔστωσαν", "p": "presens imperativ aktiv, 3:e pl"}],
  "εἰρήνη": [{"f": "εἰρήνη", "p": "nominativ singular"}, {"f": "εἰρῆναι", "p": "nominativ plural"}, {"f": "εἰρήνης", "p": "genitiv singular"}, {"f": "εἰρηνῶν", "p": "genitiv plural"}, {"f": "εἰρήνῃ", "p": "dativ singular"}, {"f": "εἰρήναις", "p": "dativ plural"}, {"f": "εἰρήνην", "p": "ackusativ singular"}, {"f": "εἰρήνας", "p": "ackusativ plural"}],
  "εὐαγγέλιον": [{"f": "εὐαγγέλιον", "p": "nominativ singular"}, {"f": "εὐαγγέλια", "p": "nominativ plural"}, {"f": "εὐαγγελίου", "p": "genitiv singular"}, {"f": "εὐαγγελίων", "p": "genitiv plural"}, {"f": "εὐαγγελίῳ", "p": "dativ singular"}, {"f": "εὐαγγελίοις", "p": "dativ plural"}],
  "εὑρίσκω": [{"f": "εὑρίσκω", "p": "presens indikativ aktiv, 1:a sg"}, {"f": "εὑρίσκεις", "p": "presens indikativ aktiv, 2:a sg"}, {"f": "εὑρίσκει", "p": "presens indikativ aktiv, 3:e sg"}, {"f": "εὑρίσκομεν", "p": "presens indikativ aktiv, 1:a pl"}, {"f": "εὑρίσκετε", "p": "presens indikativ aktiv, 2:a pl"}, {"f": "εὑρίσκουσι(ν)", "p": "presens indikativ aktiv, 3:e pl"}, {"f": "εὑρίσκειν", "p": "presens infinitiv aktiv"}, {"f": "εὕρισκε", "p": "presens imperativ aktiv, 2:a sg"}, {"f": "εὑρισκέτω", "p": "presens imperativ aktiv, 3:e sg"}, {"f": "εὑρισκέτωσαν", "p": "presens imperativ aktiv, 3:e pl"}, {"f": "ηὕρισκον", "p": "imperfekt indikativ aktiv, 1:a sg"}, {"f": "ηὕρισκες", "p": "imperfekt indikativ aktiv, 2:a sg"}, {"f": "ηὕρισκε(ν)", "p": "imperfekt indikativ aktiv, 3:e sg"}, {"f": "ηὑρίσκομεν", "p": "imperfekt indikativ aktiv, 1:a pl"}, {"f": "ηὑρίσκετε", "p": "imperfekt indikativ aktiv, 2:a pl"}],
  "ζητέω": [{"f": "ζητῶ", "p": "presens indikativ aktiv, 1:a sg"}, {"f": "ζητεῖς", "p": "presens indikativ aktiv, 2:a sg"}, {"f": "ζητεῖ", "p": "presens indikativ aktiv, 3:e sg"}, {"f": "ζητοῦμεν", "p": "presens indikativ aktiv, 1:a pl"}, {"f": "ζητεῖτε", "p": "presens indikativ aktiv, 2:a pl"}, {"f": "ζητοῦσι(ν)", "p": "presens indikativ aktiv, 3:e pl"}, {"f": "ζητήσω", "p": "futurum indikativ aktiv, 1:a sg"}, {"f": "ζητήσεις", "p": "futurum indikativ aktiv, 2:a sg"}, {"f": "ζητήσει", "p": "futurum indikativ aktiv, 3:e sg"}, {"f": "ζητήσομεν", "p": "futurum indikativ aktiv, 1:a pl"}, {"f": "ζητήσετε", "p": "futurum indikativ aktiv, 2:a pl"}, {"f": "ζητήσουσι(ν)", "p": "futurum indikativ aktiv, 3:e pl"}, {"f": "ζητεῖν", "p": "presens infinitiv aktiv"}, {"f": "ζήτει", "p": "presens imperativ aktiv, 2:a sg"}, {"f": "ζητείτω", "p": "presens imperativ aktiv, 3:e sg"}, {"f": "ζητείτωσαν", "p": "presens imperativ aktiv, 3:e pl"}, {"f": "ἐζήτουν", "p": "imperfekt indikativ aktiv, 1:a sg"}, {"f": "ἐζήτεις", "p": "imperfekt indikativ aktiv, 2:a sg"}, {"f": "ἐζήτει", "p": "imperfekt indikativ aktiv, 3:e sg"}, {"f": "ἐζητοῦμεν", "p": "imperfekt indikativ aktiv, 1:a pl"}, {"f": "ἐζητεῖτε", "p": "imperfekt indikativ aktiv, 2:a pl"}, {"f": "ζητήσειν", "p": "futurum infinitiv aktiv"}, {"f": "ἐζήτησα", "p": "aorist indikativ aktiv, 1:a sg"}, {"f": "ἐζήτησας", "p": "aorist indikativ aktiv, 2:a sg"}, {"f": "ἐζήτησε(ν)", "p": "aorist indikativ aktiv, 3:e sg"}, {"f": "ἐζητήσαμεν", "p": "aorist indikativ aktiv, 1:a pl"}, {"f": "ἐζητήσατε", "p": "aorist indikativ aktiv, 2:a pl"}, {"f": "ἐζήτησαν", "p": "aorist indikativ aktiv, 3:e pl"}, {"f": "ζήτησον", "p": "aorist imperativ aktiv, 2:a sg"}, {"f": "ζητησάτω", "p": "aorist imperativ aktiv, 3:e sg"}, {"f": "ζητήσατε", "p": "aorist imperativ aktiv, 2:a pl"}, {"f": "ζητησάτωσαν", "p": "aorist imperativ aktiv, 3:e pl"}, {"f": "ζητῆσαι", "p": "aorist infinitiv aktiv"}],
  "ζωή": [{"f": "ζωή", "p": "nominativ singular"}, {"f": "ζωαί", "p": "nominativ plural"}, {"f": "ζωῆς", "p": "genitiv singular"}, {"f": "ζωῶν", "p": "genitiv plural"}, {"f": "ζωῇ", "p": "dativ singular"}, {"f": "ζωαῖς", "p": "dativ plural"}, {"f": "ζωήν", "p": "ackusativ singular"}, {"f": "ζωάς", "p": "ackusativ plural"}],
  "θάλασσα": [{"f": "θάλασσα", "p": "nominativ singular"}, {"f": "θάλασσαι", "p": "nominativ plural"}, {"f": "θαλάσσης", "p": "genitiv singular"}, {"f": "θαλασσῶν", "p": "genitiv plural"}, {"f": "θαλάσσῃ", "p": "dativ singular"}, {"f": "θαλάσσαις", "p": "dativ plural"}, {"f": "θάλασσαν", "p": "ackusativ singular"}, {"f": "θαλάσσας", "p": "ackusativ plural"}],
  "θάνατος": [{"f": "θάνατος", "p": "nominativ singular"}, {"f": "θάνατοι", "p": "nominativ plural"}, {"f": "θανάτου", "p": "genitiv singular"}, {"f": "θανάτων", "p": "genitiv plural"}, {"f": "θανάτῳ", "p": "dativ singular"}, {"f": "θανάτοις", "p": "dativ plural"}, {"f": "θάνατον", "p": "ackusativ singular"}, {"f": "θανάτους", "p": "ackusativ plural"}, {"f": "θάνατε", "p": "vokativ singular"}],
  "θέλω": [{"f": "θέλω", "p": "presens indikativ aktiv, 1:a sg"}, {"f": "θέλεις", "p": "presens indikativ aktiv, 2:a sg"}, {"f": "θέλει", "p": "presens indikativ aktiv, 3:e sg"}, {"f": "θέλομεν", "p": "presens indikativ aktiv, 1:a pl"}, {"f": "θέλετε", "p": "presens indikativ aktiv, 2:a pl"}, {"f": "θέλουσι(ν)", "p": "presens indikativ aktiv, 3:e pl"}, {"f": "θέλειν", "p": "presens infinitiv aktiv"}, {"f": "θέλε", "p": "presens imperativ aktiv, 2:a sg"}, {"f": "θελέτω", "p": "presens imperativ aktiv, 3:e sg"}, {"f": "θελέτωσαν", "p": "presens imperativ aktiv, 3:e pl"}, {"f": "ἤθελον", "p": "imperfekt indikativ aktiv, 1:a sg"}, {"f": "ἤθελες", "p": "imperfekt indikativ aktiv, 2:a sg"}, {"f": "ἤθελε(ν)", "p": "imperfekt indikativ aktiv, 3:e sg"}, {"f": "ἠθέλομεν", "p": "imperfekt indikativ aktiv, 1:a pl"}, {"f": "ἠθέλετε", "p": "imperfekt indikativ aktiv, 2:a pl"}],
  "θεραπεύω": [{"f": "θεραπεύω", "p": "presens indikativ aktiv, 1:a sg"}, {"f": "θεραπεύεις", "p": "presens indikativ aktiv, 2:a sg"}, {"f": "θεραπεύει", "p": "presens indikativ aktiv, 3:e sg"}, {"f": "θεραπεύομεν", "p": "presens indikativ aktiv, 1:a pl"}, {"f": "θεραπεύετε", "p": "presens indikativ aktiv, 2:a pl"}, {"f": "θεραπεύουσι(ν)", "p": "presens indikativ aktiv, 3:e pl"}, {"f": "θεραπεύσω", "p": "futurum indikativ aktiv, 1:a sg"}, {"f": "θεραπεύσεις", "p": "futurum indikativ aktiv, 2:a sg"}, {"f": "θεραπεύσει", "p": "futurum indikativ aktiv, 3:e sg"}, {"f": "θεραπεύσομεν", "p": "futurum indikativ aktiv, 1:a pl"}, {"f": "θεραπεύσετε", "p": "futurum indikativ aktiv, 2:a pl"}, {"f": "θεραπεύσουσι(ν)", "p": "futurum indikativ aktiv, 3:e pl"}, {"f": "θεραπεύειν", "p": "presens infinitiv aktiv"}, {"f": "θεράπευε", "p": "presens imperativ aktiv, 2:a sg"}, {"f": "θεραπευέτω", "p": "presens imperativ aktiv, 3:e sg"}, {"f": "θεραπευέτωσαν", "p": "presens imperativ aktiv, 3:e pl"}, {"f": "ἐθεράπευον", "p": "imperfekt indikativ aktiv, 1:a sg"}, {"f": "ἐθεράπευες", "p": "imperfekt indikativ aktiv, 2:a sg"}, {"f": "ἐθεράπευε(ν)", "p": "imperfekt indikativ aktiv, 3:e sg"}, {"f": "ἐθεραπεύομεν", "p": "imperfekt indikativ aktiv, 1:a pl"}, {"f": "ἐθεραπεύετε", "p": "imperfekt indikativ aktiv, 2:a pl"}, {"f": "θεραπεύσειν", "p": "futurum infinitiv aktiv"}, {"f": "ἐθεράπευσα", "p": "aorist indikativ aktiv, 1:a sg"}, {"f": "ἐθεράπευσας", "p": "aorist indikativ aktiv, 2:a sg"}, {"f": "ἐθεράπευσε(ν)", "p": "aorist indikativ aktiv, 3:e sg"}, {"f": "ἐθεραπεύσαμεν", "p": "aorist indikativ aktiv, 1:a pl"}, {"f": "ἐθεραπεύσατε", "p": "aorist indikativ aktiv, 2:a pl"}, {"f": "ἐθεράπευσαν", "p": "aorist indikativ aktiv, 3:e pl"}, {"f": "θεράπευσον", "p": "aorist imperativ aktiv, 2:a sg"}, {"f": "θεραπευσάτω", "p": "aorist imperativ aktiv, 3:e sg"}, {"f": "θεραπεύσατε", "p": "aorist imperativ aktiv, 2:a pl"}, {"f": "θεραπευσάτωσαν", "p": "aorist imperativ aktiv, 3:e pl"}, {"f": "θεραπεῦσαι", "p": "aorist infinitiv aktiv"}],
  "θεός": [{"f": "θεός", "p": "nominativ singular"}, {"f": "θεοί", "p": "nominativ plural"}, {"f": "θεοῦ", "p": "genitiv singular"}, {"f": "θεῶν", "p": "genitiv plural"}, {"f": "θεῷ", "p": "dativ singular"}, {"f": "θεοῖς", "p": "dativ plural"}, {"f": "θεόν", "p": "ackusativ singular"}, {"f": "θεούς", "p": "ackusativ plural"}, {"f": "θεέ", "p": "vokativ singular"}],
  "θυγάτηρ": [{"f": "θυγάτηρ", "p": "nominativ singular"}, {"f": "θυγατέρες", "p": "nominativ plural"}, {"f": "θυγατρός", "p": "genitiv singular"}, {"f": "θυγατέρων", "p": "genitiv plural"}, {"f": "θυγατρί", "p": "dativ singular"}, {"f": "θυγατράσι(ν)", "p": "dativ plural"}, {"f": "θυγατέρα", "p": "ackusativ singular"}, {"f": "θυγατέρας", "p": "ackusativ plural"}, {"f": "θύγατερ", "p": "vokativ singular"}],
  "καιρός": [{"f": "καιρός", "p": "nominativ singular"}, {"f": "καιροί", "p": "nominativ plural"}, {"f": "καιροῦ", "p": "genitiv singular"}, {"f": "καιρῶν", "p": "genitiv plural"}, {"f": "καιρῷ", "p": "dativ singular"}, {"f": "καιροῖς", "p": "dativ plural"}, {"f": "καιρόν", "p": "ackusativ singular"}, {"f": "καιρούς", "p": "ackusativ plural"}, {"f": "καιρέ", "p": "vokativ singular"}],
  "καλέω": [{"f": "καλῶ", "p": "presens indikativ aktiv, 1:a sg"}, {"f": "καλεῖς", "p": "presens indikativ aktiv, 2:a sg"}, {"f": "καλεῖ", "p": "presens indikativ aktiv, 3:e sg"}, {"f": "καλοῦμεν", "p": "presens indikativ aktiv, 1:a pl"}, {"f": "καλεῖτε", "p": "presens indikativ aktiv, 2:a pl"}, {"f": "καλοῦσι(ν)", "p": "presens indikativ aktiv, 3:e pl"}, {"f": "καλεῖν", "p": "presens infinitiv aktiv"}, {"f": "κάλει", "p": "presens imperativ aktiv, 2:a sg"}, {"f": "καλείτω", "p": "presens imperativ aktiv, 3:e sg"}, {"f": "καλείτωσαν", "p": "presens imperativ aktiv, 3:e pl"}, {"f": "ἐκάλουν", "p": "imperfekt indikativ aktiv, 1:a sg"}, {"f": "ἐκάλεις", "p": "imperfekt indikativ aktiv, 2:a sg"}, {"f": "ἐκάλει", "p": "imperfekt indikativ aktiv, 3:e sg"}, {"f": "ἐκαλοῦμεν", "p": "imperfekt indikativ aktiv, 1:a pl"}, {"f": "ἐκαλεῖτε", "p": "imperfekt indikativ aktiv, 2:a pl"}, {"f": "ἐκάλεσα", "p": "aorist indikativ aktiv, 1:a sg"}, {"f": "ἐκάλεσας", "p": "aorist indikativ aktiv, 2:a sg"}, {"f": "ἐκάλεσε(ν)", "p": "aorist indikativ aktiv, 3:e sg"}, {"f": "ἐκαλέσαμεν", "p": "aorist indikativ aktiv, 1:a pl"}, {"f": "ἐκαλέσατε", "p": "aorist indikativ aktiv, 2:a pl"}, {"f": "ἐκάλεσαν", "p": "aorist indikativ aktiv, 3:e pl"}, {"f": "κάλεσον", "p": "aorist imperativ aktiv, 2:a sg"}, {"f": "καλεσάτω", "p": "aorist imperativ aktiv, 3:e sg"}, {"f": "καλέσατε", "p": "aorist imperativ aktiv, 2:a pl"}, {"f": "καλεσάτωσαν", "p": "aorist imperativ aktiv, 3:e pl"}, {"f": "καλέσαι", "p": "aorist infinitiv aktiv"}],
  "καλός": [{"f": "καλός", "p": "maskulinum nominativ singular"}, {"f": "καλοί", "p": "maskulinum nominativ plural"}, {"f": "καλοῦ", "p": "maskulinum genitiv singular"}, {"f": "καλῶν", "p": "maskulinum genitiv plural"}, {"f": "καλῷ", "p": "maskulinum dativ singular"}, {"f": "καλοῖς", "p": "maskulinum dativ plural"}, {"f": "καλόν", "p": "maskulinum ackusativ singular"}, {"f": "καλούς", "p": "maskulinum ackusativ plural"}, {"f": "καλέ", "p": "maskulinum vokativ singular"}, {"f": "καλή", "p": "femininum nominativ singular"}, {"f": "καλαί", "p": "femininum nominativ plural"}, {"f": "καλῆς", "p": "femininum genitiv singular"}, {"f": "καλῇ", "p": "femininum dativ singular"}, {"f": "καλαῖς", "p": "femininum dativ plural"}, {"f": "καλήν", "p": "femininum ackusativ singular"}, {"f": "καλάς", "p": "femininum ackusativ plural"}, {"f": "καλά", "p": "neutrum nominativ plural"}],
  "καρδία": [{"f": "καρδία", "p": "nominativ singular"}, {"f": "καρδίαι", "p": "nominativ plural"}, {"f": "καρδίας", "p": "genitiv singular"}, {"f": "καρδιῶν", "p": "genitiv plural"}, {"f": "καρδίᾳ", "p": "dativ singular"}, {"f": "καρδίαις", "p": "dativ plural"}, {"f": "καρδίαν", "p": "ackusativ singular"}],
  "καρπός": [{"f": "καρπός", "p": "nominativ singular"}, {"f": "καρποί", "p": "nominativ plural"}, {"f": "καρποῦ", "p": "genitiv singular"}, {"f": "καρπῶν", "p": "genitiv plural"}, {"f": "καρπῷ", "p": "dativ singular"}, {"f": "καρποῖς", "p": "dativ plural"}, {"f": "καρπόν", "p": "ackusativ singular"}, {"f": "καρπούς", "p": "ackusativ plural"}, {"f": "καρπέ", "p": "vokativ singular"}],
  "κατάλογος": [{"f": "κατάλογος", "p": "nominativ singular"}, {"f": "κατάλογοι", "p": "nominativ plural"}, {"f": "καταλόγου", "p": "genitiv singular"}, {"f": "καταλόγων", "p": "genitiv plural"}, {"f": "καταλόγῳ", "p": "dativ singular"}, {"f": "καταλόγοις", "p": "dativ plural"}, {"f": "κατάλογον", "p": "ackusativ singular"}, {"f": "καταλόγους", "p": "ackusativ plural"}, {"f": "κατάλογε", "p": "vokativ singular"}],
  "κεφαλή": [{"f": "κεφαλή", "p": "nominativ singular"}, {"f": "κεφαλαί", "p": "nominativ plural"}, {"f": "κεφαλῆς", "p": "genitiv singular"}, {"f": "κεφαλῶν", "p": "genitiv plural"}, {"f": "κεφαλῇ", "p": "dativ singular"}, {"f": "κεφαλαῖς", "p": "dativ plural"}, {"f": "κεφαλήν", "p": "ackusativ singular"}, {"f": "κεφαλάς", "p": "ackusativ plural"}],
  "κηρύσσω": [{"f": "κηρύσσω", "p": "presens indikativ aktiv, 1:a sg"}, {"f": "κηρύσσεις", "p": "presens indikativ aktiv, 2:a sg"}, {"f": "κηρύσσει", "p": "presens indikativ aktiv, 3:e sg"}, {"f": "κηρύσσομεν", "p": "presens indikativ aktiv, 1:a pl"}, {"f": "κηρύσσετε", "p": "presens indikativ aktiv, 2:a pl"}, {"f": "κηρύσσουσι(ν)", "p": "presens indikativ aktiv, 3:e pl"}, {"f": "κηρύξω", "p": "futurum indikativ aktiv, 1:a sg"}, {"f": "κηρύξεις", "p": "futurum indikativ aktiv, 2:a sg"}, {"f": "κηρύξει", "p": "futurum indikativ aktiv, 3:e sg"}, {"f": "κηρύξομεν", "p": "futurum indikativ aktiv, 1:a pl"}, {"f": "κηρύξετε", "p": "futurum indikativ aktiv, 2:a pl"}, {"f": "κηρύξουσι(ν)", "p": "futurum indikativ aktiv, 3:e pl"}, {"f": "κηρύσσειν", "p": "presens infinitiv aktiv"}, {"f": "κήρυσσε", "p": "presens imperativ aktiv, 2:a sg"}, {"f": "κηρυσσέτω", "p": "presens imperativ aktiv, 3:e sg"}, {"f": "κηρυσσέτωσαν", "p": "presens imperativ aktiv, 3:e pl"}, {"f": "ἐκήρυσσον", "p": "imperfekt indikativ aktiv, 1:a sg"}, {"f": "ἐκήρυσσες", "p": "imperfekt indikativ aktiv, 2:a sg"}, {"f": "ἐκήρυσσε(ν)", "p": "imperfekt indikativ aktiv, 3:e sg"}, {"f": "ἐκηρύσσομεν", "p": "imperfekt indikativ aktiv, 1:a pl"}, {"f": "ἐκηρύσσετε", "p": "imperfekt indikativ aktiv, 2:a pl"}, {"f": "κηρύξειν", "p": "futurum infinitiv aktiv"}, {"f": "ἐκήρυξα", "p": "aorist indikativ aktiv, 1:a sg"}, {"f": "ἐκήρυξας", "p": "aorist indikativ aktiv, 2:a sg"}, {"f": "ἐκήρυξε(ν)", "p": "aorist indikativ aktiv, 3:e sg"}, {"f": "ἐκηρύξαμεν", "p": "aorist indikativ aktiv, 1:a pl"}, {"f": "ἐκηρύξατε", "p": "aorist indikativ aktiv, 2:a pl"}, {"f": "ἐκήρυξαν", "p": "aorist indikativ aktiv, 3:e pl"}, {"f": "κήρυξον", "p": "aorist imperativ aktiv, 2:a sg"}, {"f": "κηρυξάτω", "p": "aorist imperativ aktiv, 3:e sg"}, {"f": "κηρύξατε", "p": "aorist imperativ aktiv, 2:a pl"}, {"f": "κηρυξάτωσαν", "p": "aorist imperativ aktiv, 3:e pl"}, {"f": "κηρῦξαι", "p": "aorist infinitiv aktiv"}],
  "κλέπτω": [{"f": "κλέπτω", "p": "presens indikativ aktiv, 1:a sg"}, {"f": "κλέπτεις", "p": "presens indikativ aktiv, 2:a sg"}, {"f": "κλέπτει", "p": "presens indikativ aktiv, 3:e sg"}, {"f": "κλέπτομεν", "p": "presens indikativ aktiv, 1:a pl"}, {"f": "κλέπτετε", "p": "presens indikativ aktiv, 2:a pl"}, {"f": "κλέπτουσι(ν)", "p": "presens indikativ aktiv, 3:e pl"}, {"f": "κλέψω", "p": "futurum indikativ aktiv, 1:a sg"}, {"f": "κλέψεις", "p": "futurum indikativ aktiv, 2:a sg"}, {"f": "κλέψει", "p": "futurum indikativ aktiv, 3:e sg"}, {"f": "κλέψομεν", "p": "futurum indikativ aktiv, 1:a pl"}, {"f": "κλέψετε", "p": "futurum indikativ aktiv, 2:a pl"}, {"f": "κλέψουσι(ν)", "p": "futurum indikativ aktiv, 3:e pl"}, {"f": "κλέπτειν", "p": "presens infinitiv aktiv"}, {"f": "κλέπτε", "p": "presens imperativ aktiv, 2:a sg"}, {"f": "κλεπτέτω", "p": "presens imperativ aktiv, 3:e sg"}, {"f": "κλεπτέτωσαν", "p": "presens imperativ aktiv, 3:e pl"}, {"f": "ἔκλεπτον", "p": "imperfekt indikativ aktiv, 1:a sg"}, {"f": "ἔκλεπτες", "p": "imperfekt indikativ aktiv, 2:a sg"}, {"f": "ἔκλεπτε(ν)", "p": "imperfekt indikativ aktiv, 3:e sg"}, {"f": "ἐκλέπτομεν", "p": "imperfekt indikativ aktiv, 1:a pl"}, {"f": "ἐκλέπτετε", "p": "imperfekt indikativ aktiv, 2:a pl"}, {"f": "κλέψειν", "p": "futurum infinitiv aktiv"}, {"f": "ἔκλεψα", "p": "aorist indikativ aktiv, 1:a sg"}, {"f": "ἔκλεψας", "p": "aorist indikativ aktiv, 2:a sg"}, {"f": "ἔκλεψε(ν)", "p": "aorist indikativ aktiv, 3:e sg"}, {"f": "ἐκλέψαμεν", "p": "aorist indikativ aktiv, 1:a pl"}, {"f": "ἐκλέψατε", "p": "aorist indikativ aktiv, 2:a pl"}, {"f": "ἔκλεψαν", "p": "aorist indikativ aktiv, 3:e pl"}, {"f": "κλέψον", "p": "aorist imperativ aktiv, 2:a sg"}, {"f": "κλεψάτω", "p": "aorist imperativ aktiv, 3:e sg"}, {"f": "κλέψατε", "p": "aorist imperativ aktiv, 2:a pl"}, {"f": "κλεψάτωσαν", "p": "aorist imperativ aktiv, 3:e pl"}, {"f": "κλέψαι", "p": "aorist infinitiv aktiv"}],
  "κρίνω": [{"f": "κρίνω", "p": "presens indikativ aktiv, 1:a sg"}, {"f": "κρίνεις", "p": "presens indikativ aktiv, 2:a sg"}, {"f": "κρίνει", "p": "presens indikativ aktiv, 3:e sg"}, {"f": "κρίνομεν", "p": "presens indikativ aktiv, 1:a pl"}, {"f": "κρίνετε", "p": "presens indikativ aktiv, 2:a pl"}, {"f": "κρίνουσι(ν)", "p": "presens indikativ aktiv, 3:e pl"}, {"f": "κρινῶ", "p": "futurum indikativ aktiv, 1:a sg"}, {"f": "κρινεῖς", "p": "futurum indikativ aktiv, 2:a sg"}, {"f": "κρινεῖ", "p": "futurum indikativ aktiv, 3:e sg"}, {"f": "κρινοῦμεν", "p": "futurum indikativ aktiv, 1:a pl"}, {"f": "κρινεῖτε", "p": "futurum indikativ aktiv, 2:a pl"}, {"f": "κρινοῦσι(ν)", "p": "futurum indikativ aktiv, 3:e pl"}, {"f": "ἔκρινα", "p": "aorist indikativ aktiv, 1:a sg"}, {"f": "ἔκρινας", "p": "aorist indikativ aktiv, 2:a sg"}, {"f": "ἔκρινε(ν)", "p": "aorist indikativ aktiv, 3:e sg"}, {"f": "ἐκρίναμεν", "p": "aorist indikativ aktiv, 1:a pl"}, {"f": "ἐκρίνατε", "p": "aorist indikativ aktiv, 2:a pl"}, {"f": "ἔκριναν", "p": "aorist indikativ aktiv, 3:e pl"}],
  "κόσμος": [{"f": "κόσμος", "p": "nominativ singular"}, {"f": "κόσμοι", "p": "nominativ plural"}, {"f": "κόσμου", "p": "genitiv singular"}, {"f": "κόσμων", "p": "genitiv plural"}, {"f": "κόσμῳ", "p": "dativ singular"}, {"f": "κόσμοις", "p": "dativ plural"}, {"f": "κόσμον", "p": "ackusativ singular"}, {"f": "κόσμους", "p": "ackusativ plural"}, {"f": "κόσμε", "p": "vokativ singular"}],
  "κύριος": [{"f": "κύριος", "p": "nominativ singular"}, {"f": "κύριοι", "p": "nominativ plural"}, {"f": "κυρίου", "p": "genitiv singular"}, {"f": "κυρίων", "p": "genitiv plural"}, {"f": "κυρίῳ", "p": "dativ singular"}, {"f": "κυρίοις", "p": "dativ plural"}, {"f": "κύριον", "p": "ackusativ singular"}, {"f": "κυρίους", "p": "ackusativ plural"}, {"f": "κύριε", "p": "vokativ singular"}],
  "κώμη": [{"f": "κώμη", "p": "nominativ singular"}, {"f": "κῶμαι", "p": "nominativ plural"}, {"f": "κώμης", "p": "genitiv singular"}, {"f": "κωμῶν", "p": "genitiv plural"}, {"f": "κώμῃ", "p": "dativ singular"}, {"f": "κώμαις", "p": "dativ plural"}, {"f": "κώμην", "p": "ackusativ singular"}, {"f": "κώμας", "p": "ackusativ plural"}],
  "λέγω": [{"f": "λέγω", "p": "presens indikativ aktiv, 1:a sg"}, {"f": "λέγεις", "p": "presens indikativ aktiv, 2:a sg"}, {"f": "λέγει", "p": "presens indikativ aktiv, 3:e sg"}, {"f": "λέγομεν", "p": "presens indikativ aktiv, 1:a pl"}, {"f": "λέγετε", "p": "presens indikativ aktiv, 2:a pl"}, {"f": "λέγουσι(ν)", "p": "presens indikativ aktiv, 3:e pl"}, {"f": "λέγειν", "p": "presens infinitiv aktiv"}, {"f": "λέγε", "p": "presens imperativ aktiv, 2:a sg"}, {"f": "λεγέτω", "p": "presens imperativ aktiv, 3:e sg"}, {"f": "λεγέτωσαν", "p": "presens imperativ aktiv, 3:e pl"}, {"f": "ἔλεγον", "p": "imperfekt indikativ aktiv, 1:a sg"}, {"f": "ἔλεγες", "p": "imperfekt indikativ aktiv, 2:a sg"}, {"f": "ἔλεγε(ν)", "p": "imperfekt indikativ aktiv, 3:e sg"}, {"f": "ἐλέγομεν", "p": "imperfekt indikativ aktiv, 1:a pl"}, {"f": "ἐλέγετε", "p": "imperfekt indikativ aktiv, 2:a pl"}],
  "λίθος": [{"f": "λίθος", "p": "nominativ singular"}, {"f": "λίθοι", "p": "nominativ plural"}, {"f": "λίθου", "p": "genitiv singular"}, {"f": "λίθων", "p": "genitiv plural"}, {"f": "λίθῳ", "p": "dativ singular"}, {"f": "λίθοις", "p": "dativ plural"}, {"f": "λίθον", "p": "ackusativ singular"}, {"f": "λίθους", "p": "ackusativ plural"}, {"f": "λίθε", "p": "vokativ singular"}],
  "λαλέω": [{"f": "λαλῶ", "p": "presens indikativ aktiv, 1:a sg"}, {"f": "λαλεῖς", "p": "presens indikativ aktiv, 2:a sg"}, {"f": "λαλεῖ", "p": "presens indikativ aktiv, 3:e sg"}, {"f": "λαλοῦμεν", "p": "presens indikativ aktiv, 1:a pl"}, {"f": "λαλεῖτε", "p": "presens indikativ aktiv, 2:a pl"}, {"f": "λαλοῦσι(ν)", "p": "presens indikativ aktiv, 3:e pl"}, {"f": "λαλήσω", "p": "futurum indikativ aktiv, 1:a sg"}, {"f": "λαλήσεις", "p": "futurum indikativ aktiv, 2:a sg"}, {"f": "λαλήσει", "p": "futurum indikativ aktiv, 3:e sg"}, {"f": "λαλήσομεν", "p": "futurum indikativ aktiv, 1:a pl"}, {"f": "λαλήσετε", "p": "futurum indikativ aktiv, 2:a pl"}, {"f": "λαλήσουσι(ν)", "p": "futurum indikativ aktiv, 3:e pl"}, {"f": "λαλεῖν", "p": "presens infinitiv aktiv"}, {"f": "λάλει", "p": "presens imperativ aktiv, 2:a sg"}, {"f": "λαλείτω", "p": "presens imperativ aktiv, 3:e sg"}, {"f": "λαλείτωσαν", "p": "presens imperativ aktiv, 3:e pl"}, {"f": "ἐλάλουν", "p": "imperfekt indikativ aktiv, 1:a sg"}, {"f": "ἐλάλεις", "p": "imperfekt indikativ aktiv, 2:a sg"}, {"f": "ἐλάλει", "p": "imperfekt indikativ aktiv, 3:e sg"}, {"f": "ἐλαλοῦμεν", "p": "imperfekt indikativ aktiv, 1:a pl"}, {"f": "ἐλαλεῖτε", "p": "imperfekt indikativ aktiv, 2:a pl"}, {"f": "λαλήσειν", "p": "futurum infinitiv aktiv"}, {"f": "ἐλάλησα", "p": "aorist indikativ aktiv, 1:a sg"}, {"f": "ἐλάλησας", "p": "aorist indikativ aktiv, 2:a sg"}, {"f": "ἐλάλησε(ν)", "p": "aorist indikativ aktiv, 3:e sg"}, {"f": "ἐλαλήσαμεν", "p": "aorist indikativ aktiv, 1:a pl"}, {"f": "ἐλαλήσατε", "p": "aorist indikativ aktiv, 2:a pl"}, {"f": "ἐλάλησαν", "p": "aorist indikativ aktiv, 3:e pl"}, {"f": "λάλησον", "p": "aorist imperativ aktiv, 2:a sg"}, {"f": "λαλησάτω", "p": "aorist imperativ aktiv, 3:e sg"}, {"f": "λαλήσατε", "p": "aorist imperativ aktiv, 2:a pl"}, {"f": "λαλησάτωσαν", "p": "aorist imperativ aktiv, 3:e pl"}, {"f": "λαλῆσαι", "p": "aorist infinitiv aktiv"}],
  "λαμβάνω": [{"f": "λαμβάνω", "p": "presens indikativ aktiv, 1:a sg"}, {"f": "λαμβάνεις", "p": "presens indikativ aktiv, 2:a sg"}, {"f": "λαμβάνει", "p": "presens indikativ aktiv, 3:e sg"}, {"f": "λαμβάνομεν", "p": "presens indikativ aktiv, 1:a pl"}, {"f": "λαμβάνετε", "p": "presens indikativ aktiv, 2:a pl"}, {"f": "λαμβάνουσι(ν)", "p": "presens indikativ aktiv, 3:e pl"}, {"f": "λήμψομαι", "p": "futurum indikativ medium, 1:a sg"}, {"f": "λήμψῃ", "p": "futurum indikativ medium, 2:a sg"}, {"f": "λήμψεται", "p": "futurum indikativ medium, 3:e sg"}, {"f": "λημψόμεθα", "p": "futurum indikativ medium, 1:a pl"}, {"f": "λήμψεσθε", "p": "futurum indikativ medium, 2:a pl"}, {"f": "λήμψονται", "p": "futurum indikativ medium, 3:e pl"}, {"f": "λαμβάνειν", "p": "presens infinitiv aktiv"}, {"f": "λάμβανε", "p": "presens imperativ aktiv, 2:a sg"}, {"f": "λαμβανέτω", "p": "presens imperativ aktiv, 3:e sg"}, {"f": "λαμβανέτωσαν", "p": "presens imperativ aktiv, 3:e pl"}, {"f": "ἐλάμβανον", "p": "imperfekt indikativ aktiv, 1:a sg"}, {"f": "ἐλάμβανες", "p": "imperfekt indikativ aktiv, 2:a sg"}, {"f": "ἐλάμβανε(ν)", "p": "imperfekt indikativ aktiv, 3:e sg"}, {"f": "ἐλαμβάνομεν", "p": "imperfekt indikativ aktiv, 1:a pl"}, {"f": "ἐλαμβάνετε", "p": "imperfekt indikativ aktiv, 2:a pl"}],
  "λατρεύω": [{"f": "λατρεύω", "p": "presens indikativ aktiv, 1:a sg"}, {"f": "λατρεύεις", "p": "presens indikativ aktiv, 2:a sg"}, {"f": "λατρεύει", "p": "presens indikativ aktiv, 3:e sg"}, {"f": "λατρεύομεν", "p": "presens indikativ aktiv, 1:a pl"}, {"f": "λατρεύετε", "p": "presens indikativ aktiv, 2:a pl"}, {"f": "λατρεύουσι(ν)", "p": "presens indikativ aktiv, 3:e pl"}, {"f": "λατρεύσω", "p": "futurum indikativ aktiv, 1:a sg"}, {"f": "λατρεύσεις", "p": "futurum indikativ aktiv, 2:a sg"}, {"f": "λατρεύσει", "p": "futurum indikativ aktiv, 3:e sg"}, {"f": "λατρεύσομεν", "p": "futurum indikativ aktiv, 1:a pl"}, {"f": "λατρεύσετε", "p": "futurum indikativ aktiv, 2:a pl"}, {"f": "λατρεύσουσι(ν)", "p": "futurum indikativ aktiv, 3:e pl"}, {"f": "λατρεύειν", "p": "presens infinitiv aktiv"}, {"f": "λάτρευε", "p": "presens imperativ aktiv, 2:a sg"}, {"f": "λατρευέτω", "p": "presens imperativ aktiv, 3:e sg"}, {"f": "λατρευέτωσαν", "p": "presens imperativ aktiv, 3:e pl"}, {"f": "ἐλάτρευον", "p": "imperfekt indikativ aktiv, 1:a sg"}, {"f": "ἐλάτρευες", "p": "imperfekt indikativ aktiv, 2:a sg"}, {"f": "ἐλάτρευε(ν)", "p": "imperfekt indikativ aktiv, 3:e sg"}, {"f": "ἐλατρεύομεν", "p": "imperfekt indikativ aktiv, 1:a pl"}, {"f": "ἐλατρεύετε", "p": "imperfekt indikativ aktiv, 2:a pl"}, {"f": "λατρεύσειν", "p": "futurum infinitiv aktiv"}, {"f": "ἐλάτρευσα", "p": "aorist indikativ aktiv, 1:a sg"}, {"f": "ἐλάτρευσας", "p": "aorist indikativ aktiv, 2:a sg"}, {"f": "ἐλάτρευσε(ν)", "p": "aorist indikativ aktiv, 3:e sg"}, {"f": "ἐλατρεύσαμεν", "p": "aorist indikativ aktiv, 1:a pl"}, {"f": "ἐλατρεύσατε", "p": "aorist indikativ aktiv, 2:a pl"}, {"f": "ἐλάτρευσαν", "p": "aorist indikativ aktiv, 3:e pl"}, {"f": "λάτρευσον", "p": "aorist imperativ aktiv, 2:a sg"}, {"f": "λατρευσάτω", "p": "aorist imperativ aktiv, 3:e sg"}, {"f": "λατρεύσατε", "p": "aorist imperativ aktiv, 2:a pl"}, {"f": "λατρευσάτωσαν", "p": "aorist imperativ aktiv, 3:e pl"}, {"f": "λατρεῦσαι", "p": "aorist infinitiv aktiv"}],
  "λαός": [{"f": "λαός", "p": "nominativ singular"}, {"f": "λαοί", "p": "nominativ plural"}, {"f": "λαοῦ", "p": "genitiv singular"}, {"f": "λαῶν", "p": "genitiv plural"}, {"f": "λαῷ", "p": "dativ singular"}, {"f": "λαοῖς", "p": "dativ plural"}, {"f": "λαόν", "p": "ackusativ singular"}, {"f": "λαούς", "p": "ackusativ plural"}, {"f": "λαέ", "p": "vokativ singular"}],
  "λόγος": [{"f": "λόγος", "p": "nominativ singular"}, {"f": "λόγοι", "p": "nominativ plural"}, {"f": "λόγου", "p": "genitiv singular"}, {"f": "λόγων", "p": "genitiv plural"}, {"f": "λόγῳ", "p": "dativ singular"}, {"f": "λόγοις", "p": "dativ plural"}, {"f": "λόγον", "p": "ackusativ singular"}, {"f": "λόγους", "p": "ackusativ plural"}, {"f": "λόγε", "p": "vokativ singular"}],
  "λύω": [{"f": "λύω", "p": "presens indikativ aktiv, 1:a sg"}, {"f": "λύεις", "p": "presens indikativ aktiv, 2:a sg"}, {"f": "λύει", "p": "presens indikativ aktiv, 3:e sg"}, {"f": "λύομεν", "p": "presens indikativ aktiv, 1:a pl"}, {"f": "λύετε", "p": "presens indikativ aktiv, 2:a pl"}, {"f": "λύουσι(ν)", "p": "presens indikativ aktiv, 3:e pl"}, {"f": "λύσω", "p": "futurum indikativ aktiv, 1:a sg"}, {"f": "λύσεις", "p": "futurum indikativ aktiv, 2:a sg"}, {"f": "λύσει", "p": "futurum indikativ aktiv, 3:e sg"}, {"f": "λύσομεν", "p": "futurum indikativ aktiv, 1:a pl"}, {"f": "λύσετε", "p": "futurum indikativ aktiv, 2:a pl"}, {"f": "λύσουσι(ν)", "p": "futurum indikativ aktiv, 3:e pl"}, {"f": "λύειν", "p": "presens infinitiv aktiv"}, {"f": "λῦε", "p": "presens imperativ aktiv, 2:a sg"}, {"f": "λυέτω", "p": "presens imperativ aktiv, 3:e sg"}, {"f": "λυέτωσαν", "p": "presens imperativ aktiv, 3:e pl"}, {"f": "ἔλυον", "p": "imperfekt indikativ aktiv, 1:a sg"}, {"f": "ἔλυες", "p": "imperfekt indikativ aktiv, 2:a sg"}, {"f": "ἔλυε(ν)", "p": "imperfekt indikativ aktiv, 3:e sg"}, {"f": "ἐλύομεν", "p": "imperfekt indikativ aktiv, 1:a pl"}, {"f": "ἐλύετε", "p": "imperfekt indikativ aktiv, 2:a pl"}, {"f": "λύσειν", "p": "futurum infinitiv aktiv"}, {"f": "ἔλυσα", "p": "aorist indikativ aktiv, 1:a sg"}, {"f": "ἔλυσας", "p": "aorist indikativ aktiv, 2:a sg"}, {"f": "ἔλυσε(ν)", "p": "aorist indikativ aktiv, 3:e sg"}, {"f": "ἐλύσαμεν", "p": "aorist indikativ aktiv, 1:a pl"}, {"f": "ἐλύσατε", "p": "aorist indikativ aktiv, 2:a pl"}, {"f": "ἔλυσαν", "p": "aorist indikativ aktiv, 3:e pl"}, {"f": "λῦσον", "p": "aorist imperativ aktiv, 2:a sg"}, {"f": "λυσάτω", "p": "aorist imperativ aktiv, 3:e sg"}, {"f": "λύσατε", "p": "aorist imperativ aktiv, 2:a pl"}, {"f": "λυσάτωσαν", "p": "aorist imperativ aktiv, 3:e pl"}, {"f": "λῦσαι", "p": "aorist infinitiv aktiv"}],
  "μέγας": [{"f": "μέγας", "p": "maskulinum nominativ singular"}, {"f": "μεγάλοι", "p": "maskulinum nominativ plural"}, {"f": "μεγάλου", "p": "maskulinum genitiv singular"}, {"f": "μεγάλων", "p": "maskulinum genitiv plural"}, {"f": "μεγάλῳ", "p": "maskulinum dativ singular"}, {"f": "μεγάλοις", "p": "maskulinum dativ plural"}, {"f": "μέγαν", "p": "maskulinum ackusativ singular"}, {"f": "μεγάλους", "p": "maskulinum ackusativ plural"}, {"f": "μεγάλη", "p": "femininum nominativ singular"}, {"f": "μεγάλαι", "p": "femininum nominativ plural"}, {"f": "μεγάλης", "p": "femininum genitiv singular"}, {"f": "μεγάλῃ", "p": "femininum dativ singular"}, {"f": "μεγάλαις", "p": "femininum dativ plural"}, {"f": "μεγάλην", "p": "femininum ackusativ singular"}, {"f": "μεγάλας", "p": "femininum ackusativ plural"}, {"f": "μέγα", "p": "neutrum nominativ singular"}, {"f": "μεγάλα", "p": "neutrum nominativ plural"}],
  "μέλλω": [{"f": "μέλλω", "p": "presens indikativ aktiv, 1:a sg"}, {"f": "μέλλεις", "p": "presens indikativ aktiv, 2:a sg"}, {"f": "μέλλει", "p": "presens indikativ aktiv, 3:e sg"}, {"f": "μέλλομεν", "p": "presens indikativ aktiv, 1:a pl"}, {"f": "μέλλετε", "p": "presens indikativ aktiv, 2:a pl"}, {"f": "μέλλουσι(ν)", "p": "presens indikativ aktiv, 3:e pl"}, {"f": "μέλλειν", "p": "presens infinitiv aktiv"}, {"f": "μέλλε", "p": "presens imperativ aktiv, 2:a sg"}, {"f": "μελλέτω", "p": "presens imperativ aktiv, 3:e sg"}, {"f": "μελλέτωσαν", "p": "presens imperativ aktiv, 3:e pl"}, {"f": "ἔμελλον", "p": "imperfekt indikativ aktiv, 1:a sg"}, {"f": "ἔμελλες", "p": "imperfekt indikativ aktiv, 2:a sg"}, {"f": "ἔμελλε(ν)", "p": "imperfekt indikativ aktiv, 3:e sg"}, {"f": "ἐμέλλομεν", "p": "imperfekt indikativ aktiv, 1:a pl"}, {"f": "ἐμέλλετε", "p": "imperfekt indikativ aktiv, 2:a pl"}],
  "μένω": [{"f": "μένω", "p": "presens indikativ aktiv, 1:a sg"}, {"f": "μένεις", "p": "presens indikativ aktiv, 2:a sg"}, {"f": "μένει", "p": "presens indikativ aktiv, 3:e sg"}, {"f": "μένομεν", "p": "presens indikativ aktiv, 1:a pl"}, {"f": "μένετε", "p": "presens indikativ aktiv, 2:a pl"}, {"f": "μένουσι(ν)", "p": "presens indikativ aktiv, 3:e pl"}, {"f": "μένειν", "p": "presens infinitiv aktiv"}, {"f": "μένε", "p": "presens imperativ aktiv, 2:a sg"}, {"f": "μενέτω", "p": "presens imperativ aktiv, 3:e sg"}, {"f": "μενέτωσαν", "p": "presens imperativ aktiv, 3:e pl"}, {"f": "ἔμενον", "p": "imperfekt indikativ aktiv, 1:a sg"}, {"f": "ἔμενες", "p": "imperfekt indikativ aktiv, 2:a sg"}, {"f": "ἔμενε(ν)", "p": "imperfekt indikativ aktiv, 3:e sg"}, {"f": "ἐμένομεν", "p": "imperfekt indikativ aktiv, 1:a pl"}, {"f": "ἐμένετε", "p": "imperfekt indikativ aktiv, 2:a pl"}],
  "μήτηρ": [{"f": "μήτηρ", "p": "nominativ singular"}, {"f": "μητέρες", "p": "nominativ plural"}, {"f": "μητρός", "p": "genitiv singular"}, {"f": "μητέρων", "p": "genitiv plural"}, {"f": "μητρί", "p": "dativ singular"}, {"f": "μητράσι(ν)", "p": "dativ plural"}, {"f": "μητέρα", "p": "ackusativ singular"}, {"f": "μητέρας", "p": "ackusativ plural"}, {"f": "μῆτερ", "p": "vokativ singular"}],
  "μαθητής": [{"f": "μαθητής", "p": "nominativ singular"}, {"f": "μαθηταί", "p": "nominativ plural"}, {"f": "μαθητοῦ", "p": "genitiv singular"}, {"f": "μαθητῶν", "p": "genitiv plural"}, {"f": "μαθητῇ", "p": "dativ singular"}, {"f": "μαθηταῖς", "p": "dativ plural"}, {"f": "μαθητήν", "p": "ackusativ singular"}, {"f": "μαθητάς", "p": "ackusativ plural"}, {"f": "μαθητά", "p": "vokativ singular"}],
  "μακρός": [{"f": "μακρός", "p": "maskulinum nominativ singular"}, {"f": "μακροί", "p": "maskulinum nominativ plural"}, {"f": "μακροῦ", "p": "maskulinum genitiv singular"}, {"f": "μακρῶν", "p": "maskulinum genitiv plural"}, {"f": "μακρῷ", "p": "maskulinum dativ singular"}, {"f": "μακροῖς", "p": "maskulinum dativ plural"}, {"f": "μακρόν", "p": "maskulinum ackusativ singular"}, {"f": "μακρούς", "p": "maskulinum ackusativ plural"}, {"f": "μακρέ", "p": "maskulinum vokativ singular"}, {"f": "μακρά", "p": "femininum nominativ singular"}, {"f": "μακραί", "p": "femininum nominativ plural"}, {"f": "μακρᾶς", "p": "femininum genitiv singular"}, {"f": "μακρᾷ", "p": "femininum dativ singular"}, {"f": "μακραῖς", "p": "femininum dativ plural"}, {"f": "μακράν", "p": "femininum ackusativ singular"}, {"f": "μακράς", "p": "femininum ackusativ plural"}],
  "μαρτυρέω": [{"f": "μαρτυρῶ", "p": "presens indikativ aktiv, 1:a sg"}, {"f": "μαρτυρεῖς", "p": "presens indikativ aktiv, 2:a sg"}, {"f": "μαρτυρεῖ", "p": "presens indikativ aktiv, 3:e sg"}, {"f": "μαρτυροῦμεν", "p": "presens indikativ aktiv, 1:a pl"}, {"f": "μαρτυρεῖτε", "p": "presens indikativ aktiv, 2:a pl"}, {"f": "μαρτυροῦσι(ν)", "p": "presens indikativ aktiv, 3:e pl"}, {"f": "μαρτυρήσω", "p": "futurum indikativ aktiv, 1:a sg"}, {"f": "μαρτυρήσεις", "p": "futurum indikativ aktiv, 2:a sg"}, {"f": "μαρτυρήσει", "p": "futurum indikativ aktiv, 3:e sg"}, {"f": "μαρτυρήσομεν", "p": "futurum indikativ aktiv, 1:a pl"}, {"f": "μαρτυρήσετε", "p": "futurum indikativ aktiv, 2:a pl"}, {"f": "μαρτυρήσουσι(ν)", "p": "futurum indikativ aktiv, 3:e pl"}, {"f": "μαρτυρεῖν", "p": "presens infinitiv aktiv"}, {"f": "μαρτύρει", "p": "presens imperativ aktiv, 2:a sg"}, {"f": "μαρτυρείτω", "p": "presens imperativ aktiv, 3:e sg"}, {"f": "μαρτυρείτωσαν", "p": "presens imperativ aktiv, 3:e pl"}, {"f": "ἐμαρτύρουν", "p": "imperfekt indikativ aktiv, 1:a sg"}, {"f": "ἐμαρτύρεις", "p": "imperfekt indikativ aktiv, 2:a sg"}, {"f": "ἐμαρτύρει", "p": "imperfekt indikativ aktiv, 3:e sg"}, {"f": "ἐμαρτυροῦμεν", "p": "imperfekt indikativ aktiv, 1:a pl"}, {"f": "ἐμαρτυρεῖτε", "p": "imperfekt indikativ aktiv, 2:a pl"}, {"f": "μαρτυρήσειν", "p": "futurum infinitiv aktiv"}, {"f": "ἐμαρτύρησα", "p": "aorist indikativ aktiv, 1:a sg"}, {"f": "ἐμαρτύρησας", "p": "aorist indikativ aktiv, 2:a sg"}, {"f": "ἐμαρτύρησε(ν)", "p": "aorist indikativ aktiv, 3:e sg"}, {"f": "ἐμαρτυρήσαμεν", "p": "aorist indikativ aktiv, 1:a pl"}, {"f": "ἐμαρτυρήσατε", "p": "aorist indikativ aktiv, 2:a pl"}, {"f": "ἐμαρτύρησαν", "p": "aorist indikativ aktiv, 3:e pl"}, {"f": "μαρτύρησον", "p": "aorist imperativ aktiv, 2:a sg"}, {"f": "μαρτυρησάτω", "p": "aorist imperativ aktiv, 3:e sg"}, {"f": "μαρτυρήσατε", "p": "aorist imperativ aktiv, 2:a pl"}, {"f": "μαρτυρησάτωσαν", "p": "aorist imperativ aktiv, 3:e pl"}, {"f": "μαρτυρῆσαι", "p": "aorist infinitiv aktiv"}],
  "μικρός": [{"f": "μικρός", "p": "maskulinum nominativ singular"}, {"f": "μικροί", "p": "maskulinum nominativ plural"}, {"f": "μικροῦ", "p": "maskulinum genitiv singular"}, {"f": "μικρῶν", "p": "maskulinum genitiv plural"}, {"f": "μικρῷ", "p": "maskulinum dativ singular"}, {"f": "μικροῖς", "p": "maskulinum dativ plural"}, {"f": "μικρόν", "p": "maskulinum ackusativ singular"}, {"f": "μικρούς", "p": "maskulinum ackusativ plural"}, {"f": "μικρέ", "p": "maskulinum vokativ singular"}, {"f": "μικρά", "p": "femininum nominativ singular"}, {"f": "μικραί", "p": "femininum nominativ plural"}, {"f": "μικρᾶς", "p": "femininum genitiv singular"}, {"f": "μικρᾷ", "p": "femininum dativ singular"}, {"f": "μικραῖς", "p": "femininum dativ plural"}, {"f": "μικράν", "p": "femininum ackusativ singular"}, {"f": "μικράς", "p": "femininum ackusativ plural"}],
  "μόνος": [{"f": "μόνος", "p": "maskulinum nominativ singular"}, {"f": "μόνοι", "p": "maskulinum nominativ plural"}, {"f": "μόνου", "p": "maskulinum genitiv singular"}, {"f": "μόνων", "p": "maskulinum genitiv plural"}, {"f": "μόνῳ", "p": "maskulinum dativ singular"}, {"f": "μόνοις", "p": "maskulinum dativ plural"}, {"f": "μόνον", "p": "maskulinum ackusativ singular"}, {"f": "μόνους", "p": "maskulinum ackusativ plural"}, {"f": "μόνε", "p": "maskulinum vokativ singular"}, {"f": "μόνη", "p": "femininum nominativ singular"}, {"f": "μόναι", "p": "femininum nominativ plural"}, {"f": "μόνης", "p": "femininum genitiv singular"}, {"f": "μόνῃ", "p": "femininum dativ singular"}, {"f": "μόναις", "p": "femininum dativ plural"}, {"f": "μόνην", "p": "femininum ackusativ singular"}, {"f": "μόνας", "p": "femininum ackusativ plural"}, {"f": "μόνα", "p": "neutrum nominativ plural"}],
  "νεανίας": [{"f": "νεανίας", "p": "nominativ singular"}, {"f": "νεανίαι", "p": "nominativ plural"}, {"f": "νεανίου", "p": "genitiv singular"}, {"f": "νεανιῶν", "p": "genitiv plural"}, {"f": "νεανίᾳ", "p": "dativ singular"}, {"f": "νεανίαις", "p": "dativ plural"}, {"f": "νεανίαν", "p": "ackusativ singular"}, {"f": "νεανία", "p": "vokativ singular"}],
  "νεκρός": [{"f": "νεκρός", "p": "maskulinum nominativ singular"}, {"f": "νεκροί", "p": "maskulinum nominativ plural"}, {"f": "νεκροῦ", "p": "maskulinum genitiv singular"}, {"f": "νεκρῶν", "p": "maskulinum genitiv plural"}, {"f": "νεκρῷ", "p": "maskulinum dativ singular"}, {"f": "νεκροῖς", "p": "maskulinum dativ plural"}, {"f": "νεκρόν", "p": "maskulinum ackusativ singular"}, {"f": "νεκρούς", "p": "maskulinum ackusativ plural"}, {"f": "νεκρέ", "p": "maskulinum vokativ singular"}, {"f": "νεκρά", "p": "femininum nominativ singular"}, {"f": "νεκραί", "p": "femininum nominativ plural"}, {"f": "νεκρᾶς", "p": "femininum genitiv singular"}, {"f": "νεκρᾷ", "p": "femininum dativ singular"}, {"f": "νεκραῖς", "p": "femininum dativ plural"}, {"f": "νεκράν", "p": "femininum ackusativ singular"}, {"f": "νεκράς", "p": "femininum ackusativ plural"}],
  "νόμος": [{"f": "νόμος", "p": "nominativ singular"}, {"f": "νόμοι", "p": "nominativ plural"}, {"f": "νόμου", "p": "genitiv singular"}, {"f": "νόμων", "p": "genitiv plural"}, {"f": "νόμῳ", "p": "dativ singular"}, {"f": "νόμοις", "p": "dativ plural"}, {"f": "νόμον", "p": "ackusativ singular"}, {"f": "νόμους", "p": "ackusativ plural"}, {"f": "νόμε", "p": "vokativ singular"}],
  "νόσος": [{"f": "νόσος", "p": "nominativ singular"}, {"f": "νόσοι", "p": "nominativ plural"}, {"f": "νόσου", "p": "genitiv singular"}, {"f": "νόσων", "p": "genitiv plural"}, {"f": "νόσῳ", "p": "dativ singular"}, {"f": "νόσοις", "p": "dativ plural"}, {"f": "νόσον", "p": "ackusativ singular"}, {"f": "νόσους", "p": "ackusativ plural"}, {"f": "νόσε", "p": "vokativ singular"}],
  "οἰκοδεσπότης": [{"f": "οἰκοδεσπότης", "p": "nominativ singular"}, {"f": "οἰκοδεσπόται", "p": "nominativ plural"}, {"f": "οἰκοδεσπότου", "p": "genitiv singular"}, {"f": "οἰκοδεσποτῶν", "p": "genitiv plural"}, {"f": "οἰκοδεσπότῃ", "p": "dativ singular"}, {"f": "οἰκοδεσπόταις", "p": "dativ plural"}, {"f": "οἰκοδεσπότην", "p": "ackusativ singular"}, {"f": "οἰκοδεσπότας", "p": "ackusativ plural"}, {"f": "οἰκοδέσποτα", "p": "vokativ singular"}],
  "οἶκος": [{"f": "οἶκος", "p": "nominativ singular"}, {"f": "οἶκοι", "p": "nominativ plural"}, {"f": "οἴκου", "p": "genitiv singular"}, {"f": "οἴκων", "p": "genitiv plural"}, {"f": "οἴκῳ", "p": "dativ singular"}, {"f": "οἴκοις", "p": "dativ plural"}, {"f": "οἶκον", "p": "ackusativ singular"}, {"f": "οἴκους", "p": "ackusativ plural"}, {"f": "οἶκε", "p": "vokativ singular"}],
  "οἶνος": [{"f": "οἶνος", "p": "nominativ singular"}, {"f": "οἶνοι", "p": "nominativ plural"}, {"f": "οἴνου", "p": "genitiv singular"}, {"f": "οἴνων", "p": "genitiv plural"}, {"f": "οἴνῳ", "p": "dativ singular"}, {"f": "οἴνοις", "p": "dativ plural"}, {"f": "οἶνον", "p": "ackusativ singular"}, {"f": "οἴνους", "p": "ackusativ plural"}, {"f": "οἶνε", "p": "vokativ singular"}],
  "οὐρανός": [{"f": "οὐρανός", "p": "nominativ singular"}, {"f": "οὐρανοί", "p": "nominativ plural"}, {"f": "οὐρανοῦ", "p": "genitiv singular"}, {"f": "οὐρανῶν", "p": "genitiv plural"}, {"f": "οὐρανῷ", "p": "dativ singular"}, {"f": "οὐρανοῖς", "p": "dativ plural"}, {"f": "οὐρανόν", "p": "ackusativ singular"}, {"f": "οὐρανούς", "p": "ackusativ plural"}, {"f": "οὐρανέ", "p": "vokativ singular"}],
  "οὗτος": [{"f": "οὗτος", "p": "maskulinum nominativ singular"}, {"f": "οὗτοι", "p": "maskulinum nominativ plural"}, {"f": "τούτου", "p": "maskulinum genitiv singular"}, {"f": "τούτων", "p": "maskulinum genitiv plural"}, {"f": "τούτῳ", "p": "maskulinum dativ singular"}, {"f": "τούτοις", "p": "maskulinum dativ plural"}, {"f": "τοῦτον", "p": "maskulinum ackusativ singular"}, {"f": "τούτους", "p": "maskulinum ackusativ plural"}, {"f": "αὕτη", "p": "femininum nominativ singular"}, {"f": "αὗται", "p": "femininum nominativ plural"}, {"f": "ταύτης", "p": "femininum genitiv singular"}, {"f": "ταύτῃ", "p": "femininum dativ singular"}, {"f": "ταύταις", "p": "femininum dativ plural"}, {"f": "ταύτην", "p": "femininum ackusativ singular"}, {"f": "ταύτας", "p": "femininum ackusativ plural"}, {"f": "τοῦτο", "p": "neutrum nominativ singular"}, {"f": "ταῦτα", "p": "neutrum nominativ plural"}],
  "πέμπω": [{"f": "πέμπω", "p": "presens indikativ aktiv, 1:a sg"}, {"f": "πέμπεις", "p": "presens indikativ aktiv, 2:a sg"}, {"f": "πέμπει", "p": "presens indikativ aktiv, 3:e sg"}, {"f": "πέμπομεν", "p": "presens indikativ aktiv, 1:a pl"}, {"f": "πέμπετε", "p": "presens indikativ aktiv, 2:a pl"}, {"f": "πέμπουσι(ν)", "p": "presens indikativ aktiv, 3:e pl"}, {"f": "πέμψω", "p": "futurum indikativ aktiv, 1:a sg"}, {"f": "πέμψεις", "p": "futurum indikativ aktiv, 2:a sg"}, {"f": "πέμψει", "p": "futurum indikativ aktiv, 3:e sg"}, {"f": "πέμψομεν", "p": "futurum indikativ aktiv, 1:a pl"}, {"f": "πέμψετε", "p": "futurum indikativ aktiv, 2:a pl"}, {"f": "πέμψουσι(ν)", "p": "futurum indikativ aktiv, 3:e pl"}, {"f": "πέμπειν", "p": "presens infinitiv aktiv"}, {"f": "πέμπε", "p": "presens imperativ aktiv, 2:a sg"}, {"f": "πεμπέτω", "p": "presens imperativ aktiv, 3:e sg"}, {"f": "πεμπέτωσαν", "p": "presens imperativ aktiv, 3:e pl"}, {"f": "ἔπεμπον", "p": "imperfekt indikativ aktiv, 1:a sg"}, {"f": "ἔπεμπες", "p": "imperfekt indikativ aktiv, 2:a sg"}, {"f": "ἔπεμπε(ν)", "p": "imperfekt indikativ aktiv, 3:e sg"}, {"f": "ἐπέμπομεν", "p": "imperfekt indikativ aktiv, 1:a pl"}, {"f": "ἐπέμπετε", "p": "imperfekt indikativ aktiv, 2:a pl"}, {"f": "πέμψειν", "p": "futurum infinitiv aktiv"}, {"f": "ἔπεμψα", "p": "aorist indikativ aktiv, 1:a sg"}, {"f": "ἔπεμψας", "p": "aorist indikativ aktiv, 2:a sg"}, {"f": "ἔπεμψε(ν)", "p": "aorist indikativ aktiv, 3:e sg"}, {"f": "ἐπέμψαμεν", "p": "aorist indikativ aktiv, 1:a pl"}, {"f": "ἐπέμψατε", "p": "aorist indikativ aktiv, 2:a pl"}, {"f": "ἔπεμψαν", "p": "aorist indikativ aktiv, 3:e pl"}, {"f": "πέμψον", "p": "aorist imperativ aktiv, 2:a sg"}, {"f": "πεμψάτω", "p": "aorist imperativ aktiv, 3:e sg"}, {"f": "πέμψατε", "p": "aorist imperativ aktiv, 2:a pl"}, {"f": "πεμψάτωσαν", "p": "aorist imperativ aktiv, 3:e pl"}, {"f": "πέμψαι", "p": "aorist infinitiv aktiv"}],
  "παιδεύω": [{"f": "παιδεύω", "p": "presens indikativ aktiv, 1:a sg"}, {"f": "παιδεύεις", "p": "presens indikativ aktiv, 2:a sg"}, {"f": "παιδεύει", "p": "presens indikativ aktiv, 3:e sg"}, {"f": "παιδεύομεν", "p": "presens indikativ aktiv, 1:a pl"}, {"f": "παιδεύετε", "p": "presens indikativ aktiv, 2:a pl"}, {"f": "παιδεύουσι(ν)", "p": "presens indikativ aktiv, 3:e pl"}, {"f": "παιδεύσω", "p": "futurum indikativ aktiv, 1:a sg"}, {"f": "παιδεύσεις", "p": "futurum indikativ aktiv, 2:a sg"}, {"f": "παιδεύσει", "p": "futurum indikativ aktiv, 3:e sg"}, {"f": "παιδεύσομεν", "p": "futurum indikativ aktiv, 1:a pl"}, {"f": "παιδεύσετε", "p": "futurum indikativ aktiv, 2:a pl"}, {"f": "παιδεύσουσι(ν)", "p": "futurum indikativ aktiv, 3:e pl"}, {"f": "παιδεύειν", "p": "presens infinitiv aktiv"}, {"f": "παίδευε", "p": "presens imperativ aktiv, 2:a sg"}, {"f": "παιδευέτω", "p": "presens imperativ aktiv, 3:e sg"}, {"f": "παιδευέτωσαν", "p": "presens imperativ aktiv, 3:e pl"}, {"f": "ἐπαίδευον", "p": "imperfekt indikativ aktiv, 1:a sg"}, {"f": "ἐπαίδευες", "p": "imperfekt indikativ aktiv, 2:a sg"}, {"f": "ἐπαίδευε(ν)", "p": "imperfekt indikativ aktiv, 3:e sg"}, {"f": "ἐπαιδεύομεν", "p": "imperfekt indikativ aktiv, 1:a pl"}, {"f": "ἐπαιδεύετε", "p": "imperfekt indikativ aktiv, 2:a pl"}, {"f": "παιδεύσειν", "p": "futurum infinitiv aktiv"}, {"f": "ἐπαίδευσα", "p": "aorist indikativ aktiv, 1:a sg"}, {"f": "ἐπαίδευσας", "p": "aorist indikativ aktiv, 2:a sg"}, {"f": "ἐπαίδευσε(ν)", "p": "aorist indikativ aktiv, 3:e sg"}, {"f": "ἐπαιδεύσαμεν", "p": "aorist indikativ aktiv, 1:a pl"}, {"f": "ἐπαιδεύσατε", "p": "aorist indikativ aktiv, 2:a pl"}, {"f": "ἐπαίδευσαν", "p": "aorist indikativ aktiv, 3:e pl"}, {"f": "παίδευσον", "p": "aorist imperativ aktiv, 2:a sg"}, {"f": "παιδευσάτω", "p": "aorist imperativ aktiv, 3:e sg"}, {"f": "παιδεύσατε", "p": "aorist imperativ aktiv, 2:a pl"}, {"f": "παιδευσάτωσαν", "p": "aorist imperativ aktiv, 3:e pl"}, {"f": "παιδεῦσαι", "p": "aorist infinitiv aktiv"}],
  "παράδεισος": [{"f": "παράδεισος", "p": "nominativ singular"}, {"f": "παράδεισοι", "p": "nominativ plural"}, {"f": "παραδείσου", "p": "genitiv singular"}, {"f": "παραδείσων", "p": "genitiv plural"}, {"f": "παραδείσῳ", "p": "dativ singular"}, {"f": "παραδείσοις", "p": "dativ plural"}, {"f": "παράδεισον", "p": "ackusativ singular"}, {"f": "παραδείσους", "p": "ackusativ plural"}, {"f": "παράδεισε", "p": "vokativ singular"}],
  "παραβολή": [{"f": "παραβολή", "p": "nominativ singular"}, {"f": "παραβολαί", "p": "nominativ plural"}, {"f": "παραβολῆς", "p": "genitiv singular"}, {"f": "παραβολῶν", "p": "genitiv plural"}, {"f": "παραβολῇ", "p": "dativ singular"}, {"f": "παραβολαῖς", "p": "dativ plural"}, {"f": "παραβολήν", "p": "ackusativ singular"}, {"f": "παραβολάς", "p": "ackusativ plural"}],
  "παρθένος": [{"f": "παρθένος", "p": "nominativ singular"}, {"f": "παρθένοι", "p": "nominativ plural"}, {"f": "παρθένου", "p": "genitiv singular"}, {"f": "παρθένων", "p": "genitiv plural"}, {"f": "παρθένῳ", "p": "dativ singular"}, {"f": "παρθένοις", "p": "dativ plural"}, {"f": "παρθένον", "p": "ackusativ singular"}, {"f": "παρθένους", "p": "ackusativ plural"}, {"f": "παρθένε", "p": "vokativ singular"}],
  "πατήρ": [{"f": "πατήρ", "p": "nominativ singular"}, {"f": "πατέρες", "p": "nominativ plural"}, {"f": "πατρός", "p": "genitiv singular"}, {"f": "πατέρων", "p": "genitiv plural"}, {"f": "πατρί", "p": "dativ singular"}, {"f": "πατράσι(ν)", "p": "dativ plural"}, {"f": "πατέρα", "p": "ackusativ singular"}, {"f": "πατέρας", "p": "ackusativ plural"}, {"f": "πάτερ", "p": "vokativ singular"}],
  "πείθω": [{"f": "πείθω", "p": "presens indikativ aktiv, 1:a sg"}, {"f": "πείθεις", "p": "presens indikativ aktiv, 2:a sg"}, {"f": "πείθει", "p": "presens indikativ aktiv, 3:e sg"}, {"f": "πείθομεν", "p": "presens indikativ aktiv, 1:a pl"}, {"f": "πείθετε", "p": "presens indikativ aktiv, 2:a pl"}, {"f": "πείθουσι(ν)", "p": "presens indikativ aktiv, 3:e pl"}, {"f": "πείσω", "p": "futurum indikativ aktiv, 1:a sg"}, {"f": "πείσεις", "p": "futurum indikativ aktiv, 2:a sg"}, {"f": "πείσει", "p": "futurum indikativ aktiv, 3:e sg"}, {"f": "πείσομεν", "p": "futurum indikativ aktiv, 1:a pl"}, {"f": "πείσετε", "p": "futurum indikativ aktiv, 2:a pl"}, {"f": "πείσουσι(ν)", "p": "futurum indikativ aktiv, 3:e pl"}, {"f": "πείθειν", "p": "presens infinitiv aktiv"}, {"f": "πείσειν", "p": "futurum infinitiv aktiv"}, {"f": "πεῖθε", "p": "presens imperativ aktiv, 2:a sg"}, {"f": "πειθέτω", "p": "presens imperativ aktiv, 3:e sg"}, {"f": "πειθέτωσαν", "p": "presens imperativ aktiv, 3:e pl"}, {"f": "ἔπειθον", "p": "imperfekt indikativ aktiv, 1:a sg"}, {"f": "ἔπειθες", "p": "imperfekt indikativ aktiv, 2:a sg"}, {"f": "ἔπειθε(ν)", "p": "imperfekt indikativ aktiv, 3:e sg"}, {"f": "ἐπείθομεν", "p": "imperfekt indikativ aktiv, 1:a pl"}, {"f": "ἐπείθετε", "p": "imperfekt indikativ aktiv, 2:a pl"}, {"f": "ἔπεισα", "p": "aorist indikativ aktiv, 1:a sg"}, {"f": "ἔπεισας", "p": "aorist indikativ aktiv, 2:a sg"}, {"f": "ἔπεισε(ν)", "p": "aorist indikativ aktiv, 3:e sg"}, {"f": "ἐπείσαμεν", "p": "aorist indikativ aktiv, 1:a pl"}, {"f": "ἐπείσατε", "p": "aorist indikativ aktiv, 2:a pl"}, {"f": "ἔπεισαν", "p": "aorist indikativ aktiv, 3:e pl"}, {"f": "πεῖσον", "p": "aorist imperativ aktiv, 2:a sg"}, {"f": "πεισάτω", "p": "aorist imperativ aktiv, 3:e sg"}, {"f": "πείσατε", "p": "aorist imperativ aktiv, 2:a pl"}, {"f": "πεισάτωσαν", "p": "aorist imperativ aktiv, 3:e pl"}, {"f": "πεῖσαι", "p": "aorist infinitiv aktiv"}],
  "πιστεύω": [{"f": "πιστεύω", "p": "presens indikativ aktiv, 1:a sg"}, {"f": "πιστεύεις", "p": "presens indikativ aktiv, 2:a sg"}, {"f": "πιστεύει", "p": "presens indikativ aktiv, 3:e sg"}, {"f": "πιστεύομεν", "p": "presens indikativ aktiv, 1:a pl"}, {"f": "πιστεύετε", "p": "presens indikativ aktiv, 2:a pl"}, {"f": "πιστεύουσι(ν)", "p": "presens indikativ aktiv, 3:e pl"}, {"f": "πιστεύσω", "p": "futurum indikativ aktiv, 1:a sg"}, {"f": "πιστεύσεις", "p": "futurum indikativ aktiv, 2:a sg"}, {"f": "πιστεύσει", "p": "futurum indikativ aktiv, 3:e sg"}, {"f": "πιστεύσομεν", "p": "futurum indikativ aktiv, 1:a pl"}, {"f": "πιστεύσετε", "p": "futurum indikativ aktiv, 2:a pl"}, {"f": "πιστεύσουσι(ν)", "p": "futurum indikativ aktiv, 3:e pl"}, {"f": "πιστεύειν", "p": "presens infinitiv aktiv"}, {"f": "πίστευε", "p": "presens imperativ aktiv, 2:a sg"}, {"f": "πιστευέτω", "p": "presens imperativ aktiv, 3:e sg"}, {"f": "πιστευέτωσαν", "p": "presens imperativ aktiv, 3:e pl"}, {"f": "ἐπίστευον", "p": "imperfekt indikativ aktiv, 1:a sg"}, {"f": "ἐπίστευες", "p": "imperfekt indikativ aktiv, 2:a sg"}, {"f": "ἐπίστευε(ν)", "p": "imperfekt indikativ aktiv, 3:e sg"}, {"f": "ἐπιστεύομεν", "p": "imperfekt indikativ aktiv, 1:a pl"}, {"f": "ἐπιστεύετε", "p": "imperfekt indikativ aktiv, 2:a pl"}, {"f": "πιστεύσειν", "p": "futurum infinitiv aktiv"}, {"f": "ἐπίστευσα", "p": "aorist indikativ aktiv, 1:a sg"}, {"f": "ἐπίστευσας", "p": "aorist indikativ aktiv, 2:a sg"}, {"f": "ἐπίστευσε(ν)", "p": "aorist indikativ aktiv, 3:e sg"}, {"f": "ἐπιστεύσαμεν", "p": "aorist indikativ aktiv, 1:a pl"}, {"f": "ἐπιστεύσατε", "p": "aorist indikativ aktiv, 2:a pl"}, {"f": "ἐπίστευσαν", "p": "aorist indikativ aktiv, 3:e pl"}, {"f": "πίστευσον", "p": "aorist imperativ aktiv, 2:a sg"}, {"f": "πιστευσάτω", "p": "aorist imperativ aktiv, 3:e sg"}, {"f": "πιστεύσατε", "p": "aorist imperativ aktiv, 2:a pl"}, {"f": "πιστευσάτωσαν", "p": "aorist imperativ aktiv, 3:e pl"}, {"f": "πιστεῦσαι", "p": "aorist infinitiv aktiv"}],
  "πιστός": [{"f": "πιστός", "p": "maskulinum nominativ singular"}, {"f": "πιστοί", "p": "maskulinum nominativ plural"}, {"f": "πιστοῦ", "p": "maskulinum genitiv singular"}, {"f": "πιστῶν", "p": "maskulinum genitiv plural"}, {"f": "πιστῷ", "p": "maskulinum dativ singular"}, {"f": "πιστοῖς", "p": "maskulinum dativ plural"}, {"f": "πιστόν", "p": "maskulinum ackusativ singular"}, {"f": "πιστούς", "p": "maskulinum ackusativ plural"}, {"f": "πιστέ", "p": "maskulinum vokativ singular"}, {"f": "πιστή", "p": "femininum nominativ singular"}, {"f": "πισταί", "p": "femininum nominativ plural"}, {"f": "πιστῆς", "p": "femininum genitiv singular"}, {"f": "πιστῇ", "p": "femininum dativ singular"}, {"f": "πισταῖς", "p": "femininum dativ plural"}, {"f": "πιστήν", "p": "femininum ackusativ singular"}, {"f": "πιστάς", "p": "femininum ackusativ plural"}, {"f": "πιστά", "p": "neutrum nominativ plural"}],
  "πλούσιος": [{"f": "πλούσιος", "p": "maskulinum nominativ singular"}, {"f": "πλούσιοι", "p": "maskulinum nominativ plural"}, {"f": "πλουσίου", "p": "maskulinum genitiv singular"}, {"f": "πλουσίων", "p": "maskulinum genitiv plural"}, {"f": "πλουσίῳ", "p": "maskulinum dativ singular"}, {"f": "πλουσίοις", "p": "maskulinum dativ plural"}, {"f": "πλούσιον", "p": "maskulinum ackusativ singular"}, {"f": "πλουσίους", "p": "maskulinum ackusativ plural"}, {"f": "πλούσιε", "p": "maskulinum vokativ singular"}, {"f": "πλουσία", "p": "femininum nominativ singular"}, {"f": "πλούσιαι", "p": "femininum nominativ plural"}, {"f": "πλουσίας", "p": "femininum genitiv singular"}, {"f": "πλουσίᾳ", "p": "femininum dativ singular"}, {"f": "πλουσίαις", "p": "femininum dativ plural"}, {"f": "πλουσίαν", "p": "femininum ackusativ singular"}, {"f": "πλούσια", "p": "neutrum nominativ plural"}],
  "πλοῖον": [{"f": "πλοῖον", "p": "nominativ singular"}, {"f": "πλοῖα", "p": "nominativ plural"}, {"f": "πλοίου", "p": "genitiv singular"}, {"f": "πλοίων", "p": "genitiv plural"}, {"f": "πλοίῳ", "p": "dativ singular"}, {"f": "πλοίοις", "p": "dativ plural"}],
  "πνεῦμα": [{"f": "πνεῦμα", "p": "nominativ singular"}, {"f": "πνεύματα", "p": "nominativ plural"}, {"f": "πνεύματος", "p": "genitiv singular"}, {"f": "πνευμάτων", "p": "genitiv plural"}, {"f": "πνεύματι", "p": "dativ singular"}, {"f": "πνεύμασι(ν)", "p": "dativ plural"}],
  "ποιέω": [{"f": "ποιῶ", "p": "presens indikativ aktiv, 1:a sg"}, {"f": "ποιεῖς", "p": "presens indikativ aktiv, 2:a sg"}, {"f": "ποιεῖ", "p": "presens indikativ aktiv, 3:e sg"}, {"f": "ποιοῦμεν", "p": "presens indikativ aktiv, 1:a pl"}, {"f": "ποιεῖτε", "p": "presens indikativ aktiv, 2:a pl"}, {"f": "ποιοῦσι(ν)", "p": "presens indikativ aktiv, 3:e pl"}, {"f": "ποιήσω", "p": "futurum indikativ aktiv, 1:a sg"}, {"f": "ποιήσεις", "p": "futurum indikativ aktiv, 2:a sg"}, {"f": "ποιήσει", "p": "futurum indikativ aktiv, 3:e sg"}, {"f": "ποιήσομεν", "p": "futurum indikativ aktiv, 1:a pl"}, {"f": "ποιήσετε", "p": "futurum indikativ aktiv, 2:a pl"}, {"f": "ποιήσουσι(ν)", "p": "futurum indikativ aktiv, 3:e pl"}, {"f": "ποιεῖν", "p": "presens infinitiv aktiv"}, {"f": "ποίει", "p": "presens imperativ aktiv, 2:a sg"}, {"f": "ποιείτω", "p": "presens imperativ aktiv, 3:e sg"}, {"f": "ποιείτωσαν", "p": "presens imperativ aktiv, 3:e pl"}, {"f": "ἐποίουν", "p": "imperfekt indikativ aktiv, 1:a sg"}, {"f": "ἐποίεις", "p": "imperfekt indikativ aktiv, 2:a sg"}, {"f": "ἐποίει", "p": "imperfekt indikativ aktiv, 3:e sg"}, {"f": "ἐποιοῦμεν", "p": "imperfekt indikativ aktiv, 1:a pl"}, {"f": "ἐποιεῖτε", "p": "imperfekt indikativ aktiv, 2:a pl"}, {"f": "ποιήσειν", "p": "futurum infinitiv aktiv"}, {"f": "ἐποίησα", "p": "aorist indikativ aktiv, 1:a sg"}, {"f": "ἐποίησας", "p": "aorist indikativ aktiv, 2:a sg"}, {"f": "ἐποίησε(ν)", "p": "aorist indikativ aktiv, 3:e sg"}, {"f": "ἐποιήσαμεν", "p": "aorist indikativ aktiv, 1:a pl"}, {"f": "ἐποιήσατε", "p": "aorist indikativ aktiv, 2:a pl"}, {"f": "ἐποίησαν", "p": "aorist indikativ aktiv, 3:e pl"}, {"f": "ποίησον", "p": "aorist imperativ aktiv, 2:a sg"}, {"f": "ποιησάτω", "p": "aorist imperativ aktiv, 3:e sg"}, {"f": "ποιήσατε", "p": "aorist imperativ aktiv, 2:a pl"}, {"f": "ποιησάτωσαν", "p": "aorist imperativ aktiv, 3:e pl"}, {"f": "ποιῆσαι", "p": "aorist infinitiv aktiv"}],
  "πολύς": [{"f": "πολύς", "p": "maskulinum nominativ singular"}, {"f": "πολλοί", "p": "maskulinum nominativ plural"}, {"f": "πολλοῦ", "p": "maskulinum genitiv singular"}, {"f": "πολλῶν", "p": "maskulinum genitiv plural"}, {"f": "πολλῷ", "p": "maskulinum dativ singular"}, {"f": "πολλοῖς", "p": "maskulinum dativ plural"}, {"f": "πολύν", "p": "maskulinum ackusativ singular"}, {"f": "πολλούς", "p": "maskulinum ackusativ plural"}, {"f": "πολλή", "p": "femininum nominativ singular"}, {"f": "πολλαί", "p": "femininum nominativ plural"}, {"f": "πολλῆς", "p": "femininum genitiv singular"}, {"f": "πολλῇ", "p": "femininum dativ singular"}, {"f": "πολλαῖς", "p": "femininum dativ plural"}, {"f": "πολλήν", "p": "femininum ackusativ singular"}, {"f": "πολλάς", "p": "femininum ackusativ plural"}, {"f": "πολύ", "p": "neutrum nominativ singular"}, {"f": "πολλά", "p": "neutrum nominativ plural"}],
  "πονηρός": [{"f": "πονηρός", "p": "maskulinum nominativ singular"}, {"f": "πονηροί", "p": "maskulinum nominativ plural"}, {"f": "πονηροῦ", "p": "maskulinum genitiv singular"}, {"f": "πονηρῶν", "p": "maskulinum genitiv plural"}, {"f": "πονηρῷ", "p": "maskulinum dativ singular"}, {"f": "πονηροῖς", "p": "maskulinum dativ plural"}, {"f": "πονηρόν", "p": "maskulinum ackusativ singular"}, {"f": "πονηρούς", "p": "maskulinum ackusativ plural"}, {"f": "πονηρέ", "p": "maskulinum vokativ singular"}, {"f": "πονηρά", "p": "femininum nominativ singular"}, {"f": "πονηραί", "p": "femininum nominativ plural"}, {"f": "πονηρᾶς", "p": "femininum genitiv singular"}, {"f": "πονηρᾷ", "p": "femininum dativ singular"}, {"f": "πονηραῖς", "p": "femininum dativ plural"}, {"f": "πονηράν", "p": "femininum ackusativ singular"}, {"f": "πονηράς", "p": "femininum ackusativ plural"}],
  "προσκυνέω": [{"f": "προσκυνῶ", "p": "presens indikativ aktiv, 1:a sg"}, {"f": "προσκυνεῖς", "p": "presens indikativ aktiv, 2:a sg"}, {"f": "προσκυνεῖ", "p": "presens indikativ aktiv, 3:e sg"}, {"f": "προσκυνοῦμεν", "p": "presens indikativ aktiv, 1:a pl"}, {"f": "προσκυνεῖτε", "p": "presens indikativ aktiv, 2:a pl"}, {"f": "προσκυνοῦσι(ν)", "p": "presens indikativ aktiv, 3:e pl"}, {"f": "προσκυνήσω", "p": "futurum indikativ aktiv, 1:a sg"}, {"f": "προσκυνήσεις", "p": "futurum indikativ aktiv, 2:a sg"}, {"f": "προσκυνήσει", "p": "futurum indikativ aktiv, 3:e sg"}, {"f": "προσκυνήσομεν", "p": "futurum indikativ aktiv, 1:a pl"}, {"f": "προσκυνήσετε", "p": "futurum indikativ aktiv, 2:a pl"}, {"f": "προσκυνήσουσι(ν)", "p": "futurum indikativ aktiv, 3:e pl"}, {"f": "προσκυνεῖν", "p": "presens infinitiv aktiv"}, {"f": "προσκύνει", "p": "presens imperativ aktiv, 2:a sg"}, {"f": "προσκυνείτω", "p": "presens imperativ aktiv, 3:e sg"}, {"f": "προσκυνείτωσαν", "p": "presens imperativ aktiv, 3:e pl"}, {"f": "προσεκύνουν", "p": "imperfekt indikativ aktiv, 1:a sg"}, {"f": "προσεκύνεις", "p": "imperfekt indikativ aktiv, 2:a sg"}, {"f": "προσεκύνει", "p": "imperfekt indikativ aktiv, 3:e sg"}, {"f": "προσεκυνοῦμεν", "p": "imperfekt indikativ aktiv, 1:a pl"}, {"f": "προσεκυνεῖτε", "p": "imperfekt indikativ aktiv, 2:a pl"}, {"f": "προσκυνήσειν", "p": "futurum infinitiv aktiv"}, {"f": "προσεκύνησα", "p": "aorist indikativ aktiv, 1:a sg"}, {"f": "προσεκύνησας", "p": "aorist indikativ aktiv, 2:a sg"}, {"f": "προσεκύνησε(ν)", "p": "aorist indikativ aktiv, 3:e sg"}, {"f": "προσεκυνήσαμεν", "p": "aorist indikativ aktiv, 1:a pl"}, {"f": "προσεκυνήσατε", "p": "aorist indikativ aktiv, 2:a pl"}, {"f": "προσεκύνησαν", "p": "aorist indikativ aktiv, 3:e pl"}, {"f": "προσκύνησον", "p": "aorist imperativ aktiv, 2:a sg"}, {"f": "προσκυνησάτω", "p": "aorist imperativ aktiv, 3:e sg"}, {"f": "προσκυνήσατε", "p": "aorist imperativ aktiv, 2:a pl"}, {"f": "προσκυνησάτωσαν", "p": "aorist imperativ aktiv, 3:e pl"}, {"f": "προσκυνῆσαι", "p": "aorist infinitiv aktiv"}],
  "προφήτης": [{"f": "προφήτης", "p": "nominativ singular"}, {"f": "προφῆται", "p": "nominativ plural"}, {"f": "προφήτου", "p": "genitiv singular"}, {"f": "προφητῶν", "p": "genitiv plural"}, {"f": "προφήτῃ", "p": "dativ singular"}, {"f": "προφήταις", "p": "dativ plural"}, {"f": "προφήτην", "p": "ackusativ singular"}, {"f": "προφήτας", "p": "ackusativ plural"}, {"f": "προφῆτα", "p": "vokativ singular"}],
  "πρῶτος": [{"f": "πρῶτος", "p": "maskulinum nominativ singular"}, {"f": "πρῶτοι", "p": "maskulinum nominativ plural"}, {"f": "πρώτου", "p": "maskulinum genitiv singular"}, {"f": "πρώτων", "p": "maskulinum genitiv plural"}, {"f": "πρώτῳ", "p": "maskulinum dativ singular"}, {"f": "πρώτοις", "p": "maskulinum dativ plural"}, {"f": "πρῶτον", "p": "maskulinum ackusativ singular"}, {"f": "πρώτους", "p": "maskulinum ackusativ plural"}, {"f": "πρῶτε", "p": "maskulinum vokativ singular"}, {"f": "πρώτη", "p": "femininum nominativ singular"}, {"f": "πρῶται", "p": "femininum nominativ plural"}, {"f": "πρώτης", "p": "femininum genitiv singular"}, {"f": "πρώτῃ", "p": "femininum dativ singular"}, {"f": "πρώταις", "p": "femininum dativ plural"}, {"f": "πρώτην", "p": "femininum ackusativ singular"}, {"f": "πρώτας", "p": "femininum ackusativ plural"}, {"f": "πρῶτα", "p": "neutrum nominativ plural"}],
  "πτωχός": [{"f": "πτωχός", "p": "maskulinum nominativ singular"}, {"f": "πτωχοί", "p": "maskulinum nominativ plural"}, {"f": "πτωχοῦ", "p": "maskulinum genitiv singular"}, {"f": "πτωχῶν", "p": "maskulinum genitiv plural"}, {"f": "πτωχῷ", "p": "maskulinum dativ singular"}, {"f": "πτωχοῖς", "p": "maskulinum dativ plural"}, {"f": "πτωχόν", "p": "maskulinum ackusativ singular"}, {"f": "πτωχούς", "p": "maskulinum ackusativ plural"}, {"f": "πτωχέ", "p": "maskulinum vokativ singular"}, {"f": "πτωχή", "p": "femininum nominativ singular"}, {"f": "πτωχαί", "p": "femininum nominativ plural"}, {"f": "πτωχῆς", "p": "femininum genitiv singular"}, {"f": "πτωχῇ", "p": "femininum dativ singular"}, {"f": "πτωχαῖς", "p": "femininum dativ plural"}, {"f": "πτωχήν", "p": "femininum ackusativ singular"}, {"f": "πτωχάς", "p": "femininum ackusativ plural"}, {"f": "πτωχά", "p": "neutrum nominativ plural"}],
  "σάββατον": [{"f": "σάββατον", "p": "nominativ singular"}, {"f": "σάββατα", "p": "nominativ plural"}, {"f": "σαββάτου", "p": "genitiv singular"}, {"f": "σαββάτων", "p": "genitiv plural"}, {"f": "σαββάτῳ", "p": "dativ singular"}, {"f": "σαββάτοις", "p": "dativ plural"}],
  "σημεῖον": [{"f": "σημεῖον", "p": "nominativ singular"}, {"f": "σημεῖα", "p": "nominativ plural"}, {"f": "σημείου", "p": "genitiv singular"}, {"f": "σημείων", "p": "genitiv plural"}, {"f": "σημείῳ", "p": "dativ singular"}, {"f": "σημείοις", "p": "dativ plural"}],
  "συναγωγή": [{"f": "συναγωγή", "p": "nominativ singular"}, {"f": "συναγωγαί", "p": "nominativ plural"}, {"f": "συναγωγῆς", "p": "genitiv singular"}, {"f": "συναγωγῶν", "p": "genitiv plural"}, {"f": "συναγωγῇ", "p": "dativ singular"}, {"f": "συναγωγαῖς", "p": "dativ plural"}, {"f": "συναγωγήν", "p": "ackusativ singular"}, {"f": "συναγωγάς", "p": "ackusativ plural"}],
  "σός": [{"f": "σός", "p": "maskulinum nominativ singular"}, {"f": "σοί", "p": "maskulinum nominativ plural"}, {"f": "σοῦ", "p": "maskulinum genitiv singular"}, {"f": "σῶν", "p": "maskulinum genitiv plural"}, {"f": "σῷ", "p": "maskulinum dativ singular"}, {"f": "σοῖς", "p": "maskulinum dativ plural"}, {"f": "σόν", "p": "maskulinum ackusativ singular"}, {"f": "σούς", "p": "maskulinum ackusativ plural"}, {"f": "σή", "p": "femininum nominativ singular"}, {"f": "σαί", "p": "femininum nominativ plural"}, {"f": "σῆς", "p": "femininum genitiv singular"}, {"f": "σῇ", "p": "femininum dativ singular"}, {"f": "σαῖς", "p": "femininum dativ plural"}, {"f": "σήν", "p": "femininum ackusativ singular"}, {"f": "σάς", "p": "femininum ackusativ plural"}, {"f": "σά", "p": "neutrum nominativ plural"}],
  "σύ": [{"f": "σύ", "p": "nominativ singular"}, {"f": "σοῦ", "p": "genitiv singular"}, {"f": "σου", "p": "genitiv singular (obetonad)"}, {"f": "σοί", "p": "dativ singular"}, {"f": "σοι", "p": "dativ singular (obetonad)"}, {"f": "σέ", "p": "ackusativ singular"}, {"f": "σε", "p": "ackusativ singular (obetonad)"}, {"f": "ὑμεῖς", "p": "nominativ plural"}, {"f": "ὑμῶν", "p": "genitiv plural"}, {"f": "ὑμῖν", "p": "dativ plural"}, {"f": "ὑμᾶς", "p": "ackusativ plural"}],
  "σῴζω": [{"f": "σῴζω", "p": "presens indikativ aktiv, 1:a sg"}, {"f": "σῴζεις", "p": "presens indikativ aktiv, 2:a sg"}, {"f": "σῴζει", "p": "presens indikativ aktiv, 3:e sg"}, {"f": "σῴζομεν", "p": "presens indikativ aktiv, 1:a pl"}, {"f": "σῴζετε", "p": "presens indikativ aktiv, 2:a pl"}, {"f": "σῴζουσι(ν)", "p": "presens indikativ aktiv, 3:e pl"}, {"f": "σώσω", "p": "futurum indikativ aktiv, 1:a sg"}, {"f": "σώσεις", "p": "futurum indikativ aktiv, 2:a sg"}, {"f": "σώσει", "p": "futurum indikativ aktiv, 3:e sg"}, {"f": "σώσομεν", "p": "futurum indikativ aktiv, 1:a pl"}, {"f": "σώσετε", "p": "futurum indikativ aktiv, 2:a pl"}, {"f": "σώσουσι(ν)", "p": "futurum indikativ aktiv, 3:e pl"}, {"f": "σῴζειν", "p": "presens infinitiv aktiv"}, {"f": "σῷζε", "p": "presens imperativ aktiv, 2:a sg"}, {"f": "σῳζέτω", "p": "presens imperativ aktiv, 3:e sg"}, {"f": "σῳζέτωσαν", "p": "presens imperativ aktiv, 3:e pl"}, {"f": "ἔσῳζον", "p": "imperfekt indikativ aktiv, 1:a sg"}, {"f": "ἔσῳζες", "p": "imperfekt indikativ aktiv, 2:a sg"}, {"f": "ἔσῳζε(ν)", "p": "imperfekt indikativ aktiv, 3:e sg"}, {"f": "ἐσῴζομεν", "p": "imperfekt indikativ aktiv, 1:a pl"}, {"f": "ἐσῴζετε", "p": "imperfekt indikativ aktiv, 2:a pl"}, {"f": "σώσειν", "p": "futurum infinitiv aktiv"}, {"f": "ἔσωσα", "p": "aorist indikativ aktiv, 1:a sg"}, {"f": "ἔσωσας", "p": "aorist indikativ aktiv, 2:a sg"}, {"f": "ἔσωσε(ν)", "p": "aorist indikativ aktiv, 3:e sg"}, {"f": "ἐσώσαμεν", "p": "aorist indikativ aktiv, 1:a pl"}, {"f": "ἐσώσατε", "p": "aorist indikativ aktiv, 2:a pl"}, {"f": "ἔσωσαν", "p": "aorist indikativ aktiv, 3:e pl"}, {"f": "σῶσον", "p": "aorist imperativ aktiv, 2:a sg"}, {"f": "σωσάτω", "p": "aorist imperativ aktiv, 3:e sg"}, {"f": "σώσατε", "p": "aorist imperativ aktiv, 2:a pl"}, {"f": "σωσάτωσαν", "p": "aorist imperativ aktiv, 3:e pl"}, {"f": "σῶσαι", "p": "aorist infinitiv aktiv"}],
  "σῶμα": [{"f": "σῶμα", "p": "nominativ singular"}, {"f": "σώματα", "p": "nominativ plural"}, {"f": "σώματος", "p": "genitiv singular"}, {"f": "σωμάτων", "p": "genitiv plural"}, {"f": "σώματι", "p": "dativ singular"}, {"f": "σώμασι(ν)", "p": "dativ plural"}],
  "τέκνον": [{"f": "τέκνον", "p": "nominativ singular"}, {"f": "τέκνα", "p": "nominativ plural"}, {"f": "τέκνου", "p": "genitiv singular"}, {"f": "τέκνων", "p": "genitiv plural"}, {"f": "τέκνῳ", "p": "dativ singular"}, {"f": "τέκνοις", "p": "dativ plural"}],
  "τίς": [{"f": "τίς", "p": "maskulinum nominativ singular"}, {"f": "τίνες", "p": "maskulinum nominativ plural"}, {"f": "τίνος", "p": "maskulinum genitiv singular"}, {"f": "τίνων", "p": "maskulinum genitiv plural"}, {"f": "τίνι", "p": "maskulinum dativ singular"}, {"f": "τίσι(ν)", "p": "maskulinum dativ plural"}, {"f": "τίνα", "p": "maskulinum ackusativ singular"}, {"f": "τίνας", "p": "maskulinum ackusativ plural"}, {"f": "τί", "p": "neutrum nominativ singular"}],
  "τηρέω": [{"f": "τηρῶ", "p": "presens indikativ aktiv, 1:a sg"}, {"f": "τηρεῖς", "p": "presens indikativ aktiv, 2:a sg"}, {"f": "τηρεῖ", "p": "presens indikativ aktiv, 3:e sg"}, {"f": "τηροῦμεν", "p": "presens indikativ aktiv, 1:a pl"}, {"f": "τηρεῖτε", "p": "presens indikativ aktiv, 2:a pl"}, {"f": "τηροῦσι(ν)", "p": "presens indikativ aktiv, 3:e pl"}, {"f": "τηρήσω", "p": "futurum indikativ aktiv, 1:a sg"}, {"f": "τηρήσεις", "p": "futurum indikativ aktiv, 2:a sg"}, {"f": "τηρήσει", "p": "futurum indikativ aktiv, 3:e sg"}, {"f": "τηρήσομεν", "p": "futurum indikativ aktiv, 1:a pl"}, {"f": "τηρήσετε", "p": "futurum indikativ aktiv, 2:a pl"}, {"f": "τηρήσουσι(ν)", "p": "futurum indikativ aktiv, 3:e pl"}, {"f": "τηρεῖν", "p": "presens infinitiv aktiv"}, {"f": "τήρει", "p": "presens imperativ aktiv, 2:a sg"}, {"f": "τηρείτω", "p": "presens imperativ aktiv, 3:e sg"}, {"f": "τηρείτωσαν", "p": "presens imperativ aktiv, 3:e pl"}, {"f": "ἐτήρουν", "p": "imperfekt indikativ aktiv, 1:a sg"}, {"f": "ἐτήρεις", "p": "imperfekt indikativ aktiv, 2:a sg"}, {"f": "ἐτήρει", "p": "imperfekt indikativ aktiv, 3:e sg"}, {"f": "ἐτηροῦμεν", "p": "imperfekt indikativ aktiv, 1:a pl"}, {"f": "ἐτηρεῖτε", "p": "imperfekt indikativ aktiv, 2:a pl"}, {"f": "τηρήσειν", "p": "futurum infinitiv aktiv"}, {"f": "ἐτήρησα", "p": "aorist indikativ aktiv, 1:a sg"}, {"f": "ἐτήρησας", "p": "aorist indikativ aktiv, 2:a sg"}, {"f": "ἐτήρησε(ν)", "p": "aorist indikativ aktiv, 3:e sg"}, {"f": "ἐτηρήσαμεν", "p": "aorist indikativ aktiv, 1:a pl"}, {"f": "ἐτηρήσατε", "p": "aorist indikativ aktiv, 2:a pl"}, {"f": "ἐτήρησαν", "p": "aorist indikativ aktiv, 3:e pl"}, {"f": "τήρησον", "p": "aorist imperativ aktiv, 2:a sg"}, {"f": "τηρησάτω", "p": "aorist imperativ aktiv, 3:e sg"}, {"f": "τηρήσατε", "p": "aorist imperativ aktiv, 2:a pl"}, {"f": "τηρησάτωσαν", "p": "aorist imperativ aktiv, 3:e pl"}, {"f": "τηρῆσαι", "p": "aorist infinitiv aktiv"}],
  "τις": [{"f": "τις", "p": "maskulinum nominativ singular"}, {"f": "τινές", "p": "maskulinum nominativ plural"}, {"f": "τινός", "p": "maskulinum genitiv singular"}, {"f": "τινῶν", "p": "maskulinum genitiv plural"}, {"f": "τινί", "p": "maskulinum dativ singular"}, {"f": "τισί(ν)", "p": "maskulinum dativ plural"}, {"f": "τινά", "p": "maskulinum ackusativ singular"}, {"f": "τινάς", "p": "maskulinum ackusativ plural"}, {"f": "τι", "p": "neutrum nominativ singular"}],
  "τόπος": [{"f": "τόπος", "p": "nominativ singular"}, {"f": "τόποι", "p": "nominativ plural"}, {"f": "τόπου", "p": "genitiv singular"}, {"f": "τόπων", "p": "genitiv plural"}, {"f": "τόπῳ", "p": "dativ singular"}, {"f": "τόποις", "p": "dativ plural"}, {"f": "τόπον", "p": "ackusativ singular"}, {"f": "τόπους", "p": "ackusativ plural"}, {"f": "τόπε", "p": "vokativ singular"}],
  "υἱός": [{"f": "υἱός", "p": "nominativ singular"}, {"f": "υἱοί", "p": "nominativ plural"}, {"f": "υἱοῦ", "p": "genitiv singular"}, {"f": "υἱῶν", "p": "genitiv plural"}, {"f": "υἱῷ", "p": "dativ singular"}, {"f": "υἱοῖς", "p": "dativ plural"}, {"f": "υἱόν", "p": "ackusativ singular"}, {"f": "υἱούς", "p": "ackusativ plural"}, {"f": "υἱέ", "p": "vokativ singular"}],
  "φίλος": [{"f": "φίλος", "p": "nominativ singular"}, {"f": "φίλοι", "p": "nominativ plural"}, {"f": "φίλου", "p": "genitiv singular"}, {"f": "φίλων", "p": "genitiv plural"}, {"f": "φίλῳ", "p": "dativ singular"}, {"f": "φίλοις", "p": "dativ plural"}, {"f": "φίλον", "p": "ackusativ singular"}, {"f": "φίλους", "p": "ackusativ plural"}, {"f": "φίλε", "p": "vokativ singular"}],
  "φιλέω": [{"f": "φιλῶ", "p": "presens indikativ aktiv, 1:a sg"}, {"f": "φιλεῖς", "p": "presens indikativ aktiv, 2:a sg"}, {"f": "φιλεῖ", "p": "presens indikativ aktiv, 3:e sg"}, {"f": "φιλοῦμεν", "p": "presens indikativ aktiv, 1:a pl"}, {"f": "φιλεῖτε", "p": "presens indikativ aktiv, 2:a pl"}, {"f": "φιλοῦσι(ν)", "p": "presens indikativ aktiv, 3:e pl"}, {"f": "φιλήσω", "p": "futurum indikativ aktiv, 1:a sg"}, {"f": "φιλήσεις", "p": "futurum indikativ aktiv, 2:a sg"}, {"f": "φιλήσει", "p": "futurum indikativ aktiv, 3:e sg"}, {"f": "φιλήσομεν", "p": "futurum indikativ aktiv, 1:a pl"}, {"f": "φιλήσετε", "p": "futurum indikativ aktiv, 2:a pl"}, {"f": "φιλήσουσι(ν)", "p": "futurum indikativ aktiv, 3:e pl"}, {"f": "φιλεῖν", "p": "presens infinitiv aktiv"}, {"f": "φίλει", "p": "presens imperativ aktiv, 2:a sg"}, {"f": "φιλείτω", "p": "presens imperativ aktiv, 3:e sg"}, {"f": "φιλείτωσαν", "p": "presens imperativ aktiv, 3:e pl"}, {"f": "ἐφίλουν", "p": "imperfekt indikativ aktiv, 1:a sg"}, {"f": "ἐφίλεις", "p": "imperfekt indikativ aktiv, 2:a sg"}, {"f": "ἐφίλει", "p": "imperfekt indikativ aktiv, 3:e sg"}, {"f": "ἐφιλοῦμεν", "p": "imperfekt indikativ aktiv, 1:a pl"}, {"f": "ἐφιλεῖτε", "p": "imperfekt indikativ aktiv, 2:a pl"}, {"f": "φιλήσειν", "p": "futurum infinitiv aktiv"}, {"f": "ἐφίλησα", "p": "aorist indikativ aktiv, 1:a sg"}, {"f": "ἐφίλησας", "p": "aorist indikativ aktiv, 2:a sg"}, {"f": "ἐφίλησε(ν)", "p": "aorist indikativ aktiv, 3:e sg"}, {"f": "ἐφιλήσαμεν", "p": "aorist indikativ aktiv, 1:a pl"}, {"f": "ἐφιλήσατε", "p": "aorist indikativ aktiv, 2:a pl"}, {"f": "ἐφίλησαν", "p": "aorist indikativ aktiv, 3:e pl"}, {"f": "φίλησον", "p": "aorist imperativ aktiv, 2:a sg"}, {"f": "φιλησάτω", "p": "aorist imperativ aktiv, 3:e sg"}, {"f": "φιλήσατε", "p": "aorist imperativ aktiv, 2:a pl"}, {"f": "φιλησάτωσαν", "p": "aorist imperativ aktiv, 3:e pl"}, {"f": "φιλῆσαι", "p": "aorist infinitiv aktiv"}],
  "φωνή": [{"f": "φωνή", "p": "nominativ singular"}, {"f": "φωναί", "p": "nominativ plural"}, {"f": "φωνῆς", "p": "genitiv singular"}, {"f": "φωνῶν", "p": "genitiv plural"}, {"f": "φωνῇ", "p": "dativ singular"}, {"f": "φωναῖς", "p": "dativ plural"}, {"f": "φωνήν", "p": "ackusativ singular"}, {"f": "φωνάς", "p": "ackusativ plural"}],
  "φῶς": [{"f": "φῶς", "p": "nominativ singular"}, {"f": "φῶτα", "p": "nominativ plural"}, {"f": "φωτός", "p": "genitiv singular"}, {"f": "φώτων", "p": "genitiv plural"}, {"f": "φωτί", "p": "dativ singular"}, {"f": "φωσί(ν)", "p": "dativ plural"}],
  "ψυχή": [{"f": "ψυχή", "p": "nominativ singular"}, {"f": "ψυχαί", "p": "nominativ plural"}, {"f": "ψυχῆς", "p": "genitiv singular"}, {"f": "ψυχῶν", "p": "genitiv plural"}, {"f": "ψυχῇ", "p": "dativ singular"}, {"f": "ψυχαῖς", "p": "dativ plural"}, {"f": "ψυχήν", "p": "ackusativ singular"}, {"f": "ψυχάς", "p": "ackusativ plural"}],
  "ἀγάπη": [{"f": "ἀγάπη", "p": "nominativ singular"}, {"f": "ἀγάπαι", "p": "nominativ plural"}, {"f": "ἀγάπης", "p": "genitiv singular"}, {"f": "ἀγαπῶν", "p": "genitiv plural"}, {"f": "ἀγάπῃ", "p": "dativ singular"}, {"f": "ἀγάπαις", "p": "dativ plural"}, {"f": "ἀγάπην", "p": "ackusativ singular"}, {"f": "ἀγάπας", "p": "ackusativ plural"}],
  "ἀγαθός": [{"f": "ἀγαθός", "p": "maskulinum nominativ singular"}, {"f": "ἀγαθοί", "p": "maskulinum nominativ plural"}, {"f": "ἀγαθοῦ", "p": "maskulinum genitiv singular"}, {"f": "ἀγαθῶν", "p": "maskulinum genitiv plural"}, {"f": "ἀγαθῷ", "p": "maskulinum dativ singular"}, {"f": "ἀγαθοῖς", "p": "maskulinum dativ plural"}, {"f": "ἀγαθόν", "p": "maskulinum ackusativ singular"}, {"f": "ἀγαθούς", "p": "maskulinum ackusativ plural"}, {"f": "ἀγαθέ", "p": "maskulinum vokativ singular"}, {"f": "ἀγαθή", "p": "femininum nominativ singular"}, {"f": "ἀγαθαί", "p": "femininum nominativ plural"}, {"f": "ἀγαθῆς", "p": "femininum genitiv singular"}, {"f": "ἀγαθῇ", "p": "femininum dativ singular"}, {"f": "ἀγαθαῖς", "p": "femininum dativ plural"}, {"f": "ἀγαθήν", "p": "femininum ackusativ singular"}, {"f": "ἀγαθάς", "p": "femininum ackusativ plural"}, {"f": "ἀγαθά", "p": "neutrum nominativ plural"}],
  "ἀγαπητός": [{"f": "ἀγαπητός", "p": "maskulinum nominativ singular"}, {"f": "ἀγαπητοί", "p": "maskulinum nominativ plural"}, {"f": "ἀγαπητοῦ", "p": "maskulinum genitiv singular"}, {"f": "ἀγαπητῶν", "p": "maskulinum genitiv plural"}, {"f": "ἀγαπητῷ", "p": "maskulinum dativ singular"}, {"f": "ἀγαπητοῖς", "p": "maskulinum dativ plural"}, {"f": "ἀγαπητόν", "p": "maskulinum ackusativ singular"}, {"f": "ἀγαπητούς", "p": "maskulinum ackusativ plural"}, {"f": "ἀγαπητέ", "p": "maskulinum vokativ singular"}, {"f": "ἀγαπητή", "p": "femininum nominativ singular"}, {"f": "ἀγαπηταί", "p": "femininum nominativ plural"}, {"f": "ἀγαπητῆς", "p": "femininum genitiv singular"}, {"f": "ἀγαπητῇ", "p": "femininum dativ singular"}, {"f": "ἀγαπηταῖς", "p": "femininum dativ plural"}, {"f": "ἀγαπητήν", "p": "femininum ackusativ singular"}, {"f": "ἀγαπητάς", "p": "femininum ackusativ plural"}, {"f": "ἀγαπητά", "p": "neutrum nominativ plural"}],
  "ἀγγέλλω": [{"f": "ἀγγέλλω", "p": "presens indikativ aktiv, 1:a sg"}, {"f": "ἀγγέλλεις", "p": "presens indikativ aktiv, 2:a sg"}, {"f": "ἀγγέλλει", "p": "presens indikativ aktiv, 3:e sg"}, {"f": "ἀγγέλλομεν", "p": "presens indikativ aktiv, 1:a pl"}, {"f": "ἀγγέλλετε", "p": "presens indikativ aktiv, 2:a pl"}, {"f": "ἀγγέλλουσι(ν)", "p": "presens indikativ aktiv, 3:e pl"}, {"f": "ἀγγελῶ", "p": "futurum indikativ aktiv, 1:a sg"}, {"f": "ἀγγελεῖς", "p": "futurum indikativ aktiv, 2:a sg"}, {"f": "ἀγγελεῖ", "p": "futurum indikativ aktiv, 3:e sg"}, {"f": "ἀγγελοῦμεν", "p": "futurum indikativ aktiv, 1:a pl"}, {"f": "ἀγγελεῖτε", "p": "futurum indikativ aktiv, 2:a pl"}, {"f": "ἀγγελοῦσι(ν)", "p": "futurum indikativ aktiv, 3:e pl"}, {"f": "ἤγγειλα", "p": "aorist indikativ aktiv, 1:a sg"}, {"f": "ἤγγειλας", "p": "aorist indikativ aktiv, 2:a sg"}, {"f": "ἤγγειλε(ν)", "p": "aorist indikativ aktiv, 3:e sg"}, {"f": "ἠγγείλαμεν", "p": "aorist indikativ aktiv, 1:a pl"}, {"f": "ἠγγείλατε", "p": "aorist indikativ aktiv, 2:a pl"}, {"f": "ἤγγειλαν", "p": "aorist indikativ aktiv, 3:e pl"}],
  "ἀδελφή": [{"f": "ἀδελφή", "p": "nominativ singular"}, {"f": "ἀδελφαί", "p": "nominativ plural"}, {"f": "ἀδελφῆς", "p": "genitiv singular"}, {"f": "ἀδελφῶν", "p": "genitiv plural"}, {"f": "ἀδελφῇ", "p": "dativ singular"}, {"f": "ἀδελφαῖς", "p": "dativ plural"}, {"f": "ἀδελφήν", "p": "ackusativ singular"}, {"f": "ἀδελφάς", "p": "ackusativ plural"}],
  "ἀδελφός": [{"f": "ἀδελφός", "p": "nominativ singular"}, {"f": "ἀδελφοί", "p": "nominativ plural"}, {"f": "ἀδελφοῦ", "p": "genitiv singular"}, {"f": "ἀδελφῶν", "p": "genitiv plural"}, {"f": "ἀδελφῷ", "p": "dativ singular"}, {"f": "ἀδελφοῖς", "p": "dativ plural"}, {"f": "ἀδελφόν", "p": "ackusativ singular"}, {"f": "ἀδελφούς", "p": "ackusativ plural"}, {"f": "ἀδελφέ", "p": "vokativ singular"}],
  "ἀκούω": [{"f": "ἀκούω", "p": "presens indikativ aktiv, 1:a sg"}, {"f": "ἀκούεις", "p": "presens indikativ aktiv, 2:a sg"}, {"f": "ἀκούει", "p": "presens indikativ aktiv, 3:e sg"}, {"f": "ἀκούομεν", "p": "presens indikativ aktiv, 1:a pl"}, {"f": "ἀκούετε", "p": "presens indikativ aktiv, 2:a pl"}, {"f": "ἀκούουσι(ν)", "p": "presens indikativ aktiv, 3:e pl"}, {"f": "ἀκούσω", "p": "futurum indikativ aktiv, 1:a sg"}, {"f": "ἀκούσεις", "p": "futurum indikativ aktiv, 2:a sg"}, {"f": "ἀκούσει", "p": "futurum indikativ aktiv, 3:e sg"}, {"f": "ἀκούσομεν", "p": "futurum indikativ aktiv, 1:a pl"}, {"f": "ἀκούσετε", "p": "futurum indikativ aktiv, 2:a pl"}, {"f": "ἀκούσουσι(ν)", "p": "futurum indikativ aktiv, 3:e pl"}, {"f": "ἀκούειν", "p": "presens infinitiv aktiv"}, {"f": "ἄκουε", "p": "presens imperativ aktiv, 2:a sg"}, {"f": "ἀκουέτω", "p": "presens imperativ aktiv, 3:e sg"}, {"f": "ἀκουέτωσαν", "p": "presens imperativ aktiv, 3:e pl"}, {"f": "ἤκουον", "p": "imperfekt indikativ aktiv, 1:a sg"}, {"f": "ἤκουες", "p": "imperfekt indikativ aktiv, 2:a sg"}, {"f": "ἤκουε(ν)", "p": "imperfekt indikativ aktiv, 3:e sg"}, {"f": "ἠκούομεν", "p": "imperfekt indikativ aktiv, 1:a pl"}, {"f": "ἠκούετε", "p": "imperfekt indikativ aktiv, 2:a pl"}, {"f": "ἀκούσειν", "p": "futurum infinitiv aktiv"}, {"f": "ἤκουσα", "p": "aorist indikativ aktiv, 1:a sg"}, {"f": "ἤκουσας", "p": "aorist indikativ aktiv, 2:a sg"}, {"f": "ἤκουσε(ν)", "p": "aorist indikativ aktiv, 3:e sg"}, {"f": "ἠκούσαμεν", "p": "aorist indikativ aktiv, 1:a pl"}, {"f": "ἠκούσατε", "p": "aorist indikativ aktiv, 2:a pl"}, {"f": "ἤκουσαν", "p": "aorist indikativ aktiv, 3:e pl"}, {"f": "ἄκουσον", "p": "aorist imperativ aktiv, 2:a sg"}, {"f": "ἀκουσάτω", "p": "aorist imperativ aktiv, 3:e sg"}, {"f": "ἀκούσατε", "p": "aorist imperativ aktiv, 2:a pl"}, {"f": "ἀκουσάτωσαν", "p": "aorist imperativ aktiv, 3:e pl"}, {"f": "ἀκοῦσαι", "p": "aorist infinitiv aktiv"}],
  "ἀλήθεια": [{"f": "ἀλήθεια", "p": "nominativ singular"}, {"f": "ἀλήθειαι", "p": "nominativ plural"}, {"f": "ἀληθείας", "p": "genitiv singular"}, {"f": "ἀληθειῶν", "p": "genitiv plural"}, {"f": "ἀληθείᾳ", "p": "dativ singular"}, {"f": "ἀληθείαις", "p": "dativ plural"}, {"f": "ἀλήθειαν", "p": "ackusativ singular"}],
  "ἀμπελών": [{"f": "ἀμπελών", "p": "nominativ singular"}, {"f": "ἀμπελῶνες", "p": "nominativ plural"}, {"f": "ἀμπελῶνος", "p": "genitiv singular"}, {"f": "ἀμπελώνων", "p": "genitiv plural"}, {"f": "ἀμπελῶνι", "p": "dativ singular"}, {"f": "ἀμπελῶσι(ν)", "p": "dativ plural"}, {"f": "ἀμπελῶνα", "p": "ackusativ singular"}, {"f": "ἀμπελῶνας", "p": "ackusativ plural"}],
  "ἀνήρ": [{"f": "ἀνήρ", "p": "nominativ singular"}, {"f": "ἄνδρες", "p": "nominativ plural"}, {"f": "ἀνδρός", "p": "genitiv singular"}, {"f": "ἀνδρῶν", "p": "genitiv plural"}, {"f": "ἀνδρί", "p": "dativ singular"}, {"f": "ἀνδράσι(ν)", "p": "dativ plural"}, {"f": "ἄνδρα", "p": "ackusativ singular"}, {"f": "ἄνδρας", "p": "ackusativ plural"}, {"f": "ἄνερ", "p": "vokativ singular"}],
  "ἀποστέλλω": [{"f": "ἀποστέλλω", "p": "presens indikativ aktiv, 1:a sg"}, {"f": "ἀποστέλλεις", "p": "presens indikativ aktiv, 2:a sg"}, {"f": "ἀποστέλλει", "p": "presens indikativ aktiv, 3:e sg"}, {"f": "ἀποστέλλομεν", "p": "presens indikativ aktiv, 1:a pl"}, {"f": "ἀποστέλλετε", "p": "presens indikativ aktiv, 2:a pl"}, {"f": "ἀποστέλλουσι(ν)", "p": "presens indikativ aktiv, 3:e pl"}, {"f": "ἀποστελῶ", "p": "futurum indikativ aktiv, 1:a sg"}, {"f": "ἀποστελεῖς", "p": "futurum indikativ aktiv, 2:a sg"}, {"f": "ἀποστελεῖ", "p": "futurum indikativ aktiv, 3:e sg"}, {"f": "ἀποστελοῦμεν", "p": "futurum indikativ aktiv, 1:a pl"}, {"f": "ἀποστελεῖτε", "p": "futurum indikativ aktiv, 2:a pl"}, {"f": "ἀποστελοῦσι(ν)", "p": "futurum indikativ aktiv, 3:e pl"}, {"f": "ἀπέστειλα", "p": "aorist indikativ aktiv, 1:a sg"}, {"f": "ἀπέστειλας", "p": "aorist indikativ aktiv, 2:a sg"}, {"f": "ἀπέστειλε(ν)", "p": "aorist indikativ aktiv, 3:e sg"}, {"f": "ἀπεστείλαμεν", "p": "aorist indikativ aktiv, 1:a pl"}, {"f": "ἀπεστείλατε", "p": "aorist indikativ aktiv, 2:a pl"}, {"f": "ἀπέστειλαν", "p": "aorist indikativ aktiv, 3:e pl"}],
  "ἀπόστολος": [{"f": "ἀπόστολος", "p": "nominativ singular"}, {"f": "ἀπόστολοι", "p": "nominativ plural"}, {"f": "ἀποστόλου", "p": "genitiv singular"}, {"f": "ἀποστόλων", "p": "genitiv plural"}, {"f": "ἀποστόλῳ", "p": "dativ singular"}, {"f": "ἀποστόλοις", "p": "dativ plural"}, {"f": "ἀπόστολον", "p": "ackusativ singular"}, {"f": "ἀποστόλους", "p": "ackusativ plural"}, {"f": "ἀπόστολε", "p": "vokativ singular"}],
  "ἀρχή": [{"f": "ἀρχή", "p": "nominativ singular"}, {"f": "ἀρχαί", "p": "nominativ plural"}, {"f": "ἀρχῆς", "p": "genitiv singular"}, {"f": "ἀρχῶν", "p": "genitiv plural"}, {"f": "ἀρχῇ", "p": "dativ singular"}, {"f": "ἀρχαῖς", "p": "dativ plural"}, {"f": "ἀρχήν", "p": "ackusativ singular"}, {"f": "ἀρχάς", "p": "ackusativ plural"}],
  "ἁμαρτάνω": [{"f": "ἁμαρτάνω", "p": "presens indikativ aktiv, 1:a sg"}, {"f": "ἁμαρτάνεις", "p": "presens indikativ aktiv, 2:a sg"}, {"f": "ἁμαρτάνει", "p": "presens indikativ aktiv, 3:e sg"}, {"f": "ἁμαρτάνομεν", "p": "presens indikativ aktiv, 1:a pl"}, {"f": "ἁμαρτάνετε", "p": "presens indikativ aktiv, 2:a pl"}, {"f": "ἁμαρτάνουσι(ν)", "p": "presens indikativ aktiv, 3:e pl"}, {"f": "ἁμαρτάνειν", "p": "presens infinitiv aktiv"}, {"f": "ἁμάρτανε", "p": "presens imperativ aktiv, 2:a sg"}, {"f": "ἁμαρτανέτω", "p": "presens imperativ aktiv, 3:e sg"}, {"f": "ἁμαρτανέτωσαν", "p": "presens imperativ aktiv, 3:e pl"}, {"f": "ἡμάρτανον", "p": "imperfekt indikativ aktiv, 1:a sg"}, {"f": "ἡμάρτανες", "p": "imperfekt indikativ aktiv, 2:a sg"}, {"f": "ἡμάρτανε(ν)", "p": "imperfekt indikativ aktiv, 3:e sg"}, {"f": "ἡμαρτάνομεν", "p": "imperfekt indikativ aktiv, 1:a pl"}, {"f": "ἡμαρτάνετε", "p": "imperfekt indikativ aktiv, 2:a pl"}],
  "ἁμαρτία": [{"f": "ἁμαρτία", "p": "nominativ singular"}, {"f": "ἁμαρτίαι", "p": "nominativ plural"}, {"f": "ἁμαρτίας", "p": "genitiv singular"}, {"f": "ἁμαρτιῶν", "p": "genitiv plural"}, {"f": "ἁμαρτίᾳ", "p": "dativ singular"}, {"f": "ἁμαρτίαις", "p": "dativ plural"}, {"f": "ἁμαρτίαν", "p": "ackusativ singular"}],
  "ἁμαρτωλός": [{"f": "ἁμαρτωλός", "p": "maskulinum nominativ singular"}, {"f": "ἁμαρτωλοί", "p": "maskulinum nominativ plural"}, {"f": "ἁμαρτωλοῦ", "p": "maskulinum genitiv singular"}, {"f": "ἁμαρτωλῶν", "p": "maskulinum genitiv plural"}, {"f": "ἁμαρτωλῷ", "p": "maskulinum dativ singular"}, {"f": "ἁμαρτωλοῖς", "p": "maskulinum dativ plural"}, {"f": "ἁμαρτωλόν", "p": "maskulinum ackusativ singular"}, {"f": "ἁμαρτωλούς", "p": "maskulinum ackusativ plural"}, {"f": "ἁμαρτωλέ", "p": "maskulinum vokativ singular"}, {"f": "ἁμαρτωλή", "p": "femininum nominativ singular"}, {"f": "ἁμαρτωλαί", "p": "femininum nominativ plural"}, {"f": "ἁμαρτωλῆς", "p": "femininum genitiv singular"}, {"f": "ἁμαρτωλῇ", "p": "femininum dativ singular"}, {"f": "ἁμαρτωλαῖς", "p": "femininum dativ plural"}, {"f": "ἁμαρτωλήν", "p": "femininum ackusativ singular"}, {"f": "ἁμαρτωλάς", "p": "femininum ackusativ plural"}, {"f": "ἁμαρτωλά", "p": "neutrum nominativ plural"}],
  "ἄγγελος": [{"f": "ἄγγελος", "p": "nominativ singular"}, {"f": "ἄγγελοι", "p": "nominativ plural"}, {"f": "ἀγγέλου", "p": "genitiv singular"}, {"f": "ἀγγέλων", "p": "genitiv plural"}, {"f": "ἀγγέλῳ", "p": "dativ singular"}, {"f": "ἀγγέλοις", "p": "dativ plural"}, {"f": "ἄγγελον", "p": "ackusativ singular"}, {"f": "ἀγγέλους", "p": "ackusativ plural"}, {"f": "ἄγγελε", "p": "vokativ singular"}],
  "ἄγω": [{"f": "ἄγω", "p": "presens indikativ aktiv, 1:a sg"}, {"f": "ἄγεις", "p": "presens indikativ aktiv, 2:a sg"}, {"f": "ἄγει", "p": "presens indikativ aktiv, 3:e sg"}, {"f": "ἄγομεν", "p": "presens indikativ aktiv, 1:a pl"}, {"f": "ἄγετε", "p": "presens indikativ aktiv, 2:a pl"}, {"f": "ἄγουσι(ν)", "p": "presens indikativ aktiv, 3:e pl"}, {"f": "ἄξω", "p": "futurum indikativ aktiv, 1:a sg"}, {"f": "ἄξεις", "p": "futurum indikativ aktiv, 2:a sg"}, {"f": "ἄξει", "p": "futurum indikativ aktiv, 3:e sg"}, {"f": "ἄξομεν", "p": "futurum indikativ aktiv, 1:a pl"}, {"f": "ἄξετε", "p": "futurum indikativ aktiv, 2:a pl"}, {"f": "ἄξουσι(ν)", "p": "futurum indikativ aktiv, 3:e pl"}, {"f": "ἄγειν", "p": "presens infinitiv aktiv"}, {"f": "ἄγε", "p": "presens imperativ aktiv, 2:a sg"}, {"f": "ἀγέτω", "p": "presens imperativ aktiv, 3:e sg"}, {"f": "ἀγέτωσαν", "p": "presens imperativ aktiv, 3:e pl"}, {"f": "ἦγον", "p": "imperfekt indikativ aktiv, 1:a sg"}, {"f": "ἦγες", "p": "imperfekt indikativ aktiv, 2:a sg"}, {"f": "ἦγε(ν)", "p": "imperfekt indikativ aktiv, 3:e sg"}, {"f": "ἤγομεν", "p": "imperfekt indikativ aktiv, 1:a pl"}, {"f": "ἤγετε", "p": "imperfekt indikativ aktiv, 2:a pl"}, {"f": "ἄξειν", "p": "futurum infinitiv aktiv"}],
  "ἄνθρωπος": [{"f": "ἄνθρωπος", "p": "nominativ singular"}, {"f": "ἄνθρωποι", "p": "nominativ plural"}, {"f": "ἀνθρώπου", "p": "genitiv singular"}, {"f": "ἀνθρώπων", "p": "genitiv plural"}, {"f": "ἀνθρώπῳ", "p": "dativ singular"}, {"f": "ἀνθρώποις", "p": "dativ plural"}, {"f": "ἄνθρωπον", "p": "ackusativ singular"}, {"f": "ἀνθρώπους", "p": "ackusativ plural"}, {"f": "ἄνθρωπε", "p": "vokativ singular"}],
  "ἄρτος": [{"f": "ἄρτος", "p": "nominativ singular"}, {"f": "ἄρτοι", "p": "nominativ plural"}, {"f": "ἄρτου", "p": "genitiv singular"}, {"f": "ἄρτων", "p": "genitiv plural"}, {"f": "ἄρτῳ", "p": "dativ singular"}, {"f": "ἄρτοις", "p": "dativ plural"}, {"f": "ἄρτον", "p": "ackusativ singular"}, {"f": "ἄρτους", "p": "ackusativ plural"}, {"f": "ἄρτε", "p": "vokativ singular"}],
  "ἅγιος": [{"f": "ἅγιος", "p": "maskulinum nominativ singular"}, {"f": "ἅγιοι", "p": "maskulinum nominativ plural"}, {"f": "ἁγίου", "p": "maskulinum genitiv singular"}, {"f": "ἁγίων", "p": "maskulinum genitiv plural"}, {"f": "ἁγίῳ", "p": "maskulinum dativ singular"}, {"f": "ἁγίοις", "p": "maskulinum dativ plural"}, {"f": "ἅγιον", "p": "maskulinum ackusativ singular"}, {"f": "ἁγίους", "p": "maskulinum ackusativ plural"}, {"f": "ἅγιε", "p": "maskulinum vokativ singular"}, {"f": "ἁγία", "p": "femininum nominativ singular"}, {"f": "ἅγιαι", "p": "femininum nominativ plural"}, {"f": "ἁγίας", "p": "femininum genitiv singular"}, {"f": "ἁγίᾳ", "p": "femininum dativ singular"}, {"f": "ἁγίαις", "p": "femininum dativ plural"}, {"f": "ἁγίαν", "p": "femininum ackusativ singular"}, {"f": "ἅγια", "p": "neutrum nominativ plural"}],
  "ἐγώ": [{"f": "ἐγώ", "p": "nominativ singular"}, {"f": "ἐμοῦ", "p": "genitiv singular"}, {"f": "μου", "p": "genitiv singular (obetonad)"}, {"f": "ἐμοί", "p": "dativ singular"}, {"f": "μοι", "p": "dativ singular (obetonad)"}, {"f": "ἐμέ", "p": "ackusativ singular"}, {"f": "με", "p": "ackusativ singular (obetonad)"}, {"f": "ἡμεῖς", "p": "nominativ plural"}, {"f": "ἡμῶν", "p": "genitiv plural"}, {"f": "ἡμῖν", "p": "dativ plural"}, {"f": "ἡμᾶς", "p": "ackusativ plural"}],
  "ἐκεῖνος": [{"f": "ἐκεῖνος", "p": "maskulinum nominativ singular"}, {"f": "ἐκεῖνοι", "p": "maskulinum nominativ plural"}, {"f": "ἐκείνου", "p": "maskulinum genitiv singular"}, {"f": "ἐκείνων", "p": "maskulinum genitiv plural"}, {"f": "ἐκείνῳ", "p": "maskulinum dativ singular"}, {"f": "ἐκείνοις", "p": "maskulinum dativ plural"}, {"f": "ἐκεῖνον", "p": "maskulinum ackusativ singular"}, {"f": "ἐκείνους", "p": "maskulinum ackusativ plural"}, {"f": "ἐκείνη", "p": "femininum nominativ singular"}, {"f": "ἐκεῖναι", "p": "femininum nominativ plural"}, {"f": "ἐκείνης", "p": "femininum genitiv singular"}, {"f": "ἐκείνῃ", "p": "femininum dativ singular"}, {"f": "ἐκείναις", "p": "femininum dativ plural"}, {"f": "ἐκείνην", "p": "femininum ackusativ singular"}, {"f": "ἐκείνας", "p": "femininum ackusativ plural"}, {"f": "ἐκεῖνο", "p": "neutrum nominativ singular"}, {"f": "ἐκεῖνα", "p": "neutrum nominativ plural"}],
  "ἐκκλησία": [{"f": "ἐκκλησία", "p": "nominativ singular"}, {"f": "ἐκκλησίαι", "p": "nominativ plural"}, {"f": "ἐκκλησίας", "p": "genitiv singular"}, {"f": "ἐκκλησιῶν", "p": "genitiv plural"}, {"f": "ἐκκλησίᾳ", "p": "dativ singular"}, {"f": "ἐκκλησίαις", "p": "dativ plural"}, {"f": "ἐκκλησίαν", "p": "ackusativ singular"}],
  "ἐμός": [{"f": "ἐμός", "p": "maskulinum nominativ singular"}, {"f": "ἐμοί", "p": "maskulinum nominativ plural"}, {"f": "ἐμοῦ", "p": "maskulinum genitiv singular"}, {"f": "ἐμῶν", "p": "maskulinum genitiv plural"}, {"f": "ἐμῷ", "p": "maskulinum dativ singular"}, {"f": "ἐμοῖς", "p": "maskulinum dativ plural"}, {"f": "ἐμόν", "p": "maskulinum ackusativ singular"}, {"f": "ἐμούς", "p": "maskulinum ackusativ plural"}, {"f": "ἐμή", "p": "femininum nominativ singular"}, {"f": "ἐμαί", "p": "femininum nominativ plural"}, {"f": "ἐμῆς", "p": "femininum genitiv singular"}, {"f": "ἐμῇ", "p": "femininum dativ singular"}, {"f": "ἐμαῖς", "p": "femininum dativ plural"}, {"f": "ἐμήν", "p": "femininum ackusativ singular"}, {"f": "ἐμάς", "p": "femininum ackusativ plural"}, {"f": "ἐμά", "p": "neutrum nominativ plural"}],
  "ἐντολή": [{"f": "ἐντολή", "p": "nominativ singular"}, {"f": "ἐντολαί", "p": "nominativ plural"}, {"f": "ἐντολῆς", "p": "genitiv singular"}, {"f": "ἐντολῶν", "p": "genitiv plural"}, {"f": "ἐντολῇ", "p": "dativ singular"}, {"f": "ἐντολαῖς", "p": "dativ plural"}, {"f": "ἐντολήν", "p": "ackusativ singular"}, {"f": "ἐντολάς", "p": "ackusativ plural"}],
  "ἐξουσία": [{"f": "ἐξουσία", "p": "nominativ singular"}, {"f": "ἐξουσίαι", "p": "nominativ plural"}, {"f": "ἐξουσίας", "p": "genitiv singular"}, {"f": "ἐξουσιῶν", "p": "genitiv plural"}, {"f": "ἐξουσίᾳ", "p": "dativ singular"}, {"f": "ἐξουσίαις", "p": "dativ plural"}, {"f": "ἐξουσίαν", "p": "ackusativ singular"}],
  "ἐσθίω": [{"f": "ἐσθίω", "p": "presens indikativ aktiv, 1:a sg"}, {"f": "ἐσθίεις", "p": "presens indikativ aktiv, 2:a sg"}, {"f": "ἐσθίει", "p": "presens indikativ aktiv, 3:e sg"}, {"f": "ἐσθίομεν", "p": "presens indikativ aktiv, 1:a pl"}, {"f": "ἐσθίετε", "p": "presens indikativ aktiv, 2:a pl"}, {"f": "ἐσθίουσι(ν)", "p": "presens indikativ aktiv, 3:e pl"}, {"f": "ἐσθίειν", "p": "presens infinitiv aktiv"}, {"f": "ἔσθιε", "p": "presens imperativ aktiv, 2:a sg"}, {"f": "ἐσθιέτω", "p": "presens imperativ aktiv, 3:e sg"}, {"f": "ἐσθιέτωσαν", "p": "presens imperativ aktiv, 3:e pl"}, {"f": "ἤσθιον", "p": "imperfekt indikativ aktiv, 1:a sg"}, {"f": "ἤσθιες", "p": "imperfekt indikativ aktiv, 2:a sg"}, {"f": "ἤσθιε(ν)", "p": "imperfekt indikativ aktiv, 3:e sg"}, {"f": "ἠσθίομεν", "p": "imperfekt indikativ aktiv, 1:a pl"}, {"f": "ἠσθίετε", "p": "imperfekt indikativ aktiv, 2:a pl"}],
  "ἔργον": [{"f": "ἔργον", "p": "nominativ singular"}, {"f": "ἔργα", "p": "nominativ plural"}, {"f": "ἔργου", "p": "genitiv singular"}, {"f": "ἔργων", "p": "genitiv plural"}, {"f": "ἔργῳ", "p": "dativ singular"}, {"f": "ἔργοις", "p": "dativ plural"}],
  "ἔρημος": [{"f": "ἔρημος", "p": "nominativ singular"}, {"f": "ἔρημοι", "p": "nominativ plural"}, {"f": "ἐρήμου", "p": "genitiv singular"}, {"f": "ἐρήμων", "p": "genitiv plural"}, {"f": "ἐρήμῳ", "p": "dativ singular"}, {"f": "ἐρήμοις", "p": "dativ plural"}, {"f": "ἔρημον", "p": "ackusativ singular"}, {"f": "ἐρήμους", "p": "ackusativ plural"}, {"f": "ἔρημε", "p": "vokativ singular"}],
  "ἡγεμών": [{"f": "ἡγεμών", "p": "nominativ singular"}, {"f": "ἡγεμόνες", "p": "nominativ plural"}, {"f": "ἡγεμόνος", "p": "genitiv singular"}, {"f": "ἡγεμόνων", "p": "genitiv plural"}, {"f": "ἡγεμόνι", "p": "dativ singular"}, {"f": "ἡγεμόσι(ν)", "p": "dativ plural"}, {"f": "ἡγεμόνα", "p": "ackusativ singular"}, {"f": "ἡγεμόνας", "p": "ackusativ plural"}],
  "ἡμέρα": [{"f": "ἡμέρα", "p": "nominativ singular"}, {"f": "ἡμέραι", "p": "nominativ plural"}, {"f": "ἡμέρας", "p": "genitiv singular"}, {"f": "ἡμερῶν", "p": "genitiv plural"}, {"f": "ἡμέρᾳ", "p": "dativ singular"}, {"f": "ἡμέραις", "p": "dativ plural"}, {"f": "ἡμέραν", "p": "ackusativ singular"}],
  "ἡμέτερος": [{"f": "ἡμέτερος", "p": "maskulinum nominativ singular"}, {"f": "ἡμέτεροι", "p": "maskulinum nominativ plural"}, {"f": "ἡμετέρου", "p": "maskulinum genitiv singular"}, {"f": "ἡμετέρων", "p": "maskulinum genitiv plural"}, {"f": "ἡμετέρῳ", "p": "maskulinum dativ singular"}, {"f": "ἡμετέροις", "p": "maskulinum dativ plural"}, {"f": "ἡμέτερον", "p": "maskulinum ackusativ singular"}, {"f": "ἡμετέρους", "p": "maskulinum ackusativ plural"}, {"f": "ἡμετέρα", "p": "femininum nominativ singular"}, {"f": "ἡμέτεραι", "p": "femininum nominativ plural"}, {"f": "ἡμετέρας", "p": "femininum genitiv singular"}, {"f": "ἡμετέρᾳ", "p": "femininum dativ singular"}, {"f": "ἡμετέραις", "p": "femininum dativ plural"}, {"f": "ἡμετέραν", "p": "femininum ackusativ singular"}, {"f": "ἡμέτερα", "p": "neutrum nominativ plural"}],
  "ἱερόν": [{"f": "ἱερόν", "p": "nominativ singular"}, {"f": "ἱερά", "p": "nominativ plural"}, {"f": "ἱεροῦ", "p": "genitiv singular"}, {"f": "ἱερῶν", "p": "genitiv plural"}, {"f": "ἱερῷ", "p": "dativ singular"}, {"f": "ἱεροῖς", "p": "dativ plural"}],
  "ὀφθαλμός": [{"f": "ὀφθαλμός", "p": "nominativ singular"}, {"f": "ὀφθαλμοί", "p": "nominativ plural"}, {"f": "ὀφθαλμοῦ", "p": "genitiv singular"}, {"f": "ὀφθαλμῶν", "p": "genitiv plural"}, {"f": "ὀφθαλμῷ", "p": "dativ singular"}, {"f": "ὀφθαλμοῖς", "p": "dativ plural"}, {"f": "ὀφθαλμόν", "p": "ackusativ singular"}, {"f": "ὀφθαλμούς", "p": "ackusativ plural"}, {"f": "ὀφθαλμέ", "p": "vokativ singular"}],
  "ὁδός": [{"f": "ὁδός", "p": "nominativ singular"}, {"f": "ὁδοί", "p": "nominativ plural"}, {"f": "ὁδοῦ", "p": "genitiv singular"}, {"f": "ὁδῶν", "p": "genitiv plural"}, {"f": "ὁδῷ", "p": "dativ singular"}, {"f": "ὁδοῖς", "p": "dativ plural"}, {"f": "ὁδόν", "p": "ackusativ singular"}, {"f": "ὁδούς", "p": "ackusativ plural"}, {"f": "ὁδέ", "p": "vokativ singular"}],
  "ὄνομα": [{"f": "ὄνομα", "p": "nominativ singular"}, {"f": "ὀνόματα", "p": "nominativ plural"}, {"f": "ὀνόματος", "p": "genitiv singular"}, {"f": "ὀνομάτων", "p": "genitiv plural"}, {"f": "ὀνόματι", "p": "dativ singular"}, {"f": "ὀνόμασι(ν)", "p": "dativ plural"}],
  "ὄρος": [{"f": "ὄρος", "p": "nominativ singular"}, {"f": "ὄρη", "p": "nominativ plural"}, {"f": "ὄρους", "p": "genitiv singular"}, {"f": "ὄρων", "p": "genitiv plural"}, {"f": "ὄρει", "p": "dativ singular"}, {"f": "ὄρεσι(ν)", "p": "dativ plural"}],
  "ὄχλος": [{"f": "ὄχλος", "p": "nominativ singular"}, {"f": "ὄχλοι", "p": "nominativ plural"}, {"f": "ὄχλου", "p": "genitiv singular"}, {"f": "ὄχλων", "p": "genitiv plural"}, {"f": "ὄχλῳ", "p": "dativ singular"}, {"f": "ὄχλοις", "p": "dativ plural"}, {"f": "ὄχλον", "p": "ackusativ singular"}, {"f": "ὄχλους", "p": "ackusativ plural"}, {"f": "ὄχλε", "p": "vokativ singular"}],
  "ὅς": [{"f": "ὅς", "p": "maskulinum nominativ singular"}, {"f": "οἵ", "p": "maskulinum nominativ plural"}, {"f": "οὗ", "p": "maskulinum genitiv singular"}, {"f": "ὧν", "p": "maskulinum genitiv plural"}, {"f": "ᾧ", "p": "maskulinum dativ singular"}, {"f": "οἷς", "p": "maskulinum dativ plural"}, {"f": "ὅν", "p": "maskulinum ackusativ singular"}, {"f": "οὕς", "p": "maskulinum ackusativ plural"}, {"f": "ἥ", "p": "femininum nominativ singular"}, {"f": "αἵ", "p": "femininum nominativ plural"}, {"f": "ἧς", "p": "femininum genitiv singular"}, {"f": "ᾗ", "p": "femininum dativ singular"}, {"f": "αἷς", "p": "femininum dativ plural"}, {"f": "ἥν", "p": "femininum ackusativ singular"}, {"f": "ἅς", "p": "femininum ackusativ plural"}, {"f": "ὅ", "p": "neutrum nominativ singular"}, {"f": "ἅ", "p": "neutrum nominativ plural"}],
  "ὑμέτερος": [{"f": "ὑμέτερος", "p": "maskulinum nominativ singular"}, {"f": "ὑμέτεροι", "p": "maskulinum nominativ plural"}, {"f": "ὑμετέρου", "p": "maskulinum genitiv singular"}, {"f": "ὑμετέρων", "p": "maskulinum genitiv plural"}, {"f": "ὑμετέρῳ", "p": "maskulinum dativ singular"}, {"f": "ὑμετέροις", "p": "maskulinum dativ plural"}, {"f": "ὑμέτερον", "p": "maskulinum ackusativ singular"}, {"f": "ὑμετέρους", "p": "maskulinum ackusativ plural"}, {"f": "ὑμετέρα", "p": "femininum nominativ singular"}, {"f": "ὑμέτεραι", "p": "femininum nominativ plural"}, {"f": "ὑμετέρας", "p": "femininum genitiv singular"}, {"f": "ὑμετέρᾳ", "p": "femininum dativ singular"}, {"f": "ὑμετέραις", "p": "femininum dativ plural"}, {"f": "ὑμετέραν", "p": "femininum ackusativ singular"}, {"f": "ὑμέτερα", "p": "neutrum nominativ plural"}],
  "ὑπάγω": [{"f": "ὑπάγω", "p": "presens indikativ aktiv, 1:a sg"}, {"f": "ὑπάγεις", "p": "presens indikativ aktiv, 2:a sg"}, {"f": "ὑπάγει", "p": "presens indikativ aktiv, 3:e sg"}, {"f": "ὑπάγομεν", "p": "presens indikativ aktiv, 1:a pl"}, {"f": "ὑπάγετε", "p": "presens indikativ aktiv, 2:a pl"}, {"f": "ὑπάγουσι(ν)", "p": "presens indikativ aktiv, 3:e pl"}, {"f": "ὑπάξω", "p": "futurum indikativ aktiv, 1:a sg"}, {"f": "ὑπάξεις", "p": "futurum indikativ aktiv, 2:a sg"}, {"f": "ὑπάξει", "p": "futurum indikativ aktiv, 3:e sg"}, {"f": "ὑπάξομεν", "p": "futurum indikativ aktiv, 1:a pl"}, {"f": "ὑπάξετε", "p": "futurum indikativ aktiv, 2:a pl"}, {"f": "ὑπάξουσι(ν)", "p": "futurum indikativ aktiv, 3:e pl"}, {"f": "ὑπάγειν", "p": "presens infinitiv aktiv"}, {"f": "ὑπάξειν", "p": "futurum infinitiv aktiv"}, {"f": "ὕπαγε", "p": "presens imperativ aktiv, 2:a sg"}, {"f": "ὑπαγέτω", "p": "presens imperativ aktiv, 3:e sg"}, {"f": "ὑπαγέτωσαν", "p": "presens imperativ aktiv, 3:e pl"}, {"f": "ὑπῆγον", "p": "imperfekt indikativ aktiv, 1:a sg"}, {"f": "ὑπῆγες", "p": "imperfekt indikativ aktiv, 2:a sg"}, {"f": "ὑπῆγε(ν)", "p": "imperfekt indikativ aktiv, 3:e sg"}, {"f": "ὑπήγομεν", "p": "imperfekt indikativ aktiv, 1:a pl"}, {"f": "ὑπήγετε", "p": "imperfekt indikativ aktiv, 2:a pl"}],
  "ὑψηλός": [{"f": "ὑψηλός", "p": "maskulinum nominativ singular"}, {"f": "ὑψηλοί", "p": "maskulinum nominativ plural"}, {"f": "ὑψηλοῦ", "p": "maskulinum genitiv singular"}, {"f": "ὑψηλῶν", "p": "maskulinum genitiv plural"}, {"f": "ὑψηλῷ", "p": "maskulinum dativ singular"}, {"f": "ὑψηλοῖς", "p": "maskulinum dativ plural"}, {"f": "ὑψηλόν", "p": "maskulinum ackusativ singular"}, {"f": "ὑψηλούς", "p": "maskulinum ackusativ plural"}, {"f": "ὑψηλέ", "p": "maskulinum vokativ singular"}, {"f": "ὑψηλή", "p": "femininum nominativ singular"}, {"f": "ὑψηλαί", "p": "femininum nominativ plural"}, {"f": "ὑψηλῆς", "p": "femininum genitiv singular"}, {"f": "ὑψηλῇ", "p": "femininum dativ singular"}, {"f": "ὑψηλαῖς", "p": "femininum dativ plural"}, {"f": "ὑψηλήν", "p": "femininum ackusativ singular"}, {"f": "ὑψηλάς", "p": "femininum ackusativ plural"}, {"f": "ὑψηλά", "p": "neutrum nominativ plural"}],
  "ὕδωρ": [{"f": "ὕδωρ", "p": "nominativ singular"}, {"f": "ὕδατα", "p": "nominativ plural"}, {"f": "ὕδατος", "p": "genitiv singular"}, {"f": "ὑδάτων", "p": "genitiv plural"}, {"f": "ὕδατι", "p": "dativ singular"}, {"f": "ὕδασι(ν)", "p": "dativ plural"}],
  "ὥρα": [{"f": "ὥρα", "p": "nominativ singular"}, {"f": "ὧραι", "p": "nominativ plural"}, {"f": "ὥρας", "p": "genitiv singular"}, {"f": "ὡρῶν", "p": "genitiv plural"}, {"f": "ὥρᾳ", "p": "dativ singular"}, {"f": "ὥραις", "p": "dativ plural"}, {"f": "ὥραν", "p": "ackusativ singular"}]
};

const SEMINARIER = [2, 3, 4, 5, 6, 7, 8, 9, 10];
const ORDKLASSER = [...new Set(GLOSOR.map(w => w.o))];   // i förekomstordning
const DECKS = [
  { id:"sem", namn:"Seminarium 2–10", desc:"Kursens ordlistor, seminarium 2–10." },
  { id:"60",  namn:"NT-frekvens > 60", desc:"Alla ord som förekommer fler än 60 ggr i NT (244 ord)." },
  { id:"prov", namn:"Inför provet", desc:"Ordkunskapslistan inför tentamen (Oskars ORDKUNSKAP 1–10): subjunktioner, verb, substantiv, adjektiv, prepositioner och småord som ska kunnas utantill." },
];
const BAND = [
  { id:"500", namn:"≥ 500",   test:f => f >= 500 },
  { id:"200", namn:"200–499", test:f => f >= 200 && f < 500 },
  { id:"100", namn:"100–199", test:f => f >= 100 && f < 200 },
  { id:"0",   namn:"< 100",   test:f => f <  100 },
];
const BAND_IDS = BAND.map(b => b.id);
const DECK_IDS = DECKS.map(d => d.id);
const ARTIKEL = { m: "ὁ", f: "ἡ", n: "τό" };
const GENUS_NAMN = { m: "maskulinum", f: "femininum", n: "neutrum" };
const LAGER = "grek-glosspel-v1";

/* ── STATE ───────────────────────────────────────────────────────────── */
const state = {
  mode: "flashcard",                              // "flashcard" | "flerval" | "former"
  deck: "sem",                                    // "sem" | "60"
  valdaSem: new Set(SEMINARIER),
  valdaBand: new Set(BAND_IDS),
  valdaOk:  new Set(ORDKLASSER),
  streak: 0,
  best: { flashcard: 0, flerval: 0, former: 0 },
  ratt: 0, totalt: 0,                             // sessionsräknare
  card: null,                                     // upplöst EN gång i newQuestion()
  vand: false,                                    // flashcard: är kortet vänt?
  besvarad: false,                                // flerval: har man svarat?
  rk: { ko: [], kvar: 0, forra: null, forraRen: true, bas: null },  // rundkö (glosmodell)
};

/* ── HJÄLPARE ────────────────────────────────────────────────────────── */
function shuffle(arr){                            // Fisher-Yates
  const a = arr.slice();
  for(let i=a.length-1;i>0;i--){ const j=Math.floor(Math.random()*(i+1)); [a[i],a[j]]=[a[j],a[i]]; }
  return a;
}
function harParadigm(w){ return !!FORMER[w.l]; }
function basAktiva(){
  if(state.deck === "60"){
    return GLOSOR.filter(w =>
      w.d.includes("60") &&
      state.valdaOk.has(w.o) &&
      BAND.some(b => state.valdaBand.has(b.id) && b.test(w.f))
    );
  }
  if(state.deck === "prov"){
    return GLOSOR.filter(w =>
      w.d.includes("prov") &&
      state.valdaOk.has(w.o)
    );
  }
  return GLOSOR.filter(w =>
    w.d.includes("sem") &&
    w.s.some(s => state.valdaSem.has(s)) &&
    state.valdaOk.has(w.o)
  );
}
// I Former-läget kan bara ord med fullt paradigm spelas.
function aktivaOrd(){
  const bas = basAktiva();
  return state.mode === "former" ? bas.filter(harParadigm) : bas;
}

/* ── PERSISTENS (localStorage, try/catch) ────────────────────────────── */
function spara(){
  try{
    localStorage.setItem(LAGER, JSON.stringify({
      mode: state.mode,
      deck: state.deck,
      valdaSem:  [...state.valdaSem],
      valdaBand: [...state.valdaBand],
      valdaOk:   [...state.valdaOk],
      best: state.best,
    }));
  }catch(e){ /* privat läge e.d. — strunt samma */ }
}
function ladda(){
  try{
    const r = JSON.parse(localStorage.getItem(LAGER));
    if(!r) return;
    if(["flashcard", "flerval", "former"].includes(r.mode)) state.mode = r.mode;
    if(DECK_IDS.includes(r.deck)) state.deck = r.deck;
    if(Array.isArray(r.valdaSem))  state.valdaSem  = new Set(r.valdaSem.filter(s => SEMINARIER.includes(s)));
    if(Array.isArray(r.valdaBand)) state.valdaBand = new Set(r.valdaBand.filter(b => BAND_IDS.includes(b)));
    if(Array.isArray(r.valdaOk))   state.valdaOk   = new Set(r.valdaOk.filter(o => ORDKLASSER.includes(o)));
    if(r.best && typeof r.best === "object"){
      if(typeof r.best.flashcard === "number") state.best.flashcard = r.best.flashcard;
      if(typeof r.best.flerval   === "number") state.best.flerval   = r.best.flerval;
      if(typeof r.best.former    === "number") state.best.former    = r.best.former;
    }
    if(!state.valdaSem.size)  state.valdaSem  = new Set(SEMINARIER);
    if(!state.valdaBand.size) state.valdaBand = new Set(BAND_IDS);
    if(!state.valdaOk.size)   state.valdaOk   = new Set(ORDKLASSER);
  }catch(e){ /* trasig data — börja om rent */ }
}

/* ── DISTRAKTORER ────────────────────────────────────────────────────── */
/* Samma ordklass i första hand, och helst inom samma frekvensband: vi
   sorterar kandidaterna efter närhet i log-frekvens, tar de närmaste och
   blandar bland dem. Räcker inte samma ordklass faller vi tillbaka på alla. */
function byggOptioner(svar){
  const aktiva = aktivaOrd();
  const lf = w => (w.f && w.f > 0) ? Math.log(w.f) : 0;
  const sammaOk = aktiva.filter(w => w.l !== svar.l && w.o === svar.o && w.g !== svar.g);
  let pool;
  if(sammaOk.length >= 3){
    const nara = sammaOk.slice().sort((a,b) => Math.abs(lf(a)-lf(svar)) - Math.abs(lf(b)-lf(svar)));
    pool = shuffle(nara.slice(0, Math.min(7, nara.length)));     // de ~7 närmaste i frekvens
  }else{
    // för få i samma ordklass → komplettera med övriga
    const ovriga = aktiva.filter(w => w.l !== svar.l && w.g !== svar.g && !sammaOk.includes(w));
    pool = sammaOk.concat(shuffle(ovriga));
  }
  // unika glosor (skydd mot dubblettöversättningar)
  const distraktorer = [];
  const sedda = new Set([svar.g]);
  for(const w of pool){
    if(sedda.has(w.g)) continue;
    sedda.add(w.g); distraktorer.push(w.g);
    if(distraktorer.length === 3) break;
  }
  return shuffle([svar.g, ...distraktorer]);
}

/* ── KORTLOGIK ───────────────────────────────────────────────────────────
   Rundkö (glosmodell, som satsanalys) i BÅDA lägen: gå igenom orden en gång;
   ett ord som missas läggs sist och återkommer inom rundan; tom kö → ny
   omblandad runda. Fylls om automatiskt när ordurvalet ändras. "kvar i rundan"
   räknar distinkta ord kvar att klara. */
function rkSig(){ return aktivaOrd().map(w => w.l).join(""); }
function fyllKo(){ const ids = aktivaOrd().map(w => w.l); state.rk.ko = shuffle(ids); state.rk.kvar = ids.length; state.rk.bas = rkSig(); }
function rkNasta(){
  const rk = state.rk;
  if(rk.bas !== rkSig()){ rk.forra = null; rk.forraRen = true; fyllKo(); }
  else { if(rk.forra != null && !rk.forraRen) rk.ko.push(rk.forra); if(!rk.ko.length) fyllKo(); }
  let id = rk.ko.shift();
  if(id === rk.forra && rk.ko.length){ rk.ko.push(id); id = rk.ko.shift(); }
  rk.forra = id; rk.forraRen = false;
  return id;
}
function rkKlarad(){ const rk = state.rk; if(!rk.forraRen){ rk.forraRen = true; rk.kvar = Math.max(0, rk.kvar - 1); } }
function newQuestion(){
  const aktiva = aktivaOrd();
  state.vand = false;
  state.besvarad = false;

  if(!aktiva.length){ state.card = null; render(); return; }

  const _id = rkNasta();
  const svar = aktiva.find(w => w.l === _id) || aktiva[0];
  if(state.mode === "flashcard"){
    state.card = { svar, sida: "fram" };
  }else if(state.mode === "former"){
    state.card = { svar, form: slumpform(svar.l) };
  }else{
    state.card = { svar, optioner: byggOptioner(svar) };
  }
  render();
}
function slumpform(lemma){
  const fs = FORMER[lemma];
  return fs[Math.floor(Math.random() * fs.length)];
}

/* ── BEDÖMNING ───────────────────────────────────────────────────────── */
function bokfor(korrekt){
  state.totalt++;
  if(korrekt){ state.ratt++; state.streak++; if(state.streak > state.best[state.mode]) state.best[state.mode] = state.streak; }
  else { state.streak = 0; }
  spara();
}
function flashcardSvar(kunde){
  if(!state.vand) return;
  bokfor(kunde);
  if(kunde) rkKlarad();                           // rätt → ur rundan; fel → återköas
  newQuestion();
}
function flervalSvar(valdGlosa, knapp){
  if(state.besvarad) return;
  state.besvarad = true;
  const korrekt = valdGlosa === state.card.svar.g;
  bokfor(korrekt);
  if(korrekt) rkKlarad();
  renderFlervalFacit(knapp, korrekt);
}

/* ── RENDER ──────────────────────────────────────────────────────────── */
function lemmaHTML(w){
  // substantiv lärs in med artikel (genus): ὁ ἄγγελος, ἡ ἀγάπη, τό αἷμα
  if(w.o === "substantiv" && w.gen){
    return `<span class="art-pre">${ARTIKEL[w.gen]}</span>${w.l}`;
  }
  return w.l;
}
function metaRad(w){
  const delar = [w.o];
  if(w.o === "substantiv" && w.gen) delar.push(GENUS_NAMN[w.gen]);
  return delar.join(" · ");
}

function render(){
  const card = document.getElementById("card");
  const controls = document.getElementById("controls");
  const stats = document.getElementById("stats");
  card.className = "card";
  controls.innerHTML = "";

  // mode-knapparnas tryckläge + spärrar (flerval <4 ord, former = inga paradigm)
  const bas = basAktiva();
  const formerAntal = bas.filter(harParadigm).length;
  document.getElementById("mode-flashcard").setAttribute("aria-pressed", state.mode === "flashcard");
  document.getElementById("mode-flerval").setAttribute("aria-pressed", state.mode === "flerval");
  document.getElementById("mode-former").setAttribute("aria-pressed", state.mode === "former");
  document.getElementById("mode-flerval").disabled = bas.length < 4;
  document.getElementById("mode-former").disabled = formerAntal === 0;

  if(!state.card){
    const tips = state.mode === "former"
      ? "Former-läget kräver ord med fullständigt paradigm (substantiv, verb, adjektiv, pronomen). Inget sådant i urvalet."
      : state.deck === "60"
      ? "Välj minst ett frekvensband och en ordklass."
      : state.deck === "prov"
      ? "Välj minst en ordklass."
      : "Välj minst ett seminarium och en ordklass.";
    card.innerHTML = `<div class="empty">Inga ord i urvalet.<br>${tips}</div>`;
    stats.innerHTML = "";
    renderPickerCount();
    return;
  }

  const w = state.card.svar;

  if(state.mode === "flashcard"){
    if(!state.vand){
      card.className = "card flippable";
      card.innerHTML = `<div class="lemma">${lemmaHTML(w)}</div><div class="prompt-hint">tryck på kortet för att vända</div>`;
      card.onclick = () => { state.vand = true; render(); };
    }else{
      card.className = "card flippable";
      card.innerHTML = `
        <div class="reveal">
          <div class="prompt-echo">${lemmaHTML(w)}</div>
          <div class="glosa">${w.g}</div>
          <div class="meta">${metaRad(w)}</div>
        </div>`;
      card.onclick = null;
      const bra = mkBtn("✓ Kunde", "btn good", () => flashcardSvar(true), "→");
      const fel = mkBtn("✗ Kunde inte", "btn bad", () => flashcardSvar(false), "←");
      controls.append(fel, bra);
    }
  }else if(state.mode === "former"){
    const f = state.card.form;
    if(!state.vand){
      card.className = "card flippable";
      card.innerHTML = `<div class="lemma">${f.f}</div><div class="prompt-hint">vilken glosa? tryck för att vända</div>`;
      card.onclick = () => { state.vand = true; render(); };
    }else{
      card.className = "card flippable";
      card.innerHTML = `
        <div class="reveal">
          <div class="prompt-echo">${f.f}</div>
          <div class="former-parse">${f.p}</div>
          <div class="glosa">${lemmaHTML(w)}</div>
          <div class="meta">${w.g}</div>
        </div>`;
      card.onclick = null;
      const bra = mkBtn("✓ Kunde", "btn good", () => flashcardSvar(true), "→");
      const fel = mkBtn("✗ Kunde inte", "btn bad", () => flashcardSvar(false), "←");
      controls.append(fel, bra);
    }
  }else{
    card.className = "card";
    card.onclick = null;
    card.innerHTML = `<div class="lemma">${lemmaHTML(w)}</div>`;
    renderOptioner();
  }

  renderStats();
  renderPickerCount();
}

function renderOptioner(){
  const card = document.getElementById("card");
  const grid = document.createElement("div");
  // "no-hover" tas bort vid första muspekarrörelsen: annars får alternativet
  // under en stilla pekare (efter tangentbords-Nästa) en gyllene spökhover-ram.
  grid.className = "options no-hover";
  grid.addEventListener("pointermove", () => grid.classList.remove("no-hover"), { once: true });
  state.card.optioner.forEach((glosa, i) => {
    const b = document.createElement("button");
    b.className = "opt";
    b.textContent = glosa;
    b.dataset.glosa = glosa;
    b.onclick = () => flervalSvar(glosa, b);
    grid.appendChild(b);
  });
  card.appendChild(grid);
}
function renderFlervalFacit(valdKnapp, korrekt){
  const knappar = document.querySelectorAll(".opt");
  knappar.forEach(b => {
    b.disabled = true;
    if(b.dataset.glosa === state.card.svar.g) b.classList.add("correct");
    else if(b === valdKnapp) b.classList.add("wrong");
  });
  // grön/amber ram (nollställs när nästa fråga sätter card.className)
  const card = document.getElementById("card");
  card.classList.toggle("svar-ratt", korrekt);
  card.classList.toggle("svar-fel", !korrekt);
  const controls = document.getElementById("controls");
  controls.innerHTML = "";
  controls.appendChild(mkBtn("Nästa", "btn primary", () => newQuestion()));
  renderStats();
}

function mkBtn(text, cls, fn, key){
  const b = document.createElement("button");
  b.className = cls;
  b.innerHTML = key ? `${text}<span class="key">${key}</span>` : text;
  b.onclick = fn;
  return b;
}

function renderStats(){
  const stats = document.getElementById("stats");
  const b = state.best[state.mode];
  const andel = state.totalt ? Math.round(100*state.ratt/state.totalt) : 0;
  stats.innerHTML =
    `Svit: <b>${state.streak}</b> i rad` +
    `<span class="dot">·</span>Bästa: <b>${b}</b>` +
    `<span class="dot">·</span><b>${state.rk.kvar}</b> kvar i rundan` +
    `<span class="dot">·</span>Session: <b>${state.ratt}/${state.totalt}</b> (${andel}%)`;
}

/* ── VÄLJAREN ────────────────────────────────────────────────────────── */
function renderPickerCount(){
  document.getElementById("picker-count").textContent = `(${aktivaOrd().length} ord)`;
}
function antalForSem(s){ return GLOSOR.filter(w => w.d.includes("sem") && w.s.includes(s)).length; }
function antalForBand(bid){ const b = BAND.find(x => x.id === bid); return GLOSOR.filter(w => w.d.includes("60") && b.test(w.f)).length; }
function antalForOk(o){
  return GLOSOR.filter(w => w.d.includes(state.deck) && w.o === o).length;
}

function byggPicker(){
  // Kortlek (enkelval)
  const deckGrid = document.getElementById("deck-grid");
  DECKS.forEach(d => {
    const b = document.createElement("button");
    b.className = "toggle"; b.dataset.deck = d.id; b.textContent = d.namn;
    b.setAttribute("aria-pressed", state.deck === d.id);
    b.onclick = () => setDeck(d.id);
    deckGrid.appendChild(b);
  });
  // Seminarium
  const semGrid = document.getElementById("sem-grid");
  SEMINARIER.forEach(s => {
    const b = document.createElement("button");
    b.className = "toggle";
    b.innerHTML = `Sem ${s}<span class="n">${antalForSem(s)}</span>`;
    b.setAttribute("aria-pressed", state.valdaSem.has(s));
    b.onclick = () => { toggleSet(state.valdaSem, s); b.setAttribute("aria-pressed", state.valdaSem.has(s)); efterUrval(); };
    semGrid.appendChild(b);
  });
  // Frekvensband
  const bandGrid = document.getElementById("band-grid");
  BAND.forEach(bd => {
    const b = document.createElement("button");
    b.className = "toggle";
    b.innerHTML = `${bd.namn}<span class="n">${antalForBand(bd.id)}</span>`;
    b.setAttribute("aria-pressed", state.valdaBand.has(bd.id));
    b.onclick = () => { toggleSet(state.valdaBand, bd.id); b.setAttribute("aria-pressed", state.valdaBand.has(bd.id)); efterUrval(); };
    bandGrid.appendChild(b);
  });
  // Ordklass
  const okGrid = document.getElementById("ok-grid");
  ORDKLASSER.forEach(o => {
    const b = document.createElement("button");
    b.className = "toggle"; b.dataset.ok = o;
    b.innerHTML = `${o}<span class="n">${antalForOk(o)}</span>`;
    b.setAttribute("aria-pressed", state.valdaOk.has(o));
    b.onclick = () => { toggleSet(state.valdaOk, o); b.setAttribute("aria-pressed", state.valdaOk.has(o)); efterUrval(); };
    okGrid.appendChild(b);
  });
  uppdateraDackVy();
}

function setDeck(id){
  if(state.deck === id) return;
  state.deck = id;
  uppdateraDackVy();
  efterUrval();
}

function uppdateraDackVy(){
  document.getElementById("sem-section").hidden  = state.deck !== "sem";
  document.getElementById("band-section").hidden = state.deck !== "60";
  const d = DECKS.find(x => x.id === state.deck);
  document.querySelectorAll("#deck-grid .toggle").forEach(b =>
    b.setAttribute("aria-pressed", b.dataset.deck === state.deck));
  document.getElementById("deck-desc").textContent = d.desc;
  uppdateraSubtitle();
  document.querySelectorAll("#ok-grid .toggle").forEach(b => {
    const n = b.querySelector(".n");
    if(n) n.textContent = antalForOk(b.dataset.ok);
  });
}
function uppdateraSubtitle(){
  const dackNamn = state.deck === "60" ? "NT-frekvens > 60"
    : state.deck === "prov" ? "inför provet"
    : "seminarium 2–10";
  const riktning = state.mode === "former" ? "böjd form → glosa" : "grekiska → svenska";
  document.getElementById("subtitle").textContent = dackNamn + " · " + riktning;
}
function toggleSet(set, v){ set.has(v) ? set.delete(v) : set.add(v); }
function synkaToggles(){
  document.querySelectorAll("#sem-grid .toggle").forEach((b,i) =>
    b.setAttribute("aria-pressed", state.valdaSem.has(SEMINARIER[i])));
  document.querySelectorAll("#band-grid .toggle").forEach((b,i) =>
    b.setAttribute("aria-pressed", state.valdaBand.has(BAND_IDS[i])));
  document.querySelectorAll("#ok-grid .toggle").forEach((b,i) =>
    b.setAttribute("aria-pressed", state.valdaOk.has(ORDKLASSER[i])));
}
function efterUrval(){
  // urvalet ändrades → ny runda/kö, fallback från flerval/former om orden tryter
  const bas = basAktiva();
  document.getElementById("picker-note").textContent =
    bas.length < 4 ? "Färre än 4 ord — flerval är avstängt. Flashcard fungerar." : "";
  if(state.mode === "flerval" && bas.length < 4) state.mode = "flashcard";
  if(state.mode === "former" && !bas.some(harParadigm)) state.mode = "flashcard";
  state.streak = 0;
  fyllKo();
  spara();
  newQuestion();
}

/* ── EVENTS ──────────────────────────────────────────────────────────── */
function setMode(m){
  if(m === "flerval" && basAktiva().length < 4) return;
  if(m === "former" && !basAktiva().some(harParadigm)) return;
  state.mode = m;
  state.streak = 0;
  if(m !== "flerval") fyllKo();                   // flashcard/former kör rundkö direkt
  uppdateraSubtitle();
  spara();
  newQuestion();
}
document.getElementById("mode-flashcard").onclick = () => setMode("flashcard");
document.getElementById("mode-flerval").onclick   = () => setMode("flerval");
document.getElementById("mode-former").onclick    = () => setMode("former");

document.getElementById("picker-toggle").onclick = (e) => {
  const t = e.currentTarget;
  const open = t.getAttribute("aria-expanded") === "true";
  t.setAttribute("aria-expanded", !open);
  document.getElementById("picker-body").hidden = open;
};
document.querySelectorAll("[data-quick]").forEach(btn => {
  btn.onclick = () => {
    const q = btn.dataset.quick;
    if(q === "sem-all")   state.valdaSem  = new Set(SEMINARIER);
    if(q === "sem-none")  state.valdaSem  = new Set();
    if(q === "band-all")  state.valdaBand = new Set(BAND_IDS);
    if(q === "band-none") state.valdaBand = new Set();
    if(q === "ok-all")    state.valdaOk   = new Set(ORDKLASSER);
    if(q === "ok-none")   state.valdaOk   = new Set();
    synkaToggles(); efterUrval();
  };
});

__kh = (e) => {
  if(e.target.closest(".picker")) return;
  if(state.mode !== "flerval"){                   // flashcard + former: samma tangenter
    if(e.code === "Space"){ e.preventDefault();
      if(!state.vand){ state.vand = true; render(); } }
    else if(state.vand && (e.code === "ArrowRight" || e.key === "Enter")){ e.preventDefault(); flashcardSvar(true); }
    else if(state.vand && e.code === "ArrowLeft"){ e.preventDefault(); flashcardSvar(false); }
  }else{
    if(state.besvarad && (e.code === "Space" || e.key === "Enter")){ e.preventDefault(); newQuestion(); }
    else if(!state.besvarad && /^[1-4]$/.test(e.key)){
      const knapp = document.querySelectorAll(".opt")[+e.key - 1];
      if(knapp) flervalSvar(knapp.dataset.glosa, knapp);
    }
  }
};
  document.addEventListener("keydown", __kh);;

/* ── INIT ────────────────────────────────────────────────────────────── */
ladda();
// Djuplänk från provöversikten: token är antingen ett kortlek-id (#/glosor/prov) eller ett läge.
if(DECK_IDS.includes(opts.mode)) state.deck = opts.mode;
if(["flashcard","flerval","former"].includes(opts.mode)) state.mode = opts.mode;
if(state.mode === "former" && !basAktiva().some(harParadigm)) state.mode = "flashcard";
byggPicker();
if(state.mode !== "flerval") fyllKo();
newQuestion();

}
