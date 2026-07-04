// Bibelgrekiska — skal: hash-router + hubb.
// Alla spel är nu portade som vy-moduler (vyer/*.js), laddade on demand.

const SPEL = [
  {
    nr: 1,
    namn: "Alfabetet",
    desc: "Bokstäver, namn och ljud",
    route: "#/alfabet",
  },
  {
    nr: 2,
    namn: "Glosor",
    desc: "Vokabulär från seminarium 2–4",
    route: "#/glosor",
  },
  {
    nr: 3,
    namn: "Kasusigenkänning",
    desc: "Genus, kasus och bestämd artikel",
    route: "#/kasus",
  },
  {
    nr: 4,
    namn: "Satsanalys",
    desc: "Identifiera satsdelarna",
    route: "#/satsanalys",
  },
  {
    nr: 5,
    namn: "Kongruens",
    desc: "Adjektivens böjning och överensstämmelse",
    route: "#/kongruens",
  },
  {
    nr: 6,
    namn: "Läsordning",
    desc: "Träna ordföljden i läsning",
    route: "#/lasordning",
  },
  {
    nr: 7,
    namn: "Artiklar & ändelser",
    desc: "Bygg formen i rätt deklination",
    route: "#/andelser",
  },
  {
    nr: 8,
    namn: "Verbböjning",
    desc: "Presens: ω-verb, kontraherade & εἰμί",
    route: "#/verb",
  },
];

const ROUTES = {
  "/alfabet": () => import("./vyer/alfabet.js"),
  "/glosor": () => import("./vyer/glosor.js"),
  "/kasus": () => import("./vyer/kasus.js"),
  "/satsanalys": () => import("./vyer/satsanalys.js"),
  "/kongruens": () => import("./vyer/kongruens.js"),
  "/lasordning": () => import("./vyer/lasordning.js"),
  "/andelser": () => import("./vyer/andelser.js"),
  "/verb": () => import("./vyer/verb.js"),
};

let current = null;

function renderHub(root) {
  const kort = SPEL.map(
    (s) => `<a class="hub-card" href="${s.route}">
      <span class="num">${s.nr}</span>
      <span class="body">
        <span class="name">${s.namn}</span>
        <span class="desc">${s.desc}</span>
      </span>
    </a>`,
  ).join("");
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
    location.hash = "";
  }
}

window.addEventListener("hashchange", navigate);
window.addEventListener("DOMContentLoaded", navigate);
