# 🔄 遞迴進化：從 TPU 低精度設計到 Agentic AI 學測系統

> **核心啟發**：如同 AI 設計下代晶片的自我加速循環，我們可以建構「AI 優化 AI」的學習系統

---

## 📚 Claude Code 核心概念研究

### 1. Claude Code Skills（技能）

**定義**：Skills 是包含指令、腳本和資源的資料夾，Claude 會在相關任務時自動載入。

**關鍵特性**：
- **非執行程式碼**：Skills 是專業化的提示詞模板，注入特定領域指令
- **自動觸發**：Claude 根據你的請求自動應用，無需手動輸入指令
- **漸進式揭露**：像手冊一樣按需載入，從目錄到章節再到附錄

**運作方式**：
```
Skills = 指令 + 腳本 + 資源
         ↓
    Claude 動態載入
         ↓
    專業化 Agent 輸出
```

**來源**：
- [Agent Skills - Claude Code Docs](https://code.claude.com/docs/en/skills)
- [Anthropic Engineering Blog](https://www.anthropic.com/engineering/equipping-agents-for-the-real-world-with-agent-skills)
- [Simon Willison's Blog](https://simonwillison.net/2025/Oct/16/claude-skills/)

---

### 2. Claude Code Skills and Scripts（技能與腳本）

**結構**：
```
skill-folder/
├── SKILL.md          # YAML frontmatter + 指令
├── scripts/
│   ├── helper.py     # Python 腳本
│   └── process.sh    # Bash 腳本
└── templates/
    └── output.md
```

**腳本用途**：
- 確定性操作（排序、計算）比 token 生成更高效
- PDF 解析、資料處理等重型計算
- 需要精確可靠性的應用

**最佳實踐**：
- 腳本需要執行權限：`chmod +x scripts/*.py`
- 使用 Unix 風格路徑
- 監控 Claude 使用技能的情況並迭代優化

**來源**：
- [GitHub - anthropics/skills](https://github.com/anthropics/skills)
- [DataCamp Tutorial](https://www.datacamp.com/tutorial/claude-skills)
- [Mikhail Shilkov's Deep Dive](https://mikhail.io/2025/10/claude-code-skills/)

---

### 3. Claude Code Subagent（子代理）

**定義**：具有獨立上下文窗口、自定義系統提示和特定工具權限的專業化助手。

**核心架構**：
```yaml
# ~/.claude/agents/exam-agent.yaml
name: exam-solver
description: 專門處理學測題目
tools: [read, grep, web_search]
model: haiku  # 快速且成本低
permissionMode: auto
skills: [taiwan-exam, chinese-literature]
```

**關鍵優勢**：
| 特性 | 說明 |
|------|------|
| 上下文隔離 | 防止任務間交叉污染 |
| 並行處理 | 最多 10 個同時運行 |
| 可恢復性 | 保存完整對話歷史 |
| 專業化 | 每個 Agent 專注特定領域 |

**多 Agent 模式**：
```
主 Agent (Orchestrator)
    ├── 國文 Agent → 文言文解析
    ├── 社會 Agent → 歷史地理公民
    └── 價值觀 Agent → 台灣本土議題
```

**來源**：
- [Subagents - Claude Code Docs](https://code.claude.com/docs/en/sub-agents)
- [Claude Agent SDK](https://www.anthropic.com/engineering/building-agents-with-the-claude-agent-sdk)
- [Cursor IDE Blog](https://www.cursor-ide.com/blog/claude-code-subagents)

---

## 🎯 五大高效實戰替代方案

> **設計原則**：啟發自「AI 設計下代晶片」的遞迴自我改進循環

### 方案一：Ripgrep-RAG 混合檢索系統

**概念**：結合 `rg -C`（上下文搜尋）與語義檢索，實現精確 + 理解雙模式

```bash
# 精確檢索：找到「詩經」相關段落
rg -C 3 "詩經" ./knowledge-base/chinese/

# 語義檢索：理解題目意圖
# → LangGraph 路由決定使用哪種模式
```

**架構**：
```
題目輸入
    ↓
┌─────────────────────────────────────┐
│  LangGraph Router                   │
│  ├─ 精確匹配 → rg -C 檢索           │
│  └─ 語義理解 → Embedding 檢索       │
└─────────────────────────────────────┘
    ↓
小模型生成答案 (Phi-3 / Gemma-2B)
    ↓
答案校驗 Agent → 自我修正循環
```

**評分**：
| 維度 | 分數 | 說明 |
|------|------|------|
| 效能 | 9/10 | ripgrep 極速 + 小模型推理 |
| 資源 | 9/10 | 無需大型 embedding 模型 |
| 精準 | 8/10 | 精確匹配彌補語義不足 |
| **總分** | **8.7/10** | |

**遞迴進化點**：每次答題後，將錯誤案例回饋至知識庫標註，下次檢索更精準

---

### 方案二：Agentic Corrective RAG + SLM

**概念**：自我修正的 RAG 系統，檢索失敗時自動重新查詢

```python
# LangGraph 工作流程
from langgraph.graph import StateGraph

workflow = StateGraph(ExamState)
workflow.add_node("retrieve", retrieve_docs)
workflow.add_node("grade", grade_relevance)      # 文檔評分
workflow.add_node("rewrite", rewrite_query)      # 重寫查詢
workflow.add_node("generate", generate_answer)
workflow.add_node("validate", self_validate)     # 自我驗證

# 條件路由
workflow.add_conditional_edges(
    "grade",
    decide_to_rewrite,
    {"rewrite": "rewrite", "generate": "generate"}
)
```

**三科目專業化**：
- **國文**：文言文詞彙庫 + 修辭手法模板
- **社會**：歷史時間軸 + 地理關聯圖
- **台灣價值觀**：本土文化事件資料庫

**評分**：
| 維度 | 分數 | 說明 |
|------|------|------|
| 效能 | 7/10 | 需要多輪迭代 |
| 資源 | 8/10 | SLM 可本地運行 |
| 精準 | 9/10 | 自我修正提升準確率 |
| **總分** | **8.0/10** | |

**遞迴進化點**：記錄重寫模式，訓練專門的 Query Rewriter 模型

---

### 方案三：Multi-Agent 專科分工系統

**概念**：如同晶片設計的分層架構，每個專科由專門 Agent 處理

```
                    ┌─────────────┐
                    │ Orchestrator │
                    │   (Haiku)    │
                    └──────┬──────┘
           ┌───────────────┼───────────────┐
           ▼               ▼               ▼
    ┌──────────┐    ┌──────────┐    ┌──────────┐
    │ 國文Agent │    │ 社會Agent │    │ 價值Agent │
    │  (SLM)   │    │  (SLM)   │    │  (SLM)   │
    └────┬─────┘    └────┬─────┘    └────┬─────┘
         │               │               │
    ┌────▼─────┐    ┌────▼─────┐    ┌────▼─────┘
    │ 知識庫A  │    │ 知識庫B  │    │ 知識庫C  │
    └──────────┘    └──────────┘    └──────────┘
```

**Claude Code 實作**：
```yaml
# .claude/agents/chinese-expert.yaml
name: chinese-literature-expert
description: 專精高中國文學測
model: haiku
skills:
  - classical-chinese
  - poetry-analysis
  - rhetoric-patterns
```

**評分**：
| 維度 | 分數 | 說明 |
|------|------|------|
| 效能 | 8/10 | 並行處理加速 |
| 資源 | 7/10 | 多 Agent 開銷 |
| 精準 | 9/10 | 專科深度強 |
| **總分** | **8.0/10** | |

**遞迴進化點**：表現優異的 Agent 配置自動複製到其他專科

---

### 方案四：低精度推理 + 知識蒸餾

**概念**：直接應用 TPU 設計哲學——用低精度換取高效能

```
完整流程：
1. 教師模型 (GPT-4) 解題 → 生成推理鏈
2. 知識蒸餾 → 學生模型 (Phi-3-mini INT4)
3. 量化推理 → 4-bit 精度運行
4. 結果驗證 → 高置信度直接輸出，低置信度回退教師
```

**量化策略**（對應辛頓理論）：
| 精度 | 適用場景 | 準確率影響 |
|------|----------|------------|
| FP16 | 複雜推理題 | -0.5% |
| INT8 | 選擇題 | -1% |
| INT4 | 簡單記憶題 | -2% |

**評分**：
| 維度 | 分數 | 說明 |
|------|------|------|
| 效能 | 10/10 | INT4 極速推理 |
| 資源 | 10/10 | 記憶體佔用降 75% |
| 精準 | 7/10 | 低精度有損失 |
| **總分** | **9.0/10** | |

**遞迴進化點**：根據題目難度動態調整精度，形成自適應量化策略

---

### 方案五：Skill-Driven 自我進化系統

**概念**：完全利用 Claude Code Skills 生態，實現「技能設計技能」循環

```
初始 Skills 集合
       ↓
  答題實驗
       ↓
  效能分析
       ↓
自動生成新 Skill
       ↓
  合併優化
       ↓
下一代 Skills ← (遞迴)
```

**實作結構**：
```
.claude/skills/
├── taiwan-exam/
│   ├── SKILL.md
│   ├── scripts/
│   │   ├── extract_keywords.py    # rg 包裝
│   │   ├── analyze_rhetoric.py    # 修辭分析
│   │   └── grade_answer.py        # 答案評分
│   └── knowledge/
│       ├── classical_chinese.json
│       ├── taiwan_history.json
│       └── social_values.json
└── skill-generator/                # Meta-skill!
    ├── SKILL.md
    └── scripts/
        └── create_skill.py         # 自動生成新技能
```

**評分**：
| 維度 | 分數 | 說明 |
|------|------|------|
| 效能 | 8/10 | Skill 載入有開銷 |
| 資源 | 8/10 | 按需載入節省資源 |
| 精準 | 9/10 | 專業技能高準確 |
| **總分** | **8.3/10** | |

**遞迴進化點**：最強力的方案——技能自動產生更好的技能

---

## 📊 方案總評比較

| 方案 | 效能 | 資源 | 精準 | 總分 | 最適場景 |
|------|------|------|------|------|----------|
| 1. Ripgrep-RAG | 9 | 9 | 8 | **8.7** | 精確知識檢索 |
| 2. Corrective RAG | 7 | 8 | 9 | **8.0** | 複雜推理題 |
| 3. Multi-Agent | 8 | 7 | 9 | **8.0** | 跨科目整合 |
| 4. 低精度推理 | 10 | 10 | 7 | **9.0** | 大量快速處理 |
| 5. Skill 進化 | 8 | 8 | 9 | **8.3** | 長期持續優化 |

---

## 🔁 遞迴進化的核心哲學

如同 Ricursive Intelligence 的願景：

> *「我們正在用 AI 加速 AI，創造一個反饋循環：我們的模型設計下一代 AI 晶片，而這些晶片又能實現更強大的 AI 模型。」*
> — Dr. Azalia Mirhoseini, Ricursive Intelligence 共同創辦人

**應用到學測系統**：

```
學測答題系統 v1
       ↓
   答題結果分析
       ↓
   錯誤模式識別
       ↓
自動優化檢索策略 / 生成新 Skills / 調整模型精度
       ↓
學測答題系統 v2 ← 遞迴進化
```

**這正是「矽基心臟」的精神延續**——不追求完美精度，而是追求**最佳效能/資源比**，並透過**自我改進循環**持續進化。

---

## 🔗 參考資料

### Claude Code 相關
- [Agent Skills - Claude Code Docs](https://code.claude.com/docs/en/skills)
- [Subagents - Claude Code Docs](https://code.claude.com/docs/en/sub-agents)
- [Anthropic Engineering: Agent Skills](https://www.anthropic.com/engineering/equipping-agents-for-the-real-world-with-agent-skills)
- [Claude Agent SDK](https://www.anthropic.com/engineering/building-agents-with-the-claude-agent-sdk)
- [GitHub - anthropics/skills](https://github.com/anthropics/skills)

### Agentic RAG 與 SLM
- [IBM: What is Agentic RAG?](https://www.ibm.com/think/topics/agentic-rag)
- [LangGraph Agentic RAG Tutorial](https://docs.langchain.com/oss/python/langgraph/agentic-rag)
- [Analytics Vidhya: SLMs for Agentic AI](https://www.analyticsvidhya.com/blog/2025/08/slms-for-agentic-ai/)
- [arXiv: Agentic RAG Survey](https://arxiv.org/abs/2501.09136)

### 遞迴自我改進與晶片設計
- [Ricursive Intelligence](https://www.ricursive.com/)
- [Deyvos Labs: AI-Chip Acceleration Loop](https://blog.deyvos.com/posts/the-ai-chip-acceleration-loop-how-self-improving-design-could-transform-tech/)
- [PRNewswire: Ricursive Intelligence Launch](https://www.prnewswire.com/news-releases/ricursive-intelligence-launches-frontier-ai-lab-to-transform-semiconductor-design-and-accelerate-path-toward-artificial-superintelligence-302630776.html)

### 檢索技術
- [GitHub - BurntSushi/ripgrep](https://github.com/BurntSushi/ripgrep)
- [RAG Retrieval Beyond Semantic Search](https://medium.com/@vanshkharidia7/rag-retrieval-beyond-semantic-search-day-1-grep-599cec898a68)
- [Why Coding Agents Should Use Ripgrep](https://www.codeant.ai/blogs/why-coding-agents-should-use-ripgrep)
