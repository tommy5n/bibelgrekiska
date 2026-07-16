// Vy: Uppslagsbok — slå upp och bläddra kursens ord. Söker på grekisk form
// (accent-/versalokänsligt) och svensk översättning; urval via delad picker.
// Data: inbäddad snapshot ur json/glosor.json + prepositioner.json — regenereras
// med scripts/gen_ordbok_snapshot.py (handunderhåll aldrig ORDBOK-arrayen).
export function teardown(){ /* inga dokumentnivå-lyssnare — sök/klick sitter i root */ }

const CSS = `
.vy-ordbok{ --fs-lemma:1.5rem; --fs-glosa:1.06rem; --fs-meta:0.9rem; }
.vy-ordbok header{ text-align:center; margin:0 0 0.6rem; }
.vy-ordbok .sok-rad{ position:sticky; top:0; z-index:5; display:flex; gap:0.5rem;
  padding:0.5rem 0 0.7rem; background:linear-gradient(var(--paper) 78%, transparent); }
.vy-ordbok #sok{ flex:1; font:inherit; font-size:1.05rem; padding:0.6rem 0.8rem;
  border:1px solid var(--line); border-radius:0.6rem; background:var(--card); color:var(--ink); }
.vy-ordbok #sok:focus{ outline:2px solid var(--gold); outline-offset:1px; border-color:var(--gold); }
.vy-ordbok #sok-rensa{ font:inherit; font-size:1.1rem; line-height:1; width:2.6rem;
  border:1px solid var(--line); border-radius:0.6rem; background:var(--card); color:var(--ink-soft); cursor:pointer; }
.vy-ordbok #sok-rensa:hover{ color:var(--ink); }
.vy-ordbok .traff-antal{ color:var(--ink-soft); font-size:var(--fs-meta); margin:0.1rem 0 0.5rem; }
.vy-ordbok .resultat{ display:flex; flex-direction:column; gap:0.15rem; }
.vy-ordbok .ord{ padding:0.6rem 0.2rem; border-bottom:1px solid var(--line); }
.vy-ordbok .rad1{ display:flex; align-items:baseline; gap:0.6rem; }
.vy-ordbok .lemma{ font-size:var(--fs-lemma); font-weight:600; color:var(--ink); }
.vy-ordbok .git{ color:var(--ink-soft); font-weight:400; }
.vy-ordbok .frek{ margin-left:auto; flex:none; font-size:0.8rem; color:var(--ink-soft);
  background:var(--paper-2); border-radius:1rem; padding:0.05rem 0.55rem; white-space:nowrap; }
.vy-ordbok .glosa{ font-size:var(--fs-glosa); color:var(--ink); margin:0.15rem 0 0.25rem; }
.vy-ordbok .meta{ display:flex; flex-wrap:wrap; align-items:center; gap:0.35rem 0.6rem;
  font-size:var(--fs-meta); color:var(--ink-soft); }
.vy-ordbok .ok{ color:var(--gold); }
.vy-ordbok .rekt{ color:var(--ink-soft); }
.vy-ordbok .rekt b{ color:var(--ink); font-weight:600; }
.vy-ordbok .semtag{ font-size:0.78rem; background:var(--paper-2); color:var(--ink-soft);
  border-radius:0.4rem; padding:0.02rem 0.4rem; }
.vy-ordbok .not{ font-style:italic; }
.vy-ordbok .tomt{ text-align:center; color:var(--ink-soft); padding:2rem 0; }
.vy-ordbok .picker{ margin-top:0.4rem; }
`;

const MARKUP = `<div class="vy vy-ordbok">
<style>${CSS}</style>
<header>
  <h1>Bibelgrekiska — uppslagsbok</h1>
  <div class="sub" id="subtitle"></div>
</header>

<div class="sok-rad">
  <input id="sok" type="search" placeholder="Sök grekiskt ord eller översättning…"
    autocomplete="off" autocapitalize="off" autocorrect="off" spellcheck="false" aria-label="Sök" />
  <button id="sok-rensa" type="button" aria-label="Rensa sökning">×</button>
</div>
<div class="traff-antal" id="traff-antal"></div>

<div class="picker">
  <button class="picker-toggle" id="picker-toggle" aria-expanded="false">
    <span>Anpassa urvalet <span class="count" id="picker-count"></span></span>
    <span class="chev">▾</span>
  </button>
  <div class="picker-body" id="picker-body" hidden>
    <div class="picker-section">
      <h2>Lista</h2>
      <div class="grid deck-grid" id="deck-grid"></div>
      <div class="deck-desc" id="deck-desc"></div>
    </div>
    <div class="picker-section" id="sem-section" hidden>
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

<div class="resultat" id="resultat"></div>
</div>`;

