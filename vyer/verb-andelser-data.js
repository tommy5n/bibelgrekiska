// GENERERAD av scripts/gen_verb_snapshot.py ur json/verb.json (_klasser[*].andelser).
// Personändelser per verbklass × tempus.modus × person — okontraherade
// (ω-verb) och kontraherade (-έω), samma sammanställning som lärarens två
// bilder och grammatikreferensens översiktskort. Redigera ALDRIG här —
// ändra i mastern och kör: python3 scripts/gen_verb_snapshot.py
export const VERB_ANDELSER = {
  "omega": {
    "pres.ind": {"1sg":"-ω", "2sg":"-εις", "3sg":"-ει", "1pl":"-ομεν", "2pl":"-ετε", "3pl":"-ουσι(ν)"},
    "fut.ind": {"1sg":"-σω", "2sg":"-σεις", "3sg":"-σει", "1pl":"-σομεν", "2pl":"-σετε", "3pl":"-σουσι(ν)"},
    "pres.inf": {"inf":"-ειν"},
    "pres.imp": {"2sg":"-ε", "3sg":"-έτω", "2pl":"-ετε", "3pl":"-έτωσαν"},
    "impf.ind": {"1sg":"-ον", "2sg":"-ες", "3sg":"-ε(ν)", "1pl":"-ομεν", "2pl":"-ετε", "3pl":"-ον"},
    "fut.inf": {"inf":"-σειν"},
    "aor.ind": {"1sg":"-σα", "2sg":"-σας", "3sg":"-σε(ν)", "1pl":"-σαμεν", "2pl":"-σατε", "3pl":"-σαν"},
    "aor.imp": {"2sg":"-σον", "3sg":"-σάτω", "2pl":"-σατε", "3pl":"-σάτωσαν"},
    "aor.inf": {"inf":"-σαι"}
  },
  "kontrakt_e": {
    "pres.ind": {"1sg":"-ῶ", "2sg":"-εῖς", "3sg":"-εῖ", "1pl":"-οῦμεν", "2pl":"-εῖτε", "3pl":"-οῦσι(ν)"},
    "fut.ind": {"1sg":"-ησω", "2sg":"-ησεις", "3sg":"-ησει", "1pl":"-ησομεν", "2pl":"-ησετε", "3pl":"-ησουσι(ν)"},
    "pres.inf": {"inf":"-εῖν"},
    "pres.imp": {"2sg":"-ει", "3sg":"-είτω", "2pl":"-εῖτε", "3pl":"-είτωσαν"},
    "impf.ind": {"1sg":"-ουν", "2sg":"-εις", "3sg":"-ει", "1pl":"-οῦμεν", "2pl":"-εῖτε", "3pl":"-ουν"},
    "fut.inf": {"inf":"-ήσειν"},
    "aor.ind": {"1sg":"-ησα", "2sg":"-ησας", "3sg":"-ησε(ν)", "1pl":"-ησαμεν", "2pl":"-ησατε", "3pl":"-ησαν"},
    "aor.imp": {"2sg":"-ησον", "3sg":"-ησάτω", "2pl":"-ησατε", "3pl":"-ησάτωσαν"},
    "aor.inf": {"inf":"-ῆσαι"}
  }
};
