# Ventilator Navigator 成人呼吸器模式互動決策與教學助手

> **「從病人生理需求出發，而不是從呼吸器 Mode 名稱出發。」**

Ventilator Navigator 是一個專為 ICU 專科醫師、非重症/胸腔科醫師、專科護理師 (Nurse Practitioner, NP)、呼吸治療師 (RT) 及住院醫師設計的成人重症呼吸器模式互動決策支援與臨床教學系統 (Clinical Decision Support & Education System)。

---

## 🌟 核心特色 (Key Features)

- **生理導向決策引擎 (Physiology-First Decision Engine)**：不單純推薦模式名稱，而是從氧合 (Oxygenation)、通氣 (Ventilation)、肺力學 (Mechanics) 與自主呼吸驅動 (Drive) 出發提供完整推演邏輯。
- **雙重使用模式 (Dual User Modes)**：
  - **Guided Mode (引導教學模式)**：含 13 步驟精靈與 ⓘ 生理機制圖解說明，適合初學者學習。
  - **Expert Mode (專家模式)**：快速單頁數據輸入面板，適合重症醫師臨床快速決策。
- **即時高危警訊 (Safety Dashboard)**：自動監測平台壓 (Pplat > 30)、驅動壓 (ΔP > 14)、Auto-PEEP、嚴重酸失衡代償流失與休克風險，優先顯示紅燈床邊檢視警訊。
- **呼吸器模式多維比較 (Mode Comparison Matrix)**：提供 2–3 種模式在控制變數、潮氣量預測性與不同步風險之橫向比對。
- **10 大臨床互動教學案例 (10 Interactive Clinical Cases)**：包含 Severe ARDS、COPD Auto-PEEP、Asthma、DKA 代償酸中毒、SBT 脫機準備等臨床教學個案。
- **示範病例、考題與心智圖**：6 個完整推演病例、20 題考題（含高階）與判讀到處置的心智圖。
- **推演鏈透明追溯 (Rule Traceability Chain)**：點擊即可查看「病人數據 → 偵測生理 → 臨床目標 → 建議模式」推演歷程。

---

## 🚀 快速開始 (Quick Start)

本系統為全功能單頁網頁應用程式 (Single-Page Web App)，無須安裝任何伺服器或後端資料庫：

1. **線上存取**：直接透過本 GitHub Pages 網址開啟使用。
2. **本機開啟**：下載 `index.html` 檔案後，直接於任何瀏覽器（Chrome, Safari, Edge）中雙擊開啟即可使用。

---

## 🔧 v2.0 更新（2026-10-25 除錯與優化）

- **決策引擎重寫**：原本只依自發驅動二選一；現在整合氣道類型、ARDS 嚴重度（2024 Global Definition）、阻塞性生理／Auto-PEEP、代謝性酸中毒、休克、NIV 禁忌、SBT 條件、ECMO、TBI 等，產出首選／替代／較不適用模式。
- **建議參數依表型動態產生**：ARDS 依 ARDSNet PEEP/FiO₂ 表（中重度用 Higher PEEP 表）、COPD/氣喘低 RR 與 I:E、酸中毒高 RR + Winter's 公式；修正舊版對所有病人固定顯示 RR 20–24、PEEP 10–12 的問題。
- **Safety Dashboard 與警訊改用實際輸入**（舊版 Pplat 28、Auto-PEEP 0 為寫死數值），並新增阻力、過度充氣、數據一致性檢查。
- 新增 V<sub>T</sub> 輸入；Auto-PEEP、自發 RR、MAP、I:E、S/F 自動計算；ABG 判讀加入代償與 Henderson–Hasselbalch 一致性檢查。
- 推演鏈、Explain Mode、品牌對照（標示所選品牌）依實際結果產生；10 個教學案例各有專屬解析，並可一鍵載入評估。
- 修正：LaTeX 原始碼直接顯示、推演鏈中 `\rightarrow` 變成亂碼、不存在的圖示與 Tailwind class、Step 1 顯示「上一步」、重置只清 3 欄。
- Expert Mode 改為單頁顯示所有欄位並與快速面板雙向同步；手機版導覽列；結果頁可複製摘要與列印。
- 測試：`node tests.cjs`（99 項，含 10 個教學案例的引擎結果檢查）。

## 🔧 v2.1 更新（2026-11-01 教學內容）

- **示範病例 6 例**（`#cases`）：HFNC 何時該放手、COPD 從 NIV 到插管、肥胖 ARDS 的平台壓、顱腦損傷遇上 ARDS、PSV 中的無效觸發、急性肺心症到 VV-ECMO。每個階段的指標與模式都由引擎算出，可一鍵載入評估工具。
- **考題 20 題**（`#quiz`）：基礎 10 題、高階 10 題（含 ΔP<sub>occ</sub>、P0.1、跨肺壓、Reverse triggering、呼氣時間計算等），附解析與依據，不儲存作答紀錄。
- **心智圖**（`#map`）：左為評估與判讀，右為模式與處置，可展開收合；手機為單欄。
- 內容在 `index.html` 的 `/*DEMO-START*/`、`/*QUIZ-START*/`、`/*MAP-START*/` 區塊。測試：`node tests.cjs`。

## ⚠️ 臨床安全與免責聲明 (Clinical Disclaimer)

本工具僅供臨床教學與決策輔助 (Decision Support & Education Tool)，非獨立自主治療系統。任何建議均不可取代 ICU 專科醫師、胸腔科醫師或呼吸治療師 (RT) 之即時床邊臨床評估與判斷。
