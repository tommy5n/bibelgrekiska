// Vy: Verbböjning — presens/imperfekt/futurum indikativ, presens imperativ och
// infinitiv (ω-verb, kontraherade -έω, εἰμί) för ω-verb, kontraherade och εἰμί.
// Snapshot av verb.json (mastern). Formerna är verifierade — ej genererade här;
// regenerera med scripts/gen_verb_snapshot.py efter varje ändring i verb.json.
// Självförsörjande: injicerar egen .vy-verb-stil (designvariabler från app.css) och städar i teardown.
let __vh = null;

export function teardown(){
  if(__vh){ document.removeEventListener("keydown", __vh); __vh = null; }
  const s = document.getElementById("vy-verb-style");
  if(s) s.remove();
}

/* ── DATA — snapshot av verb.json. Former nycklas per "tempus.modus"
   (pres.ind, impf.ind, fut.ind, pres.imp, pres.inf, fut.inf); varianter håller
   godtagbara dubbelformer per formnyckel/person. Diatesen fälls bort — kursen
   lär inte ut medium/passiv än (εἰμί ἔσομαι ligger under fut.ind). ───────── */
export const verb = [
  { lemma:"λύω", glosa:"lösa", klass:"omega", kortlekar:["sem2", "sem6", "sem7"], sem:[2, 6, 7], former:{ "pres.ind":{"1sg":"λύω", "2sg":"λύεις", "3sg":"λύει", "1pl":"λύομεν", "2pl":"λύετε", "3pl":"λύουσι(ν)"}, "fut.ind":{"1sg":"λύσω", "2sg":"λύσεις", "3sg":"λύσει", "1pl":"λύσομεν", "2pl":"λύσετε", "3pl":"λύσουσι(ν)"}, "pres.inf":{"inf":"λύειν"}, "pres.imp":{"2sg":"λῦε", "3sg":"λυέτω", "2pl":"λύετε", "3pl":"λυέτωσαν"}, "impf.ind":{"1sg":"ἔλυον", "2sg":"ἔλυες", "3sg":"ἔλυε(ν)", "1pl":"ἐλύομεν", "2pl":"ἐλύετε", "3pl":"ἔλυον"}, "fut.inf":{"inf":"λύσειν"} } },
  { lemma:"βλέπω", glosa:"se", klass:"omega", kortlekar:["sem2", "sem7"], sem:[2, 5, 7], former:{ "pres.ind":{"1sg":"βλέπω", "2sg":"βλέπεις", "3sg":"βλέπει", "1pl":"βλέπομεν", "2pl":"βλέπετε", "3pl":"βλέπουσι(ν)"}, "fut.ind":{"1sg":"βλέψω", "2sg":"βλέψεις", "3sg":"βλέψει", "1pl":"βλέψομεν", "2pl":"βλέψετε", "3pl":"βλέψουσι(ν)"}, "pres.inf":{"inf":"βλέπειν"}, "pres.imp":{"2sg":"βλέπε", "3sg":"βλεπέτω", "2pl":"βλέπετε", "3pl":"βλεπέτωσαν"}, "impf.ind":{"1sg":"ἔβλεπον", "2sg":"ἔβλεπες", "3sg":"ἔβλεπε(ν)", "1pl":"ἐβλέπομεν", "2pl":"ἐβλέπετε", "3pl":"ἔβλεπον"}, "fut.inf":{"inf":"βλέψειν"} } },
  { lemma:"ἀκούω", glosa:"höra", klass:"omega", kortlekar:["sem2", "sem6", "sem7"], sem:[2, 5, 6, 7], former:{ "pres.ind":{"1sg":"ἀκούω", "2sg":"ἀκούεις", "3sg":"ἀκούει", "1pl":"ἀκούομεν", "2pl":"ἀκούετε", "3pl":"ἀκούουσι(ν)"}, "fut.ind":{"1sg":"ἀκούσω", "2sg":"ἀκούσεις", "3sg":"ἀκούσει", "1pl":"ἀκούσομεν", "2pl":"ἀκούσετε", "3pl":"ἀκούσουσι(ν)"}, "pres.inf":{"inf":"ἀκούειν"}, "pres.imp":{"2sg":"ἄκουε", "3sg":"ἀκουέτω", "2pl":"ἀκούετε", "3pl":"ἀκουέτωσαν"}, "impf.ind":{"1sg":"ἤκουον", "2sg":"ἤκουες", "3sg":"ἤκουε(ν)", "1pl":"ἠκούομεν", "2pl":"ἠκούετε", "3pl":"ἤκουον"}, "fut.inf":{"inf":"ἀκούσειν"} } },
  { lemma:"λέγω", glosa:"säga", klass:"omega", kortlekar:["sem2", "sem7"], sem:[2, 5, 7], former:{ "pres.ind":{"1sg":"λέγω", "2sg":"λέγεις", "3sg":"λέγει", "1pl":"λέγομεν", "2pl":"λέγετε", "3pl":"λέγουσι(ν)"}, "pres.inf":{"inf":"λέγειν"}, "pres.imp":{"2sg":"λέγε", "3sg":"λεγέτω", "2pl":"λέγετε", "3pl":"λεγέτωσαν"}, "impf.ind":{"1sg":"ἔλεγον", "2sg":"ἔλεγες", "3sg":"ἔλεγε(ν)", "1pl":"ἐλέγομεν", "2pl":"ἐλέγετε", "3pl":"ἔλεγον"} } },
  { lemma:"γράφω", glosa:"skriva", klass:"omega", kortlekar:["sem2", "sem7"], sem:[2, 5, 7], former:{ "pres.ind":{"1sg":"γράφω", "2sg":"γράφεις", "3sg":"γράφει", "1pl":"γράφομεν", "2pl":"γράφετε", "3pl":"γράφουσι(ν)"}, "fut.ind":{"1sg":"γράψω", "2sg":"γράψεις", "3sg":"γράψει", "1pl":"γράψομεν", "2pl":"γράψετε", "3pl":"γράψουσι(ν)"}, "pres.inf":{"inf":"γράφειν"}, "pres.imp":{"2sg":"γράφε", "3sg":"γραφέτω", "2pl":"γράφετε", "3pl":"γραφέτωσαν"}, "impf.ind":{"1sg":"ἔγραφον", "2sg":"ἔγραφες", "3sg":"ἔγραφε(ν)", "1pl":"ἐγράφομεν", "2pl":"ἐγράφετε", "3pl":"ἔγραφον"}, "fut.inf":{"inf":"γράψειν"} } },
  { lemma:"ἐσθίω", glosa:"äta", klass:"omega", kortlekar:["sem2", "sem7"], sem:[2, 7], former:{ "pres.ind":{"1sg":"ἐσθίω", "2sg":"ἐσθίεις", "3sg":"ἐσθίει", "1pl":"ἐσθίομεν", "2pl":"ἐσθίετε", "3pl":"ἐσθίουσι(ν)"}, "pres.inf":{"inf":"ἐσθίειν"}, "pres.imp":{"2sg":"ἔσθιε", "3sg":"ἐσθιέτω", "2pl":"ἐσθίετε", "3pl":"ἐσθιέτωσαν"}, "impf.ind":{"1sg":"ἤσθιον", "2sg":"ἤσθιες", "3sg":"ἤσθιε(ν)", "1pl":"ἠσθίομεν", "2pl":"ἠσθίετε", "3pl":"ἤσθιον"} } },
  { lemma:"κηρύσσω", glosa:"predika", klass:"omega", kortlekar:["sem2", "sem7"], sem:[2, 5, 7], former:{ "pres.ind":{"1sg":"κηρύσσω", "2sg":"κηρύσσεις", "3sg":"κηρύσσει", "1pl":"κηρύσσομεν", "2pl":"κηρύσσετε", "3pl":"κηρύσσουσι(ν)"}, "fut.ind":{"1sg":"κηρύξω", "2sg":"κηρύξεις", "3sg":"κηρύξει", "1pl":"κηρύξομεν", "2pl":"κηρύξετε", "3pl":"κηρύξουσι(ν)"}, "pres.inf":{"inf":"κηρύσσειν"}, "pres.imp":{"2sg":"κήρυσσε", "3sg":"κηρυσσέτω", "2pl":"κηρύσσετε", "3pl":"κηρυσσέτωσαν"}, "impf.ind":{"1sg":"ἐκήρυσσον", "2sg":"ἐκήρυσσες", "3sg":"ἐκήρυσσε(ν)", "1pl":"ἐκηρύσσομεν", "2pl":"ἐκηρύσσετε", "3pl":"ἐκήρυσσον"}, "fut.inf":{"inf":"κηρύξειν"} } },
  { lemma:"λαμβάνω", glosa:"ta, gripa", klass:"omega", kortlekar:["sem2", "sem7"], sem:[2, 7], former:{ "pres.ind":{"1sg":"λαμβάνω", "2sg":"λαμβάνεις", "3sg":"λαμβάνει", "1pl":"λαμβάνομεν", "2pl":"λαμβάνετε", "3pl":"λαμβάνουσι(ν)"}, "pres.inf":{"inf":"λαμβάνειν"}, "pres.imp":{"2sg":"λάμβανε", "3sg":"λαμβανέτω", "2pl":"λαμβάνετε", "3pl":"λαμβανέτωσαν"}, "impf.ind":{"1sg":"ἐλάμβανον", "2sg":"ἐλάμβανες", "3sg":"ἐλάμβανε(ν)", "1pl":"ἐλαμβάνομεν", "2pl":"ἐλαμβάνετε", "3pl":"ἐλάμβανον"} } },
  { lemma:"παιδεύω", glosa:"uppfostra", klass:"omega", kortlekar:["sem2", "sem6", "sem7"], sem:[2, 6, 7], former:{ "pres.ind":{"1sg":"παιδεύω", "2sg":"παιδεύεις", "3sg":"παιδεύει", "1pl":"παιδεύομεν", "2pl":"παιδεύετε", "3pl":"παιδεύουσι(ν)"}, "fut.ind":{"1sg":"παιδεύσω", "2sg":"παιδεύσεις", "3sg":"παιδεύσει", "1pl":"παιδεύσομεν", "2pl":"παιδεύσετε", "3pl":"παιδεύσουσι(ν)"}, "pres.inf":{"inf":"παιδεύειν"}, "pres.imp":{"2sg":"παίδευε", "3sg":"παιδευέτω", "2pl":"παιδεύετε", "3pl":"παιδευέτωσαν"}, "impf.ind":{"1sg":"ἐπαίδευον", "2sg":"ἐπαίδευες", "3sg":"ἐπαίδευε(ν)", "1pl":"ἐπαιδεύομεν", "2pl":"ἐπαιδεύετε", "3pl":"ἐπαίδευον"}, "fut.inf":{"inf":"παιδεύσειν"} } },
  { lemma:"πέμπω", glosa:"skicka", klass:"omega", kortlekar:["sem2", "sem7"], sem:[2, 7], former:{ "pres.ind":{"1sg":"πέμπω", "2sg":"πέμπεις", "3sg":"πέμπει", "1pl":"πέμπομεν", "2pl":"πέμπετε", "3pl":"πέμπουσι(ν)"}, "fut.ind":{"1sg":"πέμψω", "2sg":"πέμψεις", "3sg":"πέμψει", "1pl":"πέμψομεν", "2pl":"πέμψετε", "3pl":"πέμψουσι(ν)"}, "pres.inf":{"inf":"πέμπειν"}, "pres.imp":{"2sg":"πέμπε", "3sg":"πεμπέτω", "2pl":"πέμπετε", "3pl":"πεμπέτωσαν"}, "impf.ind":{"1sg":"ἔπεμπον", "2sg":"ἔπεμπες", "3sg":"ἔπεμπε(ν)", "1pl":"ἐπέμπομεν", "2pl":"ἐπέμπετε", "3pl":"ἔπεμπον"}, "fut.inf":{"inf":"πέμψειν"} } },
  { lemma:"εὑρίσκω", glosa:"finna", klass:"omega", kortlekar:["sem2", "sem7"], sem:[2, 7], former:{ "pres.ind":{"1sg":"εὑρίσκω", "2sg":"εὑρίσκεις", "3sg":"εὑρίσκει", "1pl":"εὑρίσκομεν", "2pl":"εὑρίσκετε", "3pl":"εὑρίσκουσι(ν)"}, "pres.inf":{"inf":"εὑρίσκειν"}, "pres.imp":{"2sg":"εὕρισκε", "3sg":"εὑρισκέτω", "2pl":"εὑρίσκετε", "3pl":"εὑρισκέτωσαν"}, "impf.ind":{"1sg":"ηὕρισκον", "2sg":"ηὕρισκες", "3sg":"ηὕρισκε(ν)", "1pl":"ηὑρίσκομεν", "2pl":"ηὑρίσκετε", "3pl":"ηὕρισκον"} } },
  { lemma:"πιστεύω", glosa:"tro (på)", klass:"omega", kortlekar:["sem2", "sem6", "sem7"], sem:[2, 5, 6, 7], former:{ "pres.ind":{"1sg":"πιστεύω", "2sg":"πιστεύεις", "3sg":"πιστεύει", "1pl":"πιστεύομεν", "2pl":"πιστεύετε", "3pl":"πιστεύουσι(ν)"}, "fut.ind":{"1sg":"πιστεύσω", "2sg":"πιστεύσεις", "3sg":"πιστεύσει", "1pl":"πιστεύσομεν", "2pl":"πιστεύσετε", "3pl":"πιστεύσουσι(ν)"}, "pres.inf":{"inf":"πιστεύειν"}, "pres.imp":{"2sg":"πίστευε", "3sg":"πιστευέτω", "2pl":"πιστεύετε", "3pl":"πιστευέτωσαν"}, "impf.ind":{"1sg":"ἐπίστευον", "2sg":"ἐπίστευες", "3sg":"ἐπίστευε(ν)", "1pl":"ἐπιστεύομεν", "2pl":"ἐπιστεύετε", "3pl":"ἐπίστευον"}, "fut.inf":{"inf":"πιστεύσειν"} } },
  { lemma:"βαπτίζω", glosa:"döpa", klass:"omega", kortlekar:["sem2", "sem7"], sem:[2, 7], former:{ "pres.ind":{"1sg":"βαπτίζω", "2sg":"βαπτίζεις", "3sg":"βαπτίζει", "1pl":"βαπτίζομεν", "2pl":"βαπτίζετε", "3pl":"βαπτίζουσι(ν)"}, "fut.ind":{"1sg":"βαπτίσω", "2sg":"βαπτίσεις", "3sg":"βαπτίσει", "1pl":"βαπτίσομεν", "2pl":"βαπτίσετε", "3pl":"βαπτίσουσι(ν)"}, "pres.inf":{"inf":"βαπτίζειν"}, "pres.imp":{"2sg":"βάπτιζε", "3sg":"βαπτιζέτω", "2pl":"βαπτίζετε", "3pl":"βαπτιζέτωσαν"}, "impf.ind":{"1sg":"ἐβάπτιζον", "2sg":"ἐβάπτιζες", "3sg":"ἐβάπτιζε(ν)", "1pl":"ἐβαπτίζομεν", "2pl":"ἐβαπτίζετε", "3pl":"ἐβάπτιζον"}, "fut.inf":{"inf":"βαπτίσειν"} } },
  { lemma:"σῴζω", glosa:"rädda", klass:"omega", kortlekar:["sem2", "sem7"], sem:[2, 5, 7], former:{ "pres.ind":{"1sg":"σῴζω", "2sg":"σῴζεις", "3sg":"σῴζει", "1pl":"σῴζομεν", "2pl":"σῴζετε", "3pl":"σῴζουσι(ν)"}, "fut.ind":{"1sg":"σώσω", "2sg":"σώσεις", "3sg":"σώσει", "1pl":"σώσομεν", "2pl":"σώσετε", "3pl":"σώσουσι(ν)"}, "pres.inf":{"inf":"σῴζειν"}, "pres.imp":{"2sg":"σῷζε", "3sg":"σῳζέτω", "2pl":"σῴζετε", "3pl":"σῳζέτωσαν"}, "impf.ind":{"1sg":"ἔσῳζον", "2sg":"ἔσῳζες", "3sg":"ἔσῳζε(ν)", "1pl":"ἐσῴζομεν", "2pl":"ἐσῴζετε", "3pl":"ἔσῳζον"}, "fut.inf":{"inf":"σώσειν"} } },
  { lemma:"κλέπτω", glosa:"stjäla", klass:"omega", kortlekar:["sem2", "sem7"], sem:[2, 7], former:{ "pres.ind":{"1sg":"κλέπτω", "2sg":"κλέπτεις", "3sg":"κλέπτει", "1pl":"κλέπτομεν", "2pl":"κλέπτετε", "3pl":"κλέπτουσι(ν)"}, "fut.ind":{"1sg":"κλέψω", "2sg":"κλέψεις", "3sg":"κλέψει", "1pl":"κλέψομεν", "2pl":"κλέψετε", "3pl":"κλέψουσι(ν)"}, "pres.inf":{"inf":"κλέπτειν"}, "pres.imp":{"2sg":"κλέπτε", "3sg":"κλεπτέτω", "2pl":"κλέπτετε", "3pl":"κλεπτέτωσαν"}, "impf.ind":{"1sg":"ἔκλεπτον", "2sg":"ἔκλεπτες", "3sg":"ἔκλεπτε(ν)", "1pl":"ἐκλέπτομεν", "2pl":"ἐκλέπτετε", "3pl":"ἔκλεπτον"}, "fut.inf":{"inf":"κλέψειν"} } },
  { lemma:"ἄγω", glosa:"leda", klass:"omega", kortlekar:["sem2", "sem7"], sem:[2, 5, 7], former:{ "pres.ind":{"1sg":"ἄγω", "2sg":"ἄγεις", "3sg":"ἄγει", "1pl":"ἄγομεν", "2pl":"ἄγετε", "3pl":"ἄγουσι(ν)"}, "fut.ind":{"1sg":"ἄξω", "2sg":"ἄξεις", "3sg":"ἄξει", "1pl":"ἄξομεν", "2pl":"ἄξετε", "3pl":"ἄξουσι(ν)"}, "pres.inf":{"inf":"ἄγειν"}, "pres.imp":{"2sg":"ἄγε", "3sg":"ἀγέτω", "2pl":"ἄγετε", "3pl":"ἀγέτωσαν"}, "impf.ind":{"1sg":"ἦγον", "2sg":"ἦγες", "3sg":"ἦγε(ν)", "1pl":"ἤγομεν", "2pl":"ἤγετε", "3pl":"ἦγον"}, "fut.inf":{"inf":"ἄξειν"} } },
  { lemma:"φιλέω", glosa:"älska, gilla", klass:"kontrakt_e", kortlekar:["sem4", "sem6", "sem7"], sem:[4, 5, 6, 7], former:{ "pres.ind":{"1sg":"φιλῶ", "2sg":"φιλεῖς", "3sg":"φιλεῖ", "1pl":"φιλοῦμεν", "2pl":"φιλεῖτε", "3pl":"φιλοῦσι(ν)"}, "fut.ind":{"1sg":"φιλήσω", "2sg":"φιλήσεις", "3sg":"φιλήσει", "1pl":"φιλήσομεν", "2pl":"φιλήσετε", "3pl":"φιλήσουσι(ν)"}, "pres.inf":{"inf":"φιλεῖν"}, "pres.imp":{"2sg":"φίλει", "3sg":"φιλείτω", "2pl":"φιλεῖτε", "3pl":"φιλείτωσαν"}, "impf.ind":{"1sg":"ἐφίλουν", "2sg":"ἐφίλεις", "3sg":"ἐφίλει", "1pl":"ἐφιλοῦμεν", "2pl":"ἐφιλεῖτε", "3pl":"ἐφίλουν"}, "fut.inf":{"inf":"φιλήσειν"} } },
  { lemma:"ζητέω", glosa:"söka", klass:"kontrakt_e", kortlekar:["sem4", "sem6", "sem7"], sem:[4, 5, 6, 7], former:{ "pres.ind":{"1sg":"ζητῶ", "2sg":"ζητεῖς", "3sg":"ζητεῖ", "1pl":"ζητοῦμεν", "2pl":"ζητεῖτε", "3pl":"ζητοῦσι(ν)"}, "fut.ind":{"1sg":"ζητήσω", "2sg":"ζητήσεις", "3sg":"ζητήσει", "1pl":"ζητήσομεν", "2pl":"ζητήσετε", "3pl":"ζητήσουσι(ν)"}, "pres.inf":{"inf":"ζητεῖν"}, "pres.imp":{"2sg":"ζήτει", "3sg":"ζητείτω", "2pl":"ζητεῖτε", "3pl":"ζητείτωσαν"}, "impf.ind":{"1sg":"ἐζήτουν", "2sg":"ἐζήτεις", "3sg":"ἐζήτει", "1pl":"ἐζητοῦμεν", "2pl":"ἐζητεῖτε", "3pl":"ἐζήτουν"}, "fut.inf":{"inf":"ζητήσειν"} } },
  { lemma:"καλέω", glosa:"kalla", klass:"kontrakt_e", kortlekar:["sem4", "sem7"], sem:[4, 5, 7], former:{ "pres.ind":{"1sg":"καλῶ", "2sg":"καλεῖς", "3sg":"καλεῖ", "1pl":"καλοῦμεν", "2pl":"καλεῖτε", "3pl":"καλοῦσι(ν)"}, "pres.inf":{"inf":"καλεῖν"}, "pres.imp":{"2sg":"κάλει", "3sg":"καλείτω", "2pl":"καλεῖτε", "3pl":"καλείτωσαν"}, "impf.ind":{"1sg":"ἐκάλουν", "2sg":"ἐκάλεις", "3sg":"ἐκάλει", "1pl":"ἐκαλοῦμεν", "2pl":"ἐκαλεῖτε", "3pl":"ἐκάλουν"} } },
  { lemma:"λαλέω", glosa:"tala", klass:"kontrakt_e", kortlekar:["sem4", "sem6", "sem7"], sem:[4, 5, 6, 7], former:{ "pres.ind":{"1sg":"λαλῶ", "2sg":"λαλεῖς", "3sg":"λαλεῖ", "1pl":"λαλοῦμεν", "2pl":"λαλεῖτε", "3pl":"λαλοῦσι(ν)"}, "fut.ind":{"1sg":"λαλήσω", "2sg":"λαλήσεις", "3sg":"λαλήσει", "1pl":"λαλήσομεν", "2pl":"λαλήσετε", "3pl":"λαλήσουσι(ν)"}, "pres.inf":{"inf":"λαλεῖν"}, "pres.imp":{"2sg":"λάλει", "3sg":"λαλείτω", "2pl":"λαλεῖτε", "3pl":"λαλείτωσαν"}, "impf.ind":{"1sg":"ἐλάλουν", "2sg":"ἐλάλεις", "3sg":"ἐλάλει", "1pl":"ἐλαλοῦμεν", "2pl":"ἐλαλεῖτε", "3pl":"ἐλάλουν"}, "fut.inf":{"inf":"λαλήσειν"} } },
  { lemma:"μαρτυρέω", glosa:"vittna om", klass:"kontrakt_e", kortlekar:["sem4", "sem6", "sem7"], sem:[4, 5, 6, 7], former:{ "pres.ind":{"1sg":"μαρτυρῶ", "2sg":"μαρτυρεῖς", "3sg":"μαρτυρεῖ", "1pl":"μαρτυροῦμεν", "2pl":"μαρτυρεῖτε", "3pl":"μαρτυροῦσι(ν)"}, "fut.ind":{"1sg":"μαρτυρήσω", "2sg":"μαρτυρήσεις", "3sg":"μαρτυρήσει", "1pl":"μαρτυρήσομεν", "2pl":"μαρτυρήσετε", "3pl":"μαρτυρήσουσι(ν)"}, "pres.inf":{"inf":"μαρτυρεῖν"}, "pres.imp":{"2sg":"μαρτύρει", "3sg":"μαρτυρείτω", "2pl":"μαρτυρεῖτε", "3pl":"μαρτυρείτωσαν"}, "impf.ind":{"1sg":"ἐμαρτύρουν", "2sg":"ἐμαρτύρεις", "3sg":"ἐμαρτύρει", "1pl":"ἐμαρτυροῦμεν", "2pl":"ἐμαρτυρεῖτε", "3pl":"ἐμαρτύρουν"}, "fut.inf":{"inf":"μαρτυρήσειν"} } },
  { lemma:"ποιέω", glosa:"göra", klass:"kontrakt_e", kortlekar:["sem4", "sem6", "sem7"], sem:[4, 5, 6, 7], former:{ "pres.ind":{"1sg":"ποιῶ", "2sg":"ποιεῖς", "3sg":"ποιεῖ", "1pl":"ποιοῦμεν", "2pl":"ποιεῖτε", "3pl":"ποιοῦσι(ν)"}, "fut.ind":{"1sg":"ποιήσω", "2sg":"ποιήσεις", "3sg":"ποιήσει", "1pl":"ποιήσομεν", "2pl":"ποιήσετε", "3pl":"ποιήσουσι(ν)"}, "pres.inf":{"inf":"ποιεῖν"}, "pres.imp":{"2sg":"ποίει", "3sg":"ποιείτω", "2pl":"ποιεῖτε", "3pl":"ποιείτωσαν"}, "impf.ind":{"1sg":"ἐποίουν", "2sg":"ἐποίεις", "3sg":"ἐποίει", "1pl":"ἐποιοῦμεν", "2pl":"ἐποιεῖτε", "3pl":"ἐποίουν"}, "fut.inf":{"inf":"ποιήσειν"} } },
  { lemma:"τηρέω", glosa:"bevaka, bevara", klass:"kontrakt_e", kortlekar:["sem4", "sem6", "sem7"], sem:[4, 5, 6, 7], former:{ "pres.ind":{"1sg":"τηρῶ", "2sg":"τηρεῖς", "3sg":"τηρεῖ", "1pl":"τηροῦμεν", "2pl":"τηρεῖτε", "3pl":"τηροῦσι(ν)"}, "fut.ind":{"1sg":"τηρήσω", "2sg":"τηρήσεις", "3sg":"τηρήσει", "1pl":"τηρήσομεν", "2pl":"τηρήσετε", "3pl":"τηρήσουσι(ν)"}, "pres.inf":{"inf":"τηρεῖν"}, "pres.imp":{"2sg":"τήρει", "3sg":"τηρείτω", "2pl":"τηρεῖτε", "3pl":"τηρείτωσαν"}, "impf.ind":{"1sg":"ἐτήρουν", "2sg":"ἐτήρεις", "3sg":"ἐτήρει", "1pl":"ἐτηροῦμεν", "2pl":"ἐτηρεῖτε", "3pl":"ἐτήρουν"}, "fut.inf":{"inf":"τηρήσειν"} } },
  { lemma:"εἰμί", glosa:"vara", klass:"oregelbunden", kortlekar:["sem4", "eimi", "sem6", "sem7"], sem:[4, 5, 6, 7], former:{ "pres.ind":{"1sg":"εἰμί", "2sg":"εἶ", "3sg":"ἐστί(ν)", "1pl":"ἐσμέν", "2pl":"ἐστέ", "3pl":"εἰσί(ν)"}, "impf.ind":{"1sg":"ἤμην", "2sg":"ἦς", "3sg":"ἦν", "1pl":"ἦμεν", "2pl":"ἦτε", "3pl":"ἦσαν"}, "fut.ind":{"1sg":"ἔσομαι", "2sg":"ἔσῃ", "3sg":"ἔσται", "1pl":"ἐσόμεθα", "2pl":"ἔσεσθε", "3pl":"ἔσονται"}, "pres.inf":{"inf":"εἶναι"}, "pres.imp":{"2sg":"ἴσθι", "3sg":"ἔστω", "2pl":"ἔστε", "3pl":"ἔστωσαν"} }, varianter:{ "impf.ind":{"1sg":["ἦν"], "2sg":["ἦσθα"], "1pl":["ἤμεθα"]} } },
  { lemma:"αἰτέω", glosa:"be om", klass:"kontrakt_e", kortlekar:["sem5", "sem6", "sem7"], sem:[5, 6, 7], former:{ "pres.ind":{"1sg":"αἰτῶ", "2sg":"αἰτεῖς", "3sg":"αἰτεῖ", "1pl":"αἰτοῦμεν", "2pl":"αἰτεῖτε", "3pl":"αἰτοῦσι(ν)"}, "fut.ind":{"1sg":"αἰτήσω", "2sg":"αἰτήσεις", "3sg":"αἰτήσει", "1pl":"αἰτήσομεν", "2pl":"αἰτήσετε", "3pl":"αἰτήσουσι(ν)"}, "pres.inf":{"inf":"αἰτεῖν"}, "pres.imp":{"2sg":"αἴτει", "3sg":"αἰτείτω", "2pl":"αἰτεῖτε", "3pl":"αἰτείτωσαν"}, "impf.ind":{"1sg":"ᾔτουν", "2sg":"ᾔτεις", "3sg":"ᾔτει", "1pl":"ᾐτοῦμεν", "2pl":"ᾐτεῖτε", "3pl":"ᾔτουν"}, "fut.inf":{"inf":"αἰτήσειν"} } },
  { lemma:"θεραπεύω", glosa:"hela, bota", klass:"omega", kortlekar:["sem5", "sem6", "sem7"], sem:[5, 6, 7], former:{ "pres.ind":{"1sg":"θεραπεύω", "2sg":"θεραπεύεις", "3sg":"θεραπεύει", "1pl":"θεραπεύομεν", "2pl":"θεραπεύετε", "3pl":"θεραπεύουσι(ν)"}, "fut.ind":{"1sg":"θεραπεύσω", "2sg":"θεραπεύσεις", "3sg":"θεραπεύσει", "1pl":"θεραπεύσομεν", "2pl":"θεραπεύσετε", "3pl":"θεραπεύσουσι(ν)"}, "pres.inf":{"inf":"θεραπεύειν"}, "pres.imp":{"2sg":"θεράπευε", "3sg":"θεραπευέτω", "2pl":"θεραπεύετε", "3pl":"θεραπευέτωσαν"}, "impf.ind":{"1sg":"ἐθεράπευον", "2sg":"ἐθεράπευες", "3sg":"ἐθεράπευε(ν)", "1pl":"ἐθεραπεύομεν", "2pl":"ἐθεραπεύετε", "3pl":"ἐθεράπευον"}, "fut.inf":{"inf":"θεραπεύσειν"} } },
  { lemma:"ἁμαρτάνω", glosa:"synda", klass:"omega", kortlekar:["sem5", "sem7"], sem:[5, 7], former:{ "pres.ind":{"1sg":"ἁμαρτάνω", "2sg":"ἁμαρτάνεις", "3sg":"ἁμαρτάνει", "1pl":"ἁμαρτάνομεν", "2pl":"ἁμαρτάνετε", "3pl":"ἁμαρτάνουσι(ν)"}, "pres.inf":{"inf":"ἁμαρτάνειν"}, "pres.imp":{"2sg":"ἁμάρτανε", "3sg":"ἁμαρτανέτω", "2pl":"ἁμαρτάνετε", "3pl":"ἁμαρτανέτωσαν"}, "impf.ind":{"1sg":"ἡμάρτανον", "2sg":"ἡμάρτανες", "3sg":"ἡμάρτανε(ν)", "1pl":"ἡμαρτάνομεν", "2pl":"ἡμαρτάνετε", "3pl":"ἡμάρτανον"} } },
  { lemma:"λατρεύω", glosa:"tjäna (med dativ)", klass:"omega", kortlekar:["sem6", "sem7"], sem:[6, 7], former:{ "pres.ind":{"1sg":"λατρεύω", "2sg":"λατρεύεις", "3sg":"λατρεύει", "1pl":"λατρεύομεν", "2pl":"λατρεύετε", "3pl":"λατρεύουσι(ν)"}, "fut.ind":{"1sg":"λατρεύσω", "2sg":"λατρεύσεις", "3sg":"λατρεύσει", "1pl":"λατρεύσομεν", "2pl":"λατρεύσετε", "3pl":"λατρεύσουσι(ν)"}, "pres.inf":{"inf":"λατρεύειν"}, "pres.imp":{"2sg":"λάτρευε", "3sg":"λατρευέτω", "2pl":"λατρεύετε", "3pl":"λατρευέτωσαν"}, "impf.ind":{"1sg":"ἐλάτρευον", "2sg":"ἐλάτρευες", "3sg":"ἐλάτρευε(ν)", "1pl":"ἐλατρεύομεν", "2pl":"ἐλατρεύετε", "3pl":"ἐλάτρευον"}, "fut.inf":{"inf":"λατρεύσειν"} } },
  { lemma:"προσκυνέω", glosa:"tillbedja", klass:"kontrakt_e", kortlekar:["sem6", "sem7"], sem:[6, 7], former:{ "pres.ind":{"1sg":"προσκυνῶ", "2sg":"προσκυνεῖς", "3sg":"προσκυνεῖ", "1pl":"προσκυνοῦμεν", "2pl":"προσκυνεῖτε", "3pl":"προσκυνοῦσι(ν)"}, "fut.ind":{"1sg":"προσκυνήσω", "2sg":"προσκυνήσεις", "3sg":"προσκυνήσει", "1pl":"προσκυνήσομεν", "2pl":"προσκυνήσετε", "3pl":"προσκυνήσουσι(ν)"}, "pres.inf":{"inf":"προσκυνεῖν"}, "pres.imp":{"2sg":"προσκύνει", "3sg":"προσκυνείτω", "2pl":"προσκυνεῖτε", "3pl":"προσκυνείτωσαν"}, "impf.ind":{"1sg":"προσεκύνουν", "2sg":"προσεκύνεις", "3sg":"προσεκύνει", "1pl":"προσεκυνοῦμεν", "2pl":"προσεκυνεῖτε", "3pl":"προσεκύνουν"}, "fut.inf":{"inf":"προσκυνήσειν"} } },
  { lemma:"διώκω", glosa:"förfölja", klass:"omega", kortlekar:["sem7"], sem:[7], former:{ "pres.ind":{"1sg":"διώκω", "2sg":"διώκεις", "3sg":"διώκει", "1pl":"διώκομεν", "2pl":"διώκετε", "3pl":"διώκουσι(ν)"}, "fut.ind":{"1sg":"διώξω", "2sg":"διώξεις", "3sg":"διώξει", "1pl":"διώξομεν", "2pl":"διώξετε", "3pl":"διώξουσι(ν)"}, "pres.inf":{"inf":"διώκειν"}, "fut.inf":{"inf":"διώξειν"}, "pres.imp":{"2sg":"δίωκε", "3sg":"διωκέτω", "2pl":"διώκετε", "3pl":"διωκέτωσαν"}, "impf.ind":{"1sg":"ἐδίωκον", "2sg":"ἐδίωκες", "3sg":"ἐδίωκε(ν)", "1pl":"ἐδιώκομεν", "2pl":"ἐδιώκετε", "3pl":"ἐδίωκον"} } },
  { lemma:"πείθω", glosa:"övertyga", klass:"omega", kortlekar:["sem7"], sem:[7], former:{ "pres.ind":{"1sg":"πείθω", "2sg":"πείθεις", "3sg":"πείθει", "1pl":"πείθομεν", "2pl":"πείθετε", "3pl":"πείθουσι(ν)"}, "fut.ind":{"1sg":"πείσω", "2sg":"πείσεις", "3sg":"πείσει", "1pl":"πείσομεν", "2pl":"πείσετε", "3pl":"πείσουσι(ν)"}, "pres.inf":{"inf":"πείθειν"}, "fut.inf":{"inf":"πείσειν"}, "pres.imp":{"2sg":"πεῖθε", "3sg":"πειθέτω", "2pl":"πείθετε", "3pl":"πειθέτωσαν"}, "impf.ind":{"1sg":"ἔπειθον", "2sg":"ἔπειθες", "3sg":"ἔπειθε(ν)", "1pl":"ἐπείθομεν", "2pl":"ἐπείθετε", "3pl":"ἔπειθον"} } },
  { lemma:"ὑπάγω", glosa:"gå (bort), föra bort", klass:"omega", kortlekar:["sem7"], sem:[7], former:{ "pres.ind":{"1sg":"ὑπάγω", "2sg":"ὑπάγεις", "3sg":"ὑπάγει", "1pl":"ὑπάγομεν", "2pl":"ὑπάγετε", "3pl":"ὑπάγουσι(ν)"}, "fut.ind":{"1sg":"ὑπάξω", "2sg":"ὑπάξεις", "3sg":"ὑπάξει", "1pl":"ὑπάξομεν", "2pl":"ὑπάξετε", "3pl":"ὑπάξουσι(ν)"}, "pres.inf":{"inf":"ὑπάγειν"}, "fut.inf":{"inf":"ὑπάξειν"}, "pres.imp":{"2sg":"ὕπαγε", "3sg":"ὑπαγέτω", "2pl":"ὑπάγετε", "3pl":"ὑπαγέτωσαν"}, "impf.ind":{"1sg":"ὑπῆγον", "2sg":"ὑπῆγες", "3sg":"ὑπῆγε(ν)", "1pl":"ὑπήγομεν", "2pl":"ὑπήγετε", "3pl":"ὑπῆγον"} } },
  { lemma:"διδάσκω", glosa:"undervisa", klass:"omega", kortlekar:["sem7"], sem:[7], former:{ "pres.ind":{"1sg":"διδάσκω", "2sg":"διδάσκεις", "3sg":"διδάσκει", "1pl":"διδάσκομεν", "2pl":"διδάσκετε", "3pl":"διδάσκουσι(ν)"}, "fut.ind":{"1sg":"διδάξω", "2sg":"διδάξεις", "3sg":"διδάξει", "1pl":"διδάξομεν", "2pl":"διδάξετε", "3pl":"διδάξουσι(ν)"}, "pres.inf":{"inf":"διδάσκειν"}, "fut.inf":{"inf":"διδάξειν"}, "pres.imp":{"2sg":"δίδασκε", "3sg":"διδασκέτω", "2pl":"διδάσκετε", "3pl":"διδασκέτωσαν"}, "impf.ind":{"1sg":"ἐδίδασκον", "2sg":"ἐδίδασκες", "3sg":"ἐδίδασκε(ν)", "1pl":"ἐδιδάσκομεν", "2pl":"ἐδιδάσκετε", "3pl":"ἐδίδασκον"} } },
  { lemma:"μένω", glosa:"stanna, förbli", klass:"omega", kortlekar:["sem7"], sem:[7], former:{ "pres.ind":{"1sg":"μένω", "2sg":"μένεις", "3sg":"μένει", "1pl":"μένομεν", "2pl":"μένετε", "3pl":"μένουσι(ν)"}, "pres.inf":{"inf":"μένειν"}, "pres.imp":{"2sg":"μένε", "3sg":"μενέτω", "2pl":"μένετε", "3pl":"μενέτωσαν"}, "impf.ind":{"1sg":"ἔμενον", "2sg":"ἔμενες", "3sg":"ἔμενε(ν)", "1pl":"ἐμένομεν", "2pl":"ἐμένετε", "3pl":"ἔμενον"} } },
  { lemma:"βάλλω", glosa:"kasta", klass:"omega", kortlekar:["sem7"], sem:[7], former:{ "pres.ind":{"1sg":"βάλλω", "2sg":"βάλλεις", "3sg":"βάλλει", "1pl":"βάλλομεν", "2pl":"βάλλετε", "3pl":"βάλλουσι(ν)"}, "pres.inf":{"inf":"βάλλειν"}, "pres.imp":{"2sg":"βάλλε", "3sg":"βαλλέτω", "2pl":"βάλλετε", "3pl":"βαλλέτωσαν"}, "impf.ind":{"1sg":"ἔβαλλον", "2sg":"ἔβαλλες", "3sg":"ἔβαλλε(ν)", "1pl":"ἐβάλλομεν", "2pl":"ἐβάλλετε", "3pl":"ἔβαλλον"} } },
  { lemma:"θέλω", glosa:"vilja", klass:"omega", kortlekar:["sem7"], sem:[7], former:{ "pres.ind":{"1sg":"θέλω", "2sg":"θέλεις", "3sg":"θέλει", "1pl":"θέλομεν", "2pl":"θέλετε", "3pl":"θέλουσι(ν)"}, "pres.inf":{"inf":"θέλειν"}, "pres.imp":{"2sg":"θέλε", "3sg":"θελέτω", "2pl":"θέλετε", "3pl":"θελέτωσαν"}, "impf.ind":{"1sg":"ἤθελον", "2sg":"ἤθελες", "3sg":"ἤθελε(ν)", "1pl":"ἠθέλομεν", "2pl":"ἠθέλετε", "3pl":"ἤθελον"} } },
  { lemma:"μέλλω", glosa:"tänka, ämna, komma att", klass:"omega", kortlekar:["sem7"], sem:[7], former:{ "pres.ind":{"1sg":"μέλλω", "2sg":"μέλλεις", "3sg":"μέλλει", "1pl":"μέλλομεν", "2pl":"μέλλετε", "3pl":"μέλλουσι(ν)"}, "pres.inf":{"inf":"μέλλειν"}, "pres.imp":{"2sg":"μέλλε", "3sg":"μελλέτω", "2pl":"μέλλετε", "3pl":"μελλέτωσαν"}, "impf.ind":{"1sg":"ἔμελλον", "2sg":"ἔμελλες", "3sg":"ἔμελλε(ν)", "1pl":"ἐμέλλομεν", "2pl":"ἐμέλλετε", "3pl":"ἔμελλον"} } }
];

