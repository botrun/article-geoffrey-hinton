#!/usr/bin/env python3
"""
智慧知識載入器 - 三層漸進式載入系統

功能：
1. 題目分類（國文/社會/價值觀）
2. 主題定位（使用 topic_index.json）
3. 精確檢索（使用 ripgrep）
4. 效能監控與優化建議

使用範例：
    python smart_loader.py --question "李白的詩歌風格為何？"
    python smart_loader.py --topic "二二八" --load-details
"""

import json
import subprocess
import sys
from pathlib import Path
from typing import Dict, List, Optional
from datetime import datetime


class SmartLoader:
    """智慧知識載入器"""

    def __init__(self, skill_dir: Optional[str] = None):
        if skill_dir is None:
            # 預設路徑：.claude/skills/taiwan-exam-advanced
            self.skill_dir = Path(__file__).parent.parent
        else:
            self.skill_dir = Path(skill_dir)

        self.topic_index = self._load_json("meta/topic_index.json")
        self.taxonomy = self._load_json("meta/taxonomy.json")
        self.loaded_files = []  # 記錄已載入檔案
        self.token_count = 0  # 估算 Token 消耗

    def _load_json(self, relative_path: str) -> Dict:
        """載入 JSON 檔案"""
        file_path = self.skill_dir / relative_path
        try:
            with open(file_path, "r", encoding="utf-8") as f:
                return json.load(f)
        except FileNotFoundError:
            print(f"警告：找不到檔案 {file_path}", file=sys.stderr)
            return {}

    def classify_question(self, question: str) -> Dict:
        """
        分類題目並返回載入路徑

        Returns:
            {
                "category": "chinese" | "social" | "values",
                "overview_file": "layer1_overview/chinese_overview.md",
                "confidence": 0.0-1.0,
                "matched_keywords": ["詩", "詞"]
            }
        """
        keyword_patterns = self.taxonomy.get("keyword_patterns", {})

        results = {}
        for category, keywords in keyword_patterns.items():
            matches = [kw for kw in keywords if kw in question]
            if matches:
                results[category] = {
                    "matches": matches,
                    "count": len(matches),
                }

        if not results:
            return {
                "category": "unknown",
                "overview_file": None,
                "confidence": 0.0,
                "matched_keywords": [],
            }

        # 判斷最可能的分類
        if "古典文學指標詞" in results or "現代文學指標詞" in results or "修辭指標詞" in results:
            category = "chinese"
        elif "歷史指標詞" in results or "地理指標詞" in results or "公民指標詞" in results:
            category = "social"
        elif "價值觀指標詞" in results:
            category = "values"
        else:
            # 選擇匹配數量最多的
            category_key = max(results, key=lambda k: results[k]["count"])
            category = category_key.split("指標詞")[0]
            # 處理中文對應
            category_mapping = {
                "古典文學": "chinese",
                "現代文學": "chinese",
                "修辭": "chinese",
                "歷史": "social",
                "地理": "social",
                "公民": "social",
                "價值觀": "values",
            }
            category = category_mapping.get(category, "chinese")

        all_matches = []
        for result in results.values():
            all_matches.extend(result["matches"])

        confidence = min(len(all_matches) / 3, 1.0)  # 匹配 3 個以上關鍵字視為高信心

        return {
            "category": category,
            "overview_file": f"layer1_overview/{category}_overview.md",
            "confidence": confidence,
            "matched_keywords": all_matches,
        }

    def find_topics(self, query: str) -> List[Dict]:
        """
        在 topic_index.json 中搜尋相關主題

        Returns:
            [
                {
                    "topic": "李白",
                    "category": "chinese/classical",
                    "files": ["tangshi.md"],
                    "relevance": 1.0
                }
            ]
        """
        results = []

        for topic, data in self.topic_index.items():
            # 直接匹配主題名稱
            if topic in query:
                results.append(
                    {
                        "topic": topic,
                        "category": data["category"],
                        "files": data["files"],
                        "tags": data.get("tags", []),
                        "related": data.get("related", []),
                        "relevance": 1.0,
                    }
                )
                continue

            # 匹配關鍵字
            keywords = data.get("keywords", [])
            if any(kw in query for kw in keywords):
                results.append(
                    {
                        "topic": topic,
                        "category": data["category"],
                        "files": data["files"],
                        "tags": data.get("tags", []),
                        "related": data.get("related", []),
                        "relevance": 0.8,
                    }
                )

        # 按相關度排序
        results.sort(key=lambda x: x["relevance"], reverse=True)
        return results

    def search_with_ripgrep(self, query: str, category: str, context_lines: int = 3) -> List[str]:
        """
        使用 ripgrep 在特定分類中搜尋

        Args:
            query: 搜尋關鍵字
            category: 分類 (chinese/social/values)
            context_lines: 上下文行數

        Returns:
            搜尋結果列表
        """
        search_dir = self.skill_dir / f"layer2_topics/{category}"

        if not search_dir.exists():
            return []

        try:
            result = subprocess.run(
                ["rg", "-C", str(context_lines), "-i", "--no-heading", query, str(search_dir)],
                capture_output=True,
                text=True,
                timeout=5,
            )

            if result.returncode == 0:
                return result.stdout.strip().split("\n")
            else:
                return []
        except (subprocess.TimeoutExpired, FileNotFoundError):
            # ripgrep 未安裝或超時
            return []

    def load_file(self, relative_path: str, preview_only: bool = False) -> Optional[str]:
        """
        載入檔案內容

        Args:
            relative_path: 相對於 skill_dir 的路徑
            preview_only: 是否僅載入前 20 行

        Returns:
            檔案內容或 None
        """
        file_path = self.skill_dir / relative_path

        if not file_path.exists():
            return None

        try:
            with open(file_path, "r", encoding="utf-8") as f:
                if preview_only:
                    lines = [f.readline() for _ in range(20)]
                    content = "".join(lines)
                else:
                    content = f.read()

            self.loaded_files.append(relative_path)
            # 估算 Token（粗略：1 token ≈ 4 字元）
            self.token_count += len(content) // 4

            return content
        except Exception as e:
            print(f"載入檔案失敗 {file_path}: {e}", file=sys.stderr)
            return None

    def get_loading_plan(self, question: str) -> Dict:
        """
        根據題目生成載入計畫

        Returns:
            {
                "category": "chinese",
                "overview": "layer1_overview/chinese_overview.md",
                "topics": [
                    {
                        "topic": "李白",
                        "files": ["layer2_topics/chinese/classical/tangshi.md"]
                    }
                ],
                "estimated_tokens": 8000
            }
        """
        # 步驟一：分類
        classification = self.classify_question(question)

        if classification["category"] == "unknown":
            return {
                "category": "unknown",
                "overview": None,
                "topics": [],
                "estimated_tokens": 0,
                "suggestion": "請提供更具體的關鍵字",
            }

        # 步驟二：找主題
        topics = self.find_topics(question)

        # 步驟三：生成載入計畫
        plan = {
            "category": classification["category"],
            "overview": classification["overview_file"],
            "matched_keywords": classification["matched_keywords"],
            "confidence": classification["confidence"],
            "topics": [],
            "estimated_tokens": 2000,  # 概覽檔案基礎 tokens
        }

        for topic_data in topics[:3]:  # 最多載入 3 個主題
            topic_files = [f"layer2_topics/{topic_data['category']}/{f}" for f in topic_data["files"]]

            plan["topics"].append(
                {
                    "topic": topic_data["topic"],
                    "files": topic_files,
                    "tags": topic_data["tags"],
                    "related": topic_data.get("related", []),
                }
            )

            # 每個主題檔案估算 5K tokens
            plan["estimated_tokens"] += 5000 * len(topic_files)

        return plan

    def execute_loading_plan(self, plan: Dict) -> Dict:
        """
        執行載入計畫

        Returns:
            {
                "loaded_files": ["chinese_overview.md", "tangshi.md"],
                "tokens_consumed": 7500,
                "content_preview": {...}
            }
        """
        self.loaded_files = []
        self.token_count = 0

        result = {
            "loaded_files": [],
            "tokens_consumed": 0,
            "content_preview": {},
        }

        # 載入概覽
        if plan["overview"]:
            content = self.load_file(plan["overview"])
            if content:
                result["content_preview"]["overview"] = content[:500]  # 前 500 字元預覽

        # 載入主題檔案
        for topic_data in plan["topics"]:
            for file_path in topic_data["files"]:
                content = self.load_file(file_path)
                if content:
                    result["content_preview"][topic_data["topic"]] = content[:500]

        result["loaded_files"] = self.loaded_files
        result["tokens_consumed"] = self.token_count

        return result

    def log_performance(self, question: str, plan: Dict, result: Dict):
        """記錄效能供日後優化"""
        log_entry = {
            "timestamp": datetime.now().isoformat(),
            "question": question,
            "category": plan["category"],
            "confidence": plan.get("confidence", 0),
            "files_loaded": result["loaded_files"],
            "tokens_consumed": result["tokens_consumed"],
            "estimated_tokens": plan["estimated_tokens"],
        }

        log_file = self.skill_dir / "meta" / "performance_log.jsonl"
        with open(log_file, "a", encoding="utf-8") as f:
            f.write(json.dumps(log_entry, ensure_ascii=False) + "\n")


