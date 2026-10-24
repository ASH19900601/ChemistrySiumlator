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
| **Top bar** | ← back to the question list · paper and question number · ⏱ time spent · **?** replay the demonstration · 🔊 sound on/off · *Observation text* switch · ⇥ hide/show the question paper (computer) · **Finish** |
| **Bench** | A laboratory bench drawn as it would be in the exam room (see below) |
| **Question paper / Lab notebook** | The question with answer spaces, and a log of everything you have done plus a box for rough notes |

The first time you open a question, a ghost hand shows the main movements: taking a tube, using a dropper, turning on the gas, lighting the burner and heating a tube. Tap anywhere to skip it; **?** shows it again.

### What is on the bench

| Where | Apparatus |
|---|---|
| Shelf | The reagent bottles for this question (as in the confidential instructions), each with its own dropper; limewater; solid reagents in jars; magnesium ribbon or aluminium foil in a dish |
| Test-tube rack | The **samples** (e.g. *solid E*, *FA 7*, usually stoppered) stand in the rack with your other tubes — they can be used like any other tube |
| Middle of the bench | Bunsen burner with gas tap and air-hole collar, box of matches, filter funnel on its stand, wash bottle of distilled water, waste beaker |
| Front tray | Boxes of clean test-tubes, boiling tubes and hard-glass test-tubes; stoppers; spatula; red litmus, blue litmus and universal indicator papers (with colour chart); splints; teat pipettes; flame-test wire; white tile |
| Wall | Clock showing how much time has passed on the bench |
| Front right | Sink (for rinsing tubes) |

**Time runs on the bench.** Precipitates settle, bubbling dies down, hot tubes cool, iron(II) hydroxide slowly turns brown at the surface — look again at a tube after a while, just as in a real lab. Tap the **clock** to make time run ten times faster (the rim turns orange); tap it again to go back to normal speed. Use it when the question says "leave to stand" or while you wait for something to heat up.

### The *Observation text* switch

Off by default. In the real exam nobody tells you what you see, so normally you only **see** the apparatus: colours, precipitates, bubbles, gases, condensation, the colour of a test paper, a coloured flame. Turn the switch on to also show a short written description of each result — useful while you learn the vocabulary, or when a colour is hard to judge on your screen.

## 4. Working on the bench

Everything is done the way you would do it with your hands: **pick something up and bring it to something else.** There are no menus or buttons.

There are two ways to move things, and you can mix them:

- **Drag** — press on an item, move it, let go. Best with a mouse and on an iPad.
- **Tap, then tap** — tap an item to lift it (it floats and bobs slightly), then tap where it should go. To keep doing something (pouring, holding a strip at a tube), **press and hold** on the target. Tap an empty part of the bench to put the item back. Handy on a phone.

While you hold something, the place where it would act is outlined with a moving dashed line.

### Tubes

- **A clean tube**: tap a box on the tray (it goes into the next free place in the rack), or drag a tube from the box to the rack.
- **Move a tube**: drag it to another place in the rack.
- **Stoppers**: drag a stopper from the box onto a tube; drag the stopper off to remove it. Nothing can be added to, poured from or tested in a stoppered tube.
- **Shake**: while holding a tube, move it quickly from side to side.
- **Empty**: drag the tube onto the **waste beaker** (a wet film stays behind). **Rinse**: drag it onto the **sink**. **Throw away**: drag it back into its box (samples cannot be thrown away).

### Adding liquids

- **Pour**: hold a reagent bottle (or a tube, or the wash bottle) over the mouth of a tube. It tips and pours **for as long as you keep it there**; move away or let go to stop. Yellow marks beside the tube show the depth in centimetres, so you can judge "1 cm depth" or "2 cm depth" as in the exam.
- **Drops**: take the **dropper** out of a bottle (press on its red teat) and put it into a tube — it rests there. **Each tap on the dropper gives one drop**; press and hold for a steady stream of drops. Take the dropper away (drag it anywhere) when you have finished — "dropwise, then in excess" means drops first, then pour from the bottle.
- **Distilled water**: pour from the wash bottle the same way.
- **Limewater**: pour it into a clean tube first, then bubble gas into it (see below).

### Adding solids

- **Spatula**: bring the spatula to a tube containing a dry solid (or to a jar) to take a measure; bring it again to take more. Then bring it to another tube to tip the solid in.
- **Magnesium ribbon / aluminium foil**: drag a piece from the dish into the tube.
- **Tipping out a solid**: hold a tube containing a solid over another tube, as for pouring.

### Heating

1. Tap the **gas tap** to turn the gas on (you hear a hiss).
2. Drag a **match** from the box to the top of the burner — it lights. Matches burn out after a few seconds.
3. Tap the **air-hole collar** to switch between a roaring blue flame (air hole open, hot) and a yellow flame (closed, cooler).
4. Drag a tube onto the burner: it is held in a test-tube holder above the flame.
   - **Higher position** (bottom of the tube at the tip of the flame) — warming gently / heating a solid gently.
   - **Lower position** (in the blue flame) — heating to boiling / heating a solid strongly.
5. Drag the tube away to stop heating. Tap the gas tap again to turn the burner off.

Watch for melting, colour changes (some solids look different while hot), condensation near the mouth of the tube, bubbling, coloured gases and the liquid boiling away. Strong heating of a solid is best done in a **hard-glass test-tube**. A stoppered tube must not be heated — its stopper blows out.

