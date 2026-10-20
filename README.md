# Qualitative Analysis Lab

**English** · [简体中文](README.zh-CN.md)

A browser-based simulator for the qualitative-analysis question of Cambridge practical exams — IGCSE Chemistry 0620 Paper 5 (Question 2) and AS & A Level Chemistry 9701 Paper 3. Students carry out the tests on a simulated bench, write down their own observations and conclusions on the question paper, then mark themselves against the published mark scheme.

Unlike an "Alternative to Practical" worksheet, nothing is scripted: every tube holds its actual contents, and what you see comes from a chemistry engine that reacts to exactly what you did — including mistakes.

## Features

- **Real past papers** — 7 questions from 2023–2025 (4 × IGCSE 0620, 3 × 9701), with the original wording, the unknowns made up as in the confidential instructions, and the mark schemes.
- **A simulated bench** — samples, a test-tube rack, reagent bottles, Bunsen burner, litmus, limewater, splints, flame-test wire, universal indicator paper, filter funnel, wash bottle and waste.
- **A chemistry engine, not a lookup table** — stoichiometry, solubility products, "soluble in excess", redox, gas evolution, heating and slow changes over time (e.g. Fe(OH)₂ turning brown at the surface).
- **Mistakes have consequences** — acidifying with HCl before AgNO₃, forgetting to acidify before Ba²⁺, re-using an un-rinsed tube, tap water, pouring in too much reagent at once, over-filling a tube…
- **Free-form answers and self-marking** — no auto-marking; the results page shows your answers next to the mark scheme and the "supervisor's results" produced by the same engine.
- **Works on phone, tablet and desktop** — responsive layouts for PC, iPad (portrait and landscape) and phones.
- **Answers stay on the device** — work in progress, notes and self-marks are kept in the browser's local storage.

## Quick start

Requirements: **Node.js 18+** (developed on Node 22) and npm.

```bash
git clone <this repository>
cd ChemistrySiumlator
npm install
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

Each paper is regression-tested: `src/engine/__tests__/papers.test.ts` follows the question's instructions with the confidential-instruction samples and checks that the engine's observations contain what the mark scheme credits.

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

`dropbox_downloads/` holds the material the papers were built from: `Chemistry_Qualitative_Practicals_2001-2026.zip` (question papers, mark schemes and confidential instructions, stored with **Git LFS** — run `git lfs pull` after cloning if you need it) and the research report in Markdown and HTML. The app itself does not need these files.

## Limitations

- Observations are semi-quantitative and tuned to the level of detail Cambridge mark schemes expect; they are not a full physical-chemistry simulation.
- Only the qualitative-analysis question is simulated (no titration, rates or organic tests).
- No auto-marking, accounts or teacher dashboard yet.

## Copyright

Question papers, mark schemes and confidential instructions © Cambridge University Press & Assessment, reproduced for private study only. Simulated observations may differ in detail from a real laboratory.