def main():
    """命令列介面"""
    import argparse

    parser = argparse.ArgumentParser(description="臺灣學測智慧知識載入器")
    parser.add_argument("--question", "-q", type=str, help="題目內容")
    parser.add_argument("--topic", "-t", type=str, help="直接指定主題")
    parser.add_argument("--load-details", action="store_true", help="載入細節檔案")
    parser.add_argument("--preview", action="store_true", help="僅預覽載入計畫")

    args = parser.parse_args()

    loader = SmartLoader()

    if args.question:
        print(f"📝 題目：{args.question}\n")

        # 生成載入計畫
        plan = loader.get_loading_plan(args.question)

        print("📊 載入計畫：")
        print(f"  分類：{plan['category']}")
        print(f"  信心度：{plan.get('confidence', 0):.2f}")
        print(f"  估算 Tokens：{plan['estimated_tokens']}")
        print(f"  主題數量：{len(plan['topics'])}")

        if plan["topics"]:
            print("\n🎯 相關主題：")
            for i, topic in enumerate(plan["topics"], 1):
                print(f"  {i}. {topic['topic']}")
                print(f"     標籤：{', '.join(topic['tags'][:3])}")
                print(f"     檔案：{topic['files'][0].split('/')[-1]}")

        if not args.preview:
            print("\n⏳ 執行載入...")
            result = loader.execute_loading_plan(plan)

            print(f"\n✅ 載入完成")
            print(f"  實際 Tokens：{result['tokens_consumed']}")
            print(f"  已載入檔案：{len(result['loaded_files'])}")

            # 記錄效能
            loader.log_performance(args.question, plan, result)

    elif args.topic:
        topics = loader.find_topics(args.topic)

        if topics:
            print(f"🔍 找到 {len(topics)} 個相關主題：\n")
            for topic in topics:
                print(f"主題：{topic['topic']}")
                print(f"分類：{topic['category']}")
                print(f"標籤：{', '.join(topic['tags'])}")
                print(f"檔案：{', '.join(topic['files'])}")
                print(f"相關：{', '.join(topic.get('related', []))}")
                print()
        else:
            print("❌ 找不到相關主題")

    else:
        parser.print_help()


if __name__ == "__main__":
    main()
