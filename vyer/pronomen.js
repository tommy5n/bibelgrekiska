// Vy: Pronomen — personliga (ἐγώ, σύ), 3:e person + demonstrativa + interrogativa.
// Snapshot av pronomen.json (mastern). Formerna är verifierade — ej genererade här.
// Två frågemodeller styrda av 'modell':
//   person  (ἐγώ, σύ): person + numerus + kasus + betoning (betonad/enklitisk).
//   genus   (αὐτός, οὗτος, ἐκεῖνος, τίς): genus + kasus + numerus, böjs som adjektiv.
// Självförsörjande: injicerar egen .vy-pron-stil (designvariabler från app.css) och städar i teardown.
let __ph = null;

export function teardown(){
  if(__ph){ document.removeEventListener("keydown", __ph); __ph = null; }
  const s = document.getElementById("vy-pron-style");
  if(s) s.remove();
}

/* ── DATA — snapshot av pronomen.json. Regenereras ur mastern vid ändring.
   person: former[num][kas] = [betonad, obetonad]; obetonad=null där särform saknas.
   genus:  former[genus][kas] = {sg, pl}; sv[genus][num][kas] = svensk översättning. ─── */
const pronomen = [
  { lemma:"ἐγώ", glosa:"jag", modell:"person", sem:[5],
    former:{ sg:{ nom:["ἐγώ",null], gen:["ἐμοῦ","μου"], dat:["ἐμοί","μοι"], ack:["ἐμέ","με"] }, pl:{ nom:["ἡμεῖς",null], gen:["ἡμῶν",null], dat:["ἡμῖν",null], ack:["ἡμᾶς",null] } },
    sv:{ sg:{ nom:"jag", gen:"min", dat:"till mig", ack:"mig" }, pl:{ nom:"vi", gen:"vår", dat:"till oss", ack:"oss" } } },
  { lemma:"σύ", glosa:"du", modell:"person", sem:[5],
    former:{ sg:{ nom:["σύ",null], gen:["σοῦ","σου"], dat:["σοί","σοι"], ack:["σέ","σε"] }, pl:{ nom:["ὑμεῖς",null], gen:["ὑμῶν",null], dat:["ὑμῖν",null], ack:["ὑμᾶς",null] } },
    sv:{ sg:{ nom:"du", gen:"din", dat:"till dig", ack:"dig" }, pl:{ nom:"ni", gen:"er", dat:"till er", ack:"er" } } },
  { lemma:"αὐτός", glosa:"han, hon, det (hans, honom, henne, dess, deras)", modell:"genus", sem:[6],
    former:{ m:{ nom:{sg:"αὐτός",pl:"αὐτοί"}, gen:{sg:"αὐτοῦ",pl:"αὐτῶν"}, dat:{sg:"αὐτῷ",pl:"αὐτοῖς"}, ack:{sg:"αὐτόν",pl:"αὐτούς"} }, f:{ nom:{sg:"αὐτή",pl:"αὐταί"}, gen:{sg:"αὐτῆς",pl:"αὐτῶν"}, dat:{sg:"αὐτῇ",pl:"αὐταῖς"}, ack:{sg:"αὐτήν",pl:"αὐτάς"} }, n:{ nom:{sg:"αὐτό",pl:"αὐτά"}, gen:{sg:"αὐτοῦ",pl:"αὐτῶν"}, dat:{sg:"αὐτῷ",pl:"αὐτοῖς"}, ack:{sg:"αὐτό",pl:"αὐτά"} } },
    sv:{ m:{ sg:{nom:"han (själv)", gen:"hans", dat:"till honom", ack:"honom"}, pl:{nom:"de (själva)", gen:"deras", dat:"till dem", ack:"dem"} }, f:{ sg:{nom:"hon (själv)", gen:"hennes", dat:"till henne", ack:"henne"}, pl:{nom:"de (själva)", gen:"deras", dat:"till dem", ack:"dem"} }, n:{ sg:{nom:"det (självt)", gen:"dess", dat:"till det", ack:"det"}, pl:{nom:"de (själva)", gen:"deras", dat:"till dem", ack:"dem"} } } },
  { lemma:"οὗτος", glosa:"denne, denna, detta (den här)", modell:"genus", sem:[6],
    former:{ m:{ nom:{sg:"οὗτος",pl:"οὗτοι"}, gen:{sg:"τούτου",pl:"τούτων"}, dat:{sg:"τούτῳ",pl:"τούτοις"}, ack:{sg:"τοῦτον",pl:"τούτους"} }, f:{ nom:{sg:"αὕτη",pl:"αὗται"}, gen:{sg:"ταύτης",pl:"τούτων"}, dat:{sg:"ταύτῃ",pl:"ταύταις"}, ack:{sg:"ταύτην",pl:"ταύτας"} }, n:{ nom:{sg:"τοῦτο",pl:"ταῦτα"}, gen:{sg:"τούτου",pl:"τούτων"}, dat:{sg:"τούτῳ",pl:"τούτοις"}, ack:{sg:"τοῦτο",pl:"ταῦτα"} } },
    sv:{ m:{ sg:{nom:"denne", gen:"dennes", dat:"till denne", ack:"denne"}, pl:{nom:"dessa", gen:"dessas", dat:"till dessa", ack:"dessa"} }, f:{ sg:{nom:"denna", gen:"dennas", dat:"till denna", ack:"denna"}, pl:{nom:"dessa", gen:"dessas", dat:"till dessa", ack:"dessa"} }, n:{ sg:{nom:"detta", gen:"dettas", dat:"till detta", ack:"detta"}, pl:{nom:"dessa (detta)", gen:"dessas", dat:"till dessa", ack:"dessa"} } } },
  { lemma:"ἐκεῖνος", glosa:"den där, det där", modell:"genus", sem:[6],
    former:{ m:{ nom:{sg:"ἐκεῖνος",pl:"ἐκεῖνοι"}, gen:{sg:"ἐκείνου",pl:"ἐκείνων"}, dat:{sg:"ἐκείνῳ",pl:"ἐκείνοις"}, ack:{sg:"ἐκεῖνον",pl:"ἐκείνους"} }, f:{ nom:{sg:"ἐκείνη",pl:"ἐκεῖναι"}, gen:{sg:"ἐκείνης",pl:"ἐκείνων"}, dat:{sg:"ἐκείνῃ",pl:"ἐκείναις"}, ack:{sg:"ἐκείνην",pl:"ἐκείνας"} }, n:{ nom:{sg:"ἐκεῖνο",pl:"ἐκεῖνα"}, gen:{sg:"ἐκείνου",pl:"ἐκείνων"}, dat:{sg:"ἐκείνῳ",pl:"ἐκείνοις"}, ack:{sg:"ἐκεῖνο",pl:"ἐκεῖνα"} } },
    sv:{ m:{ sg:{nom:"den där", gen:"den därs", dat:"till den där", ack:"den där"}, pl:{nom:"de där", gen:"de därs", dat:"till de där", ack:"de där"} }, f:{ sg:{nom:"den där", gen:"den därs", dat:"till den där", ack:"den där"}, pl:{nom:"de där", gen:"de därs", dat:"till de där", ack:"de där"} }, n:{ sg:{nom:"det där", gen:"det därs", dat:"till det där", ack:"det där"}, pl:{nom:"de där", gen:"de därs", dat:"till de där", ack:"de där"} } } },
  { lemma:"τίς", glosa:"vem?, vad?, vilken?", modell:"genus", sem:[6],
    former:{ m:{ nom:{sg:"τίς",pl:"τίνες"}, gen:{sg:"τίνος",pl:"τίνων"}, dat:{sg:"τίνι",pl:"τίσι(ν)"}, ack:{sg:"τίνα",pl:"τίνας"} }, f:{ nom:{sg:"τίς",pl:"τίνες"}, gen:{sg:"τίνος",pl:"τίνων"}, dat:{sg:"τίνι",pl:"τίσι(ν)"}, ack:{sg:"τίνα",pl:"τίνας"} }, n:{ nom:{sg:"τί",pl:"τίνα"}, gen:{sg:"τίνος",pl:"τίνων"}, dat:{sg:"τίνι",pl:"τίσι(ν)"}, ack:{sg:"τί",pl:"τίνα"} } },
    sv:{ m:{ sg:{nom:"vem?", gen:"vems?", dat:"till vem?", ack:"vem?"}, pl:{nom:"vilka?", gen:"vilkas?", dat:"till vilka?", ack:"vilka?"} }, f:{ sg:{nom:"vem?", gen:"vems?", dat:"till vem?", ack:"vem?"}, pl:{nom:"vilka?", gen:"vilkas?", dat:"till vilka?", ack:"vilka?"} }, n:{ sg:{nom:"vad?", gen:"vilkens?", dat:"till vilken?", ack:"vad?"}, pl:{nom:"vilka?", gen:"vilkas?", dat:"till vilka?", ack:"vilka?"} } } },
  { lemma:"ἐμός", glosa:"min, mitt, mina", modell:"genus", sem:[7],
    former:{ m:{ nom:{sg:"ἐμός",pl:"ἐμοί"}, gen:{sg:"ἐμοῦ",pl:"ἐμῶν"}, dat:{sg:"ἐμῷ",pl:"ἐμοῖς"}, ack:{sg:"ἐμόν",pl:"ἐμούς"} }, f:{ nom:{sg:"ἐμή",pl:"ἐμαί"}, gen:{sg:"ἐμῆς",pl:"ἐμῶν"}, dat:{sg:"ἐμῇ",pl:"ἐμαῖς"}, ack:{sg:"ἐμήν",pl:"ἐμάς"} }, n:{ nom:{sg:"ἐμόν",pl:"ἐμά"}, gen:{sg:"ἐμοῦ",pl:"ἐμῶν"}, dat:{sg:"ἐμῷ",pl:"ἐμοῖς"}, ack:{sg:"ἐμόν",pl:"ἐμά"} } },
    sv:{ m:{ sg:{nom:"min", gen:"min", dat:"min", ack:"min"}, pl:{nom:"mina", gen:"mina", dat:"mina", ack:"mina"} }, f:{ sg:{nom:"min", gen:"min", dat:"min", ack:"min"}, pl:{nom:"mina", gen:"mina", dat:"mina", ack:"mina"} }, n:{ sg:{nom:"mitt", gen:"mitt", dat:"mitt", ack:"mitt"}, pl:{nom:"mina", gen:"mina", dat:"mina", ack:"mina"} } } },
  { lemma:"σός", glosa:"din, ditt, dina", modell:"genus", sem:[7],
    former:{ m:{ nom:{sg:"σός",pl:"σοί"}, gen:{sg:"σοῦ",pl:"σῶν"}, dat:{sg:"σῷ",pl:"σοῖς"}, ack:{sg:"σόν",pl:"σούς"} }, f:{ nom:{sg:"σή",pl:"σαί"}, gen:{sg:"σῆς",pl:"σῶν"}, dat:{sg:"σῇ",pl:"σαῖς"}, ack:{sg:"σήν",pl:"σάς"} }, n:{ nom:{sg:"σόν",pl:"σά"}, gen:{sg:"σοῦ",pl:"σῶν"}, dat:{sg:"σῷ",pl:"σοῖς"}, ack:{sg:"σόν",pl:"σά"} } },
    sv:{ m:{ sg:{nom:"din", gen:"din", dat:"din", ack:"din"}, pl:{nom:"dina", gen:"dina", dat:"dina", ack:"dina"} }, f:{ sg:{nom:"din", gen:"din", dat:"din", ack:"din"}, pl:{nom:"dina", gen:"dina", dat:"dina", ack:"dina"} }, n:{ sg:{nom:"ditt", gen:"ditt", dat:"ditt", ack:"ditt"}, pl:{nom:"dina", gen:"dina", dat:"dina", ack:"dina"} } } },
  { lemma:"ἡμέτερος", glosa:"vår, vårt, våra", modell:"genus", sem:[7],
    former:{ m:{ nom:{sg:"ἡμέτερος",pl:"ἡμέτεροι"}, gen:{sg:"ἡμετέρου",pl:"ἡμετέρων"}, dat:{sg:"ἡμετέρῳ",pl:"ἡμετέροις"}, ack:{sg:"ἡμέτερον",pl:"ἡμετέρους"} }, f:{ nom:{sg:"ἡμετέρα",pl:"ἡμέτεραι"}, gen:{sg:"ἡμετέρας",pl:"ἡμετέρων"}, dat:{sg:"ἡμετέρᾳ",pl:"ἡμετέραις"}, ack:{sg:"ἡμετέραν",pl:"ἡμετέρας"} }, n:{ nom:{sg:"ἡμέτερον",pl:"ἡμέτερα"}, gen:{sg:"ἡμετέρου",pl:"ἡμετέρων"}, dat:{sg:"ἡμετέρῳ",pl:"ἡμετέροις"}, ack:{sg:"ἡμέτερον",pl:"ἡμέτερα"} } },
    sv:{ m:{ sg:{nom:"vår", gen:"vår", dat:"vår", ack:"vår"}, pl:{nom:"våra", gen:"våra", dat:"våra", ack:"våra"} }, f:{ sg:{nom:"vår", gen:"vår", dat:"vår", ack:"vår"}, pl:{nom:"våra", gen:"våra", dat:"våra", ack:"våra"} }, n:{ sg:{nom:"vårt", gen:"vårt", dat:"vårt", ack:"vårt"}, pl:{nom:"våra", gen:"våra", dat:"våra", ack:"våra"} } } },
  { lemma:"ὑμέτερος", glosa:"er, ert, era", modell:"genus", sem:[7],
    former:{ m:{ nom:{sg:"ὑμέτερος",pl:"ὑμέτεροι"}, gen:{sg:"ὑμετέρου",pl:"ὑμετέρων"}, dat:{sg:"ὑμετέρῳ",pl:"ὑμετέροις"}, ack:{sg:"ὑμέτερον",pl:"ὑμετέρους"} }, f:{ nom:{sg:"ὑμετέρα",pl:"ὑμέτεραι"}, gen:{sg:"ὑμετέρας",pl:"ὑμετέρων"}, dat:{sg:"ὑμετέρᾳ",pl:"ὑμετέραις"}, ack:{sg:"ὑμετέραν",pl:"ὑμετέρας"} }, n:{ nom:{sg:"ὑμέτερον",pl:"ὑμέτερα"}, gen:{sg:"ὑμετέρου",pl:"ὑμετέρων"}, dat:{sg:"ὑμετέρῳ",pl:"ὑμετέροις"}, ack:{sg:"ὑμέτερον",pl:"ὑμέτερα"} } },
    sv:{ m:{ sg:{nom:"er", gen:"er", dat:"er", ack:"er"}, pl:{nom:"era", gen:"era", dat:"era", ack:"era"} }, f:{ sg:{nom:"er", gen:"er", dat:"er", ack:"er"}, pl:{nom:"era", gen:"era", dat:"era", ack:"era"} }, n:{ sg:{nom:"ert", gen:"ert", dat:"ert", ack:"ert"}, pl:{nom:"era", gen:"era", dat:"era", ack:"era"} } } },
  { lemma:"τις", glosa:"någon, något", modell:"genus", sem:[7],
    former:{ m:{ nom:{sg:"τις",pl:"τινές"}, gen:{sg:"τινός",pl:"τινῶν"}, dat:{sg:"τινί",pl:"τισί(ν)"}, ack:{sg:"τινά",pl:"τινάς"} }, f:{ nom:{sg:"τις",pl:"τινές"}, gen:{sg:"τινός",pl:"τινῶν"}, dat:{sg:"τινί",pl:"τισί(ν)"}, ack:{sg:"τινά",pl:"τινάς"} }, n:{ nom:{sg:"τι",pl:"τινά"}, gen:{sg:"τινός",pl:"τινῶν"}, dat:{sg:"τινί",pl:"τισί(ν)"}, ack:{sg:"τι",pl:"τινά"} } },
    sv:{ m:{ sg:{nom:"någon", gen:"någons", dat:"åt någon", ack:"någon"}, pl:{nom:"några", gen:"någras", dat:"åt några", ack:"några"} }, f:{ sg:{nom:"någon", gen:"någons", dat:"åt någon", ack:"någon"}, pl:{nom:"några", gen:"någras", dat:"åt några", ack:"några"} }, n:{ sg:{nom:"något", gen:"någots", dat:"åt något", ack:"något"}, pl:{nom:"några", gen:"någras", dat:"åt några", ack:"några"} } } }
];

