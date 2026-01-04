#!/usr/bin/env python3
"""
Ripgrep 包裝器 - 快速精確檢索工具

功能：
1. 包裝 ripgrep 命令，提供更友善的介面
2. 自動添加上下文行數（-C 參數）
3. 結果格式化與高亮

使用範例：
    python ripgrep_wrapper.py --query "李白" --context 3
    python ripgrep_wrapper.py --query "二二八" --category values/history
"""

import subprocess
import sys
from pathlib import Path
from typing import List, Optional
import argparse


class RipgrepWrapper:
    """Ripgrep 包裝器"""

    def __init__(self, skill_dir: Optional[str] = None):
        if skill_dir is None:
            self.skill_dir = Path(__file__).parent.parent
        else:
            self.skill_dir = Path(skill_dir)

    def search(
        self,
        query: str,
        category: Optional[str] = None,
        context_lines: int = 3,
        case_sensitive: bool = False,
        max_results: int = 50,
    ) -> List[dict]:
        """
        搜尋關鍵字

        Args:
            query: 搜尋關鍵字
            category: 限制搜尋範圍（如 "chinese/classical"）
            context_lines: 上下文行數
            case_sensitive: 是否區分大小寫
            max_results: 最多返回結果數

        Returns:
            [
                {
                    "file": "tangshi.md",
                    "line": 45,
                    "content": "李白（701-762）",
                    "context_before": [...],
                    "context_after": [...]
                }
            ]
        """
        # 決定搜尋目錄
        if category:
            search_dir = self.skill_dir / "layer2_topics" / category
        else:
            search_dir = self.skill_dir / "layer2_topics"

        if not search_dir.exists():
            print(f"警告：目錄不存在 {search_dir}", file=sys.stderr)
            return []

        # 建構 ripgrep 命令
        rg_args = [
            "rg",
            "-n",  # 顯示行號
            "-C",
            str(context_lines),  # 上下文
            "--color=never",  # 不使用顏色（方便解析）
            "--max-count",
            str(max_results),
        ]

        if not case_sensitive:
            rg_args.append("-i")

        rg_args.extend([query, str(search_dir)])

        try:
            result = subprocess.run(rg_args, capture_output=True, text=True, timeout=10)

            if result.returncode == 0:
                return self._parse_output(result.stdout)
            elif result.returncode == 1:
                # 沒有找到匹配
                return []
            else:
                print(f"ripgrep 錯誤：{result.stderr}", file=sys.stderr)
                return []

        except subprocess.TimeoutExpired:
            print("搜尋超時", file=sys.stderr)
            return []
        except FileNotFoundError:
            print("錯誤：未安裝 ripgrep。請執行：sudo apt install ripgrep", file=sys.stderr)
            return []

    def _parse_output(self, output: str) -> List[dict]:
        """解析 ripgrep 輸出"""
        results = []
        lines = output.strip().split("\n")

        current_file = None
        current_match = None

        for line in lines:
            if not line:
                continue

            # 解析檔案路徑和行號
            if ":" in line:
                parts = line.split(":", 2)
                if len(parts) >= 3:
                    file_path = parts[0]
                    try:
                        line_num = int(parts[1])
                        content = parts[2]

                        # 新的匹配項
                        if current_file != file_path or (current_match and current_match["line"] != line_num):
                            if current_match:
                                results.append(current_match)

                            current_file = file_path
                            current_match = {
                                "file": Path(file_path).name,
                                "full_path": file_path,
                                "line": line_num,
                                "content": content,
                                "context_before": [],
                                "context_after": [],
                            }
                        else:
                            # 上下文行
                            if current_match:
                                current_match["context_after"].append(content)

                    except ValueError:
                        # 無法解析行號，可能是上下文行
                        if current_match:
                            current_match["context_after"].append(parts[1] if len(parts) > 1 else line)

        # 添加最後一個匹配
        if current_match:
            results.append(current_match)

        return results

    def format_results(self, results: List[dict], show_context: bool = True) -> str:
        """格式化輸出結果"""
        if not results:
            return "❌ 沒有找到匹配結果"

        output = [f"🔍 找到 {len(results)} 筆結果\n"]

        for i, match in enumerate(results, 1):
            output.append(f"[{i}] {match['file']}:{match['line']}")
            output.append(f"    {match['content']}")

            if show_context and (match["context_before"] or match["context_after"]):
                output.append("    上下文：")
                for ctx in match["context_before"]:
                    output.append(f"      {ctx}")
                for ctx in match["context_after"][:3]:  # 只顯示前 3 行
                    output.append(f"      {ctx}")

            output.append("")

        return "\n".join(output)


def main():
    """命令列介面"""
    parser = argparse.ArgumentParser(description="Ripgrep 包裝器 - 知識庫快速檢索")
    parser.add_argument("--query", "-q", type=str, required=True, help="搜尋關鍵字")
    parser.add_argument("--category", "-c", type=str, help="限制搜尋範圍（如 chinese/classical）")
    parser.add_argument("--context", type=int, default=3, help="上下文行數（預設 3）")
    parser.add_argument("--case-sensitive", action="store_true", help="區分大小寫")
    parser.add_argument("--max-results", type=int, default=50, help="最多返回結果數")
    parser.add_argument("--no-context", action="store_true", help="不顯示上下文")

    args = parser.parse_args()

    wrapper = RipgrepWrapper()

    print(f"🔍 搜尋：{args.query}")
    if args.category:
        print(f"📁 範圍：{args.category}")
    print()

    results = wrapper.search(
        query=args.query,
        category=args.category,
        context_lines=args.context,
        case_sensitive=args.case_sensitive,
        max_results=args.max_results,
    )

    print(wrapper.format_results(results, show_context=not args.no_context))


if __name__ == "__main__":
    main()