export function render(root){
  root.innerHTML = MARKUP;

/* ── DATA (snapshot ur glosor.json + prepositioner.json; korta nycklar, se generatorn) ─ */
const ORDBOK = [
  {"l": "ἀγαθός", "g": "god", "o": "adjektiv", "gen": null, "f": 101, "s": [3, 4, 5], "d": ["sem", "60"]},
  {"l": "ἀγαπάω", "g": "älska", "o": "verb", "gen": null, "f": 143, "s": [], "d": ["60"]},
  {"l": "ἀγάπη", "g": "kärlek", "o": "substantiv", "gen": "f", "f": 116, "s": [4], "d": ["sem", "60"]},
  {"l": "ἄγγελος", "g": "budbärare, ängel", "o": "substantiv", "gen": "m", "f": 175, "s": [2, 3, 6], "d": ["sem", "60"]},
  {"l": "ἅγιος", "g": "helig, vördnadsvärd", "o": "adjektiv", "gen": null, "f": 233, "s": [3], "d": ["sem", "60"]},
  {"l": "ἀδελφός", "g": "bror", "o": "substantiv", "gen": "m", "f": 342, "s": [2, 3, 4, 5, 7], "d": ["sem", "60"]},
  {"l": "αἷμα", "g": "blod", "o": "substantiv", "gen": "n", "f": 97, "s": [], "d": ["60"]},
  {"l": "αἴρω", "g": "ta upp, lyfta, höja", "o": "verb", "gen": null, "f": 101, "s": [], "d": ["60"]},
  {"l": "αἰτέω", "g": "bedja, begära, kräva", "o": "verb", "gen": null, "f": 70, "s": [5, 7], "d": ["sem", "60"]},
  {"l": "αἰών", "g": "evighet", "o": "substantiv", "gen": "m", "f": 122, "s": [], "d": ["60"], "git": "αἰῶνος"},
  {"l": "αἰώνιος", "g": "evig", "o": "adjektiv", "gen": null, "f": 69, "s": [5], "d": ["sem", "60"]},
  {"l": "ἀκολουθέω", "g": "följa", "o": "verb", "gen": null, "f": 89, "s": [], "d": ["60"]},
  {"l": "ἀκούω", "g": "höra, lyssna", "o": "verb", "gen": null, "f": 427, "s": [2, 3, 5, 7], "d": ["sem", "60"]},
  {"l": "ἀλήθεια", "g": "sanning", "o": "substantiv", "gen": "f", "f": 109, "s": [4, 5, 6], "d": ["sem", "60"]},
  {"l": "ἀλλά", "g": "utan, men, dock", "o": "partikel", "gen": null, "f": 638, "s": [5], "d": ["sem", "60"]},
  {"l": "ἀλλήλων", "g": "varandra", "o": "pron.adj", "gen": null, "f": 100, "s": [], "d": ["60"]},
  {"l": "ἄλλος", "g": "annan, annat", "o": "pron.adj", "gen": null, "f": 154, "s": [], "d": ["60"]},
  {"l": "ἁμαρτία", "g": "synd", "o": "substantiv", "gen": "f", "f": 172, "s": [7], "d": ["sem", "60"], "not": "”misstag” i klassisk grekiska"},
  {"l": "ἀμήν", "g": "amen, sannerligen", "o": "partikel", "gen": null, "f": 128, "s": [], "d": ["60"], "not": "hebreiska"},
  {"l": "ἄν", "g": "modalpartikel", "o": "partikel", "gen": null, "f": 171, "s": [], "d": ["60"]},
  {"l": "ἀναβαίνω", "g": "stiga upp, gå upp", "o": "verb", "gen": null, "f": 81, "s": [], "d": ["60"]},
  {"l": "ἀνήρ", "g": "man", "o": "substantiv", "gen": "m", "f": 216, "s": [], "d": ["60"], "git": "ἀνδρός"},
  {"l": "ἄνθρωπος", "g": "människa", "o": "substantiv", "gen": "m", "f": 550, "s": [2, 5, 7], "d": ["sem", "60"]},
  {"l": "ἀνίστημι", "g": "resa upp, resa sig, uppträda", "o": "verb", "gen": null, "f": 108, "s": [], "d": ["60"]},
  {"l": "ἀνοίγω", "g": "öppna", "o": "verb", "gen": null, "f": 77, "s": [], "d": ["60"]},
  {"l": "ἀπέρχομαι", "g": "gå bort, bege sig", "o": "verb", "gen": null, "f": 117, "s": [], "d": ["60"]},
  {"l": "ἀπό", "g": "från, av", "o": "preposition", "gen": null, "f": 644, "s": [5], "d": ["sem", "60"], "rekt": [["gen", "från, av"]]},
  {"l": "ἀποθνῄσκω", "g": "dö", "o": "verb", "gen": null, "f": 111, "s": [], "d": ["60"]},
  {"l": "ἀποκρίνομαι", "g": "svara", "o": "verb", "gen": null, "f": 232, "s": [], "d": ["60"]},
  {"l": "ἀποκτείνω", "g": "döda", "o": "verb", "gen": null, "f": 74, "s": [], "d": ["60"]},
  {"l": "ἀπόλλυμι", "g": "förlora, förgöra", "o": "verb", "gen": null, "f": 90, "s": [], "d": ["60"]},
  {"l": "ἀποστέλλω", "g": "sända ut, skicka", "o": "verb", "gen": null, "f": 132, "s": [], "d": ["60"]},
  {"l": "ἀπόστολος", "g": "sändebud, apostel", "o": "substantiv", "gen": "m", "f": 79, "s": [2, 6], "d": ["sem", "60"]},
  {"l": "ἄρτος", "g": "bröd", "o": "substantiv", "gen": "m", "f": 97, "s": [3, 4, 5], "d": ["sem", "60"]},
  {"l": "ἀρχιερεύς", "g": "överstepräst", "o": "substantiv", "gen": "m", "f": 122, "s": [], "d": ["60"]},
  {"l": "ἄρχω", "g": "börja, härska över", "o": "verb", "gen": null, "f": 86, "s": [], "d": ["60"]},
  {"l": "αὐτός", "g": "han, hon, den, det", "o": "pronomen", "gen": null, "f": 5546, "s": [6, 7], "d": ["sem", "60"]},
  {"l": "βάλλω", "g": "kasta, lägga, sätta", "o": "verb", "gen": null, "f": 121, "s": [7], "d": ["sem", "60"]},
  {"l": "βαπτίζω", "g": "döpa", "o": "verb", "gen": null, "f": 77, "s": [3, 6, 7], "d": ["sem", "60"], "not": "av βάπτω ”indoppa”"},
  {"l": "βασιλεία", "g": "rike", "o": "substantiv", "gen": "f", "f": 162, "s": [4], "d": ["sem", "60"]},
  {"l": "βασιλεύς", "g": "kung", "o": "substantiv", "gen": "m", "f": 115, "s": [], "d": ["60"]},
  {"l": "βλέπω", "g": "se, titta", "o": "verb", "gen": null, "f": 133, "s": [2, 3, 5, 7], "d": ["sem", "60"]},
  {"l": "γάρ", "g": "ty, för, ju", "o": "partikel", "gen": null, "f": 1039, "s": [4, 5], "d": ["sem", "60"]},
  {"l": "γεννάω", "g": "föda, avla, framkalla", "o": "verb", "gen": null, "f": 97, "s": [], "d": ["60"]},
  {"l": "γῆ", "g": "jord", "o": "substantiv", "gen": "f", "f": 248, "s": [5], "d": ["sem", "60"]},
  {"l": "γίνομαι", "g": "bli, födas, uppstå", "o": "verb", "gen": null, "f": 667, "s": [], "d": ["60"]},
  {"l": "γινώσκω", "g": "känna, veta, förstå, inse", "o": "verb", "gen": null, "f": 221, "s": [], "d": ["60"]},
  {"l": "γραμματεύς", "g": "skrivare, skriftlärd", "o": "substantiv", "gen": "m", "f": 62, "s": [], "d": ["60"]},
  {"l": "γράφω", "g": "skriva, rita", "o": "verb", "gen": null, "f": 190, "s": [2, 3, 5, 7], "d": ["sem", "60"]},
  {"l": "γυνή", "g": "kvinna", "o": "substantiv", "gen": "f", "f": 212, "s": [], "d": ["60"], "git": "γυναικός"},
  {"l": "δαιμόνιον", "g": "ond ande, demon", "o": "substantiv", "gen": "n", "f": 63, "s": [5, 7], "d": ["sem", "60"]},
  {"l": "δέ", "g": "och, men", "o": "partikel", "gen": null, "f": 2766, "s": [5, 6], "d": ["sem", "60"]},
  {"l": "δεῖ", "g": "man måste, det åligger", "o": "verb", "gen": null, "f": null, "s": [], "d": []},
  {"l": "διά", "g": "genom; på grund av", "o": "preposition", "gen": null, "f": 666, "s": [5, 7], "d": ["sem", "60"], "rekt": [["gen", "genom"], ["ack", "på grund av"]]},
  {"l": "διδάσκω", "g": "undervisa, lära", "o": "verb", "gen": null, "f": 96, "s": [7], "d": ["sem", "60"]},
  {"l": "δίδωμι", "g": "ge", "o": "verb", "gen": null, "f": 415, "s": [], "d": ["60"]},
  {"l": "δίκαιος", "g": "rättvis, rättfärdig", "o": "adjektiv", "gen": null, "f": 79, "s": [4, 5], "d": ["sem", "60"]},
  {"l": "δικαιοσύνη", "g": "rättvisa, rättfärdighet", "o": "substantiv", "gen": "f", "f": 91, "s": [5], "d": ["sem", "60"]},
  {"l": "δόξα", "g": "ära, heder; glans", "o": "substantiv", "gen": "f", "f": 165, "s": [5], "d": ["sem", "60"]},
  {"l": "δοῦλος", "g": "tjänare, slav", "o": "substantiv", "gen": "m", "f": 126, "s": [2, 3, 4, 5, 7], "d": ["sem", "60"]},
  {"l": "δύναμαι", "g": "kunna, förmå", "o": "verb", "gen": null, "f": 209, "s": [], "d": ["60"]},
  {"l": "δύναμις", "g": "förmåga, makt, kraft", "o": "substantiv", "gen": "f", "f": 119, "s": [], "d": ["60"]},
  {"l": "δύο", "g": "två", "o": "räkneord", "gen": null, "f": 135, "s": [], "d": ["60"]},
  {"l": "δώδεκα", "g": "tolv", "o": "räkneord", "gen": null, "f": 75, "s": [], "d": ["60"]},
  {"l": "ἐάν", "g": "om", "o": "partikel", "gen": null, "f": 331, "s": [], "d": ["60"]},
  {"l": "ἑαυτοῦ", "g": "sig själv", "o": "pronomen", "gen": null, "f": 333, "s": [], "d": ["60"]},
  {"l": "ἐγείρω", "g": "väcka, låta stå upp", "o": "verb", "gen": null, "f": 143, "s": [6], "d": ["sem", "60"]},
  {"l": "ἐγώ", "g": "jag", "o": "pronomen", "gen": null, "f": 2572, "s": [5, 7], "d": ["sem", "60"]},
  {"l": "ἔθνος", "g": "folkstam, folk, hednafolk", "o": "substantiv", "gen": "n", "f": 160, "s": [], "d": ["60"]},
  {"l": "εἰ", "g": "om", "o": "partikel", "gen": null, "f": 502, "s": [7], "d": ["sem", "60"]},
  {"l": "εἶδον", "g": "jag såg", "o": "verb", "gen": null, "f": null, "s": [], "d": []},
  {"l": "εἰμί", "g": "vara", "o": "verb", "gen": null, "f": 2456, "s": [4, 5, 7], "d": ["sem", "60"]},
  {"l": "εἶπον", "g": "jag sade", "o": "verb", "gen": null, "f": null, "s": [], "d": []},
  {"l": "εἰρήνη", "g": "fred", "o": "substantiv", "gen": "f", "f": 91, "s": [4, 6], "d": ["sem", "60"]},
  {"l": "εἰς", "g": "in i, mot", "o": "preposition", "gen": null, "f": 1754, "s": [4, 5], "d": ["sem", "60"], "rekt": [["ack", "in i, till"]]},
  {"l": "εἷς", "g": "en, ett", "o": "räkneord", "gen": null, "f": 342, "s": [7], "d": ["sem", "60"]},
  {"l": "εἰσέρχομαι", "g": "gå in, komma in", "o": "verb", "gen": null, "f": 193, "s": [], "d": ["60"]},
  {"l": "ἐκ", "g": "ur, ut ur, från", "o": "preposition", "gen": null, "f": 913, "s": [5], "d": ["sem", "60"], "rekt": [["gen", "ur, ut ur"]]},
  {"l": "ἕκαστος", "g": "varje, var och en", "o": "pron.adj", "gen": null, "f": 81, "s": [], "d": ["60"]},
  {"l": "ἐκβάλλω", "g": "kasta ut, förkasta", "o": "verb", "gen": null, "f": 81, "s": [6, 7], "d": ["sem", "60"]},
  {"l": "ἐκεῖ", "g": "där", "o": "adverb", "gen": null, "f": 95, "s": [], "d": ["60"]},
  {"l": "ἐκεῖνος", "g": "den där", "o": "pronomen", "gen": null, "f": 242, "s": [6, 7], "d": ["sem", "60"]},
  {"l": "ἐκκλησία", "g": "församling", "o": "substantiv", "gen": "f", "f": 114, "s": [5, 7], "d": ["sem", "60"]},
  {"l": "ἐμός", "g": "min, mitt", "o": "pron.adj", "gen": null, "f": 76, "s": [7], "d": ["sem", "60"]},
  {"l": "ἐν", "g": "i, med", "o": "preposition", "gen": null, "f": 2733, "s": [4, 5, 7], "d": ["sem", "60"], "rekt": [["dat", "i"]]},
  {"l": "ἐντολή", "g": "bud, budord", "o": "substantiv", "gen": "f", "f": 66, "s": [4, 5], "d": ["sem", "60"]},
  {"l": "ἐνώπιον", "g": "inför", "o": "preposition", "gen": null, "f": 94, "s": [], "d": ["60"]},
  {"l": "ἐξέρχομαι", "g": "gå ut, komma ut", "o": "verb", "gen": null, "f": 216, "s": [], "d": ["60"]},
  {"l": "ἐξουσία", "g": "rätt, fullmakt, myndighet", "o": "substantiv", "gen": "f", "f": 102, "s": [5], "d": ["sem", "60"]},
  {"l": "ἐπί", "g": "på, över, vid, mot", "o": "preposition", "gen": null, "f": 885, "s": [5, 7], "d": ["sem", "60"], "rekt": [["gen", "på, över"], ["dat", "vid"], ["ack", "mot, fram till"]]},
  {"l": "ἑπτά", "g": "sju", "o": "räkneord", "gen": null, "f": 88, "s": [], "d": ["60"]},
  {"l": "ἔργον", "g": "verk, gärning", "o": "substantiv", "gen": "n", "f": 169, "s": [4, 5, 7], "d": ["sem", "60"]},
  {"l": "ἔρχομαι", "g": "gå, komma", "o": "verb", "gen": null, "f": 631, "s": [], "d": ["60"]},
  {"l": "ἐσθίω", "g": "äta", "o": "verb", "gen": null, "f": 157, "s": [2, 3, 4, 7], "d": ["sem", "60"]},
  {"l": "ἕτερος", "g": "annan, övrig", "o": "pron.adj", "gen": null, "f": 97, "s": [], "d": ["60"]},
  {"l": "ἔτι", "g": "ännu, fortfarande", "o": "partikel", "gen": null, "f": 93, "s": [], "d": ["60"]},
  {"l": "εὐαγγέλιον", "g": "glatt budskap, evangelium", "o": "substantiv", "gen": "n", "f": 75, "s": [3, 5], "d": ["sem", "60"]},
  {"l": "εὐθύς", "g": "rakt, genast", "o": "adverb", "gen": null, "f": 59, "s": [], "d": []},
  {"l": "εὑρίσκω", "g": "finna, hitta, påträffa", "o": "verb", "gen": null, "f": 176, "s": [2, 6], "d": ["sem", "60"]},
  {"l": "ἔχω", "g": "ha, hålla, äga", "o": "verb", "gen": null, "f": 706, "s": [], "d": ["60"]},
  {"l": "ἕως", "g": "till dess, förrän", "o": "partikel", "gen": null, "f": 145, "s": [], "d": ["60"]},
  {"l": "ζάω", "g": "leva", "o": "verb", "gen": null, "f": 140, "s": [], "d": ["60"]},
  {"l": "ζητέω", "g": "söka, sträva efter, undersöka", "o": "verb", "gen": null, "f": 117, "s": [4, 5, 6, 7], "d": ["sem", "60"]},
  {"l": "ζωή", "g": "liv", "o": "substantiv", "gen": "f", "f": 135, "s": [], "d": ["60"]},
  {"l": "ἤ", "g": "eller", "o": "partikel", "gen": null, "f": 346, "s": [], "d": ["60"]},
  {"l": "ἦλθον", "g": "jag kom, jag gick", "o": "verb", "gen": null, "f": null, "s": [], "d": []},
  {"l": "ἡμεῖς", "g": "vi", "o": "pronomen", "gen": null, "f": null, "s": [5], "d": ["sem"]},
  {"l": "ἡμέρα", "g": "dag", "o": "substantiv", "gen": "f", "f": 389, "s": [], "d": ["60"]},
  {"l": "θάλασσα", "g": "hav, sjö", "o": "substantiv", "gen": "f", "f": 90, "s": [5], "d": ["sem", "60"]},
  {"l": "θάνατος", "g": "död", "o": "substantiv", "gen": "m", "f": 120, "s": [6], "d": ["sem", "60"]},
  {"l": "θέλημα", "g": "vilja, lust", "o": "substantiv", "gen": "n", "f": 62, "s": [], "d": ["60"]},
  {"l": "θέλω", "g": "vilja, önska", "o": "verb", "gen": null, "f": 208, "s": [7], "d": ["sem", "60"]},
  {"l": "θεός", "g": "gud", "o": "substantiv", "gen": "m", "f": 1307, "s": [2, 3, 5, 7], "d": ["sem", "60"]},
  {"l": "ἴδιος", "g": "egen, eget", "o": "pron.adj", "gen": null, "f": 114, "s": [], "d": ["60"]},
  {"l": "ἰδού", "g": "se!", "o": "interjektion", "gen": null, "f": 200, "s": [], "d": ["60"], "not": "imperativ av εἶδον"},
  {"l": "ἱερόν", "g": "tempel, helgedom", "o": "substantiv", "gen": "n", "f": null, "s": [3, 5], "d": ["sem"]},
  {"l": "ἵνα", "g": "för att", "o": "partikel", "gen": null, "f": 662, "s": [], "d": ["60"]},
  {"l": "ἵστημι", "g": "ställa, stå, bestå", "o": "verb", "gen": null, "f": 153, "s": [], "d": ["60"]},
  {"l": "κάθημαι", "g": "sitta, sätta sig", "o": "verb", "gen": null, "f": 91, "s": [], "d": ["60"]},
  {"l": "καθώς", "g": "som, sådan som", "o": "partikel", "gen": null, "f": 182, "s": [], "d": ["60"]},
  {"l": "καί", "g": "och, också", "o": "partikel", "gen": null, "f": 8973, "s": [4, 5], "d": ["sem", "60"]},
  {"l": "καιρός", "g": "tid, tidpunkt", "o": "substantiv", "gen": "m", "f": 85, "s": [7], "d": ["sem", "60"]},
  {"l": "καλέω", "g": "kalla", "o": "verb", "gen": null, "f": 148, "s": [5], "d": ["sem", "60"]},
  {"l": "καλός", "g": "fin, skön, vacker", "o": "adjektiv", "gen": null, "f": 101, "s": [3, 4], "d": ["sem", "60"]},
  {"l": "καρδία", "g": "hjärta", "o": "substantiv", "gen": "f", "f": 156, "s": [7], "d": ["sem", "60"]},
  {"l": "καρπός", "g": "frukt", "o": "substantiv", "gen": "m", "f": 66, "s": [7], "d": ["sem", "60"]},
  {"l": "κατά", "g": "mot; enligt", "o": "preposition", "gen": null, "f": 469, "s": [5], "d": ["sem", "60"], "rekt": [["gen", "mot, utför"], ["ack", "enligt"]]},
  {"l": "καταβαίνω", "g": "stiga ned, komma ned", "o": "verb", "gen": null, "f": 80, "s": [], "d": ["60"]},
  {"l": "κεφαλή", "g": "huvud", "o": "substantiv", "gen": "f", "f": 75, "s": [], "d": ["60"]},
  {"l": "κόσμος", "g": "värld, världsordning", "o": "substantiv", "gen": "m", "f": 185, "s": [4, 5], "d": ["sem", "60"]},
  {"l": "κρίνω", "g": "döma, bedöma", "o": "verb", "gen": null, "f": 114, "s": [], "d": ["60"]},
  {"l": "κύριος", "g": "herre, härskare", "o": "substantiv", "gen": "m", "f": 713, "s": [2, 4, 5, 7], "d": ["sem", "60"]},
  {"l": "λαλέω", "g": "prata, tala", "o": "verb", "gen": null, "f": 297, "s": [4, 5, 6, 7], "d": ["sem", "60"]},
  {"l": "λαμβάνω", "g": "ta, ta emot, få", "o": "verb", "gen": null, "f": 258, "s": [2], "d": ["sem", "60"]},
  {"l": "λαός", "g": "folk", "o": "substantiv", "gen": "m", "f": 141, "s": [], "d": ["60"]},
  {"l": "λέγω", "g": "tala, säga", "o": "verb", "gen": null, "f": 2345, "s": [2, 3, 5, 6, 7], "d": ["sem", "60"]},
  {"l": "λόγος", "g": "ord, tal, berättelse", "o": "substantiv", "gen": "m", "f": 330, "s": [2, 3, 5, 7], "d": ["sem", "60"]},
  {"l": "μαθητής", "g": "lärjunge", "o": "substantiv", "gen": "m", "f": 262, "s": [5, 6, 7], "d": ["sem", "60"]},
  {"l": "μᾶλλον", "g": "mer, snarare", "o": "adverb", "gen": null, "f": 81, "s": [], "d": ["60"]},
  {"l": "μαρτυρέω", "g": "vittna, intyga", "o": "verb", "gen": null, "f": 76, "s": [5, 7], "d": ["sem", "60"]},
  {"l": "μέγας", "g": "stor, stark", "o": "adjektiv", "gen": null, "f": 240, "s": [7], "d": ["sem", "60"]},
  {"l": "μέλλω", "g": "kommer att", "o": "hjälpverb", "gen": null, "f": 109, "s": [7], "d": ["sem", "60"]},
  {"l": "μένω", "g": "stanna, bli kvar, förbliva", "o": "verb", "gen": null, "f": 118, "s": [7], "d": ["sem", "60"]},
  {"l": "μετά", "g": "med; efter", "o": "preposition", "gen": null, "f": 470, "s": [5, 7], "d": ["sem", "60"], "rekt": [["gen", "med"], ["ack", "efter"]]},
  {"l": "μή", "g": "inte", "o": "negation", "gen": null, "f": 1036, "s": [], "d": ["60"]},
  {"l": "μηδείς", "g": "ingen", "o": "pron.adj", "gen": null, "f": 90, "s": [], "d": ["60"]},
  {"l": "μήτηρ", "g": "mor", "o": "substantiv", "gen": "f", "f": 83, "s": [7], "d": ["sem", "60"], "git": "μητρός"},
  {"l": "μόνος", "g": "ensam, allena", "o": "adjektiv", "gen": null, "f": 110, "s": [3], "d": ["sem", "60"]},
  {"l": "νεκρός", "g": "död, avliden", "o": "adjektiv", "gen": null, "f": 128, "s": [3], "d": ["sem", "60"]},
  {"l": "νόμος", "g": "lag, sed, ordning", "o": "substantiv", "gen": "m", "f": 193, "s": [], "d": ["60"]},
  {"l": "νῦν", "g": "nu", "o": "adverb", "gen": null, "f": 145, "s": [], "d": ["60"]},
  {"l": "νύξ", "g": "natt", "o": "substantiv", "gen": "f", "f": 61, "s": [], "d": ["60"], "git": "νυκτός"},
  {"l": "ὁ", "g": "den, det", "o": "artikel", "gen": null, "f": 19769, "s": [], "d": ["60"]},
  {"l": "ὁδός", "g": "väg, färd", "o": "substantiv", "gen": "f", "f": 101, "s": [5], "d": ["sem", "60"]},
  {"l": "οἶδα", "g": "veta", "o": "verb", "gen": null, "f": 296, "s": [], "d": ["60"]},
  {"l": "οἶκος", "g": "hus", "o": "substantiv", "gen": "m", "f": 112, "s": [2, 3, 4, 5, 7], "d": ["sem", "60"], "not": "= ἡ οἰκία"},
  {"l": "ὅλος", "g": "hel", "o": "adjektiv", "gen": null, "f": 108, "s": [], "d": ["60"]},
  {"l": "ὄνομα", "g": "namn", "o": "substantiv", "gen": "n", "f": 229, "s": [], "d": ["60"]},
  {"l": "ὅπου", "g": "där (som)", "o": "pron.adv", "gen": null, "f": 81, "s": [], "d": ["60"]},
  {"l": "ὁράω", "g": "se", "o": "verb", "gen": null, "f": 476, "s": [], "d": ["60"]},
  {"l": "ὄρος", "g": "berg", "o": "substantiv", "gen": "n", "f": 62, "s": [6], "d": ["sem", "60"]},
  {"l": "ὅς", "g": "som, vilken", "o": "pronomen", "gen": null, "f": 1408, "s": [], "d": ["60"]},
  {"l": "ὅσος", "g": "så stor/många som", "o": "pron.adj", "gen": null, "f": 111, "s": [], "d": ["60"]},
  {"l": "ὅστις", "g": "den som", "o": "pronomen", "gen": null, "f": 144, "s": [], "d": ["60"]},
  {"l": "ὅταν", "g": "när (som helst)", "o": "pron.adv", "gen": null, "f": 123, "s": [], "d": ["60"]},
  {"l": "ὅτε", "g": "när", "o": "pron.adv", "gen": null, "f": 102, "s": [], "d": ["60"]},
  {"l": "ὅτι", "g": "att, eftersom", "o": "partikel", "gen": null, "f": 1294, "s": [7], "d": ["sem", "60"]},
  {"l": "οὐ", "g": "inte", "o": "negation", "gen": null, "f": 1605, "s": [5], "d": ["sem", "60"]},
  {"l": "οὐδέ", "g": "och inte, inte heller", "o": "partikel", "gen": null, "f": 142, "s": [], "d": ["60"]},
  {"l": "οὐδείς", "g": "ingen", "o": "pron.adj", "gen": null, "f": 232, "s": [], "d": ["60"]},
  {"l": "οὖν", "g": "alltså", "o": "partikel", "gen": null, "f": 494, "s": [5], "d": ["sem", "60"]},
  {"l": "οὐρανός", "g": "himmel", "o": "substantiv", "gen": "m", "f": 273, "s": [2, 3, 5], "d": ["sem", "60"]},
  {"l": "οὔτε", "g": "varken ... eller", "o": "partikel", "gen": null, "f": 87, "s": [], "d": ["60"]},
  {"l": "οὗτος", "g": "denne, denna, detta", "o": "pronomen", "gen": null, "f": 1385, "s": [6, 7], "d": ["sem", "60"]},
  {"l": "οὕτω(ς)", "g": "på så sätt, sålunda", "o": "pron.adv", "gen": null, "f": 207, "s": [], "d": ["60"]},
  {"l": "ὀφθαλμός", "g": "öga", "o": "substantiv", "gen": "m", "f": 100, "s": [], "d": ["60"]},
  {"l": "ὄχλος", "g": "folkhop", "o": "substantiv", "gen": "m", "f": 174, "s": [7], "d": ["sem", "60"]},
  {"l": "πάλιν", "g": "igen, åter", "o": "adverb", "gen": null, "f": 139, "s": [], "d": ["60"]},
  {"l": "παρά", "g": "från; hos, vid; bredvid", "o": "preposition", "gen": null, "f": 193, "s": [5], "d": ["sem", "60"], "rekt": [["gen", "från"], ["dat", "hos, vid"], ["ack", "bredvid, längs"]]},
  {"l": "παραδίδωμι", "g": "överlämna, uppge", "o": "verb", "gen": null, "f": 119, "s": [], "d": ["60"]},
  {"l": "παρακαλέω", "g": "tillkalla, förmana, uppmuntra", "o": "verb", "gen": null, "f": 109, "s": [], "d": ["60"]},
  {"l": "πᾶς", "g": "var och en, all", "o": "pron.adj", "gen": null, "f": 1244, "s": [7], "d": ["sem", "60"]},
  {"l": "πατήρ", "g": "far", "o": "substantiv", "gen": "m", "f": 413, "s": [], "d": ["60"], "git": "πατρός"},
  {"l": "πέμπω", "g": "skicka", "o": "verb", "gen": null, "f": 79, "s": [2, 3, 7], "d": ["sem", "60"]},
  {"l": "περί", "g": "om, angående; kring", "o": "preposition", "gen": null, "f": 332, "s": [5, 7], "d": ["sem", "60"], "rekt": [["gen", "om, angående"], ["ack", "kring, omkring"]]},
  {"l": "περιπατέω", "g": "gå omkring, vandra", "o": "verb", "gen": null, "f": 95, "s": [], "d": ["60"]},
  {"l": "πίνω", "g": "dricka", "o": "verb", "gen": null, "f": 72, "s": [6], "d": ["sem", "60"]},
  {"l": "πίπτω", "g": "falla", "o": "verb", "gen": null, "f": 90, "s": [], "d": ["60"]},
  {"l": "πιστεύω", "g": "tro, lita på", "o": "verb", "gen": null, "f": 241, "s": [3, 4, 5, 6, 7], "d": ["sem", "60"]},
  {"l": "πίστις", "g": "tro, förtroende, tillit", "o": "substantiv", "gen": "f", "f": 242, "s": [], "d": ["60"]},
  {"l": "πληρόω", "g": "fylla", "o": "verb", "gen": null, "f": 86, "s": [], "d": ["60"]},
  {"l": "πλοῖον", "g": "båt", "o": "substantiv", "gen": "n", "f": 67, "s": [3, 5, 7], "d": ["sem", "60"]},
  {"l": "πνεῦμα", "g": "ande", "o": "substantiv", "gen": "n", "f": 379, "s": [], "d": ["60"]},
  {"l": "ποιέω", "g": "göra, handla", "o": "verb", "gen": null, "f": 568, "s": [4, 5, 7], "d": ["sem", "60"]},
  {"l": "πόλις", "g": "stad", "o": "substantiv", "gen": "f", "f": 162, "s": [], "d": ["60"]},
  {"l": "πολύς", "g": "mycket, många", "o": "adjektiv", "gen": null, "f": 415, "s": [7], "d": ["sem", "60"]},
  {"l": "πονηρός", "g": "dålig, ond", "o": "adjektiv", "gen": null, "f": 78, "s": [3, 4, 5], "d": ["sem", "60"]},
  {"l": "πορεύομαι", "g": "färdas, resa, gå", "o": "verb", "gen": null, "f": 150, "s": [], "d": ["60"]},
  {"l": "πούς", "g": "fot", "o": "substantiv", "gen": "m", "f": 93, "s": [], "d": ["60"], "git": "ποδός"},
  {"l": "πρεσβύτερος", "g": "äldste", "o": "substantiv", "gen": "m", "f": 65, "s": [], "d": ["60"]},
  {"l": "πρός", "g": "på; vid; till, hos", "o": "preposition", "gen": null, "f": 696, "s": [5, 7], "d": ["sem", "60"], "rekt": [["gen", "på (ngns sida)"], ["dat", "vid, nära"], ["ack", "till, hos"]]},
  {"l": "προσέρχομαι", "g": "gå/komma till, träda fram", "o": "verb", "gen": null, "f": 86, "s": [], "d": ["60"]},
  {"l": "προσεύχομαι", "g": "be", "o": "verb", "gen": null, "f": 85, "s": [], "d": ["60"]},
  {"l": "πρόσωπον", "g": "ansikte", "o": "substantiv", "gen": "n", "f": 76, "s": [], "d": ["60"]},
  {"l": "προφήτης", "g": "profet", "o": "substantiv", "gen": "m", "f": 144, "s": [5, 6], "d": ["sem", "60"]},
  {"l": "πρῶτος", "g": "först", "o": "adjektiv", "gen": null, "f": 153, "s": [3, 7], "d": ["sem", "60"]},
  {"l": "πῦρ", "g": "eld", "o": "substantiv", "gen": "n", "f": 71, "s": [], "d": ["60"], "git": "πυρός"},
  {"l": "πῶς", "g": "hur", "o": "adverb", "gen": null, "f": 103, "s": [], "d": ["60"]},
  {"l": "σάρξ", "g": "kött, kropp", "o": "substantiv", "gen": "f", "f": 147, "s": [], "d": ["60"], "git": "σαρκός"},
  {"l": "σημεῖον", "g": "tecken", "o": "substantiv", "gen": "n", "f": 77, "s": [3, 4, 7], "d": ["sem", "60"]},
  {"l": "στόμα", "g": "mun", "o": "substantiv", "gen": "n", "f": 78, "s": [], "d": ["60"]},
  {"l": "σύ", "g": "du", "o": "pronomen", "gen": null, "f": 2894, "s": [5, 7], "d": ["sem", "60"]},
  {"l": "σύν", "g": "med, jämte", "o": "preposition", "gen": null, "f": 129, "s": [5], "d": ["sem", "60"], "rekt": [["dat", "med, jämte"]]},
  {"l": "συναγωγή", "g": "samlingsställe, synagoga", "o": "substantiv", "gen": "f", "f": 56, "s": [7], "d": ["sem"]},
  {"l": "σῴζω", "g": "rädda, hjälpa, bevara", "o": "verb", "gen": null, "f": 106, "s": [3, 4, 5, 7], "d": ["sem", "60"]},
  {"l": "σῶμα", "g": "kropp", "o": "substantiv", "gen": "n", "f": 142, "s": [], "d": ["60"]},
  {"l": "τέ", "g": "och", "o": "partikel", "gen": null, "f": 213, "s": [], "d": ["60"]},
  {"l": "τέκνον", "g": "barn", "o": "substantiv", "gen": "n", "f": 99, "s": [3, 4, 5, 6], "d": ["sem", "60"]},
  {"l": "τηρέω", "g": "iaktta, bevaka, bevara", "o": "verb", "gen": null, "f": 71, "s": [4, 5, 7], "d": ["sem", "60"]},
  {"l": "τίθημι", "g": "ställa, lägga, sätta", "o": "verb", "gen": null, "f": 100, "s": [], "d": ["60"]},
  {"l": "τίς", "g": "vem, vad", "o": "pronomen", "gen": null, "f": 554, "s": [6, 7], "d": ["sem", "60"]},
  {"l": "τις", "g": "någon, något", "o": "pronomen", "gen": null, "f": 530, "s": [7], "d": ["sem", "60"]},
  {"l": "τόπος", "g": "plats, ställe, ort", "o": "substantiv", "gen": "m", "f": 94, "s": [6], "d": ["sem", "60"]},
  {"l": "τότε", "g": "då, därpå", "o": "adverb", "gen": null, "f": 159, "s": [], "d": ["60"]},
  {"l": "τρεῖς", "g": "tre", "o": "räkneord", "gen": null, "f": 67, "s": [], "d": ["60"]},
  {"l": "ὕδωρ", "g": "vatten", "o": "substantiv", "gen": "n", "f": 76, "s": [], "d": ["60"], "git": "ὕδατος"},
  {"l": "υἱός", "g": "son", "o": "substantiv", "gen": "m", "f": 375, "s": [3, 5, 7], "d": ["sem", "60"]},
  {"l": "ὑμεῖς", "g": "ni", "o": "pronomen", "gen": null, "f": null, "s": [5], "d": ["sem"]},
  {"l": "ὑπάγω", "g": "gå bort, gå", "o": "verb", "gen": null, "f": 79, "s": [7], "d": ["sem", "60"]},
  {"l": "ὑπέρ", "g": "över, för; mer än", "o": "preposition", "gen": null, "f": 150, "s": [5], "d": ["sem", "60"], "rekt": [["gen", "för, över"], ["ack", "mer än"]]},
  {"l": "ὑπό", "g": "av, genom; under", "o": "preposition", "gen": null, "f": 220, "s": [5], "d": ["sem", "60"], "rekt": [["gen", "av (agent)"], ["ack", "under, in under"]]},
  {"l": "Φαρισαῖος", "g": "farisé", "o": "substantiv", "gen": "m", "f": 96, "s": [], "d": ["60"]},
  {"l": "φοβέομαι", "g": "frukta", "o": "verb", "gen": null, "f": 95, "s": [], "d": ["60"]},
  {"l": "φωνή", "g": "röst, ljud", "o": "substantiv", "gen": "f", "f": 139, "s": [5], "d": ["sem", "60"]},
  {"l": "φῶς", "g": "ljus", "o": "substantiv", "gen": "n", "f": 72, "s": [], "d": ["60"], "git": "φωτός"},
  {"l": "χαίρω", "g": "glädja sig, vara glad", "o": "verb", "gen": null, "f": 74, "s": [], "d": ["60"]},
  {"l": "χάρις", "g": "nåd, gunst, tack", "o": "substantiv", "gen": "f", "f": 155, "s": [], "d": ["60"], "git": "χάριτος", "not": "ack. χάριν"},
  {"l": "χείρ", "g": "hand", "o": "substantiv", "gen": "f", "f": 176, "s": [], "d": ["60"], "git": "χειρός"},
  {"l": "Χριστός", "g": "Kristus", "o": "substantiv", "gen": "m", "f": 528, "s": [], "d": ["60"]},
  {"l": "ψυχή", "g": "själ", "o": "substantiv", "gen": "f", "f": 102, "s": [4, 5], "d": ["sem", "60"]},
  {"l": "ὧδε", "g": "här, hit, så här", "o": "pron.adv", "gen": null, "f": 61, "s": [], "d": ["60"]},
  {"l": "ὥρα", "g": "tid, stund, timme", "o": "substantiv", "gen": "f", "f": 106, "s": [], "d": ["60"]},
  {"l": "ὡς", "g": "såsom", "o": "partikel", "gen": null, "f": 503, "s": [], "d": ["60"]},
  {"l": "ὥστε", "g": "så att, därför", "o": "partikel", "gen": null, "f": 83, "s": [], "d": ["60"]},
  {"l": "κηρύσσω", "g": "predika", "o": "verb", "gen": null, "f": 61, "s": [2, 3, 4, 5, 7], "d": ["sem", "60"]},
  {"l": "κλέπτω", "g": "stjäla", "o": "verb", "gen": null, "f": 13, "s": [4], "d": ["sem"]},
  {"l": "λύω", "g": "lösa", "o": "verb", "gen": null, "f": 42, "s": [2, 7], "d": ["sem"]},
  {"l": "μικρός", "g": "liten", "o": "adjektiv", "gen": null, "f": 46, "s": [3], "d": ["sem"]},
  {"l": "παιδεύω", "g": "uppfostra", "o": "verb", "gen": null, "f": 13, "s": [2, 6, 7], "d": ["sem"]},
  {"l": "πιστός", "g": "trogen", "o": "adjektiv", "gen": null, "f": 67, "s": [3], "d": ["sem", "60"]},
  {"l": "πτωχός", "g": "fattig", "o": "adjektiv", "gen": null, "f": 34, "s": [4, 5], "d": ["sem"]},
  {"l": "φιλέω", "g": "gilla, älska", "o": "verb", "gen": null, "f": 25, "s": [4, 5, 7], "d": ["sem"]},
  {"l": "ἀγρός", "g": "fält", "o": "substantiv", "gen": "m", "f": 36, "s": [4], "d": ["sem"]},
  {"l": "ἀδελφή", "g": "syster", "o": "substantiv", "gen": "f", "f": 25, "s": [4, 7], "d": ["sem"]},
  {"l": "ἀργύριον", "g": "pengar, silver", "o": "substantiv", "gen": "n", "f": 20, "s": [4], "d": ["sem"]},
  {"l": "ἄγω", "g": "leda", "o": "verb", "gen": null, "f": 68, "s": [4, 5, 7], "d": ["sem", "60"]},
  {"l": "Ἰησοῦς", "g": "Jesus", "o": "substantiv", "gen": "m", "f": 906, "s": [4], "d": ["sem", "60"]},
  {"l": "θεραπεύω", "g": "hela, bota", "o": "verb", "gen": null, "f": 43, "s": [5, 7], "d": ["sem"]},
  {"l": "ἁμαρτάνω", "g": "synda", "o": "verb", "gen": null, "f": 42, "s": [5], "d": ["sem"]},
  {"l": "κώμη", "g": "by", "o": "substantiv", "gen": "f", "f": 27, "s": [5], "d": ["sem"]},
  {"l": "λίθος", "g": "sten", "o": "substantiv", "gen": "m", "f": 58, "s": [5], "d": ["sem"]},
  {"l": "νόσος", "g": "sjukdom", "o": "substantiv", "gen": "f", "f": 11, "s": [5], "d": ["sem"]},
  {"l": "νεανίας", "g": "yngling", "o": "substantiv", "gen": "m", "f": 4, "s": [5], "d": ["sem"]},
  {"l": "οἰκοδεσπότης", "g": "husbonde", "o": "substantiv", "gen": "m", "f": 12, "s": [5, 7], "d": ["sem"]},
  {"l": "παρθένος", "g": "flicka, jungfru", "o": "substantiv", "gen": "f", "f": 15, "s": [5], "d": ["sem"]},
  {"l": "ἔρημος", "g": "öken", "o": "substantiv", "gen": "f", "f": 48, "s": [5, 6], "d": ["sem"]},
  {"l": "φίλος", "g": "vän", "o": "substantiv", "gen": "m", "f": 29, "s": [5, 7], "d": ["sem"]},
  {"l": "ἀρχή", "g": "begynnelse", "o": "substantiv", "gen": "f", "f": 55, "s": [5], "d": ["sem"]},
  {"l": "σάββατον", "g": "sabbat", "o": "substantiv", "gen": "n", "f": 68, "s": [5], "d": ["sem", "60"]},
  {"l": "μακρός", "g": "lång", "o": "adjektiv", "gen": null, "f": 11, "s": [5], "d": ["sem"]},
  {"l": "πλούσιος", "g": "rik", "o": "adjektiv", "gen": null, "f": 28, "s": [5], "d": ["sem"]},
  {"l": "ἁμαρτωλός", "g": "syndig", "o": "adjektiv", "gen": null, "f": 47, "s": [5, 7], "d": ["sem"]},
  {"l": "πρό", "g": "framför (rum), före (tid)", "o": "preposition", "gen": null, "f": 47, "s": [5], "d": ["sem"], "rekt": [["gen", "framför, före"]]},
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
  {"l": "βαπτιστής", "g": "döpare", "o": "substantiv", "gen": "m", "f": 12, "s": [6, 7], "d": ["sem"]},
  {"l": "παραβολή", "g": "liknelse, parabel", "o": "substantiv", "gen": "f", "f": 50, "s": [6], "d": ["sem"]},
  {"l": "ἀγαπητός", "g": "älskad, kär", "o": "adjektiv", "gen": null, "f": 61, "s": [6, 7], "d": ["sem", "60"]},
  {"l": "ὑψηλός", "g": "hög", "o": "adjektiv", "gen": null, "f": 11, "s": [6], "d": ["sem"]},
  {"l": "προσκυνέω", "g": "tillbedja", "o": "verb", "gen": null, "f": 60, "s": [6], "d": ["sem"]},
  {"l": "λατρεύω", "g": "tjäna (med dativ)", "o": "verb", "gen": null, "f": 21, "s": [6], "d": ["sem"]},
  {"l": "διώκω", "g": "förfölja", "o": "verb", "gen": null, "f": 45, "s": [7], "d": ["sem"]},
  {"l": "πείθω", "g": "övertyga", "o": "verb", "gen": null, "f": 52, "s": [7], "d": ["sem"]},
  {"l": "τύπτω", "g": "slå", "o": "verb", "gen": null, "f": 13, "s": [7], "d": ["sem"]},
  {"l": "οἰκοδομέω", "g": "bygga", "o": "verb", "gen": null, "f": 40, "s": [7], "d": ["sem"]},
  {"l": "ἀλείφω", "g": "smörja", "o": "verb", "gen": null, "f": 9, "s": [7], "d": ["sem"]},
  {"l": "ἀμπελών", "g": "vingård", "o": "substantiv", "gen": "m", "f": 23, "s": [7], "d": ["sem"]},
  {"l": "ἡγεμών", "g": "ståthållare, landshövding", "o": "substantiv", "gen": "m", "f": 20, "s": [7], "d": ["sem"]},
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
  {"l": "ὑμέτερος", "g": "er, ert", "o": "pron.adj", "gen": null, "f": 11, "s": [7], "d": ["sem"]}
];

const SEMINARIER = [2, 3, 4, 5, 6, 7];
const ORDKLASSER = [...new Set(ORDBOK.map(w => w.o))];   // i förekomstordning
const DECKS = [
  { id:"alla", namn:"Alla",             desc:"Alla kursens ord — seminarielistor och >60-listan." },
  { id:"sem",  namn:"Seminarielistor",  desc:"Orden ur seminariernas ordlistor (seminarium 2–7)." },
  { id:"60",   namn:"NT-frekvens > 60", desc:"Alla ord som förekommer fler än 60 ggr i NT." },
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
const GENUS_KORT = { m: "m", f: "f", n: "n" };
const KASUS_NAMN = { gen: "gen.", dat: "dat.", ack: "ack." };
const LAGER = "grek-ordbok-v1";

/* ── STATE ───────────────────────────────────────────────────────────── */
const state = {
  deck: "alla",                                   // "alla" | "sem" | "60"
  sok: "",
  valdaSem:  new Set(SEMINARIER),
  valdaBand: new Set(BAND_IDS),
  valdaOk:   new Set(ORDKLASSER),
};

/* ── SÖKNORMALISERING ────────────────────────────────────────────────── */
// NFD → bort med kombinerande diakriter → gemener. Gör grekisk sökning
// accent-/versalokänslig (och svensk å/ä/ö → a/a/o), så "agap" träffar ἀγάπη.
const strip = s => s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
// Grov grekisk→latinsk translitterering, så den som saknar grekiskt tangentbord
// kan söka "agape", "theos", "apo". Digraferna (θ→th, φ→f …) och latinska
// stavningsvarianter jämnas ut med fold() på BÅDA sidor (ph=f, ch=k, y=i, h bort).
const TRANSLIT = { α:"a", β:"b", γ:"g", δ:"d", ε:"e", ζ:"z", η:"e", θ:"th", ι:"i",
  κ:"k", λ:"l", μ:"m", ν:"n", ξ:"x", ο:"o", π:"p", ρ:"r", σ:"s", ς:"s", τ:"t",
  υ:"y", φ:"f", χ:"ch", ψ:"ps", ω:"o" };
const translit = g => strip(g).split("").map(c => TRANSLIT[c] ?? c).join("");
const fold = s => s.toLowerCase()
  .replace(/ph/g, "f").replace(/th/g, "t").replace(/kh/g, "k").replace(/ch/g, "k")
  .replace(/c/g, "k").replace(/h/g, "").replace(/y/g, "u");   // υ↔u: "pous" ↔ πούς, "kurios" ↔ κύριος
// förberäkna sökfält en gång
ORDBOK.forEach(w => {
  w._l = strip(w.l); w._g = strip(w.g); w._git = w.git ? strip(w.git) : "";
  w._t = fold(translit(w.l));
});

/* ── URVAL ───────────────────────────────────────────────────────────── */
function deckScope(){                             // orden i aktivt däck, före ordklass/sök
  if(state.deck === "sem")
    return ORDBOK.filter(w => w.d.includes("sem") && w.s.some(s => state.valdaSem.has(s)));
  if(state.deck === "60")
    return ORDBOK.filter(w => w.d.includes("60") && BAND.some(b => state.valdaBand.has(b.id) && b.test(w.f)));
  return ORDBOK;                                  // "alla"
}
function bas(){ return deckScope().filter(w => state.valdaOk.has(w.o)); }
function trafflista(){
  let lista = bas();
  const q = strip(state.sok.trim());
  if(q){
    // Grekisk (accent-fri) och svensk sökning matchar var som helst i ordet;
    // den latinska translittereringen ankras till ordets BÖRJAN, annars läcker
    // svenska ord ("hus" → "us") in bland grekiska -ευς-ändelser.
    const ql = fold(q);
    lista = lista.filter(w =>
      w._l.includes(q) || w._g.includes(q) || (w._git && w._git.includes(q)) || w._t.startsWith(ql));
  }
  return lista.sort((a, b) => a.l.localeCompare(b.l, "el"));
}

/* ── PERSISTENS ──────────────────────────────────────────────────────── */
function spara(){
  try{
    localStorage.setItem(LAGER, JSON.stringify({
      deck: state.deck, sok: state.sok,
      valdaSem: [...state.valdaSem], valdaBand: [...state.valdaBand], valdaOk: [...state.valdaOk],
    }));
  }catch(e){ /* privat läge e.d. */ }
}
function ladda(){
  try{
    const r = JSON.parse(localStorage.getItem(LAGER));
    if(!r) return;
    if(DECK_IDS.includes(r.deck)) state.deck = r.deck;
    if(typeof r.sok === "string") state.sok = r.sok;
    if(Array.isArray(r.valdaSem))  state.valdaSem  = new Set(r.valdaSem.filter(s => SEMINARIER.includes(s)));
    if(Array.isArray(r.valdaBand)) state.valdaBand = new Set(r.valdaBand.filter(b => BAND_IDS.includes(b)));
    if(Array.isArray(r.valdaOk))   state.valdaOk   = new Set(r.valdaOk.filter(o => ORDKLASSER.includes(o)));
    if(!state.valdaSem.size)  state.valdaSem  = new Set(SEMINARIER);
    if(!state.valdaBand.size) state.valdaBand = new Set(BAND_IDS);
    if(!state.valdaOk.size)   state.valdaOk   = new Set(ORDKLASSER);
  }catch(e){ /* trasig data — börja rent */ }
}

/* ── RENDER: LISTAN ──────────────────────────────────────────────────── */
function esc(s){ return String(s).replace(/[&<>]/g, c => ({ "&":"&amp;", "<":"&lt;", ">":"&gt;" }[c])); }
function lemmaHtml(w){
  let s = (w.o === "substantiv" && w.gen ? ARTIKEL[w.gen] + " " : "") + esc(w.l);
  if(w.git) s += `<span class="git">, ${esc(w.git)}</span>`;
  return s;
}
function metaHtml(w){
  const delar = [];
  let ok = w.o;
  if(w.o === "substantiv" && w.gen) ok += " · " + GENUS_KORT[w.gen];
  delar.push(`<span class="ok">${esc(ok)}</span>`);
  if(w.rekt){
    const r = w.rekt.map(([k, b]) => `<b>+ ${KASUS_NAMN[k] || k}</b> ${esc(b)}`).join(" · ");
    delar.push(`<span class="rekt">${r}</span>`);
  }
  (w.s || []).forEach(s => delar.push(`<span class="semtag">sem ${s}</span>`));
  if(w.not) delar.push(`<span class="not">${esc(w.not)}</span>`);
  return delar.join("");
}
function ordHtml(w){
  return `<article class="ord">
    <div class="rad1"><span class="lemma">${lemmaHtml(w)}</span>${
      w.f ? `<span class="frek" title="förekomster i NT">${w.f}×</span>` : ""}</div>
    <div class="glosa">${esc(w.g)}</div>
    <div class="meta">${metaHtml(w)}</div>
  </article>`;
}
function renderLista(){
  const lista = trafflista();
  const box = document.getElementById("resultat");
  const antal = document.getElementById("traff-antal");
  if(!lista.length){
    box.innerHTML = `<div class="tomt">Inga träffar.${
      state.sok ? " Prova en annan sökning" : " Vidga urvalet"} eller <a href="#/">gå tillbaka</a>.</div>`;
    antal.textContent = "0 ord";
  }else{
    box.innerHTML = lista.map(ordHtml).join("");
    antal.textContent = `${lista.length} ord`;
  }
  renderPickerCount();
}

/* ── VÄLJAREN ────────────────────────────────────────────────────────── */
function renderPickerCount(){
  document.getElementById("picker-count").textContent = `(${bas().length} ord)`;
}
function antalForSem(s){ return ORDBOK.filter(w => w.d.includes("sem") && w.s.includes(s)).length; }
function antalForBand(bid){ const b = BAND.find(x => x.id === bid); return ORDBOK.filter(w => w.d.includes("60") && b.test(w.f)).length; }
function antalForOk(o){ return deckScope().filter(w => w.o === o).length; }

function byggPicker(){
  const deckGrid = document.getElementById("deck-grid");
  DECKS.forEach(d => {
    const b = document.createElement("button");
    b.className = "toggle"; b.dataset.deck = d.id; b.textContent = d.namn;
    b.setAttribute("aria-pressed", state.deck === d.id);
    b.onclick = () => setDeck(d.id);
    deckGrid.appendChild(b);
  });
  const semGrid = document.getElementById("sem-grid");
  SEMINARIER.forEach(s => {
    const b = document.createElement("button");
    b.className = "toggle";
    b.innerHTML = `Sem ${s}<span class="n">${antalForSem(s)}</span>`;
    b.setAttribute("aria-pressed", state.valdaSem.has(s));
    b.onclick = () => { toggleSet(state.valdaSem, s); b.setAttribute("aria-pressed", state.valdaSem.has(s)); efterUrval(); };
    semGrid.appendChild(b);
  });
  const bandGrid = document.getElementById("band-grid");
  BAND.forEach(bd => {
    const b = document.createElement("button");
    b.className = "toggle";
    b.innerHTML = `${bd.namn}<span class="n">${antalForBand(bd.id)}</span>`;
    b.setAttribute("aria-pressed", state.valdaBand.has(bd.id));
    b.onclick = () => { toggleSet(state.valdaBand, bd.id); b.setAttribute("aria-pressed", state.valdaBand.has(bd.id)); efterUrval(); };
    bandGrid.appendChild(b);
  });
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
  document.getElementById("subtitle").textContent = d.namn + " · grekiska ↔ svenska";
  document.querySelectorAll("#ok-grid .toggle").forEach(b => {
    const n = b.querySelector(".n");
    if(n) n.textContent = antalForOk(b.dataset.ok);
  });
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
  const antal = bas().length;
  document.getElementById("picker-note").textContent =
    antal ? "" : "Inga ord i urvalet — vidga filtren ovan.";
  spara();
  renderLista();
}

/* ── EVENTS ──────────────────────────────────────────────────────────── */
const sok = document.getElementById("sok");
sok.value = state.sok;
sok.addEventListener("input", () => { state.sok = sok.value; renderLista(); spara(); });
document.getElementById("sok-rensa").onclick = () => { sok.value = ""; state.sok = ""; renderLista(); spara(); sok.focus(); };

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

/* ── INIT ────────────────────────────────────────────────────────────── */
ladda();
sok.value = state.sok;
byggPicker();
renderLista();

}
