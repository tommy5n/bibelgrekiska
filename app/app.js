// Bibelgrekiska — skal: hash-router + hubb.
// Portade vyer laddas som ES-moduler on demand; ännu ej portade spel
// länkar tillfälligt till sina gamla fristående filer under migreringen.

const SPEL = [
  { num: 1, namn: "Alfabetet",        desc: "Bokstäver, namn och ljud",                   fil: "../grekiska-alfabetspel-sem4.html" },
  { num: 2, namn: "Glosor",           desc: "Vokabulär från seminarium 2–4",              fil: "../grekiska-glosspel-sem4.html" },
  { num: 3, namn: "Kasusigenkänning", desc: "Genus, kasus och bestämd artikel",           fil: "../grekiska-kasusspel-sem4.html" },
  { num: 4, namn: "Satsanalys",       desc: "Identifiera satsdelarna",                     fil: "../grekiska-satsanalys-sem4.html" },
  { num: 5, namn: "Kongruens",        desc: "Adjektivens böjning och överensstämmelse",    fil: "../grekiska-kongruensspel-sem4.html" },
  { num: 6, namn: "Läsordning",       desc: "Träna ordföljden i läsning",                  fil: "../grekiska-lasordning-sem4.html" },
  { num: 7, namn: "Artiklar & ändelser", desc: "Bygg formen i rätt deklination",           route: "#/andelser" },
];

// Route → dynamisk import av vymodul
const ROUTES = {
  "/andelser": () => import("./vyer/andelser.js"),
};

let current = null;

function renderHub(root) {
  const kort = SPEL.map(s => {
    const href = s.route ? s.route : s.fil;
    const extern = s.route ? "" : " extern";
    return `<a class="hub-card${extern}" href="${href}">
      <span class="num">${s.num}</span>
      <span class="body">
        <span class="name">${s.namn}</span>
        <span class="desc">${s.desc}</span>
      </span>
    </a>`;
  }).join("");
  root.innerHTML = `<div class="hub">
    <h1>Bibelgrekiska</h1>
    <p class="sub">Interaktiva övningar för Bibelgrekiska I.</p>
    <div class="hub-grid">${kort}</div>
  </div>`;
}

async function navigate() {
  const hash = location.hash.replace(/^#/, "") || "/";
  const vy = document.getElementById("vy");
  const bar = document.getElementById("app-bar");

  if (current && current.teardown) current.teardown();
  current = null;
  vy.innerHTML = "";

  if (hash === "/" || hash === "") {
    bar.style.display = "none";
    renderHub(vy);
    window.scrollTo(0, 0);
    return;
  }

  const loader = ROUTES[hash];
  if (loader) {
    bar.style.display = "";
    try {
      const mod = await loader();
      mod.render(vy);
      current = mod;
      window.scrollTo(0, 0);
    } catch (e) {
      console.error(e);
      vy.innerHTML = '<p style="padding:2rem 0">Kunde inte ladda vyn.</p>';
    }
  } else {
    location.hash = "";   // okänd route → tillbaka till hubben
  }
}

window.addEventListener("hashchange", navigate);
window.addEventListener("DOMContentLoaded", navigate);