/* ── SATSBANK — snapshot av pronomen-satser.json. Regenereras ur mastern:
     python3 scripts/gen_pronomen_satser_snapshot.py
   Driver riktningen "grekiska → svenska": en sats, ett utpekat pronomen (ord[i]),
   och dess svenska översättning I DEN SATSEN. Formen ensam räcker inte — 32 % av
   målen har en form som tillåter fler än en analys — så kontexten är själva
   frågan, inte dekor. ─────────────────────────────────────────────────────── */
const satser = [
  { id:"p5-01", sem:5, skapad:false,
    kalla:"Breakout rooms 5, s. 2",
    sv:"Vi söker er.",
    ord:["ζητοῦμεν", "ὑμᾶς."],
    mal:[
      { i:1, form:"ὑμᾶς", lemma:"σύ", modell:"person", num:"pl", kas:"ack", bet:"betonad", genus:null, roll:"do", sv:"er" } ] },
  { id:"p5-02", sem:5, skapad:false,
    kalla:"Breakout rooms 5, s. 2",
    sv:"De predikar för er.",
    ord:["κηρύσσουσιν", "ὑμῖν."],
    mal:[
      { i:1, form:"ὑμῖν", lemma:"σύ", modell:"person", num:"pl", kas:"dat", bet:"betonad", genus:null, roll:"io", sv:"för er", not:"Dativen ensam bär 'för' — ingen preposition står i grekiskan." } ] },
  { id:"p5-03", sem:5, skapad:false,
    kalla:"Breakout rooms 5, s. 2",
    sv:"Han/hon gillar dig.",
    ord:["φιλεῖ", "σε."],
    mal:[
      { i:1, form:"σε", lemma:"σύ", modell:"person", num:"sg", kas:"ack", bet:"obetonad", genus:null, roll:"do", sv:"dig" } ] },
  { id:"p5-04", sem:5, skapad:false,
    kalla:"Breakout rooms 5, s. 2",
    sv:"Han talar om dig.",
    ord:["λέγει", "περὶ", "σοῦ."],
    mal:[
      { i:2, form:"σοῦ", lemma:"σύ", modell:"person", num:"sg", kas:"gen", bet:"betonad", genus:null, roll:"prep", sv:"dig", ocksa:[{sv:"din", etikett:"σός maskulinum genitiv singular"}, {sv:"ditt", etikett:"σός neutrum genitiv singular"}], not:"Efter preposition står den betonade formen σοῦ, inte enklitikan σου. Att περί styr genitiv gör σοῦ till rektion — inte till possessivet σός." } ] },
  { id:"p5-05", sem:5, skapad:false,
    kalla:"Breakout rooms 5, s. 2",
    sv:"De tror inte på oss.",
    ord:["οὐ", "πιστεύουσιν", "ἡμῖν."],
    mal:[
      { i:2, form:"ἡμῖν", lemma:"ἐγώ", modell:"person", num:"pl", kas:"dat", bet:"betonad", genus:null, roll:"obj-dat", sv:"på oss", not:"πιστεύω styr dativ: ἡμῖν är verbets objekt, inte en mottagare. Svenskan väljer 'på' — dativen har ingen fast svensk motsvarighet." } ] },
  { id:"p5-06", sem:5, skapad:false,
    kalla:"Breakout rooms 5, s. 2",
    sv:"Du talar med mig.",
    ord:["λαλεῖς", "μοι."],
    mal:[
      { i:1, form:"μοι", lemma:"ἐγώ", modell:"person", num:"sg", kas:"dat", bet:"obetonad", genus:null, roll:"io", sv:"med mig", not:"λαλέω + dativ. Här blir dativens svenska 'med' — jämför 'för er' i p5-02." } ] },
  { id:"p6-01", sem:6, skapad:false,
    kalla:"Breakout rooms 6, s. 1",
    sv:"Jag döper dig",
    ord:["βαπτίζω", "σε"],
    mal:[
      { i:1, form:"σε", lemma:"σύ", modell:"person", num:"sg", kas:"ack", bet:"obetonad", genus:null, roll:"do", sv:"dig" } ] },
  { id:"p6-02", sem:6, skapad:false,
    kalla:"Breakout rooms 6, s. 1",
    sv:"Du döper mig",
    ord:["βαπτίζεις", "με"],
    mal:[
      { i:1, form:"με", lemma:"ἐγώ", modell:"person", num:"sg", kas:"ack", bet:"obetonad", genus:null, roll:"do", sv:"mig" } ] },
  { id:"p6-03", sem:6, skapad:false,
    kalla:"Breakout rooms 6, s. 1",
    sv:"Hennes bror",
    ord:["ὁ", "ἀδελφὸς", "αὐτῆς"],
    mal:[
      { i:2, form:"αὐτῆς", lemma:"αὐτός", modell:"genus", num:"sg", kas:"gen", bet:null, genus:"f", roll:"gen", sv:"hennes", not:"Genitiven av αὐτός är possessiv. Femininum αὐτῆς → 'hennes'; jämför αὐτοῦ → 'hans'." } ] },
  { id:"p6-04", sem:6, skapad:false,
    kalla:"Breakout rooms 6, s. 1",
    sv:"Vår syster",
    ord:["ἡ", "ἀδελφὴ", "ἡμῶν"],
    mal:[
      { i:2, form:"ἡμῶν", lemma:"ἐγώ", modell:"person", num:"pl", kas:"gen", bet:"betonad", genus:null, roll:"gen", sv:"vår" } ] },
  { id:"p6-05", sem:6, skapad:false,
    kalla:"Breakout rooms 6, s. 1",
    sv:"Hon döper dem",
    ord:["αὕτη", "βαπτίζει", "αὐτούς"],
    mal:[
      { i:0, form:"αὕτη", lemma:"οὗτος", modell:"genus", num:"sg", kas:"nom", bet:null, genus:"f", roll:"subj", sv:"hon", alt:["denna"], not:"Demonstrativet står självständigt och översätts som personligt pronomen. Se upp: αὕτη (οὗτος f nom sg) mot αὐτή (αὐτός f nom sg) — bara andhämtningen och accenten skiljer." },
      { i:2, form:"αὐτούς", lemma:"αὐτός", modell:"genus", num:"pl", kas:"ack", bet:null, genus:"m", roll:"do", sv:"dem" } ] },
  { id:"p6-06", sem:6, skapad:false,
    kalla:"Breakout rooms 6, s. 1",
    sv:"Jag talar om dig",
    ord:["λέγω", "περὶ", "σοῦ"],
    mal:[
      { i:2, form:"σοῦ", lemma:"σύ", modell:"person", num:"sg", kas:"gen", bet:"betonad", genus:null, roll:"prep", sv:"dig", ocksa:[{sv:"din", etikett:"σός maskulinum genitiv singular"}, {sv:"ditt", etikett:"σός neutrum genitiv singular"}] } ] },
  { id:"p6-07", sem:6, skapad:false,
    kalla:"Breakout rooms 6, s. 1",
    sv:"Han talar om henne",
    ord:["οὗτος", "λέγει", "περὶ", "αὐτῆς"],
    mal:[
      { i:0, form:"οὗτος", lemma:"οὗτος", modell:"genus", num:"sg", kas:"nom", bet:null, genus:"m", roll:"subj", sv:"han", alt:["denne"] },
      { i:3, form:"αὐτῆς", lemma:"αὐτός", modell:"genus", num:"sg", kas:"gen", bet:null, genus:"f", roll:"prep", sv:"henne", not:"Här är αὐτῆς styrd av περί och blir 'henne' — inte 'hennes' som i p6-03. Rollen avgör." } ] },
  { id:"p6-08", sem:6, skapad:false,
    kalla:"Breakout rooms 6, s. 1",
    sv:"Jesus söker lärjungarna och finner dem i öknen och säger till dem: 'frid över er' (frid till er).",
    ord:["Ὁ", "Ἰησοῦς", "ζητεῖ", "τοὺς", "μαθητὰς", "καὶ", "εὑρίσκει", "αὐτοὺς", "ἐν", "τῇ", "ἐρήμῳ", "καὶ", "λέγει", "αὐτοῖς·", "εἰρήνη", "ὑμῖν."],
    mal:[
      { i:7, form:"αὐτοὺς", lemma:"αὐτός", modell:"genus", num:"pl", kas:"ack", bet:null, genus:"m", roll:"do", sv:"dem", not:"Syftar tillbaka på τοὺς μαθητάς (m pl) — därför maskulinum." },
      { i:13, form:"αὐτοῖς", lemma:"αὐτός", modell:"genus", num:"pl", kas:"dat", bet:null, genus:"m", roll:"io", sv:"till dem", not:"Formen αὐτοῖς är också neutrum pl dat. Att den syftar på lärjungarna gör den maskulin — svenskan blir densamma." },
      { i:15, form:"ὑμῖν", lemma:"σύ", modell:"person", num:"pl", kas:"dat", bet:"betonad", genus:null, roll:"io", sv:"över er", alt:["till er"], not:"εἰρήνη ὑμῖν är en nominalsats utan verb: 'frid (vare) över/till er'." } ] },
  { id:"p6-09", sem:6, skapad:false,
    kalla:"Breakout rooms 6, s. 1",
    sv:"De leder ut honom och för honom mot dödens plats.",
    ord:["ἐξάγουσιν", "αὐτὸν", "καὶ", "φέρουσιν", "αὐτὸν", "ἐπὶ", "τὸν", "τοῦ", "θανάτου", "τόπον."],
    mal:[
      { i:1, form:"αὐτὸν", lemma:"αὐτός", modell:"genus", num:"sg", kas:"ack", bet:null, genus:"m", roll:"do", sv:"honom" },
      { i:4, form:"αὐτὸν", lemma:"αὐτός", modell:"genus", num:"sg", kas:"ack", bet:null, genus:"m", roll:"do", sv:"honom" } ] },
  { id:"p6-10", sem:6, skapad:false,
    kalla:"Breakout rooms 6, s. 1",
    sv:"Vem är det?",
    ord:["τίς", "ἐστιν;"],
    mal:[
      { i:0, form:"τίς", lemma:"τίς", modell:"genus", num:"sg", kas:"nom", bet:null, genus:"m|f", roll:"subj", sv:"vem", not:"τίς har samma form i maskulinum och femininum — kontexten avgör inte här, och svenskan blir 'vem' oavsett." } ] },
  { id:"p6-11", sem:6, skapad:false,
    kalla:"Breakout rooms 6, s. 1",
    sv:"Vems är huset?",
    ord:["τίνος", "ὁ", "οἶκός", "ἐστιν;"],
    mal:[
      { i:0, form:"τίνος", lemma:"τίς", modell:"genus", num:"sg", kas:"gen", bet:null, genus:"m|f", roll:"pf", sv:"vems", ocksa:[{sv:"vilkens?", etikett:"τίς neutrum genitiv singular"}], not:"Predikativ genitiv: 'huset är vems?'" } ] },
  { id:"p6-12", sem:6, skapad:false,
    kalla:"Breakout rooms 6, s. 1",
    sv:"Vilket vin dricker du? (förenat)",
    ord:["τίνα", "οἶνον", "πίνεις;"],
    mal:[
      { i:0, form:"τίνα", lemma:"τίς", modell:"genus", num:"sg", kas:"ack", bet:null, genus:"m", roll:"attr", sv:"vilket", ocksa:[{sv:"vem?", etikett:"τίς femininum ackusativ singular"}, {sv:"vilka?", etikett:"τίς neutrum nominativ plural"}], not:"Förenat med οἶνον (m sg ack) och kongruerar därför i maskulinum — men svenskan får neutrum, eftersom 'vin' är ett neutrum. Genus följer inte över språkgränsen." } ] },
  { id:"p6-13", sem:6, skapad:false,
    kalla:"Breakout rooms 6, s. 1",
    sv:"Vad gör du?",
    ord:["τί", "ποιεῖς;"],
    mal:[
      { i:0, form:"τί", lemma:"τίς", modell:"genus", num:"sg", kas:"ack", bet:null, genus:"n", roll:"do", sv:"vad", ocksa:[{sv:"vad?", etikett:"τίς neutrum nominativ singular"}], not:"Formen τί är både nom och ack. Att ποιέω kräver ett objekt gör den till ackusativ." } ] },
  { id:"p6-14", sem:6, skapad:false,
    kalla:"Breakout rooms 6, s. 1",
    sv:"Med vilka talar ni?",
    ord:["τίσι", "λαλεῖτε;"],
    mal:[
      { i:0, form:"τίσι", lemma:"τίς", modell:"genus", num:"pl", kas:"dat", bet:null, genus:"m|f", roll:"io", sv:"med vilka", ocksa:[{sv:"till vilka?", etikett:"τίς neutrum dativ plural"}] } ] },
  { id:"p6-15", sem:6, skapad:false,
    kalla:"Breakout rooms 6, s. 2",
    sv:"Herren ska tala med dig.",
    ord:["ὁ", "κύριος", "λαλήσει", "σοι."],
    mal:[
      { i:3, form:"σοι", lemma:"σύ", modell:"person", num:"sg", kas:"dat", bet:"obetonad", genus:null, roll:"io", sv:"med dig", not:"Enklitisk form (σοι, inte σοί) — den obetonade används när pronominet inte är emfatiskt." } ] },
  { id:"p6-16", sem:6, skapad:false,
    kalla:"Breakout rooms 6, s. 2",
    sv:"Änglarna ska tala med honom.",
    ord:["οἱ", "ἄγγελοι", "λαλήσουσιν", "αὐτῷ."],
    mal:[
      { i:3, form:"αὐτῷ", lemma:"αὐτός", modell:"genus", num:"sg", kas:"dat", bet:null, genus:"m", roll:"io", sv:"med honom", ocksa:[{sv:"till det", etikett:"αὐτός neutrum dativ singular"}], not:"Referenten är en person, inte en sak — därför 'honom' och inte neutrumets 'till det'." } ] },
  { id:"p6-17", sem:6, skapad:false,
    kalla:"Övningsblad 6, s. 1",
    sv:"De väcker honom och säger till honom, o lärare!",
    ord:["ἐγείρουσιν", "αὐτὸν", "καὶ", "λέγουσιν", "αὐτῷ,", "ὦ", "Διδάσκαλε", "[…]"],
    mal:[
      { i:1, form:"αὐτὸν", lemma:"αὐτός", modell:"genus", num:"sg", kas:"ack", bet:null, genus:"m", roll:"do", sv:"honom" },
      { i:4, form:"αὐτῷ", lemma:"αὐτός", modell:"genus", num:"sg", kas:"dat", bet:null, genus:"m", roll:"io", sv:"till honom", ocksa:[{sv:"till det", etikett:"αὐτός neutrum dativ singular"}], not:"Samma referent som αὐτόν, men dativ — och därför 'till honom', inte 'honom'." } ] },
  { id:"p6-18", sem:6, skapad:false,
    kalla:"Övningsblad 6, s. 1",
    sv:"En röst ur himlen säger: Denne är min älskade son.",
    ord:["φωνὴ", "ἐκ", "τῶν", "οὐρανῶν", "λέγει·", "Οὗτός", "ἐστιν", "ὁ", "υἱός", "μου", "ὁ", "ἀγαπητός"],
    mal:[
      { i:9, form:"μου", lemma:"ἐγώ", modell:"person", num:"sg", kas:"gen", bet:"obetonad", genus:null, roll:"gen", sv:"min", not:"Den obetonade genitiven är det vanliga sättet att säga 'min' — ett possessivt pronomen (ἐμός) behövs inte." } ] },
  { id:"p6-19", sem:6, skapad:false,
    kalla:"Övningsblad 6, s. 1",
    sv:"Johannes Döparen skickar oss till dig.",
    ord:["Ἰωάννης", "ὁ", "βαπτιστὴς", "ἀποστέλλει", "ἡμᾶς", "πρὸς", "σέ."],
    mal:[
      { i:4, form:"ἡμᾶς", lemma:"ἐγώ", modell:"person", num:"pl", kas:"ack", bet:"betonad", genus:null, roll:"do", sv:"oss" },
      { i:6, form:"σέ", lemma:"σύ", modell:"person", num:"sg", kas:"ack", bet:"betonad", genus:null, roll:"prep", sv:"dig", not:"Efter πρός står den betonade σέ, inte enklitiska σε — jämför p6-01 där objektet är σε." } ] },
  { id:"p6-20", sem:6, skapad:false,
    kalla:"Övningsblad 6, s. 1",
    sv:"Du säger detta och förolämpar oss.",
    ord:["ταῦτα", "λέγεις", "καὶ", "ἡμᾶς", "ὑβρίζεις."],
    mal:[
      { i:0, form:"ταῦτα", lemma:"οὗτος", modell:"genus", num:"pl", kas:"ack", bet:null, genus:"n", roll:"do", sv:"detta", alt:["dessa ting", "detta här"], ocksa:[{sv:"dessa (detta)", etikett:"οὗτος neutrum nominativ plural"}], not:"Neutrum plural, men svenskan tar singular 'detta'. λέγεις kräver ett objekt — alltså ackusativ, inte nominativ." },
      { i:3, form:"ἡμᾶς", lemma:"ἐγώ", modell:"person", num:"pl", kas:"ack", bet:"betonad", genus:null, roll:"do", sv:"oss" } ] },
  { id:"p6-21", sem:6, skapad:false,
    kalla:"Övningsblad 6, s. 1",
    sv:"Vem är denne?",
    ord:["τίς", "ἐστιν", "οὗτος;"],
    mal:[
      { i:0, form:"τίς", lemma:"τίς", modell:"genus", num:"sg", kas:"nom", bet:null, genus:"m|f", roll:"pf", sv:"vem" },
      { i:2, form:"οὗτος", lemma:"οὗτος", modell:"genus", num:"sg", kas:"nom", bet:null, genus:"m", roll:"subj", sv:"denne", alt:["han"] } ] },
  { id:"p6-22", sem:6, skapad:false,
    kalla:"Övningsblad 6, s. 1",
    sv:"Och alla ni är bröder.",
    ord:["πάντες", "δὲ", "ὑμεῖς", "ἀδελφοί", "ἐστε"],
    mal:[
      { i:2, form:"ὑμεῖς", lemma:"σύ", modell:"person", num:"pl", kas:"nom", bet:"betonad", genus:null, roll:"subj", sv:"ni", not:"Nominativen saknar enklitisk form: verbändelsen (-τε) räcker för obetonat 'ni'. Att ὑμεῖς står utskrivet är i sig emfatiskt." } ] },
  { id:"p6-23", sem:6, skapad:false,
    kalla:"Övningsblad 6, s. 1",
    sv:"Och Petrus säger, Herre, säger du denna liknelse till oss eller också till alla?",
    ord:["λέγει", "δὲ", "ὁ", "Πέτρος,", "Κύριε,", "πρὸς", "ἡμᾶς", "τὴν", "παραβολὴν", "ταύτην", "λέγεις", "ἢ", "καὶ", "πρὸς", "πάντας;"],
    mal:[
      { i:6, form:"ἡμᾶς", lemma:"ἐγώ", modell:"person", num:"pl", kas:"ack", bet:"betonad", genus:null, roll:"prep", sv:"oss" },
      { i:9, form:"ταύτην", lemma:"οὗτος", modell:"genus", num:"sg", kas:"ack", bet:null, genus:"f", roll:"attr", sv:"denna", not:"Förenat med παραβολήν (f sg ack) och kongruerar med den." } ] },
  { id:"p6-24", sem:6, skapad:false,
    kalla:"Övningsblad 6, s. 1",
    sv:"Och efter sex dagar tog Jesus med sig Petrus och Jakob och Johannes och för dem upp till ett högt berg.",
    ord:["καὶ", "μετὰ", "ἡμέρας", "ἓξ", "παραλαμβάνει", "ὁ", "Ἰησοῦς", "τὸν", "Πέτρον", "καὶ", "τὸν", "Ἰάκωβον", "καὶ", "τὸν", "Ἰωάννην,", "καὶ", "ἀναφέρει", "αὐτοὺς", "εἰς", "ὄρος", "ὑψηλόν."],
    mal:[
      { i:17, form:"αὐτοὺς", lemma:"αὐτός", modell:"genus", num:"pl", kas:"ack", bet:null, genus:"m", roll:"do", sv:"dem", not:"Syftar på de tre namngivna lärjungarna — maskulinum plural." } ] },
  { id:"p6-25", sem:6, skapad:false,
    kalla:"Övningsblad 6, s. 1",
    sv:"Du ska tillbedja Herren, din Gud, och tjäna honom allena.",
    ord:["Κύριον", "τὸν", "θεόν", "σου", "προσκυνήσεις", "καὶ", "αὐτῷ", "μόνῳ", "λατρεύσεις."],
    mal:[
      { i:3, form:"σου", lemma:"σύ", modell:"person", num:"sg", kas:"gen", bet:"obetonad", genus:null, roll:"gen", sv:"din" },
      { i:6, form:"αὐτῷ", lemma:"αὐτός", modell:"genus", num:"sg", kas:"dat", bet:null, genus:"m", roll:"obj-dat", sv:"honom", ocksa:[{sv:"till det", etikett:"αὐτός neutrum dativ singular"}], not:"λατρεύω styr dativ: αὐτῷ är verbets objekt, inte en mottagare. Svenskans 'tjäna' tar direkt objekt — därför 'honom' utan preposition." } ] },
  { id:"p7-01", sem:7, skapad:false,
    kalla:"Övningsblad 7, s. 1",
    sv:"Och vingårdens herre säger: vad ska jag göra? Jag ska skicka min älskade son.",
    ord:["λέγει", "δὲ", "ὁ", "κύριος", "τοῦ", "ἀμπελῶνος,", "Τί", "ποιήσω;", "πέμψω", "τὸν", "υἱόν", "μου", "ἀγαπητόν·"],
    mal:[
      { i:6, form:"Τί", lemma:"τίς", modell:"genus", num:"sg", kas:"ack", bet:null, genus:"n", roll:"do", sv:"vad", ocksa:[{sv:"vad?", etikett:"τίς neutrum nominativ singular"}] },
      { i:11, form:"μου", lemma:"ἐγώ", modell:"person", num:"sg", kas:"gen", bet:"obetonad", genus:null, roll:"gen", sv:"min" } ] },
  { id:"p7-02", sem:7, skapad:false,
    kalla:"Övningsblad 7, s. 1",
    sv:"Och er lön ska vara stor, och ni ska vara den högstes söner.",
    ord:["καὶ", "ἔσται", "ὁ", "μισθὸς", "ὑμῶν", "πολύς,", "καὶ", "ἔσεσθε", "υἱοὶ", "τοῦ", "ὑψίστου"],
    mal:[
      { i:4, form:"ὑμῶν", lemma:"σύ", modell:"person", num:"pl", kas:"gen", bet:"betonad", genus:null, roll:"gen", sv:"er" } ] },
  { id:"p7-03", sem:7, skapad:false,
    kalla:"Övningsblad 7, s. 1",
    sv:"Kärlekens och fridens Gud ska vara med er.",
    ord:["ὁ", "θεὸς", "τῆς", "ἀγάπης", "καὶ", "εἰρήνης", "ἔσται", "μεθ’", "ὑμῶν"],
    mal:[
      { i:8, form:"ὑμῶν", lemma:"σύ", modell:"person", num:"pl", kas:"gen", bet:"betonad", genus:null, roll:"prep", sv:"er", not:"Samma form som i p7-02, men här styrd av μετά ('med') — alltså 'er', inte 'er' som attribut. Rollen skiljer, inte formen." } ] },
  { id:"p7-04", sem:7, skapad:false,
    kalla:"Övningsblad 7, s. 1",
    sv:"Jesus säger alltså till dem, Min tid är ännu inte inne, men er tid är alltid redo.",
    ord:["λέγει", "οὖν", "αὐτοῖς", "ὁ", "Ἰησοῦς,", "Ὁ", "καιρὸς", "ὁ", "ἐμὸς", "οὔπω", "πάρεστιν,", "ὁ", "δὲ", "καιρὸς", "ὁ", "ὑμέτερος", "πάντοτέ", "ἐστιν", "ἕτοιμος."],
    mal:[
      { i:2, form:"αὐτοῖς", lemma:"αὐτός", modell:"genus", num:"pl", kas:"dat", bet:null, genus:"m", roll:"io", sv:"till dem" },
      { i:8, form:"ἐμὸς", lemma:"ἐμός", modell:"genus", num:"sg", kas:"nom", bet:null, genus:"m", roll:"attr", sv:"min", not:"Possessivt adjektiv: kongruerar med καιρός (m sg nom). Jämför den obetonade genitiven μου, som aldrig böjer sig efter huvudordet." },
      { i:15, form:"ὑμέτερος", lemma:"ὑμέτερος", modell:"genus", num:"sg", kas:"nom", bet:null, genus:"m", roll:"attr", sv:"er" } ] },
  { id:"p7-05", sem:7, skapad:false,
    kalla:"Övningsblad 7, s. 1",
    sv:"Och jag säger till dig att du (betonat) är Petrus, och på denna klippa ska jag bygga min kyrka.",
    ord:["ἐγὼ", "δέ", "σοι", "λέγω", "ὅτι", "σὺ", "εἶ", "Πέτρος,", "καὶ", "ἐπὶ", "ταύτῃ", "τῇ", "πέτρᾳ", "οἰκοδομήσω", "μου", "τὴν", "ἐκκλησίαν."],
    mal:[
      { i:0, form:"ἐγὼ", lemma:"ἐγώ", modell:"person", num:"sg", kas:"nom", bet:"betonad", genus:null, roll:"subj", sv:"jag", not:"Utskriven nominativ är alltid emfatisk — verbändelsen -ω räcker annars." },
      { i:2, form:"σοι", lemma:"σύ", modell:"person", num:"sg", kas:"dat", bet:"obetonad", genus:null, roll:"io", sv:"till dig" },
      { i:5, form:"σὺ", lemma:"σύ", modell:"person", num:"sg", kas:"nom", bet:"betonad", genus:null, roll:"subj", sv:"du" },
      { i:10, form:"ταύτῃ", lemma:"οὗτος", modell:"genus", num:"sg", kas:"dat", bet:null, genus:"f", roll:"attr", sv:"denna", not:"Förenat med πέτρᾳ (f sg dat) efter ἐπί." },
      { i:14, form:"μου", lemma:"ἐγώ", modell:"person", num:"sg", kas:"gen", bet:"obetonad", genus:null, roll:"gen", sv:"min" } ] },
  { id:"p7-06", sem:7, skapad:false,
    kalla:"Övningsblad 7, s. 1",
    sv:"Läraren säger, min tid är nära; hos dig firar jag (ordagrant: gör jag) påskmåltiden med mina lärjungar.",
    ord:["Ὁ", "διδάσκαλος", "λέγει,", "Ὁ", "καιρός", "μου", "ἐγγύς", "ἐστιν·", "πρὸς", "σὲ", "ποιῶ", "τὸ", "πάσχα", "μετὰ", "τῶν", "μαθητῶν", "μου."],
    mal:[
      { i:5, form:"μου", lemma:"ἐγώ", modell:"person", num:"sg", kas:"gen", bet:"obetonad", genus:null, roll:"gen", sv:"min" },
      { i:9, form:"σὲ", lemma:"σύ", modell:"person", num:"sg", kas:"ack", bet:"betonad", genus:null, roll:"prep", sv:"dig" },
      { i:16, form:"μου", lemma:"ἐγώ", modell:"person", num:"sg", kas:"gen", bet:"obetonad", genus:null, roll:"gen", sv:"mina", not:"Exakt samma grekiska form som det första μου i satsen, men här 'mina' — huvudordet μαθητῶν är plural. Svenskan böjer possessiven; grekiskan gör det inte." } ] },
  { id:"p7-07", sem:7, skapad:false,
    kalla:"Övningsblad 7, s. 1",
    sv:"Vem är min mor, och vilka är mina bröder?",
    ord:["Τίς", "ἐστιν", "ἡ", "μήτηρ", "μου,", "καὶ", "τίνες", "εἰσὶν", "οἱ", "ἀδελφοί", "μου;"],
    mal:[
      { i:0, form:"Τίς", lemma:"τίς", modell:"genus", num:"sg", kas:"nom", bet:null, genus:"m|f", roll:"pf", sv:"vem" },
      { i:4, form:"μου", lemma:"ἐγώ", modell:"person", num:"sg", kas:"gen", bet:"obetonad", genus:null, roll:"gen", sv:"min" },
      { i:6, form:"τίνες", lemma:"τίς", modell:"genus", num:"pl", kas:"nom", bet:null, genus:"m", roll:"pf", sv:"vilka", ocksa:[{sv:"vilka?", etikett:"τίς femininum nominativ plural"}] },
      { i:10, form:"μου", lemma:"ἐγώ", modell:"person", num:"sg", kas:"gen", bet:"obetonad", genus:null, roll:"gen", sv:"mina" } ] },
  { id:"p7-08", sem:7, skapad:false,
    kalla:"Övningsblad 7, s. 1",
    sv:"Om någon vill vara först, ska han vara allas tjänare.",
    ord:["Εἴ", "τις", "θέλει", "πρῶτος", "εἶναι,", "ἔσται", "πάντων", "διάκονος."],
    mal:[
      { i:1, form:"τις", lemma:"τις", modell:"genus", num:"sg", kas:"nom", bet:null, genus:"m|f", roll:"subj", sv:"någon", not:"Indefinit τις är enklitiskt och obetonat — jämför interrogativa τίς med akut accent, som alltid är betonat. Accenten är hela skillnaden." } ] },
  { id:"p7-09", sem:7, skapad:false,
    kalla:"Övningsblad 7, s. 1",
    sv:"Paulus säger till honom, Gud kommer att slå dig.",
    ord:["Ὁ", "Παῦλος", "πρὸς", "αὐτὸν", "λέγει,", "Τύπτειν", "σε", "μέλλει", "ὁ", "θεός,"],
    mal:[
      { i:3, form:"αὐτὸν", lemma:"αὐτός", modell:"genus", num:"sg", kas:"ack", bet:null, genus:"m", roll:"prep", sv:"honom" },
      { i:6, form:"σε", lemma:"σύ", modell:"person", num:"sg", kas:"ack", bet:"obetonad", genus:null, roll:"do", sv:"dig", not:"Objekt till infinitiven τύπτειν, inte till μέλλει." } ] },
  { id:"p7-10", sem:7, skapad:false,
    kalla:"Övningsblad 7, s. 1",
    sv:"Hör du vad dessa säger?",
    ord:["Ἀκούεις", "τί", "οὗτοι", "λέγουσιν;"],
    mal:[
      { i:1, form:"τί", lemma:"τίς", modell:"genus", num:"sg", kas:"ack", bet:null, genus:"n", roll:"do", sv:"vad", ocksa:[{sv:"vad?", etikett:"τίς neutrum nominativ singular"}], not:"Indirekt frågeord: objekt till λέγουσιν i bisatsen." },
      { i:2, form:"οὗτοι", lemma:"οὗτος", modell:"genus", num:"pl", kas:"nom", bet:null, genus:"m", roll:"subj", sv:"dessa", alt:["de"] } ] },
  { id:"p7-11", sem:7, skapad:false,
    kalla:"Övningsblad 7, s. 1",
    sv:"Lyssna, Israel, Herren, vår Gud, är en Herre.",
    ord:["Ἄκουε,", "Ἰσραήλ,", "κύριος", "ὁ", "θεὸς", "ἡμῶν", "κύριος", "εἷς", "ἐστιν"],
    mal:[
      { i:5, form:"ἡμῶν", lemma:"ἐγώ", modell:"person", num:"pl", kas:"gen", bet:"betonad", genus:null, roll:"gen", sv:"vår" } ] },
  { id:"p7-12", sem:7, skapad:false,
    kalla:"Övningsblad 7, s. 1",
    sv:"Och den stora folkhopen hörde på hans ord.",
    ord:["καὶ", "ὁ", "πολὺς", "ὄχλος", "ἤκουεν", "τὸν", "λόγον", "αὐτοῦ"],
    mal:[
      { i:7, form:"αὐτοῦ", lemma:"αὐτός", modell:"genus", num:"sg", kas:"gen", bet:null, genus:"m", roll:"gen", sv:"hans", ocksa:[{sv:"dess", etikett:"αὐτός neutrum genitiv singular"}], not:"Referenten är en person — därför 'hans' och inte neutrumets 'dess'." } ] },
  { id:"p7-13", sem:7, skapad:false,
    kalla:"Övningsblad 7, s. 1",
    sv:"Fariséerna sade till hans lärjungar, varför äter er lärare med tulltjänstemän och syndare?",
    ord:["οἱ", "Φαρισαῖοι", "ἔλεγον", "τοῖς", "μαθηταῖς", "αὐτοῦ,", "Διὰ", "τί", "μετὰ", "τῶν", "τελωνῶν", "καὶ", "ἁμαρτωλῶν", "ἐσθίει", "ὁ", "διδάσκαλος", "ὑμῶν;"],
    mal:[
      { i:5, form:"αὐτοῦ", lemma:"αὐτός", modell:"genus", num:"sg", kas:"gen", bet:null, genus:"m", roll:"gen", sv:"hans", ocksa:[{sv:"dess", etikett:"αὐτός neutrum genitiv singular"}] },
      { i:7, form:"τί", lemma:"τίς", modell:"genus", num:"sg", kas:"ack", bet:null, genus:"n", roll:"prep", sv:"vad", ocksa:[{sv:"vad?", etikett:"τίς neutrum nominativ singular"}], not:"Διὰ τί är ordagrant 'på grund av vad' — svenskan säger 'varför'. Ackusativ eftersom διά styr ackusativ i orsaksbetydelse." },
      { i:16, form:"ὑμῶν", lemma:"σύ", modell:"person", num:"pl", kas:"gen", bet:"betonad", genus:null, roll:"gen", sv:"er" } ] },
  { id:"p7-14", sem:7, skapad:false,
    kalla:"Övningsblad 7, s. 1",
    sv:"De (alt. jag) fördrev många onda andar, och smorde många sjuka med olja och helade dem.",
    ord:["δαιμόνια", "πολλὰ", "ἐξέβαλλον,", "καὶ", "ἤλειφον", "ἐλαίῳ", "πολλοὺς", "ἀρρώστους", "καὶ", "ἐθεράπευον", "αὐτούς"],
    mal:[
      { i:10, form:"αὐτούς", lemma:"αὐτός", modell:"genus", num:"pl", kas:"ack", bet:null, genus:"m", roll:"do", sv:"dem" } ] },
  { id:"p7-15", sem:7, skapad:false,
    kalla:"Breakout rooms 7, s. 1",
    sv:"De ser honom",
    ord:["βλέπουσιν", "αὐτόν."],
    mal:[
      { i:1, form:"αὐτόν", lemma:"αὐτός", modell:"genus", num:"sg", kas:"ack", bet:null, genus:"m", roll:"do", sv:"honom" } ] },
  { id:"p7-16", sem:7, skapad:false,
    kalla:"Breakout rooms 7, s. 1",
    sv:"De ska se henne",
    ord:["βλέψουσιν", "αὐτήν."],
    mal:[
      { i:1, form:"αὐτήν", lemma:"αὐτός", modell:"genus", num:"sg", kas:"ack", bet:null, genus:"f", roll:"do", sv:"henne" } ] },
  { id:"p7-17", sem:7, skapad:false,
    kalla:"Breakout rooms 7, s. 1",
    sv:"Han/hon skriver till dem",
    ord:["γράφει", "αὐτοῖς."],
    mal:[
      { i:1, form:"αὐτοῖς", lemma:"αὐτός", modell:"genus", num:"pl", kas:"dat", bet:null, genus:"m", roll:"io", sv:"till dem", not:"Ren dativ utan preposition. Jämför p7-18, som säger samma sak med πρός + ackusativ." } ] },
  { id:"p7-18", sem:7, skapad:false,
    kalla:"Breakout rooms 7, s. 1",
    sv:"Han/hon ska skriva till dem",
    ord:["γράψει", "πρὸς", "αὐτούς."],
    mal:[
      { i:2, form:"αὐτούς", lemma:"αὐτός", modell:"genus", num:"pl", kas:"ack", bet:null, genus:"m", roll:"prep", sv:"dem", not:"πρός + ackusativ ger samma svenska som den rena dativen i p7-17 — men grekiskan väljer olika kasus. Svenskan avslöjar alltså inte kasus." } ] },
  { id:"p7-19", sem:7, skapad:false,
    kalla:"Breakout rooms 7, s. 1",
    sv:"Han/hon för bort dem",
    ord:["ὑπάγει", "αὐτάς."],
    mal:[
      { i:1, form:"αὐτάς", lemma:"αὐτός", modell:"genus", num:"pl", kas:"ack", bet:null, genus:"f", roll:"do", sv:"dem", not:"Femininum plural — svenskan har inget genus i 'dem', så formen syns inte i översättningen." } ] },
  { id:"p7-20", sem:7, skapad:false,
    kalla:"Breakout rooms 7, s. 1",
    sv:"De ska föra bort dem",
    ord:["ὑπάξουσιν", "αὐτούς."],
    mal:[
      { i:1, form:"αὐτούς", lemma:"αὐτός", modell:"genus", num:"pl", kas:"ack", bet:null, genus:"m", roll:"do", sv:"dem" } ] },
  { id:"p7-21", sem:7, skapad:false,
    kalla:"Breakout rooms 7, s. 1",
    sv:"Han/hon ska tala med er",
    ord:["λαλήσει", "ὑμῖν."],
    mal:[
      { i:1, form:"ὑμῖν", lemma:"σύ", modell:"person", num:"pl", kas:"dat", bet:"betonad", genus:null, roll:"io", sv:"med er", not:"Samma form som i p5-02, där den blev 'för er'. Verbet avgör: κηρύσσω → 'för', λαλέω → 'med'." } ] },
  { id:"p7-22", sem:7, skapad:false,
    kalla:"Breakout rooms 7, s. 1",
    sv:"Min bror talar med dig",
    ord:["ὁ", "ἀδελφός", "μου", "λαλεῖ", "σοι."],
    mal:[
      { i:2, form:"μου", lemma:"ἐγώ", modell:"person", num:"sg", kas:"gen", bet:"obetonad", genus:null, roll:"gen", sv:"min" },
      { i:4, form:"σοι", lemma:"σύ", modell:"person", num:"sg", kas:"dat", bet:"obetonad", genus:null, roll:"io", sv:"med dig" } ] },
  { id:"p7-23", sem:7, skapad:false,
    kalla:"Breakout rooms 7, s. 1",
    sv:"Vår herre ska skicka båten till er",
    ord:["πέμψει", "ὁ", "κύριος", "ἡμῶν", "τὸ", "πλοῖον", "πρὸς", "ὑμᾶς."],
    mal:[
      { i:3, form:"ἡμῶν", lemma:"ἐγώ", modell:"person", num:"pl", kas:"gen", bet:"betonad", genus:null, roll:"gen", sv:"vår" },
      { i:7, form:"ὑμᾶς", lemma:"σύ", modell:"person", num:"pl", kas:"ack", bet:"betonad", genus:null, roll:"prep", sv:"er" } ] },
  { id:"p7-24", sem:7, skapad:false,
    kalla:"Breakout rooms 7, s. 1",
    sv:"Deras syster ska döpa oss",
    ord:["βαπτίσει", "ἡ", "ἀδελφὴ", "αὐτῶν", "ἡμᾶς."],
    mal:[
      { i:3, form:"αὐτῶν", lemma:"αὐτός", modell:"genus", num:"pl", kas:"gen", bet:null, genus:"m|f", roll:"gen", sv:"deras", not:"αὐτῶν är samma form i alla tre genus — plural genitiv skiljer dem inte åt. Svenskans 'deras' gör det inte heller." },
      { i:4, form:"ἡμᾶς", lemma:"ἐγώ", modell:"person", num:"pl", kas:"ack", bet:"betonad", genus:null, roll:"do", sv:"oss" } ] },
  { id:"p7-25", sem:7, skapad:false,
    kalla:"Breakout rooms 7, s. 1",
    sv:"De ska skicka en båt till er",
    ord:["οὗτοι", "πέμψουσι", "πλοῖον", "ὑμῖν."],
    mal:[
      { i:0, form:"οὗτοι", lemma:"οὗτος", modell:"genus", num:"pl", kas:"nom", bet:null, genus:"m", roll:"subj", sv:"de", alt:["dessa"] },
      { i:3, form:"ὑμῖν", lemma:"σύ", modell:"person", num:"pl", kas:"dat", bet:"betonad", genus:null, roll:"io", sv:"till er" } ] },
  { id:"p7-26", sem:7, skapad:false,
    kalla:"Breakout rooms 7, s. 1",
    sv:"Vi kommer att se er",
    ord:["ἡμεῖς", "βλέψομεν", "ὑμᾶς."],
    mal:[
      { i:0, form:"ἡμεῖς", lemma:"ἐγώ", modell:"person", num:"pl", kas:"nom", bet:"betonad", genus:null, roll:"subj", sv:"vi" },
      { i:2, form:"ὑμᾶς", lemma:"σύ", modell:"person", num:"pl", kas:"ack", bet:"betonad", genus:null, roll:"do", sv:"er" } ] },
  { id:"p7-27", sem:7, skapad:false,
    kalla:"Breakout rooms 7, s. 2",
    sv:"era fiender",
    ord:["οἱ", "ἐχθροὶ", "ὑμῶν"],
    mal:[
      { i:2, form:"ὑμῶν", lemma:"σύ", modell:"person", num:"pl", kas:"gen", bet:"betonad", genus:null, roll:"gen", sv:"era", not:"Svenskan böjer possessiven efter huvudordet ('era' till pluralt 'fiender'); grekiskans ὑμῶν står oförändrat." } ] },
  { id:"p7-28", sem:7, skapad:false,
    kalla:"Breakout rooms 7, s. 2",
    sv:"hans hjärta",
    ord:["ἡ", "καρδία", "αὐτοῦ"],
    mal:[
      { i:2, form:"αὐτοῦ", lemma:"αὐτός", modell:"genus", num:"sg", kas:"gen", bet:null, genus:"m", roll:"gen", sv:"hans", ocksa:[{sv:"dess", etikett:"αὐτός neutrum genitiv singular"}], not:"Genitiven rättar sig efter ägaren (m), inte efter det ägda (καρδία, f). Motsatsen mot possessiva adjektiv." } ] },
  { id:"p7-29", sem:7, skapad:false,
    kalla:"Breakout rooms 7, s. 2",
    sv:"hennes verk",
    ord:["τὸ", "ἔργον", "αὐτῆς"],
    mal:[
      { i:2, form:"αὐτῆς", lemma:"αὐτός", modell:"genus", num:"sg", kas:"gen", bet:null, genus:"f", roll:"gen", sv:"hennes" } ] },
  { id:"p7-30", sem:7, skapad:false,
    kalla:"Breakout rooms 7, s. 2",
    sv:"hans slav",
    ord:["ὁ", "τούτου", "δοῦλος"],
    mal:[
      { i:1, form:"τούτου", lemma:"οὗτος", modell:"genus", num:"sg", kas:"gen", bet:null, genus:"m", roll:"gen", sv:"hans", alt:["dennes"], ocksa:[{sv:"dettas", etikett:"οὗτος neutrum genitiv singular"}], not:"Genitiv av οὗτος i attributiv ställning, mellan artikel och huvudord." } ] },
  { id:"p7-31", sem:7, skapad:false,
    kalla:"Breakout rooms 7, s. 2",
    sv:"vår husbonde",
    ord:["ὁ", "ἡμέτερος", "οἰκοδεσπότης"],
    mal:[
      { i:1, form:"ἡμέτερος", lemma:"ἡμέτερος", modell:"genus", num:"sg", kas:"nom", bet:null, genus:"m", roll:"attr", sv:"vår", not:"Possessivt adjektiv i attributiv ställning — kongruerar med οἰκοδεσπότης (m sg nom). Jämför ἡμῶν i p7-23, som säger samma sak med genitiv." } ] },
  { id:"p7-32", sem:7, skapad:false,
    kalla:"Breakout rooms 7, s. 2",
    sv:"min syster",
    ord:["ἡ", "ἀδελφή", "μου"],
    mal:[
      { i:2, form:"μου", lemma:"ἐγώ", modell:"person", num:"sg", kas:"gen", bet:"obetonad", genus:null, roll:"gen", sv:"min" } ] },
  { id:"p7-33", sem:7, skapad:false,
    kalla:"Breakout rooms 7, s. 2",
    sv:"vår vän",
    ord:["ὁ", "φίλος", "ἡμῶν"],
    mal:[
      { i:2, form:"ἡμῶν", lemma:"ἐγώ", modell:"person", num:"pl", kas:"gen", bet:"betonad", genus:null, roll:"gen", sv:"vår" } ] },
  { id:"p7-34", sem:7, skapad:false,
    kalla:"Breakout rooms 7, s. 2",
    sv:"din vän",
    ord:["ὁ", "σὸς", "φίλος"],
    mal:[
      { i:1, form:"σὸς", lemma:"σός", modell:"genus", num:"sg", kas:"nom", bet:null, genus:"m", roll:"attr", sv:"din", not:"Possessivt adjektiv, kongruerar med φίλος. Jämför σου (genitiv) som ger samma svenska." } ] },
  { id:"p7-35", sem:7, skapad:false,
    kalla:"Breakout rooms 7, s. 2",
    sv:"mina fiender",
    ord:["οἱ", "ἐχθροί", "μου"],
    mal:[
      { i:2, form:"μου", lemma:"ἐγώ", modell:"person", num:"sg", kas:"gen", bet:"obetonad", genus:null, roll:"gen", sv:"mina", not:"μου är singular ('av mig'), men svenskan säger 'mina' eftersom fienderna är flera. Numerus följer huvudordet i svenskan, ägaren i grekiskan." } ] },
  { id:"p7-36", sem:7, skapad:false,
    kalla:"Breakout rooms 7, s. 2",
    sv:"till mina fiender",
    ord:["πρὸς", "τοὺς", "ἐμοὺς", "ἐχθρούς"],
    mal:[
      { i:2, form:"ἐμοὺς", lemma:"ἐμός", modell:"genus", num:"pl", kas:"ack", bet:null, genus:"m", roll:"attr", sv:"mina", not:"Possessivt adjektiv i ackusativ plural — kongruerar med ἐχθρούς, som styrs av πρός. Jämför μου i p7-35: samma svenska, helt olika grekisk mekanik." } ] },
  { id:"p7-37", sem:7, skapad:false,
    kalla:"Breakout rooms 7, s. 3",
    sv:"Han undervisade dem i deras synagoga",
    ord:["ἐδίδασκεν", "αὐτοὺς", "ἐν", "τῇ", "συναγωγῇ", "αὐτῶν."],
    mal:[
      { i:1, form:"αὐτοὺς", lemma:"αὐτός", modell:"genus", num:"pl", kas:"ack", bet:null, genus:"m", roll:"do", sv:"dem" },
      { i:5, form:"αὐτῶν", lemma:"αὐτός", modell:"genus", num:"pl", kas:"gen", bet:null, genus:"m|f", roll:"gen", sv:"deras", not:"Två former av samma lemma i en sats: ackusativen är objekt ('dem'), genitiven är attribut ('deras')." } ] },
  { id:"p7-38", sem:7, skapad:false,
    kalla:"Breakout rooms 7, s. 3",
    sv:"Många hörde honom och trodde på honom",
    ord:["πολλοὶ", "ἤκουον", "αὐτοῦ", "καὶ", "ἐπίστευον", "αὐτῷ."],
    mal:[
      { i:2, form:"αὐτοῦ", lemma:"αὐτός", modell:"genus", num:"sg", kas:"gen", bet:null, genus:"m", roll:"obj-gen", sv:"honom", ocksa:[{sv:"dess", etikett:"αὐτός neutrum genitiv singular"}], not:"ἀκούω styr genitiv när objektet är en person — genitiven är verbets objekt här, inte attribut. Därför 'honom', inte 'hans'." },
      { i:5, form:"αὐτῷ", lemma:"αὐτός", modell:"genus", num:"sg", kas:"dat", bet:null, genus:"m", roll:"obj-dat", sv:"på honom", ocksa:[{sv:"till det", etikett:"αὐτός neutrum dativ singular"}], not:"πιστεύω styr dativ. Samma referent som αὐτοῦ, tre ord bort, men ett annat kasus — verbet bestämmer, inte rollen i handlingen." } ] },
  { id:"p6-s01", sem:6, skapad:true,
    kalla:"Konstruerad sats — står inte i kursmaterialet.",
    sv:"Den där ser huset.",
    ord:["ἐκεῖνος", "βλέπει", "τὸν", "οἶκον."],
    mal:[
      { i:0, form:"ἐκεῖνος", lemma:"ἐκεῖνος", modell:"genus", num:"sg", kas:"nom", bet:null, genus:"m", roll:"subj", sv:"den där", alt:["han där"] } ] },
  { id:"p6-s02", sem:6, skapad:true,
    kalla:"Konstruerad sats — står inte i kursmaterialet.",
    sv:"Vi ser den där.",
    ord:["βλέπομεν", "ἐκεῖνον."],
    mal:[
      { i:1, form:"ἐκεῖνον", lemma:"ἐκεῖνος", modell:"genus", num:"sg", kas:"ack", bet:null, genus:"m", roll:"do", sv:"den där", alt:["honom där"] } ] },
  { id:"p6-s03", sem:6, skapad:true,
    kalla:"Konstruerad sats — står inte i kursmaterialet.",
    sv:"Aposteln skriver till dem där.",
    ord:["γράφει", "ἐκείνοις", "ὁ", "ἀπόστολος."],
    mal:[
      { i:1, form:"ἐκείνοις", lemma:"ἐκεῖνος", modell:"genus", num:"pl", kas:"dat", bet:null, genus:"m", roll:"io", sv:"till dem där", ocksa:[{sv:"till de där", etikett:"ἐκεῖνος neutrum dativ plural"}], not:"Att γράφω tar en adressat gör dativen till indirekt objekt." } ] },
  { id:"p6-s04", sem:6, skapad:true,
    kalla:"Konstruerad sats — står inte i kursmaterialet.",
    sv:"Hans slav äter brödet.",
    ord:["ὁ", "ἐκείνου", "δοῦλος", "ἐσθίει", "τὸν", "ἄρτον."],
    mal:[
      { i:1, form:"ἐκείνου", lemma:"ἐκεῖνος", modell:"genus", num:"sg", kas:"gen", bet:null, genus:"m", roll:"gen", sv:"hans", alt:["den därs"], ocksa:[{sv:"det därs", etikett:"ἐκεῖνος neutrum genitiv singular"}], not:"Genitiv av ἐκεῖνος i attributiv ställning, mellan artikel och huvudord — samma bygge som ὁ τούτου δοῦλος i p7-30." } ] },
  { id:"p6-s05", sem:6, skapad:true,
    kalla:"Konstruerad sats — står inte i kursmaterialet.",
    sv:"Det där barnet ser tecknet.",
    ord:["ἐκεῖνο", "τὸ", "τέκνον", "βλέπει", "τὸ", "σημεῖον."],
    mal:[
      { i:0, form:"ἐκεῖνο", lemma:"ἐκεῖνος", modell:"genus", num:"sg", kas:"nom", bet:null, genus:"n", roll:"attr", sv:"det där", not:"Demonstrativet står i PREDIKATIV ställning (utanför artikel + huvudord) men har attributiv betydelse: ἐκεῖνο τὸ τέκνον = 'det där barnet'. Ett vanligt adjektiv skulle betyda något annat i samma position." } ] },
  { id:"p6-s06", sem:6, skapad:true,
    kalla:"Konstruerad sats — står inte i kursmaterialet.",
    sv:"Han skickar lärjungarna till dem där.",
    ord:["πέμπει", "τοὺς", "μαθητὰς", "πρὸς", "ἐκείνους."],
    mal:[
      { i:4, form:"ἐκείνους", lemma:"ἐκεῖνος", modell:"genus", num:"pl", kas:"ack", bet:null, genus:"m", roll:"prep", sv:"dem där" } ] },
  { id:"p6-s07", sem:6, skapad:true,
    kalla:"Konstruerad sats — står inte i kursmaterialet.",
    sv:"Hon där ser verket.",
    ord:["ἐκείνη", "βλέπει", "τὸ", "ἔργον."],
    mal:[
      { i:0, form:"ἐκείνη", lemma:"ἐκεῖνος", modell:"genus", num:"sg", kas:"nom", bet:null, genus:"f", roll:"subj", sv:"hon där", alt:["den där"] } ] },
  { id:"p7-s01", sem:7, skapad:true,
    kalla:"Konstruerad sats — står inte i kursmaterialet.",
    sv:"Min syster ser templet.",
    ord:["ἡ", "ἐμὴ", "ἀδελφὴ", "βλέπει", "τὸ", "ἱερόν."],
    mal:[
      { i:1, form:"ἐμὴ", lemma:"ἐμός", modell:"genus", num:"sg", kas:"nom", bet:null, genus:"f", roll:"attr", sv:"min", not:"Possessivt adjektiv i attributiv ställning (mellan artikel och huvudord) och kongruerar med ἀδελφή. Jämför μου i p7-32, som säger samma sak med genitiv och aldrig böjs." } ] },
  { id:"p7-s02", sem:7, skapad:true,
    kalla:"Konstruerad sats — står inte i kursmaterialet.",
    sv:"i mitt hus",
    ord:["ἐν", "τῷ", "ἐμῷ", "οἴκῳ"],
    mal:[
      { i:2, form:"ἐμῷ", lemma:"ἐμός", modell:"genus", num:"sg", kas:"dat", bet:null, genus:"m", roll:"attr", sv:"mitt", not:"Dativ eftersom ἐν styr dativ — men det är οἴκῳ som styrs; ἐμῷ följer bara med i kongruensen. Svenskan säger 'mitt' (neutrum), grekiskan har maskulinum efter οἶκος." } ] },
  { id:"p7-s03", sem:7, skapad:true,
    kalla:"Konstruerad sats — står inte i kursmaterialet.",
    sv:"Din bror skriver ordet.",
    ord:["ὁ", "σὸς", "ἀδελφὸς", "γράφει", "τὸν", "λόγον."],
    mal:[
      { i:1, form:"σὸς", lemma:"σός", modell:"genus", num:"sg", kas:"nom", bet:null, genus:"m", roll:"attr", sv:"din" } ] },
  { id:"p7-s04", sem:7, skapad:true,
    kalla:"Konstruerad sats — står inte i kursmaterialet.",
    sv:"Jag ser ditt hus.",
    ord:["βλέπω", "τὸν", "σὸν", "οἶκον."],
    mal:[
      { i:2, form:"σὸν", lemma:"σός", modell:"genus", num:"sg", kas:"ack", bet:null, genus:"m", roll:"attr", sv:"ditt", not:"Ackusativ i kongruens med οἶκον, som är objektet. Svenskans 'ditt' är neutrum efter 'hus' — genus följer inte över språkgränsen." } ] },
  { id:"p7-s05", sem:7, skapad:true,
    kalla:"Konstruerad sats — står inte i kursmaterialet.",
    sv:"Din syster talar med mig.",
    ord:["ἡ", "σὴ", "ἀδελφὴ", "λαλεῖ", "μοι."],
    mal:[
      { i:1, form:"σὴ", lemma:"σός", modell:"genus", num:"sg", kas:"nom", bet:null, genus:"f", roll:"attr", sv:"din" },
      { i:4, form:"μοι", lemma:"ἐγώ", modell:"person", num:"sg", kas:"dat", bet:"obetonad", genus:null, roll:"io", sv:"med mig" } ] },
  { id:"p7-s06", sem:7, skapad:true,
    kalla:"Konstruerad sats — står inte i kursmaterialet.",
    sv:"Vår lärare undervisar barnen.",
    ord:["ὁ", "ἡμέτερος", "διδάσκαλος", "διδάσκει", "τὰ", "τέκνα."],
    mal:[
      { i:1, form:"ἡμέτερος", lemma:"ἡμέτερος", modell:"genus", num:"sg", kas:"nom", bet:null, genus:"m", roll:"attr", sv:"vår" } ] },
  { id:"p7-s07", sem:7, skapad:true,
    kalla:"Konstruerad sats — står inte i kursmaterialet.",
    sv:"Ni ser vår kyrka.",
    ord:["βλέπετε", "τὴν", "ἡμετέραν", "ἐκκλησίαν."],
    mal:[
      { i:2, form:"ἡμετέραν", lemma:"ἡμέτερος", modell:"genus", num:"sg", kas:"ack", bet:null, genus:"f", roll:"attr", sv:"vår" } ] },
  { id:"p7-s08", sem:7, skapad:true,
    kalla:"Konstruerad sats — står inte i kursmaterialet.",
    sv:"i vårt tempel",
    ord:["ἐν", "τῷ", "ἡμετέρῳ", "ἱερῷ"],
    mal:[
      { i:2, form:"ἡμετέρῳ", lemma:"ἡμέτερος", modell:"genus", num:"sg", kas:"dat", bet:null, genus:"n", roll:"attr", sv:"vårt", ocksa:[{sv:"vår", etikett:"ἡμέτερος maskulinum dativ singular"}] } ] },
  { id:"p7-s09", sem:7, skapad:true,
    kalla:"Konstruerad sats — står inte i kursmaterialet.",
    sv:"Ert hus består.",
    ord:["ὁ", "ὑμέτερος", "οἶκος", "μένει."],
    mal:[
      { i:1, form:"ὑμέτερος", lemma:"ὑμέτερος", modell:"genus", num:"sg", kas:"nom", bet:null, genus:"m", roll:"attr", sv:"ert", not:"Grekiskan har maskulinum (οἶκος), svenskan neutrum ('hus') — därför ὑμέτερος men 'ert'." } ] },
  { id:"p7-s10", sem:7, skapad:true,
    kalla:"Konstruerad sats — står inte i kursmaterialet.",
    sv:"Vi ser era bröder.",
    ord:["βλέπομεν", "τοὺς", "ὑμετέρους", "ἀδελφούς."],
    mal:[
      { i:2, form:"ὑμετέρους", lemma:"ὑμέτερος", modell:"genus", num:"pl", kas:"ack", bet:null, genus:"m", roll:"attr", sv:"era" } ] },
  { id:"p7-s11", sem:7, skapad:true,
    kalla:"Konstruerad sats — står inte i kursmaterialet.",
    sv:"En viss människa skriver ett ord.",
    ord:["ἄνθρωπός", "τις", "γράφει", "λόγον."],
    mal:[
      { i:1, form:"τις", lemma:"τις", modell:"genus", num:"sg", kas:"nom", bet:null, genus:"m", roll:"attr", sv:"en viss", alt:["någon"], not:"Indefinit τις är enklitiskt och kastar sin accent bakåt: ἄνθρωπος blir ἄνθρωπός τις. Accenten på ultiman är alltså inte ordets egen — den avslöjar att ett enklitikon följer. Formen är gemensam för m och f, men här kongruerar den med ἄνθρωπος och är alltså maskulin." } ] },
  { id:"p7-s12", sem:7, skapad:true,
    kalla:"Konstruerad sats — står inte i kursmaterialet.",
    sv:"Profeten säger något.",
    ord:["λέγει", "τι", "ὁ", "προφήτης."],
    mal:[
      { i:1, form:"τι", lemma:"τις", modell:"genus", num:"sg", kas:"ack", bet:null, genus:"n", roll:"do", sv:"något", not:"Obetonat τι utan accent — jämför interrogativa τί, som alltid bär akut. Accenten är hela skillnaden mellan 'något' och 'vad?'." } ] },
  { id:"p6-s08", sem:6, skapad:true,
    kalla:"Konstruerad sats — står inte i kursmaterialet.",
    sv:"Vi hör dem.",
    ord:["ἀκούομεν", "αὐτῶν."],
    mal:[
      { i:1, form:"αὐτῶν", lemma:"αὐτός", modell:"genus", num:"pl", kas:"gen", bet:null, genus:"m|f", roll:"obj-gen", sv:"dem", ocksa:[{sv:"deras", etikett:"αὐτός neutrum genitiv plural"}], not:"ἀκούω styr genitiv när det som hörs är en person. Formen är identisk med genitivattributet i p7-24 ('deras syster') — bara verbet skiljer objekt från attribut." } ] },
  { id:"p6-s09", sem:6, skapad:true,
    kalla:"Konstruerad sats — står inte i kursmaterialet.",
    sv:"Folkhopen hör honom där.",
    ord:["ὁ", "ὄχλος", "ἀκούει", "ἐκείνου."],
    mal:[
      { i:3, form:"ἐκείνου", lemma:"ἐκεῖνος", modell:"genus", num:"sg", kas:"gen", bet:null, genus:"m", roll:"obj-gen", sv:"honom där", ocksa:[{sv:"det därs", etikett:"ἐκεῖνος neutrum genitiv singular"}], not:"Genitivobjekt, inte attribut: jämför ὁ ἐκείνου δοῦλος i p6-s04, där samma form betyder 'hans'. Ställningen och verbet avgör." } ] },
  { id:"p6-s10", sem:6, skapad:true,
    kalla:"Konstruerad sats — står inte i kursmaterialet.",
    sv:"Lärjungarna tror på honom där.",
    ord:["οἱ", "μαθηταὶ", "πιστεύουσιν", "ἐκείνῳ."],
    mal:[
      { i:3, form:"ἐκείνῳ", lemma:"ἐκεῖνος", modell:"genus", num:"sg", kas:"dat", bet:null, genus:"m", roll:"obj-dat", sv:"på honom där", ocksa:[{sv:"till det där", etikett:"ἐκεῖνος neutrum dativ singular"}], not:"πιστεύω styr dativ: ἐκείνῳ är verbets objekt, ingen mottagare — därför obj-dat och inte io." } ] }
];
const ROLL = {
  "subj": "Subjekt",
  "pf": "Predikatsfyllnad",
  "do": "Direkt objekt",
  "obj-gen": "Genitivobjekt",
  "obj-dat": "Dativobjekt",
  "io": "Indirekt objekt",
  "gen": "Genitivattribut",
  "attr": "Förenat attribut",
  "prep": "Rektion till preposition"
};
const ROLL_ORDNING = Object.keys(ROLL);

