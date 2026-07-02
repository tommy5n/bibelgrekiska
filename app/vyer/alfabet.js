// Vy: Alfabetet — portad exakt från grekiska-alfabet.html
let __kh = null;
export function teardown(){ if(__kh){ document.removeEventListener("keydown", __kh); __kh = null; } }
const MARKUP = `<div class="vy vy-alfabet">
<header>
      <h1>Grekiska alfabetet</h1>
      <p class="subtitle">ett minnesspel · Bibelgrekiska I</p>
    </header>

    <nav class="tabs">
      <button class="tab active" data-mode="flashcard">
        Lär in · vänd-kort
      </button>
      <button class="tab" data-mode="quiz">Testa · flerval</button>
    </nav>

    <main>
      <section class="picker">
        <button class="picker-toggle" id="picker-toggle" aria-expanded="false">
          <span>Välj bokstäver att öva på</span><span class="chev">▾</span>
        </button>
        <div class="picker-body hidden" id="picker-body">
          <div class="seg-label">Form</div>
          <div class="segmented" id="case-control">
            <button class="seg" data-case="lower">
              <span class="g">α</span>gemener
            </button>
            <button class="seg" data-case="upper">
              <span class="g">Α</span>versaler
            </button>
            <button class="seg" data-case="mixed">
              <span class="g">Αα</span>blandat
            </button>
          </div>
          <div class="quickrow">
            <button class="chip" data-quick="all">Markera alla</button>
            <button class="chip" data-quick="none">Rensa</button>
            <button class="chip" data-quick="vowels">Vokaler</button>
            <button class="chip" data-quick="consonants">Konsonanter</button>
          </div>
          <div class="grid" id="letter-grid"></div>
        </div>
        <p class="picker-status" id="picker-status"></p>
      </section>

      <div class="card">
        <div class="hero" id="hero">α</div>

        <!-- VÄND-KORT -->
        <div id="flashcard">
          <div class="facit hidden" id="facit">
            <div class="facit-name" id="fc-name"></div>
            <div class="facit-forms" id="fc-forms"></div>
            <div class="facit-meta">
              <span id="fc-translit"></span> · <span id="fc-sound"></span>
            </div>
          </div>
          <div class="actions">
            <button class="btn" id="flip">Vänd<kbd>mellanslag</kbd></button>
            <button class="btn ghost" id="fc-next">
              Nästa<kbd>enter</kbd>
            </button>
          </div>
        </div>

        <!-- FLERVAL -->
        <div id="quiz" class="hidden">
          <p class="prompt">Vilken bokstav är detta?</p>
          <div class="choices" id="choices"></div>
          <div class="feedback" id="feedback"></div>
          <button class="btn hidden" id="quiz-next">
            Nästa<kbd>enter</kbd>
          </button>
        </div>
      </div>

      <div class="scoreboard hidden" id="scoreboard">
        Rätt <strong id="sb-correct">0</strong> / <span id="sb-total">0</span> ·
        Streak <strong id="sb-streak">0</strong>
        <span class="best">bästa <span id="sb-best">0</span></span>
      </div>
    </main>

    <footer>
      <p>
        Uttal följer kursens lathund (Sjösvärd 2010). Bygg på spelet genom att
        lägga till poster i <code>letters</code>-listan högst upp i koden.
      </p>
    </footer>
</div>`;
export function render(root){
  root.innerHTML = MARKUP;

      /* ============================================================
   DATA — det här är det enda du rör för att lägga till innehåll.
   Varje post = ett "kort". Spelmotorn nedan vet inget om grekiska;
   den visar bara det som står här. (Som frågekort i ett brädspel.)
   audio: null  →  plats reserverad för ljudfil senare.
   ============================================================ */
      const letters = [
        {
          lower: "α",
          upper: "Α",
          name: "alfa",
          translit: "a",
          sound: "a, kort eller långt",
          audio: null,
        },
        {
          lower: "β",
          upper: "Β",
          name: "beta",
          translit: "b",
          sound: "b",
          audio: null,
        },
        {
          lower: "γ",
          upper: "Γ",
          name: "gamma",
          translit: "g",
          sound: "g; ng framför γ κ ξ χ",
          audio: null,
        },
        {
          lower: "δ",
          upper: "Δ",
          name: "delta",
          translit: "d",
          sound: "d",
          audio: null,
        },
        {
          lower: "ε",
          upper: "Ε",
          name: "epsilon",
          translit: "e",
          sound: "e/ä, kort",
          audio: null,
        },
        {
          lower: "ζ",
          upper: "Ζ",
          name: "zeta",
          translit: "z",
          sound: "ds eller ts",
          audio: null,
        },
        {
          lower: "η",
          upper: "Η",
          name: "eta",
          translit: "ē",
          sound: "e/ä, långt",
          audio: null,
        },
        {
          lower: "θ",
          upper: "Θ",
          name: "theta",
          translit: "th",
          sound: "th (eng. thin)",
          audio: null,
        },
        {
          lower: "ι",
          upper: "Ι",
          name: "iota",
          translit: "i",
          sound: "i, kort/långt (ibland j)",
          audio: null,
        },
        {
          lower: "κ",
          upper: "Κ",
          name: "kappa",
          translit: "k",
          sound: "k",
          audio: null,
        },
        {
          lower: "λ",
          upper: "Λ",
          name: "lambda",
          translit: "l",
          sound: "l",
          audio: null,
        },
        {
          lower: "μ",
          upper: "Μ",
          name: "my",
          translit: "m",
          sound: "m",
          audio: null,
        },
        {
          lower: "ν",
          upper: "Ν",
          name: "ny",
          translit: "n",
          sound: "n",
          audio: null,
        },
        {
          lower: "ξ",
          upper: "Ξ",
          name: "xi",
          translit: "x",
          sound: "ks",
          audio: null,
        },
        {
          lower: "ο",
          upper: "Ο",
          name: "omikron",
          translit: "o",
          sound: "å, kort",
          audio: null,
        },
        {
          lower: "π",
          upper: "Π",
          name: "pi",
          translit: "p",
          sound: "p",
          audio: null,
        },
        {
          lower: "ρ",
          upper: "Ρ",
          name: "rho",
          translit: "r",
          sound: "r",
          audio: null,
        },
        {
          lower: "σ",
          upper: "Σ",
          name: "sigma",
          translit: "s",
          sound: "s (slutform i ordslut: ς)",
          audio: null,
        },
        {
          lower: "τ",
          upper: "Τ",
          name: "tau",
          translit: "t",
          sound: "t",
          audio: null,
        },
        {
          lower: "υ",
          upper: "Υ",
          name: "ypsilon",
          translit: "y",
          sound: "y, kort eller långt",
          audio: null,
        },
        {
          lower: "φ",
          upper: "Φ",
          name: "fi",
          translit: "ph",
          sound: "f",
          audio: null,
        },
        {
          lower: "χ",
          upper: "Χ",
          name: "chi",
          translit: "ch",
          sound: "tyskt ch (Bach)",
          audio: null,
        },
        {
          lower: "ψ",
          upper: "Ψ",
          name: "psi",
          translit: "ps",
          sound: "ps",
          audio: null,
        },
        {
          lower: "ω",
          upper: "Ω",
          name: "omega",
          translit: "ō",
          sound: "å, långt",
          audio: null,
        },
      ];

      /* ============================================================
   HJÄLPFUNKTIONER — små, återanvändbara verktyg.
   ============================================================ */

      // Fisher–Yates: blandar en kopia av listan utan att röra originalet.
      function shuffle(arr) {
        const a = [...arr]; // spread = kopia, så originalet är orört
        for (let i = a.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [a[i], a[j]] = [a[j], a[i]]; // byt plats (destructuring-swap)
        }
        return a;
      }

      // Vilka bokstäver är aktiva just nu? Tomt urval = alla (säkerhetsnät, så spelet aldrig är tomt).
      function activeLetters() {
        return state.selected.size
          ? letters.filter((l) => state.selected.has(l))
          : letters;
      }

      // Slumpa fram en bokstav ur det aktiva urvalet, gärna inte samma som förra.
      function randomLetter(exclude) {
        const pool = activeLetters();
        let pick;
        do {
          pick = pool[Math.floor(Math.random() * pool.length)];
        } while (exclude && pick === exclude && pool.length > 1);
        return pick;
      }

      // Bygg fyra svarsalternativ: rätt svar + tre distraktorer.
      // Distraktorerna tas helst ur urvalet; räcker de inte (du valt < 4) fylls de på från hela alfabetet.
      function buildOptions(correct) {
        let distractors = shuffle(
          activeLetters().filter((l) => l !== correct),
        ).slice(0, 3);
        if (distractors.length < 3) {
          const rest = shuffle(
            letters.filter((l) => l !== correct && !distractors.includes(l)),
          );
          distractors = distractors.concat(
            rest.slice(0, 3 - distractors.length),
          );
        }
        return shuffle([correct, ...distractors]);
      }

      // Bestäm vilken form (gemen/versal) ett kort ska visa. I "mixed" lottas den —
      // men anropas EN gång per kort (i newQuestion), inte vid varje render, så att
      // glyfen inte byter skepnad mitt i ett kort. Som färgen på ett utdelat kort:
      // den bestäms när kortet läggs på bordet, inte varje gång du tittar.
      function resolveGlyph(letter) {
        if (state.caseMode === "upper") return letter.upper;
        if (state.caseMode === "lower") return letter.lower;
        return Math.random() < 0.5 ? letter.lower : letter.upper; // mixed
      }

      /* ============================================================
   TILLSTÅND (state) — allt spelet behöver minnas, på ett ställe.
   ============================================================ */
      const state = {
        mode: "flashcard", // "flashcard" | "quiz"
        current: null, // bokstaven som visas just nu
        revealed: false, // är facit vänt fram? (vänd-kort)
        answered: false, // har man svarat? (flerval)
        chosen: null, // vilket alternativ man klickade på (flerval)
        selected: new Set(), // bokstäverna man valt att öva på (tomt = alla)
        caseMode: "lower", // "lower" | "upper" | "mixed"
        glyph: null, // den form (gemen/versal) som lottats fram för aktuellt kort
        correct: 0,
        total: 0,
        streak: 0,
        bestStreak: 0,
      };

      /* ============================================================
   PERSISTENS — kommer ihåg bästa streak mellan besök.
   try/catch: localStorage är blockerat i vissa lägen (t.ex.
   förhandsvisning), då hoppar vi tyst över det.
   ============================================================ */
      const STORAGE_KEY = "grekiska-alfabetspel:bestStreak";
      function loadBest() {
        try {
          return Number(localStorage.getItem(STORAGE_KEY)) || 0;
        } catch {
          return 0;
        }
      }
      function saveBest(v) {
        try {
          localStorage.setItem(STORAGE_KEY, String(v));
        } catch {}
      }

      // Urvalet sparas som en lista med NAMN ("alfa", "beta"...), inte objektreferenser –
      // referenser kan inte serialiseras. Vid inläsning översätts namnen tillbaka till objekt.
      const SELECTION_KEY = "grekiska-alfabetspel:selection";
      function loadSelection() {
        try {
          const raw = localStorage.getItem(SELECTION_KEY);
          if (!raw) return new Set();
          const names = JSON.parse(raw);
          return new Set(letters.filter((l) => names.includes(l.name)));
        } catch {
          return new Set();
        }
      }
      function saveSelection() {
        try {
          localStorage.setItem(
            SELECTION_KEY,
            JSON.stringify([...state.selected].map((l) => l.name)),
          );
        } catch {}
      }

      // Formläget är en preferens precis som urvalet – samma try/catch-mönster.
      const CASE_KEY = "grekiska-alfabetspel:caseMode";
      function loadCase() {
        try {
          return localStorage.getItem(CASE_KEY) || "lower";
        } catch {
          return "lower";
        }
      }
      function saveCase() {
        try {
          localStorage.setItem(CASE_KEY, state.caseMode);
        } catch {}
      }

      /* ============================================================
   LOGIK — vad som händer i spelet.
   ============================================================ */
      function newQuestion() {
        state.current = randomLetter(state.current);
        state.glyph = resolveGlyph(state.current); // lotta formen en gång, här
        state.revealed = false;
        state.answered = false;
        state.chosen = null;
        render();
      }

      function flip() {
        if (state.mode !== "flashcard") return;
        state.revealed = true;
        render();
      }

      function answer(chosen) {
        if (state.mode !== "quiz" || state.answered) return;
        state.answered = true;
        state.chosen = chosen;
        state.total++;
        const isRight = chosen === state.current;
        if (isRight) {
          state.correct++;
          state.streak++;
          if (state.streak > state.bestStreak) {
            state.bestStreak = state.streak;
            saveBest(state.bestStreak);
          }
        } else {
          state.streak = 0;
        }
        render();
      }

      /* ============================================================
   PRESENTATION (rendering) — ritar om skärmen från state.
   Logiken ändrar bara state och ropar render(); render läser
   state och uppdaterar DOM:en. Det är samma princip som moderna
   ramverk (React m.fl.) bygger på, fast handgjord här.
   ============================================================ */
      const el = (id) => document.getElementById(id);

      // Ritar hjälteglyfen (med en liten "pop"). Utbruten så att formväxling kan
      // uppdatera enbart glyfen utan att rita om hela skärmen (och råka blanda om quizet).
      function paintHero() {
        const hero = el("hero");
        hero.textContent = state.glyph;
        hero.animate(
          [
            { transform: "scale(.82)", opacity: 0.2 },
            { transform: "scale(1)", opacity: 1 },
          ],
          { duration: 280, easing: "ease-out" },
        );
      }

      function render() {
        // växla mellan lägena
        el("flashcard").classList.toggle("hidden", state.mode !== "flashcard");
        el("quiz").classList.toggle("hidden", state.mode !== "quiz");
        el("scoreboard").classList.toggle("hidden", state.mode !== "quiz");
        document
          .querySelectorAll(".tab")
          .forEach((t) =>
            t.classList.toggle("active", t.dataset.mode === state.mode),
          );

        paintHero(); // visar den lottade formen för aktuellt kort

        if (state.mode === "flashcard") renderFlashcard();
        else renderQuiz();
      }

      function renderFlashcard() {
        const c = state.current;
        el("facit").classList.toggle("hidden", !state.revealed);
        if (state.revealed) {
          el("fc-name").textContent = c.name;
          el("fc-forms").textContent = `${c.lower}\u2002${c.upper}`; // båda formerna, så paret nöts in
          el("fc-translit").textContent = c.translit;
          el("fc-sound").textContent = c.sound;
        }
        el("flip").classList.toggle("hidden", state.revealed); // göm "Vänd" när redan vänt
      }

      function renderQuiz() {
        const c = state.current;

        // bygg svarsalternativ bara när en ny fråga ställs (inte vid varje render)
        const box = el("choices");
        if (!state.answered) {
          const options = buildOptions(c);
          box.innerHTML = "";
          options.forEach((opt, i) => {
            const b = document.createElement("button");
            b.className = "choice";
            b.innerHTML = `<span class="num">${i + 1}</span> ${opt.name}`;
            b.addEventListener("click", () => answer(opt));
            b.dataset.name = opt.name;
            box.appendChild(b);
          });
          el("feedback").textContent = "";
          el("feedback").className = "feedback";
          el("quiz-next").classList.add("hidden");
        } else {
          // markera facit grönt, det felklickade rött, och lås knapparna
          const wasRight = state.chosen === c;
          box.querySelectorAll(".choice").forEach((b) => {
            b.disabled = true;
            if (b.dataset.name === c.name) b.classList.add("correct");
            else if (b.dataset.name === state.chosen.name)
              b.classList.add("wrong");
          });
          const fb = el("feedback");
          if (wasRight) {
            fb.textContent = `Rätt! ${c.lower} = ${c.name}`;
            fb.className = "feedback ok";
          } else {
            fb.textContent = `Fel — ${c.lower} = ${c.name}`;
            fb.className = "feedback no";
          }
          el("quiz-next").classList.remove("hidden");
        }

        // poängtavla
        el("sb-correct").textContent = state.correct;
        el("sb-total").textContent = state.total;
        el("sb-streak").textContent = state.streak;
        el("sb-best").textContent = state.bestStreak;
      }

      /* ============================================================
   VÄLJAREN (picker) — bygger rutnätet en gång, och målar sedan
   bara om markeringarna när urvalet ändras. Urvalet är ett filter
   ovanpå `letters`; själva datan rörs aldrig. Ändringar i urvalet
   stör inte det kort som visas just nu – de slår igenom på "Nästa".
   ============================================================ */
      const VOWELS = new Set([
        "alfa",
        "epsilon",
        "eta",
        "iota",
        "omikron",
        "ypsilon",
        "omega",
      ]);

      function buildGrid() {
        const grid = el("letter-grid");
        letters.forEach((l) => {
          const cell = document.createElement("button");
          cell.className = "cell";
          cell.textContent = l.lower;
          cell.title = l.name;
          cell.addEventListener("click", () => {
            // Set som gästlista: finns den redan? ta bort. Annars: lägg till.
            state.selected.has(l)
              ? state.selected.delete(l)
              : state.selected.add(l);
            saveSelection();
            renderPicker();
          });
          grid.appendChild(cell);
        });
      }

      function renderPicker() {
        // rutnätet byggs i samma ordning som `letters`, så index matchar
        const cells = el("letter-grid").children;
        letters.forEach((l, i) =>
          cells[i].classList.toggle("on", state.selected.has(l)),
        );

        const n = state.selected.size;
        el("picker-status").textContent =
          n === 0
            ? "Övar på: alla 24 bokstäver"
            : `Övar på: ${n} ${n === 1 ? "bokstav" : "bokstäver"}`;
      }

      function quickSelect(kind) {
        if (kind === "all") state.selected = new Set(letters);
        else if (kind === "none") state.selected = new Set();
        else if (kind === "vowels")
          state.selected = new Set(letters.filter((l) => VOWELS.has(l.name)));
        else if (kind === "consonants")
          state.selected = new Set(letters.filter((l) => !VOWELS.has(l.name)));
        saveSelection();
        renderPicker();
      }

      /* ============================================================
   FORMLÄGE — gemener / versaler / blandat. En ren visningsinställning:
   ändrar bara vilken glyf som visas, aldrig svaret eller distraktorerna
   (α och Α har samma namn). Till skillnad från urvalet slår den igenom
   direkt på kortet som visas, eftersom det är just det man vill se.
   ============================================================ */
      function setCase(mode) {
        state.caseMode = mode;
        state.glyph = resolveGlyph(state.current); // lotta om formen för kortet som visas
        saveCase();
        paintHero(); // uppdatera bara glyfen – rör inte quizets alternativ
        if (state.mode === "flashcard" && state.revealed) renderFlashcard(); // håll facit i synk
        renderCaseControl();
      }

      function renderCaseControl() {
        document
          .querySelectorAll(".seg")
          .forEach((b) =>
            b.classList.toggle("on", b.dataset.case === state.caseMode),
          );
      }

      /* ============================================================
   HÄNDELSER (events) — kopplar knappar och tangenter till logiken.
   ============================================================ */
      document.querySelectorAll(".tab").forEach((tab) => {
        tab.addEventListener("click", () => {
          state.mode = tab.dataset.mode;
          newQuestion();
        });
      });
      el("flip").addEventListener("click", flip);
      el("fc-next").addEventListener("click", newQuestion);
      el("quiz-next").addEventListener("click", newQuestion);

      // väljaren: öppna/stäng panelen + snabbval
      el("picker-toggle").addEventListener("click", () => {
        const nowHidden = el("picker-body").classList.toggle("hidden");
        el("picker-toggle").setAttribute("aria-expanded", String(!nowHidden));
      });
      document
        .querySelectorAll(".chip")
        .forEach((chip) =>
          chip.addEventListener("click", () => quickSelect(chip.dataset.quick)),
        );
      document
        .querySelectorAll(".seg")
        .forEach((seg) =>
          seg.addEventListener("click", () => setCase(seg.dataset.case)),
        );

      __kh = (e) => {
        // låt väljarens egna knappar sköta sina egna tangenttryck
        if (e.target.closest && e.target.closest(".picker")) return;

        // siffrorna 1–4 väljer svar i flervalet, oavsett var fokus ligger
        if (
          state.mode === "quiz" &&
          !state.answered &&
          ["1", "2", "3", "4"].includes(e.key)
        ) {
          const btn =
            el("choices").querySelectorAll(".choice")[Number(e.key) - 1];
          if (btn) btn.click();
          return;
        }

        // Mellanslag/Enter: om en knapp redan har fokus hanterar den själv tangenten
        // (annars skulle både knappen och den här koden gå igång och hoppa två kort).
        if (
          document.activeElement &&
          document.activeElement.tagName === "BUTTON"
        )
          return;

        if (state.mode === "flashcard") {
          if (e.code === "Space") {
            e.preventDefault();
            state.revealed ? newQuestion() : flip();
          } else if (e.code === "Enter") {
            newQuestion();
          }
        } else if (e.code === "Enter" && state.answered) {
          newQuestion();
        }
      };
  document.addEventListener("keydown", __kh);;

      /* ============================================================
   START
   ============================================================ */
      state.bestStreak = loadBest();
      state.selected = loadSelection();
      state.caseMode = loadCase();
      buildGrid();
      renderPicker();
      renderCaseControl();
      newQuestion();
    
}
