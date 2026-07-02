// Vy: Läsordning — portad exakt från grekiska-lasordning.html
let __kh = null;
export function teardown(){ if(__kh){ document.removeEventListener("keydown", __kh); __kh = null; } }
const MARKUP = `<div class="vy vy-lasordning">
<div class="wrap">

  <header>
    <h1>Bibelgrekiska I — Läsordning</h1>
    <div class="sub">Läs ett block, nöt det i spelet, gå vidare när formerna sitter.</div>
  </header>

  <div class="progress">
    <div class="bar"><div class="bar-fill" id="bar-fill"></div></div>
    <div class="progress-row">
      <span class="label" id="progress-label">0 av 0 steg klara</span>
      <button class="reset" id="reset">Nollställ</button>
    </div>
  </div>

  <div class="princip">
    <h2>Så funkar ordningen</h2>
    <p><b>Läs → nöt → gå vidare.</b> Läs ett block i lathunden, nöt formerna i matchande spel, och fortsätt först när de går automatiskt.</p>
    <p><b>Glosor är bränslet.</b> Utan ord blir grammatikspelen bara formflyttande — därför löper glos-spelet parallellt hela vägen, lite och ofta.</p>
    <p><b>Former före satser.</b> Du kan inte ta ut satsdelar om du fastnar på att läsa ändelserna — så formspelen kommer före analysspelen.</p>
  </div>

  <div class="stege" id="stege"></div>

  <div class="vanor">
    <h2>Parallella vanor</h2>
    <p class="undertext">Löper genom alla fyra stegen — det är de här som ger fäste.</p>
    <div class="vana"><b>Dagligt:</b><span>Några minuter glos-spelet med det du låst upp. Ord behöver täta, korta repetitioner — inte plugg i klump.</span></div>
    <div class="vana"><b>Kumulativt:</b><span>Efter varje klarat seminarium: kör varje spel med <i>alla</i> filter på, inte bara det nyaste. Mellanrummen flyttar kunskapen till långtidsminnet.</span></div>
    <div class="vana"><b>Mästerskapsgrind:</b><span>Gå vidare när du håller en stabil svit på det <i>nyaste</i> materialet med filtren på — inte bara känner igen formerna.</span></div>
  </div>

  <footer>
    Tänk på lathunden som teknikgenomgången och spelen som gymmet: läs greppet, täck över tabellen och försök återge den, gör repetitionerna i spelet, och låt ”Kom ihåg”-rutan peka ut fällan innan du går vidare.
  </footer>

</div>
</div>`;
export function render(root){
  root.innerHTML = MARKUP;

const STEG = [
  { n:1, titel:"Seminarium 1 — Skrift och ljud", tema:"Grinden till allt annat — läs formerna rätt.",
    las:"Alfabet, diftonger, spiritus, accenter, iota subscriptum, de tre ordklasserna.",
    spela:[ {spel:"Alfabetsspelet", vad:"bokstäver och ljud tills de går av sig själva"} ],
    mal:"Du kan läsa vilken form som helst högt utan att staka dig." },

  { n:2, titel:"Seminarium 2 — Substantiv, verb och satsdelar", tema:"Former böjs, och kasus avslöjar rollen i satsen.",
    las:"Maskulina -ος, den bestämda artikeln, ω-verb i presens, kasus & satsdelar.",
    spela:[
      {spel:"Glos-spelet", filter:"sem 2", vad:"starta ordförrådsmotorn; sedan 5 min varje dag"},
      {spel:"Kasusspelet", filter:"maskulinum", vad:"nöt själva kasusformerna"},
      {spel:"Satsanalys", vad:"läs rollen ur kasus, inte ur ordföljden"} ],
    mal:"Du tar ut subjekt, objekt och dativ ur kasusformen — inte ur ordföljden." },

  { n:3, titel:"Seminarium 3 — Neutrum, adjektiv, kongruens och εἰμί", tema:"Kongruens införs och ’vara’ ger en ny satsdel.",
    las:"Neutrum -ον (+ nom = ack-fällan), adjektiv ἅγιος, kongruens, accenttyper, εἰμί presens, predikatsfyllnad, attributiv/predikativ ställning.",
    spela:[
      {spel:"Glos-spelet", filter:"+ sem 3", vad:"bygg vidare ordförrådet"},
      {spel:"Kasusspelet", filter:"+ neutrum", vad:"sikta särskilt på nom = ack-fällan"},
      {spel:"Kongruensspelet", filter:"attributivt läge", vad:"adjektivkongruens; läs accentläget i ἁγίῳ/ἁγίου/ἁγίοις"},
      {spel:"Satsanalys", vad:"nu med εἰμί-satser och predikatsfyllnad"} ],
    mal:"Du skiljer attributiv från predikativ och håller accenten genom adjektivets böjning." },

  { n:4, titel:"Seminarium 4 — Första deklinationen, prepositioner och kontraherade verb", tema:"Femininum, imperfekt, prepositioner och adverbial.",
    las:"Feminina 1:a dekl. (tre typer), adjektiv femininum (+ gen.pl ἁγίων vs ἐκκλησιῶν), εἰμί imperfekt, prepositioner, adverbial, -έω-verb.",
    spela:[
      {spel:"Glos-spelet", filter:"+ sem 4 → alla", vad:"hela ordförrådet"},
      {spel:"Kasusspelet", filter:"+ femininum → alla", vad:"alla tre genus"},
      {spel:"Kongruensspelet", filter:"predikativt läge + εἰμί-verblucka", vad:"nya konstruktionen; här möter du ej-nominativ-fällan"},
      {spel:"Satsanalys (sem 4)", vad:"adverbial som ny satsdel"} ],
    mal:"Du böjer feminina former rätt och klarar predikativ kongruens i nominativ." },
];

const LAGER = "grek-lasordning-v1";
let klaraSet = new Set();
function ladda(){ try{ const r = JSON.parse(localStorage.getItem(LAGER)); if(Array.isArray(r)) klaraSet = new Set(r); }catch(e){} }
function spara(){ try{ localStorage.setItem(LAGER, JSON.stringify([...klaraSet])); }catch(e){} }

function rad(id, inner){
  const klar = klaraSet.has(id);
  const r = document.createElement("div");
  r.className = "rad" + (klar ? " avklarad" : "");
  const box = document.createElement("div");
  box.className = "box" + (klar ? " klar" : "");
  box.setAttribute("role","checkbox");
  box.setAttribute("aria-checked", String(klar));
  box.addEventListener("click", () => {
    if(klaraSet.has(id)) klaraSet.delete(id); else klaraSet.add(id);
    spara(); render();
  });
  const txt = document.createElement("div");
  txt.className = "radtext";
  txt.innerHTML = inner;
  r.append(box, txt);
  return r;
}

function render(){
  const stege = document.getElementById("stege");
  stege.innerHTML = "";
  STEG.forEach(s => {
    const steg = document.createElement("div"); steg.className = "steg";
    steg.innerHTML = `<div class="nod">${s.n}</div>
      <div class="steg-titel">${s.titel}</div>
      <div class="steg-tema">${s.tema}</div>`;

    const lasBlock = document.createElement("div"); lasBlock.className = "block";
    lasBlock.appendChild(rad(`s${s.n}-las`, `<span class="tag">Läs</span>${s.las}`));
    steg.appendChild(lasBlock);

    const spelBlock = document.createElement("div"); spelBlock.className = "block";
    s.spela.forEach((sp, i) => {
      const filter = sp.filter ? `<span class="filter">${sp.filter}</span>` : "";
      const tagg = i === 0 ? `<span class="tag">Spela</span>` : `<span class="tag"></span>`;
      const inner = `${tagg}<span class="num">${i+1}.</span><span class="spel">${sp.spel}</span>${filter} <span class="vad">${sp.vad}</span>`;
      spelBlock.appendChild(rad(`s${s.n}-spela-${i}`, inner));
    });
    steg.appendChild(spelBlock);

    const mal = document.createElement("div"); mal.className = "mal";
    mal.innerHTML = `<span class="tag">Mål</span><span>${s.mal}</span>`;
    steg.appendChild(mal);

    stege.appendChild(steg);
  });

  // framsteg
  let totalt = 0;
  STEG.forEach(s => { totalt += 1 + s.spela.length; });
  const klara = [...klaraSet].filter(id => id.startsWith("s")).length;
  document.getElementById("bar-fill").style.width = totalt ? (100*klara/totalt) + "%" : "0";
  document.getElementById("progress-label").textContent = `${klara} av ${totalt} steg klara`;
}

document.getElementById("reset").addEventListener("click", () => {
  klaraSet.clear(); spara(); render();
});

ladda();
render();

}
