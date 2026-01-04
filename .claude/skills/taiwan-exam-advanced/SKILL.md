---
name: taiwan-exam-advanced
description: 臺灣學測專家級技能，涵蓋國文、社會、價值觀三大領域。採用三層漸進式知識架構：導航→概覽→主題→細節，僅載入必要知識。使用智慧標籤系統和 ripgrep 快速檢索，提供結構化高品質答案。
allowed-tools: "Read, Grep, Bash"
version: 2.0.0
---

# 臺灣學測進階技能 🎓

## 🎯 核心理念

**漸進式揭露**：如同圖書館導覽系統
1. **導航層**（此檔案）- 告訴你書在哪一區
2. **概覽層**（layer1_overview/）- 每區的樓層指南
3. **主題層**（layer2_topics/）- 書架上的分類標籤
4. **細節層**（layer3_details/）- 翻開書本閱讀

> 只載入必要的知識，如同只取下需要的那本書

## 📚 快速開始

### 第一步：題目分類

使用 `scripts/smart_loader.py` 自動判斷：
- **國文**：關鍵字 → 詩詞、文言文、修辭
- **社會**：關鍵字 → 歷史事件、地理特徵、公民概念
- **價值觀**：關鍵字 → 文化、社會議題、本土認同

### 第二步：載入概覽

```bash
# 範例：國文題目
python scripts/smart_loader.py --topic "唐詩" --load-overview
# 輸出：載入 layer1_overview/chinese_overview.md
```

### 第三步：精確檢索

```bash
# 使用 ripgrep 快速定位
python scripts/ripgrep_wrapper.py --query "李白" --context 3
# 輸出：layer2_topics/chinese/classical/tangshi.md 第45-52行
```

## 🏗️ 知識架構

### 國文領域

詳見 [國文概覽](layer1_overview/chinese_overview.md)

主題分類：
- 古典文學：[詩經](layer2_topics/chinese/classical/shijing.md)、[楚辭](layer2_topics/chinese/classical/chuci.md)、[唐詩](layer2_topics/chinese/classical/tangshi.md)
- 現代文學：[白話文學](layer2_topics/chinese/modern/vernacular.md)、[臺灣文學](layer2_topics/chinese/modern/taiwan_lit.md)
- 修辭手法：[比喻](layer2_topics/chinese/rhetoric/metaphor.md)、[擬人](layer2_topics/chinese/rhetoric/personification.md)

### 社會領域

詳見 [社會概覽](layer1_overview/social_overview.md)

主題分類：
- 歷史：[原住民史](layer2_topics/social/history/indigenous.md)、[殖民時期](layer2_topics/social/history/colonial.md)、[民主化](layer2_topics/social/history/democratic.md)
- 地理：[地形地貌](layer2_topics/social/geography/topography.md)、[產業分布](layer2_topics/social/geography/industry.md)
- 公民：[憲法](layer2_topics/social/civics/constitution.md)、[基本權利](layer2_topics/social/civics/rights.md)

### 臺灣價值觀

詳見 [價值觀概覽](layer1_overview/values_overview.md)

主題分類：
- 文化：[多元文化](layer2_topics/values/culture/multiculturalism.md)、[原住民權益](layer2_topics/values/culture/indigenous_rights.md)
- 社會：[性別平等](layer2_topics/values/society/gender_equality.md)、[環境正義](layer2_topics/values/society/environmental.md)
- 歷史：[二二八](layer2_topics/values/history/228.md)、[轉型正義](layer2_topics/values/history/transitional_justice.md)

## 🔍 智慧檢索

### 標籤系統

使用 `meta/topic_index.json` 快速定位：

```json
{
  "李白": {
    "category": "chinese/classical",
    "files": ["tangshi.md"],
    "tags": ["詩人", "唐代", "浪漫主義"],
    "related": ["杜甫", "王維"]
  },
  "二二八": {
    "category": "values/history",
    "files": ["228.md", "transitional_justice.md"],
    "tags": ["歷史事件", "轉型正義", "人權"],
    "related": ["白色恐怖", "戒嚴"]
  }
}
```

### 漸進載入規則