const KASUS = { nom:"nominativ", gen:"genitiv", dat:"dativ", ack:"ackusativ" };
const KASUS_ORDNING = ["nom","gen","dat","ack"];
const NUM = { sg:"singular", pl:"plural" };
const NUM_ORDNING = ["sg","pl"];
const BET = { betonad:"betonad", obetonad:"obetonad" };
const BET_ORDNING = ["betonad","obetonad"];
const GENUS = { m:"maskulinum", f:"femininum", n:"neutrum" };
const GENUS_ORDNING = ["m","f","n"];

/* Seminarie-axel: varje pronomen bär sem:[…] ur pronomen.json. */
const SEMINARIER = [...new Set(pronomen.flatMap(p => p.sem))].sort((a,b) => a - b);
const semNamn = s => "Sem " + s;

const prom = l => pronomen.find(p => p.lemma === l);

// Alla giltiga kort ur en pronomenlista. Person-pronomen ger betonings-kort där
// formen finns (obetonad saknas i nominativ och hela pluralen); genus-pronomen
// ger genus-kort (m/f/n × kasus × numerus).
function kombosFor(list){
  const out = [];
  list.forEach(p => {
    if(p.modell === "person"){
      NUM_ORDNING.forEach(num => KASUS_ORDNING.forEach(kas => BET_ORDNING.forEach(bet => {
        const form = p.former[num][kas][bet === "betonad" ? 0 : 1];
        if(form) out.push({ lemma:p.lemma, modell:"person", num, kas, bet, genus:null, form });
      })));
    } else {
      GENUS_ORDNING.forEach(g => KASUS_ORDNING.forEach(kas => NUM_ORDNING.forEach(num => {
        const form = p.former[g][kas][num];
        if(form) out.push({ lemma:p.lemma, modell:"genus", num, kas, bet:null, genus:g, form });
      })));
    }
  });
  return out;
}
const alla_kombos = () => kombosFor(pronomen);

