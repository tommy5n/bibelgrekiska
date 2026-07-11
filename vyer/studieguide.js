// Vy: Studieguide — pedagogisk sammanfattning av Bibelgrekiska I, seminarium för
// seminarium. Ersätter den gamla läsordnings-checklistan: ingen avbockning/localStorage,
// bara innehåll. Varje seminarium: Nytt denna gång → Begrepp → Fällor → Öva → Slå upp.
export function teardown(){}

// Genomgående principer — den röda tråd som håller genom hela kursen.
const PRINCIPER = [
  { rubrik:"Ändelsen bär rollen, inte ordföljden",
    text:"Ett ords kasusändelse avgör om det är subjekt, objekt eller dativ. Därför kan orden stå i nästan vilken ordning som helst — läs ändelsen, inte platsen." },
  { rubrik:"Kongruens binder ihop frasen",
    text:"Artikel och adjektiv rättar sig efter sitt huvudord (det substantiv som frasen handlar om) i genus, kasus och numerus. Ord som hör ihop bär samma böjning." },
  { rubrik:"Läs signalen i formen",
    text:"Varje form har en markör: artikeln (<span class='grek'>ὁ/ἡ/τό</span>) visar genus, ett inskjutet <span class='grek'>σ</span> visar futurum, augmentet <span class='grek'>ἐ-</span> visar dåtid, och neutrum har samma form i nominativ och ackusativ." },
];

