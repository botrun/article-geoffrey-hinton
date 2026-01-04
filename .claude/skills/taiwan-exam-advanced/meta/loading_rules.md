# 漸進式載入規則

## 核心原則：按需載入，最小化 Token 消耗

> 如同圖書館借書，只取下需要的那本，而非搬走整個書架

## 三層載入架構

```
第一層：導航層 (~200 tokens)
├─ SKILL.md（主檔案）
├─ meta/topic_index.json（索引）
└─ meta/taxonomy.json（分類樹）

      ↓ 僅當題目分類成功時載入

第二層：概覽層 (~2K tokens)
├─ layer1_overview/chinese_overview.md
├─ layer1_overview/social_overview.md
└─ layer1_overview/values_overview.md

      ↓ 僅當需要特定主題時載入

第三層：主題層 (~5K tokens/主題)
├─ layer2_topics/{category}/{topic}.md
└─ 相關 _index.md

      ↓ 僅當需要深度分析時載入

第四層：細節層 (~10K tokens/檔案)
├─ layer3_details/case_studies/
├─ layer3_details/exam_questions/
└─ layer3_details/expert_analysis/
```

## 載入決策樹

### 1. 題目分類階段

**輸入**：使用者提問
**處理**：關鍵字匹配（meta/taxonomy.json 的 keyword_patterns）
**輸出**：分類結果（chinese / social / values）

```python
# 範例邏輯
if any(keyword in question for keyword in ["詩", "詞", "文言", "修辭"]):
    category = "chinese"
    load("layer1_overview/chinese_overview.md")
elif any(keyword in question for keyword in ["歷史", "地理", "公民", "憲法"]):
    category = "social"
    load("layer1_overview/social_overview.md")
elif any(keyword in question for keyword in ["文化", "價值", "正義", "認同"]):
    category = "values"
    load("layer1_overview/values_overview.md")
```

**Token 消耗**：~2,000 tokens（僅載入一個概覽檔案）

---

### 2. 主題定位階段

**輸入**：分類結果 + 題目關鍵字
**處理**：查詢 topic_index.json，定位相關主題
**輸出**：主題檔案路徑列表

```python
# 範例邏輯
topic_index = load_json("meta/topic_index.json")

if "李白" in question:
    topic_data = topic_index["李白"]
    # {
    #   "category": "chinese/classical",
    #   "files": ["tangshi.md"],
    #   "related": ["杜甫", "王維"]
    # }
    load("layer2_topics/chinese/classical/tangshi.md")
```

**Token 消耗**：~5,000 tokens（僅載入相關主題檔案）

---

### 3. 精確檢索階段

**輸入**：主題檔案 + 精確關鍵字
**處理**：使用 ripgrep -C 3 取得上下文
**輸出**：相關段落（而非整個檔案）

```bash
# 使用 ripgrep 只提取相關段落
rg -C 3 "李白" layer2_topics/chinese/classical/tangshi.md

# 輸出範例：
# 42:### 李白（701-762）
# 43:
# 44:**字**：太白，**號**：青蓮居士，世稱「詩仙」
# 45:
# 46:**風格**：浪漫主義，想像奔放，語言清新
```

**Token 消耗**：~1,000 tokens（僅載入相關段落）

---

## 載入策略範例

### 範例一：國文選擇題

**題目**：下列何者為李白的作品？(A) 將進酒 (B) 春望 (C) 琵琶行 (D) 長恨歌

**載入流程**：
```
1. 分類階段
   - 關鍵字：「李白」
   - 分類：chinese
   - 載入：chinese_overview.md (~2K tokens)

2. 主題定位
   - 查詢 topic_index.json
   - 定位：chinese/classical/tangshi.md
   - 載入：tangshi.md (~5K tokens)

3. 精確檢索
   - rg "將進酒|春望|琵琶行|長恨歌" tangshi.md
   - 提取：相關段落 (~500 tokens)

總消耗：~7.5K tokens（而非載入所有知識庫的 ~100K tokens）
```

---

### 範例二：社會問答題

**題目**：請說明臺灣土地改革對經濟發展的影響

**載入流程**：
```
1. 分類階段
   - 關鍵字：「土地改革」、「經濟發展」
   - 分類：social/history
   - 載入：social_overview.md (~2K tokens)

2. 主題定位
   - 查詢 topic_index.json → "戰後臺灣"
   - 載入：history/democratic.md (~6K tokens)

3. 精確檢索
   - rg -C 5 "土地改革" history/democratic.md
   - 提取：三七五減租、公地放領、耕者有其田 (~2K tokens)

4. 延伸載入（可選）
   - 如需深度分析，載入 layer3_details/case_studies/land_reform.md

總消耗：~10K tokens（基礎答案）或 ~20K tokens（深度分析）
```

