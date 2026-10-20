# 化學定性分析實作真題研究 / Qualitative Analysis Practical-Paper Research

Cambridge IGCSE 0620 · Cambridge International AS & A Level 9701 | 研究日期：2026-10-20（Asia/Shanghai）


## 研究範圍與主要結果 / Scope and findings

本研究以實際進行未知物鑑別、試管反應與觀察的題目為主要對象。已核查的公開題庫目錄涵蓋 2001–2026 年，逐份讀取 457 份 question papers，擷取 328 個相關題組；配對 327 份評分標準節錄及 311 份材料說明節錄。另有 129 份已檢查但不屬於本次目標的試卷，列於 Excluded_Papers_Audit.csv。

The collection contains 328 extracted practical-question sets: 122 IGCSE Paper 5 sets, 204 AS/A Level Paper 3 sets, and two legacy Paper 5 references. It includes 327 matching mark-scheme excerpts and 311 materials excerpts. The original PDFs remain the authoritative source for layout, formulae and observations. No platform implementation or product design is included.

| 來源 / Source | 年份 / Years | 題組數 / Sets | 題號與範圍 / Question scope |
| --- | --- | --- | --- |
| IGCSE Chemistry 0620 Paper 5 | 2002–2026 | 122 | 本次取得的定性題均為 Q2；保留題幹、表格、作答空間及全部小問。 |
| AS / A Level Chemistry 9701 Paper 3 | 2001–2026 | 204 | Q1、Q2、Q3 均有例子；包括一份純有機鑑別補充（9701_s20_35）。 |
| Legacy 9701 Paper 5: ionic identification | 來源檔案標示 2003 | 1 | 9701_w03_5 Q2；原檔內日期不一致，按封面與配對 MS 編目，保留原頁及註記。 |
| Legacy 9701 Paper 5: related identification | 2005 | 1 | 9701_w05_5 Q2：實際執行酸／鹼及濃度鑑別；屬相關補充。 |

覆蓋邊界：這是對已核查來源中可公開取得材料的蒐集，不宣稱涵蓋全網所有曾存在的卷別。未取得的檔案、來源異常與排除項目均明列；沒有用其他卷的答案冒充缺失的評分標準。2026 年收錄至已取得的 February/March 與 May/June 系列，未納入 October/November 2026。


## 卷別與題號的核對 / Correct paper and question identification

IGCSE 0620 的 Paper 5 是需要實際操作的 Practical Test；Paper 6 是 Alternative to Practical。9701 現行的實作未知物定性題在 Paper 3，而 Paper 5 是書面 Planning, Analysis and Evaluation。AS 與完整 A Level 不是兩套彼此獨立的濕實驗離子題庫：完整 A Level 的實作基礎也包含 Paper 3。

「Q2 永遠是定性分析」不能作跨課程、跨年份的固定判準。這批 9701 Paper 3 的定性題有 Q2、Q3，以及 2026 May/June Paper 31 的 Q1。相反，9701_w03_qp_3 的 Q2 是 washing soda 的定量滴定，沒有收作未知物定性題。早年 Paper 5 的名稱與安排亦不同，所以另外逐份核查其內容。