/* Tempus: nyckel → svensk etikett (standard: presens). */
const TEMPUS = { pres:"presens", impf:"imperfekt", fut:"futurum" };
const TEMPUS_ORDNING = ["pres","impf","fut"];

/* Modus: nyckel → svensk etikett. Sem 7 införde imperativ och infinitiv —
   det är MODUS, inte tempus (indikativ konstaterar, imperativ uttrycker vilja).
   Cellerna skiljer sig: indikativ har 6 person/numerus, imperativ 4 (saknar
   1:a person), infinitiv 1 (saknar person och numerus helt). */
const MODUS = { ind:"indikativ", imp:"imperativ", inf:"infinitiv" };
const MODUS_ORDNING = ["ind","imp","inf"];

/* Person/numerus: svensk etikett + pronomen (för kort och facit). */
const PN = {
  "1sg":{ namn:"1:a person singular", pron:"jag" },
  "2sg":{ namn:"2:a person singular", pron:"du" },
  "3sg":{ namn:"3:e person singular", pron:"han/hon/det" },
  "1pl":{ namn:"1:a person plural",   pron:"vi" },
  "2pl":{ namn:"2:a person plural",   pron:"ni" },
  "3pl":{ namn:"3:e person plural",   pron:"de" },
  "inf":{ namn:"infinitiv",           pron:"att …" },
};
const PN_ORDNING = ["1sg","2sg","3sg","1pl","2pl","3pl"];
const IMP_ORDNING = ["2sg","3sg","2pl","3pl"];   // imperativ saknar 1:a person