const STYLE = `
.vy-pron .stage{ display:flex; flex-direction:column; align-items:center; gap:1rem; margin-top:1rem; }
.vy-pron .card{ background:var(--card); border:1px solid var(--line); border-radius:14px;
  padding:1.6rem 1.4rem; min-width:min(30rem,92vw); text-align:center;
  box-shadow:0 1px 0 rgba(0,0,0,.03); }
.vy-pron .prompt{ font-family:"Cardo",serif; font-size:var(--fs-4xl); color:var(--ink); line-height:1.1; }
.vy-pron .glosa{ font-family:"Spectral",serif; color:var(--ink-soft); font-size:var(--fs-lg); margin-top:.3rem; }
.vy-pron .target{ font-family:"Spectral",serif; color:var(--gold); font-size:var(--fs-xl); margin-top:.7rem; }
.vy-pron .target b{ color:var(--ink); }
.vy-pron .bet{ font-family:"Spectral",serif; font-size:var(--fs-sm); margin-top:.3rem; color:var(--ink-soft); }
.vy-pron .bet.enklit{ color:var(--gold); }
.vy-pron .bet.hidden{ display:none !important; }
.vy-pron .reveal{ margin-top:1rem; border-top:1px dashed var(--line); padding-top:1rem; }
.vy-pron .svar{ font-family:"Cardo",serif; font-size:var(--fs-3xl); color:var(--ink); }
.vy-pron .svarlabel{ font-family:"Spectral",serif; color:var(--ink-soft); font-size:var(--fs-sm); margin-top:.2rem; }
.vy-pron .hidden{ display:none !important; }
.vy-pron .controls{ display:flex; gap:.6rem; justify-content:center; }
.vy-pron .btn{ font-family:"Spectral",serif; font-size:var(--fs-md); padding:.55rem 1.2rem;
  border:1px solid var(--line); border-radius:10px; background:var(--card); color:var(--ink); cursor:pointer; }
.vy-pron .btn.primary{ background:var(--gold); color:#fff; border-color:var(--gold); }
.vy-pron .btn.good{ background:var(--good-bg); color:var(--good); border-color:var(--good); }
.vy-pron .btn.bad{ background:var(--bad-bg); color:var(--bad); border-color:var(--bad); }
.vy-pron .options{ display:grid; grid-template-columns:1fr 1fr; gap:.6rem; min-width:min(30rem,92vw); }
.vy-pron .opt{ font-family:"Cardo",serif; font-size:var(--fs-2xl); padding:.5rem .3rem;
  border:1px solid var(--line); border-radius:10px; background:var(--card); color:var(--ink); cursor:pointer; }
.vy-pron .opt:hover:not(:disabled){ border-color:var(--gold); }
.vy-pron .opt:disabled{ cursor:default; }
.vy-pron .opt.correct{ background:var(--good-bg); border-color:var(--good); color:var(--good); }
.vy-pron .opt.wrong{ background:var(--bad-bg); border-color:var(--bad); color:var(--bad); }
.vy-pron .streak{ font-family:"Spectral",serif; color:var(--ink-soft); font-size:var(--fs-sm); }
/* Riktning (sv→gr / gr→sv) och format (vänd/flerval) är skilda axlar: alla fyra
   kombinationer är meningsfulla, så de får var sin rad i stället för att trängas
   som pillar på samma. Riktningsraden bär .modes och ärver därmed pill- och
   valt-tillståndet från app.css; .riktning sätter bara avståndet. */
.vy-pron .riktning{ margin:.9rem 0 0; }
.vy-pron .sats{ font-family:"Cardo",serif; font-size:var(--fs-2xl); color:var(--ink); line-height:1.6; }
.vy-pron .sats .mal{ color:var(--gold); border-bottom:2px solid var(--gold); padding-bottom:1px; }
.vy-pron .fraga{ font-family:"Spectral",serif; color:var(--ink-soft); font-size:var(--fs-md); margin-top:.8rem; }
.vy-pron .fraga b{ font-family:"Cardo",serif; font-size:var(--fs-lg); color:var(--gold); }
.vy-pron .helsv{ font-family:"Spectral",serif; color:var(--ink-soft); font-size:var(--fs-sm);
  margin-top:.6rem; font-style:italic; }
.vy-pron .not{ font-family:"Spectral",serif; color:var(--ink-soft); font-size:var(--fs-sm);
  margin-top:.7rem; text-align:left; line-height:1.5; }
.vy-pron .kalla{ font-family:"Spectral",serif; color:var(--ink-soft); font-size:var(--fs-2xs); margin-top:.5rem; }
.vy-pron .opt.sv{ font-family:"Spectral",serif; font-size:var(--fs-lg); }
.vy-pron .modes{ display:flex; gap:.5rem; justify-content:center; margin:.4rem 0 0; }
.vy-pron .mode{ font-family:"Spectral",serif; font-size:var(--fs-sm); padding:.35rem .9rem;
  border:1px solid var(--line); border-radius:999px; background:var(--card); color:var(--ink-soft); cursor:pointer; }
/* .mode "valt"-svart, picker, .toggle/.chip m.fl. ärvs från de delade
   reglerna i app.css — inga vy-lokala regler här. */
.vy-pron footer{ margin-top:1.4rem; font-family:"Spectral",serif; color:var(--ink-soft); font-size:var(--fs-2xs); text-align:center; }
.vy-pron footer a{ color:var(--gold); text-decoration:none; }
.vy-pron footer a:hover{ text-decoration:underline; }
.vy-pron .gr-lank{ margin-top:.6rem; }
`;

