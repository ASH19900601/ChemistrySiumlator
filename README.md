# Qualitative Analysis Lab

**English** · [简体中文](README.zh-CN.md)

A browser-based simulator for the qualitative-analysis question of Cambridge practical exams — IGCSE Chemistry 0620 Paper 5 (Question 2) and AS & A Level Chemistry 9701 Paper 3. Students carry out the tests on a simulated bench, write down their own observations and conclusions on the question paper, then mark themselves against the published mark scheme.

Unlike an "Alternative to Practical" worksheet, nothing is scripted: every tube holds its actual contents, and what you see comes from a chemistry engine that reacts to exactly what you did — including mistakes.

## Features

- **Original papers, 2023–2026** — 67 available qualitative question sets (22 IGCSE, 45 AS), with original questions, mark schemes and materials. Nine cases have guided bench procedures, 18 more have configured free benches, and 40 offer source-based written practice. See the [coverage ledger](docs/paper-coverage-2023-2026.md) for exact limits. These are not all AS Question 2 papers.
- **A hands-on bench** — everything is real apparatus operated with your hands, not buttons: pick up a bottle and hold it over a tube to pour, park a dropper in a tube and squeeze it drop by drop, turn on the gas and strike a match to light the Bunsen burner, put a tube in the flame to heat it, dampen litmus paper at the wash bottle and hold it at the mouth of the tube, light a splint, collect gas with a teat pipette and bubble it through limewater, filter through a funnel. Samples stand in the rack with the other tubes. Drag, or tap to lift and tap the target; a ghost-hand demonstration shows the moves.
- **Real time** — reactions, settling, cooling and slow changes happen while you watch; the clock on the wall can run time ten times faster.
- **A chemistry engine, not a lookup table** — stoichiometry, solubility products, "soluble in excess", redox, gas evolution, heating and slow changes over time (e.g. Fe(OH)₂ turning brown at the surface).
- **Mistakes have consequences** — acidifying with HCl before AgNO₃, forgetting to acidify before Ba²⁺, re-using an un-rinsed tube, tap water, pouring in too much reagent at once, over-filling a tube…
- **Free-form answers and self-marking** — no auto-marking; the results page shows your answers next to the mark scheme and the "supervisor's results" produced by the same engine.
- **Works on phone, tablet and desktop** — responsive layouts for PC, iPad (portrait and landscape) and phones.
- **Answers stay on the device** — work in progress, notes and self-marks are kept in the browser's local storage.

## Quick start

Core requirements: **Node.js 22+** and npm. Generating the full paper library also requires **Python 3.11+** and Git LFS. Validated with Node 24.19.0. The original-paper library is generated from the checksum-verified LFS archive.

```bash
git clone <this repository>
cd ChemistrySiumlator
npm ci
git lfs install --local
git lfs pull --include=dropbox_downloads/Chemistry_Qualitative_Practicals_2001-2026.zip
python3 -m venv ../.chemistry-paper-tools
. ../.chemistry-paper-tools/bin/activate
python -m pip install -r tools/requirements.txt
npm run prepare:papers
npm run dev
```