/* Formnyckel = "tempus.modus". Vilka celler en nyckel har styrs av modus. */
const modusAv  = k => k.split(".")[1];
const tempusAv = k => k.split(".")[0];
const cellerFor = k => modusAv(k)==="inf" ? ["inf"] : modusAv(k)==="imp" ? IMP_ORDNING : PN_ORDNING;

const LEKAR = {
  alla:  verb.map(v => v.lemma),
  sem2:  verb.filter(v => v.kortlekar.includes("sem2")).map(v => v.lemma),
  sem4:  verb.filter(v => v.kortlekar.includes("sem4")).map(v => v.lemma),
  eimi:  verb.filter(v => v.kortlekar.includes("eimi")).map(v => v.lemma),
};

/* Seminarie-axel: varje verb bär sem:[…] ur verb.json. Skalar till fler
   seminarier — chipsen radbryts. */
const SEMINARIER = [...new Set(verb.flatMap(v => v.sem))].sort((a,b) => a - b);
const semNamn = s => "Sem " + s;

const STYLE = `
.vy-verb .stage{ display:flex; flex-direction:column; align-items:center; gap:1rem; margin-top:1rem; }
.vy-verb .card{ background:var(--card); border:1px solid var(--line); border-radius:14px;
  padding:1.6rem 1.4rem; min-width:min(30rem,92vw); text-align:center;
  box-shadow:0 1px 0 rgba(0,0,0,.03); }
.vy-verb .prompt{ font-family:"Cardo",serif; font-size:var(--fs-4xl); color:var(--ink); line-height:1.1; }
.vy-verb .glosa{ font-family:"Spectral",serif; color:var(--ink-soft); font-size:var(--fs-lg); margin-top:.3rem; }
.vy-verb .target{ font-family:"Spectral",serif; color:var(--gold); font-size:var(--fs-xl); margin-top:.7rem; }
.vy-verb .target b{ color:var(--ink); }
.vy-verb .reveal{ margin-top:1rem; border-top:1px dashed var(--line); padding-top:1rem; }
.vy-verb .svar{ font-family:"Cardo",serif; font-size:var(--fs-3xl); color:var(--ink); }
.vy-verb .svarlabel{ font-family:"Spectral",serif; color:var(--ink-soft); font-size:var(--fs-sm); margin-top:.2rem; }
.vy-verb .hidden{ display:none !important; }
.vy-verb .controls{ display:flex; gap:.6rem; justify-content:center; }
.vy-verb .btn{ font-family:"Spectral",serif; font-size:var(--fs-md); padding:.55rem 1.2rem;
  border:1px solid var(--line); border-radius:10px; background:var(--card); color:var(--ink); cursor:pointer; }
.vy-verb .btn.primary{ background:var(--gold); color:#fff; border-color:var(--gold); }
.vy-verb .btn.good{ background:var(--good-bg); color:var(--good); border-color:var(--good); }
.vy-verb .btn.bad{ background:var(--bad-bg); color:var(--bad); border-color:var(--bad); }
.vy-verb .options{ display:grid; grid-template-columns:1fr 1fr; gap:.6rem; min-width:min(30rem,92vw); }
.vy-verb .opt{ font-family:"Cardo",serif; font-size:var(--fs-2xl); padding:.5rem .3rem;
  border:1px solid var(--line); border-radius:10px; background:var(--card); color:var(--ink); cursor:pointer; }
.vy-verb .opt:hover:not(:disabled){ border-color:var(--gold); }
.vy-verb .opt:disabled{ cursor:default; }
.vy-verb .opt.correct{ background:var(--good-bg); border-color:var(--good); color:var(--good); }
.vy-verb .opt.wrong{ background:var(--bad-bg); border-color:var(--bad); color:var(--bad); }
.vy-verb .streak{ font-family:"Spectral",serif; color:var(--ink-soft); font-size:var(--fs-sm); }
.vy-verb .modes{ display:flex; gap:.5rem; justify-content:center; margin:.4rem 0 0; }
.vy-verb .mode{ font-family:"Spectral",serif; font-size:var(--fs-sm); padding:.35rem .9rem;
  border:1px solid var(--line); border-radius:999px; background:var(--card); color:var(--ink-soft); cursor:pointer; }
.vy-verb .mode[aria-pressed="true"]{ background:var(--ink); color:var(--paper); border-color:var(--ink); }
/* Picker (.picker/.picker-toggle/.chip/.toggle m.fl.) stylas nu av den delade
   komponenten i app.css — inga vy-lokala regler här. */
.vy-verb footer{ margin-top:1.4rem; font-family:"Spectral",serif; color:var(--ink-soft); font-size:var(--fs-2xs); text-align:center; }
`;