### Testing gases

Gases are only there while they are being given off (or for a short time after warming), so test **straight away**.

- **Litmus / universal indicator paper**: take a strip from its booklet. To make it **damp**, hold it at the nozzle of the wash bottle for a moment. Then hold it at the **mouth of the tube** until it changes. A dry strip does not respond to gases. (Dipping the strip into the liquid tests the **solution** instead — not the gas.) Used strips are kept on the white tile so you can look at them again.
- **Splints**: take a splint from the box and hold it in the flame to light it. Hold the **lighted splint** at the mouth of the tube. To get a **glowing splint**, wave the burning splint quickly from side to side (or tap it while it is lifted).
- **Limewater test**: take a **teat pipette**, hold it at the mouth of the reacting tube to draw in the gas, then put its tip into a tube of limewater to bubble the gas through.

### Other tests

- **Flame test**: take the flame-test wire, dip its loop into the solid or solution, then hold it in the **blue** flame. The flame takes the colour for a few seconds; leaving the wire in the flame cleans it.
- **pH**: dip a strip of universal indicator paper into the solution and compare it with the colour chart on the booklet.
- **Filtering**: drag the funnel from its stand onto a tube in the rack, then pour the mixture into the funnel. The filtrate runs into the tube; the residue stays on the filter paper. You can pour other reagents through the residue in the same way. Drag the funnel back to its stand to take it off, or into the waste beaker to throw the paper away.

## 5. Writing your answers

Open **Question paper** (desktop: tab on the right; phone: **📄 Paper** at the bottom). The paper follows the original layout: introduction, then each part with its marks and an answer space — lines, a table of tests and observations, or labelled fields.

- Write in the style of the mark scheme: name the colour **and** the state (e.g. "white precipitate, soluble in excess giving a colourless solution"), "effervescence", "damp red litmus turns blue", etc.
- Record what you **saw**, not what you expected. If you made a mistake on the bench, redo the test in a clean tube.
- **Lab notebook** lists every action with its time and tube. Use the *Rough notes* box for anything else.

Answers are saved automatically as you type. Check the save-status bar; if saving fails, keep the page open and export a backup.

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
| hold a **dry** litmus paper at the mouth of the tube | no change — dampen it first |
| dip red litmus into the alkaline mixture instead of holding it at the mouth | it turns blue whether or not ammonia is given off — the test is for the **gas** |
| try to add something to a stoppered sample | nothing goes in — take the stopper out |
| heat a stoppered tube | the stopper blows out |
| put a tube on the burner without lighting it, or use the yellow flame | little or no heating |
| overfill a tube | it overflows |

Other tips: use about 1–2 cm depth of solution for a test; take a **new tube for each test** unless the question says to add to the same tube; follow the order of reagents in the question; leave mixtures to stand when asked.

## 8. Using a phone or iPad

- **Phone** (and other narrow windows): use the tabs at the bottom — **🧪 Lab**, **📄 Paper**, **📓 Notebook**. The bench fills the height of the screen and **scrolls sideways**: swipe on an empty part of the bench to see the rest. Dragging an item to the edge scrolls the bench along. *Tap, then tap* is often easier than dragging on a small screen.
- **iPad portrait**: bench at the top, question paper below, so you can work and write without switching.
- **iPad landscape / computer**: bench on the left, question paper and lab notebook on the right. Use **⇥** in the top bar to hide the paper and make the bench larger.

For long answers on an iPad, a hardware keyboard helps but is not required.

## 9. Where your work is saved

Answers, rough notes, self-marks and settings (observation text, sound, whether you have seen the demonstration) are stored **in this browser on this device** (local storage). They are not sent anywhere.

- Successful saves include your bench, apparatus positions, log, written work and marks. Reloading restores the experiment paused; select **Resume experiment** to continue. No chemistry runs while the page is closed.
- A private / incognito window, clearing site data, or a different browser or device starts empty.
- **Export backup** downloads an attempt file. Use **Restore an exported attempt** on the library page to import it, including on another device.
- *Try this question again* starts an independent attempt with fresh samples and empty answers/marks. The previous attempt remains available through its browser-history URL.
- A failed save is clearly marked. Export before leaving; memory-only work cannot survive closing the browser.

## 10. FAQ

**The colour on my screen is hard to judge.** Screens differ. Turn on *Observation text* to read the description, then try to recognise it next time.

**Nothing happened when I tested the gas.** Gases are only there while they are being produced (or for a short while after warming). Repeat the step and test straight away; for ammonia, warm the mixture first. Litmus and indicator papers must be damp, and the tube must not be stoppered.

**Nothing happens when I bring something to a tube.** Check the dashed outline: it shows where the item would act. Stoppered tubes accept nothing but having their stopper removed. If you are holding something else, put it down first (tap an empty part of the bench).

**I want to undo something.** As in a real lab, you cannot. Empty the tube into the waste beaker, rinse it at the sink, and do the test again in a clean tube.

**Waiting takes too long.** Tap the clock on the wall to make time run ten times faster.

**Why does my result differ from the supervisor's results?** Usually because of the amounts used, the order of addition, a tube that was not rinsed, or time — the supervisor follows the question exactly. Compare your lab log with the question.

**Is my answer marked automatically?** No. You mark yourself against the mark scheme.

**Can I get back the same bench after leaving?** No. Your written answers are kept, but the bench always starts fresh.
