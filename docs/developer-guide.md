# Developer guide

**English** · [简体中文](developer-guide.zh-CN.md) · [Back to README](../README.md)

How Qualitative Analysis Lab is built, how the chemistry engine works, and how to add past papers, reagents, compounds and reactions.

## Contents

1. [Setup and commands](#1-setup-and-commands)
2. [Architecture](#2-architecture)
3. [The chemistry engine](#3-the-chemistry-engine)
4. [Using the engine from code](#4-using-the-engine-from-code)
5. [Adding a past paper](#5-adding-a-past-paper)
6. [Adding reagents, compounds, species and reactions](#6-adding-reagents-compounds-species-and-reactions)
7. [Testing](#7-testing)
8. [The user interface](#8-the-user-interface)
9. [Building](#9-building)
10. [Conventions](#10-conventions)

## 1. Setup and commands

Node.js 18+ (developed on Node 22) and npm.

For a fresh checkout, first follow the [README setup](../README.md#quick-start): the original-paper library needs Git LFS, Python 3.11+, the pinned `tools/requirements.txt`, and `npm run prepare:papers`. `npm run build` now checks the generated sources before compiling. `npm run test:browser` runs the Chromium/touch workflows. See the [coverage ledger](paper-coverage-2023-2026.md) for the distinction between source availability, configured benches and guided regression coverage.

```bash
npm install
npm run dev          # Vite dev server, http://localhost:5173 (add -- --host for LAN devices)
npm test             # Vitest, all engine and past-paper tests
npx vitest           # watch mode
npm run typecheck    # tsc, strict mode
npm run build        # tsc -b && vite build → dist/
npm run preview      # serve dist/
```

Stack: Vite 5, React 18, TypeScript 5 (`strict`), Vitest 2. There is no backend and no runtime dependency besides React.

## 2. Architecture

```
src/
  main.tsx                 React entry
  engine/                  chemistry engine — pure TypeScript, no DOM/React
    species.ts             species catalogue: ions, complexes, precipitates, gases; colours, flame colours
    compounds.ts           starting materials (formula, molar mass, how they dissolve, thermal steps)
    reagents.ts            bench reagents (concentrations as in the confidential instructions)
    rules.ts               reaction rules (complete / equilibrium / kinetic)
    vessel.ts              a tube's state; rule solver; time, temperature, gases
    colour.ts              Beer–Lambert colour mixing and exam colour words
    observe.ts             turns state changes into exam-style observation sentences
    lab.ts                 the Lab: vessels + actions (add, pour, heat, gas test, …) + journal
    appearance.ts          what the UI should draw for a vessel
    index.ts               public exports
    __tests__/             unit tests and past-paper regression tests
  papers/
    types.ts               PaperCase / QuestionPart / AnswerSpec
    igcse.ts               0620 Paper 5 cases
    alevel.ts              9701 Paper 3 cases (+ paper-specific reagents)
    index.ts               PAPERS list, paperById()
  ui/
    App.tsx                screens: Home → Exam → Results
    Exam.tsx               exam screen: bench, question paper, notebook, mobile tabs, real-time loop
    Tube.tsx               SVG glassware (liquid, precipitate, bubbles, stopper); also embeds in the bench scene
    bench/
      layout.ts            scene size and where every piece of apparatus sits; tube geometry
      art.tsx              SVG drawings of the apparatus (bottles, dropper, burner, splints, papers, …)
      model.ts             BenchModel: what is held, where it is, what a gesture means; drives the Lab
      Bench.tsx            renders the scene and forwards pointer input to the model
      Demo.tsx             first-run ghost-hand demonstration
      sound.ts             synthesised sound effects (WebAudio)
      __tests__/           gesture tests on the model
    PaperPane.tsx          question paper with answer spaces
    Results.tsx            self-marking page
    storage.ts             guarded localStorage helpers
    styles.css             all styles, responsive breakpoints
```

The dependency direction is strictly `ui → papers → engine`. The engine never imports UI code and can be tested and scripted on its own.

## 3. The chemistry engine

The engine is **semi-quantitative**: it is accurate enough that the observations match what Cambridge mark schemes credit, and that mistakes change the result, but it is not a research-grade physical-chemistry model.

### 3.1 State

Each `Vessel` (`vessel.ts`) stores:

- `n` — amounts of every species in **mmol** (ions, dissolved molecules, solids, undissolved compounds);
- `V` — liquid volume in cm³ (a tube with less than a small threshold is "dry");
- `T` — temperature in °C, heating mode, stopper;
- the head-space gases above the liquid, bubble rate, condensation, how settled a precipitate is;
- a log of events.

Nothing knows the "answer": a reaction happens only if the reactants are in the tube.

Species ids are plain strings such as `'Cu2+'`, `'SO4 2-'`, `'OH-'`, `'Cu(OH)2(s)'`, `'CO2(aq)'`, `'NH3'`, `'Cl2(g)'`. Undissolved starting materials are `cmp:<compound id>` species. Water is never written explicitly.

### 3.2 Rules

Rules live in `rules.ts`:

```ts
interface Rule {
  id: string
  type: 'complete' | 'equilibrium' | 'kinetic'
  reactants: Record<string, number>   // stoichiometry
  products: Record<string, number>
  priority?: number                   // lower runs first (fast rules)
  K?: number                          // equilibrium constant, mol dm⁻³ units, solids/water omitted
  reserve?: Record<string, number>    // minimum free concentration that must remain
  halfLife?: number | ((ctx) => number) // kinetic rules, seconds (Infinity = not running)
  when?: (ctx) => boolean             // extra condition (T, pH, concentrations…)
  dry?: boolean; anyPhase?: boolean; minTemp?: number
  events?: string[]                   // observable events, e.g. 'effervescence'
}
```

- **complete** — fast reactions that run to completion (neutralisation, most redox, dissolving). A `reserve` keeps a minimum free concentration of a reactant; this is how *soluble only in excess* is modelled — e.g. Al(OH)₃ only dissolves once enough excess OH⁻ is present.
- **equilibrium** — a single reaction solved exactly for the current contents by bisection on Q = K. Precipitation uses `K = 1/Ksp` (helper `ppt()`), as do silver halide–ammonia, Cu⁺–thiosulfate, starch–iodine and similar equilibria.
- **kinetic** — slow processes advanced with time using the half-life: air oxidation of Fe(OH)₂ / Mn(OH)₂, thiosulfate + acid → sulfur, the purple Fe³⁺–thiosulfate complex fading, catalytic decomposition of H₂O₂, carbonate + acid, reactions that only run when warm, thermal decomposition…

### 3.3 Solving

`Vessel.settle()` sweeps the fast rules (`FAST_RULES`, sorted by priority) repeatedly until nothing changes (max 300 sweeps). Within a sweep higher-priority rules act first, so added NaOH neutralises free acid (priority 1) before it can precipitate a metal hydroxide (priority 3). Changes below a significance threshold are ignored to avoid oscillation.

`Vessel.advance(dt)` steps time in 1–4 s increments: temperature relaxes towards room temperature (or the heating target: warm 65 °C, boil 100 °C, gentle 260 °C, strong 600 °C; a liquid heated to boiling reaches 100 °C in about 35 s and then loses water by evaporation until it boils dry), kinetic rules progress, the fast rules settle again, and volatile gases leave.

### 3.4 Gases

CO₂ beyond saturation forms bubbles (effervescence, with a rate). NH₃ and SO₂ partition into the head-space according to Henry's law constants with a van 't Hoff temperature dependence, so ammonia is detected when warm and is gradually lost. Head-space gases decay with a half-life of about 15 s, so a gas test only works while the gas is being produced. NO turns into brown NO₂ in air. Gas tests (`Lab.gasTest`) compare head-space amounts with thresholds.

### 3.5 Heating dry solids

Compounds can declare thermal steps (`ThermalStep`: `minTemp`, `halfLife`, products, events) — loss of water of crystallisation with condensation, decomposition of carbonates and hydroxides, melting, sublimation. `MIXED_THERMAL` covers reactions between solids heated together (e.g. iodide with a zinc compound giving purple iodine vapour). Some solids have a different colour while hot (`hotColour`).

### 3.6 Observations

`Lab` takes a `snapshot()` of a vessel before and after each action and `describe()` (`observe.ts`) compares them to produce sentences such as *"Pale blue precipitate forms."*, *"The precipitate dissolves, giving a deep blue solution."*, *"Effervescence."*, *"The solution turns from purple to colourless."*. It handles:

- visibility thresholds — a trace of solid is "faint", below a minimum nothing is reported;
- transient precipitates (a `Tracker` remembers the maximum reached during a multi-step addition);
- conversions (Fe(OH)₂ → Fe(OH)₃ "turns brown near the surface");
- reagent colours (purple KMnO₄ persisting vs. decolourised, orange dichromate turning green);
- solution colours from Beer–Lambert mixing of every coloured species (`colour.ts`), named with exam vocabulary.

`appearance()` turns the same state into drawing data (liquid level and RGB, turbidity, sediment, dry solid, pieces, bubbles, gas colour, condensation, flame).

## 4. Using the engine from code

```ts
import { Lab } from './engine'

const lab = new Lab({
  samples: [{ id: 'X', label: 'solution X', kind: 'solution', solution: { conc: { 'Cu2+': 0.1, 'SO4 2-': 0.1 }, volume: 20 } }],
  reagents: ['NaOH', 'NH3'],
})

const t = lab.newVessel('test-tube')
lab.transfer(lab.sampleVessel('X').id, t.id, { depth: 1 })
for (let i = 0; i < 5; i++) console.log(lab.addReagent(t.id, 'NH3', { drops: 1 }).observations)
console.log(lab.addReagent(t.id, 'NH3', { cm3: 4 }).observations)   // deep blue solution
```

Main `Lab` methods (all return an `ActionResult` with `observations` — plus `frames` for additions, heating and standing — and are appended to `lab.journal`):

| Method | Purpose |
|---|---|
| `newVessel(kind, label?)` | `'test-tube' \| 'boiling-tube' \| 'hard-glass-tube'` |
| `sampleVessel(sampleId)` | the vessel holding a sample |
| `addReagent(vesselId, reagentId, amount)` | amounts: `{drops}`, `{cm3}`, `{depth}`, `{spatula:'small'\|'normal'}`, `{grams}`, `{pieces}` |
| `transfer(from, to, amount)` | also `{fraction}` and `{all:true}` |
| `divide(from, kinds[])` | equal portions into new vessels; returns `vesselIds` |
| `heat(id, 'warm'\|'boil'\|'gentle'\|'strong', seconds)` | |
| `wait(seconds, id?)`, `tick(dt)` | let time pass (one vessel or all) |
| `shake(id)`, `setStopper(id, on)` | |
| `gasTest(id, test)` | `damp-red-litmus`, `damp-blue-litmus`, `limewater`, `glowing-splint`, `lighted-splint`, `acidified-kmno4`, `acidified-dichromate-paper` |
| `flameTest(id)`, `pHTest(id)` | |
| `filter(id)` | returns `filtrateId` and `residueId` (filter paper) |
| `empty(id)`, `rinse(id)`, `discard(id)` | `empty` leaves a wet film; `rinse` cleans |

The interactive bench works in real time and uses a second, continuous API. An action is opened with `begin()`, material is added in small steps while bench time passes with `tick()`, and the action is written up (one journal entry) a few seconds after `release()`, so delayed changes such as fizzing are included:

| Method | Purpose |
|---|---|
| `begin(vesselId, label, {heating?})` → `OpenAction` | start an action on a vessel |
| `pourStep(a, source, cm3)` | pour from `{reagentId}` or `{vesselId}` (a dry tube tips its solid out) |
| `dropStep(a, reagentId, n?)` | drops from a dropper bottle |
| `scoop(source, grams)` / `deposit(a, n)` | take a spatula measure (or a piece of metal) / tip it into the vessel |
| `filterStep(a, source, paperId, cm3)` | pour through a filter paper (vessel of kind `filter-paper`) into the action's vessel |
| `setHeating(id, mode \| null)` | heat while time passes |
| `release(a, label?, linger?)`, `cancel(a)`, `flush()` | finish (written up after `linger` s), drop an empty action, write up everything |
| `agitate(id)` | shake |
| `mouthTest(id, test, {damp})` | test paper / splint at the mouth of the tube, no time passes (a dry paper shows no change) |
| `indicatorDip(id, paper)` | dip red litmus, blue litmus or universal indicator paper into the contents |
| `collectGas(id)` / `bubbleGas(sample, id)` | teat pipette: draw in the gas at the mouth / bubble it through a liquid (limewater turns milky) |
| `flameReading(id)`, `gasReading(id, test)`, `note(…)` | readings without side effects; record a note in the journal |

## 5. Adding a past paper

1. **Read the source material** — question paper, mark scheme and confidential instructions (in the LFS archive in `dropbox_downloads/`). Note the exact composition and mass of each unknown and the concentrations of the bench reagents.
2. **Check the chemistry is covered** — every compound in the unknowns must exist in `compounds.ts`, every reagent in `reagents.ts`. Add what is missing (section 6). Paper-specific reagents (e.g. *FB 8* = 0.100 mol dm⁻³ thiosulfate) can be registered in the paper file with `registerReagent()`, as `alevel.ts` does.
3. **Write the `PaperCase`** in `src/papers/igcse.ts` or `alevel.ts`:

```ts
export const P0620_s25_51: PaperCase = {
  id: '0620_s25_51',
  syllabus: 'Cambridge IGCSE Chemistry 0620',
  level: 'IGCSE',
  series: 'May/June 2025',
  component: 'Paper 51 (Practical Test)',
  question: 2,
  totalMarks: 15,                         // must equal the sum of the parts' marks (tested)
  summary: 'One solid, X, containing two ions.',   // neutral: must not give the answer away
  samples: [{ id: 'X', label: 'solid X', kind: 'solid', solid: [{ compound: 'FeSO4.7H2O', grams: 2 }] }],
  reagents: ['water', 'NaOH', 'NH3', 'HNO3', 'AgNO3', 'Ba(NO3)2'],
  intro: 'You are provided with solid X. …',
  parts: [
    { id: 'a', label: '(a)', text: 'Dissolve … Record your observations.', marks: 2,
      answer: { kind: 'lines', lines: 3 },          // or { kind: 'table', header, rows } / { kind: 'fields', fields }
      markScheme: ['green precipitate [1]', 'insoluble in excess [1]'] },
    // …
  ],
  identities: ['Solid X: iron(II) sulfate-7-water (2 g).'],
  omitted: undefined,                     // describe any part of the original question not simulated
  supervisor(lab) {
    // carry out the instructions exactly; return the observation text for each part id
    const X = lab.sampleVessel('X')
    // …
    return { a: t(/* ActionResults */) }
  },
}
```

   - `preamble` on a part holds procedure text that belongs to no single part (e.g. "Divide solution E into four portions…").
   - The `t(...results)` helper in `igcse.ts` joins observation texts.
   - The supervisor script is used both for the "Supervisor's results" on the self-marking page and for the regression test, so make it follow the wording of the question literally (amounts, order, "leave to stand").
4. **Register it** — add it to `IGCSE_PAPERS` / `AS_PAPERS`; `papers/index.ts` exposes all papers to the home page.
5. **Add mark-scheme expectations** in `src/engine/__tests__/papers.test.ts`:

```ts
'0620_s25_51': {
  a: [/[Gg]reen precipitate forms/, /does not dissolve|insoluble/],
},
```

   Each regex must match the supervisor's observation text for that part. Run `npm test`; if a pattern fails, fix the chemistry (rules, constants, thresholds), not the expectation — unless the expectation itself is wrong.
6. **Check the UI** with `npm run dev`: do the question on the bench as a student would, including a few typical mistakes.

## 6. Adding reagents, compounds, species and reactions

### Reagents (`reagents.ts`)

```ts
add({ id: 'KI', label: 'aqueous potassium iodide', short: 'KI(aq)', kind: 'solution', conc: { 'K+': 0.1, 'I-': 0.1 } })
add({ id: 'Mg-ribbon', label: 'magnesium ribbon (2 cm)', short: 'Mg ribbon', kind: 'piece', compound: 'Mg', pieceGrams: 0.022 })
```

`kind` is `'solution'` (concentrations in mol dm⁻³, must be charge-balanced), `'solid'` (spatula measures) or `'piece'`. `bottleTint` colours the bottle in the UI. `solutionFromGrams()` converts "g dm⁻³ of compound" from the confidential instructions into concentrations.

### Compounds (`compounds.ts`)

```ts
c({ id: 'NaBr', formula: 'NaBr', name: 'sodium bromide', molarMass: 102.89, colour: '#fafafa', colourName: 'white',
  dissolves: { 'Na+': 1, 'Br-': 1 } })
```

Soluble compounds give `dissolves`; insoluble ones give `asSpecies` (the solid species they become). Add `thermal` steps if the solid is heated in a question. Hydrated salts include their water of crystallisation in the molar mass and release `H2O(g)` on heating (condensation).

### Species (`species.ts`)

Every id used in a rule must be a registered species (tested). Aqueous coloured species need `tint` + `refConc` (the apparent colour at that concentration) and `colourName`; solids need `colour`, `colourName` and optionally `visibility` (how strongly a small amount shows) and `hotColour`; gases may have `gasColour`; flame-test elements set `flame`.

### Rules (`rules.ts`)

```ts
// precipitation: K = 1/Ksp
ppt('Ni(OH)2', { 'Ni2+': 1, 'OH-': 2 }, 'Ni(OH)2(s)', 5.5e-16)

// soluble in excess, only once some free OH- is left over
r({ id: 'Zn(OH)2+OH', type: 'complete', priority: 5, reactants: { 'Zn(OH)2(s)': 1, 'OH-': 2 },
  products: { 'Zn(OH)4 2-': 1 }, reserve: { 'OH-': 0.02 } })

// slow process with a condition
r({ id: 'ClO+H+Cl', type: 'kinetic', reactants: { 'ClO-': 1, 'Cl-': 1, 'H+': 2 }, products: { 'Cl2(g)': 1 },
  halfLife: (x) => (x.c('H+') > 1 && x.c('Cl-') > 0.5 ? 10 : Infinity) })
```

(The exact parameters of existing rules are in `rules.ts`; the snippets illustrate the shape.)

Guidelines:

- Choose `priority` by what must happen first: neutralisation (1) → carbonate / sulfite protonation (2–3) → precipitation (3) → complexation / dissolving in excess (4–5) → redox.
- Rules must conserve charge (tested) and atoms.
- Prefer real constants (Ksp, K) and adjust only where needed to reproduce what the syllabus notes and mark schemes describe. Add a comment when a value is tuned.
- Use `events` for things that are seen but are not a change in amount (e.g. `'effervescence'`, `'crackling'`).
- After a change, run all tests — a new rule can change the results of other papers.

## 7. Testing

| File | Covers |
|---|---|
| `cations.test.ts` | NaOH and NH₃ tests for Al³⁺, Ca²⁺, Ba²⁺, Cr³⁺, Cu²⁺, Fe²⁺, Fe³⁺, Mg²⁺, Mn²⁺, Zn²⁺, NH₄⁺; flame tests |
| `anions.test.ts` | carbonate, nitrate, nitrite, sulfate, sulfite, thiosulfate, halides, iodine/starch; gas tests (H₂, O₂) |
| `procedure.test.ts` | order of addition and existing contents: wrong acid, no acidification, un-rinsed tubes, tap water, leftover H₂O₂, transient precipitates, re-acidifying complexes, ammonia lost on cooling, slow air oxidation |
| `papers.test.ts` | every `PaperCase` supervisor run against its mark scheme; marks add up |
| `rules.test.ts` | every species referenced by a rule exists; every rule conserves charge |
| `thermal.test.ts` | heated salts keep their non-volatile ions; boiling evaporates water, warming does not |
| `realtime.test.ts` | continuous API: pours, drops, heating in the flame, damp vs dry litmus, dipping litmus, teat pipette and limewater, filtering |
| `helpers.ts` | `solutionLab`, `solidLab`, `portion`, `dropwiseThenExcess`, `text` |
| `ui/bench/__tests__/model.test.ts` | gestures on the bench model (drag, tap-then-tap, press-and-hold): pouring, dropper, burner, splint, spatula, teat pipette, wire, litmus, funnel, waste |

Write a procedure test whenever you fix a behaviour caused by an operation order or leftover contents, so it stays fixed.

## 8. The user interface

- `App.tsx` holds the screen state (`home` / `exam` / `results`). Each attempt mounts a fresh `Exam` with a new `Lab` and `BenchModel`.
- **Everything on the bench is apparatus.** There are no action buttons: an item is picked up and brought to something else. `BenchModel` (`bench/model.ts`) decides what that means from *what is held* and *which zone it is over*:
  - zones are worked out geometrically from the layout (`zoneFor`): a tube's mouth, inside or liquid; a rack slot; the burner's upper or lower heating position; the flame; the wash-bottle nozzle; waste, sink, tile, funnel, boxes, jars;
  - **discrete** actions happen on release (tube into a slot or the flame, stopper on, spatula, dropper parked in a tube, funnel onto a tube, tube into the waste or sink);
  - **continuous / dwell** actions happen while the item stays there (a bottle pours while held over a tube; a strip tests the gas after ~0.7 s at the mouth; a splint lights after ~0.4 s in the flame);
  - two input styles share the same logic: **drag**, and **tap to lift, then tap the target** (press and hold on the target for continuous actions). With an item lifted, a press elsewhere is resolved on release or after 160 ms: moving drags the other object (the lifted item is put back), holding still starts the hold action, a quick tap uses the item there.
- Apparatus state lives in the model: burner (gas, lit, air hole), splints (unlit / burning / glowing / dead, with burn-out times), matches, strips (damp, colour), teat pipette (gas sample), wire (loaded reading), funnel (tube, filter paper vessel), parked dropper, used strips on the tile, fast clock.
- `Exam.tsx` calls `model.step(dt)` every 100 ms; the clock on the bench runs bench time ×1 or ×10. The engine's open actions are written up when they settle, and the latest entry can be shown as a caption when *Observation text* is on.
- `Bench.tsx` renders the scene (`viewBox` 1360 × 900) scaled to fit; on narrow phones it fills the height and scrolls sideways. Invisible hit rectangles (`model.hitRects()`, first = on top) receive the pointer; they have `touch-action: none` so drags do not scroll, while the background still pans.
- Glassware is SVG: liquids use multiply blending, precipitates and turbidity use noise filters (`SvgDefs` in `Tube.tsx`), bubbles, flames, streams and drops are CSS animations. Tubes are memoised on their (cached) `Appearance`.
- Layouts (`styles.css`): ≥ 1100 px (desktop, iPad landscape) = bench left, paper/notebook right (the paper can be hidden with ⇥); ≤ 1099 px = one pane at a time with bottom tabs (Lab / Paper / Notebook); tall tablets in portrait (700–1099 px wide, ≥ 960 px high) = bench above, paper below.
- `storage.ts` stores answers, notes, marks and preferences (observation text, sound, demo seen) under the `qa-lab:` prefix; every access is wrapped in `try/catch`.
- The UI language is English (matching the exam). Text on the bench is limited to what is printed on real apparatus (bottle labels, tube labels).

## 9. Building

`npm run build` writes a static site to `dist/`. `vite.config.ts` sets `base: './'`, so the files work from any sub-path or even from a local folder served by a static server.

## 10. Conventions

- TypeScript strict mode; no `any` in engine code.
- Engine code stays free of DOM and React.
- Amounts in mmol, volumes in cm³, concentrations in mol dm⁻³, temperatures in °C, times in seconds.
- Observation sentences follow mark-scheme vocabulary (British spelling: *colour*, *sulfate*, *aluminium*).
- Question wording in `papers/` follows the published paper; summaries must not reveal the identities.
- Run `npm test` and `npm run build` before committing.