const MARKUP = `<div class="vy vy-verb">
<header>
  <h1>Grekiska — verbböjning</h1>
  <div class="sub" id="sub">Uppslagsform + person och numerus. Ge den rätta presensformen.</div>
</header>

<div class="modes" role="group" aria-label="Spelläge">
  <button class="mode" id="mode-vand" aria-pressed="true">Vänd-kort</button>
  <button class="mode" id="mode-flerval" aria-pressed="false">Flerval</button>
</div>

<div class="stage">
  <div class="card">
    <div class="prompt" id="prompt">—</div>
    <div class="glosa" id="glosa"></div>
    <div class="target" id="target"></div>
    <div class="reveal hidden" id="reveal">
      <div class="svar" id="svar"></div>
      <div class="svarlabel" id="svarlabel"></div>
    </div>
  </div>

  <div class="controls" id="controls-vand"><button class="btn primary" id="btn-vand">Visa formen</button></div>
  <div class="controls hidden" id="controls-grade">
    <button class="btn good" id="btn-kunde">Kunde</button>
    <button class="btn bad" id="btn-missade">Missade</button>
  </div>

  <div class="options hidden" id="options"></div>
  <div class="controls hidden" id="controls-next"><button class="btn primary" id="btn-next">Nästa</button></div>

  <div class="streak">Svit: <b id="streak">0</b> &nbsp;·&nbsp; bästa: <b id="best">0</b> &nbsp;·&nbsp; <b id="runda-kvar">0</b> kvar i rundan</div>
</div>

<div class="picker">
  <button class="picker-toggle" id="picker-toggle" aria-expanded="false"><span>Anpassa övningen <span class="count" id="verb-count"></span></span><span>▾</span></button>
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
      <h2>Tempus</h2>
      <div class="grid" id="grid-tempus"></div>
    </div>
    <div>
      <h2>Modus</h2>
      <div class="grid" id="grid-modus"></div>
    </div>
    <div>
      <h2>Verb</h2>
      <div class="quickrow">
        <span class="quicklabel">Klass:</span>
        <button class="chip" data-lek="alla">alla</button>
        <button class="chip" data-lek="sem2">ω-verb</button>
        <button class="chip" data-lek="sem4">kontraherade</button>
        <button class="chip" data-lek="eimi">εἰμί</button>
      </div>
      <div class="grid" id="grid-verb"></div>
    </div>
    <div id="sec-pn">
      <h2>Person &amp; numerus</h2>
      <div class="quickrow">
        <button class="chip" data-pn="all">alla</button>
        <button class="chip" data-pn="sg">singular</button>
        <button class="chip" data-pn="pl">plural</button>
      </div>
      <div class="grid" id="grid-pn"></div>
    </div>
  </div>
</div>

<footer>Distraktorerna i flerval är andra former av <em>samma</em> verb — de tränar ändelserna, inte gissning. Indikativ konstaterar (<em>βλέπεις</em> du ser), imperativ uttrycker vilja (<em>βλέπε</em> titta!).</footer>
</div>`;

