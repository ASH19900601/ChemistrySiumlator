# User guide

**English** · [简体中文](user-guide.zh-CN.md) · [Back to README](../README.md)

This guide is for students and teachers using Qualitative Analysis Lab to practise the qualitative-analysis question of Cambridge IGCSE 0620 Paper 5 and AS & A Level 9701 Paper 3.

## Contents

1. [Opening the app](#1-opening-the-app)
2. [Choosing a question](#2-choosing-a-question)
3. [The exam screen](#3-the-exam-screen)
4. [Working on the bench](#4-working-on-the-bench)
5. [Writing your answers](#5-writing-your-answers)
6. [Finishing and self-marking](#6-finishing-and-self-marking)
7. [Good practice — and what happens if you don't follow it](#7-good-practice--and-what-happens-if-you-dont-follow-it)
8. [Using a phone or iPad](#8-using-a-phone-or-ipad)
9. [Where your work is saved](#9-where-your-work-is-saved)
10. [FAQ](#10-faq)

## 1. Opening the app

Someone who has the repository runs:

```bash
npm install
npm run dev -- --host
```

- On the same computer, open <http://localhost:5173>.
- On a phone or iPad on the same Wi-Fi, open the `Network:` address the terminal prints (for example `http://192.168.1.20:5173`).

Any modern browser works (Chrome, Edge, Safari, Firefox).

## 2. Choosing a question

The home page lists the questions in two groups:

- **Cambridge IGCSE Chemistry 0620 · Paper 5 Practical Test**
- **Cambridge International AS & A Level Chemistry 9701 · Paper 3**

Each card shows the exam series, the total marks and a neutral description of the unknowns (it never gives the answer away). Tap a card to start.

## 3. The exam screen

| Area | What it is |
|---|---|
| **Top bar** | ← back to the question list · paper and question number · ⏱ time spent · *Observation text* switch · **Finish** |
| **Reagent shelf** | The bottles on the bench for this question, as listed in the confidential instructions |
| **Samples** | The unknowns (e.g. *solid E*, *FA 7*) in their containers |
| **Rack** | Your test-tubes, boiling tubes, hard-glass test-tubes and filter papers. Use **+ test-tube**, **+ boiling tube**, **+ hard-glass tube** to take a clean one |
| **Apparatus** | Bunsen burner, damp red / blue litmus, limewater, glowing splint, lighted splint, flame-test wire, universal indicator paper, filter funnel, wash bottle, waste |
| **Action panel** | Appears when a tube is selected: its volume and temperature, the actions you can do with it, and the result of your last action |
| **Question paper / Lab notebook** | The question with answer spaces, and a log of everything you have done plus a box for rough notes |

**Time keeps running on the bench.** About every two seconds, simulated time passes: precipitates settle, bubbling dies down, hot tubes cool, iron(II) hydroxide slowly turns brown at the surface. Look again at a tube after a while — just as in a real lab.

### The *Observation text* switch

Off by default. In the real exam nobody tells you what you see, so normally you only get the **picture** of the tube (colours, precipitates, bubbles, gas colours, condensation, the litmus or limewater result). Turn the switch on to also show the engine's written description of each result — useful when you are learning the vocabulary, or when a colour is hard to judge on your screen.

## 4. Working on the bench

The basic pattern is **select a tube → choose what to do**.

1. **Tap a tube** to select it (tap again, or ✕, to deselect).
2. **Tap a reagent bottle** to add that reagent, or **tap a piece of apparatus** to use it on the selected tube, or use the buttons in the **action panel**.

### Adding a reagent

Tapping a bottle opens the dropper sheet. If no tube is selected you first choose a tube — an existing one or a **new** test-tube / boiling tube / hard-glass test-tube.

- Solutions: **Add 1 drop**, *a few drops (5)*, *0.5 / 1 / 2 / 4 / 5 cm depth*, or type your own amount in **cm depth** or **cm³**.
- Solids (e.g. zinc powder, MnO₂): *small spatula measure* or *spatula measure*.
- Pieces (aluminium foil, magnesium ribbon): *Add one piece*.

The sheet stays open, shows the tube large and gives the result of each addition, so you can add **dropwise** and watch. "Dropwise, then in excess" means: add one drop at a time and look, then keep adding until no further change, then add a few cm depth more.

The sheet shows the liquid already in the tube (cm³ and ≈ cm depth). A test-tube holds about 14 cm³ (≈ 10 cm depth); a boiling tube about 48 cm³. If you add more than the tube can hold, it overflows.

### Actions in the action panel

| Action | Notes |
|---|---|
| **Pour into… / Transfer solid…** | Choose a target tube (or a new one), then *1 / 2 / 4 cm depth*, *about half* or *all* (solids: spatula measures, half, all) |
| **Divide…** | Shares the contents equally between several new, clean boiling tubes and test-tubes — as in "divide solution X into four portions" |
| **Heat…** | Liquids: *Warm gently* or *Heat to boiling*. Solids: *Heat gently* or *Heat strongly*. Choose 10–90 s |
| **Shake** | Mixes and helps solids dissolve |
| **Leave to stand…** | 30 s to 5 min — for changes that take time (e.g. "leave to stand for two minutes") |
| **Test gas…** | Damp red / blue litmus paper, limewater, glowing splint, lighted splint, acidified KMnO₄, acidified dichromate(VI) paper — held at the mouth of the tube |
| **Insert / Remove stopper** | Stopper a tube before shaking; never heat a stoppered tube |
| **Empty** | Pours the contents into the waste. A wet film remains unless you rinse |
| **Rinse** | Rinses the tube with distilled water so nothing is carried over |
| **Remove tube** | Takes a rack tube off the bench (samples cannot be removed) |

### Apparatus

The apparatus buttons act on the **selected** tube:

- **Bunsen burner** — same as *Heat…*.
- **Damp red / blue litmus, limewater, glowing / lighted splint** — tests the gas at the mouth of the tube *right now*. Gases escape quickly, so test **while** the reaction is happening or straight after warming.
- **Flame-test wire** — flame test on the tube's contents (solid or solution).
- **Universal indicator paper** — approximate pH of the solution.
- **Filter funnel** — filters a mixture: you get the filtrate in a new tube and the residue on a filter paper in the rack.
- **Rinse (wash bottle)** and **Empty into waste** — as above.

The rack holds at most 18 vessels. Empty and rinse tubes to re-use them, or remove ones you no longer need.

### Heating solids

Strong heating of a solid needs a **hard-glass test-tube** (or a boiling tube). Watch for melting, colour changes (some solids look different while hot and when cool), condensation near the mouth of the tube, and coloured gases or vapours. Leave the tube to stand to see it cool.

## 5. Writing your answers

Open **Question paper** (desktop: tab on the right; phone: **📄 Paper** at the bottom). The paper follows the original layout: introduction, then each part with its marks and an answer space — lines, a table of tests and observations, or labelled fields.

- Write in the style of the mark scheme: name the colour **and** the state (e.g. "white precipitate, soluble in excess giving a colourless solution"), "effervescence", "damp red litmus turns blue", etc.
- Record what you **saw**, not what you expected. If you made a mistake on the bench, redo the test in a clean tube.
- **Lab notebook** lists every action with its time and tube. Use the *Rough notes* box for anything else.

Answers are saved automatically as you type.

## 6. Finishing and self-marking

Tap **Finish** (top bar or bottom of the paper) and confirm. The self-marking page shows, for every part:

- the question (tap *Question* to expand),
- **Your answer**,
- the published **Mark scheme**,
- **Supervisor's results (simulation)** — what this simulation produces when the instructions are followed exactly, like the supervisor's report sent with real scripts,
- a row of mark buttons (0 … maximum) to award yourself marks.

Your total is shown at the top right. At the bottom you can see **what the unknowns were** (from the confidential instructions) and **everything you did in the lab**, with the observations for each step — compare it with what you wrote.

Then choose **Try this question again** (clears your answers, notes and marks for this question and gives you a fresh bench) or **Choose another question**.

Mark honestly: give a mark only if your answer contains the point in the mark scheme. If the supervisor's results differ from your observations, look in your lab log for the step where your procedure differed.

## 7. Good practice — and what happens if you don't follow it

The engine only knows what is in each tube, so the classic mistakes give the results they would give in a real lab:

| If you… | You will see… |
|---|---|
| acidify with dilute **HCl** before adding AgNO₃ | a white precipitate (AgCl) even when the sample has no chloride — use dilute **nitric acid** |
| forget to acidify before adding Ba²⁺ or Ag⁺ to a carbonate | a white precipitate with barium nitrate (a false "sulfate"), a precipitate with silver nitrate |
| re-use a tube without rinsing | traces of the previous test, e.g. chloride clouding AgNO₃ |
| use tap water instead of distilled water | slight cloudiness with silver nitrate |
| add NaOH to an acidified solution | the first drops only neutralise the acid; the precipitate appears later |
| pour in a large excess of NaOH at once (e.g. to Al³⁺ or Zn²⁺) | the precipitate is seen only for a moment, or not at all — add **dropwise** |
| test for ammonia after the tube has gone cold | no change — ammonia was driven off while warm; test while warming |
| leave H₂O₂ in the tube and then add acidified KMnO₄ | the KMnO₄ is decolourised, with effervescence (oxygen) |
| test a gas long after the reaction has stopped | no result — the gas has escaped |
| overfill a tube | it overflows |

Other tips: use about 1–2 cm depth of solution for a test; take a **new tube for each test** unless the question says to add to the same tube; follow the order of reagents in the question; leave mixtures to stand when asked.

## 8. Using a phone or iPad

- **Phone** (and other narrow windows): use the tabs at the bottom — **🧪 Lab**, **📄 Paper**, **📓 Notebook**. Dialogs open as sheets from the bottom of the screen.
- **iPad portrait**: bench at the top, question paper below, so you can work and write without switching.
- **iPad landscape / desktop**: bench on the left, question paper and lab notebook on the right.

For long answers on an iPad, a hardware keyboard helps but is not required.

## 9. Where your work is saved

Answers, rough notes, self-marks and the *Observation text* setting are stored **in this browser on this device** (local storage). They are not sent anywhere.

- They survive closing the tab or reloading — but the **bench** does not: leaving the question and coming back gives a fresh set of samples.
- A private / incognito window, clearing site data, or a different browser or device starts empty.
- *Try this question again* deliberately clears the answers, notes and marks for that question.

## 10. FAQ

**The colour on my screen is hard to judge.** Screens differ. Turn on *Observation text* to read the description, then try to recognise it next time.

**Nothing happened when I tested the gas.** Gases are only there while they are being produced (or for a short while after warming). Repeat the step and test straight away; for ammonia, warm the mixture first.

**Why does my result differ from the supervisor's results?** Usually because of the amounts used, the order of addition, a tube that was not rinsed, or time — the supervisor follows the question exactly. Compare your lab log with the question.

**Is my answer marked automatically?** No. You mark yourself against the mark scheme.

**Can I get back the same bench after leaving?** No. Your written answers are kept, but the bench always starts fresh.