const MARKUP = `<div class="vy vy-pron">
<header>
  <h1>Grekiska — pronomen</h1>
  <div class="sub" id="sub">Personliga, demonstrativa och interrogativa pronomen. Ge den rätta formen.</div>
</header>

<div class="modes riktning" role="group" aria-label="Riktning">
  <button class="mode" id="rikt-svgr" aria-pressed="true">Svenska → grekiska</button>
  <button class="mode" id="rikt-grsv" aria-pressed="false">Grekiska → svenska</button>
</div>

<div class="modes" role="group" aria-label="Svarsformat">
  <button class="mode" id="mode-vand" aria-pressed="true">Vänd-kort</button>
  <button class="mode" id="mode-flerval" aria-pressed="false">Flerval</button>
</div>

<div class="stage">
  <div class="card">
    <div id="kort-svgr">
      <div class="prompt" id="prompt">—</div>
      <div class="glosa" id="glosa"></div>
      <div class="target" id="target"></div>
      <div class="bet" id="betlabel"></div>
    </div>
    <div id="kort-grsv" class="hidden">
      <div class="sats" id="sats"></div>
      <div class="fraga" id="fraga"></div>
    </div>
    <div class="reveal hidden" id="reveal">
      <div class="svar" id="svar"></div>
      <div class="svarlabel" id="svarlabel"></div>
      <div class="helsv hidden" id="helsv"></div>
      <div class="not hidden" id="not"></div>
      <div class="kalla hidden" id="kalla"></div>
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
  <button class="picker-toggle" id="picker-toggle" aria-expanded="false"><span>Anpassa övningen</span><span>▾</span></button>
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
      <h2>Pronomen</h2>
      <div class="grid" id="grid-pron"></div>
    </div>
    <div>
      <h2>Numerus</h2>
      <div class="grid" id="grid-num"></div>
    </div>
    <div>
      <h2>Kasus</h2>
      <div class="grid" id="grid-kas"></div>
    </div>
    <div id="sec-bet">
      <h2>Betoning <span class="quicklabel">(ἐγώ, σύ)</span></h2>
      <div class="grid" id="grid-bet"></div>
    </div>
    <div id="sec-genus">
      <h2>Genus <span class="quicklabel">(αὐτός, οὗτος, ἐκεῖνος, τίς)</span></h2>
      <div class="grid" id="grid-genus"></div>
    </div>
    <div id="sec-roll" class="hidden">
      <h2>Satsdel <span class="quicklabel">(rollen avgör kasus)</span></h2>
      <div class="quickrow">
        <span class="quicklabel">Snabbval:</span>
        <button class="chip" data-roll-all>alla</button>
      </div>
      <div class="grid" id="grid-roll"></div>
    </div>
  </div>
</div>

<footer>Personliga pronomen (ἐγώ, σύ) har en <b>betonad</b> form (efter preposition, vid emfas) och en <b>obetonad/enklitisk</b> (i övriga fall); nominativ och pluralen saknar enklitisk särform. <b>αὐτός, οὗτος, ἐκεῖνος</b> och <b>τίς</b> böjs efter genus som adjektiv (neutrum sg på -ο).
<div class="gr-lank"><a href="grammatikreferens.html#pronomen">§ Pronomen i grammatikreferensen →</a></div></footer>
</div>`;