export function render(root){
  if(!document.getElementById("vy-verb-style")){
    const st = document.createElement("style"); st.id = "vy-verb-style"; st.textContent = STYLE;
    document.head.appendChild(st);
  }
  root.innerHTML = MARKUP;

  const LAGER = "grekiska-verbspel";
  const state = {
    mode: "vand",
    tempus: "pres",
    modus: "ind",
    valdaVerb: new Set(verb.map(v => v.lemma)),
    valdaSem: new Set(SEMINARIER),
    valdaPN: new Set(PN_ORDNING),
    streak: 0, best: 0, card: null, besvarad: false, valt: null, forra: null,
    rk: { ko: [], kvar: 0, forra: null, forraRen: true, bas: null },
  };

  const $ = id => document.getElementById(id);
  const pick = a => a[Math.floor(Math.random()*a.length)];
  const shuffle = a => { a=a.slice(); for(let i=a.length-1;i>0;i--){ const j=Math.floor(Math.random()*(i+1)); [a[i],a[j]]=[a[j],a[i]]; } return a; };

  // Formnycklar som passar nuvarande tempus- OCH modus-filter ("alla" = fritt).
  const nyckelMatch = k => (state.tempus==="alla" || tempusAv(k)===state.tempus)
                        && (state.modus==="alla"  || modusAv(k)===state.modus);
  const nycklarFor  = v => Object.keys(v.former).filter(nyckelMatch);
  const harForm     = v => nycklarFor(v).length > 0;
  const semMatch    = o => o.sem.some(s => state.valdaSem.has(s));
  // Seminarie-urvalet styr vilka verb som visas i rutnätet; verbrutnätet finjusterar.
  const synligaVerb = () => { const v = verb.filter(semMatch); return v.length ? v : verb; };
  const aktivaVerb  = () => {
    const v = synligaVerb().filter(o => state.valdaVerb.has(o.lemma) && harForm(o));
    if(v.length) return v;
    const bs = synligaVerb().filter(harForm);
    return bs.length ? bs : verb.filter(harForm);
  };

  /* Rundkö (glosmodell, som satsanalys): gå igenom verben en gång; ett verb som
     missas läggs sist och återkommer inom rundan; tom kö → ny omblandad runda.
     Rundan fylls om automatiskt när urvalet (verbmängden) ändras. "kvar i rundan"
     räknar distinkta verb som är kvar att klara. */
  const aktivaVerbIds = () => aktivaVerb().map(v => v.lemma);
  const rkSig = () => aktivaVerbIds().join("");
  function rkFyll(){ const ids = aktivaVerbIds(); state.rk.ko = shuffle(ids); state.rk.kvar = ids.length; state.rk.bas = rkSig(); }
  function rkNasta(){
    const rk = state.rk;
    if(rk.bas !== rkSig()){ rk.forra = null; rk.forraRen = true; rkFyll(); }   // urval ändrat → ny runda
    else { if(rk.forra != null && !rk.forraRen) rk.ko.push(rk.forra); if(!rk.ko.length) rkFyll(); }
    let id = rk.ko.shift();
    if(id === rk.forra && rk.ko.length){ rk.ko.push(id); id = rk.ko.shift(); }
    rk.forra = id; rk.forraRen = false;
    return id;
  }
  function rkKlarad(){ const rk = state.rk; if(!rk.forraRen){ rk.forraRen = true; rk.kvar = Math.max(0, rk.kvar - 1); } }
  // Person/numerus-filtret gäller bara de celler nyckeln faktiskt har: infinitiv
  // har ingen person, imperativ ingen 1:a person.
  const aktivaPN = k => {
    const celler = cellerFor(k);
    if(celler.length === 1) return celler;                    // infinitiv
    const p = celler.filter(x => state.valdaPN.has(x));
    return p.length ? p : celler;
  };
  // Visas person/numerus-sektionen alls? Bara om något valbart modus har personer.
  const pnRelevant  = () => state.modus !== "inf";
  const pnTillgangligt = k => state.modus==="alla" ? PN_ORDNING : cellerFor("x."+state.modus);
  const setEq = (a, b) => a.size === b.size && [...a].every(x => b.has(x));
  const PN_GRUPPER = { all:PN_ORDNING, sg:["1sg","2sg","3sg"], pl:["1pl","2pl","3pl"] };

  function spara(){ try{ localStorage.setItem(LAGER, JSON.stringify({
    mode:state.mode, tempus:state.tempus, modus:state.modus, valdaVerb:[...state.valdaVerb], valdaSem:[...state.valdaSem], valdaPN:[...state.valdaPN], best:state.best })); }catch(e){} }
  function ladda(){ try{ const r = JSON.parse(localStorage.getItem(LAGER)); if(!r) return;
    if(r.mode) state.mode = r.mode;
    if(r.tempus && (TEMPUS[r.tempus] || r.tempus==="alla")) state.tempus = r.tempus;
    if(r.modus && (MODUS[r.modus] || r.modus==="alla")) state.modus = r.modus;
    if(Array.isArray(r.valdaVerb)) state.valdaVerb = new Set(r.valdaVerb.filter(l => verb.some(v=>v.lemma===l)));
    if(Array.isArray(r.valdaSem))  state.valdaSem  = new Set(r.valdaSem.filter(s => SEMINARIER.includes(s)));
    if(Array.isArray(r.valdaPN))   state.valdaPN   = new Set(r.valdaPN.filter(k => PN_ORDNING.includes(k)));
    if(!state.valdaSem.size) state.valdaSem = new Set(SEMINARIER);
    if(typeof r.best === "number") state.best = r.best;
  }catch(e){} }

  // Godtagbara svar för en cell = primärform + ev. variantformer (samma formnyckel).
  const variantformer = (v, k, p) => (v.varianter && v.varianter[k] && v.varianter[k][p]) || [];
  const accepterade   = (v, k, p) => [v.former[k][p], ...variantformer(v, k, p)];

  function byggOptioner(v, k, rätta){
    // Distraktorer = andra former (primär + variant) av SAMMA verb och formnyckel,
    // minus de som räknas som rätt svar (så en godtagbar variant aldrig blir "fel").
    const pool = [];
    const samla = nyckel => cellerFor(nyckel).forEach(p => {
      const c = v.former[nyckel]; if(!c || !c[p]) return;
      pool.push(c[p]); variantformer(v, nyckel, p).forEach(f => pool.push(f));
    });
    samla(k);
    // Infinitiv har bara EN cell — då räcker inte den egna nyckeln till distraktorer.
    // Fyll på med verbets övriga former (λύειν vs λύσειν vs λύει är just kontrasten).
    if([...new Set(pool)].filter(f => !rätta.has(f)).length < 3){
      Object.keys(v.former).filter(n => n!==k).forEach(samla);
    }
    const distraktorer = [...new Set(pool)].filter(f => !rätta.has(f));
    const rätt = pick([...rätta]);   // slumpvis primär- eller variantform som rätt alternativ
    return shuffle([rätt, ...shuffle(distraktorer).slice(0,3)]);
  }

  function uppdateraAntal(){ const el = $("verb-count"); if(el) el.textContent = "(" + aktivaVerb().length + " verb)"; }
  function newQuestion(){
    uppdateraAntal();
    const _id = rkNasta();
    const v = verb.find(o => o.lemma === _id) || pick(aktivaVerb());
    const k = pick(nycklarFor(v)), p = pick(aktivaPN(k));
    const rätta = new Set(accepterade(v, k, p));
    state.card = {
      lemma: v.lemma, glosa: v.glosa, pn: p, nyckel: k,
      tempus: tempusAv(k), modus: modusAv(k),
      form: v.former[k][p], varianter: variantformer(v, k, p), rätta,
      optioner: state.mode === "flerval" ? byggOptioner(v, k, rätta) : null,
    };
    state.besvarad = false; state.valt = null;
    render2();
  }

  function render2(){
    const c = state.card;
    $("prompt").textContent = c.lemma;
    $("glosa").textContent = c.glosa;
    // Tempus visas när tempusfiltret är fritt, modus när modusfiltret är fritt.
    // Infinitiven har ingen person → där ÄR modus målet, och pronomenet utelämnas.
    const delar = [];
    if(state.tempus==="alla") delar.push("<b>" + TEMPUS[c.tempus] + "</b>");
    if(c.modus==="inf"){
      if(state.tempus!=="alla") delar.push(TEMPUS[c.tempus]);
      delar.push("<b>infinitiv</b>");
    } else {
      if(state.modus==="alla") delar.push("<b>" + MODUS[c.modus] + "</b>");
      delar.push("<b>" + PN[c.pn].namn + "</b> (" + PN[c.pn].pron + ")");
    }
    $("target").innerHTML = "→ " + delar.join(" · ");
    $("streak").textContent = state.streak;
    $("best").textContent = state.best;
    $("runda-kvar").textContent = state.rk.kvar;

    $("reveal").classList.add("hidden");
    $("controls-vand").classList.add("hidden");
    $("controls-grade").classList.add("hidden");
    $("options").classList.add("hidden");
    $("controls-next").classList.add("hidden");

    if(state.mode === "vand"){
      if(state.besvarad){ visaSvar(); $("controls-grade").classList.remove("hidden"); }
      else { $("controls-vand").classList.remove("hidden"); }
    } else {
      renderOptioner(); $("options").classList.remove("hidden");
      if(state.besvarad){ visaSvar(); $("controls-next").classList.remove("hidden"); }
    }
    resultatram();
  }
  // Grön/amber ram: bara i flerval där svaret rättas automatiskt (vänd-läget
  // självbedöms och går vidare direkt, så ingen ram där).
  function resultatram(){
    const kort = document.querySelector(".vy-verb .card"); if(!kort) return;
    const rätt = state.mode==="flerval" && state.besvarad && state.valt!=null && state.card.rätta.has(state.valt);
    const fel  = state.mode==="flerval" && state.besvarad && state.valt!=null && !state.card.rätta.has(state.valt);
    kort.classList.toggle("svar-ratt", rätt);
    kort.classList.toggle("svar-fel", fel);
  }
  function visaSvar(){
    const c = state.card;
    $("svar").textContent = c.form;
    // Facit-etiketten är alltid fullständig (tempus · modus · person), oavsett filter.
    let label = c.lemma + " · " + TEMPUS[c.tempus] + " " + MODUS[c.modus]
              + (c.modus==="inf" ? "" : " · " + PN[c.pn].namn);
    if(c.varianter.length) label += " · äv. " + c.varianter.join(", ");
    $("svarlabel").textContent = label;
    $("reveal").classList.remove("hidden");
  }
  function renderOptioner(){
    const box = $("options"); box.innerHTML = "";
    state.card.optioner.forEach(f => {
      const b = document.createElement("button");
      b.className = "opt"; b.textContent = f;
      if(state.besvarad){
        b.disabled = true;
        if(state.card.rätta.has(f)) b.classList.add("correct");
        else if(f === state.valt) b.classList.add("wrong");
      } else { b.onclick = () => svara(f); }
      box.appendChild(b);
    });
  }
  function registrera(rätt){ if(rätt){ state.streak++; if(state.streak>state.best){ state.best=state.streak; spara(); } } else state.streak=0; }
  function svara(f){ const rätt = state.card.rätta.has(f); state.valt=f; state.besvarad=true; registrera(rätt); if(rätt) rkKlarad(); render2(); }

  // Ett tempus/modus-par som inget verb har (t.ex. imperfekt imperativ) vore en
  // återvändsgränd → knappen inaktiveras i stället för att ge tom fråga.
  const parFinns = (t, m) => verb.some(v => Object.keys(v.former).some(k =>
    (t==="alla" || tempusAv(k)===t) && (m==="alla" || modusAv(k)===m)));

  function byggGridTempus(){
    const g = $("grid-tempus"); g.innerHTML = "";
    [...TEMPUS_ORDNING, "alla"].forEach(t => {
      const b = document.createElement("button");
      b.className="toggle"; b.textContent = t==="alla" ? "alla" : TEMPUS[t];
      const finns = parFinns(t, state.modus);
      b.disabled = !finns;
      if(!finns) b.setAttribute("aria-label", TEMPUS[t] + " saknar " + MODUS[state.modus]);
      b.setAttribute("aria-pressed", state.tempus===t);
      b.onclick = () => { state.tempus=t; byggGridTempus(); byggGridModus(); byggGridVerb(); byggGridPN(); uppdateraSub(); spara(); newQuestion(); };
      g.appendChild(b);
    });
  }
  function byggGridModus(){
    const g = $("grid-modus"); g.innerHTML = "";
    [...MODUS_ORDNING, "alla"].forEach(m => {
      const b = document.createElement("button");
      b.className="toggle"; b.textContent = m==="alla" ? "alla" : MODUS[m];
      const finns = parFinns(state.tempus, m);
      b.disabled = !finns;
      if(!finns) b.setAttribute("aria-label", MODUS[m] + " saknar " + TEMPUS[state.tempus]);
      b.setAttribute("aria-pressed", state.modus===m);
      b.onclick = () => { state.modus=m; byggGridTempus(); byggGridModus(); byggGridVerb(); byggGridPN(); uppdateraSub(); spara(); newQuestion(); };
      g.appendChild(b);
    });
  }
  function byggGridVerb(){
    const g = $("grid-verb"); g.innerHTML = "";
    synligaVerb().forEach(v => {                       // visar bara verb i valda seminarier
      const b = document.createElement("button");
      b.className="toggle"; b.textContent=v.lemma;
      const finns = harForm(v);
      b.disabled = !finns;
      if(!finns) b.setAttribute("aria-label", v.lemma + " (saknar " + beskrivning() + ")");
      b.setAttribute("aria-pressed", finns && state.valdaVerb.has(v.lemma));
      b.onclick = () => { state.valdaVerb.has(v.lemma)?state.valdaVerb.delete(v.lemma):state.valdaVerb.add(v.lemma);
        b.setAttribute("aria-pressed", state.valdaVerb.has(v.lemma)); uppdateraVerbChips(); spara(); newQuestion(); };
      g.appendChild(b);
    });
    uppdateraVerbChips();
  }
  function byggGridSem(){
    const g = $("grid-sem"); g.innerHTML = "";
    SEMINARIER.forEach(s => {
      const b = document.createElement("button");
      b.className="toggle"; b.textContent=semNamn(s);
      b.setAttribute("aria-pressed", state.valdaSem.has(s));
      b.onclick = () => { state.valdaSem.has(s)?state.valdaSem.delete(s):state.valdaSem.add(s);
        b.setAttribute("aria-pressed", state.valdaSem.has(s)); byggGridVerb(); spara(); newQuestion(); };
      g.appendChild(b);
    });
  }
  function byggGridPN(){
    // Infinitiven saknar person och numerus → hela sektionen döljs.
    const sek = $("sec-pn");
    if(sek) sek.classList.toggle("hidden", !pnRelevant());
    const g = $("grid-pn"); g.innerHTML = "";
    const tillgangliga = new Set(pnTillgangligt());
    PN_ORDNING.forEach(k => {
      const b = document.createElement("button");
      b.className="toggle"; b.textContent=PN[k].pron; b.setAttribute("aria-label", PN[k].namn);
      // Imperativ saknar 1:a person → knapparna finns kvar men går inte att välja.
      const finns = tillgangliga.has(k);
      b.disabled = !finns;
      if(!finns) b.setAttribute("aria-label", PN[k].namn + " (imperativ saknar 1:a person)");
      b.setAttribute("aria-pressed", finns && state.valdaPN.has(k));
      b.onclick = () => { state.valdaPN.has(k)?state.valdaPN.delete(k):state.valdaPN.add(k);
        b.setAttribute("aria-pressed", state.valdaPN.has(k)); uppdateraPNChips(); spara(); newQuestion(); };
      g.appendChild(b);
    });
    uppdateraPNChips();
  }
  function uppdateraLäge(){ $("mode-vand").setAttribute("aria-pressed", state.mode==="vand");
    $("mode-flerval").setAttribute("aria-pressed", state.mode==="flerval"); }
  // "presens indikativ" / "imperfekt" / "infinitiv" … efter vad filtren låser fast.
  function beskrivning(){
    const t = state.tempus==="alla" ? "" : TEMPUS[state.tempus];
    const m = state.modus==="alla"  ? "" : MODUS[state.modus];
    return [t, m].filter(Boolean).join(" ");
  }
  function uppdateraSub(){
    const b = beskrivning();
    const mal = state.modus==="inf" ? "Uppslagsform + tempus. Ge infinitiven."
      : b ? "Uppslagsform + person och numerus. Ge den rätta " + b + "formen."
          : "Uppslagsform + tempus, modus, person och numerus. Ge den rätta formen.";
    $("sub").textContent = mal;
  }
  // Guldram på den kvickvals-chip vars grupp exakt motsvarar nuvarande urval (annars ingen).
  function uppdateraVerbChips(){ document.querySelectorAll("[data-lek]").forEach(b =>
    b.setAttribute("aria-pressed", setEq(state.valdaVerb, new Set(LEKAR[b.dataset.lek] || [])))); }
  function uppdateraPNChips(){ document.querySelectorAll("[data-pn]").forEach(b =>
    b.setAttribute("aria-pressed", setEq(state.valdaPN, new Set(PN_GRUPPER[b.dataset.pn] || [])))); }

  $("mode-vand").onclick    = () => { state.mode="vand"; uppdateraLäge(); spara(); newQuestion(); };
  $("mode-flerval").onclick = () => { state.mode="flerval"; uppdateraLäge(); spara(); newQuestion(); };
  $("btn-vand").onclick     = () => { state.besvarad=true; render2(); };
  $("btn-kunde").onclick    = () => { registrera(true); rkKlarad(); newQuestion(); };
  $("btn-missade").onclick  = () => { registrera(false); newQuestion(); };
  $("btn-next").onclick     = () => newQuestion();
  $("picker-toggle").onclick = () => { const o = $("picker-toggle").getAttribute("aria-expanded")==="true";
    $("picker-toggle").setAttribute("aria-expanded", !o); $("picker-body").classList.toggle("hidden", o); };

  document.querySelectorAll("[data-lek]").forEach(b => b.onclick = () => {
    state.valdaVerb = new Set(LEKAR[b.dataset.lek] || []); byggGridVerb(); spara(); newQuestion(); });
  document.querySelectorAll("[data-pn]").forEach(b => b.onclick = () => {
    state.valdaPN = new Set(PN_GRUPPER[b.dataset.pn] || PN_ORDNING); byggGridPN(); spara(); newQuestion(); });
  document.querySelector("[data-sem-all]").onclick  = () => { state.valdaSem = new Set(SEMINARIER); byggGridSem(); byggGridVerb(); spara(); newQuestion(); };
  document.querySelector("[data-sem-none]").onclick = () => { state.valdaSem = new Set(); byggGridSem(); byggGridVerb(); spara(); newQuestion(); };

  __vh = e => {
    if(e.code==="Space" && state.mode==="vand" && !state.besvarad){ e.preventDefault(); state.besvarad=true; render2(); }
    else if(e.key==="Enter" && state.besvarad && state.mode==="flerval"){ newQuestion(); }
    else if(state.mode==="flerval" && !state.besvarad && /^[1-4]$/.test(e.key)){
      const f = state.card.optioner[+e.key-1]; if(f) svara(f); }
  };
  document.addEventListener("keydown", __vh);

  ladda(); uppdateraLäge(); byggGridSem(); byggGridTempus(); byggGridModus(); byggGridVerb(); byggGridPN(); uppdateraSub(); newQuestion();
}