// Ett kapitel per seminarium. Ämneskartorna är hämtade troget ur json/seminarier.json.
const SEMINARIER = [
  {
    n:1, titel:"Skrift och ljud",
    tema:"Grinden till allt annat — kan du läsa formerna rätt kan du börja böja dem.",
    nytt:[
      "Alfabetet — 24 bokstäver, deras namn och ljud",
      "Diftonger och långdiftonger",
      "Spiritus lenis (˒) och asper (˓) — h-ljud eller inte",
      "Accenttecken: akut, grav och cirkumflex",
      "Iota subscriptum (ῳ, ῃ, ᾳ)",
      "De tre ordklasserna: substantiv, adjektiv och verb",
    ],
    begrepp:[
      { rubrik:"Skriva och uttala",
        text:"Grekiskan har ett eget alfabet. Lär in bokstävernas namn och ljud tills de går av sig själva — allt annat i kursen bygger på att du kan läsa en form utan att staka dig." },
      { rubrik:"Spiritus — det osynliga h:et",
        text:"Varje ord som börjar på vokal bär ett spiritustecken. Spiritus asper (˓, som i <span class='grek'>ὁ</span>) uttalas med h-ljud; spiritus lenis (˒, som i <span class='grek'>ἐν</span>) är stumt." },
      { rubrik:"Diftonger och långdiftonger",
        text:"En <b>diftong</b> är två vokaler som uttalas i en och samma stavelse (<span class='grek'>αι, ει, οι, ου, αυ, ευ</span>). En <b>långdiftong</b> är en lång vokal följd av <span class='grek'>ι</span> — och det lilla i:et skrivs oftast <i>under</i> vokalen som iota subscriptum (<span class='grek'>ῳ, ῃ, ᾳ</span>). De återkommer i många ändelser, så vänj ögat vid dem redan nu." },
      { rubrik:"Accenter finns — men styr inte betydelsen än",
        text:"Accenttecknen markerar var betoningen ligger. Läs dem, men låt dem inte skrämma: först längre fram börjar accentens läge avslöja något om själva formen." },
    ],
    fallor:[
      "Iota subscriptum (<span class='grek'>ῳ, ῃ, ᾳ</span>) är lätt att missa — det lilla i:et under vokalen hör till ändelsen och avgör ofta kasus.",
    ],
    ova:[
      { spel:"Alfabetet", route:"#/alfabet", vad:"bokstäver, namn och ljud tills de sitter" },
    ],
    slaupp:[],
    mal:"Du kan läsa vilken grekisk form som helst högt utan att staka dig.",
  },

  {
    n:2, titel:"Substantiv, verb och satsdelar",
    tema:"Den stora insikten: ändelsen — inte ordföljden — talar om vem som gör vad.",
    nytt:[
      "Maskulina substantiv på -ος (andra deklinationen)",
      "Den bestämda artikeln: ὁ, τόν, τοῦ, τῷ …",
      "ω-verb i presens: λύω, λύεις, λύει …",
      "Kasus och satslära: nominativ, ackusativ, genitiv, dativ",
      "Långdiftonger",
    ],
    begrepp:[
      { rubrik:"Kasus = roll i satsen",
        text:"Grekiskan böjer substantivet efter dess roll: <b>nominativ</b> = subjekt, <b>ackusativ</b> = direkt objekt, <b>dativ</b> = indirekt objekt (åt/med/i), <b>genitiv</b> = tillhörighet (’-s’, ’av’). Rollen sitter i ändelsen." },
      { rubrik:"Ordföljden är fri",
        text:"Eftersom ändelsen bär rollen kan orden komma i olika ordning. <span class='grek'>ὁ ἄνθρωπος ἀκούει τὸν λόγον</span> och <span class='grek'>τὸν λόγον ἀκούει ὁ ἄνθρωπος</span> betyder samma sak. Leta efter <span class='grek'>-ος</span> (subjekt) och <span class='grek'>-ον</span> (objekt), inte efter platsen i satsen." },
      { rubrik:"Artikeln böjs med",
        text:"Den bestämda artikeln (<span class='grek'>ὁ, τοῦ, τῷ, τόν</span> …) rättar sig efter substantivet i genus, kasus och numerus — den är din bästa ledtråd till vilket kasus ett ord står i." },
      { rubrik:"Deklination = böjningsmönster",
        text:"En <b>deklination</b> är en mall för hur ett substantiv byter ändelser genom kasusen. Maskulina <span class='grek'>-ος</span>-ord som <span class='grek'>λόγος</span> följer <b>andra deklinationen</b>. Kursen bygger på tre sådana mönster — du möter dem ett i taget." },
    ],
    fallor:[
      "Låt inte svenskans ordföljd lura dig — det första ordet är inte automatiskt subjektet.",
    ],
    ova:[
      { spel:"Glosor", route:"#/glosor", filter:"Sem 2", vad:"starta ordförrådsmotorn — och sedan några minuter varje dag" },
      { spel:"Kasus", route:"#/kasus", filter:"maskulinum", vad:"nöt själva kasusformerna" },
      { spel:"Satsanalys", route:"#/satsanalys", vad:"läs rollen ur kasus, inte ur ordföljden" },
    ],
    slaupp:[
      { text:"Kasus", anchor:"kasus" },
      { text:"Bestämd artikel", anchor:"artikel" },
      { text:"Maskulina -ος", anchor:"subst-mask" },
      { text:"ω-verb presens", anchor:"verb-omega" },
    ],
    mal:"Du tar ut subjekt, objekt, dativ och genitiv ur kasusformen — inte ur ordföljden.",
  },

  {
    n:3, titel:"Neutrum, adjektiv, kongruens och εἰμί",
    tema:"Kongruens införs, och verbet ’vara’ ger satsen en helt ny sorts led.",
    nytt:[
      "Neutrala substantiv på -ον",
      "Adjektiv (ἅγιος, ἀγαθός) — böjs i tre genus",
      "Kongruens: adjektivet rättar sig efter sitt substantiv",
      "Accenttyper (oxytona, paroxytona …)",
      "εἰμί ’vara’ i presens",
      "Predikatsfyllnad samt attributiv och predikativ ställning",
    ],
    begrepp:[
      { rubrik:"Neutrum: nominativ = ackusativ",
        text:"Neutrala ord har samma form i nominativ och ackusativ (<span class='grek'>τὸ τέκνον</span> kan vara både subjekt och objekt). Här måste du läsa hela satsen — den vanligaste nybörjarfällan." },
      { rubrik:"Kongruens",
        text:"Ett adjektiv (och artikeln) rättar sig efter sitt huvudord i <b>genus, kasus och numerus</b>: <span class='grek'>ὁ ἀγαθὸς λόγος</span>, <span class='grek'>τῆς ἀγαθῆς ἡμέρας</span> — ändelserna följer med." },
      { rubrik:"Attributiv och predikativ ställning",
        text:"Står adjektivet <i>inom</i> artikelns grepp (<span class='grek'>ὁ ἀγαθὸς λόγος</span>) är det attributivt — ’det goda ordet’. Står det <i>utanför</i> (<span class='grek'>ἀγαθὸς ὁ λόγος</span>) är det predikativt — ’ordet är gott’." },
      { rubrik:"εἰμί och predikatsfyllnad",
        text:"Verbet <span class='grek'>εἰμί</span> ’vara’ tar inget objekt — det som följer står i <b>nominativ</b> (predikatsfyllnad): <span class='grek'>ὁ λόγος θεός ἐστιν</span>." },
      { rubrik:"Accenttyper — namn på var accenten sitter",
        text:"Nu får accentens läge namn efter vilken stavelse den träffar: <b>oxyton</b> = akut på sista stavelsen (<span class='grek'>ἀγαθός</span>), <b>paroxyton</b> = akut på näst sista (<span class='grek'>λόγος</span>), <b>proparoxyton</b> = akut på tredje från slutet (<span class='grek'>ἄνθρωπος</span>). Cirkumflex på de två sista heter perispomenon respektive properispomenon. Du behöver inte kunna namnen utantill — men de gör det lättare att prata om formerna." },
    ],
    fallor:[
      "Neutrum nom = ack — avgör rollen ur sammanhanget, inte ur formen.",
      "<span class='grek'>εἰμί</span> ger predikatsfyllnad i nominativ, aldrig ackusativ.",
    ],
    ova:[
      { spel:"Kasus", route:"#/kasus", filter:"+ neutrum", vad:"sikta på nom = ack-fällan" },
      { spel:"Kongruens", route:"#/kongruens", filter:"attributivt", vad:"adjektivets böjning och accentläge" },
      { spel:"Satsanalys", route:"#/satsanalys", vad:"nu med εἰμί-satser och predikatsfyllnad" },
      { spel:"Verb", route:"#/verb", filter:"εἰμί", vad:"böj ’vara’ i presens" },
    ],
    slaupp:[
      { text:"Neutrum -ον", anchor:"subst-neut" },
      { text:"Adjektiv", anchor:"adjektiv" },
      { text:"Kongruens", anchor:"kongruens" },
      { text:"εἰμί", anchor:"verb-eimi" },
      { text:"Accenter", anchor:"accenter" },
    ],
    mal:"Du skiljer attributiv från predikativ och håller kongruensen genom hela nominalfrasen.",
  },

  {
    n:4, titel:"Första deklinationen, prepositioner och kontraherade verb",
    tema:"Femininum kompletterar genusbilden; nya led och nya verbtyper tillkommer.",
    nytt:[
      "Feminina substantiv, första deklinationen (typerna -η, ren -α, oren -α)",
      "Adjektivets femininum",
      "εἰμί i imperfekt (dåtid)",
      "Prepositioner — och vilket kasus de styr",
      "Adverbial som satsled",
      "Kontraherade verb på -έω (φιλέω → φιλῶ)",
    ],
    begrepp:[
      { rubrik:"Genusbilden är komplett",
        text:"Med första deklinationens femininer har du nu alla tre genus. Adjektivet får sin feminina rad (<span class='grek'>ἀγαθή, ἀγαθῆς …</span>) och kan kongruera med feminina ord." },
      { rubrik:"Ren och oren α",
        text:"Första deklinationens femininer delas efter singularändelsen: <b>ren α</b> behåller <span class='grek'>α</span> genom hela singular (<span class='grek'>ἡμέρα, ἡμέρας</span> — står efter <span class='grek'>ε, ι, ρ</span>), <b>oren α</b> har <span class='grek'>α</span> i nom/ack men växlar till <span class='grek'>η</span> i genitiv och dativ (<span class='grek'>δόξα, δόξης</span>), och <b>η-typen</b> har <span class='grek'>η</span> rakt igenom (<span class='grek'>ἀρχή, ἀρχῆς</span>). Plural är lika för alla tre." },
      { rubrik:"Prepositioner styr kasus",
        text:"En preposition kräver ett bestämt kasus: <span class='grek'>ἐν</span> + dativ, <span class='grek'>εἰς</span> + ackusativ, <span class='grek'>ἐκ</span> + genitiv. Lär in preposition och kasus tillsammans." },
      { rubrik:"Kontraktion",
        text:"Verb på <span class='grek'>-έω</span> drar samman vokalerna: <span class='grek'>φιλέ-ω → φιλῶ</span>, <span class='grek'>φιλέ-εις → φιλεῖς</span>. Ändelsen finns kvar under sammandragningen — lär dig känna igen den." },
    ],
    fallor:[
      "Feminin genitiv plural bär cirkumflex på ändelsen: <span class='grek'>τῶν ἡμερῶν</span> — accenten skiljer former åt.",
      "Kontraherade verb ser korta ut men böjs som ω-verb under ytan.",
    ],
    ova:[
      { spel:"Glosor", route:"#/glosor", filter:"+ Sem 4", vad:"bygg vidare på ordförrådet" },
      { spel:"Kasus", route:"#/kasus", filter:"+ femininum", vad:"alla tre genus" },
      { spel:"Kongruens", route:"#/kongruens", filter:"predikativt + εἰμί", vad:"den nya konstruktionen" },
      { spel:"Satsanalys", route:"#/satsanalys", vad:"adverbial som ny satsdel" },
      { spel:"Verb", route:"#/verb", filter:"kontraherade", vad:"φιλέω-typen i presens" },
    ],
    slaupp:[
      { text:"Feminina 1:a dekl", anchor:"subst-fem" },
      { text:"Adjektiv", anchor:"adjektiv" },
      { text:"Kontraherade verb", anchor:"verb-kontrakt" },
      { text:"Prepositioner", anchor:"prepositioner" },
      { text:"εἰμί (imperfekt)", anchor:"verb-eimi" },
    ],
    mal:"Du böjer feminina former rätt, kopplar preposition till kasus och känner igen kontraktion.",
  },

  {
    n:5, titel:"Artikeln, blandade deklinationer och personliga pronomen",
    tema:"Den viktiga läxan: genus och deklination är inte samma sak.",
    nytt:[
      "Den bestämda artikeln — genomgången och fördjupad",
      "Andra deklinationens feminina (ὁδός, ἔρημος, νόσος)",
      "Första deklinationens maskulina (μαθητής, προφήτης)",
      "Adjektiv med två slut (αἰώνιος: maskulinum = femininum)",
      "Negationen οὐ / οὐκ / οὐχ",
      "Personliga pronomen ἐγώ (jag) och σύ (du)",
    ],
    begrepp:[
      { rubrik:"Genus ≠ deklination",
        text:"Ett ord i andra deklinationen kan vara feminint (<span class='grek'>ἡ ὁδός</span> ’vägen’), och ett i första deklinationen maskulint (<span class='grek'>ὁ μαθητής</span> ’lärjungen’). Deklinationen styr <i>ändelserna</i>, genus styr <i>kongruensen</i>. Låt <b>artikeln</b> (<span class='grek'>ὁ/ἡ</span>) avslöja genus." },
      { rubrik:"Adjektiv med två slut",
        text:"Somliga adjektiv (<span class='grek'>αἰώνιος</span>) har bara två former: en gemensam för maskulinum och femininum, en för neutrum. <span class='grek'>ζωὴ αἰώνιος</span> — feminint substantiv med ’maskulin’ adjektivform." },
      { rubrik:"Negationen οὐ",
        text:"<span class='grek'>οὐ</span> negerar påståenden och rättar sig efter nästa ljud: <span class='grek'>οὐ</span> före konsonant, <span class='grek'>οὐκ</span> före vokal, <span class='grek'>οὐχ</span> före asper." },
      { rubrik:"Personliga pronomen",
        text:"<span class='grek'>ἐγώ</span> (jag) och <span class='grek'>σύ</span> (du) böjs i kasus. De har en <b>betonad</b> form (eftertryck) och en <b>obetonad</b> enklitisk (<span class='grek'>μου, σοι</span>) — valet markerar betoning." },
    ],
    fallor:[
      "Döm inte genus efter ändelsen — <span class='grek'>ἡ ὁδός</span> ser maskulin ut men är feminin. Läs artikeln.",
    ],
    ova:[
      { spel:"Glosor", route:"#/glosor", filter:"Sem 5", vad:"hela ordförrådet hittills" },
      { spel:"Kasus", route:"#/kasus", vad:"blanda alla genus och deklinationer" },
      { spel:"Pronomen", route:"#/pronomen", filter:"Sem 5", vad:"ἐγώ och σύ i alla kasus" },
      { spel:"Satsanalys", route:"#/satsanalys", vad:"satser med pronomen och negation" },
    ],
    slaupp:[
      { text:"2:a-dekl feminina", anchor:"subst-fem2" },
      { text:"1:a-dekl maskulina", anchor:"subst-mask1" },
      { text:"Bestämd artikel", anchor:"artikel" },
      { text:"Negation", anchor:"negation" },
      { text:"Pronomen", anchor:"pronomen" },
    ],
    mal:"Du läser genus ur artikeln, inte ur ändelsen, och hanterar ἐγώ/σύ i alla kasus.",
  },

  {
    n:6, titel:"Pronomensystemet, πᾶς, adverb och futurum",
    tema:"Pronomenfamiljen växer, en ny ordklass och ett helt nytt tempus tillkommer.",
    nytt:[
      "Personligt pronomen αὐτός (han/hon/den) — och ’samma’/’själv’",
      "Demonstrativa οὗτος (denne) och ἐκεῖνος (den där)",
      "Interrogativa τίς; (vem?) och adverbet ποῦ; (var?)",
      "πᾶς πᾶσα πᾶν (hel, varje, alla)",
      "Adverb — en ny ordklass",
      "Futurum — ett nytt tempus",
    ],
    begrepp:[
      { rubrik:"αὐτός — tre uppgifter",
        text:"<span class='grek'>αὐτός</span> är (1) tredje personens pronomen ’han/hon/den’ i genitiv/dativ/ackusativ, (2) ’samma’ i attributiv ställning (<span class='grek'>ὁ αὐτὸς λόγος</span>), (3) ’själv’ i predikativ (<span class='grek'>αὐτὸς ὁ λόγος</span>)." },
      { rubrik:"Demonstrativa och interrogativa",
        text:"<span class='grek'>οὗτος</span> (’denne’) och <span class='grek'>ἐκεῖνος</span> (’den där’) kongruerar med sitt substantiv. <span class='grek'>τίς;</span> frågar ’vem/vad?’ med akut accent — förväxla det inte med enklitiskt <span class='grek'>τις</span> ’någon’ (kommer i sem 7)." },
      { rubrik:"Adverb — den oböjliga ordklassen",
        text:"Adverb (<span class='grek'>ποῦ</span> ’var’, <span class='grek'>νῦν</span> ’nu’) böjs inte alls. Många bildas ur adjektiv och beskriver hur, var eller när något sker." },
      { rubrik:"Futurum = σ-tecknet",
        text:"Ett nytt tempus bildas genom att skjuta in ett <b><span class='grek'>σ</span></b> mellan stam och ändelse: <span class='grek'>λύω → λύσω</span> ’jag ska lösa’, <span class='grek'>φιλέω → φιλήσω</span>. Ser du ett <span class='grek'>-σ-</span> före ändelsen — tänk framtid." },
      { rubrik:"πᾶς — blandad böjning",
        text:"<span class='grek'>πᾶς, πᾶσα, πᾶν</span> böjs dels efter tredje deklinationen (maskulinum/neutrum), dels efter första (femininum) — en försmak av tredje deklinationen som kommer i sem 7." },
    ],
    fallor:[
      "<span class='grek'>τίς;</span> med accent = frågan ’vem?’; <span class='grek'>τις</span> utan = ’någon’ (obetonat).",
      "Futurum smyger sig in som ett litet <span class='grek'>σ</span> — missa det inte i läsningen.",
    ],
    ova:[
      { spel:"Pronomen", route:"#/pronomen", filter:"Sem 6", vad:"αὐτός, οὗτος, ἐκεῖνος, τίς" },
      { spel:"Verb", route:"#/verb", filter:"futurum", vad:"σ-tempuset på regelbundna verb" },
      { spel:"Satsanalys", route:"#/satsanalys", filter:"nivå 13–15", vad:"pronomen, interrogativa och futurum" },
      { spel:"Glosor", route:"#/glosor", filter:"Sem 6", vad:"det nyaste ordförrådet" },
    ],
    slaupp:[
      { text:"αὐτός", anchor:"pron-autos" },
      { text:"Demonstrativa", anchor:"pron-demonstr" },
      { text:"Interrogativa", anchor:"pron-interrog" },
      { text:"Adverb", anchor:"adverb" },
      { text:"Futurum", anchor:"verb-futurum" },
    ],
    mal:"Du känner igen σ-futurum vid läsning och hanterar hela pronomenfamiljen αὐτός/οὗτος/ἐκεῖνος/τίς.",
  },

  {
    n:7, titel:"Det som väntar", preliminar:true,
    tema:"Förberett i övningsdatan, men ännu inte i spelen eller grammatikreferensen — läggs in när kursens material för seminarium 7 är här.",
    nytt:[
      "Futurumklasser: σ möter konsonant → ψ, ξ eller σ (γράφω → γράψω, ἄγω → ἄξω)",
      "Infinitiv — ny modus (λύειν, φιλεῖν, εἶναι)",
      "Presens imperativ — befallningsform (λῦε ’lös!’)",
      "Imperfekt — dåtid med augment (ἔλυον ’jag höll på att lösa’)",
      "Oregelbundna adjektiv μέγας (stor) och πολύς (mycket)",
      "Possessiva (ἐμός, σός) och indefinita (τις) pronomen",
      "Tredje deklinationen — stambaserad böjning (ἡγεμών)",
    ],
    begrepp:[
      { rubrik:"Futurumets ljudmöten",
        text:"När futurumets <span class='grek'>σ</span> möter en konsonant smälter de samman: labial + σ → <span class='grek'>ψ</span> (<span class='grek'>γράφω → γράψω</span>), velar + σ → <span class='grek'>ξ</span> (<span class='grek'>ἄγω → ἄξω</span>), dental + σ → <span class='grek'>σ</span> (<span class='grek'>πείθω → πείσω</span>)." },
      { rubrik:"Nya modus: infinitiv och imperativ",
        text:"<b>Modus</b> är verbets sätt att framställa handlingen — som ett faktiskt påstående, en befallning, en önskan. Hittills har verben stått i <b>indikativ</b> (påstående). Nu tillkommer <b>infinitiven</b> (<span class='grek'>λύειν</span> ’att lösa’), en oböjd grundform, och <b>imperativen</b> (<span class='grek'>λῦε</span> ’lös!’) som uttrycker befallning." },
      { rubrik:"Imperfekt och augmentet",
        text:"Imperfekt beskriver pågående dåtid. Det känns igen på <b>augmentet</b> — ett <span class='grek'>ἐ-</span> framför stammen (<span class='grek'>λύω → ἔλυον</span>), som vid vokalstam blir förlängning (<span class='grek'>ἀκούω → ἤκουον</span>)." },
      { rubrik:"Tredje deklinationen — en ny princip",
        text:"Hittills har ändelserna kunnat härledas ur genus. Tredje deklinationen är <b>stambaserad</b>: du måste kunna <i>genitivstammen</i> (<span class='grek'>ἡγεμών</span>, gen. <span class='grek'>ἡγεμόνος</span>) och lägga ändelserna på den. Därför lär man in dessa ord som par — nominativ + genitiv." },
    ],
    fallor:[
      "Detta avsnitt är en förhandstitt: formerna finns i övningsdatan men är ännu inte inlagda i spelen eller grammatikreferensen. Vänta med att drilla tills kursen når hit.",
    ],
    ova:[],
    slaupp:[],
  },
];