詳見 [載入規則](meta/loading_rules.md)

## 🎓 高品質答案原則

1. **結構化輸出**
   - 背景說明
   - 關鍵概念
   - 答案推理
   - 相關延伸

2. **證據引用**
   - 標註知識來源：`[文件名:行號]`
   - 引用原文段落

3. **分級回答**
   - 基礎：核心答案
   - 進階：脈絡分析
   - 深度：跨領域連結

## 📊 效能監控

使用 `scripts/answer_validator.py` 驗證：
- 答案準確性
- 知識覆蓋率
- 載入效率

## 🔗 知識圖譜

使用 `scripts/knowledge_graph.py` 建立主題連結：
- 跨科目關聯
- 歷史時間軸
- 因果關係網

## 💡 使用範例

### 範例一：國文題目

**題目**：「春眠不覺曉，處處聞啼鳥」運用了什麼修辭？

**處理流程**：
1. 辨識：古典詩詞 → 載入 `chinese_overview.md`
2. 關鍵字：修辭 → 載入 `rhetoric/_index.md`
3. 精確匹配：聽覺意象 → 載入 `rhetoric/imagery.md`
4. 生成答案 + 引用來源

**答案結構**：
```
【修辭手法】摹寫（聽覺摹寫）
【說明】「聞啼鳥」通過聽覺描寫春天的聲音
【來源】layer2_topics/chinese/rhetoric/imagery.md:23-27
【延伸】孟浩然的詩歌常用自然意象營造氛圍
```

### 範例二：社會題目

**題目**：臺灣在哪個時期開始推動土地改革？

**處理流程**：
1. 辨識：歷史事件 → 載入 `social_overview.md`
2. 時間軸查詢：`history/timeline.json`
3. 定位時期：戰後初期 → 載入 `history/democratic.md`
4. 提取答案：1949-1953年

**答案結構**：
```
【時期】1949-1953年（戰後初期）
【三大政策】
  1. 三七五減租（1949）
  2. 公地放領（1951）
  3. 耕者有其田（1953）
【影響】奠定臺灣經濟發展基礎，消解農村階級矛盾
【來源】layer2_topics/social/history/democratic.md:112-135
```

### 範例三：價值觀題目

**題目**：臺灣如何實踐轉型正義？

**處理流程**：
1. 辨識：臺灣價值觀 → 載入 `values_overview.md`
2. 主題定位：歷史正義 → 載入 `values/history/_index.md`
3. 深度檢索：`transitional_justice.md` + `228.md` + `white_terror.md`
4. 整合答案

**答案結構**：
```
【定義】面對威權統治歷史的真相、責任與和解

【具體作為】
1. 成立促進轉型正義委員會（2018）
2. 政治檔案公開與平復司法不法
3. 賠償與恢復名譽
4. 真相調查與歷史記憶保存

【重要事件】
- 二二八事件（1947）→ 國家道歉（2016）
- 白色恐怖時期（1949-1987）→ 平反與補償

【來源】
- layer2_topics/values/history/transitional_justice.md
- layer2_topics/values/history/228.md
- layer2_topics/values/history/white_terror.md

【延伸】民主深化與人權保障的持續工程
```

## 📖 進階功能

- [自訂標籤](meta/taxonomy.json) - 擴充知識分類
- [批次處理](scripts/batch_exam.py) - 處理多題測驗
- [錯誤回饋](scripts/error_feedback.py) - 持續優化

## 🔄 遞迴進化

此技能設計理念源自 **AI 設計下代晶片** 的自我改進循環：

```
答題實驗
    ↓
效能分析
    ↓
知識庫優化 / 標籤系統更新
    ↓
下一代技能 ← 遞迴進化
```

每次使用後，透過 `scripts/error_feedback.py` 記錄錯誤模式，自動更新：
- 標籤權重
- 檢索策略
- 知識連結

## 🎯 設計哲學

> 不追求完美精度，而是追求**最佳效能/資源比**，並透過**自我改進循環**持續進化。

這正是「矽基心臟」的精神延續——啟發自 Ricursive Intelligence 和 Geoffrey Hinton 的低精度推理理論。
