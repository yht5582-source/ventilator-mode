# ventilator-mode# Ventilator Navigator 成人呼吸器模式互動決策與教學助手

> **「從病人生理需求出發，而不是從呼吸器 Mode 名稱出發。」**

Ventilator Navigator 是一個專為 ICU 專科醫師、非重症/胸腔科醫師、專科護理師 (Nurse Practitioner, NP)、呼吸治療師 (RT) 及住院醫師設計的成人重症呼吸器模式互動決策支援與臨床教學系統 (Clinical Decision Support & Education System)。

---

## 🌟 核心特色 (Key Features)

- **生理導向決策引擎 (Physiology-First Decision Engine)**：不單純推薦模式名稱，而是從氧合 (Oxygenation)、通氣 (Ventilation)、肺力學 (Mechanics) 與自主呼吸驅動 (Drive) 出發提供完整推演邏輯。
- **雙重使用模式 (Dual User Modes)**：
  - **Guided Mode (引導教學模式)**：含 13 步驟精靈與 ⓘ 生理機制圖解說明，適合初學者學習。
  - **Expert Mode (專家模式)**：快速單頁數據輸入面板，適合重症醫師臨床快速決策。
- **即時高危警訊 (Safety Dashboard)**：自動監測平台壓 ($P_{plat} > 30$)、驅動壓 ($\Delta P > 14$)、Auto-PEEP、嚴重酸失衡代償流失與休克風險，優先顯示紅燈床邊檢視警訊。
- **呼吸器模式多維比較 (Mode Comparison Matrix)**：提供 2–3 種模式在控制變數、潮氣量預測性與不同步風險之橫向比對。
- **10 大臨床互動教學案例 (10 Interactive Clinical Cases)**：包含 Severe ARDS、COPD Auto-PEEP、Asthma、DKA 代償酸中毒、SBT 脫機準備等臨床教學個案。
- **推演鏈透明追溯 (Rule Traceability Chain)**：點擊即可查看「病人數據 → 偵測生理 → 臨床目標 → 建議模式」推演歷程。

---

## 🚀 快速開始 (Quick Start)

本系統為全功能單頁網頁應用程式 (Single-Page Web App)，無須安裝任何伺服器或後端資料庫：

1. **線上存取**：直接透過本 GitHub Pages 網址開啟使用。
2. **本機開啟**：下載 `index.html` 檔案後，直接於任何瀏覽器（Chrome, Safari, Edge）中雙擊開啟即可使用。

---

## ⚠️ 臨床安全與免責聲明 (Clinical Disclaimer)

本工具僅供臨床教學與決策輔助 (Decision Support & Education Tool)，非獨立自主治療系統。任何建議均不可取代 ICU 專科醫師、胸腔科醫師或呼吸治療師 (RT) 之即時床邊臨床評估與判斷。