function esc(s){ return String(s).replace(/[&<>]/g, c => ({ "&":"&amp;", "<":"&lt;", ">":"&gt;" }[c])); }

function seminariumHTML(s){
  const kommande = s.preliminar;
  const nytt = s.nytt.map(x => `<li>${x}</li>`).join("");
  const begrepp = s.begrepp.map(b =>
    `<div class="begrepp-item"><p class="rubrik">${b.rubrik}</p><p>${b.text}</p></div>`).join("");
  const fallor = s.fallor.length
    ? `<div class="block fallor"><span class="tag">${kommande ? "Obs" : "Fälla"}</span>
        <ul>${s.fallor.map(f => `<li>${f}</li>`).join("")}</ul></div>`
    : "";
  const ova = s.ova.length
    ? `<div class="block ova"><span class="tag">Öva</span>
        <div class="ova-lista">${s.ova.map(o => {
          const filter = o.filter ? `<span class="filter">${o.filter}</span>` : "";
          return `<div class="ova-rad"><a class="spel" href="${o.route}">${o.spel}</a>${filter}<span class="vad">${o.vad}</span></div>`;
        }).join("")}</div></div>`
    : "";
  const slaupp = s.slaupp.length
    ? `<div class="slaupp"><span class="tag">Slå upp</span><span class="lankar">${
        s.slaupp.map(l => `<a href="grammatikreferens.html#${l.anchor}">${l.text}</a>`).join("")
      }</span></div>`
    : "";
  const mal = s.mal
    ? `<div class="mal"><span class="tag">Mål</span><span>${s.mal}</span></div>`
    : "";
  const nodInner = kommande ? "7" : s.n;
  const badge = kommande ? `<span class="badge">Kommande</span>` : "";
  const rubrikNr = kommande ? "Seminarium 7 —" : `Seminarium ${s.n} —`;

  return `<div class="steg${kommande ? " kommande" : ""}">
    <div class="nod${kommande ? " nod-kommande" : ""}">${nodInner}</div>
    <div class="steg-titel">${rubrikNr} ${esc(s.titel)} ${badge}</div>
    <div class="steg-tema">${esc(s.tema)}</div>
    <div class="block nytt"><span class="tag">Nytt</span><ul>${nytt}</ul></div>
    <div class="block begrepp"><span class="tag">Begrepp</span><div class="begrepp-inner">${begrepp}</div></div>
    ${fallor}
    ${ova}
    ${slaupp}
    ${mal}
  </div>`;
}