export function render(root){
  if(!document.getElementById("vy-pron-style")){
    const st = document.createElement("style"); st.id = "vy-pron-style"; st.textContent = STYLE;
    document.head.appendChild(st);
  }
  root.innerHTML = MARKUP;

  const LAGER = "grekiska-pronomenspel";
  const state = {
    riktning: "sv-gr",                    // "sv-gr" (ge formen) | "gr-sv" (översätt i kontext)
    mode: "vand",                         // "vand" | "flerval" — gäller båda riktningarna
    valdaSem:   new Set(SEMINARIER),
    valdaPron:  new Set(pronomen.map(p => p.lemma)),
    valdaNum:   new Set(NUM_ORDNING),
    valdaKas:   new Set(KASUS_ORDNING),
    valdaBet:   new Set(BET_ORDNING),
    valdaGenus: new Set(GENUS_ORDNING),
    valdaRoll:  new Set(ROLL_ORDNING),
    streak: 0, best: 0, card: null, besvarad: false, valt: null, forra: null,
  };

  const $ = id => document.getElementById(id);
  const esc = s => s.replace(/[&<>"]/g, c => ({ "&":"&amp;", "<":"&lt;", ">":"&gt;", '"':"&quot;" }[c]));
  const pick = a => a[Math.floor(Math.random()*a.length)];
  const shuffle = a => { a=a.slice(); for(let i=a.length-1;i>0;i--){ const j=Math.floor(Math.random()*(i+1)); [a[i],a[j]]=[a[j],a[i]]; } return a; };

  // Pronomen synliga i valda seminarier (faller tillbaka på alla om urvalet blir tomt).
  const synligaPron = () => { const l = pronomen.filter(p => p.sem.some(s => state.valdaSem.has(s))); return l.length ? l : pronomen; };
  // Aktiva pronomen = synliga ∩ valda (med fallback).
  function aktivPron(){
    const syn = synligaPron();
    const v = syn.filter(p => state.valdaPron.has(p.lemma));
    return v.length ? v : syn;
  }

  // Aktiva kort = giltiga kombinationer från aktiva pronomen som matchar valda
  // dimensioner (betoning gäller person-, genus gäller genus-pronomen).
  function aktivaKombos(){
    const list = aktivPron();
    const k = kombosFor(list).filter(c =>
      state.valdaNum.has(c.num) && state.valdaKas.has(c.kas) &&
      (c.modell === "person" ? state.valdaBet.has(c.bet) : state.valdaGenus.has(c.genus)));
    return k.length ? k : kombosFor(list);
  }

  // Alla mål ur satsbanken, som platta kort {sats, m}. Ett mål bär redan num/kas/
  // bet/genus utplattat av generatorn, så samma urvalsdimensioner gäller som för
  // paradigmkorten — plus roll, som bara finns här.
  function aktivaMal(){
    const lemman = new Set(aktivPron().map(p => p.lemma));
    const alla = satser.flatMap(s => s.mal.map(m => ({ sats:s, m })));
    const v = alla.filter(({sats, m}) =>
      state.valdaSem.has(sats.sem) && lemman.has(m.lemma) &&
      state.valdaNum.has(m.num) && state.valdaKas.has(m.kas) && state.valdaRoll.has(m.roll));
    return v.length ? v : alla;
  }

  function spara(){ try{ localStorage.setItem(LAGER, JSON.stringify({
    riktning:state.riktning, mode:state.mode, valdaSem:[...state.valdaSem], valdaPron:[...state.valdaPron],
    valdaNum:[...state.valdaNum], valdaKas:[...state.valdaKas], valdaBet:[...state.valdaBet],
    valdaGenus:[...state.valdaGenus], valdaRoll:[...state.valdaRoll], best:state.best })); }catch(e){} }
  function ladda(){ try{ const r = JSON.parse(localStorage.getItem(LAGER)); if(!r) return;
    if(r.riktning === "sv-gr" || r.riktning === "gr-sv") state.riktning = r.riktning;
    if(r.mode) state.mode = r.mode;
    if(Array.isArray(r.valdaRoll)) state.valdaRoll = new Set(r.valdaRoll.filter(x => ROLL_ORDNING.includes(x)));
    if(Array.isArray(r.valdaSem))   state.valdaSem   = new Set(r.valdaSem.filter(s => SEMINARIER.includes(s)));
    if(Array.isArray(r.valdaPron))  state.valdaPron  = new Set(r.valdaPron.filter(l => pronomen.some(p=>p.lemma===l)));
    if(Array.isArray(r.valdaNum))   state.valdaNum   = new Set(r.valdaNum.filter(k => NUM_ORDNING.includes(k)));
    if(Array.isArray(r.valdaKas))   state.valdaKas   = new Set(r.valdaKas.filter(k => KASUS_ORDNING.includes(k)));
    if(Array.isArray(r.valdaBet))   state.valdaBet   = new Set(r.valdaBet.filter(k => BET_ORDNING.includes(k)));
    if(Array.isArray(r.valdaGenus)) state.valdaGenus = new Set(r.valdaGenus.filter(k => GENUS_ORDNING.includes(k)));
    if(typeof r.best === "number") state.best = r.best;
    // skydda mot tomma urval från gammalt sparat läge
    if(!state.valdaSem.size)   state.valdaSem   = new Set(SEMINARIER);
    if(!state.valdaPron.size)  state.valdaPron  = new Set(pronomen.map(p=>p.lemma));
    if(!state.valdaNum.size)   state.valdaNum   = new Set(NUM_ORDNING);
    if(!state.valdaKas.size)   state.valdaKas   = new Set(KASUS_ORDNING);
    if(!state.valdaBet.size)   state.valdaBet   = new Set(BET_ORDNING);
    if(!state.valdaGenus.size) state.valdaGenus = new Set(GENUS_ORDNING);
    if(!state.valdaRoll.size)  state.valdaRoll  = new Set(ROLL_ORDNING);
  }catch(e){} }

  // Distraktorer = andra former ur SAMMA pronomens paradigm (så böjningen tränas,
  // inte gissning). Fyll på från övriga pronomen om paradigmet inte räcker till 4.
  function byggOptioner(c){
    const egna = alla_kombos().filter(x => x.lemma === c.lemma && x.form !== c.form).map(x => x.form);
    let pool = [...new Set(egna)];
    if(pool.length < 3){
      const ovriga = alla_kombos().filter(x => x.lemma !== c.lemma && x.form !== c.form).map(x => x.form);
      pool = [...new Set([...pool, ...ovriga])];
    }
    return shuffle([c.form, ...shuffle(pool).slice(0,3)]);
  }

  /* Distraktorer i riktning gr→sv. Prioritetsordningen är hela poängen:

     1. m.ocksa — vad den NAKNA formen också betyder (αὐτοῦ: 'hans' … men också
        'dess'). Generatorn har räknat fram dem ur paradigmet och rensat bort
        målets egen analys, så de är äkta: rätt svar bara för att kontexten säger
        det. Att välja fel här är att ha läst formen men inte satsen.
     2. Andra kontextöversättningar av samma lemma i banken ('hans' mot 'honom').
     3. Vilken annan svenska som helst ur banken — sista utvägen.

     m.alt (godtagna alternativsvar) får aldrig hamna bland distraktorerna: de
     är rätt, och att markera dem som fel vore en kuggfråga. */
  const ALLA_MAL = satser.flatMap(s => s.mal);
  function byggOptionerSv(m){
    const forbjudna = new Set([m.sv, ...(m.alt || [])]);
    const lagg = (ut, kandidater) => { for(const sv of kandidater){
      if(!forbjudna.has(sv) && !ut.includes(sv)) ut.push(sv); } return ut; };

    let pool = lagg([], (m.ocksa || []).map(o => o.sv));
    if(pool.length < 3) lagg(pool, shuffle(ALLA_MAL.filter(x => x.lemma === m.lemma)).map(x => x.sv));
    if(pool.length < 3) lagg(pool, shuffle(ALLA_MAL).map(x => x.sv));
    return shuffle([m.sv, ...pool.slice(0,3)]);
  }

  function svFor(p, c){ return c.modell === "person" ? p.sv[c.num][c.kas] : p.sv[c.genus][c.num][c.kas]; }

  function newQuestion(){
    state.besvarad = false; state.valt = null;
    state.riktning === "gr-sv" ? nyKontextfraga() : nyFormfraga();
    render2();
  }

  function nyFormfraga(){
    const ks = aktivaKombos();
    let c, sig, n=0;
    do { c = pick(ks); sig = c.lemma+"|"+c.num+"|"+c.kas+"|"+(c.bet||c.genus); } while(sig === state.forra && ++n < 30);
    state.forra = sig;
    const p = prom(c.lemma);
    state.card = {
      ...c, glosa: p.glosa, sv: svFor(p, c),
      optioner: state.mode === "flerval" ? byggOptioner(c) : null,
    };
  }

  function nyKontextfraga(){
    const ks = aktivaMal();
    let k, sig, n=0;
    do { k = pick(ks); sig = k.sats.id+"|"+k.m.i; } while(sig === state.forra && ++n < 30);
    state.forra = sig;
    state.card = { sats:k.sats, m:k.m, optioner: state.mode === "flerval" ? byggOptionerSv(k.m) : null };
  }

  // Rätt svar per riktning: den grekiska formen, resp. den svenska översättningen.
  const facit = () => state.riktning === "gr-sv" ? state.card.m.sv : state.card.form;

  function render2(){
    const grsv = state.riktning === "gr-sv";
    $("kort-svgr").classList.toggle("hidden", grsv);
    $("kort-grsv").classList.toggle("hidden", !grsv);
    $("sec-roll").classList.toggle("hidden", !grsv);
    grsv ? renderKontext() : renderForm();

    $("streak").textContent = state.streak;
    $("best").textContent = state.best;

    $("reveal").classList.add("hidden");
    $("controls-vand").classList.add("hidden");
    $("controls-grade").classList.add("hidden");
    $("options").classList.add("hidden");
    $("controls-next").classList.add("hidden");
    $("btn-vand").textContent = grsv ? "Visa översättningen" : "Visa formen";

    if(state.mode === "vand"){
      if(state.besvarad){ visaSvar(); $("controls-grade").classList.remove("hidden"); }
      else { $("controls-vand").classList.remove("hidden"); }
    } else {
      renderOptioner(); $("options").classList.remove("hidden");
      if(state.besvarad){ visaSvar(); $("controls-next").classList.remove("hidden"); }
    }
  }

  function renderForm(){
    const c = state.card;
    $("prompt").textContent = c.lemma;
    $("glosa").textContent = c.glosa;
    const led = c.modell === "genus" ? GENUS[c.genus] + " " : "";
    $("target").innerHTML = "→ <b>" + led + KASUS[c.kas] + " " + NUM[c.num] + "</b> (" + c.sv + ")";
    const betEl = $("betlabel");
    if(c.modell === "person"){
      const enklit = c.bet === "obetonad";
      betEl.textContent = enklit ? "obetonad (enklitisk) form" : "betonad form";
      betEl.classList.toggle("enklit", enklit);
      betEl.classList.remove("hidden");
    } else {
      betEl.classList.add("hidden");
    }
  }

  // Satsen med målordet utpekat. Generatorn har löst ut ordindex (m.i), så här
  // finns ingen sökning eller accentnormalisering — bara rendering.
  function renderKontext(){
    const { sats, m } = state.card;
    $("sats").innerHTML = sats.ord
      .map((w, i) => i === m.i ? '<b class="mal">' + esc(w) + "</b>" : esc(w))
      .join(" ");
    $("fraga").innerHTML = "Vad betyder <b>" + esc(m.form) + "</b> här?";
  }
  // Analysen i klartext. genus "m|f" = formen är gemensam och kontexten avgör
  // inte heller — då påstår vi inget om genus.
  function analysText(m){
    if(m.modell === "person") return m.lemma + " · " + KASUS[m.kas] + " " + NUM[m.num] + " · " + BET[m.bet];
    const g = m.genus.split("|").map(x => GENUS[x]).join(" el. ");
    return m.lemma + " · " + g + " " + KASUS[m.kas] + " " + NUM[m.num];
  }

  function visaSvar(){
    state.riktning === "gr-sv" ? visaSvarKontext() : visaSvarForm();
    $("reveal").classList.remove("hidden");
  }
  function visaSvarForm(){
    const c = state.card;
    $("svar").textContent = c.form;
    $("svarlabel").textContent = analysText(c);
    ["helsv","not","kalla"].forEach(id => $(id).classList.add("hidden"));
  }
  function visaSvarKontext(){
    const { sats, m } = state.card;
    $("svar").textContent = m.sv + (m.alt && m.alt.length ? " (även: " + m.alt.join(", ") + ")" : "");
    $("svarlabel").textContent = analysText(m) + " · " + ROLL[m.roll];

    $("helsv").textContent = "”" + sats.sv + "”";
    $("helsv").classList.remove("hidden");

    // Facitets viktigaste rad: vad formen ensam också kunde ha varit, och alltså
    // vad kontexten just uteslöt.
    const bitar = [];
    if(m.ocksa && m.ocksa.length){
      bitar.push("<b>Formen ensam kan också vara:</b> " +
        m.ocksa.map(o => esc(o.etikett) + " (" + esc(o.sv) + ")").join("; ") + ".");
    }
    if(m.not) bitar.push(esc(m.not));
    $("not").innerHTML = bitar.join("<br>");
    $("not").classList.toggle("hidden", !bitar.length);

    $("kalla").textContent = sats.kalla;
    $("kalla").classList.remove("hidden");
  }

  function renderOptioner(){
    const box = $("options"); box.innerHTML = "";
    const ratt = facit(), grsv = state.riktning === "gr-sv";
    state.card.optioner.forEach(f => {
      const b = document.createElement("button");
      b.className = grsv ? "opt sv" : "opt"; b.textContent = f;
      if(state.besvarad){
        b.disabled = true;
        if(f === ratt) b.classList.add("correct");
        else if(f === state.valt) b.classList.add("wrong");
      } else { b.onclick = () => svara(f); }
      box.appendChild(b);
    });
  }
  function registrera(rätt){ if(rätt){ state.streak++; if(state.streak>state.best){ state.best=state.streak; spara(); } } else state.streak=0; }
  function svara(f){ state.valt=f; state.besvarad=true; registrera(f === facit()); render2(); }

  // ── Picker: en toggle-grid per dimension (multival, minst ett kvar). ──
  function byggGrid(id, nycklar, etikett, valda){
    const g = $(id); g.innerHTML = "";
    nycklar.forEach(k => {
      const b = document.createElement("button");
      b.className="toggle"; b.textContent = etikett(k);
      b.setAttribute("aria-pressed", valda.has(k));
      b.onclick = () => {
        if(valda.has(k)){ if(valda.size>1) valda.delete(k); } else valda.add(k);
        b.setAttribute("aria-pressed", valda.has(k)); spara(); newQuestion();
      };
      g.appendChild(b);
    });
  }
  // Pronomen-griden visar bara pronomen i valda seminarier.
  function byggGridPron(){
    const g = $("grid-pron"); g.innerHTML = "";
    synligaPron().forEach(p => {
      const b = document.createElement("button");
      b.className="toggle"; b.textContent = p.lemma + " (" + p.glosa + ")";
      b.setAttribute("aria-pressed", state.valdaPron.has(p.lemma));
      b.onclick = () => {
        if(state.valdaPron.has(p.lemma)){ if(state.valdaPron.size>1) state.valdaPron.delete(p.lemma); }
        else state.valdaPron.add(p.lemma);
        b.setAttribute("aria-pressed", state.valdaPron.has(p.lemma));
        uppdateraSektioner(); spara(); newQuestion();
      };
      g.appendChild(b);
    });
  }
  function byggGridSem(){
    const g = $("grid-sem"); g.innerHTML = "";
    SEMINARIER.forEach(s => {
      const b = document.createElement("button");
      b.className="toggle"; b.textContent = semNamn(s);
      b.setAttribute("aria-pressed", state.valdaSem.has(s));
      b.onclick = () => {
        if(state.valdaSem.has(s)){ if(state.valdaSem.size>1) state.valdaSem.delete(s); } else state.valdaSem.add(s);
        b.setAttribute("aria-pressed", state.valdaSem.has(s));
        uppdateraSnabbChips(); byggGridPron(); uppdateraSektioner(); spara(); newQuestion();
      };
      g.appendChild(b);
    });
    uppdateraSnabbChips();
  }
  /* "alla"/"inga"-chipsen blir svarta (aria-pressed) när seminarieurvalet exakt
     motsvarar allt resp. inget. */
  function setEq(a, b){ return a.size === b.size && [...a].every(x => b.has(x)); }
  function uppdateraSnabbChips(){
    const v = state.valdaSem;
    const all = document.querySelector("[data-sem-all]"), none = document.querySelector("[data-sem-none]");
    if(all)  all.setAttribute("aria-pressed", setEq(v, new Set(SEMINARIER)));
    if(none) none.setAttribute("aria-pressed", v.size === 0);
  }
  // Visa Betoning-/Genus-sektionen bara när aktiva pronomen använder dimensionen.
  function uppdateraSektioner(){
    const mods = new Set(aktivPron().map(p => p.modell));
    $("sec-bet").classList.toggle("hidden", !mods.has("person"));
    $("sec-genus").classList.toggle("hidden", !mods.has("genus"));
  }
  function byggPickers(){
    byggGridSem();
    byggGridPron();
    byggGrid("grid-num", NUM_ORDNING, k => NUM[k], state.valdaNum);
    byggGrid("grid-kas", KASUS_ORDNING, k => KASUS[k], state.valdaKas);
    byggGrid("grid-bet", BET_ORDNING, k => BET[k], state.valdaBet);
    byggGrid("grid-genus", GENUS_ORDNING, k => GENUS[k], state.valdaGenus);
    byggGrid("grid-roll", ROLL_ORDNING, k => ROLL[k], state.valdaRoll);
    uppdateraSektioner();
  }

  function uppdateraLäge(){
    $("mode-vand").setAttribute("aria-pressed", state.mode==="vand");
    $("mode-flerval").setAttribute("aria-pressed", state.mode==="flerval");
    const grsv = state.riktning === "gr-sv";
    $("rikt-svgr").setAttribute("aria-pressed", !grsv);
    $("rikt-grsv").setAttribute("aria-pressed", grsv);
    $("sub").textContent = grsv
      ? "Läs satsen och översätt det markerade pronominet. Formen ensam räcker inte — kontexten avgör."
      : "Personliga, demonstrativa och interrogativa pronomen. Ge den rätta formen.";
  }
  // Riktningsbyte nollställer sviten: frågorna mäter olika saker och en svit
  // som överlever bytet vore inte en svit på någonting.
  function byggRiktning(r){ if(state.riktning === r) return;
    state.riktning = r; state.streak = 0; state.forra = null;
    uppdateraLäge(); spara(); newQuestion(); }

  $("rikt-svgr").onclick    = () => byggRiktning("sv-gr");
  $("rikt-grsv").onclick    = () => byggRiktning("gr-sv");
  $("mode-vand").onclick    = () => { state.mode="vand"; uppdateraLäge(); spara(); newQuestion(); };
  $("mode-flerval").onclick = () => { state.mode="flerval"; uppdateraLäge(); spara(); newQuestion(); };
  document.querySelector("[data-roll-all]").onclick = () => {
    state.valdaRoll = new Set(ROLL_ORDNING); byggPickers(); spara(); newQuestion(); };
  $("btn-vand").onclick     = () => { state.besvarad=true; render2(); };
  $("btn-kunde").onclick    = () => { registrera(true); newQuestion(); };
  $("btn-missade").onclick  = () => { registrera(false); newQuestion(); };
  $("btn-next").onclick     = () => newQuestion();
  $("picker-toggle").onclick = () => { const o = $("picker-toggle").getAttribute("aria-expanded")==="true";
    $("picker-toggle").setAttribute("aria-expanded", !o); $("picker-body").classList.toggle("hidden", o); };
  document.querySelector("[data-sem-all]").onclick  = () => { state.valdaSem = new Set(SEMINARIER); byggGridSem(); byggGridPron(); uppdateraSektioner(); spara(); newQuestion(); };
  document.querySelector("[data-sem-none]").onclick = () => { state.valdaSem = new Set(); byggGridSem(); byggGridPron(); uppdateraSektioner(); spara(); newQuestion(); };

  __ph = e => {
    if(e.code==="Space" && state.mode==="vand" && !state.besvarad){ e.preventDefault(); state.besvarad=true; render2(); }
    else if(e.key==="Enter" && state.besvarad && state.mode==="flerval"){ newQuestion(); }
    else if(state.mode==="flerval" && !state.besvarad && /^[1-4]$/.test(e.key)){
      const f = state.card.optioner[+e.key-1]; if(f) svara(f); }
  };
  document.addEventListener("keydown", __ph);

  ladda(); uppdateraLäge(); byggPickers(); newQuestion();
}
