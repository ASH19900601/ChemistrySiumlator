# 开发者指南

[English](developer-guide.md) · **简体中文** · [返回 README](../README.zh-CN.md)

介绍 Qualitative Analysis Lab 的构建方式、化学反应引擎的工作原理，以及如何新增真题、试剂、化合物和反应。

## 目录

1. [环境与命令](#1-环境与命令)
2. [架构](#2-架构)
3. [化学反应引擎](#3-化学反应引擎)
4. [在代码中使用引擎](#4-在代码中使用引擎)
5. [新增真题](#5-新增真题)
6. [新增试剂、化合物、物种和反应](#6-新增试剂化合物物种和反应)
7. [测试](#7-测试)
8. [用户界面](#8-用户界面)
9. [构建](#9-构建)
10. [约定](#10-约定)

## 1. 环境与命令

需要 Node.js 18 或以上（开发时使用 Node 22）及 npm。

```bash
npm install
npm run dev          # Vite 开发服务器，http://localhost:5173（加 -- --host 可供局域网设备访问）
npm test             # Vitest，运行全部引擎及真题测试
npx vitest           # 监听模式
npm run typecheck    # tsc，strict 模式
npm run build        # tsc -b && vite build → dist/
npm run preview      # 预览 dist/
```

技术栈：Vite 5、React 18、TypeScript 5（`strict`）、Vitest 2。无后端，除 React 外没有运行时依赖。

## 2. 架构

```
src/
  main.tsx                 React 入口
  engine/                  化学反应引擎——纯 TypeScript，不依赖 DOM/React
    species.ts             物种目录：离子、配合物、沉淀、气体；颜色、焰色
    compounds.ts           起始物质（化学式、摩尔质量、溶解方式、受热分解步骤）
    reagents.ts            实验台试剂（浓度按机密说明）
    rules.ts               反应规则（complete / equilibrium / kinetic）
    vessel.ts              试管状态；规则求解；时间、温度、气体
    colour.ts              Beer–Lambert 混色及考试用颜色词
    observe.ts             把状态变化转为考试用语的观察句子
    lab.ts                 Lab：容器 + 操作（加试剂、倒液、加热、气体检验……）+ 操作记录
    appearance.ts          供界面绘制容器的数据
    index.ts               公开导出
    __tests__/             单元测试及真题回归测试
  papers/
    types.ts               PaperCase / QuestionPart / AnswerSpec
    igcse.ts               0620 Paper 5 案例
    alevel.ts              9701 Paper 3 案例（及试卷专用试剂）
    index.ts               PAPERS 列表、paperById()
  ui/
    App.tsx                画面：首页 → 考试 → 结果
    Exam.tsx               实验台、操作面板、试卷、笔记、手机标签
    Tube.tsx               SVG 玻璃仪器（液体、沉淀、气泡、火焰、塞子）
    Apparatus.tsx          试剂瓶及仪器图标
    Sheets.tsx             对话框：滴管、倒液、分装、加热、静置、气体检验
    PaperPane.tsx          带答题位置的试卷
    ResultVisual.tsx       测试结果图示（石蕊、石灰水、木条、焰色、通用指示剂试纸）
    Results.tsx            自我评分页面
    storage.ts             带保护的 localStorage 工具函数
    styles.css             全部样式及响应式断点
```

依赖方向严格为 `ui → papers → engine`。引擎从不引用界面代码，可以独立测试和编写脚本。

## 3. 化学反应引擎

引擎是**半定量**的：准确程度足以让观察结果符合 Cambridge 评分标准的给分点，并让错误操作改变结果，但并非研究级的物理化学模型。

### 3.1 状态

每个 `Vessel`（`vessel.ts`）保存：

- `n`——每种物种的物质的量，单位 **mmol**（离子、溶解分子、固体、未溶解的化合物）；
- `V`——液体体积，单位 cm³（低于一个很小的阈值即视为"干"）；
- `T`——温度（°C）、加热方式、塞子；
- 液面上方的气体（head-space）、气泡速率、冷凝水、沉淀的沉降程度；
- 事件记录。

引擎中没有任何地方知道"正确答案"：只有试管里存在反应物，反应才会发生。

物种 id 是普通字符串，例如 `'Cu2+'`、`'SO4 2-'`、`'OH-'`、`'Cu(OH)2(s)'`、`'CO2(aq)'`、`'NH3'`、`'Cl2(g)'`。未溶解的起始物质为 `cmp:<化合物 id>`。水从不显式写出。

### 3.2 规则

规则位于 `rules.ts`：

```ts
interface Rule {
  id: string
  type: 'complete' | 'equilibrium' | 'kinetic'
  reactants: Record<string, number>   // 化学计量
  products: Record<string, number>
  priority?: number                   // 数值越小越先执行（快反应）
  K?: number                          // 平衡常数，mol dm⁻³ 单位，不含固体和水
  reserve?: Record<string, number>    // 必须保留的最低游离浓度
  halfLife?: number | ((ctx) => number) // 动力学规则的半衰期（秒），Infinity 表示不进行
  when?: (ctx) => boolean             // 额外条件（温度、pH、浓度……）
  dry?: boolean; anyPhase?: boolean; minTemp?: number
  events?: string[]                   // 可观察事件，如 'effervescence'
}
```

- **complete**——进行到底的快反应（中和、大多数氧化还原、溶解）。`reserve` 让某反应物保持最低游离浓度，用来模拟"过量才溶解"——例如 Al(OH)₃ 只有在有足够过量 OH⁻ 时才溶解。
- **equilibrium**——针对当前内容，用二分法精确求解 Q = K 的单一平衡。沉淀使用 `K = 1/Ksp`（辅助函数 `ppt()`），卤化银–氨、Cu⁺–硫代硫酸根、淀粉–碘等平衡也是如此。
- **kinetic**——按半衰期随时间推进的慢过程：Fe(OH)₂／Mn(OH)₂ 的空气氧化、硫代硫酸根遇酸析出硫、Fe³⁺–硫代硫酸根紫色配合物褪色、H₂O₂ 催化分解、碳酸盐与酸、只在加热时进行的反应、热分解等。

### 3.3 求解

`Vessel.settle()` 反复扫描快反应（`FAST_RULES`，按优先级排序），直到不再变化（最多 300 轮）。每轮中优先级高的规则先执行，因此加入的 NaOH 会先中和游离酸（优先级 1），之后才会沉淀金属氢氧化物（优先级 3）。低于显著性阈值的变化会被忽略，以避免振荡。

`Vessel.advance(dt)` 以 1–4 秒为步长推进时间：温度向室温（或加热目标：warm 65 °C、boil 100 °C、gentle 260 °C、strong 600 °C）靠近，动力学规则推进，快反应重新求解，挥发性气体逸出。

### 3.4 气体

超过饱和的 CO₂ 形成气泡（effervescence，带速率）。NH₃ 和 SO₂ 按亨利常数（含 van 't Hoff 温度修正）分配到液面上方，所以氨气在加热时才能检出，并会逐渐散失。液面上方的气体以约 15 秒的半衰期衰减，因此只有在气体生成期间检验才有效。NO 在空气中变成棕色 NO₂。气体检验（`Lab.gasTest`）把液面上方气体的量与阈值比较。

### 3.5 加热干燥固体

化合物可以声明受热步骤（`ThermalStep`：`minTemp`、`halfLife`、产物、事件）——失去结晶水并产生冷凝水、碳酸盐和氢氧化物分解、熔化、升华。`MIXED_THERMAL` 处理一起加热的固体之间的反应（例如碘化物与锌化合物产生紫色碘蒸气）。有些固体在热时颜色不同（`hotColour`）。

### 3.6 观察

`Lab` 在每次操作前后对容器做 `snapshot()`，再由 `describe()`（`observe.ts`）比较两者，生成如 *"Pale blue precipitate forms."*、*"The precipitate dissolves, giving a deep blue solution."*、*"Effervescence."*、*"The solution turns from purple to colourless."* 的句子。它处理：

- 可见度阈值——微量固体为 "faint"，低于下限则不报告；
- 短暂出现的沉淀（`Tracker` 记录多步加入过程中达到的最大量）；
- 转化（Fe(OH)₂ → Fe(OH)₃，"turns brown near the surface"）；
- 试剂颜色（紫色 KMnO₄ 保持或褪色、橙色重铬酸盐变绿）；
- 以 Beer–Lambert 定律混合所有有色物种得到的溶液颜色（`colour.ts`），并用考试用词命名。

`appearance()` 把同一状态转为绘图数据（液面高度及 RGB、浑浊度、沉淀、干燥固体、片状物、气泡、气体颜色、冷凝水、火焰）。

## 4. 在代码中使用引擎

```ts
import { Lab } from './engine'

const lab = new Lab({
  samples: [{ id: 'X', label: 'solution X', kind: 'solution', solution: { conc: { 'Cu2+': 0.1, 'SO4 2-': 0.1 }, volume: 20 } }],
  reagents: ['NaOH', 'NH3'],
})

const t = lab.newVessel('test-tube')
lab.transfer(lab.sampleVessel('X').id, t.id, { depth: 1 })
for (let i = 0; i < 5; i++) console.log(lab.addReagent(t.id, 'NH3', { drops: 1 }).observations)
console.log(lab.addReagent(t.id, 'NH3', { cm3: 4 }).observations)   // 深蓝色溶液
```

`Lab` 的主要方法（均返回带 `observations` 的 `ActionResult`，并追加到 `lab.journal`）：

| 方法 | 用途 |
|---|---|
| `newVessel(kind, label?)` | `'test-tube' \| 'boiling-tube' \| 'hard-glass-tube'` |
| `sampleVessel(sampleId)` | 装有样品的容器 |
| `addReagent(vesselId, reagentId, amount)` | 数量：`{drops}`、`{cm3}`、`{depth}`、`{spatula:'small'\|'normal'}`、`{grams}`、`{pieces}` |
| `transfer(from, to, amount)` | 另可用 `{fraction}` 和 `{all:true}` |
| `divide(from, kinds[])` | 平均分到新容器，返回 `vesselIds` |
| `heat(id, 'warm'\|'boil'\|'gentle'\|'strong', seconds)` | |
| `wait(seconds, id?)`、`tick(dt)` | 让时间流逝（单个容器或全部） |
| `shake(id)`、`setStopper(id, on)` | |
| `gasTest(id, test)` | `damp-red-litmus`、`damp-blue-litmus`、`limewater`、`glowing-splint`、`lighted-splint`、`acidified-kmno4`、`acidified-dichromate-paper` |
| `flameTest(id)`、`pHTest(id)` | |
| `filter(id)` | 返回 `filtrateId` 和 `residueId`（滤纸） |
| `empty(id)`、`rinse(id)`、`discard(id)` | `empty` 会留下液膜；`rinse` 会清洗干净 |

## 5. 新增真题

1. **阅读原始资料**——试卷、评分标准及机密说明（在 `dropbox_downloads/` 的 LFS 压缩包中）。记下每种未知物的确切成分和质量，以及实验台试剂的浓度。
2. **确认化学内容已覆盖**——未知物中的每种化合物必须在 `compounds.ts` 中存在，每种试剂必须在 `reagents.ts` 中存在。缺少的请补充（见第 6 节）。试卷专用试剂（例如 *FB 8* = 0.100 mol dm⁻³ 硫代硫酸钠）可以像 `alevel.ts` 那样在试卷文件中用 `registerReagent()` 注册。
3. **编写 `PaperCase`**，放在 `src/papers/igcse.ts` 或 `alevel.ts`：

```ts
export const P0620_s25_51: PaperCase = {
  id: '0620_s25_51',
  syllabus: 'Cambridge IGCSE Chemistry 0620',
  level: 'IGCSE',
  series: 'May/June 2025',
  component: 'Paper 51 (Practical Test)',
  question: 2,
  totalMarks: 15,                         // 必须等于各小题分数之和（有测试检查）
  summary: 'One solid, X, containing two ions.',   // 中性描述：不得透露答案
  samples: [{ id: 'X', label: 'solid X', kind: 'solid', solid: [{ compound: 'FeSO4.7H2O', grams: 2 }] }],
  reagents: ['water', 'NaOH', 'NH3', 'HNO3', 'AgNO3', 'Ba(NO3)2'],
  intro: 'You are provided with solid X. …',
  parts: [
    { id: 'a', label: '(a)', text: 'Dissolve … Record your observations.', marks: 2,
      answer: { kind: 'lines', lines: 3 },          // 或 { kind: 'table', header, rows } / { kind: 'fields', fields }
      markScheme: ['green precipitate [1]', 'insoluble in excess [1]'] },
    // …
  ],
  identities: ['Solid X: iron(II) sulfate-7-water (2 g).'],
  omitted: undefined,                     // 说明原题中未模拟的部分
  supervisor(lab) {
    // 严格按题目步骤操作；返回每个小题 id 对应的观察文字
    const X = lab.sampleVessel('X')
    // …
    return { a: t(/* ActionResults */) }
  },
}
```

   - 小题的 `preamble` 用于放不属于单一小题的步骤文字（例如 "Divide solution E into four portions…"）。
   - `igcse.ts` 中的辅助函数 `t(...results)` 用于合并观察文字。
   - 监考员脚本同时用于自我评分页面的"Supervisor's results"和回归测试，所以要逐字按题目操作（用量、顺序、"leave to stand"）。
4. **注册**——加入 `IGCSE_PAPERS`／`AS_PAPERS`；`papers/index.ts` 会把所有真题提供给首页。
5. **在 `src/engine/__tests__/papers.test.ts` 中加入评分标准检查**：

```ts
'0620_s25_51': {
  a: [/[Gg]reen precipitate forms/, /does not dissolve|insoluble/],
},
```

   每个正则表达式都必须匹配该小题的监考员观察文字。运行 `npm test`；若某个检查失败，应修正化学模型（规则、常数、阈值），而不是修改检查——除非检查本身写错了。
6. **在界面中检查**：运行 `npm run dev`，像学生一样在实验台上完成该题，并尝试几种典型的错误操作。

## 6. 新增试剂、化合物、物种和反应

### 试剂（`reagents.ts`）

```ts
add({ id: 'KI', label: 'aqueous potassium iodide', short: 'KI(aq)', kind: 'solution', conc: { 'K+': 0.1, 'I-': 0.1 } })
add({ id: 'Mg-ribbon', label: 'magnesium ribbon (2 cm)', short: 'Mg ribbon', kind: 'piece', compound: 'Mg', pieceGrams: 0.022 })
```

`kind` 可为 `'solution'`（浓度单位 mol dm⁻³，电荷必须平衡）、`'solid'`（药匙量）或 `'piece'`。`bottleTint` 决定界面中试剂瓶的颜色。`solutionFromGrams()` 可把机密说明中的"每 dm³ 含若干克化合物"换算为浓度。

### 化合物（`compounds.ts`）

```ts
c({ id: 'NaBr', formula: 'NaBr', name: 'sodium bromide', molarMass: 102.89, colour: '#fafafa', colourName: 'white',
  dissolves: { 'Na+': 1, 'Br-': 1 } })
```

可溶化合物填写 `dissolves`；不溶化合物填写 `asSpecies`（对应的固体物种）。若题目会加热该固体，加入 `thermal` 步骤。含结晶水的盐，摩尔质量要包括结晶水，并在加热时释放 `H2O(g)`（产生冷凝水）。

### 物种（`species.ts`）

规则中用到的每个 id 都必须是已注册的物种（有测试检查）。有色的水溶物种需要 `tint` + `refConc`（该浓度下的表观颜色）及 `colourName`；固体需要 `colour`、`colourName`，可选 `visibility`（少量时的显眼程度）和 `hotColour`；气体可设 `gasColour`；焰色元素设 `flame`。

### 规则（`rules.ts`）

```ts
// 沉淀：K = 1/Ksp
ppt('Ni(OH)2', { 'Ni2+': 1, 'OH-': 2 }, 'Ni(OH)2(s)', 5.5e-16)

// 过量才溶解：只有在剩余一定游离 OH- 时才进行
r({ id: 'Zn(OH)2+OH', type: 'complete', priority: 5, reactants: { 'Zn(OH)2(s)': 1, 'OH-': 2 },
  products: { 'Zn(OH)4 2-': 1 }, reserve: { 'OH-': 0.02 } })

// 带条件的慢过程
r({ id: 'ClO+H+Cl', type: 'kinetic', reactants: { 'ClO-': 1, 'Cl-': 1, 'H+': 2 }, products: { 'Cl2(g)': 1 },
  halfLife: (x) => (x.c('H+') > 1 && x.c('Cl-') > 0.5 ? 10 : Infinity) })
```

（现有规则的确切参数见 `rules.ts`；以上代码只用于说明写法。）

指引：

- 按"什么必须先发生"选择 `priority`：中和（1）→ 碳酸根／亚硫酸根质子化（2–3）→ 沉淀（3）→ 配位／过量溶解（4–5）→ 氧化还原。
- 规则必须守恒电荷（有测试检查）和原子。
- 尽量使用真实常数（Ksp、K），只在需要重现课程大纲和评分标准所描述的现象时才调整。调整过的数值请加注释。
- 对看得见但不是物质的量变化的现象使用 `events`（例如 `'effervescence'`、`'crackling'`）。
- 修改后运行全部测试——新规则可能会改变其他真题的结果。

## 7. 测试

| 文件 | 覆盖范围 |
|---|---|
| `cations.test.ts` | Al³⁺、Ca²⁺、Ba²⁺、Cr³⁺、Cu²⁺、Fe²⁺、Fe³⁺、Mg²⁺、Mn²⁺、Zn²⁺、NH₄⁺ 的 NaOH 及 NH₃ 测试；焰色测试 |
| `anions.test.ts` | 碳酸根、硝酸根、亚硝酸根、硫酸根、亚硫酸根、硫代硫酸根、卤离子、碘／淀粉；气体检验（H₂、O₂） |
| `procedure.test.ts` | 加入顺序及原有内容：用错酸、未酸化、未清洗试管、自来水、残留 H₂O₂、短暂沉淀、配合物再酸化、冷却后氨气散失、缓慢空气氧化 |
| `papers.test.ts` | 每个 `PaperCase` 的监考员操作对照评分标准；分数总和正确 |
| `rules.test.ts` | 规则引用的每个物种都存在；每条规则电荷守恒 |
| `helpers.ts` | `solutionLab`、`solidLab`、`portion`、`dropwiseThenExcess`、`text` |

每当修复一个由操作顺序或残留内容引起的问题时，请写一个 procedure 测试，确保问题不会复发。

## 8. 用户界面

- `App.tsx` 保存画面状态（`home`／`exam`／`results`）。每次作答都会挂载一个新的 `Exam` 和新的 `Lab`。
- `Exam.tsx` 每 2 秒调用一次 `lab.tick(2)`，让实验台上的时间流逝。操作通过 `run()` 执行：先播放简短动画（倒液、加热、检验气体）再执行操作，忙碌期间忽略输入。试管架最多 18 个容器。
- 除非打开 *Observation text* 开关，否则隐藏观察文字；画面（`Tube.tsx`、`ResultVisual.tsx`）总是显示。
- 玻璃仪器使用 SVG：液体使用 multiply 混合，沉淀和浑浊使用噪声滤镜（`Tube.tsx` 中的 `SvgDefs`），气泡使用 CSS 动画。
- 布局（`styles.css`）：宽度 ≥ 1100 px（电脑、iPad 横屏）＝左边实验台、右边试卷／笔记；≤ 1099 px＝每次显示一个面板，底部有标签（Lab / Paper / Notebook）；竖屏的高平板（宽 700–1099 px、高 ≥ 960 px，如 iPad）＝上方实验台、下方试卷；≤ 640 px＝手机紧凑尺寸。所有尺寸下对话框都是底部弹出面板。
- `storage.ts` 以 `qa-lab:` 为前缀保存答案、笔记、分数和偏好设置；每次访问都包在 `try/catch` 中，存储不可用时程序仍可运行。
- 界面语言为英文（与考试一致）。

## 9. 构建

`npm run build` 把静态网站输出到 `dist/`。`vite.config.ts` 设置了 `base: './'`，所以文件可放在任何子路径下，或由静态服务器从本地文件夹提供。

## 10. 约定

- TypeScript strict 模式；引擎代码中不使用 `any`。
- 引擎代码不依赖 DOM 和 React。
- 物质的量用 mmol，体积用 cm³，浓度用 mol dm⁻³，温度用 °C，时间用秒。
- 观察句子沿用评分标准用语（英式拼写：*colour*、*sulfate*、*aluminium*）。
- `papers/` 中的题目文字沿用原卷；`summary` 不得透露未知物身份。
- 提交前运行 `npm test` 和 `npm run build`。