---

### 範例三：價值觀申論題

**題目**：臺灣如何實踐轉型正義？請舉例說明

**載入流程**：
```
1. 分類階段
   - 關鍵字：「轉型正義」
   - 分類：values/history
   - 載入：values_overview.md (~2K tokens)

2. 主題定位
   - 查詢 topic_index.json → "轉型正義"
   - 相關檔案：transitional_justice.md, 228.md, white_terror.md
   - 載入：values/history/_index.md (~1K tokens)

3. 多檔案檢索
   - rg -C 3 "促轉會|真相|賠償" values/history/*.md
   - 提取：關鍵段落 (~3K tokens)

4. 知識圖譜連結
   - 使用 knowledge_graph.py 連結相關事件
   - 載入：二二八事件 → 白色恐怖 → 解嚴 → 民主化

總消耗：~8K tokens（基礎答案）
```

---

## 效能對比

| 載入方式 | Token 消耗 | 回應時間 | 適用場景 |
|---------|-----------|---------|----------|
| 全部載入 | ~100K | 長 | ❌ 不推薦 |
| 載入整個分類 | ~50K | 中長 | ⚠️ 簡單題目 |
| 漸進式載入 | ~8K | 短 | ✅ 大部分題目 |
| 精準檢索 | ~3K | 極短 | ✅ 簡單查詢 |

---

## 載入優先級規則

### 高優先級（總是載入）
- SKILL.md（主檔案）
- meta/topic_index.json（索引）
- 相關的概覽檔案（chinese_overview.md 等）

### 中優先級（條件載入）
- 主題檔案（layer2_topics/）
- 主題索引（_index.md）

### 低優先級（僅在需要時載入）
- 細節檔案（layer3_details/）
- 案例研究
- 歷屆試題

---

## 快取策略

### Session 級快取
- 已載入的概覽檔案在對話期間保持在上下文中
- 避免重複載入相同主題

### 關聯預載入
- 如果載入「李白」，預載入 related: ["杜甫", "王維"] 的索引項
- 如果載入「二二八」，預載入 related: ["白色恐怖", "戒嚴"] 的索引項

---

## 載入失敗處理

### 1. 找不到主題
```python
if topic not in topic_index:
    # 降級策略：載入整個分類的 _index.md
    load(f"layer2_topics/{category}/_index.md")

    # 使用 ripgrep 全文搜尋
    rg -i query layer2_topics/{category}/
```

### 2. 關鍵字模糊
```python
if confidence < 0.7:
    # 載入多個相關主題
    for related_topic in topic_index[topic]["related"]:
        load_preview(related_topic)  # 只載入前 10 行
```

### 3. 跨領域題目
```python
if is_cross_domain(question):
    # 載入多個分類的概覽
    load("chinese_overview.md")
    load("social_overview.md")
    # 使用知識圖譜連結
    connect_topics(["文學", "歷史", "文化"])
```

---

## 自我優化機制

### 載入效能監控
```python
# 記錄每次載入的效能
{
  "question_type": "李白詩歌",
  "files_loaded": ["chinese_overview.md", "tangshi.md"],
  "tokens_consumed": 7500,
  "answer_quality": "correct",
  "timestamp": "2026-01-04"
}
```

### 自動優化建議
- 如果某個主題經常被載入，提升其優先級
- 如果某些關鍵字經常誤判，更新 keyword_patterns
- 如果某些主題經常一起出現，建立新的知識連結

---

## 實作檢查清單

- [ ] 使用 `scripts/smart_loader.py` 自動分類
- [ ] 查詢 `meta/topic_index.json` 定位主題
- [ ] 使用 `scripts/ripgrep_wrapper.py` 精確檢索
- [ ] 僅載入必要的檔案和段落
- [ ] 引用來源時標註 `[檔案名:行號]`
- [ ] 記錄載入效能供日後優化

---

## 總結

> **最小必要原則**：只載入回答問題所需的最小知識集合

這種漸進式載入設計：
1. **節省 Token**：從 100K 降至 8K（節省 92%）
2. **提升速度**：減少載入時間
3. **保持精準**：聚焦相關知識，減少噪音
4. **可擴充**：新增知識不影響載入效能

這正是 **AI 設計 AI** 的自我優化精神——透過效能監控持續改進載入策略。