[Cambridge IGCSE Chemistry 0620 syllabus 2026–2028, pp.47–48](https://www.cambridgeinternational.org/Images/697205-2026-2028-syllabus.pdf#page=47)

[Cambridge AS & A Level Chemistry 9701 syllabus 2025–2027, pp.69–70](https://www.cambridgeinternational.org/Images/664563-2025-2027-syllabus.pdf#page=69)


## 資料包內容與閱讀方式 / Contents and use

- Papers/：每份試卷獨立資料夾，內有擷取 QP、配對 MS、可取得的材料說明及原題文字檢索副本。
- References/：現行 IGCSE 與 AS/A Level 定性分析表的原頁節錄。
- Paper_Index.html / .csv / .json：逐卷來源、題號、原頁頁碼、材料及評分標準狀態與檔案路徑。
- Reaction_Catalogue.csv / .json：65 項反應家族、現象及條件研究條目，包含中英文物種名稱、原理與直接證據。
- Species_Mention_Index.csv：只作全文定位用途。出現某物種，不代表它必定是原始未知物的成分；亦可能是試劑、反應產物或排除選項。
- Excluded_Papers_Audit.csv、Coverage_and_Gaps.md：已核查但排除的試卷，以及目前的缺件與來源異常。

QP 以原頁方式擷取，保留圖表與作答空間；跨題邊界只遮去不屬於目標題目的部分，不重寫題幹。MS 自相關評分內容開始保留至該分卷卷末；若其後尚有其他題目，其評分頁亦一併保留，以免漏掉未重複題號的續表及替代觀察。文字檢索副本可能失去上下標、箭頭或表格欄位，因此不得取代原始 PDF。


## 如何區分常見與陌生 / Common, extended and unfamiliar chemistry

「陌生」在這份研究中分三種：第一，現行提供表已列出、但學生未必熟悉的項目，例如 AS 的 NO₂⁻、S₂O₃²⁻、Mn²⁺。第二，現行表外但真題確實出現的物種，例如 Ni²⁺、Pb²⁺、Ag⁺、鉻酸根、過二硫酸根及釩。第三，常見離子在不常見的連續操作中呈現新現象，例如 Cu²⁺／I⁻ 同時產生沉澱與碘，或 Fe³⁺／thiosulfate 的暫態紫色。這種分類不是未經證實的出題頻率排名。

| 層次 / Tier | 涉及內容 / Coverage | 判讀重點 / Interpretation |
| --- | --- | --- |
| 現行 IGCSE 提供表 | Al3+, NH4+, Ca2+, Cr3+, Cu2+, Fe2+, Fe3+, Zn2+；六種金屬焰色；carbonate、halides、nitrate、sulfate、sulfite；氣體測試。 | 同一陽離子比較少量與過量 NaOH / NH3；焰色、氣體及陰離子證據互相補充。 |
| 現行 AS 提供表的增加／差異 | Ba2+, Mg2+, Mn2+；NO2-、S2O3^2-；銀鹵化物的氨水溶解性及其他條件。 | 表內項目仍可能因濃度、酸度、靜置或反應順序而呈不同結果。 |
| 真題的表外與歷史內容 | Pb2+、Ni2+、Ag+、H+、OH-；Co(II)背景樣品；HCO3-、HSO4-、S2O5^2-、CrO4^2-、S2O8^2-、SCN-、EDTA、vanadium、Cu(I) 等。 | 分清物種是否需要被辨認、只作背景存在，或只是加入的試劑／形成的產物。 |


## 值得特別閱讀的真題個案 / Verified unfamiliar cases

### 鉛(II)與鋁
兩者的 NaOH/NH3 模式可相似，須再用 KI、氯化物或硫酸根區分。

[9701_s10_35 Q2](https://pastpapers.papacambridge.com/directories/CAIE/CAIE-pastpapers/upload/9701_s10_ms_35.pdf#page=6)

### 鎳(II)
比較 Ni、Cu、Cr 的沉澱及過量氨水行為。

[9701_w07_32 Q2](https://pastpapers.papacambridge.com/directories/CAIE/CAIE-pastpapers/upload/9701_w07_ms_32.pdf#page=7)

### 鈷(II)作背景樣品
實際樣品含 cobalt(II) sulfate，但該題主要要求陰離子證據；不能因此聲稱完整考核 Co2+。

[9701_s07_32 Q3](https://pastpapers.papacambridge.com/directories/CAIE/CAIE-pastpapers/upload/9701_s07_ms_32.pdf#page=6)

### 銀(I)作未知物
AgNO3 不只是固定試劑；可由 chloride、NaOH、Mg 等測試鑑別。

[9701_s23_32 Q3](https://pastpapers.papacambridge.com/directories/CAIE/CAIE-pastpapers/upload/9701_s23_ms_32.pdf#page=10)

### chromate / dichromate
黃轉橙與後續變綠，分別涉及不同類型變化；並有黃色鋇鹽沉澱。

[9701_w12_36 Q3](https://pastpapers.papacambridge.com/directories/CAIE/CAIE-pastpapers/upload/9701_w12_ms_36.pdf#page=5)

### peroxodisulfate
與 iodide 生成碘，和 thiosulfate 的碘褪色形成對照。

[9701_w17_34 Q2](https://pastpapers.papacambridge.com/directories/CAIE/CAIE-pastpapers/upload/9701_w17_ms_34.pdf#page=4)

### EDTA 與銅配合物
同時比較 carbonate、iodide、chloride、水、ammonia 和 EDTA。

[9701_s17_32 Q3](https://pastpapers.papacambridge.com/directories/CAIE/CAIE-pastpapers/upload/9701_s17_ms_32.pdf#page=6)

### 釩的氧化態序列
Zn 還原與再氧化產生有次序的多色過程；中間色可為混色。

[9701_w18_33 Q3](https://pastpapers.papacambridge.com/directories/CAIE/CAIE-pastpapers/upload/9701_w18_ms_33.pdf#page=9)

### Cu(I)歧化
Cu2O 加酸後，分開出現金屬銅殘渣和 Cu(II) 藍色濾液。

[9701_m19_33 Q3](https://pastpapers.papacambridge.com/directories/CAIE/CAIE-pastpapers/upload/9701_m19_ms_33.pdf#page=6)

### hydrogensulfate 混合固體
NaHSO4 + Na2CO3 加水即可反應，原樣與所得溶液成分有別。

[9701_s23_33 Q3](https://pastpapers.papacambridge.com/directories/CAIE/CAIE-pastpapers/upload/9701_s23_ms_33.pdf#page=10)

### metabisulfite 實際配方
實際材料 Na2S2O5；歷史 MS 在 sulfite 層面接受推斷。

[9701_w11_31 Q2](https://pastpapers.papacambridge.com/directories/CAIE/CAIE-pastpapers/upload/9701_w11_ms_31.pdf#page=4)

### thiocyanate 與鐵
比較靜置／酸化前後的 Fe(III) 紅色配合物證據。

[9701_s21_31 Q3](https://pastpapers.papacambridge.com/directories/CAIE/CAIE-pastpapers/upload/9701_s21_ms_31.pdf#page=9)

### Fe(III)–thiosulfate 暫態
紫色可在靜置後褪去，不是永久終態。

[9701_m22_33 Q3](https://pastpapers.papacambridge.com/directories/CAIE/CAIE-pastpapers/upload/9701_m22_ms_33.pdf#page=9)

### hydrogencarbonate
NaHCO3 與 Na2CO3 皆可遇酸冒泡，須利用加熱的差異。

[9701_s25_31 Q3](https://pastpapers.papacambridge.com/directories/CAIE/CAIE-pastpapers/upload/9701_s25_ms_31.pdf#page=11)

### 多離子混合物
NH4Cl + CuCl2 可同時給 Cu(II) 的沉澱／配合物和 NH3。

[9701_s25_31 Q3](https://pastpapers.papacambridge.com/directories/CAIE/CAIE-pastpapers/upload/9701_s25_ms_31.pdf#page=11)

### carbonate 水解
Al(III)及酸化 Fe(III) 樣品可同時有沉澱及 CO2；不能一律指定穩定三價金屬碳酸鹽。

[9701_w25_33 Q3](https://pastpapers.papacambridge.com/directories/CAIE/CAIE-pastpapers/upload/9701_w25_ms_33.pdf#page=12)

### 熱分解與 manganate(VI)
KMnO4 固體、殘渣與溶液的顏色不同，須按操作階段閱讀。

[9701_w24_34 Q3](https://pastpapers.papacambridge.com/directories/CAIE/CAIE-pastpapers/upload/9701_w24_ms_34.pdf#page=9)

### Cr(III)與氨水的靜置
除初始灰綠沉澱，該題另接受靜置後淡紫色溶液。

[9701_s25_35 Q3](https://pastpapers.papacambridge.com/directories/CAIE/CAIE-pastpapers/upload/9701_s25_ms_35.pdf#page=10)

### 改用 HCl 的人為 chloride
原題追問換酸後的 AgCl 白色沉澱；不能誤當原樣本來含 Cl-。

[9701_s24_33 Q3](https://pastpapers.papacambridge.com/directories/CAIE/CAIE-pastpapers/upload/9701_s24_ms_33.pdf#page=10)


## 跨步驟的實驗事實 / Experimental conditions that change observations

- 新鮮分樣與同一試管中的連續加料是不同實驗。原題的 then、keep the solution、use the filtrate 等文字會改變後續受測物。
- 少量與過量 NaOH／NH3 需要分開記錄；初始沉澱與最終配合物溶液不能合成一個無條件結論。
- 靜置可能帶來 Fe(II)／Mn(II) 的棕化、Fe(III)–thiosulfate 暫態顏色的消失，以及某些配合物的緩慢變化。
- 加熱固體、加熱溶液、冷卻殘渣會有不同現象。ZnO 熱黃冷白，以及 KMnO4 熱分解，均有直接真題證據。
- 過濾、洗滌沉澱與分開檢驗濾液／殘渣，是辨認有色溶液與固體顏色的關鍵；Cu2O 加酸是明確例子。
- 樣品可以是混合物、雙鹽、酸化鹽溶液、水合物、金屬或有機分子，不限於一個單一純鹽。
- 有氣泡不等於已確定氣體；Al + NaOH 自身可產生 H2，不能把所有加鋁後的氣泡都算作 nitrate 的陽性結果。
- 有 NH3 也不一定能在加鋁後唯一歸因於 NH4+；NO3-、NO2- 在相應條件也可被還原成 NH3。
- KMnO4 褪色是還原性證據之一，並非 sulfite 的專一結果；Fe2+、nitrite、thiosulfate、某些有機物及 H2O2 都可能相關。
- Cu2+ + I- 可同時產生 CuI 與 I2；碘的棕色可遮蔽類白色固體，後加 thiosulfate 又可使顏色改變。
- 酸化試劑會引入新離子；HCl／H2SO4 在相應檢驗中可造成干擾。
- AgBr 的氨水溶解性與氨濃度有關；Ba2+／Ca2+ 的氫氧化物現象亦受濃度影響。
- 冷凝水可能來自結晶水，也可能來自熱分解產物；應與原題的其他證據合併判斷。
- 材料說明的實際配方與 MS 的考綱層面簡化表達須分開，例如 basic carbonates、Na2S2O5 與 sulfite，以及 carbonate 型沉澱的簡式。


## 反應與現象研究目錄 / Full reaction and observation catalogue

下列 65 項是反應家族、辨認證據與實驗現象的研究條目；不把它們聲稱為 65 條互相獨立的淨反應。每項附條件、觀察、推斷、適用限制和可追溯的原題／評分來源。方程式屬化學解釋；若是考綱層面近似或形式化配體表示，已明確標記。

### R01 鋁離子的沉澱與兩性 / Al3+

Current reference / 現行表列基礎

**條件 / Conditions：** 分別加入少量、過量 NaOH(aq)；另取樣加入 NH3(aq)。

**觀察 / Observations：** 兩者起初為白色沉澱；過量 NaOH 可溶解，過量 NH3 通常不溶。White ppt; different excess-reagent behaviour.

**推斷 / Interpretation：** 配合其他測試辨別 Al3+；舊題中的 Pb2+ 可能呈相同兩試劑模式。

**範圍 / Scope：** 氨水與強鹼的作用不同；不可把所有過量鹼都視為等效。

`Al3+ + 3OH- -> Al(OH)3(s); Al(OH)3(s) + OH- -> [Al(OH)4]-`

[Cambridge AS & A Level Chemistry 9701 syllabus 2025–2027, pp.69–70](https://www.cambridgeinternational.org/Images/664563-2025-2027-syllabus.pdf#page=69) ; [9701_w25_33 Q3](https://pastpapers.papacambridge.com/directories/CAIE/CAIE-pastpapers/upload/9701_w25_ms_33.pdf#page=12)

### R02 銨離子放出氨 / NH4+

Current reference / 現行表列基礎

**條件 / Conditions：** 加入 NaOH(aq) 並加熱；用濕潤紅色石蕊試紙檢驗氣體。

**觀察 / Observations：** 產生使紅色石蕊變藍的氣體。Ammonia turns damp red litmus blue.

**推斷 / Interpretation：** 支持 NH4+；若已加入鋁，須另考慮 NO3-/NO2- 被還原。

**範圍 / Scope：** 看到氣泡不等於已確認氨；須記錄氣體測試。

`NH4+ + OH- -> NH3 + H2O`

[Cambridge IGCSE Chemistry 0620 syllabus 2026–2028, pp.47–48](https://www.cambridgeinternational.org/Images/697205-2026-2028-syllabus.pdf#page=47) ; [Cambridge AS & A Level Chemistry 9701 syllabus 2025–2027, pp.69–70](https://www.cambridgeinternational.org/Images/664563-2025-2027-syllabus.pdf#page=69) ; [9701_s25_31 Q3](https://pastpapers.papacambridge.com/directories/CAIE/CAIE-pastpapers/upload/9701_s25_ms_31.pdf#page=11)

### R03 鋇離子與濃度效應 / Ba2+

Current reference / 現行表列基礎

**條件 / Conditions：** NaOH(aq) 與 NH3(aq) 分別測試，另用硫酸根確認。

**觀察 / Observations：** NaOH 可能僅有極淡白色沉澱，低濃度可無沉澱；NH3 無沉澱。

**推斷 / Interpretation：** 陰性結果受濃度影響；BaSO4 的白色沉澱是另一條證據。

**範圍 / Scope：** 不可將所有 Ba2+ 溶液固定成必定有明顯 Ba(OH)2 沉澱。

`Ba2+ + SO4^2- -> BaSO4(s)`

[Cambridge AS & A Level Chemistry 9701 syllabus 2025–2027, pp.69–70](https://www.cambridgeinternational.org/Images/664563-2025-2027-syllabus.pdf#page=69) ; [9701_s21_35 Q3](https://pastpapers.papacambridge.com/directories/CAIE/CAIE-pastpapers/upload/9701_s21_ms_35.pdf#page=9)

### R04 鈣離子與低濃度陰性結果 / Ca2+

Current reference / 現行表列基礎

**條件 / Conditions：** 分別使用 NaOH(aq)、NH3(aq)，需要時配合焰色。

**觀察 / Observations：** NaOH 白色沉澱但低濃度可無沉澱；NH3 通常無或極少白色沉澱。

**推斷 / Interpretation：** 與 Mg2+ 等作比較；觀察須配合濃度與其他測試。

**範圍 / Scope：** IGCSE 與 AS 表內對微量沉澱的措辭略有差異。

`Ca2+ + 2OH- -> Ca(OH)2(s)`

[Cambridge IGCSE Chemistry 0620 syllabus 2026–2028, pp.47–48](https://www.cambridgeinternational.org/Images/697205-2026-2028-syllabus.pdf#page=47) ; [Cambridge AS & A Level Chemistry 9701 syllabus 2025–2027, pp.69–70](https://www.cambridgeinternational.org/Images/664563-2025-2027-syllabus.pdf#page=69)

### R05 鉻(III)離子的兩性行為 / Cr3+

Current reference / 現行表列基礎

**條件 / Conditions：** 少量及過量 NaOH(aq)；另取樣加入 NH3(aq)。

**觀察 / Observations：** 灰綠／綠色沉澱；過量 NaOH 形成深綠色溶液；NH3 中沉澱一般不溶。

**推斷 / Interpretation：** 支持 Cr3+，與 Fe2+ 的綠色沉澱作區分。

**範圍 / Scope：** 某些真題另記錄氨配合物隨靜置而變色；見下列個案。

`Cr3+ + 3OH- -> Cr(OH)3(s)`

[Cambridge IGCSE Chemistry 0620 syllabus 2026–2028, pp.47–48](https://www.cambridgeinternational.org/Images/697205-2026-2028-syllabus.pdf#page=47) ; [Cambridge AS & A Level Chemistry 9701 syllabus 2025–2027, pp.69–70](https://www.cambridgeinternational.org/Images/664563-2025-2027-syllabus.pdf#page=69) ; [9701_s25_35 Q3](https://pastpapers.papacambridge.com/directories/CAIE/CAIE-pastpapers/upload/9701_s25_ms_35.pdf#page=10)

### R06 銅(II)離子的沉澱與氨配合物 / Cu2+

Current reference / 現行表列基礎

**條件 / Conditions：** NaOH(aq)；另一份樣品逐滴加入 NH3(aq) 至過量。

**觀察 / Observations：** 淡藍沉澱；NaOH 過量仍不溶；NH3 過量形成深藍溶液。

**推斷 / Interpretation：** 區分 Cu2+ 的氫氧化物沉澱與含氨配合物。

**範圍 / Scope：** 先沉澱、再溶解的順序應與直接形成深藍溶液的容許觀察分開閱讀。

`Cu2+ + 2OH- -> Cu(OH)2(s)`

[Cambridge IGCSE Chemistry 0620 syllabus 2026–2028, pp.47–48](https://www.cambridgeinternational.org/Images/697205-2026-2028-syllabus.pdf#page=47) ; [Cambridge AS & A Level Chemistry 9701 syllabus 2025–2027, pp.69–70](https://www.cambridgeinternational.org/Images/664563-2025-2027-syllabus.pdf#page=69) ; [9701_s25_31 Q3](https://pastpapers.papacambridge.com/directories/CAIE/CAIE-pastpapers/upload/9701_s25_ms_31.pdf#page=11)

### R07 鐵(II)沉澱與空氣氧化 / Fe2+

Current reference / 現行表列基礎

**條件 / Conditions：** 加入 NaOH(aq) 或 NH3(aq)，再靜置與空氣接觸。

**觀察 / Observations：** 綠色沉澱；表面逐漸棕色。Green ppt browns on standing.

**推斷 / Interpretation：** 初始 Fe2+ 可逐步轉為 Fe(III) 產物；初始與最終現象須分開。

**範圍 / Scope：** 靜置時間與空氣接觸是實驗條件的一部分。

`Fe2+ + 2OH- -> Fe(OH)2(s); 4Fe(OH)2 + O2 + 2H2O -> 4Fe(OH)3`

[Cambridge IGCSE Chemistry 0620 syllabus 2026–2028, pp.47–48](https://www.cambridgeinternational.org/Images/697205-2026-2028-syllabus.pdf#page=47) ; [Cambridge AS & A Level Chemistry 9701 syllabus 2025–2027, pp.69–70](https://www.cambridgeinternational.org/Images/664563-2025-2027-syllabus.pdf#page=69) ; [9701_s25_35 Q3](https://pastpapers.papacambridge.com/directories/CAIE/CAIE-pastpapers/upload/9701_s25_ms_35.pdf#page=10)

### R08 鐵(III)沉澱 / Fe3+

Current reference / 現行表列基礎

**條件 / Conditions：** 加入 NaOH(aq) 或 NH3(aq)，並測試過量試劑。

**觀察 / Observations：** 紅棕色沉澱，通常不溶於過量兩種試劑。Red-brown ppt.

**推斷 / Interpretation：** 支持 Fe3+；若樣品原先含 Fe2+，須考慮是否已被氧化。

`Fe3+ + 3OH- -> Fe(OH)3(s)`

[Cambridge IGCSE Chemistry 0620 syllabus 2026–2028, pp.47–48](https://www.cambridgeinternational.org/Images/697205-2026-2028-syllabus.pdf#page=47) ; [Cambridge AS & A Level Chemistry 9701 syllabus 2025–2027, pp.69–70](https://www.cambridgeinternational.org/Images/664563-2025-2027-syllabus.pdf#page=69) ; [9701_w25_33 Q3](https://pastpapers.papacambridge.com/directories/CAIE/CAIE-pastpapers/upload/9701_w25_ms_33.pdf#page=12)

### R09 鎂離子沉澱 / Mg2+

Current reference / 現行表列基礎

**條件 / Conditions：** 分別加入少量與過量 NaOH(aq)、NH3(aq)。

**觀察 / Observations：** 白色沉澱；在兩種過量試劑中均不溶。

**推斷 / Interpretation：** 結合陰離子證據辨認鎂鹽。

**範圍 / Scope：** 此列是現行 AS 提供表的項目；不要直接假設 IGCSE 提供表含所有 AS 項目。

`Mg2+ + 2OH- -> Mg(OH)2(s)`

[Cambridge AS & A Level Chemistry 9701 syllabus 2025–2027, pp.69–70](https://www.cambridgeinternational.org/Images/664563-2025-2027-syllabus.pdf#page=69) ; [9701_s23_32 Q3](https://pastpapers.papacambridge.com/directories/CAIE/CAIE-pastpapers/upload/9701_s23_ms_32.pdf#page=10) ; [9701_s21_31 Q3](https://pastpapers.papacambridge.com/directories/CAIE/CAIE-pastpapers/upload/9701_s21_ms_31.pdf#page=9)

### R10 錳(II)沉澱與空氣氧化 / Mn2+

Current reference / 現行表列基礎

**條件 / Conditions：** 加入 NaOH(aq) 或 NH3(aq)，再觀察靜置。

**觀察 / Observations：** 類白色沉澱，接觸空氣後迅速棕化；過量試劑中不溶。

**推斷 / Interpretation：** 支持 Mn2+；初始類白色和後來棕色不是互相矛盾的結果。

**範圍 / Scope：** 棕色產物的實際組成可較複雜，不把所有氧化產物一律指定成單一化合物。

`Mn2+ + 2OH- -> Mn(OH)2(s)`

[Cambridge AS & A Level Chemistry 9701 syllabus 2025–2027, pp.69–70](https://www.cambridgeinternational.org/Images/664563-2025-2027-syllabus.pdf#page=69) ; [9701_s26_31 Q1](https://pastpapers.papacambridge.com/directories/CAIE/CAIE-pastpapers/upload/9701_s26_ms_31.pdf#page=8)

### R11 鋅離子的兩種溶解機制 / Zn2+

Current reference / 現行表列基礎

**條件 / Conditions：** 分別加入 NaOH(aq)、NH3(aq)，再各加入至過量。

**觀察 / Observations：** 白色沉澱；兩種過量試劑都可使沉澱溶解成無色溶液。

**推斷 / Interpretation：** 兩性氫氧化物與含氨配合物可導致相似的肉眼結果。

`Zn2+ + 2OH- -> Zn(OH)2(s); Zn(OH)2 + 2OH- -> [Zn(OH)4]^2-`

[Cambridge IGCSE Chemistry 0620 syllabus 2026–2028, pp.47–48](https://www.cambridgeinternational.org/Images/697205-2026-2028-syllabus.pdf#page=47) ; [Cambridge AS & A Level Chemistry 9701 syllabus 2025–2027, pp.69–70](https://www.cambridgeinternational.org/Images/664563-2025-2027-syllabus.pdf#page=69) ; [9701_s24_33 Q3](https://pastpapers.papacambridge.com/directories/CAIE/CAIE-pastpapers/upload/9701_s24_ms_33.pdf#page=10)

### R12 鉛(II)與鋁的區分 / Pb2+

Historical / 歷史題直接證據

**條件 / Conditions：** 先用 NaOH/NH3；再用 KI、合適的氯化物或硫酸根試劑。

**觀察 / Observations：** Pb2+ 可給白色兩性沉澱；KI 給黃色 PbI2；氯化物／硫酸根可給白色沉澱。

**推斷 / Interpretation：** Al3+ 與 Pb2+ 不能只靠 NaOH/NH3 兩項區分。

**範圍 / Scope：** Pb2+ 不在現行 9701 提供的陽離子表內，但確實出現在舊年定性實作。

`Pb2+ + 2I- -> PbI2(s); Pb2+ + SO4^2- -> PbSO4(s)`

[9701_s10_35 Q2](https://pastpapers.papacambridge.com/directories/CAIE/CAIE-pastpapers/upload/9701_s10_ms_35.pdf#page=6) ; [9701_w13_34 Q3](https://pastpapers.papacambridge.com/directories/CAIE/CAIE-pastpapers/upload/9701_w13_ms_34.pdf#page=8) ; [9701_w03_5 Q2](https://pastpapers.papacambridge.com/directories/CAIE/CAIE-pastpapers/upload/9701_w03_ms_1+2+3+4+5+6.pdf#page=20)

### R13 鎳(II)的沉澱與氨配合物 / Ni2+

Beyond current table / 現行表外真題

**條件 / Conditions：** NaOH(aq) 與 NH3(aq)，比較加入至過量後的結果。

**觀察 / Observations：** 綠色氫氧化物沉澱；NaOH 過量不溶，過量 NH3 可得到藍色溶液。

**推斷 / Interpretation：** 它可與 Cu2+、Cr3+ 並列作觀察比較；不是所有綠色溶液都代表同一離子。

**範圍 / Scope：** 依各題實際試劑濃度、加入順序及評分標準判讀色澤。

`Ni2+ + 2OH- -> Ni(OH)2(s)`

[9701_w07_32 Q2](https://pastpapers.papacambridge.com/directories/CAIE/CAIE-pastpapers/upload/9701_w07_ms_32.pdf#page=7) ; [9701_s10_35 Q2](https://pastpapers.papacambridge.com/directories/CAIE/CAIE-pastpapers/upload/9701_s10_ms_35.pdf#page=6) ; [9701_w12_36 Q3](https://pastpapers.papacambridge.com/directories/CAIE/CAIE-pastpapers/upload/9701_w12_ms_36.pdf#page=5)

### R14 銀(I)作未知樣品 / Ag+

Beyond current table / 現行表外真題

**條件 / Conditions：** 用 HCl／可溶氯化物、NaOH 或 Mg 作區分。

**觀察 / Observations：** 氯化物給白色 AgCl；NaOH 可得棕色 Ag2O；Mg 可析出深色銀。

**推斷 / Interpretation：** AgNO3 可以是未知樣品，不能只把它當固定檢驗試劑。

**範圍 / Scope：** 棕色產物寫 Ag2O，而非穩定的 AgOH。

`Ag+ + Cl- -> AgCl(s); 2Ag+ + 2OH- -> Ag2O(s) + H2O`

[9701_s23_32 Q3](https://pastpapers.papacambridge.com/directories/CAIE/CAIE-pastpapers/upload/9701_s23_ms_32.pdf#page=10)

### R15 氫離子作需要推斷的陽離子 / H+

Beyond current table / 現行表外真題

**條件 / Conditions：** 碳酸鹽、活潑金屬或合適指示劑測試。

**觀察 / Observations：** 產生 CO2 或 H2，或出現相應酸性指示劑顏色。

**推斷 / Interpretation：** 有些題目未列入表中的陽離子其實是 H+。

**範圍 / Scope：** 酸化樣品還可能同時含金屬陽離子及其他陰離子。

`2H+ + CO3^2- -> CO2 + H2O; Mg + 2H+ -> Mg2+ + H2`

[9701_m24_33 Q3](https://pastpapers.papacambridge.com/directories/CAIE/CAIE-pastpapers/upload/9701_m24_ms_33.pdf#page=10) ; [9701_w25_33 Q3](https://pastpapers.papacambridge.com/directories/CAIE/CAIE-pastpapers/upload/9701_w25_ms_33.pdf#page=12)

### R16 氫氧根與氨水的辨別 / OH-; NH3(aq)

Beyond current table / 現行表外真題

**條件 / Conditions：** 用已知金屬鹽比較沉澱與過量試劑中的溶解；另用指示劑。

**觀察 / Observations：** 都可呈鹼性，但對 Cu2+ 等的過量試劑行為不同。

**推斷 / Interpretation：** NaOH 與 NH3 不可視為一種通用「鹼」。

**範圍 / Scope：** NH3 是分子試劑，OH- 是離子；須保留這個物種類別差異。

`NH3 + H2O <=> NH4+ + OH-`

[9701_w17_34 Q2](https://pastpapers.papacambridge.com/directories/CAIE/CAIE-pastpapers/upload/9701_w17_ms_34.pdf#page=4)

### R17 鈷(II)鹽確曾作樣品 / Co2+; sulfate

Background species / 背景物種

**條件 / Conditions：** 2007題使用 cobalt(II) sulfate，該題重點為陰離子測試。

**觀察 / Observations：** 在該題以硫酸根的白色鋇鹽沉澱作主要證據。

**推斷 / Interpretation：** 能確認樣品含 Co(II)，但不能由此題推定已考核完整 Co2+ 定性反應套組。

**範圍 / Scope：** 與水分測試的 cobalt chloride paper 分開；此處確是樣品成分。

[9701_s07_32 Q3](https://pastpapers.papacambridge.com/directories/CAIE/CAIE-pastpapers/upload/9701_s07_ms_32.pdf#page=6)

### R18 金屬離子焰色 / Li+; Na+; K+; Ca2+; Ba2+; Cu2+

Current reference / 現行表列基礎

**條件 / Conditions：** 按題目執行焰色測試。

**觀察 / Observations：** Li 紅；Na 黃；K 淡紫；Ca 橙紅；Ba 淺綠；Cu 藍綠。

**推斷 / Interpretation：** 某些沒有沉澱測試特徵的金屬可由焰色提供證據。

**範圍 / Scope：** 焰色不代表已確認陰離子；混合物及污染可影響觀察。

[Cambridge IGCSE Chemistry 0620 syllabus 2026–2028, pp.47–48](https://www.cambridgeinternational.org/Images/697205-2026-2028-syllabus.pdf#page=47) ; [0620_m25_52 Q2](https://pastpapers.papacambridge.com/directories/CAIE/CAIE-pastpapers/upload/0620_m25_ms_52.pdf#page=6) ; [0620_s24_52 Q2](https://pastpapers.papacambridge.com/directories/CAIE/CAIE-pastpapers/upload/0620_s24_ms_52.pdf#page=6)

### R19 碳酸根的酸反應 / CO3^2-

Current reference / 現行表列基礎

**條件 / Conditions：** 加入稀酸，將氣體通入石灰水。

**觀察 / Observations：** 冒泡；氣體使石灰水混濁。Effervescence; limewater turns milky.

**推斷 / Interpretation：** 在相應樣品脈絡中支持碳酸根。

**範圍 / Scope：** 只看到冒泡不夠；SO2 等干擾需由其他觀察排除。

`CO3^2- + 2H+ -> CO2 + H2O`

[Cambridge IGCSE Chemistry 0620 syllabus 2026–2028, pp.47–48](https://www.cambridgeinternational.org/Images/697205-2026-2028-syllabus.pdf#page=47) ; [Cambridge AS & A Level Chemistry 9701 syllabus 2025–2027, pp.69–70](https://www.cambridgeinternational.org/Images/664563-2025-2027-syllabus.pdf#page=69) ; [9701_s25_31 Q3](https://pastpapers.papacambridge.com/directories/CAIE/CAIE-pastpapers/upload/9701_s25_ms_31.pdf#page=11)

### R20 氯離子及銀氨配合物 / Cl-

Current reference / 現行表列基礎

**條件 / Conditions：** 以稀 HNO3 酸化後加入 AgNO3，再加 NH3。

**觀察 / Observations：** 白色 AgCl 沉澱；可溶於氨水。

**推斷 / Interpretation：** 支持 Cl-，但須確認氯離子不是由所加試劑引入。

`Ag+ + Cl- -> AgCl(s); AgCl + 2NH3 <=> [Ag(NH3)2]+ + Cl-`

[Cambridge IGCSE Chemistry 0620 syllabus 2026–2028, pp.47–48](https://www.cambridgeinternational.org/Images/697205-2026-2028-syllabus.pdf#page=47) ; [Cambridge AS & A Level Chemistry 9701 syllabus 2025–2027, pp.69–70](https://www.cambridgeinternational.org/Images/664563-2025-2027-syllabus.pdf#page=69) ; [9701_s24_33 Q3](https://pastpapers.papacambridge.com/directories/CAIE/CAIE-pastpapers/upload/9701_s24_ms_33.pdf#page=10)

### R21 溴離子沉澱 / Br-

Current reference / 現行表列基礎

**條件 / Conditions：** 稀 HNO3 酸化後加入 AgNO3；需要時測試氨水溶解度。

**觀察 / Observations：** 奶油色 AgBr；氨水溶解程度與濃度有關。

**推斷 / Interpretation：** 與 Cl-/I- 合併比較。

**範圍 / Scope：** 不能把淡氨水、濃氨水、全部與部分溶解混寫成單一固定結果。

`Ag+ + Br- -> AgBr(s)`

[Cambridge IGCSE Chemistry 0620 syllabus 2026–2028, pp.47–48](https://www.cambridgeinternational.org/Images/697205-2026-2028-syllabus.pdf#page=47) ; [Cambridge AS & A Level Chemistry 9701 syllabus 2025–2027, pp.69–70](https://www.cambridgeinternational.org/Images/664563-2025-2027-syllabus.pdf#page=69) ; [9701_w18_36 Q2](https://pastpapers.papacambridge.com/directories/CAIE/CAIE-pastpapers/upload/9701_w18_ms_36.pdf#page=6)

### R22 碘離子沉澱 / I-

Current reference / 現行表列基礎

**條件 / Conditions：** 稀 HNO3 酸化後加入 AgNO3，再加入 NH3。

**觀察 / Observations：** 淡黃色 AgI，通常不溶於氨水。

**推斷 / Interpretation：** 支持 I-；亦可配合氧化成碘的測試。

`Ag+ + I- -> AgI(s)`

[Cambridge IGCSE Chemistry 0620 syllabus 2026–2028, pp.47–48](https://www.cambridgeinternational.org/Images/697205-2026-2028-syllabus.pdf#page=47) ; [Cambridge AS & A Level Chemistry 9701 syllabus 2025–2027, pp.69–70](https://www.cambridgeinternational.org/Images/664563-2025-2027-syllabus.pdf#page=69) ; [9701_s24_33 Q3](https://pastpapers.papacambridge.com/directories/CAIE/CAIE-pastpapers/upload/9701_s24_ms_33.pdf#page=10)

### R23 硝酸根的鋁鹼還原 / NO3-

Current reference / 現行表列基礎

**條件 / Conditions：** NaOH、Al foil、加熱；另行檢驗氣體。

**觀察 / Observations：** 放出能使濕紅石蕊變藍的 NH3。

**推斷 / Interpretation：** 須排除原有 NH4+ 及 NO2- 的干擾。

**範圍 / Scope：** 先在未加鋁時檢查 NH4+，是判讀此結果的重要脈絡。

`3NO3- + 8Al + 5OH- + 18H2O -> 3NH3 + 8[Al(OH)4]-`

[Cambridge IGCSE Chemistry 0620 syllabus 2026–2028, pp.47–48](https://www.cambridgeinternational.org/Images/697205-2026-2028-syllabus.pdf#page=47) ; [Cambridge AS & A Level Chemistry 9701 syllabus 2025–2027, pp.69–70](https://www.cambridgeinternational.org/Images/664563-2025-2027-syllabus.pdf#page=69) ; [9701_w23_31 Q2](https://pastpapers.papacambridge.com/directories/CAIE/CAIE-pastpapers/upload/9701_w23_ms_31.pdf#page=7)

### R24 亞硝酸根與硝酸根的區分 / NO2-

Current reference / 現行表列基礎

**條件 / Conditions：** 比較 acidified KMnO4；亦可比較 NaOH/Al 加熱結果。

**觀察 / Observations：** NO2- 可使酸化 KMnO4 褪色；NO3- 在相同常規測試通常不會。

**推斷 / Interpretation：** 同樣放出 NH3 的兩種陰離子須用另一條反應區分。

**範圍 / Scope：** NO2- 是現行 AS 提供表內項目，對 IGCSE 學生卻可能陌生。

`5NO2- + 2MnO4- + 6H+ -> 5NO3- + 2Mn2+ + 3H2O`

[Cambridge AS & A Level Chemistry 9701 syllabus 2025–2027, pp.69–70](https://www.cambridgeinternational.org/Images/664563-2025-2027-syllabus.pdf#page=69) ; [9701_s23_32 Q3](https://pastpapers.papacambridge.com/directories/CAIE/CAIE-pastpapers/upload/9701_s23_ms_32.pdf#page=10) ; [9701_w23_31 Q2](https://pastpapers.papacambridge.com/directories/CAIE/CAIE-pastpapers/upload/9701_w23_ms_31.pdf#page=7)

### R25 硫酸根與鋇鹽沉澱 / SO4^2-

Current reference / 現行表列基礎

**條件 / Conditions：** 使用合適酸化條件及 Ba2+；考察稀強酸中的溶解性。

**觀察 / Observations：** 白色 BaSO4，於過量稀強酸中不溶。

**推斷 / Interpretation：** 需與 BaSO3、BaCO3 等作區分。

**範圍 / Scope：** 不能用 H2SO4 酸化後再宣稱樣品原本含 sulfate。

`Ba2+ + SO4^2- -> BaSO4(s)`

[Cambridge IGCSE Chemistry 0620 syllabus 2026–2028, pp.47–48](https://www.cambridgeinternational.org/Images/697205-2026-2028-syllabus.pdf#page=47) ; [Cambridge AS & A Level Chemistry 9701 syllabus 2025–2027, pp.69–70](https://www.cambridgeinternational.org/Images/664563-2025-2027-syllabus.pdf#page=69) ; [9701_w17_34 Q2](https://pastpapers.papacambridge.com/directories/CAIE/CAIE-pastpapers/upload/9701_w17_ms_34.pdf#page=4)

### R26 亞硫酸根的酸反應與還原性 / SO3^2-

Current reference / 現行表列基礎

**條件 / Conditions：** 酸、Ba2+、acidified KMnO4 的組合測試。

**觀察 / Observations：** 可產生 SO2；BaSO3 白色且溶於稀強酸；酸化 KMnO4 褪色。

**推斷 / Interpretation：** 結合還原性及沉澱溶解性區分 sulfate。

**範圍 / Scope：** 酸化 KMnO4 褪色本身不是 sulfite 的專一證據。

`SO3^2- + 2H+ -> SO2 + H2O`

[Cambridge IGCSE Chemistry 0620 syllabus 2026–2028, pp.47–48](https://www.cambridgeinternational.org/Images/697205-2026-2028-syllabus.pdf#page=47) ; [Cambridge AS & A Level Chemistry 9701 syllabus 2025–2027, pp.69–70](https://www.cambridgeinternational.org/Images/664563-2025-2027-syllabus.pdf#page=69) ; [9701_m24_33 Q3](https://pastpapers.papacambridge.com/directories/CAIE/CAIE-pastpapers/upload/9701_m24_ms_33.pdf#page=10) ; [9701_w19_34 Q3](https://pastpapers.papacambridge.com/directories/CAIE/CAIE-pastpapers/upload/9701_w19_ms_34.pdf#page=7)

### R27 硫代硫酸根的酸分解 / S2O3^2-

Current reference / 現行表列基礎

**條件 / Conditions：** 加入酸後觀察時間變化。

**觀察 / Observations：** 逐漸出現類白／淡黃色硫，並可產生 SO2。Slow sulfur formation.

**推斷 / Interpretation：** 與立即出現的沉澱、單純氣泡或 sulfate 區分。

**範圍 / Scope：** 在 AS 提供表內；慢反應與靜置時間仍常造成判讀困難。

`S2O3^2- + 2H+ -> S(s) + SO2 + H2O`

[Cambridge AS & A Level Chemistry 9701 syllabus 2025–2027, pp.69–70](https://www.cambridgeinternational.org/Images/664563-2025-2027-syllabus.pdf#page=69) ; [9701_m22_33 Q3](https://pastpapers.papacambridge.com/directories/CAIE/CAIE-pastpapers/upload/9701_m22_ms_33.pdf#page=9) ; [9701_m24_33 Q3](https://pastpapers.papacambridge.com/directories/CAIE/CAIE-pastpapers/upload/9701_m24_ms_33.pdf#page=10)

### R28 碳酸氫根與碳酸根的區分 / HCO3-

Beyond current table / 現行表外真題

**條件 / Conditions：** 分別加熱固體，再用其他步驟檢查產物。

**觀察 / Observations：** NaHCO3 加熱可放出水與 CO2，形成 Na2CO3；兩者遇酸都會冒泡。

**推斷 / Interpretation：** 單靠加酸不能區分 NaHCO3 與 Na2CO3。

**範圍 / Scope：** 受熱表現依金屬鹽而異；此證據直接對應鈉鹽比較題。

`2NaHCO3(s) -> Na2CO3(s) + CO2(g) + H2O(g)`

[9701_s25_31 Q3](https://pastpapers.papacambridge.com/directories/CAIE/CAIE-pastpapers/upload/9701_s25_ms_31.pdf#page=11)

### R29 硫酸氫根與碳酸鹽固體混合物 / HSO4-; CO3^2-

Beyond current table / 現行表外真題

**條件 / Conditions：** NaHSO4 與 Na2CO3 的混合固體加水、加熱及後續測試。

**觀察 / Observations：** 加入水即可冒泡；之後可測出 sulfate 與 carbonate 相關證據。

**推斷 / Interpretation：** 反應所需的酸性可以來自樣品本身，不一定來自外加酸。

**範圍 / Scope：** 原始固體配方與反應後溶液組成不同；不要把兩者當同一份不變成分表。

`2HSO4- + CO3^2- -> 2SO4^2- + CO2 + H2O`

[9701_s23_33 Q3](https://pastpapers.papacambridge.com/directories/CAIE/CAIE-pastpapers/upload/9701_s23_ms_33.pdf#page=10)

### R30 焦亞硫酸鹽的實際材料與考試推斷 / S2O5^2-; HSO3-; SO3^2- context

Beyond current table / 現行表外真題

**條件 / Conditions：** 題目所用實際固體為 Na2S2O5；進行加酸及還原性測試。

**觀察 / Observations：** 放出 SO2 的相關現象；dichromate 可由橙變綠。

**推斷 / Interpretation：** 材料配方是 metabisulfite，但該歷史 MS 容許以 sulfite 層面作推斷。

**範圍 / Scope：** 須分開記錄實際供應物與題目預期的考綱層面辨認。

`S2O5^2- + H2O -> 2HSO3-`

[9701_w11_31 Q2](https://pastpapers.papacambridge.com/directories/CAIE/CAIE-pastpapers/upload/9701_w11_ms_31.pdf#page=4) ; [9701_w11_33 Q2](https://pastpapers.papacambridge.com/directories/CAIE/CAIE-pastpapers/upload/9701_w11_ms_33.pdf#page=4)

### R31 鉻酸根／重鉻酸根平衡與還原 / CrO4^2-; Cr2O7^2-; Cr3+

Beyond current table / 現行表外真題

**條件 / Conditions：** chromate 加酸；再依原題加入還原劑；另與 Ba2+ 等比較。

**觀察 / Observations：** 黃轉橙；還原後綠／藍綠；與 Ba2+ 可得黃色沉澱。

**推斷 / Interpretation：** 色變可能來自酸鹼平衡，也可能來自氧化態改變，兩者必須區分。

**範圍 / Scope：** 黃色鉻酸鋇不是白色 BaSO4；僅以「有沉澱」不足判讀。

`2CrO4^2- + 2H+ <=> Cr2O7^2- + H2O`

[9701_w12_36 Q3](https://pastpapers.papacambridge.com/directories/CAIE/CAIE-pastpapers/upload/9701_w12_ms_36.pdf#page=5)

### R32 過二硫酸根的氧化性 / S2O8^2-

Beyond current table / 現行表外真題

**條件 / Conditions：** 與 KI 接觸，必要時用 starch；並與 sulfate、thiosulfate 比較。

**觀察 / Observations：** 產生黃／棕色碘；澱粉變藍黑。

**推斷 / Interpretation：** 它是氧化劑，與 thiosulfate 的碘褪色行為相反。

**範圍 / Scope：** 反應速率取決於條件；不是普通 sulfate 的別名。

`S2O8^2- + 2I- -> 2SO4^2- + I2`

[9701_w17_34 Q2](https://pastpapers.papacambridge.com/directories/CAIE/CAIE-pastpapers/upload/9701_w17_ms_34.pdf#page=4)

### R33 EDTA 配體交換 / edta species; Cu2+

Beyond current table / 現行表外真題

**條件 / Conditions：** 依原題將 EDTA 試劑加到 Cu(II) 溶液，與 NH3、Cl-、H2O 的作用比較。

**觀察 / Observations：** 產生較深藍色配合物溶液；具體色澤依題目而定。

**推斷 / Interpretation：** 非沉澱型變色也能提供關於金屬配合物的證據。

**範圍 / Scope：** 實際試劑為 Na2edta，並非所有 pH 下都以游離 Y4- 為主要形態。

`Cu2+ + Y4- <=> [CuY]^2- (formal ligand equation)`

[9701_s17_32 Q3](https://pastpapers.papacambridge.com/directories/CAIE/CAIE-pastpapers/upload/9701_s17_ms_32.pdf#page=6)

### R34 乙二酸的酸性與還原性 / ethanedioic / oxalic acid

Beyond current table / 現行表外真題

**條件 / Conditions：** 用 Mg 及 acidified KMnO4，並另觀察受熱。

**觀察 / Observations：** 與 Mg 冒泡；KMnO4 褪色；固體受熱可見水滴及變黑等。

**推斷 / Interpretation：** 同一未知物可以同時是酸和還原劑；這不是標準的單一步驟 oxalate 專一試驗。

**範圍 / Scope：** 乙二酸是分子樣品；方程式以相應 oxalate 作氧化還原表示。

`2MnO4- + 5C2O4^2- + 16H+ -> 2Mn2+ + 10CO2 + 8H2O`

[9701_w13_34 Q3](https://pastpapers.papacambridge.com/directories/CAIE/CAIE-pastpapers/upload/9701_w13_ms_34.pdf#page=8) ; [9701_s15_33 Q3](https://pastpapers.papacambridge.com/directories/CAIE/CAIE-pastpapers/upload/9701_s15_ms_33.pdf#page=6)

### R35 釩的多氧化態序列 / V(V); V(IV); V(III); V(II)

Beyond current table / 現行表外真題

**條件 / Conditions：** NH4VO3 酸化，分別加入 KI／thiosulfate、Zn；之後再氧化。

**觀察 / Observations：** 還原過程可見黃、藍、綠、紫；原題 MS 還接受中間混色的綠色階段。

**推斷 / Interpretation：** 需要保留順序；中間綠色不一定對應單一新氧化態。

**範圍 / Scope：** 此處 VO2+ 的 plain-text 含義易混；正文另用 VO₂⁺ 與 VO²⁺ 清楚區分。

`VO₂⁺ (V) / VO²⁺ (IV) / V³⁺ / V²⁺`

[9701_w18_33 Q3](https://pastpapers.papacambridge.com/directories/CAIE/CAIE-pastpapers/upload/9701_w18_ms_33.pdf#page=9)

### R36 銅(II)與碘離子的氧化還原沉澱 / Cu2+; I-; CuI; I2

Coupled reactions / 連續及耦合反應

**條件 / Conditions：** 向 Cu(II) 與 I- 的混合體系依題目加入試劑；再加 starch 或 thiosulfate。

**觀察 / Observations：** 白／類白 CuI 與棕色碘可同時出現，整體未必呈白色。

**推斷 / Interpretation：** 同時涉及氧化還原與沉澱；不得只按一般離子交換預測。

**範圍 / Scope：** 澱粉及 thiosulfate 有助區分碘的顏色與 CuI 固體。

`2Cu2+ + 4I- -> 2CuI(s) + I2`

[9701_s25_31 Q3](https://pastpapers.papacambridge.com/directories/CAIE/CAIE-pastpapers/upload/9701_s25_ms_31.pdf#page=11) ; [9701_s24_33 Q3](https://pastpapers.papacambridge.com/directories/CAIE/CAIE-pastpapers/upload/9701_s24_ms_33.pdf#page=10) ; [9701_s17_32 Q3](https://pastpapers.papacambridge.com/directories/CAIE/CAIE-pastpapers/upload/9701_s17_ms_32.pdf#page=6)

### R37 氧化亞銅在酸中的歧化 / Cu2O; Cu(I); Cu(II); Cu(0)

Beyond current table / 現行表外真題

**條件 / Conditions：** Cu2O 與稀 H2SO4 反應；過濾，分別觀察殘渣和濾液。

**觀察 / Observations：** 棕／紅棕色銅殘渣與藍色 Cu(II) 濾液。

**推斷 / Interpretation：** 不是所有氧化物加酸都只形成一種可溶鹽。

**範圍 / Scope：** 只適用相應酸性條件；濃氧化性酸會改變結果。

`Cu2O + 2H+ -> Cu2+ + Cu(s) + H2O`

[9701_m19_33 Q3](https://pastpapers.papacambridge.com/directories/CAIE/CAIE-pastpapers/upload/9701_m19_ms_33.pdf#page=6) ; [9701_m24_33 Q3](https://pastpapers.papacambridge.com/directories/CAIE/CAIE-pastpapers/upload/9701_m24_ms_33.pdf#page=10)

### R38 鐵(III)氧化碘離子 / Fe3+; Fe2+; I-; I2

Coupled reactions / 連續及耦合反應

**條件 / Conditions：** 向 Fe(III) 與 iodide 體系按原題加料，再用 starch 確認。

**觀察 / Observations：** 生成棕色碘；澱粉可變藍黑。

**推斷 / Interpretation：** 原有 Fe3+ 被還原為 Fe2+；試後再檢驗會看到不同物種。

**範圍 / Scope：** 後續觀察應對應反應後樣品，不能沿用原始樣品身分。

`2Fe3+ + 2I- -> 2Fe2+ + I2`

[9701_s25_33 Q3](https://pastpapers.papacambridge.com/directories/CAIE/CAIE-pastpapers/upload/9701_s25_ms_33.pdf#page=11)

### R39 二氧化錳催化過氧化氫 / MnO2; H2O2; O2

Coupled reactions / 連續及耦合反應

**條件 / Conditions：** 依題目把 MnO2 與 H2O2 接觸，再作氣體測試。

**觀察 / Observations：** 冒泡、可放熱；氣體使餘燼木條復燃。

**推斷 / Interpretation：** 支持 O2，並展示同一固體可有催化作用。

**範圍 / Scope：** 有氣泡不足以辨認氣體；MnO2 也可在別的條件下作氧化劑。

`2H2O2 -> 2H2O + O2`

[9701_s25_34 Q3](https://pastpapers.papacambridge.com/directories/CAIE/CAIE-pastpapers/upload/9701_s25_ms_34.pdf#page=11) ; [9701_s25_33 Q3](https://pastpapers.papacambridge.com/directories/CAIE/CAIE-pastpapers/upload/9701_s25_ms_33.pdf#page=11)

### R40 二氧化錳的酸性氧化作用 / MnO2; I-; Mn2+

Coupled reactions / 連續及耦合反應

**條件 / Conditions：** 依原題在酸性條件下與 KI 接觸。

**觀察 / Observations：** 可出現碘的棕色，再以 starch 測試。

**推斷 / Interpretation：** 同一 MnO2 在此被消耗作氧化劑，與催化 H2O2 的角色不同。

**範圍 / Scope：** 必須保留酸性條件；不是任意混合 MnO2 與 KI 都得到相同速率或現象。

`MnO2 + 4H+ + 2I- -> Mn2+ + I2 + 2H2O`

[9701_s25_33 Q3](https://pastpapers.papacambridge.com/directories/CAIE/CAIE-pastpapers/upload/9701_s25_ms_33.pdf#page=11) ; [9701_w20_31 Q3](https://pastpapers.papacambridge.com/directories/CAIE/CAIE-pastpapers/upload/9701_w20_ms_31.pdf#page=2)

### R41 高錳酸鉀熱分解 / MnO4-; MnO4^2-; MnO2

Beyond current table / 現行表外真題

**條件 / Conditions：** 加熱固體 KMnO4；檢驗氣體；再依題目溶解殘渣。

**觀察 / Observations：** 固體可跳動／碎裂，放出 O2，留下含綠色 manganate 與黑色固體的混合物。

**推斷 / Interpretation：** 原始紫色、殘渣黑色及溶液綠色可在同一實驗中先後出現。

**範圍 / Scope：** 水或鹼性介質及後續反應會影響可見顏色。

`2KMnO4(s) -> K2MnO4 + MnO2 + O2`

[9701_w24_34 Q3](https://pastpapers.papacambridge.com/directories/CAIE/CAIE-pastpapers/upload/9701_w24_ms_34.pdf#page=9) ; [9701_w25_31 Q3](https://pastpapers.papacambridge.com/directories/CAIE/CAIE-pastpapers/upload/9701_w25_ms_31.pdf#page=11)

### R42 過氧化氫氧化鐵(II) / Fe2+; Fe3+; H2O2

Coupled reactions / 連續及耦合反應

**條件 / Conditions：** 依原題先加 H2O2，再加入 NaOH，並觀察氣體。

**觀察 / Observations：** 溶液可轉黃；加 NaOH 得棕色沉澱；某些條件伴隨 O2。

**推斷 / Interpretation：** 與未氧化前的綠色 Fe(OH)2 對照。

**範圍 / Scope：** 氣泡也可能涉及 H2O2 的催化分解，不能把一條淨離子式視為所有觀察的唯一來源。

`2Fe2+ + H2O2 + 2H+ -> 2Fe3+ + 2H2O`

[9701_s25_35 Q3](https://pastpapers.papacambridge.com/directories/CAIE/CAIE-pastpapers/upload/9701_s25_ms_35.pdf#page=10) ; [9701_s18_35 Q3](https://pastpapers.papacambridge.com/directories/CAIE/CAIE-pastpapers/upload/9701_s18_ms_35.pdf#page=8)

### R43 過氧化氫作還原劑 / H2O2; MnO4-; O2

Coupled reactions / 連續及耦合反應

**條件 / Conditions：** 酸化 KMnO4 與 H2O2。

**觀察 / Observations：** 紫色褪去並可放出 O2。

**推斷 / Interpretation：** H2O2 的角色視反應伙伴而變，可是氧化劑，也可是還原劑。

**範圍 / Scope：** 與有機物或 sulfite 造成的 KMnO4 褪色分開判讀。

`2MnO4- + 5H2O2 + 6H+ -> 2Mn2+ + 5O2 + 8H2O`

[9701_s22_34 Q3](https://pastpapers.papacambridge.com/directories/CAIE/CAIE-pastpapers/upload/9701_s22_ms_34.pdf#page=9)

### R44 碘與硫代硫酸根 / I2; S2O3^2-; S4O6^2-

Coupled reactions / 連續及耦合反應

**條件 / Conditions：** 向含碘體系逐滴加 sodium thiosulfate。

**觀察 / Observations：** 棕色／藍黑澱粉碘色褪去；原先被遮掩的沉澱可能變得清楚。

**推斷 / Interpretation：** 顏色消失不一定代表所有固體也溶解。

**範圍 / Scope：** 過量 thiosulfate 亦可能與部分金屬物種配合，須依原題逐步判讀。

`I2 + 2S2O3^2- -> 2I- + S4O6^2-`

[9701_s24_33 Q3](https://pastpapers.papacambridge.com/directories/CAIE/CAIE-pastpapers/upload/9701_s24_ms_33.pdf#page=10) ; [9701_w17_34 Q2](https://pastpapers.papacambridge.com/directories/CAIE/CAIE-pastpapers/upload/9701_w17_ms_34.pdf#page=4)

### R45 銅(II)的氯配體、稀釋與溫度 / Cu(II) aqua/chloro complexes

Coupled reactions / 連續及耦合反應

**條件 / Conditions：** 按題目加濃 HCl、加水，或加熱後冷卻。

**觀察 / Observations：** 藍／綠程度改變；稀釋、加熱、冷卻可使變化逆轉。

**推斷 / Interpretation：** 可逆的配體平衡／溫度效應，不一定是生成新沉澱或改變氧化態。

**範圍 / Scope：** 實際綠色可以是多物種混色；不可把每一色調都當單一純配合物。

`[Cu(H2O)6]^2+ + 4Cl- <=> [CuCl4]^2- + 6H2O`

[9701_s17_32 Q3](https://pastpapers.papacambridge.com/directories/CAIE/CAIE-pastpapers/upload/9701_s17_ms_32.pdf#page=6) ; [0620_s24_53 Q2](https://pastpapers.papacambridge.com/directories/CAIE/CAIE-pastpapers/upload/0620_s24_ms_53.pdf#page=6)

### R46 銅碳酸鹽及鹼式碳酸鹽受熱 / copper(II) carbonate / basic carbonate

Thermal / 熱反應

**條件 / Conditions：** 加熱固體，再對原樣品或殘渣按題目測試。

**觀察 / Observations：** 可變黑；釋出 CO2；若實際材料含羥基或水，也可見水滴。

**推斷 / Interpretation：** 原材料的配方要依 CI；考綱簡式不必等於實際試劑的精確組成。

**範圍 / Scope：** 不把所有商用品一律當成純 CuCO3 或固定水合物。

`CuCO3 -> CuO + CO2 (simple carbonate model)`

[0620_s24_53 Q2](https://pastpapers.papacambridge.com/directories/CAIE/CAIE-pastpapers/upload/0620_s24_ms_53.pdf#page=6) ; [9701_w13_34 Q3](https://pastpapers.papacambridge.com/directories/CAIE/CAIE-pastpapers/upload/9701_w13_ms_34.pdf#page=8)

### R47 氫氧化銅受熱 / Cu(OH)2; CuO

Thermal / 熱反應

**條件 / Conditions：** 先由 Cu2+ 與 OH- 形成沉澱，再按原題加熱。

**觀察 / Observations：** 藍色沉澱可轉為黑色。

**推斷 / Interpretation：** 同一管中的固體已隨加熱改變。

**範圍 / Scope：** 若混有 NH4+，同時加熱可另有 NH3；兩種現象並不互斥。

`Cu(OH)2 -> CuO + H2O`

[9701_s25_31 Q3](https://pastpapers.papacambridge.com/directories/CAIE/CAIE-pastpapers/upload/9701_s25_ms_31.pdf#page=11)

### R48 鋅碳酸鹽與熱致變色 / ZnCO3 / basic carbonate; ZnO

Thermal / 熱反應

**條件 / Conditions：** 加熱、冷卻並檢驗氣體。

**觀察 / Observations：** 熱時黃色，冷卻變淡或白色；可釋出 CO2，實際鹼式材料亦可能見水滴。

**推斷 / Interpretation：** 熱時與冷時的顏色須分別記錄。

`ZnCO3 -> ZnO + CO2 (simple carbonate model)`

[9701_w25_36 Q3](https://pastpapers.papacambridge.com/directories/CAIE/CAIE-pastpapers/upload/9701_w25_ms_36.pdf#page=11) ; [9701_s24_33 Q3](https://pastpapers.papacambridge.com/directories/CAIE/CAIE-pastpapers/upload/9701_s24_ms_33.pdf#page=10)

### R49 鎂／鉛等硝酸鹽的熱分解 / Mg(NO3)2; Pb(NO3)2; NO2; O2

Thermal / 熱反應

**條件 / Conditions：** 加熱相應固體，分別觀察氣體和殘渣。

**觀察 / Observations：** 可產生棕色 NO2、使餘燼木條復燃的 O2，並留下金屬氧化物。

**推斷 / Interpretation：** 此為特定硝酸鹽的表現；不同金屬的 nitrate 熱分解路徑不同。

**範圍 / Scope：** 不能把所有 nitrate 都固定為 NO2 + O2 + oxide。

`2Pb(NO3)2 -> 2PbO + 4NO2 + O2`

[9701_s16_35 Q3](https://pastpapers.papacambridge.com/directories/CAIE/CAIE-pastpapers/upload/9701_s16_ms_35.pdf#page=6) ; [9701_w13_34 Q3](https://pastpapers.papacambridge.com/directories/CAIE/CAIE-pastpapers/upload/9701_w13_ms_34.pdf#page=8) ; [9701_w11_31 Q2](https://pastpapers.papacambridge.com/directories/CAIE/CAIE-pastpapers/upload/9701_w11_ms_31.pdf#page=4)

### R50 多陽離子與雙鹽 / NH4+; Cu2+; Al3+; Fe2+/Fe3+; sulfate context

Mixture / 混合樣品

**條件 / Conditions：** 以不同新鮮分樣進行加鹼、氨水、氣體及陰離子測試。

**觀察 / Observations：** 一份樣品可以同時給沉澱、深色溶液與氣體。

**推斷 / Interpretation：** 未知樣品不一定是單一純鹽，也可能是混合物或雙鹽。

**範圍 / Scope：** 反應後濾液、沉澱和未使用原樣應分開辨認。

[9701_s25_31 Q3](https://pastpapers.papacambridge.com/directories/CAIE/CAIE-pastpapers/upload/9701_s25_ms_31.pdf#page=11) ; [9701_m22_33 Q3](https://pastpapers.papacambridge.com/directories/CAIE/CAIE-pastpapers/upload/9701_m22_ms_33.pdf#page=9) ; [9701_w23_33 Q3](https://pastpapers.papacambridge.com/directories/CAIE/CAIE-pastpapers/upload/9701_w23_ms_33.pdf#page=9)

### R51 未知鋅的金屬置換 / Zn(s); Cu2+; Fe3+

Redox / 氧化還原

**條件 / Conditions：** 未知金屬與 CuSO4、FeCl3 或稀酸接觸。

**觀察 / Observations：** 可析出紅棕銅、藍色變淡，或 Fe(III) 被還原、或產生 H2。

**推斷 / Interpretation：** 結合多條反應推斷金屬；單看氣泡不能唯一確認 Zn。

`Zn + Cu2+ -> Zn2+ + Cu; Zn + 2Fe3+ -> Zn2+ + 2Fe2+`

[9701_w25_36 Q3](https://pastpapers.papacambridge.com/directories/CAIE/CAIE-pastpapers/upload/9701_w25_ms_36.pdf#page=11) ; [9701_s20_34 Q3](https://pastpapers.papacambridge.com/directories/CAIE/CAIE-pastpapers/upload/9701_s20_ms_34.pdf#page=8)

### R52 碳酸銨的多種氣體 / (NH4)2CO3; NH3; CO2; H2O

Thermal / 熱反應

**條件 / Conditions：** 依原題加熱或加入酸／鹼，分開檢驗氣體。

**觀察 / Observations：** 加熱可有水滴、NH3 與 CO2；加酸主要確認 carbonate，加鹼確認 ammonium。

**推斷 / Interpretation：** 同一固體可含兩種可產生不同氣體的離子。

**範圍 / Scope：** 不可把受熱放氣固定成單一氣體。

`(NH4)2CO3 -> 2NH3 + CO2 + H2O`

[9701_w21_33 Q3](https://pastpapers.papacambridge.com/directories/CAIE/CAIE-pastpapers/upload/9701_w21_ms_33.pdf#page=9) ; [9701_m26_33 Q3](https://pastpapers.papacambridge.com/directories/CAIE/CAIE-pastpapers/upload/9701_m26_ms_33.pdf#page=11)

### R53 硫氰酸根與鐵的證據鏈 / SCN-; Fe3+

Beyond current table / 現行表外真題

**條件 / Conditions：** 比較原樣、加鹼靜置後酸化的樣品，再加 thiocyanate。

**觀察 / Observations：** Fe(III) 配合物可呈較深紅／血紅／橙紅色。

**推斷 / Interpretation：** 可用以追蹤 Fe2+ 氧化成 Fe3+；原題的對照比單一色名更重要。

**範圍 / Scope：** 配合物分布受濃度與酸度影響；此式為簡化表達。

`Fe3+ + SCN- <=> [FeSCN]^2+ (simplified representation)`

[9701_s21_31 Q3](https://pastpapers.papacambridge.com/directories/CAIE/CAIE-pastpapers/upload/9701_s21_ms_31.pdf#page=9) ; [9701_s18_35 Q3](https://pastpapers.papacambridge.com/directories/CAIE/CAIE-pastpapers/upload/9701_s18_ms_35.pdf#page=8)

### R54 鐵(III)與硫代硫酸根的暫態變色 / Fe3+; S2O3^2-

Beyond current table / 現行表外真題

**條件 / Conditions：** 向 thiosulfate 樣品加入 FeCl3，觀察剛混合及靜置後。

**觀察 / Observations：** 可先呈紫色，之後褪去。Transient purple colour fades.

**推斷 / Interpretation：** 暫態配合與後續氧化還原可連續發生；不是永久紫色產物。

**範圍 / Scope：** 淨方程式不能單獨描述剛混合時的暫態顏色。

`2Fe3+ + 2S2O3^2- -> 2Fe2+ + S4O6^2- (net redox)`

[9701_m22_33 Q3](https://pastpapers.papacambridge.com/directories/CAIE/CAIE-pastpapers/upload/9701_m22_ms_33.pdf#page=9)

### R55 次氯酸根氧化碘離子 / ClO-; I-; I2

Redox / 氧化還原

**條件 / Conditions：** 按原題用 sodium chlorate(I) 處理含 iodide 的酸性樣品，再加 thiosulfate。

**觀察 / Observations：** 可生成棕色碘，後被 thiosulfate 消色。

**推斷 / Interpretation：** chlorate(I) 是試劑，碘離子才是待辨認樣品成分。

**範圍 / Scope：** 勿與 chlorate(V)、chloride 或 iodate 混淆。

`ClO- + 2I- + 2H+ -> Cl- + I2 + H2O`

[9701_s24_33 Q3](https://pastpapers.papacambridge.com/directories/CAIE/CAIE-pastpapers/upload/9701_s24_ms_33.pdf#page=10)

### R56 酸化試劑引入的離子 / Cl-; SO4^2-; NO3-

Interference / 干擾與條件

**條件 / Conditions：** 比較 HNO3、HCl、H2SO4 的用途；辨認哪些離子由外加試劑帶入。

**觀察 / Observations：** 本來的 AgI 黃色沉澱可因改用 HCl 而多出白色 AgCl；sulfate 測試亦可能受外加 H2SO4 干擾。

**推斷 / Interpretation：** 反應產物及試劑帶入的離子不能自動算作原始未知物成分。

**範圍 / Scope：** 此項直接來自原題的換酸追問，而非假設的程式需求。

[9701_s24_33 Q3](https://pastpapers.papacambridge.com/directories/CAIE/CAIE-pastpapers/upload/9701_s24_ms_33.pdf#page=10) ; [9701_s07_32 Q3](https://pastpapers.papacambridge.com/directories/CAIE/CAIE-pastpapers/upload/9701_s07_ms_32.pdf#page=6)

### R57 氣體確認測試總表 / NH3; CO2; H2; O2; SO2; Cl2

Gas / 氣體辨認

**條件 / Conditions：** 使用相應濕試紙、石灰水、木條或酸化 KMnO4。

**觀察 / Observations：** NH3 令濕紅石蕊變藍；CO2 石灰水混濁；H2 爆鳴；O2 餘燼復燃；SO2 令酸化 KMnO4 褪色；Cl2 漂白濕石蕊。

**推斷 / Interpretation：** 把冒泡與氣體身分分開記錄，並保留可能干擾。

**範圍 / Scope：** 石灰水不是在所有混合氣體情境中都能獨立唯一確認 CO2。

[Cambridge IGCSE Chemistry 0620 syllabus 2026–2028, pp.47–48](https://www.cambridgeinternational.org/Images/697205-2026-2028-syllabus.pdf#page=47) ; [Cambridge AS & A Level Chemistry 9701 syllabus 2025–2027, pp.69–70](https://www.cambridgeinternational.org/Images/664563-2025-2027-syllabus.pdf#page=69)

### R58 結晶水、溶解與分離 / hydrated salts; filtrate; residue

Physical / 物理與樣品狀態

**條件 / Conditions：** 加熱水合鹽、加水溶解，或過濾後分別測試濾液及殘渣。

**觀察 / Observations：** 水滴、固體融於結晶水、脫水或不同相中的顏色。

**推斷 / Interpretation：** 水、溶解和分離不是新離子的證據，卻可能改變後續檢驗對象。

**範圍 / Scope：** 冷凝水本身不唯一證明結晶水；也可能來自分解反應。

[9701_w25_31 Q3](https://pastpapers.papacambridge.com/directories/CAIE/CAIE-pastpapers/upload/9701_w25_ms_31.pdf#page=11) ; [9701_m19_33 Q3](https://pastpapers.papacambridge.com/directories/CAIE/CAIE-pastpapers/upload/9701_m19_ms_33.pdf#page=6)

### R59 鋁(III)／鐵(III)與碳酸鹽的水解 / Al3+; Fe3+; CO3^2-

Coupled reactions / 連續及耦合反應

**條件 / Conditions：** 向相應水溶液加入 carbonate，並測試所產生氣體。

**觀察 / Observations：** 可同時出現氫氧化物沉澱和 CO2；不是一律形成穩定的 Al2(CO3)3 或 Fe2(CO3)3。

**推斷 / Interpretation：** 沉澱加冒泡可以出現在金屬鹽中；須與額外酸化造成的反應一起判讀。

**範圍 / Scope：** 原題有 acidified Fe(III) 與 Al(III) 樣品；兩者都可產生 CO2，不能只靠冒泡判為單純酸。

`2Al3+ + 3CO3^2- + 3H2O -> 2Al(OH)3 + 3CO2`

[9701_w25_33 Q3](https://pastpapers.papacambridge.com/directories/CAIE/CAIE-pastpapers/upload/9701_w25_ms_33.pdf#page=12)

### R60 鋁與鹼本身產生氫氣 / Al; OH-; H2

Interference / 干擾與條件

**條件 / Conditions：** 向樣品加入 Al 與 NaOH 並加熱，再檢驗氣體。

**觀察 / Observations：** 即使沒有 nitrate，Al 與鹼反應也可有 H2。

**推斷 / Interpretation：** 冒泡不是 NO3- 或 NH4+ 的專一證據；必須實際區分 H2 和 NH3。

**範圍 / Scope：** 此題評分明確接受 H2 的爆鳴，而對不適當的氨觀察另有判斷。

`2Al + 2OH- + 6H2O -> 2[Al(OH)4]- + 3H2`

[9701_w19_34 Q3](https://pastpapers.papacambridge.com/directories/CAIE/CAIE-pastpapers/upload/9701_w19_ms_34.pdf#page=7)

### R61 鉻(III)與氨水的靜置變化 / Cr3+; ammonia complexes

Beyond current table / 現行表外真題

**條件 / Conditions：** 按 2025 題目將 Cr(III) 樣品與 NH3 接觸，觀察剛加入及靜置後。

**觀察 / Observations：** 先有灰綠色沉澱；該題另接受靜置後淡紫／紫紅色溶液。

**推斷 / Interpretation：** 速查表的初始沉澱結果不能取代題目指定的後續觀察。

**範圍 / Scope：** 保留原題條件；不推廣為所有 Cr3+ 溶液必定立即發生同一變化。

[9701_s25_35 Q3](https://pastpapers.papacambridge.com/directories/CAIE/CAIE-pastpapers/upload/9701_s25_ms_35.pdf#page=10)

### R62 鐵(II)硫酸鹽水合物受熱 / FeSO4·7H2O; sulfate thermal products

Thermal / 熱反應

**條件 / Conditions：** 分開記錄加熱、溶解殘渣與後續化學測試。

**觀察 / Observations：** 題目接受冷凝水、酸性氣體／白煙及棕／黃／灰色殘渣；後續溶液可能仍驗出 Fe2+。

**推斷 / Interpretation：** 受熱不代表所有樣品已完全轉化；後續測試可檢查氧化或分解是否完全。

**範圍 / Scope：** 方程式是完全分解模型；原題的局部加熱結果應以實際 MS 為準。

`2FeSO4 -> Fe2O3 + SO2 + SO3 (complete-decomposition model)`

[9701_s18_35 Q3](https://pastpapers.papacambridge.com/directories/CAIE/CAIE-pastpapers/upload/9701_s18_ms_35.pdf#page=8) ; [9701_s15_33 Q3](https://pastpapers.papacambridge.com/directories/CAIE/CAIE-pastpapers/upload/9701_s15_ms_33.pdf#page=6)

### R63 銅(II)碳酸鹽型沉澱 / Cu2+; CO3^2-

Precipitation / 沉澱

**條件 / Conditions：** 向 Cu(II) 溶液加入 sodium carbonate，再依題目處理。

**觀察 / Observations：** 藍／藍綠／綠藍色沉澱；與 acid 可重新溶解並冒泡。

**推斷 / Interpretation：** carbonate 與金屬離子也會產生沉澱；不能只考慮酸鹼冒泡。

**範圍 / Scope：** 該題 MS 接受此簡式；實際沉澱可含鹼式碳酸鹽，屬考綱層面近似。

`Cu2+ + CO3^2- -> CuCO3(s) (exam-level simplified equation)`

[9701_s17_32 Q3](https://pastpapers.papacambridge.com/directories/CAIE/CAIE-pastpapers/upload/9701_s17_ms_32.pdf#page=6)

### R64 水的化學確認 / H2O; cobalt(II) chloride paper

Physical / 物理與樣品狀態

**條件 / Conditions：** 以藍色 cobalt chloride paper 檢驗加熱形成的水分；亦可參考課程中的無水 CuSO4 測試。

**觀察 / Observations：** 含水時藍色試紙可轉粉紅；無水 CuSO4 由白轉藍是另一個水分測試。

**推斷 / Interpretation：** 試劑中有 Co 或 Cu 不表示原始未知樣品含 Co2+ 或 Cu2+。

**範圍 / Scope：** 氣體冷凝與水的化學確認分開記錄。

[0620_s19_52 Q2](https://pastpapers.papacambridge.com/directories/CAIE/CAIE-pastpapers/upload/0620_s19_ms_52.pdf#page=6) ; [0620_w16_51 Q2](https://pastpapers.papacambridge.com/directories/CAIE/CAIE-pastpapers/upload/0620_w16_ms_51.pdf#page=3) ; [Cambridge IGCSE Chemistry 0620 syllabus 2026–2028, pp.47–48](https://www.cambridgeinternational.org/Images/697205-2026-2028-syllabus.pdf#page=47)

### R65 硫代硫酸根使銀鹵化物溶解 / AgBr; S2O3^2-; silver complexes

Beyond current table / 現行表外真題

**條件 / Conditions：** 對同一類銀鹵化物沉澱分別加入 NH3 與原題的 thiosulfate 樣品。

**觀察 / Observations：** AgBr 在題目氨水條件下可不溶／部分溶解，但加入 thiosulfate 可溶成無色溶液。

**推斷 / Interpretation：** 同一沉澱在不同配體中表現不同；thiosulfate 不只用來還原碘。

**範圍 / Scope：** 依原題的加入量與次序判讀，避免把氨水與 thiosulfate 的結果互換。

`AgBr(s) + 2S2O3^2- <=> [Ag(S2O3)2]^3- + Br-`

[9701_w18_36 Q2](https://pastpapers.papacambridge.com/directories/CAIE/CAIE-pastpapers/upload/9701_w18_ms_36.pdf#page=6)


## 逐年覆蓋 / Coverage by year

| Year | IGCSE 0620 P5 | 9701 P3 | Legacy P5 appendices |
| --- | --- | --- | --- |
| 2001 | 0 | 1 | 0 |
| 2002 | 1 | 2 | 0 |
| 2003 | 2 | 1 | 1 |
| 2004 | 2 | 2 | 0 |
| 2005 | 2 | 2 | 1 |
| 2006 | 2 | 2 | 0 |
| 2007 | 2 | 4 | 0 |
| 2008 | 2 | 4 | 0 |
| 2009 | 2 | 5 | 0 |
| 2010 | 6 | 9 | 0 |
| 2011 | 5 | 10 | 0 |
| 2012 | 6 | 10 | 0 |
| 2013 | 6 | 10 | 0 |
| 2014 | 6 | 10 | 0 |
| 2015 | 7 | 10 | 0 |
| 2016 | 7 | 11 | 0 |
| 2017 | 7 | 11 | 0 |
| 2018 | 7 | 11 | 0 |
| 2019 | 7 | 11 | 0 |
| 2020 | 7 | 11 | 0 |
| 2021 | 7 | 11 | 0 |
| 2022 | 7 | 11 | 0 |
| 2023 | 6 | 11 | 0 |
| 2024 | 6 | 11 | 0 |
| 2025 | 6 | 15 | 0 |
| 2026 | 4 | 8 | 0 |

這些是卷別／擷取題組的數量，不是獨立實驗類型的數量。某些變體包含相同或高度相似的實驗，仍逐卷保留。2020 May/June 的已發布試卷亦收錄，但發布試卷不等同於當年實際有考生完成該場考試。


## 缺件、例外與證據限度 / Gaps and evidence limits

- 0620_s10_53 Q2：原題已擷取；對應 MS 在本次核查來源中未取得。資料包以缺件標示，不放入其他卷答案替代。
- 328 個題組中有 311 份可用材料節錄；未有材料節錄者在索引中標示。9701_w06_ir_3 為零頁 PDF，9701_m20_ci_33 為無法解析的損壞來源，均未當作有效材料交付。
- 9701_w03_5 Q2：來源頁腳與封面日期不一致。其內容與 November 2003 配對 MS 的 Al/Pb/Zn 鑑別相符，但不將日期衝突隱藏。
- 9701_s20_35 是純有機鑑別補充；有機分子不能被計作未知離子。其他混合定性題的有機小問仍完整保留，避免截斷原題。
- 一個物種在題目中出現，可能只是給定試劑、反應產物或理論選項。Species_Mention_Index 只作定位；已核對的角色解釋以本報告和原題為準。
- 未以不同年份的分數或出現次數推算未來考題，也沒有把歷史表外物種自動列為現行必背內容。

Method: public archive listings were enumerated, PDFs were downloaded and checked, question boundaries were identified from the original documents, and exceptional layouts and unfamiliar reaction examples were checked against QP/MS/materials. The catalogue groups verified chemistry and observations; it is not an exhaustive manual transcription of every table cell. All individual experiments remain available in the extracted original questions and marking pages.


## English research summary

The key chemistry extends beyond a static cation/anion test table. Verified past-paper contexts include nickel(II), historical lead(II), unknown silver nitrate, chromate–dichromate equilibria, peroxodisulfate, EDTA, vanadium oxidation states, copper(I) disproportionation, hydrogen carbonate, hydrogen sulfate/carbonate mixtures, metabisulfite formulations and thiocyanate complexes. A cobalt(II) sulfate sample is also documented, but its presence must not be confused with a requirement to identify cobalt by a full set of cation tests.

Many unfamiliar results arise from coupled operations on familiar species: air oxidation, warming and cooling, excess ligands, changes of acidity, transient complexes, precipitation plus redox, and separate testing of a filtrate and a residue. The report therefore records experimental conditions and evidence, while keeping the unknown sample distinct from added reagents and reaction products.

Current 9701 Paper 5 is a written planning/analysis/evaluation paper, not the main hands-on unknown-substance question. The principal wet-practical sources are 0620 Paper 5 and 9701 Paper 3. Two legacy Paper 5 references are retained separately; one has a source-date inconsistency and the other identifies acids/alkali through actual experimental work.
