# Qualitative Analysis Lab（化学定性分析实验模拟）

[English](README.md) · **简体中文**

在浏览器中模拟 Cambridge 实验考试的定性分析题——IGCSE Chemistry 0620 Paper 5（第 2 题）及 AS & A Level Chemistry 9701 Paper 3。学生在虚拟实验台上亲手做实验，在试卷上自行写下观察和结论，最后对照官方评分标准自我评分。

它不是 "Alternative to Practical"（ATP）文字题：现象没有预先写死。每支试管保存真实内容，所看到的现象由化学反应引擎根据你的实际操作（包括错误操作）计算得出。

## 功能

- **2023–2026 原题资料**——收录资料包中可取得的 67 组定性题（IG 22 组、AS 45 组），含原题、评分标准和材料说明。9 组有逐步回归验证的实验流程，18 组配好自由实验台，40 组提供原题书面练习。详见[覆盖清单](docs/paper-coverage-2023-2026.md)；不等于所有 AS 第二题都已完成模拟。
- **动手操作的实验台**——一切都是用手操作的真实仪器，而不是按钮：拿起试剂瓶放到试管上方倾倒，把滴管放进试管逐滴挤压，开燃气、划火柴点燃本生灯，把试管放到火焰上加热，在洗瓶嘴润湿石蕊试纸再放到试管口，点燃木条，用胶头滴管收集气体通入石灰水，用漏斗过滤。样品和其他试管一起放在试管架上。可以拖动，也可以点一下拿起、再点一下目标；"虚拟手"示范会演示各种动作。
- **实时进行**——反应、沉降、冷却和缓慢变化都在你眼前发生；墙上的时钟可让时间以十倍速度流逝。
- **真正的反应引擎，而非查表**——化学计量、溶度积、"过量溶解"、氧化还原、气体逸出、加热，以及随时间发生的慢变化（例如 Fe(OH)₂ 表面逐渐变棕）。
- **错误操作有真实后果**——用 HCl 酸化后加 AgNO₃、加 Ba²⁺ 前忘记酸化、重用未清洗的试管、用自来水、一次倒入过量试剂、试管装得太满等。
- **自由作答、自我评分**——不自动改分；结果页把你的答案、评分标准和同一引擎生成的"监考员结果"（Supervisor's results）并排显示。
- **支持手机、平板和电脑**——针对电脑、iPad（横向及竖向）和手机设计的响应式布局。
- **答案保存在本机**——作答进度、笔记及自评分数保存在浏览器本地存储（localStorage）。

## 快速开始

需要 **Node.js 18+、npm、Python 3.11+ 和 Git LFS**。已验证 Node 24.19.0。原题页面从校验过的 LFS 资料包生成。

```bash
git clone <本仓库地址>
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

打开 Vite 显示的地址（通常是 <http://localhost:5173>）。如需在同一 Wi-Fi 下的手机或 iPad 上试用：

```bash
npm run dev -- --host
```

然后在设备上打开终端显示的 `Network:` 地址。

| 命令 | 作用 |
|---|---|
| `npm run dev` | 启动开发服务器（热更新） |
| `npm test` | 运行引擎单元测试及真题回归测试（Vitest） |
| `npm run typecheck` | TypeScript 类型检查 |
| `npm run prepare:papers` | 从校验过的资料包生成原题 PDF 和可缩放页面 |
| `npm run check:papers` | 校验 201 份原始 PDF 和页面是否齐全 |
| `npm run test:browser` | 桌面及触屏操作检查；需 Chromium，可用 `CHROMIUM_PATH` 指定位置 |
| `npm run build` | 生产构建，输出到 `dist/`（静态文件） |
| `npm run preview` | 在本机预览生产构建 |

## 文档

| 文档 | 适用对象 |
|---|---|
| [用户指南](docs/user-guide.zh-CN.md) · [User guide](docs/user-guide.md) | 学生及老师：如何在虚拟实验台上完成一道题并评分 |
| [开发者指南](docs/developer-guide.zh-CN.md) · [Developer guide](docs/developer-guide.md) | 引擎设计、项目结构、新增真题、试剂及反应 |

## 已收录真题

| 试卷 | 考试季 | 题目 | 分数 | 未知物 |
|---|---|---|---|---|
| 0620/51 | 2024 年 5/6 月 | Q2 | 14 | 一种固体 E，含三种离子 |
| 0620/52 | 2024 年 10/11 月 | Q2 | 15 | 两种固体 M 和 N |
| 0620/51 | 2023 年 5/6 月 | Q2 | 18 | 一种固体 E，含三种离子 |
| 0620/52 | 2024 年 5/6 月 | Q2 | 18 | 固体 H 和 I |
| 9701/31 | 2025 年 5/6 月 | Q3 | 12 | FA 7（溶液）、FA 8 和 FA 9（钠化合物） |
| 9701/34 | 2024 年 10/11 月 | Q3 | 12 | FB 6（加热后检验残留物）和 FB 7（盐溶液） |
| 9701/33 | 2024 年 5/6 月 | Q3(a) | 10 | FA 5，含两种阳离子和两种阴离子的混合物（有机部分 (b) 未模拟） |

上表为原先的 7 组引导实验；另外新增了 `9701_w23_31` 和 `9701_w23_35` 两组原卷 Q2 的引导流程和回归检查。另 18 组自由实验台仅做了样品和代表性反应验证，不声称已覆盖每个评分点。全部 67 组原题及状态见[覆盖清单](docs/paper-coverage-2023-2026.md)。

## 项目结构

```
src/
  engine/        化学反应引擎（不含界面代码，可独立测试）
  papers/        真题案例：题目文字、样品、实验台试剂、评分标准、监考员操作脚本
  ui/            React 界面：实验台、玻璃仪器、试卷、实验笔记、自我评分
tools/
  dropbox_download.py   从 Dropbox 下载研究资料（含哈希校验）
dropbox_downloads/      研究资料：真题压缩包（Git LFS）及研究报告
docs/                   用户指南及开发者指南（英文及简体中文）
```

技术栈：Vite 5、React 18、TypeScript 5（strict）、Vitest 2。无后端。

## 研究资料

`dropbox_downloads/` 存放 Git LFS 原题资料包和研究报告。新克隆后必须拉取资料包并生成 `public/past-papers/`；生成文件被 Git 忽略，生产构建前会检查齐全性。构建后的 `dist/` 已包含原题资料，运行时无需 Python 或压缩包。

## 局限

- 观察结果是半定量的，细节程度以符合 Cambridge 评分标准为准，并非完整的物理化学模拟。
- 只模拟定性分析题（不含滴定、反应速率或有机测试）。
- 67 组是资料包已取得的公开定性题，不是历年所有实验卷或所有 AS Q2。资料包不含 2026 年 10/11 月；未模拟的题目仍可读原卷、作答并自评。
- 暂无自动改分、账户或教师后台。

## 版权

试卷、评分标准及机密说明 © Cambridge University Press & Assessment，仅供私人学习使用。模拟的实验现象在细节上可能与真实实验室有所不同。