const MARKUP = `<div class="vy vy-studieguide">
<div class="wrap">

  <header>
    <h1>Bibelgrekiska I — Studieguide</h1>
    <div class="sub">En sammanfattning av kursen seminarium för seminarium — begreppen, fällorna och var du övar.</div>
  </header>

  <div class="guide-info">
    <h2>Så använder du guiden</h2>
    <p>Guiden går igenom kursen ett seminarium i taget. För varje seminarium hittar du <b>vad som är nytt</b>, <b>begreppen bakom</b> och <b>fällorna</b> att se upp med — samt länkar vidare till rätt spel (<i>Öva</i>) och rätt kort i grammatikreferensen (<i>Slå upp</i>).</p>
  </div>

  <div class="principer">
    <h2>Tre principer som håller genom hela kursen</h2>
    ${PRINCIPER.map((p, i) => `<div class="princip-item"><span class="pnum">${i+1}</span><div><b>${p.rubrik}.</b> ${p.text}</div></div>`).join("")}
  </div>

  <div class="stege">${SEMINARIER.map(seminariumHTML).join("")}</div>

  <footer>
    Tänk på grammatikreferensen som teknikgenomgången och spelen som gymmet: läs greppet här i guiden, slå upp tabellen i referensen, och nöt repetitionerna i spelet tills formen sitter.
  </footer>

</div>
</div>`;

export function render(root){
  root.innerHTML = MARKUP;
}