Open the address Vite prints (usually <http://localhost:5173>). To try it on a phone or iPad on the same Wi-Fi network:

```bash
npm run dev -- --host
```

and open the `Network:` address shown in the terminal on the device.

| Command | What it does |
|---|---|
| `npm run dev` | Development server with hot reload |
| `npm test` | Engine unit tests and past-paper regression tests (Vitest) |
| `npm run typecheck` | TypeScript type check |
| `npm run prepare:papers` | Generate original PDFs and readable page images from the verified archive |
| `npm run check:papers` | Verify all 201 original PDFs and generated page availability |
| `npm run test:browser` | Chromium desktop and touch workflow tests (requires Chromium; set `CHROMIUM_PATH` if needed) |
| `npm run build` | Production build into `dist/` (static files) |
| `npm run preview` | Serve the production build locally |

## Documentation

| Document | For |
|---|---|
| [User guide](docs/user-guide.md) · [用户指南](docs/user-guide.zh-CN.md) | Students and teachers: how to do a question on the simulated bench and mark it |
| [Developer guide](docs/developer-guide.md) · [开发者指南](docs/developer-guide.zh-CN.md) | Engine design, project structure, adding past papers, reagents and reactions |

## Included past papers

| Paper | Series | Question | Marks | Unknowns |
|---|---|---|---|---|
| 0620/51 | May/June 2024 | Q2 | 14 | One solid, E, containing three ions |
| 0620/52 | Oct/Nov 2024 | Q2 | 15 | Two solids, M and N |
| 0620/51 | May/June 2023 | Q2 | 18 | One solid, E, containing three ions |
| 0620/52 | May/June 2024 | Q2 | 18 | Solids H and I |
| 9701/31 | May/June 2025 | Q3 | 12 | FA 7 (solution), FA 8 and FA 9 (sodium compounds) |
| 9701/34 | Oct/Nov 2024 | Q3 | 12 | FB 6 (heated, residue tested) and FB 7 (salt solution) |
| 9701/33 | May/June 2024 | Q3(a) | 10 | FA 5, a mixture of two cations and two anions (organic part (b) not simulated) |

The table above lists the original seven guided cases. Guided AS Q2 cases `9701_w23_31` and `9701_w23_35` are also available. Guided procedures are regression-tested in `src/engine/__tests__/papers.test.ts`; the other 18 configured benches have sample-validation and representative reaction checks, not a claim that every mark-scheme point is simulated. The [complete ledger](docs/paper-coverage-2023-2026.md) lists all 67 source sets.

## Project structure

```
src/
  engine/        Chemistry engine (no UI code; tested on its own)
  papers/        Past-paper cases: wording, samples, bench reagents, mark schemes, supervisor scripts
  ui/            React interface: bench, glassware, question paper, notebook, self-marking
tools/
  dropbox_download.py   Downloads the research material from Dropbox (with hash check)
dropbox_downloads/      Research material: past-paper archive (Git LFS) and research report
docs/                   User and developer guides (English and Simplified Chinese)
```

Tech stack: Vite 5, React 18, TypeScript 5 (strict), Vitest 2. No backend.

## Research material

`dropbox_downloads/` holds the source archive in Git LFS and the research report. The archive is required to generate `public/past-papers/` for a fresh checkout; generated assets are ignored by Git and verified by `npm run build:full`. Once built, `dist/` includes the source library and needs no Python or archive at runtime.

## Limitations

- Observations are semi-quantitative and tuned to the level of detail Cambridge mark schemes expect; they are not a full physical-chemistry simulation.
- Only the qualitative-analysis question is simulated (no titration, rates or organic tests).
- Source coverage is the 67 retrieved public sets, not every practical exam or every AS Q2. October/November 2026 is absent from the archive. Original-paper written practice remains available for source-only cases.
- No auto-marking, accounts or teacher dashboard yet.

## Copyright

Question papers, mark schemes and confidential instructions © Cambridge University Press & Assessment, reproduced for private study only. Simulated observations may differ in detail from a real laboratory.

### Build profiles and assessment boundary

`npm run build` builds the core lab using Node 22+ and npm, including on CI without Python or paper assets. Missing original-paper resources produce an explicit warning; source-document views require those resources. `npm run build:full` additionally checks all original PDFs and page assets, and fails if they are absent or changed. Generating those assets requires Python 3.11+, the pinned Python tools and the LFS archive. See the setup instructions above.

This is a self-study simulator with self-marking, not a secure proctored assessment. Unknown identities, sample definitions and reference answers are shipped to the browser. Developer builds also expose `window.__bench` for diagnostics; production builds do not. Hiding the source or removing that hook would not protect exam answers.

Concentration limits are semi-quantitative: selected salts have approximate room-temperature saturation values; other soluble salts have a 6 M numerical ceiling. The engine does not predict temperature-dependent solubility or mixed-salt phase diagrams. It balances charge and all explicitly tracked elements other than solvent water / atmospheric oxygen, whose H/O inventories are implicit.

[Technical report verification and fixes](docs/technical-report-review-2026-10-24.md) (Chinese): reproducible findings, corrected claims, regression evidence and remaining simulation limits.
