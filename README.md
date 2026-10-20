# Qualitative Analysis Lab（化學定性分析實驗模擬）

模擬 Cambridge IGCSE 0620 Paper 5 及 AS & A Level 9701 Paper 3 定性分析題的實驗。學生在虛擬實驗台上真正進行測試、自己記錄觀察及結論，最後按官方評分標準自行評分。介面為純英文，支援電腦、iPad（橫向及直向）和手機。

## 運行

```bash
npm install
npm run dev      # 開發伺服器
npm test         # 化學引擎及真題回歸測試
npm run build    # 生成 dist/（靜態網站，可直接部署）
```

## 架構

```
src/engine/   化學反應引擎（與介面無關，可獨立測試）
  species.ts     離子、沉澱、氣體及顏色（Beer–Lambert 混色）
  compounds.ts   起始物質（含結晶水、受熱分解行為）
  reagents.ts    實驗台試劑（濃度按 Confidential Instructions）
  rules.ts       反應規則：中和、Ksp 沉澱、過量溶解、氧化還原、動力學過程、加熱
  vessel.ts      試管狀態、規則求解、時間推進、氣體逸出、溫度
  observe.ts     由狀態變化生成考試用語的觀察
  lab.ts         實驗操作 API（加試劑、倒液、加熱、靜置、氣體測試、焰色、pH、過濾、清洗）
  appearance.ts  供介面繪製的外觀數據
src/papers/   真題案例（題目、樣本配方、試劑、評分標準、監考員操作腳本）
src/ui/       React 介面（實驗台、試卷、筆記、自評）
```

### 引擎原則

- 每支試管保存實際內容（mmol 及體積），反應只取決於管內物質，不依賴「正確答案」。
- 快速反應按優先次序處理（例如加入的 NaOH 先中和殘留酸，才會沉澱金屬氫氧化物）；沉澱以 Ksp 求平衡，「過量才溶解」以保留濃度模擬。
- 慢反應隨時間推進：Fe(OH)₂／Mn(OH)₂ 在空氣中變棕、硫代硫酸根遇酸慢慢出硫、Fe³⁺–硫代硫酸根紫色褪去、H₂O₂ 催化分解等。
- 錯誤操作有真實後果：用 HCl 酸化後加 AgNO₃ 會出現白色沉澱、未酸化時碳酸根與 Ba²⁺ 生成白色沉澱、未清洗的試管殘留前一個測試的物質、用自來水會令 AgNO₃ 稍為混濁、試管裝得太滿會溢出等。

### 真題驗證

`src/engine/__tests__/papers.test.ts` 按每份真題的步驟及監考員材料配方操作，檢查引擎產生的觀察符合官方評分標準。目前收錄：

| 卷別 | 題目 |
|---|---|
| IGCSE 0620 | s24_51、w24_52、s23_51、s24_52 的 Q2 |
| 9701 Paper 3 | s25_31、w24_34 的 Q3，及 s24_33 Q3(a) |

新增真題：在 `src/papers/` 加入一個 `PaperCase`（題目文字、樣本配方、試劑、評分標準、`supervisor` 腳本），再在測試中加入對應的評分標準檢查。
