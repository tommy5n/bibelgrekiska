// Bibelgrekiska — skal: hash-router + hubb.
// Alla spel är nu portade som vy-moduler (vyer/*.js), laddade on demand.

// Versionsstämpel: ärvs från hur app.js laddades (app.js?v=NN i index.html),
// så en enda bump där slår igenom även på vy-importerna nedan. Ingen SW.
const V = new URL(import.meta.url).searchParams.get("v") || "";
const vv = V ? `?v=${V}` : "";

// Städa bort en ev. gammal service worker från tidigare versioner — appen
// använder ingen SW längre, och en kvarhängande SW skulle servera stale kod.
if ("serviceWorker" in navigator) {
  navigator.serviceWorker.getRegistrations()
    .then((rs) => rs.forEach((r) => r.unregister())).catch(() => {});
  if (self.caches) caches.keys()
    .then((ks) => ks.forEach((k) => caches.delete(k))).catch(() => {});
}

const SPEL = [
  {
    nr: 1,
    namn: "Studieguide",
    desc: "Kursöversikt seminarium för seminarium — begrepp, fällor och var du övar",
    route: "#/studieguide",
  },
  {
    nr: 2,
    namn: "Alfabetet",
    desc: "Bokstäver, namn och ljud",
    route: "#/alfabet",
  },
  {
    nr: 3,
    namn: "Glosor",
    desc: "Vokabulär från seminarierna",
    route: "#/glosor",
  },
  {
    nr: 4,
    namn: "Kasusigenkänning",
    desc: "Genus, kasus och bestämd artikel",
    route: "#/kasus",
  },
  {
    nr: 5,
    namn: "Satsanalys",
    desc: "Identifiera satsdelarna",
    route: "#/satsanalys",
  },
  {
    nr: 6,
    namn: "Kongruens",
    desc: "Adjektivens böjning och överensstämmelse",
    route: "#/kongruens",
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
    desc: "Tempus & modus: presens, imperfekt, futurum, imperativ, infinitiv",
    route: "#/verb",
  },
  {
    nr: 9,
    namn: "Pronomen",
    desc: "Pronomen: ἐγώ, σύ, αὐτός, οὗτος, τίς, ἐμός, τις",
    route: "#/pronomen",
  },
  {
    nr: 10,
    namn: "Paradigm",
    desc: "Fyll i hela böjningstabellen — kasus × numerus",
    route: "#/paradigm",
  },
  {
    nr: 11,
    namn: "Prepositioner",
    desc: "Kasus styr betydelsen — välj rätt utifrån frasen",
    route: "#/prepositioner",
  },
  {
    nr: 12,
    namn: "Formverkstaden",
    desc: "Bygg om formen: presens ↔ imperfekt, futurum, imperativ, infinitiv",
    route: "#/former",
  },
];

const ROUTES = {
  "/alfabet": () => import(`./vyer/alfabet.js${vv}`),
  "/glosor": () => import(`./vyer/glosor.js${vv}`),
  "/kasus": () => import(`./vyer/kasus.js${vv}`),
  "/satsanalys": () => import(`./vyer/satsanalys.js${vv}`),
  "/kongruens": () => import(`./vyer/kongruens.js${vv}`),
  "/studieguide": () => import(`./vyer/studieguide.js${vv}`),
  "/andelser": () => import(`./vyer/andelser.js${vv}`),
  "/verb": () => import(`./vyer/verb.js${vv}`),
  "/pronomen": () => import(`./vyer/pronomen.js${vv}`),
  "/paradigm": () => import(`./vyer/paradigm.js${vv}`),
  "/prepositioner": () => import(`./vyer/prepositioner.js${vv}`),
  "/former": () => import(`./vyer/former.js${vv}`),
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
    <div class="hub-grid">${kort}
      <a class="hub-card" href="seminarieovningar.html">
        <span class="num">✎</span>
        <span class="body">
          <span class="name">Seminarieövningar</span>
          <span class="desc">Alla uppgifter och breakout-rum med facit, kommentarer och fällor</span>
        </span>
      </a>
      <a class="hub-card" href="grammatikreferens.html">
        <span class="num">§</span>
        <span class="body">
          <span class="name">Grammatikreferens</span>
          <span class="desc">Deklinationer, böjningar och exempel – för uppslag</span>
        </span>
      </a>
    </div>
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
